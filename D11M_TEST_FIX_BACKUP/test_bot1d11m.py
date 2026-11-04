#!/usr/bin/env python3
"""Offline D11M policy / classifier / installer checks. No browser required."""
from __future__ import annotations
import collections,importlib.util,pathlib,subprocess,sys,tempfile,unittest
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))
from bot1d11m_policy import ARMS,OBSERVERS,BRAKE,route,schedule
import analyze_bot1d11m as a


def fake_prior(attached=None,brush=None,reach=None,seal=None):
    return {'captureValid':True,'geometryClassification':'NO_ATTACHMENT_OBSERVED' if attached is None else 'NO_GEOMETRY_OFFSET_WARNING_OBSERVED',
        'geometryGatePassed':attached is not None,'maxAnchorToCarriedMesh':.06 if attached is not None else None,
        'earlySoloPressurePeels':[],
        'firstMilestonesMs':{'eligibleSampled':100,'brushOwner':brush,'reachOwner':reach,
           'sealOwner':seal,'supportOwner':attached,'attachedOwner':attached},
        'release':{'deliberateOwnerTransition':False,'freeAfterDeliberateTransition':False}}


def sample(ms,distance=None,eligible=True,frame=1):
    return {'ms':ms,'frame':frame,'player':{'x':0,'y':0,'z':-.2},
      'shelf':{'center':{'x':0,'y':-.75,'z':-2.65}},
      'surface':{'eligible':eligible and distance is not None,
        'surfaceId':'SILT_ENTRY_SEDIMENT_SHELF_D11B' if distance is not None else 'none',
        'distance':distance},
      'continuity':{'revision':'BOT1-D11F-1'}}


def trace(obs='observer_on',distances=(.6,.42,.38),start=200,release=600):
    samples=[sample(100,None,False,1)]+[sample(200+i*100,d,True,2+i) for i,d in enumerate(distances)]
    return {'samples':samples,
      'interventions':[{'label':'start:approach_1','ms':start},
          {'label':'start:away_vertical','ms':release},
          {'label':'release_observer_off' if obs=='observer_off' else 'release_observer_on','ms':0}],
      'firstFootholdEvents':{'revision':'BOT1-D11I-1','hooked':True,'droppedEvents':0,
                            'events':[{'ms':0,'type':'probe_reset'}]},
      'releaseGate':{'revision':'BOT1-D11L-1','hooked':True,'droppedFrames':0,
                     'frames':[] if obs=='observer_off' else [{'ms':100,'ownerAwayIntent':0}]},
      'firstFoothold':{'samples':[{'ms':200}]}}


def run(obs='observer_on'):
    return {'revision':'BOT1-D11M-1','status':'CAPTURED','errors':[],
        'profile':'natural_brake','round':1,'arm':'baseline','observer':obs,
        'ownerDataUsedForSteering':False,'controlledDebugStart':False,
        'rec1':{'events':25,'droppedDetails':0},'actions':[]}


class Policies(unittest.TestCase):
    def test_pairs_and_controls(self):
        for n in (1,3,7):
            s=schedule(n)
            self.assertEqual(len(s),6+4*n)
            self.assertEqual(len(set(s)),len(s))
            self.assertEqual(len([r for r in s if r[1]==BRAKE]),4*n)
            for mode in OBSERVERS:
                for arm in ARMS:
                    self.assertEqual(sum(r[1]==BRAKE and r[2]==arm and r[3]==mode for r in s),n)
    def test_freeze_route(self):
        b=route(BRAKE,'baseline');n=route(BRAKE,'neutral_counter')
        self.assertEqual([a[2] for a in b],[a[2] for a in n])
        delta=[(l[0],r[0],l[1],r[1]) for l,r in zip(b,n) if l!=r]
        self.assertEqual(delta,[('counter_momentum','counter_momentum_neutral_control','s',None)])
        self.assertEqual(sum(x[2] for x in b),sum(x[2] for x in n))
    def test_no_invalid_arm(self):
        with self.assertRaises(ValueError):route('host_positive','neutral_counter')
        with self.assertRaises(ValueError):schedule(0)
    def test_order_alternation(self):
        s=schedule(2)
        r1=[x for x in s if x[0]==1 and x[1]==BRAKE]
        r2=[x for x in s if x[0]==2 and x[1]==BRAKE]
        self.assertEqual((r1[0][2],r1[0][3]),('baseline','observer_on'))
        self.assertEqual((r2[0][2],r2[0][3]),('neutral_counter','observer_off'))

class Classification(unittest.TestCase):
    def check(self,tr,prior,observer='observer_on'):
        with patch.object(a,'d11k_summarize',return_value=prior):
            return a.summarize_run(tr,run(observer))
    def test_in_envelope_no_brush(self):
        res=self.check(trace(),fake_prior())
        self.assertEqual(res['acquisitionClass'],'IN_BRUSH_ENVELOPE_NO_BRUSH')
        self.assertTrue(res['captureValid'])
        self.assertEqual(res['acquisitionEnvelope']['envelopeSampleCountBeforeRelease'],2)
        self.assertEqual(res['acquisitionEnvelope']['sampledConsecutiveEnvelopeSpanMs'],100)
    def test_observer_off_valid(self):
        res=self.check(trace('observer_off'),fake_prior(attached=480,brush=300,reach=310,seal=450),'observer_off')
        self.assertTrue(res['captureValid'])
        self.assertEqual(res['recordedReleaseOwnerFrames'],0)
        self.assertTrue(res['acquiredBeforeRelease'])
    def test_off_with_unexpected_frames_invalid(self):
        tr=trace('observer_off');tr['releaseGate']['frames']=[{'ms':100}]
        self.assertFalse(self.check(tr,fake_prior(),'observer_off')['captureValid'])
    def test_on_without_frames_invalid(self):
        tr=trace();tr['releaseGate']['frames']=[]
        self.assertFalse(self.check(tr,fake_prior())['captureValid'])
    def test_late_reach_separate(self):
        res=self.check(trace(),fake_prior(brush=610,reach=615))
        self.assertEqual(res['acquisitionClass'],'REACH_WITHOUT_SEAL')
        self.assertTrue(res['lateReachAfterReleaseStart'])
        self.assertFalse(res['acquiredBeforeRelease'])
    def test_outside_gate(self):
        res=self.check(trace(distances=(.58,.51,.50)),fake_prior())
        self.assertEqual(res['acquisitionClass'],'ELIGIBLE_OUTSIDE_BRUSH_ENVELOPE')
        self.assertEqual(res['acquisitionEnvelope']['minEligibleDistanceBeforeRelease'],.5)
    def test_no_eligible_distinct_from_geometry_pass(self):
        res=self.check(trace(distances=(None,None)),fake_prior())
        self.assertEqual(res['acquisitionClass'],'NO_ELIGIBLE_SHELF_OBSERVED')
        self.assertEqual(res['geometryClassification'],'NO_ATTACHMENT_OBSERVED')
        self.assertFalse(res['geometryGatePassed'])
    def test_no_false_timing_continuity_across_gap(self):
        tr=trace(distances=(.4,.4,.4),release=1000);tr['samples'][2]['ms']=550;tr['samples'][3]['ms']=900
        res=self.check(tr,fake_prior())
        self.assertEqual(res['acquisitionEnvelope']['sampledConsecutiveEnvelopeSpanMs'],0)
    def test_reach_seal_support_classes(self):
        for prior,cls in ((fake_prior(brush=100,reach=110),'REACH_WITHOUT_SEAL'),
                          (fake_prior(brush=100,reach=110,seal=120),'SEALED_WITHOUT_SUPPORT'),
                          (fake_prior(attached=150,brush=100,reach=110,seal=120),'ATTACHED')):
            self.assertEqual(self.check(trace(),prior)['acquisitionClass'],cls)
    def test_median_and_elapsed(self):
        self.assertEqual(a.med([1,3,5]),3)
        self.assertEqual(a.quant([0,10],.9),9)
        self.assertEqual(a.elapsed_ms('2026-11-03T01:00:00+00:00','2026-11-03T01:00:01+00:00'),1000)

class Installer(unittest.TestCase):
    def test_transform_lf_and_crlf(self):
        spec=importlib.util.spec_from_file_location('D11M_APPLY',ROOT/'D11M_APPLY.py')
        mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
        base=('import { installBOT1D11LReleaseGateRecorder } from "./BOT1D11LReleaseGateRecorder.js";\n'
          '  const d11l = installBOT1D11LReleaseGateRecorder(runtime);\n'
          '    controlledStart: placeAboveSiltShelf,\n'
          '      releaseGate: d11l.dump(), exportedAt: new Date().toISOString(),\n')
        for eol in ('\n','\r\n'):
            raw=base.replace('\n',eol).encode()
            change=mod.transform(raw)
            self.assertIn(b'disableD11LReleaseRecorder()',change)
            self.assertEqual(change.count(eol.encode()),raw.count(eol.encode())+1)
            with self.assertRaises(ValueError):mod.transform(change)
    def test_installer_apply_idempotent_undo_drift(self):
        source=('  const d11l = installBOT1D11LReleaseGateRecorder(runtime);\n'
          '    controlledStart: placeAboveSiltShelf,\n'
          '      releaseGate: d11l.dump(), exportedAt: new Date().toISOString(),\n')
        with tempfile.TemporaryDirectory() as d:
            root=pathlib.Path(d);p=root/'src/debug/BOT1D11CDiagnosticProbe.js';p.parent.mkdir(parents=True)
            p.write_text(source,encoding='utf-8');(root/'D11M_APPLY.py').write_bytes((ROOT/'D11M_APPLY.py').read_bytes())
            def cmd(flag):
                return subprocess.run([sys.executable,'D11M_APPLY.py',flag],cwd=root,capture_output=True,text=True)
            self.assertEqual(cmd('--check').returncode,0)
            self.assertEqual(cmd('--apply').returncode,0)
            patched=p.read_bytes();self.assertNotEqual(patched,source.encode())
            self.assertEqual(cmd('--apply').returncode,0)
            self.assertEqual(p.read_bytes(),patched)
            self.assertEqual(cmd('--undo').returncode,0)
            self.assertEqual(p.read_bytes(),source.encode())
            self.assertEqual(cmd('--apply').returncode,0)
            p.write_bytes(patched+b'// changed\n')
            self.assertNotEqual(cmd('--undo').returncode,0)

if __name__=='__main__':unittest.main(verbosity=2)
