# BLOB: HOST CORE — C0C-VIS1-A / Vascular pressure anatomy

## Why this build exists

C0C5 and TRACE1-A/B established the Silt cause → Host receipt → Vascular local membrane load path, then revealed that the final brightness and opacity could obscure the smaller Silt-driven changes. VIS1-A adds **one conspicuous anatomical response** on the EXISTING vascular membrane folds, braided strands, and vessel envelope. Its shape follows the existing receiver's `membraneLoad` and a brief receipt-onset wave travels down the folds. No new mesh, light, prompt, force, material, progression credit, verb, or region transition is added.

**This is not a new physiological simulation.** It is a visual readout of Vascular-owned bounded receiver state. The Silt grains still do not physically arrive in Vascular.

## Changed-files-only installation

This package **adds** four scripts/docs plus one patch specification to the repository. It does **not** contain a replacement `src/routes/VascularRhythmRouteSystem.js`; the guarded installer modifies that one existing file only if its current SHA-256 matches the exact, previously verified TRACE1-B owner. `src/debug/WorldObjectCensusSystem.js` is untouched; its existing TRACE1-B recorder carries the new measurements automatically.

Extract into your current `BLOB-HOST-CORE` root, preserving folders. In the VS Code PowerShell terminal:

```powershell
node scripts/applyC0CVis1A.mjs --check
```

Required output: `src/routes/VascularRhythmRouteSystem.js: TRACE1B_READY`. If `DIFFERENT`, do **not** force or manually concatenate code. That means the file has diverged and needs a source-aware reconciliation. If `VIS1_INSTALLED`, the patch is already applied.

If `TRACE1B_READY`, run:

```powershell
node scripts/applyC0CVis1A.mjs --apply
node scripts/validateC0CVis1A.mjs
node scripts/testC0CVis1AThree.mjs
npm run build
node scripts/applyC0CVis1A.mjs --check
```

The final check should say `VIS1_INSTALLED`. If any validation fails, **stop before field testing** and share the terminal result. A Vite chunk size *warning* is not a build failure.

## Reversible installation

To return **only VIS1-A** to TRACE1-B:

```powershell
node scripts/applyC0CVis1A.mjs --revert
```

The installer stores an exact `.C0C_VIS1_A_BACKUP` next to the route owner, and refuses rollback if the installed code or backup changed. This is intentional: it never overwrites newer edits. To remove TRACE1-B instrumentation separately, first revert VIS1-A, then follow TRACE1-B's own rollback instructions. Do not delete the source backups before verifying your current baseline.

## What is different in the game?

When Vascular receives verified Silt signals:

- Each of the nine existing folds **contracts radially** and **rises vertically**, with a staggered traveling-pressure rhythm. The displacement depends continuously on existing membrane load, so it gradually relaxes as that load decays.
- The receipt event produces a short wave running across the folds (around five seconds maximum). A later new receipt can restart that transient, without adding any gameplay credit.
- Existing three braided strands and the vessel material receive restrained accompanying light/opacity changes; they do not become separate flashing targets.
- At `membraneLoad=0`, VIS1-A makes no changes to any existing mesh or material.

All movement, physics, targeting, grip, Pulse/Absorb/Stabilize logic, current force coefficient, chemistry, progression, receiver math, material conservation, and Host ledger behavior remain source-locked.

## Live REC1 test and controls

1. Restart your Vite server and reload the browser after installation.
2. With REC1 running, make **two or three legitimate Silt grain releases**.
3. Reach Vascular *without reloading*. Observe the folds near the main current, preferably from a steady camera angle. The initial receiving wave is brief; the remaining sustained tissue compression should be discernible while load stays elevated.
4. Remain in Vascular for **45–75 seconds**, observing recovery and whether the folds visibly relax. Export REC1 JSON and upload it.
5. Optional, if the existing build supports entry without sending receipts: compare an **unloaded Vascular visit** from similar framing. If that cannot be done without progression shortcuts, do not change the game to force it; we can use the numerical baseline in testing.

To inspect the exported file locally, put it in your project root and replace the filename below with the actual exported filename:

```powershell
node scripts/analyzeC0CVis1A.mjs "YOUR_ACTUAL_FILENAME.json" --out C0C_VIS1_A_FIELD.json
```

A new recording should contain `vascular-presentation-sample` objects with `presentation.vis1.revision = C0C-VIS1-A`. The existing TRACE1-B `applied` block additionally reports `foldMeanXScaleRatio` and `foldMeanZScaleRatio`, alongside the existing Y-scale, opacity and emissive measurements.

## Acceptance gates

- **Offline verified here:** source-hash guard; patch/revert/modified-source refusal; mocked 3,034 assertions including zero-load and repeated load sweeps; actual Three.js mesh/material smoke test; previous TRACE1-B recordings remain valid and correctly report no VIS1 measurements.
- **Local Windows proof required:** `npm run build` and browser with controller, actual REC1 sample capture, no navigation or control regression.
- **Perceptual proof required:** do the fold silhouettes visibly move and recover, and can you distinguish an unloaded vs loaded condition *without diagnostics*? Numerical parameter changes alone do not satisfy this gate.

**Environmental build note:** Production Vite build could not run here because the uploaded Windows source archive lacks the Linux-native optional Rollup binary (`@rollup/rollup-linux-x64-gnu`). Offline owner/parity checks and real-Three mesh smoke tests passed. Do not treat this as a browser pass.
