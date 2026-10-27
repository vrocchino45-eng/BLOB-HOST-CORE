#!/usr/bin/env python3
"""Evidence-scoped BOT1 evaluator: REC1 owner receipts and movement/HUD separately."""
from __future__ import annotations
import argparse, collections, datetime, json, pathlib, statistics, sys

CELL_REGIONS={
 'CELL_SIGNAL_CHORUS_NERVE_001':'hub',
 'CELL_SILT_PRESSURE_ROUTE_001':'silt',
 'CELL_VASCULAR_RHYTHM_ROUTE_001':'vascular',
 'CELL_GRAVE_MEMORY_RESIDUE_BED_001':'grave'
}

def dump(path,data):path.write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding='utf-8')

def evaluate_run(folder):
 r=json.loads((folder/'RUN.json').read_text(encoding='utf8'))
 out={'runId':r.get('runId'),'status':r.get('status'),
      'evidenceKind':r.get('evidenceKind','UNKNOWN'),'recording':'UNEXERCISED',
      'controlPath':'browser keyboard + mouse (existing InputSystem)',
      'hudComprehension':'UNEXERCISED: HUD text was read, but no language understanding or 3D vision was measured',
      'visualReadability':'UNEXERCISED: requires screenshot/video review',
      'movement':'UNEXERCISED','hostReceiptIntegrity':'UNEXERCISED',
      'abilityAcceptance':'UNEXERCISED'}
 path=folder/'REC1.json'
 if not path.exists():out['blockers']=['No REC1 export; cannot grade gameplay.'];return out
 t=json.loads(path.read_text(encoding='utf8'))
 events=t.get('events',[])
 counts=collections.Counter(e.get('type') for e in events)
 retained=t.get('summary',{}).get('captureRetention',{})
 out.update({'rec1Events':len(events),'rec1DurationSeconds':t.get('captureDurationSeconds'),
 'rec1Retention':retained,'ownerEvidence':{key:counts[key] for key in (
    'game-pulse-event','game-absorb-started','game-stabilize-started',
    'silt-pressure-read-committed','silt-porous-absorb-committed','silt-completion-committed',
    'silt-trajectory:released-with-trajectory','host-silt-cause-observed',
    'vascular-silt-signal-received','c0d4-host-vascular-effect',
    'c0e1-territory-verb-read','c0e2-pocket-discovered','c0d4-active-cell-change')},
 'sitesDiscovered': sorted({e.get('siteId') for e in events if e.get('type')=='c0e1-territory-discovered' and e.get('siteId')}),
 'pocketsDiscovered':sorted({e.get('siteId') for e in events if e.get('type')=='c0e2-pocket-discovered' and e.get('siteId')})})
 out['recording']='PASS' if retained.get('droppedDetails')==0 and retained.get('fullSessionRecorderDetailsRetained') and counts['capture-started'] and counts['capture-stopped'] else 'AMBIGUOUS'
 if r.get('evidenceKind')=='FIXTURE':out['recording']='FIXTURE_ONLY'
 local_reads=[e.get('read') or {} for e in events if e.get('type')=='c0e1-territory-verb-read']
 out['localVerbsRecorded']=dict(collections.Counter(x.get('verb') for x in local_reads))
 out['abilityAcceptance']='PARTIAL (local tissue read; physical acceptance separate)' if local_reads else 'UNEXERCISED'
 # Not enough to infer accepted per physical ability from raw pressed events.
 movement=[e for e in events if e.get('type')=='c0d4-mob1-movement-sample']
 motion=[];boundary=[];positions=[];cells=[]
 for e in movement:
  owner=e.get('owner') or {};m=owner.get('motion') or {};i=owner.get('input') or {}
  if owner.get('cellId'): cells.append(owner['cellId'])
  if isinstance(m.get('boundaryPressure'),(int,float)):boundary.append(m['boundaryPressure'])
  if isinstance(m.get('inputMagnitude'),(int,float)) and isinstance(m.get('speed'),(int,float)):
   motion.append((m['inputMagnitude'],m['speed']))
  pos=m.get('position') or {}
  if isinstance(pos,dict) and all(isinstance(pos.get(q),(int,float)) for q in ('x','y','z')):positions.append((pos['x'],pos['y'],pos['z']))
 out['regionsVisited']=sorted({CELL_REGIONS.get(c,c) for c in cells})
 out['movementSamples']=len(movement)
 out['movementPressureHigh']=sum(x>.05 for x in boundary)
 out['stalledHighInputSamples']=sum(m>.7 and speed<.3 for m,speed in motion)
 out['sustainedLowProgressEvents']=counts['c0d4-mob1-sustained-low-progress']
 if positions:
  import math
  out['sampledPathDisplacement']=round(math.dist(positions[0],positions[-1]),3)
  out['sampledPathLength']=round(sum(math.dist(a,b) for a,b in zip(positions,positions[1:])),3)
  out['movement']='PASS: movement and cells sampled' if len(positions)>=5 else 'AMBIGUOUS'
 # Exact receipt lineage only; separate from packet/visuals.
 host=[e.get('cause') or {} for e in events if e.get('type')=='host-silt-cause-observed']
 recv=[e.get('receipt') or {} for e in events if e.get('type')=='vascular-silt-signal-received']
 hostseq=[x.get('sequence') for x in host];ids=[x.get('id') for x in host]
 recvseq=[x.get('sequence') for x in recv]
 dup_host=len(hostseq)!=len(set(hostseq)) or len(ids)!=len(set(ids))
 dup_recv=len(recvseq)!=len(set(recvseq))
 out['hostReceipts']={'siltCauses':len(host),'vascularReceived':len(recv),'siltHostSequences':hostseq,'vascularReceivedSequences':recvseq,
   'duplicateCauseOrSequence':dup_host,'duplicateReceiverSequence':dup_recv,
   'sourceTraceGaps':retained.get('siltSourceTraceGaps'),'receiverGaps':counts['vascular-receiver-receipt-gap']}
 if host or recv:
  out['hostReceiptIntegrity']='FAIL' if dup_host or dup_recv or counts['host-connection-receipt-gap'] or counts['vascular-receiver-receipt-gap'] else 'PASS (observed receipts only)'
 else:out['hostReceiptIntegrity']='UNEXERCISED (no Host receipts during this scenario)'
 # HUD candidate word is not an owner success. Flag it for human inspection, not falsely accuse.
 out['hudSaysSuccessWithoutMatchingOwnerProof']='NOT ASSESSED — generic HUD strings cannot establish an accepted game owner outcome'
 if r.get('evidenceKind')=='FIXTURE':
  out['movement']='FIXTURE_ONLY';out['hostReceiptIntegrity']='FIXTURE_ONLY'
  out['abilityAcceptance']='FIXTURE_ONLY';out['regionsVisited']=[]
 out['limitations']=['Headless bot makes HUD-informed or seeded exploratory decisions, not 3D-image decisions.',
 'Movement samples are 150ms REC1 observations; snapshot cadence may miss transitions.',
 'No owner receipt can be deduced from an input edge or a rendered packet.',
 'Successful start/stop and active input do not prove completion of the intended route.']
 return out


def main():
 p=argparse.ArgumentParser();p.add_argument('results_folder',nargs='?',default='BOT1_RESULTS');args=p.parse_args()
 root=pathlib.Path(args.results_folder).resolve()
 runs=[evaluate_run(d) for d in sorted(root.glob('BOT1_*')) if d.is_dir() and (d/'RUN.json').exists()]
 report={'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
   'gate':'G1 BOT1: NOT FULLY ACCEPTED until real browser replay, ≥3x3 matrix, normal route, screenshots and HUD owner checks',
   'runs':runs,'summary':{'total':len(runs),'rec1Recorded':sum(r['recording']=='PASS' for r in runs),
     'syntheticFixtures':sum(r['evidenceKind']=='FIXTURE' for r in runs),
     'movementExercised':sum(r['movement'].startswith('PASS') for r in runs),
     'hostReceiptIntegrityPassWhenExercised':sum(r['hostReceiptIntegrity'].startswith('PASS') for r in runs),
     'browserErrors':sum(r['status']=='ERROR' for r in runs)}}
 dump(root/'BOT1_ANALYSIS.json',report)
 rows=['# BOT1 Real-input field assessment','',
      f"Total runs: {report['summary']['total']} | REC1 valid: {report['summary']['rec1Recorded']} | movement exercised: {report['summary']['movementExercised']}",
      '', '| Run | Recorder | Movement | Regions sampled | 3 verbs + target | Host integrity |',
      '|---|---|---|---|---|---|']
 for r in runs:rows.append(f"| {r['runId']} | {r['recording']} | {r['movement']} | {', '.join(r.get('regionsVisited',[]))} | {r['abilityAcceptance']} | {r['hostReceiptIntegrity']} |")
 rows+=['','## Interpretation','',
     'These are actual *browser controls* and REC1 observations where the recording succeeded. The bot does not yet interpret the 3D scene visually; its navigation is seeded or HUD-guided. A seeded bot missing a gate is a tested inability under that policy, not proof a passage is physically blocked.',
     '', 'G1 remains **not accepted** until a clean first slice and one unassisted route attempt, readable HUD/acceptance correlation and independent visual review are provided.',
     '', 'Do not infer physics from local tissue packets, or count raw button edges as accepted target actions.']
 (root/'BOT1_ANALYSIS.md').write_text('\n'.join(rows)+'\n',encoding='utf-8')
 print('Analyzed',len(runs),'runs. Wrote',root/'BOT1_ANALYSIS.md')
 return 0 if runs else 2
if __name__=='__main__':sys.exit(main())
