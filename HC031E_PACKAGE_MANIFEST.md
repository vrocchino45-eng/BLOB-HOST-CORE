# HC031E Package Manifest

Parent: HC031D Rupture Consequence

New runtime source:
- `src/player/CoreTendrilSurfaceContactSystem.js`

Controlled integration edits:
- `src/core/GameRuntime.js` — import/create/register tendril presentation owner.
- `src/main.js` — build identity only.
- `package.json` — build metadata/current validator.

Validation/support:
- `scripts/validateHC031ETendrilSurfaceContact.mjs`
- `public/data/build/hc031eLockedParentHashes.json`
- `HC031E_BUILD_REPORT.md`
- `HC031E_FOCUSED_PLAYTEST.md`

Locked gameplay owners are listed in `hc031eLockedParentHashes.json` and must remain byte-identical to HC031D.
