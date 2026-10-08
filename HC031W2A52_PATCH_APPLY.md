# HC-031W2A5.2 — Renderable-Level GPU Priming

## Apply

Apply this patch **over HC-031W2A5.1**. Copy the included `src/` and `scripts/` files into the matching paths in the current BLOB/HOST CORE project, replacing only files with the same names. This is a changed-files-only patch; do not replace the project with this folder.

Restart the Vite dev server after copying the files, open a fresh tab (or hard-refresh), and confirm the visible gameplay build still reports `HC-031W1`. Frame Truth should report:

`optimizationPass: "HC-031W2A5.2"`

## What changed

A5.2 **retires A5.1 whole-root first-draw staging**. It does not serialize or hide authored transition roots in the live render path.

A5's live-scene shader/bounds warmup remains. After those resources are prepared, A5.2 walks the prepared roots for `surface_to_guide` and `guide_to_hub`, extracts individual drawable children, and primes them one at a time during browser idle slots using a **1×1 offscreen render target**. The offscreen clone shares the authored child's geometry and material, so the normal renderer draw/upload path is exercised without making the object visible in the game.

Known heavy roots are primed first:

- `guide_threshold_layered_interaction_HC006F`
- `hub_chamber_spatial_authority_HC008G`
- `scar_memory_fleck_001`

Priming does not own movement, targeting, contact, chemistry, morph progress, routes, controls, or progression.

## Telemetry

Check `developerTruth.frameTruth` for:

- `optimizationPass: "HC-031W2A5.2"`
- `lastRendererInfo.transitionGpuPrimingPass`
- `transitionGpuPrimingPolicy`
- `transitionGpuPrimingRootLevelStagingRetired: true`
- `transitionGpuPrimingQueuedRenderables`
- `transitionGpuPrimingPrimedRenderables`
- `transitionGpuPrimingFailedRenderables`
- `transitionGpuPrimingLastRenderableName`
- `transitionGpuPrimingLastRootName`
- `transitionGpuPrimingLastDurationMs`
- `transitionGpuPrimingPeakDurationMs`
- `transitionGpuPrimingPeakRenderableName`
- `transitionGpuPrimingPeakRootName`
- `last40LongGaps[].precedingTransitionGpuPrime`

`precedingTransitionGpuPrime` is the key new diagnostic. GPU priming happens between animation callbacks, so if an individual child prime itself causes a >250 ms gap, the next callback records that child's name, parent root, boundary, duration, and priming sequence.

## Test

Run roughly **90–120 seconds** through:

`Surface Wake → Scar Flow → Signal Chorus/Hub`

Use Pulse/Stabilize and make at least one surface attachment/detachment if convenient. No video is needed yet. Export telemetry with **Shift+T**.

## Acceptance target

- A5.1 root staging stays retired: no live root-level visibility serialization.
- `transitionGpuPrimingFailedRenderables = 0`.
- Surface→Guide priming queue reaches 0 before or very early in the transition; same target for Guide→Hub.
- No individual offscreen prime >250 ms; preferred <100 ms. If one is >250 ms, its exact child name must be captured.
- No unexplained live transition render >500 ms; preferred <250 ms.
- First Scar/Hub transition windows >=0.90 sim/wall; steady state >=0.95.
- W1 targeting/contact behavior and A4/A4.1 clock behavior remain unchanged.

Do not change movement tuning, verb power/range, input mapping, route progression, the A4 50 ms/150 ms catch-up rules, or the A4.1 work partition during this test.
