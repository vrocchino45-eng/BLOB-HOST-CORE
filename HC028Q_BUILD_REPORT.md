# HC-028Q Build Report — Third Organism Proof: Vascular Relay

## Purpose

HC028Q tests whether the ecology stack built from HC028I–P is genuinely extensible or merely a collection of Tender/Watcher special cases. The pass adds exactly one organism in one region and requires the existing P/A/S → memory → behavior → Host matter → residue → recognition language to work without cloning a third set of system branches.

## Source audit result

The live `entityRecipes` registry contained only two authored organisms before this pass: `nursery_membrane_tender_001` and `membrane_watcher_001`. A later cell historically reuses the Watcher, but there was no dormant third organism recipe to promote. Vascular was selected because it is already playable/compositionally mature, has strong transmission/current identity, and contained no authored ecology.

## New organism

`vascular_relay_001` is a **flow relay**, not a caretaker or sensor. Its host function is `carry_align_release`: catch moving signal/nutrient flow, align transfer with the vascular current, and release it downstream.

Visual grammar: three paired vane stations = six vanes around a translucent lumen body. This deliberately references the established 3→6 grammar without making another Core-shaped object. The Relay faces and rides the regional current rather than facing the player.

### P/A/S interpretation

- Pulse / `project` → `forward_signal`
- Absorb / `draw` → `current_intake`
- Stabilize / `cohere` → `flow_alignment`
- P+S → `stable_transmission`
- A+S → `held_intake`
- P+A → `recirculating_exchange`
- P+A+S → `full_conduit_alignment`

These mappings live in `entityRecipes.json` under the Relay's `ecologyGrammar` profile.

## Architecture

`EntitySystem` remains the sole real entity movement/behavior owner. It now discovers entity placements from all authored local-cell recipes rather than only the initial nursery cell. Tender/Watcher visibility laws remain explicit and unchanged; generic regional organisms appear only in their authored home cell.

The following existing bridges were generalized to read `recipe.ecologyGrammar` for non-Tender/Watcher organisms while preserving the two existing special cases:

- `EntityRelationshipGrammarSystem`
- `EntityReciprocalMemorySystem`
- `EntityReciprocalBehaviorSystem`
- `EntityLocalMatterCouplingSystem`
- `EntityEcologicalResidueSystem`
- `EntityResidueRecognitionSystem`

`EntityEcologicalCrossInfluenceSystem` and `EntityEcologyResonanceSystem` were not changed. Their existing generic fallbacks remain the proof that Q does not require organism #3 copies throughout the ecology chain.

## Runtime diff vs HC-028P

Exactly nine runtime JS files differ:

1. `src/main.js`
2. `src/ecology/EntitySystem.js`
3. `src/ecology/EntityRelationshipGrammarSystem.js`
4. `src/ecology/EntityReciprocalMemorySystem.js`
5. `src/ecology/EntityReciprocalBehaviorSystem.js`
6. `src/ecology/EntityLocalMatterCouplingSystem.js`
7. `src/ecology/EntityEcologicalResidueSystem.js`
8. `src/ecology/EntityResidueRecognitionSystem.js`
9. `src/visual/composers/EntityVisualComposer.js`

No new runtime JS file was added. **101 HC028P runtime owners are byte-locked.**

Authored data changes are limited to the new host function, entity recipe, Vascular placement, visual recipe, and HC028Q build/contract/hash records.

## Locked gameplay authority

HC028Q adds no player movement authority, route authority, combat, targeting, bond, repair, guide behavior, affinity score, progression, loot, resource farming, route gate, objective requirement, new button, save-state ecology, or new particle field. Vascular route physics remain owned by `VascularRhythmRouteSystem`; Host-mote presentation remains in the established ecology/material owners.

## Validation

- HC028Q direct contract: PASS
- profile-driven chain proof: PASS
- Relay recipe/function/visual/cell placement: PASS
- 3 paired stations / 6 vanes source proof: PASS
- Tender/Watcher special visibility source proof: PASS
- generic bridges contain no literal `vascular_relay_001`: PASS
- HC028P cross-influence non-recursion preserved: PASS
- HC028L1 startup method-body scope regression: PASS
- RecipeDataSystem load: PASS
- undefined `this.method()` audit: PASS
- runtime JS syntax: **110/110 PASS**
- public JSON parse: **422/422 PASS**
- HC028P locked runtime owners: **101/101 PASS**

Telemetry remains `blob.session.telemetry.v1.17`; the pass did not require a new telemetry event owner.

## Render boundary

The package contains no local `node_modules`, so a Vite/browser render was not executed in this environment. Live play remains required for visual scale, current anchoring, occlusion, and feel.
