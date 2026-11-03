#!/usr/bin/env python3
"""BOT1-D11L read-only owner release-gate diagnostic.

Uses physical keyboard actions and the already installed D11C/D11F/D11H/D11I
read-only probes. No collision/physics edits, no telemetry-guided steering.
"""
from __future__ import annotations
import argparse, datetime, json, pathlib, shutil, sys, time
from bot1d3_browser import save, utc
from bot1d11k_policy import schedule, route, entry_key
REVISION = "BOT1-D11L-1"
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit('Install Playwright: py -m pip install playwright')


def run_one(browser, args, idx, round_number, profile, arm):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D11L_{stamp}_r{round_number:02d}_{idx:02d}_{profile}_{arm}'
    folder.mkdir(parents=True, exist_ok=False)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page(); errors=[]; t0=time.monotonic()
    meta={'revision':REVISION,'round':round_number,'profile':profile,'arm':arm,
          'status':'ERROR','startedAt':utc(),'entry':entry_key(profile),
          'controlledDebugStart':False,'gameplayChanged':False,
          'ownerDataUsedForSteering':False,'debugEntryUsed':True,
          'mode':'OWNER_RELEASE_GATE_INSTRUMENTED_FIXED_KEY_COMPARISON',
          'actions':[],'errors':errors}
    page.on('pageerror',lambda exc:errors.append('pageerror: '+str(exc)[:350]))
    try:
        url=args.url+('&' if '?' in args.url else '?')+'bot1d11c=1'
        page.goto(url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.wait_for_function('Boolean(window.__BLOB_D11C_PROBE__)',timeout=30000)
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(350)
        status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in status:raise RuntimeError('REC1 start failed: '+status[:150])
        page.keyboard.press(entry_key(profile));page.wait_for_timeout(1250)
        page.evaluate('window.__BLOB_D11C_PROBE__.reset()')
        check=page.evaluate('window.__BLOB_D11C_PROBE__.dump()')
        events=check.get('firstFootholdEvents') or {}
        if events.get('revision')!='BOT1-D11I-1' or events.get('hooked') is not True:
            raise RuntimeError('D11I owner-event observer missing; preserve previous diagnostics')
        page.screenshot(path=str(folder/'after_entry.png'))
        for label,key,seconds in route(profile,arm):
            if time.monotonic()-t0+seconds+12>args.seconds:
                raise RuntimeError('Run time budget exceeded')
            action={'label':label,'key':key,'plannedSeconds':seconds,'startedAt':utc()}
            meta['actions'].append(action)
            page.evaluate('(v)=>window.__BLOB_D11C_PROBE__.mark(v)','start:'+label)
            if key:
                page.keyboard.down(key)
                try:page.wait_for_timeout(round(seconds*1000))
                finally:page.keyboard.up(key)
            else:page.wait_for_timeout(round(seconds*1000))
            action['endedAt']=utc()
            page.evaluate('(v)=>window.__BLOB_D11C_PROBE__.mark(v)','end:'+label)
        page.screenshot(path=str(folder/'end.png'))
        trace=page.evaluate('window.__BLOB_D11C_PROBE__.dump()')
        save(folder/'D11C_TRACE.json',trace)
        gate=trace.get('releaseGate') or {}
        if gate.get('revision')!='BOT1-D11L-1' or gate.get('hooked') is not True:
            raise RuntimeError('D11L owner-method recorder missing or not hooked')
        if not gate.get('frames') or gate.get('droppedFrames'):
            raise RuntimeError('D11L owner-gate capture incomplete or overflowed')
        if not trace.get('samples') or not all('continuity' in s for s in trace['samples']):
            raise RuntimeError('D11F geometry observer missing')
        if not (trace.get('firstFoothold') or {}).get('samples'):
            raise RuntimeError('D11H first foothold observer missing')
        owner=trace.get('firstFootholdEvents') or {}
        if not owner.get('events'):
            raise RuntimeError('D11I owner events absent')
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(450)
        with page.expect_download(timeout=20000) as dl:page.keyboard.press('Alt+Shift+E')
        dl.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf-8'))
        meta['rec1']={'events':len(rec.get('events',[])),
          'droppedDetails':((rec.get('summary') or {}).get('captureRetention') or {}).get('droppedDetails')}
        meta['samples']=len(trace['samples']);meta['ownerEvents']=len(owner['events'])
        meta['releaseGateFrames']=len(gate['frames'])
        meta['releaseModelVerified']=bool((gate.get('coverage') or {}).get('modelVerified'))
        meta['status']='CAPTURED' if meta['rec1']['events'] else 'EMPTY'
    except Exception as exc:
        errors.append(f'{type(exc).__name__}: {exc}')
        try:
            if page.evaluate('Boolean(window.__BLOB_D11C_PROBE__)'):
                save(folder/'D11C_TRACE_PARTIAL.json',page.evaluate('window.__BLOB_D11C_PROBE__.dump()'))
            page.screenshot(path=str(folder/'error.png'))
        except Exception:pass
    finally:
        meta['finishedAt']=utc();meta['wallSeconds']=round(time.monotonic()-t0,2)
        save(folder/'RUN.json',meta)
        try:ctx.close()
        except Exception:pass
    return {'folder':folder.name,'round':round_number,'profile':profile,'arm':arm,
            'status':meta['status'],'events':meta.get('rec1',{}).get('events',0),
            'errors':errors}


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--rounds',type=int,default=2)
    p.add_argument('--seconds',type=int,default=75)
    p.add_argument('--output',default='BOT1D11L_RESULTS')
    args=p.parse_args(argv)
    if args.rounds not in (1,2,3):p.error('--rounds 1..3')
    if not 30<=args.seconds<=180:p.error('--seconds 30..180')
    root=pathlib.Path(args.output).resolve()
    if root.exists() and any(root.iterdir()):p.error('Output must be empty or new')
    root.mkdir(parents=True,exist_ok=True)
    rows=[];plan=schedule(args.rounds)
    with sync_playwright() as pw:
        kw={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel:kw['channel']=args.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:
            for i,(rnd,profile,arm) in enumerate(plan,1):
                row=run_one(browser,args,i,rnd,profile,arm);rows.append(row)
                print(f"[D11K] {i}/{len(plan)} r{rnd} {profile}/{arm} {row['status']} REC1={row['events']} errors={len(row['errors'])}",flush=True)
        finally:browser.close()
    save(root/'BOT1D11L_RUN_INDEX.json',{'revision':REVISION,'createdAt':utc(),
         'rounds':args.rounds,'schedule':plan,'runs':rows,
         'gameplayChanged':False,'ownerDataUsedForSteering':False,'controlledDebugStart':False,
         'comparisonIsFixedInput':True})
    return 0 if all(r['status']=='CAPTURED' and not r['errors'] for r in rows) else 2

if __name__=='__main__':raise SystemExit(main())
