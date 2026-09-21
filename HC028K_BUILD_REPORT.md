# HC028K Build Report — Reciprocal Ecological Memory

## Intent
Give HC028J's existing Tender/Watcher relationship grammar a short-lived consequence in organism behavior/presentation: a meaningful P/A/S gesture can remain embodied for several seconds after the player releases the buttons.

## Parent
- **Parent:** HC-028J — Entity Relationship Grammar Foundation
- **Build:** HC-028K — Reciprocal Ecological Memory
- **Version:** 0.28.19
- **Telemetry:** `blob.session.telemetry.v1.11`

## Source audit
The runtime ecology remains exactly two authored organisms:
1. `nursery_membrane_tender_001` — care/filter organism with the pre-existing nursery trust/bond/repair loop.
2. `membrane_watcher_001` — anchored sensing/warning/recording organism, still nursery-bound.

HC028J already translated the canonical Core chord into organism-specific interpretations. The missing piece was continuity: once input stopped, the relationship presentation immediately returned toward ambient state.

## Implementation
Added `src/ecology/EntityReciprocalMemorySystem.js`.

The new system reads **only** HC028J relationship interpretation. If a meaningful relationship remains legible for a short non-rhythmic dwell (~0.38s Watcher / ~0.50s Tender), it commits a temporary embodied memory.

There is no precise beat window and no success/failure timing test. The short dwell exists only to prevent button noise from becoming organism memory.

### Tender examples
- `safe_receive` / `shared_intake` → `care_exchange_retained`
- `reciprocal_exchange` → `reciprocity_retained`
- `settled_presence` → `settled_presence_retained`
- guarded/cautious draw → protective/cautious contact memory
- whole-Core display/attunement → retained Core-signature memory

Typical memory duration: roughly **6.8–10.5 seconds**, depending on interpretation and whether the already-authored Tender bond exists.

### Watcher examples
- `contained_sampling` → `sample_retained`
- `counter_sensing` → `counter_signature_retained`
- `anchored_observation` → `observation_retained`
- `stable_interrogation` → `stable_signal_retained`
- `full_spectrum_watch` → `full_spectrum_signature_retained`

Typical memory duration: roughly **7.8–9.2 seconds**.

## Embodied reply
`EntityEcologyResonanceSystem` remains the body-presentation owner and now layers decaying remembered gesture onto the live world/chord response.

- Tender seed sacs/fronds retain a restrained care/reciprocity posture after release.
- Watcher sensing bulbs/light/warning ring retain a restrained sampled/counter-sensing reply after release.
- A short `responsePulse01` makes the moment the organism commits the memory readable without adding HUD text.

The live regional Host phrase continues underneath the remembered relationship.

## Explicitly not an affinity system
HC028K does **not** add relationship points, favorability levels, friendship XP, hidden success scores, dialogue flags or permanent faction state. `hiddenAffinityScore` is explicitly false in the runtime contract.

The memory is a decaying embodied trace, not progression.

## Explicitly unchanged
- `EntitySystem` gameplay behavior.
- Tender trust thresholds, bond condition and scar-repair rates.
- Watcher nursery sensing behavior.
- Entity root movement/follow authority.
- Player movement and H1 environmental coupling.
- Pulse / Absorb / Stabilize power, range, cost and targeting.
- Core topology and 3→6→12.
- Regional composition / Host clock.
- Hub route commit.
- HC028I1 Comb re-entry + return arming.
- Chemistry, progression and route completion.
- Audio reference mix.

## Telemetry
Schema advances to **v1.11**.

New event:
- `ecology.entity_reciprocal_memory.committed`

It records the organism, retained mode, source interpretation, memory strength and visible response pulse. It also explicitly records that affinity, timing-gate, bond, repair, combat and progression authority are false.

## Validation
- **105/105 runtime JS**: `node --check` PASS.
- **398/398 public JSON**: parse PASS.
- RecipeDataSystem load: PASS.
- undefined `this.method()` audit: PASS.
- HC028K reciprocal-memory contract: PASS.
- **100 untouched HC028J runtime owners**: byte-identical.
- Direct persistence proof: bonded Tender retains `care_exchange_retained`; Watcher retains `sample_retained`; both remain active one second after chord release.

## Render limitation
This handoff tree does not include local `node_modules`, so Vite/browser render was not executed here. Controller/browser playtest remains the authority for whether the retained response is perceptually strong enough without becoming visual noise.
