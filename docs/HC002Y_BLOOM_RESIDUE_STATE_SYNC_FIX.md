# HC-002Y — Bloom Residue State Sync Fix

## Problem Observed

The HC-002X playtest reached `CELL_BLOOM_RESIDUE_FORK_001`, proving the third morph became reachable. However, the console showed:

```text
Uncaught TypeError: this.formatBloomStage is not a function
at MorphReadabilitySystem.js
```

The debug panels also showed a stale morph phase from the first morph while the active cell was already Bloom Residue Fork.

## Fixes

### Morph Readability

- Added `formatBloomStage(stage)`.
- Bloom Residue panel now handles arrival and interaction loop state safely.
- If the active cell is Bloom Residue Fork, the readability system treats the third morph as completed even if older morph state is still present.

### Bloom Residue Arrival

- Arrival activates from active cell or third morph completion.
- Arrival writes `CELL_BLOOM_RESIDUE_FORK_001` back to active cell when active.
- `readyForBloomLoop` now becomes true from arrival age, arrival clarity, fork trust, or residue memory instead of requiring a strict two-value threshold.

### Bloom Residue Interaction Loop

- Loop activates once the active cell is Bloom Residue Fork and the Bloom arrival/third morph state is present.
- Loop focus starts on `residue_memory_silt_001`.

### Debug State Sync

- Left and right debug panels now select the current active morph based on active cell and morph completion order.
- After Bloom arrival, compact debug should show `completed_in_bloom_residue_fork` instead of stale `completed_in_scar_flow_fold`.

## Forbidden Scope Preserved

- No fifth cell.
- No new morph destination.
- No new abilities.
- No combat.
- No dialogue system.
- No HC-003 expansion.
