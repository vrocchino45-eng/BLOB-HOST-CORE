# HC031H Package Manifest

## Package

`BLOB_HOST_CORE_REBUILD_HC031H_PLANTED_CONTACT_SUPPORT_ASSIMILATION.zip`

## Parent

HC031G — Stabilized Projection / Focused Pulse V1

## Runtime changes

- NEW `src/player/CoreTendrilSupportPlaneSystem.js`
- MODIFIED `src/player/CoreTendrilSurfaceContactSystem.js`
- MODIFIED `src/player/PlayerMovementController.js`
- MODIFIED `src/player/CoreEmbodimentSystem.js`
- MODIFIED `src/core/SessionTelemetrySystem.js`
- MODIFIED `src/core/GameRuntime.js`
- MODIFIED `src/main.js`

## Build/validation additions

- `scripts/validateHC031HPlantedContactSupportAssimilation.mjs`
- `public/data/build/hc031hLockedParentHashes.json`
- `public/data/build/hc031hPlantedContactSupportContract.json`
- `HC031H_BUILD_REPORT.md`
- `HC031H_FOCUSED_PLAYTEST.md`
- `HC031H_PACKAGE_MANIFEST.md`

## Existing authority retained

- `PlayerMovementController` — translation
- `CoreSurfaceTruthSystem` — authored crawlable contact truth
- `CoreTendrilSurfaceContactSystem` — suction anchor placement/presentation
- `VerbCompositionSystem` — chord grammar
- `StabilizedProjectionSystem` — focused Pulse expression

## External dependency status

No new dependency added. Runtime remains Three.js + Vite only.

The procedural-spider project informed the architecture only; no external source file is included in this package.
