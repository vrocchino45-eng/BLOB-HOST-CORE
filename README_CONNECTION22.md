# CONNECTION22 — Silt scenery disappearance hotfix

For the current CONNECTION20 or CONNECTION21 checkpoint. This is a blocking visibility repair, not another visual-style pass.

## Install and reload

Extract this ZIP beside package.json in the existing BLOB-HOST-CORE project:

```powershell
node .\APPLY_CONNECTION22.mjs --check
node .\APPLY_CONNECTION22.mjs --apply
```

Reload the game afterward. The corrected coordinator must be running in the new session; a scene root already hidden in the old session will not repair itself just because files were extracted.

Exact originals are saved in CONNECTION22_BACKUP. Restore with `node .\APPLY_CONNECTION22.mjs --restore`. The installer checks affected files and unchanged anchors, refuses unknown mixtures/later edits, and preserves earlier backups and unrelated files.

## Reproduced cause

An asynchronous GPU/shader preparation job recorded the scene's root list when it started. When it finished, it treated every subsequently added scene root as its own dormant preparation content and hid those roots. The failure path did the same thing.

If Silt mounted during that interval, its newly created scenery root could be hidden after the region was already active. Its descendants stopped drawing together. Silt's owner, HUD, stock and separately owned labels could remain active, matching the reported symptom. A correct stock or material-mass total cannot establish that scenery is visible.

## Repair

Warmup jobs that span frames no longer claim, hide or reclassify roots mounted by gameplay during their lifetime. Synchronous destination preparation still hides/registers its own dormant resources as before. GPU/shader warmup itself remains enabled.

One production file changes: FirstSliceTransitionCoordinator.js. Geometry, materials, resources, attachment/release, mass, route progress, controller mapping, camera, sound mix and the earlier Silt foreground attenuation remain unchanged. The foreground effect never writes the whole Silt root's visibility.

## Regression coverage

R01 adds nine coordinator checks, including exact old-source reproduction, late success/failure protection and preserved synchronous dormancy. R02 adds two live-browser scenarios that mount actual Silt while an existing shader job is held at an explicit completion gate, then check visibility after late success/failure and five further normal callbacks.

The assertions require a visible region root and drawable descendant meshes alongside active owner/HUD state. They do not substitute mass or counters for render presence. The old source produces zero drawable Silt meshes in both controlled cases; the fix preserves 143.

The catalog now contains 27 cases / 344 machine-summary checks. RESULTS_CONNECTION22.md explains the split full-catalog and new-case runs on the identical production source. Internal screenshots were inspected; they are not included as deliverables.

## Pass contract

Mode: blocking convergence repair. Purpose: preserve live region ownership when background preparation completes. Allowed scope: coordinator root attribution and targeted regression cases. Locked: gameplay ownership, synchronous preparation semantics, timing/catch-up, geometry, visibility styling, chemistry, conservation, progression, mappings and audio baseline.

Delete/disable targets: remove asynchronous ownership inferred from unrelated scene additions; no preparation job or gameplay system removed. Visual/feel target: Silt remains physically present throughout background warmup. Acceptance: actual before/fixed race reproduction, both success and failure, persistent drawable geometry, unchanged owner/mass/credits, synchronous dormancy and full existing regressions.

## Human follow-up

After reload, revisit Silt and repeat the attachment/release sequence that exposed the issue. Confirm that scenery remains alongside its labels. This patch fixes the reproduced warmup race; other disappearance mechanisms are not ruled out. If it recurs, keep the scene/session export and approximate moment available.

The optional BEFORE_PREPARATION file is an exact old-source comparison fixture for the regression bots. It is not imported by gameplay. Browser tests use explicit scheduling gates and debug mounts; their controlled reproduction does not establish the exact timing of every historical human disappearance.
