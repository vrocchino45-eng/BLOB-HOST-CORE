#!/usr/bin/env python3
"""BOT1-D11I: fixed-control versus near-contact dwell, debug event reasons.

No owner-data steering or test relocation. This runner requires D11I hook.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d3_browser import save,utc
from bot1d11i_policy import ARMS,NATURAL,PROFILES,route,schedule,entry_key
try:
    from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Install Playwright: py -m pip install playwright')
REVISION='BOT1-D11I-1'

def one(browser,args,index,round_number,profile,arm):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D11I_{stamp}_r{round_number:02d}_{index:02d}_{profile}_{arm}'
    folder.mkdir(parents=True,exist_ok=False)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page(); errors=[]; t0=time.monotonic()
    meta={'revision':REVISION,'profile':profile,'arm':arm,'round':round_number,'status':'ERROR',
          'startedAt':utc(),'entry':entry_key(profile),'controlledDebugStart':False,
          'ownerDataUsedForSteering':False,'gameplayChanged':False,'debugEntryUsed':True,
          'mode':'REAL_KEY_INPUT_FIXED_TIMING_ARM_DIAGNOSTIC','actions':[],'errors':errors}
    page.on('pageerror',lambda ex:errors.append('pageerror: '+str(ex)[:350]))
    try:
        url=args.url+('&' if '?' in args.url else '?')+'bot1d11c=1'
        page.goto(url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.wait_for_function('Boolean(window.__BLOB_D11C_PROBE__)',timeout=30000)
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(350)
        status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in status:raise RuntimeError('REC1 failed to start: '+status[:150])
        page.keyboard.press(entry_key(profile));page.wait_for_timeout(1250)
        page.evaluate('window.__BLOB_D11C_PROBE__.reset()')
        trace_check=page.evaluate('window.__BLOB_D11C_PROBE__.dump().firstFootholdEvents')
        if not trace_check or trace_check.get('revision')!=REVISION or not trace_check.get('hooked'):
            raise RuntimeError('D11I event observer missing; run D11I_APPLY.py --apply first')
        page.screenshot(path=str(folder/'after_entry.png'))
        for label,key,seconds in route(profile,arm):
            if time.monotonic()-t0+seconds+12>args.seconds:raise RuntimeError('Run time budget exceeded')
            action={'label':label,'key':key,'plannedSeconds':seconds,'startedAt':utc()};meta['actions'].append(action)
            page.evaluate('(label) => window.__BLOB_D11C_PROBE__.mark(label)','start:'+label)
            if key:
                page.keyboard.down(key)
                try:page.wait_for_timeout(round(seconds*1000))
                finally:page.keyboard.up(key)
            else:page.wait_for_timeout(round(seconds*1000))
            action['endedAt']=utc()
            page.evaluate('(label) => window.__BLOB_D11C_PROBE__.mark(label)','end:'+label)
        page.screenshot(path=str(folder/'end.png'))
        trace=page.evaluate('window.__BLOB_D11C_PROBE__.dump()')
        save(folder/'D11C_TRACE.json',trace)
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(450)
        with page.expect_download(timeout=20000) as dl:page.keyboard.press('Alt+Shift+E')
        dl.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf-8'))
        meta['rec1']={'events':len(rec.get('events',[])),
          'droppedDetails':((rec.get('summary') or {}).get('captureRetention') or {}).get('droppedDetails')}
        meta['samples']=len(trace.get('samples',[]))
        meta['ownerEvents']=len((trace.get('firstFootholdEvents') or {}).get('events',[]))
        meta['status']='CAPTURED' if meta['rec1']['events'] and meta['samples'] and meta['ownerEvents'] else 'EMPTY'
    except Exception as ex:
        errors.append(f'{type(ex).__name__}: {ex}')
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
    return {'folder':folder.name,'profile':profile,'arm':arm,'round':round_number,
            'status':meta['status'],'ownerEvents':meta.get('ownerEvents',0),
            'events':meta.get('rec1',{}).get('events',0),'errors':errors}

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--rounds',type=int,default=2,help='1..3; default 2 = 14 captures')
    p.add_argument('--seconds',type=int,default=75)
    p.add_argument('--output',default='BOT1D11I_RESULTS')
    args=p.parse_args(argv)
    if args.rounds not in (1,2,3):p.error('Rounds 1..3 only')
    if not 30<=args.seconds<=180:p.error('Seconds 30..180 only')
    root=pathlib.Path(args.output).resolve()
    if root.exists() and any(root.iterdir()):p.error('Output folder must be new or empty')
    root.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel:kw['channel']=args.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:
            rows=[]
            for i,(rnd,profile,arm) in enumerate(schedule(args.rounds),1):
                r=one(browser,args,i,rnd,profile,arm);rows.append(r)
                print(f"[D11I] {i}/{len(schedule(args.rounds))} {profile}/{arm}: {r['status']} REC1={r['events']} owner={r['ownerEvents']} errors={len(r['errors'])}",flush=True)
        finally:browser.close()
    save(root/'BOT1D11I_RUN_INDEX.json',{'revision':REVISION,'createdAt':utc(),
      'rounds':args.rounds,'testKind':'FIRST_FOOTHOLD_EVENT_AND_MATCHED_DWELL',
      'ownerDataUsedForSteering':False,'gameplayChanged':False,'schedule':schedule(args.rounds),'runs':rows})
    return 0 if all(r['status']=='CAPTURED' and not r['errors'] for r in rows) else 2
if __name__=='__main__':raise SystemExit(main())
