#!/usr/bin/env python3
"""D11K audit: separate Brake acquisition from fixed-input release success.

Uses D11F authored mesh triangles and D11I owner-call evidence. Release comparisons
only count when the Core was already attached; no movement steering from telemetry.
This diagnostic does NOT certify the full D11M cross-region gate.
"""
from __future__ import annotations
import argparse, collections, json, pathlib
from analyze_bot1d11f import summarize_trace as geometry_summary
from bot1d11k_policy import REVISION, schedule, BRAKE, ARMS

TARGET='SILT_ENTRY_SEDIMENT_SHELF_D11B'


def event_at(events, name, predicate=lambda e:True):
    return next((e.get('ms') for e in events if e.get('type')==name and predicate(e)),None)


def release_marks(trace):
    marks=trace.get('interventions') or []
    def one(label):
        return next((m.get('ms') for m in marks if m.get('label')==label),None)
    return one('start:away_vertical'),one('end:away_vertical')


def summarize(trace, run):
    samples=sorted(trace.get('samples') or [],key=lambda s:s.get('ms',0))
    fo=trace.get('firstFootholdEvents') or {}
    events=sorted(fo.get('events') or [],key=lambda e:e.get('ms',0))
    geo=geometry_summary(trace,run)
    start,end=release_marks(trace)
    in_release=[s for s in samples if start is not None and end is not None and start<=s.get('ms',-1)<=end]
    attached_pre=[s for s in samples if start is not None and start-350<=s.get('ms',-1)<=start and (s.get('attachment') or {}).get('active')]
    attached_during=[s for s in in_release if (s.get('attachment') or {}).get('active')]
    rel_events=[e for e in events if e.get('type')=='movement_attachment_transition'
                and (e.get('after') or {}).get('reason')=='deliberate_away_input'
                and (start is None or e.get('ms',-1)>=start-200)]
    armed_samples=[s for s in in_release if (s.get('attachment') or {}).get('releaseArmed')]
    peak=max(((s.get('attachment') or {}).get('peelIntent') or 0) for s in in_release) if in_release else None
    release_normals=[s['plane']['normal'] for s in in_release if (s.get('plane') or {}).get('active')
                     and isinstance((s.get('plane') or {}).get('normal'),dict)]
    first_reach=event_at(events,'reach_attempt',lambda e:e.get('outcome')=='began_reaching')
    first_seal=event_at(events,'tendril_phase_transition',
                        lambda e:e.get('to')=='sealed' and (e.get('after') or {}).get('anchorSurface')==TARGET)
    first_support=event_at(events,'support_plane_transition',
                           lambda e:(e.get('after') or {}).get('active') and (e.get('after') or {}).get('surfaceId')==TARGET)
    first_attached=event_at(events,'movement_attachment_transition',lambda e:(e.get('after') or {}).get('active'))
    first_brush=event_at(events,'embodiment_contact_transition',lambda e:e.get('to')=='brushing')
    first_eligible=next((s.get('ms') for s in samples if (s.get('surface') or {}).get('eligible') and
                          (s.get('surface') or {}).get('surfaceId')==TARGET),None)
    solo=[];sealed=set()
    for ev in events:
        if ev.get('type')=='tendril_phase_transition':
            before=ev.get('before') or {};after=ev.get('after') or {};idx=after.get('index',before.get('index'))
            if ev.get('to')=='sealed' and after.get('anchorSurface') not in (None,'none'):
                sealed.add(idx)
            if ev.get('from')=='sealed' and ev.get('to')!='sealed':
                sealed.discard(idx)
        if ev.get('type')=='peel_attempt':
            before=ev.get('before') or {};idx=before.get('index')
            if ev.get('strideDestinationProvided') and before.get('phase')=='sealed' and idx in sealed and len(sealed)<=1:
                solo.append({'ms':ev.get('ms'),'index':idx})
            sealed.discard(idx)
    valid_run=(run.get('status')=='CAPTURED' and not run.get('errors') and
               not run.get('ownerDataUsedForSteering') and not run.get('controlledDebugStart') and
               fo.get('revision')=='BOT1-D11I-1' and fo.get('hooked') is True and fo.get('droppedEvents')==0 and
               all('continuity' in s for s in samples) and bool((trace.get('firstFoothold') or {}).get('samples')))
    attached_at_release=bool(attached_pre or attached_during)
    deliberate=bool(rel_events)
    free_after=any((e.get('after') or {}).get('state')=='free' for e in rel_events)
    if run.get('profile') in ('host_positive','away_control'):
        interpretation='CONTROL_GEOMETRY_PASS' if valid_run and geo.get('gatePassed') else 'CONTROL_REVIEW'
    elif not valid_run:interpretation='INCOMPLETE_OR_UNQUALIFIED_CAPTURE'
    elif first_attached is None:interpretation='ACQUISITION_NO_ATTACHMENT'
    elif start is None or end is None:interpretation='RELEASE_INTERVAL_UNMARKED'
    elif not attached_at_release:interpretation='RELEASE_NOT_TESTABLE_NOT_ATTACHED_AT_INPUT'
    elif deliberate and free_after:interpretation='DELIBERATE_RELEASE_AND_FREE_OBSERVED'
    elif deliberate:interpretation='DELIBERATE_RELEASE_TRANSITION_INCOMPLETE'
    else:interpretation='ATTACHED_NO_DELIBERATE_RELEASE_OBSERVED'
    return {'profile':run.get('profile'),'arm':run.get('arm'),'round':run.get('round'),
      'status':run.get('status'),'captureValid':bool(valid_run),'interpretation':interpretation,
      'geometryClassification':geo.get('classification'),'geometryGatePassed':geo.get('gatePassed'),
      'maxAnchorToCarriedMesh':geo.get('maxAnchorToCarriedMesh'),
      'supportedAttachmentSamples':geo.get('supportedAttachmentSamples',0),
      'earlySoloPressurePeels':solo,'ownerEventCount':len(events),
      'ownerEventDrops':fo.get('droppedEvents'),'firstMilestonesMs':{
          'eligibleSampled':first_eligible,'brushOwner':first_brush,
          'reachOwner':first_reach,'sealOwner':first_seal,'supportOwner':first_support,
          'attachedOwner':first_attached},
      'gateReasonCandidates':dict(collections.Counter(e.get('candidateReason') for e in events
                              if e.get('type')=='brush_gate_observation')),
      'release':{'startMs':start,'endMs':end,
        'attachedNearInput':attached_at_release,'attachedSamplesDuringInput':len(attached_during),
        'maxSampledPeelIntent':round(peak,4) if peak is not None else None,
        'releaseArmedSampleCount':len(armed_samples),'deliberateOwnerTransition':deliberate,
        'freeAfterDeliberateTransition':free_after,
        'firstActiveSupportNormalDuringInput':release_normals[0] if release_normals else None,
        'lastActiveSupportNormalDuringInput':release_normals[-1] if release_normals else None},
      'notes':['Owner events are actual method/state observations; brush reasons are inferred diagnostic labels.',
               'Release direction is a FIXED KEY, not computed from surface normal; normals are read-only evidence.',
               'An unattached run cannot prove or disprove a release direction.']}


def audit(root):
    root=pathlib.Path(root)
    index_file=root/'BOT1D11K_RUN_INDEX.json'
    index=json.loads(index_file.read_text('utf-8')) if index_file.exists() else {}
    rounds=index.get('rounds')
    rows=[]
    for file in sorted(root.glob('*/RUN.json')):
        run=json.loads(file.read_text('utf-8'))
        path=file.parent/'D11C_TRACE.json'
        trace=json.loads(path.read_text('utf-8')) if path.exists() else {}
        row=summarize(trace,run);row['folder']=file.parent.name;rows.append(row)
    if rounds not in (1,2,3):
        rounds=max((int(r.get('round') or 0) for r in rows),default=0)
    expected=list(schedule(rounds)) if rounds in (1,2,3) else []
    observed=[(r['round'],r['profile'],r['arm']) for r in rows]
    complete=collections.Counter(expected)==collections.Counter(observed) and bool(expected)
    natural=[r for r in rows if r['profile']==BRAKE]
    reference=[r for r in rows if r['profile'] in ('natural_reference','natural_feather')]
    controls=[r for r in rows if r['profile'] in ('host_positive','away_control')]
    summary={}
    for arm in ARMS:
        arm_rows=[r for r in natural if r['arm']==arm]
        summary[arm]={'runs':len(arm_rows),
         'acquired':sum(r['firstMilestonesMs']['attachedOwner'] is not None for r in arm_rows),
         'releaseTestable':sum(r['release']['attachedNearInput'] for r in arm_rows),
         'deliberateAndFree':sum(r['release']['deliberateOwnerTransition'] and
                               r['release']['freeAfterDeliberateTransition'] for r in arm_rows),
         'geometryWarnings':sum(r['geometryClassification'] in
               ('SUSPECTED_ORPHANED_ANCHORS','ANCHOR_OFFSET_WARNING_REVIEW','GEOMETRY_MEASUREMENT_GAP') for r in arm_rows)}
    captureValid=complete and all(r['captureValid'] for r in rows)
    return {'revision':REVISION,'matrixComplete':complete,'captureValid':captureValid,
      'runsCaptured':len(rows),'roundsObserved':rounds,'brakeComparison':summary,
      'referenceCaptured':len(reference),'controlCaptured':len(controls),
      'earlySoloPressurePeelCount':sum(len(r['earlySoloPressurePeels']) for r in rows),
      'rows':rows,'decision':'REVIEW_D11K_BRAKE_CAUSES' if captureValid else 'INCOMPLETE_D11K_EVIDENCE',
      'notALock':'D11K is diagnosis only. Do not change runtime or lock LS1 from this exploratory matrix.',
      'caveat':'A no-counter input is a duration-matched intervention; release key comparisons are FIXED AXIS tests, not physically normal-aligned steering. Controls and geometry must be reviewed.'}


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('root');args=p.parse_args(argv)
    root=pathlib.Path(args.root)
    if not root.is_dir():p.error('Missing results directory')
    result=audit(root)
    dest=root/'BOT1D11K_AUDIT.json';dest.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(f"D11K matrix={result['matrixComplete']} captures={result['runsCaptured']} captureValid={result['captureValid']}")
    for arm,x in result['brakeComparison'].items():
        print(f"  {arm}: attached {x['acquired']}/{x['runs']}, release testable {x['releaseTestable']}, deliberate/free {x['deliberateAndFree']}")
    for r in result['rows']:
        print(f"  r{r['round']} {r['profile']}/{r['arm']}: {r['interpretation']} geometry={r['geometryClassification']}")
    print('Audit:',dest)
    return 0 if result['captureValid'] else 2

if __name__=='__main__':raise SystemExit(main())
