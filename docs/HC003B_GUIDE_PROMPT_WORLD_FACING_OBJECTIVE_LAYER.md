# HC-003B — Guide Prompt / World-Facing Objective Layer

## Mode

Readability / guidance implementation.

## Purpose

HC-003B starts replacing debug-style opening instructions with short, embodied Guide prompts. The player should be able to understand the first playable minute without keeping debug panels open.

The active first-minute route remains:

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

`CELL_BLOOM_RESIDUE_FORK_001` remains playable as the first beyond-minute fork, not required tutorial load.

## Added Runtime

```text
src/guide/GuidePromptSystem.js
```

The system creates a player-facing panel labeled:

```text
GUIDE // FOLDED LANTERN
```

It selects prompt recipes from authored data and writes the selected state to:

```text
frameState.guidePrompt
```

## Added Data

```text
public/data/guide/guidePromptRecipes.json
```

Prompt recipes define:

```text
id
beat
priority
cellIds
conditions
guideLine
objectiveLine
debugFallback
tone
forbidden
```

## Rules

Prompts must remain:

```text
short
world-facing
embodied
data-driven
separate from debug fallback
```

## Forbidden Scope

```text
no dialogue tree
no quest log
no fifth cell
no new morph
no new ability
no combat
no new orbiter/entity family
```

## Example Prompt Roles

```text
Safe seed: That seed is safe. Do not rush the bond.
Scar warning: That is scar. It remembers pressure.
First fold: The tissue is ready to fold.
Scar-Flow: This place is flow caught in scar.
Signal Chorus: The host is not silent.
Bridge: A bridge warms by relation, not force.
Bloom afterfork: Past the first lesson, the tissue can fork.
```

## Why This Pass Exists

HC-002ZD made the four-cell chain visible and stable enough to continue. HC-003B starts turning that technical chain into a readable first playable minute.
