#!/usr/bin/env python3
"""GUIDE0-W: read-only evidence audit of existing REC1 capture folders.

Never infers Guide understanding or force from pose/animation alone.
Owner outcomes, input witness, Guide posture, and HUD prompt remain distinct.
"""
import argparse, collections, json, pathlib


def audit(folder):
    rec_path=folder/'REC1.json'
    if not rec_path.exists():
        return {'folder': folder.name, 'grade':'NO_REC1'}
    data=json.loads(rec_path.read_text(encoding='utf-8'))
    events=data.get('events',[])
    pair=[x for x in events if x.get('type')=='guide0-pulse-owner-pair']
    outcomes=[x for x in events if x.get('type')=='guide0-nursery-outcome-pair']
    guides=[x for x in events if x.get('type')=='guide0-core-guide-state']
    watcher=[x for x in events if x.get('type')=='bot1c-watcher-pulse-owner-result']
    pcounts=collections.Counter(str(x.get('owner',{}).get('reason','unknown')) for x in pair)
    states=collections.Counter(str(x.get('state',{}).get('guide',{}).get('state','unpublished')) for x in guides)
    reactions=collections.Counter(str(x.get('state',{}).get('guide',{}).get('lastReaction','none')) for x in guides)
    pairs_rejected=[x for x in pair if x.get('owner',{}).get('accepted') is False]
    pairs_accepted=[x for x in pair if x.get('owner',{}).get('accepted') is True]
    pulse_answers_but_rejected=sum(x.get('guide',{}).get('state')=='answering_player_pulse' for x in pairs_rejected)
    scar_outcomes=[x for x in outcomes if 'scar' in str(x.get('outcome','')).lower()]
    scar_warning_at_outcome=sum(x.get('guide',{}).get('state')=='fold_shut_and_dim' for x in scar_outcomes)
    prompt_sources=collections.Counter(str(x.get('state',{}).get('prompt',{}).get('contentOwner','unpublished')) for x in guides)
    missing_prompt=sum(not x.get('state',{}).get('prompt',{}).get('objectiveLine') for x in guides)
    stale_hazard=[x for x in guides if x.get('state',{}).get('activeCellId')!='CELL_MEMBRANE_NURSERY_001' and x.get('state',{}).get('owner',{}).get('nurseryActive')]
    result={
      'folder':folder.name,
      'grade':'GUIDE_SAMPLED_WITH_OWNER_PAIR' if guides and pair else 'GUIDE_SAMPLED_NO_OWNER_PAIR' if guides else 'GUIDE0_NOT_INSTALLED_OR_NO_SAMPLES',
      'captureSeconds':data.get('captureDurationSeconds'), 'rec1Events':len(events),
      'captureDropped':data.get('summary',{}).get('captureRetention',{}).get('droppedDetails'),
      'ownerPulseWitnesses':len(watcher),'guidePulsePairs':len(pair),'pairsAccepted':len(pairs_accepted),'pairsRejected':len(pairs_rejected),
      'guideStateSamples':len(guides),'nurseryOutcomePairs':len(outcomes),'scarOutcomes':len(scar_outcomes),
      'scarWarningsAtOutcome':scar_warning_at_outcome,
      'guideAnsweringDuringRejectedPulse':pulse_answers_but_rejected,
      'pulseReasons':dict(pcounts),'guideStates':dict(states),'guideReactions':dict(reactions),
      'promptOwners':dict(prompt_sources),'samplesMissingPromptObjective':missing_prompt,
      'staleNurseryOwnerOnDifferentCellSamples':len(stale_hazard),
      'acceptedPairEvidence':[{'pulseEventId':x.get('pulseEventId'),'owner':x.get('owner'), 'guide':x.get('guide'),'prompt':x.get('prompt')} for x in pairs_accepted[:10]],
      'scarOutcomeEvidence':[{'outcome':x.get('outcome'),'guide':x.get('guide'),'prompt':x.get('prompt')} for x in scar_outcomes[:10]],
      'limits':[
        'Pulse input and Guide answering animation are not Watcher acceptance.',
        'A currentChemTarget scar warning is not necessarily a traveling scar packet warning.',
        '150ms REC1 sampling may miss or misorder short Guide visual states.',
        'A Core Work physically_holding string is a pose claim, not force or owned grip.',
        'The bot sees HUD only, not Guide owner state or packet material class.',
        'No game/HUD change or authored mechanic pass is claimed by this analysis.'
      ]
    }
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('folder',type=pathlib.Path,nargs='?',default=pathlib.Path('GUIDE0_RESULTS'))
    a=parser.parse_args()
    if not a.folder.is_dir():parser.error('Results folder missing')
    dirs=[x for x in a.folder.iterdir() if x.is_dir() and (x/'REC1.json').exists()]
    if not dirs and (a.folder/'REC1.json').exists():dirs=[a.folder]
    if not dirs:parser.error('No REC1.json in subfolders')
    reports=[audit(d) for d in sorted(dirs)]
    out={'revision':'GUIDE0-W','evidenceKind':'READ_ONLY_CROSS_OWNER_REC1','runs':reports}
    (a.folder/'GUIDE0_EVIDENCE.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
    lines=['# GUIDE0-W — Core / Guide / Watcher / HUD evidence','',
           'Guide pose and Watcher owner truth are **separate**. These are diagnostics, not proof of physical assistance.','']
    for r in reports:
        lines.extend([f"## {r['folder']}",f"**Verdict:** `{r['grade']}`",''])
        if 'guidePulsePairs' not in r: continue
        lines.extend([
          f"- Recorded {r['rec1Events']} events over {r['captureSeconds']} seconds; drops: {r['captureDropped']}",
          f"- Pulse owner witnesses: {r['ownerPulseWitnesses']}; GUIDE0 paired: {r['guidePulsePairs']} (accepted {r['pairsAccepted']}, rejected {r['pairsRejected']})",
          f"- Guide answering on rejected Pulse snapshots: {r['guideAnsweringDuringRejectedPulse']} — a response to input, **not** owner acceptance",
          f"- Scar-owner outcomes: {r['scarOutcomes']}; simultaneous fold-shut Guide warning snapshots: {r['scarWarningsAtOutcome']} (not a visual readability verdict)",
          f"- Guide owner snapshots: {r['guideStateSamples']}; missing prompt objective: {r['samplesMissingPromptObjective']}",
          f"- Guide states: `{json.dumps(r['guideStates'],sort_keys=True)}`",
          f"- Guide prompt content owners: `{json.dumps(r['promptOwners'],sort_keys=True)}`",''])
    lines += ['## Proof boundary','']+['- '+s for s in reports[0].get('limits',[])]
    (a.folder/'GUIDE0_EVIDENCE.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('GUIDE0-W analyzed',len(reports),'REC1 run(s).')
    for r in reports: print(r['folder'],r['grade'],r.get('guidePulsePairs','-'),'owner pairs')
    return 0

if __name__=='__main__':raise SystemExit(main())
