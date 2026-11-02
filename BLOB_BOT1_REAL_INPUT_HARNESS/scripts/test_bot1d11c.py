#!/usr/bin/env python3
"""Dependency-free D11C policy/referee/installer checks, not browser proof."""
from __future__ import annotations
import json,pathlib,shutil,subprocess,sys,tempfile,unittest
from bot1d11c_policy import PROFILES, course, controlled, entry_key
from analyze_bot1d11c import summarize_trace
ROOT=pathlib.Path(__file__).resolve().parents[2]

def sample(**kwargs):
    s={'cell':'CELL_SILT_PRESSURE_ROUTE_001','shelf':{'present':True,'visible':True},
       'capability':{'surfaceIds':['SILT_ENTRY_SEDIMENT_SHELF_D11B']},
       'surface':{'valid':False,'eligible':False,'surfaceId':'none'},
       'contact':{'state':'suspended','truthSurfaceId':'none','sealed':0,'carriedSurfaceId':'none'},
       'plane':{'active':False,'surfaceId':'none'},
       'attachment':{'active':False,'state':'free','surfaceId':'none'},
       'coreContactLanguage':{'state':'suspended'}}
    s.update(kwargs)
    return s

class PolicyTests(unittest.TestCase):
    def test_four_profiles_unique(self):self.assertEqual(len(PROFILES),len(set(PROFILES)))
    def test_natural_does_not_use_debug_pose(self):self.assertFalse(controlled('silt_natural'))
    def test_controlled_flags(self):self.assertTrue(controlled('silt_controlled_peel'))
    def test_host_entry(self):self.assertEqual(entry_key('host_positive'),'Shift+1')
    def test_silt_entry(self):self.assertEqual(entry_key('silt_natural'),'Shift+6')
    def test_valid_courses(self):
        for p in PROFILES:self.assertTrue(course(p))
    def test_invalid(self):
        with self.assertRaises(ValueError):course('unknown')

class RefereeTests(unittest.TestCase):
    def test_no_trace_inconclusive(self):self.assertEqual(summarize_trace({})['classification'],'INCONCLUSIVE_NO_PROBE')
    def test_visible_not_truth(self):self.assertIn('NOT_RAYCAST',summarize_trace({'samples':[sample()]})['classification'])
    def test_truth_not_eligible(self):
        s=sample(surface={'valid':True,'eligible':False,'surfaceId':'SILT_ENTRY_SEDIMENT_SHELF_D11B'})
        self.assertEqual(summarize_trace({'samples':[s]})['classification'],'SURFACE_TRUTH_OUTSIDE_ELIGIBILITY')
    def test_contact_gate(self):
        s=sample(surface={'valid':True,'eligible':True,'surfaceId':'SILT_ENTRY_SEDIMENT_SHELF_D11B'})
        self.assertEqual(summarize_trace({'samples':[s]})['classification'],'CONTACT_STATE_GATE_NOT_SATISFIED')
    def test_seal_no_support(self):
        s=sample(contact={'state':'attached','truthSurfaceId':'SILT_ENTRY_SEDIMENT_SHELF_D11B','sealed':2,'carriedSurfaceId':'SILT_ENTRY_SEDIMENT_SHELF_D11B'})
        self.assertEqual(summarize_trace({'samples':[s]})['classification'],'SUPPORT_PLANE_NOT_OBSERVED')
    def test_support_no_attachment(self):
        s=sample(plane={'active':True,'surfaceId':'SILT_ENTRY_SEDIMENT_SHELF_D11B'})
        self.assertEqual(summarize_trace({'samples':[s]})['classification'],'CONTROLLER_HANDOFF_NOT_OBSERVED')
    def test_two_attachments(self):
        s=sample(attachment={'active':True,'state':'attached','surfaceId':'SILT_ENTRY_SEDIMENT_SHELF_D11B'})
        out=summarize_trace({'samples':[s,s]})
        self.assertEqual(out['classification'],'ATTACHMENT_OBSERVED')
        self.assertEqual(out['maxConsecutiveTargetAttachmentSamples'],2)
    def test_single_is_not_sustained(self):
        s=sample(attachment={'active':True,'surfaceId':'SILT_ENTRY_SEDIMENT_SHELF_D11B'})
        self.assertEqual(summarize_trace({'samples':[s]})['classification'],'SINGLE_SAMPLE_ATTACHMENT')

class InstallTests(unittest.TestCase):
    def test_apply_and_undo_without_external_project(self):
        script=ROOT/'D11C_APPLY.py'
        if not script.is_file():self.skipTest('Installer not in project root; package install test available after extraction')
        original='const runtime = {};\nruntime.start().catch((error) => {\nconsole.log(error);\n});\n'
        with tempfile.TemporaryDirectory() as tmp:
            p=pathlib.Path(tmp)
            (p/'src/debug').mkdir(parents=True)
            (p/'src/main.js').write_text(original,encoding='utf-8')
            shutil.copy2(script,p/'D11C_APPLY.py')
            shutil.copy2(ROOT/'src/debug/BOT1D11CDiagnosticProbe.js',p/'src/debug/BOT1D11CDiagnosticProbe.js')
            for arg in ('--check','--apply','--undo'):
                result=subprocess.run([sys.executable,str(p/'D11C_APPLY.py'),arg],capture_output=True,text=True)
                self.assertEqual(result.returncode,0,result.stderr)
            self.assertEqual((p/'src/main.js').read_text(encoding='utf-8'),original)

if __name__=='__main__':unittest.main(verbosity=2)
