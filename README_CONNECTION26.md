# CONNECTION26 — consolidated playable checkpoint

One guarded update brings a recognized CONNECTION20, 21, 22 or 23 installation to the latest verified gameplay and test catalog. If CONNECTION24 is already installed, the affected files are already current and the installer makes no changes.

Gameplay is the tested CONNECTION23 source. The bot catalog is CONNECTION24. CONNECTION25 provides the complete same-source catalog verification. This consolidation preserves those identities and earlier HC/LS1/CONNECTION history; it adds no gameplay behavior.

## Install

Extract beside package.json in the existing BLOB-HOST-CORE project, then run:

```powershell
node .\APPLY_CONNECTION26.mjs --check
node .\APPLY_CONNECTION26.mjs --apply
```

Reload the game if the installer updated production files. If it says the checkpoint is already present, no reload is needed for this package. CONNECTION25 was reports only and is not an installation prerequisite. These ZIP contents are an update for the existing project, not a standalone game or a replacement for its dependencies.

Original affected files are saved in CONNECTION26_BACKUP. Restore them with:

```powershell
node .\APPLY_CONNECTION26.mjs --restore
```

The installer validates affected files and required unchanged anchors, rejects unknown mixtures or conflicting edits there before writes, and can finish a recognized interrupted installation. Earlier backups, legacy metadata, unrelated files and playtest reports are preserved. It also recognizes CONNECTION22 applied directly over CONNECTION20, so it can include the otherwise missing CONNECTION21 Absorb update.

## Included changes since CONNECTION20

| Area | Included behavior |
| --- | --- |
| Absorb | Directional intake follows actual current progress; holding contact or stalling does not manufacture transfer feedback. |
| Silt disappearance | Background shader preparation cannot claim and hide a newly mounted live Silt root. |
| Vascular arrival | Existing fold wave uses the same Host-confirmed positive effect as arrival audio, with a brief warm-to-cyan accent and no replay on revisit. |
| Bot coverage | Recent sightline, Stabilize, arrival-audio and Absorb tests participate in the main catalog alongside the world/Core checks. |

Only three production files are supplied: FirstSliceTransitionCoordinator.js, CoreVerbPhysicalizationSystem.js and VascularRhythmRouteSystem.js. The remaining payload files are the existing catalog, its documentation and test scripts/fixtures. No control remap, camera change, material-transfer rule, progression rule or calibrated audio-gain change is introduced.

## Verification

CONNECTION25's complete review passed 37 cases / 423 summary checks across matching-source runs, covering 22 quick cases and 15 browser cases. Its reports are retained here as historical evidence for this exact production source; those gameplay cases were not rerun solely to package this consolidation.

Fresh consolidation checks passed 25 installer groups and six full-source installation/restoration scenarios. Each supported starting checkpoint installed to the same normalized production fingerprint as CONNECTION25. See RESULTS_CONNECTION26.md and CONNECTION26_EVIDENCE.

## Pass contract

Mode: convergence/package closeout. Purpose: establish one reviewable installation of the already verified connected slice. Allowed scope: assembling the existing changed files, version guards, installer verification and review instructions. Locked: production behavior, tests/thresholds, controls, camera, Core grammar, Host/region ownership, conservation, progression and audio calibration. Keep: all current runtime owners and historical checkpoints. Delete/disable targets: no runtime systems; replace the need to apply the individual CONNECTION21–24 updates in sequence for supported baselines.

Visual and feel target: identical to CONNECTION23. Acceptance: every supported baseline yields the canonical tested production source; exact restoration and interrupted-install protection work; older backups and reports survive. Regression evidence: the same-source CONNECTION25 catalog and unchanged current test payload. Next step: HUMAN_CHECK_CONNECTION26.md, a focused normal-play integration review. Human visual/listening/controller acceptance remains open.
