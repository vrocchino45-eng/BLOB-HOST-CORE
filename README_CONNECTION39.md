# CONNECTION39 — repeatable Core repair regressions

November 14, 2026. Mode: convergence / test-suite integration. **Gameplay remains CONNECTION38. This update does not enable or retune the repair trial.**

The formerly separate capability and repair checks now have permanent bot-suite identities:

| Case | Coverage | Mode / expected groups |
| --- | --- | --- |
| S01 | Capability publication, prior-step validity and old-source parity | Quick / 21 |
| S02 | Control versus opt-in repair, 486 runs / 243 pairs, default-off parity and catch-up | Quick / 13 |
| S03 | Normal URL through live input and opening continuation | Browser / 1 |
| S04 | Trial URL through live input and opening continuation | Browser / 1 |
| S05 | Trial inspection/Core Work, held exits, reacquisition and handoff | Browser / 7 |

The catalog now contains 28 quick cases / 537 checks and 22 browser scenarios. The three newly cataloged browser scenarios passed. Earlier case IDs and reports remain indexed; unselected browser cases are NOT_RUN for this pass.

## Optional test-suite update

You do not need this update to keep playing CONNECTION38. To add these cases to your local suite, extract into the project root, keeping CONNECTION39_PATCH intact, then run:

```powershell
node .\APPLY_CONNECTION39.mjs --check
node .\APPLY_CONNECTION39.mjs
```

No game reload is required for this test-only update. The installer keeps exact originals in CONNECTION39_BACKUP and refuses unknown edits. Restore with `node .\APPLY_CONNECTION39.mjs --restore` if needed.

Run the expanded quick suite:

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --quick
```

With the existing Playwright/Chromium setup, run the normal/trial pair and interruptions:

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --case=S03
node .\BLOB_BOT_SERIES1\run.mjs --case=S04
node .\BLOB_BOT_SERIES1\run.mjs --case=S05
```

Each invocation creates a fresh timestamped report directory. S02 now honors the suite's report destination. S03 explicitly chooses control and S04 explicitly chooses trial, so an inherited environment setting cannot accidentally make both runs test the same mode.

The S02 comparison intentionally pins the reviewed CONNECTION38 production fingerprint. A future gameplay source change must review and rebase that fixture before claiming its regression result. This is distinct from the runner's before/after source-mutation guard.

The repair trial still requires `?coreRepairTrial=1` in your normal game URL. Removing it and reloading returns to the control. Its feel comparison remains open; catalog integration does not count as human acceptance or default activation.
