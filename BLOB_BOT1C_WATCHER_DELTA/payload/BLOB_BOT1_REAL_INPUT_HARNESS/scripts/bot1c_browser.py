#!/usr/bin/env python3
"""BOT1-C Surface Wake witness study: real input only, objectives observed through HUD.

Four fresh browser contexts, four bounded scenarios. No page.evaluate writes, no
coordinates/teleporting/hidden target IDs in bot policy. REC1 owner witness is
post-test referee evidence only.
"""
from __future__ import annotations
import argparse, datetime, json, pathlib, shutil, sys, time
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit('Playwright missing; run py -m pip install playwright')

CASES=('no_input','stationary_pulse','scan_pulse','absorb_control')

def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds')
def write(path, payload):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')

def hud_text(page):
    try: return ' '.join(page.locator('#playtest-hud-panel').inner_text(timeout=1500).split())[:1200]
    except Exception: return ''

def run_case(browser, case, args, tag):
    dest=pathlib.Path(args.output).resolve()/f'BOT1C_{tag}_{case}'
    dest.mkdir(parents=True,exist_ok=True)
    ctx=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=ctx.new_page(); errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)[:800]))
    run={'revision':'BOT1-C','case':case,'evidenceKind':'REAL_GAME_BROWSER','startedAt':utc(),
         'ownerIsNotBotPerception':True,'botsUse':'visible HUD + deterministic keystrokes and view motions',
         'noCheatsOrGameOwnerWrites':True,'actions':[],'percepts':[],'errors':errors,'status':'ERROR'}
    started=time.monotonic()
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=30000)
        page.wait_for_function('() => typeof window.BLOB_TELEMETRY?.getSession === "function"',timeout=30000)
        page.keyboard.press('Shift') # Focus input as in BOT1-B; no navigation or objective hint
        page.screenshot(path=str(dest/'start.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(280)
        notice=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in notice:raise RuntimeError(f'REC1 start not verified: {notice}')
        deadline=time.monotonic()+args.seconds
        i=0
        while time.monotonic()<deadline:
            hud=hud_text(page)
            if not run['percepts'] or hud!=run['percepts'][-1]['hud']:
                run['percepts'].append({'time':utc(),'hud':hud})
            a={'time':utc(),'index':i,'case':case,'hud':hud[:180]}
            if case=='no_input':
                a['op']='observe';page.wait_for_timeout(650)
            elif case=='stationary_pulse':
                a['op']='pulse_key';page.keyboard.press('x');page.wait_for_timeout(1100)
            elif case=='absorb_control':
                a['op']='absorb_control';page.mouse.down(button='right');page.wait_for_timeout(350);page.mouse.up(button='right');page.wait_for_timeout(850)
            else:
                # Small deterministic viewpoint/movement probing, no hidden target knowledge.
                phase=i%5
                if phase in (0,2,4):
                    a['op']='pulse_key';page.keyboard.press('x');page.wait_for_timeout(500)
                elif phase==1:
                    a['op']='view_scan';page.mouse.move(570+(i%3)*65, 325+((i%4)-2)*25, steps=5);page.wait_for_timeout(500)
                else:
                    a['op']='small_world_move';key=['w','a','d','s'][i//5%4];a['key']=key
                    page.keyboard.down(key);page.wait_for_timeout(430);page.keyboard.up(key);page.wait_for_timeout(160)
            a['finishedAt']=utc();run['actions'].append(a)
            if i==3:page.screenshot(path=str(dest/'early.png'))
            i+=1
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(250)
        with page.expect_download(timeout=15000) as dl:
            page.keyboard.press('Alt+Shift+E')
        dl.value.save_as(str(dest/'REC1.json'))
        rec=json.loads((dest/'REC1.json').read_text(encoding='utf-8'))
        run['rec1']={'captureDurationSeconds':rec.get('captureDurationSeconds'),
            'retainedDetails':len(rec.get('events',[])),
            'eventCounts':rec.get('summary',{}).get('eventCounts',{}),
            'captureRetention':rec.get('summary',{}).get('captureRetention',{})}
        run['status']='CAPTURED' if rec.get('events') else 'AMBIGUOUS'
        page.screenshot(path=str(dest/'end.png'))
    except Exception as err:
        run['errors'].append(f'{type(err).__name__}: {err}')
        try:page.screenshot(path=str(dest/'error.png'))
        except Exception:pass
    finally:
        run['endedAt']=utc();run['wallSeconds']=round(time.monotonic()-started,2)
        write(dest/'RUN.json',run)
        ctx.close()
    return {'case':case,'status':run['status'],'rec1Events':run.get('rec1',{}).get('retainedDetails',0),
            'folder':dest.name,'errors':run['errors']}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--output',default='BOT1C_RESULTS')
    p.add_argument('--seconds',type=float,default=16.0)
    p.add_argument('--cases',default=','.join(CASES))
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    args=p.parse_args()
    cases=[x.strip() for x in args.cases.split(',') if x.strip()]
    if not cases or any(x not in CASES for x in cases) or args.seconds<6 or args.seconds>90:p.error('Use known cases and seconds between 6 and 90')
    tag=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    output=pathlib.Path(args.output).resolve();output.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        launch={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel: launch['channel']=args.browser_channel
        elif not pathlib.Path(p.chromium.executable_path).exists() and shutil.which('chromium'):launch['executable_path']=shutil.which('chromium')
        browser=p.chromium.launch(**launch)
        try:
            results=[]
            for c in cases:
                print('BOT1-C running',c,flush=True)
                r=run_case(browser,c,args,tag);results.append(r)
                print(r['status'],r['rec1Events'],'REC1 events',flush=True)
        finally:browser.close()
    write(output/'BOT1C_RUN_INDEX.json',{'revision':'BOT1-C','createdAt':utc(),'kind':'REAL_GAME_BROWSER',
          'cases':results,'note':'Only REC1 owner result establishes Watcher packet Pulse acceptance.'})
    print('Wrote',output/'BOT1C_RUN_INDEX.json',flush=True)
    return 0 if all(x['status']=='CAPTURED' for x in results) else 2
if __name__=='__main__':raise SystemExit(main())
