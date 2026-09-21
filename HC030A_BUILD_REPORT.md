# HC-030A Build Report — Reactive State Grammar

Parent: **HC-029C — Verb Composition Grammar**

## Mode

Convergence / world-response pass.

## Purpose

HC030A moves the development boundary from player-language correctness into world-response correctness. ChemObjects now carry a live condition derived from their already-authored `chemistry.instabilityRisk`, so identical Pulse / Absorb / Stabilize input can produce a different visible and physical answer depending on the target's current condition.

The pass does **not** add a new verb, target mode, HUD meter, material class, route rule, progression gate, or content object.

## Locked foundation

- HC029A candidate scoring, relationship retention, release grace and deliberate camera handoff.
- HC029B relationship effect ownership.
- HC029C composition meanings and modifiers for `cohere_project`, `cohere_draw`, `exchange`, and `full_system`.
- controller mapping, camera ownership, movement, routes, progression, ecology and authored ChemObject recipes.

## Allowed runtime scope

Intentional runtime JS diff vs HC029C is limited to:

1. `src/main.js` — build identity only.
2. `src/core/GameRuntime.js` — construct/register the single reactive-state owner after composition and before Bond.
3. `src/interaction/ReactiveStateGrammarSystem.js` — **new** canonical live condition owner.
4. `src/chemistry/ChemObjectSystem.js` — make existing target presentation answer current condition; no gameplay-root retargeting.
5. `src/chemistry/BondSystem.js` — let current condition shape Absorb progress/pull/spin while preserving Bond ownership.
6. `src/core/SessionTelemetrySystem.js` — observe stage changes and increase the bounded event buffer for 15–20 minute focused tests.

Exactly **106** other runtime JS owners are SHA-256 locked to HC029C.

## Reactive state grammar

The authored `instabilityRisk` is treated as disposition, not a second hidden recipe table.

- **coherent** — condition `<= 0.30`; closed / settled response.
- **strained** — condition `> 0.30` and `< 0.52`; asymmetric vibration begins.
- **unstable** — condition `>= 0.52` and `< 0.72`; deformation/oscillation becomes obvious.
- **failing** — condition `>= 0.72`; coherence is visibly near loss.

State changes persist long enough to read, then drift slowly toward the authored disposition. Stabilize may temporarily drive a target below that authored disposition; the disposition is not rewritten.

## Verb answers

### Pulse

Focused Pulse adds condition/impulse to the retained target. Low-condition targets displace cleanly. Higher-condition targets lose directional cleanliness and acquire lateral/irregular response. Ambient Pulse remains HC029B inquiry and does not become a second state-authority path.

### Absorb

Held Absorb adds strain. High-condition targets incorporate more slowly and show more rotational agitation. `cohere_draw` suppresses much of that strain while preserving inward draw.

### Stabilize

Held Stabilize reduces condition toward coherence. It does not automatically declare an object solved and does not alter authored `instabilityRisk`.

### Full system

`full_system` deliberately **contains more than it repairs**. Visible deformation is strongly suppressed while the underlying state repairs slowly. Releasing the equilibrium can therefore reveal that a difficult condition was being held together rather than permanently cured.

## Presentation rule

State must live primarily on the target itself. HC030A reuses each ChemObject's existing response pivot and authored visual children; it adds **no new target ring, reticle, HUD meter, particle field, geometry family, or draw-call owner**.

## Telemetry correction

The HC029C playtest hit the previous 5,000-event cap and discarded roughly the first 3:49 of detailed event history. HC030A increases the still-bounded event capacity to **16,000** and advances telemetry to `blob.session.telemetry.v1.19`.

New event:

- `chem.reactive_state.changed` — emitted only when a target crosses a semantic state boundary.

Telemetry remains read-only and has no gameplay authority.

## Acceptance tests

1. HC029A retained targeting behaves unchanged.
2. HC029B single-verb relationship ownership behaves unchanged.
3. HC029C chord meanings/modifiers behave unchanged.
4. A high-risk target can visibly settle from failing/unstable toward coherent under Stabilize.
5. Pulse can drive a settled retained target back toward strain without retargeting.
6. Resisted Absorb increases strain and is visibly less clean than drawing a coherent target.
7. `cohere_project` creates less Pulse-added strain than raw Pulse.
8. `cohere_draw` creates less Absorb-added strain than raw Absorb.
9. `full_system` suppresses visible deformation more strongly than it repairs underlying condition.
10. No reactive state change opens routes, advances progression, changes ecology, or chooses a target.

## Validation result

- HC030A reactive-state contract + behavioral smoke test: **PASS**
- RecipeDataSystem load: **PASS**
- undefined `this.method()` audit: **PASS**
- runtime JS syntax: **112/112 PASS**
- public JSON parse: **437/437 PASS**
- non-scope runtime owner lock: **106/106 PASS**
- runtime JS diff vs HC029C: exactly **6** files listed in Allowed runtime scope
- HC029A `TargetingSystem.js`: unchanged / locked
- HC029C `VerbCompositionSystem.js`: unchanged / locked

A Vite dependency install was attempted but did not complete before the environment cutoff. Partial `node_modules` was removed and is not included. Browser/controller rendering remains the final authority for amplitude and readability tuning.
