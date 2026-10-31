#!/usr/bin/env python3
"""Offline D9Y policy and referee gate tests; no browser/network required."""
from __future__ import annotations
import copy,json,unittest,zipfile,pathlib
from bot1d9y_policy import PROFILES,reference,acquisition,route,correction,fold_cue,can_finish,policy_contract
from analyze_bot1d9y import evaluate,summarize

ROOT=pathlib.Path(__file__).resolve().parents[3]
D9X=ROOT/'1BOT1D9X_RESULTS.zip'
FIXTURE=pathlib.Path(__file__).with_name('BOT1D9Y_UNIT_TEST_FIXTURE.json')

class PolicyTests(unittest.TestCase):
    def test_reference_matches_golden_acquisition(self):
        self.assertEqual(len(acquisition('golden')),13)
        self.assertEqual(len(acquisition('recovery')),13)
        self.assertEqual(acquisition('golden')[0]['kind'],'pulse')
        self.assertEqual(acquisition('recovery')[0]['key'],'a')
    def test_reference_route_golden(self):
        r=route('golden')
        self.assertEqual(len(r),10)
        self.assertEqual((r[-1]['key'],r[-1]['seconds']),('a',2.2))
    def test_profiles_not_identical(self):
        self.assertEqual(len(set(PROFILES)),3)
        self.assertNotEqual(route('golden'),route('guided'))
        self.assertNotEqual(route('guided'),route('recovery'))
    def test_bounded_search(self):
        for p in PROFILES:
            self.assertLessEqual(sum(x[1] for x in correction(p)),2.4)
    def test_public_cue_gate(self):
        self.assertFalse(can_finish("Follow the Watcher's turn toward the Listening Fold."))
        self.assertTrue(can_finish('Press X once to pulse-read the fold.'))
    def test_no_hidden_online_input(self):
        c=policy_contract()
        self.assertIn('player XYZ',c['forbidden'])
        self.assertTrue(c['referenceIsBotTelemetry'])
    def test_reference_provenance(self):
        self.assertIn('NOT a human-run',reference()['basis'])

class RefereeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not D9X.exists():
            mini=json.loads(FIXTURE.read_text(encoding='utf8'))
            assert mini['fixturePurpose']=='UNIT_TEST_ONLY_EXCERPT_NOT_FULL_REC1_PROOF'
            cls.real=(mini['rec'],mini['run'])
            return
        with zipfile.ZipFile(D9X) as z:
            a=next(x for x in z.namelist() if x.endswith('/REC1.json') and 'repeat01' in x)
            b=next(x for x in z.namelist() if x.endswith('/RUN.json') and 'repeat01' in x)
            cls.real=(json.loads(z.read(a)),json.loads(z.read(b)))
    def fixture(self):
        rec,run=copy.deepcopy(self.real)
        run['profile']='golden';run['revision']='BOT1-D9Y';run['courseStarted']=True
        run['arrival']['noOnlineOwnerCertification']=True
        return rec,run
    def test_real_golden_is_true(self):
        rec,run=self.fixture();r=evaluate(rec,run)
        self.assertTrue(r['certifiedFoldStage5'])
        self.assertEqual(r['acceptedWatcherReads'],1)
    def test_no_stage5_cannot_pass(self):
        rec,run=self.fixture()
        rec['events']=[e for e in rec['events'] if not (e.get('type')=='bot1d-listening-fold-owner-state' and e.get('state',{}).get('stageIndex')==5)]
        self.assertFalse(evaluate(rec,run)['certifiedFoldStage5'])
    def test_hud_claim_cannot_replace_receipt(self):
        rec,run=self.fixture();run['postCourseObjective']='Surface Wake complete'
        rec['events']=[e for e in rec['events'] if e.get('type')!='bot1d-listening-fold-owner-state']
        self.assertFalse(evaluate(rec,run)['certifiedFoldStage5'])
    def test_missing_read_cannot_pass(self):
        rec,run=self.fixture()
        for e in rec['events']:
            if e.get('type')=='bot1c-watcher-pulse-owner-result':e['witness']['packetPulseReadAccepted']=False
        self.assertFalse(evaluate(rec,run)['certifiedFoldStage5'])
    def test_no_stabilize_cannot_pass(self):
        rec,run=self.fixture()
        rec['events']=[e for e in rec['events'] if e.get('type')!='game-stabilize-started']
        self.assertFalse(evaluate(rec,run)['certifiedFoldStage5'])
    def test_dropped_details_inconclusive(self):
        rec,run=self.fixture();rec['summary']['captureRetention']['droppedDetails']=1
        self.assertEqual(evaluate(rec,run)['status'],'INCONCLUSIVE_CAPTURE')
    def test_host_separate(self):
        rec,run=self.fixture();r=evaluate(rec,run)
        self.assertTrue(r['certifiedFoldStage5'])
        self.assertEqual(sum(r['hostEventCounts'].values()),0)
    def test_no_invite_fails(self):
        rec,run=self.fixture()
        for e in rec['events']:
            if e.get('type')=='bot1c-watcher-owner-state-change':e['state']['foldInvitation']=False
            if e.get('type')=='bot1d-listening-fold-owner-state':e['state']['nurseryFoldInvitation']=False
        self.assertFalse(evaluate(rec,run)['certifiedFoldStage5'])

if __name__=='__main__':unittest.main(verbosity=2)
