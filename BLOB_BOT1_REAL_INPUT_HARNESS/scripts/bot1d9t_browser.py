#!/usr/bin/env python3
"""BOT1-D9T: replicate the D9S fixed leftward crossing in fresh browser contexts.

No player coordinates, owner state, Fold focus distance, or REC1 is read while
choosing actions. One identical course per fresh run; offline REC1 is the referee.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d3_browser import hud_text,action_for_step,act,utc,save
from bot1d6_browser import checkpoint
from bot1d6_policy import objective,stage
from bot1d9s_browser import perform
from bot1d9t_protocol import crossing_course
try:
    from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Install Playwright: py -m pip install playwright')


def one(browser,args,rep):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D9T_{stamp}_repeat{rep:02d}_s{args.seed}'
    folder.mkdir(parents=True,exist_ok=False)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[]
    run={'revision':'BOT1-D9T','repeat':rep,'seed':args.seed,
        'startedAt':utc(),'status':'ERROR','gameplayChanges':False,
        'recorderOnlyObserverReused':True,'errors':errors,
        'actions':[],'percepts':[],'probes':[],'checkpoints':[],
        'fixedCourse':'D9S course indexes 0..9; stop after leftward movement and settle',
        'onlineInputs':['public HUD to acquire invitation','elapsed time','fixed D9S course'],
        'onlineForbidden':['REC1','owner position','Fold focus distance','camera matrices','read-only telemetry'],
        'proofLimit':'Fixed-path replication only, not autonomous spatial understanding'}
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
        run['courseStarted']=invite
        if not invite:
            run['courseStopReason']='No visible Fold invitation before deadline'
        else:
            run['courseStartAt']=utc();page.screenshot(path=str(folder/'course_start.png'))
            for i,trial in enumerate(crossing_course()):
                if time.monotonic()+trial.duration+5.0>deadline:
                    run['courseStopReason']='DEADLINE';break
                # Reproduce D9S visual-baseline pauses and capture timing.
                idle_a=page.screenshot();page.wait_for_timeout(460)
                idle_b=page.screenshot()
                started_at=utc();perform(page,trial);ended_at=utc()
                after=page.screenshot()
                entry={'index':i,'atStart':started_at,'atEnd':ended_at,
                       'heading':trial.heading,'kind':trial.kind,'key':trial.key,
                       'durationSeconds':trial.duration,'label':trial.label,
                       'hudStageAfter':stage(hud_text(page))}
                run['probes'].append(entry)
                if i in (0,1,3,5,7,8,9):
                    (folder/f'course_{i:02d}_{trial.label}.png').write_bytes(after)
                tick()
            # Allow owner Fold approach to settle; do NOT steer based on any owner data.
            if len(run['probes'])==len(crossing_course()):
                page.wait_for_timeout(2600)
                run['postCoursePublicStage']=stage(hud_text(page))
                page.screenshot(path=str(folder/'post_left_settle.png'))
        # Export complete REC1. Checkpoints remain available if export fails.
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(420)
        with page.expect_download(timeout=18000) as download:page.keyboard.press('Alt+Shift+E')
        download.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf-8'))
        run['rec1']={'events':len(rec.get('events',[])),
           'duration':rec.get('captureDurationSeconds'),
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
    return {'folder':folder.name,'status':run['status'],'repeat':rep,
        'courseStarted':run.get('courseStarted'), 'courseTrials':len(run['probes']),
        'events':run.get('rec1',{}).get('events',0),
        'checkpoints':len(run['checkpoints']), 'errors':errors}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--seconds',type=int,default=145)
    p.add_argument('--seed',type=int,default=11)
    p.add_argument('--runs',type=int,default=3)
    p.add_argument('--checkpoint-every',type=int,default=45)
    p.add_argument('--screenshot-every',type=int,default=24)
    p.add_argument('--output',default='BOT1D9T_RESULTS')
    a=p.parse_args()
    if not 90<=a.seconds<=240:p.error('seconds must be 90..240 per repetition')
    if not 1<=a.runs<=3:p.error('runs must be 1..3')
    if not 20<=a.checkpoint_every<=90:p.error('checkpoint interval must be 20..90')
    root=pathlib.Path(a.output).resolve();root.mkdir(parents=True,exist_ok=True)
    crossing_course()  # Fail early if D9S protocol changed.
    with sync_playwright() as pw:
        kw={'headless':not a.headed,'args':['--disable-dev-shm-usage']}
        if a.browser_channel:kw['channel']=a.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:
            results=[]
            for rep in range(1,a.runs+1):
                result=one(browser,a,rep)
                results.append(result)
                print(f"repeat {rep}/{a.runs}: {result['status']} / {result['courseTrials']} trials / {result['events']} REC1",flush=True)
        finally:browser.close()
    save(root/'BOT1D9T_RUN_INDEX.json',{'revision':'BOT1-D9T','createdAt':utc(),
        'seed':a.seed,'replicationsRequested':a.runs,'runs':results,
        'noGameplayChanges':True,'navigationPolicyUsesHiddenOwnerState':False})
    print('Wrote',root/'BOT1D9T_RUN_INDEX.json')
    return 0 if all(r['status']=='CAPTURED' for r in results) else 2
if __name__=='__main__':raise SystemExit(main())
