# HC-003EA — Prompt Stack + Lock Readout Cleanup

## Purpose

Clean the HC-003E first-minute lock candidate UI so the new Guide layer is the primary world-facing instruction surface and the older Host Tissue Shift panel becomes secondary tissue-status support.

## Scope

- Guide prompt remains the main player-facing instruction.
- Host Tissue Shift panel compresses/fades while Guide prompt is active.
- Duplicate bottom instructions are suppressed.
- First playable minute lock status is shown separately from the optional Bloom Residue fork.
- Bloom Residue fork stable readout is clamped to stable / complete when the fork is effectively complete.

## Required First Playable Minute

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

## Optional Beyond-Minute Fork

```text
CELL_BLOOM_RESIDUE_FORK_001
```

## Forbidden

No new cells, morphs, abilities, combat, dialogue tree, quest log, gates, doors, teleports, or Act expansion.
