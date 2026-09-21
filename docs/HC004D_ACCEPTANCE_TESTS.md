# HC-004D Acceptance Tests

## Must Pass

```text
npm run validate:grave-morph-prototype
npm run validate:grave-visual-composer
npm run validate:grave-route-recipe-pack
npm run validate:grave-route-plan
npm run validate:recipe-data
npm run validate:gold-candidate
npm run audit:undefined-methods
npm run build
```

## Playtest Acceptance

1. The first playable minute still begins in `CELL_MEMBRANE_NURSERY_001`.
2. The locked chain still proceeds through Scar Flow and Signal Chorus.
3. Bloom Residue remains optional beyond the first minute.
4. Grave is not available from a gate, door, teleport, menu, or old chamber route.
5. Grave becomes possible only after Bloom Residue stability/readiness.
6. The Grave transition reads as a morph/fold, not a route jump.
7. Player control is preserved during the morph.
8. Grave destination objects appear as quiet readable memory/residue objects.
9. No Grave interaction objective is required yet.
10. HUD/guide language identifies the Grave route without implying a completed loop.

## Failure Conditions

HC-004D fails if it introduces any of the following:

```text
old gate activation
old door activation
teleport route
stage-node loader
branch select menu
old chamber runtime
combat arena
dialogue tree
quest log
Grave interaction loop
```
