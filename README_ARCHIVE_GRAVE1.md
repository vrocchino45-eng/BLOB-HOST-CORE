# BLOB: HOST CORE — ARCHIVE-GRAVE1

November 9, 2026, America/New_York. Pass mode: Convergence / validation repair. Baseline: current HOST-CAUSE1. One production file changes. Normal gameplay and the Host-cycle tuning are unchanged.

## Install

In the BLOB-HOST-CORE project root, after HOST-CAUSE1:

```powershell
Expand-Archive -LiteralPath .\BLOB_ARCHIVE_GRAVE1_DELTA.zip -DestinationPath . -Force
node .\APPLY_ARCHIVE_GRAVE1.mjs
```

Reload the game. The installer checks the exact current RecipeDataSystem source, verifies the payload and saves the original before replacement. It refuses later/unknown versions. Repeated application is safe.

```powershell
node .\APPLY_ARCHIVE_GRAVE1.mjs --check
node .\APPLY_ARCHIVE_GRAVE1.mjs --restore
```

Restore reinstates the exact prior validator file if the installed file and backup are recognized. It restores the prior archive-validation failure along with that original file; it does not roll back unrelated gameplay patches.

## Problem and correction

Full legacy_archive validation previously stopped with “Grave local cell status is not valid for the current Grave pass.” The cell already contains the authored exit-readiness-era Grave data, but validateGraveRouteRecipePack chose allowed statuses through release-ID lists that ended at HC-014I. The retained source manifest is HC-015N, so it was misclassified as an earlier data-only stage.

The validator now identifies the actual loaded canonical read-loop capability: its ID, target cell, route ID, loop type and one of the already-supported runtime read-loop statuses. It then uses the same existing allowed cell/gameplay-loop statuses. The two stale build-ID lists are removed. No version is renamed and no arbitrary future-status wildcard is added.

This does not activate archived content. Loading data and validating it remain separate from runtime registry admission. The normal first_slice_runtime profile still leaves the archive translation and Grave recipe pack unloaded. Other archive content validation continues through the existing full validation path.

Changed file: src/data/RecipeDataSystem.js. No authored recipe, cell status, manifest ID, source authority or runtime system changes.

## Validation

- Before: normal data load passed; full legacy_archive load failed at the Grave cell-status check.
- After: both full first_slice_runtime and legacy_archive loads pass, including their existing schema-reference reports. This supersedes the archive-validation limitation recorded in earlier checkpoints for this current source tree. It does not assert that every historical build can be executed.
- Fifteen checks passed using actual normal/archive loaders and their validators. They cover complete archive validation; capability independence from the manifest label; rejection of wrong/missing loop identity, cell, route, type or status; rejection of unknown cell/gameplay-loop statuses; data-only archive scope; required objects; malformed loop sequence content; and restoration of valid data after negative fixtures.
- Normal running-browser boot keeps first_slice_runtime, inactive archive registration, zero initial credits and the existing HostConditionSystem. No recorded JavaScript/console errors. No archival systems are instantiated by the data-loader tests.
- Six guarded installer checks passed: baseline check, exact apply/backup, repeat application, restore, later-edit protection on apply/restore, and corrupt-payload refusal before writes.
- Vite production build passed with the existing large-chunk warning. Exact Three.js 0.179.1 and Vite 7.1.0 remain the local exercised versions; full transitive dependency-lock parity is not newly established.
- All other 165 production JavaScript files and the delivered Host recipe match HOST-READ1 / HOST-CAUSE1 hashes. The accepted material, receipt, movement, camera, Guide, reserve, goals and return owners are untouched. Their existing gameplay evidence remains current; no replay of the Silt journey is required for this validator repair.

## Pass boundaries

Purpose: remove a false archive-validation failure without weakening content checks or changing runtime admission. Allowed scope: the single stale Grave capability check, targeted negative cases, full data validation, normal boot, build and guarded installation. Locked: every gameplay system, source-history label and authored data value. Delete target: the two obsolete version allowlists only. Visual/feel target: retain current presentation and controls. Acceptance/regression: both data profiles pass while malformed data remains rejected and archive runtime stays inactive.

Evidence contains before/after load reports, test results, browser boot state, build output, installer results, exact diff and unchanged-source hashes. Scripts use the original audit layout; none are imported by normal startup.

HOST-CAUSE1 normal-play readability remains pending. This data-validation correction is not a claim that the player has accepted that visual/feel change, and it does not advance to another feature.
