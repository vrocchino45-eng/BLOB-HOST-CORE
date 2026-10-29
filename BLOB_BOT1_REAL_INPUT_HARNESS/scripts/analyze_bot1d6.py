#!/usr/bin/env python3
"""BOT1-D6 independent owner verdict (never imported by the online bot policy)."""
from __future__ import annotations
import argparse,collections,datetime,json,pathlib,statistics
from bot1d6_policy import objective,stage

HUMAN_MILESTONES={'invitation':32.990,'first_fold_stage':71.433,'completed_fold':79.371}
PROOF_LIMIT=('Recorder owner events adjudicate observed progression; visual intelligibility, '
             'player intent, Guide assistance, and a complete Host circuit are not proven. '
             'Checkpoints while captureActive=true are cumulative partial captures.')


def secs(timestamp,start):
    if not timestamp or not start:return None
    try:
        v=datetime.datetime.fromisoformat(timestamp.replace('Z','+00:00'))
        s=datetime.datetime.fromisoformat(start.replace('Z','+00:00'))
        return round((v-s).total_seconds(),3)
    except (ValueError,TypeError):return None


def evaluate(rec,run=None,checkpoint_only=False):
    events=rec.get('events',[]);start=rec.get('captureStartedAt')
    fold=[e for e in events if e.get('type')=='bot1d-listening-fold-owner-state']
    milestones={};names=[];max_index=0;max_progress=0.;completed=False
    for e in fold:
        s=e.get('state') or {};n=s.get('stage');idx=s.get('stageIndex') or 0
        t=secs(e.get('time'),start)
        if n and n not in names:names.append(n)
        if s.get('foldAvailable') or s.get('nurseryFoldInvitation'):
            milestones.setdefault('invitation',t)
        if idx>=1:milestones.setdefault('first_fold_stage',t)
        if s.get('inApproach') is True:milestones.setdefault('approach',t)
        if s.get('focusReady') is True:milestones.setdefault('focus_ready',t)
        if s.get('completed') is True or (idx>=5 and s.get('progress')==1):
            completed=True;milestones.setdefault('completed_fold',t)
        max_index=max(max_index,idx)
        max_progress=max(max_progress,float(s.get('progress') or 0))
    witness=[e.get('witness') or {} for e in events if e.get('type')=='bot1c-watcher-pulse-owner-result']
    reads=[w for w in witness if w.get('packetPulseReadAccepted') is True]
    outcomes=[e.get('outcome') for e in events if e.get('type')=='guide0-nursery-outcome-pair']
    movements=[e for e in events if e.get('type')=='c0d4-mob1-movement-sample']
    attached=sum(e.get('owner',{}).get('attachment',{}).get('active') is True for e in movements)
    low_progress=sum(e.get('type')=='c0d4-mob1-sustained-low-progress' for e in events)
    guide=[e.get('state',{}).get('guide',{}) for e in events if e.get('type')=='guide0-core-guide-state']
    guide_reactions=collections.Counter(s.get('lastReaction') for s in guide)
    actions=[a for a in (run or {}).get('actions',[]) if a.get('op') not in (None,'stage_observed')]
    weak=sum(a.get('weakVisualChange') is True for a in actions)
    post_invite=[]
    invitation=milestones.get('invitation')
    if invitation is not None:
        post_invite=[e for e in movements if (secs(e.get('time'),start) or 0)>=invitation]
    distances=[e.get('state',{}).get('focusDistance') for e in fold if isinstance(e.get('state',{}).get('focusDistance'),(int,float)) and e.get('state',{}).get('foldAvailable') is True]
    result={
        'revision':'BOT1-D6-REFEREE','status':'FOLD_OWNER_COMPLETED' if completed else 'FOLD_PARTIAL' if max_index else 'INVITED_NO_FOLD_STAGE' if invitation is not None else 'NO_INVITATION',
        'checkpointOnly':checkpoint_only,'eventCount':len(events),'captureStartedAt':start,
        'captureActive':rec.get('captureActive'),'captureDurationSeconds':rec.get('captureDurationSeconds'),
        'droppedRecorderDetails':rec.get('summary',{}).get('captureRetention',{}).get('droppedDetails'),
        'foldMilestonesSeconds':milestones,'foldStagesObserved':names,'maxStageIndex':max_index,
        'maxProgress':max_progress,'ownerCertifiedFoldComplete':completed,
        'minimumOwnerFocusDistanceWhenAvailable':round(min(distances),3) if distances else None,
        'watcherWitnessedPulses':len(witness),'watcherAcceptedReads':len(reads),
        'watcherRejectReasons':dict(collections.Counter(w.get('reason') for w in witness if not w.get('packetPulseReadAccepted'))),
        'nurseryOutcomeCounts':dict(collections.Counter(outcomes)),
        'totalMovementSamples':len(movements),'attachedMovementSamples':attached,
        'postInvitationSamples':len(post_invite),
        'postInvitationAttachedSamples':sum(e.get('owner',{}).get('attachment',{}).get('active') is True for e in post_invite),
        'lowProgressWarningCount':low_progress,
        'guideSampleCount':len(guide),'guideReactionCounts':dict(guide_reactions),
        'botActions':len(actions),'visualWeakMoveCount':weak,
        'botActionStageCounts':dict(collections.Counter(a.get('visibleStage') for a in actions)),
        'humanReferenceSeconds':HUMAN_MILESTONES,
        'humanComparison':'Human reference labels are used OFFLINE only; no identical time/seed or comparable initial state guaranteed.',
        'limitations':PROOF_LIMIT}
    return result


def load_run(folder):
    rec=folder/'REC1.json';run=folder/'RUN.json';checkpoint=False
    if not rec.exists():
        cps=list(folder.glob('REC1_CHECKPOINT_*.json'))
        if not cps:return None,None,False
        # Latest valid cumulative checkpoint; no inference of final completion.
        best=None
        for c in cps:
            try:d=json.loads(c.read_text(encoding='utf-8'))
            except (ValueError,OSError):continue
            if best is None or len(d.get('events',[]))>len(best[1].get('events',[])):
                best=(c,d)
        if best is None:return None,None,False
        rec=best[0];checkpoint=True;data=best[1]
    else:data=json.loads(rec.read_text(encoding='utf-8'))
    run_data=json.loads(run.read_text(encoding='utf-8')) if run.exists() else {}
    return data,run_data,checkpoint


def report(folder):
    r,run,checkpoint=load_run(folder)
    if r is None:return {'folder':folder.name,'status':'NO_REC1_EVIDENCE','issues':['No valid REC1.json or checkpoint']}
    x=evaluate(r,run,checkpoint);x['folder']=folder.name
    x['checkpointCount']=len((run or {}).get('checkpoints',[]))
    x['browserStatus']=(run or {}).get('status')
    return x


def markdown(results):
    lines=['# BOT1-D6 — Human-reference navigation audit','',
     'Human baseline: Fold invitation at 32.990s, first authored stage at 71.433s, owner-certified completion at 79.371s. These are offline scoring references only.','']
    for r in results:
        lines += ['## '+r['folder'],'',
           '**Referee status:** '+r['status'],
           '**Recording:** '+('checkpoint only; incomplete capture' if r.get('checkpointOnly') else 'final REC1 export'),'',
           '| Observation | Value |','|---|---|']
        for key in ['eventCount','droppedRecorderDetails','watcherWitnessedPulses','watcherAcceptedReads','minimumOwnerFocusDistanceWhenAvailable',
                    'maxStageIndex','maxProgress','ownerCertifiedFoldComplete','totalMovementSamples','attachedMovementSamples',
                    'postInvitationSamples','postInvitationAttachedSamples','lowProgressWarningCount','guideSampleCount',
                    'visualWeakMoveCount','checkpointCount']:
            lines.append(f'| {key} | {r.get(key)} |')
        lines+=['','**Authored milestones (seconds since recording start):** '+str(r.get('foldMilestonesSeconds',{})),
                '**Nursery outcomes:** '+str(r.get('nurseryOutcomeCounts',{})),
                '**Guide reactions:** '+str(r.get('guideReactionCounts',{})),
                '**Visible-stage actions:** '+str(r.get('botActionStageCounts',{})),'']
    lines+=['## Proof boundaries','',PROOF_LIMIT,'','A Pulse input does not prove an accepted target, an invited Fold does not prove an approached Fold, and a Guide pose does not prove physical force or navigation assistance.']
    return '\n'.join(lines)+'\n'


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('folder');a=p.parse_args()
    root=pathlib.Path(a.folder);dirs=[x for x in root.iterdir() if x.is_dir() and (x.name.startswith('BOT1D6_') or (x/'REC1.json').exists())]
    if not dirs:p.error('No BOT1-D6 folders found in '+str(root))
    results=[report(d) for d in sorted(dirs)]
    (root/'BOT1D6_EVIDENCE.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    (root/'BOT1D6_EVIDENCE.md').write_text(markdown(results),encoding='utf-8')
    for result in results:print(result['folder'],result['status'], 'stage',result.get('maxStageIndex'), 'events',result.get('eventCount'))
    print('Wrote',root/'BOT1D6_EVIDENCE.md')
    return 0 if all(x.get('status')!='NO_REC1_EVIDENCE' for x in results) else 2
if __name__=='__main__':raise SystemExit(main())
