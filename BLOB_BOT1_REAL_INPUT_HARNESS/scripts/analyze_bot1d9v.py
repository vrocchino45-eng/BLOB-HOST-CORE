#!/usr/bin/env python3
"""Offline D9V referee. REC1 owner truth NEVER enters the browser policy."""
from __future__ import annotations
import argparse,json,pathlib
from analyze_bot1d9t import evaluate as base_evaluate, load_rec, seconds

FOLD='bot1d-listening-fold-owner-state'
PULSE='game-pulse-event'
GUIDE='guide0-core-guide-state'


def first_owner_stage(events, threshold):
    for e in events:
        if e.get('type')!=FOLD:continue
        state=e.get('state') or {}
        if int(state.get('stageIndex') or 0)>=threshold:return e
    return None


def paired_pulse_stage2(events,run,stage2):
    """Correlate actual REC1 Pulse with stage>=2 after bot's first public-cue Pulse.

    REC1 Pulse may be polled slightly before browser log stamps. Require event
    near the action time, and Stage 2 no earlier than that Pulse.
    """
    t2=seconds((stage2 or {}).get('time'))
    if t2 is None:return False,None
    actions=(run.get('arrival') or {}).get('pulseActions') or []
    witnesses=[e for e in events if e.get('type')==PULSE]
    for a in actions:
        t=seconds(a.get('at'))
        if t is None:continue
        for w in witnesses:
            tw=seconds(w.get('time'))
            if tw is None or abs(tw-t)>.8:continue
            if -.12<=t2-tw<=2.0:return True, w.get('pulseEventId')
    return False,None


def evaluate(rec,run,source='FINAL'):
    ev=rec.get('events',[]);base=base_evaluate(rec,run,source)
    stage1=first_owner_stage(ev,1);stage2=first_owner_stage(ev,2)
    t1=seconds((stage1 or {}).get('time'));t2=seconds((stage2 or {}).get('time'))
    trial=next((t for t in run.get('probes',[]) if t.get('label')=='travel_left'),None)
    tl=seconds((trial or {}).get('atStart'));tr=seconds((trial or {}).get('atEnd'))
    # Stage 1 may arrive during neutral checking; keep a bounded window.
    arrived=(t1 is not None and tl is not None and tr is not None and tl<=t1<=tr+3.0)
    pair,pulse_id=paired_pulse_stage2(ev,run,stage2)
    retained=rec.get('summary',{}).get('captureRetention',{})
    complete=(source=='FINAL' and base['evidenceCompleteForReplication']
       and run.get('status')=='CAPTURED' and not run.get('errors')
       and (run.get('arrival') is not None)
       and retained.get('droppedDetails')==0)
    stage2cert=bool(complete and arrived and stage2 and pair)
    gids=[]
    if t2 is not None:
        gids=sorted(set(((x.get('state') or {}).get('guide') or {}).get('lastReaction')
            for x in ev if x.get('type')==GUIDE and seconds(x.get('time')) is not None
            and abs(seconds(x.get('time'))-t2)<=2))
    return {'revision':'BOT1-D9V-OFFLINE-REFEREE','run':run.get('repeat'),
        'seed':run.get('seed'),'source':source,'complete':bool(complete),
        'rec1Events':len(ev),'droppedREC1Details':retained.get('droppedDetails'),
        'courseTrials':len(run.get('probes',[])),
        'ownerInvitation':base['ownerInvitationProven'],
        'ownerStage1':bool(stage1),'ownerStage1NearArrival':arrived,
        'ownerStage2':bool(stage2),'ownerMaxStage':base['ownerMaxStageIndex'],
        'stage2AfterRecordedPulse':bool(pair),'pairedPulseEventId':pulse_id,
        'stage2Certified':stage2cert,
        'publicCueSeen':(run.get('arrival') or {}).get('publicVerdict')=='PUBLIC_ANSWER_SEEN',
        'onlinePulseAttempts':len((run.get('arrival') or {}).get('pulseActions',[])),
        'firstOwnerStage1Seconds':round(t1-seconds(rec.get('captureStartedAt')),2) if t1 is not None and seconds(rec.get('captureStartedAt')) is not None else None,
        'firstOwnerStage2Seconds':round(t2-seconds(rec.get('captureStartedAt')),2) if t2 is not None and seconds(rec.get('captureStartedAt')) is not None else None,
        'guideReactionNearStage2':list(filter(None,gids)),
        'finalStatus':base['verdict'],
        'proofLimits':[
          'Stage 2 requires genuine REC1 owner progression after a recorded game Pulse near the bot action.',
          'Repeated fixed-course behavior is not generalized Fold navigation.',
          'One different seed is an initial variation check, not broad robustness.',
          'No REC1, Fold XYZ, distance, focusReady, Guide owner state, or telemetry API is read by the live bot.',
          'Guide reaction is independently observed, not demonstrated causal assistance.'
        ]}


def aggregate(rows,expected=3):
    complete=[r for r in rows if r['complete']]
    seed_variety=len(set(r.get('seed') for r in complete))>=2
    c1=sum(r['ownerStage1NearArrival'] for r in complete)
    c2=sum(r['stage2Certified'] for r in complete)
    if len(rows)!=expected or len(complete)!=expected:gate='INCOMPLETE_EVIDENCE'
    elif not seed_variety:gate='SECOND_CONDITION_NOT_TESTED'
    elif c1==expected and c2==expected:gate='VARIED_SEED_STAGE2_ALL_PASSED'
    elif c2>0:gate='STAGE2_PARTIAL'
    elif c1>0:gate='STAGE1_ONLY_STAGE2_NOT_CERTIFIED'
    else:gate='STAGE1_NOT_REPLICATED'
    return {'revision':'BOT1-D9V','gate':gate,'expectedRuns':expected,
        'completeRuns':len(complete),'uniqueSeeds':sorted(set(r['seed'] for r in complete if r['seed'] is not None)),
        'ownerStage1Count':c1,'ownerStage2Count':sum(r['ownerStage2'] for r in complete),
        'stage2CertifiedCount':c2,'runs':rows,
        'scope':'First controlled varied-seed post-arrival Pulse test; not full Fold completion'}


def report_md(report):
    lines=['# G1-D9V — Fold position retention and Stage 2 audit','',
        '**Gate:** `'+report['gate']+'`','',
        f"Complete REC1: {report['completeRuns']}/{report['expectedRuns']}; certified Stage 2: {report['stage2CertifiedCount']}",
        '', '| Run | Seed | REC1 complete | Owner Stage 1 | Owner Stage 2 | Paired Pulse | Verdict |',
        '|---:|---:|---|---|---|---|---|']
    for r in report['runs']:
        yn=lambda v:'yes' if v else 'no'
        lines.append(f"| {r['run']} | {r['seed']} | {yn(r['complete'])} | {yn(r['ownerStage1NearArrival'])} | {yn(r['ownerStage2'])} | {yn(r['stage2AfterRecordedPulse'])} | {'Certified' if r['stage2Certified'] else 'Not certified'} |")
    return '\n'.join(lines+['','Owner progress, Fold distance, and Guide reaction are evaluated offline only. Missing or incomplete captures are inconclusive. Stage 2 is not Fold completion.',''])


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('folder');p.add_argument('--expected-runs',type=int,default=3)
    a=p.parse_args();root=pathlib.Path(a.folder)
    if not root.is_dir():p.error('Missing results folder: '+str(root))
    folders=sorted(d for d in root.iterdir() if d.is_dir() and d.name.startswith('BOT1D9V_'))
    if not folders:p.error('No BOT1D9V run folders found')
    rows=[]
    for d in folders:
        rec,source=load_rec(d);rec=rec or {}
        run=json.loads((d/'RUN.json').read_text('utf-8')) if (d/'RUN.json').is_file() else {}
        row=evaluate(rec,run,source)
        rows.append(row);(d/'D9V_EVIDENCE.json').write_text(json.dumps(row,indent=2),'utf-8')
        print('run',row['run'],'seed',row['seed'],'owner stage',row['ownerMaxStage'],'Stage2',row['stage2Certified'])
    result=aggregate(rows,a.expected_runs)
    (root/'BOT1D9V_EVIDENCE.json').write_text(json.dumps(result,indent=2),'utf-8')
    (root/'BOT1D9V_EVIDENCE.md').write_text(report_md(result),'utf-8')
    print('BOT1-D9V:',result['gate'],'Stage 2',result['stage2CertifiedCount'],'/',a.expected_runs)
    return 0 if len(rows)==a.expected_runs else 2

if __name__=='__main__':raise SystemExit(main())
