#!/usr/bin/env python3
"""BOT1-D9Y public-cue scripted policies. Entirely independent of owner REC1.

Three deliberately different, recorded-input scenarios:
- golden: original D9X seed11 acquisition and ten-part traversal (regression)
- guided: seed11 acquisition, compact trajectory, stage-sensitive stop
- recovery: seed13 alternate acquisition, neutral observation, bounded recovery
No game-world RNG is set. No hidden positions, owner state, or live telemetry read.
"""
from __future__ import annotations
import json,pathlib
from bot1d6_policy import stage,objective
from bot1d9v_policy import public_phase

REFERENCE_PATH=pathlib.Path(__file__).with_name('BOT1D9Y_REFERENCE.json')
PROFILES=('golden','guided','recovery')


def reference(path=REFERENCE_PATH):
    data=json.loads(pathlib.Path(path).read_text(encoding='utf8'))
    if data.get('revision')!='BOT1-D9Y-REFERENCE-1':
        raise ValueError('Unrecognized reference itinerary revision')
    return data


def acquisition(profile:str,ref=None):
    if profile not in PROFILES:raise ValueError('unknown profile')
    ref=ref or reference()
    return list(ref['acquisition']['13' if profile=='recovery' else '11'])


def route(profile:str,ref=None):
    """Publicly declared scripted movement plan. Durations are seconds.

    Golden is faithful regression. Guided removes long neutral/camera pauses;
    recovery restores one neutral observation and keeps a bounded calibration.
    No profile is claimed certified until the real browser/REC1 run completes.
    """
    if profile not in PROFILES:raise ValueError('unknown profile')
    ref=ref or reference()
    c=list(ref['calibrationCourse'])
    if profile=='golden':
        return c+[{'kind':'move','key':'a','seconds':2.2,'label':'reference_left_arrival'}]
    if profile=='guided':
        # Reduced time but retains orientation, forward/backward and final left.
        return [
          {'kind':'observe','key':None,'seconds':.45,'label':'settle_after_invite'},
          {'kind':'look','key':'j','seconds':1.65,'label':'reference_look_left'},
          {'kind':'look','key':'l','seconds':1.65,'label':'reference_look_right'},
          {'kind':'move','key':'w','seconds':2.2,'label':'reference_forward'},
          {'kind':'observe','key':None,'seconds':.30,'label':'forward_settle'},
          {'kind':'move','key':'s','seconds':2.2,'label':'reference_backward'},
          {'kind':'observe','key':None,'seconds':.30,'label':'backward_settle'},
          {'kind':'move','key':'a','seconds':2.2,'label':'reference_left_arrival'}]
    return [
      {'kind':'observe','key':None,'seconds':1.50,'label':'neutral_attachment_probe'},
      {'kind':'look','key':'j','seconds':1.65,'label':'reference_look_left'},
      {'kind':'look','key':'l','seconds':1.65,'label':'reference_look_right'},
      {'kind':'move','key':'w','seconds':2.2,'label':'reference_forward'},
      {'kind':'observe','key':None,'seconds':.50,'label':'forward_settle'},
      {'kind':'move','key':'s','seconds':2.2,'label':'reference_backward'},
      {'kind':'observe','key':None,'seconds':.50,'label':'backward_settle'},
      {'kind':'move','key':'a','seconds':2.2,'label':'reference_left_arrival'}]


def correction(profile:str):
    """Bounded HUD-only search, never claim this implies decreasing distance."""
    if profile=='golden':
        return [('a',.2),('a',.2)]
    if profile=='guided':
        return [('a',.25),('a',.25),('s',.30),('a',.25)]
    if profile=='recovery':
        return [('a',.25),('s',.40),('d',.40),('w',.40),('a',.25),('a',.25)]
    raise ValueError('unknown profile')


def fold_cue(hud:str) -> str:
    return public_phase(hud)


def can_finish(hud:str)->bool:
    return fold_cue(hud) in ('fold_answer_visible','fold_hold','fold_watch','fold_release','fold_complete','beyond_fold')


def policy_contract():
    return {'online':['HUD objective/stage','ordinary browser keyboard','precommitted input reference','time'],
            'forbidden':['REC1 during actions','player XYZ','packetDistance','focusDistance','Fold owner stage','Guide owner state'],
            'referenceIsBotTelemetry':True,'worldSeedSet':False}
