# HC-028R Build Report — Regional Ecology Distribution

## Purpose

HC028R is the final foundational ecology distribution pass before the Golden Host Slice. It does not invent another organism or ecology mechanic. It separates **species recipe** from **population instance** so the three proven organisms can recur through the existing Host without duplicating their relationship/memory/residue grammar.

## Source audit result

The live runtime still contains three organism recipes only:

- `nursery_membrane_tender_001` — care / repair / symbiosis
- `membrane_watcher_001` — anchored sensing / sampling / warning
- `vascular_relay_001` — carry / align / release

`Aperture Fields` remains source-authored with `ecologyGameplayReady: false`, so HC028R does not mount organisms there.

## Population model

`localCellRecipes.json` now supports optional `contents.entityPlacements` records. Each placement has an `instanceId` and references an existing `recipeId`. `EntitySystem` still owns all real entity creation, visibility and movement/body behavior.

The ecology chain now keys temporary relationship state by **instance identity**, while species-specific interpretation continues to come from the shared recipe. This prevents multiple Relays or Watchers from overwriting each other's memory/residue state.

The affected ecology chain is:

`EntityRelationshipGrammarSystem → EntityReciprocalMemorySystem → EntityReciprocalBehaviorSystem → EntityLocalMatterCouplingSystem → EntityEcologicalResidueSystem → EntityResidueRecognitionSystem → EntityEcologicalCrossInfluenceSystem → EntityEcologyResonanceSystem`

Self/other residue recognition is also instance-aware: two Watchers sharing the same species recipe still correctly recognize one trace as self and the other as another organism's trace.

## Authored distribution

### Surface Wake

Existing Tender + original Nursery Watcher remain unchanged.

### Vascular Rhythm

Three Relay individuals form a sparse current-borne chain:

- `vascular_relay_001` — upstream handoff
- `vascular_relay_mid_001` — midstream handoff
- `vascular_relay_downstream_001` — downstream handoff

All three reuse `vascular_relay_001` species grammar and the existing Vascular current.

### Grave Memory

- `grave_memory_watcher_001` reuses the Watcher species as a residue witness.

It remains physically anchored and has no route or targeting authority.

### Silt Pressure

- `silt_pressure_relay_001` reuses the Relay species as a pressure-stranded handoff organism.

It inherits Silt's local physical field rather than introducing Silt-specific movement physics.

### Comb Threshold

- `comb_filter_watcher_001`
- `comb_filter_relay_001`

This is the first authored non-nursery location where two ecology species coexist close enough for HC028N/O/P residue recognition and cross-influence to become visible without adding a new signaling system.

### Aperture Fields

No organism population mounted. The source remains `ecologyGameplayReady: false`.

## Runtime scope vs HC-028Q

Exactly 10 runtime JS files differ:

1. `src/main.js`
2. `src/ecology/EntitySystem.js`
3. `src/ecology/EntityRelationshipGrammarSystem.js`
4. `src/ecology/EntityReciprocalMemorySystem.js`
5. `src/ecology/EntityReciprocalBehaviorSystem.js`
6. `src/ecology/EntityLocalMatterCouplingSystem.js`
7. `src/ecology/EntityEcologicalResidueSystem.js`
8. `src/ecology/EntityResidueRecognitionSystem.js`
9. `src/ecology/EntityEcologicalCrossInfluenceSystem.js`
10. `src/ecology/EntityEcologyResonanceSystem.js`

**100 HC028Q runtime JS owners are byte-locked.** Regional route physics, player movement, camera, Host-mote ownership, Hub/Comb boundary traversal and chemistry remain locked.

## Gameplay authority

HC028R adds no player movement, route, objective, combat, targeting, bond, repair, affinity, loot, chemistry or save-state authority. It adds no new button, particle field or organism recipe.

## Validation

- HC028R direct contract: PASS
- three existing species only: PASS
- seven distributed population instances: PASS
- multi-instance shared-recipe ecology keying: PASS
- instance-level self/other residue recognition: PASS
- non-recursive cross-influence: PASS
- Aperture ecology remains unmounted: PASS
- HC028L1 startup-scope descendant smoke: PASS
- RecipeDataSystem load: PASS
- undefined `this.method()` audit: PASS
- runtime JS syntax: **110/110 PASS**
- public JSON parse: **425/425 PASS**
- HC028Q locked runtime owners: **100/100 PASS**

Telemetry remains `blob.session.telemetry.v1.17`; this distribution pass did not require a new telemetry schema.

## Render boundary

The package contains no local `node_modules`, so Vite/browser rendering was not executed here. Live play is required to calibrate population spacing, visual density and whether recurrence reads as ecology rather than repeated props.
