# HC-002D — Morph Readability + Stabilization

## Purpose

HC-002C made the first no-gate morph playable. HC-002D makes that morph easier to understand and harder to miss.

This pass does not add a new cell, new combat, new entities, or new abilities.

## Added

```text
src/morph/MorphReadabilitySystem.js
```

## What changed

- bottom-center morph readability panel
- morph progress bar
- next-action text
- trigger confidence readout
- world cue ring when morph is armed or running
- inner progress ring during morph
- more forgiving pulse-under-pressure trigger
- clearer debug fields for morph confidence, next action, and progress rate

## Playtest path

1. Absorb `dormant_seed_nutrient_001`.
2. Move toward the scar plate or signal thread.
3. Watch the morph panel change from waiting to armed.
4. Press `Space` or controller `X` near scar/signal.
5. The world cue ring should appear and the morph should progress.
6. The player should stay in control.
7. Destination scar-flow content should fade in.

## Acceptance

```text
The player always knows what the morph wants next.
The morph feels like host tissue changing, not a gate or teleport.
No old chamber transition logic returns.
```
