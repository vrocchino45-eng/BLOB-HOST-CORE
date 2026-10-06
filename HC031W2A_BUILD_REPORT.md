# HC-031W2A Audit/Build Report

Mode: **read-only instrumentation**, implementation after matching-source audit.
Parent: HC-031W1 — Stabilized Aim + Local Contact Proof, 0.31.54.

## Source finding
`src/core/GameRuntime.js` uses `THREE.Clock.getDelta()` followed by `dt = Math.min(rawDt, 0.05)`. When the animation-loop callback rate drops, the unconsumed time is not simulated. `SystemRegistry` already contains a sparse per-system update timer; its hitch decision previously used the preceding transition publication, not the current frame's raw delta.

## Files in overlay
- `src/core/FrameTruthObserver.js` **new**: low-overhead windowed counter, percentile and exceptional-gap retention, snapshot only during export.
- `src/core/GameRuntime.js` **modified**: separate update/camera/render phase measurements around existing calls; no owner changes.
- `src/core/SystemRegistry.js` **modified**: use current-frame raw delta for timing sample classification, with legacy fallback.
- `src/core/SessionTelemetrySystem.js` **modified**: add `developerTruth.frameTruth` to existing Shift+T JSON; `percept` and telemetry schema unchanged.
- `scripts/validateHC031W2AFrameTruth.mjs` **new**: deterministic observer/export/ownership tests.

## Validation in packaging environment
- `node --check` on all four changed/new runtime modules: PASS.
- `node scripts/validateHC031W2AFrameTruth.mjs`: PASS, 25 assertions.
- `npm run validate:current`: PASS, including W1 stabilization/contact, V telemetry, U living ecology, T5 frame-rate smoke, undefined methods and recipe data.
- `git diff --check` on existing modified source: PASS.
- `npm run build`: NOT VERIFIED because inherited Windows node_modules lacks optional native Linux module `@rollup/rollup-linux-x64-gnu`; dependency tree and lockfile left untouched.
- Browser / recorder A/B: awaiting live Windows run, therefore no performance improvement claimed.

## Next decision gate
Compare unrecorded/recorded Frame Truth exports to distinguish callback stalls, update CPU cost, render cost, background throttling and discarded simulation time. Only then choose a minimal corrective W2A code change or proceed to W2B visual hierarchy.
