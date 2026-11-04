#!/usr/bin/env python3
"""D11O real-contact PRECONDITION then fixed-direction release comparison.

Reads contact truth to decide TESTABILITY only. It never chooses/adjusts input
from surface normals. Does not change the movement/tendril/gameplay runtime.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,shutil,sys,time
from bot1d3_browser import save,utc
from bot1d11o_policy import REVISION,schedule,approach,control_route,RELEASES
try:
    from playwright.sync_api import sync_playwright
except ImportError:sys.exit('Install Playwright: py -m pip install playwright')
PROBE='window.__BLOB_D11C_PROBE__'
TARGET='SILT_ENTRY_SEDIMENT_SHELF_D11B'

def precondition_sample(s):
    a=s.get('attachment') or {};p=s.get('plane') or {};c=s.get('continuity') or {}
    return bool(s.get('cell')=='CELL_SILT_PRESSURE_ROUTE_001' and a.get('active') and p.get('active') and
                (p.get('supportCount') or 0)>0 and p.get('surfaceId')==TARGET and
                c.get('carriedId')==TARGET and (c.get('measuredCount') or 0)>0 and
                not c.get('anchorsBeyond035') and not c.get('unmeasurablePlanted') and
                isinstance(c.get('maxPlantedAnchorToMesh'),(int,float)) and c['maxPlantedAnchorToMesh']<=.35)

def evaluate_precondition(trace):
    s=trace.get('samples') or []
    if not s:return {'valid':False,'reason':'no_samples'}
    recent=s[-8:];clean=[]
    for sample in reversed(recent):
        if not precondition_sample(sample):break
        clean.append(sample)
    clean.reverse()
    terminal=precondition_sample(s[-1])
    # Require separate qualifying samples with time separation; no assumption
    # that sampler ticks constitute continuous truth between them.
    dwell=clean[-1]['ms']-clean[0]['ms'] if len(clean)>=2 else 0
    valid=bool(terminal and len(clean)>=3 and dwell>=150 and s[-1]['ms']-clean[-1]['ms']<=175)
    return {'valid':valid,'reason':'sampled_valid_support' if valid else 'not_stably_supported_at_release_precondition',
        'supportSamples':len(clean),'sampledSupportSpanMs':dwell,
        'terminalSampleMs':s[-1].get('ms'),'terminalNormal':(s[-1].get('plane') or {}).get('normal'),
        'terminalMeshOffset':(s[-1].get('continuity') or {}).get('maxPlantedAnchorToMesh'),
        'latestAttachmentActive':bool((s[-1].get('attachment') or {}).get('active')),
        'caveat':'Sampled support receipt, not a continuous collision proof'}

def action(page,meta,label,keys,seconds):
    keys=tuple(keys) if not isinstance(keys,str) else (keys,)
    item={'label':label,'keys':list(keys),'plannedSeconds':seconds,'startedAt':utc()}
    meta['actions'].append(item)
    page.evaluate('(v)=>window.__BLOB_D11C_PROBE__.mark(v)','start:'+label)
    try:
        for key in keys:page.keyboard.down(key)
        page.wait_for_timeout(round(seconds*1000))
    finally:
        for key in reversed(keys):page.keyboard.up(key)
    item['endedAt']=utc()
    page.evaluate('(v)=>window.__BLOB_D11C_PROBE__.mark(v)','end:'+label)

def run_one(browser,args,index,rnd,profile,context,release):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D11O_{stamp}_r{rnd:02d}_{index:02d}_{profile}_{context}_{release}'
    folder.mkdir(parents=True,exist_ok=False)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[];t0=time.monotonic()
    meta={'revision':REVISION,'round':rnd,'profile':profile,'context':context,'release':release,
      'observer':'observer_on','arm':'neutral_counter' if profile=='natural_brake' else 'baseline',
      'status':'ERROR','startedAt':utc(),'entry':'Shift+1' if profile=='host_positive' else 'Shift+6',
      'controlledDebugStart':profile!='host_positive','ownerDataUsedForSteering':False,
      'gameplayChanged':False,'mode':'D11O_ATTACHED_ONLY_PREDECLARED_RELEASE_MATRIX','actions':[],'errors':errors,
      'precondition':None,'releaseAttempted':False,'releaseKeys':list(RELEASES.get(release,()))}
    page.on('pageerror',lambda exc:errors.append('pageerror: '+str(exc)[:400]))
    try:
        page.goto(args.url+('&' if '?' in args.url else '?')+'bot1d11c=1',wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.wait_for_function('Boolean(window.__BLOB_D11C_PROBE__)',timeout=30000)
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(350)
        status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in status:raise RuntimeError('REC1 start failed: '+status[:150])
        page.keyboard.press(meta['entry']);page.wait_for_timeout(1250)
        page.evaluate(PROBE+'.reset()')
        checks=page.evaluate(PROBE+'.dump()')
        if (checks.get('firstFootholdEvents') or {}).get('hooked') is not True:raise RuntimeError('D11I events missing')
        gate=checks.get('releaseGate') or {}
        if gate.get('revision')!='BOT1-D11L-1' or gate.get('hooked') is not True:
            raise RuntimeError('D11L release recorder missing')
        page.screenshot(path=str(folder/'after_entry.png'))
        if profile=='host_positive':meta['controlledStartReceipt']=None
        else:
            page.evaluate(PROBE+'.reset()')
            receipt=page.evaluate(PROBE+'.controlledD11NPreApproachStart()')
            if receipt.get('kind')!='controlled_preapproach_start_d11n':raise RuntimeError('D11N start missing')
            meta['controlledStartReceipt']=receipt
            page.evaluate(PROBE+'.mark("d11o_input_start")')
        if profile in ('natural_brake',):
            for label,key,secs in approach(context):
                if time.monotonic()-t0+secs+12>args.seconds:raise RuntimeError('Run budget exceeded')
                action(page,meta,label,() if key is None else (key,),secs)
            # Passive observation only. No corrective steering or artificial latch.
            for _ in range(4):page.wait_for_timeout(95)
            snap=page.evaluate(PROBE+'.dump()')
            meta['precondition']=evaluate_precondition(snap)
            page.evaluate('(v)=>window.__BLOB_D11C_PROBE__.mark(v)',
                'd11o_precondition_met' if meta['precondition']['valid'] else 'd11o_precondition_failed')
            if meta['precondition']['valid']:
                meta['releaseAttempted']=True
                action(page,meta,'away_vertical',RELEASES[release],1.15)
                action(page,meta,'post_away',(),1.30)
            else:action(page,meta,'precondition_abort_neutral',(),0.35)
        else:
            for label,key,secs in control_route(profile):
                action(page,meta,label,() if key is None else (key,),secs)
            meta['precondition']={'valid':None,'reason':'control_no_attached_only_release_precondition'}
        page.screenshot(path=str(folder/'end.png'))
        trace=page.evaluate(PROBE+'.dump()');save(folder/'D11C_TRACE.json',trace)
        if not trace.get('samples') or any('continuity' not in s for s in trace['samples']):
            raise RuntimeError('D11F geometry trace missing')
        if not (trace.get('firstFoothold') or {}).get('samples'):raise RuntimeError('D11H trace missing')
        owner=trace.get('firstFootholdEvents') or {}
        if not owner.get('events') or owner.get('droppedEvents'):raise RuntimeError('D11I events missing or dropped')
        gate=trace.get('releaseGate') or {}
        if not gate.get('frames') or gate.get('droppedFrames'):raise RuntimeError('D11L gate frames missing or dropped')
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(450)
        with page.expect_download(timeout=20000) as dl:page.keyboard.press('Alt+Shift+E')
        dl.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text('utf-8'))
        meta['rec1']={'events':len(rec.get('events') or []),
            'droppedDetails':((rec.get('summary') or {}).get('captureRetention') or {}).get('droppedDetails')}
        if not meta['rec1']['events'] or meta['rec1']['droppedDetails'] not in (None,0):
            raise RuntimeError('REC1 detail missing')
        meta['sampleCount']=len(trace['samples']);meta['ownerEventCount']=len(owner['events'])
        meta['releaseOwnerFrameCount']=len(gate['frames']);meta['status']='CAPTURED'
    except Exception as exc:
        errors.append(f'{type(exc).__name__}: {exc}')
        try:
            if page.evaluate('Boolean(window.__BLOB_D11C_PROBE__)'):
                save(folder/'D11C_TRACE_PARTIAL.json',page.evaluate(PROBE+'.dump()'))
            page.screenshot(path=str(folder/'error.png'))
        except Exception:pass
    finally:
        meta['finishedAt']=utc();meta['wallSeconds']=round(time.monotonic()-t0,2)
        save(folder/'RUN.json',meta)
        try:ctx.close()
        except Exception:pass
    return {'folder':folder.name,'round':rnd,'profile':profile,'context':context,'release':release,
        'status':meta['status'],'precondition':(meta.get('precondition') or {}).get('valid'),
        'releaseAttempted':meta['releaseAttempted'],'events':(meta.get('rec1') or {}).get('events',0),'errors':errors}

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome');p.add_argument('--headed',action='store_true')
    p.add_argument('--rounds',type=int,default=2);p.add_argument('--seconds',type=int,default=75)
    p.add_argument('--output',default='BOT1D11O_RESULTS');a=p.parse_args(argv)
    if not 1<=a.rounds<=5:p.error('--rounds 1..5')
    if not 30<=a.seconds<=180:p.error('--seconds 30..180')
    root=pathlib.Path(a.output).resolve()
    if root.exists() and any(root.iterdir()):p.error('Output must be new or empty')
    root.mkdir(parents=True,exist_ok=True)
    plan=schedule(a.rounds);rows=[]
    with sync_playwright() as pw:
        opts={'headless':not a.headed,'args':['--disable-dev-shm-usage']}
        if a.browser_channel:opts['channel']=a.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            opts['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**opts)
        try:
            for i,(rnd,p,c,r) in enumerate(plan,1):
                row=run_one(browser,a,i,rnd,p,c,r);rows.append(row)
                print(f"[D11O] {i}/{len(plan)} {p}/{c}/{r} {row['status']} pre={row['precondition']} release={row['releaseAttempted']} REC1={row['events']} errors={len(row['errors'])}",flush=True)
        finally:browser.close()
    save(root/'BOT1D11O_RUN_INDEX.json',{'revision':REVISION,'createdAt':utc(),'rounds':a.rounds,
        'schedule':plan,'runs':rows,'gameplayChanged':False,'ownerDataUsedForSteering':False,
        'releaseInputsPredeclared':True,'controlsIncluded':True,'controlledDebugStart':True,
        'preconditionOnlyGatesTestability':True})
    return 0 if all(r['status']=='CAPTURED' and not r['errors'] for r in rows) else 2
if __name__=='__main__':raise SystemExit(main())
