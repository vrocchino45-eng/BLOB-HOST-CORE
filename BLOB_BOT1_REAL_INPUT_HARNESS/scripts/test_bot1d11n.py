#!/usr/bin/env python3
"""D11N offline tests: probe installer safety, canonical receipts, scorer reuse."""
from __future__ import annotations
import copy,importlib.util,json,pathlib,subprocess,sys,tempfile,unittest
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))
import analyze_bot1d11n as a
from bot1d11m_policy import schedule

class StartTests(unittest.TestCase):
    def receipt(self, camera=[0,0,0,1]):
        return {'kind':'controlled_preapproach_start_d11n',
                'position':copy.deepcopy(a.ORIGIN),'expectedPosition':copy.deepcopy(a.ORIGIN),
                'cell':'CELL_SILT_PRESSURE_ROUTE_001','shelfDistanceFromOrigin':2.61,
                'momentumReset':True,'preExistingContact':False,'ownerDataUsedForSteering':False,
                'cameraHeadingForced':False,'cameraQuaternion':camera,'shelfCenter':{'x':-.18,'y':-.75,'z':-2.65}}
    def test_valid_start(self):
        receipt=self.receipt();run={'profile':'natural_brake','controlledDebugStart':True,'controlledStartReceipt':receipt}
        self.assertTrue(a.check_start(run,{'interventions':[receipt]})['valid'])
    def test_missing_or_inaccurate_start_fails(self):
        r=self.receipt();run={'profile':'natural_brake','controlledDebugStart':True,'controlledStartReceipt':r}
        for name,value in [('position',{'x':0,'y':0,'z':0}),('momentumReset',False),
                            ('shelfDistanceFromOrigin',.1),('cameraHeadingForced',True),
                            ('preExistingContact',True)]:
            bad=copy.deepcopy(r);bad[name]=value
            self.assertFalse(a.check_start({**run,'controlledStartReceipt':bad},{'interventions':[bad]})['valid'],name)
    def test_hc_not_teleported(self):
        self.assertTrue(a.check_start({'profile':'host_positive','controlledDebugStart':False,'controlledStartReceipt':None}, {})['valid'])
        self.assertFalse(a.check_start({'profile':'host_positive','controlledDebugStart':True,'controlledStartReceipt':{}}, {})['valid'])
    def test_missing_trace_receipt_fails(self):
        r=self.receipt();self.assertFalse(a.check_start({'profile':'natural_brake','controlledDebugStart':True,'controlledStartReceipt':r}, {'interventions':[]})['valid'])
    def test_quaternion_angle(self):
        self.assertEqual(a.angle_degrees([0,0,0,1],[0,0,0,1]),0.0)
        self.assertAlmostEqual(a.angle_degrees([0,0,0,1],[0,0,1,0]),180)
        self.assertIsNone(a.angle_degrees(None,[0,0,0,1]))
    def test_schedule_unchanged(self):
        self.assertEqual(len(schedule(3)),18)

class ScorerTests(unittest.TestCase):
    def test_prior_scorer_receives_only_revision_adaptation(self):
        receipt=StartTests().receipt()
        run={'revision':a.REVISION,'status':'CAPTURED','errors':[],
             'profile':'natural_brake','controlledDebugStart':True,'controlledStartReceipt':receipt,
             'observer':'observer_on'}
        prior={'captureValid':True,'geometryGatePassed':True,'geometryWarning':False,
             'soleSealedPeelViolations':0,'acquiredBeforeRelease':True,'deliberateRelease':True}
        trace={'interventions':[receipt]}
        with patch.object(a,'d11m_summarize',return_value=prior) as fn:
            scored=a.run_row(run,trace)
            self.assertTrue(scored['testPass'])
            self.assertEqual(fn.call_args[0][1]['revision'],a.PREVIOUS)
            self.assertIs(fn.call_args[0][1]['controlledDebugStart'],False)
            self.assertEqual(run['revision'],a.REVISION)
    def test_unattached_run_cannot_be_geometry_pass(self):
        receipt=StartTests().receipt()
        run={'revision':a.REVISION,'status':'CAPTURED','errors':[],
             'profile':'natural_brake','controlledDebugStart':True,'controlledStartReceipt':receipt}
        prior={'captureValid':True,'geometryGatePassed':False,'geometryWarning':False,
             'soleSealedPeelViolations':0,'acquiredBeforeRelease':False,'deliberateRelease':False}
        with patch.object(a,'d11m_summarize',return_value=prior):
            self.assertFalse(a.run_row(run,{'interventions':[receipt]})['testPass'])

class InstallerTests(unittest.TestCase):
    def fixture(self,eol):
        src=('import * as THREE from "three";\n'
             'export function installBOT1D11CProbe(runtime){\n'
             '  const d11l = installBOT1D11LReleaseGateRecorder(runtime);\n'
             '  function placeAboveSiltShelf() {}\n'
             '  window.__BLOB_D11C_PROBE__ = Object.freeze({\n'
             '    controlledStart: placeAboveSiltShelf,\n'
             '    disableD11LReleaseRecorder() { d11l.stop(); return true; },\n'
             '  });\n}\n')
        return src.replace('\n',eol).encode()
    def import_installer(self):
        spec=importlib.util.spec_from_file_location('D11N_APPLY',ROOT/'D11N_APPLY.py')
        m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
    def test_lf_crlf_patch_and_double_prevention(self):
        m=self.import_installer();fragment=(ROOT/'D11N_PROBE_FRAGMENT.js.txt').read_text('utf-8')
        for eol in ('\n','\r\n'):
            src=self.fixture(eol);patched=m.transform(src,fragment)
            self.assertIn(b'controlledD11NPreApproachStart,',patched)
            self.assertIn(b'new THREE.Vector3(-0.04, -0.07, -0.17)',patched)
            self.assertEqual(patched.count(eol.encode()),src.count(eol.encode())+fragment.count('\n')+1)
            with self.assertRaises(ValueError):m.transform(patched,fragment)
    def test_roundtrip_idempotent_and_drift(self):
        with tempfile.TemporaryDirectory() as td:
            d=pathlib.Path(td);src=d/'src/debug/BOT1D11CDiagnosticProbe.js';src.parent.mkdir(parents=True)
            original=self.fixture('\r\n');src.write_bytes(original)
            (d/'D11N_APPLY.py').write_bytes((ROOT/'D11N_APPLY.py').read_bytes())
            (d/'D11N_PROBE_FRAGMENT.js.txt').write_bytes((ROOT/'D11N_PROBE_FRAGMENT.js.txt').read_bytes())
            def call(mode):return subprocess.run([sys.executable,'D11N_APPLY.py',mode],cwd=d,capture_output=True,text=True)
            self.assertEqual(call('--check').returncode,0)
            self.assertEqual(call('--apply').returncode,0)
            new=src.read_bytes();self.assertNotEqual(new,original)
            self.assertEqual(call('--apply').returncode,0)
            self.assertEqual(src.read_bytes(),new)
            src.write_bytes(new+b'// drift')
            self.assertNotEqual(call('--undo').returncode,0)
            src.write_bytes(new)
            self.assertEqual(call('--undo').returncode,0)
            self.assertEqual(src.read_bytes(),original)

if __name__=='__main__':unittest.main()
