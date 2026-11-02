# BLOB BOT1-D11B — Validator-only correction

## What happened
The first D11B validator expected the Host Contact Shelf raycaster to select `HOST_CONTACT_SHELF_MEMBRANE` from an overlapping group of authored surfaces. In the supplied screenshot it selected `HOST_CONTACT_SHELF_SCAR_BRACE`. The HC contact selector scores raycast hits by distance, continuity, and contact priority, so the hard-coded membrane expectation was invalid.

## What this corrects
Replaces **only** `scripts/validateBOT1D11BSiltSurface.mjs`. The corrected Host positive control:
- Confirms the original membrane surface remains authored.
- Accepts only a Host surface ID registered in the actual Host shelf.
- Verifies that the selected HC profile matches the registered surface and cell.

It **does not** change D11B's Silt shelf, the existing gameplay patch, locomotion, adhesion, recipes, or the live attachment gate.

## Install (PowerShell, from local BLOB-HOST-CORE project root)

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11B_VALIDATOR_HOTFIX.zip' -DestinationPath '.' -Force
node .\scripts\validateBOT1D11BSiltSurface.mjs
```

**Do not rerun `D11B_APPLY.py --apply`:** your screenshot already shows D11B applied and backed up.

If D11B passes, run the existing regressions:

```powershell
node .\scripts\validateLS1ASiltHabitatFoundation.mjs
node .\scripts\validateLS1A2SiltContainedGeologicMedium.mjs
node .\scripts\validateHC031F1BCrawlableSurfaceAuthority.mjs
```

## Evidence limitation
Passing these checks establishes authored metadata, local raycast eligibility, and cell isolation. It does not prove physical latch/release. Live telemetry must show `playerAttachment` changes before marking those mechanics proven in Silt.
