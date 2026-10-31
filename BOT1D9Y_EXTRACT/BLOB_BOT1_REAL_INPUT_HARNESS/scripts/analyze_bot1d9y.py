#!/usr/bin/env python3
"""BOT1-D9Y independent offline scripted-run referee. Run AFTER browser closes.

REC1 is an owner-truth artifact, not a live navigation or targeting input.
"""
from __future__ import annotations
import argparse,datetime,json,pathlib

FOLD='bot1d-listening-fold-owner-state'
WATCHER='bot1c-watcher-pulse-owner-result'
WATCHER_STATE='bot1c-watcher-owner-state-change'
STABILIZE='game-stabilize-started'
STAGES={1:'observe_first_answer',2:'sustain_first_resonance',3:'watch_tissue_response',
        4:'release_and_settle',5:'surface_wake_complete'}
HOST_TYPES={'host-silt-cause-observed','vascular-silt-signal-received',
            'c0d1-host-vascular-effect-observed','c0d3-host-grave-resolution-observed'}

def timestamp(value):
    try:return datetime.datetime.fromisoformat(value.replace('Z','+00:00')).timestamp()
    except (ValueError,AttributeError,TypeError):return None

def evaluate(rec,run):
    ev=rec.get('events') or []
    retain=(rec.get('summary') or {}).get('captureRetention') or {}
    complete=bool(run.get('status')=='CAPTURED' and not run.get('errors') and ev
                  and retain.get('droppedDetails')==0 and rec.get('captureActive') is False)
    accepted=[e for e in ev if e.get('type')==WATCHER
              and (e.get('witness') or {}).get('packetPulseReadAccepted') is True]
    invited=[e for e in ev if
             (e.get('type')==WATCHER_STATE and (e.get('state') or {}).get('foldInvitation') is True) or
             (e.get('type')==FOLD and (e.get('state') or {}).get('nurseryFoldInvitation') is True)]
    first={}
    for e in ev:
        if e.get('type')==FOLD:
            idx=(e.get('state') or {}).get('stageIndex')
            if isinstance(idx,int) and idx in STAGES and idx not in first:first[idx]=e
    stamps=[timestamp(first[i]['time']) if i in first else None for i in range(1,6)]
    order=bool(all(t is not None for t in stamps) and all(a<b for a,b in zip(stamps,stamps[1:])))
    names=bool(len(first)==5 and all(first[i]['state'].get('stage')==STAGES[i] for i in range(1,6)))
    last=(first.get(5) or {}).get('state') or {}
    stage5=bool(order and names and last.get('completed') is True and last.get('progress')==1)
    start=stamps[0]
    accepted_prior=bool(start is not None and any(timestamp(e.get('time')) is not None
        and timestamp(e['time'])<=start for e in accepted))
    invite_prior=bool(start is not None and any(timestamp(e.get('time')) is not None
        and timestamp(e['time'])<=start for e in invited))
    holds=(run.get('arrival') or {}).get('holdActions') or []
    stabilize=[e for e in ev if e.get('type')==STABILIZE]
    hold_paired=False
    t3=stamps[2]
    for h in holds:
        a,b=timestamp(h.get('atStart')),timestamp(h.get('atEnd'))
        if not h.get('key')=='q' or a is None or b is None or t3 is None or not a<=b:continue
        if not a-.15<=t3<=b+1.0:continue
        if any((ts:=timestamp(e.get('time'))) is not None and
            a-.45<=ts<=b+.25 and ts<=t3+.15 for e in stabilize):
            hold_paired=True;break
    certified=bool(complete and stage5 and accepted_prior and invite_prior and hold_paired
                   and run.get('courseStarted') and (run.get('arrival') or {}).get('noOnlineOwnerCertification') is True)
    if not complete:status='INCONCLUSIVE_CAPTURE'
    elif certified:status='CERTIFIED_FOLD_STAGE5'
    elif not invited:status='NO_OWNER_INVITATION'
    elif not first.get(1):status='INVITED_BUT_NO_FOLD_APPROACH'
    elif not hold_paired:status='FOLD_STARTED_BUT_NO_PAIRED_STABILIZE'
    else:status='FOLD_INCOMPLETE'
    return {'revision':'BOT1-D9Y-OFFLINE-REFEREE','profile':run.get('profile'),
      'assistedScripted':True,'status':status,'certifiedFoldStage5':certified,
      'rec1Complete':complete,'rec1Events':len(ev),'droppedDetails':retain.get('droppedDetails'),
      'acceptedWatcherReads':len(accepted),'ownerInvitationObserved':bool(invited),
      'acceptedReadPriorStage1':accepted_prior,'invitationPriorStage1':invite_prior,
      'ownerStageTimes':{str(i):(first.get(i) or {}).get('time') for i in range(1,6)},
      'ownerStagesOrdered':order,'ownerStageNamesCorrect':names,'ownerStage5Completed':stage5,
      'keyboardHoldPairedWithStabilizeOwner':hold_paired,
      'guideObserverSamples':sum(e.get('type')=='guide0-core-guide-state' for e in ev),
      'hostEventCounts':{key:sum(e.get('type')==key for e in ev) for key in sorted(HOST_TYPES)},
      'proofLimits':['Assisted scripted test, not proof of player discoverability or autonomous navigation.',
        'Profile names are policies, not world RNG seeds.',
        'Fold Stage5 does not certify Host material receipt or Guide causality.',
        'REC1 used only after completion of the browser run.']}

def summarize(rows):
    count=sum(bool(x['certifiedFoldStage5']) for x in rows)
    complete=all(r['rec1Complete'] for r in rows) and bool(rows)
    return {'revision':'BOT1-D9Y','assistedScripted':True,'total':len(rows),
        'certifiedStage5':count,'completeEvidence':complete,'runs':rows,
        'gate':'INCOMPLETE_CAPTURE' if not complete else 'ASSISTED_ALL_PASSED' if count==len(rows)
            else 'ASSISTED_PARTIAL' if count else 'ASSISTED_NONE_PASSED',
        'discoverabilityGate':'NOT_TESTED','hostCoreGuideCausality':'NOT_PROVEN'}

def report_text(agg):
    out=['# BOT1-D9Y — Scripted targeting evidence','',f"**Gate:** `{agg['gate']}`",
        f"**Owner Stage 5:** {agg['certifiedStage5']}/{agg['total']}",
        '**Nature:** assisted scripted; neither world-RNG replication nor human discoverability', '',
        '| Script | Watcher reads | Owner invitation | Stage 5 | Q paired | Verdict |',
        '|---|---:|---|---|---|---|']
    for r in agg['runs']:
        out.append(f"| {r['profile']} | {r['acceptedWatcherReads']} | {r['ownerInvitationObserved']} | "
            f"{r['ownerStage5Completed']} | {r['keyboardHoldPairedWithStabilizeOwner']} | {r['status']} |")
    out.extend(['','All failures remain in the matrix. A script pass does not prove natural targeting.',
                'Any actual Host receipt must be evaluated separately from Fold Stage 5.',''])
    return '\n'.join(out)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('folder',help='Directory containing BOT1D9Y_* run subfolders')
    args=p.parse_args();root=pathlib.Path(args.folder)
    if not root.is_dir():p.error('Missing folder')
    dirs=sorted(d for d in root.iterdir() if d.is_dir() and d.name.startswith('BOT1D9Y_'))
    if not dirs:p.error('No runs present')
    rows=[]
    for d in dirs:
        runfile=d/'RUN.json';recfile=d/'REC1.json'
        run=json.loads(runfile.read_text('utf8')) if runfile.exists() else {}
        rec=json.loads(recfile.read_text('utf8')) if recfile.exists() else {}
        r=evaluate(rec,run);rows.append(r)
        (d/'D9Y_EVIDENCE.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf8')
        print(r['profile'],r['status'],r['acceptedWatcherReads'],'reads')
    agg=summarize(rows)
    (root/'BOT1D9Y_EVIDENCE.json').write_text(json.dumps(agg,indent=2)+'\n',encoding='utf8')
    (root/'BOT1D9Y_EVIDENCE.md').write_text(report_text(agg),encoding='utf8')
    print('D9Y gate:',agg['gate'])
    return 0 if agg['completeEvidence'] else 2

if __name__=='__main__':raise SystemExit(main())
