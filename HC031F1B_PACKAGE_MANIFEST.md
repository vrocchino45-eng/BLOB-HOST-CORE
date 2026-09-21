# HC031F1B Package Manifest

Parent checkpoint: `HC031F1A — Surface Truth + Pull Readability`

Runtime source delta from parent:

- `src/world/CrawlableSurfaceRegistry.js` — new
- `src/world/HostContactShelfSystem.js` — new
- `src/player/CoreSurfaceTruthSystem.js`
- `src/player/PlayerMovementController.js`
- `src/player/CoreTendrilSurfaceContactSystem.js`
- `src/core/GameRuntime.js`
- `src/debug/DebugAreaJumpSystem.js`
- `src/main.js`

New build data / validation:

- `public/data/build/hc031f1bCrawlableSurfaceAuthorityContract.json`
- `public/data/build/hc031f1bLockedParentHashes.json`
- `scripts/validateHC031F1BCrawlableSurfaceAuthority.mjs`
- `HC031F1B_BUILD_REPORT.md`
- `HC031F1B_FOCUSED_PLAYTEST.md`
- `HC031F1B_PACKAGE_MANIFEST.md`

No legacy source was deleted in this convergence pass. Generic visible-mesh contact behavior is retired inside `CoreSurfaceTruthSystem` rather than left as a second competing sampler.
