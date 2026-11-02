#!/usr/bin/env python3
"""D11C live mechanics diagnostic: full REC1 plus 20 Hz read-only chain sampling."""
from __future__ import annotations
import argparse, datetime, json, pathlib, shutil, sys, time
from bot1d3_browser import save, utc
from bot1d11c_policy import REVISION, PROFILES, course, controlled, entry_key
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit('Install Playwright: py -m pip install playwright')

def run_one(browser, args, idx, profile):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D11C_{stamp}_{idx:02d}_{profile}'
    folder.mkdir(parents=True,exist_ok=False)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page(); errors=[]; start=time.monotonic()
    record={'revision':REVISION,'profile':profile,'status':'ERROR','startedAt':utc(),
        'entry':entry_key(profile),'controlledDebugStart':controlled(profile),
        'mode':'DEV_QUERY_DIAGNOSTIC_ONLY','gameplayChanged':False,
        'naturalRunReadsOwnerDuringSteering':False,'actions':[],'errors':errors}
    page.on('pageerror',lambda ex: errors.append('pageerror: '+str(ex)[:350]))
    try:
        page.goto(args.url+'?bot1d11c=1' if '?' not in args.url else args.url+'&bot1d11c=1',wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.wait_for_function('Boolean(window.__BLOB_D11C_PROBE__)', timeout=30000)
        page.keyboard.press('Alt+Shift+R'); page.wait_for_timeout(350)
        rec_status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in rec_status: raise RuntimeError('REC1 failed to start: '+rec_status[:120])
        page.keyboard.press(entry_key(profile));page.wait_for_timeout(1250)
        page.evaluate('window.__BLOB_D11C_PROBE__.reset()')
        record['debugEntrySettledAt']=utc()
        page.screenshot(path=str(folder/'after_entry.png'))
        if controlled(profile):
            record['controlledIntervention']=page.evaluate('window.__BLOB_D11C_PROBE__.controlledStart()')
            page.wait_for_timeout(100)
        for label,key,seconds in course(profile):
            if time.monotonic()-start+seconds+12>args.seconds:raise RuntimeError('Budget exceeded')
            action={'label':label,'key':key,'plannedSeconds':seconds,'startedAt':utc()}
            record['actions'].append(action)
            page.evaluate('(label) => window.__BLOB_D11C_PROBE__.mark(label)', 'start:'+label)
            if key:
                page.keyboard.down(key)
                try:page.wait_for_timeout(round(seconds*1000))
                finally:page.keyboard.up(key)
            else:page.wait_for_timeout(round(seconds*1000))
            action['endedAt']=utc()
            page.evaluate('(label) => window.__BLOB_D11C_PROBE__.mark(label)', 'end:'+label)
        page.screenshot(path=str(folder/'end.png'))
        trace=page.evaluate('window.__BLOB_D11C_PROBE__.dump()')
        save(folder/'D11C_TRACE.json',trace)
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(450)
        with page.expect_download(timeout=20000) as dl:page.keyboard.press('Alt+Shift+E')
        dl.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf-8'))
        record['rec1']={'events':len(rec.get('events',[])),
            'droppedDetails':((rec.get('summary') or {}).get('captureRetention') or {}).get('droppedDetails')}
        record['samples']=len(trace.get('samples',[]))
        record['status']='CAPTURED' if rec.get('events') and record['samples'] else 'EMPTY'
    except Exception as exc:
        errors.append(f'{type(exc).__name__}: {exc}')
        try:
            if page.evaluate('Boolean(window.__BLOB_D11C_PROBE__)'):
                save(folder/'D11C_TRACE_PARTIAL.json',page.evaluate('window.__BLOB_D11C_PROBE__.dump()'))
            page.screenshot(path=str(folder/'error.png'))
        except Exception:pass
    finally:
        record['finishedAt']=utc();record['wallSeconds']=round(time.monotonic()-start,2)
        save(folder/'RUN.json',record)
        try:ctx.close()
        except Exception:pass
    return {'folder':folder.name,'profile':profile,'status':record['status'],
        'events':record.get('rec1',{}).get('events',0),'samples':record.get('samples',0),'errors':errors}

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--profiles',default=','.join(PROFILES))
    p.add_argument('--seconds',type=int,default=75)
    p.add_argument('--output',default='BOT1D11C_RESULTS')
    args=p.parse_args(argv)
    profiles=[x.strip() for x in args.profiles.split(',')]
    if not profiles or len(set(profiles))!=len(profiles) or any(x not in PROFILES for x in profiles):
        p.error('Profiles must be unique and from '+','.join(PROFILES))
    if not 30<=args.seconds<=180:p.error('--seconds must be 30..180')
    root=pathlib.Path(args.output).resolve()
    if root.exists() and any(root.iterdir()):p.error('Output directory not empty; use fresh name')
    root.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel:kw['channel']=args.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:
            rows=[]
            for idx,profile in enumerate(profiles,1):
                row=run_one(browser,args,idx,profile);rows.append(row)
                print(f"[D11C] {profile}: {row['status']} / REC1={row['events']} / probe={row['samples']} / errors={len(row['errors'])}",flush=True)
        finally:browser.close()
    save(root/'BOT1D11C_RUN_INDEX.json',{'revision':REVISION,'createdAt':utc(),
        'requestedProfiles':profiles,'testKind':'DIAGNOSTIC_NOT_CERTIFICATION',
        'ownerDataUsedForNavigation':False,'debugControlledPoseUsed':any(controlled(p) for p in profiles),
        'runs':rows})
    return 0 if all(r['status']=='CAPTURED' and not r['errors'] for r in rows) else 2
if __name__=='__main__':raise SystemExit(main())
