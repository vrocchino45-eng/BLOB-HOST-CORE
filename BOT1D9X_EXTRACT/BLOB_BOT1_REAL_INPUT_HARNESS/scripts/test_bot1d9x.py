#!/usr/bin/env python3
"""BOT1-D9X offline negative gates and optional real-D9W replay tests."""
from __future__ import annotations
import copy,glob,json,pathlib,unittest
from analyze_bot1d9x import evaluate,aggregate,FOLD,WATCHER,WATCHER_STATE
from test_bot1d9w import rec_stage3,stage_run,t


def fixture(seed=11):
    rec=rec_stage3()
    stages={e['state']['stageIndex']:e for e in rec['events'] if e['type']==FOLD}
    stages[1]['state']['stage']='observe_first_answer'
    stages[2]['state']['stage']='sustain_first_resonance'
    rec['events'].extend([
        {'type':WATCHER,'time':t(.2),'witness':{'packetPulseReadAccepted':True,'hostReceipt':False}},
        {'type':WATCHER_STATE,'time':t(.35),'state':{'foldInvitation':True}},
        {'type':FOLD,'time':t(3.3),'state':{'stageIndex':4,'stage':'release_and_settle','completed':False}},
        {'type':FOLD,'time':t(3.8),'state':{'stageIndex':5,'stage':'surface_wake_complete','completed':True,'progress':1}},
    ])
    rec['events'].sort(key=lambda x:x['time'])
    run=stage_run()
    run['seed']=seed;run['mode']='stage5';run['courseStarted']=True
    run['probes']=[{'index':i,'label':'travel_left' if i==9 else 'ambient_center',
                    'atStart':t(1),'atEnd':t(4)} for i in range(10)]
    run['arrival']['noOnlineOwnerCertification']=True
    return rec,run

class Referee(unittest.TestCase):
    def test_full_owner_certification(self):
        rec,run=fixture()
        row=evaluate(rec,run)
        self.assertTrue(row['gameplayOwnerCertified'])
        self.assertEqual(row['hostCoreGuideCausality'],'UNPROVEN_BY_THIS_PASS')
        self.assertEqual(row['guideOwnerObservations'],0)
    def test_complete_owner_is_not_host_receipt(self):
        rec,run=fixture();row=evaluate(rec,run)
        self.assertEqual(sum(row['hostEventCounts'].values()),0)
        self.assertTrue(row['ownerStage5Completed'])
    def test_no_stage5_fails(self):
        rec,run=fixture();rec['events']=[e for e in rec['events'] if not (e['type']==FOLD and (e.get('state') or {}).get('stageIndex')==5)]
        self.assertFalse(evaluate(rec,run)['gameplayOwnerCertified'])
    def test_fake_hud_success_does_not_certify(self):
        rec,run=fixture();rec['events']=[e for e in rec['events'] if not (e['type']==FOLD and (e.get('state') or {}).get('stageIndex')==5)]
        run['postCoursePublicCue']='fold_complete'
        self.assertFalse(evaluate(rec,run)['gameplayOwnerCertified'])
    def test_stage5_without_completed_false(self):
        rec,run=fixture()
        for e in rec['events']:
            if e['type']==FOLD and (e.get('state') or {}).get('stageIndex')==5:
                e['state']['completed']=False
        self.assertFalse(evaluate(rec,run)['gameplayOwnerCertified'])
    def test_wrong_owner_order_fails(self):
        rec,run=fixture()
        for e in rec['events']:
            if e['type']==FOLD and (e.get('state') or {}).get('stageIndex')==4:e['time']=t(5)
        self.assertFalse(evaluate(rec,run)['gameplayOwnerCertified'])
    def test_out_of_range_watcher_not_accepted(self):
        rec,run=fixture()
        for e in rec['events']:
            if e['type']==WATCHER:e['witness']['packetPulseReadAccepted']=False
        self.assertFalse(evaluate(rec,run)['gameplayOwnerCertified'])
    def test_absent_invitation_fails(self):
        rec,run=fixture()
        for e in rec['events']:
            if e['type']==WATCHER_STATE:(e['state'])['foldInvitation']=False
            if e['type']==FOLD:(e['state'])['nurseryFoldInvitation']=False
        self.assertFalse(evaluate(rec,run)['gameplayOwnerCertified'])
    def test_without_owner_stabilize_fails(self):
        rec,run=fixture();rec['events']=[e for e in rec['events'] if e['type']!='game-stabilize-started']
        self.assertFalse(evaluate(rec,run)['gameplayOwnerCertified'])
    def test_without_held_keyboard_input_fails(self):
        rec,run=fixture();run['arrival']['holdActions']=[]
        self.assertFalse(evaluate(rec,run)['gameplayOwnerCertified'])
    def test_incomplete_course_not_owner_certified(self):
        rec,run=fixture();run['probes']=run['probes'][:-1]
        self.assertFalse(evaluate(rec,run)['gameplayOwnerCertified'])
    def test_dropped_rec_inconclusive(self):
        rec,run=fixture();rec['summary']['captureRetention']['droppedDetails']=1
        self.assertEqual(evaluate(rec,run)['status'],'INCONCLUSIVE')
    def test_checkpoint_not_final_inconclusive(self):
        rec,run=fixture();self.assertEqual(evaluate(rec,run,'CHECKPOINT_ONLY')['status'],'INCONCLUSIVE')
    def test_missing_guide_does_not_block_fold(self):
        rec,run=fixture();self.assertTrue(evaluate(rec,run)['gameplayOwnerCertified'])
    def test_aggregation_all_pass(self):
        rows=[evaluate(*fixture(seed)) for seed in (11,13,24)]
        self.assertEqual(aggregate(rows)['gate'],'CROSS_POLICY_STAGE5_ALL_PASSED')
    def test_aggregation_partial_distinguishes_failure(self):
        rows=[evaluate(*fixture(seed)) for seed in (11,13,24)]
        rows[2]['gameplayOwnerCertified']=False
        self.assertEqual(aggregate(rows)['gate'],'CROSS_POLICY_STAGE5_PARTIAL_WITH_FAILURES')
    def test_control_failure_cannot_pass(self):
        rows=[evaluate(*fixture(seed)) for seed in (11,13,24)]
        rows[0]['gameplayOwnerCertified']=False
        self.assertEqual(aggregate(rows)['gate'],'FAIL_BASELINE_CONTROL')
    def test_same_seed_is_not_cross_seed(self):
        rows=[evaluate(*fixture(11)) for _ in range(3)]
        self.assertEqual(aggregate(rows)['gate'],'INCONCLUSIVE_INCOMPLETE_MATRIX')
    def test_real_d9w_archive_replay_if_present(self):
        root=pathlib.Path(__file__).resolve().parents[2]/'BOT1D9W_RESULTS'
        runs=sorted(d for d in root.glob('BOT1D9W_*') if d.is_dir())
        if len(runs)!=3:self.skipTest('D9W result archive not in checkout')
        verdicts=[]
        for folder in runs:
            run=json.loads((folder/'RUN.json').read_text('utf8'))
            rec=json.loads((folder/'REC1.json').read_text('utf8'))
            run['mode']='stage5'
            verdicts.append(evaluate(rec,run)['gameplayOwnerCertified'])
        self.assertEqual(verdicts,[True,True,False])

if __name__=='__main__':unittest.main(verbosity=2)
