# BLOB: HOST CORE — HC-015G Build Report

## Pass
Signal Plain Entry / First Receptor Readability

## Purpose
Correct the direct Signal Plain test entry after HC-015F HOTFIX2 proved region/HUD ownership was already correct. This pass fixes first-frame spatial staging and camera framing without changing the ecology state machine.

## Code-derived findings
1. `Ctrl+Shift+8` already mounted Aperture/Signal Plain correctly after HOTFIX2.
2. `SignalPlainEcologySystem` placed the Core at a valid but visually poor approach offset.
3. `GameRuntime` blended `cameraTarget` toward Signal Plain during the debug framing window, then ignored that target when calling `camera.lookAt`, snapping the actual gaze back toward the Core.
4. The debug framing also did not own a temporary field-scale camera distance/FOV, so the first frame depended too much on the previous camera state.

## Changes
- Direct Signal Plain approach offset changed to `(5.8, 1.8, 7.2)` relative to Signal Plain center.
- The nearest receptor at spawn is ~6.24 units away: visible/readable but outside the 2.75 interaction radius.
- Direct framing lasts 3.4 seconds and publishes:
  - camera distance 17.2
  - FOV 70
  - focus blend 0.52
  - Signal Plain center and first-receptor positions
- `GameRuntime` now consumes that framing distance and FOV.
- During the debug framing window, `cameraLookAt` uses the authored Signal Plain camera target instead of immediately reverting to player-only look-at.
- Persistent tight camera release from HOTFIX2 remains intact.
- Normal camera control resumes automatically after the short framing window.
- No observations, ecology completion, gate state, route history, or progression are awarded by the jump.

## Locked systems
- Signal Plain ecology state machine: 3 unique reads -> receptive center -> Stabilize -> READY -> fresh Pulse.
- Normal Ctrl+8 Aperture arrival.
- Comb/Aperture progression.
- GateSystem ownership.
- Player movement model.
- Existing receptor positions and interaction ranges.

## Validation completed
- `validateSignalPlainEntryReadabilityHC015G.mjs` — PASS
- `auditUndefinedThisMethods.mjs` — PASS
- JavaScript syntax checks for edited runtime files — PASS
- ZIP integrity — PASS

## Validation limitation
The uploaded HC-015F HOTFIX2 source package does not contain installed `node_modules`. A fresh `npm install` could not be completed inside this sandbox, so Three.js/Vite-dependent runtime validators and the production Vite build were not claimed as run here.

## Test target
Start HC-015G, press `Ctrl+Shift+8`, and do not move for the first few seconds. The initial composition should show a clear Signal Plain approach rather than an obstructed/inside-organ spawn. HUD should report Signal Plain 0/3. Then approach the visibly dominant receptor and confirm 0/3 can advance to 1/3 with Interact.
