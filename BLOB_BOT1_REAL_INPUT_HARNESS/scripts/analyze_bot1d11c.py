#!/usr/bin/env python3
"""Offline D11C diagnostic referee. Cannot certify traversal from controlled pose."""
from __future__ import annotations
import argparse, json, pathlib, sys
from bot1d11c_policy import TARGET, PROFILES

def summarize_trace(data):
    samples=data.get('samples') or []
    if not samples:
        return {'classification':'INCONCLUSIVE_NO_PROBE','samples':0}
    has_shelf=[s for s in samples if s.get('shelf',{}).get('present') and s.get('shelf',{}).get('visible')]
    available=[s for s in samples if TARGET in s.get('capability',{}).get('surfaceIds',[])]
    truth=[s for s in samples if s.get('surface',{}).get('valid') and s.get('surface',{}).get('surfaceId') == TARGET]
    eligible=[s for s in truth if s.get('surface',{}).get('eligible')]
    contact=[s for s in samples if s.get('contact',{}).get('state') in ('brushing','attached')]
    eligibleContact=[s for s in eligible if s.get('contact',{}).get('state') in ('brushing','attached')]
    target_contact=[s for s in samples if s.get('contact',{}).get('truthSurfaceId')==TARGET]
    seal=[s for s in samples if s.get('contact',{}).get('sealed',0)>0 and (s.get('contact',{}).get('carriedSurfaceId')==TARGET or s.get('contact',{}).get('truthSurfaceId')==TARGET)]
    support=[s for s in samples if s.get('plane',{}).get('active') and s.get('plane',{}).get('surfaceId')==TARGET]
    attached=[s for s in samples if s.get('attachment',{}).get('active') and s.get('attachment',{}).get('surfaceId')==TARGET]
    n_consecutive=0; best=0
    for s in samples:
        if s.get('attachment',{}).get('active') and s.get('attachment',{}).get('surfaceId')==TARGET:
            n_consecutive+=1;best=max(best,n_consecutive)
        else:n_consecutive=0
    released=any(s.get('attachment',{}).get('state')=='releasing' for s in samples)
    if attached:
        label='ATTACHMENT_OBSERVED' if best>=2 else 'SINGLE_SAMPLE_ATTACHMENT'
    elif support:label='CONTROLLER_HANDOFF_NOT_OBSERVED'
    elif seal:label='SUPPORT_PLANE_NOT_OBSERVED'
    elif eligible and not eligibleContact:label='CONTACT_STATE_GATE_NOT_SATISFIED'
    elif eligible and not seal:label='ANCHOR_SEAL_NOT_OBSERVED'
    elif truth:label='SURFACE_TRUTH_OUTSIDE_ELIGIBILITY'
    elif has_shelf:label='AUTHORED_SHELF_PRESENT_BUT_NOT_RAYCAST_VALID'
    else:label='SHELF_NOT_VISIBLE_IN_SAMPLED_CELL'
    return {
        'classification':label,'samples':len(samples),'visibleShelfSamples':len(has_shelf),
        'shelfInCandidateCoverageSamples':len(available),'targetTruthSamples':len(truth),
        'targetEligibleSamples':len(eligible),'contactBrushingOrAttachedSamples':len(contact),
        'targetContactTruthSamples':len(target_contact),'eligibleContactStateSamples':len(eligibleContact),'targetSealedSamples':len(seal),
        'targetSupportPlaneSamples':len(support),'targetMechanicalAttachmentSamples':len(attached),
        'maxConsecutiveTargetAttachmentSamples':best,'anyReleaseSample':released,
        'anyMechanicalAttachmentSamples':sum(bool(s.get('attachment',{}).get('active')) for s in samples),
        'anySealedSamples':sum(s.get('contact',{}).get('sealed',0)>0 for s in samples),
        'anySupportSamples':sum(bool(s.get('plane',{}).get('active')) for s in samples),
        'anyRaycastSamples':sum(bool(s.get('surface',{}).get('valid')) for s in samples),
        'attachedSurfaceIds':sorted(set(s.get('attachment',{}).get('surfaceId','none') for s in samples
                                        if s.get('attachment',{}).get('active'))),
        'contactStateCounts':{k:sum(s.get('contact',{}).get('state')==k for s in samples)
                              for k in ('suspended','brushing','attached','releasing')},
        'coreContactLanguageStateCounts':{k:sum(s.get('coreContactLanguage',{}).get('state')==k for s in samples)
                                         for k in ('suspended','brushing','attached','releasing')},
        'firstTruth':truth[0].get('surface') if truth else None,
        'firstEligible':eligible[0].get('surface') if eligible else None,
        'firstAttached':{'ms':attached[0].get('ms'),'attachment':attached[0].get('attachment')} if attached else None,
        'intervention':data.get('interventions',[]),
        'note':'Snapshot transitions are not causal proof; controlledStart is debug relocation, not navigability.'
    }

def analyze_folder(folder):
    r=json.loads((folder/'RUN.json').read_text(encoding='utf-8'))
    trace_path=folder/'D11C_TRACE.json'
    if not trace_path.exists():
        return {'profile':r.get('profile'),'classification':'INCONCLUSIVE_MISSING_TRACE',
            'status':r.get('status'),'errors':r.get('errors',[])}
    trace=json.loads(trace_path.read_text(encoding='utf-8'))
    out=summarize_trace(trace)
    if r.get('profile') == 'host_positive':
        out['classification'] = ('HC_POSITIVE_ATTACHMENT_OBSERVED' if out.get('anyMechanicalAttachmentSamples',0)
                                 else 'HC_POSITIVE_NO_ATTACHMENT_OBSERVED')
    out.update({'profile':r.get('profile'),'status':r.get('status'),
                'errors':r.get('errors',[]),'rec1':r.get('rec1',{}),
                'controlledDebugStart':r.get('controlledDebugStart',False)})
    if r.get('status')!='CAPTURED' or r.get('errors') or r.get('rec1',{}).get('droppedDetails') not in (0,None):
        out['evidenceWarning']='Incomplete recording or runner errors'
    return out

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('root')
    args=p.parse_args(argv)
    root=pathlib.Path(args.root)
    if not root.is_dir():p.error('No results directory: '+str(root))
    folders=sorted(f for f in root.iterdir() if f.is_dir() and (f/'RUN.json').is_file())
    if not folders:p.error('No RUN.json folders found')
    rows=[analyze_folder(f) for f in folders]
    seen={r['profile'] for r in rows}
    missing=sorted(set(PROFILES)-seen)
    report={'revision':'BOT1-D11C-1','type':'DIAGNOSTIC_NOT_CERTIFICATION',
      'completeMatrix':not missing,'missingProfiles':missing,'runs':rows,
      'interpretationRules':{
        'surfaceTruthNotEnoughForLatch':True,'visualContactNotMechanical':True,
        'debugControlledStartNotAPlayerRoute':True,'releaseAfterInputNotCausalProof':True}}
    (root/'BOT1D11C_AUDIT.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    lines=['# BOT1-D11C Surface Handoff Diagnostic','',
      'This is an intermediate-state diagnostic, not gameplay certification.','',
      '| Profile | Shelf eligible samples | Sealed | Support plane | Attached | Classification |',
      '|---|---:|---:|---:|---:|---|']
    for r in rows:
        lines.append('| '+str(r['profile'])+' | '+str(r.get('targetEligibleSamples','?'))+' | '+str(r.get('targetSealedSamples','?'))+' | '+str(r.get('targetSupportPlaneSamples','?'))+' | '+str(r.get('targetMechanicalAttachmentSamples','?'))+' | '+str(r['classification'])+' |')
        print(f"[D11C] {r['profile']}: {r['classification']} / samples={r.get('samples',0)}")
    lines.extend(['','Controlled pose is an instrumented mechanical experiment, not proof the normal Silt route reaches it.',
       'HC positive uses other authored surfaces; inspect its full recorded chain independently.',
       'Sustained latch and deliberate input-caused release require ordered, owner-matched evidence.'])
    if missing:lines.append('Missing profiles: '+', '.join(missing))
    (root/'BOT1D11C_AUDIT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('[D11C] Report:',root/'BOT1D11C_AUDIT.md')
    return 0 if not missing and all(r['status']=='CAPTURED' and not r['errors'] for r in rows) else 2
if __name__=='__main__':raise SystemExit(main())
