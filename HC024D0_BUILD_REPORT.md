# HC024D0 Build Report

## Mode
Debug testbed / iteration acceleration.

## Purpose
Allow Core Work manipulation development to be tested without replaying through Hub and the three route-retention sequences every run.

## Runtime change
- InputSystem: P queues a one-frame debug Core Work seed request.
- DebugAreaJumpSystem: owns the debug request and calls CoreGrowthSystem.
- CoreGrowthSystem: stores a debug-only seed flag separate from canonical route truth.
- CoreEmbodimentSystem: may expose retained anatomy from that debug-only flag and can reset manipulation offsets.
- GameRuntime: injects CoreGrowthSystem into the existing debug system.
- PlaytestHudSystem: exposes the P shortcut when Core Work has no pieces.

## Progression integrity
The shortcut does not set:
- `graveMemoryImprintCommitted`
- `vascularRhythmRetained`
- `siltPressureRetained`

It does not mark route completion, gate completion, objective completion, or destination change.

## Validation
- HC024D0 validator: PASS
- full `validate:current` chain: PASS
- RecipeDataSystem load: PASS
- undefined-method audit: PASS
- 88 active source JS files retained
- changed source syntax checks: PASS

## Build environment
No `node_modules` is packaged; Vite production bundling was therefore not executed in this environment.
