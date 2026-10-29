#!/usr/bin/env python3
"""BOT1-D5: scene-change movement probes + optional real human-control baseline.

Inputs during bot actions: visible HUD and screenshot pixels ONLY. All movement/Fold
owner telemetry is exported at the end and is used by the independent evaluator.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d3_browser import hud_text,interpret,action_for_step,act,utc,save
from bot1d4_policy import visible_stage,fold_action
from bot1d5_policy import next_probe,weak_visual_change,screen_difference,public_inputs
try:from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Install Playwright: py -m pip install playwright')


def run_one(browser,args,profile,seed):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D5_{stamp}_{profile}_s{seed}'
    folder.mkdir(parents=True,exist_ok=True)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)[:500]))
    run={'revision':'BOT1-D5','profile':profile,'seed':seed,'status':'ERROR',
         'startedAt':utc(),'errors':errors,'actions':[],'percepts':[],
         'evidenceKind':'REAL_GAME_BROWSER','gameplayChanges':False,
         'policyInputs':list(public_inputs()) if profile=='probe' else ['human eyes and ordinary input'],
         'forbiddenPolicyInputs':['REC1 before export','owner Fold distance','owner Fold position',
            'owner inApproach','owner movement attachment','hidden packet matter class','guide owner snapshots'],
         'screenChangeLimit':'Pixel change may be animation, Guide movement, camera motion, or actual translation.'}
    started=time.monotonic();last_frame=0
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.wait_for_function('() => typeof window.BLOB_TELEMETRY?.getSession === "function"',timeout=25000)
        page.keyboard.press('Shift');page.screenshot(path=str(folder/'start.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(250)
        text=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in text:raise RuntimeError('Recorder not active: '+text[:120])
        deadline=time.monotonic()+args.seconds
        phase='nursery';step=0;navstep=0;weak_streak=0;prior_hud=None;last_stage=None
        if profile=='human':
            print('MANUAL BASELINE: control the Chrome game window with your usual keys. Recorder is active.',flush=True)
            print('Try to earn the Watcher invitation and reach the Listening Fold; do not use debug warp.',flush=True)
            while time.monotonic()<deadline:
                h=hud_text(page);stage=visible_stage(h)
                if h!=prior_hud:run['percepts'].append({'time':utc(),'stage':stage,'hud':h});prior_hud=h
                elapsed=time.monotonic()-started
                if elapsed-last_frame>=args.screenshot_every:
                    last_frame=elapsed;page.screenshot(path=str(folder/f'progress_{int(elapsed):03d}s.png'))
                page.wait_for_timeout(650)
        else:
            while time.monotonic()<deadline and step<350:
                h=hud_text(page);stage=visible_stage(h)
                if h!=prior_hud:run['percepts'].append({'time':utc(),'stage':stage,'hud':h});prior_hud=h
                if stage=='fold_search' and phase=='nursery':
                    phase='fold';run['actions'].append({'op':'visible_invitation','time':utc(),'step':step})
                    page.screenshot(path=str(folder/'fold_invitation.png'))
                if stage in ('fold_pulse','hold','watch','release','complete_message'):phase='fold'
                if stage!=last_stage:
                    page.screenshot(path=str(folder/f'stage_{step:03d}_{stage}.png'))
                    last_stage=stage
                ambient=None;visual=None;weak=None
                if phase=='nursery':
                    op,key,duration=action_for_step('sweep',step,interpret(h),None,seed,False)
                    reason='proven_D3_packet_acquisition';weak_streak=0
                elif stage in ('fold_pulse','hold','watch','release','complete_message'):
                    op,key,duration,reason=fold_action(stage,'lanes',navstep,seed)
                    weak_streak=0
                else:
                    # 200ms stationary baseline distinguishes animated scenery from key-induced change.
                    a=page.screenshot();page.wait_for_timeout(200);b=page.screenshot()
                    ambient=screen_difference(a,b)
                    op,key,duration,reason=next_probe(navstep,weak_streak,seed)
                    navstep+=1
                event={'step':step,'phase':phase,'stageHint':stage,'time':utc(),
                       'op':op,'key':key,'durationSeconds':duration,'reason':reason,
                       'ambientScreenChange':ambient,'decisionFrom':'HUD_AND_SCREEN_ONLY',
                       'hudAtAction':h[:450]}
                before=page.screenshot() if phase=='fold' and stage not in ('fold_pulse','hold','watch','release','complete_message') else None
                act(page,op,key,duration)
                if before is not None:
                    after=page.screenshot();visual=screen_difference(before,after)
                    weak=weak_visual_change(visual,ambient or 0.) if op=='move' else None
                    weak_streak=(weak_streak+1 if weak else 0) if weak is not None else weak_streak
                    event.update({'visualScreenChange':visual,'weakVisualChange':weak,
                                  'consecutiveWeakMoves':weak_streak})
                event['completedAt']=utc();run['actions'].append(event)
                elapsed=time.monotonic()-started
                if elapsed-last_frame>=args.screenshot_every:
                    last_frame=elapsed;page.screenshot(path=str(folder/f'progress_{int(elapsed):03d}s.png'))
                if stage=='complete_message':break
                step+=1
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(280)
        with page.expect_download(timeout=18000) as dl:page.keyboard.press('Alt+Shift+E')
        dl.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf8'))
        run['rec1']={'captureSeconds':rec.get('captureDurationSeconds'),
                     'events':len(rec.get('events',[])),
                     'dropped':rec.get('summary',{}).get('captureRetention',{}).get('droppedDetails')}
        run['status']='CAPTURED' if rec.get('events') else 'EMPTY'
        page.screenshot(path=str(folder/'end.png'))
    except Exception as exc:
        errors.append(f'{type(exc).__name__}: {exc}')
        try:page.screenshot(path=str(folder/'error.png'))
        except Exception:pass
    finally:
        run['finishedAt']=utc();run['wallSeconds']=round(time.monotonic()-started,2)
        save(folder/'RUN.json',run);ctx.close()
    return {'folder':folder.name,'profile':profile,'status':run['status'],
            'events':run.get('rec1',{}).get('events',0),'errors':errors}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--seconds',type=int,default=145)
    p.add_argument('--seed',type=int,default=11)
    p.add_argument('--profiles',default='probe')
    p.add_argument('--output',default='BOT1D5_RESULTS')
    p.add_argument('--screenshot-every',type=int,default=15)
    args=p.parse_args()
    profiles=[s.strip() for s in args.profiles.split(',')]
    if not profiles or len(profiles)>2 or len(profiles)!=len(set(profiles)) or any(x not in ('probe','human') for x in profiles):
        p.error('--profiles must be probe, human, or probe,human')
    if 'human' in profiles and not args.headed:p.error('human baseline requires --headed')
    if not 50<=args.seconds<=240:p.error('seconds must be 50..240')
    if not 8<=args.screenshot_every<=40:p.error('screenshot-every must be 8..40')
    root=pathlib.Path(args.output).resolve();root.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel:kw['channel']=args.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:reports=[run_one(browser,args,pr,args.seed+i) for i,pr in enumerate(profiles)]
        finally:browser.close()
    save(root/'BOT1D5_RUN_INDEX.json',{'revision':'BOT1-D5','createdAt':utc(),
         'runs':reports,'baseline':'BOT1-D4 + GUIDE0-W; game sources unchanged'})
    for r in reports:print(f"{r['profile']}: {r['status']} / {r['events']} REC1 events",flush=True)
    print('Wrote',root/'BOT1D5_RUN_INDEX.json',flush=True)
    return 0 if all(r['status']=='CAPTURED' for r in reports) else 2
if __name__=='__main__':raise SystemExit(main())
