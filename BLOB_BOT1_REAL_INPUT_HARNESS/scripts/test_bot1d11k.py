#!/usr/bin/env python3
"""Pure test-harness regression for D11K; does not start Vite or touch gameplay."""
from __future__ import annotations
import pathlib, sys, unittest
from unittest.mock import patch
from bot1d11e_policy import course
from bot1d11k_policy import route, schedule, REVISION, ARMS
from analyze_bot1d11k import summarize, TARGET


def fixture(attached=True, release=True, dropped=0):
    def sample(ms, active=False):
        return {'ms':ms,'continuity':{},'contact':{'sealed':int(active)},
                'surface':{'eligible':True,'surfaceId':TARGET},
                'plane':{'active':active,'normal':{'x':0,'y':0.7,'z':0.7}},
                'attachment':{'active':active,'peelIntent':0.45 if active else 0,'releaseArmed':False}}
    events=[{'ms':120,'type':'embodiment_contact_transition','to':'brushing'},
            {'ms':125,'type':'reach_attempt','outcome':'began_reaching'},
            {'ms':140,'type':'tendril_phase_transition','to':'sealed','after':{'index':0,'anchorSurface':TARGET}},
            {'ms':150,'type':'support_plane_transition','after':{'active':True,'surfaceId':TARGET}}]
    if attached:
        events.append({'ms':175,'type':'movement_attachment_transition','after':{'state':'attached','active':True}})
    if release:
        events.extend([{'ms':260,'type':'movement_attachment_transition',
                        'after':{'state':'releasing','active':False,'reason':'deliberate_away_input'}},
                       {'ms':270,'type':'movement_attachment_transition',
                        'after':{'state':'free','active':False,'reason':'deliberate_away_input'}}])
    tr={'samples':[sample(100),sample(190,attached),sample(230,attached),sample(300)],
        'interventions':[{'label':'start:away_vertical','ms':220},
                         {'label':'end:away_vertical','ms':290}],
        'firstFootholdEvents':{'revision':'BOT1-D11I-1','hooked':True,
                              'droppedEvents':dropped,'events':events},
        'firstFoothold':{'samples':[{'ms':120}]}}
    run={'status':'CAPTURED','profile':'natural_brake','round':1,'arm':'baseline',
         'ownerDataUsedForSteering':False,'controlledDebugStart':False,'errors':[]}
    return tr,run


class TestRoutes(unittest.TestCase):
    def test_frozen_unchanged(self):
        for profile in ('host_positive','away_control','natural_reference','natural_feather','natural_brake'):
            self.assertEqual(route(profile),course(profile))

    def test_no_counter_duration_matched(self):
        base=route('natural_brake'); alt=route('natural_brake','brake_no_counter')
        self.assertEqual(len(base),len(alt))
        self.assertEqual(sum(x[2] for x in base),sum(x[2] for x in alt))
        self.assertEqual(base[2],('counter_momentum','s',0.16))
        self.assertEqual(alt[2],('counter_momentum_neutral_control',None,0.16))
        self.assertEqual([x for i,x in enumerate(base) if i!=2],
                         [x for i,x in enumerate(alt) if i!=2])

    def test_release_fixed_axis_only(self):
        base=route('natural_brake')
        for arm,key,duration in [('release_c_extended','c',1.75),('release_forward_w','w',1.15),
                                 ('release_backward_s','s',1.15)]:
            new=route('natural_brake',arm)
            positions=[i for i,x in enumerate(base) if x[0]=='away_vertical']
            self.assertEqual(len(positions),1)
            index=positions[0]
            self.assertEqual(new[index],('away_vertical',key,duration))
            self.assertEqual(new[:index],base[:index]);self.assertEqual(new[index+1:],base[index+1:])

    def test_schedule_balanced_controls_once(self):
        s=schedule(2)
        self.assertEqual(len(s),16)
        self.assertEqual(s[:2],((1,'host_positive','baseline'),(1,'away_control','baseline')))
        for arm in ARMS:
            self.assertEqual(sum(p=='natural_brake' and a==arm for _,p,a in s),2)
        self.assertEqual(sum(p=='natural_reference' for _,p,_ in s),2)
        self.assertEqual(sum(p=='natural_feather' for _,p,_ in s),2)
        self.assertEqual(len(schedule(1)),9);self.assertEqual(len(schedule(3)),23)
        with self.assertRaises(ValueError):schedule(4)
        with self.assertRaises(ValueError):route('natural_reference','release_forward_w')


class TestReferee(unittest.TestCase):
    @staticmethod
    def score(attached=True,release=True,dropped=0):
        tr,run=fixture(attached,release,dropped)
        fake={'classification':'NO_GEOMETRY_OFFSET_WARNING_OBSERVED','gatePassed':True,
              'maxAnchorToCarriedMesh':0.03,'supportedAttachmentSamples':2}
        with patch('analyze_bot1d11k.geometry_summary',return_value=fake):
            return summarize(tr,run)

    def test_success(self):
        row=self.score()
        self.assertTrue(row['captureValid'])
        self.assertEqual(row['interpretation'],'DELIBERATE_RELEASE_AND_FREE_OBSERVED')
        self.assertEqual(row['release']['maxSampledPeelIntent'],0.45)
        self.assertEqual(row['release']['firstActiveSupportNormalDuringInput'],{'x':0,'y':0.7,'z':0.7})

    def test_attached_not_released(self):
        row=self.score(release=False)
        self.assertEqual(row['interpretation'],'ATTACHED_NO_DELIBERATE_RELEASE_OBSERVED')
        self.assertTrue(row['release']['attachedNearInput'])

    def test_not_attached_cannot_infer_release(self):
        row=self.score(attached=False,release=False)
        self.assertEqual(row['interpretation'],'ACQUISITION_NO_ATTACHMENT')
        self.assertFalse(row['release']['attachedNearInput'])

    def test_dropped_events_disqualify(self):
        row=self.score(dropped=2)
        self.assertFalse(row['captureValid'])
        self.assertEqual(row['interpretation'],'INCOMPLETE_OR_UNQUALIFIED_CAPTURE')

    def test_explicit_no_dynamic_owner_steering(self):
        tr,run=fixture()
        run['ownerDataUsedForSteering']=True
        with patch('analyze_bot1d11k.geometry_summary',return_value={'classification':'none','gatePassed':True}):
            row=summarize(tr,run)
        self.assertFalse(row['captureValid'])

if __name__=='__main__':unittest.main(verbosity=2)
