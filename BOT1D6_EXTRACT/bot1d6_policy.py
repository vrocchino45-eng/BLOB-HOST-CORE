#!/usr/bin/env python3
"""BOT1-D6: public-HUD stage reader and bounded locomotion probes.

The human demonstration informs these *rules*, not hidden coordinates or a replay.
This module is the entire online navigation policy: no REC1, frames, player
positions, packet classes, Fold owner states, or Guide owner truth are imported.
"""
from __future__ import annotations
import re
from bot1d5_policy import next_probe, weak_visual_change

PUBLIC_INPUTS = ('visible HUD words','rendered screenshot changes','prior inputs','elapsed time')
FORBIDDEN_INPUTS = ('REC1 owner snapshots','fold owner distance or world position',
                    'packet material or hidden collision truth','Guide owner reaction snapshots')

# Gameplay HUD precedes the fixed control legend. Avoid interpreting legend's
# words "Pulse", "Absorb", "Stabilize" or "Y inspects Core" as an objective.
HUD_CUTS = (' Y inspects the Core', ' Surface Wake:', ' WASD move', ' · Binding Core',
            ' · Reading:', ' Controls:', ' Gamepad:')


def objective(hud: str) -> str:
    text=' '.join((hud or '').split())
    for prefix in ('BLOB // HOST CORE // ', 'BLOB: HOST CORE '):
        if text.startswith(prefix): text=text[len(prefix):]
    # Remove short chapter header, but not arbitrary instructions.
    text=re.sub(r'^(SURFACE WAKE|SCAR FLOW FOLD|SIGNAL CHORUS|GUIDE THRESHOLD|HUB)\s+', '', text, flags=re.I)
    for sentinel in HUD_CUTS:
        cut=text.lower().find(sentinel.lower())
        if cut>=0:text=text[:cut]
    return text.strip()


def stage(hud: str) -> str:
    s=objective(hud).lower()
    if not s:return 'unknown'
    if any(x in s for x in ('safe seed is now readable', 'the fold remembers how you', 'surface wake complete')):
        return 'fold_complete'
    if any(x in s for x in ('release lt and remain nearby','release resonance and let the tissue settle',
                             'release and settle','let the fold become calm')):
        return 'fold_release'
    if any(x in s for x in ('keep still and watch','watch the response pass through',
                             'observe the visible tissue response')):
        return 'fold_watch'
    if any(x in s for x in ('hold lt to stabilize', 'hold lt while remaining near',
                             'hold lt to sustain','stay with the answer', 'stabilize the resonance')):
        return 'fold_hold'
    if any(x in s for x in ('press x once to pulse-read', 'pulse once with x',
                             'pulse-read the fold','you found the deeper fold')):
        return 'fold_pulse'
    if any(x in s for x in ('follow the opening membrane','follow the watcher',
                             'approach the listening fold', 'follow reactions toward',
                             'move through the changed passage')):
        return 'fold_search'
    if any(x in s for x in ('pulse the moving matter', 'pulse the next packet',
                             'read what the moving matter')):
        return 'packet'
    if any(x in s for x in ('observe the next matter cycle', 'watch the current mouth')):
        return 'packet_wait'
    if any(x in s for x in ('guide threshold', 'move to the route body', 'scar flow fold')):
        return 'beyond_fold'
    return 'unknown'


# Local turn-and-return scan: short, alternating moves with explicit rests.
# It is intentionally NOT a route, a landmark detector, or inverse dynamics.
# The human reference only motivates correction and stage switching.
COURSE = (
    ('observe',None,.48,'settle_before_search'),
    ('move','w',.56,'small_forward_step'),('observe',None,.22,'check_stage'),
    ('move','s',.42,'counter_forward_momentum'),('observe',None,.28,'check_stage'),
    ('move','a',.58,'small_left_step'),('observe',None,.25,'check_stage'),
    ('move','d',.46,'counter_left_momentum'),('observe',None,.30,'check_stage'),
    ('move','d',.57,'small_right_step'),('observe',None,.25,'check_stage'),
    ('move','a',.48,'counter_right_momentum'),('observe',None,.32,'check_stage'),
    ('move','s',.52,'small_reverse_step'),('observe',None,.30,'check_stage'),
    ('move','w',.47,'counter_reverse_momentum'),('observe',None,.32,'check_stage'),
)


def course_action(nav_step: int, weak_count: int, seed: int):
    if weak_count>=3:
        op,key,seconds,why=next_probe(nav_step,weak_count,seed)
        return (op,key,min(seconds,.52),'visual_uncertainty_recovery_'+why)
    cycle,index=divmod(nav_step,len(COURSE))
    if cycle and index==0:
        return ('look',('j' if (cycle+seed)%2 else 'l'),.30,'incremental_heading_reframe')
    return COURSE[index]


def next_action(stage_name:str,nav_step:int,weak_count:int,seed:int,stage_attempt:int=0):
    """One ordinary action. Never read owner distance to decide an input."""
    if stage_name=='fold_pulse':
        if stage_attempt>=3:return ('observe',None,.9,'await_stage_confirmation')
        return ('pulse',None,.30,'once_from_visible_fold_pulse_objective')
    if stage_name=='fold_hold':return ('hold','q',2.05,'sustain_visible_fold_resonance')
    if stage_name=='fold_watch':return ('observe',None,1.20,'watch_authored_tissue_response')
    if stage_name=='fold_release':return ('observe',None,1.40,'release_and_wait_for_settle')
    if stage_name=='fold_complete':return ('observe',None,.40,'fold_complete_visible_check')
    if stage_name=='fold_search':return course_action(nav_step,weak_count,seed)
    return ('observe',None,.55,'unclassified_objective_wait')
