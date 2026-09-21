# HC024D0A Build Report — A Button Context Ownership

## Problem observed in live play
A had conflicting meanings across modes. In particular, Core Inspection could temporarily adopt an authored interaction focus, causing the same A press to become a world interaction instead of entering Core Work.

## Root cause
InputSystem routed A using `selfInspection && !authoredFocusAvailable`, so camera focus state—not the top-level player mode—owned the button meaning.

## Correction
A/E is now routed from explicit top-level context:
- World -> `interactPressed`
- Core Inspection -> `coreWorkPressed` / Core Work entry
- Core Work -> `coreWorkPressed` / retained anatomy grab-place
- Status/UI -> suppressed from gameplay

InspectionCameraSystem now accepts Core Work entry from any active external inspection composition and releases authored focus during the transition.

## Scope
No physical button remap and no gameplay/content expansion.

## Validation result
PASS:
- HC024D0A four-context A/E behavioral regression
- HC024D0 quick-test seed/reset regression
- HC024C2 retained-anatomy manipulation regression
- HC024C1/C/B/A camera/manipulation regressions
- HC023D/C/B/A platform regressions
- RecipeDataSystem load validation
- undefined `this.method()` audit
- syntax check across all 88 active source modules
- relative static/dynamic local-import resolution audit

Production Vite bundling was not run because node_modules is not included in the packaged checkpoint.
