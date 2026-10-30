#!/usr/bin/env python3
"""G1-D9S strictly offline owner-REFEREE for neutral and movement REC1.

Never imported by online bot. Evaluation reads true movement owner only after
fixed camera/translation trial sequence is complete.
"""
from __future__ import annotations
import argparse,csv,datetime,json,math,pathlib,statistics

def load_run(folder):
    recpath=folder/'REC1.json'
    checkpoint=False
    if recpath.exists():
        data=json.loads(recpath.read_text(encoding='utf-8'))
    else:
        candidates=[]
        for p in folder.glob('REC1_CHECKPOINT_*.json'):
            try:
                x=json.loads(p.read_text(encoding='utf-8'))
                if x.get('events'):candidates.append(x)
            except (ValueError,OSError):pass
        if not candidates:return None,None,False
        data=max(candidates,key=lambda x:len(x.get('events',[])))
        checkpoint=True
    runpath=folder/'RUN.json'
    run=json.loads(runpath.read_text(encoding='utf-8')) if runpath.exists() else {}
    return data,run,checkpoint

NEUTRAL_EVENT='g1d9s-neutral-movement-observation'
MOVE_EVENT='c0d4-mob1-movement-sample'

def timestamp(t):
    try:return datetime.datetime.fromisoformat(t.replace('Z','+00:00')).timestamp()
    except (AttributeError,ValueError,TypeError):return None

def all_owner_samples(rec):
    out=[]
    for e in rec.get('events',[]):
        if e.get('type') not in (MOVE_EVENT,NEUTRAL_EVENT):continue
        t=timestamp(e.get('time'));owner=e.get('owner') or {};m=owner.get('motion') or {}
        pos=m.get('position') or {};inp=owner.get('input') or {}
        if t is None or any(not isinstance(pos.get(k),(int,float)) for k in ('x','y','z')):continue
        v=lambda k:float(inp.get(k) or 0.)
        out.append({'t':t,'kind':'neutral' if e['type']==NEUTRAL_EVENT else 'move',
           'xyz':tuple(float(pos[k]) for k in ('x','y','z')),
           'attachment':bool((owner.get('attachment') or {}).get('active')),
           'inputMagnitude':math.sqrt(v('moveX')**2+v('moveY')**2+v('moveZ')**2),
           'boundary':float(m.get('c0e2bNormalizedBoundaryDistance') or 0.),
           'pressure':float(m.get('boundaryPressure') or 0.),
           'cell':owner.get('cellId','none')})
    return sorted(out,key=lambda x:x['t'])

def pair(probe,samples):
    start,end=timestamp(probe.get('atStart')),timestamp(probe.get('atEnd'))
    if start is None or end is None or end<start:
        return {'coverage':'INVALID_TIMESTAMPS','n':0}
    inside=[s for s in samples if start<=s['t']<=end]
    if len(inside)<2:
        return {'coverage':'INSUFFICIENT_IN_TRIAL_SAMPLES','n':len(inside)}
    first,last=inside[0],inside[-1]
    dt=last['t']-first['t']
    if dt<=0:return {'coverage':'ZERO_OWNER_SAMPLE_INTERVAL','n':len(inside)}
    observed=math.dist(first['xyz'],last['xyz'])
    attach= ('attached' if all(s['attachment'] for s in inside) else
             'free' if all(not s['attachment'] for s in inside) else 'mixed')
    cells={s['cell'] for s in inside}
    requested=probe.get('kind')
    all_neutral=all(s['inputMagnitude']<.12 for s in inside)
    all_motion=all(s['inputMagnitude']>=.55 for s in inside)
    if len(cells)>1:status='REGION_TRANSITION'
    elif attach=='mixed':status='ATTACHMENT_CHANGED'
    elif requested in ('look','idle') and not all_neutral:status='MOVEMENT_INPUT_CONTAMINATED'
    elif requested=='move' and not all_motion:status='INPUT_UNCERTAIN'
    elif attach=='attached':status='PAIRED_ATTACHED'
    else:status='PAIRED_FREE'
    return {'coverage':status,'n':len(inside),'ownerSeconds':round(dt,3),
       'partialNetDisplacement':round(observed,3),
       'partialNetSpeed':round(observed/dt,3),
       'vectorXYZ':[round(last['xyz'][i]-first['xyz'][i],3) for i in range(3)],
       'attachmentClass':attach,'inputNeutralAcrossSamples':all_neutral,
       'inputActiveAcrossSamples':all_motion,
       'avgBoundaryPressure':round(statistics.mean(s['pressure'] for s in inside),4),
       'maxBoundaryDistance':round(max(s['boundary'] for s in inside),4),
       'partialActionCoverage':round(dt/max(.001,end-start),3),
       'limitation':'Start/end are internal REC1 sample times; environmental flow and motion history may contribute.'}

def evaluate(rec,run,checkpoint=False):
    samples=all_owner_samples(rec)
    rows=[]
    for probe in run.get('probes',[]):
        row={k:probe.get(k) for k in ('index','kind','heading','key','label','atStart','atEnd')}
        row.update(pair(probe,samples));rows.append(row)
    by_kind=lambda k:[r for r in rows if r['kind']==k]
    qualified=lambda k:[r for r in by_kind(k) if r['coverage']=='PAIRED_FREE']
    n_neutral=sum(s['kind']=='neutral' for s in samples)
    n_move=sum(s['kind']=='move' for s in samples)
    if not n_neutral:gate='OBSERVER_NOT_INSTALLED_OR_NO_NEUTRAL_SAMPLES'
    elif not run.get('calibrationStarted'):gate='INVITATION_NOT_EARNED'
    elif len(rows)<len(__import__('bot1d9s_protocol').course()):gate='INCOMPLETE_COURSE'
    elif len(qualified('look'))<2:gate='LOOK_ONLY_NOT_FREE_PAIRED'
    elif len(qualified('idle'))<3:gate='AMBIENT_BASELINE_NOT_FREE_PAIRED'
    elif len(qualified('move'))<2:gate='FREE_TRANSLATION_NOT_SUFFICIENTLY_PAIRED'
    else:gate='PAIRED_NEUTRAL_AND_TRANSLATION_REFERENCE_READY'
    summary={k:{'count':len(by_kind(k)),
        'freePairs':len(qualified(k)),
        'medianPartialSpeedFree':round(statistics.median(r['partialNetSpeed'] for r in qualified(k)),3) if qualified(k) else None}
        for k in ('idle','look','move')}
    return {'revision':'BOT1-D9S-OFFLINE-REFEREE','status':run.get('status'),
       'captureCheckpointOnly':checkpoint,'eventCount':len(rec.get('events',[])),
       'neutralOwnerSamples':n_neutral,'activeMovementOwnerSamples':n_move,
       'probeCount':len(rows),'calibrationCoverageGate':gate,
       'summary':summary,
       'ownerReadingsNeverUsedToChooseBotActions':True,
       'FoldApproachProven':any(e.get('type')=='bot1d-listening-fold-owner-state' and
           ((e.get('state') or {}).get('inApproach') or (e.get('state') or {}).get('stageIndex',0)>=1)
           for e in rec.get('events',[])),
       'limitations':[
          'D9S is measurement only, not navigation or semantic landmark recognition.',
          'Look/idle owner pairs are read-only evidence of partial displacement, not zero-motion guarantees.',
          'Camera yaw/pitch is not exposed: timed look inputs do not certify actual camera angle.',
          'Environmental flow and previous velocity contaminate measured displacement.',
          'Surface-attached and cross-cell trials are excluded from free-movement calibration.',
          'No owner state, Fold bearing or camera transforms influence browser action choices.',
          'Partial displacement is between samples inside a trial, not exactly at input edges.'
       ],'trials':rows}

def markdown(result):
    d=result;lines=['# G1-D9S — neutral-motion and movement calibration','',
        f"**Coverage gate:** `{d['calibrationCoverageGate']}`",'',
        '| Owner recorder evidence | Value |','|---|---:|',
        f"| REC1 events | {d['eventCount']} |",
        f"| Neutral owner samples | {d['neutralOwnerSamples']} |",
        f"| Active movement owner samples | {d['activeMovementOwnerSamples']} |",
        f"| Calibration trials | {d['probeCount']} |",
        f"| Fold approach owner-certified | {d['FoldApproachProven']} |",'',
        '| Trial | Kind | Heading | Owner pairs | Attachment/input evidence | Partial displacement |',
        '|---:|---|---|---|---|---:|']
    for r in d['trials']:
        lines.append(f"| {r['index']} | {r['kind']} | {r['heading']} | {r['n']} | {r['coverage']} | {r.get('partialNetDisplacement','unknown')} |")
    lines+=['','## Proof restrictions','']+['- '+x for x in d['limitations']]
    return '\n'.join(lines)+'\n'

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('results_folder');a=p.parse_args()
    root=pathlib.Path(a.results_folder)
    if not root.is_dir():p.error('Results folder missing: '+str(root))
    dirs=sorted(x for x in root.iterdir() if x.is_dir() and x.name.startswith('BOT1D9S_'))
    if not dirs:p.error('No BOT1D9S_ folders found')
    outputs=[]
    for folder in dirs:
        rec,run,checkpoint=load_run(folder)
        if rec is None:outputs.append({'folder':folder.name,'status':'NO_REC1'});continue
        result=evaluate(rec,run,checkpoint);result['folder']=folder.name;outputs.append(result)
        (folder/'D9S_EVIDENCE.md').write_text(markdown(result),encoding='utf-8')
        with (folder/'D9S_TRIALS.csv').open('w',encoding='utf-8',newline='') as f:
            fields=['index','kind','heading','key','label','atStart','atEnd','coverage','n','ownerSeconds','partialNetDisplacement','partialNetSpeed','vectorXYZ','attachmentClass','inputNeutralAcrossSamples','inputActiveAcrossSamples','avgBoundaryPressure','maxBoundaryDistance','partialActionCoverage']
            writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');writer.writeheader();writer.writerows(result['trials'])
        print(folder.name,result['calibrationCoverageGate'],
             'neutral owner observations:',result['neutralOwnerSamples'],
             'free look:',result['summary']['look']['freePairs'],
             'free movement:',result['summary']['move']['freePairs'])
    (root/'BOT1D9S_EVIDENCE.json').write_text(json.dumps(outputs,indent=2),encoding='utf-8')
    return 2 if any(x.get('status')=='NO_REC1' for x in outputs) else 0
if __name__=='__main__':raise SystemExit(main())
