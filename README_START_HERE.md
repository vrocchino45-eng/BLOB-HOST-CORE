# BLOB: HOST CORE — BOT1-D11K Brake Acquisition & Release-Axis Diagnosis

**Pass mode:** audit / diagnostic convergence. **Game physics modifications: NONE.**

## Why

D11J live return: Reference 3/3, Feather 3/3, Brake 1/3, HC + Away controls 2/2; no D11F mesh anchor warnings or observed premature sole-anchor pressure peels. Brake round 2 attached but the `C`-key release did not register; round 3 brushed/reached but did not seal. D11J remains **experimental**, not locked.

D11K tests input-caused hypotheses separately. No assumptions that `C` is always the outward surface direction. Source `ControlMap.js`: `C` ascend (+Y input), `W` forward (-Z), `S` back (+Z). **These keyboard input axes are not guaranteed to match contacted surface normals after camera/world transforms.** Surface normals and `peelIntent` are scored **after the run only**. No automatic steering or repositioning.

## Controlled matrix, default 16 captures

- HC positive and Away negative, once each.
- Natural Reference frozen ×2 and Feather frozen ×2.
- Brake original frozen (`S` 0.16s brake then `C` 1.15s release) ×2.
- Brake **no counter**: replace the 0.16s `S` input with an **equal-duration neutral period**, otherwise identical ×2.
- Brake **C extended**: `C` held 1.75s; **duration intentionally differs** ×2.
- Brake **W forward**: replace `C` release with `W` 1.15s ×2.
- Brake **S backward**: replace `C` release with `S` 1.15s ×2.

Round 2 reverses experiment ordering to reduce systematic sequence effects. **Do not mix the unequal duration C test into a same-duration axis causal comparison.** If a run never attaches, release is **not testable** and is NOT a release failure. The baseline is a small sample; this is exploratory, not certification.

## Dependencies

Existing local project containing D11B Silt shelf, D11D contact bootstrap, D11G rebased owner provenance fix, D11J owner guard, read-only D11C/D11F/D11H/D11I probes, and the BOT1 real-input harness. The D11K ZIP itself is only four test-harness Python scripts and its docs. It does not modify or install core runtime files.

## Install from VS Code PowerShell in the BLOB-HOST-CORE root

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11K_BRAKE_RELEASE_DIAGNOSTIC_DELTA.zip' -DestinationPath '.' -Force
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11k.py
```

If this test cannot import `bot1d11e_policy` or `analyze_bot1d11f`, the earlier harness setup is incomplete; preserve the error, do not reinstall the engine.

## Run with Vite open on 127.0.0.1:5173

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11k_browser.py --browser-channel chrome --headed --rounds 2 --seconds 75 --output BOT1D11K_RESULTS
```

Uses `Shift+1` HC positive, `Shift+6` Silt; debug entry only, **not** world-route completion. Runs use real keyboard events, never owner telemetry to steer. Captures per run: `RUN.json`, `D11C_TRACE.json`, `REC1.json`, start/end screenshots. Event hook presence, D11F geometry and D11H trace samples are checked. If probes are absent, the run records an error instead of producing a false pass.

## Analyze then upload

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11k.py BOT1D11K_RESULTS
Compress-Archive -Path '.\BOT1D11K_RESULTS\*' -DestinationPath '.\BOT1D11K_RESULTS.zip' -Force
```

Upload `BOT1D11K_RESULTS.zip`, even if the analyzer says `INCOMPLETE_D11K_EVIDENCE`. The audit includes per-run geometric measurements from the D11F triangle-mesh inspector, owner first-foot events, contact/release observations, support-plane normal snapshots, and sampled peak peel intent.

## What we decide next

1. **Brake acquisition:** Does replacing 0.16s counter-input with matched neutral change seal/support frequency without sacrificing geometric truth?
2. **Release:** With valid attachment at input start, which fixed direction (if any) produces an engine-observed `deliberate_away_input` transition and a following free state? Does extended `C` matter independently of input direction?
3. **Integrity:** Any D11G off-mesh warnings or D11J sole-foot pressure peel must stop promotion.
4. **Lock:** D11K diagnosis is **not** D11M acceptance. Full matrix of 9 natural passes + HC/Away + Fold D10B regression is still required before LS1 convergence lock.

**No gameplay source rollback needed**. Remove only these `*d11k*.py` files if desired. Original historical HC labels and LS1 version indexing remain unchanged.
