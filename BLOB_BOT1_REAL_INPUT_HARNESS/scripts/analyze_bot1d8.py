#!/usr/bin/env python3
"""BOT1-D8 independent movement-owner referee. NEVER imported by bot runner."""
from __future__ import annotations
import argparse,collections,json,math,pathlib,statistics
from analyze_bot1d6 import load_run,evaluate,secs,PROOF_LIMIT


def movement_truth(rec):
    events=rec.get('events',[]);start=rec.get('captureStartedAt')
    fold=[e for e in events if e.get('type')=='bot1d-listening-fold-owner-state']
    invitations=[secs(e.get('time'),start) for e in fold if (e.get('state') or {}).get('foldAvailable')]
    invitations=[t for t in invitations if t is not None]
    invitation=min(invitations) if invitations else None
    samples=[e for e in events if e.get('type')=='c0d4-mob1-movement-sample']
    if invitation is not None:
        samples=[e for e in samples if (secs(e.get('time'),start) or -999)>=invitation]
    else:samples=[]
    pressure=[];boundary=[];points=[];attached=0
    for e in samples:
        owner=e.get('owner') or {};motion=owner.get('motion') or {}
        pressure.append(float(motion.get('boundaryPressure') or 0))
        boundary.append(float(motion.get('c0e2bNormalizedBoundaryDistance') or 0))
        pos=motion.get('position') or {}
        if all(isinstance(pos.get(k),(int,float)) for k in ('x','y','z')):
            points.append((pos['x'],pos['y'],pos['z']))
        attached+=owner.get('attachment',{}).get('active') is True
    dist=lambda a,b: math.dist(a,b)
    return {'invitationSeconds':invitation,'postInvitationMovementSamples':len(samples),
            'ownerPressurePositiveSamples':sum(x>0 for x in pressure),
            'ownerAtBoundaryWithPressureSamples':sum(x>=.999 and p>0 for x,p in zip(boundary,pressure)),
            'ownerBoundaryRatio':round(sum(x>=.999 and p>0 for x,p in zip(boundary,pressure))/max(1,len(samples)),3),
            'postInvitationAttachedSamples':attached,
            'firstSamplePosition':list(points[0]) if points else None,
            'lastSamplePosition':list(points[-1]) if points else None,
            'sampledStartEndDistance':round(dist(points[0],points[-1]),3) if len(points)>=2 else None,
            'sampledCumulativeDistance':round(sum(dist(a,b) for a,b in zip(points,points[1:])),3) if len(points)>=2 else None,
            'minimumNormalizedBoundaryDistance':round(min(boundary),4) if boundary else None,
            'sampleLimit':'Sparse owner samples; adjacent samples may reflect environmental flow, and distance is NOT target progress.'}


def judge(folder):
    rec,run,checkpoint_only=load_run(folder)
    if not rec:return {'folder':folder.name,'status':'NO_REC1_EVIDENCE'}
    result=evaluate(rec,run,checkpoint_only)
    m=movement_truth(rec);probes=(run or {}).get('movementProbes',[])
    result.update({'revision':'BOT1-D8-REFEREE','folder':folder.name,
                   'ownerMotion':m,'motionProbeCount':sum(p.get('op')=='move' for p in probes),
                   'cameraOnlyProbeCount':sum(p.get('op')=='look' for p in probes),
                   'motionAboveAmbientCount':sum(p.get('visual',{}).get('imageMotionAboveAmbient') is True for p in probes if p.get('op')=='move'),
                   'visualRevisitCount':sum(p.get('visual',{}).get('sceneRevisited') is True for p in probes if p.get('op')=='move'),
                   'policyHeadingCounts':dict(collections.Counter(p.get('key') for p in probes if p.get('op')=='look')),
                   'recoveryCount':(run or {}).get('steering',{}).get('recoveryCount'),
                   'checkpointCount':len((run or {}).get('checkpoints',[])),
                   'gameplayChanged':False,
                   'provenOnlineSteering':'NO. Pixels and public HUD only; owner pressure assessed offline.',
                   'acceptance':'PASS_FIRST_APPROACH' if result.get('maxStageIndex',0)>=1 or 'approach' in result.get('foldMilestonesSeconds',{})
                      else 'NOT_PASSED',
                   'd7Context':'D7: 40/41 post-invitation samples at normalized boundary >=.999 with positive pressure; 0 Fold stages. Not a controlled A/B.'})
    return result


def md(results):
    lines=['# BOT1-D8 — Motion-Grounded Wayfinding Field Audit','',
           'Independent REC1 scoring. Online policy never reads owner state, Fold distance, or hidden coordinates.','']
    for r in results:
        lines.extend(['## '+r.get('folder','unknown'),'',
                      '**Verdict:** '+r.get('status','unknown')+' / '+r.get('acceptance','NO_EVIDENCE'),'',
                      '| Evidence | Value |','|---|---|'])
        for key in ('eventCount','watcherAcceptedReads','minimumOwnerFocusDistanceWhenAvailable',
                    'maxStageIndex','ownerCertifiedFoldComplete','checkpointOnly','motionProbeCount',
                    'cameraOnlyProbeCount','motionAboveAmbientCount','visualRevisitCount',
                    'checkpointCount','droppedRecorderDetails'):
            lines.append(f'| {key} | {r.get(key)} |')
        for key,val in r.get('ownerMotion',{}).items():
            if key not in ('sampleLimit',):lines.append(f'| owner.{key} | {val} |')
        lines.extend(['','**Milestones:** '+str(r.get('foldMilestonesSeconds')),
                      '**Steering keys (look-only):** '+str(r.get('policyHeadingCounts')),''])
    lines.extend(['## Acceptance and proof boundaries','',
                 '- PASS requires the Fold owner `inApproach` or stageIndex >=1; screenshot motion alone never passes.',
                 '- Boundary escape is observed only by offline movement-owner samples, not a bot-side claim.',
                 '- D7 and D8 comparisons are historical benchmarks, not equal-seed replay conditions.',
                 '- The Guide and Host chemistry, geometry, and 3/6/12 remain frozen.',
                 '',PROOF_LIMIT])
    return '\n'.join(lines)+'\n'


def main():
    p=argparse.ArgumentParser();p.add_argument('folder');a=p.parse_args()
    root=pathlib.Path(a.folder)
    if not root.exists():p.error('Results folder missing: '+str(root))
    folders=sorted(f for f in root.iterdir() if f.is_dir() and f.name.startswith('BOT1D8_'))
    if not folders:p.error('No BOT1D8_ run folders found')
    results=[judge(f) for f in folders]
    (root/'BOT1D8_EVIDENCE.json').write_text(json.dumps(results,indent=2),encoding='utf8')
    (root/'BOT1D8_EVIDENCE.md').write_text(md(results),encoding='utf8')
    for r in results:print(r['folder'],r['status'],r.get('acceptance'),'stage',r.get('maxStageIndex'))
    print('Wrote',root/'BOT1D8_EVIDENCE.md')
    return 0 if all(r['status']!='NO_REC1_EVIDENCE' for r in results) else 2
if __name__=='__main__':raise SystemExit(main())
