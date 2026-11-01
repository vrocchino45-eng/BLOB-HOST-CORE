# BLOB: HOST CORE — BOT1-D10B repeatability smoke gate

**Mode:** diagnostic-only / test-harness-only. **The D10A browser runner, game code, LS1 drivetrain, Fold and Watcher logic are not changed.**

## Why this pass exists

D10A first batch: Golden and Guided missed Watcher acquisition. D10A rerun: both reached owner-certified Stage 5. One successful rerun is not a reliable regression baseline. D10B repeats the **unchanged** D10A Golden and Guided policies to see whether they acquire the Watcher and finish the Fold consistently, under new browser sessions.

## Package contents (all new files)

- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1d10b_repeat.py` — orchestrates the existing D10A browser runner; alternating order, fresh browser per round, no overwrite of earlier results.
- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1d10b.py` — reads exported REC1 offline; classifies each failure as capture, acquisition, approach or Fold interaction.
- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/test_bot1d10b.py` — 17 offline tests.
- `D10B_MANIFEST.json` — file hashes and boundaries.
- This README.

**Dependencies already installed in your project:** prior D9Y/D9Z/D10A harness scripts and `BOT1D9Y_REFERENCE.json` inside `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/`.

## Install — local Windows PowerShell, from BLOB-HOST-CORE root

Place `BLOB_BOT1_D10B_TEST_ONLY_DELTA.zip` in your **local GitHub BLOB-HOST-CORE folder** (not the separate Google Drive copy).

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D10B_TEST_ONLY_DELTA.zip' -DestinationPath '.' -Force
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d10b.py
```

Expected local tests: `Ran 17 tests` and `OK`. There are no JSON fixtures to copy into new locations.

## Run the new live repeatability gate

Start your normal Vite game at `http://127.0.0.1:5173`. Then:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d10b_repeat.py --browser-channel chrome --headed --rounds 3 --seconds 145 --output BOT1D10B_RESULTS
```

This launches six attempts using **unchanged D10A policies**:

| Round | First | Second |
|---|---|---|
| 1 | Golden | Guided |
| 2 | Guided | Golden |
| 3 | Golden | Guided |

Every run uses a new isolated browser context; each round starts a fresh browser process. These are repeats of input policies, **not** alternate game-world RNG seeds. The default six attempts are a smoke gate, not a statistical reliability estimate.

**Don't rerun the command into the same nonempty directory.** If all previously recorded rounds are complete, `--resume` can skip them. If a round is partial, use a new `--output BOT1D10B_RETRY` to preserve it rather than overwrite evidence.

## Score and package the results

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d10b.py BOT1D10B_RESULTS
Compress-Archive -Path '.\BOT1D10B_RESULTS\*' -DestinationPath '.\BOT1D10B_RESULTS.zip' -Force
```

Upload `BOT1D10B_RESULTS.zip`. The analyzer writes `BOT1D10B_EVIDENCE.json` and `BOT1D10B_EVIDENCE.md` at the results root, plus per-attempt D10B evidence files.

**Note:** The analyzer returns a nonzero command status if the repeatability gate fails, even when it successfully writes the report. That is a test verdict, not necessarily a Python crash. Read the printed classification and the generated report.

## Success and decision boundaries

Proposed smoke pass: all six attempts must have complete REC1 (`droppedDetails=0`, no runner errors), an owner-accepted Watcher read and invitation, Stage 1, and independently owner-certified Fold Stage 5 with paired Stabilize end events. Anything less identifies the failure layer. The gate will not silently pass an incomplete run set.

- **Golden succeeds, Guided fails:** investigate Guided's acquisition, approach or handoff using the specified failure category.
- **Both acquire Watcher but miss Fold:** inspect public cues, bounded approach, and interaction timing; no gameplay fix implied yet.
- **Both pass six attempts:** lock the scripted Fold smoke baseline *provisionally*, then shift test effort to LS1 Silt connection and surface traversal instead of tuning this Fold again.
- **Capture/REC1 incomplete:** repair the harness or rerun isolated captures before interpreting game behavior.

No hidden owner position/REC1 data enters the live bot's decision process. REC1 is an independent offline referee. Stage 5 does not establish a Host receipt or complete Core–Host–Guide causality. No game-world seed was controlled and no human discoverability was measured.
