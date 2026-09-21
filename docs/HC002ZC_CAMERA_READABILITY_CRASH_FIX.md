# HC-002ZC — Camera Readability Crash Fix

## Problem Observed

Playtest of HC-002ZB showed the opening scene partially blank with a console error:

```text
Uncaught TypeError: this.tmpSphere.getCenter is not a function
at CameraReadabilitySystem.js
```

## Cause

`CameraReadabilitySystem` used a Three.js API incorrectly. `THREE.Sphere` stores its center in the `.center` vector. It does not provide `getCenter()`. `getCenter()` is a `THREE.Box3` style API.

## Fix

```text
this.objectPosition.copy(this.tmpSphere.center)
```

HC-002ZC also guards camera readability so future camera-fade math errors do not interrupt the render tick.

## Additional Hardening

- empty bounds are skipped instead of crashing
- invalid object bounds are skipped instead of crashing
- camera readability writes a non-fatal status to `frameState.cameraReadability`
- `GameRuntime.updateCamera()` wraps camera readability updates

## Scope Boundary

This is not a camera redesign and not an HC-003 expansion. It only repairs the HC-002ZB camera readability blocker.
