# HC-004P — Grave Bed Post-Seam Response Implementation

## Purpose

HC-004P turns the return from the scar-memory seam into a playable response beat inside the existing Grave bed.

The player should feel that the seam reading changed the Grave bed, but the build must not yet widen into a new branch, exit, combat layer, dialogue tree, or quest structure.

## Runtime behavior

After HC-004O completes and returns the player to `CELL_GRAVE_MEMORY_RESIDUE_BED_001`, the Grave bed runs a protected read sequence:

```text
old_core_husk_memory_001
→ scar_lock_plate_001
→ inheritance_seed_remnant_001
```

The objects respond through pulse/proximity reading. Absorb is blocked. No protected remain is consumed. The inheritance seed remnant warms but stays closed.

## Ownership

- Runtime system: `src/morph/GraveBedPostSeamResponseSystem.js`
- Recipe data: `public/data/morph/graveBedPostSeamResponseRecipes.json`
- Data validation: `RecipeDataSystem.validateGraveBedPostSeamResponse()`
- Script validation: `scripts/validateGraveBedPostSeamResponse.mjs`
- HUD readout: `PlaytestHudSystem`
- Guide prompts: `GuidePromptSystem` and `guidePromptRecipes.json`

## Scope boundary

HC-004P may only make the existing Grave bed answer the seam return. It may not add:

```text
gates
doors
teleports
branch menus
old exit registries
stage-node loaders
new morph plans
runtime exits
combat
dialogue trees
quest logs
new entity spawns
Act expansion
```
