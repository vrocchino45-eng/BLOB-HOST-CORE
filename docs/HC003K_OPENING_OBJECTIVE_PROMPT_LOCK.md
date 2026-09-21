# HC-003K — Opening Objective + Prompt Lock

## Purpose

HC-003K locks the first playable minute instruction stack so the slice remains understandable with debug panels hidden.

## Active Rule

```text
Guide prompt = primary world-facing instruction
Tissue Shift = secondary no-gate tissue/progress strip
Debug panels = build tools, not final HUD
```

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

Bloom Residue remains playable but is not required to judge the first-minute lock.

## Changes

- Added `public/data/ui/openingObjectivePromptLock_HC003K.json`.
- Tightened Signal Chorus Guide prompts so action can be understood without debug.
- Added a first-minute-complete Guide prompt.
- Reduced Tissue Shift panel to a secondary status strip while Guide is active.
- Preserved the no-gate tissue-shift language.

## Forbidden Scope

No new cells, morphs, route runtime, combat, dialogue tree, quest log, gates, doors, teleports, or old chamber runtime.
