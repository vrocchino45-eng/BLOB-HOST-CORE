# HC-005C Build Report

## Identity

- Build: HC-005C
- Version: 0.0.77
- Title: Signal Chorus Return Readability + Camera-Relative Movement Lock
- Mode: Feel Mode

## Files added

- `scripts/validateSignalChorusReturnReadabilityAndCameraRelativeMovementHC005C.mjs`
- `docs/HC005C_SIGNAL_CHORUS_RETURN_READABILITY_AND_CAMERA_RELATIVE_MOVEMENT.md`
- `docs/HC005C_ACCEPTANCE_TESTS.md`
- `docs/HC005C_BUILD_REPORT.md`
- `docs/HC005C_NEXT_PASSES.md`

## Primary files changed

- `src/morph/SignalChorusReturnStateSystem.js`
- `src/visual/MotionSignatureSystem.js`
- `src/player/PlayerMovementController.js`
- `src/core/GameRuntime.js`
- `src/input/ControllerComfortSystem.js`
- `src/morph/MorphStateSelector.js`
- `src/debug/RecipeDebugOverlay.js`
- `src/debug/ChemistryDebugPanel.js`
- `src/debug/RuntimeDiagnosticSummary.js`
- `public/data/morph/signalChorusReturnStateRecipes.json`
- `public/data/input/controllerOnboardingTuning_HC003I.json`
- `public/data/build/buildManifest.json`
- `src/main.js`
- `package.json`
- `package-lock.json`

## Root causes corrected

### Visual

HC-005B used an absolute recursive opacity write for all Signal return environment meshes. This erased the authored distinction between visible surface material and very low-opacity haze.

### Input

The player movement controller interpreted left-stick axes in world space while the right stick changed camera yaw. Camera and locomotion therefore used different orientation frames.

## Result

- Signal return atmosphere now respects authored opacity and occupies a smaller offset depth volume.
- The player and tissue structure should remain legible in the held state.
- Movement now uses a yaw-relative camera basis.
- Camera pitch does not influence planar travel.
- Existing vertical movement controls remain world-aligned.
- Stable HC-005B ownership/no-target state is preserved.

## Automated results

```text
Validation and audit scripts: 38 passed / 38 total
Undefined-method audit: passed
Production build: passed
Vite HTTP smoke test: passed
Archive integrity: passed
```

## Known non-blocking condition

Vite continues to report the existing large Three.js output-chunk warning. This pass does not widen bundling scope.

## Lock status

Automated lock candidate. Live controller and screenshot confirmation are still required before beginning next-route implementation.
