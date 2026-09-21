# HC018E — Whole-Route Gameplay Rhythm Convergence

## Purpose
Close the HC018 sequence without adding another mechanic.

The HC017E full playthrough showed that the runtime works, but many moments still arrive with
equal visual weight. HC018E turns the existing interaction-composition coordinator into a
presentation rhythm layer.

## Rhythm
The world now resolves existing state into this non-authoritative presentation sequence:

observe → move → manipulate → consequence → quiet → discover → transition

This sequence does not gate or advance gameplay.

## Changes
- Existing route-stage / last-interaction changes create a short consequence hold (~0.9 s).
- Verb/target presentation no longer drops immediately into the next equal-weight signal.
- Ambient material is quieter during quiet/transition beats and slightly fuller during discovery.
- Companion yield remains elevated through the consequence beat so Guide/Tender do not instantly
  crowd the result.
- Existing camera breathing-room behavior remains, driven by the same presentation coordinator.
- Return-ready/completed routes publish a transition presentation beat without changing crossing truth.

## Locked
- route state machines and completion thresholds
- objectives/prompts as authority
- movement/controller feel
- camera system
- chemistry/Bond/ChemObject authority
- Pulse/Absorb/Stabilize gameplay rules
- Grave/Vascular/Silt gameplay systems
- Core scale
- transitions/crossing ownership

## Acceptance target
A route should breathe:
notice something, travel, act, see the host answer, get a short quiet beat, notice what changed,
then transition. The next prompt/system should not visually erase the consequence immediately.
