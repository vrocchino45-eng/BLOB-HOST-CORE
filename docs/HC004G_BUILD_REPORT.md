# HC-004G Build Report

## Summary

HC-004G adds post-transfer stability/readiness planning for the Grave route without activating any new route, exit, gate, door, teleport, branch menu, or old chamber runtime.

## Files added

```text
src/morph/GraveLoopStabilitySystem.js
public/data/planning/graveLoopStabilityAndExitReadiness_HC004G.json
scripts/validateGraveLoopStabilityAndExitReadiness.mjs
docs/HC004G_GRAVE_LOOP_STABILITY_AND_EXIT_READINESS.md
docs/HC004G_ACCEPTANCE_TESTS.md
docs/HC004G_NEXT_PASSES.md
docs/HC004G_BUILD_REPORT.md
```

## Files updated

```text
package.json
package-lock.json
README.md
public/data/build/buildManifest.json
public/data/morph/graveReadBeforeAbsorbRecipes.json
public/data/world/localCellRecipes.json
public/data/guide/guidePromptRecipes.json
src/core/GameRuntime.js
src/data/RecipeDataSystem.js
src/guide/GuidePromptSystem.js
src/ui/PlaytestHudSystem.js
scripts/validateGraveReadBeforeAbsorbLoop.mjs
```

## Result

```text
HC-004G creates a planning-ready readout for a later HC-004H pass.
It does not open the route.
```
