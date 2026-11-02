# BLOB: HOST CORE — BOT1-D11E Natural Silt Attachment Convergence

**Status:** Test-only delta, offline checked. Live browser runs **not yet performed**.

## Why this pass exists

D11D proved the HC tendril / support-plane / physical-attachment chain can work on the authored Silt shelf from an explicitly controlled debug pose. It also gave a **brief natural latch** near the leading edge with **zero supported samples**, followed by `sustained_contact_loss`.

D11E investigates *approach speed and timing* without changing gameplay or replacing the existing shelf. This is a diagnostic comparison, not a general attachment certification.

## Prerequisites — don't reinstall or reapply the old patches

- Work from the **local GitHub checkout** project root containing `src`, `public`, and `BLOB_BOT1_REAL_INPUT_HARNESS`.
- The D11B Silt shelf and the D11D `CoreEmbodimentSystem` bootstrap must **still be installed**.
- The D11C dev-only diagnostic probe must **still be enabled** (its patched `src/main.js` and `src/debug/BOT1D11CDiagnosticProbe.js`). This runner adds `?bot1d11c=1` itself.
- The earlier BOT1 real-input harness, Playwright/Chrome, and standard Vite dev server (`http://127.0.0.1:5173`) must work.
- If you ran `py .\D11C_APPLY.py --undo`, the diagnostic hook is absent. **Do not blindly reapply**: first inspect `src/main.js` and the D11C README for the existing patch state.

## What the five profiles do

| Profile | Entry | Behavior | Intended evidence |
|---|---|---|---|
| `host_positive` | Shift+1 | Prior HC contact route | Existing mechanical contact control |
| `natural_reference` | Shift+6 | D11D's original normal input route, plus tangent/peel trial | Regression comparison for brief natural latch |
| `natural_feather` | Shift+6 | Short separated forward pulses | Does gentler arrival improve anchor support? |
| `natural_brake` | Shift+6 | Forward then a brief counter-input | Does reduced entry momentum change contact retention? |
| `away_control` | Shift+6 | Move upward/sideways without approaching shelf | Rule out accidental sticky attachment |

**No D11E profile calls `controlledStart()` or moves the Core through debug code.** Shift+6 is still a *debug cell entry*, not a natural full-game route from awakening.

D11E uses player-equivalent keyboard actions during each course. The D11C probe collects mechanics telemetry but **does not steer the bot**; `REC1` remains independent corroborating evidence.

## Install and check (PowerShell)

Put `BLOB_BOT1_D11E_NATURAL_ATTACHMENT_TEST_ONLY_DELTA.zip` in your local `BLOB-HOST-CORE` project root. Run:

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11E_NATURAL_ATTACHMENT_TEST_ONLY_DELTA.zip' -DestinationPath '.' -Force
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11e.py
```

Expected: `Ran 31 tests` / `OK`. These are simulated policy and referee tests, **not live gameplay proof**.

**No patch installer, JSON reference data, or replacement of `src/` is included.** There are four new Python files under the existing harness `scripts` directory.

## Run five test profiles

Start Vite with your normal command, then use a separate PowerShell terminal at the project root:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11e_browser.py --browser-channel chrome --headed --profiles host_positive,natural_reference,natural_feather,natural_brake,away_control --rounds 1 --seconds 75 --output BOT1D11E_RESULTS
```

For additional repeatability later, use `--rounds 2` or `--rounds 3` with a **new output folder**. Controls run once; only the three natural approaches repeat. The code intentionally refuses to overwrite a nonempty output folder.

## Analyze and export

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11e.py BOT1D11E_RESULTS
Compress-Archive -Path '.\BOT1D11E_RESULTS\*' -DestinationPath '.\BOT1D11E_RESULTS.zip' -Force
```

Upload `BOT1D11E_RESULTS.zip`. The result directory contains the full trace, REC1, screenshots, per-run action records, and two readable/referee reports: `BOT1D11E_AUDIT.md` and `.json`.

## Exact evidence threshold

Natural profiles are **not** certified by a brief `attached` state, visible contact, shelf eligibility, or HUD text.

A full sequence requires **all** of these, with the expected Silt surface ID:

1. Eligible authored Silt surface recognized.
2. At least one sealed tendril, same-surface support plane, and physical attachment simultaneously.
3. A sampled supported interval of **at least 0.8 s, with at least five samples**; gaps greater than 450 ms break continuity.
4. Tangential displacement of at least 0.04 world units, projected into the sampled support plane, while attachment and support are present during the labeled lateral-input action.
5. Owner-recorded `deliberate_away_input` release within the marked upward-input window (or 450 ms after), followed by a sampled `free` state.
6. The HC positive control must still attach; the away control must not attach/seal on the Silt shelf.

These are **test acceptance thresholds**, not claims about desired player tuning. A passing *single* run is still not proof of universal reliability. Repeated rounds are required to estimate consistency.

If all three natural approaches fail, **do not change global movement physics**. Inspect the first failing stage, especially leading-edge geometry, approach normal, travel speed, and reach/seal time, and plan at most a narrowly authored shelf placement/slope experiment.

## Build boundaries

- Allowed here: new test-only policy, browser runner, offline referee, unit tests and report.
- Locked: LS1 movement physics, D11B `residue_weak` shelf identity/profile, D11D contact threshold, Core chemistry, Guide/Host runtime, D10B Fold regression test.
- No new Silt surface network until natural supported contact and release work.
- The old D10B Fold milestone remains the separate regression checkpoint. After a gameplay patch is proposed, run a compact Fold smoke check; D11E alone does not provide that evidence.

**Do not undo D11C or D11D before collecting D11E live evidence.** This package itself has no changes to undo: deleting its four `bot1d11e_*`/`analyze_bot1d11e.py`/`test_bot1d11e.py` files leaves gameplay untouched.
