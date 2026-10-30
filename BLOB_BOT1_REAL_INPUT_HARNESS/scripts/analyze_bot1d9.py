#!/usr/bin/env python3
"""G1-D9 OFFLINE referee. Never imported by the online BOT1-D9 runner.

Owner snapshots are sparse and not evidence of continuous camera/world motion.
Ambiguous or missing temporal coverage stays UNKNOWN, never an inferred pass.
"""
from __future__ import annotations
import argparse,collections,datetime,json,math,pathlib,statistics
from analyze_bot1d6 import load_run,evaluate,secs,PROOF_LIMIT


def timestamp(t):
    try:return datetime.datetime.fromisoformat(t.replace('Z','+00:00')).timestamp()
    except (AttributeError,ValueError,TypeError):return None


def owner_samples(rec):
    result=[]
    for e in rec.get('events',[]):
        if e.get('type')!='c0d4-mob1-movement-sample':continue
        t=timestamp(e.get('time')); owner=e.get('owner') or {}
        m=owner.get('motion') or {}; pos=m.get('position') or {}
        if t is None or not all(isinstance(pos.get(k),(int,float)) for k in ('x','y','z')):continue
        result.append({'t':t,'xyz':(pos['x'],pos['y'],pos['z']),
           'boundary':float(m.get('c0e2bNormalizedBoundaryDistance') or 0),
           'pressure':float(m.get('boundaryPressure') or 0),
           'attachment':bool((owner.get('attachment') or {}).get('active')),
           'speed':float(m.get('speed') or 0)})
    return sorted(result,key=lambda s:s['t'])


def match_owner_window(probe,samples,max_skew=1.35):
    """Use closest *bracketing* samples; do not label action causality.

    Sparse 1s sampling may fail to bracket a look action: fail unknown.
    """
    a,b=timestamp(probe.get('atStart')),timestamp(probe.get('atEnd'))
    if a is None or b is None or b<a:return {'coverage':'UNKNOWN_TIMING'}
    pre=[s for s in samples if s['t']<=a and a-s['t']<=max_skew]
    post=[s for s in samples if s['t']>=b and s['t']-b<=max_skew]
    if not pre or not post:return {'coverage':'UNKNOWN_NO_BRACKET','proximityLimitSeconds':max_skew}
    left,right=pre[-1],post[0]
    delta=round(math.dist(left['xyz'],right['xyz']),3)
    in_range=[s for s in samples if left['t']<=s['t']<=right['t']]
    return {'coverage':'BRACKETED_SPARSE_OWNER',
       'ownerSampleIntervalSeconds':round(right['t']-left['t'],3),
       'actionDurationSeconds':round(b-a,3),
       'worldPositionDeltaAcrossBracket':delta,
       'possibleEnvironmentalDrift':True,
       'avgBoundaryPressureAcrossBracket':round(statistics.mean(s['pressure'] for s in in_range),4),
       'maxBoundaryAcrossBracket':round(max(s['boundary'] for s in in_range),4),
       'attachmentSampleCount':sum(s['attachment'] for s in in_range),
       'limitation':'Bracket includes idle and environmental motion; not an action-only displacement proof'}


def verdict(data,run,checkpoint=False):
    base=evaluate(data,run,checkpoint)
    probes=run.get('probes',[]);samples=owner_samples(data)
    paired=[dict(index=p.get('index'),heading=p.get('heading'),kind=p.get('kind'),
           key=p.get('key'),label=p.get('label'),
           visualAboveAmbient=(p.get('signal',{}).get('visual',{}).get('imageMotionAboveAmbient')),
           semanticLandmarkKnown=False,
           owner=match_owner_window(p,samples)) for p in probes]
    by_kind={k:[r for r in paired if r['kind']==k] for k in ('move','look')}
    supported={k:[p['owner']['worldPositionDeltaAcrossBracket'] for p in group
       if p['owner']['coverage']=='BRACKETED_SPARSE_OWNER'] for k,group in by_kind.items()}
    total_by_heading=collections.Counter(p.get('heading') for p in probes if p.get('kind')=='move')
    calibration_complete=(len(by_kind['move'])==12 and len(by_kind['look'])==4 and
                          all(total_by_heading.get(k)==4 for k in ('center','left','right')))
    observed=(len(supported['move'])>=8 and len(supported['look'])>=2)
    # Never claim true semantic localization from generic pixel landmarks.
    a_status='SAMPLED_FOR_REVIEW' if calibration_complete and observed else 'INSUFFICIENT_PAIRED_OWNER_SAMPLES'
    if not calibration_complete:a_status='INCOMPLETE_CALIBRATION_COURSE'
    b_status='NOT_TESTED_AS_ROUTE'  # D9 course is fixed experiment, not exploration.
    c_status='PASS' if base.get('maxStageIndex',0)>=1 or 'approach' in base.get('foldMilestonesSeconds',{}) else 'NOT_PASSED'
    return {'revision':'BOT1-D9-REFEREE','runStatus':run.get('status'),
         'checkpointOnly':checkpoint,'eventCount':len(data.get('events',[])),
         'invitationSeconds':base.get('foldMilestonesSeconds',{}).get('invitation'),
         'maxFoldStageIndex':base.get('maxStageIndex'),'foldApproachGate':c_status,
         'minOwnerFoldFocusDistance':base.get('minimumOwnerFocusDistanceWhenAvailable'),
         'calibrationComplete':calibration_complete,
         'gateA':a_status,'gateB':b_status,'gateC':c_status,
         'probeCount':len(paired),'ownerMovementSampleCount':len(samples),
         'pairedSampleCount':sum(p['owner']['coverage']=='BRACKETED_SPARSE_OWNER' for p in paired),
         'perKindOwnerBracketDeltas':{k:{'count':len(v),'median':round(statistics.median(v),3) if v else None} for k,v in supported.items()},
         'onlineSummary':run.get('onlineSummary'),
         'returnView':run.get('returnView'),
         'probes':paired,
         'limits':PROOF_LIMIT+' Bracketed world-position deltas include environmental drift. Calibration is not target bearing or navigational competency.'}


def markdown(result):
    lines=['# BLOB — G1-D9 Camera/Translation Calibration Referee','',
        f"**Status:** {result['runStatus']} | **Course complete:** {result['calibrationComplete']}",'',
        '| Gate | Verdict |','|---|---|',
        f"| A / camera vs translation owner-correlated samples | {result['gateA']} |",
        f"| B / reduced navigation loops | {result['gateB']} |",
        f"| C / Listening Fold approach | {result['gateC']} |",'',
        '| Metric | Value |','|---|---|']
    for k in ('eventCount','checkpointOnly','invitationSeconds','maxFoldStageIndex',
             'minOwnerFoldFocusDistance','probeCount','ownerMovementSampleCount',
             'pairedSampleCount','perKindOwnerBracketDeltas'):
        lines.append(f'| {k} | {result.get(k)} |')
    lines += ['','## Each controlled trial','',
              '| Heading | Action | Visual movement | Owner-bracketed delta | Sample coverage |',
              '|---|---|---|---|---|']
    for p in result['probes']:
        o=p['owner'];lines.append(f"| {p['heading']} | {p['kind']} {p['key']} | {p['visualAboveAmbient']} | {o.get('worldPositionDeltaAcrossBracket','unknown')} | {o['coverage']} |")
    lines+=['','## Proof boundaries','',
        '- D9 is **calibration only**. It intentionally does not optimize route progress.',
        '- No owner position is available to the bot; REC1 scoring occurs after completion.',
        '- A look-only trial may have world drift due to flow. A move trial may hit a boundary.',
        '- A landmark descriptor repeat is not a unique landmark ID or Fold bearing.',
        '- Sparse owner snapshots may not bracket every short look-only action.',
        '- The gameplay, Guide physics, Host circuitry, and 3/6/12 remain unchanged.','',result['limits'],'']
    return '\n'.join(lines)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('folder');a=p.parse_args()
    root=pathlib.Path(a.folder)
    if not root.is_dir():p.error('Results folder missing: '+str(root))
    folders=sorted(f for f in root.iterdir() if f.is_dir() and f.name.startswith('BOT1D9_'))
    if not folders:p.error('No BOT1D9_ run folders found')
    output=[]
    for f in folders:
        data,run,checkpoint=load_run(f)
        if data is None:output.append({'runStatus':'NO_REC1','folder':f.name});continue
        result=verdict(data,run,checkpoint);result['folder']=f.name;output.append(result)
        (f/'CALIBRATION_EVIDENCE.md').write_text(markdown(result),encoding='utf-8')
    (root/'BOT1D9_EVIDENCE.json').write_text(json.dumps(output,indent=2),encoding='utf-8')
    for row in output:print(row['folder'],row['runStatus'],row.get('gateA'),row.get('gateC'))
    return 0 if all(o.get('runStatus')!='NO_REC1' for o in output) else 2
if __name__=='__main__':raise SystemExit(main())
