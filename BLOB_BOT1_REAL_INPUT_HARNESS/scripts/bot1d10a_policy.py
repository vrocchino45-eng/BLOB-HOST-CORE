#!/usr/bin/env python3
"""BOT1-D10A public-HUD-only bounded target-closure policy.

Movement is a falsifiable *experiment*, not hidden-coordinate pathfinding.
The live bot receives no Fold distance, owner flags, or REC1 data.
"""
from __future__ import annotations

REVISION='BOT1-D10A'
PROFILES_D10A=('golden','guided','recovery','recovery_control')
CLOSURE_SETTLE_SECONDS=.22
# D9Z Guided ended at 2.59 against a 2.25 approach gate. The first small
# left probes extend a *historically successful* direction, NOT a live
# distance gradient. If no public cue appears, we reverse and cross-probe.
# Direction history and finite budget are preserved for offline diagnosis.
CLOSURE_STEPS=(
    ('a',.24,'left_micro_01'),
    ('a',.24,'left_micro_02'),
    ('a',.20,'left_micro_03'),
    ('d',.18,'opposite_direction_backtrack'),
    ('a',.24,'left_return_probe'),
    ('s',.30,'reverse_axis_probe'),
    ('w',.30,'restore_axis_probe'),
    ('a',.28,'last_left_probe'),
)

def closure_plan():
    return [{'kind':'move','key':k,'seconds':dt,'label':label}
            for k,dt,label in CLOSURE_STEPS]

def acquisition_profile(profile):
    if profile not in PROFILES_D10A:raise ValueError('Unsupported D10A profile')
    return 'recovery' if profile=='recovery_control' else profile

def is_control_pair(a,b):
    return set((a,b))=={'recovery','recovery_control'}
