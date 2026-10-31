#!/usr/bin/env python3
"""BOT1-D9X independent/offline referee: multi-seed Stage 5 ownership.

Do not import into an online controller. REC1 never influences browser actions.
Fold completion, Watcher read, Guide observation, and Host receipts are
intentionally separate proof domains.
"""
from __future__ import annotations
import argparse,json,pathlib
from analyze_bot1d9t import load_rec,seconds
from analyze_bot1d9w import evaluate as d9w_evaluate,FOLD,WATCHER,WATCHER_STATE

STAGE_NAMES={1:'observe_first_answer',2:'sustain_first_resonance',
             3:'watch_tissue_response',4:'release_and_settle',5:'surface_wake_complete'}
HOST_EVENT_TYPES={
    'host-silt-cause-observed','vascular-silt-signal-received',
    'c0d1-host-vascular-effect-observed','c0d3-host-grave-resolution-observed'
}

def first_exact_stage(events,idx):
    for e in events:
        if e.get('type')==FOLD and (e.get('state') or {}).get('stageIndex')==idx:
            return e
    return None

def evaluate(rec,run,source='FINAL'):
    events=rec.get('events') or []
    retained=((rec.get('summary') or {}).get('captureRetention') or {})
    rec_complete=bool(source=='FINAL' and run.get('status')=='CAPTURED'
        and not run.get('errors') and isinstance(events,list) and len(events)>0
        and rec.get('captureActive') is False and retained.get('droppedDetails')==0)
    completed_course=bool(run.get('courseStarted') and len(run.get('probes') or [])==10
        and (run.get('arrival') or {}).get('noOnlineOwnerCertification') is True)
    # Reuse D9W's strict Stage 2 / Stage 3 external pairing as a prerequisite.
    stage3run={**run,'mode':'stage3'}
    stage3=d9w_evaluate(rec,stage3run,source)
    stages={n:first_exact_stage(events,n) for n in range(1,6)}
    stamps=[seconds((stages[n] or {}).get('time')) for n in range(1,6)]
    in_order=bool(all(s is not None for s in stamps)
        and all(a<b for a,b in zip(stamps,stamps[1:])))
    names_correct=all((stages[n] or {}).get('state',{}).get('stage')==STAGE_NAMES[n]
                      for n in range(1,6))
    last=(stages[5] or {}).get('state') or {}
    truly_complete=bool(last.get('completed') is True and last.get('progress')==1
        and last.get('stage')=='surface_wake_complete')
    accepted=[e for e in events if e.get('type')==WATCHER and
        (e.get('witness') or {}).get('packetPulseReadAccepted') is True]
    first_witness=min((seconds(e.get('time')) for e in accepted
                       if seconds(e.get('time')) is not None),default=None)
    invitations=[e for e in events if
        ((e.get('type')==WATCHER_STATE and (e.get('state') or {}).get('foldInvitation') is True)
        or (e.get('type')==FOLD and (e.get('state') or {}).get('nurseryFoldInvitation') is True))]
    invite_prior=any(seconds(e.get('time')) is not None and stamps[0] is not None
        and seconds(e['time'])<=stamps[0] for e in invitations)
    witness_prior=bool(first_witness is not None and stamps[0] is not None
        and first_witness<=stamps[0])
    guide=[e for e in events if e.get('type')=='guide0-core-guide-state']
    pairs=[e for e in events if e.get('type')=='guide0-pulse-owner-pair']
    host={typ:sum(e.get('type')==typ for e in events) for typ in sorted(HOST_EVENT_TYPES)}
    gate=bool(rec_complete and completed_course and stage3.get('certified')
        and in_order and names_correct and truly_complete
        and accepted and witness_prior and invite_prior)
    return {
        'revision':'BOT1-D9X-REFEREE','repeat':run.get('repeat'),
        'mode':run.get('mode'),'seed':run.get('seed'),'rec1Complete':rec_complete,
        'source':source,'events':len(events),'droppedDetails':retained.get('droppedDetails'),
        'fixedCourseCompleted':completed_course,
        'watcherAcceptedReads':len(accepted),'watcherAcceptedBeforeFold':witness_prior,
        'ownerInvitationBeforeFold':invite_prior,
        'ownerStageNamesCorrect':names_correct,'ownerStagesStrictlyOrdered':in_order,
        'ownerStageTimes':{str(k):(stages[k] or {}).get('time') for k in range(1,6)},
        'ownerStage5Completed':truly_complete,'stage2And3Paired':bool(stage3.get('certified')),
        'gameplayOwnerCertified':gate,
        'status':'INCONCLUSIVE' if not rec_complete else 'CERTIFIED' if gate else 'NOT_CERTIFIED',
        'publicCourseObjective':(run.get('arrival') or {}).get('publicVerdict'),
        'postCourseObjective':run.get('postCourseObjective'),
        'hudMayLagOwner':bool(truly_complete and 'let the fold' in str(run.get('postCourseObjective') or '').lower()),
        'guideOwnerObservations':len(guide),'guidePulsePairs':len(pairs),
        'hostEventCounts':host,'hostCoreGuideCausality':'UNPROVEN_BY_THIS_PASS',
        'limits':[
            'Stage 5 certifies only the Listening Fold gameplay owner; not a Host material receipt.',
            'Guide observer samples and Pulse pairs do not by themselves prove causal assistance.',
            'Fixed scripted route is not independent scene-vision navigation.',
            'The runner seed changes action policy only; it does not seed the game world.',
            'No owner telemetry, REC1, hidden distance, or player XYZ used for action selection.'
        ]
    }

def aggregate(rows,expected_seeds=(11,13,24)):
    expected=list(expected_seeds)
    matching=(len(rows)==len(expected) and
        [r.get('seed') for r in rows]==expected and
        all(r.get('mode')=='stage5' for r in rows) and
        len(set(expected))==len(expected))
    complete=bool(matching and all(r['rec1Complete'] for r in rows))
    success=[r['seed'] for r in rows if r['gameplayOwnerCertified']]
    control=11 in success
    cross=bool(control and any(x!=11 for x in success))
    if not complete:gate='INCONCLUSIVE_INCOMPLETE_MATRIX'
    elif not control:gate='FAIL_BASELINE_CONTROL'
    elif len(success)==len(rows):gate='CROSS_POLICY_STAGE5_ALL_PASSED'
    elif cross:gate='CROSS_POLICY_STAGE5_PARTIAL_WITH_FAILURES'
    else:gate='NO_CROSS_POLICY_STAGE5_PROOF'
    return {'revision':'BOT1-D9X','gate':gate,'completeEvidence':complete,
        'seedMeaning':'runner_policy_only_not_world_rng','expectedSeeds':expected,'certifiedSeeds':success,'twoDifferentSeedsCertified':cross,
        'runs':rows,'hostCoreGuideCausality':'UNPROVEN_BY_THIS_PASS', 'worldSeedVariation':'NOT_TESTED'}

def report_md(report):
    lines=['# BOT1-D9X — Cross-policy Listening Fold completion', '',
        f"**Gate:** `{report['gate']}`",
        f"**Complete matrix:** {report['completeEvidence']}",
        f"**Two distinct certified seeds:** {report['twoDifferentSeedsCertified']}",'',
        '| Seed | REC1 | Watcher accepted | Stage2/3 paired | Stage1→5 exact | Stage5 completed | Result |',
        '|---:|---|---:|---|---|---|---|']
    for r in report['runs']:
        lines.append(f"| {r['seed']} | {r['rec1Complete']} | {r['watcherAcceptedReads']} | "
            f"{r['stage2And3Paired']} | {r['ownerStagesStrictlyOrdered'] and r['ownerStageNamesCorrect']} | "
            f"{r['ownerStage5Completed']} | {r['status']} |")
    lines += ['','Stage 5 is a Fold owner result, not material movement or Host receipt.',
        'Seeds refer to bot input policies, NOT world RNG seeding.',
        'Guide is independently observed; causal Guide assistance remains unproven.',
        'All failed attempts count; no filtering to successful seeds.','']
    return '\n'.join(lines)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('folder')
    p.add_argument('--seeds',default='11,13,24')
    a=p.parse_args()
    try: expected=[int(s.strip()) for s in a.seeds.split(',')]
    except ValueError:p.error('Expected comma-separated integer seeds')
    if len(expected)!=3 or len(set(expected))!=3:p.error('Require three distinct seeds')
    root=pathlib.Path(a.folder)
    if not root.is_dir():p.error('No such folder: '+str(root))
    paths=sorted(d for d in root.iterdir() if d.is_dir() and d.name.startswith('BOT1D9X_'))
    if not paths:p.error('No D9X attempts present')
    rows=[]
    for folder in paths:
        rec,source=load_rec(folder)
        runfile=folder/'RUN.json'
        run=json.loads(runfile.read_text('utf8')) if runfile.is_file() else {}
        row=evaluate(rec or {},run,source)
        rows.append(row)
        (folder/'D9X_EVIDENCE.json').write_text(json.dumps(row,indent=2),encoding='utf8')
        print(row['seed'],row['status'],'Stage5',row['ownerStage5Completed'])
    report=aggregate(rows,expected)
    (root/'BOT1D9X_EVIDENCE.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    (root/'BOT1D9X_EVIDENCE.md').write_text(report_md(report),encoding='utf8')
    print('D9X:',report['gate'])
    return 0 if report['completeEvidence'] else 2

if __name__=='__main__':raise SystemExit(main())
