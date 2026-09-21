# HC-001N — First Local Cell Lock Report

## Build

```text
Build ID: HC-001N
Build Label: First Local Cell Lock Pass
Slice: CELL_MEMBRANE_NURSERY_001 — Membrane Nursery Pocket
Host: HOST_ALPHA_WOUNDED_NURSERY
```

## Purpose

HC-001N packages the first Host Core rebuild slice as a lock candidate.

This is not an expansion pass. It is a convergence pass.

The goal is to decide whether the first local cell now proves the new architecture:

```text
Host Core
→ Host anatomy
→ Local cell
→ Chemistry field
→ Visual recipes
→ Placeholder contracts
→ Movement / pulse / absorb
→ Bonding
→ Entities
→ Guide orbiter
→ Visual composition
```

## Current Slice Contents

### World

```text
HOST_ALPHA_WOUNDED_NURSERY
CELL_MEMBRANE_NURSERY_001
```

### Active Chemistry

```text
Form
Flux
Scar
Seed
Signal
```

### Matter States

```text
gel
membrane
fluid
scarred
signal_vapor
dormant_seed
```

### Chem Objects

```text
dormant_seed_nutrient_001
scar_contamination_plate_001
flux_current_ribbon_001
signal_vapor_thread_001
```

### Entities

```text
nursery_membrane_tender_001
membrane_watcher_001
```

### Orbiter

```text
guide_orbiter_folded_lantern_001
```

### Bonds

```text
soft_bond
scar_bond
resonant_bond
```

## What HC-001 Currently Proves

- A clean macro-first build can boot without old gate/chamber logic.
- The Host Core and Local Cell are authored as data.
- Visible objects are recipe-composed.
- Placeholders carry replacement contracts.
- Player movement reads local cell viscosity and flow.
- Controller input works through the browser Gamepad API.
- Targeting can select a chemistry object.
- The seed nutrient can be bonded with and absorbed.
- Player composition changes after absorption.
- Scar matter resists unsafe absorption.
- Pulse affects multiple object types differently.
- Tender and Watcher spawn from entity recipes.
- Guide spawns from orbiter recipe.
- Visual composition now has motion signatures and stronger silhouette details.

## Lock Candidate Criteria

HC-001 should be considered lock candidate if playtest confirms:

```text
keyboard movement works
controller movement works
A / F absorb works
Space / X pulse works
seed can be absorbed
scar resists unsafe absorb
target reticle is readable
Tender reads as caretaker
Watcher reads as sensor
Guide reads as interpreter
visuals feel alive enough for prototype
debug panels show useful state
no hard gates exist
no old chamber transition system exists
```

## Known Weaknesses Before Expansion

These are acceptable for lock candidate but should be addressed before broad expansion:

1. `VisualComposer.js` is still a large composition file.
2. Three.js is bundled into one large Vite chunk.
3. Entity behavior is still simple state logic, not deep AI.
4. Guide behavior is interpretive but not yet tied to a dialogue or memory system.
5. The first cell is still a contained prototype pocket, not a morphing region.
6. Placeholder contracts exist, but many objects are still `recipe_composed_placeholder`.
7. Sound, final HUD, save/load, and progression are not implemented.

## Lock Decision

```text
Status: lock_candidate_pending_user_playtest
Recommended next expansion only after user confirms HC-001N works cleanly.
```

## Recommended Next Branch After Lock

If HC-001N passes playtest:

```text
HC-002A — Local Cell Morph Planning
HC-002B — First Morph Cell Recipe Pack
HC-002C — Morph Transition Prototype
```

If HC-001N does not pass playtest:

```text
HC-001O — Lock Candidate Fix Pass
```
