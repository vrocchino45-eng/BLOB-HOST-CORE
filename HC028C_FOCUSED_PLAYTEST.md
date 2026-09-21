# HC028C Focused Playtest — Vascular World Rhythm Grammar

## Purpose
Test whether one existing area feels more coherent when movement, anatomy, particles and sound share a mathematical rhythm, without turning Vascular into a rhythm-game gate.

## Primary route
Use the debug jump to Vascular or reach it naturally. Spend roughly 2–4 minutes there. Do not deliberately count beats on the first run.

## What to feel for
1. Does Vascular feel as though it has a pulse even when you are not pressing a verb?
2. Does the current seem to surge and settle rather than move at one flat strength?
3. Do vessel folds, charge, motes and audio feel like parts of one organism rather than independent effects?
4. Does the rhythm remain subtle enough that ordinary steering is still natural?
5. Does it feel better to ride with the current at some moments without making off-beat movement feel wrong?
6. Does the existing Pulse/Absorb/Stabilize grammar feel more related to the environment, even though no button is required on a beat?

## Debug confirmation
F1 trace should show a line similar to:

`World: P-S-A · 4/4 · 82.759 bpm · beat 1/4 pulse · micro_local`

The beat function cycles:
Pulse → Stabilize → Absorb → Stabilize.

## Regression checks
- Vascular still completes through the existing cadence-read logic.
- The return fold still activates through the HC028B1 proximity behavior after resolution.
- No new timing prompt appears.
- Missing a world beat cannot fail a route read by itself.
- Hub convergence remains reachable after returning.
- Silt and Grave retain their previous behavior; HC028C does not assign them a new composition profile yet.
- Audio remains near the HC027D1 comfortable reference level; the new pulse should be restrained, not dominant.

## Decision after test
### KEEP
If the area feels more like one living system and the meter is sensed before it is consciously counted.

### TUNE
If the concept works but the current pulse, visual accent or audio pulse is too weak/strong.

### REJECT / REFRAME
If the area feels like a music minigame, if steering becomes beat-dependent, or if the rhythm reads as an overlay rather than the tissue's own behavior.
