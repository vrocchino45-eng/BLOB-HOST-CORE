# BLOB BOT1-D11A — LS1 Silt Mobility Diagnostics (TEST ONLY)

**Source basis:** `BLOB-HOST-CORE-BLOB-BOT0.zip` + previously installed D9Y/D9Z/D10A/D10B harness. D10B's six-run Fold baseline is frozen. **No JS, physics, region, chemistry, targeting, or gameplay changes.** Four new Python files only.

## Important scope

This is an **initial diagnostic**, not an automated proof that the Silt connective geometry is fully crawlable. The active source has a supported debug entry `Shift+6` for `CELL_SILT_PRESSURE_ROUTE_001`. The active movement observation stream (`C0D4-MOB1`, `G1-D9S`) records position/velocity, attachment state, regional boundary context, movement intent, and surface ID where published.

Source inspection found `applyCrawlableSurfaceMetadata` used in `HostContactShelfSystem` and `GatheringGroundAliveSystem`, not directly in `SiltPressureRouteSystem`. Therefore **Silt attachment is not guaranteed**. These tests deliberately say `NOT_EXERCISED_NO_ATTACHMENT_OBSERVED` if no mechanical contact occurs, rather than claiming the release action passed.

## Install to the LOCAL game folder

Open the **local GitHub working copy** of `BLOB-HOST-CORE` in VS Code, not the Google Drive extracted archive. Put `BLOB_BOT1_D11A_TEST_ONLY_DELTA.zip` in that root. From its PowerShell terminal:

```powershell
Get-Location
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11A_TEST_ONLY_DELTA.zip' -DestinationPath '.' -Force
Test-Path '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11a_browser.py'
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11a.py
```

Expected: `True`, then `Ran 18 tests ... OK`. This ZIP contains no external reference JSON files and overwrites no older D10B scripts.

## Run four diagnostic profiles

Start Vite normally at `http://127.0.0.1:5173`. In a separate PowerShell terminal in the same game root:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11a_browser.py --browser-channel chrome --headed --profiles baseline,contact,release_sweep,release_control --seconds 90 --output BOT1D11A_RESULTS
```

- `baseline`: neutral movement + forward/backward return probe
- `contact`: authored Silt platform + a bounded lateral/vertical approach search
- `release_sweep`: repeated approach prefix then six ordinary directional movements
- `release_control`: **same prefix and suffix** but six equivalent neutral holds rather than movement

Each run opens a fresh browser context, starts REC1, presses existing debug shortcut `Shift+6`, uses only standard keyboard input (W/A/S/D/C/Z), stops REC1, and saves the unmodified session JSON. REC1 is **never consulted to steer actions live**.

The two release runs are a descriptive A/B probe, **not randomized, state-matched, or proof of causality**. No contact normal is supplied to the bot. If neither run attaches, the proper conclusion is that attachment was not exercised.

## Analyze and return

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11a.py BOT1D11A_RESULTS
Compress-Archive -Path '.\BOT1D11A_RESULTS\*' -DestinationPath '.\BOT1D11A_RESULTS.zip' -Force
```

Upload `BOT1D11A_RESULTS.zip` including `BOT1D11A_AUDIT.md` and `BOT1D11A_AUDIT.json`. The report separates diagnostic validity, Silt entry, mobility samples, attachment state changes, per-step displacement, boundary pressure, and route/volume IDs.

## Conditions for choosing the next pass

1. **No Silt attachment**: audit/author contact-eligible Silt surfaces first. Do not keep inventing peel sequences.
2. **Attachment but no detachment**: inspect recorded position, state and boundary pressure; compare intended direction with source-owned normal if future telemetry exposes it. Do not change movement based on one bot trajectory.
3. **Detachment plus sustained free movement**: repeat from controlled starts and verify route return/reattachment before locking.
4. **Silt entry fails**: investigate debug platform entry and current build source identity, not the gameplay drivetrain.
5. **Any future movement code change**: rerun the existing D10B Golden/Guided Fold smoke gate (do not merge the result into D11A).

The baseline D10B test remains separately frozen. D11A does not prove Host receipt, player discoverability, or long-term drivetrain reliability.
