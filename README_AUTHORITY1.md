# BLOB: HOST CORE — AUTHORITY1

November 9, 2026. Mode: authority metadata correction plus next Host-cause contract. Install on the current PAIRED-DEMAND2 baseline. No gameplay changes.

## Install

In the BLOB-HOST-CORE project root:

```powershell
Expand-Archive -LiteralPath .\BLOB_AUTHORITY1_DELTA.zip -DestinationPath . -Force
node .\APPLY_AUTHORITY1.mjs
```

Reload the game. Three exact files are verified, backed up and replaced. Unknown/later edits are refused. Repeat application is safe.

```powershell
node .\APPLY_AUTHORITY1.mjs --check
node .\APPLY_AUTHORITY1.mjs --restore
```

## Correction and audit clarification

The previous BLUEPRINT-ALIGN1 audit correctly found contradictory text in the older planning translation file, but did not establish that the normal loader used that file. The loader trace now confirms it is loaded only by the legacy_archive validation profile. Normal first-slice runtime leaves it null. Thus the old text was an archival authority conflict, not evidence that hard gates were active.

A separate live defect existed: GameRuntime's source-package fallbacks read HOST_CORE_SOURCE_AUTHORITY.sourcePackage, which was undefined. This patch defines it as BLOB_HOST_CORE_REBUILD_BLUEPRINT_v0_1.zip. The existing GameRuntime code now publishes the correct primary reference without changing its scene or gameplay logic.

The archive translation now identifies rebuild architecture as primary and v1 documents as compatible detail, forbids hard gates/hard region transitions, and preserves local-cell/morph ownership. Historical role, build and next-pass IDs remain. The source authority's HC015N_HOTFIX2 and R0 rebaseline strings remain with explicit historical-role annotations; this does not claim a current milestone completion or renumber the project.

The translation validator now compares the primary/compatible packages with the shared source-authority constants and checks the explicit rebuild rules. Other archival planning documents keep their original content-source references. Those references are not globally rewritten as though every v1 content citation were wrong.

Changed files:

- src/core/HostCoreSourceAuthority.js
- src/data/RecipeDataSystem.js
- public/data/planning/blueprintTranslationLayer_HC003F.json

## Validation

- Normal first_slice_runtime data load passes before and after.
- Eleven authority checks pass: canonical package, compatible detail, preserved historical labels, archive non-mount in normal loading, actual corrected translation validation, and rejection of wrong/missing references or required architecture rules.
- Running browser boot publishes the correct live primary reference with the archive map inactive. A direct read-only conversion of the corrected archive map also supplies the correct reference and no-hard-gates rule. It does not activate archival systems. No recorded JavaScript/console errors.
- Eight guarded installer checks pass: exact three-file apply/backups, repeat application, restore, preservation of unknown edits at each target, and last-payload corruption refusal before any target write.
- Production Vite build passes with the existing large-chunk warning. Exact Three.js 0.179.1 and Vite 7.1.0 were exercised; full transitive dependency-lock parity remains unestablished locally.
- Full legacy_archive validation fails identically before and after with the pre-existing “Grave local cell status is not valid for the current Grave pass” error. This patch does not claim a clean archive validation. The affected translation validator is independently exercised against real loaded cell registries and passes.

The accepted regional owners, reserve/Core/HUD behavior, movement, Guide, receipt ledger and runtime scheduling bytes remain unchanged. Existing gameplay acceptance and checks are retained; no repeat Silt journey is requested for this metadata patch.

## Next bounded work

HOST_CAUSE1_CONTRACT.md defines the first proposed macro-to-local chain: existing Wounded Nursery external pressure → explicit Host condition publication → existing mounted Vascular physical/visual owner. It separates that cause from the already-authenticated Silt receipt channel and requires neutral parity, bounded recovery, a justified normal-play onset and no passive credits or material.

That contract is a proposal. No Host-pressure episode or new local physical effect is implemented by AUTHORITY1. Model and settle the authored onset before implementation rather than treating a test fixture as live macro ecology.

Purpose: restore unambiguous source authority and define one next causal slice. Allowed scope: the three metadata/validation files and written contract. Locked: all accepted gameplay and version history. Delete targets: contradictory authority statements only. Visual/feel target: retain current behavior. Acceptance/regression: authority publication, real data validation, browser boot, guarded installer, build and locked gameplay hashes. Evidence and exact diffs are included; screenshots are not.
