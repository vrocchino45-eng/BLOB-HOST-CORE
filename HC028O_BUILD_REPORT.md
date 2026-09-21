# HC-028O Build Report — Residue Recognition

## Parent
HC-028N — Ecological Residue / Local Host Memory.

## Purpose
HC028N proved that a completed organism relationship can leave a faint temporary world-space Host trace. HC028O proves the next link: an existing organism can later perceive that trace as information. This is deliberately **recognition**, not autonomous ecology yet.

## Architecture
New `src/ecology/EntityResidueRecognitionSystem.js` reads the active-cell fields already published by `EntityEcologicalResidueSystem`. It chooses the strongest nearby readable trace for each visible organism and publishes an organism-specific interpretation plus distance/bearing/strength.

Runtime order is intentionally non-circular:

`HC028N residue from prior frame → HC028O recognition → EntityEcologyResonanceSystem body presentation → HC028M1 local matter → HC028N residue update`

The maximum one-frame handoff at residue birth/death is preferred to allowing recognition to feed back into the residue that caused it.

## Tender interpretation
Tender treats care/rest traces as familiar/safe/coherent information and sensor/counter traces as cautious information. Existing body parts express this through restrained canopy/frond opening/guarding and seed-sac light response. Root movement is untouched.

## Watcher interpretation
Watcher treats care/rest traces as signatures to sample, its own sample trace as verification, and counter traces as compare/verify information. Existing lens, pupil, sensing bulbs, anchor threads, warning ring and signal light articulate the read. The Watcher remains physically anchored by the unchanged `EntitySystem`.

## Explicit non-authority
HC028O cannot:
- consume or refresh HC028N residue;
- write HC028K reciprocal memory;
- move or steer an entity;
- change Tender bond/repair;
- change Watcher anchoring;
- create affinity/XP;
- target the player or an object;
- alter collision, movement, chemistry, routes, progression or save state.

## Runtime diff vs HC028N
Exactly five runtime files differ:
1. `src/core/GameRuntime.js` — construct/register recognition bridge.
2. `src/core/SessionTelemetrySystem.js` — telemetry v1.16 + recognition event.
3. `src/ecology/EntityEcologyResonanceSystem.js` — presentation-only body articulation of recognition.
4. `src/ecology/EntityResidueRecognitionSystem.js` — new read-only recognition bridge.
5. `src/main.js` — HC028O build identity.

All other 104 HC028N runtime JS owners are SHA-256 locked, including `EntitySystem`, `EntityEcologicalResidueSystem`, `EntityLocalMatterCouplingSystem`, `AmbientMaterialInteractionSystem`, `CameraReadabilitySystem`, `PlayerMovementController`, and `LocalCellBoundaryMorphSystem`.

## Telemetry
Schema: `blob.session.telemetry.v1.16`.

New sparse event: `ecology.entity_residue_recognition.changed`.

It records entity/interpretation/source mode/relation/strength/distance plus explicit false authority flags.

## Validation target
- Direct recognition semantics for Tender and Watcher.
- Same residue interpreted differently by organism role.
- Fading residue produces a weaker read.
- Recognition does not mutate the residue field.
- Runtime registration proves non-circular prior-frame handoff.
- 104 parent runtime owners remain byte-identical.
- Full JS syntax, JSON parse, recipe-data, undefined-method, HC028L1 startup-scope and ZIP integrity checks.

## Render note
The package still has no local `node_modules`, so a Vite/browser render is not claimed from this environment. Use the focused playtest for perceptual validation.

## Final validation
- `npm run validate:current` — PASS.
- HC028O direct contract/recognition semantics — PASS.
- RecipeDataSystem load — PASS (historical recipe identity reports HC-015N as expected).
- Undefined `this.method()` audit — PASS.
- Descendant HC028L1 startup-scope method-body smoke — PASS.
- Runtime source syntax: **109/109 JS** — PASS.
- Public data parse: **416/416 JSON** — PASS.
- HC028N parent runtime hashes: **104/104 locked owners** — PASS.
- Runtime diff vs HC028N: exactly **5 files** — PASS.
- Historical `validateHC028L1StartupScopeHotfix.mjs` remains build-identity-bound and was not modified; HC028O carries the same exact method-body runtime smoke in its descendant validator instead.
