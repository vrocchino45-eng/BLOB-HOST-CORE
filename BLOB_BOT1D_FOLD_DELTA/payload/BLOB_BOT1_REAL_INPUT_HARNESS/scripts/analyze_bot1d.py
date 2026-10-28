#!/usr/bin/env python3
"""Grade BOT1-D independently from REC1 owner-state snapshots.

A HUD statement or input event is never treated as an authored stage advance.
"""
from __future__ import annotations
import argparse, json, pathlib


def grade_run(folder):
    run=json.loads((folder/'RUN.json').read_text(encoding='utf-8'))
    rec_path=folder/'REC1.json'
    if not rec_path.exists():
        return {'folder':folder.name,'grade':'NO_REC1', 'reason':'REC1 missing; no gameplay verdict'}
    rec=json.loads(rec_path.read_text(encoding='utf-8'))
    ev=rec.get('events',[])
    fold=[e['state'] for e in ev if e.get('type')=='bot1d-listening-fold-owner-state' and isinstance(e.get('state'),dict)]
    watcher=[e.get('state',{}) for e in ev if e.get('type')=='bot1c-watcher-owner-state-change']
    accepted=[e.get('witness',{}) for e in ev if e.get('type')=='bot1c-watcher-pulse-owner-result'
              and e.get('witness',{}).get('packetPulseReadAccepted') is True]
    reported=rec.get('summary',{}).get('captureRetention',{})
    max_stage=max([int(x['stageIndex']) for x in fold if isinstance(x.get('stageIndex'),int)],default=None)
    completed=any(x.get('completed') is True and x.get('stageIndex',0)>=5 for x in fold)
    invited=any(x.get('nurseryFoldInvitation') is True for x in fold) or any(x.get('foldInvitation') is True for x in watcher)
    grade=('FOLD_COMPLETE' if completed else 'FOLD_REACHED_STAGE_ADVANCED' if max_stage is not None and max_stage>=1
           else 'INVITED_NO_AUTHORED_STAGE_ADVANCE' if invited else 'WATCHER_READ_ONLY' if accepted
           else 'NO_WATCHER_READ')
    if not fold:grade='NO_FOLD_OWNER_WITNESS'
    raw_pulses=sum(1 for e in ev if e.get('type')=='game-pulse-event')
    return {'folder':folder.name,'grade':grade,'captureStatus':run.get('status'),
            'captureDurationSeconds':rec.get('captureDurationSeconds'),
            'events':len(ev),'droppedRecorderEvents':reported.get('droppedDetails'),
            'visibleHudInvitationDetected':run.get('reachedFoldPhaseViaVisibleHUD',False),
            'watcherOwnerAcceptedPulseReads':len(accepted),'watcherFoldInvited':invited,
            'pulseInputsObserved':raw_pulses,'foldOwnerStageSnapshots':len(fold),
            'foldMaxAuthoredStageIndex':max_stage,'foldCompletedByOwner':completed,
            'lastFoldOwnerState':fold[-1] if fold else None,
            'botActionCounts':{op:sum(1 for a in run.get('actions',[]) if a.get('op')==op)
                               for op in sorted({a.get('op') for a in run.get('actions',[]) if a.get('op')})},
            'pageErrors':run.get('errors',[]),
            'note':'No accepted input is inferred from a HUD instruction. A Fold stage advance is sourced exclusively from SurfaceWakeLayeredInteractionSystem published state.'}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('folder',type=pathlib.Path,nargs='?',default=pathlib.Path('BOT1D_RESULTS'))
    a=p.parse_args()
    dirs=[x for x in a.folder.iterdir() if x.is_dir() and x.name.startswith('BOT1D_') and (x/'RUN.json').exists()]
    if not dirs:p.error('No BOT1-D RUN.json folders found')
    grades=[grade_run(x) for x in sorted(dirs)]
    report={'revision':'BOT1-D','kind':'INDEPENDENT_OWNER_EVIDENCE','runs':grades}
    (a.folder/'BOT1D_EVIDENCE.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    lines=['# BOT1-D — Listening Fold Evidence','',
           'REC1 owner witnesses are the arbiter. HUD text is merely the bot\'s perception; Pulse input is not completion.','']
    for x in grades:
        lines.extend([f"## {x['folder']}", f"**Verdict:** {x['grade']}",
          f"- Recorded: {x['captureDurationSeconds']}s, {x['events']} events; dropped: {x['droppedRecorderEvents']}",
          f"- Visible HUD invitation detected by bot: {x['visibleHudInvitationDetected']}",
          f"- Owner Pulse reads accepted: {x['watcherOwnerAcceptedPulseReads']} / {x['pulseInputsObserved']} recorded pulses",
          f"- Nursery invitation present in owner state: {x['watcherFoldInvited']}",
          f"- Fold owner snapshots: {x['foldOwnerStageSnapshots']} · max authored stage: {x['foldMaxAuthoredStageIndex']} · completed: {x['foldCompletedByOwner']}",
          f"- Actions: {json.dumps(x['botActionCounts'],sort_keys=True)}",
          f"- Page errors: {x['pageErrors']}",''])
    lines+=['## Proof limits','',
           '- An invitation is not a Fold approach, an approach is not the completed five-step Fold sequence.',
           '- The bot did not use source-owned target coordinates, authoring IDs, or hidden progress to choose actions.',
           '- An exploratory bot unable to locate a visible cue is not proof that the scene is inaccessible.',
           '- The Fold stage does not grant new Host material receipts or interregional progression.','']
    (a.folder/'BOT1D_EVIDENCE.md').write_text('\n'.join(lines),encoding='utf-8')
    print('Analyzed',len(grades),'BOT1-D runs; wrote',a.folder/'BOT1D_EVIDENCE.md')
    for g in grades:print(g['folder'],g['grade'])
    return 0


if __name__=='__main__':raise SystemExit(main())
