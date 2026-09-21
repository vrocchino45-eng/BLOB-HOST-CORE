# HC-031C1 Package Manifest

Runtime differences from HC031C:
- `src/targeting/TargetFocusRegistry.js`
- `src/combat/GraveRuptureHarvestSystem.js`
- `src/combat/RuptureHarvestGrammar.js`
- `src/core/SessionTelemetrySystem.js`
- `src/main.js`

New validation/build metadata:
- `scripts/validateHC031C1FragmentHarvestHandoff.mjs`
- `public/data/build/currentBuildIdentity_HC031C1.json`
- `public/data/build/hc031c1FragmentHarvestHandoffContract.json`
- `public/data/build/hc031c1LockedParentOwnerHashes.json`

`TargetingSystem.js` and `BondSystem.js` are byte-locked to HC031C.
