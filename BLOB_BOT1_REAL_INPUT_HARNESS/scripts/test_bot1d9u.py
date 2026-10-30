#!/usr/bin/env python3
"""Offline D9U public-cue and independent-owner regression tests."""
from __future__ import annotations
import pathlib,sys,unittest
from bot1d9u_policy import visible_cue,arrival_strategy,run_arrival,LEFT_TOTAL_SECONDS,NUDGE_LIMIT
from analyze_bot1d9u import evaluate,aggregate,contiguous_dwell

class Keyboard:
    def __init__(self):self.calls=[]
    def down(self,k):self.calls.append(('down',k))
    def up(self,k):self.calls.append(('up',k))
class Page:
    def __init__(self,answers=None):self.keyboard=Keyboard();self.steps=0;self.answers=answers or []
    def wait_for_timeout(self,ms):self.steps+=1
    def hud(self):return self.answers[min(self.steps,len(self.answers)-1)] if self.answers else "Follow the Watcher's turn toward the Listening Fold."

def stub_time(*parts):
    from datetime import datetime,timedelta,timezone
    return (datetime(2026,1,1,tzinfo=timezone.utc)+timedelta(seconds=sum(parts))).isoformat()

def sample(t,stage=0,approach=False,focus=False):
    return {'time':stub_time(t),'type':'bot1d-listening-fold-owner-state',
        'state':{'stageIndex':stage,'inApproach':approach,'focusReady':focus,
          'nurseryFoldInvitation':True,'focusDistance':1.8 if stage else 2.4}}

def make_rec(stage1=True):
    ev=[sample(1),sample(2,approach=True,focus=True),sample(2.2,approach=True,focus=True)]
    if stage1:ev.append(sample(2.4,stage=1,approach=True,focus=True))
    ev.append(sample(3.0))
    # Both sampled sides within the left movement trial.
    for t,x in [(1.2,2.0),(2.8,-1.2)]:
        ev.append({'time':stub_time(t),'type':'c0d4-mob1-movement-sample',
            'owner':{'motion':{'position':{'x':x,'y':1.7,'z':-3.4},'boundaryPressure':0},
            'input':{'moveX':-1},'attachment':{'active':False}}})
    return {'captureStartedAt':stub_time(0),'events':sorted(ev,key=lambda e:e['time']),
            'summary':{'captureRetention':{'droppedDetails':0}}}

def make_run():
    p=[{'index':i,'label':'travel_left' if i==9 else 'ambient_center',
       'atStart':stub_time(1),'atEnd':stub_time(4)} for i in range(10)]
    return {'repeat':1,'courseStarted':True,'probes':p,'errors':[],
      'arrival':{'publicVerdict':'PUBLIC_ANSWER_SEEN','leftHoldSeconds':2.2,'corrections':[]}}

class PolicyTests(unittest.TestCase):
    def test_search(self):self.assertEqual(visible_cue("Follow the Watcher's turn toward the Listening Fold."),'fold_search')
    def test_new_answer_phrase(self):self.assertEqual(visible_cue("Let the fold's answer travel through the nursery."),'visible_fold_answer')
    def test_guide_pulse(self):self.assertEqual(visible_cue('Press X once to pulse-read the fold.'),'visible_fold_answer')
    def test_legend_not_objective(self):self.assertNotEqual(visible_cue('Surface Wake: WASD move · X Pulse · Q Stabilize.'),'visible_fold_answer')
    def test_unknown(self):self.assertEqual(visible_cue('The current is carrying another material state.'),'unknown')
    def test_strategy_stop(self):self.assertEqual(arrival_strategy('Press X once to pulse-read the fold.',0),'STOP_ON_PUBLIC_ANSWER')
    def test_strategy_nudge(self):self.assertEqual(arrival_strategy('Follow the opening membrane.',0),'NUDGE_AND_SETTLE')
    def test_strategy_limit(self):self.assertEqual(arrival_strategy('Follow the opening membrane.',NUDGE_LIMIT),'STOP_AFTER_BOUNDED_TRIAL')
    def test_arrival_ends_keyboard_release(self):
        p=Page();r=run_arrival(p,lambda page:page.hud())
        self.assertEqual(r['leftHoldSeconds'],LEFT_TOTAL_SECONDS)
        self.assertEqual(len(r['corrections']),NUDGE_LIMIT)
        self.assertEqual(sum(v[0]=='down' for v in p.keyboard.calls),3)
        self.assertEqual(sum(v[0]=='up' for v in p.keyboard.calls),3)
        self.assertEqual(r['publicVerdict'],'NO_PUBLIC_ANSWER')
    def test_arrival_stops_on_early_public_answer(self):
        p=Page(['Follow the opening membrane.']*2+["Let the fold's answer travel through the nursery."])
        r=run_arrival(p,lambda page:page.hud())
        self.assertEqual(r['publicVerdict'],'PUBLIC_ANSWER_SEEN')
        self.assertLess(r['leftHoldSeconds'],LEFT_TOTAL_SECONDS)
        self.assertEqual(len(r['corrections']),0)
        self.assertEqual(p.keyboard.calls,[('down','a'),('up','a')])
    def test_transient_answer_still_prevents_nudges(self):
        p=Page(['Follow the opening membrane.']*2+["Let the fold's answer travel through the nursery."]+['Follow the opening membrane.']*20)
        r=run_arrival(p,lambda page:page.hud())
        self.assertEqual(r['publicVerdict'],'PUBLIC_ANSWER_SEEN')
        self.assertEqual(r['corrections'],[])
    def test_arrival_nudge_can_trigger_answer(self):
        # Feedback appears after first nudge and wait, not during main left hold.
        p=Page(['Follow the opening membrane.']*13+["Let the fold's answer travel through the nursery."])
        r=run_arrival(p,lambda page:page.hud())
        self.assertEqual(r['publicVerdict'],'PUBLIC_ANSWER_SEEN')
        self.assertLessEqual(len(r['corrections']),NUDGE_LIMIT)
    def test_policy_hides_owner_fields(self):
        p=Page();r=run_arrival(p,lambda page:page.hud())
        self.assertNotIn('focusDistance',str(r));self.assertNotIn('position',str(r))

class RefereeTests(unittest.TestCase):
    def test_owner_stage1_complete(self):
        e=evaluate(make_rec(),make_run());self.assertTrue(e['ownerStage1']);self.assertTrue(e['stage1CertifiedForGate'])
    def test_public_cue_does_not_certify(self):
        e=evaluate(make_rec(False),make_run());self.assertTrue(e['publicAnswerSeen']);self.assertFalse(e['ownerStage1'])
    def test_checkpoint_inconclusive(self):
        e=evaluate(make_rec(),make_run(),'CHECKPOINT_ONLY');self.assertFalse(e['completeOwnerEvidence'])
    def test_no_arrival_run_incomplete(self):
        r=make_run();r['arrival']=None;self.assertFalse(evaluate(make_rec(),r)['completeOwnerEvidence'])
    def test_approach_dwell(self):
        self.assertAlmostEqual(contiguous_dwell(make_rec()['events'],'inApproach'),.4,places=3)
    def test_all_three_gate(self):
        a=evaluate(make_rec(),make_run());x=aggregate([a,a,a],3);self.assertEqual(x['gate'],'STAGE1_REPLICATION_ALL_PASSED')
    def test_partial_gate(self):
        a=evaluate(make_rec(),make_run());b=evaluate(make_rec(False),make_run());
        self.assertEqual(aggregate([a,b,b],3)['gate'],'STAGE1_REPLICATION_PARTIAL')
    def test_no_stage_gate(self):
        a=evaluate(make_rec(False),make_run());self.assertEqual(aggregate([a,a,a],3)['gate'],'STAGE1_NOT_REPLICATED')
    def test_single_smoke_not_full_replication(self):
        a=evaluate(make_rec(),make_run())
        self.assertEqual(aggregate([a],1)['gate'],'INSUFFICIENT_REPLICATIONS')
    def test_dropped_details_inconclusive(self):
        rec=make_rec();rec['summary']['captureRetention']['droppedDetails']=7
        self.assertFalse(evaluate(rec,make_run())['completeOwnerEvidence'])
    def test_approach_only_not_stage1(self):
        r=evaluate(make_rec(False),make_run())
        self.assertTrue(r['ownerApproach'])
        self.assertFalse(r['stage1CertifiedForGate'])
    def test_missing_run_not_fail(self):
        a=evaluate(make_rec(),make_run());self.assertEqual(aggregate([a,a],3)['gate'],'INSUFFICIENT_COMPLETE_EVIDENCE')

if __name__=='__main__':unittest.main(verbosity=2)
