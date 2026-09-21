# HC-003JA — Blueprint Translation Validation Restore

## Purpose

HC-003J introduced P0 visual-lock replacements, but boot failed because the HC-003F blueprint translation validator required a no-legacy warning phrase that was not present inside the translation-layer JSON itself.

HC-003JA restores boot by preserving the rule and making the validation less brittle.

## Fixed

```text
[RecipeDataSystem] Blueprint translation missing no-legacy warning marker:
legacy runtime architecture does not
```

## Preserved Rule

Function maps across. Legacy runtime architecture does not. The Host Core rebuild may use names like Surface Wake, Guide Threshold, or Hub Chamber as design functions, but it may not reintroduce old chamber loaders, hard gates, exits, doors, or teleports.

## Files Changed

```text
public/data/planning/blueprintTranslationLayer_HC003F.json
src/data/RecipeDataSystem.js
scripts/validateBlueprintTranslationLayer.mjs
public/data/build/buildManifest.json
public/data/lock/hc003FirstPlayableMinuteLockState.json
```

## Not Changed

```text
no new cells
no new morphs
no new visuals
no gameplay expansion
no route runtime
no gates / doors / teleports
```
