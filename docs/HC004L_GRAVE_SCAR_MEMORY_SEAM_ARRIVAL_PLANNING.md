# HC-004L — Grave Scar-Memory Seam Arrival Planning

## Purpose

Define how eventual arrival into `CELL_GRAVE_SCAR_MEMORY_SEAM_001` should feel and read before any runtime transition is activated.

## Implementation scope

- Added `public/data/planning/graveScarMemorySeamArrivalPlanning_HC004L.json`.
- Added RecipeDataSystem load and validation support.
- Added GameRuntime readout state: `graveScarMemorySeamArrivalPlanning`.
- Added Guide/HUD language for seam-arrival planning.
- Preserved all existing Grave bed runtime as the current endpoint.

## Structural decision

The scar-memory seam is not a door. It is a deeper continuity pressure that should eventually feel like a slow pull along a read scar.

## Planned first-read order

```text
scar_memory_seam_thread_001
residue_stitch_lattice_001
echo_husk_imprint_001
closed_inheritance_suture_001
```

## Carry-forward constraints

The following Grave bed remains must stay protected and unconsumed:

```text
old_core_husk_memory_001
scar_lock_plate_001
inheritance_seed_remnant_001
```

The safe transfer remains only:

```text
residue_silt_cloud_001_trace_only
```

## Forbidden in HC-004L

```text
runtime exit activation
player relocation
moving the player to the scar-memory seam
new morph activation
target focus activation
seam interaction loop
gates / doors / teleports / old exits
branch select menu
combat
dialogue tree
quest log
Act expansion
```
