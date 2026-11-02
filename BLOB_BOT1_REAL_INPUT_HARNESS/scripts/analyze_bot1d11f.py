#!/usr/bin/env python3
"""Score D11F anchor geometry without treating persistent surface IDs as contact proof."""
from __future__ import annotations
import argparse, json, pathlib, statistics

TARGET = 'SILT_ENTRY_SEDIMENT_SHELF_D11B'
SUSPECT_ANCHOR_DISTANCE = 0.35  # diagnostic threshold, not gameplay physics
REMOTE_PLAYER_DISTANCE = 1.0     # indicates player no longer close to isolated shelf
SUSTAINED_WARNING_MS = 250
TETHER_WARNING_DISTANCE = 1.2


def anchored(s):
    return bool((s.get('attachment') or {}).get('active'))

def eligible(s):
    t=s.get('surface') or {}
    return bool(t.get('valid') and t.get('eligible') and t.get('surfaceId') == TARGET)

def summarize_trace(trace, run):
    profile = run.get('profile','unknown')
    samples=sorted(trace.get('samples',[]),key=lambda s:s.get('ms',0))
    if run.get('status') != 'CAPTURED' or run.get('errors') or not samples:
        return {'profile':profile, 'classification':'CAPTURE_INCOMPLETE','gatePassed':False,'samples':len(samples)}
    if run.get('controlledDebugStart') or run.get('ownerDataUsedForSteering'):
        return {'profile':profile,'classification':'DISQUALIFIED_NONNATURAL_OR_STEERED','gatePassed':False,'samples':len(samples)}
    if any('continuity' not in s for s in samples):
        return {'profile':profile,'classification':'MISSING_D11F_GEOMETRY_PROBE','gatePassed':False,'samples':len(samples)}
    active=[s for s in samples if anchored(s)]
    sampled_support=[s for s in active if s.get('plane',{}).get('active') and s.get('contact',{}).get('sealed',0)>0]
    bad=[]; remote=[]; unknown=[]; no_truth=[]; measured=[]; stretched=[]
    for s in active:
        c=s['continuity']
        if not eligible(s):no_truth.append(s)
        p=c.get('playerToCarriedMesh') or {}
        if p.get('status')=='measured' and p.get('distance') is not None and p['distance'] > REMOTE_PLAYER_DISTANCE:remote.append(s)
        # Transition frames before seals form aren't spatial-support proof or failures.
        if s not in sampled_support:continue
        if not c.get('readOnly',False): unknown.append(s)
        planted=[a for a in c.get('anchors',[]) if a.get('planted')]
        if any(a.get('geometry',{}).get('status')!='measured' for a in planted) or (not planted): unknown.append(s)
        valid=[a for a in planted if a.get('geometry',{}).get('status')=='measured']
        if valid: measured.append(s)
        if any(a.get("playerToAnchor",0) > TETHER_WARNING_DISTANCE for a in valid): stretched.append(s)
        if any(a['geometry']['distance'] > SUSPECT_ANCHOR_DISTANCE for a in valid): bad.append(s)
    def duration(items):
        # Integrate contiguous sample intervals bounded to 200 ms each (a dropped sample never makes a long event).
        stamps={s.get('ms') for s in items}
        return sum(min(200,max(0, nxt.get('ms',0)-s.get('ms',0))) for s,nxt in zip(samples,samples[1:]) if s.get('ms') in stamps)
    far_times=duration(remote); bad_times=duration(bad); absent_times=duration(no_truth); stretched_times=duration(stretched)
    all_dists=[a['geometry']['distance'] for s in active for a in s['continuity'].get('anchors',[])
        if a.get('planted') and a.get('geometry',{}).get('status')=='measured']
    is_silt=profile.startswith('natural_')
    if profile=='away_control':
        classification='AWAY_CONTROL_CLEAR' if not any((s['continuity'].get('carriedId')==TARGET) for s in active) else 'UNEXPECTED_AWAY_ATTACHMENT'
    elif not active:
        classification='NO_ATTACHMENT_OBSERVED'
    elif not sampled_support:
        classification='NO_SUPPORTED_ATTACHMENT'
    elif unknown:
        classification='GEOMETRY_MEASUREMENT_GAP'
    elif (bad_times>=SUSTAINED_WARNING_MS and far_times>=SUSTAINED_WARNING_MS) or (stretched_times>=SUSTAINED_WARNING_MS and far_times>=SUSTAINED_WARNING_MS):
        classification='SUSPECTED_ORPHANED_ANCHORS'
    elif bad:
        classification='ANCHOR_OFFSET_WARNING_REVIEW'
    else:
        classification='NO_GEOMETRY_OFFSET_WARNING_OBSERVED'
    # A diagnostic classification is not a gameplay lock. All runs still need repeated review.
    return {'profile':profile,'classification':classification,'gatePassed':classification in ('AWAY_CONTROL_CLEAR','NO_GEOMETRY_OFFSET_WARNING_OBSERVED'),
        'samples':len(samples),'attachmentSamples':len(active),'supportedAttachmentSamples':len(sampled_support),
        'measuredAnchorSamples':len(measured),'badAnchorSamples':len(bad),'unmeasurableSamples':len(set(id(s) for s in unknown)),
        'playerFarSamples':len(remote),'stretchedTetherSamples':len(stretched),'missingLiveTruthSamples':len(no_truth),
        'maxAnchorToCarriedMesh':round(max(all_dists),4) if all_dists else None,
        'medianAnchorToCarriedMesh':round(statistics.median(all_dists),4) if all_dists else None,
        'anchorOffsetWarningMs':bad_times,'playerFarMs':far_times,'tetherStretchWarningMs':stretched_times,'missingLiveTruthMs':absent_times,
        'warningThreshold':SUSPECT_ANCHOR_DISTANCE,'remoteThreshold':REMOTE_PLAYER_DISTANCE,'tetherWarningThreshold':TETHER_WARNING_DISTANCE,
        'notes':'Geometry distance is exact to authored mesh triangles; tolerance is a diagnostic warning, not a physics-rule assertion.'}


def analyze_root(root):
    records=[]
    for path in sorted(pathlib.Path(root).glob('*/RUN.json')):
        folder=path.parent
        run=json.loads(path.read_text(encoding='utf-8'))
        tp=folder/'D11C_TRACE.json'
        trace=json.loads(tp.read_text(encoding='utf-8')) if tp.exists() else {}
        row=summarize_trace(trace,run);row['folder']=folder.name
        records.append(row)
    required={'host_positive','natural_reference','natural_feather','natural_brake','away_control'}
    counts={profile:sum(row['profile']==profile for row in records) for profile in required}
    complete=counts.get('host_positive',0)>=1 and counts.get('away_control',0)>=1 and all(counts.get(p,0)>=3 for p in ('natural_reference','natural_feather','natural_brake'))
    classes={}
    for row in records:classes[row['classification']]=classes.get(row['classification'],0)+1
    result={'revision':'BOT1-D11F-1','completeMatrix':complete,'plannedRepeatability':'3 per natural profile, HC+Away once',
        'runCounts':counts,'classificationCounts':classes,'runs':records,
        'decision':'REVIEW_GEOMETRIC_EVIDENCE' if complete else 'INCOMPLETE_MATRIX',
        'warning':'No automatic drivetrain lock; inspect any suspect, missing, and offset warnings before altering code.'}
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root',help='D11F browser output directory')
    args=parser.parse_args()
    root=pathlib.Path(args.root)
    if not root.is_dir():parser.error('Result directory missing')
    report=analyze_root(root)
    (root/'BOT1D11F_AUDIT.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print('D11F runs:',len(report['runs']),'| matrix complete:',report['completeMatrix'])
    for row in report['runs']:
        print(f"  {row['profile']}: {row['classification']} | anchor max={row.get('maxAnchorToCarriedMesh')} | offset ms={row.get('anchorOffsetWarningMs')} | remote ms={row.get('playerFarMs')}")
    print('Audit:',root/'BOT1D11F_AUDIT.json')
    return 0 if report['completeMatrix'] and all(r['classification'] not in ('CAPTURE_INCOMPLETE','MISSING_D11F_GEOMETRY_PROBE') for r in report['runs']) else 2

if __name__=='__main__':raise SystemExit(main())
