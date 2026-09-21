# HC030B Package Manifest

Build: **HC-030B — Material / Entity Response Personality**  
Parent: **HC-030A — Reactive State Grammar**

Intentional runtime JS diff vs HC030A:

1. `src/main.js`
2. `src/core/GameRuntime.js`
3. `src/interaction/ResponsePersonalitySystem.js` *(new)*
4. `src/chemistry/ChemObjectSystem.js`
5. `src/chemistry/BondSystem.js`
6. `src/ecology/EntityEcologyResonanceSystem.js`
7. `src/core/SessionTelemetrySystem.js`

Locked non-scope HC030A runtime owners: **106**.

Build-contract files added:

- `public/data/build/currentBuildIdentity_HC030B.json`
- `public/data/build/hc030bResponsePersonalityContract.json`
- `public/data/build/hc030bLockedOwnerHashes.json`
- `scripts/validateHC030BResponsePersonality.mjs`

Validation target:

- `npm run validate:current`
- all `src/**/*.js` syntax
- all `public/**/*.json` parse
- HC029A targeting behavior preserved
- HC029C composition meanings preserved
- HC030A reactive state thresholds/ownership preserved
- HC030A non-scope runtime ownership preserved

Validation result in package:

- `npm run validate:current` — PASS
- HC030B behavioral personality smoke — PASS
- runtime JS syntax — 113/113 PASS
- public JSON parse — 440/440 PASS
- locked non-scope runtime JS owners — 106/106 PASS
- production Vite build — not claimed; dependencies are not bundled in the handoff package

`node_modules` is intentionally not included.
