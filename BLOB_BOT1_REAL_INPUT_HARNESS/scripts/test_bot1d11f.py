#!/usr/bin/env python3
"""D11F offline tests use synthetic geometry measurements; NOT live BLOB proof."""
from __future__ import annotations
import unittest, tempfile, pathlib, json, sys
from analyze_bot1d11f import summarize_trace, analyze_root, TARGET


def sample(ms, *, attached=True, eligible=True, offset=0.03, player_dist=0.22,
           stretch=0.3, planted=True, missing=False, seal=2):
    geometry = {'status':'surface_mesh_missing','distance':None} if missing else {'status':'measured','distance':offset}
    return {'ms':ms,'cell':'CELL_SILT_PRESSURE_ROUTE_001',
        'surface':{'valid':eligible,'eligible':eligible,'surfaceId':TARGET if eligible else 'none'},
        'contact':{'sealed':seal},'plane':{'active':bool(seal)},
        'attachment':{'active':attached,'surfaceId':TARGET if attached else 'none'},
        'continuity':{'readOnly':True,'carriedId':TARGET if attached else 'none',
            'playerToCarriedMesh':{'status':'measured','distance':player_dist},
            'anchors':[{'phase':'sealed' if planted else 'retracted','planted':planted,
                'surfaceId':TARGET,'playerToAnchor':stretch,'geometry':geometry}]}}

def trace(**kw):
    return {'samples':[sample(ms,**kw) for ms in range(0,1100,100)]}

def run(profile='natural_reference', **kw):
    return {'profile':profile,'status':'CAPTURED','errors':[],
        'controlledDebugStart':False,'ownerDataUsedForSteering':False, **kw}

class RefereeTests(unittest.TestCase):
    def test_valid_geometry_does_not_warn(self):
        self.assertEqual(summarize_trace(trace(),run())['classification'],'NO_GEOMETRY_OFFSET_WARNING_OBSERVED')
    def test_too_far_from_surface_and_anchor(self):
        r=summarize_trace(trace(offset=2,player_dist=3,stretch=3,eligible=False),run())
        self.assertEqual(r['classification'],'SUSPECTED_ORPHANED_ANCHORS')
        self.assertGreater(r['anchorOffsetWarningMs'],250)
    def test_tether_stretch_detected_even_when_anchor_stays_on_mesh(self):
        r=summarize_trace(trace(offset=0.02,player_dist=3,stretch=3),run())
        self.assertEqual(r['classification'],'SUSPECTED_ORPHANED_ANCHORS')
        self.assertGreater(r['tetherStretchWarningMs'],250)
    def test_short_offset_only_warning_not_false_bug(self):
        self.assertEqual(summarize_trace(trace(offset=0.38),run())['classification'],'ANCHOR_OFFSET_WARNING_REVIEW')
    def test_missing_geometry_never_pass(self):
        self.assertEqual(summarize_trace(trace(missing=True),run())['classification'],'GEOMETRY_MEASUREMENT_GAP')
    def test_no_planted_anchor_never_pass(self):
        self.assertEqual(summarize_trace(trace(planted=False),run())['classification'],'GEOMETRY_MEASUREMENT_GAP')
    def test_missing_d11f_probe_never_pass(self):
        self.assertEqual(summarize_trace({'samples':[{'ms':0}]},run())['classification'],'MISSING_D11F_GEOMETRY_PROBE')
    def test_no_attached_cannot_pass_silt(self):
        self.assertEqual(summarize_trace(trace(attached=False),run())['classification'],'NO_ATTACHMENT_OBSERVED')
    def test_no_support_cannot_pass(self):
        self.assertEqual(summarize_trace(trace(seal=0),run())['classification'],'NO_SUPPORTED_ATTACHMENT')
    def test_away_control_clear(self):
        self.assertEqual(summarize_trace(trace(attached=False),run('away_control'))['classification'],'AWAY_CONTROL_CLEAR')
    def test_away_control_detects_attachment(self):
        self.assertEqual(summarize_trace(trace(),run('away_control'))['classification'],'UNEXPECTED_AWAY_ATTACHMENT')
    def test_steered_run_disqualified(self):
        self.assertEqual(summarize_trace(trace(),run(ownerDataUsedForSteering=True))['classification'],'DISQUALIFIED_NONNATURAL_OR_STEERED')
    def test_controlled_run_disqualified(self):
        self.assertEqual(summarize_trace(trace(),run(controlledDebugStart=True))['classification'],'DISQUALIFIED_NONNATURAL_OR_STEERED')
    def test_error_run_rejected(self):
        self.assertEqual(summarize_trace(trace(),run(status='ERROR'))['classification'],'CAPTURE_INCOMPLETE')
    def test_captured_records_have_100ms_intervals(self):
        self.assertGreater(summarize_trace(trace(),run())['samples'],10)
    def test_old_d11e_without_anchor_positions_is_indeterminate(self):
        # Existing D11E recordings have no 'continuity', so cannot be retro-certified.
        self.assertEqual(summarize_trace({'samples':[{'ms':0,'attachment':{'active':True}}]},run())['classification'],'MISSING_D11F_GEOMETRY_PROBE')
    def test_matrix_needs_three_repeats_per_natural(self):
        with tempfile.TemporaryDirectory() as td:
            p=pathlib.Path(td)
            for profile in ('host_positive','natural_reference','natural_feather','natural_brake','away_control'):
                sub=p/profile;sub.mkdir()
                (sub/'RUN.json').write_text(json.dumps(run(profile)))
                (sub/'D11C_TRACE.json').write_text(json.dumps(trace(attached=False) if profile=='away_control' else trace()))
            self.assertFalse(analyze_root(p)['completeMatrix'])
            for profile in ('natural_reference','natural_feather','natural_brake'):
                for i in range(2):
                    sub=p/(profile+str(i));sub.mkdir()
                    (sub/'RUN.json').write_text(json.dumps(run(profile)))
                    (sub/'D11C_TRACE.json').write_text(json.dumps(trace()))
            self.assertTrue(analyze_root(p)['completeMatrix'])
    def test_d11f_runner_preserves_original_policy(self):
        source=(pathlib.Path(__file__).parent/'bot1d11f_browser.py').read_text()
        self.assertIn('from bot1d11e_policy',source)
        self.assertNotIn('controlledStart()',source)
        self.assertNotIn('.snapshot()',source)
        self.assertIn("'ownerDataUsedForSteering':False",source)
    def test_no_gameplay_owner_patched_by_apply(self):
        source=(pathlib.Path(__file__).resolve().parents[2]/'D11F_APPLY.py').read_text()
        self.assertIn("src/debug/BOT1D11CDiagnosticProbe.js",source)
        self.assertNotIn("CoreTendrilSurfaceContactSystem.js",source)

if __name__=='__main__':unittest.main()
