# HC-003N — Opening Slice Gold Candidate

## Build

```text
Build ID: HC-003N
Build Label: Opening Slice Gold Candidate
Status: pending user playtest
Primary Reference: BLOB_HOST_CORE_REBUILD_BLUEPRINT_v0_1.md
```

## Purpose

HC-003N packages the current required first playable minute as a gold-candidate slice before any route runtime, fifth cell, combat, dialogue, or act expansion.

The build follows the Host Core rebuild rules:

```text
Host Core first
local cells replace chambers
morphs replace exits
debug is tooling, not final HUD
visuals remain recipe-driven
old gates/chambers/teleports do not return
```

## Required Opening Slice

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

## Optional Beyond-Minute Extension

```text
CELL_BLOOM_RESIDUE_FORK_001
```

Bloom Residue Fork remains playable, but it is not required to judge the first playable minute gold candidate.

## What This Candidate Locks

- debug-hidden playtest mode
- Guide prompt as primary player-facing instruction
- small no-gate tissue status strip
- controller comfort tuning
- right-stick/IJKL camera support
- P0 visual-lock upgrades
- first-minute visual readability polish
- seed absorb
- scar warning
- first tissue fold
- Scar-Flow interaction loop
- second tissue fold
- Signal Chorus interaction loop

## What This Candidate Does Not Add

```text
new cells
new morphs
route runtime
combat
dialogue tree
quest log
gates
doors
teleports
old chamber runtime
old exit registries
Act expansion
```

## Lock Decision

```text
If user playtest passes: HC-004A Grave Route Runtime Planning
If user playtest fails: HC-003NA Opening Gold Candidate Fix Pass
```
