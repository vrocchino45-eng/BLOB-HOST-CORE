# BLOB: HOST CORE — SILT-VIS1

Small presentation delta from the exported installed integration base. One production file changes: src/routes/SiltPressureRouteSystem.js. Existing HC/LS1 version history stays intact.

## Install

Put BLOB_SILT_VIS1_DELTA.zip in the BLOB-HOST-CORE repository folder. In its PowerShell terminal:

```powershell
Expand-Archive -LiteralPath .\BLOB_SILT_VIS1_DELTA.zip -DestinationPath . -Force
node .\APPLY_SILT_VIS1.mjs
```

Reload the game page after installation. The installer checks the exact source version, saves the original under SILT_VIS1_BACKUP, and applies the one-file change. If the source differs, it stops without replacing it; do not manually force the payload over another version.

To undo this delta:

```powershell
node .\APPLY_SILT_VIS1.mjs --restore
```

## What changed

Silt's visual geology now uses 60% of the normal fog depth. At the existing scene density, distant brown anatomy could fade almost into the background while labels remained visible. This change retains atmospheric falloff but preserves more of that geological reference as the camera pulls back.

The adjustment is confined to seven materials used by 23 meshes in the named Silt geological group. Wall opacity, openings, inward-facing material sides, geometry, movement, attachment, controller mappings, progression and material ownership retain their authored behavior. Ambient visual grains keep their existing fog. This does not make decorative rocks attachable.

## Evidence and limits

The frozen-camera baseline reproduced strong loss of environmental contrast without any release input. At an 18-unit camera offset, enabling both material sides made no measurable pixel difference in the weakest tested view; removing fog made a large difference. This demonstrates a fog contributor, not the complete cause of the earlier intermittent complaint.

The candidate was compared with the original shader at the same frozen scene state in twelve camera views. In that weakest distant view, the number of pixels distinguishable from a geology-hidden reference rose from 369 to 11,345 (960 × 540 image; maximum RGB channel difference greater than 8). This is a rendering diagnostic, not a universal visual-quality score. Four additional close views inside the Garden showed no pixels changing by more than 8 channel levels; the existing translucent overlap is not solved by this delta.

Separate controlled shelf attachment/release checks held the render camera fixed. Deliberate release was observed and route/geology visibility remained true with the candidate. This does not establish that the original intermittent release bug is fixed, or prove ordinary navigation.

Validation:

- Candidate browser: twelve camera views plus four Garden close views; zero recorded JavaScript or console errors.
- Scope audit: seven geological materials adjusted; 152 other material references retain their existing shader callback; one authored crawlable shelf retained; shell/channel sides preserved.
- Actual-recipe InputSystem → full Silt route regression: 9/9 pass, including grip, imprint, seat, extraction, ownership, Core Work suppression and unmount cleanup. Controlled placements/prior progress were used.
- Production Vite build: pass, 165 modules. Existing large-chunk warning remains. Exact installed Three.js 0.179.1 and Vite 7.1.0 used; full transitive lock parity was not established in this environment.
- Installer: apply, backup, repeat apply, restore, changed-source rejection and later-edit protection pass.

An initial candidate browser setup attempt served untransformed source and timed out. It was corrected by serving the candidate through Vite, then rerun successfully; that timeout is not a gameplay finding.

## Pass boundary

Mode: convergence/feel. Purpose: improve the existing Silt spatial reference at distant camera positions. Allowed scope: the named visual geology's fog shading. Locked systems: gameplay authority, camera movement, attachment, Guide timing, finite matter, original pressure route, controls and audio. Delete/disable targets: no production system; temporary camera/renderer interventions exist only in the local audit harness and are absent from this package.

Visual target: more brown anatomical context in world view, with existing apertures and close-view opacity preserved. Feel target: retain orientation while approaching and leaving the material area. Automated acceptance: browser compiles and renders the scoped shader, distant comparison improves, close views remain near baseline, mechanical regression passes. Human acceptance remains pending.

## Short play check

Spend a few minutes in the existing Silt area. Orbit and pull the camera back, then return close to the same sediment patch. Check whether the brown structure remains easier to read and whether the patch is still clear at close range. Continue normal play; there is no need to hunt the old disappearance or repeat a long recording.

The grain grip → imprint → seat → extract loop still needs ordinary-play confirmation. This delta does not declare that loop accepted.
