#!/usr/bin/env python3
"""BOT1-D8: boundary-aware *experiment*, not privileged Fold auto-navigation.

Online: actual page screenshot, public HUD, ordinary keyboard actions, timing.
Offline: independent REC1 owner referee. Game/Guide/Host code unchanged.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d3_browser import hud_text,action_for_step,act,utc,save
from bot1d6_browser import checkpoint
from bot1d6_policy import objective,stage,next_action
from bot1d7_vision import describe
from bot1d8_motion import response
from bot1d8_policy import Steering
try:from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Playwright missing: py -m pip install playwright')


def run_one(browser,args):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D8_{stamp}_motion_s{args.seed}'
    folder.mkdir(parents=True,exist_ok=True)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[];steer=Steering(seed=args.seed)
    run={'revision':'BOT1-D8','startedAt':utc(),'seed':args.seed,'status':'ERROR',
         'gameplayChanges':False,'errors':errors,'checkpoints':[],'actions':[],
         'percepts':[],'movementProbes':[],
         'onlineInputs':['public HUD text','rendered screenshots','own keyboard actions','elapsed time'],
         'onlineForbidden':['world or Fold position','REC1 or owner state for decisions',
             'Game navigation matrices','packet class or target ID','Guide hidden owner status'],
         'onlineLimit':'Screen flow is NOT 3D displacement; boundary pressure is unknowable without referee.'}
    page.on('pageerror',lambda e:errors.append('pageerror: '+str(e)[:350]))
    started=time.monotonic();last_frame=last_checkpoint=0
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.wait_for_function('() => typeof window.BLOB_TELEMETRY?.getSession === "function"',timeout=25000)
        page.keyboard.press('Shift');page.screenshot(path=str(folder/'start.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(300)
        status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in status:raise RuntimeError('REC1 not active: '+status[:90])
        phase='nursery';step=0;previous_stage=previous_hud=None;stage_attempt=0
        deadline=time.monotonic()+args.seconds
        while time.monotonic()<deadline and step<450:
            h=hud_text(page);s=stage(h);obj=objective(h)
            if h!=previous_hud:
                run['percepts'].append({'time':utc(),'stage':s,'objective':obj,'hud':h[:1200]})
                previous_hud=h
            if s!=previous_stage:
                stage_attempt=0;previous_stage=s
                run['actions'].append({'step':step,'time':utc(),'op':'stage_observed','stage':s})
                page.screenshot(path=str(folder/f'stage_{step:03d}_{s}.png'))
            if s.startswith('fold_') and phase=='nursery':
                phase='fold';page.screenshot(path=str(folder/'fold_invitation.png'))
            if phase=='nursery':
                op,key,dur=action_for_step('sweep',step,('packet_instruction' if s=='packet' else 'wait_for_packet' if s=='packet_wait' else 'unknown'),None,args.seed,False)
                action=(op,key,dur,'unchanged_D3_nursery_acquisition')
            elif s=='fold_search':
                action=steer.choose()
            else:
                action=next_action(s,step,0,args.seed,stage_attempt)
            op,key,dur,reason=action
            before=None;idle_a=None;idle_b=None
            if phase=='fold' and s=='fold_search' and op in ('move','look'):
                idle_a=page.screenshot();page.wait_for_timeout(190)
                idle_b=page.screenshot();before=idle_b
            action_entry={'step':step,'time':utc(),'visibleStage':s,'op':op,'key':key,
                          'durationSeconds':dur,'reason':reason,
                          'inputSource':'ordinary_browser_keyboard','ownerFree':True}
            act(page,op,key,dur)
            if before is not None:
                page.wait_for_timeout(175)
                after=page.screenshot()
                metrics=response(before,after,idle_a,idle_b,
                                 steer.frame_history,action_kind=op)
                if op=='move':steer.frame_history.append(describe(after))
                action_entry['visualProbe']=metrics
                run['movementProbes'].append({'step':step,'at':utc(),'op':op,'key':key,
                   'durationSeconds':dur,'reason':reason,'visual':metrics})
                if len(run['movementProbes'])%4==1:
                    (folder/f'probe_{step:03d}_{op}.png').write_bytes(after)
            if phase=='fold' and s=='fold_search':steer.observe(action,action_entry.get('visualProbe'))
            run['actions'].append(action_entry)
            step+=1;stage_attempt+=1
            elapsed=time.monotonic()-started
            if elapsed-last_frame>=args.screenshot_every:
                last_frame=elapsed;page.screenshot(path=str(folder/f'progress_{int(elapsed):03d}s.png'))
            if elapsed-last_checkpoint>=args.checkpoint_every:
                last_checkpoint=elapsed;checkpoint(page,folder,elapsed,run)
            if s=='fold_complete':page.wait_for_timeout(650);break
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(350)
        with page.expect_download(timeout=18000) as dl:page.keyboard.press('Alt+Shift+E')
        dl.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf8'))
        run['rec1']={'events':len(rec.get('events',[])),
                     'captureSeconds':rec.get('captureDurationSeconds'),
                     'dropped':rec.get('summary',{}).get('captureRetention',{}).get('droppedDetails')}
        run['status']='CAPTURED' if rec.get('events') else 'EMPTY'
        page.screenshot(path=str(folder/'end.png'))
    except Exception as e:
        errors.append(f'{type(e).__name__}: {e}')
        try:page.screenshot(path=str(folder/'error.png'))
        except Exception:pass
        try:checkpoint(page,folder,time.monotonic()-started,run,timeout=3500)
        except Exception:pass
    finally:
        run['steering']=steer.summary();run['finishedAt']=utc()
        run['wallSeconds']=round(time.monotonic()-started,2)
        save(folder/'RUN.json',run)
        try:ctx.close()
        except Exception:pass
    return {'folder':folder.name,'status':run['status'],
       'rec1Events':run.get('rec1',{}).get('events',0),
       'motionProbes':len(run['movementProbes']),
       'checkpoints':len(run['checkpoints']),'errors':errors}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--seconds',type=int,default=240)
    p.add_argument('--seed',type=int,default=11)
    p.add_argument('--output',default='BOT1D8_RESULTS')
    p.add_argument('--checkpoint-every',type=int,default=45)
    p.add_argument('--screenshot-every',type=int,default=22)
    a=p.parse_args()
    if not 90<=a.seconds<=300:p.error('seconds must be 90..300')
    if not 20<=a.checkpoint_every<=90:p.error('checkpoint-every must be 20..90')
    if not 8<=a.screenshot_every<=45:p.error('screenshot-every must be 8..45')
    root=pathlib.Path(a.output).resolve();root.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not a.headed,'args':['--disable-dev-shm-usage']}
        if a.browser_channel:kw['channel']=a.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:result=run_one(browser,a)
        finally:browser.close()
    save(root/'BOT1D8_RUN_INDEX.json',{'revision':'BOT1-D8','createdAt':utc(),
         'runs':[result],'gameplayChanges':False})
    print('BOT1-D8:',result['status'],'/',result['rec1Events'],
          'REC1 events /',result['motionProbes'],'visual probes /',result['checkpoints'],'checkpoints')
    print('Wrote',root/'BOT1D8_RUN_INDEX.json')
    return 0 if result['status']=='CAPTURED' else 2
if __name__=='__main__':raise SystemExit(main())
