# HC-004E Acceptance Tests

## Must Pass

```text
npm run validate:grave-arrival-readability
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
2. The locked opening chain still proceeds through Scar Flow and Signal Chorus.
3. Bloom Residue remains optional beyond the first minute.
4. Grave is still reached only by the HC-004D no-gate morph after Bloom Residue stability.
5. The first seconds inside Grave read as low, quiet, reverent, and memory-heavy.
6. The four Grave objects are staged/readable without becoming a completed interaction loop.
7. Guide/HUD messaging says read before absorb.
8. Player control remains active.
9. No gate/door/teleport/menu/chamber-loader behavior appears.
10. No combat, dialogue tree, quest log, or full Grave interaction loop appears.

## Failure Conditions

HC-004E fails if it introduces any of the following:

```text
full Grave interaction loop
combat
dialogue tree
quest log
gate activation
door activation
teleport route
stage-node loader
branch select menu
old chamber runtime
```
