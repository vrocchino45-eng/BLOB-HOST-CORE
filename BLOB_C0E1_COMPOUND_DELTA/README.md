# BLOB — C0E1 Compound Territories / World-Scale Grammar

**Baseline:** C0D4-MOB1 installed. **Delivery:** changed files only, 7 files (5 existing route/Hub/recorder owners + 1 new pure local territory presentation system + 1 new offline validator). No full source replacement.

## Why this is a compound pass

The three regions used to prove the Host circuit were built as local mechanics. C0E1 gives those mechanics coherent authored **surrounding spaces** and a simple experimental grammar:

- **Silt:** Porosity Shelf, Catchment Bowl, Deep Reservoir — sediment layers and outwash/settling tissues across the compressed passage.
- **Vascular:** Intake Branch, Exchange Fork, Return Capillary — branching membranes that brighten with Vascular-owned membrane load.
- **Grave:** First Imprint, Contradiction Terrace, Inheritance Vault — stratified memory tissue that responds to Grave's authentically retained Vascular history.
- **Hub:** Sediment Root, Transmission Root, Memory Root — three larger junction strands that visibly distinguish Host cause, applied response, and retained outcome.

Each region has three named exploratory sites with six paired ribs and twelve phase flecks per site, using small instanced meshes. The sites sit alongside existing corridors and destinations. This pass adds no new rooms outside the authored movement volumes, no new gate, objective, physical collider, fresh material supply or alternative scene owner.

### Experiments

While near a site, Pulse gives a brief local response; hold Stabilize or Absorb for about 0.7 seconds to observe a different, non-destructive response. These are **presentation-only reads** and intentionally do not intercept gameplay verbs. The circuit influences how tissue breathes/lights via values actually owned by Silt, Vascular, or Grave; it never invents a cross-region matter flow.

The active owner publishes `frameState.territoryExploration` (three sites, nearby site, observation counts, circuit status). The REC1 export remains at its original filename and schema version and now adds `c0e1-territory-discovered` and `c0e1-territory-verb-read`, plus `finalTerritoryObservation`.

## Install (PowerShell, from your BLOB-HOST-CORE folder)

Extract `BLOB_C0E1_COMPOUND_DELTA` alongside your `src` and `scripts` folders. Do not replace your entire project.

```powershell
node BLOB_C0E1_COMPOUND_DELTA/apply.mjs --check
node BLOB_C0E1_COMPOUND_DELTA/apply.mjs --apply
node BLOB_C0E1_COMPOUND_DELTA/validate.mjs
npm run build
```

First check must report `C0D4_MOB1_READY`. Stop if it reports `DIFFERENT`. If source changed independently, reconcile rather than force. The installer backs up exact previous bytes within `BLOB_C0E1_COMPOUND_DELTA/backups` and is idempotent. Rollback:

```powershell
node BLOB_C0E1_COMPOUND_DELTA/apply.mjs --revert
```

## Focused acceptance (10–15 minutes, no mandatory full circuit replay)

Visit Hub and two new territory sites in each regional area; approach one station; try Pulse, a short Stabilize hold, and Absorb. Verify tissue responds locally, existing objective interactions still work, and frame rate is acceptable. For a history-dependent test, generate Silt releases, visit Vascular and Grave, then return to Silt. Record with **Alt+Shift+R**, export with **Alt+Shift+E**, upload JSON plus optional short video. The test must find `c0e1-territory-discovered`, `c0e1-territory-verb-read`, and original C0D4 signal/receipt events, not a fabricated material arrival.

## Locks / future room

**Locked:** all C0C/C0D circuit and accumulator equations, route state and completion requirements, targeting, controller mappings, movement/current maths, Grave II 1.65s resonance hold, Hub route commit, first-visit scenes, REC1 legacy format.

**Explicitly not solved:** Hub stale boundary ownership/current frustration, full 3D passage expansion past existing ellipsoids, experimental probes acquiring chemistry ownership, real fluid/material transport. These are C0E2+ candidates after first field view.

**Build mode:** Compound Convergence + World Grammar. **Delete targets:** none identified as safe; no legacy systems reactivated. **Regression:** C0D4 recorder, C0D3 circuit, Silt/Grave/Hub route ownership, visual occlusion, spatial reachability, performance.
