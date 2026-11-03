#!/usr/bin/env python3
"""D11I owner-event/dwell comparison; geometry and sustained support scored by D11H."""
from __future__ import annotations
import argparse,collections,json,pathlib,statistics
from analyze_bot1d11h import inspect as inspect_d11h
from bot1d11i_policy import NATURAL, ARMS, EXTRA_DWELL_SECONDS
REVISION='BOT1-D11I-1'

def summarize(trace,run):
    d11h=inspect_d11h(trace,run)
    ev=(trace.get('firstFootholdEvents') or {})
    events=ev.get('events',[])
    row={'profile':run.get('profile'),'arm':run.get('arm'),'round':run.get('round'),
         'status':run.get('status'),'d11hClassification':d11h['classification'],
         'geometryGatePassed':d11h['geometryGatePassed'],
         'sustainedGatePassed':d11h['gatePassed'],
         'maxAnchorToCarriedMesh':d11h.get('maxAnchorToCarriedMesh'),
         'eventCount':len(events),'eventDrops':ev.get('droppedEvents'),
         'classification':'UNSCORED','gatePassed':False,'eventMilestones':{},
         'candidateGateReasons':{},'notes':[]}
    if run.get('status')!='CAPTURED' or run.get('errors'):
        row['classification']='CAPTURE_INCOMPLETE';return row
    if run.get('ownerDataUsedForSteering') or run.get('controlledDebugStart'):
        row['classification']='DISQUALIFIED_STEERING_OR_RELOCATION';return row
    if ev.get('revision')!=REVISION or ev.get('hooked') is not True or ev.get('ownerDataUsedForSteering') is not False:
        row['classification']='MISSING_D11I_EVENT_PROBE';return row
    if ev.get('droppedEvents',0)!=0:
        row['classification']='EVENT_OVERFLOW';return row
    coverage=next((e.get('covered') for e in events if e.get('type')=='probe_owner_coverage'),None)
    # Reset occurs after hook install; first coverage event may be earlier than reset.
    # A reset without owner coverage does not destroy the observer hooks; classify
    # absence of a fresh coverage event only as a verification gap, not gameplay failure.
    kinds=collections.Counter(e.get('type') for e in events)
    if not any(kinds.get(k) for k in ('reach_attempt','tendril_phase_transition','brush_gate_observation')):
        row['classification']='NO_OWNER_EVENT_EVIDENCE';return row
    milestones={
        'brush':lambda e:e.get('type')=='embodiment_contact_transition' and e.get('to')=='brushing',
        'reach':lambda e:e.get('type')=='reach_attempt' and e.get('outcome')=='began_reaching'
            and e.get('after',{}).get('reachSurface')=='SILT_ENTRY_SEDIMENT_SHELF_D11B',
        'seal':lambda e:e.get('type')=='tendril_phase_transition' and e.get('to')=='sealed'
            and e.get('after',{}).get('anchorSurface')=='SILT_ENTRY_SEDIMENT_SHELF_D11B',
        'support':lambda e:e.get('type')=='support_plane_transition' and e.get('after',{}).get('active')
            and e.get('after',{}).get('surfaceId')=='SILT_ENTRY_SEDIMENT_SHELF_D11B',
        'attached':lambda e:e.get('type')=='movement_attachment_transition' and e.get('after',{}).get('active'),
        'deliberateRelease':lambda e:e.get('type')=='movement_attachment_transition'
            and e.get('after',{}).get('reason')=='deliberate_away_input',
    }
    for label,criterion in milestones.items():
        row['eventMilestones'][label]=next((e.get('ms') for e in events if criterion(e)),None)
    row['candidateGateReasons']=dict(collections.Counter(e.get('candidateReason') for e in events
        if e.get('type')=='brush_gate_observation'))
    if run.get('profile') in ('host_positive','away_control'):
        row['classification']='CONTROL_' + ('PASS' if d11h['gatePassed'] else 'FAIL')
        row['gatePassed']=d11h['gatePassed']
        return row
    if not kinds.get('reach_attempt'):
        row['classification']='NO_REACH_EVENT'
    elif row['eventMilestones']['seal'] is None:
        row['classification']='REACH_WITHOUT_OWNER_SEAL_EVENT'
    elif row['eventMilestones']['support'] is None:
        row['classification']='SEALED_WITHOUT_OWNER_SUPPORT_EVENT'
    elif not d11h['gatePassed']:
        row['classification']='INCOMPLETE_GEOMETRY_SUPPORTED_TRAVEL_OR_RELEASE'
    else:
        row['classification']='OWNER_SEAL_AND_D11H_SUSTAINED_GATE_PASS'
        row['gatePassed']=True
    row['notes'].append('D11D gate reasons are diagnostic derivations, not owner-issued rejection codes.')
    row['notes'].append('A single owner seal or plane event does not satisfy sustained geometry-supported locomotion.')
    return row

def analyze(root):
    root=pathlib.Path(root)
    rows=[]
    for p in sorted(root.glob('*/RUN.json')):
        run=json.loads(p.read_text(encoding='utf-8'))
        tr=p.parent/'D11C_TRACE.json'
        trace=json.loads(tr.read_text(encoding='utf-8')) if tr.exists() else {}
        row=summarize(trace,run);row['folder']=p.parent.name;rows.append(row)
    combos={(p,a):[r for r in rows if r['profile']==p and r['arm']==a] for p in NATURAL for a in ARMS}
    observed_rounds=sorted(set(int(r['round']) for r in rows if r['round'] is not None))
    matrix=bool(rows) and all(len(combos[p,a])==len(observed_rounds) for p in NATURAL for a in ARMS) and \
        sum(r['profile']=='host_positive' for r in rows)==1 and sum(r['profile']=='away_control' for r in rows)==1
    arm_summary={}
    for arm in ARMS:
        subset=[r for r in rows if r['arm']==arm and r['profile'] in NATURAL]
        arm_summary[arm]={'runs':len(subset),'passed':sum(r['gatePassed'] for r in subset),
            'byProfile':{p:{'runs':sum(r['profile']==p for r in subset),
                'passed':sum(r['profile']==p and r['gatePassed'] for r in subset)} for p in NATURAL}}
    return {'revision':REVISION,'captureMatrixComplete':matrix,'roundsObserved':observed_rounds,
        'matchedDelaySeconds':EXTRA_DWELL_SECONDS,'eventVersion':REVISION,
        'armSummary':arm_summary,'runs':rows,
        'interpretation':'Exploratory fixed-input comparison. Equal added pause before vs at contact; no causal claims from small n.',
        'decision':'REVIEW_FIRST_FOOTHOLD_REASON_AND_DWELL' if matrix else 'INCOMPLETE_OR_DUPLICATE_MATRIX',
        'warning':'Do not lock LS1 attachment or edit mechanics from this report alone; examine failure reasons and geometry.'}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('root')
    args=p.parse_args();root=pathlib.Path(args.root)
    if not root.is_dir():p.error('Directory does not exist')
    result=analyze(root)
    dest=root/'BOT1D11I_AUDIT.json';dest.write_text(json.dumps(result,indent=2),encoding='utf-8')
    print('D11I captures',len(result['runs']),'| complete matrix:',result['captureMatrixComplete'])
    for arm,v in result['armSummary'].items():print(f'  {arm}: {v["passed"]}/{v["runs"]} sustained passes')
    for row in result['runs']:
        print(f"  r{row['round']} {row['profile']}/{row['arm']}: {row['classification']} | events={row['eventCount']} | anchor max={row['maxAnchorToCarriedMesh']}")
    print('Audit:',dest)
    return 0 if result['captureMatrixComplete'] and all(not r['classification'].startswith(('CAPTURE','MISSING_D11I','EVENT_OVERFLOW','NO_OWNER_EVENT')) for r in result['runs']) else 2
if __name__=='__main__':raise SystemExit(main())
