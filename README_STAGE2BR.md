# GSL-4E2G Stage 2B-R — harness call correction

The submitted Stage 2B report contains 10 PASS results and one test execution error. The last sample in the B09 rapid loss -> recovery -> loss check used `sample(x.false,'none',1.4)` instead of `sample(x,false,'none',1.4)`. This supplied undefined as the adapter and shifted the remaining arguments. The corrected harness changes only that period to a comma. All 11 original checks, production imports, report identifiers and output format are preserved.

## Install and run

Copy only `GSL4E2G_STAGE2B.mjs` from this archive into the BLOB-HOST-CORE repository root, replacing the existing harness with the same name. Keep this README outside the repository root if it would conflict with an existing README. No production file is included or needs replacement.

In PowerShell, from the BLOB-HOST-CORE repository root:

```powershell
node ./GSL4E2G_STAGE2B.mjs > ./GSL4E2G_STAGE2BR_REPORT.json
```

Upload `GSL4E2G_STAGE2BR_REPORT.json`. The JSON's pass field intentionally remains `GSL-4E2G-STAGE2B` so the checks remain comparable. Expected acceptance result: 11 passed, 0 failed. This is a target for the rerun, not a result already established on your installation. No browser session is required for this rerun.

## Pass contract

- Mode: Convergence. Milestone: validate the existing real-adapter-to-Guide integration with controlled attachment inputs.
- Purpose: let the existing rapid-transition test finish without a harness argument error.
- Allowed scope: this harness call and these delivery instructions.
- Forbidden scope and locked systems: production adapter, Guide, LS1 producer, movement, camera, controls, visuals, audio, timing constants and gameplay behavior.
- Files inspected: submitted Stage 2B report and original Stage 2B harness/archive instructions.
- Delete/disable targets: replace the defective harness call; no production systems are removed or disabled.
- Visual and feel targets: unchanged; this is a command-line validation repair.
- Acceptance tests: syntax check succeeds; exactly one character differs from the original harness; rerun returns 11 passed, 0 failed.
- Regression tests: preserve all 11 checks, their assertions, production imports, report scope, and non-mutation checks. The ten previously passing checks must still pass on the installed project.

## Validation and limits

Locally completed: Node syntax validation; exact comparison confirming the only code change is `.` -> `,` in the failing call. The complete integration suite has not been rerun here against your installed project, which supplies the production adapter and dependencies.

Still unverified by this harness: actual LS1 attachment-producer event semantics, browser rendering and human feel, and an explicit separate cooldown guarantee. The adapter's timed modes are not evidence of a separate cooldown. Once this rerun passes, the next validation target is the actual LS1 producer -> adapter -> Guide path; no new gameplay feature is added by this repair.
