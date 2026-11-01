#!/usr/bin/env python3
"""Offline-only D11A mobility referee. Never steers the live browser.

Scores Silt cell entry, movement, attachment transitions, boundary pressure,
and logged action windows. 'No attachment observed' is not a release PASS.
"""
from __future__ import annotations
import argparse,collections,datetime,json,math,pathlib
from bot1d11a_policy import PROFILES,REVISION,CELL,contract

OWNER_EVENT_TYPES={'c0d4-mob1-movement-sample','g1d9s-neutral-movement-observation',
                   'c0d4-mob1-guidance-state-change','c0d4-mob1-sustained-low-progress'}

def parse_time(value):
    if not isinstance(value,str):return None
    try:return datetime.datetime.fromisoformat(value.replace('Z','+00:00'))
    except ValueError:return None

def owner_samples(rec):
    out=[]
    for evt in rec.get('events',[]):
        if evt.get('type') not in OWNER_EVENT_TYPES:continue
        owner=evt.get('owner');dt=parse_time(evt.get('time'))
        if not isinstance(owner,dict) or dt is None:continue
        out.append((dt,owner,evt.get('type')))
    return sorted(out,key=lambda s:s[0])

def distance(a,b):
    if not isinstance(a,dict) or not isinstance(b,dict):return None
    return round(math.sqrt(sum((float(a.get(axis,0))-float(b.get(axis,0)))**2 for axis in 'xyz')),3)

def summaries_by_action(run,samples):
    sections=[]
    for a in run.get('actions',[]):
        x=parse_time(a.get('startedAt'));y=parse_time(a.get('endedAt'))
        found=[o for t,o,_ in samples if x is not None and y is not None and x<=t<=y and o.get('cellId')==CELL]
        first=found[0] if found else None;last=found[-1] if found else None
        pos=lambda o:(o.get('motion') or {}).get('position') if o else None
        sections.append({'label':a.get('label'),'key':a.get('key'),'duration':a.get('plannedSeconds'),
          'mobilitySamples':len(found),'observedDisplacement':distance(pos(first),pos(last)),
          'attachmentSamples':sum(bool((o.get('attachment') or {}).get('active')) for o in found),
          'maxBoundaryPressure':round(max([(o.get('motion') or {}).get('boundaryPressure',0) or 0 for o in found],default=0),3)})
    return sections

def referee(run,rec):
    samples=owner_samples(rec)
    silt=[(t,o,kind) for t,o,kind in samples if o.get('cellId')==CELL]
    cells=list(dict.fromkeys(o.get('cellId','none') for _,o,_ in samples))
    motion=[o.get('motion') or {} for _,o,_ in silt]
    attachment=[o.get('attachment') or {} for _,o,_ in silt]
    attached=[bool(a.get('active')) for a in attachment]
    transitions=[('attach' if not a and b else 'detach',i) for i,(a,b) in enumerate(zip(attached,attached[1:]),1) if a!=b]
    ids=sorted({a.get('surfaceId') for a in attachment if a.get('surfaceId') not in (None,'none','')})
    silt_ids=sorted({m.get('c0e2bActiveVolumeId') for m in motion if m.get('c0e2bActiveVolumeId') not in (None,'legacy','')})
    drop=((rec.get('summary') or {}).get('captureRetention') or {}).get('droppedDetails')
    cap_ok=run.get('status')=='CAPTURED' and isinstance(rec.get('events'),list) and len(rec.get('events',[]))>0 and drop==0 and not run.get('errors')
    if not cap_ok:verdict='CAPTURE_INCOMPLETE'
    elif not silt:verdict='SILT_ENTRY_UNVERIFIED'
    elif not any(e.get('type')=='c0d4-mob1-movement-sample' and (e.get('owner') or {}).get('cellId')==CELL for e in rec['events']):
        verdict='INSUFFICIENT_MOTION_OBSERVATION'
    else:verdict='SILT_DIAGNOSTIC_CAPTURED'
    if not any(attached):contact='NOT_EXERCISED_NO_ATTACHMENT_OBSERVED'
    elif not any(k=='detach' for k,_ in transitions):contact='ATTACHMENT_OBSERVED_NO_RELEASE_TRANSITION'
    else:contact='ATTACH_AND_RELEASE_OBSERVED_NOT_CAUSALLY_ATTRIBUTED'
    active_modes=collections.Counter(m.get('locomotionMode','unknown') for m in motion)
    low=[e for e in rec.get('events',[]) if e.get('type')=='c0d4-mob1-sustained-low-progress'
         and ((e.get('owner') or {}).get('cellId')==CELL)]
    first=motion[0].get('position') if motion else None;last=motion[-1].get('position') if motion else None
    return {'revision':REVISION,'profile':run.get('profile'),'verdict':verdict,
       'observedCells':cells,'siltSampleCount':len(silt),'motionSamples':sum(k=='c0d4-mob1-movement-sample' for _,_,k in silt),
       'neutralSamples':sum(k=='g1d9s-neutral-movement-observation' for _,_,k in silt),
       'startPosition':first,'endPosition':last,'netDisplacement':distance(first,last),
       'attachmentVerdict':contact,'attachedSamples':sum(attached),'attachmentTransitions':[k for k,_ in transitions],
       'surfaceIds':ids,'volumeIds':silt_ids,'locomotionModes':dict(active_modes),
       'maxBoundaryPressure':round(max([float(m.get('boundaryPressure') or 0) for m in motion],default=0),3),
       'maxPeelIntent':round(max([float(a.get('peelIntent01') or 0) for a in attachment],default=0),3),
       'sustainedLowProgressCandidates':[e.get('candidateReason','unknown') for e in low],
       'movementWindows':summaries_by_action(run,samples),
       'rec1Events':len(rec.get('events',[])),'droppedDetails':drop,
       'contactNormalRecorded':False,'liveOwnerSteering':False,
       'limits':['Recorder time sampling can miss brief attachment transitions.',
                 'Debug platform establishes entry, not a natural player route.',
                 'Detachment is a state observation; individual key causation is not proved.']}

def compare(sweep,control):
    if not sweep or not control:return {'verdict':'A_B_INCOMPLETE'}
    if sweep['verdict']!='SILT_DIAGNOSTIC_CAPTURED' or control['verdict']!='SILT_DIAGNOSTIC_CAPTURED':
        return {'verdict':'A_B_UNVERIFIED_ENTRY_OR_CAPTURE'}
    observed=sweep['attachedSamples']+control['attachedSamples']
    status='NO_ATTACHMENT_IN_EITHER_ARM' if not observed else 'DESCRIPTIVE_AB_ONLY_NO_CAUSAL_CLAIM'
    return {'verdict':status,'sweepAttachmentVerdict':sweep['attachmentVerdict'],
      'controlAttachmentVerdict':control['attachmentVerdict'],
      'sweepBoundaryPressure':sweep['maxBoundaryPressure'],'controlBoundaryPressure':control['maxBoundaryPressure'],
      'contract':contract(),'caveat':'Fresh browser contexts are not identical world states; normal and geometry unknown.'}

def analyze(root):
    idx=json.loads((root/'BOT1D11A_RUN_INDEX.json').read_text(encoding='utf-8'))
    rows=[]
    for item in idx.get('runs',[]):
        folder=root/item['folder']
        if not (folder/'RUN.json').is_file() or not (folder/'REC1.json').is_file():
            rows.append({'profile':item.get('profile'),'verdict':'FILES_MISSING'});continue
        run=json.loads((folder/'RUN.json').read_text(encoding='utf-8'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf-8'))
        rows.append(referee(run,rec))
    by={r.get('profile'):r for r in rows}
    a_b=compare(by.get('release_sweep'),by.get('release_control'))
    report={'revision':REVISION,'status':'DIAGNOSTIC_NOT_GAMEPLAY_CERTIFICATION',
       'profilesRequested':idx.get('profilesRequested'),'runs':rows,'abComparison':a_b,
       'noHostReceiptOrLS1LockInferred':True}
    (root/'BOT1D11A_AUDIT.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    lines=['# BOT1-D11A Silt movement diagnostic','',
       'This report contains observed movement/attachment evidence, **not** gameplay certification.','',
       '| Profile | Capture | Silt samples | Attach samples | Contact verdict | Net travel |',
       '|---|---|---:|---:|---|---:|']
    for r in rows:
        lines.append(f"| {r.get('profile')} | {r.get('verdict')} | {r.get('siltSampleCount','?')} | {r.get('attachedSamples','?')} | {r.get('attachmentVerdict','n/a')} | {r.get('netDisplacement','?')} |")
    lines+=['',f"**A/B interpretation:** {a_b.get('verdict')}",'',
      'No contact normal was recorded. Movement outcomes do not demonstrate causal efficacy of individual release keys.',
      'Any absent attachment makes the release question *untested*, not passed.','',
      'See `BOT1D11A_AUDIT.json` for per-window observations, pressure, IDs and input timing.']
    (root/'BOT1D11A_AUDIT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    return report

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('results_dir')
    a=p.parse_args(argv);root=pathlib.Path(a.results_dir).resolve()
    if not root.is_dir():p.error('Missing results directory: '+str(root))
    report=analyze(root)
    for r in report['runs']:
        print(f"{r.get('profile')}: {r.get('verdict')} / samples={r.get('siltSampleCount')} / attachment={r.get('attachmentVerdict')}")
    print('[D11A] A/B:',report['abComparison']['verdict'])
    print('[D11A] Reports:',root/'BOT1D11A_AUDIT.md',root/'BOT1D11A_AUDIT.json')
    return 0
if __name__=='__main__':raise SystemExit(main())
