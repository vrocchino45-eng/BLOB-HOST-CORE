# HC-004D Runtime Grave Morph Prototype

## New Runtime System

```text
src/morph/GraveRouteMorphSystem.js
```

## Runtime Shape

```text
source cell:
CELL_BLOOM_RESIDUE_FORK_001

morph plan:
MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001

destination cell:
CELL_GRAVE_MEMORY_RESIDUE_BED_001
```

## Activation Contract

The Grave route can prepare only when the Bloom Residue Fork is active and stable enough to branch.

The morph uses:

```text
pulsePressed
residue memory readiness
fork stability
player composition thresholds
Bloom source focus objects
```

It does not use:

```text
gates
doors
teleports
old chamber exits
stage-node loaders
branch select menu
```

## Destination Spawn Contract

The morph spawns the Grave destination environment and the four Grave chem objects as arrival-readable objects:

```text
grave_memory_residue_bed_surface_v01
grave_memory_silt_haze_v01
old_core_husk_memory_001
residue_silt_cloud_001
scar_lock_plate_001
inheritance_seed_remnant_001
```

## Deferred Scope

The Grave arrival is intentionally quiet. HC-004D does not add the Grave interaction loop.

Deferred to later:

```text
read-before-absorb loop
scar lock response
inheritance seed choice
husk memory state progression
objective completion
new entity behavior
```
