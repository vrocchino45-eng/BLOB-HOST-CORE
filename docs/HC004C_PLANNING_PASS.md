# HC-004C — Planning Pass

## Pass Name

```text
HC-004C — Grave Route Visual Composer Support
```

## Reason For This Pass

HC-004B authored the Grave route recipe layer but intentionally did not make it playable. Before runtime activation is allowed, the newly authored Grave visual recipes need to be interpretable by the current composer split.

This pass closes that gap without touching traversal, morph activation, targeting, combat, dialogue, or old chamber architecture.

## Current Foundation Preserved

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

Optional fork preserved:

```text
CELL_BLOOM_RESIDUE_FORK_001
```

## Allowed Scope

```text
visual composer silhouette routing
Grave environment composer methods
Grave chem-object composer methods
visual-composer validation
documentation
build identity update
```

## Forbidden Scope

```text
runtime route activation
new morph activation
new target focus activation
new interaction loop activation
gates
doors
teleports
old chamber runtime
old exit registries
stage-node loaders
branch select menu
combat
dialogue tree
quest log
```

## Plan

1. Add Grave environment silhouette mappings to `EnvironmentVisualComposer`.
2. Add Grave chem-object silhouette mappings to `ChemObjectVisualComposer`.
3. Add concrete composer methods for the six HC-004B visual recipes.
4. Add a validation script proving those silhouettes do not fall through to fallback geometry.
5. Re-run gold, recipe, Grave planning, undefined-method, and build checks.

## Lock Rule

If this pass makes `CELL_GRAVE_MEMORY_RESIDUE_BED_001` reachable, spawnable, targetable, or morph-linked, it fails.
