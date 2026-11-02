# BLOB — BOT1-D11D: Authored Surface First-Contact Bootstrap

## Purpose
D11C recorded a valid mechanically eligible Silt raycast at ~0.339 units, but `coreContactLanguage.state` stayed `suspended`. The tendril owner consequently requested no reaches; no sealed anchors, support plane, or physical attachment followed. This D11D experiment resolves only the first-contact circular dependency.

## Explicit scope
- **Changes one existing file:** `src/player/CoreEmbodimentSystem.js`.
- **Adds pure helper:** `src/player/CoreAuthoredContactBootstrap.js`.
- **Adds test:** `scripts/testBOT1D11DAuthoredContactBootstrap.mjs`.
- Does **not** change adhesion, player physics, controls, chemistry, Guide, Host receipt, source Silt shelf geometry, or Fold gameplay.
- A near, eligible authored surface may request **brushing**, not **attached**. The tendril, support-plane and movement systems still decide whether attachment actually occurs.
- Normal player approach, controlled debug pose and deliberate peel must be evaluated with owner telemetry; offline tests **do not** prove the fix works in-game.

## Install
From the local `BLOB-HOST-CORE` root (where `src` and `scripts` are):
```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11D_CONTACT_BOOTSTRAP_DELTA.zip' -DestinationPath '.' -Force
py .\D11D_APPLY.py --check
py .\D11D_APPLY.py --apply
node .\scripts\testBOT1D11DAuthoredContactBootstrap.mjs
```
Do **not** rerun D11B_APPLY; the shelf must already exist. If D11C diagnostics are still installed, keep them installed for the live run.

## Live test
Reuse D11C controlled and natural test scripts. Use a new output directory:
```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11c_browser.py --browser-channel chrome --headed --profiles host_positive,silt_natural,silt_controlled,silt_controlled_peel --seconds 75 --output BOT1D11D_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11c.py BOT1D11D_RESULTS
Compress-Archive -Path '.\BOT1D11D_RESULTS\*' -DestinationPath '.\BOT1D11D_RESULTS.zip' -Force
```
Upload the result ZIP for review. The D11C analyzer retains its old label; judge from the actual trace.

## Evidence requirements
- Silt controlled pose: `surface.valid=true`, `eligible=true`, and `coreContactLanguage.state=brushing` (not just visual HUD text).
- Then `coreTendrilContact.reachingCount>0`, `sealedCount>0`, support plane with carried Silt surface ID, and `playerAttachment.active=true` on the same surface. **Each is separately required**.
- Verify persistent tangential movement and owner-matched `attached -> releasing -> free` caused by deliberate away input. If no latch, report the *first failing stage*.
- Host control must still attach; D10B Golden/Guided regression is retained as a separate baseline (no need to repeat six runs for this first mechanics probe).

## Rollback
```powershell
py .\D11D_APPLY.py --undo
```
The rollback refuses to overwrite your subsequent edits. The helper remains on disk but is not imported after undo.

## Constraints
- D11B authored Silt shelf and D11C debug instrumentation are prerequisites for the same comparison.
- `AUTHORED_SURFACE_BRUSH_DISTANCE=0.46` is an **initial probe threshold**, not a new mechanical attachment radius. Do not tune it until live evidence warrants it.
- D11C's prior finding that Host positive attached cannot be used to claim that this new change passes Silt; only live D11D can establish that.
