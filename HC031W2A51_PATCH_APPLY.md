# HC-031W2A5.1 — First-Draw Activation Staging

## Apply

Apply this patch **over HC-031W2A5**. Copy the included `src/` and `scripts/` files into the matching paths in the current BLOB/HOST CORE project, replacing only files with the same names. This is a changed-files-only patch; do not replace the project with this folder.

Restart the Vite dev server after copying the files, open a fresh tab (or hard-refresh), and confirm the gameplay still reports visible build `HC-031W1`. Frame Truth should report `optimizationPass: "HC-031W2A5.1"`.

## What changed

A5.1 keeps A5's live-scene shader/bounds warmup, but adds render-only first-draw staging for the Surface Wake → Scar Flow and Scar Flow → Signal Chorus/Hub boundaries. Simulation, morph progress, targeting, contact, chemistry, routes, and controls continue normally. Prepared roots that gameplay has requested visible are admitted to `renderer.render()` one at a time while the previous render is <=65 ms. Roots held back for that draw have their visibility restored immediately afterward.

The activation order prioritizes destination surface/environment roots, then destination chemistry objects, then secondary transition/support presentation. If the previous render exceeds budget, no additional root is admitted on the next callback.

## Test

Run roughly **90–150 seconds** through:

`Surface Wake → Scar Flow → Signal Chorus/Hub`

Use Pulse/Stabilize and attach/detach at least once. No video is needed for this diagnostic. Export telemetry with **Shift+T**.

Check `developerTruth.frameTruth` for:

- `optimizationPass: "HC-031W2A5.1"`
- `lastRendererInfo.transitionActivationPass`
- `transitionActivationBoundary`
- `transitionActivationActivatedThisCallback`
- `transitionActivationRootName`
- `transitionActivationPendingRequestedRoots`
- `transitionActivationDeferredByBudgetCount`
- `transitionActivationPeakRenderMs` / `transitionActivationPeakRootName`
- `last40LongGaps[].previousTransitionActivation`

The last field is the critical attribution: if a long render gap remains, it records the exact prepared root admitted by the callback immediately before that gap.

## Acceptance target

- No unexplained transition render >500 ms; target <250 ms.
- First Scar/Hub transition windows >=0.90 sim/wall.
- Steady-state windows >=0.95 sim/wall.
- No obvious transition pop-in.
- Surface attachment/detachment/reacquisition and Stabilize+RS targeting behavior remain intact.

Do not change movement tuning, verb power/range, input mapping, route progression, the A4 50 ms/150 ms bounded catch-up rules, or the A4.1 once-per-callback presentation partition during this test.
