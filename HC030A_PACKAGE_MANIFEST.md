# HC030A Package Manifest

Build: **HC-030A — Reactive State Grammar**  
Parent: **HC-029C — Verb Composition Grammar**

Intentional runtime JS diff vs HC029C:

1. `src/main.js`
2. `src/core/GameRuntime.js`
3. `src/interaction/ReactiveStateGrammarSystem.js` *(new)*
4. `src/chemistry/ChemObjectSystem.js`
5. `src/chemistry/BondSystem.js`
6. `src/core/SessionTelemetrySystem.js`

Locked non-scope runtime owners: **106**.

Build-contract files added:

- `public/data/build/currentBuildIdentity_HC030A.json`
- `public/data/build/hc030aReactiveStateGrammarContract.json`
- `public/data/build/hc030aLockedOwnerHashes.json`
- `scripts/validateHC030AReactiveStateGrammar.mjs`

Validation target:

- `npm run validate:current`
- all `src/**/*.js` syntax
- all `public/**/*.json` parse
- HC029A targeting behavior preserved
- HC029C composition meanings preserved
- HC029C non-scope ownership preserved

Validation result in package:

- `npm run validate:current` — PASS
- HC030A behavioral reactive-state smoke test — PASS
- runtime JS syntax — 112/112 PASS
- public JSON parse — 437/437 PASS
- locked non-scope runtime JS owners — 106/106 PASS
- production Vite build — not claimed; dependency install timed out in handoff environment

`node_modules` is intentionally not included.
