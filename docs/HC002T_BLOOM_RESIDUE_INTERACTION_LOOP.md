# HC-002T — Bloom Residue Interaction Loop

## Purpose

HC-002T makes `CELL_BLOOM_RESIDUE_FORK_001` playable after arrival. It does not add a fourth cell, a new morph, combat, a binary choice menu, or a permanent ending branch.

The Bloom Residue Fork is meant to teach that growth and memory are both alive, and that a warning is not a reward pickup.

## Runtime Additions

```text
src/morph/BloomResidueInteractionSystem.js
public/data/morph/bloomResidueInteractionRecipes.json
```

## Loop

```text
read residue memory
→ open bloom carefully
→ warm seed-choice braid
→ respect overgrowth warning
→ stabilize fork state
```

## Stages

```text
memory_read
bloom_opened
braid_warmed
warning_respected
fork_stable
```

## Active Objects

```text
residue_memory_silt_001        → inherited memory / grief material
bloom_spore_lantern_001        → growth possibility / overgrowth risk
seed_choice_braid_001          → relation-based fork warmth
overgrowth_warning_tendril_001 → warning, not pickup
```

## Forbidden Scope

```text
no fourth cell
no fourth morph
no binary choice menu
no permanent ending choice
no combat
no dialogue system
```
