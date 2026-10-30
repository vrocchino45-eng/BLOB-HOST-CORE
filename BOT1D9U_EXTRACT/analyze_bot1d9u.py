#!/usr/bin/env python3
"""Independent REC1 referee for BOT1-D9U; never imported by browser policy."""
from __future__ import annotations
import argparse,datetime,json,pathlib
from analyze_bot1d9t import evaluate as base_evaluate,load_rec,seconds

FOLD='bot1d-listening-fold-owner-state'

def contiguous_dwell(events, state_key):
    """Consecutive sampled positive owner states; gaps >.7s end a span."""
    pts=[]
    for e in events:
        if e.get('type')!=FOLD:continue
        t=seconds(e.get('time'))
        if t is not None:pts.append((t,bool((e.get('state') or {}).get(state_key))))
    best=0.;start=None;last=None
    for t,on in pts:
        if on:
            if start is None or (last is not None and t-last>.7):start=t
            last=t;best=max(best,t-start)
        else:start=last=None
    return round(best,3)

def evaluate(rec,run,source='FINAL'):
    base=base_evaluate(rec,run,source)
    owner=[e for e in rec.get('events',[]) if e.get('type')==FOLD]
    arrival=run.get('arrival') or {}
    starts=[p for p in run.get('probes',[]) if p.get('label')=='travel_left']
    trial=starts[-1] if starts else None
    t0=seconds(trial.get('atStart')) if trial else None
    t1=seconds(trial.get('atEnd')) if trial else None
    stage1=next((e for e in owner if int((e.get('state') or {}).get('stageIndex') or 0)>=1),None)
    ts=seconds(stage1.get('time')) if stage1 else None
    stage_near=(ts is not None and t0 is not None and t1 is not None and t0<=ts<=t1+2.0)
    dropped=rec.get('summary',{}).get('captureRetention',{}).get('droppedDetails')
    complete=(base['evidenceCompleteForReplication'] and bool(arrival)
       and not run.get('errors') and (dropped is None or dropped==0))
    public=arrival.get('publicVerdict')=='PUBLIC_ANSWER_SEEN'
    success=bool(complete and stage_near and stage1)
    return {
      'revision':'BOT1-D9U-OFFLINE-REFEREE',
      'repeat':run.get('repeat'),'source':source,
      'completeOwnerEvidence':bool(complete),
      'rec1Events':len(rec.get('events',[])),
      'droppedREC1Details':rec.get('summary',{}).get('captureRetention',{}).get('droppedDetails'),
      'courseCount':len(run.get('probes',[])),
      'leftHoldSeconds':arrival.get('leftHoldSeconds'),
      'correctionsCount':len(arrival.get('corrections',[])),
      'publicAnswerSeen':public,
      'ownerInvitation':base['ownerInvitationProven'],
      'ownerApproach':base['ownerApproachProven'],
      'ownerStage1':base['ownerStage1Proven'],
      'ownerMaxStage':base['ownerMaxStageIndex'],
      'ownerStage1NearArrival':bool(stage_near),
      'stage1CertifiedForGate':success,
      'maxSampledApproachSeconds':contiguous_dwell(owner,'inApproach'),
      'maxSampledFocusReadySeconds':contiguous_dwell(owner,'focusReady'),
      'leftTrial':{k:v for k,v in base['leftTrial'].items() if k!='samples'},
      'guideReactionNearStage1':base['guidePhysicalReactionNearStage1'],
      'guideInterpretingNearStage1':base['guideInterpretingNearStage1'],
      'baseVerdict':base['verdict'],
      'limitations':[
         'REC1 owner state and position are evaluated offline only, never as online steering input.',
         'Visible HUD Fold-answer phrase is a public cue, not owner-certified Stage 1.',
         'A fixed leftward course plus small corrections is not a general navigation policy.',
         'Maximum approach/focus duration is estimated from periodic owner samples.',
         'Guide reaction is correlated with stage; no physical guidance or causal claim.'
      ]
    }

def aggregate(rows,expected=3):
    complete=[r for r in rows if r['completeOwnerEvidence']]
    successful=sum(r['stage1CertifiedForGate'] for r in complete)
    if expected<3:
        gate='INSUFFICIENT_REPLICATIONS'
    elif len(rows)!=expected or len(complete)!=expected:
        gate='INSUFFICIENT_COMPLETE_EVIDENCE'
    elif successful==expected:
        gate='STAGE1_REPLICATION_ALL_PASSED'
    elif successful>0:
        gate='STAGE1_REPLICATION_PARTIAL'
    else:
        gate='STAGE1_NOT_REPLICATED'
    return {'revision':'BOT1-D9U','expectedRuns':expected,'completeRuns':len(complete),
        'ownerApproachCount':sum(r['ownerApproach'] for r in complete),
        'ownerStage1Count':sum(r['ownerStage1'] for r in complete),
        'publicAnswerCount':sum(r['publicAnswerSeen'] for r in complete),
        'stage1GatePasses':successful,'gate':gate,
        'nextSeedRequiredIfPass':gate=='STAGE1_REPLICATION_ALL_PASSED',
        'runs':rows,
        'scope':'Owner-certified Stage 1 on complete runs; not Fold completion, learned route or Guide assistance'}

def report_md(data):
    rows=['# BLOB — G1-D9U Arrival and Settling Field Audit','',
      '**Gate:** `'+data['gate']+'`','',
      f"Complete REC1 runs: {data['completeRuns']}/{data['expectedRuns']}; "+
      f"owner Stage 1: {data['ownerStage1Count']}; verified arrival-window successes: {data['stage1GatePasses']}",
      '', '| Run | REC1 | Public answer | Approach | Owner Stage 1 | Corrections | Max sampled approach |',
      '|---:|---|---|---|---|---:|---:|']
    for r in data['runs']:
        yn=lambda v:'Yes' if v else 'No'
        rows.append(f"| {r['repeat']} | {r['source']} | {yn(r['publicAnswerSeen'])} | "+
            f"{yn(r['ownerApproach'])} | {yn(r['stage1CertifiedForGate'])} | "+
            f"{r['correctionsCount']} | {r['maxSampledApproachSeconds']} s |")
    rows+=['','All owner observations and Fold distances are independent offline checks. The bot uses only public HUD text and its own timed inputs. Missing evidence is inconclusive, never a failure.','']
    return '\n'.join(rows)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('folder');p.add_argument('--expected-runs',type=int,default=3)
    a=p.parse_args();root=pathlib.Path(a.folder)
    if not root.is_dir():p.error('Missing results folder: '+str(root))
    dirs=sorted(d for d in root.iterdir() if d.is_dir() and d.name.startswith('BOT1D9U_'))
    if not dirs:p.error('No BOT1D9U_ run folders')
    rows=[]
    for d in dirs:
        rec,source=load_rec(d);rec=rec or {}
        run=json.loads((d/'RUN.json').read_text('utf-8')) if (d/'RUN.json').is_file() else {}
        row=evaluate(rec,run,source)
        rows.append(row)
        (d/'D9U_EVIDENCE.json').write_text(json.dumps(row,indent=2),'utf-8')
        print('repeat',row['repeat'],row['source'],'ownerStage1',row['ownerStage1'],'publicCue',row['publicAnswerSeen'])
    result=aggregate(rows,a.expected_runs)
    (root/'BOT1D9U_EVIDENCE.json').write_text(json.dumps(result,indent=2),'utf-8')
    (root/'BOT1D9U_EVIDENCE.md').write_text(report_md(result),'utf-8')
    print('BOT1-D9U:',result['gate'], 'stage1',result['stage1GatePasses'],'/',a.expected_runs)
    return 0 if result['completeRuns']==a.expected_runs else 2
if __name__=='__main__':raise SystemExit(main())
