#!/usr/bin/env python3
"""Offline tests for BOT1-D9R corrected post-run owner sampling."""
import datetime,json,unittest
from analyze_bot1d9r import match_trial_samples
EPOCH=datetime.datetime(2026,10,29,tzinfo=datetime.timezone.utc)
def iso(s):return (EPOCH+datetime.timedelta(seconds=s)).isoformat()
def sample(s,x,attached=False):return {'t':EPOCH.timestamp()+s,'xyz':(x,0,0),'attachment':attached,'pressure':0.1,'boundary':0.6}
class Tests(unittest.TestCase):
 def test_in_trial_pair(self):
  p={'atStart':iso(2),'atEnd':iso(3.3)}
  v=match_trial_samples(p,[sample(1,100),sample(2.1,1),sample(3.1,3),sample(4,200)])
  self.assertEqual(v['coverage'],'IN_TRIAL_OWNER_PAIR')
  self.assertEqual(v['sampleCount'],2)
  self.assertEqual(v['partialTrialDisplacement'],2)
  self.assertEqual(v['attachmentClass'],'free')
  self.assertEqual(v['sampleIntervalSeconds'],1)
  self.assertEqual(v['deltaXYZ'],(2,0,0))
 def test_look_absence(self):
  p={'atStart':iso(4.2),'atEnd':iso(4.7)}
  v=match_trial_samples(p,[sample(2,4),sample(6,5)])
  self.assertEqual(v['coverage'],'NOT_SAMPLED_IN_TRIAL')
  self.assertEqual(v['sampleCount'],0)
  self.assertNotIn('partialTrialDisplacement',v)
 def test_one_inside(self):
  v=match_trial_samples({'atStart':iso(1),'atEnd':iso(2)},[sample(1.5,2)])
  self.assertEqual(v['coverage'],'ONLY_ONE_IN_TRIAL')
  self.assertNotIn('partialTrialDisplacement',v)
 def test_attachment(self):
  p={'atStart':iso(2),'atEnd':iso(4)}
  aa=match_trial_samples(p,[sample(2.2,0,True),sample(3.8,0.4,True)])
  self.assertEqual(aa['attachmentClass'],'attached')
  mix=match_trial_samples(p,[sample(2.2,0,True),sample(3.8,4,False)])
  self.assertEqual(mix['attachmentClass'],'changed_during_trial')
 def test_invalid_times(self):
  self.assertEqual(match_trial_samples({'atStart':'garbage','atEnd':iso(2)},[])['coverage'],'INVALID_TRIAL_TIME')
  self.assertEqual(match_trial_samples({'atStart':iso(3),'atEnd':iso(2)},[])['coverage'],'INVALID_TRIAL_TIME')
if __name__=='__main__':unittest.main(verbosity=2)
