# HC-031C Package Manifest

Parent: `BLOB_HOST_CORE_REBUILD_HC031B_GRAVE_II_RESONANCE_GAMEPLAY`

## Runtime source differences

Modified parent runtime/data owners:

- `src/main.js`
- `src/core/GameRuntime.js`
- `src/core/SessionTelemetrySystem.js`
- `public/data/chemistry/chemObjectRecipes.json`

New runtime owners:

- `src/combat/RuptureHarvestGrammar.js`
- `src/combat/GraveRuptureHarvestSystem.js`

## New validation/build truth

- `scripts/validateHC031CRuptureHarvestV1.mjs`
- `public/data/build/hc031cRuptureHarvestV1Contract.json`
- `public/data/build/hc031cLockedParentOwnerHashes.json`
- `public/data/build/currentBuildIdentity_HC031C.json`
- `HC031C_BUILD_REPORT.md`
- `HC031C_FOCUSED_PLAYTEST.md`

## Lock boundary

114 parent source-JS owners are hash-locked. `TargetingSystem`, `TargetFocusRegistry`, `BondSystem`, HC030 reactive-state/personality owners, HC031A1 octave owner, HC031B resonance owner, Grave route/crossing owner, and visual hierarchy compression are unchanged.
