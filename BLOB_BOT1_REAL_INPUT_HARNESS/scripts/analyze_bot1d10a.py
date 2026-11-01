#!/usr/bin/env python3
"""D10A independent OFFLINE referee. Never import this into the browser bot."""
from __future__ import annotations
import argparse,json,pathlib
from analyze_bot1d9z import evaluate as base_evaluate, focus_samples, attachment_samples
from bot1d10a_policy import PROFILES_D10A


def evaluate(rec,run):
    r=base_evaluate(rec,run)
    nav=run.get('navigationVerdict') or {}
    focus=focus_samples(rec)
    r['revision']='BOT1-D10A-OFFLINE-REFEREE'
    r['onlineClosure']={
        'termination':nav.get('termination'), 'publicCueSeen':nav.get('publicCueSeen'),
        'stateHistory':nav.get('states') or [], 'stepCounts':nav.get('stepCounts') or {},
        'keyHistory':nav.get('keyHistory') or [],
        'ownerSteeringUsed':False}
    r['offlineApproach']={
        'minimumFocusDistance':round(min((x['distance'] for x in focus),default=0),3) if focus else None,
        'inApproachObserved':any(x.get('inApproach') for x in focus),
        'focusReadyObserved':any(x.get('focusReady') for x in focus),
        'stage1Reached':r.get('ownerStageTimes',{}).get('1') is not None,
        'stage5Certified':r.get('certifiedFoldStage5'),
        'warning':'Independent post-run evidence. Not available to the online bot.'}
    # A/B comparison is DESCRIPTIVE even when its two outcomes differ.
    if run.get('profile') in ('recovery','recovery_control'):
        peel=[x for x in run.get('navigation',[]) if x.get('experimentalPeel')]
        a=attachment_samples(rec)
        r['recoveryArm']={
            'label':'precommitted_six_direction_sweep' if run['profile']=='recovery' else 'no_sweep_control',
            'actualPeelActions':len(peel), 'allAttachmentSamples':len(a),
            'attachedSamples':sum(x['attached'] for x in a),
            'identicalDownstreamPolicyName':'D10A_ROUTE_REAPPROACH_CLOSURE',
            'notCausalProof':True}
    else:r['recoveryArm']=None
    r['evidenceBoundary']=(
        'Stabilize start/end, stage order and Host receipt evaluated offline from REC1. '
        'Public HUD only during browser navigation; no world-RNG seed varied.')
    return r


def summarize(rows):
    expected=set(PROFILES_D10A)
    names=[x.get('profile') for x in rows]
    nameset=set(names)
    complete=bool(rows and nameset==expected and len(names)==len(expected)
        and len(names)==len(nameset) and all(x.get('rec1Complete') for x in rows))
    certified=sum(bool(x.get('certifiedFoldStage5')) for x in rows)
    if not rows or any(not x.get('rec1Complete') for x in rows):status='INCOMPLETE_CAPTURE'
    elif not complete:status='PARTIAL_OR_DUPLICATE_PROFILE_SET'
    elif certified==len(rows):status='ASSISTED_ALL_PASSED'
    elif certified:status='ASSISTED_PARTIAL'
    else:status='ASSISTED_NONE_PASSED'
    arms={x['profile']:x for x in rows if x.get('profile') in ('recovery','recovery_control')}
    if set(arms)=={'recovery','recovery_control'}:
        a=arms['recovery'];b=arms['recovery_control']
        comparison={'pairedArmsPresent':True,
            'sweepStage5':a['certifiedFoldStage5'], 'noSweepStage5':b['certifiedFoldStage5'],
            'sweepPeelActions':(a.get('recoveryArm') or {}).get('actualPeelActions'),
            'controlPeelActions':(b.get('recoveryArm') or {}).get('actualPeelActions'),
            'outcomeDiffers':a['certifiedFoldStage5']!=b['certifiedFoldStage5'],
            'causalConclusion':'NOT_PROVEN_SINGLE_PAIR_NONDTERMINISTIC_BROWSER'}
    else:
        comparison={'pairedArmsPresent':False,'causalConclusion':'UNAVAILABLE_MISSING_ARM'}
    return {'revision':'BOT1-D10A','gate':status,'runs':rows,'count':len(rows),
        'certifiedStage5':certified,'completeEvidence':complete,
        'missingProfiles':sorted(expected-nameset),'extraProfiles':sorted(nameset-expected),
        'recoveryAB':comparison,'assistedScripted':True,'worldSeedsTested':False,
        'autonomousDiscovery':'NOT_TESTED','hostCoreGuideCausality':'NOT_PROVEN',
        'ownerDataUsedForOnlineSteering':False}


def report(agg):
    out=['# BOT1-D10A — Guided target closure and recovery sweep A/B','',
        '**Gate:** `'+agg['gate']+'`',
        '**Owner Stage 5:** '+str(agg['certifiedStage5'])+'/'+str(agg['count']),
        '**Nature:** assisted real-input tests; no world RNG seed diversity, no autonomous discoverability.','',
        '| Profile | Accepted reads | Invitation | Stage 1 | Certified Stage 5 | Q end paired | Public cue | Closure actions |',
        '|---|---:|---|---|---|---|---|---:|']
    for r in agg['runs']:
        nav=r.get('onlineClosure') or {};offline=r.get('offlineApproach') or {}
        out.append('| {profile} | {reads} | {invite} | {stage1} | {stage5} | {qend} | {cue} | {actions} |'.format(
            profile=r['profile'],reads=r.get('acceptedWatcherReads'),invite=r.get('ownerInvitationObserved'),
            stage1=offline.get('stage1Reached'),stage5=r.get('certifiedFoldStage5'),
            qend=r.get('orderedStabilizeEndPaired'),cue=nav.get('publicCueSeen'),
            actions=(nav.get('stepCounts') or {}).get('closure',0)))
    out.extend(['','## A/B evidence (not a causal experiment)',
       json.dumps(agg['recoveryAB'],indent=2),'','## Limits',
       'No runtime gameplay changed. Real browser signals are public HUD and input/time only.',
       'REC1 owner states, attachment samples, Fold focusDistance and Host receipts are examined only after runs.',
       'The D9Z guided deficit of ~0.34 world units informed a fixed microstep hypothesis, not live coordinate tracking.',
       'Recovery sweep versus no-sweep is one paired observation and not proof of causality.',''])
    return '\n'.join(out)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('results',nargs='?',default='BOT1D10A_RESULTS')
    args=p.parse_args();root=pathlib.Path(args.results)
    if not root.is_dir():p.error(f'Results directory not found: {root}')
    folders=sorted(x for x in root.iterdir() if x.is_dir() and (x/'RUN.json').exists())
    if not folders:p.error(f'No RUN.json folders in: {root}')
    rows=[]
    for d in folders:
        run=json.loads((d/'RUN.json').read_text(encoding='utf8'))
        recfile=d/'REC1.json'
        rec=json.loads(recfile.read_text(encoding='utf8')) if recfile.exists() else {}
        result=evaluate(rec,run);rows.append(result)
        (d/'D10A_EVIDENCE.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
        print(result['profile'],result['refereeStatus'],'Stage1',result['offlineApproach']['stage1Reached'])
    agg=summarize(rows)
    (root/'BOT1D10A_EVIDENCE.json').write_text(json.dumps(agg,indent=2)+'\n',encoding='utf8')
    (root/'BOT1D10A_EVIDENCE.md').write_text(report(agg),encoding='utf8')
    print('D10A:',agg['gate'],agg['certifiedStage5'],'/',agg['count'])
    return 0 if agg['completeEvidence'] else 2

if __name__=='__main__':raise SystemExit(main())
