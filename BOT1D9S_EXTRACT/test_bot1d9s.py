#!/usr/bin/env python3
"""Offline D9S source patch, owner coverage, and firewall regression tests."""
from __future__ import annotations
import datetime,tempfile,pathlib,unittest,importlib,sys,types
from install_bot1d9s_observer import patch_text,install,RELATIVE,ANCHOR,RESET_ANCHOR,TAG
from bot1d9s_protocol import course
from analyze_bot1d9s import pair,all_owner_samples,evaluate

BASE=f'''class WorldObjectCensusSystem {{
 sampleMobility() {{
  const current = this.mobilityOwnerSnapshot();
  const now = Date.now();
  const m=current.motion;const input=current.input;
  const rawMagnitude=0;
{ANCHOR}
  this.recordEvent('c0d4-mob1-movement-sample', {{owner:current}});
 }}
 toggleCapture() {{
{RESET_ANCHOR}
 }}
}}'''
T0=datetime.datetime(2026,10,29,tzinfo=datetime.timezone.utc)
def stamp(s):return (T0+datetime.timedelta(seconds=s)).isoformat()
def event(t,kind,x,move=0,attached=False,cell='CELL_MEMBRANE_NURSERY_001'):
    return {'time':stamp(t),'type':kind,'owner':{
      'cellId':cell,'motion':{'position':{'x':x,'y':0,'z':0},'boundaryPressure':0.1,
        'c0e2bNormalizedBoundaryDistance':.5},
      'input':{'moveX':move,'moveY':0,'moveZ':0},'attachment':{'active':attached}}}
class TestPatch(unittest.TestCase):
    def test_applies_exactly_once(self):
        s,state=patch_text(BASE);self.assertEqual(state,'INSTALLED');self.assertIn(TAG,s)
        ss,state=patch_text(s);self.assertEqual(state,'ALREADY_INSTALLED');self.assertEqual(s,ss)
    def test_fails_on_unrecognized_source(self):
        with self.assertRaises(ValueError):patch_text('unrelated source')
    def test_partial_patch_refused(self):
        with self.assertRaises(ValueError):patch_text(BASE+'\n// '+TAG)
    def test_creates_backup_restoreable(self):
        with tempfile.TemporaryDirectory() as d:
            f=pathlib.Path(d)/RELATIVE;f.parent.mkdir(parents=True);f.write_text(BASE)
            self.assertIn('INSTALLED',install(pathlib.Path(d)))
            self.assertEqual(f.with_suffix(f.suffix+'.preD9S.bak').read_text(),BASE)
            self.assertEqual(install(pathlib.Path(d)),'ALREADY_INSTALLED')
            self.assertEqual(f.with_suffix(f.suffix+'.preD9S.bak').read_text(),BASE)
    def test_course_contains_idle_look_move(self):
        kinds={t.kind for t in course()};self.assertEqual(kinds,{'idle','look','move'})
        self.assertEqual(len(course()),13)
    def test_course_is_precommitted(self):
        self.assertEqual(course(),course())
        self.assertEqual([t.key for t in course() if t.kind=='move'],['w','s','a','d'])
class TestReferee(unittest.TestCase):
    def setUp(self):
        self.probe={'atStart':stamp(0),'atEnd':stamp(2.2),'kind':'look'}
    def test_free_neutral_pair(self):
        s=all_owner_samples({'events':[event(.3,'g1d9s-neutral-movement-observation',1),event(1.4,'g1d9s-neutral-movement-observation',1.2)]})
        self.assertEqual(pair(self.probe,s)['coverage'],'PAIRED_FREE')
    def test_absent_neutral_is_unknown(self):
        self.assertEqual(pair(self.probe,[])['coverage'],'INSUFFICIENT_IN_TRIAL_SAMPLES')
    def test_attached_is_not_free(self):
        s=all_owner_samples({'events':[event(.3,'g1d9s-neutral-movement-observation',1,attached=True),event(1.4,'g1d9s-neutral-movement-observation',1.2,attached=True)]})
        self.assertEqual(pair(self.probe,s)['coverage'],'PAIRED_ATTACHED')
    def test_mixed_attachment(self):
        s=all_owner_samples({'events':[event(.3,'g1d9s-neutral-movement-observation',1),event(1.4,'g1d9s-neutral-movement-observation',1.2,attached=True)]})
        self.assertEqual(pair(self.probe,s)['coverage'],'ATTACHMENT_CHANGED')
    def test_wrong_input_look(self):
        s=all_owner_samples({'events':[event(.3,'g1d9s-neutral-movement-observation',1,move=.5),event(1.4,'g1d9s-neutral-movement-observation',1.2,move=.5)]})
        self.assertEqual(pair(self.probe,s)['coverage'],'MOVEMENT_INPUT_CONTAMINATED')
    def test_cross_cell(self):
        s=all_owner_samples({'events':[event(.3,'g1d9s-neutral-movement-observation',1),event(1.4,'g1d9s-neutral-movement-observation',1.2,cell='OTHER')]})
        self.assertEqual(pair(self.probe,s)['coverage'],'REGION_TRANSITION')
    def test_move_evidence(self):
        p=dict(self.probe,kind='move')
        s=all_owner_samples({'events':[event(.3,'c0d4-mob1-movement-sample',1,move=1),event(1.4,'c0d4-mob1-movement-sample',2.2,move=1)]})
        self.assertEqual(pair(p,s)['coverage'],'PAIRED_FREE')
        self.assertAlmostEqual(pair(p,s)['partialNetDisplacement'],1.2)
    def test_move_no_request_rejected(self):
        p=dict(self.probe,kind='move')
        s=all_owner_samples({'events':[event(.3,'g1d9s-neutral-movement-observation',1),event(1.4,'g1d9s-neutral-movement-observation',1.2)]})
        self.assertEqual(pair(p,s)['coverage'],'INPUT_UNCERTAIN')
    def test_older_d9_no_neutral_event(self):
        run={'calibrationStarted':True,'probes':[],'status':'CAPTURED'}
        res=evaluate({'events':[event(.2,'c0d4-mob1-movement-sample',1,move=1)]},run)
        self.assertEqual(res['calibrationCoverageGate'],'OBSERVER_NOT_INSTALLED_OR_NO_NEUTRAL_SAMPLES')
    def test_no_claim_of_fold_by_default(self):
        self.assertFalse(evaluate({'events':[]},{'probes':[]})['FoldApproachProven'])
    def test_online_module_does_not_import_referee(self):
        code=pathlib.Path(__file__).with_name('bot1d9s_browser.py').read_text()
        self.assertNotIn('analyze_bot1d9s',code)
        self.assertNotIn('owner_samples(',code)
        self.assertNotIn('page.evaluate(',code)
if __name__=='__main__':unittest.main(verbosity=2)
