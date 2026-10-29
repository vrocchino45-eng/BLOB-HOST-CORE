#!/usr/bin/env python3
"""G1-D7: visually surveyed, persistent navigation. BLOB gameplay stays frozen.

Online evidence: public HUD, screenshots, prior inputs and time only. Source owner
snapshots are exported for an independent *offline* referee after actions.
A color candidate or appearance score is never a verified Listening Fold target.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d3_browser import hud_text,action_for_step,act,utc,save
from bot1d6_browser import checkpoint
from bot1d6_policy import objective,stage,next_action
from bot1d7_vision import describe,choose,classify_progress,difference
try:from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Playwright missing. Run: py -m pip install playwright')

# Survey means: center -> left -> right -> nominal center.
# I/J/K/L are the published camera keys, not browser commands or hidden poses.
def survey_view(page,folder,step,record_frame=False):
    a=page.screenshot();center=describe(a)
    page.wait_for_timeout(190);b=page.screenshot()
    ambient=difference(center,describe(b))
    act(page,'look','j',.43);page.wait_for_timeout(170)
    leftbytes=page.screenshot();left=describe(leftbytes)
    act(page,'look','l',.86);page.wait_for_timeout(170)
    rightbytes=page.screenshot();right=describe(rightbytes)
    act(page,'look','j',.43);page.wait_for_timeout(170)
    if record_frame:
        for name,png in [('center',a),('left',leftbytes),('right',rightbytes)]:
            (folder/f'survey_{step:03d}_{name}.png').write_bytes(png)
    return {'center':center,'left':left,'right':right},ambient


def one(browser,args,seed):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D7_{stamp}_visual_s{seed}'
    folder.mkdir(parents=True,exist_ok=True)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[]
    run={'revision':'BOT1-D7','seed':seed,'status':'ERROR','startedAt':utc(),
       'profile':'visual_exploration','errors':errors,'actions':[],'percepts':[],
       'surveys':[],'checkpoints':[],
       'onlineInputs':['visible HUD objective','rendered PNG screenshot',
          'appearance novelty','prior input history','elapsed time'],
       'onlineForbidden':['REC1 or gameplay owner read','Fold world position / distance',
          'hidden material or target IDs','Guide owner state / route state'],
       'gameplayChanges':False,
       'proofBoundary':'Appearance novelty is not movement distance; cyan candidates are NOT identified as Fold; owner progress assessed offline only.'}
    page.on('pageerror',lambda error:errors.append('pageerror: '+str(error)[:360]))
    started=time.monotonic();last_frame=last_checkpoint=0
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.wait_for_function('() => typeof window.BLOB_TELEMETRY?.getSession === "function"',timeout=25000)
        page.keyboard.press('Shift');page.screenshot(path=str(folder/'start.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(300)
        status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in status:raise RuntimeError('Recording not active: '+status[:90])
        step=0;phase='nursery';history=[];previous_heading=None;stalled=0
        previous_stage=None;previous_hud=None;stage_retries=0
        deadline=time.monotonic()+args.seconds
        while time.monotonic()<deadline and step<400:
            h=hud_text(page);s=stage(h);obj=objective(h)
            if h!=previous_hud:
                run['percepts'].append({'time':utc(),'visibleStage':s,'objective':obj,'hud':h[:1000]})
                previous_hud=h
            if s!=previous_stage:
                run['actions'].append({'step':step,'time':utc(),'op':'stage_observed','stage':s})
                previous_stage=s;stage_retries=0
                page.screenshot(path=str(folder/f'stage_{step:03d}_{s}.png'))
            if s.startswith('fold_') and phase=='nursery':
                phase='fold';page.screenshot(path=str(folder/'fold_invitation.png'))
                history=[];previous_heading=None;stalled=0
            if phase=='nursery':
                op,key,dur=action_for_step('sweep',step,('packet_instruction' if s=='packet' else 'wait_for_packet' if s=='packet_wait' else 'unknown'),None,seed,False)
                act(page,op,key,dur)
                run['actions'].append({'step':step,'time':utc(),'visibleStage':s,'op':op,'key':key,'durationSeconds':dur,'reason':'existing_D3_nursery_acquisition','ownerFree':True})
            elif s=='fold_search':
                sv,ambient=survey_view(page,folder,step,record_frame=(len(run['surveys'])%4==0))
                decision=choose(sv,history,previous_heading)
                heading=decision['selected'];previous_heading=heading
                # Abandon a visually unproductive heading only after repeated committed moves.
                if stalled>=3:
                    heading=('right' if heading=='left' else 'left' if heading=='right' else 'right')
                    stalled=0;reason='persistent_low_novelty_reframe'
                else:reason='survey_viewpoint_novelty_exploration'
                if heading=='left':act(page,'look','j',.43)
                elif heading=='right':act(page,'look','l',.43)
                before=describe(page.screenshot());act(page,'move','w',args.commit_seconds)
                page.wait_for_timeout(220);after=describe(page.screenshot())
                result=classify_progress(before,after,ambient)
                stalled=0 if result['visualChangeAboveAmbient'] else stalled+1
                history.append(after)
                decision.update({'step':step,'at':utc(),'chosenHeading':heading,
                       'initialCandidates':sv['center']['candidates'],
                       'candidateCounts':{k:len(v['candidates']) for k,v in sv.items()},
                       'ambientDelta':ambient,'movement':result,
                       'reason':reason,'stalledSequence':stalled})
                run['surveys'].append(decision)
                run['actions'].append({'step':step,'time':utc(),'visibleStage':s,
                   'op':'move','key':'w','durationSeconds':args.commit_seconds,
                   'reason':reason,'selectedHeading':heading,
                   'appearanceChange':result['appearanceDelta'],
                   'ownerFree':True,'goalDirectionKnown':False})
                # Poll HUD immediately after each sustained movement, not on a stale objective.
            else:
                op,key,dur,reason=next_action(s,step,0,seed,stage_retries)
                act(page,op,key,dur)
                run['actions'].append({'step':step,'time':utc(),'visibleStage':s,'op':op,
                    'key':key,'durationSeconds':dur,'reason':reason,'ownerFree':True})
            step+=1;stage_retries+=1
            elapsed=time.monotonic()-started
            if elapsed-last_frame>=args.screenshot_every:
                last_frame=elapsed;page.screenshot(path=str(folder/f'progress_{int(elapsed):03d}s.png'))
            if elapsed-last_checkpoint>=args.checkpoint_every:
                last_checkpoint=elapsed;checkpoint(page,folder,elapsed,run)
            if s=='fold_complete':page.wait_for_timeout(700);break
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(380)
        with page.expect_download(timeout=18000) as download:page.keyboard.press('Alt+Shift+E')
        download.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf8'))
        run['rec1']={'events':len(rec.get('events',[])),
            'captureSeconds':rec.get('captureDurationSeconds'),
            'dropped':rec.get('summary',{}).get('captureRetention',{}).get('droppedDetails')}
        run['status']='CAPTURED' if run['rec1']['events'] else 'EMPTY'
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
    return {'folder':folder.name,'status':run['status'],
        'rec1Events':run.get('rec1',{}).get('events',0),
        'surveys':len(run['surveys']),'checkpoints':len(run['checkpoints']),'errors':errors}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--seconds',type=int,default=240)
    p.add_argument('--seed',type=int,default=11)
    p.add_argument('--commit-seconds',type=float,default=1.65)
    p.add_argument('--output',default='BOT1D7_RESULTS')
    p.add_argument('--checkpoint-every',type=int,default=45)
    p.add_argument('--screenshot-every',type=int,default=20)
    args=p.parse_args()
    if not 90<=args.seconds<=300:p.error('seconds must be 90..300')
    if not .8<=args.commit_seconds<=2.2:p.error('commit-seconds must be 0.8..2.2')
    if not 20<=args.checkpoint_every<=90:p.error('checkpoint-every must be 20..90')
    root=pathlib.Path(args.output).resolve();root.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel:kw['channel']=args.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:result=one(browser,args,args.seed)
        finally:browser.close()
    save(root/'BOT1D7_RUN_INDEX.json',{'revision':'BOT1-D7','createdAt':utc(),
            'runs':[result],'gameplayChanges':False,'source':'BOT1-D6 frozen gameplay and owner recorder'})
    print('BOT1-D7:',result['status'],'/',result['rec1Events'],'REC1 events /',result['surveys'],'surveys /',result['checkpoints'],'checkpoints')
    print('Wrote',root/'BOT1D7_RUN_INDEX.json')
    return 0 if result['status']=='CAPTURED' else 2
if __name__=='__main__':raise SystemExit(main())
