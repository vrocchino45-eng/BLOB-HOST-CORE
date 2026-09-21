# HC028M1 Build Report — Ecological Consequence Readability

## Intent
Converge the HC028M ecology loop so the player can visually parse cause and consequence without debug HUD: **Core relationship → organism interpretation → retained response → local Host matter → decay**.

## Parent
- **Parent:** HC-028M — Reciprocal Ecology Local Matter Coupling
- **Build:** HC-028M1 — Ecological Consequence Readability
- **Version:** 0.28.23
- **Telemetry:** `blob.session.telemetry.v1.14`

## Why this pass exists
The HC028M playtest showed the ecology loop functioning, but the local-matter response often began while Core VFX and organism response were still visually dominant. The result was coherent but causally ambiguous: the player could see activity without clearly reading which layer caused the next.

## Implementation
### 1. Causal local-matter envelope
`EntityLocalMatterCouplingSystem` now stages the existing coupling as:
- `forming` — live chord/organism body owns the immediate read; Host matter stays deliberately subdued.
- `answering` — after release, the local matter response rises over ~0.58 s.
- `expressing` — retained memory sustains the full local Host answer.
- `releasing` — the local pocket loosens back into regional matter as memory fades.

This adds no affinity, success state, timing gate, route state or gameplay outcome.

### 2. Tighter organism-local Host pocket
`AmbientMaterialInteractionSystem` still owns the same 66 Host motes. HC028M1 recruits a deterministic subset into a soft shell around the organism:
- Tender care uses a looser breathing shell.
- Tender guarded response tightens/retracts.
- Watcher sample uses a tighter held pocket.
- Watcher counter-sense remains more tangential/scanning.

Regional composition, Host rhythm, chemistry and existing material laws continue acting on the same motes simultaneously. No new particle field, geometry or draw call is added.

### 3. Existing camera-readability accommodation
`CameraReadabilitySystem` now considers the camera→organism corridor while an HC028M1 consequence is active and the Core is within 4.2 units of that organism. Existing fade/pullback values may soften eligible foreground tissue.

This is not lock-on or a new camera mode. `CameraReadabilitySystem` still only publishes readability values; the existing camera runtime remains authoritative.

## Runtime diff from HC028M
Changed runtime JS only:
1. `src/ecology/EntityLocalMatterCouplingSystem.js` — causal staging + local shell metadata.
2. `src/world/AmbientMaterialInteractionSystem.js` — existing-mote cohort/shell response.
3. `src/camera/CameraReadabilitySystem.js` — bounded Core→organism corridor readability.
4. `src/core/SessionTelemetrySystem.js` — v1.14 causal-stage telemetry.
5. `src/main.js` — build identity.

**102 other HC028M runtime owners are byte-identical.** `GameRuntime`, `EntitySystem`, reciprocal memory/behavior, player movement, routes, chemistry and the HC028I1/HC028L1 boundary owner are locked.

## Telemetry
`ecology.entity_local_matter_coupling.changed` now keys on organism + matter mode + causal stage and records `causalStage`, `causalEnvelope01`, live-relationship state and the explicit causal sequence.

## Validation
- HC028M1 contract/direct envelope proof: PASS.
- Live chord remains subdued (`forming` <= 0.30 envelope): PASS.
- Release produces `answering` then `expressing`: PASS.
- Low retained strength produces `releasing`: PASS.
- Tender care shell vs Watcher sample shell remain distinct: PASS.
- Exact HC028L1 first-slice startup method executed with no `recipe` scope: PASS.
- 107/107 runtime JS `node --check`: PASS.
- 410/410 public JSON parse: PASS.
- RecipeDataSystem load: PASS.
- undefined `this.method()` audit: PASS.
- 102 parent runtime-owner hashes: PASS.

## Render limitation
The handoff contains no local `node_modules`, so Vite/browser rendering was not executed here. The supplied HC028M video was the visual basis for the convergence target; HC028M1 still requires live browser/controller confirmation.
