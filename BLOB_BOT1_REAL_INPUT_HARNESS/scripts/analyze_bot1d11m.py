#!/usr/bin/env python3
"""D11M fixed-input acquisition envelope and observer-effect audit.

Surface eligibility and distance are sampled, not certified continuous truth.
Brush refusal classifications are reconstructed from D11D's pure gate, not
engine refusal codes. Never confuse 0 attached anchors with geometry success.
"""
from __future__ import annotations
import argparse, collections, datetime, json, math, pathlib, statistics
from analyze_bot1d11k import summarize as d11k_summarize
from bot1d11m_policy import REVISION, BRAKE, ARMS, OBSERVERS, schedule

TARGET='SILT_ENTRY_SEDIMENT_SHELF_D11B'
BRUSH_LIMIT=0.46

def number(v): return isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v)
def quant(v,p):
    if not v:return None
    s=sorted(v);position=p*(len(s)-1);lo=int(position);hi=min(len(s)-1,lo+1)
    return round(s[lo]+(s[hi]-s[lo])*(position-lo),3)
def med(v):return round(statistics.median(v),3) if v else None

def mark_ms(trace,label):
    return next((x.get('ms') for x in trace.get('interventions',[]) if x.get('label')==label),None)

def elapsed_ms(time_str1,time_str2):
    try:
        a=datetime.datetime.fromisoformat(time_str1);b=datetime.datetime.fromisoformat(time_str2)
        return round((b-a).total_seconds()*1000,1)
    except (ValueError,TypeError):return None

def classify_acquisition(prior,within,eligible):
    m=prior['firstMilestonesMs']
    if m['attachedOwner'] is not None:return 'ATTACHED'
    if m['supportOwner'] is not None:return 'SUPPORTED_WITHOUT_ATTACHMENT'
    if m['sealOwner'] is not None:return 'SEALED_WITHOUT_SUPPORT'
    if m['reachOwner'] is not None:return 'REACH_WITHOUT_SEAL'
    if m['brushOwner'] is not None:return 'BRUSH_WITHOUT_REACH'
    if within:return 'IN_BRUSH_ENVELOPE_NO_BRUSH'
    if eligible:return 'ELIGIBLE_OUTSIDE_BRUSH_ENVELOPE'
    return 'NO_ELIGIBLE_SHELF_OBSERVED'

def summarize_run(trace,run):
    prior=d11k_summarize(trace,run)
    samples=sorted(trace.get('samples') or [], key=lambda x:x.get('ms',0))
    start=mark_ms(trace,'start:approach_1')
    release=mark_ms(trace,'start:away_vertical')
    # An approach opportunity ends when release input begins. Do not let
    # a late reach during the release experiment count as an acquisition success.
    before_release=[s for s in samples if start is not None and s.get('ms',-1)>=start and
                    (release is None or s.get('ms',-1)<release)]
    def shelf_sample(s):
        sf=s.get('surface') or {}
        return sf.get('surfaceId')==TARGET and sf.get('eligible') is True
    def distance(s):return (s.get('surface') or {}).get('distance')
    all_eligible=[s for s in samples if shelf_sample(s) and number(distance(s))]
    pre_eligible=[s for s in before_release if shelf_sample(s) and number(distance(s))]
    in_envelope=[s for s in pre_eligible if distance(s)<=BRUSH_LIMIT]
    eligible_any=bool(pre_eligible)
    gaps=[samples[i]['ms']-samples[i-1]['ms'] for i in range(1,len(samples))
          if number(samples[i].get('ms')) and number(samples[i-1].get('ms')) and
             samples[i]['ms']>samples[i-1]['ms']]
    frame_deltas=[samples[i]['frame']-samples[i-1]['frame'] for i in range(1,len(samples))
                  if number(samples[i].get('frame')) and number(samples[i-1].get('frame'))]
    # Conservative bound on observed continuous in-envelope runs: count only
    # adjacent true samples and intervals <=200ms. Longer blind intervals aren't proof.
    consecutive_ms=0;best_ms=0;total_certified_ms=0;best_sample_count=0;current_count=0
    for i,s in enumerate(before_release):
        within=shelf_sample(s) and number(distance(s)) and distance(s)<=BRUSH_LIMIT
        if within:
            prev=before_release[i-1] if i else None
            prev_inside=bool(prev and shelf_sample(prev) and number(distance(prev)) and distance(prev)<=BRUSH_LIMIT)
            gap=s.get('ms',0)-prev.get('ms',0) if prev else 0
            if prev_inside and 0<gap<=200:
                consecutive_ms+=gap;total_certified_ms+=gap;current_count+=1
            else:
                consecutive_ms=0;current_count=1
            best_ms=max(best_ms,consecutive_ms)
            best_sample_count=max(best_sample_count,current_count)
        else:
            consecutive_ms=0;current_count=0
    # Estimate only, not a continuous bound, because time between samples is unknown.
    route_duration=[];route_overrun=[]
    for a in run.get('actions') or []:
        actual=elapsed_ms(a.get('startedAt'),a.get('endedAt'))
        if number(actual) and number(a.get('plannedSeconds')):
            expected=a['plannedSeconds']*1000
            route_duration.append(actual);route_overrun.append(actual-expected)
    events=(trace.get('firstFootholdEvents') or {}).get('events') or []
    derived_guard_counts=collections.Counter(e.get('candidateReason') for e in events
        if e.get('type')=='brush_gate_observation' and e.get('candidateReason'))
    max_sample_jump=max(gaps,default=None)
    first_pose=samples[0].get('player') if samples else None
    first_frame=samples[0].get('frame') if samples else None
    first_envelope_ms=in_envelope[0]['ms'] if in_envelope else None
    min_distance_sample=min(pre_eligible,key=lambda x:distance(x)) if pre_eligible else None

    def movement_to_shelf_center():
        # Optional coarse geometric proxy, not a collider signed-distance velocity.
        velocities=[]
        for a,b in zip(before_release,before_release[1:]):
            if not (a.get('player') and b.get('player') and b.get('shelf',{}).get('center')):continue
            dt=(b.get('ms',0)-a.get('ms',0))/1000
            if dt<=0 or dt>.25:continue
            center=b['shelf']['center'];player=b['player']
            radial={k:player[k]-center[k] for k in ('x','y','z')}
            n=math.sqrt(sum(x*x for x in radial.values()))
            if n<.001:continue
            v={k:(b['player'][k]-a['player'][k])/dt for k in ('x','y','z')}
            velocities.append(-sum(v[k]*radial[k] for k in ('x','y','z'))/n)
        return {'medianTowardShelfCenterUnitsPerSec':med(velocities),
                'maximumTowardShelfCenterUnitsPerSec':round(max(velocities),3) if velocities else None,
                'method':'world-space displacement projected toward shelf center; not true signed surface-normal velocity'}
    m=prior['firstMilestonesMs']
    gate=trace.get('releaseGate') or {}
    observer=run.get('observer')
    off=observer=='observer_off'
    owner_valid=(gate.get('revision')=='BOT1-D11L-1' and gate.get('droppedFrames')==0 and
                 (len(gate.get('frames') or [])==0 if off else len(gate.get('frames') or [])>0))
    markers=trace.get('interventions') or []
    mode_marker='release_observer_off' if off else 'release_observer_on'
    marker_valid=any(x.get('label')==mode_marker for x in markers)
    rec=run.get('rec1') or {}
    valid=bool(prior['captureValid'] and run.get('revision')==REVISION and
               observer in OBSERVERS and owner_valid and marker_valid and
               rec.get('events',0)>0 and rec.get('droppedDetails') in (None,0))
    late_reach=m['reachOwner'] is not None and release is not None and m['reachOwner']>=release
    late_brush=m['brushOwner'] is not None and release is not None and m['brushOwner']>=release
    geo_warning=prior.get('geometryClassification') in (
        'SUSPECTED_ORPHANED_ANCHORS','ANCHOR_OFFSET_WARNING_REVIEW','GEOMETRY_MEASUREMENT_GAP')
    return {
        'folder':run.get('folder'),'round':run.get('round'),'profile':run.get('profile'),
        'arm':run.get('arm'),'observer':observer,'captureValid':valid,
        'ownerRecorderConditionValid':owner_valid and marker_valid,
        'recordedReleaseOwnerFrames':len(gate.get('frames') or []),
        'events':rec.get('events',0),'geometryClassification':prior.get('geometryClassification'),
        'geometryGatePassed':prior.get('geometryGatePassed'),
        'geometryWarning':geo_warning,
        'maxAnchorToCarriedMesh':prior.get('maxAnchorToCarriedMesh'),
        'soleSealedPeelViolations':len(prior.get('earlySoloPressurePeels') or []),
        'acquisitionClass':classify_acquisition(prior,bool(in_envelope),eligible_any),
        'acquiredAtAnyTime':m['attachedOwner'] is not None,
        'acquiredBeforeRelease':m['attachedOwner'] is not None and (release is None or m['attachedOwner']<release),
        'deliberateRelease':bool(prior['release']['deliberateOwnerTransition'] and prior['release']['freeAfterDeliberateTransition']),
        'lateBrushAfterReleaseStart':late_brush,'lateReachAfterReleaseStart':late_reach,
        'firstMilestonesMs':m,
        'initialSamplePose':first_pose,'initialSampleFrame':first_frame,
        'acquisitionEnvelope':{
            'thresholdUnits':BRUSH_LIMIT,
            'firstEligibleSampleBeforeReleaseMs':pre_eligible[0]['ms'] if pre_eligible else None,
            'firstInsideBrushSampleBeforeReleaseMs':first_envelope_ms,
            'closestEligibleSampleBeforeReleaseMs':min_distance_sample['ms'] if min_distance_sample else None,
            'approachStartMs':start,'releaseInputStartMs':release,
            'eligibleSampleCountBeforeRelease':len(pre_eligible),
            'eligibleSampleCountWholeRun':len(all_eligible),
            'minEligibleDistanceBeforeRelease':round(min((distance(s) for s in pre_eligible),default=math.inf),4) if pre_eligible else None,
            'minEligibleDistanceWholeRun':round(min((distance(s) for s in all_eligible),default=math.inf),4) if all_eligible else None,
            'envelopeSampleCountBeforeRelease':len(in_envelope),
            'sampledConsecutiveEnvelopeSpanMs':best_ms,
            'sampledAdjacentEnvelopeTimeMs':total_certified_ms,
            'maxConsecutiveEnvelopeSamples':best_sample_count,
            'timeSamplingLimitation':'Values only bound observed adjacent samples, not a continuous contact interval.'},
        'timing':{'medianSampleGapMs':med(gaps),'p90SampleGapMs':quant(gaps,.90),
                  'maximumSampleGapMs':max_sample_jump,
                  'gapsOver150Ms':sum(g>150 for g in gaps),
                  'sampleCount':len(samples),'frameDeltaMedian':med(frame_deltas),
                  'medianRouteActionOverrunMs':med(route_overrun),
                  'p90RouteActionOverrunMs':quant(route_overrun,.90)},
        'approachMotion':movement_to_shelf_center(),
        'derivedBrushGuardReasonCounts':dict(derived_guard_counts),
        'preReleaseDerivedBrushGuardReasonCounts':dict(collections.Counter(
            e.get('candidateReason') for e in events
            if e.get('type')=='brush_gate_observation' and e.get('candidateReason') and
               (release is None or e.get('ms',-1)<release))),
        'caveat':'Guard reasons are modeled from D11D; D11L observer off restores one diagnostic wrapper, not all recording overhead.'}


def audit(root):
    root=pathlib.Path(root)
    index_path=root/'BOT1D11M_RUN_INDEX.json'
    index=json.loads(index_path.read_text('utf-8')) if index_path.is_file() else {}
    pairs=index.get('pairs')
    expected=schedule(pairs) if isinstance(pairs,int) and 1<=pairs<=7 else ()
    rows=[]
    for path in sorted(root.glob('*/RUN.json')):
        run=json.loads(path.read_text('utf-8'))
        tf=path.parent/'D11C_TRACE.json'
        trace=json.loads(tf.read_text('utf-8')) if tf.is_file() else {}
        row=summarize_run(trace,run);row['folder']=path.parent.name;rows.append(row)
    actual=[(x['round'],x['profile'],x['arm'],x['observer']) for x in rows]
    matrix=bool(expected and collections.Counter(actual)==collections.Counter(expected))
    complete=matrix and all(x['captureValid'] for x in rows)
    groups={}
    for obs in OBSERVERS:
        for arm in ARMS:
            key=obs+'/'+arm
            group=[x for x in rows if x['profile']==BRAKE and x['arm']==arm and x['observer']==obs]
            groups[key]={'runs':len(group),
                'attachedBeforeRelease':sum(x['acquiredBeforeRelease'] for x in group),
                'released':sum(x['deliberateRelease'] for x in group),
                'outsideEnvelope':sum(x['acquisitionClass']=='ELIGIBLE_OUTSIDE_BRUSH_ENVELOPE' for x in group),
                'noEligible':sum(x['acquisitionClass']=='NO_ELIGIBLE_SHELF_OBSERVED' for x in group),
                'medianMinDistance':med([x['acquisitionEnvelope']['minEligibleDistanceBeforeRelease'] for x in group
                                         if number(x['acquisitionEnvelope']['minEligibleDistanceBeforeRelease'])]),
                'medianSampleGapMs':med([x['timing']['medianSampleGapMs'] for x in group
                                         if number(x['timing']['medianSampleGapMs'])]),
                'medianActionOverrunMs':med([x['timing']['medianRouteActionOverrunMs'] for x in group
                                             if number(x['timing']['medianRouteActionOverrunMs'])]),
                'classifications':dict(collections.Counter(x['acquisitionClass'] for x in group))}
    # Pairwise per round comparisons, not a randomized clinical A/B test.
    matched=[]
    for rnd in range(1,(pairs or 0)+1):
        for obs in OBSERVERS:
            left=next((r for r in rows if r['round']==rnd and r['profile']==BRAKE and r['observer']==obs and r['arm']=='baseline'),None)
            right=next((r for r in rows if r['round']==rnd and r['profile']==BRAKE and r['observer']==obs and r['arm']=='neutral_counter'),None)
            if left and right:
                l=left['acquisitionEnvelope']['minEligibleDistanceBeforeRelease']
                r=right['acquisitionEnvelope']['minEligibleDistanceBeforeRelease']
                matched.append({'round':rnd,'observer':obs,
                    'baselineAttached':left['acquiredBeforeRelease'],'neutralAttached':right['acquiredBeforeRelease'],
                    'baselineMinEligibleDistance':l,'neutralMinEligibleDistance':r,
                    'neutralMinusBaselineDistance':round(r-l,4) if number(l) and number(r) else None,
                    'baselineMedianGapMs':left['timing']['medianSampleGapMs'],
                    'neutralMedianGapMs':right['timing']['medianSampleGapMs']})
    controls=[r for r in rows if r['profile'] in ('host_positive','away_control')]
    refs=[r for r in rows if r['profile'] in ('natural_reference','natural_feather')]
    geometry_failure=[r['folder'] for r in rows if r['geometryWarning'] or r['soleSealedPeelViolations']]
    result={'revision':REVISION,'matrixComplete':matrix,'capturesComplete':complete,
        'runsCaptured':len(rows),'pairs':pairs,'brakeGroups':groups,'matchedBrakePairs':matched,
        'controlResults':[{'profile':r['profile'],'observer':r['observer'],
                           'classification':r['geometryClassification'],
                           'geometryGatePassed':r['geometryGatePassed'],
                           'captureValid':r['captureValid']} for r in controls],
        'referenceResults':[{'profile':r['profile'],'observer':r['observer'],
                             'acquiredBeforeRelease':r['acquiredBeforeRelease'],
                             'deliberateRelease':r['deliberateRelease']} for r in refs],
        'geometryOrPeelWarnings':geometry_failure,
        'rows':rows,
        'decision':'REVIEW_ACQUISITION_ENVELOPE_AND_OBSERVER_EFFECT' if complete else 'INCOMPLETE_D11M_EVIDENCE',
        'notALock':'Diagnostic-only matched observational comparisons. Does not certify LS1, alter physics or prove recorder causation.',
        'observationLimits':'Only D11L release owner wrapper is disabled in observer_off. Other probes, REC1, browser and scripting overhead remain; starts are uncontrolled natural debug entries.'}
    return result


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('root');args=p.parse_args(argv)
    root=pathlib.Path(args.root)
    if not root.is_dir():p.error('Results directory not found')
    result=audit(root)
    out=root/'BOT1D11M_AUDIT.json';out.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(f"D11M runs={result['runsCaptured']} matrix={result['matrixComplete']} captures={result['capturesComplete']}")
    for k,v in result['brakeGroups'].items():
        print(f"  {k}: acquired {v['attachedBeforeRelease']}/{v['runs']} median_min_eligible={v['medianMinDistance']} median_gap_ms={v['medianSampleGapMs']}")
    print(f"Geometry / premature peel warnings: {len(result['geometryOrPeelWarnings'])}")
    print('Audit:',out)
    return 0 if result['capturesComplete'] else 2

if __name__=='__main__':raise SystemExit(main())
