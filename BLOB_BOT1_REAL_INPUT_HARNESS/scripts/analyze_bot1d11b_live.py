#!/usr/bin/env python3
"""Offline REC1 referee for D11B. Never claims HUD state = mechanical latch."""
from __future__ import annotations
import argparse,datetime,json,math,pathlib
from bot1d11b_live_policy import REVISION,SILT,NURSERY,SHELF
SAMPLE_EVENTS={'c0d4-mob1-movement-sample', 'g1d9s-neutral-movement-observation',
               'c0d4-mob1-guidance-state-change', 'c0d4-mob1-sustained-low-progress'}
CENTER={'x':-0.18,'y':-0.75,'z':-2.65}

def parse_time(t):
    if not isinstance(t,str): return None
    try:return datetime.datetime.fromisoformat(t.replace('Z','+00:00'))
    except ValueError:return None

def samples(rec):
    out=[]
    for e in rec.get('events',[]):
        if e.get('type') not in SAMPLE_EVENTS:continue
        owner=e.get('owner')
        at=parse_time(e.get('time'))
        if not isinstance(owner,dict) or at is None:continue
        out.append((at,owner,e['type']))
    return sorted(out,key=lambda x:x[0])

def distance(pos,other=CENTER):
    if not isinstance(pos,dict):return None
    try:return math.sqrt(sum((float(pos[a])-float(other[a]))**2 for a in 'xyz'))
    except (ValueError,TypeError,KeyError):return None

def good_surface(profile,attachment):
    if not attachment.get('active'):return False
    name=attachment.get('surfaceId')
    if profile=='host_positive':return isinstance(name,str) and name.startswith('HOST_CONTACT_SHELF_')
    return name==SHELF

def referee(run,rec):
    profile=run.get('profile');expected=NURSERY if profile=='host_positive' else SILT
    all_samples=samples(rec)
    filt=[(t,o,k) for t,o,k in all_samples if o.get('cellId')==expected]
    att=[o.get('attachment') or {} for _,o,_ in filt]
    flags=[good_surface(profile,a) for a in att]
    transitions=[]
    for i in range(1,len(flags)):
        if flags[i]!=flags[i-1]:
            transitions.append({'kind':'attach' if flags[i] else 'detach',
               'at':filt[i][0].isoformat(),'surfaceId':att[i].get('surfaceId'),
               'input':(filt[i][1].get('input') or {})})
    attached_surfaces=sorted(set(str(a.get('surfaceId')) for a in att if a.get('active') and a.get('surfaceId') not in ('none',None,'')))
    drop=((rec.get('summary') or {}).get('captureRetention') or {}).get('droppedDetails')
    capture_ok=run.get('status')=='CAPTURED' and not run.get('errors') and drop==0 and bool(rec.get('events'))
    ids_in_cell={o.get('cellId') for _,o,_ in all_samples}
    has_before=any(t['kind']=='attach' for t in transitions)
    has_after=any(t['kind']=='detach' for t in transitions)
    if not capture_ok:verdict='CAPTURE_INCOMPLETE'
    elif not filt:verdict='EXPECTED_CELL_UNVERIFIED'
    elif not any(flags):verdict='TARGET_LATCH_NOT_OBSERVED_IN_SAMPLES'
    elif has_before and has_after:verdict='SAMPLED_TARGET_LATCH_AND_RELEASE'
    elif has_before:verdict='SAMPLED_TARGET_LATCH_RELEASE_UNVERIFIED'
    else:verdict='TARGET_ATTACHMENT_OBSERVED_ENTRY_UNVERIFIED'
    positions=[(o.get('motion') or {}).get('position') for _,o,_ in filt]
    distances=[v for v in (distance(p) for p in positions) if v is not None]
    return {'revision':REVISION,'profile':profile,'verdict':verdict,
        'expectedCell':expected,'observedCells':sorted(str(c) for c in ids_in_cell),
        'sampleCount':len(filt),'targetAttachedSamples':sum(flags),
        'otherAttachedSamples':sum(bool(a.get('active')) and not flags[i] for i,a in enumerate(att)),
        'attachedSurfaceIds':attached_surfaces,'sampledTransitions':transitions,
        'nearestPlayerToSiltShelfCenter':round(min(distances),3) if distances and profile!='host_positive' else None,
        'dropDetails':drop,'rec1Events':len(rec.get('events',[])),
        'claimLimits':['Only sampled owner records can certify a latch/release sequence.',
            'Sparse telemetry may miss brief transitions.',
            'Surface-center proximity is not surface-raycast or eligibility proof.',
            'Observed release after an input does not prove that input caused it.',
            'No latch observed means release was not exercised.']}

def analyze(root):
    idx=json.loads((root/'BOT1D11B_RUN_INDEX.json').read_text(encoding='utf-8'))
    rows=[]
    for entry in idx.get('runs',[]):
        folder=root/entry['folder']
        if not (folder/'RUN.json').exists() or not (folder/'REC1.json').exists():
            rows.append({'profile':entry.get('profile'),'verdict':'REQUIRED_FILES_MISSING'});continue
        run=json.loads((folder/'RUN.json').read_text(encoding='utf-8'))
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf-8'))
        rows.append(referee(run,rec))
    report={'revision':REVISION,'status':'OFFLINE_DIAGNOSTIC_ONLY','runs':rows,
       'positiveControlIsNotSiltProof':True,'noHostReceiptOrFullLS1ProofInferred':True}
    (root/'BOT1D11B_LIVE_AUDIT.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    lines=['# BOT1-D11B Live Contact Evidence','',
       'This is an **owner-snapshot diagnostic**, not a blanket pass/fail for Silt mechanics.','',
       '| Profile | Verdict | Samples | Target attached samples | Observed transitions |',
       '|---|---|---:|---:|---|']
    for row in rows:
        lines.append(f"| {row.get('profile')} | {row.get('verdict')} | {row.get('sampleCount','—')} | {row.get('targetAttachedSamples','—')} | {','.join(x['kind'] for x in row.get('sampledTransitions',[])) or 'none'} |")
    lines +=['','**Interpretation:** no target latch observed = release untested, not movement failure.',
       'The HUD `Contact attached` is visual language and never substitutes for `playerAttachment` owner evidence.',
       'Short scripted approaches are exploratory. A negative result cannot prove Silt has no eligible surfaces.',
       'See the JSON audit for cell scope, surface IDs, nearest shelf-center distances, and sampled transitions.']
    (root/'BOT1D11B_LIVE_AUDIT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    return report

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('results_dir');args=p.parse_args(argv)
    root=pathlib.Path(args.results_dir).resolve()
    if not root.is_dir():p.error(f'Missing results folder: {root}')
    report=analyze(root)
    for row in report['runs']:
        print(f"[D11B] {row.get('profile')}: {row.get('verdict')} / targetSamples={row.get('targetAttachedSamples',0)}")
    print('[D11B] Reports:',root/'BOT1D11B_LIVE_AUDIT.md')
    return 0
if __name__=='__main__':raise SystemExit(main())
