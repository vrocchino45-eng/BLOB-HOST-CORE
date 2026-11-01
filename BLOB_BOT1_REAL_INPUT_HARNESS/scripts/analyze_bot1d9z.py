#!/usr/bin/env python3
"""BOT1-D9Z independent offline Fold owner + attachment diagnostic referee.

Never import this into bot1d9z_browser.py or use REC1 data during online runs.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib
from analyze_bot1d9y import evaluate as evaluate_fold, timestamp, STAGES
from bot1d9z_policy import class_for_recovery

OBS_TYPES=('g1d9s-neutral-movement-observation','c0d4-mob1-movement-sample')
FOLD='bot1d-listening-fold-owner-state'


def attachment_samples(rec, after=None):
    samples=[]
    for e in rec.get('events') or []:
        if e.get('type') not in OBS_TYPES:continue
        at=timestamp(e.get('time'))
        if after is not None and (at is None or at<after):continue
        owner=e.get('owner') or {};att=owner.get('attachment') or {}
        if not isinstance(att.get('active'),bool):continue
        motion=owner.get('motion') or {}
        samples.append({'at':e.get('time'),'attached':att['active'],
            'authority':att.get('authority'),'peelIntent':att.get('peelIntent01'),
            'locomotionMode':motion.get('locomotionMode'),
            'surfaceId':att.get('surfaceId')})
    return samples


def focus_samples(rec,after=None):
    entries=[]
    for e in rec.get('events') or []:
        if e.get('type')!=FOLD:continue
        if after is not None and (timestamp(e.get('time')) or 0)<after:continue
        state=e.get('state') or {}
        if state.get('nurseryFoldInvitation') is not True:continue
        distance=state.get('focusDistance')
        if isinstance(distance,(float,int)) and distance>0:
            entries.append({'time':e.get('time'),'distance':float(distance),
                'stage':state.get('stageIndex'), 'inApproach':state.get('inApproach'),
                'focusReady':state.get('focusReady')})
    return entries


def evaluate(rec,run):
    base=evaluate_fold(rec,run)
    events=rec.get('events') or []
    started=sorted([e for e in events if e.get('type')=='game-stabilize-started'],key=lambda e:e.get('time') or '')
    ended=sorted([e for e in events if e.get('type')=='game-stabilize-ended'],key=lambda e:e.get('time') or '')
    holds=(run.get('arrival') or {}).get('holdActions') or []
    # D9Y certified the START+owner Stage3 alignment; D9Z additionally requires
    # a genuine ordered Stabilize end within the player keyboard hold/release window.
    end_paired=False
    for h in holds:
        a,b=timestamp(h.get('atStart')),timestamp(h.get('atEnd'))
        if a is None or b is None:continue
        if any((t0:=timestamp(e0.get('time'))) is not None and a-.4<=t0<=b+.4 and
               any((t1:=timestamp(e1.get('time'))) is not None and
                   t0<t1 and b-.6<=t1<=b+1.25 for e1 in ended)
               for e0 in started):
            end_paired=True
            break
    base['orderedStabilizeEndPaired']=end_paired
    base['certifiedFoldStage5']=bool(base['certifiedFoldStage5'] and end_paired)
    if base['status']=='CERTIFIED_FOLD_STAGE5' and not end_paired:
        base['status']='STABILIZE_END_MISSING_OR_UNPAIRED'
    fold_start=base.get('ownerStageTimes',{}).get('1')
    first_stage=fold_start is not None
    peel_actions=[n for n in run.get('navigation',[]) if n.get('experimentalPeel') is True]
    peel_start=min((timestamp(n.get('atStart')) for n in peel_actions if timestamp(n.get('atStart')) is not None),default=None)
    samples=attachment_samples(rec)
    post_samples=attachment_samples(rec,after=peel_start) if peel_start else []
    f=focus_samples(rec)
    base['attachmentOffline']={
        'sampleCount':len(samples),'attachedCount':sum(s['attached'] for s in samples),
        'peelTrialCount':len(peel_actions),'postPeelSampleCount':len(post_samples),
        'postPeelAttachedCount':sum(s['attached'] for s in post_samples),
        'postPeelLastAttached':post_samples[-1]['attached'] if post_samples else None,
        'postPeelOwnerObservations':post_samples,
        'caveat':'Owner samples are sparse; no attachment state was used by the online bot.'}
    base['foldDistanceOffline']={
        'invitedSamples':len(f), 'first':round(f[0]['distance'],3) if f else None,
        'min':round(min(x['distance'] for x in f),3) if f else None,
        'last':round(f[-1]['distance'],3) if f else None,
        'caveat':'Post-run diagnostic only; never a steering target.'}
    nav=run.get('navigationVerdict') or {}
    base['publicCueSeenOnline']=bool(nav.get('publicCueSeen')) if run.get('profile')!='golden' else None
    base['publicCueFirstTime']=nav.get('firstCueAt')
    if run.get('profile')=='recovery':
        base['recoveryDiagnosis']=class_for_recovery(
            bool(base['ownerInvitationObserved']),bool(base['certifiedFoldStage5']),
            first_stage,post_samples)
    else:base['recoveryDiagnosis']='NOT_APPLICABLE'
    base['revision']='BOT1-D9Z-OFFLINE-REFEREE'
    base['refereeStatus']=('INCONCLUSIVE_CAPTURE' if not base['rec1Complete'] else
        'CERTIFIED_FOLD_STAGE5' if base['certifiedFoldStage5'] else base['status'])
    base['proofLimits']+=['Stabilize START and END are independently checked with recorded Q hold.',
        'Attachment direction tests are precommitted and not guaranteed to peel.',
        'A complete REC1 does not prove the player could naturally find the route.']
    return base


def summarize(rows):
    c=sum(bool(r['certifiedFoldStage5']) for r in rows)
    expected={'golden','guided','recovery'}
    received={r.get('profile') for r in rows}
    full=bool(rows) and all(r['rec1Complete'] for r in rows)
    if not full:gate='INCOMPLETE_CAPTURE'
    elif received!=expected:gate='PARTIAL_PROFILE_SET'
    else:gate='ASSISTED_ALL_PASSED' if c==len(rows) else ('ASSISTED_PARTIAL' if c else 'ASSISTED_NONE_PASSED')
    return {'revision':'BOT1-D9Z','assistedScripted':True,'total':len(rows),
        'certifiedStage5':c,'completeEvidence':full and received==expected,'missingProfiles':sorted(expected-received),
        'gate':gate,'runs':rows,
        'discoverabilityGate':'NOT_TESTED','hostCoreGuideCausality':'NOT_PROVEN',
        'worldSeedSet':False,'ownerDataUsedForOnlineSteering':False}


def report(agg):
    lines=['# BLOB — BOT1-D9Z scripted handoff evidence','',
        '**Gate:** `'+agg['gate']+'`',
        f"**Owner Stage 5:** {agg['certifiedStage5']}/{agg['total']}",
        '**Nature:** Assisted scripted; not autonomous discovery or multiple world seeds.','',
        '| Profile | Watcher reads | Owner invite | Stage 5 | Q START/END | Public cue | Recovery diagnosis |',
        '|---|---:|---|---|---|---|---|']
    for r in agg['runs']:
        lines.append(f"| {r['profile']} | {r['acceptedWatcherReads']} | {r['ownerInvitationObserved']} | {r['certifiedFoldStage5']} | {r['orderedStabilizeEndPaired']} | {r['publicCueSeenOnline']} | {r['recoveryDiagnosis']} |")
    lines+=['','## Evidence boundaries',
       'The bot sees HUD strings and ordinary game input only. REC1 is read after capture.',
       'No Fold completion is counted as a Host receipt. Attachment owner data is diagnostic, not a targeting input.',
       'A precommitted six-axis movement sweep is a diagnostic, not an automatic detach system.']
    return '\n'.join(lines)+'\n'


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('results',nargs='?',default='BOT1D9Z_RESULTS')
    args=p.parse_args(); root=pathlib.Path(args.results)
    folders=sorted(x for x in root.iterdir() if x.is_dir() and (x/'RUN.json').exists())
    rows=[]
    for folder in folders:
        run=json.loads((folder/'RUN.json').read_text(encoding='utf8'))
        if not (folder/'REC1.json').exists():
            print(folder.name,': missing REC1');continue
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf8'))
        result=evaluate(rec,run);rows.append(result)
        (folder/'D9Z_EVIDENCE.json').write_text(json.dumps(result,indent=2),encoding='utf8')
        print(run.get('profile'),result['refereeStatus'],result['recoveryDiagnosis'])
    agg=summarize(rows)
    (root/'BOT1D9Z_EVIDENCE.json').write_text(json.dumps(agg,indent=2),encoding='utf8')
    (root/'BOT1D9Z_EVIDENCE.md').write_text(report(agg),encoding='utf8')
    print('D9Z:',agg['gate'],agg['certifiedStage5'],'/',agg['total'])
    return 0 if agg['completeEvidence'] else 2

if __name__=='__main__':raise SystemExit(main())
