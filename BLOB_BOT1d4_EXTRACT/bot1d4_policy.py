#!/usr/bin/env python3
"""BOT1-D4 visible-HUD navigation policy. No owner/REC1/coordinate reads.

The navigation paths are deliberately exploratory, not optimal: keyboard relative
moves only; profile/seed choose the order. The only online feedback is visible HUD
text, which can switch the policy from wayfinding to an authored Fold action.
"""
from __future__ import annotations


def visible_stage(hud: str) -> str:
    s = ' '.join((hud or '').lower().split())
    # Prefer tightly scoped authored objectives over control legends and chatter.
    if ('safe seed is now readable' in s or 'fold remembers how you' in s
            or 'surface wake complete' in s):
        return 'complete_message'
    if ('release resonance and let the tissue settle' in s
            or 'release lt and remain nearby' in s
            or ('release' in s and 'fold becomes calm' in s)):
        return 'release'
    if ('keep still and watch the response' in s
            or 'observe the visible tissue response' in s
            or 'watch the response pass through the membrane' in s):
        return 'watch'
    if ('hold lt while remaining near the fold' in s
            or 'hold lt to stabilize the resonance' in s
            or 'the fold answered. stay with the answer' in s):
        return 'hold'
    if ('pulse once with x' in s
            or 'press x once to pulse-read the fold' in s
            or 'you found the deeper fold' in s):
        return 'fold_pulse'
    if ('follow the watcher' in s or 'follow the opening membrane' in s
            or 'approach the listening fold' in s
            or 'move through the changed passage' in s
            or 'follow reactions toward the deeper listening fold' in s):
        return 'fold_search'
    if ('pulse the moving matter' in s or 'pulse the next packet' in s
            or 'read what the moving matter' in s):
        return 'packet'
    if ('watch the current mouth' in s or 'observe the next matter cycle' in s):
        return 'packet_wait'
    return 'unknown'


# Each leg is (operation, key, duration, reason). No hidden state feedback.
# The camera is held fixed within each lane to preserve a consistent reference.
# A single step may end beyond a target; the search sweeps both directions.
_LANE = [
    ('move','a',1.25,'probe_left'), ('observe',None,.30,'inspect_after_left'),
    ('move','d',2.50,'cross_right'), ('observe',None,.30,'inspect_after_right'),
    ('move','a',1.25,'restore_lateral'),
    ('move','w',1.25,'advance_lane'), ('observe',None,.32,'inspect_lane'),
    ('move','a',1.70,'probe_left_forward'), ('move','d',3.40,'cross_right_forward'),
    ('move','a',1.70,'restore_lateral_forward'),
    ('move','w',1.10,'advance_second_lane'),
    ('move','d',1.70,'probe_right_forward'), ('move','a',3.40,'cross_left_forward'),
    ('move','d',1.70,'restore_second_lane'),
    ('move','s',2.45,'reverse_to_prior_lane'), ('observe',None,.40,'inspect_reverse'),
]

# Alternate scan uses wider up/down lobe before changing viewpoint. Different
# routes test if a camera-aligned traversal helps more than a lateral raster.
_LOBE = [
    ('move','w',1.35,'probe_forward'), ('move','s',1.35,'restore_forward'),
    ('move','a',1.55,'probe_left'), ('move','d',1.55,'restore_left'),
    ('move','s',1.30,'probe_reverse'), ('move','w',1.30,'restore_reverse'),
    ('move','d',1.55,'probe_right'), ('move','a',1.55,'restore_right'),
    ('look','l',.68,'rotate_to_new_quadrant'), ('observe',None,.38,'inspect_new_quadrant'),
    ('move','w',1.80,'probe_quadrant'), ('move','a',1.40,'lateral_quadrant'),
    ('move','d',2.80,'cross_quadrant'), ('move','a',1.40,'restore_quadrant'),
    ('move','s',1.40,'backtrack_quadrant'),
]


def fold_nav_action(profile: str, nav_step: int, seed: int):
    if profile not in ('lanes','lobes'):
        raise ValueError('profile must be lanes or lobes')
    plan = _LANE if profile == 'lanes' else _LOBE
    cycle = nav_step // len(plan)
    op,key,duration,why = plan[nav_step % len(plan)]
    # Periodically reframe rather than rotate after *every* movement as in D3.
    if profile=='lanes' and nav_step % len(plan)==0 and cycle>0:
        return ('look',('j' if (cycle+seed)%2 else 'l'),.65,'new_heading_after_lane_scan')
    return op,key,duration,why


def fold_action(stage: str, profile: str, nav_step: int, seed: int):
    if stage=='fold_pulse':return ('pulse',None,.30,'authored_fold_observe_once')
    if stage=='hold':return ('hold','q',2.15,'authored_stabilize_resonance')
    if stage=='watch':return ('observe',None,1.20,'authored_watch_response')
    if stage=='release':return ('observe',None,1.50,'authored_release_and_settle')
    if stage=='complete_message':return ('observe',None,.50,'visible_complete_check')
    return fold_nav_action(profile,nav_step,seed)


def policy_inputs_are_public() -> tuple[str,...]:
    return ('visible HUD text', 'ordinary keyboard focus', 'profile', 'seed', 'step count')
