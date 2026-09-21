# HC022A1 — Runtime Stabilization Fix

HC022A failed during startup with `ReferenceError: surfaceTrace is not defined`
from `CoreEmbodimentSystem.createState()`.

Root cause: `surfaceTrace` existed only inside `deformBody()`, while `createState()`
referenced it during initialization. A second latent defect was found in the same
recent visual-memory code: `deformBody()` used `dt` without receiving it.

Fixes:
- `createState()` now derives `surfaceTrace` directly from `frameState.coreGrowth`.
- `deformBody()` explicitly receives `dt`.
- HC022A micro-play, ambient performance work, and inspection-intent behavior remain unchanged.

This is a corrective runtime pass only.
