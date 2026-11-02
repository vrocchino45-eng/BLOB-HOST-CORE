#!/usr/bin/env python3
"""D11E offline referee: natural Silt contact stability, input-aligned tangent and peel.

Never counts HUD text, authored eligibility or a single owner-attached sample
as sustained supported attachment. Samples are observational, not exhaustive.
"""
from __future__ import annotations
import argparse, json, math, pathlib
from bot1d11e_policy import TARGET, PROFILES, REVISION, natural

MAX_SAMPLE_GAP_MS=450
MIN_HELD_MS=800
MIN_HELD_SAMPLES=5
MIN_TANGENTIAL_DISPLACEMENT=0.04


def path_windows(trace):
    marks=trace.get('interventions') or []
    starts={};windows={}
    for m in marks:
        if m.get('kind')!='marker':continue
        tag=m.get('label','');ms=m.get('ms')
        if not isinstance(ms,(int,float)):continue
        if tag.startswith('start:'):starts[tag[6:]]=ms
        if tag.startswith('end:') and tag[4:] in starts:
            windows[tag[4:]]=(starts.pop(tag[4:]),ms)
    return windows


def point(s):
    p=s.get('player') or {}
    if not all(isinstance(p.get(k),(int,float)) for k in 'xyz'):return None
    return tuple(float(p[k]) for k in 'xyz')


def same_surface_attachment(s):
    a=s.get('attachment') or {}
    return bool(a.get('active')) and a.get('surfaceId')==TARGET


def same_surface_supported(s):
    a=s.get('attachment') or {}; c=s.get('contact') or {}; pl=s.get('plane') or {}
    return (same_surface_attachment(s) and c.get('sealed',0)>0
            and pl.get('active') and pl.get('surfaceId')==TARGET
            and a.get('supportCount',0)>0)


def coherent_spans(samples,predicate,max_gap_ms=MAX_SAMPLE_GAP_MS):
    """Sequences of observed owner samples; break on any sample violating predicate or time gap."""
    spans=[];current=[]
    for s in samples:
        ms=s.get('ms')
        if not isinstance(ms,(int,float)):
            if current:spans.append(current);current=[]
            continue
        if (not predicate(s)):
            if current:spans.append(current);current=[]
            continue
        if current and (ms<=current[-1]['ms'] or ms-current[-1]['ms']>max_gap_ms):
            spans.append(current);current=[]
        current.append(s)
    if current:spans.append(current)
    return spans


def projected_motion(a,b,normal):
    p1=point(a);p2=point(b)
    if p1 is None or p2 is None:return None
    diff=[p2[i]-p1[i] for i in range(3)]
    n=normal or {}
    v=[n.get(k,0) for k in 'xyz']
    if not all(isinstance(q,(int,float)) for q in v):return None
    length=math.sqrt(sum(q*q for q in v))
    if length<0.1:return None
    v=[q/length for q in v]
    dot=sum(diff[i]*v[i] for i in range(3))
    return math.sqrt(max(0,sum(x*x for x in diff)-dot*dot))


def summarize_trace(trace,profile,run=None):
    run=run or {}
    samples=trace.get('samples') or []
    if not samples:
        return {'profile':profile,'classification':'INCONCLUSIVE_NO_PROBE','samples':0,'gatePassed':False}
    samples=sorted(samples,key=lambda s:s.get('ms',-1))
    windows=path_windows(trace)
    target_attach=[s for s in samples if same_surface_attachment(s)]
    target_eligible=[s for s in samples if (s.get('surface') or {}).get('valid') and
                     (s.get('surface') or {}).get('eligible') and
                     (s.get('surface') or {}).get('surfaceId')==TARGET]
    target_seal=[s for s in samples if (s.get('contact') or {}).get('sealed',0)>0 and
                 ((s.get('contact') or {}).get('truthSurfaceId')==TARGET or
                  (s.get('contact') or {}).get('carriedSurfaceId')==TARGET)]
    target_plane=[s for s in samples if (s.get('plane') or {}).get('active') and
                  (s.get('plane') or {}).get('surfaceId')==TARGET]
    spans=coherent_spans(samples,same_surface_supported)
    sustained=[sp for sp in spans if len(sp)>=MIN_HELD_SAMPLES and
               sp[-1]['ms']-sp[0]['ms']>=MIN_HELD_MS]
    best=max((sp[-1]['ms']-sp[0]['ms'] for sp in spans),default=0)
    # Tangent evidence requires BOTH movement and simultaneous supported samples.
    tangent=windows.get('tangential')
    tangent_displacement=0.0; tangent_observed_samples=0
    if tangent:
        for sp in spans:
            cut=[s for s in sp if tangent[0]<=s['ms']<=tangent[1]]
            tangent_observed_samples=max(tangent_observed_samples,len(cut))
            if len(cut)>=2:
                displacement=projected_motion(cut[0],cut[-1],(cut[0].get('plane') or {}).get('normal'))
                if displacement is not None:tangent_displacement=max(tangent_displacement,displacement)
    tangent_pass=bool(sustained) and tangent_displacement>=MIN_TANGENTIAL_DISPLACEMENT
    # Require an input-marked away window and owner release *after* a genuine supported latch.
    away=windows.get('away_vertical');release=None;free_after=False
    away_action=any(a.get('label')=='away_vertical' and str(a.get('key','')).lower()=='c'
                    for a in (run.get('actions') or []))
    if away and away_action and sustained:
        supported_before=any(sp[0]['ms']<away[0] and away[0]-1000<=sp[-1]['ms']<=away[0]+450 for sp in sustained)
        if supported_before:
            for s in samples:
                a=s.get('attachment') or {}
                if (away[0] <= s['ms'] <= away[1]+450
                    and a.get('state') == 'releasing'
                    and a.get('detachReason') == 'deliberate_away_input'
                    and not a.get('active')):
                    release=s;break
    if release:
        free_after=any(s['ms']>release['ms'] and not (s.get('attachment') or {}).get('active') and
            (s.get('attachment') or {}).get('state')=='free' for s in samples)
    release_pass=bool(release and free_after)
    any_hc_attach=any((s.get('attachment') or {}).get('active') and
                       (s.get('attachment') or {}).get('surfaceId','').startswith('HOST_CONTACT_')
                       for s in samples)
    neg_clean=not target_attach and not target_seal and not target_plane
    if profile=='host_positive':
        classification='HC_CONTROL_ATTACHMENT_OBSERVED' if any_hc_attach else 'HC_CONTROL_NO_ATTACHMENT'
        passed=any_hc_attach
    elif profile=='away_control':
        classification='AWAY_CONTROL_CLEAR' if neg_clean else 'UNEXPECTED_SILT_CONTACT_ON_AWAY_CONTROL'
        passed=neg_clean
    elif not natural(profile):
        classification='UNEXPECTED_PROFILE';passed=False
    elif not target_eligible:
        classification='NO_ELIGIBLE_SILT_PROXIMITY';passed=False
    elif not target_seal:
        classification='SILT_ANCHOR_NOT_SEALED';passed=False
    elif not target_plane:
        classification='SILT_SUPPORT_PLANE_NOT_ESTABLISHED';passed=False
    elif not sustained:
        classification='SILT_SUPPORT_NOT_SUSTAINED';passed=False
    elif not tangent_pass:
        classification='TANGENTIAL_MOVEMENT_NOT_VERIFIED';passed=False
    elif not release_pass:
        classification='INPUT_ALIGNED_RELEASE_NOT_VERIFIED';passed=False
    else:
        classification='NATURAL_SILT_FULL_SEQUENCE_OBSERVED';passed=True
    out={'profile':profile,'classification':classification,'gatePassed':passed,
        'samples':len(samples),'targetEligibleSamples':len(target_eligible),
        'targetSealSamples':len(target_seal),'targetSupportPlaneSamples':len(target_plane),
        'targetAttachmentSamples':len(target_attach),
        'supportedSamples':sum(len(x) for x in spans),
        'maxObservedSupportedSpanMs':round(best),
        'sustainedSupportedSegments':len(sustained),
        'tangentialObservedSamples':tangent_observed_samples,
        'tangentialObservedDisplacement':round(tangent_displacement,4),
        'tangentialThreshold':MIN_TANGENTIAL_DISPLACEMENT,
        'markedAwayInput':bool(away and away_action),
        'deliberateReleaseAtMs':release.get('ms') if release else None,
        'freeAfterDeliberateRelease':free_after,
        'anyHcAttachment':any_hc_attach,
        'negativeControlClear':neg_clean if profile=='away_control' else None,
        'controlledDebugStart':bool(run.get('controlledDebugStart',False)),
        'ownerSteered':bool(run.get('ownerDataUsedForSteering',False)),
        'sampleContinuityRule':f'gap <= {MAX_SAMPLE_GAP_MS}ms; >= {MIN_HELD_SAMPLES} samples over >= {MIN_HELD_MS}ms',
        'evidenceLimits':'This is sampled owner-state evidence at a debug cell spawn; it does not prove full-game route discoverability or input causality.'}
    if run.get('controlledDebugStart') or run.get('ownerDataUsedForSteering'):
        out.update(gatePassed=False,classification='DISQUALIFIED_CONTROLLED_OR_OWNER_STEERED')
    return out


def analyze_run(folder):
    try:run=json.loads((folder/'RUN.json').read_text(encoding='utf-8'))
    except Exception as e:return {'folder':folder.name,'classification':'INCONCLUSIVE_BAD_RUN','gatePassed':False,'error':str(e)}
    trace_file=folder/'D11C_TRACE.json'
    if not trace_file.is_file():
        return {'folder':folder.name,'profile':run.get('profile'),'classification':'INCONCLUSIVE_MISSING_TRACE',
                'gatePassed':False,'errors':run.get('errors',[])}
    try:trace=json.loads(trace_file.read_text(encoding='utf-8'))
    except Exception as e:return {'folder':folder.name,'classification':'INCONCLUSIVE_BAD_TRACE','gatePassed':False,'error':str(e)}
    score=summarize_trace(trace,run.get('profile','unknown'),run)
    score.update(folder=folder.name,round=run.get('round'),status=run.get('status'),errors=run.get('errors',[]),rec1=run.get('rec1',{}))
    rec_path=folder/'REC1.json'
    if not rec_path.is_file():
        score.update(gatePassed=False,classification='INCONCLUSIVE_MISSING_REC1')
    else:
        try:
            rec=json.loads(rec_path.read_text(encoding='utf-8'))
            if not rec.get('events'):raise ValueError('REC1 has no events')
        except Exception:
            score.update(gatePassed=False,classification='INCONCLUSIVE_BAD_REC1')
    if run.get('status')!='CAPTURED' or run.get('errors') or (run.get('rec1',{}).get('droppedDetails') != 0):
        score.update(gatePassed=False,classification='INCONCLUSIVE_CAPTURE_ERROR')
    return score


def analyze_root(root,expected=None,rounds=1):
    folders=sorted(x for x in root.iterdir() if x.is_dir() and (x/'RUN.json').is_file())
    scores=[analyze_run(x) for x in folders]
    expected=tuple(expected or PROFILES)
    scheduled=[(p,r) for r in range(1,rounds+1) for p in expected if r==1 or natural(p)]
    found={(x.get('profile'),x.get('round')) for x in scores}
    missing=[(p,r) for p,r in scheduled if (p,r) not in found]
    duplicates=len(found)!=len(scores)
    natural_scores=[s for s in scores if natural(s.get('profile',''))]
    complete=not missing and not duplicates and len(natural_scores)>=3
    # 1+1+1 natural variants are the smoke gate. Repeat rounds for confidence.
    natural_gate=complete and all(s.get('gatePassed') for s in natural_scores)
    hc_pass=any(s.get('profile')=='host_positive' and s.get('gatePassed') for s in scores)
    neg_pass=any(s.get('profile')=='away_control' and s.get('gatePassed') for s in scores)
    overall=natural_gate and hc_pass and neg_pass
    return {'revision':REVISION,'type':'NATURAL_APPROACH_DIAGNOSTIC_NOT_GLOBAL_CERTIFICATION',
        'profiles':list(expected),'rounds':rounds,'runs':scores,'missingRuns':missing,
        'duplicateRunIds':duplicates,'completeMatrix':complete,'allNaturalSequencesObserved':natural_gate,
        'hcPositivePassed':hc_pass,'awayControlPassed':neg_pass,'limitedGatePassed':overall,
        'limits':['Scripted Shift+6 spawn is not full-game traversal',
                  'Sampled contact and input-aligned release do not prove universal reliability',
                  'No gameplay source changed by this test-only package',
                  'D10B Fold regression remains a separate checkpoint']}


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('root')
    args=p.parse_args(argv)
    root=pathlib.Path(args.root)
    if not root.is_dir():p.error('Missing results directory: '+str(root))
    index=root/'BOT1D11E_RUN_INDEX.json'
    if index.is_file():
        meta=json.loads(index.read_text(encoding='utf-8'))
        profiles=meta.get('requestedProfiles',PROFILES);rounds=meta.get('rounds',1)
    else:profiles=PROFILES;rounds=1
    report=analyze_root(root,profiles,rounds)
    (root/'BOT1D11E_AUDIT.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    lines=['# BLOB BOT1-D11E — Natural Silt Attachment Audit','',
        f"Limited gate: **{'PASS' if report['limitedGatePassed'] else 'NOT YET PASSED'}**",'',
        '| Profile | Round | Eligible | Sealed | Plane | Attached | Max supported (ms) | Tangent (units) | Deliberate release | Classification |',
        '|---|---:|---:|---:|---:|---:|---:|---:|---|---|']
    for s in report['runs']:
        lines.append(f"| {s.get('profile','?')} | {s.get('round','?')} | {s.get('targetEligibleSamples','?')} | {s.get('targetSealSamples','?')} | {s.get('targetSupportPlaneSamples','?')} | {s.get('targetAttachmentSamples','?')} | {s.get('maxObservedSupportedSpanMs','?')} | {s.get('tangentialObservedDisplacement','?')} | {bool(s.get('deliberateReleaseAtMs')) and bool(s.get('freeAfterDeliberateRelease'))} | {s['classification']} |")
        print(f"[D11E] {s.get('profile')} round={s.get('round')}: {s['classification']} (supported={s.get('maxObservedSupportedSpanMs','?')}ms, tangent={s.get('tangentialObservedDisplacement','?')})")
    if report['missingRuns']:lines+=['','Missing expected runs: '+str(report['missingRuns'])]
    lines+=['','**Interpretation:** Ordinary key actions start from the Silt debug entry. A momentary latch without same-surface tendril support does not pass. Surface visibility, HUD text and raycast eligibility alone never satisfy the test.','',
            'D11D changes remain experimental until natural approach, sustained support, tangential travel, and input-aligned release are reproducible.']
    (root/'BOT1D11E_AUDIT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('[D11E] Report:',root/'BOT1D11E_AUDIT.md')
    return 0 if report['completeMatrix'] and all(s.get('status')=='CAPTURED' and not s.get('errors') for s in report['runs']) else 2

if __name__=='__main__':raise SystemExit(main())
