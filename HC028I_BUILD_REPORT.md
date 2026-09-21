# HC028I Build Report — Ecology Resonance Foundation

## Intent
Carry the established Host/Core composition grammar into the existing authored ecology without adding a bestiary, combat layer, AI-goal system, or new interaction authority.

## Parent
- **Parent build:** HC-028H2 — Topology-Conditioned Verb Character
- **Build:** HC-028I — Ecology Resonance Foundation
- **Version:** 0.28.16
- **Telemetry:** `blob.session.telemetry.v1.9`

## Source audit
The live `EntitySystem` currently loads exactly two authored entity recipes from the active local-cell data:
1. `nursery_membrane_tender_001`
2. `membrane_watcher_001`

The Tender already has an authored care/bond path and may follow the Core after a successful nursery bond. The Watcher is authored as nursery-bound sensing/recording ecology. HC028I deliberately uses those two real organisms rather than spawning generic ecology for coverage.

## Implementation
Added `src/ecology/EntityEcologyResonanceSystem.js`.

The bridge reads:
- `HostRhythmSystem` regional composition,
- `RegionalPhysicalEmbodimentSystem`,
- same-frame `CoreWorldResonanceSystem`,
- existing EntitySystem state/visibility.

It writes only:
- bounded child-mesh/light presentation on existing entities,
- `frameState.entityEcologyResonance`,
- entity `userData.ecologyResonance` diagnostics.

### Shared function language
- **Pulse:** outward/open expression.
- **Absorb:** inward/cupped gathering.
- **Stabilize:** settling/anchoring coherence.

### Tender presentation
- body/canopies/fronds breathe with regional phrase,
- seed sacs/light articulate entrainment,
- existing authored Pulse reaction can be visually amplified,
- if already bonded, the same presentation follows into later regions.

### Watcher presentation
- pupil/sensing bulbs articulate gathering/expression,
- anchoring threads settle on Stabilize phases,
- existing warning-pulse ring articulates authored Pulse response,
- Watcher visibility/boundary remains owned by EntitySystem.

## Explicitly unchanged
- EntitySystem behavior/state machine.
- Tender bond condition and repair rates.
- Watcher behavior.
- Entity recipes.
- Entity movement/navigation authority.
- Combat/damage/health.
- Player movement and H1 environmental coupling.
- Pulse / Absorb / Stabilize gameplay strength/range/cost/progress.
- H2 topology-conditioned verb character.
- World Composition profiles and Host clock.
- Core↔World resonance math.
- Hub routing / route completion.
- Chemistry / targeting / controls.
- HC027D1 reference audio mix.

## Telemetry
Schema advances from v1.8 to **v1.9**. New event:
- `ecology.entity_resonance.mode_changed`

Modes include `ambient_listening`, `world_entrained`, `shared_phrase`, `settling_together`, `guarded_listening`, and `counter_sensing`. These are descriptive diagnostics, not gameplay states.

## Validation
- 103/103 runtime JS files: `node --check` PASS.
- 389/389 public JSON files: parse PASS.
- HC028I contract validator: PASS.
- RecipeDataSystem load validation: PASS.
- undefined `this.method()` audit: PASS.
- 35 locked parent owners: byte-identical to HC028H2.
- Runtime source additions/changes are limited to the new ecology bridge, GameRuntime wiring, telemetry observer, and build identity.

## Render limitation
This handoff tree does not include local `node_modules`, so the Vite browser build/render was not executed here. Browser playtest remains required for visual tuning.
