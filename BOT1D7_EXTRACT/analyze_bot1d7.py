#!/usr/bin/env python3
"""BOT1-D7 independent REC1 referee; do not import into bot policy."""
from __future__ import annotations
import argparse,collections,json,pathlib
from analyze_bot1d6 import load_run,evaluate,PROOF_LIMIT


def judge(folder:pathlib.Path):
    rec,run,checkpoint_only=load_run(folder)
    if not rec:return {'folder':folder.name,'status':'NO_REC1','issue':'No valid export/checkpoint'}
    verdict=evaluate(rec,run,checkpoint_only)
    choices=(run or {}).get('surveys',[])
    verdict.update({'revision':'BOT1-D7-REFEREE','folder':folder.name,
        'visualSurveys':len(choices),
        'candidateFrames':sum(bool(s.get('initialCandidates')) for s in choices),
        'ambiguousSurveys':sum(s.get('ambiguous') is True for s in choices),
        'chosenHeadingCounts':dict(collections.Counter(s.get('chosenHeading') for s in choices)),
        'appearanceChangedAboveAmbient':sum(s.get('movement',{}).get('visualChangeAboveAmbient') is True for s in choices),
        'policyProofLimit':'Visual novelty is not physical travel, direction to target, or Fold identification.',
        'humanOwnerComparison':'Human owner completed Fold; independent reference, not controlled same-camera replay.',
        'd6OwnerComparison':{'D6_minFocusDistance':5.592,'D6_maxStageIndex':0,
            'D6_postInvitationAttachmentSamples':0,'D6_postInvitationStartEndDisplacementApprox':.50},
        'gameplayChanged':False,'checkpointCount':len((run or {}).get('checkpoints',[]))})
    return verdict


def to_markdown(results):
    lines=['# BOT1-D7 — visual-landmark survey field evidence','',
     'Review alongside BOT1-D6 and authenticated human G1-D6 REC1. Bot makes online decisions from screenshots, HUD and its own actions only.','']
    for r in results:
        lines+=['## '+r.get('folder','unknown'),'',
          '**Independent Fold verdict:** '+str(r['status']),
          '**Owner-certified completion:** '+str(r.get('ownerCertifiedFoldComplete')),
          '**Checkpoint-only:** '+str(r.get('checkpointOnly')),'',
          '| Metric | Value |','|---|---|']
        for name in ['eventCount','watcherAcceptedReads','maxStageIndex','minimumOwnerFocusDistanceWhenAvailable',
          'visualSurveys','candidateFrames','ambiguousSurveys','appearanceChangedAboveAmbient',
          'attachedMovementSamples','lowProgressWarningCount','checkpointCount','droppedRecorderDetails']:
            lines.append(f'| {name} | {r.get(name)} |')
        lines+=['','**Heading choices:** '+str(r.get('chosenHeadingCounts')),
           '**Milestones:** '+str(r.get('foldMilestonesSeconds')),'']
    lines+=['## Acceptance and restrictions','',
            '- StageIndex >= 1 or owner `inApproach:true` is a real improvement in authored Fold navigation. Owner-certified completion is the stronger result.',
            '- More visual candidate detections, screenshot novelty, or movement do NOT prove approaching the Fold.',
            '- No successful run should be inferred from the script or synthetic fixtures.',
            '- D6 distance comparisons are *context*, not equal-state controlled A/B evidence.',
            '- Guide movement remains a separate GUIDE1-A interpretation question.',
            '- Circuit topology and 3/6/12 physiology are unaffected.',
            '',PROOF_LIMIT,'']
    return '\n'.join(lines)


def main():
    p=argparse.ArgumentParser();p.add_argument('folder');a=p.parse_args()
    root=pathlib.Path(a.folder)
    if not root.exists():p.error('Results folder missing: '+str(root))
    folders=sorted(x for x in root.iterdir() if x.is_dir() and x.name.startswith('BOT1D7_'))
    if not folders:p.error('No BOT1D7_ run folders in '+str(root))
    r=[judge(d) for d in folders]
    (root/'BOT1D7_EVIDENCE.json').write_text(json.dumps(r,indent=2),encoding='utf8')
    (root/'BOT1D7_EVIDENCE.md').write_text(to_markdown(r),encoding='utf8')
    for x in r:print(x['folder'],x['status'],'stage',x.get('maxStageIndex'),'surveys',x.get('visualSurveys'))
    print('Wrote',root/'BOT1D7_EVIDENCE.md')
    return 0 if all(x['status']!='NO_REC1' for x in r) else 2
if __name__=='__main__':raise SystemExit(main())
