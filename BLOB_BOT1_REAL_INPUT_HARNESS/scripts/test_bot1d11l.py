#!/usr/bin/env python3
"""Offline D11L diagnostic referee & pack regression; no gameplay patches."""
import pathlib,sys,unittest
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from analyze_bot1d11l import classified
from bot1d11k_policy import schedule,route


def prior(attached=True,released=False,valid=True,profile='natural_brake'):
    return {'captureValid':valid,'profile':profile,'firstMilestonesMs':{'attachedOwner':130 if attached else None},
            'release':{'deliberateOwnerTransition':released,'freeAfterDeliberateTransition':released}}

def trace():
    return {'interventions':[{'label':'start:away_vertical','ms':200},{'label':'end:away_vertical','ms':600}]}

def frame(ms,away,hold,active=True,threshold=.55,holdThreshold=.13):
    return {'ms':ms,'preActive':active,'postActive':active,'ownerAwayIntent':away,
      'ownerPeelHoldAge':hold,'modeledReleaseThreshold':threshold,
      'modeledHoldThreshold':holdThreshold,'modeledAwayGateMet':away>=threshold,
      'modeledHoldGateMet':hold>=holdThreshold,'ownerReleaseArmed':False}

def gate(frames,verified=True,dropped=0):
    return {'revision':'BOT1-D11L-1','hooked':True,'droppedFrames':dropped,
            'coverage':{'modelVerified':verified},'frames':frames}

class Referee(unittest.TestCase):
    def test_release_proven(self):
        r=classified(gate([frame(230,.89,.16)]),trace(),prior(released=True))
        self.assertEqual(r['classification'],'DELIBERATE_RELEASE_CONFIRMED')
    def test_acquisition_separate(self):
        r=classified(gate([frame(230,0,0,False)]),trace(),prior(attached=False))
        self.assertEqual(r['classification'],'ACQUISITION_NOT_ATTACHED')
    def test_fixed_axis_below_gate(self):
        r=classified(gate([frame(230,.32,.3)]),trace(),prior())
        self.assertEqual(r['classification'],'OUTWARD_INTENT_BELOW_MODELED_THRESHOLD')
    def test_hold_gate(self):
        r=classified(gate([frame(230,.6,.03)]),trace(),prior())
        self.assertEqual(r['classification'],'HOLD_AGE_BELOW_MODELED_THRESHOLD')
    def test_simultaneous_gate_disagreement(self):
        r=classified(gate([frame(230,.8,.2)]),trace(),prior())
        self.assertEqual(r['classification'],'MODELED_GATES_MET_OWNER_DISAGREEMENT')
    def test_do_not_infer_unverified_owner(self):
        r=classified(gate([frame(230,.3,.0)],verified=False),trace(),prior())
        self.assertEqual(r['classification'],'OWNER_RELEASE_MODEL_NOT_VERIFIED')
        self.assertIsNone(r['modeledAwayGateReached'])
    def test_overflow_invalid(self):
        r=classified(gate([frame(230,.8,.2)],dropped=1),trace(),prior())
        self.assertEqual(r['classification'],'INCOMPLETE_OWNER_GATE_CAPTURE')
    def test_still_use_d11k_frozen_routes(self):
        self.assertEqual(len(schedule(2)),16)
        self.assertEqual(route('natural_brake','release_c_extended')[-1],route('natural_brake','release_c_extended')[-1])
    def test_controls_not_scored_as_release(self):
        r=classified(gate([frame(230,.8,.2)]),trace(),prior(profile='away_control'))
        self.assertEqual(r['classification'],'CONTROL_ONLY')

if __name__=='__main__':unittest.main(verbosity=2)
