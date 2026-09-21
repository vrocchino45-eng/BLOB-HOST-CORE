# HC030B1 Package Manifest

Build: **HC-030B1 — Visual Hierarchy Compression**  
Parent: **HC-030B — Material / Entity Response Personality**

Intentional runtime JS diff vs HC030B:

1. `src/main.js`
2. `src/core/GameRuntime.js`
3. `src/presentation/VisualHierarchyCompressionSystem.js` *(new)*

Locked non-scope HC030B runtime owners: **111**.

Build-contract files added:

- `public/data/build/currentBuildIdentity_HC030B1.json`
- `public/data/build/hc030b1VisualHierarchyCompressionContract.json`
- `public/data/build/hc030b1LockedOwnerHashes.json`
- `scripts/validateHC030B1VisualHierarchyCompression.mjs`

Validation result:

- `npm run validate:current` — PASS
- runtime JS syntax — 114/114 PASS
- public JSON parse — 443/443 PASS
- locked non-scope runtime JS owners — 111/111 PASS
- production Vite build — not claimed; dependencies are not bundled

`node_modules` is intentionally not included.
