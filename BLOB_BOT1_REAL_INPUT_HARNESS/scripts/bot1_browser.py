#!/usr/bin/env python3
"""BLOB BOT1: actual browser keyboard/mouse input, HUD-only decisions, read-only refereeing.

Does not alter gameplay owner state, inject coordinates, target IDs or grant progress.
Require a locally running BLOB Vite build with REC1 and BLOB_TELEMETRY.
"""
from __future__ import annotations
import argparse, datetime, json, pathlib, random, re, shutil, sys, time

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit('Python Playwright is required: py -m pip install playwright')

PROFILES = ('explorer', 'reader', 'stress')
MOVE_KEYS = ('w', 'a', 's', 'd', 'c', 'z')


def utc():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds')


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')


def compact_text(text, n=850):
    return re.sub(r'\s+', ' ', str(text or '')).strip()[:n]


def get_percept(page):
    """Only HUD text is available to the agent; debug telemetry is referee-only."""
    try:
        return compact_text(page.locator('#playtest-hud-panel').inner_text(timeout=1000))
    except Exception:
        return ''


def get_referee(page):
    """Read-only API; never expose response to bot movement policy."""
    try:
        return page.evaluate('''() => {
            const api = window.BLOB_TELEMETRY;
            if (!api || typeof api.getSession !== 'function') return {available:false};
            const s = api.getSession();
            const m = s.movementSamples?.at(-1) ?? null;
            const e = s.events?.at(-1) ?? null;
            return {available:true, buildId:s.session?.buildId??null,
              movementCount:s.movementSamples?.length??0,
              lastMovement:m, eventCount:s.events?.length??0,
              lastEvent:e ? {type:e.type,time:e.time??e.ts??null} : null};
        }''')
    except Exception as exc:
        return {'available': False, 'readError': str(exc)[:200]}


def log_action(actions, tick, op, **kwargs):
    actions.append({'tick': tick, 'time': utc(), 'op': op, **kwargs})


def choose_plan(profile, rnd, tick, hud):
    """Select human-bound controls from visible HUD + fixed-seed policy; NO world truth.

    Reader is HUD-responsive only; without scene pixels this is not vision-guided navigation.
    """
    hud_l = hud.lower()
    if profile == 'explorer':
        # Early focus/observe, periodic wandering and reorientation.
        if tick % 13 == 0: return [('key', 'f', .12)]
        if tick % 17 == 7: return [('key', 'e', .12)]
        if tick % 11 == 5: return [('key', 'x', .12)]
        return [('move', rnd.choice(['w','w','w','a','d','c','z','s']), rnd.choice([.65, .8, 1.05]))]
    if profile == 'reader':
        if tick % 7 == 0: return [('key', 'f', .12)]
        if tick % 9 == 3: return [('key', 'e', .12)]
        if tick % 4 == 1:
            if 'stabiliz' in hud_l or 'brace' in hud_l or 'hold' in hud_l:
                return [('holdkey', 'q', .55)]
            if 'absorb' in hud_l or 'draw' in hud_l or 'pull' in hud_l:
                return [('right', None, .55)]
            return [('key', 'x', .11)]
        if 'return' in hud_l or 'back' in hud_l:
            move = rnd.choice(['s', 'a', 'd'])
        elif 'above' in hud_l or 'rise' in hud_l:
            move = 'c'
        elif 'below' in hud_l or 'descend' in hud_l:
            move = 'z'
        else:
            move = rnd.choice(['w','w','a','d','c','z'])
        return [('move', move, rnd.choice([.65, 1.0]))]
    # Stress behavior uses canonical real-input chords, no debug jumps.
    if tick % 7 == 0: return [('key', 'e', .11)]
    if tick % 6 == 0: return [('chord', 'qx', .4)]
    if tick % 6 == 1: return [('chord', 'qright', .48)]
    if tick % 6 == 2: return [('chord', 'qrightx', .48)]
    if tick % 6 == 3: return [('key', 'x', .09)]
    return [('move', rnd.choice(['w','s','a','d','c','z']), .7)]


def perform(page, task):
    op, key, seconds = task
    if op == 'move' or op == 'holdkey':
        page.keyboard.down(key)
        page.wait_for_timeout(round(seconds*1000))
        page.keyboard.up(key)
    elif op == 'key':
        page.keyboard.press(key)
        page.wait_for_timeout(round(seconds*1000))
    elif op == 'right':
        page.mouse.down(button='right')
        page.wait_for_timeout(round(seconds*1000))
        page.mouse.up(button='right')
    elif op == 'chord':
        try:
            page.keyboard.down('q')
            if 'right' in key: page.mouse.down(button='right')
            if 'x' in key: page.keyboard.press('x')
            page.wait_for_timeout(round(seconds*1000))
        finally:
            if 'right' in key: page.mouse.up(button='right')
            page.keyboard.up('q')


def run_one(browser, args, profile, seed, duration, label):
    run_id = f'BOT1_{args.session_tag}_{label}_{profile}_s{seed}'
    run_dir = pathlib.Path(args.output).resolve() / run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    context = browser.new_context(viewport={'width': args.width, 'height': args.height}, accept_downloads=True, reduced_motion='reduce')
    page = context.new_page()
    console_errors=[]
    page.on('pageerror',lambda err: console_errors.append(str(err)[:1000]))
    result={'runId':run_id,'profile':profile,'seed':seed,'url':args.url,
      'requestedDurationSeconds':duration, 'startedAt':utc(),
      'automatedAgentPerception':'HUD text only; no computer vision, no raw position/target IDs',
      'evidenceKind':'FIXTURE' if args.fixture_html else 'REAL_GAME_BROWSER',
      'controlPath':'Playwright browser keyboard/mouse events -> existing InputSystem',
      'cheatsOrWorldWrites':False,'status':'UNEXERCISED', 'actions':[], 'percepts':[],
      'referee':[], 'errors':console_errors}
    started = time.monotonic()
    record_started=False
    try:
        if args.fixture_html:
            page.set_content(pathlib.Path(args.fixture_html).read_text(encoding='utf-8'))
        else:
            page.goto(args.url, wait_until='domcontentloaded', timeout=args.navigation_timeout_ms)
        page.wait_for_selector('#playtest-hud-panel', timeout=args.navigation_timeout_ms)
        page.wait_for_function("() => typeof window.BLOB_TELEMETRY?.getSession === 'function'",timeout=args.navigation_timeout_ms)
        # Browser focus and one intentional input also unlocks audio in the actual game.
        page.keyboard.press('Shift')
        page.screenshot(path=str(run_dir/'start.png'))
        page.keyboard.press('Alt+Shift+R')
        page.wait_for_timeout(220)
        status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in status: raise RuntimeError(f'REC1 did not indicate recording: {status[:120]}')
        record_started=True
        result['status']='RUNNING'
        rng=random.Random(seed)
        tick=0; mark=set()
        deadline=time.monotonic()+duration
        while time.monotonic()<deadline:
            hud=get_percept(page)
            if not result['percepts'] or hud!=result['percepts'][-1]['hud']:
                result['percepts'].append({'tick':tick,'time':utc(),'hud':hud})
            tasks=choose_plan(profile,rng,tick,hud)
            for task in tasks:
                log_action(result['actions'],tick,task[0],value=task[1],holdSeconds=task[2]);perform(page,task)
            if tick%4==0:
                result['referee'].append({'tick':tick,'time':utc(),'state':get_referee(page)})
            fraction=(time.monotonic()-(deadline-duration))/duration
            for at, name in ((.33,'early'),(.66,'middle')):
                if fraction>=at and name not in mark:
                    page.screenshot(path=str(run_dir/f'{name}.png'))
                    mark.add(name)
            tick+=1
        page.keyboard.press('Alt+Shift+R')
        page.wait_for_timeout(190)
        rec_notice=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=1500)
        result['recorderStatusAfterStop']=rec_notice[:200]
        with page.expect_download(timeout=15000) as download_info:
            page.keyboard.press('Alt+Shift+E')
        download=download_info.value
        destination=run_dir/'REC1.json'
        download.save_as(str(destination))
        data=json.loads(destination.read_text(encoding='utf-8'))
        result['rec1']={'downloadFilename':download.suggested_filename,
          'captureDurationSeconds':data.get('captureDurationSeconds'),
          'events':len(data.get('events',[])),
          'retention':data.get('summary',{}).get('captureRetention',{}),
          'eventCounts':data.get('summary',{}).get('eventCounts',{})}
        result['status']=('FIXTURE_CAPTURED' if args.fixture_html else 'CAPTURED') if result['rec1']['events']>0 else 'AMBIGUOUS'
        page.screenshot(path=str(run_dir/'end.png'))
    except Exception as exc:
        result['status']='ERROR';result['errors'].append(f'{type(exc).__name__}: {exc}')
        try: page.screenshot(path=str(run_dir/'error.png'))
        except Exception:pass
    finally:
        result['endedAt']=utc();result['actualWallSeconds']=round(time.monotonic()-started,2)
        save_json(run_dir/'RUN.json',result)
        context.close()
    return result


def parse_args():
    p=argparse.ArgumentParser(description='BLOB BOT1: real browser input tests, no owner-state writes')
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--output',default='BOT1_RESULTS')
    p.add_argument('--profiles',default='explorer,reader,stress')
    p.add_argument('--seeds',default='11,23,47')
    p.add_argument('--duration',type=float,default=90.)
    p.add_argument('--route-duration',type=float,default=0.,help='Optional extra exploratory route attempt in seconds; 0=off')
    p.add_argument('--browser-channel',default='',help='e.g. chrome or msedge; blank uses Playwright bundled Chromium')
    p.add_argument('--fixture-html',default='',help='TEST ONLY: synthetic HTML, not the BLOB game; marks output FIXTURE_CAPTURED')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--width',type=int,default=1280);p.add_argument('--height',type=int,default=720)
    p.add_argument('--navigation-timeout-ms',type=int,default=35000)
    args=p.parse_args()
    args.profiles=[x.strip() for x in args.profiles.split(',') if x.strip()]
    args.seeds=[int(x.strip()) for x in args.seeds.split(',') if x.strip()]
    if not args.profiles or not args.seeds or any(x not in PROFILES for x in args.profiles):p.error('profiles must be explorer,reader,stress; seeds must not be empty')
    if args.duration<=0 or args.route_duration<0:p.error('duration must be > 0 and route-duration >= 0')
    if args.duration>900 or args.route_duration>1500:p.error('BOT1 individual capture must be <=15 minutes; route <=25 minutes')
    return args


def main():
    args=parse_args();args.session_tag=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ');out=pathlib.Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
    runs=[]
    with sync_playwright() as p:
        launch_args={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel:
            launch_args['channel']=args.browser_channel
        elif not pathlib.Path(p.chromium.executable_path).exists() and shutil.which('chromium'):
            # Reuse a system Chromium if Playwright's separate headless shell is absent.
            launch_args['executable_path']=shutil.which('chromium')
        browser=p.chromium.launch(**launch_args)
        try:
            for profile in args.profiles:
                for seed in args.seeds:
                    print(f'Running {profile}, seed={seed}, duration={args.duration}s',flush=True)
                    r=run_one(browser,args,profile,seed,args.duration,'first_slice');runs.append(r)
                    print(f"  {r['status']} / {r.get('rec1',{}).get('events',0)} REC1 events",flush=True)
            if args.route_duration:
                print(f'Running route attempt {args.route_duration}s',flush=True)
                r=run_one(browser,args,'reader',args.seeds[0],args.route_duration,'route_attempt');runs.append(r)
        finally:browser.close()
    summary={'generatedAt':utc(),'resultType':'browser controller exercise, NOT computer-vision proof',
      'url':args.url,'sessionTag':args.session_tag,'evidenceKind':'FIXTURE' if args.fixture_html else 'REAL_GAME_BROWSER',
      'inputProfiles':args.profiles,'seeds':args.seeds,
      'runs':[{'runId':x['runId'],'status':x['status'],'events':x.get('rec1',{}).get('events',0),
              'elapsed':x['actualWallSeconds'],'errors':x['errors'][:3]} for x in runs]}
    save_json(out/'BOT1_RUN_INDEX.json',summary)
    print(f'\nWrote {out}/BOT1_RUN_INDEX.json',flush=True)
    return 0 if all(x['status'] in ('CAPTURED','FIXTURE_CAPTURED') for x in runs) else 2


if __name__=='__main__':sys.exit(main())
