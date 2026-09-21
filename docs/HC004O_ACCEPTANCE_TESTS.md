# HC-004O Acceptance Tests

## Required
- HC-004O micro-exit recipe exists and loads through RecipeDataSystem.
- GraveSeamContinuityMicroExitSystem is created and registered by GameRuntime.
- The micro-exit becomes ready only when activeCellId is CELL_GRAVE_SCAR_MEMORY_SEAM_001 and HC-004N firstReadComplete is true.
- Pulse on/near closed_inheritance_suture_001 starts the fold-back.
- Holding absorb blocks the fold-back.
- Completion sets activeCellId to CELL_GRAVE_MEMORY_RESIDUE_BED_001.
- Seam objects are not consumed.
- closed_inheritance_suture_001 remains closed.
- No legacy exit architecture is introduced.

## Forbidden regression
- No gate, door, teleport, old exit registry, stage-node loader, branch select menu, combat, dialogue tree, quest log, new morph plan, or new route branch.
