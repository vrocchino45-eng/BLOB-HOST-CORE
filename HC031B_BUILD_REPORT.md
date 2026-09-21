# HC-031B Build Report — Grave II Resonance Gameplay

Parent: **HC-031A1 — Grave II Octave Resonance + Exit Safety**

## Mode
Convergence / gameplay proof. This pass deepens the already-proven Grave II octave instead of expanding to Vascular II or Silt II.

## Purpose
Make the grown Grave behave like a higher octave, not only look like one. The three familiar Grave landmarks become one coupled regional resonance field. Existing Pulse / Absorb / Stabilize intent changes a local node and produces bounded consequences in the other nodes.

## Regional law
**Touch one part of the octave and other parts answer.**

The coupled nodes are:
- Memory Silt — retention / accumulation.
- Protective Scar — resistance / redirection.
- Inheritance Remnant — redistribution / inherited contradiction.

## What changed
- Added `GraveResonanceGameplaySystem` as the single owner of Grave-II regional resonance gameplay.
- Pulse and Absorb propagate role-specific bounded deltas into the other Grave landmarks.
- Stabilize reduces disagreement across the regional field instead of satisfying a local hidden check.
- Existing target response pivots and existing HC031A1 witness/strata geometry carry the feedback; no new rings, cages, target lines, or ability VFX were added.
- Replaced HC031A/A1's exact three-chord phase-2 completion logic with a sustained regional-condition rule.
- Added three valid Grave-II resolutions: `quiet_retention`, `shared_memory`, and `held_contradiction`.
- Resolution emits the existing `grave:phase_2` progression event. `ReturnRegionEngineSystem` remains the progression-credit owner.
- Grave exit remains independent and always uses the existing Grave-I return-fold readiness/crossing owner.
- Telemetry advances to `blob.session.telemetry.v1.23` and records regional mean/spread, candidate resolution, hold progress, propagation events, touched-node count, and final resolution identity.

## Allowed scope
- One Grave-II-only regional resonance owner.
- Bounded presentation modulation on the three existing Grave ChemObjects and HC031A1 witness/strata geometry.
- Runtime wiring, telemetry, build identity, validation and handoff docs.

## Forbidden scope
- New buttons or abilities.
- New target-selection behavior.
- New Grave landmarks or replacement rooms.
- Vascular II / Silt II content.
- Changes to HC030A per-object reactive-state authority.
- Changes to HC030B material/entity personality authority.
- Exit gating based on Grave-II resolution.
- Random/procedural room generation.

## Locked systems
112 HC031A1 parent source-JS owners are SHA-256 locked. In particular, targeting, verb composition, reactive state, response personality, visual hierarchy compression, Core engine firing/sequencing, Grave-I gameplay, Vascular/Silt routes, camera, controls, chemistry/Bond outcomes, and LocalCellBoundary crossing authority remain unchanged.

## Runtime diff from HC031A1
Existing runtime owners intentionally changed:
- `src/main.js`
- `src/core/GameRuntime.js`
- `src/core/SessionTelemetrySystem.js`
- `src/routes/GraveReturnRegionSystem.js`

New runtime owner:
- `src/routes/GraveResonanceGameplaySystem.js`

## Acceptance tests
- Acting on one Grave landmark perturbs at least one other landmark.
- Stabilize can reduce regional spread without an exact chord sequence.
- A valid regional condition must persist before phase 2 resolves.
- More than one regional resolution is valid.
- Grave II resolution grants credit but never permission to exit.
- HC031A1 octave geometry remains recognizable and spatially authoritative.
- No new controller input or targeting authority.

## Validation
- HC031B contract + behavioral smoke: PASS.
- RecipeDataSystem load validation: PASS.
- Undefined `this.method()` audit: PASS.
- Parent lock: 112 / 112 expected HC031A1 source owners preserved.
- Source JS count: 117.
- Public JSON count: 454.

Production Vite render is not claimed because `node_modules` is not bundled in this package. Live browser/controller play remains visual/feel authority.
