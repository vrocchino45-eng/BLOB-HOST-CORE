#!/usr/bin/env python3
"""D11I offline policy, referee, and evidence-safety contract tests."""
from __future__ import annotations
import json,pathlib,sys,tempfile,unittest
from bot1d11i_policy import ARMS,NATURAL,CONTROLS,EXTRA_DWELL_SECONDS,route,schedule
from analyze_bot1d11i import analyze,summarize
from test_bot1d11h import trace as d11h_trace,run as d11h_run
T='SILT_ENTRY_SEDIMENT_SHELF_D11B'

def make_trace(success=True):
    tr=d11h_trace()
    if not success:tr=d11h_trace(('eligible','brushing','reaching','released'))
    ev=[{'type':'probe_reset','ms':0},
        {'type':'brush_gate_observation','ms':10,'candidateReason':'brush_candidate_ready'},
        {'type':'embodiment_contact_transition','ms':20,'to':'brushing'},
        {'type':'reach_attempt','ms':80,'outcome':'began_reaching','after':{'reachSurface':T}}]
    if success:ev += [
        {'type':'tendril_phase_transition','ms':260,'to':'sealed','after':{'anchorSurface':T}},
        {'type':'support_plane_transition','ms':300,'after':{'active':True,'surfaceId':T}},
        {'type':'movement_attachment_transition','ms':370,'after':{'active':True,'reason':'none'}},
        {'type':'movement_attachment_transition','ms':600,'after':{'active':False,'reason':'deliberate_away_input'}}]
    tr['firstFootholdEvents']={'revision':'BOT1-D11I-1','hooked':True,'droppedEvents':0,
        'ownerDataUsedForSteering':False,'events':ev}
    return tr

def make_run(profile='natural_reference',arm='baseline',round_number=1):
    r=d11h_run(profile);r['arm']=arm;r['round']=round_number;return r

class D11ITests(unittest.TestCase):
    def test_base_routes_frozen(self):
        from bot1d11e_policy import course
        for p in NATURAL:self.assertEqual(tuple(course(p)),route(p,'baseline'))
    def test_matched_pause_duration(self):
        for p in NATURAL:
            base=sum(t for _,_,t in route(p))
            for a in ARMS[1:]:self.assertAlmostEqual(sum(t for _,_,t in route(p,a))-base,EXTRA_DWELL_SECONDS)
    def test_dwell_placement(self):
        for p in NATURAL:
            a=[x[0] for x in route(p,'contact_dwell')];b=[x[0] for x in route(p,'timing_control')]
            self.assertEqual(a.index('D11I_near_shelf_neutral_dwell'),a.index('approach_2')+1)
            self.assertEqual(b.index('D11I_pre_approach_timing_control'),b.index('spawn_neutral')+1)
    def test_both_pause_arms_have_no_keys(self):
        for p in NATURAL:
            for a in ARMS[1:]:
                self.assertIsNone(next(k for label,k,_ in route(p,a) if label.startswith('D11I_')))
    def test_control_course_unchanged(self):
        for p in CONTROLS:self.assertEqual(route(p,'baseline'),route(p,'contact_dwell'))
    def test_schedule_default_fourteen(self):
        self.assertEqual(len(schedule(2)),14)
    def test_schedule_max_twenty(self):
        self.assertEqual(len(schedule(3)),20)
    def test_schedule_alternates_order(self):
        s=schedule(2);self.assertEqual(s[2][1:],s[-1][1:])
    def test_good_result(self):
        r=summarize(make_trace(),make_run());self.assertTrue(r['gatePassed'])
        self.assertEqual(r['classification'],'OWNER_SEAL_AND_D11H_SUSTAINED_GATE_PASS')
    def test_missing_event_probe(self):
        t=make_trace();t.pop('firstFootholdEvents')
        self.assertEqual(summarize(t,make_run())['classification'],'MISSING_D11I_EVENT_PROBE')
    def test_overflow_rejected(self):
        t=make_trace();t['firstFootholdEvents']['droppedEvents']=2
        self.assertEqual(summarize(t,make_run())['classification'],'EVENT_OVERFLOW')
    def test_no_owner_seal_rejected(self):
        r=summarize(make_trace(False),make_run());self.assertFalse(r['gatePassed']);
        self.assertEqual(r['classification'],'REACH_WITHOUT_OWNER_SEAL_EVENT')
    def test_no_support_event_rejected(self):
        t=make_trace();t['firstFootholdEvents']['events']=[e for e in t['firstFootholdEvents']['events']
            if e['type']!='support_plane_transition']
        self.assertEqual(summarize(t,make_run())['classification'],'SEALED_WITHOUT_OWNER_SUPPORT_EVENT')
    def test_no_sustained_gate_rejected(self):
        t=make_trace();t['samples'][4]['continuity']['anchors'][0]['geometry']['distance']=2
        self.assertFalse(summarize(t,make_run())['gatePassed'])
    def test_hidden_steering_rejected(self):
        r=make_run();r['ownerDataUsedForSteering']=True
        self.assertEqual(summarize(make_trace(),r)['classification'],'DISQUALIFIED_STEERING_OR_RELOCATION')
    def test_debug_pose_rejected(self):
        r=make_run();r['controlledDebugStart']=True
        self.assertEqual(summarize(make_trace(),r)['classification'],'DISQUALIFIED_STEERING_OR_RELOCATION')
    def test_missing_matrix(self):
        with tempfile.TemporaryDirectory() as d:
            sub=pathlib.Path(d)/'one';sub.mkdir()
            (sub/'RUN.json').write_text(json.dumps(make_run()),encoding='utf8')
            (sub/'D11C_TRACE.json').write_text(json.dumps(make_trace()),encoding='utf8')
            self.assertFalse(analyze(d)['captureMatrixComplete'])
    def test_instrumentation_no_gameplay_source_edits(self):
        root=pathlib.Path(__file__).resolve().parents[2]
        helper=root/'src/debug/BOT1D11IEventReasonRecorder.js'
        if not helper.exists():self.skipTest('D11I helper not installed')
        txt=helper.read_text(encoding='utf8')
        self.assertNotIn('player.position.copy(',txt)
        self.assertIn('Reflect.apply(fn,self,args)',txt)
        self.assertIn('candidateReason',txt)
    def test_no_new_D11I_keys(self):
        for p in NATURAL:
            for a in ARMS:
                self.assertTrue(all(key in (None,'w','a','s','d','c') for _,key,_ in route(p,a)))

if __name__=='__main__':unittest.main(verbosity=2)
