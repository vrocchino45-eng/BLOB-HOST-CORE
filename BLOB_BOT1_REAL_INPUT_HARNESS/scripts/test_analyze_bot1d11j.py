import json,tempfile,pathlib,unittest
from analyze_bot1d11j import classify_events,score

class TestD11JReferee(unittest.TestCase):
 def events(self):
  return [
   {'type':'tendril_phase_transition','from':'reaching','to':'sealed','before':{'index':0},'after':{'index':0,'anchorSurface':'SILT_ENTRY_SEDIMENT_SHELF_D11B'}},
   {'type':'movement_attachment_transition','after':{'state':'attached','reason':'none'}},
   {'type':'tendril_phase_transition','from':'reaching','to':'sealed','before':{'index':1},'after':{'index':1,'anchorSurface':'SILT_ENTRY_SEDIMENT_SHELF_D11B'}},
   {'type':'peel_attempt','ms':500,'before':{'index':0,'phase':'sealed'},'strideDestinationProvided':True},
   {'type':'movement_attachment_transition','after':{'state':'releasing','reason':'deliberate_away_input'}},
   {'type':'movement_attachment_transition','after':{'state':'free','reason':'deliberate_away_input'}}]
 def test_two_support_safe(self):
  r=classify_events(self.events());self.assertEqual(r['soloPressurePeels'],[]);self.assertTrue(r['freeAfterReleaseObserved'])
 def test_solo_press_peel(self):
  e=self.events(); del e[2]
  self.assertEqual(len(classify_events(e)['soloPressurePeels']),1)
 def test_manual_peel_not_wrongly_labeled_pressure(self):
  e=self.events();del e[2];e[2]['strideDestinationProvided']=False
  self.assertEqual(classify_events(e)['soloPressurePeels'],[])
 def test_no_deliberate_release(self):
  e=self.events()[:-2];self.assertFalse(classify_events(e)['deliberateReleaseObserved'])
 def test_missing_geometry_is_incomplete(self):
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d)/'run1';p.mkdir();(p/'RUN.json').write_text(json.dumps({'profile':'natural_reference','round':1,'status':'CAPTURED'}))
   r=score(d);self.assertFalse(r['liveGatePassed']);self.assertEqual(r['runs'][0]['classification'],'INCOMPLETE_EVIDENCE')
 def test_unavailable_event_hook_is_incomplete(self):
  with tempfile.TemporaryDirectory() as d:
   root=pathlib.Path(d);p=root/'run1';p.mkdir();(p/'RUN.json').write_text(json.dumps({'profile':'natural_reference','round':1,'status':'CAPTURED'}))
   (p/'D11C_TRACE.json').write_text(json.dumps({'firstFootholdEvents':{'revision':'BOT1-D11I-1','hooked':False,'events':[]}}))
   (root/'BOT1D11F_AUDIT.json').write_text(json.dumps({'runs':[{'folder':'run1','gatePassed':True}]}))
   self.assertEqual(score(root)['runs'][0]['classification'],'INCOMPLETE_EVIDENCE')
 def test_legacy_d11i_matrix_does_not_pass_d11j(self):
  with tempfile.TemporaryDirectory() as d:
   self.assertFalse(score(d)['matrixComplete'])

if __name__=='__main__':unittest.main()
