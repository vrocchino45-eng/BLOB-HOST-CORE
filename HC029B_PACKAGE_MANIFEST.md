# HC029B Package Manifest

Build: **HC-029B — Relationship Effect Ownership**
Parent: **HC-029A — Relationship Targeting & Intentional Focus**

Intentional runtime JS diff vs HC029A:

1. `src/main.js`
2. `src/chemistry/ChemObjectSystem.js`
3. `src/player/CoreVerbPhysicalizationSystem.js`
4. `src/world/AmbientMaterialInteractionSystem.js`

Validation:

- `npm run validate:current` — PASS
- runtime JS syntax — 110/110 PASS
- public JSON parse — 431/431 PASS
- locked non-scope runtime JS owners — 106/106 PASS
- `TargetingSystem.js` remains byte-locked to HC029A

`node_modules` is intentionally not included.
