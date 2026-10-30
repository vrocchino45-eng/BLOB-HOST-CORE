#!/usr/bin/env python3
"""G1-D9S real browser calibration, no Fold search after invitation.

Requires recorder-only D9S observer installed in gameplay repository. The bot
never reads owner/REC1 facts for decision making; fixed trials use rendered
screenshots plus public HUD only. Recorder is an OFFLINE referee.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d3_browser import hud_text,action_for_step,act,utc,save
from bot1d6_browser import checkpoint
from bot1d6_policy import objective,stage
from bot1d9_calibration import classify
from bot1d9s_protocol import course
try:from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Install Playwright: py -m pip install playwright')

def perform(page,trial):
    if trial.kind=='idle':page.wait_for_timeout(round(1000*trial.duration))
    else:act(page,trial.kind,trial.key,trial.duration)

def one(browser,args):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D9S_{stamp}_neutral_s{args.seed}'
    folder.mkdir(parents=True,exist_ok=True)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[]
    run={'revision':'BOT1-D9S','mode':'NEUTRAL_OBSERVER_CALIBRATION','seed':args.seed,
      'startedAt':utc(),'status':'ERROR','gameplayChanges':False,
      'recorderOnlyPatchRequired':True,'errors':errors,'actions':[],
      'percepts':[],'probes':[],'checkpoints':[],
      'onlineInputs':['public HUD','rendered screenshots','fixed elapsed-time course'],
      'onlineForbidden':['REC1','movement owner positions','Fold coordinates or focus distance',
         'camera transforms','read-only referee samples used for decisions'],
      'successScope':'Independent paired neutral/movement observation coverage; no Fold route claim'}
    page.on('pageerror',lambda e:errors.append('pageerror: '+str(e)[:350]))
    started=time.monotonic();last_cp=0.;last_frame=0.;previous_hud=None
    def tick():
        nonlocal last_cp,last_frame
        elapsed=time.monotonic()-started
        if elapsed-last_cp>=args.checkpoint_every:
            last_cp=elapsed;checkpoint(page,folder,elapsed,run)
        if elapsed-last_frame>=args.screenshot_every:
            last_frame=elapsed;page.screenshot(path=str(folder/f'progress_{int(elapsed):03d}s.png'))
        return elapsed
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.keyboard.press('Shift');page.screenshot(path=str(folder/'start.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(300)
        status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in status:raise RuntimeError('Recorder did not start: '+status[:90])
        deadline=time.monotonic()+args.seconds
        invite=False;step=0
        while time.monotonic()<deadline and step<250:
            h=hud_text(page);s=stage(h)
            if h!=previous_hud:
                run['percepts'].append({'time':utc(),'visibleStage':s,'objective':objective(h)[:280]})
                previous_hud=h
            if s.startswith('fold_'):
                invite=True;run['visibleInvitation']={'time':utc(),'objective':objective(h)[:250]}
                page.screenshot(path=str(folder/'fold_invitation.png'));break
            op,key,dur=action_for_step('sweep',step,
                    ('packet_instruction' if s=='packet' else 'wait_for_packet' if s=='packet_wait' else 'unknown'),
                    None,args.seed,False)
            run['actions'].append({'atStart':utc(),'phase':'acquire','kind':op,'key':key,'duration':dur})
            act(page,op,key,dur);step+=1;tick()
        run['calibrationStarted']=invite
        if invite:
            run['calibrationStartAt']=utc();page.screenshot(path=str(folder/'calibration_start.png'))
            for i,trial in enumerate(course()):
                if time.monotonic()+trial.duration+3.0>deadline:
                    run['calibrationStopReason']='DEADLINE';break
                # Same camera pose during pre-action idle reference; no steering decisions.
                idle_a=page.screenshot();page.wait_for_timeout(460)
                idle_b=page.screenshot();before=idle_b
                start_at=utc();perform(page,trial);end_at=utc()
                after=page.screenshot()
                # VISUAL reporting only: no movement-owner read here.
                if trial.kind=='idle':
                    visual={'kind':'idle','screenBaselineOnly':True,'actualTravelKnownOnline':False}
                else:
                    visual=classify(None,idle_a,idle_b,before,after,trial.kind)
                entry={'index':i,'atStart':start_at,'atEnd':end_at,'heading':trial.heading,
                    'kind':trial.kind,'key':trial.key,'durationSeconds':trial.duration,
                    'label':trial.label,'signal':visual,'hudStageAfter':stage(hud_text(page))}
                run['probes'].append(entry)
                if i in (0,1,2,3,4,5,7,9,11,12):
                    (folder/f'calibration_{i:02d}_{trial.label}.png').write_bytes(after)
                tick()
                if entry['hudStageAfter'] not in ('fold_search','unknown'):
                    run['stageShiftDuringCalibration']=entry['hudStageAfter'];break
        else:run['calibrationStopReason']='No visible Fold invitation before deadline'
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(400)
        with page.expect_download(timeout=18000) as download:page.keyboard.press('Alt+Shift+E')
        download.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf8'))
        run['rec1']={'events':len(rec.get('events',[])),'duration':rec.get('captureDurationSeconds'),
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
        run['finishedAt']=utc();run['wallSeconds']=round(time.monotonic()-started,2)
        save(folder/'RUN.json',run)
        try:ctx.close()
        except Exception:pass
    return {'folder':folder.name,'status':run['status'],
        'calibrationStarted':run.get('calibrationStarted'),
        'trials':len(run['probes']),'checkpoints':len(run['checkpoints']),
        'events':run.get('rec1',{}).get('events',0),'errors':errors}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--seconds',type=int,default=190)
    p.add_argument('--seed',type=int,default=11)
    p.add_argument('--checkpoint-every',type=int,default=45)
    p.add_argument('--screenshot-every',type=int,default=24)
    p.add_argument('--output',default='BOT1D9S_RESULTS')
    a=p.parse_args()
    if not 75<=a.seconds<=300:p.error('seconds must be 75..300')
    if not 20<=a.checkpoint_every<=90:p.error('checkpoint interval must be 20..90')
    root=pathlib.Path(a.output).resolve();root.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not a.headed,'args':['--disable-dev-shm-usage']}
        if a.browser_channel:kw['channel']=a.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:result=one(browser,a)
        finally:browser.close()
    save(root/'BOT1D9S_RUN_INDEX.json',{'revision':'BOT1-D9S','createdAt':utc(),
       'runs':[result],'gameplayChanges':False,'recorderOnlyPatchRequired':True})
    print('BOT1-D9S:',result['status'],'/',result['trials'],'calibration trials /',
         result['events'],'REC1 events /',result['checkpoints'],'checkpoints')
    print('Wrote',root/'BOT1D9S_RUN_INDEX.json')
    return 0 if result['status']=='CAPTURED' else 2
if __name__=='__main__':raise SystemExit(main())
