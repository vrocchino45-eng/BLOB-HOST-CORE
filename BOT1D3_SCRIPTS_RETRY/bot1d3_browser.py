#!/usr/bin/env python3
"""BOT1-D3: ordinary-input perception/acquisition trial, GUIDE0-W witness retained.

This test deliberately cannot access raw coordinates, owner target IDs, packet class,
packet distance or internal state in its action policy. REC1 is referee-only.
"""
from __future__ import annotations
import argparse, datetime, json, pathlib, shutil, time, sys
from bot1d3_motion import motion_observation, cue_to_camera_key
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit('Playwright required: py -m pip install playwright')


def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds')
def save(path,obj):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(obj,indent=2,ensure_ascii=False),encoding='utf-8')

def hud_text(page):
    try: return ' '.join(page.locator('#playtest-hud-panel').inner_text(timeout=1100).split())[:1600]
    except Exception:return ''

def interpret(hud):
    low = hud.lower()
    # Order important: actual visible instruction before incidental legend text.
    if any(s in low for s in ('follow the watcher', 'approach the listening fold',
                    'follow the opening membrane', 'move through the changed passage')):
        return 'fold_invitation'
    if 'listening fold' in low and any(s in low for s in ('sustain', 'resonance','release','observe')):
        return 'fold_instruction'
    if 'pulse the moving matter' in low or 'pulse the next packet' in low or 'read what the moving matter' in low:
        return 'packet_instruction'
    if 'watch the current mouth' in low or 'observe the next matter cycle' in low:
        return 'wait_for_packet'
    return 'unknown'

def press_hold(page,key,sec):
    page.keyboard.down(key)
    page.wait_for_timeout(int(sec*1000))
    page.keyboard.up(key)

def act(page,op,key,seconds):
    if op in ('move','look','hold'):press_hold(page,key,seconds)
    elif op=='pulse':page.keyboard.press('x');page.wait_for_timeout(int(seconds*1000))
    else:page.wait_for_timeout(int(seconds*1000))

def action_for_step(profile, step, hint, cue, seed, fold):
    # Cycle through every heading, not a 0.5-second sidestep near the start.
    # Camera keys are from the published IJKL legend; ordinary WASD remains movement.
    if fold:
        if hint=='fold_instruction':
            # Authored Fold requires approach → observe → hold → release.
            cycle=step%7
            return ([('pulse',None,.28),('hold','q',1.7),('observe',None,1.1),
              ('move','w',.82),('look','j',.50),('pulse',None,.28),('observe',None,.65)][cycle])
        cycle=step%5
        return [('move','w',1.0),('look','l',.50),('move','w',1.0),
                ('look','j',.28),('pulse',None,.30)][cycle]
    if profile=='idle':return 'observe',None,1.15
    if hint=='wait_for_packet':
        cycle=step%5
        return [('observe',None,.85),('move','w',.8),('look','l',.42),
                ('move','a',.66),('observe',None,.45)][cycle]
    if profile=='motion' and cue:
        # Unclassified pixel movement can suggest a camera adjustment, never a hit.
        cam=cue_to_camera_key(cue)
        if cam and step%5 in (0,1):return 'look',cam,.38
    # Same key trace independent of hidden packet outcomes and material class.
    cycle=step%10
    if cycle in (0,5,8):return 'pulse',None,.28
    if cycle in (1,6):return 'move','w',.85
    if cycle==2:return 'look','l',.54
    if cycle==3:return 'move','d',.77
    if cycle==4:return 'observe',None,.30
    if cycle==7:return 'look','j',.40
    if cycle==9:return 'move',['a','w','s'][seed%3],.74
    return 'observe',None,.40

def run_one(browser,args,profile,seed):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    directory=pathlib.Path(args.output).resolve()/f'BOT1D3_{stamp}_{profile}_s{seed}'
    directory.mkdir(parents=True,exist_ok=True)
    context=browser.new_context(viewport={'width':1280,'height':720},accept_downloads=True,reduced_motion='reduce')
    page=context.new_page();errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)[:500]))
    trace={'revision':'BOT1-D3','profile':profile,'seed':seed,'startedAt':utc(),
       'status':'ERROR','evidenceKind':'REAL_GAME_BROWSER',
       'policyInputs':['visible HUD text','rendered screenshot pixels','seed'],
       'forbiddenPolicyInputs':['owner packetDistance','packet class','target id','world coordinates',
                'gameplay frameState','REC1 outcomes before action'],
       'readOnlyGuideWitness':'GUIDE0-W preinstalled in gameplay recorder',
       'actions':[],'percepts':[],'errors':errors,
       'note':'Motion cue is unclassified and may be guide/ambient/other movement.'}
    phase='nursery';before='';last_frame=0;started=time.monotonic()
    try:
        page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_selector('#playtest-hud-panel',timeout=25000)
        page.wait_for_function('() => typeof window.BLOB_TELEMETRY?.getSession === "function"',timeout=25000)
        page.keyboard.press('Shift');page.screenshot(path=str(directory/'start.png'))
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(250)
        status=page.locator('[aria-label="BLOB observation recording status"]').inner_text(timeout=3000)
        if 'REC ' not in status:raise RuntimeError('Recorder not active: '+status[:100])
        step=0;deadline=time.monotonic()+args.seconds
        while time.monotonic()<deadline:
            hud=hud_text(page);hint=interpret(hud)
            if hud!=before:
                trace['percepts'].append({'time':utc(),'hint':hint,'hud':hud});before=hud
            if hint in ('fold_invitation','fold_instruction') and phase=='nursery':
                phase='fold';page.screenshot(path=str(directory/'fold_invitation.png'))
                trace['actions'].append({'time':utc(),'op':'visible_invitation','step':step})
            cue=None
            # Motion test only on stable frames: no movement/camera key between samples.
            if profile=='motion' and step%3==0 and phase=='nursery':
                a=page.screenshot()
                page.wait_for_timeout(240)
                b=page.screenshot()
                cue=motion_observation(a,b)
            op,key,duration=action_for_step(profile,step,hint,cue,seed,phase=='fold')
            event={'step':step,'time':utc(),'phase':phase,'op':op,'key':key,
              'seconds':duration,'visibleHint':hint,'motionCue':cue,
              'hudAtAction':hud[:450],'authority':'REGULAR_BROWSER_INPUT_ONLY'}
            act(page,op,key,duration)
            event['completedAt']=utc();trace['actions'].append(event)
            elapsed=time.monotonic()-started
            if elapsed-last_frame>=args.screenshot_every:
                last_frame=elapsed
                page.screenshot(path=str(directory/f'progress_{int(elapsed):03d}s.png'))
            step+=1
            if step>=300:break
        page.keyboard.press('Alt+Shift+R');page.wait_for_timeout(250)
        with page.expect_download(timeout=18000) as download:
            page.keyboard.press('Alt+Shift+E')
        download.value.save_as(str(directory/'REC1.json'))
        rec=json.loads((directory/'REC1.json').read_text(encoding='utf-8'))
        trace['rec1']={'captureSeconds':rec.get('captureDurationSeconds'),
              'totalEvents':len(rec.get('events',[])),
              'dropped':rec.get('summary',{}).get('captureRetention',{}).get('droppedDetails')}
        trace['status']='CAPTURED' if len(rec.get('events',[])) else 'EMPTY'
        page.screenshot(path=str(directory/'end.png'))
    except Exception as e:
        errors.append(f'{type(e).__name__}: {e}')
        try:page.screenshot(path=str(directory/'error.png'))
        except Exception:pass
    finally:
        trace['finishedAt']=utc();trace['wallSeconds']=round(time.monotonic()-started,2)
        save(directory/'RUN.json',trace)
        context.close()
    return {'folder':directory.name,'profile':profile,'status':trace['status'],
       'events':trace.get('rec1',{}).get('totalEvents',0),'errors':errors}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url',default='http://127.0.0.1:5173')
    parser.add_argument('--browser-channel',default='chrome')
    parser.add_argument('--headed',action='store_true')
    parser.add_argument('--seconds',type=int,default=75)
    parser.add_argument('--seed',type=int,default=11)
    parser.add_argument('--profiles',default='sweep,motion')
    parser.add_argument('--output',default='BOT1D3_RESULTS')
    parser.add_argument('--screenshot-every',type=int,default=15)
    args=parser.parse_args()
    profiles=[p.strip() for p in args.profiles.split(',')]
    if not profiles or len(profiles)>3 or any(p not in ('sweep','motion','idle') for p in profiles):
        parser.error('--profiles accepts sweep,motion,idle (maximum three)')
    if not 25<=args.seconds<=180:parser.error('seconds must be 25..180 per profile')
    if not 5<=args.screenshot_every<=45:parser.error('screenshot-every 5..45')
    output=pathlib.Path(args.output).resolve();output.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        kw={'headless':not args.headed,'args':['--disable-dev-shm-usage']}
        if args.browser_channel:kw['channel']=args.browser_channel
        elif not pathlib.Path(pw.chromium.executable_path).exists() and shutil.which('chromium'):
            kw['executable_path']=shutil.which('chromium')
        browser=pw.chromium.launch(**kw)
        try:result=[run_one(browser,args,p,args.seed+i) for i,p in enumerate(profiles)]
        finally:browser.close()
    save(output/'BOT1D3_RUN_INDEX.json',{'revision':'BOT1-D3','createdAt':utc(),
          'profiles':profiles,'runs':result,'baseline':'BOT1-D + GUIDE0-W; gameplay unchanged'})
    for r in result:print(f"{r['profile']}: {r['status']} / {r['events']} REC1 events",flush=True)
    print('Wrote',output/'BOT1D3_RUN_INDEX.json')
    return 0 if all(r['status']=='CAPTURED' for r in result) else 2

if __name__=='__main__':raise SystemExit(main())
