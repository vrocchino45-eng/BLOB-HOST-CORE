#!/usr/bin/env python3
"""BOT1-D6: demonstration-informed, *non-privileged* Fold navigation.

Uses only HUD text and screenshot comparisons online. REC1 is saved during active
recording via user-visible Alt+Shift+E downloads, at intervals and at the end.
Game input and circuit logic are unchanged.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d3_browser import hud_text, action_for_step, act, utc, save
from bot1d5_policy import screen_difference,weak_visual_change
from bot1d6_policy import objective,stage,next_action,PUBLIC_INPUTS,FORBIDDEN_INPUTS
try:from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Install Playwright: py -m pip install playwright')


def checkpoint(page,folder,seconds,run,timeout=18000):
    """Save cumulative REC1 without stopping capture (supported by current recorder)."""
    name=f'REC1_CHECKPOINT_{int(seconds):04d}s.json'
    try:
        with page.expect_download(timeout=timeout) as download:
            page.keyboard.press('Alt+Shift+E')
        download.value.save_as(str(folder/name))
        parsed=json.loads((folder/name).read_text(encoding='utf-8'))
        if not parsed.get('events') or not parsed.get('captureStartedAt'):
            raise ValueError('REC1 checkpoint missing active capture data')
        info={'name':name,'events':len(parsed['events']),
              'captureActive':parsed.get('captureActive'),'atSeconds':round(seconds,2)}
        run['checkpoints'].append(info)
        return info
    except Exception as error:
        run['errors'].append('checkpoint: '+repr(error))
        return None


def run_one(browser,args,seed):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D6_{stamp}_reference_s{seed}'
    folder.mkdir(parents=True,exist_ok=True)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[];run={'revision':'BOT1-D6','profile':'reference',
       'seed':seed,'status':'ERROR','startedAt':utc(),'errors':errors,
       'actions':[],'percepts':[],'checkpoints':[],
       'policyInputs':PUBLIC_INPUTS,'forbiddenPolicyInputs':FORBIDDEN_INPUTS,
       'gameplayChanges':False,'evidenceKind':'REAL_BROWSER_HUD_AND_SCREEN_ONLY',
       'referenceUse':'Human REC1 is independent offline referee/training example; no online access'}
    page.on('pageerror',lambda err:errors.append('pageerror: '+str(err)[:400]))
    started=time.monotonic();last_frame=0;last_checkpoint=0
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.wait_for_function('() => typeof window.BLOB_TELEMETRY?.getSession === "function"',timeout=25000)
        page.keyboard.press('Shift');page.screenshot(path=str(folder/'start.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(300)
        status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in status:raise RuntimeError('Recorder failed to start: '+status[:100])
        phase='nursery';step=0;navstep=0;weak_streak=0;stage_retries=0
        previous_hud=None;previous_stage=None;deadline=time.monotonic()+args.seconds
        while time.monotonic()<deadline and step<500:
            h=hud_text(page);s=stage(h);obj=objective(h)
            if h!=previous_hud:
                run['percepts'].append({'time':utc(),'stage':s,'objective':obj,'hud':h[:1200]})
                previous_hud=h
            if s!=previous_stage:
                run['actions'].append({'step':step,'time':utc(),'op':'stage_observed','stage':s})
                stage_retries=0;previous_stage=s;weak_streak=0
                try:page.screenshot(path=str(folder/f'stage_{step:03d}_{s}.png'))
                except Exception:pass
            if s.startswith('fold_') and phase=='nursery':
                phase='fold'
                page.screenshot(path=str(folder/'fold_invitation.png'))
            if phase=='nursery':
                op,key,duration=action_for_step('sweep',step,('packet_instruction' if s=='packet' else 'wait_for_packet' if s=='packet_wait' else 'unknown'),None,seed,False)
                reason='D3_nursery_acquisition_baseline'
            else:
                op,key,duration,reason=next_action(s,navstep,weak_streak,seed,stage_retries)
                if s=='fold_search':navstep+=1
                stage_retries+=1
            ambient=None;visual=None
            if phase=='fold' and s=='fold_search':
                a=page.screenshot();page.wait_for_timeout(170);b=page.screenshot()
                ambient=screen_difference(a,b)
                before=b
            else:before=None
            event={'step':step,'time':utc(),'phase':phase,'visibleStage':s,'objective':obj[:250],
                   'op':op,'key':key,'durationSeconds':duration,'reason':reason,
                   'ambientDifference':ambient,'authority':'VISIBLE_HUD_AND_RENDER_ONLY'}
            act(page,op,key,duration)
            if before is not None:
                visual=screen_difference(before,page.screenshot())
                weak=weak_visual_change(visual,ambient or 0) if op=='move' else None
                if weak is not None:weak_streak=weak_streak+1 if weak else 0
                event.update({'pixelDifference':visual,'weakVisualChange':weak,
                              'weakMoveStreak':weak_streak,
                              'pixelLimit':'Cannot establish world displacement or correct direction'})
            run['actions'].append(event);step+=1
            elapsed=time.monotonic()-started
            if elapsed-last_frame>=args.screenshot_every:
                last_frame=elapsed;page.screenshot(path=str(folder/f'progress_{int(elapsed):03d}s.png'))
            if elapsed-last_checkpoint>=args.checkpoint_every:
                last_checkpoint=elapsed;checkpoint(page,folder,elapsed,run)
            if s=='fold_complete':
                # Export and stop after objective surfaced; referee determines owner completion.
                page.wait_for_timeout(800)
                break
        # Catch a final period of owner updates before stopping and downloading.
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(380)
        with page.expect_download(timeout=18000) as download:page.keyboard.press('Alt+Shift+E')
        download.value.save_as(str(folder/'REC1.json'))
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
        # Best effort recovery without creating fake success.
        try:checkpoint(page,folder,time.monotonic()-started,run,timeout=3500)
        except Exception:pass
    finally:
        run['finishedAt']=utc();run['wallSeconds']=round(time.monotonic()-started,2)
        save(folder/'RUN.json',run)
        try:ctx.close()
        except Exception:pass
    return {'folder':folder.name,'profile':'reference','status':run['status'],
        'events':run.get('rec1',{}).get('events',0),'checkpoints':len(run['checkpoints']),
        'errors':errors}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--seconds',type=int,default=210)
    p.add_argument('--seed',type=int,default=11)
    p.add_argument('--output',default='BOT1D6_RESULTS')
    p.add_argument('--checkpoint-every',type=int,default=45)
    p.add_argument('--screenshot-every',type=int,default=18)
    a=p.parse_args()
    if not 75<=a.seconds<=300:p.error('--seconds must be 75..300')
    if not 20<=a.checkpoint_every<=90:p.error('--checkpoint-every must be 20..90')
    if not 8<=a.screenshot_every<=45:p.error('--screenshot-every must be 8..45')
    root=pathlib.Path(a.output).resolve();root.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not a.headed,'args':['--disable-dev-shm-usage']}
        if a.browser_channel:kw['channel']=a.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:report=run_one(browser,a,a.seed)
        finally:browser.close()
    save(root/'BOT1D6_RUN_INDEX.json',{'revision':'BOT1-D6','createdAt':utc(),'runs':[report],
        'gameplayChanges':False,'baseline':'BOT1-D5 + GUIDE0-W; REC1 human reference used offline only'})
    print(f"reference: {report['status']} / {report['events']} final events / {report['checkpoints']} checkpoints")
    print('Wrote',root/'BOT1D6_RUN_INDEX.json')
    return 0 if report['status']=='CAPTURED' else 2
if __name__=='__main__':raise SystemExit(main())
