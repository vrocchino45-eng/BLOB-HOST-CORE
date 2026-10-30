#!/usr/bin/env python3
"""Offline BOT1-D9T referee: independent REC1 truth, never online bot input."""
from __future__ import annotations
import argparse,csv,datetime,json,pathlib,statistics,math

FOLD='bot1d-listening-fold-owner-state'
GUIDE='guide0-core-guide-state'
MOVE='c0d4-mob1-movement-sample'
NEUTRAL='g1d9s-neutral-movement-observation'

def seconds(iso):
    try:return datetime.datetime.fromisoformat(iso.replace('Z','+00:00')).timestamp()
    except (AttributeError,ValueError,TypeError):return None

def load_rec(folder):
    final=folder/'REC1.json'
    if final.is_file():
        return json.loads(final.read_text(encoding='utf-8')),'FINAL'
    candidates=[]
    for p in folder.glob('REC1_CHECKPOINT_*.json'):
        try:
            data=json.loads(p.read_text(encoding='utf-8'))
            if data.get('events'):candidates.append((len(data['events']),data))
        except (OSError,ValueError):pass
    if not candidates:return None,'MISSING'
    return max(candidates,key=lambda x:x[0])[1],'CHECKPOINT_ONLY'

def evaluate(rec,run,source='FINAL'):
    ev=rec.get('events',[])
    t0=seconds(rec.get('captureStartedAt'))
    if t0 is None and ev:t0=seconds(ev[0].get('time'))
    f=[e for e in ev if e.get('type')==FOLD]
    witness=[e for e in ev if e.get('type')=='bot1c-watcher-owner-state-change']
    invited=any((e.get('state') or {}).get('nurseryFoldInvitation') for e in f) or any(
      (e.get('state') or {}).get('foldInvitation') for e in witness)
    approach=next((e for e in f if (e.get('state') or {}).get('inApproach') is True),None)
    stage1=next((e for e in f if int((e.get('state') or {}).get('stageIndex') or 0)>=1),None)
    maxstage=max([int((e.get('state') or {}).get('stageIndex') or 0) for e in f],default=0)
    g=[e for e in ev if e.get('type')==GUIDE]
    reference=seconds((stage1 or approach or {}).get('time'))
    around=[e for e in g if reference is not None and seconds(e.get('time')) is not None
        and abs(seconds(e['time'])-reference)<=2]
    reaction=[((e.get('state') or {}).get('guide') or {}).get('lastReaction') for e in around]
    guide_unique=sorted(set(filter(None,reaction)))
    guide_interpreting=any(((e.get('state') or {}).get('guide') or {}).get('state')=='interpreting_traveling_answer' for e in around)
    probes=run.get('probes',[])
    left=next((p for p in probes if p.get('label')=='travel_left'),None)
    left_samples=[]
    if left:
        a,b=seconds(left.get('atStart')),seconds(left.get('atEnd'))
        if a is not None and b is not None:
            for e in ev:
                if e.get('type') not in (MOVE,NEUTRAL):continue
                t=seconds(e.get('time'))
                if t is None or not a<=t<=b:continue
                ow=e.get('owner') or {}; mo=ow.get('motion') or {}; pos=mo.get('position') or {}
                if not all(isinstance(pos.get(c),(int,float)) for c in ('x','y','z')):continue
                left_samples.append({'time':e.get('time'),'xyz':[pos[c] for c in ('x','y','z')],
                    'attached':bool((ow.get('attachment') or {}).get('active')),
                    'pressure':mo.get('boundaryPressure'),
                    'moveX':(ow.get('input') or {}).get('moveX')})
    xs=[p['xyz'][0] for p in left_samples]
    left_start,left_end=(seconds(left.get('atStart')),seconds(left.get('atEnd'))) if left else (None,None)
    stage1_at=seconds(stage1.get('time')) if stage1 else None
    stage1_near_left=(stage1_at is not None and left_start is not None and left_end is not None
        and left_start<=stage1_at<=left_end+4.0)
    capture=rec.get('summary',{}).get('captureRetention',{})
    complete=(run.get('courseStarted') is True and len(probes)>=10)
    # A checkpoint without the full course must not count as a failed replication.
    valid=source=='FINAL' and complete and bool(f)
    if not valid:verdict='INCOMPLETE_EVIDENCE'
    elif stage1:verdict='STAGE1_OWNER_CERTIFIED'
    elif approach:verdict='APPROACH_ONLY'
    elif invited:verdict='INVITED_NOT_APPROACHED'
    else:verdict='INVITATION_NOT_CONFIRMED'
    relative=lambda e:round(seconds(e['time'])-t0,2) if e and t0 is not None and seconds(e.get('time')) is not None else None
    stage_state=(stage1 or {}).get('state') or {}
    return {'revision':'BOT1-D9T-OFFLINE-REFEREE','repeat':run.get('repeat'),
      'captureSource':source,'status':run.get('status'),'verdict':verdict,
      'evidenceCompleteForReplication':valid,
      'courseTrialCount':len(probes),'ownerFoldSamples':len(f),'rec1Events':len(ev),
      'droppedDetails':capture.get('droppedDetails'),
      'ownerInvitationProven':bool(invited),'ownerApproachProven':bool(approach),
      'ownerStage1Proven':bool(stage1),'ownerMaxStageIndex':maxstage,
      'stage1TemporallyNearLeftTrial':bool(stage1_near_left),
      'fixedCourseReplicationProven':bool(valid and stage1_near_left and len(left_samples)>=2
         and any(x>0 for x in xs) and any(x<0 for x in xs)
         and not any(x['attached'] for x in left_samples)),
      'approachSeconds':relative(approach),'stage1Seconds':relative(stage1),
      'firstStage1FocusDistance':stage_state.get('focusDistance'),
      'guidePhysicalReactionNearStage1':guide_unique,
      'guideInterpretingNearStage1':guide_interpreting,
      'guideObservationCountNearStage1':len(around),
      'leftTrial':{'ownerSamples':len(left_samples),'startX':xs[0] if xs else None,
         'endX':xs[-1] if xs else None,
         'positiveToNegativeCrossing':any(x>0 for x in xs) and any(x<0 for x in xs),
         'sampledXDelta':round(xs[-1]-xs[0],3) if len(xs)>1 else None,
         'attachedDuringTrial':any(x['attached'] for x in left_samples),
         'samples':left_samples},
      'limitations':[
        'Stage progress is independently certified only by Fold owner; visible HUD text is not enough.',
        'Same seed and fixed inputs repeat a trajectory, not a generalized learned visual-navigation policy.',
        'Left-trial REC1 samples occur within the action window; cannot establish exact endpoint positions.',
        'Guide state near Stage 1 is correlation, not proof the Guide caused approach or applied force.',
        'Owner positions and Fold distance appear only in this offline report, never online decision inputs.',
        'Single D9S success cannot prove repeatability until fresh-run results are obtained.'
      ]}

def aggregate(rows,expected=None):
    eligible=[r for r in rows if r['evidenceCompleteForReplication']]
    success=sum(r['fixedCourseReplicationProven'] for r in eligible)
    if expected is None:expected=len(rows)
    if expected <2 or len(eligible)<2 or len(eligible)<expected:
        gate='INSUFFICIENT_COMPLETE_REPLICATIONS'
    elif success==len(eligible):gate='REPLICATION_ALL_PASSED'
    elif success>=2:gate='REPLICATION_PARTIAL_AT_LEAST_TWO'
    elif success==1:gate='NOT_YET_REPLICABLE_ONE_SUCCESS'
    else:gate='NOT_REPLICATED'
    return {'revision':'BOT1-D9T','replicationsExpected':expected,
      'replicationsFound':len(rows),'completeReplications':len(eligible),
      'fixedCourseReplications':success,
      'ownerStage1Passes':sum(r['ownerStage1Proven'] for r in eligible),
      'ownerApproachPasses':sum(r['ownerApproachProven'] for r in eligible),
      'replicationGate':gate,
      'limits':'Not sufficient to claim Fold route planning, reliable landmark localization, or Guide causal assistance',
      'runs':rows}

def to_md(result):
    lines=['# G1-D9T — controlled Fold approach replication','',
       f"**Gate:** `{result['replicationGate']}`",'',
       f"Complete runs: {result['completeReplications']} / {result['replicationsExpected']}",
       f"Owner Stage 1 certified: {result['ownerStage1Passes']}",
       f"Fixed-course crossing replicated: {result['fixedCourseReplications']}",'',
       '| Run | REC1 | Course | Invitation | Approach | Stage 1 | Fixed crossing replicated | Guide near Stage 1 |',
       '|---:|---|---:|---|---|---|---|---|']
    for r in result['runs']:
        yn=lambda v:'yes' if v else 'no'
        lines.append('| {} | {} | {} | {} | {} | {} | {} | {} |'.format(
            r.get('repeat','?'),r['captureSource'],r['courseTrialCount'],yn(r['ownerInvitationProven']),
            yn(r['ownerApproachProven']),yn(r['ownerStage1Proven']),
            yn(r['fixedCourseReplicationProven']),
            ', '.join(r['guidePhysicalReactionNearStage1']) if r['guidePhysicalReactionNearStage1'] else 'unobserved'))
    lines+=['','## Proof restrictions','',
       '- Fixed course repeated without navigation feedback from REC1 or hidden Fold coordinates.',
       '- Failures or successes are counted only for complete REC1 runs and a completed fixed course.',
       '- Read-only owner position used after the run; not supplied to the bot.',
       '- Guide response is independently observed; causal guidance not established.','']
    return '\n'.join(lines)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('folder');p.add_argument('--expected-runs',type=int,default=3)
    args=p.parse_args();root=pathlib.Path(args.folder)
    if not root.is_dir():p.error('Missing results folder: '+str(root))
    dirs=sorted(d for d in root.iterdir() if d.is_dir() and d.name.startswith('BOT1D9T_'))
    if not dirs:p.error('No BOT1D9T_ run folders found')
    rows=[]
    for d in dirs:
        rec,source=load_rec(d)
        if rec is None:rec={}
        runpath=d/'RUN.json'
        run=json.loads(runpath.read_text(encoding='utf-8')) if runpath.is_file() else {}
        report=evaluate(rec,run,source)
        rows.append(report)
        (d/'D9T_EVIDENCE.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
        print('repeat',report['repeat'],report['verdict'],'stage',report['ownerMaxStageIndex'],
            'left X-cross',report['leftTrial']['positiveToNegativeCrossing'])
    result=aggregate(rows,args.expected_runs)
    (root/'BOT1D9T_EVIDENCE.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    (root/'BOT1D9T_EVIDENCE.md').write_text(to_md(result),encoding='utf-8')
    print('BOT1-D9T:',result['replicationGate'], result['fixedCourseReplications'],'fixed-course crossings /',result['completeReplications'],'complete runs')
    # Inconclusive clinical/evaluation outcome is not a script failure; unavailable files are.
    return 0 if any(r['captureSource']!='MISSING' for r in rows) else 2
if __name__=='__main__':raise SystemExit(main())
