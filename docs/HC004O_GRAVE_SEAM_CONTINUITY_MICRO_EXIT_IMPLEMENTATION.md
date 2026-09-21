# HC-004O — Grave Seam Continuity Micro-Exit Implementation

## Mode
Runtime implementation pass.

## Build identity
- Build: HC-004O
- Version: 0.0.61
- Label: Grave Seam Continuity Micro-Exit Implementation

## Purpose
HC-004O adds a practical post-read response to the scar-memory seam. After the HC-004N first-read loop completes, the player can pulse the closed inheritance suture to trigger a short no-gate continuity fold-back to the Grave Memory Residue Bed.

This is meant to stop the seam from feeling like a dead end while still preserving the closed-suture meaning.

## Runtime behavior
```text
CELL_GRAVE_SCAR_MEMORY_SEAM_001
first-read complete
pulse closed_inheritance_suture_001
→ short continuity fold-back, no gate
→ CELL_GRAVE_MEMORY_RESIDUE_BED_001
```

## Added
```text
GraveSeamContinuityMicroExitSystem
graveSeamContinuityMicroExitRecipes.json
HC-004O Guide prompts
HUD Seam Micro-Exit status
GameRuntime camera bias for seam fold-back
RecipeDataSystem load/validation support
validate:grave-seam-continuity-micro-exit
```

## Preserved locks
The micro-exit does not add any of the following:

```text
old gates
doors
teleports
branch select menu
old chamber runtime
old exit registries
stage-node loaders
new morph activation
new route branch
combat
dialogue tree
quest log
new entity spawns
seam object absorption
opening closed inheritance suture
consuming old core husk
opening inheritance seed remnant
Act expansion
```

## Acceptance tests
```text
npm run validate:grave-seam-continuity-micro-exit
npm run validate:grave-scar-memory-seam-first-read-loop
npm run validate:grave-scar-memory-seam-runtime-arrival
npm run validate:grave-scar-memory-seam-arrival-planning
npm run validate:grave-scar-memory-seam-visual-composer
npm run validate:grave-scar-memory-seam-recipe-pack
npm run validate:grave-route-continuity
npm run validate:grave-exit-readiness
npm run validate:grave-loop-stability
npm run validate:grave-read-loop
npm run validate:grave-arrival-readability
npm run validate:grave-morph-prototype
npm run validate:grave-visual-composer
npm run validate:grave-route-recipe-pack
npm run validate:grave-route-plan
npm run validate:recipe-data
npm run validate:gold-candidate
npm run audit:undefined-methods
npm run build
```

All listed checks passed.
