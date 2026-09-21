# HC-002P — Bloom Residue Fork Recipe Pack

## Pass Purpose

HC-002P authors the third no-gate morph destination cell.

```text
CELL_SIGNAL_CHORUS_NERVE_001
→ CELL_BLOOM_RESIDUE_FORK_001
```

This pass does **not** activate the third runtime morph. It prepares the authored destination so HC-002Q can implement the transition cleanly.

## New Local Cell

```text
CELL_BLOOM_RESIDUE_FORK_001
```

### Source

```text
Host: HOST_ALPHA_WOUNDED_NURSERY
Anatomy Blend: bloom_organs + residue_beds + signal_choir_tissue
Arrives From: CELL_SIGNAL_CHORUS_NERVE_001
Purpose: first no-menu choice fork
```

## New Chemical Domains

```text
bloom
residue
```

## New Matter States

```text
blooming
residue_silt
seed_signal_braid
```

## New Chem Objects

```text
bloom_spore_lantern_001
residue_memory_silt_001
seed_choice_braid_001
overgrowth_warning_tendril_001
```

## Gameplay Intention

This cell should not ask the player to pick a menu option.

The fork is expressed through chemistry, movement pull, interaction order, pulse response, and what the player stabilizes first.

```text
Bloom first    → growth / risk / expansion bias
Residue first  → memory / recycling / integration bias
Braid focus    → keeps both paths viable
Tendril warning → warns against greedy overgrowth
```

## Forbidden

```text
No door
No portal
No teleport
No binary menu choice
No faction lock-in
No combat expansion
```

## Next Pass

```text
HC-002Q — Runtime Third Morph Prototype
```
