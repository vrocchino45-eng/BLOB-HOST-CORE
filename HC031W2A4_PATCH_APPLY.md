# HC-031W2A4 — Bounded Simulation Catch-Up — Apply Notes

Apply this changed-files-only overlay **after HC-031W2A3 — Residency + Foundation**. Do not apply it directly to W1, W2A, W2A1, or W2A2. Keep a backup of the current working project.

## Copy
Open the patch's top-level `BLOB_HC-031W2A4_BOUNDED_SIM_CATCHUP_PATCH` folder and copy its contents into the matching **BLOB-HOST-CORE project root**, overwriting the included paths.

New runtime file:
- `src/core/BoundedSimulationCatchUp.js`

Modified runtime files:
- `src/core/GameRuntime.js`
- `src/core/FrameTruthObserver.js`
- `src/core/SystemRegistry.js`

Validator files are also included so W2A/W2A1/W2A2/W2A3 regression checks understand the deliberate A4 clock-authority change.

Do not replace `.git`, `node_modules`, saves, runtime data, or configuration. There are no gameplay/content delete targets.

## What changes
The old rule was effectively:

`raw elapsed time -> min(rawDt, 50 ms) -> one simulation update -> render`

A4 becomes:

`raw elapsed time -> bounded <=150 ms simulation budget -> 1–3 steps, each <=50 ms -> one render`

There is no unbounded backlog. A multi-second renderer stall still drops most of the stall rather than simulating it all afterward.

## Validate after copying
From the project root:

```powershell
node scripts/validateHC031W2A4BoundedCatchUp.mjs
node scripts/validateHC031W2A3ResidencyFoundation.mjs
node scripts/validateHC031W2A2TransientRenderBudget.mjs
node scripts/validateHC031W2A1CostReduction.mjs
node scripts/validateHC031W2AFrameTruth.mjs
node scripts/smokeHC031W1StabilizedAimLocalContact.mjs
node scripts/validateHC031W1HF1TargetClear.mjs
```

Expected: all seven commands pass.

Do not use `npm run validate:current` as the A4 acceptance command: that aggregate still starts with the historical W1 locked-file hash check that already rejects W2A1's intentional `CoreSurfaceTruthSystem.js` broad-phase change.

## Next playtest
Restart Vite and hard refresh. Run **90–120 seconds**, ideally:

**Surface Wake → Scar Flow → Signal Chorus/Hub**

No video is needed. Use the verbs normally and include some surface attach/release/reacquisition. Export with **Shift+T** and upload the JSON.

Confirm the export contains:

- `developerTruth.frameTruth.optimizationPass = "HC-031W2A4"`
- `developerTruth.frameTruth.total.simulationCatchUp`
- windows with `simulationCatchUp.multiSubstepFrames > 0`
- `lastRendererInfo.simulationSubsteps`
- `lastRendererInfo.simulationRecoveredBeyondLegacyCapMs`
- `lastRendererInfo.simulationDroppedMs`

The important comparison is W2A3's focused baseline: 104.025 s wall, 85.272 s simulated, ratio 0.820. We want ordinary slow frames recovered without turning the known 0.8–1.6 s renderer stalls into runaway simulation catch-up.

## Rollback
Restore these three modified runtime files from the W2A3 backup:
- `src/core/GameRuntime.js`
- `src/core/FrameTruthObserver.js`
- `src/core/SystemRegistry.js`

Delete:
- `src/core/BoundedSimulationCatchUp.js`
- `scripts/validateHC031W2A4BoundedCatchUp.mjs`

Restore the four updated W2A/W2A1/W2A2/W2A3 validator files from the W2A3 backup if you need an exact A3 tree.
