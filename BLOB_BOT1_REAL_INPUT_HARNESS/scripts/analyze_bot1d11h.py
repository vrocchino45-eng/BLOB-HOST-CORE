#!/usr/bin/env python3
"""D11H first-foothold timing referee; D11F geometry stays the independent lock gate."""
from __future__ import annotations
import argparse, json, pathlib, statistics
from analyze_bot1d11f import summarize_trace as geometry_summary
TARGET = 'SILT_ENTRY_SEDIMENT_SHELF_D11B'


def first_ms(rows, predicate):
    return next((r.get('ms') for r in rows if predicate(r)), None)


def is_reach(r):
    return any(t.get('phase') == 'reaching' and t.get('reachSurface') == TARGET
               for t in r.get('tendrils', []))

def is_seal(r):
    return any(t.get('phase') == 'sealed' and t.get('anchorSurface') == TARGET
               for t in r.get('tendrils', []))

def inspect(trace, run):
    base = geometry_summary(trace,run)
    profile = run.get('profile','unknown')
    high = (trace.get('firstFoothold') or {})
    rows = sorted(high.get('samples',[]),key=lambda x:x.get('ms',0))
    result={'profile':profile,'round':run.get('round'),'geometryClassification':base['classification'],
            'geometryGatePassed':base.get('gatePassed',False),
            'maxAnchorToCarriedMesh':base.get('maxAnchorToCarriedMesh'),
            'supportedAttachmentSamples':base.get('supportedAttachmentSamples',0),
            'highFrequencySampleCount':len(rows),'classification':'UNSCORED',
            'gatePassed':False,'notes':[]}
    if run.get('status')!='CAPTURED' or run.get('errors'):
        result['classification']='CAPTURE_INCOMPLETE';return result
    if not rows:
        result['classification']='MISSING_D11H_PROBE';return result
    if run.get('ownerDataUsedForSteering') or run.get('controlledDebugStart'):
        result['classification']='DISQUALIFIED_STEERED_OR_CONTROLLED';return result
    if high.get('revision')!='BOT1-D11H-1' or high.get('ownerDataUsedForSteering') is not False:
        result['classification']='MISSING_D11H_PROBE';return result
    for key in ('eligible','contact','plane','attachment','tendrils'):
        if any(key not in r for r in rows):
            result['classification']='MISSING_D11H_FIELDS';return result
    first_eligible=first_ms(rows,lambda r:r['eligible'])
    first_brush=first_ms(rows,lambda r:r['contact']['ownerPreviousState']=='brushing')
    first_reach=first_ms(rows,is_reach)
    first_seal=first_ms(rows,is_seal)
    first_support=first_ms(rows,lambda r:r['plane']['active'] and r['contact']['supportCount']>0)
    first_attach=first_ms(rows,lambda r:r['attachment']['active'])
    first_peel=first_ms(rows,lambda r:any(t.get('phase')=='peeling' for t in r['tendrils']))
    first_away=first_ms(rows,lambda r:r['attachment']['reason']=='deliberate_away_input')
    first_loss=first_ms(rows,lambda r:r['attachment']['reason']=='sustained_contact_loss')
    result['milestonesMs']={'eligible':first_eligible,'brushing':first_brush,'reaching':first_reach,
         'sealed':first_seal,'supportPlane':first_support,'attached':first_attach,
         'peeling':first_peel,'deliberateRelease':first_away,'contactLoss':first_loss}
    if first_eligible is not None:
        index=next(i for i,r in enumerate(rows) if r['eligible']);end=index
        while end<len(rows) and rows[end]['eligible']: end+=1
        result['firstEligibleWindowMs']=rows[end-1]['ms']-rows[index]['ms'] if end>index else 0
        result['eligibleSampleCount']=sum(bool(r['eligible']) for r in rows)
        result['firstEligibleDistance']=rows[index]['truth'].get('distance')
    if first_reach is not None:
        r=next(r for r in rows if is_reach(r))
        result['reachSnapshot']={ 'eligible':r['eligible'], 'coreState':r['core']['state'],
            'contactState':r['core']['actual'], 'surfaceReason':r['truth']['reason'],
            'reachOrigins':sorted(set(t.get('reachOrigin','unreported') for t in r['tendrils'] if t['phase']=='reaching')) }
    if profile == 'host_positive':
        result['classification']='HOST_CONTROL_GEOMETRY_ONLY'
        result['gatePassed']=bool(base.get('gatePassed'))
    elif profile=='away_control':
        result['classification']='AWAY_CONTROL_CLEAR' if base['classification']=='AWAY_CONTROL_CLEAR' else 'AWAY_CONTROL_FAILURE'
        result['gatePassed']=result['classification']=='AWAY_CONTROL_CLEAR'
    elif first_eligible is None:
        result['classification']='NO_SILT_ELIGIBILITY'
    elif first_brush is None and first_reach is None:
        result['classification']='ELIGIBLE_WITHOUT_BRUSH_OR_REACH'
    elif first_reach is None:
        result['classification']='BRUSH_WITHOUT_AUTHORED_REACH'
    elif first_seal is None:
        result['classification']='REACH_WITHOUT_SEAL'
    elif first_support is None:
        result['classification']='SEALED_WITHOUT_SUPPORT'
    elif not base.get('gatePassed'):
        result['classification']='SUPPORTED_WITH_GEOMETRY_OR_CAPTURE_WARNING'
    elif first_away is None:
        result['classification']='SUPPORTED_WITHOUT_VERIFIED_DELIBERATE_RELEASE'
    else:
        result['classification']='SUPPORTED_GEOMETRICALLY_VALID_RELEASED'
        result['gatePassed']=True
    if profile.startswith('natural_'):
        if first_reach is not None and first_seal is None:
            result['notes'].append('Observed reach but no completed seal; loss of truth/phase timing needs scrutiny.')
        if first_seal is not None and first_support is None:
            result['notes'].append('Observed Silt-labeled seal but no effective support plane.')
        result['notes'].append('Milestones inferred by 25ms sampled state; rejected calls before a phase transition are not directly logged.')
    return result


def analyze(root):
    root=pathlib.Path(root)
    results=[]
    for file in sorted(root.glob('*/RUN.json')):
        run=json.loads(file.read_text(encoding='utf-8'))
        trace_file=file.parent/'D11C_TRACE.json'
        trace=json.loads(trace_file.read_text(encoding='utf-8')) if trace_file.exists() else {}
        row=inspect(trace,run)
        row['folder']=file.parent.name
        results.append(row)
    required={'host_positive':1,'natural_reference':3,'natural_feather':3,'natural_brake':3,'away_control':1}
    counts={p:sum(r['profile']==p for r in results) for p in required}
    matrix=all(counts[p]>=n for p,n in required.items()) and len(results)==11
    bad={'CAPTURE_INCOMPLETE','DISQUALIFIED_STEERED_OR_CONTROLLED','MISSING_D11H_PROBE','MISSING_D11H_FIELDS'}
    integrity=matrix and all(r['classification'] not in bad for r in results)
    natural=[r for r in results if r['profile'].startswith('natural_')]
    result={'revision':'BOT1-D11H-1','matrixComplete':matrix,'captureValid':integrity,'runCounts':counts,
        'naturalPasses':sum(r['gatePassed'] for r in natural),'naturalRequired':9,
        'controlsPassed': all(r['gatePassed'] for r in results if r['profile'] in ('host_positive','away_control')) and counts['host_positive']>=1 and counts['away_control']>=1,
        'runs':results,'caveat':'Timing snapshots are read-only and sampled; classification suggests where to inspect, not a causal proof or a pass of gameplay physics.'}
    result['decision']='FIRST_FOOTHOLD_REPEATABILITY_PROVISIONAL' if result['naturalPasses']==9 and result['controlsPassed'] and integrity else 'DIAGNOSE_FIRST_FOOTHOLD'
    return result


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('root');args=p.parse_args()
    root=pathlib.Path(args.root)
    if not root.is_dir():p.error('Results directory not found')
    report=analyze(root)
    outfile=root/'BOT1D11H_AUDIT.json'
    outfile.write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(f"D11H matrix={report['matrixComplete']} captureValid={report['captureValid']} natural={report['naturalPasses']}/9 controls={report['controlsPassed']}")
    for row in report['runs']:
        print(f"  {row['profile']} r{row['round']}: {row['classification']} | {row.get('milestonesMs',{})}")
    print('Audit:',outfile)
    return 0 if report['captureValid'] else 2
if __name__=='__main__':raise SystemExit(main())
