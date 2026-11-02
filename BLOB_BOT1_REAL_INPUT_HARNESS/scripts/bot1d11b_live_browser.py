#!/usr/bin/env python3
"""D11B targeted Silt/HC contact trials; live steering uses no internal owner truth."""
from __future__ import annotations
import argparse, datetime, json, pathlib, shutil, sys, time
from bot1d3_browser import hud_text, save, utc
from bot1d11b_live_policy import REVISION, PROFILES, course, intended_cell, entry_key, contract
try: from playwright.sync_api import sync_playwright
except ImportError: sys.exit('Playwright required: py -m pip install playwright')

def run_one(browser,args,seq,profile):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=pathlib.Path(args.output).resolve()/f'BOT1D11B_{stamp}_{seq:02d}_{profile}'
    folder.mkdir(parents=True,exist_ok=False)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page(); errors=[]; started=time.monotonic()
    data={'revision':REVISION,'profile':profile,'status':'ERROR','startedAt':utc(),
          'mode':'TEST_ONLY_LIVE_ATTACHMENT_PROOF','requestedCell':intended_cell(profile),
          'debugEntry':entry_key(profile),'liveOwnerSteering':False,
          'worldSeedSet':False,'gameplayChanges':False,'actions':[],'visibleHud':[],
          'errors':errors,'evidenceAuthority':'OFFLINE_REC1_ONLY'}
    page.on('pageerror',lambda ex:errors.append('pageerror: '+str(ex)[:350]))
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(350)
        recstatus=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in recstatus:raise RuntimeError('REC1 not started: '+recstatus[:160])
        data['recordingStartedAt']=utc()
        data['visibleHud'].append({'at':utc(),'label':'initial','text':hud_text(page)[:500]})
        page.keyboard.press(entry_key(profile));page.wait_for_timeout(1050)
        data['debugEntrySettledAt']=utc()
        data['visibleHud'].append({'at':utc(),'label':'after_entry','text':hud_text(page)[:500]})
        page.screenshot(path=str(folder/'after_entry.png'))
        for label,key,seconds in course(profile):
            if time.monotonic()-started+seconds+12>args.seconds:
                raise RuntimeError('Time budget exceeded before completing course')
            action={'label':label,'key':key,'plannedSeconds':seconds,'startedAt':utc()}
            data['actions'].append(action)
            if key:
                page.keyboard.down(key)
                try:page.wait_for_timeout(round(seconds*1000))
                finally:page.keyboard.up(key)
            else:page.wait_for_timeout(round(seconds*1000))
            action['endedAt']=utc()
            if key is None:
                data['visibleHud'].append({'at':utc(),'label':label,'text':hud_text(page)[:500]})
            if label.endswith('settle') or label.endswith('neutral'):
                page.screenshot(path=str(folder/(label+'.png')))
        page.screenshot(path=str(folder/'end.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(450)
        with page.expect_download(timeout=20000) as dl:page.keyboard.press('Alt+Shift+E')
        dl.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf-8'))
        data['rec1']={'events':len(rec.get('events',[])),
            'droppedDetails':((rec.get('summary') or {}).get('captureRetention') or {}).get('droppedDetails')}
        data['status']='CAPTURED' if rec.get('events') else 'EMPTY'
    except Exception as ex:
        errors.append(f'{type(ex).__name__}: {ex}')
        try:page.screenshot(path=str(folder/'error.png'))
        except Exception:pass
    finally:
        data['finishedAt']=utc();data['wallSeconds']=round(time.monotonic()-started,2)
        save(folder/'RUN.json',data)
        try:ctx.close()
        except Exception:pass
    return {'folder':folder.name,'profile':profile,'status':data['status'],
            'events':data.get('rec1',{}).get('events',0),'errors':errors}

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--profiles',default=','.join(PROFILES))
    p.add_argument('--seconds',type=int,default=75)
    p.add_argument('--output',default='BOT1D11B_LIVE_RESULTS')
    args=p.parse_args(argv)
    profiles=[s.strip() for s in args.profiles.split(',')]
    if not profiles or len(set(profiles))!=len(profiles) or any(x not in PROFILES for x in profiles):
        p.error('Choose unique profiles from '+','.join(PROFILES))
    if not 40<=args.seconds<=180:p.error('--seconds must be 40..180')
    root=pathlib.Path(args.output).resolve()
    if root.exists() and any(root.iterdir()):p.error('Choose a new empty output folder')
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
                print(f"[D11B] {profile}: {row['status']} / REC1={row['events']} / errors={len(row['errors'])}",flush=True)
        finally:browser.close()
    save(root/'BOT1D11B_RUN_INDEX.json',{'revision':REVISION,'createdAt':utc(),'requestedProfiles':profiles,
        'testKind':'DIAGNOSTIC_NOT_CERTIFICATION','noGameplayChanges':True,
        'noOwnerStateUsedOnline':True,'contract':contract(),'runs':rows})
    print('[D11B] Wrote',root/'BOT1D11B_RUN_INDEX.json',flush=True)
    return 0 if all(r['status']=='CAPTURED' and not r['errors'] for r in rows) else 2
if __name__=='__main__':raise SystemExit(main())
