# HC-031W2A2 — Transient Render Budget Build Report

## Mode
Convergence / performance.

## Purpose
Reduce the remaining bursty renderer cost seen after HC-031W2A1 while preserving gameplay authority and the established Pulse visual language. Add low-frequency render-owner attribution so the next telemetry export can identify remaining scene-root cost instead of relying on total WebGL counters alone.

## Evidence entering the pass
The W2A1 focused run remained fully foreground/focused but produced only ~0.764 simulation-to-wall with ~15.75 callbacks/sec. W2A1 successfully bounded contour cages and reduced several CPU-side costs, yet render p50 remained roughly 35–42 ms in several windows and multiple focused `renderer.render()` calls exceeded 400 ms, including >1 second stalls. A window with zero active pulse contours still reported thousands of rendered lines, proving contour cages were not the only line owner.

## Changes
### CoreVerbPhysicalizationSystem
- Pulse fronts are capped at 3 simultaneous instances.
- Contact flashes are capped at 12 simultaneous instances.
- Pulse return motes remain capped at 10, but the newest response now replaces the oldest under pressure instead of being dropped.
- Pulse-front, contact-flash and return-mote geometries are shared instead of allocated/disposed for every event.
- Quick pulse-front wireframe resolution changes from 14x8 sphere segments to 10x6.
- Charged pulse-front wireframe resolution changes from 22x12 to 14x8.
- Focused pulse-front wireframe uses the bounded 14x8 geometry.
- Pulse charge shell changes from 18x10 to 12x8.
- Shared transient geometries are never disposed when an individual transient expires.

### Player Core pulse wave
- The existing Core release wave remains present but changes from 18x12 to 12x8 sphere segments.
- Triangle count for that wireframe source drops from 396 to 168; the corresponding triangle-edge upper estimate drops from 1188 to 504.

### RenderBudgetSystem (new)
- Every ~2 simulation seconds, performs a read-only census of visible scene renderables grouped by top-level scene root.
- Estimates draw calls, triangles, line segments, wireframe renderables and fully transparent renderables by owner.
- Maintains a candidate list of transparent/depth-write-disabled support renderables.
- Immediately before `renderer.render()`, temporarily hides only *leaf* renderables whose entire material set is fully transparent (`opacity <= 0.001`) and `depthWrite === false`.
- Restores authored visibility immediately after the render call.
- Does not cull faint/nonzero effects and does not alter persistent gameplay or scene state.

### Frame Truth
- Diagnostic identity advances to `HC-031W2A2`.
- Adds render-owner census to each window.
- Adds transient counts and zero-alpha cull counts to `lastRendererInfo`.

## Locked / unchanged
- `const dt = Math.min(rawDt, 0.05)` remains unchanged.
- Movement speed/acceleration unchanged.
- Controller mapping unchanged.
- Pulse/Absorb/Stabilize gameplay authority unchanged.
- Targeting and Stabilize+RS redirect unchanged.
- Surface attachment/contact thresholds unchanged in W2A2.
- Route/progression/chemistry/ecology unchanged.
- HC027D1 audio baseline/headroom unchanged.

## Validation
PASS:
- `node scripts/validateHC031W2A2TransientRenderBudget.mjs`
- `node scripts/validateHC031W2A1CostReduction.mjs`
- `node scripts/validateHC031W2AFrameTruth.mjs`
- `node scripts/smokeHC031W1StabilizedAimLocalContact.mjs`
- `node scripts/auditUndefinedThisMethods.mjs`
- Node syntax checks for all modified/new runtime modules.

EXPECTED LOCK-MANIFEST FAILURE:
- `validateHC031W1StabilizedAimLocalContact.mjs` rejects `src/player/CoreSurfaceTruthSystem.js` because HC-031W2A1 intentionally changed that file while the older W1 locked-parent hash still describes the pre-performance source. W2A2 does not change `CoreSurfaceTruthSystem.js`. The canonical W1 lock hashes were deliberately not rewritten.

ENVIRONMENT LIMITATION:
- `npm run build` cannot run in this Linux packaging environment because the supplied Windows `node_modules` tree lacks `@rollup/rollup-linux-x64-gnu`. Dependencies were not modified or reinstalled.

## Acceptance target for next run
Primary target remains foreground/focused simulation-to-wall >= 0.95 with materially fewer long render stalls. We also want to see rapid Pulse usage remain inside the 3-front / 12-flash / 10-return budgets and use `lastRenderOwnerCensus.topOwners` to identify any remaining dominant static scene root before considering the clock accumulator change.
