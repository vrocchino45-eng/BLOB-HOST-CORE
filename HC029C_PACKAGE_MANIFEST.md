# HC029C Package Manifest

Build: **HC-029C — Verb Composition Grammar**  
Parent: **HC-029B — Relationship Effect Ownership**

Intentional runtime JS diff vs HC029B:

1. `src/main.js`
2. `src/core/GameRuntime.js`
3. `src/interaction/VerbCompositionSystem.js` *(new)*
4. `src/chemistry/ChemObjectSystem.js`
5. `src/chemistry/BondSystem.js`
6. `src/player/CoreVerbPhysicalizationSystem.js`
7. `src/player/CoreRadialPerformanceSystem.js`
8. `src/player/CoreVerbEngineCouplingSystem.js`

Locked non-scope runtime owners: **103**.

Validation target:

- `npm run validate:current`
- all `src/**/*.js` syntax
- all `public/**/*.json` parse
- HC029A targeting hash preserved
- HC029B non-scope ownership preserved

`node_modules` is intentionally not included.

Validation result in package:

- `npm run validate:current` — PASS
- HC029C behavioral composition smoke test — PASS
- runtime JS syntax — 111/111 PASS
- public JSON parse — 434/434 PASS
- locked non-scope runtime JS owners — 103/103 PASS
- production Vite build — not claimed; dependency install timed out in handoff environment
