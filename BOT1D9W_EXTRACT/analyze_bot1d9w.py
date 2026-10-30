#!/usr/bin/env python3
"""G1-D9W independent REC1 referee. Never imported into the live bot policy."""
from __future__ import annotations
import argparse,json,pathlib
from analyze_bot1d9t import load_rec, seconds
from analyze_bot1d9v import evaluate as d9v_evaluate,first_owner_stage

FOLD='bot1d-listening-fold-owner-state'
STABILIZE='game-stabilize-started'
WATCHER='bot1c-watcher-pulse-owner-result'
WATCHER_STATE='bot1c-watcher-owner-state-change'

def first_time(events,typ):
    return next((x for x in events if x.get('type')==typ),None)

def stage3_hold_pair(events,run,stage3):
    """Require recorded keyboard-Q hold *and* REC1 stabilize start preceding Stage 3."""
    t3=seconds((stage3 or {}).get('time'))
    if t3 is None:return False,None
    for h in (run.get('arrival') or {}).get('holdActions',[]):
        start,end=seconds(h.get('atStart')),seconds(h.get('atEnd'))
        if start is None or end is None or end<start or h.get('key')!='q':continue
        if not start-.12<=t3<=end+1.0:continue
        for e in events:
            if e.get('type')!=STABILIZE:continue
            ts=seconds(e.get('time'))
            if ts is not None and start-.45<=ts<=end+.25 and ts<=t3+.12:
                return True,e.get('time')
    return False,None

def evaluate(rec,run,source='FINAL'):
    ev=rec.get('events',[]);ret=(rec.get('summary') or {}).get('captureRetention') or {}
    mode=run.get('mode','stage3')
    valid=(source=='FINAL' and run.get('status')=='CAPTURED' and not run.get('errors')
           and bool(ev) and ret.get('droppedDetails')==0
           and rec.get('captureActive') is False)
    base={'revision':'BOT1-D9W-REFEREE','mode':mode,'repeat':run.get('repeat'),
          'seed':run.get('seed'),'rec1Complete':bool(valid),'rec1Source':source,
          'rec1Events':len(ev),'droppedDetails':ret.get('droppedDetails'),
          'certified':False,'status':'INCONCLUSIVE' if not valid else 'NOT_CERTIFIED'}
    if mode=='acquisition':
        witness=[x for x in ev if x.get('type')==WATCHER]
        accepted=[x for x in witness if (x.get('witness') or {}).get('packetPulseReadAccepted') is True]
        agency=any((x.get('state') or {}).get('foldInvitation') is True
                    for x in ev if x.get('type')==WATCHER_STATE)
        fold=any((x.get('state') or {}).get('nurseryFoldInvitation') is True
                 for x in ev if x.get('type')==FOLD)
        base.update({'watcherPulsesWitnessed':len(witness),'watcherAcceptedReads':len(accepted),
            'ownerInvitation':agency or fold,'publicInvitation':bool(run.get('visibleInvitation')),
            'noFoldCourseByDesign':not run.get('courseStarted')})
        base['certified']=bool(valid and accepted and (agency or fold))
    elif mode=='stage3':
        d9v=d9v_evaluate(rec,run,source)
        stage2=first_owner_stage(ev,2);stage3=first_owner_stage(ev,3)
        pair,stabilize_at=stage3_hold_pair(ev,run,stage3)
        t2=seconds((stage2 or {}).get('time'));t3=seconds((stage3 or {}).get('time'))
        order=bool(t2 is not None and t3 is not None and t3>t2)
        base.update({'ownerInvitation':d9v.get('ownerInvitation'),
            'ownerStage1':d9v.get('ownerStage1'), 'ownerStage2':d9v.get('ownerStage2'),
            'stage2Certified':d9v.get('stage2Certified'),
            'ownerStage3':bool(stage3),'holdPairedWithStabilize':bool(pair),
            'stabilizeOwnerStartAt':stabilize_at,'stage3AfterStage2':order,
            'ownerMaxStage':d9v.get('ownerMaxStage'),
            'firstStage3At':(stage3 or {}).get('time'),
            'publicPulseCount':len((run.get('arrival') or {}).get('pulseActions',[])),
            'experimentalHoldCount':len((run.get('arrival') or {}).get('holdActions',[])),
            'foldOwnerLastInteractionAtStage3':((stage3 or {}).get('state') or {}).get('lastInteraction')})
        base['certified']=bool(valid and d9v.get('stage2Certified') and pair and order)
    else:
        base['status']='UNKNOWN_MODE';return base
    if valid:base['status']='CERTIFIED' if base['certified'] else 'NOT_CERTIFIED'
    return base

def aggregate(rows,expected_modes=None):
    if expected_modes is None:expected_modes=['stage3','stage3','acquisition']
    expected=[x.strip() for x in expected_modes]
    matching=len(rows)==len(expected) and all(r.get('mode')==mode for r,mode in zip(rows,expected))
    full=matching and all(r.get('rec1Complete') for r in rows)
    stage=[r for r in rows if r.get('mode')=='stage3']
    acq=[r for r in rows if r.get('mode')=='acquisition']
    count_stage=sum(bool(x.get('certified')) for x in stage)
    count_acq=sum(bool(x.get('certified')) for x in acq)
    return {'revision':'BOT1-D9W','completeEvidence':full,'expectedModes':expected,
        'stage3':{'certified':count_stage,'attempts':len(stage),'gate':
                 ('INCONCLUSIVE' if not full else 'PASS' if count_stage==len(stage) and stage else 'PARTIAL' if count_stage else 'FAIL')},
        'acquisition':{'certified':count_acq,'attempts':len(acq),'gate':
                 ('INCONCLUSIVE' if not full else 'PASS' if count_acq==len(acq) and acq else 'PARTIAL' if count_acq else 'FAIL')},
        'runs':rows,'proofLimits':['Stage 3 requires REC1 owner progression after a recorded Q Stabilize start and owner-certified Stage 2.',
        'Acquisition requires owner-accepted packet reading and authentic invitation; visual HUD alone is insufficient.',
        'Same-seed Stage 3 tests and single-seed acquisition are exploratory, not general performance estimates.',
        'No gameplay or Guide changes; no hidden owner data enters decisions.']}

def report_md(result):
    x=['# G1-D9W — Stage 3 and Watcher Acquisition', '',
       f"Evidence complete: {result['completeEvidence']}",
       f"Stage 3: **{result['stage3']['certified']}/{result['stage3']['attempts']}**, {result['stage3']['gate']}",
       f"Seed-13 Watcher acquisition: **{result['acquisition']['certified']}/{result['acquisition']['attempts']}**, {result['acquisition']['gate']}", '',
       '| Run | Mode | Seed | Full REC1 | Owner Stage 3 | Authentic Watcher read | Gate |',
       '|---:|---|---:|---|---|---|---|']
    for r in result['runs']:
        x.append(f"| {r.get('repeat')} | {r.get('mode')} | {r.get('seed')} | {r.get('rec1Complete')} | {r.get('ownerStage3','—')} | {r.get('watcherAcceptedReads','—')} | {r.get('status')} |")
    x+=['','REC1 and owner scoring are offline-only; visible prompts do not certify owner results.','']
    return '\n'.join(x)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('folder');p.add_argument('--modes',default='stage3,stage3,acquisition')
    a=p.parse_args();root=pathlib.Path(a.folder)
    if not root.is_dir():p.error('Missing results folder: '+str(root))
    folders=sorted(d for d in root.iterdir() if d.is_dir() and d.name.startswith('BOT1D9W_'))
    if not folders:p.error('No D9W run folders found')
    rows=[]
    for d in folders:
        rec,source=load_rec(d);rec=rec or {}
        run=json.loads((d/'RUN.json').read_text('utf-8')) if (d/'RUN.json').is_file() else {}
        row=evaluate(rec,run,source);rows.append(row)
        (d/'D9W_EVIDENCE.json').write_text(json.dumps(row,indent=2),'utf-8')
        print('run',row['repeat'],row['mode'],'owner verdict',row['status'])
    result=aggregate(rows,a.modes.split(','))
    (root/'BOT1D9W_EVIDENCE.json').write_text(json.dumps(result,indent=2),'utf-8')
    (root/'BOT1D9W_EVIDENCE.md').write_text(report_md(result),'utf-8')
    print('D9W: Stage3',result['stage3']['gate'],'Acquisition',result['acquisition']['gate'])
    return 0 if result['completeEvidence'] else 2

if __name__=='__main__':raise SystemExit(main())
