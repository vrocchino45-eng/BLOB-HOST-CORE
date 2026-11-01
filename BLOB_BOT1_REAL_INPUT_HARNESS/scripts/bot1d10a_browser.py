#!/usr/bin/env python3
"""BOT1-D10A cue-aware approach closure and recovery sweep A/B in the real browser.

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
from bot1d9y_policy import PROFILES,reference,acquisition,route,fold_cue,can_finish,policy_contract
from bot1d9z_policy import PublicCueLatch,HUD_SETTLE_SECONDS,HUD_POLL_SECONDS,HOLD_SECONDS,WATCH_SECONDS,fixed_peel_sweep,LIVE_FORBIDDEN
from bot1d10a_policy import closure_plan,CLOSURE_SETTLE_SECONDS,PROFILES_D10A,acquisition_profile
try:from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Playwright required: py -m pip install playwright')


def observed_navigation(page,get_hud,profile,deadline,log,evidence_dir=None):
    """Public-HUD-gated navigation. Owner REC1 remains an OFFLINE referee.

    The guided closure deliberately begins with small *left* extensions based
    on D9Z's historical trend, but never assumes movement actually reduced
    distance. Each continuation is bounded and checked against the current HUD.
    """
    latch=PublicCueLatch()
    counts={'route':0,'peel':0,'reapproach':0,'closure':0}
    history=[]
    states=['INVITED']

    def sample(label):
        h=get_hud(page);at=utc();phase=latch.observe(h,at,label)
        log.append({'at':at,'kind':'observe','label':label,'publicPhase':phase,
                    'objective':objective(h)[:230]})
        return phase

    def action(item,category):
        """One bounded ordinary input; check HUD while key is held."""
        if latch.ready:return True
        if time.monotonic()+item['seconds']+11>=deadline:return False
        sample('before_'+item['label'])
        if latch.ready:return True
        record={'atStart':utc(),'kind':item['kind'],'key':item['key'],
                'plannedSeconds':item['seconds'],'label':item['label'],
                'phase':category,'ownerStateUnknownOnline':True,
                'experimentalPeel':category=='peel',
                'unknownSurfaceNormalOnline':category=='peel'}
        log.append(record);counts[category]+=1
        history.append({'category':category,'key':item['key'],'duration':item['seconds'],
                        'label':item['label']})
        elapsed=0.
        if item['kind']=='move':
            page.keyboard.down(item['key'])
            try:
                while elapsed<item['seconds']-1e-6:
                    dt=min(.12,item['seconds']-elapsed)
                    page.wait_for_timeout(round(dt*1000));elapsed+=dt
                    sample('during_'+item['label'])
                    if latch.ready:break
            finally:page.keyboard.up(item['key'])
        else:
            act(page,item['kind'],item['key'],item['seconds'])
            elapsed=item['seconds']
        record['actualSeconds']=round(elapsed,3);record['atEnd']=utc()
        sample('after_'+item['label'])
        return latch.ready

    sample('at_invitation')
    if profile=='recovery' and not latch.ready:
        states.append('PEEL_SWEEP_EXPERIMENT')
        if evidence_dir:page.screenshot(path=str(evidence_dir/'before_peel_sweep.png'))
        for item in fixed_peel_sweep():
            if action(item,'peel'):break
        if evidence_dir:page.screenshot(path=str(evidence_dir/'after_peel_sweep.png'))
    if not latch.ready:
        states.append('SEARCH_REFERENCE')
        scripted_profile='recovery' if profile=='recovery_control' else profile
        for item in route(scripted_profile):
            if action(item,'route'):break
    if profile in ('recovery','recovery_control') and not latch.ready:
        states.append('REFERENCE_REAPPROACH')
        action({'kind':'move','key':'a','seconds':2.2,'label':'shared_reference_left_reapproach'},'reapproach')
    # D9Z Recovery's legitimate public cue appeared ~3.3s after releasing
    # its last navigation key. Preserve that handoff window in BOTH A/B arms.
    if profile in ('recovery','recovery_control') and not latch.ready:
        states.append('POST_REAPPROACH_CUE_WAIT')
        started_wait=time.monotonic()
        while not latch.ready and time.monotonic()-started_wait<HUD_SETTLE_SECONDS and time.monotonic()+7<deadline:
            page.wait_for_timeout(round(1000*HUD_POLL_SECONDS))
            sample('post_reapproach_cue_wait')
    if not latch.ready:
        states.append('APPROACH_CLOSURE')
        for item in closure_plan():
            if action(item,'closure'):break
            # Observe the HUD after motion settles: entry can be delayed.
            page.wait_for_timeout(round(CLOSURE_SETTLE_SECONDS*1000))
            sample('post_closure_settle_'+item['label'])
            if latch.ready:break

    began=time.monotonic()
    while not latch.ready and time.monotonic()-began<HUD_SETTLE_SECONDS and time.monotonic()+7<deadline:
        page.wait_for_timeout(round(1000*HUD_POLL_SECONDS))
        sample('post_navigation_hud_settle')
    if latch.ready:
        states.append('FOLD_CUE')
        termination='VISIBLE_FOLD_CUE'
    elif time.monotonic()+7>=deadline:
        termination='TIME_BUDGET_EXHAUSTED'
    else:
        termination='PUBLIC_CUE_ABSENT_SEARCH_EXHAUSTED'
    return {'publicCueSeen':latch.ready,'firstCueAt':latch.first_at,
        'endCuePhase':latch.phase,'settleSeconds':round(time.monotonic()-began,3),
        'termination':termination,'states':states,'stepCounts':counts,
        'keyHistory':history,'noHiddenOwnerAccess':True,
        'diagnosticLimits':['No public distance sensor. Search direction is a bounded hypothesis.',
          'No owner attachments, positions, or REC1 used for online decisions.']}


def fold_finish(page,get_hud,deadline,log):
    """One visible-cue gated X -> Q hold -> release/witness sequence.

    This performs *no* speculative pulse when the Fold prompt remains hidden.
    Owner Stage 5 must be independently certified from exported REC1.
    """
    pulses=[];holds=[];observations=[];seen=False
    def note(label):
        nonlocal seen
        h=get_hud(page);ph=fold_cue(h)
        seen=seen or can_finish(h)
        observations.append({'at':utc(),'label':label,'phase':ph,'objective':objective(h)[:230]})
        return ph
    phase=note('pre_pulse_public')
    # A cue may disappear between route release and handoff. Recheck the
    # actual public HUD for up to 0.9s; never substitute an owner snapshot.
    if phase not in ('fold_answer_visible','fold_hold','fold_watch','fold_release','fold_complete','beyond_fold'):
        for _ in range(6):
            if time.monotonic()+3>=deadline:break
            page.wait_for_timeout(150)
            phase=note('handoff_reobserve_public_cue')
            if phase in ('fold_answer_visible','fold_hold','fold_watch','fold_release','fold_complete','beyond_fold'):break
    if phase in ('fold_answer_visible','fold_hold') and time.monotonic()+8<deadline:
        if phase=='fold_answer_visible':
            pulse={'at':utc(),'key':'x','reason':'current_visible_fold_answer'}
            pulses.append(pulse);log.append(pulse)
            page.keyboard.press('x');page.wait_for_timeout(120)
            phase=note('immediately_after_pulse')
        if phase in ('fold_answer_visible','fold_hold'):
            action={'atStart':utc(),'key':'q','plannedSeconds':HOLD_SECONDS,
                'reason':'bounded_stabilize_after_visible_fold_prompt',
                'ownerStageUnknownOnline':True}
            holds.append(action);log.append(action)
            page.keyboard.down('q')
            try:
                elapsed=0.
                while elapsed<HOLD_SECONDS-1e-6:
                    dt=min(.25,HOLD_SECONDS-elapsed)
                    page.wait_for_timeout(round(dt*1000));elapsed+=dt
                    note('while_stabilize_held')
            finally:page.keyboard.up('q')
            action['actualSeconds']=round(elapsed,3);action['atEnd']=utc()
            note('after_stabilize_released')
    else:
        observations.append({'at':utc(),'label':'no_valid_pulse_cue_no_input',
            'phase':phase,'objective':'Fold pulse withheld; public cue missing'})
    began=time.monotonic()
    while time.monotonic()-began<WATCH_SECONDS and time.monotonic()+1<deadline:
        page.wait_for_timeout(200)
        note('post_release_witness')
    return {'publicVerdict':'PUBLIC_ANSWER_SEEN' if seen else 'NO_PUBLIC_ANSWER',
        'endVisiblePhase':note('final_public'),'pulseActions':pulses,'holdActions':holds,
        'segments':observations,'noOnlineOwnerCertification':True,'noHiddenOwnerAccess':True}


def one(browser,args,index,profile):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D10A_{stamp}_run{index:02d}_{profile}'
    folder.mkdir(parents=True,exist_ok=False)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[]
    run={'revision':'BOT1-D10A','profile':profile,'startedAt':utc(),'status':'ERROR',
       'source':'D9Z certified Golden and Recovery, Guided approach shortfall',
       'testKind':'ASSISTED_SCRIPTED_TARGET_CLOSURE_WITH_RECOVERY_AB_NOT_HUMAN_DISCOVERABILITY','gameplayChanges':False,
       'errors':errors,'actions':[],'percepts':[],'navigation':[],'checkpoints':[],
       'courseStarted':False,'arrival':None,'policyContract':policy_contract(),
       'ownerProof':'OFFLINE_REC1_ONLY','livePolicyForbidden':list(LIVE_FORBIDDEN)}
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
            for item in acquisition(acquisition_profile(profile)):
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
                answer=observed_navigation(page,hud_text,profile,deadline,run['navigation'],folder)
                run['navigationVerdict']=answer
                run['publicAnswerFound']=bool(answer['publicCueSeen'])
                page.screenshot(path=str(folder/'post_navigation.png'))
                if answer['publicCueSeen']:
                    run['arrival']=fold_finish(page,hud_text,deadline,run['actions'])
                else:
                    run['stopReason']='No visible Fold answer after bounded route and HUD settle; do not infer hidden owner state'
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
    p.add_argument('--profiles',default='golden,guided,recovery,recovery_control')
    p.add_argument('--seconds',type=int,default=145)
    p.add_argument('--max-acquisition-cycles',type=int,default=2)
    p.add_argument('--checkpoint-every',type=int,default=45)
    p.add_argument('--screenshot-every',type=int,default=24)
    p.add_argument('--output',default='BOT1D10A_RESULTS')
    args=p.parse_args()
    profiles=[x.strip() for x in args.profiles.split(',')]
    if not profiles or len(set(profiles))!=len(profiles) or any(x not in PROFILES_D10A for x in profiles):
        p.error('--profiles must be unique names from golden,guided,recovery,recovery_control')
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
    save(root/'BOT1D10A_RUN_INDEX.json',{'revision':'BOT1-D10A','createdAt':utc(),
        'profilesRequested':profiles,'noGameplayChanges':True,'worldSeedSet':False,
        'assistedScripted':True,'noOwnerStateUsedOnline':True,'runs':rows})
    print('Wrote',root/'BOT1D10A_RUN_INDEX.json')
    return 0 if all(r['status']=='CAPTURED' for r in rows) else 2

if __name__=='__main__':raise SystemExit(main())
