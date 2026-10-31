# BLOB: HOST CORE — BOT1-D9Y scripted targeting (test-only delta)

**Purpose:** use the actually captured BOT1-D9X run as a *reference itinerary* and test the same Watcher → Listening Fold milestones with three explicit bot roles. This is an assisted route test, not a human-discoverability or world-seed generalization test.

## What is included

- `BOT1D9Y_REFERENCE.json` — concise input-route calibration extracted from the **successful BOT1-D9X Seed-11 bot run**, plus the alternate Seed-13 entry actions. This is **not** a separately supplied human playthrough.
- `bot1d9y_policy.py` — three bounded public-HUD-driven policy variations.
- `bot1d9y_browser.py` — browser runner that enters **ordinary WASD/IJKL/X/Q controls**, records full REC1, and saves screenshots.
- `analyze_bot1d9y.py` — independent *offline* owner-stage / Watcher / Stabilize referee.
- `test_bot1d9y.py` — policy and negative-gate unit tests.
- `BOT1D9Y_UNIT_TEST_FIXTURE.json` — minimized D9X event excerpt for **unit tests only**; **not a full REC1 capture or independent certification**.

**No gameplay source, runtime ownership, camera, physics, chemistry, Watcher acceptance range, objective, Guide, or Host receipt behavior is changed.** No 1,500-file repack. This is a new-files-only patch.

## Install

Extract the ZIP at the **repository root** (the same folder containing `package.json`). Keep the relative `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/` directory structure. These six new files are the only files to add.

This expects your existing BOT1 harness from the full BLOB project (`bot1d3_browser.py`, `bot1d6_policy.py`, `bot1d9s_browser.py`, `bot1d9t_protocol.py`, `bot1d9w_policy.py`, etc.). The D9X delta does **not** have to be installed.

## Run in Windows PowerShell

In terminal 1 (repo root):

```powershell
npm run dev -- --host 127.0.0.1
```

In terminal 2 (repo root):

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d9y.py
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d9y_browser.py --browser-channel chrome --headed --profiles golden,guided,recovery --seconds 145 --output BOT1D9Y_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d9y.py BOT1D9Y_RESULTS
Compress-Archive -Path .\BOT1D9Y_RESULTS\* -DestinationPath .\BOT1D9Y_RESULTS.zip -Force
```

If Playwright is missing: `py -m pip install playwright`. Existing tests have used desktop Chrome; `--browser-channel chrome` assumes Chrome is installed. Use `--browser-channel ""` only if a Playwright Chromium browser is installed locally.

### Three bots

| Profile | Script | What it isolates |
| --- | --- | --- |
| `golden` | Exact Seed-11 Watcher actions and original ten-trial Fold course | Repeatability of last demonstrated working path; control |
| `guided` | Same proven Watcher setup; shorter route with HUD stops and limited left corrections | Whether the long rests/camera sweeps can be reduced |
| `recovery` | Seed-13 Watcher acquisition; measured neutral period, short guided route, bounded reposition | Whether a different entry pose can recover instead of drifting away |

All scripts branch only on **public HUD text**, not hidden Fold distance or owner coordinates. They do *not* understand the game geometry like a human player. The calibration trace supplies timing/ordering, not absolute spatial targeting. Trial paths are intentionally different and are **not guaranteed** to finish Stage 5.

## Interpreting the result

Check `BOT1D9Y_RESULTS/BOT1D9Y_EVIDENCE.md`. The referee requires full retained REC1, real Watcher acceptance **before** Fold Stage 1, real owner invitation, exact strictly ordered Stages 1→5, true Stage 5 completion, and a **Q keyboard hold paired with a gameplay Stabilize event**. Visual prompts alone cannot certify Stage 5.

- `ASSISTED_ALL_PASSED`: all three scripted attempts completed the recorded owner gate.
- `ASSISTED_PARTIAL`: one or two succeeded; use the failed profile's REC1 + `RUN.json` to isolate the cause.
- `ASSISTED_NONE_PASSED`: not a mechanic failure by itself; compare whether invitation, navigation or Stabilize failed.
- `INCOMPLETE_CAPTURE`: missing/incomplete recorder data, not a gameplay verdict.

No result certifies a **Host material receipt** or **Guide causality**. All profiles share the same game/world state generation; profile names are action policies, **not world RNG seeds**. This is explicitly an **assisted scripted test**—separate from natural targeting/discoverability.

## Development discipline

Freeze D9W and D9X as historical evidence. Do not replace the original result files. D9Y only adds test scripts and a compact recorded-route reference; preserve the current LS1 drivetrain and older HC index. If `guided` or `recovery` fails, first inspect the owner position/attachment trace **offline** to distinguish a wrong starting pose, surface drift, and cue recognition. Do not change movement/gameplay until the evidence isolates an owner defect.

**Live D9Y has NOT been executed or certified by this delivery.** Only Python compilation, policy tests, and offline replay of the already uploaded D9X evidence were performed. The small unit-test excerpt is not a substitute for uploading complete D9Y REC1 recordings.
