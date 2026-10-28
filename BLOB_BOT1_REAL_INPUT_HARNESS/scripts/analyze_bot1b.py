#!/usr/bin/env python3
"""BOT1-B: objective-to-input concordance; never invents owner acceptance."""
import argparse, collections, datetime, json, pathlib

EXPECTED={'pulse': 'game-pulse-event','absorb':'game-absorb-started','stabilize':'game-stabilize-started'}

def parse_time(s):
    try: return datetime.datetime.fromisoformat(s.replace('Z','+00:00')).timestamp()
    except Exception: return None

def actual_verb(a):
    if a.get('op')=='key' and str(a.get('value','')).lower() in ('x','space'):
        return 'pulse'
    if a.get('op')=='right':return 'absorb'
    if a.get('op')=='holdkey' and a.get('value')=='q':return 'stabilize'
    return None

def classify(folder):
    run=json.loads((folder/'RUN.json').read_text(encoding='utf-8'))
    recpath=folder/'REC1.json'
    if not recpath.exists():return {'runId':run.get('runId'),'status':'NO_REC1'}
    rec=json.loads(recpath.read_text(encoding='utf-8'))
    events=rec.get('events',[])
    counts=collections.Counter(x.get('type') for x in events)
    relevant=[]
    for a in run.get('actions',[]):
        verb=actual_verb(a)
        if verb is None:continue
        begin=parse_time(a.get('time',''))
        finish=parse_time(a.get('completedAt','')) or begin
        matches=[]
        if begin is not None:
            for e in events:
                et=parse_time(e.get('time',''))
                if et is None or not (begin-.15 <= et <= finish+1.1):continue
                if e.get('type')==EXPECTED[verb]:
                    matches.append({'type':e['type'],'time':e['time'],'recorderEventOrdinal':e.get('recorderEventOrdinal')})
        # An observed verb input is NOT accepted force or success of a world target.
        relevant.append({'tick':a.get('tick'),'reason':a.get('reason'),
          'hudDirective':a.get('objective'), 'verb':verb,'viewMode':a.get('viewMode'),
          'inputStatus':'OBSERVED_CANONICAL_EVENT' if matches else 'NOT_OBSERVED_IN_REC1',
          'correlatedEvents':matches, 'targetOwnerAcceptance':'NOT_ESTABLISHED_BY_INPUT'})
    first_directive=next((a.get('objective') for a in run.get('actions',[]) if a.get('objective')),None)
    objective_actions=[x for x in relevant if x['reason']=='hud_directive_attempt']
    correct=[x for x in objective_actions if first_directive and x['verb']=='pulse' and 'pulse' in first_directive.lower()]
    calibration={verb:any(x['reason']=='independent_input_calibration' and x['verb']==verb and x['inputStatus']=='OBSERVED_CANONICAL_EVENT' for x in relevant)
                 for verb in EXPECTED}
    from_input=dict(collections.Counter(x['verb'] for x in relevant))
    owner_events={k:counts[k] for k in ['silt-pressure-read-committed','silt-porous-absorb-committed','c0e1-territory-verb-read',
                                      'chemistry-absorption-committed','silt-completion-committed','host-silt-cause-observed']}
    direct_obj_change=len(set(p['hud'] for p in run.get('percepts',[]) if p.get('hud')))>1
    return {'runId':run.get('runId'),'status':run.get('status'),'evidenceKind':run.get('evidenceKind'),
      'firstHudDirective':first_directive,'totalActions':len(run.get('actions',[])),
      'inputAttemptsByVerb':from_input,'rec1EventCounts':{v:counts[e] for v,e in EXPECTED.items()},
      'calibrationRecognized':calibration, 'worldViewPulseDirectiveAttempts':len([x for x in correct if x['viewMode']=='world']),
      'worldViewPulseRecorded':len([x for x in correct if x['viewMode']=='world' and x['inputStatus']=='OBSERVED_CANONICAL_EVENT']),
      'ownerConsequenceObservations':owner_events,'hudTextChangedDuringRun':direct_obj_change,
      'hudIsNotOwnerReceipt':True,'goalAccepted':'NOT_PROVEN_FROM_HUD_OR_RAW_INPUT',
      'evaluatedAbilityAttempts':relevant,
      'screenshots':{name:(folder/name).exists() for name in ['start.png','before_pulse.png','after_pulse.png','end.png']},
      'retention':rec.get('summary',{}).get('captureRetention',{}),
      'limitations':['REC1 polls at intervals and might miss brief actions; correlate cautiously.',
      'Owner consequences may be caused by distinct overlapping actions; count separately.',
      'Visual aiming and objective completion require scene or owner evidence, not HUD strings.']}

def main():
    p=argparse.ArgumentParser();p.add_argument('folder',nargs='?',default='BOT1B_RESULTS');args=p.parse_args()
    root=pathlib.Path(args.folder).resolve()
    runs=[classify(d) for d in sorted(root.glob('BOT1_*')) if d.is_dir() and (d/'RUN.json').exists()]
    summary={'revision':'BOT1-B','runs':runs,'evaluation':'input, view and objective linkage; NO fabricated gameplay acceptance'}
    (root/'BOT1B_EVIDENCE.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    lines=['# BOT1-B Objective-to-Input Evidence','',
           'The browser harness may issue a correct input yet fail to target anything. **Do not treat input as a successful gameplay interaction.**','',
           '| Run | 3 calibrated inputs | World Pulse objective attempts | World Pulse events | Gameplay objective |',
           '|---|---|---:|---:|---|']
    for r in runs:
        if r.get('status')=='NO_REC1':continue
        cal=sum(r['calibrationRecognized'].values())
        lines.append(f"| {r['runId']} | {cal}/3 | {r['worldViewPulseDirectiveAttempts']} | {r['worldViewPulseRecorded']} | NOT PROVEN |")
    lines+=['','## Acceptance interpretation','',
      '- A canonical `game-pulse-event` is input dispatch evidence, not proof the Watcher or target responded.',
      '- A `c0e1-territory-verb-read` is a regional experimental read, not matter transfer or Host progression.',
      '- The first HUD directive is used for objective matching; hotkey legend keywords are excluded.',
      '- If an objective requires physical aiming, the HUD-only agent cannot prove target visibility.','',
      '## Evidence constraints','',
      'Every action and correlate is preserved in `BOT1B_EVIDENCE.json`; reconcile with screenshots and independent REC1 owner evidence.']
    (root/'BOT1B_EVIDENCE.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('Analyzed',len(runs),'runs. Wrote',root/'BOT1B_EVIDENCE.md')
    return 0 if runs else 2

if __name__=='__main__':raise SystemExit(main())
