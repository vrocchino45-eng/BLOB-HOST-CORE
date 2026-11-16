# CONNECTION36 — Core capability sample metadata

November 14, 2026. Mode: convergence foundation. Baseline: CONNECTION33; CONNECTION34/35 were verification/audit only.

This delta adds an immutable, provenance-bearing Stabilize sample to the existing Core performance publication and a read-only guard for a future early-frame material consumer. It does not change repair, physiology, reserve, controls, audio or progression. No material owner consumes this sample yet.

Extract into the project root beside src/public, keeping CONNECTION36_PATCH intact, then run:

```powershell
node .\APPLY_CONNECTION36.mjs --check
node .\APPLY_CONNECTION36.mjs
```

Reload the game. Exact originals are retained in CONNECTION36_BACKUP. To undo, run `node .\APPLY_CONNECTION36.mjs --restore` and reload. Unrecognized edits and invalid payloads are rejected.

## Contract

CoreRadialPerformanceSystem remains the capability producer. Its new stabilizeSample records frame, accepted runtime time, callback substep/count, Host/cell, topology/counts, world-mode eligibility, debug-anatomy origin and the already-computed coherence coefficient. Publication and copied counts are frozen.

readPriorCoreStabilizeSample(frameState, dt) accepts exactly the preceding accepted step: the prior substep in the same callback or the final substep of the previous callback, with elapsed time matching the current positive <=50 ms step. Same-step, skipped/stale callback, invalid clocks, changed topology, foreign Host/cell, invalid coefficient, incomplete anatomy, inspection/Core Work, held placement and unresolved transitions are neutral. A valid current-cell chemistry context is also required. No registry ordering was changed.

This explicit prior-step contract is necessary because material condition runs before the current Core physiology producer. Later contact-ring presentation may read the newer coefficient. The reader returns a sample or null; it applies no benefit and grants no progression authority. Debug anatomy is identified, not treated as earned progression.

## Verification

- 21 new publisher/reader and old-source parity checks passed.
- All 26 existing quick cases / 503 checks passed.
- One live-input browser scenario passed, including a read-only observer at the actual early material slot, plate response, nutrient/seed checks, remounts and opening continuation.
- Production build passed.

The browser used existing P debug anatomy availability and declared camera/player poses, deterministic 60 Hz registry steps and prior safe-material passage. No material condition or relationship was injected. It observed 1,250 accepted and 181 rejected reads; these observations are not separate acceptance-test counts. Its example trace records previous-frame reads. Same-callback catch-up acceptance is covered by the owner test.

The parity test removes only stabilizeSample before comparing every pre-existing performance field and player-root diagnostic field against the saved CONNECTION33 owner over four topology fixtures and 120 held-input steps each. P01's historical comparison similarly excludes only the newly added metadata field; its mechanical assertions remain.

## Scope and remaining acceptance

Allowed scope: metadata producer, guarded reader, parity/clock tests and delivery. Locked: repair/chord rates, placement, 3→6→12 architecture, reserve law, movement/camera, seed rules, material transfer, route credit, receipts and HC027D1 mix. Delete/disable targets: none; CONNECTION31 remains isolated.

Visual and feel target: existing gameplay behavior is preserved. Human acceptance of CONNECTION33's plate response is still pending; this pass adds no visible improvement to approve. A future isolated repair comparison may reuse the existing bounded coefficient once, after checking meaningful timing, energy tradeoffs, lifecycle boundaries and material/ring agreement. No repair coupling is enabled here.

The current full campaign and unselected browser scenarios were not revalidated. Reports include the actual run scope. Earlier evidence remains historical.

Standalone new checks: `node .\CONNECTION36_CORE_SAMPLE_CHECK.mjs`. The browser runner is `node .\CONNECTION36_CORE_SAMPLE_BROWSER.mjs` with the usual Playwright/Chromium setup. The historical bot catalog retains its identities and counts; these new checks are separate.
