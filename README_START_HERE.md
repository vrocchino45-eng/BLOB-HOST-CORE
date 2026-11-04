# BLOB / BOT1-D11O — Tilted-Surface Release Precondition & Fixed Input Comparison

**Mode:** test-only diagnostic, no runtime mechanics change. This is not a locomotion lock.

## Scope and source continuity

Use after D11N. Requires existing D11C / D11F geometry / D11H foothold / D11I owner events / D11L release gate and D11N controlled start, plus D11G and D11J movement owners. D11O adds **three new Python files** (policy, runner, analyzer) plus an offline test script. It never replaces existing movement, game, physics, telemetry probe, or controller files.

**Falsifiable question:** Given a genuinely attached and supported Silt foothold, does a fixed upward-only release differ from fixed upward-plus-left or upward-plus-right input? Does that difference vary with sampled contact normal? No live normal steers the bot. The two approach contexts are a fixed tangential `a` contact preparation and a duration-matched neutral preparation; their resulting normal regimes are **observed**, not presumed.

- Default matrix: 2 rounds × 2 contact contexts × 3 fixed-release combinations = 12 experimental attempts, plus one each HC positive, Away, Reference, and Feather controls = **16 recordings**.
- Experimental input precondition: Core's *real* attachment active; supported Silt plane; at least one measured authored anchor within 0.35 unit; three recent independent valid samples over ≥150 ms. No direct state-forcing, script-created anchors or adhesive changes.
- If an attempt lacks precondition: classify `PRECONDITION_NOT_MET`, do **not** apply release key, preserve trace and don't count it as failed release.
- If it meets precondition: apply the predeclared key(s) for exactly 1.15 seconds. Read actual `deliberate_away_input` owner release events, D11L away-intent and model threshold, and D11F authored mesh measurement.
- A context labelled tangential does **not** guarantee a tilted plane; audit shows actual normal classes and `bothNormalRegimesObserved`.
- Retain previous D11G anchor integrity, D11J sole-anchor guard, and D10B Fold regression as independent later lock gates. This test is not normal player navigation proof: `Shift+6` + D11N debug setup is used.

## Install (Windows PowerShell)

1. Put ZIP in the GitHub `BLOB-HOST-CORE` root and expand its contents there:

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11O_ATTACHED_RELEASE_DIAGNOSTIC_DELTA.zip' -DestinationPath '.' -Force
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11o.py
```

2. With Vite running at `127.0.0.1:5173`, run the browser matrix:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11o_browser.py --browser-channel chrome --headed --rounds 2 --seconds 75 --output BOT1D11O_RESULTS
```

3. Analyze and zip the raw output regardless of verdict:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11o.py BOT1D11O_RESULTS
Compress-Archive -Path '.\BOT1D11O_RESULTS\*' -DestinationPath '.\BOT1D11O_RESULTS.zip' -Force
```

Upload `BOT1D11O_RESULTS.zip`. The analyzer's candidate release successes, precondition success count, controls, and normal-regime coverage are **separate** measures. Even 16/16 capture success does not certify release correctness.

## Parallel Guide lab

A separate ZIP `BLOB_GUIDE_SIGNAL_LAB_V0.zip` contains an isolated mock interpreter and JSON demo. It adds **no game integration**. A future event source must be independently verified before these Guide responses affect actual play. Its expressions are original, conceptual (not audible files or copied film sounds); HC027D1 mixing level remains unchanged.
