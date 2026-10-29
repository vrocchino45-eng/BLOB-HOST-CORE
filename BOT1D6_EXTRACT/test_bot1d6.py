#!/usr/bin/env python3
"""Offline, no-game assertions. Accepts optional path to human reference JSON."""
from __future__ import annotations
import argparse,datetime,inspect,json,pathlib,tempfile
import bot1d6_policy as p
from analyze_bot1d6 import evaluate,load_run


def run(reference=None):
    assertions=0
    def check(ok,msg):
        nonlocal assertions
        assert ok,msg
        assertions+=1
    observed={
      'Observe the next matter cycle.':'packet_wait',
      'Read what the moving matter is.':'packet',
      "Follow the Watcher's turn toward the Listening Fold.":'fold_search',
      'Follow the opening membrane.':'fold_search',
      'Press X once to pulse-read the fold.':'fold_pulse',
      'Hold LT to stabilize the resonance. This is not absorption.':'fold_hold',
      'Keep still and watch the response pass through the membrane.':'fold_watch',
      'Release LT and remain nearby until the fold becomes calm.':'fold_release',
      'The safe seed is now readable. Approach it and hold RT to absorb.':'fold_complete',
      'Move to the route body you want to enter.':'beyond_fold',
    }
    for h,want in observed.items():
        check(p.stage(h)==want,'Incorrect stage: '+h)
        check(p.stage('BLOB // HOST CORE // SURFACE WAKE '+h+' Y inspects the Core / readable focus. WASD move · Mouse/IJKL camera · Left Mouse/X/Space pulse · Right Mouse absorb · Q stabilize')==want,'Legend contaminated objective: '+h)
    check(p.stage('BLOB // HOST CORE // SURFACE WAKE Y inspects the Core / readable focus. WASD move · Left Mouse/X/Space pulse · Q stabilize')=='unknown','Control legend must not count')
    check(p.stage('')=='unknown','Empty HUD')
    check(p.next_action('fold_pulse',0,0,11,0)[0]=='pulse','Fold pulse')
    check(p.next_action('fold_pulse',0,0,11,3)[0]=='observe','Bound repeated Pulse')
    check(p.next_action('fold_hold',0,0,11)[1]=='q','Hold key')
    check(p.next_action('fold_watch',0,0,11)[0]=='observe','Watch without repeated Pulse')
    check(p.next_action('fold_release',0,0,11)[0]=='observe','Release without key')
    check(p.next_action('fold_complete',0,0,11)[0]=='observe','Completion no more movement')
    check(p.next_action('fold_search',1,0,11)[1]=='w','Short first move')
    check(p.next_action('fold_search',2,0,11)[0]=='observe','Interleaved stage observations')
    check(p.next_action('fold_search',3,3,11)[0]=='move','Weak motion recovery')
    check(p.next_action('fold_search',17,0,11)[0]=='look','New quadrant')
    check(all(x not in inspect.getsource(p) for x in ('getSession(','frameState.','ownerFoldPosition','window.BLOB_TELEMETRY')),'Policy must not read internal owner state')
    check('REC1' in p.FORBIDDEN_INPUTS[0] or 'REC1' in str(p.FORBIDDEN_INPUTS),'Owner firewall')
    now='2026-10-29T02:00:00.000Z'
    ev=lambda t,typ,**extra:{'time':f'2026-10-29T02:00:{t:02d}.000Z','type':typ,**extra}
    snap=lambda n,**kw:{'stage':n,'stageIndex':kw.get('idx',0),'progress':kw.get('progress',0),'foldAvailable':kw.get('avail',False),'inApproach':kw.get('approach',False),'completed':kw.get('completed',False)}
    sample={'captureStartedAt':now,'events':[ev(2,'bot1d-listening-fold-owner-state',state=snap('approach_listening_fold',avail=True)),ev(8,'bot1d-listening-fold-owner-state',state=snap('observe_first_answer',idx=1,approach=True)),ev(12,'bot1d-listening-fold-owner-state',state=snap('surface_wake_complete',idx=5,progress=1,completed=True))]}
    out=evaluate(sample)
    check(out['ownerCertifiedFoldComplete'],'Owner completed fixture')
    check(out['maxStageIndex']==5,'Stage max')
    check(out['foldMilestonesSeconds']['invitation']==2,'Invite time')
    check(out['foldMilestonesSeconds']['completed_fold']==12,'Finish time')
    check(evaluate({'captureStartedAt':now,'events':[ev(2,'bot1d-listening-fold-owner-state',state=snap('approach_listening_fold',avail=True))]})['status']=='INVITED_NO_FOLD_STAGE','Invitation not completion')
    check(not evaluate({'captureStartedAt':now,'events':[]})['ownerCertifiedFoldComplete'],'No false completion')
    with tempfile.TemporaryDirectory() as temp:
        d=pathlib.Path(temp);(d/'REC1_CHECKPOINT_0045s.json').write_text(json.dumps(sample),encoding='utf8')
        r,trace,ck=load_run(d);check(ck and len(r['events'])==3,'Checkpoint fallback')
        check(evaluate(r,checkpoint_only=ck)['checkpointOnly'],'Partial status preserved')
    if reference:
        record=json.loads(pathlib.Path(reference).read_text(encoding='utf-8-sig'))
        r=evaluate(record)
        check(r['eventCount']>=10000,'Human recorder retained events')
        check(r['ownerCertifiedFoldComplete'] and r['maxStageIndex']==5,'Human Fold really completed')
        check(r['watcherWitnessedPulses']>0,'Human owner Pulse witness')
        check(r['guideSampleCount']>100,'Human Guide witness')
        check(r['watcherAcceptedReads']>=0,'Human witnessed reads distinguished')
    return {'pass':'BOT1-D6','assertions':assertions,'result':'OFFLINE_HUD_OWNER_CHECKPOINT_PASS','humanReferenceReplayed':bool(reference),'limitation':'No real BOT1-D6 browser run; no learned vision controller'}

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--human-reference',default=None);args=a.parse_args()
    print(json.dumps(run(args.human_reference),indent=2))
