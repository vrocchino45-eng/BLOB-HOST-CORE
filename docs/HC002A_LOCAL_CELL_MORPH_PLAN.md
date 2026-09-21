# HC-002A — Local Cell Morph Planning

## Purpose

HC-002A begins the next branch after the HC-001 lock candidate. It does **not** implement runtime morphing yet. It defines how the first continuous local-cell morph should work so the next build does not accidentally reintroduce gates, thresholds, or chamber loading.

## Core Rule

```text
No gates. No doors. No hard thresholds.
The host tissue changes readability as chemistry, pressure, and perception change.
```

The player should not leave `CELL_MEMBRANE_NURSERY_001` through an exit. The local tissue should reveal a new fold of the same host body.

## First Morph

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
```

### Source

The current membrane nursery pocket is protective, soft, seed-heavy, and lightly scar-contaminated.

### Destination

The scar-flow fold is not a new room. It is the same host tissue becoming more scarred, pressured, directional, and flow-readable.

## Why This Morph Comes Next

The first slice already teaches:

```text
move
pulse
absorb
seed safety
scar resistance
signal communication
Tender / Watcher / Guide roles
```

The next slice should teach:

```text
scar is not just obstacle
flow is not just decoration
wounded tissue can become route
movement can be host-pressure guided
regions are states of the fractal, not doors
```

## Morph Trigger Concept

For HC-002 planning, the trigger is conceptual only:

```text
seed absorbed
+ scar pulsed or approached
+ signal thread answered
+ local pressure rises
= membrane pocket reveals scar-flow fold
```

This must not become a hard gate prompt.

No text should say:

```text
Press A to enter Scar Flow Fold
```

Better readable behavior:

```text
scar cracks begin carrying light
flux current strengthens
Guide hovers along a fold
membrane wall breathes inward
camera gently follows pressure crease
player remains in control
```

## Chemistry Blend

```text
Membrane Nursery Pocket:
Form 0.72 / Flux 0.41 / Scar 0.22 / Residue 0.08 / Signal 0.18 / Seed 0.64

Scar Flow Fold:
Form 0.54 / Flux 0.58 / Scar 0.48 / Residue 0.24 / Signal 0.26 / Seed 0.42
```

The destination should feel more pressured, directional, and memory-heavy while still belonging to the Wounded Nursery Host.

## Visual Blend Targets

### Membrane

- pores narrow
- veins tighten
- soft wall folds inward
- boundary recoil feels less safe

### Scar

- cracks spread from plate into path arcs
- memory motes lift into the current
- scar becomes route-like without becoming friendly

### Flux

- ribbon becomes directional current
- beads move faster
- player drift becomes more visibly host-driven

### Signal

- thread outlines the fold
- Guide answers less like tutorial, more like interpreter

## Required Runtime Systems For HC-002C

```text
LocalCellMorphSystem
ChemistryBlendSystem
EnvironmentMorphVisualSystem
MorphDebugPanel
```

## Forbidden Implementation Shortcuts

```text
hard gate prompt
teleport to second room
loading screen
old chamber transition
region array jump
fade-to-black as primary transition
```

## HC-002A Acceptance

HC-002A is successful when the morph is planned in data/docs clearly enough that HC-002B can create the recipe pack and HC-002C can implement the runtime without guessing.
