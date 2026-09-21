# HC-006D Source Ownership

## Active

### `src/interaction/LayeredInteractionGrammar.js`
Owns shared stage vocabulary, authored-stage mapping, transition diagnostics, and reusable interaction snapshots.

### `src/camera/InspectionCameraSystem.js`
Owns inspection availability, toggle state, safe auto-release, and authored framing parameters.

### `src/camera/InspectionOcclusionSystem.js`
Owns inspection-only focus marker, camera-to-focus corridor detection, presentation fading, and ambient-density reduction.

### `src/core/GameRuntime.js`
Remains the only owner of camera position, orientation, FOV, and smoothing.

### Region interaction systems
Own authored prerequisites, timing, input meaning, visuals, progress, completion, and consequences. They publish the generic inspection-focus contract when appropriate.

## Deprecated

### `src/camera/TightInspectionCameraSystem.js`
Deprecated HC-006C Signal-Chorus-specific state owner. Retained as an archived compatibility reference and not imported by runtime.

### `public/data/camera/signalChorusInspectionCameraRecipes.json`
Deprecated compatibility recipe. Replaced by `FOUNDATIONAL_INSPECTION_CAMERA_HC006D`.

## Next ownership addition

HC-006E should add a Surface Wake interaction provider without modifying `InspectionCameraSystem` or `LayeredInteractionGrammar`.
