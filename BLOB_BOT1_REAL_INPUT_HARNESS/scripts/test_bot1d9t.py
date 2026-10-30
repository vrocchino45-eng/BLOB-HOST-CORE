#!/usr/bin/env python3
"""D9T offline replication, chronology and hidden-state firewall regression."""
from __future__ import annotations
import datetime,pathlib,unittest
from bot1d9t_protocol import crossing_course, EXPECTED
from analyze_bot1d9t import evaluate,aggregate
T0=datetime.datetime(2026,10,29,tzinfo=datetime.timezone.utc)
def t(x):return (T0+datetime.timedelta(seconds=x)).isoformat()
def mk(kind,sec,**data):return {'time':t(sec),'type':kind,**data}
def rec(success=True,guide=True):
    events=[mk('bot1c-watcher-owner-state-change',1,state={'foldInvitation':True}),
      mk('bot1d-listening-fold-owner-state',2,state={'nurseryFoldInvitation':True,'inApproach':False,'stageIndex':0}),
      mk('c0d4-mob1-movement-sample',7,owner={'motion':{'position':{'x':3,'y':0,'z':0},'boundaryPressure':0},'attachment':{'active':False},'input':{'moveX':-1}}),
      mk('c0d4-mob1-movement-sample',8,owner={'motion':{'position':{'x':-1,'y':0,'z':0},'boundaryPressure':0},'attachment':{'active':False},'input':{'moveX':-1}})]
    if success:
        events += [mk('bot1d-listening-fold-owner-state',9,state={'inApproach':True,'stageIndex':0}),
             mk('bot1d-listening-fold-owner-state',10,state={'inApproach':True,'stageIndex':1,'focusDistance':1.8})]
        if guide:events += [mk('guide0-core-guide-state',10.4,state={'guide':{'state':'interpreting_traveling_answer','lastReaction':'guide_traced_answer_without_claiming_meaning'}})]
    return {'captureStartedAt':t(0),'events':events,'summary':{'captureRetention':{'droppedDetails':0}}}
def run(n=10):return {'status':'CAPTURED','repeat':1,'courseStarted':True,'probes':[
       {'label':'travel_left','atStart':t(6),'atEnd':t(8.5)},
       *[{'label':f'other_{i}','atStart':t(1),'atEnd':t(2)} for i in range(n-1)]]}

class Tests(unittest.TestCase):
    def test_d9s_fixed_course_preserved(self):
        p=crossing_course();self.assertEqual(len(p),10)
        self.assertEqual(tuple((x.kind,x.key,x.duration,x.label) for x in p),EXPECTED)
    def test_only_one_left_trial(self):
        self.assertEqual(sum(t.label=='travel_left' for t in crossing_course()),1)
    def test_success_owner_certified(self):
        d=evaluate(rec(),run());self.assertEqual(d['verdict'],'STAGE1_OWNER_CERTIFIED')
        self.assertTrue(d['ownerStage1Proven']);self.assertEqual(d['ownerMaxStageIndex'],1)
    def test_temporal_alignment_required(self):
        r=rec();r['events'].append(mk('bot1d-listening-fold-owner-state',16,state={'inApproach':True,'stageIndex':2}))
        d=evaluate(r,run());self.assertTrue(d['stage1TemporallyNearLeftTrial'])
        late=rec();late['events']=[e for e in late['events'] if e['type']!='bot1d-listening-fold-owner-state' or e['state'].get('stageIndex',0)==0]
        late['events'].append(mk('bot1d-listening-fold-owner-state',17,state={'inApproach':True,'stageIndex':1}))
        d=evaluate(late,run());self.assertTrue(d['ownerStage1Proven']);self.assertFalse(d['stage1TemporallyNearLeftTrial'])
        self.assertFalse(d['fixedCourseReplicationProven'])
    def test_guide_observed_not_assumed(self):
        d=evaluate(rec(),run());self.assertTrue(d['guideInterpretingNearStage1']);self.assertIn('guide_traced_answer_without_claiming_meaning',d['guidePhysicalReactionNearStage1'])
    def test_guide_missing_does_not_negate_stage(self):
        d=evaluate(rec(guide=False),run());self.assertTrue(d['ownerStage1Proven']);self.assertFalse(d['guideInterpretingNearStage1'])
    def test_missing_fold_not_inferred_from_left(self):
        d=evaluate(rec(success=False),run());self.assertFalse(d['ownerStage1Proven']);self.assertEqual(d['verdict'],'INVITED_NOT_APPROACHED')
    def test_crossing_only_offline(self):
        d=evaluate(rec(),run());self.assertTrue(d['leftTrial']['positiveToNegativeCrossing'])
        self.assertAlmostEqual(d['leftTrial']['sampledXDelta'],-4)
    def test_incomplete_course_inconclusive(self):
        d=evaluate(rec(),run(n=9));self.assertEqual(d['verdict'],'INCOMPLETE_EVIDENCE')
        self.assertFalse(d['evidenceCompleteForReplication'])
    def test_checkpoint_not_as_replication_success(self):
        d=evaluate(rec(),run(),source='CHECKPOINT_ONLY');self.assertFalse(d['evidenceCompleteForReplication'])
    def test_missing_data_not_failure(self):
        d=evaluate({'events':[]},run(),source='MISSING');self.assertEqual(d['verdict'],'INCOMPLETE_EVIDENCE')
    def test_all_pass_gate(self):
        d=evaluate(rec(),run());a=aggregate([d,d,d],3)
        self.assertEqual(a['replicationGate'],'REPLICATION_ALL_PASSED')
    def test_two_pass_gate(self):
        a=aggregate([evaluate(rec(),run()),evaluate(rec(),run()),evaluate(rec(False),run())],3)
        self.assertEqual(a['replicationGate'],'REPLICATION_PARTIAL_AT_LEAST_TWO')
    def test_one_success_not_repeatable(self):
        a=aggregate([evaluate(rec(),run()),evaluate(rec(False),run()),evaluate(rec(False),run())],3)
        self.assertEqual(a['replicationGate'],'NOT_YET_REPLICABLE_ONE_SUCCESS')
    def test_incomplete_run_block(self):
        d=evaluate(rec(),run());i=evaluate(rec(),run(n=4))
        self.assertEqual(aggregate([d,d,i],3)['replicationGate'],'INSUFFICIENT_COMPLETE_REPLICATIONS')
    def test_default_no_preclaim(self):
        d=evaluate({'events':[]},run());self.assertFalse(d['ownerApproachProven'])
    def test_browser_policy_no_rec1_reads_for_actions(self):
        s=pathlib.Path(__file__).with_name('bot1d9t_browser.py').read_text(encoding='utf-8')
        pre=s.split("# Export complete REC1.")[0]
        self.assertNotIn('page.evaluate(',pre)
        self.assertNotIn('analyze_bot1d9t',pre)
        self.assertNotIn("get('owner'",pre)
        self.assertNotIn("'REC1.json').read_text",pre)
    def test_three_new_context_runs_default(self):
        s=pathlib.Path(__file__).with_name('bot1d9t_browser.py').read_text()
        self.assertIn("p.add_argument('--runs',type=int,default=3)",s)
        self.assertIn('ctx=browser.new_context(',s)
        self.assertIn('for rep in range(1,a.runs+1)',s)

if __name__=='__main__':unittest.main(verbosity=2)
