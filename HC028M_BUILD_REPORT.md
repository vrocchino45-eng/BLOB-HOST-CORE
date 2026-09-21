# HC028M Build Report — Reciprocal Ecology / Local Matter Coupling

## Intent
Close the first ecological causal loop by letting an organism's retained relationship state visibly alter **nearby existing Host matter**, without granting the organism gameplay/world authority.

## Parent
- **Parent:** HC-028L1 — Startup Scope Hotfix
- **Build:** HC-028M — Reciprocal Ecology Local Matter Coupling
- **Version:** 0.28.22
- **Telemetry:** `blob.session.telemetry.v1.13`

## Owner audit
The current environment already has one broad low-cost Host matter owner: `AmbientMaterialInteractionSystem`, with 66 motes carrying regional composition, chemistry, sonar/material replies and verb readability. HC028M therefore does **not** create another particle field or environmental simulation.

New `EntityLocalMatterCouplingSystem` reads only:
- HC028K reciprocal memory,
- HC028L reciprocal behavior,
- current authored entity root position,
- current regional composition identity/phrase strength.

It publishes up to two bounded local fields (the only live authored organisms are still Tender + Watcher). The existing ambient material owner consumes those fields on the following frame.

## Tender matter signatures
- `approach_care` / retained care → **care_breath**: gentle gather + breathing radial exchange.
- guarded memory → **protective_retraction**: tighter inward contraction and damping.
- settled memory → **coherent_settle**: quiet local ordering.
- attentive remembered signal → **signal_follow**: restrained tangential carry.

## Watcher matter signatures
- retained sample → **sample_hold**: local material gathers and damps around the anchored sensor.
- counter-sensing → **counter_sense_ripple**: restrained tangential scanning ripple.
- defensive memory → **anchored_quiet**.
- settled observation → **quiet_observation**.

## Regional inheritance
HC028M does not author a per-region entity-effect table. The organism field and HC028F regional physical embodiment act on the **same motes**. This allows one remembered relationship to remain recognizable while Vascular current, Silt compression, Grave settling, Comb sorting, Aperture openness, etc. continue to define the place.

## Explicitly unchanged
- Tender bond thresholds and repair rates.
- Tender/Watcher movement and authored state logic (`EntitySystem` is byte-locked).
- HC028J relationship interpretation.
- HC028K memory commit/duration.
- HC028L reciprocal behavior directive.
- player movement / H1 topology environmental handling.
- verb power/range/cost/targeting.
- chemistry and Core Work.
- Host clock and regional composition ownership.
- Hub/route completion.
- HC028I1 Comb re-entry/return arming.
- HC028L1 startup-scope repair.

## Runtime diff from HC028L1
Changed/new runtime JS only:
1. `src/ecology/EntityLocalMatterCouplingSystem.js` — new read-only coupling bridge.
2. `src/world/AmbientMaterialInteractionSystem.js` — consumes bounded local fields using existing motes.
3. `src/core/GameRuntime.js` — construction/registration.
4. `src/core/SessionTelemetrySystem.js` — v1.13 coupling event.
5. `src/main.js` — build identity.

**102 other HC028L1 runtime owners are byte-identical.**

## Telemetry
New event: `ecology.entity_local_matter_coupling.changed`.

Records organism, local matter mode, strength/radius and regional matter context. Developer payload explicitly declares no particles, geometry, movement, collision, chemistry, bond, repair, combat, route or progression authority.

## Validation
- HC028M contract/direct mapping proof: PASS.
- Tender care vs guarded and Watcher sample vs counter-scan resolve to distinct local matter signatures: PASS.
- 107/107 runtime JS `node --check`: PASS.
- 407/407 public JSON parse: PASS.
- RecipeDataSystem load: PASS.
- undefined `this.method()` audit: PASS.
- 102 parent runtime-owner hashes: PASS.
- HC028I1 / HC028L1 boundary owner remains locked.

## Render limitation
No local `node_modules` are included. Vite/browser rendering was not executed in this environment. Live browser/controller playtest is still required to judge whether the local Host response is clear but not over-articulated.
