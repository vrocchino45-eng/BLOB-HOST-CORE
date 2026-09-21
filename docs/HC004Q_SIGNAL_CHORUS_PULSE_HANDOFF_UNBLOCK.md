# HC-004Q — Signal Chorus Pulse Handoff Unblock

## Purpose

Fix the playtest blocker shown in the screenshot where the player reaches Signal Chorus and sees:

```text
Pulse the choir node once. Let the next focus appear.
Target: choir_resonance_node_001
```

The instruction said one pulse, but the old tuning could require repeated pulses/proximity wait before the focus visibly advanced.

## Implementation

- Increased Signal Chorus pulse assist range to `7.25` for the current Signal Chorus loop focus only.
- Added one-pulse handoff floors for:
  - `choir_resonance_node_001`
  - `listening_pore_membrane_001`
  - `harmonic_wave_thread_001`
  - `seed_signal_bridge_001`
- Recomputed current focus immediately after stage advancement so HUD/reticle can move on the same interaction frame.
- Added Guide prompts for listening pore and harmonic wave steps.
- Updated HUD action text for the Signal Chorus sequence.

## Acceptance

```text
choir pulse once -> listening pore focus
listening pore pulse once -> harmonic wave focus
harmonic wave pulse once -> seed-signal bridge focus
bridge pulse -> tuned / existing Bloom fork morph readiness
```

## Forbidden Scope Respected

No gate, door, teleport, old exit registry, old chamber runtime, branch menu, combat, dialogue tree, quest log, new route branch, or new morph destination was added.
