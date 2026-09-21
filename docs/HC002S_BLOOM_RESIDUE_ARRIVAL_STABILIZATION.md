# HC-002S — Bloom Residue Arrival Stabilization

## Purpose

Stabilize arrival after the third no-gate morph into `CELL_BLOOM_RESIDUE_FORK_001`.

This pass does not add a fourth cell or a new morph. It makes the Bloom Residue Fork clearly become the active play space.

## Adds

- `src/morph/BloomResidueArrivalSystem.js`
- active-cell arrival ring
- fork warmth ring
- focus line toward the current Bloom Residue object
- source-cell suppression after third morph completion
- Guide fork/interpreter staging
- Tender/Watcher background staging
- Bloom Residue arrival debug state
- world-facing morph panel text after arrival

## Arrival Focus Order

```text
residue_memory_silt_001      → read what the fork inherited
bloom_spore_lantern_001      → approach growth carefully
seed_choice_braid_001        → warm the fork through relation
overgrowth_warning_tendril_001 → respect warning, do not absorb
```

## Forbidden Scope

```text
no fourth cell
no fourth morph
no combat
no new ability
no dialogue system
no binary choice menu
```
