# HC-004N — Grave Scar-Memory Seam First-Read Loop Implementation

## Goal

Turn the HC-004M seam arrival into a playable moment by giving the player something concrete to do inside the scar-memory seam.

## Implemented runtime loop

```text
CELL_GRAVE_SCAR_MEMORY_SEAM_001
scar_memory_seam_thread_001
→ residue_stitch_lattice_001
→ echo_husk_imprint_001
→ closed_inheritance_suture_001
```

The player reads each seam object through pulse/proximity. The loop is sequential, readable, and intentionally non-consumptive.

## Runtime system

```text
src/morph/GraveScarMemorySeamFirstReadSystem.js
```

The system:

- activates only after HC-004M arrival is complete
- focuses the current seam read target
- advances read progress from pulse/proximity
- applies recoil when pulse/absorb is used incorrectly
- blocks absorb without consuming seam objects
- marks first-read completion after all four reads stabilize
- does not activate exits, morphs, gates, branches, combat, dialogue, or quests

## Data added

```text
public/data/morph/graveScarMemorySeamFirstReadRecipes.json
public/data/targeting/targetFocusRules.json
public/data/guide/guidePromptRecipes.json
```

## Locked exclusions

```text
no exit activation
no new morph activation
no route branch activation
no combat
no dialogue tree
no quest log
no old gate/door/teleport/exit architecture
no seam object absorption
no suture opening
```
