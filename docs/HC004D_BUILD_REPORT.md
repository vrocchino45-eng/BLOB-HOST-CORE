# HC-004D Build Report

## Build

```text
BLOB Host Core Rebuild — HC-004D
Version: 0.0.50
Mode: runtime morph prototype without legacy route architecture
```

## Implemented

```text
GraveRouteMorphSystem
Grave route morph plan data
Grave morph prototype planning data
RecipeDataSystem loading/validation for Grave morph plans
GameRuntime registration for GraveRouteMorphSystem
MorphStateSelector awareness of Grave morph
TargetFocusRegistry active-morph awareness
Bloom Residue active-state guards so it does not overwrite Grave state
Guide prompt/HUD Grave route labels
Grave chem object idle/arrival animation hooks
HC-004D validator
```

## Preserved

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

## Activated

```text
ROUTE_GRAVE_MEMORY_RESIDUE_SCAR_001
CELL_GRAVE_MEMORY_RESIDUE_BED_001
MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001
```

## Not Activated

```text
Grave interaction loop
Grave combat
Grave dialogue
Grave quest log
old gates
old doors
teleports
old chamber runtime
branch select menu
stage-node loaders
Act expansion
```

## Validation Result

```text
npm run validate:grave-morph-prototype      passed
npm run validate:grave-visual-composer      passed
npm run validate:grave-route-recipe-pack    passed
npm run validate:grave-route-plan           passed
npm run validate:recipe-data                passed
npm run validate:gold-candidate             passed
npm run audit:undefined-methods             passed
npm run build                               passed
```

## Known Notes

```text
Vite still reports the existing large chunk warning.
npm install reports 1 low severity vulnerability.
```
