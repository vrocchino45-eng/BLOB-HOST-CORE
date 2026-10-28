#!/usr/bin/env python3
"""BOT1-D: Follow the Watching Fold using only visible HUD + regular controls.

No game/owner reads in the input policy, no locations, no scene-derived IDs,
no teleport, no owner writes. REC1 is captured AFTER actions for independent grading.
A failure to find a target proves only this simple HUD-guided agent failed.
"""
from __future__ import annotations
import argparse, datetime, json, pathlib, shutil, sys, time
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit('Playwright missing: py -m pip install playwright')


def utc():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds')


def write(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding='utf-8')


def visible_hud(page):
    # This is the in-game HUD text visible to a player, not a frameState or owner API.
    try:
        el = page.locator('#playtest-hud-panel')
        if not el.is_visible(timeout=800):
            return ''
        return ' '.join(el.inner_text(timeout=1000).split())[:1400]
    except Exception:
        return ''


def objective_hint(hud):
    """Use HUD prose alone. An invitation is NOT necessarily Fold completion."""
    s = hud.lower()
    if any(x in s for x in ('follow the watcher', 'follow the opening membrane',
                             'move through the changed passage', 'approach the listening fold')):
        return 'fold_invited'
    if 'listening fold' in s and any(x in s for x in ('sustain', 'resonance', 'release', 'observe', 'approach')):
        return 'fold_instruction'
    if any(x in s for x in ('pulse the moving matter', 'pulse the next packet', 'read what the moving matter')):
        return 'nursery_packet'
    if any(x in s for x in ('learned interaction', 'lesson complete', 'language learned')):
        return 'possible_fold_completed'
    return 'unknown'


def choose_action(phase, hud, attempt):
    """Fixed reproducible behavior. No raw positions or invisible owner state."""
    low = hud.lower()
    if phase == 'nursery':
        slot = attempt % 5
        if slot in (0, 2, 4):
            return 'pulse', None, 0.55
        if slot == 1:
            return 'scan', None, 0.6
        return 'move', ['w', 'a', 'd', 's'][(attempt // 5) % 4], 0.53
    # Fold phase. Try to respond to the visible interaction vocabulary; when the
    # HUD gives only narrative direction, search with ordinary movement and probe.
    if any(s in low for s in ('release and settle', 'release to settle', 'let go to settle', 'release a', 'release q')):
        return 'release', None, 1.15
    if any(s in low for s in ('hold', 'sustain', 'stabilize the resonance')) and 'controls' not in low[:100]:
        return 'hold', 'q', 1.7
    if any(s in low for s in ('pulse the fold', 'pulse to observe', 'observe the first answer')):
        return 'pulse', None, 0.65
    slot = attempt % 9
    if slot in (0, 1, 3, 5, 7):
        return 'move', ['w', 'd', 'w', 'a', 's'][(attempt // 9 + (0 if slot == 0 else slot // 2)) % 5], 0.95
    if slot == 2:
        return 'scan', None, 0.65
    if slot == 4:
        return 'pulse', None, 0.5
    if slot == 6:
        return 'hold', 'q', 1.55
    return 'observe', None, 1.0


def run_one(browser, args, seed):
    tag = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder = pathlib.Path(args.output).resolve()/f'BOT1D_{tag}_fold_reader_s{seed}'
    folder.mkdir(parents=True, exist_ok=True)
    ctx = browser.new_context(viewport={'width':1280, 'height':720}, accept_downloads=True, reduced_motion='reduce')
    page = ctx.new_page()
    errors=[]
    page.on('pageerror', lambda e: errors.append(str(e)[:600]))
    run = {'revision':'BOT1-D', 'evidenceKind':'REAL_GAME_BROWSER', 'botPerception':'visible HUD text ONLY',
           'groundTruth':'REC1 independent owner snapshots AFTER input', 'seed':seed,
           'start':utc(), 'status':'ERROR', 'actions':[], 'percepts':[], 'errors':errors,
           'guardrails':{'gameOwnerReadsForDecisions':False, 'worldCoordinates':False,
                         'teleports':False, 'targetIds':False, 'gameStateWrites':False}}
    started=time.monotonic()
    phase='nursery'; phase_attempts=0; last_hud=''; last_screenshot=0
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=30000)
        page.wait_for_function('() => typeof window.BLOB_TELEMETRY?.getSession === "function"',timeout=30000)
        page.keyboard.press('Shift')
        page.screenshot(path=str(folder/'start.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(300)
        notice=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in notice: raise RuntimeError(f'REC1 did not start: {notice}')
        deadline=time.monotonic()+args.seconds
        step=0
        while time.monotonic()<deadline:
            hud=visible_hud(page)
            hint=objective_hint(hud)
            if hud!=last_hud:
                run['percepts'].append({'at':utc(),'phase':phase,'hud':hud,'hint':hint})
                last_hud=hud
            # Invitation is recognized ONLY from visible in-game objective text.
            if phase=='nursery' and hint in ('fold_invited','fold_instruction','possible_fold_completed'):
                phase='fold';phase_attempts=0
                run['actions'].append({'at':utc(),'op':'visible_hud_phase_change','newPhase':phase,'hint':hint})
                page.screenshot(path=str(folder/'invitation.png'))
            if phase=='fold' and hint=='possible_fold_completed':
                # Don't call it complete; actual owner proof comes from REC1.
                page.wait_for_timeout(500)
            op,key,duration=choose_action(phase,hud,phase_attempts)
            entry={'at':utc(),'step':step,'phase':phase,'visibleObjectiveHint':hint,
                   'op':op,'key':key,'seconds':duration,'hudExcerpt':hud[:260]}
            if op=='pulse':
                page.keyboard.press('x');page.wait_for_timeout(int(duration*1000))
            elif op=='scan':
                x=610 + ((phase_attempts*31+seed)%5-2)*43
                y=320 + ((phase_attempts*17+seed)%5-2)*25
                page.mouse.move(x,y,steps=6);page.wait_for_timeout(int(duration*1000))
            elif op in ('move','hold'):
                page.keyboard.down(key)
                page.wait_for_timeout(int(duration*1000))
                page.keyboard.up(key)
                page.wait_for_timeout(120)
            else:
                page.wait_for_timeout(int(duration*1000))
            entry['done']=utc();run['actions'].append(entry)
            phase_attempts += 1;step += 1
            elapsed=time.monotonic()-started
            if elapsed-last_screenshot>=30:
                last_screenshot=elapsed
                page.screenshot(path=str(folder/f'progress_{int(elapsed):03d}s.png'))
            if step>450:break
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(280)
        with page.expect_download(timeout=15000) as d:
            page.keyboard.press('Alt+Shift+E')
        d.value.save_as(str(folder/'REC1.json'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf-8'))
        run['rec1']={'durationSeconds':rec.get('captureDurationSeconds'),
                     'retainedEvents':len(rec.get('events',[])),
                     'eventCounts':rec.get('summary',{}).get('eventCounts',{}),
                     'captureRetention':rec.get('summary',{}).get('captureRetention',{})}
        run['status']='CAPTURED' if len(rec.get('events',[])) else 'AMBIGUOUS'
        page.screenshot(path=str(folder/'end.png'))
    except Exception as exc:
        errors.append(f'{type(exc).__name__}: {exc}')
        try: page.screenshot(path=str(folder/'error.png'))
        except Exception:pass
    finally:
        run['end']=utc();run['wallSeconds']=round(time.monotonic()-started,2)
        run['reachedFoldPhaseViaVisibleHUD']=any(x.get('op')=='visible_hud_phase_change' for x in run['actions'])
        write(folder/'RUN.json',run)
        ctx.close()
    return {'folder':folder.name,'status':run['status'], 'retainedEvents':run.get('rec1',{}).get('retainedEvents',0),
            'visibleInvitation':run['reachedFoldPhaseViaVisibleHUD'],'errors':errors}


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--url',default='http://127.0.0.1:5173')
    ap.add_argument('--browser-channel',default='chrome')
    ap.add_argument('--headed',action='store_true')
    ap.add_argument('--seconds',type=int,default=110)
    ap.add_argument('--seed',type=int,default=11)
    ap.add_argument('--output',default='BOT1D_RESULTS')
    args=ap.parse_args()
    if not 35<=args.seconds<=240:ap.error('seconds must be 35..240')
    out=pathlib.Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel:kw['channel']=args.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try: result=run_one(browser,args,args.seed)
        finally:browser.close()
    write(out/'BOT1D_RUN_INDEX.json',{'revision':'BOT1-D','run':result,'createdAt':utc()})
    print('BOT1-D',result['status'],result['retainedEvents'],'REC1 events',flush=True)
    print('Visible invitation:',result['visibleInvitation'],flush=True)
    print('Wrote',out/'BOT1D_RUN_INDEX.json',flush=True)
    return 0 if result['status']=='CAPTURED' else 2


if __name__=='__main__':raise SystemExit(main())
