#!/usr/bin/env python3
"""D11E offline policy/referee tests; simulated owner data are NOT game-play proof."""
from __future__ import annotations
import json,pathlib,sys,tempfile,unittest
from bot1d11e_policy import PROFILES,TARGET,course,entry_key,natural
from analyze_bot1d11e import (MIN_HELD_MS,MIN_TANGENTIAL_DISPLACEMENT,
    summarize_trace,path_windows,same_surface_supported,projected_motion,analyze_root)


def make_sample(ms,*,eligible=True,sealed=2,plane=True,attached=True,surface=TARGET,
                x=0.0,state=None,detach_reason='none'):
    return {'ms':ms,'cell':'CELL_SILT_PRESSURE_ROUTE_001',
            'player':{'x':x,'y':0.0,'z':0.0},'shelf':{'present':True,'visible':True},
            'surface':{'valid':eligible,'eligible':eligible,'surfaceId':surface if eligible else 'none'},
            'contact':{'state':'attached' if attached else 'suspended','sealed':sealed,
                       'truthSurfaceId':surface,'carriedSurfaceId':surface},
            'plane':{'active':plane,'surfaceId':surface,'normal':{'x':0,'y':1,'z':0}},
            'attachment':{'active':attached,'state':state or ('attached' if attached else 'free'),
                          'surfaceId':surface,'supportCount':2 if plane and attached else 0,
                          'detachReason':detach_reason}}


def good_trace(*,mutate=None):
    seq=[make_sample(ms,x=(0.0 if ms<1500 else (ms-1500)/1000*0.35)) for ms in range(400,2900,100)]
    seq+=[make_sample(3000,attached=False,plane=False,sealed=0,state='releasing',
                      detach_reason='deliberate_away_input'),
          make_sample(3200,attached=False,plane=False,sealed=0,state='free')]
    if mutate:mutate(seq)
    return {'samples':seq,'interventions':[
        {'kind':'marker','label':'start:tangential','ms':1500},
        {'kind':'marker','label':'end:tangential','ms':1900},
        {'kind':'marker','label':'start:away_vertical','ms':2850},
        {'kind':'marker','label':'end:away_vertical','ms':3150}]}


def run():
    return {'status':'CAPTURED','actions':[{'label':'away_vertical','key':'c'}],
            'controlledDebugStart':False,'ownerDataUsedForSteering':False,
            'rec1':{'droppedDetails':0},'errors':[]}


class PolicyTests(unittest.TestCase):
    def test_profiles(self):
        self.assertEqual(len(PROFILES),5)
        self.assertEqual(len(PROFILES),len(set(PROFILES)))
        self.assertEqual(sum(natural(p) for p in PROFILES),3)
    def test_no_debug_relocation_or_owner_driving_in_runner(self):
        here=pathlib.Path(__file__).parent/'bot1d11e_browser.py'
        source=here.read_text(encoding='utf8')
        self.assertNotIn('controlledStart()',source)
        self.assertNotIn('.snapshot()',source)
        self.assertIn("'ownerDataUsedForSteering':False",source)
    def test_entries(self):
        self.assertEqual(entry_key('host_positive'),'Shift+1')
        for p in PROFILES:
            if p!='host_positive':self.assertEqual(entry_key(p),'Shift+6')
    def test_unknown(self):
        with self.assertRaises(ValueError):course('nosuch')
    def test_courses(self):
        for p in PROFILES:self.assertGreater(len(course(p)),3)
        for p in PROFILES:
            if natural(p):
                self.assertIn(('away_vertical','c',1.15),course(p))
                self.assertTrue(any(a[0]=='tangential' for a in course(p)))
    def test_negative_starts_moving_away(self):
        self.assertEqual(course('away_control')[1][1],'c')
    def test_shared_hc_control(self):
        self.assertEqual(course('host_positive')[1][1],'w')


class RefereeTests(unittest.TestCase):
    def test_full_sequence(self):
        t=good_trace();r=summarize_trace(t,'natural_feather',run())
        self.assertTrue(r['gatePassed'],r)
        self.assertEqual(r['classification'],'NATURAL_SILT_FULL_SEQUENCE_OBSERVED')
        self.assertGreater(r['maxObservedSupportedSpanMs'],MIN_HELD_MS)
        self.assertGreater(r['tangentialObservedDisplacement'],MIN_TANGENTIAL_DISPLACEMENT)
        self.assertTrue(r['freeAfterDeliberateRelease'])
    def test_empty_is_not_success(self):
        self.assertFalse(summarize_trace({},'natural_reference',run())['gatePassed'])
    def test_single_latch_not_sustained(self):
        t={'samples':[make_sample(100),make_sample(200,attached=False,sealed=0,plane=False)]}
        self.assertFalse(summarize_trace(t,'natural_reference',run())['gatePassed'])
    def test_no_seal_even_with_attachment(self):
        t=good_trace(mutate=lambda seq:[s['contact'].update(sealed=0) for s in seq])
        r=summarize_trace(t,'natural_brake',run())
        self.assertEqual(r['classification'],'SILT_ANCHOR_NOT_SEALED')
    def test_no_plane_even_with_attachment(self):
        t=good_trace(mutate=lambda seq:[s['plane'].update(active=False) for s in seq])
        r=summarize_trace(t,'natural_brake',run())
        self.assertEqual(r['classification'],'SILT_SUPPORT_PLANE_NOT_ESTABLISHED')
    def test_no_tangential_motion(self):
        t=good_trace(mutate=lambda seq:[s['player'].update(x=0) for s in seq])
        r=summarize_trace(t,'natural_brake',run())
        self.assertEqual(r['classification'],'TANGENTIAL_MOVEMENT_NOT_VERIFIED')
    def test_only_normal_motion_does_not_count_as_tangential(self):
        t=good_trace(mutate=lambda seq:[s['player'].update(x=0,y=s['player']['x']) for s in seq])
        r=summarize_trace(t,'natural_brake',run())
        self.assertEqual(r['classification'],'TANGENTIAL_MOVEMENT_NOT_VERIFIED')
    def test_missing_release_reason_fails(self):
        t=good_trace(mutate=lambda seq:seq[-2]['attachment'].update(detachReason='sustained_contact_loss'))
        r=summarize_trace(t,'natural_reference',run())
        self.assertEqual(r['classification'],'INPUT_ALIGNED_RELEASE_NOT_VERIFIED')
    def test_release_before_away_does_not_count(self):
        t=good_trace()
        t['samples'][-2]['ms']=2600
        t['samples'][-1]['ms']=2700
        r=summarize_trace(t,'natural_reference',run())
        self.assertFalse(r['gatePassed'])
    def test_no_return_free_fails(self):
        t=good_trace(mutate=lambda seq:seq.pop())
        r=summarize_trace(t,'natural_reference',run())
        self.assertEqual(r['classification'],'INPUT_ALIGNED_RELEASE_NOT_VERIFIED')
    def test_no_declared_key_input_fails(self):
        t=good_trace();r=summarize_trace(t,'natural_brake',{'actions':[]})
        self.assertEqual(r['classification'],'INPUT_ALIGNED_RELEASE_NOT_VERIFIED')
    def test_controlled_debug_pose_disqualified(self):
        t=good_trace();r=run();r['controlledDebugStart']=True
        self.assertEqual(summarize_trace(t,'natural_reference',r)['classification'],'DISQUALIFIED_CONTROLLED_OR_OWNER_STEERED')
    def test_owner_guided_disqualified(self):
        t=good_trace();r=run();r['ownerDataUsedForSteering']=True
        self.assertFalse(summarize_trace(t,'natural_reference',r)['gatePassed'])
    def test_away_control_clear(self):
        s=make_sample(100,eligible=False,sealed=0,plane=False,attached=False)
        self.assertTrue(summarize_trace({'samples':[s]},'away_control',run())['gatePassed'])
    def test_away_control_rejects_attachment(self):
        self.assertFalse(summarize_trace({'samples':[make_sample(100)]},'away_control',run())['gatePassed'])
    def test_hc_control_accepts_hc_owner(self):
        s=make_sample(100,surface='HOST_CONTACT_CONTINUATION_MEMBRANE_01')
        self.assertTrue(summarize_trace({'samples':[s]},'host_positive',run())['gatePassed'])
    def test_hc_control_rejects_silt(self):
        self.assertFalse(summarize_trace({'samples':[make_sample(100)]},'host_positive',run())['gatePassed'])
    def test_marker_parser(self):
        self.assertEqual(path_windows(good_trace())['away_vertical'],(2850,3150))
    def test_support_requires_matching_surface(self):
        s=make_sample(100)
        s['plane']['surfaceId']='WRONG'
        self.assertFalse(same_surface_supported(s))
    def test_projected_motion_requires_normal(self):
        a=make_sample(0);b=make_sample(100,x=1)
        self.assertIsNone(projected_motion(a,b,{}))
    def test_missing_sample_gap_doesnt_fake_hold(self):
        t=good_trace(mutate=lambda seq:[s.update(ms=i*500) for i,s in enumerate(seq)])
        r=summarize_trace(t,'natural_reference',run())
        self.assertEqual(r['sustainedSupportedSegments'],0)



class FolderAnalysisTests(unittest.TestCase):
    def _write(self,root,profile,trace,round_number=1):
        folder=root/(profile+'_'+str(round_number))
        folder.mkdir()
        record=run()
        record.update(profile=profile,round=round_number)
        (folder/'RUN.json').write_text(json.dumps(record),encoding='utf-8')
        (folder/'D11C_TRACE.json').write_text(json.dumps(trace),encoding='utf-8')
        (folder/'REC1.json').write_text(json.dumps({'events':[{'name':'sample'}]}),encoding='utf-8')
        return folder
    def test_complete_mock_matrix(self):
        with tempfile.TemporaryDirectory() as path:
            root=pathlib.Path(path)
            for p in PROFILES:
                if p=='host_positive':
                    tr={'samples':[make_sample(100,surface='HOST_CONTACT_CONTINUATION_MEMBRANE_01')]}
                elif p=='away_control':
                    tr={'samples':[make_sample(100,eligible=False,sealed=0,plane=False,attached=False)]}
                else:tr=good_trace()
                self._write(root,p,tr)
            report=analyze_root(root)
            self.assertTrue(report['completeMatrix'])
            self.assertTrue(report['limitedGatePassed'],report)
    def test_no_matrix_when_missing(self):
        with tempfile.TemporaryDirectory() as path:
            root=pathlib.Path(path)
            self._write(root,'natural_reference',good_trace())
            report=analyze_root(root)
            self.assertFalse(report['completeMatrix'])
            self.assertFalse(report['limitedGatePassed'])
    def test_capture_requires_rec1(self):
        with tempfile.TemporaryDirectory() as path:
            root=pathlib.Path(path)
            folder=self._write(root,'natural_reference',good_trace())
            (folder/'REC1.json').unlink()
            report=analyze_root(root)
            self.assertEqual(report['runs'][0]['classification'],'INCONCLUSIVE_MISSING_REC1')
            self.assertFalse(report['runs'][0]['gatePassed'])

if __name__=='__main__':unittest.main(verbosity=2)
