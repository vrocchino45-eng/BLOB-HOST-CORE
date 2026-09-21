# HC-031A1 Build Report — Grave II Octave Resonance + Exit Safety

Parent: **HC-031A**

## Why this correction exists
The HC031A playtest failed its main acceptance test: Grave II was not visibly different on the second visit and the return fold could become unavailable. HC031A1 corrects those two failures before any Vascular II / Silt II work.

## Design correction
A return region is no longer framed as a rearranged version of a map. The first visit is the region's **fundamental**. A return visit is the same authored structure at the next **octave**: resolution doubles from 3 to 6, while resonance determines growth amplitude, phase, spread, and local emphasis. The authored landmarks and regional identity remain the same.

## Activation fix
Grave II now reads the authoritative `act1RouteHistory.routeStates.grave_memory_route.entryCount`, with the older flat `graveEntryCount` only as compatibility fallback.

## Exit safety
Grave II no longer gates the Grave→Hub crossing. The original Grave fold becomes usable whenever Grave I says it is ready. The three Grave II resonances grant phase-2 progression credit; they do not grant permission to leave.

## Physical octave growth
On a valid second visit, the existing Grave anatomy grows from itself: scar ribs, memory strata, distant marrow wall, residue bed, and the original three phase-2 ChemObject landmarks are stretched/deepened from their original transforms. There is no random room generation and no replacement Grave scene.

## Locked systems
HC029/030 interaction grammar remains mechanically unchanged. No new buttons, targeting thresholds, verb ranges, material-state thresholds, or personality mappings were added.

## Acceptance boundary

- Grave II must activate from authoritative route history on the second entry.
- The change must be perceptible as physical growth within seconds.
- Existing landmarks remain recognizable and targetable.
- Player can leave before any/all phase-2 resonances are resolved.
- Phase-2 completion still awards exactly one Grave credit.
- No Vascular II / Silt II work is included.

## Validation

- HC031A1 octave/activation/exit-safety contract + progression smoke: **PASS**
- RecipeData load: **PASS**
- undefined `this.method()` audit: **PASS**
- runtime JS syntax: **116/116 PASS**
- public JSON parse: **451/451 PASS**
- HC031A parent runtime owners: **110/110 SHA-256 PASS**
- runtime diff vs HC031A: **exactly 6 intended JS files**
- production Vite render: **not claimed** (`node_modules` not bundled)
