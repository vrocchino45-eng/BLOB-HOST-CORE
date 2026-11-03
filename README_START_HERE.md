# BLOB: HOST CORE — BOT1-D11I First-Foothold Event & Dwell Comparison

**Mode:** diagnostic convergence, test-only. **No gameplay source edits.**  
**Source baseline:** D11B shelf + D11D contact bootstrap + D11G rebased anchor-provenance repair, with D11C/D11F/D11H diagnostic hooks already installed.  
**Reference:** D11H audit (`BLOB_BOT1_D11H_RESULTS_AUDIT_D11I_SCOPE.md`).

## Why this test exists

D11H passed **3/9** natural Silt approaches; the HC positive and Away controls passed. Some runs reached but never recorded a seal; others recorded momentary seal/support without sustained attached travel. The earlier ~25 ms probe was not truly event-granular in the live browser (median observed gap ~79 ms).

D11I adds a **debug-only owner-call observer** for the existing embodiment, tendril, support-plane and movement owner methods. It records method attempts and phase transitions as they happen; it does not substitute telemetry for ordinary controls and does not alter the return value of any wrapped owner method. The Silt geometry and LS1 physics remain unchanged.

**Evidence distinctions:** `reach_attempt`, `tendril_phase_transition` (seal), `support_plane_transition`, `movement_attachment_transition` are intercepted owner-method observations. `brush_gate_observation.candidateReason` is an **inferred D11D eligibility classification**, not an engine-emitted rejection reason. A successful seal event does **not** certify sustained support; D11F geometry + D11H owner-state criteria remain the independent gate.

## Test matrix (default: 14 runs)

Two natural policies (`natural_reference`, `natural_feather`) × three arms × two rounds = **12**; HC positive and Away controls = **2**.

| Arm | Path | Added time |
|---|---|---:|
| `baseline` | Unmodified D11E reference/feather input sequence | 0 seconds |
| `contact_dwell` | Same route plus hands-off pause immediately after final shelf approach | +0.70 seconds |
| `timing_control` | Same route plus equal hands-off pause **before** approach | +0.70 seconds |

No hidden telemetry steers the bot. All starts use ordinary `Shift+6` Silt debug entry (HC control uses `Shift+1`). **No controlled debug relocation.** `--rounds 3` expands the natural comparison to 18 + two controls = **20** captures, if desired later.

## Install

Copy `BLOB_BOT1_D11I_EVENT_DWELL_TEST_DELTA.zip` into your **local** `BLOB-HOST-CORE` root (the directory containing `src` and `BLOB_BOT1_REAL_INPUT_HARNESS`). In the VS Code PowerShell terminal:

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11I_EVENT_DWELL_TEST_DELTA.zip' -DestinationPath '.' -Force

py .\D11I_APPLY.py --check
py .\D11I_APPLY.py --apply
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11i.py
```

**If `--check` stops:** do not force it. D11I expects the installed D11H probe. Preserve the terminal output and source file for reconciliation.

## Live browser capture

With Vite running at `http://127.0.0.1:5173`:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11i_browser.py --browser-channel chrome --headed --rounds 2 --seconds 75 --output BOT1D11I_RESULTS
```

Each run saves `RUN.json`, `REC1.json`, `D11C_TRACE.json`, and screenshots. The trace includes `firstFoothold` (D11H) and `firstFootholdEvents` (D11I). If the event observer is unavailable the test stops instead of silently running an older probe.

## Analyze, package, upload

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11f.py BOT1D11I_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11h.py BOT1D11I_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11i.py BOT1D11I_RESULTS

Compress-Archive -Path '.\BOT1D11I_RESULTS\*' -DestinationPath '.\BOT1D11I_RESULTS.zip' -Force
```

Upload `BOT1D11I_RESULTS.zip` for review.

## Decision gate

- Confirm owner-call events and probe coverage for each capture, with no overflow.
- Distinguish a brush refusal (especially outward input) from reaching followed by a failed seal.
- Compare contact dwell with the equal-duration *pre-approach* timing control; do **not** ascribe causality to a small batch alone.
- Preserve D11G's **no orphan anchors** requirement, supported attachment, and deliberate release.
- Keep HC positive control and Away control passing.
- Use owner evidence to localize any future repair; no broad movement rewrite and no Silt network expansion from this diagnostic alone.

## Removal

D11I modifies only `src/debug/BOT1D11CDiagnosticProbe.js`, and backs it up under `D11I_BACKUP_ORIGINALS`. Roll back **after testing** with:

```powershell
py .\D11I_APPLY.py --undo
```

This restores the D11H probe bytes. The D11I helper remains dormant once it is no longer imported. **Do not undo D11H or D11F before D11I.** Existing D11B shelf, D11D bootstrap, D11G repair, LS1 movement, and chemistry files remain untouched.
