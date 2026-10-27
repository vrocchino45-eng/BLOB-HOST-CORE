# BLOB HIERARCHY-01 / BOT0 — Read-only milestone package

Nothing here edits or installs gameplay code automatically. This is a planning lock and a source-level deterministic bot preflight; it is NOT a new C0E3/C0E4 gameplay build.

**Read order:** `BLOB_BUILD_PATH_HIERARCHY_v1.md` → `BOT0_TO_BOT4_TEST_MATRIX.md` → `BOT0_SOURCE_PREFLIGHT_RESULTS.md`.

## Optional repeat BOT0 against your actual current local checkout
Copy only `scripts/botC0E3ConvergencePreflight.mjs` into your project `scripts/` folder; do **not** replace any existing script. Run:

```powershell
node scripts/botC0E3ConvergencePreflight.mjs
```

It imports the project copies of `src/world/RegionalTerritoryCoupling.js`, `src/world/RegionalTerritoryDynamics.js`, `src/player/CoreEngineSystem.js`, and `src/interaction/VerbCompositionSystem.js`. Those modules should already exist in the C0E3 baseline. If any import is missing, **stop**; do not reconstruct it from an older build. A preflight success says nothing about visual comprehension or 3D route completion.

**No source guard/apply needed:** there is no automatic mutation and no overwritten gameplay source. For exact integration with Git, add the script and documents as a single audit commit after confirming the checkout is the same baseline.
