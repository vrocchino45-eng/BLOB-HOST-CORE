# BLOB: HOST CORE — BOT1-D10A / Guided Target Closure

**Scope: TEST HARNESS ONLY.** This package contains only **four new Python files** and this README/manifest. No `src`, `public`, movement, camera, Fold, Watcher, Guide, chemistry, or LS1 runtime file is modified.

D9Z evidence: Golden and Recovery achieved owner-certified Listening Fold Stage 5; Guided earned the Watcher invitation but approached no closer than ~2.59 units against the authored 2.25 approach gate. D10A tests a bounded additional approach with only *public HUD cues* and regular keyboard inputs. The historical distance is used to design a fixed hypothesis; it is **never read by the live bot**.

## Prerequisite

The existing D9Y and D9Z scripts must already be installed in the local project root `BLOB-HOST-CORE`. In particular the files below must exist:

- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1d9z_browser.py`
- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1d9z.py`
- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/BOT1D9Y_REFERENCE.json`
- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/BOT1D9Y_UNIT_TEST_FIXTURE.json`

Do **not** move them into the top-level `scripts` folder. You do not need to reinstall D9Y or D9Z if their tests already passed.

## 1 — Install the delta

Download `BLOB_BOT1_D10A_TEST_ONLY_DELTA.zip` to the local **C: GitHub project root** (not Google Drive), then in VS Code PowerShell, from `...\Documents\GitHub\BLOB-HOST-CORE`:

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D10A_TEST_ONLY_DELTA.zip' -DestinationPath '.' -Force
```

The ZIP preserves `BLOB_BOT1_REAL_INPUT_HARNESS\scripts\...` paths. There is **no extra wrapper folder** to move, and no JSON files to copy.

## 2 — Run the D10A offline checks

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d10a.py
```

Expected: `Ran 15 tests ... OK`. These simulate policy and referee behavior; they do **not** certify live gameplay.

## 3 — Capture four browser runs

Start the usual game Vite server on `http://127.0.0.1:5173` in another terminal. Run this **D10A**, not the old D9Y/D9Z, browser script:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d10a_browser.py --browser-channel chrome --headed --profiles golden,guided,recovery,recovery_control --seconds 145 --output BOT1D10A_RESULTS
```

Profiles:

- **golden** — unchanged D9Z reference input itinerary; regression control.
- **guided** — existing D9Y reference route, then bounded small left-approach probes and reversals, checking the visible Fold cue after each step; Pulse and Q only after public Fold-answer cue.
- **recovery** — D9Z six-direction sweep, followed by the shared Recovery route and cue-aware closure.
- **recovery_control** — same recovery acquisition, shared route, and cue-aware closure **without the sweep**. This is a one-run A/B diagnostic, not causal proof.

All profiles use public HUD prompts, ordinary keys, precommitted movement, and elapsed time during the run; hidden owner state and REC1 are **not** inputs to targeting.

## 4 — Referee and ZIP the returned evidence

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d10a.py BOT1D10A_RESULTS
Compress-Archive -Path '.\BOT1D10A_RESULTS\*' -DestinationPath '.\BOT1D10A_RESULTS.zip' -Force
```

Upload `BOT1D10A_RESULTS.zip` for review. Verify that the console lists `golden`, `guided`, `recovery`, and `recovery_control`. The referee writes `BOT1D10A_EVIDENCE.json` and `.md` into the results folder.

## Evidence and acceptance

D10A succeeds as a convergence candidate only if:

1. **Golden remains certified Stage 5**, including paired Q stabilize start and end.
2. **Guided reaches owner Stage 1 and owner-certified Stage 5** (not merely invitation or a public prompt).
3. **Both Recovery arms have complete REC1** and the A/B results document their distinct input sequences.
4. Neither online policy inspects hidden positions, owner focus distance, surface attachment telemetry, or REC1 before capture ends.

The independent offline referee checks owner stage order, accepted Watcher read, invitation, paired Q start/end, capture integrity and Host events. Fold completion is **not** counted as a Host material receipt. These are assisted scripted tests, not autonomous discovery, human discoverability, or world-RNG seed diversity.

**If a bot fails Stage 5:** retain all REC1 and RUN logs. Do not change gameplay without isolating the cause.
