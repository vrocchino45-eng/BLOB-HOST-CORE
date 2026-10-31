#!/usr/bin/env python3
"""BOT1-D9Y scripted objective-runner for the real BLOB browser.

This is an ASSISTED test (not evidence of human discoverability). Live inputs
are visible HUD, elapsed time and the prerecorded D9X input itinerary only.
Independent REC1 referee runs after capture; never used to select an action.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d3_browser import hud_text,act,utc,save
from bot1d6_browser import checkpoint
from bot1d6_policy import stage,objective
from bot1d9s_browser import perform
from bot1d9t_protocol import crossing_course
from bot1d9w_policy import approach_pulse_hold
from bot1d9y_policy import PROFILES,reference,acquisition,route,correction,fold_cue,can_finish,policy_contract
try:from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Playwright required: py -m pip install playwright')


def guided_navigation(page,get_hud,profile,deadline,log):
    """Run a *bounded* plan; stop any movement when the visible Fold answer appears."""
    def public(label):
        h=get_hud(page);value=fold_cue(h)
        log.append({'at':utc(),'kind':'observe','label':label,'publicPhase':value,
                    'objective':objective(h)[:230]})
        return value
    if can_finish(get_hud(page)):
        public('answer_at_invitation');return True
    for item in route(profile):
        if time.monotonic()+item['seconds']+5>=deadline:break
        if can_finish(get_hud(page)):
            public('answer_before_segment');return True
        kind,key,seconds=item['kind'],item['key'],item['seconds']
        action={'atStart':utc(),'kind':kind,'key':key,'plannedSeconds':seconds,'label':item['label']}
        log.append(action)
        # Short move chunks let public cues stop travel before it overshoots.
        if kind=='move':
            elapsed=0.0;page.keyboard.down(key)
            try:
                while elapsed<seconds-1e-5:
                    dt=min(.20,seconds-elapsed);page.wait_for_timeout(round(dt*1000));elapsed+=dt
                    if can_finish(get_hud(page)):break
            finally:page.keyboard.up(key)
            action['actualSeconds']=round(elapsed,3)
        else:
            act(page,kind,key,seconds);action['actualSeconds']=seconds
        action['atEnd']=utc();action['publicPhaseAfter']=public(item['label']+'_after')
        if can_finish(get_hud(page)):
            return True
    # If not visible, modest corrections + settle; never an unlimited walking loop.
    for i,(key,seconds) in enumerate(correction(profile)):
        if time.monotonic()+seconds+3>=deadline:break
        if can_finish(get_hud(page)):return True
        entry={'atStart':utc(),'kind':'move','key':key,'plannedSeconds':seconds,'label':f'bounded_correction_{i+1}'}
        log.append(entry)
        page.keyboard.down(key)
        try:page.wait_for_timeout(round(seconds*1000))
        finally:page.keyboard.up(key)
        entry['atEnd']=utc()
        if public('correction_release') not in ('fold_search','unknown'):
            return can_finish(get_hud(page))
        page.wait_for_timeout(260)
        if can_finish(get_hud(page)):return True
    return can_finish(get_hud(page))


def guided_fold_finish(page,get_hud,deadline,log):
    """HUD-driven X → Q → observe → release. Q probe if public cue lags, as D9W.

    This cannot certify hidden stages. It preserves action timestamps so the
    independent referee can verify Q/game-stabilize pairing afterward.
    """
    pulses=[];holds=[];observations=[];last_phase=None;stall=0;seen=False
    def note(label):
        nonlocal last_phase,stall,seen
        h=get_hud(page);ph=fold_cue(h)
        obs={'at':utc(),'label':label,'phase':ph,'objective':objective(h)[:200]}
        observations.append(obs)
        if ph==last_phase:stall+=1
        else:stall=0
        last_phase=ph
        seen=seen or can_finish(h)
        return ph
    max_iterations=25
    for i in range(max_iterations):
        if time.monotonic()+2>=deadline:break
        ph=note('fold_state_before_action')
        if ph in ('fold_complete','beyond_fold'):
            break
        if ph=='fold_answer_visible' and len(pulses)<2:
            pulse={'at':utc(),'key':'x','reason':'visible_fold_answer','number':len(pulses)+1}
            pulses.append(pulse);log.append(pulse)
            page.keyboard.press('x');page.wait_for_timeout(250)
            # D9W observed an owner stage transition even if public text lagged.
            # A single bounded Stabilize hold is a documented experimental action.
            if not holds and note('after_pulse') in ('fold_answer_visible','fold_hold'):
                action={'atStart':utc(),'key':'q','plannedSeconds':1.50,
                        'reason':'bounded_stabilize_after_visible_pulse','ownerUnknownOnline':True}
                holds.append(action);log.append(action)
                page.keyboard.down('q')
                try:
                    elapsed=0.
                    while elapsed<1.5-1e-5:
                        dt=min(.25,1.5-elapsed)
                        page.wait_for_timeout(round(dt*1000));elapsed+=dt
                        if note('while_holding_stabilize') in ('fold_watch','fold_release','fold_complete','beyond_fold'):
                            break
                finally:page.keyboard.up('q')
                action['atEnd']=utc();action['actualSeconds']=round(elapsed,3)
            continue
        if ph=='fold_hold':
            action={'atStart':utc(),'key':'q','plannedSeconds':1.6,
                    'reason':'public_hold_prompt','ownerUnknownOnline':True}
            holds.append(action);log.append(action)
            page.keyboard.down('q')
            try:
                elapsed=0.
                while elapsed<1.6-1e-5:
                    dt=min(.25,1.6-elapsed);page.wait_for_timeout(round(dt*1000));elapsed+=dt
                    if note('holding_public_stabilize') in ('fold_watch','fold_release','fold_complete','beyond_fold'):break
            finally:page.keyboard.up('q')
            action['atEnd']=utc();action['actualSeconds']=round(elapsed,3)
            continue
        if ph=='fold_watch':page.wait_for_timeout(950);continue
        if ph=='fold_release':page.wait_for_timeout(1200);continue
        if ph=='fold_answer_visible' and len(pulses)>=2:
            # No more blind pulses. Leave a diagnostic, not false progress.
            page.wait_for_timeout(350)
            if stall>=3:break
            continue
        page.wait_for_timeout(450)
        if stall>=4:break
    final=note('fold_final_public_state')
    return {'publicVerdict':'PUBLIC_ANSWER_SEEN' if seen else 'NO_PUBLIC_ANSWER',
        'endVisiblePhase':final,'pulseActions':pulses,'holdActions':holds,
        'segments':observations,'noOnlineOwnerCertification':True,'noHiddenOwnerAccess':True}


def one(browser,args,index,profile):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D9Y_{stamp}_run{index:02d}_{profile}'
    folder.mkdir(parents=True,exist_ok=False)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[]
    run={'revision':'BOT1-D9Y','profile':profile,'startedAt':utc(),'status':'ERROR',
       'source':'D9X successful seed11 + alternate seed13 action telemetry',
       'testKind':'ASSISTED_SCRIPTED_NOT_HUMAN_DISCOVERABILITY','gameplayChanges':False,
       'errors':errors,'actions':[],'percepts':[],'navigation':[],'checkpoints':[],
       'courseStarted':False,'arrival':None,'policyContract':policy_contract(),
       'ownerProof':'OFFLINE_REC1_ONLY'}
    page.on('pageerror',lambda e:errors.append('pageerror: '+str(e)[:350]))
    started=time.monotonic();last_cp=0.;last_frame=0.;last_hud=None
    def tick():
        nonlocal last_cp,last_frame,last_hud
        elapsed=time.monotonic()-started;h=hud_text(page)
        if h!=last_hud:
            run['percepts'].append({'at':utc(),'stage':stage(h),'objective':objective(h)[:260]});last_hud=h
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
        recstatus=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in recstatus:raise RuntimeError('REC1 recorder did not start: '+recstatus[:120])
        deadline=time.monotonic()+args.seconds
        invited=False
        for cycle in range(args.max_acquisition_cycles):
            if invited or time.monotonic()>=deadline-38:break
            for item in acquisition(profile):
                if time.monotonic()+item['seconds']+38>deadline:break
                if stage(hud_text(page)).startswith('fold_'):
                    invited=True;break
                action={'atStart':utc(),'phase':'acquire','kind':item['kind'],'key':item['key'],
                        'seconds':item['seconds'],'cycle':cycle+1}
                run['actions'].append(action)
                act(page,item['kind'],item['key'],item['seconds'])
                action['atEnd']=utc();action['publicStageAfter']=stage(hud_text(page))
                tick()
            if stage(hud_text(page)).startswith('fold_'):invited=True
        run['visibleInvitation']=({'time':utc(),'objective':objective(hud_text(page))[:250]}
            if invited else None)
        run['courseStarted']=invited
        if invited:
            page.screenshot(path=str(folder/'fold_invitation.png'))
            if profile=='golden':
                # Exact original D9X course: reference control, including rests.
                for i,trial in enumerate(crossing_course()):
                    if time.monotonic()+trial.duration+10>=deadline:break
                    page.screenshot();page.wait_for_timeout(460);page.screenshot()
                    if i==9:
                        run['arrival']=approach_pulse_hold(page,hud_text)
                        run['arrival']['noOnlineOwnerCertification']=True
                        run['navigation'].append({'label':'golden_arrival','at':utc(),
                                                  'result':run['arrival']['publicVerdict']})
                    else:
                        perform(page,trial)
                        run['navigation'].append({'label':trial.label,'kind':trial.kind,
                                                   'key':trial.key,'seconds':trial.duration,'at':utc()})
                    tick()
            else:
                answer=guided_navigation(page,hud_text,profile,deadline,run['navigation'])
                run['publicAnswerFound']=bool(answer)
                page.screenshot(path=str(folder/'post_navigation.png'))
                if answer:
                    run['arrival']=guided_fold_finish(page,hud_text,deadline,run['actions'])
            run['postCourseObjective']=objective(hud_text(page))[:250]
            page.wait_for_timeout(1000);tick()
        else:
            run['stopReason']='No visible Watcher Fold invitation after bounded acquisition'
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(420)
        with page.expect_download(timeout=18000) as download:page.keyboard.press('Alt+Shift+E')
        download.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf8'))
        run['rec1']={'events':len(rec.get('events',[])),
          'droppedDetails':(rec.get('summary') or {}).get('captureRetention',{}).get('droppedDetails'),
          'durationSeconds':rec.get('captureDurationSeconds')}
        run['status']='CAPTURED' if rec.get('events') else 'EMPTY'
        page.screenshot(path=str(folder/'end.png'))
    except Exception as exc:
        errors.append(f'{type(exc).__name__}: {exc}')
        try:page.screenshot(path=str(folder/'error.png'))
        except Exception:pass
        try:checkpoint(page,folder,time.monotonic()-started,run,timeout=3500)
        except Exception:pass
    finally:
        run['finishedAt']=utc();run['wallSeconds']=round(time.monotonic()-started,2)
        save(folder/'RUN.json',run)
        try:ctx.close()
        except Exception:pass
    return {'folder':folder.name,'profile':profile,'status':run['status'],
        'invited':run['courseStarted'],'events':run.get('rec1',{}).get('events',0),
        'errors':errors}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--profiles',default='golden,guided,recovery')
    p.add_argument('--seconds',type=int,default=145)
    p.add_argument('--max-acquisition-cycles',type=int,default=2)
    p.add_argument('--checkpoint-every',type=int,default=45)
    p.add_argument('--screenshot-every',type=int,default=24)
    p.add_argument('--output',default='BOT1D9Y_RESULTS')
    args=p.parse_args()
    profiles=[x.strip() for x in args.profiles.split(',')]
    if not profiles or len(set(profiles))!=len(profiles) or any(x not in PROFILES for x in profiles):
        p.error('--profiles must be unique names from golden,guided,recovery')
    if not 90<=args.seconds<=240:p.error('--seconds must be 90..240 per profile')
    if not 1<=args.max_acquisition_cycles<=3:p.error('max-acquisition-cycles must be 1..3')
    if not 20<=args.checkpoint_every<=90:p.error('checkpoint-every must be 20..90')
    reference();crossing_course()
    root=pathlib.Path(args.output).resolve();root.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel:kw['channel']=args.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:
            rows=[]
            for i,profile in enumerate(profiles,1):
                result=one(browser,args,i,profile);rows.append(result)
                print(f"{profile}: {result['status']} / invitation={result['invited']} / REC1={result['events']}",flush=True)
        finally:browser.close()
    save(root/'BOT1D9Y_RUN_INDEX.json',{'revision':'BOT1-D9Y','createdAt':utc(),
        'profilesRequested':profiles,'noGameplayChanges':True,'worldSeedSet':False,
        'assistedScripted':True,'noOwnerStateUsedOnline':True,'runs':rows})
    print('Wrote',root/'BOT1D9Y_RUN_INDEX.json')
    return 0 if all(r['status']=='CAPTURED' for r in rows) else 2

if __name__=='__main__':raise SystemExit(main())
