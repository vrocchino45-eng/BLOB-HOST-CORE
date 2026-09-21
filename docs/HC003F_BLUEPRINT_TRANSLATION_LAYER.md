# HC-003F — Blueprint Translation Layer

## Purpose

HC-003F maps the Host Core rebuild branch back to the larger BLOB blueprint without letting the old runtime architecture return.

The primary source of truth for this branch remains:

```text
BLOB_HOST_CORE_REBUILD_BLUEPRINT_v0_1.md
```

The larger BLOB blueprint remains a north star for story, act structure, region roles, and long-term production logic, but the active runtime follows the Host Core rebuild rule:

```text
Host Core Field
→ Individual Host Core
→ Host lifecycle / temperament
→ host anatomy
→ host chemistry
→ local cells
→ matter states
→ bonds / nutrients / entities / orbiters
→ player core
→ abilities / verbs
→ moment gameplay
```

## Translation Rule

```text
Function maps across.
Legacy runtime architecture does not.
```

This means older names such as `Surface Wake`, `Guide Threshold`, and `Hub Chamber` can describe design roles. They cannot bring back:

```text
gates
doors
teleports
old chamber loading
legacy exit registries
old stage-node progression
```

## Current Host Core Expression

```text
Host: HOST_ALPHA_WOUNDED_NURSERY
Player: becoming-core awakened during reseeding instability
Primary conflict: protect new becoming while metabolizing old wounds
```

## Current Opening Chain

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

## Optional Beyond-Minute Fork

```text
CELL_BLOOM_RESIDUE_FORK_001
```

Bloom Residue is playable, but it is not required for the first playable minute lock.

## Why This Pass Exists

The rebuild now has a working local-cell chain. The risk is that it could drift away from the larger BLOB plan, or that old region/chamber names could accidentally re-enter as old runtime structure.

HC-003F prevents both problems by making the mapping explicit.

## Build Scope

Added:

```text
public/data/planning/blueprintTranslationLayer_HC003F.json
```

Updated:

```text
RecipeDataSystem validation
runtime recipe counts
compact/full debug readouts
build manifest
lock-state next-pass target
```

## Non-Scope

No new cells, morphs, routes, gates, chambers, abilities, entities, orbiters, combat, dialogue tree, quest log, save/load, Act 2 expansion, or fifth-cell planning.
