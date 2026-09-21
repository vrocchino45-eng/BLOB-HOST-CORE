# HC-004QB — Bloom Residue Runtime Ownership Fix

## Verified interference

`BloomResidueArrivalSystem` and `BloomResidueInteractionSystem` both supplied focus state. The target registry boosted both providers, while the Guide prompt remained generic and the Guide orbiter had no Bloom-specific interaction-focus path. This allowed `seed_choice_braid_001` to appear selected while the authored loop still required `residue_memory_silt_001`.

## Fix

- Arrival stages Bloom and relinquishes focus/pulse ownership to the interaction loop.
- Targeting follows only `bloomResidueInteraction.currentFocus`.
- The interaction loop directly selects the authored focus object rather than distance-scoring competing objects.
- One valid pulse advances each authored step.
- Guide orbiter and Guide objective follow the same current focus.
- Grave morph readiness is latched so the final Bloom pulse cannot also begin the morph.

## Forbidden scope preserved

No gates, doors, teleports, old exit registries, stage-node loaders, branch menu, combat, dialogue tree, quest log, new route branch, or new morph destination.
