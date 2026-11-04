#!/usr/bin/env python3
"""D11N fixed-authored-origin acquisition comparison; no gameplay changes.

Do not infer navigation from Shift+6 debug entry. Never steer from telemetry.
Disabling the D11L recorder only restores its wrapped release-owner method;
D11C/F/H/I remain operating to capture contact and authored-mesh truth.
"""
from __future__ import annotations
import argparse, datetime, json, pathlib, shutil, sys, time
from bot1d3_browser import save, utc
from bot1d11m_policy import schedule, route
REVISION = "BOT1-D11N-1"
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit('Install Playwright: py -m pip install playwright')


def run_one(browser,args,idx,rnd,profile,arm,observer):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D11N_{stamp}_r{rnd:02d}_{idx:02d}_{profile}_{arm}_{observer}'
    folder.mkdir(parents=True,exist_ok=False)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[];t0=time.monotonic()
    meta={'revision':REVISION,'round':rnd,'profile':profile,'arm':arm,'observer':observer,
          'status':'ERROR','startedAt':utc(),'entry':('Shift+1' if profile=='host_positive' else 'Shift+6'),
          'controlledDebugStart':True,'debugEntryUsed':True,'gameplayChanged':False,
          'ownerDataUsedForSteering':False,'mode':'CANONICAL_POST_SHIFT6_REFERENCE_FIXED_INPUT_ACQUISITION',
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
        page.keyboard.press(meta['entry']);page.wait_for_timeout(1250)
        probe='window.__BLOB_D11C_PROBE__'
        page.evaluate(probe+'.reset()')
        check=page.evaluate(probe+'.dump()')
        fo=check.get('firstFootholdEvents') or {};gate=check.get('releaseGate') or {}
        if fo.get('revision')!='BOT1-D11I-1' or fo.get('hooked') is not True:
            raise RuntimeError('D11I owner event recorder missing')
        if gate.get('revision')!='BOT1-D11L-1' or gate.get('hooked') is not True:
            raise RuntimeError('D11L owner gate recorder missing; D11M requires D11L')
        if observer=='observer_off':
            ok=page.evaluate('''() => {
              const p=window.__BLOB_D11C_PROBE__;
              if(typeof p.disableD11LReleaseRecorder!=="function") return false;
              return p.disableD11LReleaseRecorder();
            }''')
            if not ok: raise RuntimeError('D11M observer-stop API absent; apply D11M_APPLY.py')
            page.evaluate(probe+'.reset()')
            page.evaluate('window.__BLOB_D11C_PROBE__.mark("release_observer_off")')
        else:
            page.evaluate('window.__BLOB_D11C_PROBE__.mark("release_observer_on")')
        check=page.evaluate(probe+'.dump()')
        gate=check.get('releaseGate') or {}
        if observer=='observer_off' and (gate.get('frames') or gate.get('droppedFrames')):
            raise RuntimeError('D11L owner frames still recording in observer-off arm')
        # Save the debug entry screenshot BEFORE normalizing. Screenshot latency
        # must not become an uncontrolled coast interval after the start reset.
        page.screenshot(path=str(folder/'after_entry.png'))
        if profile == 'host_positive':
            meta['controlledDebugStart'] = False
            meta['controlledStartReceipt'] = None
        else:
            page.evaluate(probe+'.reset()')
            page.evaluate('(label)=>window.__BLOB_D11C_PROBE__.mark(label)',
                          'release_observer_off' if observer=='observer_off' else 'release_observer_on')
            start_receipt = page.evaluate(probe+'.controlledD11NPreApproachStart()')
            if start_receipt.get('kind') != 'controlled_preapproach_start_d11n':
                raise RuntimeError('D11N canonical-start proof absent')
            meta['controlledStartReceipt'] = start_receipt
            # No screenshot or wait between reset and first fixed-input action.
            page.evaluate(probe+'.mark("d11n_input_start")')
        for label,key,seconds in route(profile,arm):
            if time.monotonic()-t0+seconds+12>args.seconds:
                raise RuntimeError('Run budget exceeded')
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
        trace=page.evaluate(probe+'.dump()')
        save(folder/'D11C_TRACE.json',trace)
        if not trace.get('samples') or not all('continuity' in s for s in trace['samples']):
            raise RuntimeError('D11F mesh geometry sampling absent')
        if not (trace.get('firstFoothold') or {}).get('samples'):
            raise RuntimeError('D11H foothold probe absent')
        owner=trace.get('firstFootholdEvents') or {}
        if not owner.get('events') or owner.get('droppedEvents'):
            raise RuntimeError('D11I owner events absent or overflowed')
        gate=trace.get('releaseGate') or {}
        if gate.get('droppedFrames',0):raise RuntimeError('Release observer overflowed')
        if observer=='observer_on' and not gate.get('frames'):
            raise RuntimeError('Release owner frames missing in observer-on arm')
        if observer=='observer_off' and gate.get('frames'):
            raise RuntimeError('Release owner unexpectedly active in observer-off arm')
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(450)
        with page.expect_download(timeout=20000) as dl: page.keyboard.press('Alt+Shift+E')
        dl.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text('utf-8'))
        meta['rec1']={'events':len(rec.get('events',[])),
          'droppedDetails':((rec.get('summary') or {}).get('captureRetention') or {}).get('droppedDetails')}
        if not meta['rec1']['events'] or meta['rec1']['droppedDetails'] not in (None,0):
            raise RuntimeError('REC1 missing or detail loss')
        meta['sampleCount']=len(trace['samples']);meta['ownerEventCount']=len(owner['events'])
        meta['releaseOwnerFrameCount']=len(gate.get('frames') or [])
        meta['status']='CAPTURED'
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
    return {'folder':folder.name,'round':rnd,'profile':profile,'arm':arm,'observer':observer,
            'status':meta['status'],'events':meta.get('rec1',{}).get('events',0),'errors':errors}


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--pairs',type=int,default=3)
    p.add_argument('--seconds',type=int,default=75)
    p.add_argument('--output',default='BOT1D11N_RESULTS')
    a=p.parse_args(argv)
    if not 1<=a.pairs<=7:p.error('--pairs must be 1..7')
    if not 30<=a.seconds<=180:p.error('--seconds 30..180')
    root=pathlib.Path(a.output).resolve()
    if root.exists() and any(root.iterdir()):p.error('Output must be empty or new')
    root.mkdir(parents=True,exist_ok=True)
    rows=[];plan=schedule(a.pairs)
    with sync_playwright() as pw:
        kw={'headless':not a.headed,'args':['--disable-dev-shm-usage']}
        if a.browser_channel:kw['channel']=a.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:
            for i,(rnd,profile,arm,observer) in enumerate(plan,1):
                row=run_one(browser,a,i,rnd,profile,arm,observer);rows.append(row)
                print(f"[D11N] {i}/{len(plan)} r{rnd} {profile}/{arm}/{observer} "
                      f"{row['status']} REC1={row['events']} errors={len(row['errors'])}",flush=True)
        finally:browser.close()
    save(root/'BOT1D11N_RUN_INDEX.json',{'revision':REVISION,'createdAt':utc(),
         'pairs':a.pairs,'schedule':plan,'runs':rows,
         'gameplayChanged':False,'ownerDataUsedForSteering':False,
         'controlledDebugStart':True,'comparisonIsFixedInput':True,
         'observerOffMeansD11LOnly':True,'cameraHeadingForced':False,'startOwner':'D11N debug probe'})
    return 0 if all(r['status']=='CAPTURED' and not r['errors'] for r in rows) else 2

if __name__=='__main__':raise SystemExit(main())
