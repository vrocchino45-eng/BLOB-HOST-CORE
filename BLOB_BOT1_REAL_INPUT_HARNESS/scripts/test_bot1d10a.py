#!/usr/bin/env python3
"""D10A offline policy/referee tests. Synthetic tests do not certify a live run."""
from __future__ import annotations
import json,pathlib,unittest
from unittest.mock import patch
from bot1d10a_policy import PROFILES_D10A,acquisition_profile,closure_plan,is_control_pair
from bot1d9y_policy import acquisition,route
from bot1d10a_browser import observed_navigation,fold_finish
from analyze_bot1d10a import evaluate,summarize
from analyze_bot1d9z import evaluate as d9z_evaluate

HERE=pathlib.Path(__file__).parent

class FakeKeyboard:
    def __init__(self,world):self.world=world;self.events=[];self.pressed=set()
    def down(self,key):self.events.append(('down',key));self.pressed.add(key)
    def up(self,key):self.events.append(('up',key));self.pressed.discard(key)
    def press(self,key):self.events.append(('press',key))

class FakePage:
    def __init__(self):self.elapsed=0.;self.left_seconds=0.;self.keyboard=FakeKeyboard(self);self.shots=[]
    def wait_for_timeout(self,ms):
        dt=ms/1000.;self.elapsed+=dt
        if 'a' in self.keyboard.pressed:self.left_seconds+=dt
    def screenshot(self,*,path=None):self.shots.append(path)

class PolicyTests(unittest.TestCase):
    def test_closure_finite_short_and_with_backtrack(self):
        plan=closure_plan()
        self.assertLessEqual(len(plan),10)
        self.assertEqual(plan[0]['key'],'a')
        self.assertIn('d',[x['key'] for x in plan])
        self.assertTrue(all(.10<=x['seconds']<=.35 for x in plan))
        self.assertEqual(len(set(x['label'] for x in plan)),len(plan))
    def test_profile_set_and_same_acquisition(self):
        self.assertEqual(set(PROFILES_D10A),{'golden','guided','recovery','recovery_control'})
        self.assertEqual(acquisition(acquisition_profile('recovery')),
                         acquisition(acquisition_profile('recovery_control')))
        self.assertEqual(route('recovery'),route(acquisition_profile('recovery_control')))
        self.assertTrue(is_control_pair('recovery','recovery_control'))
    def test_golden_reference_not_modified(self):
        self.assertEqual(acquisition('golden'),acquisition('guided'))
        self.assertEqual(len(route('golden')),10)
        self.assertEqual(route('golden')[-1]['key'],'a')
    def test_unknown_profile_rejected(self):
        with self.assertRaises(ValueError):acquisition_profile('magic_owner_autopilot')
    def test_guided_closes_gap_from_public_cue(self):
        # Fake HUD switches only after *keyboard-held* left movement >=2.44s.
        # This is policy simulation, not a simulated game-world distance oracle.
        page=FakePage()
        def hud(p):
            if p.left_seconds>=2.44:
                return "Let the fold's answer travel through the nursery."
            return "Follow the Watcher's turn toward the Listening Fold."
        log=[]
        with patch('bot1d10a_browser.time.monotonic',side_effect=lambda:page.elapsed):
            result=observed_navigation(page,hud,'guided',200,log)
        self.assertTrue(result['publicCueSeen']);self.assertEqual(result['termination'],'VISIBLE_FOLD_CUE')
        self.assertIn('APPROACH_CLOSURE',result['states'])
        self.assertGreaterEqual(result['stepCounts']['closure'],1)
        self.assertFalse(any(x.get('experimentalPeel') for x in log))
        self.assertNotIn(('press','x'),page.keyboard.events)
    def test_guided_never_pulses_without_cue(self):
        page=FakePage();log=[]
        with patch('bot1d10a_browser.time.monotonic',side_effect=lambda:page.elapsed):
            outcome=observed_navigation(page,lambda p:"Follow the Watcher's turn toward the Listening Fold.",'guided',200,log)
            finish=fold_finish(page,lambda p:"Follow the Watcher's turn toward the Listening Fold.",200,[])
        self.assertFalse(outcome['publicCueSeen'])
        self.assertEqual(outcome['termination'],'PUBLIC_CUE_ABSENT_SEARCH_EXHAUSTED')
        self.assertEqual(outcome['stepCounts']['closure'],len(closure_plan()))
        self.assertFalse(finish['pulseActions']);self.assertFalse(finish['holdActions'])
        self.assertEqual(page.keyboard.pressed,set())
    def test_recovery_sweep_is_only_policy_difference(self):
        records={}
        for profile in ['recovery','recovery_control']:
            page=FakePage();log=[]
            with patch('bot1d10a_browser.time.monotonic',side_effect=lambda:page.elapsed):
                outcome=observed_navigation(page,lambda p:"Follow the Watcher's turn toward the Listening Fold.",profile,200,log)
            records[profile]=(outcome,log)
        sweep=[x for x in records['recovery'][1] if x.get('experimentalPeel')]
        control=[x for x in records['recovery_control'][1] if x.get('experimentalPeel')]
        self.assertEqual(len(sweep),6);self.assertFalse(control)
        for arm in records.values():
            outcome,log=arm
            self.assertEqual(outcome['stepCounts']['reapproach'],1)
            self.assertEqual(outcome['stepCounts']['closure'],len(closure_plan()))
            self.assertIn('POST_REAPPROACH_CUE_WAIT',outcome['states'])
        for category in ('route','reapproach','closure'):
            a=[(x['key'],x['plannedSeconds'],x['label']) for x in records['recovery'][1] if x.get('phase')==category]
            b=[(x['key'],x['plannedSeconds'],x['label']) for x in records['recovery_control'][1] if x.get('phase')==category]
            self.assertEqual(a,b)
    def test_cue_handoff_q_pair_actions(self):
        page=FakePage()
        with patch('bot1d10a_browser.time.monotonic',side_effect=lambda:page.elapsed):
            result=fold_finish(page,lambda p:"Let the fold's answer travel through the nursery.",200,[])
        self.assertEqual(len(result['holdActions']),1)
        self.assertIn(('press','x'),page.keyboard.events)
        self.assertIn(('down','q'),page.keyboard.events)
        self.assertIn(('up','q'),page.keyboard.events)

class RefereeTests(unittest.TestCase):
    def synthetic(self):
        f=json.loads((HERE/'BOT1D9Y_UNIT_TEST_FIXTURE.json').read_text(encoding='utf8'))
        import copy
        rec,run=copy.deepcopy(f['rec']),copy.deepcopy(f['run'])
        run['revision']='BOT1-D10A';run['profile']='guided'
        rec['events'].append({'type':'game-stabilize-ended','time':'2026-10-31T03:18:51.755Z'})
        return rec,run
    def test_positive_synthetic_has_owner_stage5_and_stabilize_end(self):
        rec,run=self.synthetic();r=evaluate(rec,run)
        self.assertTrue(r['certifiedFoldStage5']);self.assertTrue(r['orderedStabilizeEndPaired'])
    def test_missing_owner_stage5_is_not_certified(self):
        rec,run=self.synthetic();rec['events']=[e for e in rec['events'] if not (
            e.get('type')=='bot1d-listening-fold-owner-state' and (e.get('state') or {}).get('stageIndex')==5)]
        self.assertFalse(evaluate(rec,run)['certifiedFoldStage5'])
    def test_missing_q_end_is_not_certified(self):
        rec,run=self.synthetic();rec['events']=[e for e in rec['events'] if e.get('type')!='game-stabilize-ended']
        self.assertFalse(evaluate(rec,run)['certifiedFoldStage5'])
    def test_host_event_not_fabricated(self):
        rec,run=self.synthetic();r=evaluate(rec,run)
        self.assertEqual(sum(r['hostEventCounts'].values()),0)
    def test_gate_requires_four_distinct_complete(self):
        rec,run=self.synthetic();rs=[]
        for profile in PROFILES_D10A:
            clone=dict(run,profile=profile)
            rs.append(evaluate(rec,clone))
        aggregate=summarize(rs)
        self.assertTrue(aggregate['completeEvidence'])
        self.assertEqual(aggregate['gate'],'ASSISTED_ALL_PASSED')
        self.assertEqual(aggregate['recoveryAB']['causalConclusion'],'NOT_PROVEN_SINGLE_PAIR_NONDTERMINISTIC_BROWSER')
        self.assertFalse(summarize(rs[:-1])['completeEvidence'])
    def test_missing_capture_detected(self):
        rec,run=self.synthetic();run['status']='ERROR'
        self.assertFalse(evaluate(rec,run)['rec1Complete'])
    def test_missing_arm_does_not_claim_ab_comparison(self):
        rec,run=self.synthetic();r=evaluate(rec,run)
        self.assertFalse(summarize([r])['recoveryAB']['pairedArmsPresent'])

if __name__=='__main__':unittest.main(verbosity=2)
