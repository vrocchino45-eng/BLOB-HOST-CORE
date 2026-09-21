# HC-028P Build Report — Ecological Cross-Influence

## Parent
HC-028O — Residue Recognition.

## Purpose
HC028O proved that an existing organism can read another organism's temporary HC028N Host residue as information. HC028P adds exactly one next physical link: the recognizing organism may briefly bias the existing Host material around its own body. This proves **organism A → Host residue → organism B recognition → organism B local Host reply** without giving either organism new gameplay authority.

## Architecture
New `src/ecology/EntityEcologicalCrossInfluenceSystem.js` reads same-frame HC028O recognition after the organism body has already articulated that read. It accepts only `relation: "other_trace"` recognitions. Self-traces never trigger cross-influence.

Runtime order remains non-recursive:

`prior-frame HC028N residue → HC028O recognition → existing body presentation → HC028P cross-influence directive → next-frame existing Host-mote owner`

`EntityEcologicalResidueSystem` does **not** read HC028P. Therefore a cross-influence reply cannot write a new residue and cannot recursively bounce between organisms.

## Tender response
When the Tender reads Watcher-derived sensor/counter/guarded residue, HC028P publishes `protective_listening_hush`: a short tighter/damped local Host response around the Tender. Other benign cross-organism traces use `received_trace_settle`.

The Tender does not navigate toward the trace and its bond/repair behavior is unchanged.

## Watcher response
When the Watcher reads Tender care/coherent/guarded residue, HC028P publishes `foreign_signature_hold`: a compact local hold/sample response around the anchored Watcher. Counter/compare interpretations use `cross_signature_compare`, adding a restrained tangential comparison ripple.

The Watcher remains physically anchored by the unchanged `EntitySystem`.

## One-shot response rule
A continuous recognition can provoke only one ~3.8–4.8 second cross-influence response. It will not continually restart while the same residue remains in range. Recognition must genuinely become inactive before that organism can answer again.

This prevents a stationary Tender/Watcher pair from producing an endless autonomous visual loop.

## Host material ownership
`AmbientMaterialInteractionSystem` remains the only owner that moves the existing 66 Host motes. HC028P only publishes bounded response fields. No new particles, geometry or draw calls were added.

## Explicit non-authority
HC028P cannot:
- create, consume, refresh or extend HC028N residue;
- write HC028K reciprocal memory;
- change Tender bond/repair;
- move or steer an entity;
- change Watcher anchoring;
- create affinity/XP;
- target the player or an object;
- alter collision, player movement, chemistry, routes, progression or save state.

## Runtime diff vs HC028O
Exactly five runtime JS files differ:
1. `src/core/GameRuntime.js` — construct/register cross-influence bridge.
2. `src/core/SessionTelemetrySystem.js` — telemetry v1.17 + cross-influence event.
3. `src/ecology/EntityEcologicalCrossInfluenceSystem.js` — new non-recursive cross-organism response bridge.
4. `src/world/AmbientMaterialInteractionSystem.js` — consumes the bounded HC028P fields using the existing Host motes.
5. `src/main.js` — HC028P build identity.

All other **105 HC028O runtime JS owners are SHA-256 locked**, including `EntitySystem`, `EntityResidueRecognitionSystem`, `EntityEcologicalResidueSystem`, `EntityLocalMatterCouplingSystem`, `EntityEcologyResonanceSystem`, `CameraReadabilitySystem`, movement, chemistry, Hub/Comb/route owners and the HC028L1 boundary hotfix owner.

## Telemetry
Schema: `blob.session.telemetry.v1.17`.

New sparse event: `ecology.entity_cross_influence.changed`.

It records responding organism, response mode/stage, source organism/mode and explicit false authority flags.

## Validation
- HC028P direct cross-influence semantics — PASS.
- Other-trace only / self-trace blocked — PASS.
- One-shot continuous-recognition behavior — PASS.
- Recognition reset required before retrigger — PASS.
- Cross-influence follows recognizing organism while active — PASS.
- Cross-influence cannot write HC028N residue — PASS.
- RecipeDataSystem load — PASS (historical recipe identity reports HC-015N as expected).
- Undefined `this.method()` audit — PASS.
- Descendant HC028L1 startup-scope method-body smoke — PASS.
- Runtime source syntax: **110/110 JS** — PASS.
- Public data parse: **419/419 JSON** — PASS.
- HC028O parent runtime hashes: **105/105 locked owners** — PASS.
- Runtime diff vs HC028O: exactly **5 files** — PASS.

## Render note
The package still has no local `node_modules`, so a Vite/browser render is not claimed from this environment. The focused playtest is the perceptual authority.
