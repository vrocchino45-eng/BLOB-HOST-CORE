#!/usr/bin/env python3
"""D9Z public-cue handoff policy and precommitted surface-peel diagnostic.

Online inputs: visible HUD, normal keyboard, elapsed time, and fixed reference
itinerary. No coordinates, hidden owner state, attachment telemetry, REC1, or
world-seed controls may be consulted while choosing actions.
"""
from __future__ import annotations
from dataclasses import dataclass,field
from bot1d9y_policy import fold_cue

REVISION='BOT1-D9Z'
HUD_SETTLE_SECONDS=3.50
HUD_POLL_SECONDS=.15
HOLD_SECONDS=1.50
WATCH_SECONDS=3.40

# Ordinary, documented gameplay directions from src/input/ControlMap.js.
# C rises, Z descends. None is a magic detach button. Facing and contact normal
# are unknown to the bot; the independent referee must assess what happened.
PEEL_SWEEP=(
    ('c',.60,'positive_vertical_peel_trial'),
    ('a',.55,'left_peel_trial'),
    ('z',.60,'negative_vertical_peel_trial'),
    ('d',.55,'right_peel_trial'),
    ('s',.55,'back_peel_trial'),
    ('w',.55,'forward_peel_trial'),
)

LIVE_FORBIDDEN=('REC1 during actions','player XYZ','focusDistance','surface attachment owner telemetry',
    'target position','Fold owner stage','game-world RNG seed')

@dataclass
class PublicCueLatch:
    """Latch public Fold prompt to avoid losing a transient HUD cue."""
    phase:str='fold_search'
    first_at:str|None=None
    observations:list[dict]=field(default_factory=list)

    def observe(self,hud:str,at:str,label:str)->str:
        phase=fold_cue(hud)
        self.observations.append({'at':at,'label':label,'phase':phase})
        if phase in ('fold_answer_visible','fold_hold','fold_watch','fold_release','fold_complete','beyond_fold'):
            if self.first_at is None:self.first_at=at
            self.phase=phase
        return phase

    @property
    def ready(self):
        return self.first_at is not None


def fixed_peel_sweep():
    return [{'kind':'move','key':key,'seconds':duration,'label':label}
        for key,duration,label in PEEL_SWEEP]


def class_for_recovery(invited:bool,stage5:bool,stage1:bool,post_samples:list[dict]):
    """Offline descriptive outcome; absent owner samples are inconclusive."""
    if stage5:return 'CERTIFIED_FOLD_STAGE5'
    if not invited:return 'NO_OWNER_INVITATION'
    if stage1:return 'FOLD_STARTED_UNFINISHED'
    if not post_samples:return 'ATTACHMENT_STATE_NOT_SAMPLED'
    states=[x['attached'] for x in post_samples]
    if states[-1]:return 'ATTACHED_ROUTE_UNRESOLVED'
    if True in states and False in states[states.index(True)+1:]:
        return 'RELEASE_OBSERVED_BUT_FOLD_NOT_REACHED'
    return 'NOT_ATTACHED_BUT_FOLD_NOT_REACHED'
