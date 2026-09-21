# HC016X — Core Scale + Locomotion Baseline

## Mode
SCALE NORMALIZATION / LOCOMOTION BASELINE

## Why
HC016W proved that Grave, Vascular and Silt now have enough authored territory.
Gameplay footage then showed the Core itself still occupying too much of the local
anatomical scale. Continuing to inflate the world would hide that problem and reduce
future micro→macro growth headroom.

## Core
The embodied Core is now **0.52× its previous visual/body presentation** (~48% smaller).

This is intentionally applied to the authored body frame rather than shrinking the
entire world or rewriting every interaction distance.

Locked in world space:
- Pulse reach
- Absorb reach
- targeting reach
- route geometry
- route boundaries
- chemistry
- progression

This means the Core reads smaller without making existing objects frustratingly hard
to interact with.

The detached fluid wake is tightened to the new body scale. Guide and bonded Tender
player-relative offsets are also normalized, while their distinct roles remain:
Guide above/ahead; Tender behind/below.

## Movement
The existing movement system remains the sole owner.

Normal speed limit:
**3.75 → 4.65** (~24% increase)

Base acceleration:
**11.15 → 13.1**

Existing L3 / Shift boost:
- acceleration multiplier: **1.80×**
- boosted speed-cap multiplier: **1.85×**
- theoretical boosted cap: **8.60 world units/s**

No new traversal button was added.

The intent is two readable tempos:
1. normal movement for positioning/interaction;
2. L3 boost for crossing the larger Host anatomy quickly.

## Locked
No Grave/Vascular/Silt enlargement, no Core-growth mechanic rewrite, no route-specific
drag/current behavior yet, no camera architecture rewrite, no new ability, no new
chemistry, and no new progression owner.

## Test
Run Surface → Guide → Hub, then at least one full route roundtrip.

Check:
1. Core looks approximately half its former apparent size.
2. Core still remains easy to visually track.
3. Guide and Tender remain distinguishable without floating too far from the Core.
4. Normal movement feels less sluggish.
5. Holding L3 gives an obvious fast-travel tempo.
6. Releasing L3 restores useful precision near interactions.
7. Pulse/Absorb interactions remain reachable at familiar distances.
8. Tight camera remains smooth and does not become uncomfortably close.
9. Grave/Vascular/Silt geometry and boundaries remain unchanged.

## Next
HC016Y — Route Physical Feel:
use the stable scale/speed baseline to make Grave, Vascular and Silt physically affect
movement between interaction beats rather than adding more triggers.
