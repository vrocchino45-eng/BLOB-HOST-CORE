#!/usr/bin/env python3
"""BOT1-D11A offline policy/referee tests; never launches a browser."""
import copy,datetime,unittest
from bot1d11a_policy import PROFILES,PREFIX,SUFFIX,SWEEP,CONTROL,contract,course,validate_course
from analyze_bot1d11a import referee,compare

def evt(name,sec,cell='CELL_SILT_PRESSURE_ROUTE_001',active=False,pressure=0.0):
    owner={'cellId':cell,'motion':{'position':{'x':sec*0.3,'y':0,'z':0},
       'locomotionMode':'surface_tendril_pull' if active else 'normal','boundaryPressure':pressure,
       'c0e2bActiveVolumeId':'silt_porosity_shelf'},
       'attachment':{'active':active,'state':'attached' if active else 'free',
                     'surfaceId':'surface_1' if active else 'none','peelIntent01':0.4 if active else 0},
       'input':{'moveZ':-1}}
    t=(datetime.datetime(2026,10,31,tzinfo=datetime.timezone.utc)+datetime.timedelta(seconds=sec)).isoformat()
    return {'type':name,'time':t,'owner':owner}

def capture(events,drop=0,status='CAPTURED'):
    return ({'revision':'BOT1-D11A','profile':'release_sweep','status':status,'actions':[],'errors':[]},
            {'events':events,'summary':{'captureRetention':{'droppedDetails':drop}}})

class PolicyTests(unittest.TestCase):
    def test_all_courses_valid(self):
        for p in PROFILES:self.assertEqual(course(p),validate_course(p))
    def test_no_unknown_profile(self):
        with self.assertRaises(ValueError):course('broken')
    def test_sweep_prefix_matches(self):
        self.assertEqual(course('release_sweep')[:len(PREFIX)],course('release_control')[:len(PREFIX)])
    def test_sweep_suffix_matches(self):
        self.assertEqual(course('release_sweep')[-len(SUFFIX):],course('release_control')[-len(SUFFIX):])
    def test_equal_intervention_budget(self):
        self.assertEqual(sum(x[2] for x in SWEEP),sum(x[2] for x in CONTROL))
    def test_no_owner_data_online(self):self.assertFalse(contract()['ownerStateForLiveControl'])
    def test_world_seed_not_claimed(self):self.assertFalse(contract()['attachmentGuaranteed'])
    def test_silt_debug_key(self):self.assertEqual(contract()['testEntry'],'Shift+6 existing HC027G1 debug platform')

class RefereeTests(unittest.TestCase):
    def test_no_attachment_not_success(self):
        a,b=capture([evt('c0d4-mob1-movement-sample',1),evt('c0d4-mob1-movement-sample',2)])
        r=referee(a,b);self.assertEqual(r['verdict'],'SILT_DIAGNOSTIC_CAPTURED')
        self.assertEqual(r['attachmentVerdict'],'NOT_EXERCISED_NO_ATTACHMENT_OBSERVED')
    def test_release_sequence_detected(self):
        a,b=capture([evt('c0d4-mob1-movement-sample',1),evt('c0d4-mob1-movement-sample',2,active=True),
                     evt('c0d4-mob1-movement-sample',3,active=False)])
        r=referee(a,b);self.assertEqual(r['attachmentTransitions'],['attach','detach'])
    def test_attached_no_release(self):
        a,b=capture([evt('c0d4-mob1-movement-sample',1,active=True),evt('c0d4-mob1-movement-sample',2,active=True)])
        self.assertEqual(referee(a,b)['attachmentVerdict'],'ATTACHMENT_OBSERVED_NO_RELEASE_TRANSITION')
    def test_entry_unverified(self):
        a,b=capture([evt('c0d4-mob1-movement-sample',1,cell='CELL_MEMBRANE_NURSERY_001')])
        self.assertEqual(referee(a,b)['verdict'],'SILT_ENTRY_UNVERIFIED')
    def test_capture_drop_invalid(self):
        a,b=capture([evt('c0d4-mob1-movement-sample',1)],drop=1)
        self.assertEqual(referee(a,b)['verdict'],'CAPTURE_INCOMPLETE')
    def test_neutral_only_insufficient(self):
        a,b=capture([evt('g1d9s-neutral-movement-observation',1)])
        self.assertEqual(referee(a,b)['verdict'],'INSUFFICIENT_MOTION_OBSERVATION')
    def test_silt_boundary_pressure(self):
        a,b=capture([evt('c0d4-mob1-movement-sample',1,pressure=.17)])
        self.assertEqual(referee(a,b)['maxBoundaryPressure'],.17)
    def test_a_b_absent(self):self.assertEqual(compare(None,None)['verdict'],'A_B_INCOMPLETE')
    def test_a_b_no_attachment(self):
        a,b=capture([evt('c0d4-mob1-movement-sample',1)])
        r=referee(a,b);self.assertEqual(compare(r,r)['verdict'],'NO_ATTACHMENT_IN_EITHER_ARM')
    def test_a_b_cannot_claim_causation(self):
        a,b=capture([evt('c0d4-mob1-movement-sample',1,active=True)])
        r=referee(a,b);self.assertEqual(compare(r,r)['verdict'],'DESCRIPTIVE_AB_ONLY_NO_CAUSAL_CLAIM')

if __name__=='__main__':unittest.main(verbosity=1)
