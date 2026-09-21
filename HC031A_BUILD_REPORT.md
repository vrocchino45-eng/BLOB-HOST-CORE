# HC-031A Build Report — Grave II Return Region Engine Proof

Parent: **HC-030B1 — Visual Hierarchy Compression**

## Mode

Convergence / recursive-region gameplay proof.

## Purpose

Prove that an existing Hub path can return as a recognizable but deeper second-phase region using the interaction grammar established in HC029/030, while establishing a reusable 3 → 6 → 12 progression architecture for future Grave / Vascular / Silt returns.

The pass answers two questions:

1. Can Grave II feel like the same place remembering and deepening rather than a new level?
2. Can completed route phases physically resolve the existing Core engine from 3 to 6 to 12 without adding controller buttons?

## Locked foundation

- HC029A relationship targeting and intentional handoff.
- HC029B effect ownership.
- HC029C verb composition.
- HC030A reactive-state grammar.
- HC030B material/entity response personality.
- HC030B1 visual hierarchy compression.
- Existing Grave I authored landmarks and `GraveMemoryRouteSystem` remain byte-identical.
- Vascular I and Silt I gameplay owners remain byte-identical.

Exactly **108** HC030B1 runtime owners are SHA-256 locked.

## New architecture

### ReturnRegionEngineSystem

A deterministic return-region composition/progression owner. It reads:

`Base Region DNA × Visit Phase × Core Topology × Retained Route History × Ecological Memory × Reactive Pressure`

and publishes bounded layout parameters. There is **no random room generation**.

The same owner counts physical progression credits:

- first Grave + Vascular + Silt resolutions = 3 credits,
- second Grave + Vascular + Silt resolutions = 6 credits,
- four total resolutions across each foundational route family = 12 credits.

At 6 credits, the existing `CoreEngineSystem` consumes the progression truth and promotes from `triadic_3` to `paired_6`. At 12 it promotes to `continuous_12`.

### GraveReturnRegionSystem

Grave II activates only after the player has already returned from Grave I and enters Grave again (`graveEntryCount >= 2`). It is attached to the existing Grave route root, so all original landmarks, route scale, entry anchoring and spatial identity remain present.

The return-layout equation is latched at entry so the region does not randomly reshape while the player presses verbs.

## Grave II grammar

Three existing Grave landmarks gain second-resolution meaning:

1. `residue_silt_cloud_001` + **Stabilize + Absorb (`cohere_draw`)**
   - retain/draw memory without collapsing its trace.
2. `scar_lock_plate_001` + **Stabilize + Pulse (`cohere_project`)**
   - move protective scar while keeping it coherent.
3. `inheritance_seed_remnant_001` + **Pulse + Absorb + Stabilize (`full_system`)**
   - hold inherited contradiction in temporary equilibrium.

Each read requires a retained HC029 relationship to the original ChemObject. The return layer therefore cannot bypass targeting or invent proximity-only puzzle verbs.

When all three second-resolution reads complete, Grave II emits one phase-2 progression credit.

## Return crossing

`LocalCellBoundaryMorphSystem` remains the sole crossing owner. HC031A changes only Grave return readiness:

- Grave I behaves exactly as before.
- During active unresolved Grave II, the already-existing return fold is held.
- When Grave II resolves, the same Grave→Hub fold becomes usable again.

No new gate, teleport, exit object or branch menu is introduced.

## Core engine progression

`CoreEngineSystem` remains the sole firing-order/sequencing owner. HC031A adds only a progression consumer:

- `< 6 credits` → 3-phase,
- `>= 6 credits` → 6-phase,
- `>= 12 credits` → 12-phase.

The current Grave II proof can only contribute credit #4 after the three original paths have been resolved. Vascular II and Silt II are intentionally not built in this pass.

## Allowed runtime diff vs HC030B1

Existing runtime files changed:

1. `src/main.js` — build identity.
2. `src/core/GameRuntime.js` — new owner construction/registration.
3. `src/core/SessionTelemetrySystem.js` — observe Grave II state/progression only.
4. `src/data/RecipeDataSystem.js` — load return-region grammar data.
5. `src/morph/LocalCellBoundaryMorphSystem.js` — Grave II return-fold readiness only.
6. `src/player/CoreEngineSystem.js` — consume progression-unlocked phase count.

New runtime files:

7. `src/routes/ReturnRegionEngineSystem.js`
8. `src/routes/GraveReturnRegionSystem.js`

## Forbidden scope

- no new player button,
- no target cycling,
- no targeting threshold changes,
- no primitive verb power/range/cost tuning,
- no changes to HC030A condition thresholds,
- no changes to HC030B personality mappings,
- no Vascular II or Silt II content yet,
- no random/procedural room generation,
- no new gate owner,
- no menu-based progression unlock.

## Acceptance tests

1. Grave I owner remains byte-identical.
2. Grave II does not activate on first Grave entry.
3. Grave II activates on a real second entry after Grave has returned.
4. Return layout is deterministic and latched for the visit.
5. Original Grave landmarks remain present and targetable.
6. Each Grave II resolution requires the intended retained relationship + chord.
7. Existing return fold is held only while Grave II is active and unresolved.
8. Grave II completion emits exactly one phase-2 credit.
9. Original three route completions resolve 3 credits.
10. Three second-phase route credits resolve 6 and promote Core engine to `paired_6`.
11. No new controller input exists.
12. HC029/030 locked systems remain byte-identical.

## Validation

Final package validation:

- HC031A contract + return/progression behavioral smoke: **PASS**
- RecipeData load: **PASS**
- undefined `this.method()` audit: **PASS**
- runtime JS syntax: **116/116 PASS**
- public JSON parse: **447/447 PASS**
- HC030B1 locked runtime owners: **108/108 SHA-256 PASS**
- runtime diff vs HC030B1: **exactly 8 intended JS files**
- production Vite render: **not claimed** (`node_modules` is not bundled in this environment)
