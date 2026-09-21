# BLOB HOST CORE — HC-015F HOTFIX2

## Scope
Fix Ctrl+Shift+8 Signal Plain direct-test first-frame ambiguity without changing ecology progression or authored Signal Plain geometry.

## Root causes found
1. `DebugAreaJumpSystem` already updates `activeCellId` before `ModeController`, so Aperture mounts in the same runtime frame. The apparent Grave Route handoff failure was caused by `PlaytestHudSystem` lacking Comb/Aperture/Signal Plain branches and falling through to its legacy `GRAVE ROUTE` default.
2. The global tight inspection camera is intentionally persistent across cell changes. A direct debug test could therefore inherit a prior tight-camera state and produce a non-deterministic first frame.
3. `index.html` still carried the old HC-014I browser title, creating false build identity in screenshots and recordings.

## Changes
- Added explicit HUD title/state handling for Comb Threshold, Aperture Fields, and Signal Plain.
- Ctrl+Shift+8 now explicitly releases persistent tight inspection camera before staging the Signal Plain direct-test request.
- `DebugAreaJumpSystem` now receives `InspectionCameraSystem` as an explicit dependency.
- Updated browser tab title to HC-015F Player Perception / Visual Hierarchy HOTFIX2.
- Added `validateSignalPlainDirectJumpFirstFrameHC015FHotfix2.mjs`.

## Locked behavior
- Ctrl+8 normal Aperture jump unchanged.
- Ctrl+Shift+8 still resets only the local Signal Plain encounter and grants no ecology/progression credit.
- Signal Plain 3-read → Stabilize → READY → Pulse state machine unchanged.
- Region/gate progression unchanged.
- Signal Plain authored positions/geometry unchanged.

## Validation run
- `validateSignalPlainDirectJumpFirstFrameHC015FHotfix2.mjs` — PASS
- `validatePlayerPerceptionHC015F.mjs` — PASS
- `validateSignalPlainNearestDistanceOrderHC015F.mjs` — PASS
- `auditUndefinedThisMethods.mjs` — PASS
- `node --check` on edited runtime files — PASS

## Validation limitation
The uploaded HC-015F package does not include installed `node_modules`, so Vite/Three.js-dependent production/runtime validators were not rerun in this sandbox. Run `npm install` then `npm run dev` locally as usual.

## Acceptance test
Immediately after Ctrl+Shift+8:
- browser tab identifies HC-015F HOTFIX2,
- HUD must not say GRAVE ROUTE,
- HUD should report SIGNAL PLAIN once its local system is active (or APERTURE FIELDS during the handoff frame),
- persistent tight camera should be released,
- local ecology progress remains reset at 0/3.
