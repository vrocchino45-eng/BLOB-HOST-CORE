#!/usr/bin/env python3
"""BOT1-D11A Silt mobility diagnostics: fixed input actions, no hidden-state steering.

There is no deterministic attachment guarantee. All four profiles enter Silt through
an *existing debug-only* Shift+6 platform at canonical origin, without gameplay changes.
"""
from __future__ import annotations

REVISION='BOT1-D11A'
CELL='CELL_SILT_PRESSURE_ROUTE_001'
PROFILES=('baseline','contact','release_sweep','release_control')
# key=None means release everything and observe; all moves use standard keyboard input.
# The two release arms share their entire prefix and recovery suffix, and spend the
# same number of seconds in their designated intervention windows.
PREFIX=(('neutral_entry',None,1.2),('approach_forward','w',3.2),
        ('approach_left','a',2.0),('approach_forward_more','w',2.6),
        ('approach_right','d',1.4),('before_intervention',None,1.2))
SWEEP=(('peel_up','c',1.1),('peel_down','z',1.1),('peel_back','s',1.1),
       ('peel_forward','w',1.1),('peel_right','d',1.1),('peel_left','a',1.1))
CONTROL=(('matched_neutral_1',None,1.1),('matched_neutral_2',None,1.1),
         ('matched_neutral_3',None,1.1),('matched_neutral_4',None,1.1),
         ('matched_neutral_5',None,1.1),('matched_neutral_6',None,1.1))
SUFFIX=(('post_intervention',None,1.4),('return_backward','s',2.6),('final_neutral',None,1.6))

def course(profile):
    if profile not in PROFILES:raise ValueError(f'Unknown D11A profile: {profile}')
    if profile=='baseline':
        return (('neutral_entry',None,2.0),('forward','w',3.2),
                ('coast',None,1.4),('return','s',3.2),('settle',None,1.5))
    if profile=='contact':
        return PREFIX + (('probe_vertical_up','c',2.1),('probe_vertical_down','z',2.1),
                          ('probe_forward','w',2.0),('settle',None,2.2))
    return PREFIX + (SWEEP if profile=='release_sweep' else CONTROL) + SUFFIX

def validate_course(profile):
    steps=course(profile)
    if not steps or any(s[1] not in ('w','a','s','d','c','z',None) or not 0<s[2]<=5 for s in steps):
        raise ValueError('Invalid action course')
    return steps

def contract():
    a=course('release_sweep');b=course('release_control')
    return {'revision':REVISION,'testEntry':'Shift+6 existing HC027G1 debug platform',
      'requestedCell':CELL,'sameInterventionPrefix':a[:len(PREFIX)]==b[:len(PREFIX)],
      'sameInterventionSuffix':a[-len(SUFFIX):]==b[-len(SUFFIX):],
      'interventionDurationSeconds':round(sum(x[2] for x in SWEEP),2),
      'controlDurationSeconds':round(sum(x[2] for x in CONTROL),2),
      'inputsOnly':'keyboard + public HUD snapshots + elapsed time',
      'ownerStateForLiveControl':False,'gameplayChanges':False,
      'contactNormalVisibleOnline':False,'attachmentGuaranteed':False,
      'limits':['Different browser runs are not identical physics states or world seeds.',
                'A directional sweep is not a contact-normal-aligned peel instruction.',
                'Stage/Host receipt/route achievement require independent owner proof.']}
