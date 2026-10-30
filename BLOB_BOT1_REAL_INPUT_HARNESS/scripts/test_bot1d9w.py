#!/usr/bin/env python3
"""G1-D9W offline policy and referee tests (not live gameplay acceptance)."""
from __future__ import annotations
import unittest,datetime,json,zipfile,pathlib
from bot1d9w_policy import approach_pulse_hold,acquisition_action,HOLD_SECONDS
from analyze_bot1d9w import evaluate,aggregate,stage3_hold_pair
from test_bot1d9v import make_rec,make_run,t

ANSWER="Let the fold's answer travel through the nursery."
SEARCH="Follow the Watcher's turn toward the Listening Fold."
HOLD="Hold LT to stabilize the resonance. This is not absorption."

class Keyboard:
    def __init__(self,p):self.p=p;self.calls=[]
    def down(self,key):self.calls.append(('down',key))
    def up(self,key):self.calls.append(('up',key))
    def press(self,key):self.calls.append(('press',key));self.p.pulse_count+=1
class DummyPage:
    def __init__(self,answer_after=3,post_pulse_stage='answer'):
        self.steps=0;self.pulse_count=0;self.answer_after=answer_after
        self.post_pulse_stage=post_pulse_stage;self.keyboard=Keyboard(self)
    def wait_for_timeout(self,ms):self.steps+=1
    def hud(self):
        if self.pulse_count and self.post_pulse_stage=='hold':return HOLD
        if self.steps>=self.answer_after:return ANSWER
        return SEARCH

def rec_stage3(stage3=True,owner_stabilize=True,dropped=0):
    r=make_rec(stage2=True,pulse=True)
    if owner_stabilize:r['events'].append({'type':'game-stabilize-started','time':t(2.1)})
    if stage3:r['events'].append({'type':'bot1d-listening-fold-owner-state','time':t(2.9),
                'state':{'stageIndex':3,'stage':'watch_tissue_response','lastInteraction':'resonance_sustained','focusReady':True}})
    r['events'].sort(key=lambda x:x['time']);r['captureActive']=False
    r['summary']['captureRetention']['droppedDetails']=dropped
    return r

def stage_run(hold=True):
    r=make_run(seed=11);r['mode']='stage3'
    r['arrival']['holdActions']=[{'atStart':t(2.05),'atEnd':t(3.55),'key':'q'}] if hold else []
    return r

def acq_rec(accepted=True,invite=True):
    return {'captureActive':False,'events':[
        {'type':'bot1c-watcher-pulse-owner-result','time':t(1),'witness':{'packetPulseReadAccepted':accepted}},
        {'type':'bot1c-watcher-owner-state-change','time':t(2),'state':{'foldInvitation':invite}}],
        'summary':{'captureRetention':{'droppedDetails':0}}}

def acq_run():return {'mode':'acquisition','repeat':3,'seed':13,'status':'CAPTURED','errors':[], 'courseStarted':False}

class OnlinePolicy(unittest.TestCase):
    def test_fixed_course_seed11(self):
        from bot1d3_browser import action_for_step
        for i in [0,4,8,11]:
            self.assertEqual(acquisition_action(i,11,'unknown'),action_for_step('sweep',i,'unknown',None,11,False))
    def test_seed13_reframes(self):self.assertEqual(acquisition_action(3,13,'unknown'),('look','j',.36))
    def test_seed13_changes_position(self):self.assertEqual(acquisition_action(0,13,'unknown'),('move','a',.78))
    def test_seed13_no_blind_pulse_on_no_packet(self):self.assertNotEqual(acquisition_action(4,13,'unknown')[0],'pulse')
    def test_seed13_packet_pulse(self):self.assertEqual(acquisition_action(4,13,'packet_instruction')[0],'pulse')
    def test_pulse_hold_from_visible_cue(self):
        p=DummyPage();r=approach_pulse_hold(p,lambda pg:pg.hud())
        self.assertEqual(len(r['pulseActions']),1)
        self.assertEqual(len(r['holdActions']),1)
        self.assertEqual(p.keyboard.calls.count(('down','q')),1)
        self.assertEqual(p.keyboard.calls.count(('up','q')),1)
        self.assertEqual(p.keyboard.calls.count(('press','x')),1)
        self.assertTrue(r['noOnlineOwnerCertification'])
        self.assertTrue(r['holdActions'][0]['ownerStageUnknownOnline'])
    def test_no_cue_no_pulse_no_hold(self):
        p=DummyPage(answer_after=9999);r=approach_pulse_hold(p,lambda pg:pg.hud())
        self.assertEqual(r['pulseActions'],[]);self.assertEqual(r['holdActions'],[])
        self.assertEqual(p.keyboard.calls[-1],('up','a'))
    def test_hold_allowed_even_with_stale_hud(self):
        p=DummyPage(post_pulse_stage='answer');r=approach_pulse_hold(p,lambda pg:pg.hud())
        self.assertEqual(r['holdActions'][0]['publicPhaseAtStart'],'fold_answer_visible')
    def test_release_held_key_on_finish(self):
        p=DummyPage(post_pulse_stage='hold');approach_pulse_hold(p,lambda pg:pg.hud())
        self.assertIn(('up','q'),p.keyboard.calls)
    def test_no_owner_reads_in_policy_results(self):
        p=DummyPage();r=approach_pulse_hold(p,lambda pg:pg.hud())
        for forbidden in ('focusDistance','packetDistance','ownerState','playerXYZ'):
            self.assertNotIn(forbidden,json.dumps(r))

class Referee(unittest.TestCase):
    def test_pair(self):
        rec=rec_stage3();self.assertTrue(stage3_hold_pair(rec['events'],stage_run(),rec['events'][-1])[0])
    def test_stage3_cert(self):
        r=evaluate(rec_stage3(),stage_run());self.assertTrue(r['certified']);self.assertTrue(r['stage2Certified'])
    def test_no_stage3(self):self.assertFalse(evaluate(rec_stage3(stage3=False),stage_run())['certified'])
    def test_no_owner_stabilize(self):self.assertFalse(evaluate(rec_stage3(owner_stabilize=False),stage_run())['certified'])
    def test_no_online_hold(self):self.assertFalse(evaluate(rec_stage3(),stage_run(hold=False))['certified'])
    def test_no_stage2(self):
        rec=rec_stage3();rec['events']=[e for e in rec['events'] if not (e['type']=='bot1d-listening-fold-owner-state' and e['state']['stageIndex']==2)]
        self.assertFalse(evaluate(rec,stage_run())['certified'])
    def test_dropped(self):self.assertFalse(evaluate(rec_stage3(dropped=2),stage_run())['certified'])
    def test_checkpoint(self):self.assertFalse(evaluate(rec_stage3(),stage_run(),'CHECKPOINT_ONLY')['certified'])
    def test_ended_capture(self):
        r=rec_stage3();r['captureActive']=True
        self.assertFalse(evaluate(r,stage_run())['certified'])
    def test_acquisition_cert(self):self.assertTrue(evaluate(acq_rec(),acq_run())['certified'])
    def test_acquisition_no_read(self):self.assertFalse(evaluate(acq_rec(accepted=False),acq_run())['certified'])
    def test_acquisition_no_invite(self):self.assertFalse(evaluate(acq_rec(invite=False),acq_run())['certified'])
    def test_acquisition_no_rec(self):self.assertFalse(evaluate({},acq_run())['rec1Complete'])
    def test_two_separate_gates(self):
        rows=[evaluate(rec_stage3(),stage_run()),evaluate(rec_stage3(),stage_run()),evaluate(acq_rec(False,False),acq_run())]
        res=aggregate(rows);self.assertEqual(res['stage3']['gate'],'PASS');self.assertEqual(res['acquisition']['gate'],'FAIL')
    def test_incomplete_run(self):
        rows=[evaluate(rec_stage3(),stage_run())]
        self.assertFalse(aggregate(rows)['completeEvidence'])
    def test_stage3_without_stage2_pulse(self):
        rec=rec_stage3();rec['events']=[e for e in rec['events'] if e['type']!='game-pulse-event']
        self.assertFalse(evaluate(rec,stage_run())['certified'])
    def test_no_false_success_from_d9v_real_capture(self):
        file=pathlib.Path('/mnt/data/1BOT1D9V_RESULTS.zip')
        if not file.exists():self.skipTest('Prior D9V evidence not installed')
        with zipfile.ZipFile(file) as z:
            n=next(x for x in z.namelist() if x.endswith('repeat01_s11/REC1.json'))
            rec=json.loads(z.read(n));run=json.loads(z.read(n.replace('REC1.json','RUN.json')))
            run['mode']='stage3'
            row=evaluate(rec,run)
            self.assertTrue(row['ownerStage2']);self.assertFalse(row['certified'])

if __name__=='__main__':unittest.main(verbosity=2)
