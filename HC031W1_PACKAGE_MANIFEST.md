# HC031W1 Package Manifest

Parent: HC031W  
Build: HC-031W1  
Package: 0.31.54  
Telemetry: blob.session.telemetry.v1.52

Changed-files-only overlay. No deletions. No `node_modules`, `dist`, `.git`, screenshots, videos, or telemetry captures are included.

## Runtime / data
- `package.json`
- `package-lock.json`
- `CHANGELOG.md`
- `src/main.js`
- `src/targeting/TargetingSystem.js`
- `src/ecology/EntitySystem.js`
- `src/fields/GatheringGroundAliveSystem.js`
- `src/core/SessionTelemetrySystem.js`
- `src/ui/PlaytestHudSystem.js`
- `public/data/build/hc031w1StabilizedAimLocalContactContract.json`

## Validation
- `scripts/validateHC031W1StabilizedAimLocalContact.mjs`
- `scripts/smokeHC031W1StabilizedAimLocalContact.mjs`
- inherited validators adjusted only to accept the newer package identity while retaining their behavior assertions:
  - `scripts/validateHC031UGatheringGroundAlivePass1.mjs`
  - `scripts/validateHC031U1StartupLifecycle.mjs`
  - `scripts/validateHC031U2PersistentLivingEcology.mjs`
  - `scripts/validateHC031U21RelationshipIntentLatch.mjs`
  - `scripts/validateHC031VLivingResponseTelemetryTruth.mjs`

## Handoff docs
- `HC031W1_BUILD_REPORT.md`
- `HC031W1_FOCUSED_PLAYTEST.md`
- `HC031W1_PATCH_APPLY.md`
- `HC031W1_PACKAGE_MANIFEST.md`
- `HC031W1_PACKAGE_MANIFEST.json`
- `HC031W1_DELTA_HASHES.json`
