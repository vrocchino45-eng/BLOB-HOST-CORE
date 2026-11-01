#!/usr/bin/env python3
"""Offline D10B tests. No browser or game server is required."""
from __future__ import annotations
import json,pathlib,tempfile,unittest
from unittest.mock import patch
from bot1d10b_repeat import schedule,d10a_complete
from analyze_bot1d10b import classify,verdict,summarize,render_md,analyze_root


def evidence(invite=True,stage1=True,stage5=True,reads=1,complete=True,dropped=0):
    return {'ownerInvitationObserved':invite,'acceptedWatcherReads':reads,
      'rec1Complete':complete,'droppedDetails':dropped,
      'offlineApproach':{'stage1Reached':stage1},'certifiedFoldStage5':stage5}

def run(status='CAPTURED',errors=None):return {'status':status,'errors':errors or []}

def row(profile='golden',classification='OWNER_CERTIFIED_STAGE5',n=1):
    return {'profile':profile,'round':n,'runOrder':1 if profile=='golden' else 2,'classification':classification,'missing':False,
        'invitation':classification!='WATCHER_ACQUISITION_FAILED',
        'stage1':classification not in ('WATCHER_ACQUISITION_FAILED','FOLD_APPROACH_FAILED'),
        'stage5':classification=='OWNER_CERTIFIED_STAGE5',
        'rec1Complete':classification!='CAPTURE_OR_TELEMETRY_FAILURE'}

class ScheduleTests(unittest.TestCase):
    def test_three_rounds_alternate(self):
        self.assertEqual(schedule(3),[['golden','guided'],['guided','golden'],['golden','guided']])
    def test_four_rounds_balanced_order(self):
        self.assertEqual(schedule(4),[['golden','guided'],['guided','golden'],['golden','guided'],['guided','golden']])
    def test_reject_zero(self):
        with self.assertRaises(ValueError):schedule(0)
    def test_reject_nine(self):
        with self.assertRaises(ValueError):schedule(9)

class RefereeTests(unittest.TestCase):
    def test_capture_error_is_not_a_gameplay_failure(self):
        self.assertEqual(classify(evidence(),run(errors=['pageerror'])),'CAPTURE_OR_TELEMETRY_FAILURE')
    def test_dropped_details_invalidates_capture(self):
        self.assertEqual(classify(evidence(dropped=2),run()),'CAPTURE_OR_TELEMETRY_FAILURE')
    def test_invitation_without_accepted_read_is_not_enough(self):
        self.assertEqual(classify(evidence(invite=True,reads=0),run()),'WATCHER_ACQUISITION_FAILED')
    def test_uninvited_is_acquisition(self):
        self.assertEqual(classify(evidence(invite=False,reads=0,stage1=False,stage5=False),run()),'WATCHER_ACQUISITION_FAILED')
    def test_invited_but_stagezero_is_approach(self):
        self.assertEqual(classify(evidence(stage1=False,stage5=False),run()),'FOLD_APPROACH_FAILED')
    def test_stage1_without_stage5_is_handoff(self):
        self.assertEqual(classify(evidence(stage1=True,stage5=False),run()),'FOLD_INTERACTION_OR_HANDOFF_FAILED')
    def test_certified_completion(self):
        self.assertEqual(classify(evidence(),run()),'OWNER_CERTIFIED_STAGE5')
    def test_full_smoke_gate(self):
        rows=[row(p,n=i+1) for i in range(3) for p in ('golden','guided')]
        self.assertEqual(verdict(rows,6),'ASSISTED_REPEATABILITY_SMOKE_PASSED')
        self.assertEqual(summarize(rows,6)['perProfile']['guided']['stage5Certified'],3)
    def test_one_failed_acquisition_marks_unstable(self):
        rows=[row(p,n=i+1) for i in range(3) for p in ('golden','guided')]
        rows[2]=row('golden','WATCHER_ACQUISITION_FAILED',2)
        self.assertEqual(verdict(rows,6),'WATCHER_ACQUISITION_UNSTABLE')
    def test_missing_runs_not_passed(self):
        self.assertEqual(verdict([row()],6),'INCOMPLETE_RUN_SET')
    def test_report_has_proof_limits(self):
        self.assertIn('not a Host receipt',render_md(summarize([row('golden'),row('guided')],2)))

class FileSafetyTests(unittest.TestCase):
    def test_only_verified_round_can_resume(self):
        with tempfile.TemporaryDirectory() as s:
            root=pathlib.Path(s);profiles=['golden','guided'];rows=[]
            for i,p in enumerate(profiles,1):
                f=f'BOT1D10A_run{i:02d}_{p}';rows.append({'profile':p,'folder':f,'status':'CAPTURED','errors':[]})
                d=root/f;d.mkdir()
                (d/'RUN.json').write_text(json.dumps({'profile':p,'status':'CAPTURED'}))
                (d/'REC1.json').write_text('{"events":[{}]}')
            (root/'BOT1D10A_RUN_INDEX.json').write_text(json.dumps({'profilesRequested':profiles,'runs':rows}))
            self.assertTrue(d10a_complete(root,profiles))
            self.assertFalse(d10a_complete(root,['guided','golden']))
            (root/rows[0]['folder']/'REC1.json').unlink()
            self.assertFalse(d10a_complete(root,profiles))
    def test_offline_analyzer_reports_independent_proof_only(self):
        with tempfile.TemporaryDirectory() as s:
            root=pathlib.Path(s);(root/'BOT1D10B_RUN_PLAN.json').write_text(json.dumps({
                'revision':'BOT1-D10B','schedule':[['golden','guided']]}))
            rd=root/'round01';rd.mkdir();runs=[]
            for p in ('golden','guided'):
                folder='BOT1D10A_'+p;d=rd/folder;d.mkdir()
                (d/'RUN.json').write_text(json.dumps({'profile':p,'status':'CAPTURED','errors':[]}))
                (d/'REC1.json').write_text('{"events":[]}')
                runs.append({'profile':p,'folder':folder,'status':'CAPTURED'})
            (rd/'BOT1D10A_RUN_INDEX.json').write_text(json.dumps({'profilesRequested':['golden','guided'],'runs':runs}))
            fake=lambda rec,run: evidence(stage5=(run['profile']=='golden'))
            fake2=lambda rec,run: dict(fake(rec,run),rec1Events=20)
            with patch.dict('sys.modules',{'analyze_bot1d10a':type('M',(),{'evaluate':staticmethod(fake2)})}):
                result=analyze_root(root)
            self.assertEqual(result['gate'],'FOLD_HANDOFF_UNSTABLE')
            self.assertEqual(result['ownerCertifiedStage5'],1)
            self.assertTrue((rd/'BOT1D10A_golden'/'D10B_EVIDENCE.json').exists())

if __name__=='__main__':unittest.main(verbosity=2)
