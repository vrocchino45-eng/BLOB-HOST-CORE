# BLOB: HOST CORE — BOT1-D11B Silt HC-style Surface Proof

**Status:** Experimental authored-contact proof. Not a locked LS1 drivetrain change.

## Why
D11A captured 166 Silt mobility samples, **zero mechanical attachments**, despite HUD visual contact. The uploaded source explicitly labels original LS1A habitat geology `visualOnlyAnatomy: true` and `addsContactSurfaces: false`. By contrast, the HC Host Contact Shelf uses `applyCrawlableSurfaceMetadata()` with profile IDs and cell scope. Silt's route does not register that metadata.

## Exact change
The reversible patch adds **one** readable, low-profile sediment shelf near the Silt route entrance, authored in a separate `hcCrawlableSurfaceProof` JSON section. It uses the **existing** `residue_weak` HC profile and Silt cell ID `CELL_SILT_PRESSURE_ROUTE_001`.

- Changed after applying: `src/routes/SiltPressureRouteSystem.js` (imports HC registration; creates one metadata-tagged mesh) and `public/data/routes/siltPressureRouteCircuit_HC012A.json` (one independent authored surface definition).
- New validator: `scripts/validateBOT1D11BSiltSurface.mjs` (checks both original Host positive control and new Silt surface raycast eligibility, plus cell isolation).
- **Unchanged:** `PlayerMovementController`, `CoreSurfaceTruthSystem`, adhesion values, input mapping, Host receipts, Fold, chemistry, material inventory, Guide, existing LS1A cavern geometry, and LS1B matter cycle.
- This **does not** convert all cave walls into colliders and **does not** grant new movement authority to the Silt pressure-contact/material patch.

## Installation — local BLOB-HOST-CORE root (C: GitHub folder)

1. Copy `BLOB_BOT1_D11B_SILT_HC_SURFACE_PROOF_DELTA.zip` into the local project root.
2. In PowerShell from that root:

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11B_SILT_HC_SURFACE_PROOF_DELTA.zip' -DestinationPath '.' -Force
py .\D11B_APPLY.py --check
py .\D11B_APPLY.py --apply
node .\scripts\validateBOT1D11BSiltSurface.mjs
```

The patch script fails before changing files if required anchors or the LS1A original contract differ. It backs up both edited files in `_D11B_BACKUP_ORIGINALS` first. Do not install on a different version without reviewing the preflight.

After the new validator passes, run the original Silt/HC regression scripts:

```powershell
node .\scripts\validateLS1ASiltHabitatFoundation.mjs
node .\scripts\validateLS1A2SiltContainedGeologicMedium.mjs
node .\scripts\validateHC031F1BCrawlableSurfaceAuthority.mjs
```

Your existing D10B Fold regression remains unchanged and is not required to prove Silt eligibility.

## Live evidence gate — before expanding contact geometry

With Vite running, use the existing **Shift+6** debug entry into Silt. Approach the new low sediment shelf near the first portion of the Silt passage. Observe whether the player actually latches; record REC1 on a focused ~1–3 minute run (not a long video). A D11A contact-profile rerun can supplement this, but an off-target script cannot disprove surface eligibility.

Grade these separately:
1. `surfaceCapabilityAudit.authoredSurfaceCount > 0` and a Silt `surfaceId` exists (eligibility **present**).
2. `coreSurfaceTruth.valid=true` and `mechanicalEligible=true` near the shelf (contact candidate **reachable**).
3. `playerAttachment.active` transitions `false → true` with the Silt `ownerSurfaceId` (real attachment **proven**).
4. Deliberate away-from-normal movement yields `true → false`, plus a recovery into free locomotion (release **proven**).
5. Leaving Silt clears the Silt surface candidate; no effects in Nursery/Host cells (cell isolation **proven**).

The included Node validator can establish 1, 2, and 5 in a controlled scene, but **cannot certify actual physical attachment or release**. Only live movement/owner telemetry can establish 3–4. The original HC shelf is a positive control, not a substitute for this proof.

## Rollback

```powershell
py .\D11B_APPLY.py --undo
```

This restores the backed-up route and recipe. The new standalone validator may remain in `scripts/` without affecting gameplay. Check your Source Control diff before committing.

## Next decision

- Host eligibility passes and Silt eligibility fails: debug Silt authored mesh placement/visibility/cell scope only.
- Both eligible, but Silt never attaches: test HC movement contact acquisition / input and normal evidence **before** changing adhesion.
- Silt attaches and releases: lock this one proof surface, then plan authored connective surfaces throughout reservoir, garden and veins in a separate LS1 surface-content pass.
- Never infer mechanical contact from HUD `Contact attached` alone.
