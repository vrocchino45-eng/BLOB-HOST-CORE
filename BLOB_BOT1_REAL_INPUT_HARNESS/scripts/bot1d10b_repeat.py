#!/usr/bin/env python3
"""BOT1-D10B repeatability gate over the UNCHANGED D10A real-input runner.

Each round invokes D10A with both Golden and Guided in alternating order,
with a fresh browser process per round and isolated browser context per run.
No owner state or REC1 is read to guide live inputs.  No gameplay modifications.
"""
from __future__ import annotations
import argparse, datetime, hashlib, json, pathlib, subprocess, sys, time

REVISION = 'BOT1-D10B'

def schedule(rounds: int):
    if not 1 <= rounds <= 8:
        raise ValueError('rounds must be 1..8')
    return [['golden','guided'] if i % 2 == 0 else ['guided','golden']
            for i in range(rounds)]

def d10a_complete(round_dir: pathlib.Path, profiles: list[str]) -> bool:
    idx=round_dir/'BOT1D10A_RUN_INDEX.json'
    if not idx.is_file(): return False
    try:
        data=json.loads(idx.read_text(encoding='utf-8'))
        if data.get('profilesRequested')!=profiles: return False
        runs=data.get('runs') or []
        if len(runs)!=len(profiles): return False
        for want,got in zip(profiles,runs):
            if got.get('profile')!=want or got.get('status')!='CAPTURED' or got.get('errors'):return False
            folder=round_dir/got.get('folder','')
            if not (folder/'RUN.json').is_file() or not (folder/'REC1.json').is_file():return False
            run=json.loads((folder/'RUN.json').read_text(encoding='utf-8'))
            if run.get('profile')!=want or run.get('status')!='CAPTURED':return False
        return True
    except (ValueError, OSError, KeyError, TypeError):
        return False

def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat()

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',default='http://127.0.0.1:5173')
    p.add_argument('--browser-channel',default='chrome')
    p.add_argument('--headed',action='store_true')
    p.add_argument('--rounds',type=int,default=3)
    p.add_argument('--seconds',type=int,default=145)
    p.add_argument('--pause-between-rounds',type=float,default=2.0)
    p.add_argument('--output',default='BOT1D10B_RESULTS')
    p.add_argument('--resume',action='store_true',help='Skip fully captured previous rounds; never overwrite partial rounds.')
    a=p.parse_args(argv)
    if not 1<=a.rounds<=8: p.error('--rounds must be 1..8')
    if not 90<=a.seconds<=240: p.error('--seconds must be 90..240')
    if not 0<=a.pause_between_rounds<=30:p.error('--pause-between-rounds must be 0..30')
    harness=pathlib.Path(__file__).resolve().parent
    base=harness/'bot1d10a_browser.py'
    ref=harness/'BOT1D9Y_REFERENCE.json'
    if not base.is_file():p.error('D10A runner missing at: '+str(base))
    if not ref.is_file():p.error('D9Y reference missing at: '+str(ref))
    out=pathlib.Path(a.output).resolve()
    planfile=out/'BOT1D10B_RUN_PLAN.json'
    expected=schedule(a.rounds)
    source_sha=hashlib.sha256(base.read_bytes()).hexdigest()
    if out.exists() and any(out.iterdir()) and not a.resume:
        p.error('Output already contains files. Choose another --output or explicitly --resume (no overwrite).')
    if a.resume and planfile.is_file():
        prior=json.loads(planfile.read_text(encoding='utf8'))
        if prior.get('schedule')!=expected or prior.get('d10aRunnerSHA256')!=source_sha:
            p.error('Cannot resume: schedule or frozen D10A runner hash does not match existing plan.')
    elif a.resume and out.exists() and any(out.iterdir()):
        p.error('Cannot resume: output has files but no D10B plan.')
    out.mkdir(parents=True,exist_ok=True)
    if not planfile.exists():
        plan={'revision':REVISION,'createdAt':utc(),'schedule':expected,
              'roundsPlanned':a.rounds,'expectedRunCount':2*a.rounds,
              'd10aRunnerSHA256':source_sha,'secondsPerRunBudget':a.seconds,
              'url':a.url,'browserChannel':a.browser_channel,
              'ownerStateUsedForLiveNavigation':False,'worldSeedSet':False,
              'gameplayFilesChanged':False,
              'interpretation':'Repeated browser input policies, not world seed variation or human discoverability'}
        planfile.write_text(json.dumps(plan,indent=2)+'\n',encoding='utf8')
    for i,profiles in enumerate(expected,1):
        rd=out/f'round{i:02d}'
        if rd.exists() and any(rd.iterdir()):
            if a.resume and d10a_complete(rd,profiles):
                print(f'[D10B] round {i} already captured; skipping',flush=True)
                continue
            p.error('Round contains incomplete or mismatched data, refusing overwrite: '+str(rd))
        cmd=[sys.executable,str(base),'--url',a.url,'--browser-channel',a.browser_channel,
             '--profiles',','.join(profiles),'--seconds',str(a.seconds), '--output',str(rd)]
        if a.headed:cmd.append('--headed')
        print(f'[D10B] round {i}/{a.rounds}: '+','.join(profiles),flush=True)
        rc=subprocess.run(cmd,check=False).returncode
        if rc!=0:
            print(f'[D10B] round {i} runner returned {rc}; preserving output for diagnosis.',file=sys.stderr)
            return 2
        if not d10a_complete(rd,profiles):
            print(f'[D10B] round {i} output incomplete; preserving evidence for diagnosis.',file=sys.stderr)
            return 2
        if i<a.rounds and a.pause_between_rounds:
            time.sleep(a.pause_between_rounds)
    print(f'[D10B] all {2*a.rounds} recordings captured in {out}',flush=True)
    print('[D10B] next: py .\\BLOB_BOT1_REAL_INPUT_HARNESS\\scripts\\analyze_bot1d10b.py '+a.output,flush=True)
    return 0

if __name__=='__main__':raise SystemExit(main())
