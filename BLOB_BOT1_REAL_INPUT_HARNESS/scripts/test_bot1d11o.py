#!/usr/bin/env python3
"""Pure tests for D11O, no browser required."""
from __future__ import annotations
import copy,sys,pathlib,unittest
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from bot1d11o_policy import schedule,approach,control_route,RELEASES
from bot1d11o_browser import evaluate_precondition,precondition_sample
from analyze_bot1d11o import classify_release,run_row,normal_class
TARGET='SILT_ENTRY_SEDIMENT_SHELF_D11B'

def good_sample(ms):
 return {'ms':ms,'cell':'CELL_SILT_PRESSURE_ROUTE_001','attachment':{'active':True},
  'plane':{'active':True,'supportCount':2,'surfaceId':TARGET,'normal':{'x':.1,'y':.62,'z':.7}},
  'continuity':{'carriedId':TARGET,'measuredCount':2,'anchorsBeyond035':0,
   'unmeasurablePlanted':0,'maxPlantedAnchorToMesh':.07}}
class D11OTests(unittest.TestCase):
 def test_normal_regime_is_observed_not_inferred_from_context(self):
  self.assertEqual(normal_class({'y':.95}),'NEAR_VERTICAL_NORMAL')
  self.assertEqual(normal_class({'y':.49}),'TILTED_NORMAL')
  self.assertEqual(normal_class(None),'UNKNOWN')
 def test_schedule(self):
  plan=schedule(2);self.assertEqual(len(plan),16)
  self.assertEqual(len(set(plan)),16)
  self.assertEqual(sum(p=='natural_brake' for r,p,c,k in plan),12)
  self.assertEqual(len(schedule(1)),10)
 def test_invalid_schedule(self):
  for n in (0,6,'3'):
   with self.assertRaises(ValueError):schedule(n)
 def test_release_keys_fixed(self):
  self.assertEqual(set(RELEASES),{'up_c','up_left_ca','up_right_cd'})
  self.assertEqual(RELEASES['up_c'],('c',))
 def test_preapproach_no_release(self):
  for c in ('tangential','neutral_dwell'):
   path=approach(c)
   self.assertNotIn('away_vertical',[a[0] for a in path]);self.assertEqual(path[-1][0],'post_tangent')
  self.assertEqual(sum(x[2] for x in approach('tangential')),sum(x[2] for x in approach('neutral_dwell')))
  self.assertEqual(approach('neutral_dwell')[-2][1],None)
 def test_controls_unchanged(self):
  self.assertTrue(any(x[0]=='away_vertical' for x in control_route('natural_feather')))
 def test_precondition_rejects_zero_geometry(self):
  s=good_sample(600);s['continuity']['measuredCount']=0
  self.assertFalse(precondition_sample(s))
 def test_precondition_rejects_orphan(self):
  s=good_sample(600);s['continuity']['anchorsBeyond035']=1
  self.assertFalse(precondition_sample(s))
 def test_precondition_rejects_wrong_surface(self):
  s=good_sample(600);s['plane']['surfaceId']='OTHER'
  self.assertFalse(precondition_sample(s))
 def test_precondition_valid(self):
  d={'samples':[good_sample(x) for x in (200,300,430,560)]}
  self.assertTrue(evaluate_precondition(d)['valid'])
 def test_precondition_rejects_last_unattached(self):
  ss=[good_sample(x) for x in (200,300,430,560)]
  ss[-1]['attachment']['active']=False
  self.assertFalse(evaluate_precondition({'samples':ss})['valid'])
 def test_release_owner_events(self):
  tr={'interventions':[{'label':'start:away_vertical','ms':700},{'label':'end:away_vertical','ms':1800}],
     'firstFootholdEvents':{'events':[{'type':'movement_attachment_transition','ms':920,
        'after':{'reason':'deliberate_away_input','state':'free'}}]},
     'releaseGate':{'coverage':{'modelVerified':True},'frames':[{'ms':850,'preActive':True,
      'ownerAwayIntent':.8,'modeledReleaseThreshold':.55,'candidateNormals':{'owner':{'y':.6}}}]},
     'samples':[good_sample(800)]}
  out=classify_release(tr,{'precondition':{'valid':True},'releaseAttempted':True},{'geometryGatePassed':True})
  self.assertTrue(out['actualDeliberateRelease']);self.assertEqual(out['class'],'DELIVERED_DELIBERATE_RELEASE')
 def test_unattached_release_not_scored(self):
  self.assertEqual(classify_release({}, {'precondition':{'valid':False}}, {})['class'],'PRECONDITION_NOT_MET')
 def test_missing_release_no_credit(self):
  tr={'interventions':[{'label':'start:away_vertical','ms':700},{'label':'end:away_vertical','ms':1800}],
    'firstFootholdEvents':{'events':[]},'releaseGate':{'coverage':{'modelVerified':True},'frames':[]},'samples':[]}
  out=classify_release(tr,{'precondition':{'valid':True},'releaseAttempted':True},{})
  self.assertFalse(out['actualDeliberateRelease'])
 def test_scorer_cannot_pass_spoofed_precondition_receipt(self):
  # Runner can claim valid, but transcript lacks multiple geometry-backed samples.
  with patch('analyze_bot1d11o.d11n_row',return_value={'captureValid':True,'geometryGatePassed':True,
      'geometryWarning':False,'soleSealedPeelViolations':0}):
   o=run_row({'samples':[good_sample(500)],'interventions':[{'label':'start:away_vertical','ms':700},
      {'label':'end:away_vertical','ms':1500}]},
     {'revision':'BOT1-D11O-1','profile':'natural_brake','releaseAttempted':True,'precondition':{'valid':True}})
   self.assertFalse(o['testPass']);self.assertFalse(o['preconditionVerified'])
if __name__=='__main__':unittest.main()
