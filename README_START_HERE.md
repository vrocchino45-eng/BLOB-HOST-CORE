# BLOB: HOST CORE — BOT1-D11F Anchor Continuity Validation

**Mode:** experimental, diagnostic-only, no gameplay changes.  
**Baseline:** D11E natural attachment passed its limited sequence gate, but HC anchor spatial continuity remains unverified.

## Why D11F exists

D11E had three natural Silt attachment/release sequences. In Reference and Feather, the Core continued reporting the isolated `SILT_ENTRY_SEDIMENT_SHELF_D11B` surface identity even after moving several world units away and losing current surface eligibility. Surface ID retention may be valid over brief raycast gaps, but ID alone does not demonstrate an anchor is still on its mesh or within useful tether distance.

The existing D11C probe does **not** record actual `anchorWorld` positions; old D11E recordings cannot be retro-certified for this criterion.

## What this delta installs

- `src/debug/BOT1D11FAnchorGeometryInspector.js`: read-only, world-space, triangle-level nearest-point distances from each sealed anchor to its ID-matched authored mesh, plus Core-to-anchor and Core-to-carried-mesh distances.
- `D11F_APPLY.py`: safe, reversible insertion of one D11F diagnostic field into the **existing opt-in D11C debug probe only**; backs up that file and guards rollback with hashes.
- `bot1d11f_browser.py`: replays the **unchanged D11E** HC-positive, Natural Reference, Natural Feather, Natural Brake, and Away Control policies over three rounds (HC and Away only once). This uses ordinary keyboard input, debug *cell entry* but no debug repositioning, and never steers with owner data.
- `analyze_bot1d11f.py`: independent offline evidence audit; warns on sustained off-mesh anchors, extreme Core-to-anchor reach, continued attachment far from the carried mesh, missing geometry, and unexpected Away attachment. Thresholds are diagnostic, **not** changes to gameplay physics.
- `test_bot1d11f.py`: simulated-data regression checks.

**No changes to** `PlayerMovementController.js`, `CoreTendrilSurfaceContactSystem.js`, `CoreEmbodimentSystem.js`, world chemistry, surface registration, or the D10B Fold test.

## Requirements

Use your local **BLOB-HOST-CORE** root (where `src/` and `BLOB_BOT1_REAL_INPUT_HARNESS/` live). Keep these existing changes installed while testing:

1. D11B Silt shelf.
2. D11D contact bootstrap.
3. D11C diagnostic hook (`?bot1d11c=1`) and `src/debug/BOT1D11CDiagnosticProbe.js`.
4. D11E test policy (`bot1d11e_policy.py`) and established Playwright harness.

If D11C's probe has been edited since the supplied D11C package, the installer **stops** instead of making an unsafe edit.

## 1 — Install and verify

Place `BLOB_BOT1_D11F_ANCHOR_CONTINUITY_TEST_DELTA.zip` in your local project root. In VS Code PowerShell:

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11F_ANCHOR_CONTINUITY_TEST_DELTA.zip' -DestinationPath '.' -Force
py .\D11F_APPLY.py --check
py .\D11F_APPLY.py --apply
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11f.py
```

Expected unit test output: `Ran 19 tests` and `OK`. The package was also checked against D11E tests (50 combined offline tests).

## 2 — Live measurements (11 captures)

Run your usual Vite server at `http://127.0.0.1:5173`, then:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11f_browser.py --browser-channel chrome --headed --rounds 3 --seconds 75 --output BOT1D11F_RESULTS
```

The schedule alternates policy order by round; HC Positive and Away Control run once, each Natural policy runs three times. The instrumented trace remains `D11C_TRACE.json` but each new sample has `continuity.revision = BOT1-D11F-1`.

**Do not use a normal game URL for the measurement**: the runner automatically appends `?bot1d11c=1`, and D11F extends that opt-in diagnostic.

## 3 — Analyze and package

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11f.py BOT1D11F_RESULTS
Compress-Archive -Path '.\BOT1D11F_RESULTS\*' -DestinationPath '.\BOT1D11F_RESULTS.zip' -Force
```

Upload `BOT1D11F_RESULTS.zip` for review. The audit writes `BOT1D11F_RESULTS\BOT1D11F_AUDIT.json`. The analyzer reports **warning classifications**, not an automatic geometry repair or a gameplay lock.

## Interpretation rules

- **Candidate invalid anchor:** anchor whose carried surface ID has no matching visible eligible mesh, or whose world-space distance from that mesh is unusually large. Off-mesh warning threshold `0.35` units is exploratory, not a physics rule.
- **Candidate impossible tether:** Core-to-anchor distance over `1.2` units while the Core is still far from the carried mesh (`>1.0` units); this is a conservative signal to inspect against the contact subsystem's much shorter nominal reach.
- **Brief raycast gaps:** permitted; losing the current raycast alone is **not** a failure.
- **Geometric evidence unavailable:** explicit missing/unsupported classification; no pass may be inferred from a surface ID alone.
- **Lateral movement:** preserve the D11E claim of small supported displacement but do **not** relabel it extended traversal.

## D11F exit criterion

Review the nine natural run traces plus HC/Away controls. We need evidence that anchors remain on their authored geometry *and* the Core stays within plausible support reach, including through replanting and release. If this fails, the next change should be a narrow anchor-placement or identity-contract repair, **not** global adhesion, movement, or new Silt walls. If it passes repeatedly, we can design the first real network of connected Silt surfaces.

## Uninstall diagnostic only

After exporting results:

```powershell
py .\D11F_APPLY.py --undo
```

This restores the original D11C diagnostic probe byte-for-byte, and **does not** remove D11B, D11D, or D11C's main.js hook.

**Verification done here:** offline synthetic analyzer tests, archived D11E non-certification check, JavaScript syntax, safe D11F patch application and byte-identical rollback. **Not performed here:** Vite runtime, Playwright gameplay, or physical anchor continuity confirmation.
