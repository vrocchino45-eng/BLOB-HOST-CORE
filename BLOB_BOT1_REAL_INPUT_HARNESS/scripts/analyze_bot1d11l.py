#!/usr/bin/env python3
"""BOT1-D11L owner release gate audit; geometry + prior owner events required.

No gameplay modification, no normal-guided bot steering. OwnerAwayIntent is
recorded from the movement owner; threshold explanations require runtime source
signature confirmation and remain diagnostic model, not engine refusal codes.
"""
from __future__ import annotations
import argparse,collections,json,pathlib
from analyze_bot1d11k import summarize as prior_audit
from bot1d11k_policy import BRAKE, ARMS, schedule

REVISION='BOT1-D11L-1'


def event_marks(trace):
    marks=trace.get('interventions') or []
    def find(label):
        return next((m.get('ms') for m in marks if m.get('label')==label),None)
    return find('start:away_vertical'),find('end:away_vertical')


def classified(gate,trace,prior):
    start,end=event_marks(trace)
    frames=sorted(gate.get('frames') or [],key=lambda f:f.get('ms',-1))
    relevant=[f for f in frames if start is not None and end is not None and
              start<=f.get('ms',-1)<=end]
    attached=[f for f in relevant if f.get('preActive') or f.get('postActive')]
    qualifying=[f for f in attached if f.get('postActive')]
    released=bool(prior['release']['deliberateOwnerTransition'] and
                  prior['release']['freeAfterDeliberateTransition'])
    verified=bool((gate.get('coverage') or {}).get('modelVerified'))
    maxaway=max((f['ownerAwayIntent'] for f in attached
                 if isinstance(f.get('ownerAwayIntent'),(int,float))),default=None)
    maxhold=max((f['ownerPeelHoldAge'] for f in qualifying
                 if isinstance(f.get('ownerPeelHoldAge'),(int,float))),default=None)
    qualified=any(f.get('modeledAwayGateMet') and f.get('modeledHoldGateMet') for f in qualifying)
    away=any(f.get('modeledAwayGateMet') for f in qualifying)
    hold=any(f.get('modeledHoldGateMet') for f in qualifying)
    actual_armed=any(f.get('ownerReleaseArmed') for f in attached)
    no_owner_frames=not frames or not gate.get('hooked')
    failure=not prior['captureValid'] or gate.get('revision')!=REVISION or no_owner_frames or gate.get('droppedFrames',0)!=0
    if failure: classification='INCOMPLETE_OWNER_GATE_CAPTURE'
    elif prior['profile'] in ('host_positive','away_control'): classification='CONTROL_ONLY'
    elif prior['firstMilestonesMs']['attachedOwner'] is None:
        classification='ACQUISITION_NOT_ATTACHED'
    elif not attached:
        classification='ATTACHED_EARLIER_BUT_NOT_AT_RELEASE_INPUT'
    elif released:
        classification='DELIBERATE_RELEASE_CONFIRMED'
    elif not verified:
        classification='OWNER_RELEASE_MODEL_NOT_VERIFIED'
    elif not away:
        classification='OUTWARD_INTENT_BELOW_MODELED_THRESHOLD'
    elif not qualified:
        classification='HOLD_AGE_BELOW_MODELED_THRESHOLD' if not hold else 'GATES_NOT_SIMULTANEOUS'
    elif actual_armed:
        classification='ARMED_WITHOUT_OBSERVED_RELEASE_REVIEW'
    else:classification='MODELED_GATES_MET_OWNER_DISAGREEMENT'
    normals=[]
    for f in attached:
        normals.append({'ms':f.get('ms'), 'ownerComputedAwayIntent':f.get('ownerAwayIntent'),
            'normalizedIntent':f.get('intent'),'normalCandidates':f.get('candidateNormals'),
            'candidateDots':f.get('candidateDots')})
    return {'classification':classification,'releaseStartMs':start,'releaseEndMs':end,
        'framesAll':len(frames),'framesInRelease':len(relevant),'attachedFramesInRelease':len(attached),
        'sourceSignatureModelVerified':verified,'maxOwnerComputedAwayIntent':maxaway,
        'maxOwnerPeelHoldAge':maxhold,'modeledAwayGateReached':away if verified else None,
        'modeledBothGatesReachedSameFrame':qualified if verified else None,
        'ownerReleaseArmedSeen':actual_armed,'ownerDeliberateReleaseEvent':released,
        'firstAttachedFrame':attached[0] if attached else None,
        'lastAttachedFrame':attached[-1] if attached else None,
        'sampledNormalCandidates':normals[:3]+normals[-3:] if len(normals)>6 else normals,
        'note':'Actual release gate scalar and intent from movement owner; normal candidates and model gates are derived, never owner-issued refusal reasons.'}


def audit(root):
    root=pathlib.Path(root)
    index_file=root/'BOT1D11L_RUN_INDEX.json'
    index=json.loads(index_file.read_text('utf-8')) if index_file.is_file() else {}
    rows=[]
    for runfile in sorted(root.glob('*/RUN.json')):
        run=json.loads(runfile.read_text(encoding='utf-8'))
        tf=runfile.parent/'D11C_TRACE.json'
        trace=json.loads(tf.read_text(encoding='utf-8')) if tf.is_file() else {}
        past=prior_audit(trace,run)
        gate=trace.get('releaseGate') or {}
        finding=classified(gate,trace,past)
        complete=bool(past['captureValid'] and gate.get('revision')==REVISION and
                      gate.get('hooked') is True and gate.get('frames') and gate.get('droppedFrames')==0)
        rows.append({'folder':runfile.parent.name,'round':run.get('round'),
          'profile':run.get('profile'),'arm':run.get('arm'),
          'captureValid':complete,'geometryGatePassed':past.get('geometryGatePassed'),
          'geometryClassification':past.get('geometryClassification'),
          'earlySoloPressurePeels':len(past.get('earlySoloPressurePeels') or []),
          'acquired':past['firstMilestonesMs']['attachedOwner'] is not None,
          'priorInterpretation':past['interpretation'],'ownerGate':finding})
    rounds=index.get('rounds')
    plan=schedule(rounds) if rounds in (1,2,3) else []
    actual=[(r['round'],r['profile'],r['arm']) for r in rows]
    complete=bool(plan and collections.Counter(plan)==collections.Counter(actual))
    brake={}
    for arm in ARMS:
        subset=[r for r in rows if r['profile']==BRAKE and r['arm']==arm]
        brake[arm]={'runs':len(subset),'attached':sum(r['acquired'] for r in subset),
           'released':sum(r['ownerGate']['ownerDeliberateReleaseEvent'] for r in subset),
           'interpretations':dict(collections.Counter(r['ownerGate']['classification'] for r in subset))}
    return {'revision':REVISION,'matrixComplete':complete,'capturesComplete':complete and all(r['captureValid'] for r in rows),
      'runsCaptured':len(rows),'modelVerifiedRuns':sum(r['ownerGate']['sourceSignatureModelVerified'] for r in rows),
      'earlySoloPressurePeelCount':sum(r['earlySoloPressurePeels'] for r in rows),
      'brakeComparison':brake,'rows':rows,
      'decision':'OWNER_GATE_DIAGNOSIS_COMPLETE_REVIEW' if complete and all(r['captureValid'] for r in rows)
          else 'INCOMPLETE_OWNER_GATE_EVIDENCE',
      'notALock':'D11L is diagnostic only. No automatic gameplay change or cross-region lock.',
      'caveat':'Expected threshold values are matched to live owner source signature, not guessed from the trace. Owner away-intent is exact owner scalar; active normal is not independently exposed as local variable.'}


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('root');a=p.parse_args()
    root=pathlib.Path(a.root)
    if not root.is_dir():p.error('Results root missing')
    result=audit(root)
    out=root/'BOT1D11L_AUDIT.json';out.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('D11L complete:',result['matrixComplete'],'valid captures:',result['capturesComplete'],
          'runs:',result['runsCaptured'],'verified owner model:',result['modelVerifiedRuns'])
    for arm,group in result['brakeComparison'].items():
        print(' ',arm,group)
    for row in result['rows']:
        print(' ',row['profile'],row['arm'],'r',row['round'],row['ownerGate']['classification'],
              'geometry=',row['geometryClassification'])
    print('Audit:',out)
    return 0 if result['capturesComplete'] else 2
if __name__=='__main__':raise SystemExit(main())
