import unittest
from guide_signal_lab import demo
from gsl1_timeline import compile_timeline
class TestGSL1(unittest.TestCase):
 def test_all_cues_are_expression_only(self):
  x=compile_timeline(demo()['signals']);self.assertEqual(x['status'],'MOCK_CUE_SHEET_ONLY')
  self.assertEqual({c['channel'] for c in x['cues']},{'audio','light','movement_expression'})
 def test_audio_light_same_timing(self):
  x=compile_timeline(demo()['signals'])['cues']
  for a in [c for c in x if c['channel']=='audio']:
   self.assertTrue(any(c['channel']=='light' and c['eventId']==a['eventId'] and c['pulse']==a['pulse'] and c['startMs']==a['startMs'] and c['durationMs']==a['durationMs'] for c in x))
 def test_intentional_release_suppressed(self):
  self.assertEqual(demo()['signalsProduced'],4)
  self.assertNotIn('5',{s['eventId'] for s in demo()['signals']})
if __name__=='__main__':unittest.main()
