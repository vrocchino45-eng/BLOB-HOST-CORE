# HC-031W2A5 — Transition Render Warmup — Apply

Apply this changed-files-only patch **over the HC-031W2A4.1 project**.

## Scope

A5 does not change movement, controller mapping, verb behavior, route logic, render residency, the 50 ms simulation substep, or the 150 ms catch-up ceiling.

It corrects the existing dormant transition shader warmup so prepared transition roots are compiled against the **actual Host scene lighting/environment**, one root per idle slot, before those roots become visible. Geometry bounding spheres are also prepared during the idle warmup.

## Apply

1. Stop the Vite dev server.
2. Back up or commit the current HC-031W2A4.1 checkpoint.
3. Extract this ZIP into the project root and allow the included `src/` and `scripts/` files to replace the matching files.
4. Restart Vite.
5. Open a fresh game tab and hard-refresh once.

The visible game build remains `HC-031W1` intentionally. The definitive performance marker is:

`developerTruth.frameTruth.optimizationPass === "HC-031W2A5"`

## Focused test

Run about 90–150 seconds and cross:

`Surface Wake -> Scar Flow -> Signal Chorus / Hub`

Stay focused in the game tab. Use Pulse/Stabilize normally and make at least one surface attach/detach. No video is needed for this timing test. Export telemetry with **Shift+T**.

Useful A5 fields are inside each Frame Truth window's `lastRendererInfo`:

- `transitionWarmupPass`
- `transitionWarmupPolicy`
- `transitionWarmupPreparedRoots`
- `transitionWarmupCompiledRoots`
- `transitionWarmupPendingRoots`
- `transitionWarmupTargetSceneCompiles`
- `transitionWarmupGeometryBoundsPrepared`
- `transitionWarmupYieldedIdleSlots`
- `transitionWarmupFailedRoots`
- `transitionWarmupLastRootName`
- `transitionWarmupLastStatus`
- `transitionWarmupLastDurationMs`

## Acceptance direction

The critical comparison is the first Scar Flow transition window. A4.1 still produced three >1 s render stalls there. A5 should show the Surface-to-Guide warmup complete before entry and materially reduce or remove those first-use render spikes while retaining A4.1's near-real-time steady-state behavior.
