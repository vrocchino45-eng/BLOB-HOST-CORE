#!/usr/bin/env python3
"""BOT1-D9Z: pure policy + negative owner-gate tests, no browser required.

The minimized fixture is synthetic test data; a pass never certifies a live run.
"""
from __future__ import annotations
import copy,json,pathlib,unittest
from unittest.mock import patch
from bot1d9y_policy import reference,acquisition,route
from bot1d9z_policy import PublicCueLatch,PEEL_SWEEP,fixed_peel_sweep,class_for_recovery,LIVE_FORBIDDEN
from analyze_bot1d9z import evaluate,summarize,attachment_samples
from bot1d9z_browser import observed_navigation,fold_finish

DIR=pathlib.Path(__file__).parent
FIXTURE=DIR/'BOT1D9Y_UNIT_TEST_FIXTURE.json'


def synthetic():
    """Fixture-based *test case*, not real-world evidence."""
    f=json.loads(FIXTURE.read_text(encoding='utf8'))
    assert f.get('fixturePurpose')=='UNIT_TEST_ONLY_EXCERPT_NOT_FULL_REC1_PROOF'
    rec,run=copy.deepcopy(f['rec']),copy.deepcopy(f['run'])
    run['revision']='BOT1-D9Z';run['profile']='golden'
    # D9Y minimized test excerpt omitted end event. Supply a synthetic one solely
    # to exercise the new D9Z ordered END gate; never call this a live run.
    rec['events'].append({'type':'game-stabilize-ended','time':'2026-10-31T03:18:51.755Z'})
    return rec,run


class PolicyTests(unittest.TestCase):
    def test_precommitted_controls(self):
        self.assertEqual(tuple(k for k,_,_ in PEEL_SWEEP),('c','a','z','d','s','w'))
        self.assertEqual(len(fixed_peel_sweep()),6)
        self.assertTrue(all(0<x['seconds']<=.65 for x in fixed_peel_sweep()))
    def test_reference_kept_golden(self):
        self.assertEqual(len(acquisition('golden')),13)
        self.assertEqual(len(route('golden')),10)
        self.assertEqual(route('golden')[-1]['key'],'a')
        self.assertIn('NOT a human-run',reference()['basis'])
    def test_forbidden_owner_steering(self):
        self.assertIn('REC1 during actions',LIVE_FORBIDDEN)
        self.assertIn('surface attachment owner telemetry',LIVE_FORBIDDEN)
    def test_latch_ignores_invitation(self):
        latch=PublicCueLatch()
        latch.observe("Follow the Watcher's turn toward the Listening Fold.",'t1','invite')
        self.assertFalse(latch.ready)
    def test_latch_detects_answer(self):
        latch=PublicCueLatch()
        latch.observe("Follow the Watcher's turn toward the Listening Fold.",'t1','invite')
        latch.observe("Let the fold's answer travel through the nursery.",'t2','new_answer')
        latch.observe("Follow the Watcher's turn toward the Listening Fold.",'t3','stale')
        self.assertTrue(latch.ready)
        self.assertEqual(latch.first_at,'t2')
    def test_recovery_diagnosis_does_not_guess(self):
        self.assertEqual(class_for_recovery(True,False,False,[]),'ATTACHMENT_STATE_NOT_SAMPLED')
        self.assertEqual(class_for_recovery(True,False,False,[{'attached':True}]),'ATTACHED_ROUTE_UNRESOLVED')
        self.assertEqual(class_for_recovery(True,False,False,[{'attached':True},{'attached':False}]),'RELEASE_OBSERVED_BUT_FOLD_NOT_REACHED')


class RefereeTests(unittest.TestCase):
    def test_completed_synthetic_only(self):
        rec,run=synthetic()
        result=evaluate(rec,run)
        self.assertTrue(result['certifiedFoldStage5'])
        self.assertTrue(result['orderedStabilizeEndPaired'])
    def test_missing_end_rejected(self):
        rec,run=synthetic();rec['events']=[e for e in rec['events'] if e.get('type')!='game-stabilize-ended']
        self.assertFalse(evaluate(rec,run)['certifiedFoldStage5'])
        self.assertEqual(evaluate(rec,run)['status'],'STABILIZE_END_MISSING_OR_UNPAIRED')
    def test_no_owner_stage5_rejected(self):
        rec,run=synthetic();rec['events']=[e for e in rec['events'] if
            not (e.get('type')=='bot1d-listening-fold-owner-state' and (e.get('state') or {}).get('stageIndex')==5)]
        self.assertFalse(evaluate(rec,run)['certifiedFoldStage5'])
    def test_host_distinction(self):
        rec,run=synthetic();r=evaluate(rec,run)
        self.assertEqual(sum(r['hostEventCounts'].values()),0)
    def test_offline_attachment_counts(self):
        rec,_=synthetic()
        rec['events'].append({'type':'g1d9s-neutral-movement-observation','time':'2026-10-31T03:18:55.000Z',
            'owner':{'attachment':{'active':True,'authority':'authored_suction_support'},
            'motion':{'locomotionMode':'surface_tendril_pull'}}})
        self.assertEqual(len(attachment_samples(rec)),1)
        self.assertTrue(attachment_samples(rec)[0]['attached'])
    def test_incomplete_capture(self):
        rec,run=synthetic();rec['summary']['captureRetention']['droppedDetails']=2
        self.assertEqual(evaluate(rec,run)['status'],'INCONCLUSIVE_CAPTURE')
        self.assertEqual(summarize([evaluate(rec,run)])['gate'],'INCOMPLETE_CAPTURE')


class FakeKeyboard:
    def __init__(self):self.events=[]
    def down(self,key):self.events.append(('down',key))
    def up(self,key):self.events.append(('up',key))
    def press(self,key):self.events.append(('press',key))


class FakePage:
    def __init__(self):self.elapsed=0.;self.keyboard=FakeKeyboard();self.shots=[]
    def wait_for_timeout(self,ms):self.elapsed+=ms/1000.
    def screenshot(self,*,path=None):self.shots.append(path)


class BrowserPolicySimulation(unittest.TestCase):
    def test_guided_late_visible_cue_is_handed_off(self):
        # The D9Y result reached owner stage1 just after its route stopped.
        # This test shows D9Z continues reading public HUD after route end.
        page=FakePage()
        def hud(p):
            return "Let the fold's answer travel through the nursery." if p.elapsed>=13.2 else \
                "Follow the Watcher's turn toward the Listening Fold."
        with patch('bot1d9z_browser.time.monotonic',side_effect=lambda:page.elapsed):
            log=[];result=observed_navigation(page,hud,'guided',100,log)
        self.assertTrue(result['publicCueSeen'])
        self.assertTrue(any(x.get('label')=='post_navigation_hud_settle' for x in log))
    def test_cue_gated_fold_starts_pulse_and_q(self):
        page=FakePage()
        with patch('bot1d9z_browser.time.monotonic',side_effect=lambda:page.elapsed):
            outcome=fold_finish(page,lambda p:"Let the fold's answer travel through the nursery.",100,[])
        self.assertTrue(outcome['pulseActions'])
        self.assertTrue(outcome['holdActions'])
        self.assertIn(('press','x'),page.keyboard.events)
        self.assertIn(('down','q'),page.keyboard.events)
        self.assertIn(('up','q'),page.keyboard.events)
    def test_invitation_alone_does_not_pulse(self):
        page=FakePage()
        with patch('bot1d9z_browser.time.monotonic',side_effect=lambda:page.elapsed):
            outcome=fold_finish(page,lambda p:"Follow the Watcher's turn toward the Listening Fold.",100,[])
        self.assertFalse(outcome['pulseActions'])
        self.assertFalse(outcome['holdActions'])


if __name__=='__main__':unittest.main(verbosity=2)
