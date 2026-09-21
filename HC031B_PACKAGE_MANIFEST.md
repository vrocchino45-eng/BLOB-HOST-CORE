# HC-031B Package Manifest

Build: **HC-031B — Grave II Resonance Gameplay**  
Parent: **HC-031A1 — Grave II Octave Resonance + Exit Safety**

## New runtime owner
- `src/routes/GraveResonanceGameplaySystem.js`

## Intentionally changed existing runtime owners
- `src/main.js`
- `src/core/GameRuntime.js`
- `src/core/SessionTelemetrySystem.js`
- `src/routes/GraveReturnRegionSystem.js`

## New build / validation files
- `public/data/build/currentBuildIdentity_HC031B.json`
- `public/data/build/hc031bGraveIIResonanceGameplayContract.json`
- `public/data/build/hc031bLockedParentOwnerHashes.json`
- `scripts/validateHC031BGraveIIResonanceGameplay.mjs`
- `HC031B_BUILD_REPORT.md`
- `HC031B_FOCUSED_PLAYTEST.md`
- `HC031B_PACKAGE_MANIFEST.md`

## Locks
- 112 HC031A1 parent source-JS owners are SHA-256 locked.
- No new controller mappings.
- No new targeting authority.
- No new Grave geometry owner; HC031A1 remains spatial authority.
- No exit gate added.
