# BLOB — BOT1-D11M Acquisition-Envelope Repeatability

**Mode:** read-only telemetry / fixed-input bot comparison. **No gameplay physics, geometry, adhesion, release thresholds, Core/Guide evolution, or controller mapping changes.** D11G/D11J remain experimental. D11M does not lock LS1.

## Why this pass

The D11L batch captured 16 runs and 2,548 REC1 events. Seven of 14 natural attempts attached; 7/7 attached attempts subsequently deliberately released. Of the seven Brake acquisition failures, five did not brush while the minimum sampled eligible Silt surface distance was ~0.499–0.649 (above the D11D 0.46 brush gate); two reached only after the fixed release interval started, without sealing. D11L is a *diagnostic-only* comparison, so this is not proof of a gameplay regression.

D11M keeps the original D11E Brake trajectory and tests a duration-matched neutral replacement for the 0.16s reverse-input step. It also checks how the extra D11L release-owner recorder affects observational timing. Never use telemetry to steer or teleport the bot. Shift+6 is a debug entry, **not proof of world navigability**.

## Prerequisites

- The exact currently working project with D11B/D11D and the experimental D11G/D11J mechanic updates in place.
- D11C, D11F, D11H, D11I **and D11L applied**, and the D11E / D11K harness scripts installed. D11M uses the existing D11F mesh truth and D11I owner events.
- Vite on `http://127.0.0.1:5173`, Python and Playwright with Chrome configured as for previous live runs.
- **D11L's installer must have been applied already.** The D11M guarded installer refuses a mismatching diagnostic source. Do not force or paste edits if it refuses.

## 1. Install from repository root in PowerShell

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11M_ACQUISITION_REPEATABILITY_DELTA.zip' -DestinationPath '.' -Force
py .\D11M_APPLY.py --check
py .\D11M_APPLY.py --apply
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11m.py
```

`D11M_APPLY.py` modifies only `src/debug/BOT1D11CDiagnosticProbe.js`, adding one debug-only API that can stop the D11L release-owner recorder independently for a test run. It creates checksummed backup files in `D11M_BACKUP_ORIGINALS` and supports `--undo`. It never edits the movement owner. A repeat `--apply` is safe; mismatched files and unsupported diagnostic versions cause a refusal.

**Undo D11M before undoing D11L or earlier instrumentation**:

```powershell
py .\D11M_APPLY.py --undo
```

## 2. Live run (default: 18 runs)

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11m_browser.py --browser-channel chrome --headed --pairs 3 --seconds 75 --output BOT1D11M_RESULTS
```

The default run is **12 Brake attempts** (3 repeats of baseline and neutral-counter under each observer condition), **4 Reference/Feather comparisons**, and **HC + Away controls**. Brake order and recorder condition alternate between rounds. For a longer repeatability test, `--pairs 5` runs 26 total trials; never overwrite or mix result roots.

**Recorder conditions:**

- `observer_on`: D11L release-owner method wrapper active (plus existing D11C/F/H/I and REC1).
- `observer_off`: D11L release-owner method restored **before the scripted approach**. D11C/F/H/I and REC1 **stay active**. This is a partial observer-effect comparison, not a recording-free gameplay benchmark. All fixed inputs and input durations stay identical within a matched Brake pair.

Owner-frame absence in the off condition is expected; the analyzer checks for this explicitly. The off condition should still contain D11I reach/seal/attachment events and D11F true authored mesh geometry.

## 3. Analyze and send complete output

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11m.py BOT1D11M_RESULTS
Compress-Archive -Path '.\BOT1D11M_RESULTS\*' -DestinationPath '.\BOT1D11M_RESULTS.zip' -Force
```

Upload `BOT1D11M_RESULTS.zip` even if the browser runner or analyzer exits nonzero. `BOT1D11M_AUDIT.json` contains per-run acquisition classes, pre-release nearest sampled eligible distance, observed approach time in the 0.46 brush envelope, wall-clock input action overruns, sample/frame gaps, inferred brush-gate reason counts, D11G geometry findings, D11J sole-sealed-anchor peel checks, plus grouped and per-round matched comparisons.

**Careful interpretation:** The sample intervals are not guaranteed 50ms; no full continuous contact window is proven. A run with no anchors cannot count as a geometry pass. Brush-gate reasons are *derived D11D classifications*, not owner-issued error codes. Surface-center velocity is a proxy, not collider normal velocity. Any apparent observer effect from ~3 trials per condition needs repetition.

## Exit gate and next decision

D11M is a diagnosis, not an LS1 lock. We need to identify whether misses originate in approach path/proximity, outward/velocity guards, reach/seal maturation, or instrumentation jitter. If the fixed bot simply misses the surface, correct the bot and test human-facing control mapping without lowering game constraints. If a repeatable, narrow runtime defect remains, scope a single owner repair and repeat HC, Away, D11F mesh, D11J, and frozen D10B Fold regressions. **Only then** proceed to two-surface LS1 geometry and later Core propulsion, environmental acclimation, phase progression, and Guide Signal Language.
