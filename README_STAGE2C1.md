# GSL-4E2G Stage 2C1 — deliberate-release timer reset

## Result and scope

The installed adapter classified deliberate release correctly, but cleared only concernUntil. A previous recovery's supportUntil remained live, making the Guide retain support after deliberate release. This repair adds only `this.supportUntil = 0` to the deliberate-release branch. All other adapter behavior and its read-only input contract are preserved.

Local adapter validation: original file 8 passed / 5 failed; corrected file 13 passed / 0 failed. Four regression delays approximate the four reported recovery -> deliberate release sequences. Seven original Stage 2B adapter checks are preserved; six regression checks cover those four delays, fresh recovery after release, and a rapid loss -> recovery -> deliberate release sequence. The full Guide integration suite and browser capture have not been rerun here.

## Install (PowerShell, repository root)

Stop the game or close its browser tab first. Back up your existing adapter before copying the replacement:

```powershell
Copy-Item ./GSL4E2B_ReadOnlyAdapter.mjs ./GSL4E2B_ReadOnlyAdapter.preStage2C1.mjs -ErrorAction Stop
```

Copy these files from this archive into the repository root:

- GSL4E2B_ReadOnlyAdapter.mjs (replace the installed adapter)
- GSL4E2G_STAGE2C1.mjs (new adapter regression harness)

The included LOCAL_REPORT is evidence from this environment; do not treat it as a report from your installation. No src files are included or replaced.

Run BOTH commands in PowerShell:

```powershell
node ./GSL4E2G_STAGE2C1.mjs > ./GSL4E2G_STAGE2C1_REPORT.json
node ./GSL4E2G_STAGE2B.mjs > ./GSL4E2G_STAGE2B_AFTER_C1_REPORT.json
```

Upload both reports. Acceptance targets are 13/13 for the adapter regression and 11/11 for the existing real-adapter/Guide harness. Do not advance gameplay if either fails.

## Subsequent browser check

After the Node checks pass, start the game with a fresh browser page. The existing Stage 2C observer remains usable. In the BROWSER developer-tools Console (F12), run:

```javascript
await import('/GSL4E2G_STAGE2C.mjs')
```

Enable the existing Guide experiment with Ctrl+Shift+F9 if OFF. Repeat recovery followed quickly by deliberate release during normal play. Export in the BROWSER Console:

```javascript
__BLOB_GSL_STAGE2C__.download()
```

Upload the new report. A full Stage 2C PASS also requires an observed unexpected loss and recovery. Missing natural event coverage is INCOMPLETE, not evidence of a regression. The prior report recorded CELL_MEMBRANE_NURSERY_001; it does not establish LS1 Silt-area coverage. Use your existing route to the intended LS1 test area for region-specific confirmation; no debug warp is added by this repair.

## Pass contract

- Mode: Convergence. Milestone: correct the live-chain deliberate-release failure before expansion.
- Purpose: deliberate release immediately cancels prior concern and recovery support.
- Allowed scope: one timer reset in the installed adapter, regression harness, instructions and local evidence.
- Forbidden scope / locked systems: LS1 movement and attachment producer, Guide consumers, input mapping, camera, world, audio, visuals, 1.8s concern and 1.3s support durations.
- Inspected: installed uploaded adapter; Stage 2C report; Stage 2B-R harness.
- Delete/disable target: stale support response after deliberate release; no production system removed.
- Visual/feel target: deliberate release selects companion immediately; subsequent fresh recovery still receives normal support.
- Acceptance: 13/13 adapter regression checks, 11/11 installed Stage 2B checks, and no deliberate-classification errors in a subsequent live capture with relevant coverage.
- Regression: prior adapter checks, read-only attachment input, deterministic rapid transitions and recovery timeout remain valid.
- Next: confirm installed Node reports, then live behavior and intended-region coverage. Separate Guide cooldown, unobserved loss branches and visual quality remain unverified.
