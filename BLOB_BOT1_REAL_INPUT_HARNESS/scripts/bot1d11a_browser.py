#!/usr/bin/env python3
"""BOT1-D11A: test-only Silt drivetrain diagnostic via existing debug platform.

This browser driver never reads REC1 or world-owner state until AFTER all input is
complete. It uses fixed keyboard actions and a debug-only canonical Silt start.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d3_browser import hud_text,save,utc
from bot1d11a_policy import PROFILES,REVISION,CELL,course,contract,validate_course
try:from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Playwright required: py -m pip install playwright')


def one(browser,args,index,profile):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D11A_{stamp}_{index:02d}_{profile}'
    folder.mkdir(parents=True,exist_ok=False)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[];start=time.monotonic()
    run={'revision':REVISION,'profile':profile,'status':'ERROR','startedAt':utc(),
         'mode':'DEBUG_ONLY_SILT_MOBILITY_DIAGNOSTIC','requestedCell':CELL,
         'entryShortcut':'Shift+6','liveOwnerStateSteering':False,'worldSeedSet':False,
         'gameplayChanges':False,'actions':[],'visibleHud':[],'errors':errors,
         'policyContract':contract(),'testVerdict':'OFFLINE_REC1_ONLY'}
    page.on('pageerror',lambda exc:errors.append('pageerror: '+str(exc)[:350]))
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.keyboard.press('Alt+Shift+R')
        page.wait_for_timeout(350)
        recstatus=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in recstatus:raise RuntimeError('REC1 did not start: '+recstatus[:160])
        run['recordingStarted']=utc();run['visibleHud'].append({'at':utc(),'label':'at_launch','text':hud_text(page)[:500]})
        # Supported development shortcut, not a production teleport or a mutating
        # test-only interface. Owner cell verification is performed only offline.
        run['debugEntryPressedAt']=utc()
        page.keyboard.press('Shift+6')
        page.wait_for_timeout(1100)
        run['debugEntrySettledAt']=utc()
        run['visibleHud'].append({'at':utc(),'label':'after_debug_entry','text':hud_text(page)[:500]})
        page.screenshot(path=str(folder/'after_silt_entry.png'))
        for label,key,duration in validate_course(profile):
            if time.monotonic()-start+duration+10>args.seconds:
                raise RuntimeError('Time budget exhausted before course completed; use --seconds >= 75')
            step={'label':label,'key':key,'plannedSeconds':duration,'startedAt':utc(),
                  'stateUnknownOnline':True}
            run['actions'].append(step)
            if key:
                page.keyboard.down(key)
                try:page.wait_for_timeout(round(duration*1000))
                finally:page.keyboard.up(key)
            else:page.wait_for_timeout(round(duration*1000))
            step['endedAt']=utc()
            if label in ('before_intervention','coast','post_intervention'):
                page.screenshot(path=str(folder/f'{label}.png'))
            if key is None or label.endswith('intervention'):
                run['visibleHud'].append({'at':utc(),'label':label,'text':hud_text(page)[:500]})
        page.screenshot(path=str(folder/'end.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(420)
        with page.expect_download(timeout=20000) as download:page.keyboard.press('Alt+Shift+E')
        download.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf-8'))
        run['rec1']={'events':len(rec.get('events',[])),
                     'droppedDetails':(rec.get('summary') or {}).get('captureRetention',{}).get('droppedDetails'),
                     'captureDurationSeconds':rec.get('captureDurationSeconds')}
        run['status']='CAPTURED' if rec.get('events') else 'EMPTY'
    except Exception as exc:
        errors.append(f'{type(exc).__name__}: {exc}')
        try:page.screenshot(path=str(folder/'error.png'))
        except Exception:pass
    finally:
        run['finishedAt']=utc();run['wallSeconds']=round(time.monotonic()-start,2)
        save(folder/'RUN.json',run)
        try:ctx.close()
        except Exception:pass
    return {'folder':folder.name,'profile':profile,'status':run['status'],
            'events':run.get('rec1',{}).get('events',0),'errors':errors}


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--profiles',default=','.join(PROFILES))
    p.add_argument('--seconds',type=int,default=90,help='Time budget per profile, >= 75')
    p.add_argument('--output',default='BOT1D11A_RESULTS')
    args=p.parse_args(argv)
    profiles=[s.strip() for s in args.profiles.split(',')]
    if not profiles or len(set(profiles))!=len(profiles) or any(s not in PROFILES for s in profiles):
        p.error('Choose unique profiles from '+','.join(PROFILES))
    if not 75<=args.seconds<=210:p.error('--seconds must be 75..210')
    root=pathlib.Path(args.output).resolve()
    if root.exists() and any(root.iterdir()):p.error('Output directory contains files; select a fresh --output name')
    root.mkdir(parents=True,exist_ok=True)
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
                print(f"[D11A] {profile}: {result['status']} / REC1={result['events']} / errors={len(result['errors'])}",flush=True)
        finally:browser.close()
    save(root/'BOT1D11A_RUN_INDEX.json',{'revision':REVISION,'createdAt':utc(),
        'profilesRequested':profiles,'testKind':'DIAGNOSTIC_ONLY','debugEntry':'Shift+6',
        'noGameplayChanges':True,'noOwnerStateUsedOnline':True,'worldSeedSet':False,
        'contract':contract(),'runs':rows})
    print('[D11A] Wrote',root/'BOT1D11A_RUN_INDEX.json',flush=True)
    return 0 if all(r['status']=='CAPTURED' and not r['errors'] for r in rows) else 2

if __name__=='__main__':raise SystemExit(main())
