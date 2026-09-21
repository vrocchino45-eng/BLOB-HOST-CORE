# HC-006C Build Report

- Build: HC-006C
- Version: 0.0.81
- System: `TightInspectionCameraSystem`
- Recipe: `SIGNAL_CHORUS_TIGHT_INSPECTION_CAMERA_HC006C`

## Added

- data-authored optional inspection-camera recipe
- Y controller and V keyboard edge-triggered toggle
- close third-person player/focus composition
- reduced inspection orbit sensitivity
- R3 inspection reframe
- smooth distance and FOV transition
- automatic safe exit by range, cell, or interaction availability
- HUD and F1 inspection diagnostics
- focused validation

## Ownership

`TightInspectionCameraSystem` owns only mode eligibility and toggle state.

`GameRuntime.updateCamera` remains the sole owner of the camera transform. This avoids a second camera system fighting the orbit camera.

## Preserved

- camera-relative planar movement
- HC-006B layered interaction
- contextual A/X/F input handoff
- Signal Chorus return ownership and no-target state
- passive combward pressure
- living tissue identity
- locked Grave route and movement-driven return
- closed route architecture
