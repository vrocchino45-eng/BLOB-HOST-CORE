#!/usr/bin/env python3
"""Offline D11B tests: policy gates and conservative REC1 interpretations."""
from __future__ import annotations
import datetime, unittest
from bot1d11b_live_policy import PROFILES,course,entry_key,intended_cell,contract,SHELF,SILT,NURSERY
from analyze_bot1d11b_live import referee
BASE=datetime.datetime(2026,11,1,tzinfo=datetime.timezone.utc)

def event(sec,cell,active=False,surface='none'):
    return {'type':'c0d4-mob1-movement-sample',
       'time':(BASE+datetime.timedelta(seconds=sec)).isoformat(),
       'owner':{'cellId':cell,'attachment':{'active':active,'surfaceId':surface},
                'motion':{'position':{'x':-0.18,'y':-0.75,'z':-2.65}}}}

def rec(*events,drop=0):return {'events':list(events),'summary':{'captureRetention':{'droppedDetails':drop}}}
def run(profile):return {'profile':profile,'status':'CAPTURED','errors':[]}
class LivePolicyTests(unittest.TestCase):
    def test_four_unique_profiles(self):self.assertEqual(len(PROFILES),4);self.assertEqual(len(set(PROFILES)),4)
    def test_debug_entry_provenance(self):
        for p in PROFILES:
            self.assertEqual(entry_key(p),'Shift+1' if p=='host_positive' else 'Shift+6')
            self.assertEqual(intended_cell(p),NURSERY if p=='host_positive' else SILT)
    def test_no_unknown_inputs(self):
        for p in PROFILES:
            self.assertTrue(all(key in ('w','s',None) and seconds>0 for _,key,seconds in course(p)))
    def test_no_owner_steering(self):self.assertIs(contract()['ownerStateForLiveSteering'],False)
    def test_silt_latch_release(self):
        data=referee(run('silt_short'),rec(event(0,SILT),event(1,SILT,True,SHELF),event(2,SILT,False)))
        self.assertEqual(data['verdict'],'SAMPLED_TARGET_LATCH_AND_RELEASE')
    def test_silt_latch_no_release(self):
        data=referee(run('silt_short'),rec(event(0,SILT),event(1,SILT,True,SHELF),event(2,SILT,True,SHELF)))
        self.assertEqual(data['verdict'],'SAMPLED_TARGET_LATCH_RELEASE_UNVERIFIED')
    def test_silt_no_latch(self):
        data=referee(run('silt_short'),rec(event(0,SILT),event(1,SILT)))
        self.assertEqual(data['verdict'],'TARGET_LATCH_NOT_OBSERVED_IN_SAMPLES')
    def test_ignore_other_surface(self):
        data=referee(run('silt_short'),rec(event(0,SILT),event(1,SILT,True,'OTHER'),event(2,SILT,False)))
        self.assertEqual(data['verdict'],'TARGET_LATCH_NOT_OBSERVED_IN_SAMPLES')
    def test_host_positive_valid(self):
        data=referee(run('host_positive'),rec(event(0,NURSERY),event(1,NURSERY,True,'HOST_CONTACT_SHELF_SCAR_BRACE'),event(2,NURSERY)))
        self.assertEqual(data['verdict'],'SAMPLED_TARGET_LATCH_AND_RELEASE')
    def test_host_other_surface_not_valid(self):
        data=referee(run('host_positive'),rec(event(0,NURSERY),event(1,NURSERY,True,SHELF)))
        self.assertEqual(data['verdict'],'TARGET_LATCH_NOT_OBSERVED_IN_SAMPLES')
    def test_wrong_cell(self):
        data=referee(run('silt_short'),rec(event(0,NURSERY)))
        self.assertEqual(data['verdict'],'EXPECTED_CELL_UNVERIFIED')
    def test_dropped_details_rejected(self):
        data=referee(run('silt_short'),rec(event(0,SILT),drop=2))
        self.assertEqual(data['verdict'],'CAPTURE_INCOMPLETE')
    def test_failed_run_rejected(self):
        r=run('silt_short');r['status']='ERROR'
        self.assertEqual(referee(r,rec(event(0,SILT)))['verdict'],'CAPTURE_INCOMPLETE')
    def test_preexisting_active_not_certified_transition(self):
        data=referee(run('silt_short'),rec(event(0,SILT,True,SHELF),event(1,SILT,False)))
        self.assertEqual(data['verdict'],'TARGET_ATTACHMENT_OBSERVED_ENTRY_UNVERIFIED')
    def test_silt_center_distance_diagnostic_only(self):
        data=referee(run('silt_short'),rec(event(0,SILT)))
        self.assertEqual(data['nearestPlayerToSiltShelfCenter'],0.0)
        self.assertEqual(data['verdict'],'TARGET_LATCH_NOT_OBSERVED_IN_SAMPLES')
if __name__=='__main__':unittest.main(verbosity=2)
