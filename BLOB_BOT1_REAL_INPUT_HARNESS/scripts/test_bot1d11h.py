#!/usr/bin/env python3
"""Offline synthetic contract tests for D11H first-foothold referee."""
from __future__ import annotations
import copy, json, pathlib, sys, tempfile, unittest
from analyze_bot1d11h import inspect, analyze, TARGET


def base_sample(ms, attached=False, supported=False, distance=0.12):
    return {'ms':ms,'surface':{'valid':True,'eligible':True,'surfaceId':TARGET},
     'attachment':{'active':attached,'reason':'none'},
     'plane':{'active':supported},'contact':{'sealed':int(supported)},
     'continuity':{'readOnly':True,'carriedId':TARGET if attached else 'none',
       'playerToCarriedMesh':{'status':'measured','distance':distance},
       'anchors':[{'planted':True,'playerToAnchor':0.25,
         'geometry':{'status':'measured','distance':distance}}] if supported else []}}


def hf(ms, stage, eligible=True, reason='none'):
    phases={'eligible':'retracted','brushing':'retracted','reaching':'reaching',
            'sealed':'sealed','supported':'sealed','released':'retracted'}
    p=phases[stage]
    return {'ms':ms,'eligible':eligible,'truth':{'distance':0.3,'reason':'eligible' if eligible else 'out_of_range'},
        'core':{'state':'brushing' if stage!='eligible' else 'suspended','actual':'brushing'},
        'contact':{'ownerPreviousState':'brushing' if stage!='eligible' else 'suspended',
            'supportCount':1 if stage=='supported' else 0},
        'plane':{'active':stage=='supported'},
        'attachment':{'active':stage in ('sealed','supported'),
            'reason':reason},
        'tendrils':[{'phase':p,'reachSurface':TARGET if p=='reaching' else 'none',
           'anchorSurface':TARGET if p=='sealed' else 'none','reachOrigin':'live_authored_surface_truth'}]}


def trace(stages=('eligible','brushing','reaching','sealed','supported','released'),shelf=True,geom=0.12):
    samples=[base_sample(i*100,attached=(i>=3 and i<=4),supported=(i==4),distance=geom) for i in range(6)]
    rows=[hf(i*100,st,eligible=shelf,reason='deliberate_away_input' if st=='released' else 'none') for i,st in enumerate(stages)]
    return {'samples':samples,'firstFoothold':{'revision':'BOT1-D11H-1',
        'ownerDataUsedForSteering':False,'samples':rows}}


def run(profile='natural_reference'):
    return {'profile':profile,'round':1,'status':'CAPTURED','errors':[],
            'ownerDataUsedForSteering':False,'controlledDebugStart':False}

class FirstFootholdTests(unittest.TestCase):
    def test_supported_release(self):
        r=inspect(trace(),run())
        self.assertEqual(r['classification'],'SUPPORTED_GEOMETRICALLY_VALID_RELEASED');self.assertTrue(r['gatePassed'])
    def test_reach_without_seal(self):
        r=inspect(trace(('eligible','brushing','reaching','released')),run())
        self.assertEqual(r['classification'],'REACH_WITHOUT_SEAL')
    def test_seal_without_support(self):
        r=inspect(trace(('eligible','brushing','reaching','sealed','released')),run())
        self.assertEqual(r['classification'],'SEALED_WITHOUT_SUPPORT')
    def test_no_reach(self):
        r=inspect(trace(('eligible','brushing','released')),run())
        self.assertEqual(r['classification'],'BRUSH_WITHOUT_AUTHORED_REACH')
    def test_no_eligibility(self):
        r=inspect(trace(('eligible','brushing','reaching'),shelf=False),run())
        self.assertEqual(r['classification'],'NO_SILT_ELIGIBILITY')
    def test_missing_probe(self):
        t=trace();t.pop('firstFoothold');r=inspect(t,run())
        self.assertEqual(r['classification'],'MISSING_D11H_PROBE')
    def test_wrong_revision(self):
        t=trace();t['firstFoothold']['revision']='wrong';self.assertEqual(inspect(t,run())['classification'],'MISSING_D11H_PROBE')
    def test_missing_field(self):
        t=trace();del t['firstFoothold']['samples'][0]['tendrils']
        self.assertEqual(inspect(t,run())['classification'],'MISSING_D11H_FIELDS')
    def test_non_natural_debug_placement_rejected(self):
        r=run();r['controlledDebugStart']=True
        self.assertEqual(inspect(trace(),r)['classification'],'DISQUALIFIED_STEERED_OR_CONTROLLED')
    def test_hidden_owner_steering_rejected(self):
        r=run();r['ownerDataUsedForSteering']=True
        self.assertEqual(inspect(trace(),r)['classification'],'DISQUALIFIED_STEERED_OR_CONTROLLED')
    def test_geometry_offset_stops_success(self):
        r=inspect(trace(geom=0.6),run())
        self.assertNotEqual(r['classification'],'SUPPORTED_GEOMETRICALLY_VALID_RELEASED')
    def test_missing_release_is_not_pass(self):
        r=inspect(trace(('eligible','brushing','reaching','sealed','supported')),run())
        self.assertFalse(r['gatePassed']);self.assertEqual(r['classification'],'SUPPORTED_WITHOUT_VERIFIED_DELIBERATE_RELEASE')
    def test_control_away(self):
        t=trace();
        for s in t['samples']:s['attachment']['active']=False;s['continuity']['carriedId']='none'
        self.assertTrue(inspect(t,run('away_control'))['gatePassed'])
    def test_missing_runs_not_complete(self):
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d)/'one';p.mkdir()
            (p/'RUN.json').write_text(json.dumps(run()),encoding='utf8')
            (p/'D11C_TRACE.json').write_text(json.dumps(trace()),encoding='utf8')
            a=analyze(d)
            self.assertFalse(a['matrixComplete']);self.assertEqual(a['naturalPasses'],1)
    def test_no_source_edits_in_read_only_helper(self):
        helper=pathlib.Path(__file__).resolve().parents[2]/'src/debug/BOT1D11HFirstFootholdTimeline.js'
        if not helper.exists():self.skipTest('Helper not installed in current project')
        js=helper.read_text(encoding='utf8')
        self.assertNotIn('updateTendrilState(',js)
        self.assertNotIn('beginReach(',js)
        self.assertNotIn('player.position.copy(',js)

if __name__=='__main__':unittest.main(verbosity=2)
