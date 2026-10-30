#!/usr/bin/env python3
"""D9V offline policy/referee regression; no live BLOB browser required."""
from __future__ import annotations
import datetime,unittest,json,pathlib
from bot1d9v_policy import public_phase,should_pulse,approach_and_pulse,LEFT_TOTAL_SECONDS,PULSE_LIMIT
from analyze_bot1d9v import evaluate,aggregate,paired_pulse_stage2,first_owner_stage

SEARCH="Follow the Watcher's turn toward the Listening Fold."
ANSWER="Let the fold's answer travel through the nursery."
HOLD="Hold LT to stabilize the resonance."

def t(s):return (datetime.datetime(2026,1,1,tzinfo=datetime.timezone.utc)+datetime.timedelta(seconds=s)).isoformat()

class Keyboard:
    def __init__(self,owner):self.owner=owner;self.calls=[]
    def down(self,k):self.calls.append(('down',k))
    def up(self,k):self.calls.append(('up',k))
    def press(self,k):self.calls.append(('press',k));self.owner.pulsed+=1
class Page:
    def __init__(self,answer_after=1000,progress_on_pulse=False):
        self.n=0;self.pulsed=0;self.answer_after=answer_after;self.progress_on_pulse=progress_on_pulse
        self.keyboard=Keyboard(self)
    def wait_for_timeout(self,ms):self.n+=1
    def hud(self):
        if self.progress_on_pulse and self.pulsed:return HOLD
        return ANSWER if self.n>=self.answer_after else SEARCH

def sample(s,stage=0,approach=True):
    return {'type':'bot1d-listening-fold-owner-state','time':t(s),
      'state':{'stageIndex':stage,'inApproach':approach,'nurseryFoldInvitation':True,'focusReady':True}}

def make_rec(stage2=True,pulse=True):
    events=[sample(.5,0,False),sample(1.5,1)]
    if pulse:events.append({'type':'game-pulse-event','time':t(1.8),'pulseEventId':42})
    if stage2:events.append(sample(2.,2))
    events.extend([
     {'type':'c0d4-mob1-movement-sample','time':t(1.2),'owner':{'motion':{'position':{'x':2,'y':0,'z':0}},'attachment':{'active':False}}},
     {'type':'c0d4-mob1-movement-sample','time':t(2.8),'owner':{'motion':{'position':{'x':-1,'y':0,'z':0}},'attachment':{'active':False}}},
    ])
    return {'captureStartedAt':t(0),'events':sorted(events,key=lambda x:x['time']),
        'summary':{'captureRetention':{'droppedDetails':0}}}

def make_run(seed=11,pulse=True):
    probes=[{'label':'travel_left' if i==9 else 'ambient_center','atStart':t(1),'atEnd':t(4)} for i in range(10)]
    return {'repeat':1,'seed':seed,'status':'CAPTURED','courseStarted':True,'errors':[],
        'probes':probes,'arrival':{'publicVerdict':'PUBLIC_ANSWER_SEEN',
            'pulseActions':[{'at':t(1.82),'key':'x'}] if pulse else [],'corrections':[]}}

class Policy(unittest.TestCase):
    def test_search(self):self.assertEqual(public_phase(SEARCH),'fold_search')
    def test_answer(self):self.assertEqual(public_phase(ANSWER),'fold_answer_visible')
    def test_pulse_instruction(self):self.assertEqual(public_phase('Press X once to pulse-read the fold.'),'fold_answer_visible')
    def test_hold(self):self.assertEqual(public_phase(HOLD),'fold_hold')
    def test_legend_only(self):self.assertNotEqual(public_phase('WASD move · X Pulse · Q Stabilize'),'fold_answer_visible')
    def test_should_pulse_once(self):self.assertTrue(should_pulse('fold_answer_visible',0))
    def test_should_pulse_second(self):self.assertTrue(should_pulse('fold_answer_visible',1))
    def test_no_spam(self):self.assertFalse(should_pulse('fold_answer_visible',PULSE_LIMIT))
    def test_hold_blocks_extra_pulse(self):self.assertFalse(should_pulse('fold_hold',0))
    def test_no_cue_no_pulse(self):
        p=Page();r=approach_and_pulse(p,lambda p:p.hud())
        self.assertEqual(r['pulseActions'],[])
        self.assertEqual(r['publicVerdict'],'NO_PUBLIC_ANSWER')
        self.assertTrue(any(c[0]=='down' for c in p.keyboard.calls))
        self.assertEqual(p.keyboard.calls[-1],('up','a'))
    def test_early_cue_single_pulse_then_hold(self):
        p=Page(answer_after=2,progress_on_pulse=True)
        r=approach_and_pulse(p,lambda p:p.hud())
        self.assertEqual(len(r['pulseActions']),1)
        self.assertLess(r['leftHoldSeconds'],LEFT_TOTAL_SECONDS)
        self.assertEqual(r['endVisiblePhase'],'fold_hold')
        self.assertEqual(p.keyboard.calls.count(('press','x')),1)
        self.assertEqual(p.keyboard.calls.count(('up','a')),1)
    def test_answer_remains_two_pulse_limit(self):
        p=Page(answer_after=1);r=approach_and_pulse(p,lambda p:p.hud())
        self.assertEqual(len(r['pulseActions']),2)
        self.assertEqual(p.keyboard.calls.count(('press','x')),2)
    def test_neutral_cue_receives_pulse(self):
        p=Page(answer_after=13,progress_on_pulse=True)
        r=approach_and_pulse(p,lambda p:p.hud())
        self.assertEqual(len(r['pulseActions']),1)
        self.assertTrue(r['publicVerdict']=='PUBLIC_ANSWER_SEEN')
    def test_no_owner_inputs_in_log(self):
        p=Page(answer_after=3,progress_on_pulse=True)
        r=approach_and_pulse(p,lambda p:p.hud())
        txt=json.dumps(r)
        for forbidden in ('focusDistance','playerXYZ','foldOwnerState','hiddenDistance'):
            self.assertNotIn(forbidden,txt)

class Referee(unittest.TestCase):
    def test_first_stage(self):self.assertEqual(first_owner_stage(make_rec()['events'],2)['state']['stageIndex'],2)
    def test_valid_pulse(self):
        self.assertEqual(paired_pulse_stage2(make_rec()['events'],make_run(),first_owner_stage(make_rec()['events'],2))[0],True)
    def test_owner_cert(self):
        r=evaluate(make_rec(),make_run());self.assertTrue(r['complete']);self.assertTrue(r['stage2Certified'])
    def test_no_stage2(self):self.assertFalse(evaluate(make_rec(False),make_run())['stage2Certified'])
    def test_no_pulse_owner_witness(self):self.assertFalse(evaluate(make_rec(pulse=False),make_run())['stage2Certified'])
    def test_no_bot_pulse(self):self.assertFalse(evaluate(make_rec(),make_run(pulse=False))['stage2Certified'])
    def test_checkpoint_is_inconclusive(self):self.assertFalse(evaluate(make_rec(),make_run(),'CHECKPOINT_ONLY')['complete'])
    def test_dropped_inconclusive(self):
        rec=make_rec();rec['summary']['captureRetention']['droppedDetails']=1
        self.assertFalse(evaluate(rec,make_run())['complete'])
    def test_owner_stage2_before_pulse_not_causal(self):
        rec=make_rec()
        for x in rec['events']:
            if x['type']=='bot1d-listening-fold-owner-state' and x['state']['stageIndex']==2:x['time']=t(1.0)
        self.assertFalse(evaluate(rec,make_run())['stage2Certified'])
    def test_varied_seeds_full_gate(self):
        rows=[evaluate(make_rec(),make_run(s)) for s in [11,11,13]]
        self.assertEqual(aggregate(rows,3)['gate'],'VARIED_SEED_STAGE2_ALL_PASSED')
    def test_same_seed_not_varied(self):
        rows=[evaluate(make_rec(),make_run(11))]*3
        self.assertEqual(aggregate(rows,3)['gate'],'SECOND_CONDITION_NOT_TESTED')
    def test_partial(self):
        rows=[evaluate(make_rec(),make_run(11)),evaluate(make_rec(),make_run(11)),evaluate(make_rec(False),make_run(13))]
        self.assertEqual(aggregate(rows,3)['gate'],'STAGE2_PARTIAL')
    def test_missing(self):
        self.assertEqual(aggregate([evaluate(make_rec(),make_run(11))],3)['gate'],'INCOMPLETE_EVIDENCE')

if __name__=='__main__':unittest.main(verbosity=2)
