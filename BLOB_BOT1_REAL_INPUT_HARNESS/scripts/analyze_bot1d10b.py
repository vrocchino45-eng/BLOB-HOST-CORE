#!/usr/bin/env python3
"""BOT1-D10B offline referee: repeatability of unchanged D10A Golden / Guided.

Only this POST-RUN script reads REC1 owner data. Browser bots never import this.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib,sys
from collections import Counter

def classify(evidence:dict,run:dict):
    """Classify failure layer only from the independent post-run referee."""
    if run.get('errors') or run.get('status')!='CAPTURED' or not evidence.get('rec1Complete') or evidence.get('droppedDetails')!=0:
        return 'CAPTURE_OR_TELEMETRY_FAILURE'
    if not evidence.get('ownerInvitationObserved') or not evidence.get('acceptedWatcherReads',0):
        return 'WATCHER_ACQUISITION_FAILED'
    if not (evidence.get('offlineApproach') or {}).get('stage1Reached'):
        return 'FOLD_APPROACH_FAILED'
    if not evidence.get('certifiedFoldStage5'):
        return 'FOLD_INTERACTION_OR_HANDOFF_FAILED'
    return 'OWNER_CERTIFIED_STAGE5'

def verdict(rows:list[dict],expected_count:int):
    """A small smoke gate, NOT a statistical reliability claim."""
    if len(rows)!=expected_count or any(x.get('missing') for x in rows):return 'INCOMPLETE_RUN_SET'
    groups={x.get('classification') for x in rows}
    if 'CAPTURE_OR_TELEMETRY_FAILURE' in groups:return 'CAPTURE_OR_TELEMETRY_FAILURE'
    if 'WATCHER_ACQUISITION_FAILED' in groups:return 'WATCHER_ACQUISITION_UNSTABLE'
    if 'FOLD_APPROACH_FAILED' in groups:return 'FOLD_APPROACH_UNSTABLE'
    if 'FOLD_INTERACTION_OR_HANDOFF_FAILED' in groups:return 'FOLD_HANDOFF_UNSTABLE'
    if groups=={'OWNER_CERTIFIED_STAGE5'}:return 'ASSISTED_REPEATABILITY_SMOKE_PASSED'
    return 'UNCLASSIFIED'

def summarize(rows:list[dict],expected_count:int):
    per={}
    for profile in ('golden','guided'):
        sub=[r for r in rows if r['profile']==profile]
        counts=Counter(r['classification'] for r in sub)
        per[profile]={'attempts':len(sub), 'captured':sum(r['rec1Complete'] for r in sub),
            'invited':sum(r['invitation'] for r in sub),
            'stage1':sum(r['stage1'] for r in sub),
            'stage5Certified':sum(r['stage5'] for r in sub),
            'classificationCounts':dict(counts)}
    return {'revision':'BOT1-D10B','gate':verdict(rows,expected_count),
        'plannedRuns':expected_count,'observedRuns':len(rows),
        'ownerCertifiedStage5':sum(r['stage5'] for r in rows),
        'completeREC1':sum(r['rec1Complete'] for r in rows),
        'perProfile':per,'runs':rows,'worldSeedsTested':False,
        'assistedScripted':True,'humanDiscoverability':'NOT_TESTED',
        'hostCoreGuideCausality':'NOT_PROVEN',
        'onlineOwnerSteeringUsed':False,
        'warning':'Short repeated scripted-input smoke test. It does not estimate long-term reliability or prove Host receipt.'}

def render_md(summary:dict):
    out=['# BOT1-D10B — Golden / Guided repeatability gate','',
         '**Gate:** `'+summary['gate']+'`',
         '**Stage 5:** '+str(summary['ownerCertifiedStage5'])+'/'+str(summary['plannedRuns'])+' expected attempts',
         '**Recording completeness:** '+str(summary['completeREC1'])+'/'+str(summary['plannedRuns'])+' expected attempts','',
         '| Round | Run order | Profile | Owner invitation | Stage 1 | Stage 5 | Diagnosis |',
         '|---|---:|---|---|---|---|---|']
    for x in summary['runs']:
        out.append('| {round} | {order} | {profile} | {invite} | {stage1} | {stage5} | {reason} |'.format(
            round=x['round'],order=x['runOrder'],profile=x['profile'],
            invite='yes' if x['invitation'] else 'no',stage1='yes' if x['stage1'] else 'no',
            stage5='yes' if x['stage5'] else 'no',reason=x['classification']))
    for p,v in summary['perProfile'].items():
        out.extend(['',f'**{p.capitalize()}:** {v["stage5Certified"]}/{v["attempts"]} Stage 5; '
                f'{v["invited"]}/{v["attempts"]} invitations; '
                f'{v["captured"]}/{v["attempts"]} complete REC1 captures.'])
    out.extend(['','## Evidence boundaries',
        '- Live bots use the D10A public-HUD/input policies without modifying their source or game behavior.',
        '- Owner invitation, ordered Fold stages, Q/Stabilize start/end, and Host categories are checked only after REC1 export.',
        '- Alternating bot order mitigates a fixed order effect but does **not** control random Watcher packet position or world RNG.',
        '- BOT policy labels are not game-world seeds.',
        '- Stage 5 is not a Host receipt; full Core–Host–Guide causality remains unverified.',
        '- A passing 3-round smoke gate is not evidence of guaranteed or statistically established reliability.',''])
    return '\n'.join(out)

def analyze_root(root:pathlib.Path):
    planfile=root/'BOT1D10B_RUN_PLAN.json'
    if not planfile.exists():raise ValueError(f'Missing plan: {planfile}')
    plan=json.loads(planfile.read_text(encoding='utf8'))
    if plan.get('revision')!='BOT1-D10B':raise ValueError('Wrong plan revision')
    planned=plan.get('schedule') or []
    if not planned or any(sorted(p)!=['golden','guided'] for p in planned):
        raise ValueError('Plan does not contain valid Golden/Guided pairs')
    # Lazy import: policy/test-only modules are installed in this folder in the actual game.
    from analyze_bot1d10a import evaluate
    rows=[]
    for i,profiles in enumerate(planned,1):
        rd=root/f'round{i:02d}'
        index=rd/'BOT1D10A_RUN_INDEX.json'
        data=json.loads(index.read_text(encoding='utf8')) if index.is_file() else {}
        actual=data.get('runs') or []
        for j,profile in enumerate(profiles,1):
            entry=next((x for x in actual if x.get('profile')==profile),None)
            folder=rd/entry['folder'] if entry and entry.get('folder') else None
            runfile=folder/'RUN.json' if folder else None
            recfile=folder/'REC1.json' if folder else None
            base={'round':i,'runOrder':j,'profile':profile,
                  'missing':True,'rec1Complete':False,'invitation':False,
                  'stage1':False,'stage5':False,'classification':'CAPTURE_OR_TELEMETRY_FAILURE',
                  'evidenceFolder':str(folder.relative_to(root)) if folder else None}
            # Don't silently count an unexpected profile/order as a valid round.
            if data.get('profilesRequested')!=profiles or len(actual)!=2 or actual[j-1].get('profile')!=profile:
                base['classification']='INCOMPLETE_OR_MISMATCHED_ROUND'
                rows.append(base);continue
            if not runfile or not recfile or not runfile.is_file() or not recfile.is_file():
                rows.append(base);continue
            try:
                run=json.loads(runfile.read_text(encoding='utf8'))
                rec=json.loads(recfile.read_text(encoding='utf8'))
                ev=evaluate(rec,run)
            except (ValueError,KeyError,OSError,TypeError) as exc:
                base['error']=str(exc)[:250]
                rows.append(base);continue
            base.update({'missing':False,
              'rec1Complete':bool(ev.get('rec1Complete')),
              'invitation':bool(ev.get('ownerInvitationObserved')),
              'stage1':bool((ev.get('offlineApproach') or {}).get('stage1Reached')),
              'stage5':bool(ev.get('certifiedFoldStage5')),
              'acceptedWatcherReads':ev.get('acceptedWatcherReads'),
              'REC1Events':ev.get('rec1Events'),
              'droppedDetails':ev.get('droppedDetails'),
              'stabilizeEndedPaired':bool(ev.get('orderedStabilizeEndPaired')),
              'hostEventCounts':ev.get('hostEventCounts'),
              'runnerErrors':run.get('errors') or [],
              'classification':classify(ev,run)})
            (folder/'D10B_EVIDENCE.json').write_text(json.dumps(base,indent=2)+'\n',encoding='utf8')
            rows.append(base)
    report=summarize(rows,len(planned)*2)
    if any(x['classification']=='INCOMPLETE_OR_MISMATCHED_ROUND' for x in rows):
        report['gate']='INCOMPLETE_RUN_SET'
    return report

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('results',nargs='?',default='BOT1D10B_RESULTS')
    a=p.parse_args(argv)
    root=pathlib.Path(a.results)
    if not root.is_dir():p.error(f'Results folder not found: {root}')
    try:summary=analyze_root(root)
    except (ValueError,KeyError,OSError) as exc:p.error(str(exc))
    (root/'BOT1D10B_EVIDENCE.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf8')
    (root/'BOT1D10B_EVIDENCE.md').write_text(render_md(summary),encoding='utf8')
    for x in summary['runs']:
        print(f"round{x['round']:02d} {x['profile']}: {x['classification']}")
    print('D10B:',summary['gate'],summary['ownerCertifiedStage5'],'/',summary['plannedRuns'])
    return 0 if summary['gate']=='ASSISTED_REPEATABILITY_SMOKE_PASSED' else 2

if __name__=='__main__':raise SystemExit(main())
