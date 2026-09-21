# HC028J Build Report — Entity Relationship Grammar Foundation

## Intent
Give the existing Tender and Watcher distinct interpretations of the Core's existing Pulse / Absorb / Stabilize chord grammar before adding more entity types.

## Parent
- **Parent:** HC-028I1 — Comb Re-entry + Return Arming Hotfix
- **Build:** HC-028J — Entity Relationship Grammar Foundation
- **Version:** 0.28.18
- **Telemetry:** `blob.session.telemetry.v1.10`

## Source audit
The live ecology remains exactly two authored organisms:
1. `nursery_membrane_tender_001` — care/filter organism; can become a bonded care companion through the pre-existing nursery rules.
2. `membrane_watcher_001` — anchored sensing/recording organism; remains nursery-bound.

`EntitySystem` remains the sole owner of authored behavior, bonding, repair, visibility, movement and the existing Pulse reactions.

## Implementation
Added `src/ecology/EntityRelationshipGrammarSystem.js` as a read-only bridge from the canonical `CoreVerbEngineCouplingSystem.chord` into organism-specific interpretation.

### Tender interpretations
- Pulse / project → `signal_offered`
- Absorb / draw → `guarded_draw`, or `shared_intake` after an existing bond
- Stabilize / cohere → `settled_presence`
- Stabilize + Pulse → `steady_signal`
- Stabilize + Absorb → `cautious_receive`, or `safe_receive` after an existing bond
- Pulse + Absorb → `testing_exchange`, or `reciprocal_exchange` after an existing bond
- all three → `whole_core_display`, or `whole_core_attunement` after an existing bond

### Watcher interpretations
- Pulse / project → `answering_probe`
- Absorb / draw → `guarded_retraction`
- Stabilize / cohere → `anchored_observation`
- Stabilize + Pulse → `stable_interrogation`
- Stabilize + Absorb → `contained_sampling`
- Pulse + Absorb → `counter_sensing`
- all three → `full_spectrum_watch`

These labels are diagnostic relationship language, not hidden success states.

## Presentation
HC028I's existing `EntityEcologyResonanceSystem` remains the visual owner and now layers the relationship gesture onto the organism's regional entrainment:
- outward gestures open/extend existing anatomy,
- inward gestures cup/retract it,
- coherence settles motion and anchoring,
- reciprocal exchange creates restrained alternating/mirrored articulation.

The Host/world phrase remains present underneath the player's relationship gesture.

## Explicitly unchanged
- Entity recipes and entity count.
- `EntitySystem` behavior/state owner.
- Tender bond thresholds and repair rates.
- Watcher authored sensing behavior.
- Combat/damage/health.
- Targeting.
- Player controls and A/Commit grammar.
- Verb power/range/cost/progress.
- Core topology/H1/H2 physiology.
- Regional composition and Host clock.
- Hub routing and route completion.
- HC028I1 proximity-return/re-entry hotfix.
- Chemistry and audio reference calibration.

## Telemetry
Schema advances to **v1.10**. New event:
- `ecology.entity_relationship.changed`

It records the primary nearby organism, existing chord, organism-specific interpretation, engagement strength and bond context. It is observational only.

## Validation
- 104/104 runtime JS: `node --check` PASS.
- 395/395 public JSON: parse PASS.
- RecipeDataSystem load: PASS.
- undefined `this.method()` audit: PASS.
- HC028J relationship contract: PASS.
- 99 untouched HC028I1 runtime owners: byte-identical.
- Direct interpretation proof: bonded Tender resolves `cohere_draw` as `safe_receive`; Watcher resolves the same chord as `contained_sampling`.

## Render limitation
This handoff tree does not include local `node_modules`, so the Vite browser render was not executed here. Browser playtest remains the authority for body-language strength and visual noise.
