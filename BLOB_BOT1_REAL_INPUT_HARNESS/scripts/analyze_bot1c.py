#!/usr/bin/env python3
"""BOT1-C referee: match exact Pulse IDs, do not infer owner results from raw input or HUD."""
from __future__ import annotations
import argparse, collections, json, pathlib

def classify(root):
    outputs=[]
    for folder in sorted(root.glob('BOT1C_*')):
        if not folder.is_dir() or not (folder/'RUN.json').exists():continue
        run=json.loads((folder/'RUN.json').read_text(encoding='utf-8'))
        if not (folder/'REC1.json').exists():
            outputs.append({'case':run['case'],'status':'NO_REC1'});continue
        rec=json.loads((folder/'REC1.json').read_text(encoding='utf-8'))
        events=rec.get('events',[])
        pulses=[e for e in events if e.get('type')=='game-pulse-event']
        witnesses=[e['witness'] for e in events if e.get('type')=='bot1c-watcher-pulse-owner-result' and e.get('witness',{}).get('revision')=='BOT1-C']
        states=[e['state'] for e in events if e.get('type')=='bot1c-watcher-owner-state-change']
        ids=collections.Counter(w.get('pulseEventId') for w in witnesses)
        rec_ids=set(e.get('pulseEventId') for e in pulses)
        matched=[w for w in witnesses if w.get('pulseEventId') in rec_ids]
        owner_only=[w for w in witnesses if w.get('pulseEventId') not in rec_ids]
        reasons=dict(collections.Counter(w.get('reason') for w in witnesses))
        acknowledged=[w for w in witnesses if w.get('packetPulseReadAccepted') is True and w.get('reason')=='packet_pulse_read_accepted']
        read_state=any(s.get('packetIdentified') is True or s.get('packetPulseRead') is True for s in states)
        success=bool(acknowledged)
        outcome=('OWNER_ACKNOWLEDGED_PACKET_PULSE_READ' if success else
          'TARGET_REJECTED_WITH_OWNER_REASONS' if witnesses and all(w.get('packetPulseReadAccepted') is False for w in witnesses) else
          'INPUT_WITHOUT_OWNER_WITNESS' if pulses else 'NO_PULSE_INPUT')
        outputs.append({'case':run['case'],'status':run['status'],'rec1Count':len(events),
          'canonicalPulseCount':len(pulses),'pulseIds':[e.get('pulseEventId') for e in pulses],
          'ownerWitnessCount':len(witnesses),'ownerOnlyWitnesses':len(owner_only),'idMatchedCount':len(matched),
          'ownerAcceptanceCount':len(acknowledged),'ownerRejectedCount':len(witnesses)-len(acknowledged),
          'duplicateWitnessIds':[k for k,n in ids.items() if n>1],
          'reasonCounts':reasons,'packetReadOwnerStateObserved':read_state,
          'finalOwnerState':states[-1] if states else None,'outcome':outcome,
          'packetReadIsNotListeningFoldCompletion':True,
          'witnesses':witnesses,
          'limitations':['The observer samples a retained witness ~150ms; missing recorder IDs are not owner rejections.',
             'The owner uses packet proximity, not aim-reticle target ID.',
             'An accepted moving-packet read is not a completed material cycle or Host receipt.']})
    return outputs

def main():
    ap=argparse.ArgumentParser();ap.add_argument('output',nargs='?',default='BOT1C_RESULTS');args=ap.parse_args()
    root=pathlib.Path(args.output).resolve();res=classify(root)
    if not res:print('No BOT1-C runs found in',root);return 2
    summary={'revision':'BOT1-C','evidenceKind':'OWNER_WITNESS_PLUS_REC1_NOT_VISUAL_PROOF','runs':res,
         'conclusion':'Per-Pulse owner acceptance is read from owner witness, not inferred from controller input or HUD.'}
    (root/'BOT1C_EVIDENCE.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    lines=['# BOT1-C Watcher Acceptance Audit','','| Scenario | Pulse events | Owner results | Owner accepted | Verdict |','|---|---:|---:|---:|---|']
    for r in res:lines.append(f"| {r['case']} | {r.get('canonicalPulseCount',0)} | {r.get('ownerWitnessCount',0)} | {r.get('ownerAcceptanceCount',0)} | {r.get('outcome',r['status'])} |")
    lines+=['','## Exact acceptance reasons','']
    for r in res:
        lines.append(f"### {r['case']}")
        lines.append(' '.join(f'`{k}`: {n}' for k,n in r.get('reasonCounts',{}).items()) or 'No owner witness.')
        lines.append('')
    lines+=['## Interpretation','','- Only `packet_pulse_read_accepted` from `SurfaceWakeGameplaySystem` is an accepted read.',
       '- `packet_out_of_read_range` is a verified local proximity miss, not an invalid reticle target.',
       '- `no_active_packet` is a timing miss; the nursery can be between cycles.',
       '- A successful packet Pulse read does not necessarily complete the nursery cycle, Listening Fold, or interregional Host circuit.',
       '- Samples cannot establish visual readability; inspect screenshots separately.']
    (root/'BOT1C_EVIDENCE.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('Analyzed',len(res),'BOT1-C runs ->',root/'BOT1C_EVIDENCE.md')
    return 0
if __name__=='__main__':raise SystemExit(main())
