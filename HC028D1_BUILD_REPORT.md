# HC-028D1 Build Report — Verb ↔ Engine Coupling

## Purpose
Connect canonical Pulse / Absorb / Stabilize intent to the already-working 3→6→12 gyroscopic Core without changing verb gameplay authority.

## Runtime change
Added `src/player/CoreVerbEngineCouplingSystem.js` as a read-only bridge. It reads `frameState.input` and `frameState.coreEngine`, smooths presentation drive for the three functions, and publishes `frameState.coreVerbEngineCoupling`.

Diagnostic relationships:
- `project` — Pulse
- `draw` — Absorb
- `cohere` — Stabilize
- `exchange` — Pulse + Absorb
- `cohere_project` — Stabilize + Pulse
- `cohere_draw` — Stabilize + Absorb
- `full_system` — all three

These states do not create new abilities.

## Core presentation
`CoreEmbodimentSystem` now consumes the bridge:
- Pulse plane expands/brightens and a transient internal carrier travels nucleus → Pulse plane.
- Absorb plane contracts/brightens and the carrier travels Absorb plane → nucleus.
- Stabilize brightens its plane and reduces gyroscopic precession without freezing orientation.
- Simultaneous inputs can show multiple conduits at once.

The existing spherical tri-axial gyroscope remains the geometry. No top/bottom axis was introduced.

## Locked gameplay
Byte-identical to HC-028D:
- CoreEngineSystem
- CoreVerbPhysicalizationSystem
- CoreWorldResonanceSystem
- HostRhythmSystem / WorldCompositionRegistry
- PlayerMovementController
- LocalCellBoundaryMorphSystem
- VascularRhythmRouteSystem
- SiltPressureRouteSystem
- GraveMemoryRouteSystem
- InputSystem / ControlMap

Therefore D1 does not alter engine sequencing, external verb strength, Vascular cadence truth, movement, route transitions, Silt/Grave, controller mapping, or A ownership.

## Telemetry
Telemetry schema is `blob.session.telemetry.v1.4`. It adds `core.verb_engine.chord_changed`, recording diagnostic chord and per-function drive. Telemetry remains read-only.

## Validation
- 96/96 runtime JS files pass `node --check`.
- `validateHC028D1VerbEngineCoupling.mjs`: PASS.
- `npm run validate:current`: PASS.
- RecipeDataSystem load validation: PASS.
- Undefined `this.method()` audit: PASS.
- Parent hash lock confirms all listed locked owners are byte-identical to HC-028D.
- No A/interact consumption exists inside `CoreVerbEngineCouplingSystem`.

## Acceptance target
The player should be able to watch the Core and intuit that Pulse, Absorb, and Stabilize are three functions of one internal engine. The pass fails if the new visuals read as UI, if combined inputs secretly become power combos, or if any existing traversal/rhythm behavior changes.
