#!/usr/bin/env python3
from __future__ import annotations
import sys,pathlib,unittest
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from guide_signal_lab import GuideSignalInterpreter,SCHEMA,CODEBOOK,demo

def event(kind,t,**extras):return {'schema':SCHEMA,'kind':kind,'observedAtMs':t,'perceivable':True,**extras}
class Tests(unittest.TestCase):
 def test_three_meanings_distinct(self):
  self.assertEqual(len({v['message'] for v in CODEBOOK.values()}),3)
 def test_requires_perception(self):
  g=GuideSignalInterpreter();self.assertIsNone(g.ingest(event('unfamiliar_material_observed',100,materialId='hidden',perceivable=False)))
 def test_support_requires_geometry(self):
  g=GuideSignalInterpreter();self.assertIsNone(g.ingest(event('support_confirmed',300,geometryVerified=False,supportCount=2)))
 def test_support_confirmed(self):
  g=GuideSignalInterpreter();self.assertEqual(g.ingest(event('support_confirmed',500,geometryVerified=True,supportCount=1))['message'],'stable_support')
 def test_repeated_support_not_chatter(self):
  g=GuideSignalInterpreter();e=event('support_confirmed',500,geometryVerified=True,supportCount=1)
  self.assertIsNotNone(g.ingest(e));self.assertIsNone(g.ingest(event('support_confirmed',1700,geometryVerified=True,supportCount=2)))
 def test_loss_requires_prior_support(self):
  g=GuideSignalInterpreter();self.assertIsNone(g.ingest(event('support_lost_unexpected',1200,intentionalRelease=False)))
 def test_voluntary_release_not_panic(self):
  g=GuideSignalInterpreter();g.ingest(event('support_confirmed',1000,geometryVerified=True,supportCount=2))
  self.assertIsNone(g.ingest(event('support_lost_unexpected',2000,intentionalRelease=True)))
  self.assertFalse(g.support_active)
 def test_real_loss_emits_concern(self):
  g=GuideSignalInterpreter();g.ingest(event('support_confirmed',1000,geometryVerified=True,supportCount=2))
  self.assertEqual(g.ingest(event('support_lost_unexpected',2000,intentionalRelease=False))['message'],'concern_contact_lost')
 def test_material_not_duplicate(self):
  g=GuideSignalInterpreter();self.assertIsNotNone(g.ingest(event('unfamiliar_material_observed',1000,materialId='A')))
  self.assertIsNone(g.ingest(event('unfamiliar_material_observed',5000,materialId='A')))
 def test_rhythm_mirrored_audio_light(self):
  g=GuideSignalInterpreter();o=g.ingest(event('unfamiliar_material_observed',1000,materialId='A'))
  self.assertEqual(o['channels']['audio']['rhythmUnits'],o['channels']['light']['rhythmUnits'])
 def test_no_physics_authority(self):
  self.assertTrue(all(s['ownerAuthority']=='read_only_expression_no_movement_or_physics_control' for s in demo()['signals']))
 def test_demo_suppresses_deliberate_release(self):
  self.assertEqual(demo()['signalsProduced'],4)
 def test_invalid_schema_rejected(self):
  g=GuideSignalInterpreter();self.assertIsNone(g.ingest({'schema':'wrong',**event('unfamiliar_material_observed',100,materialId='x'),'schema':'wrong'}))
if __name__=='__main__':unittest.main()
