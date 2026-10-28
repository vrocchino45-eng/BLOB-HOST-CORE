#!/usr/bin/env python3
"""BOT1-D4: no-cheat Listening Fold wayfinding through ordinary browser controls.

Requires previously installed BOT1-D3/ GUIDE0-W. Only reads visible HUD.
Owner state and REC1 are downloaded *after* each run, never into the policy.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d4_policy import visible_stage,fold_action,policy_inputs_are_public
from bot1d3_browser import hud_text, interpret, action_for_step, act, utc, save
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit('Playwright required: py -m pip install playwright')


def run_one(browser,args,profile,seed):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    directory=pathlib.Path(args.output).resolve()/f'BOT1D4_{stamp}_{profile}_s{seed}'
    directory.mkdir(parents=True,exist_ok=True)
    context=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=context.new_page();errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)[:500]))
    run={'revision':'BOT1-D4','profile':profile,'seed':seed,'startedAt':utc(),
         'status':'ERROR','evidenceKind':'REAL_GAME_BROWSER',
         'policyInputs':list(policy_inputs_are_public()),
         'forbiddenPolicyInputs':['Fold owner coordinates','focusDistance','inApproach',
              'focusReady','Guide state','packetDistance','REC1 events before action',
              'gameplay frameState','material class','target IDs'],
         'baseline':'BOT1-D3 + GUIDE0-W. Game unchanged',
         'actions':[],'percepts':[],'errors':errors}
    phase='nursery';navstep=0;prev_hud='';prev_stage=None;lastshot=0;started=time.monotonic()
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.wait_for_function('() => typeof window.BLOB_TELEMETRY?.getSession === "function"',timeout=25000)
        page.keyboard.press('Shift')
        page.screenshot(path=str(directory/'start.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(250)
        rec_status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in rec_status:raise RuntimeError('Recorder not active: '+rec_status[:100])
        deadline=time.monotonic()+args.seconds
        step=0;last_stage_action=None;repeat_stage=0
        while time.monotonic()<deadline and step<400:
            hud=hud_text(page);stage=visible_stage(hud)
            if hud != prev_hud:
                run['percepts'].append({'time':utc(),'stage':stage,'hud':hud});prev_hud=hud
            if stage=='fold_search' and phase=='nursery':
                phase='fold';run['actions'].append({'time':utc(),'op':'visible_invitation','step':step})
                page.screenshot(path=str(directory/'fold_invitation.png'))
            if stage in ('fold_pulse','hold','watch','release','complete_message') and phase!='fold':
                phase='fold';run['actions'].append({'time':utc(),'op':'visible_stage','stage':stage,'step':step})
            if stage != prev_stage:
                page.screenshot(path=str(directory/f'stage_{step:03d}_{stage}.png'))
                prev_stage=stage;repeat_stage=0;last_stage_action=None
            if phase=='nursery':
                # Preserve D3's *proven* unprivileged nursery acquisition strategy.
                op,key,duration=action_for_step('sweep',step,interpret(hud),None,seed,False)
                reason='nursery_D3_spatial_sweep'
            else:
                if stage not in ('fold_search','fold_pulse','hold','watch','release','complete_message'):
                    stage='fold_search' # preserve phase; do not return to Pulse spam
                op,key,duration,reason=fold_action(stage,profile,navstep,seed)
                if stage=='fold_search':navstep+=1
                # If stage-specific input isn't acknowledged in the visible HUD,
                # re-center/approach after a bounded number of repeats rather than
                # press X forever at an out-of-range position.
                if stage in ('fold_pulse','hold'):
                    repeat_stage+=1
                    if repeat_stage>=4:
                        op,key,duration,reason=fold_action('fold_search',profile,navstep,seed)
                        navstep+=1;repeat_stage=0
                else:repeat_stage=0
            event={'time':utc(),'step':step,'phase':phase,'stageHint':stage,
                   'op':op,'key':key,'durationSeconds':duration,'reason':reason,
                   'decisionSource':'VISIBLE_HUD_AND_FIXED_SEARCH_PLAN','hudAtAction':hud[:450]}
            act(page,op,key,duration)
            event['completedAt']=utc();run['actions'].append(event)
            elapsed=time.monotonic()-started
            if elapsed-lastshot>=args.screenshot_every:
                lastshot=elapsed;page.screenshot(path=str(directory/f'progress_{int(elapsed):03d}s.png'))
            if stage=='complete_message':
                # Owner remains referee; don't claim success, but stop after visible completion.
                break
            step+=1
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(250)
        with page.expect_download(timeout=18000) as dl:
            page.keyboard.press('Alt+Shift+E')
        dl.value.save_as(str(directory/'REC1.json'))
        rec=json.loads((directory/'REC1.json').read_text(encoding='utf8'))
        run['rec1']={'captureSeconds':rec.get('captureDurationSeconds'),
             'events':len(rec.get('events',[])),
             'dropped':rec.get('summary',{}).get('captureRetention',{}).get('droppedDetails')}
        run['status']='CAPTURED' if rec.get('events') else 'EMPTY'
        page.screenshot(path=str(directory/'end.png'))
    except Exception as exc:
        errors.append(f'{type(exc).__name__}: {exc}')
        try:page.screenshot(path=str(directory/'error.png'))
        except Exception:pass
    finally:
        run['finishedAt']=utc();run['wallSeconds']=round(time.monotonic()-started,2)
        save(directory/'RUN.json',run)
        context.close()
    return {'folder':directory.name,'profile':profile,'status':run['status'],
            'events':run.get('rec1',{}).get('events',0),'errors':errors}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--seconds',type=int,default=135)
    p.add_argument('--seed',type=int,default=11)
    p.add_argument('--profiles',default='lanes,lobes')
    p.add_argument('--output',default='BOT1D4_RESULTS')
    p.add_argument('--screenshot-every',type=int,default=18)
    args=p.parse_args()
    profiles=[x.strip() for x in args.profiles.split(',')]
    if len(profiles)>2 or not profiles or any(x not in ('lanes','lobes') for x in profiles):
        p.error('profiles must be lanes and/or lobes, at most two')
    if not 40<=args.seconds<=180:p.error('seconds must be between 40 and 180 per run')
    if not 8<=args.screenshot_every<=40:p.error('screenshot-every must be 8..40')
    root=pathlib.Path(args.output).resolve();root.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel:kw['channel']=args.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:result=[run_one(browser,args,profile,args.seed+i) for i,profile in enumerate(profiles)]
        finally:browser.close()
    save(root/'BOT1D4_RUN_INDEX.json',{'revision':'BOT1-D4','createdAt':utc(),
        'runs':result,'baseline':'G1-D3 + GUIDE0-W; no game source changes'})
    for r in result:print(f"{r['profile']}: {r['status']} / {r['events']} REC1 events",flush=True)
    print('Wrote',root/'BOT1D4_RUN_INDEX.json',flush=True)
    return 0 if all(r['status']=='CAPTURED' for r in result) else 2

if __name__=='__main__':raise SystemExit(main())
