# HC-030B Build Report — Material / Entity Response Personality

Parent: **HC-030A — Reactive State Grammar**

## Mode

Convergence / world-response differentiation pass.

## Purpose

HC030B keeps HC030A's one shared reactive condition grammar, then lets existing authored matter and organism identity determine **how that condition and the existing verbs are expressed**.

The pass answers one question only:

> If two things are equally strained or unstable, do they now look and feel like different kinds of things?

HC030B does **not** add a new condition state, new verb, target mode, entity AI goal, route rule, progression gate, region, or content object.

## Locked foundation

- HC029A retained relationship targeting and deliberate camera handoff.
- HC029B relationship effect ownership.
- HC029C verb composition meanings and modifiers.
- HC030A `coherent -> strained -> unstable -> failing` thresholds and condition ownership.
- authored chemistry recipes, entity recipes, controls, routes and progression.

## Allowed runtime scope

Intentional runtime JS diff vs HC030A is limited to:

1. `src/main.js` — build identity only.
2. `src/core/GameRuntime.js` — construct/register the single personality owner after HC030A condition and before Bond.
3. `src/interaction/ResponsePersonalitySystem.js` — **new** authored-identity interpretation owner.
4. `src/chemistry/ChemObjectSystem.js` — existing visual response pivot consumes personality multipliers.
5. `src/chemistry/BondSystem.js` — existing Absorb owner consumes bounded personality progress/pull/spin multipliers.
6. `src/ecology/EntityEcologyResonanceSystem.js` — existing organism presentation consumes entity personality; vascular relay receives a dedicated authored-body response.
7. `src/core/SessionTelemetrySystem.js` — records personality context in existing reactive/entity events and movement samples.

Exactly **106** HC030A runtime owners are SHA-256 locked.

## Material response families

All families are derived from existing `chemistry.matterState` / domains.

- **elastic_membrane** — membrane/gel: flex, bend, rebound; instability buckles instead of cracking.
- **flowing_current** — fluid: stretches and redirects as waves; instability becomes eddy/cross-current behavior.
- **resonant_signal** — signal vapor / signal braid: phase/echo response; instability splits and scatters the signal read.
- **dense_scar** — scarred matter: resists, loads, shears and slips rather than flexing freely.
- **granular_residue** — residue / residue silt: slumps, drags and scatters.
- **contained_seed** — dormant seed: compresses protectively and remains comparatively symmetric.
- **volatile_growth** — blooming matter: asymmetric expansion/contraction and growth spasm.
- **adaptive_matter** — bounded fallback only.

The family does **not** replace HC030A state. For example, `unstable` remains `unstable`; a membrane expresses it as `buckling_wave` while a scar expresses it as `slipping_plate`.

## Entity response families

Derived from existing `hostFunction`, matter state and role metadata.

- **protective_tender** — opens/offers under Pulse, cups/guards under inward pressure, settles/supports under Stabilize.
- **anchored_sensor** — counter-signals, retracts/samples, then anchors/observes.
- **flow_relay** — opens downstream under Pulse, cups upstream under Absorb, aligns paired vanes under Stabilize.
- **living_responder** — bounded fallback.

No entity gains new navigation, combat, targeting, bond, repair, progression or route authority.

## Physical / visual behavior

### Pulse

HC030A condition still determines cleanliness vs instability. HC030B now modulates the response signature:

- membrane flexes more than it shears,
- fluid creates more lateral/ripple response,
- signal matter answers with phase-like motion,
- scarred matter moves less cleanly and carries more shear,
- seed matter remains tighter and more symmetric.

### Absorb

Bond remains the only owner of Absorb progress and pull. Personality only applies bounded multipliers:

- flowing/seed matter yields somewhat more naturally,
- scar/residue matter resists progress/pull more and rotates/shears more,
- no personality overrides authored compatibility or completion rules.

### Stabilize

HC030A remains the only owner that lowers live condition. HC030B changes only how settling is embodied by the material/entity.

## Presentation rule

HC030B reuses existing ChemObject response pivots and existing entity body parts. It adds no target ring, condition meter, reticle, new particle family, or geometry owner.

## Telemetry

Schema advances to **`blob.session.telemetry.v1.20`** while retaining the HC030A 16,000-event capacity.

Existing events now add personality context:

- `chem.reactive_state.changed` includes material response personality + stage expression.
- `ecology.entity_relationship.changed` includes entity response personality + body signature.
- movement samples include active ChemObject personality and reactive stage.

Telemetry remains read-only.

## Acceptance tests

1. HC029A targeting remains unchanged.
2. HC029C composition meanings remain unchanged.
3. HC030A thresholds/state ownership remain unchanged.
4. The same `unstable` condition produces materially different expression across membrane/fluid/scar/signal/seed/residue/bloom families.
5. Scar shear response exceeds membrane shear response.
6. Fluid ripple response exceeds dense scar ripple response.
7. Seed compression remains more symmetric/protective than fluid response.
8. Tender, Watcher and Vascular Relay resolve to different authored entity response families.
9. Vascular Relay visibly opens downstream / cups upstream / aligns under the existing P/A/S language.
10. No personality changes targeting, condition thresholds, route, progression, AI goals or button mapping.

## Validation result

- HC030B response-personality contract + behavioral smoke: **PASS**
- RecipeDataSystem load: **PASS**
- undefined `this.method()` audit: **PASS**
- runtime JS syntax: **113/113 PASS**
- public JSON parse: **440/440 PASS**
- non-scope HC030A runtime owner lock: **106/106 PASS**
- runtime JS diff vs HC030A: exactly **7** files listed in Allowed runtime scope
- HC029A `TargetingSystem.js`: unchanged / locked
- HC029C `VerbCompositionSystem.js`: unchanged / locked
- HC030A `ReactiveStateGrammarSystem.js`: unchanged / locked

A production Vite render is not claimed in this handoff environment because dependencies are not bundled and prior dependency installation attempts timed out. Browser/controller play remains the authority for amplitude/readability tuning.
