# CONNECTION21 — Absorb feedback

Presentation repair for CONNECTION20 (also compatible with its byte-identical CONNECTION19 production source). Historical HC/LS1 labels remain intact.

## Install

Extract this ZIP beside package.json in the existing BLOB-HOST-CORE folder:

```powershell
node .\APPLY_CONNECTION21.mjs --check
node .\APPLY_CONNECTION21.mjs --apply
```

Reload afterward. Exact originals are saved in CONNECTION21_BACKUP. Restore with `node .\APPLY_CONNECTION21.mjs --restore`. Unknown affected-file versions, incompatible anchors and later edits are refused rather than overwritten. Earlier backups are retained.

## What changes

- A held button alone no longer emits new intake fragments. New fragments require a visible, active, compatible bond whose published progress advances between valid observations. A first observation, target change, release/rehold or invalid-progress recovery establishes a baseline rather than replaying old progress.
- Forming, blocked or stalled contact stays quieter. Directional helix motion pauses when progress does not advance. Existing fragments from earlier progress may finish their short flight; they are not new transactions.
- A committed Silt grip remains a preview. It overrides a stale legacy bond for presentation and clears leftover legacy intake fragments, without changing the actual held grain or its material ownership.
- The line, funnel, helix and fragment destination now use world-space target/Core coordinates. Transformed parents no longer offset these graphics. A hidden or already absorbed target cannot keep a live intake connection.

Bond progress is process feedback, not proof of a completed material transfer. Completion and material ownership remain with their existing owners. No absorption threshold/rate, mass, targeting, controller mapping, camera/movement, receipt, progression, audio mix or geometry budget changes.

## Pass contract

Mode: convergence repair. Purpose: distinguish contact/preview from progressing Absorb using existing graphics and owner state.

Allowed scope: one existing presentation file and optional audit scripts. Locked: BondSystem and Silt transaction authority, conservation, Host causes, completion/credits, input mapping, camera, timing, 3→6→12 architecture and HC027D1 baseline.

Delete/disable targets: no systems removed; suppress fresh intake fragments when progress is absent/stalled or grip-only, and suppress stale visual carryover. Visual/feel target: a quiet pending connection, directional flow when actual bond progress advances, and correctly anchored effects. No additional effect layer is introduced.

Acceptance/regression: zero/stalled/invalid/incompatible progress, first observation and contact handoff, grip preview, hidden/absorbed targets, world anchors, real mouse/InputSystem/BondSystem progress, owner-state immutability under presentation, held-grain interruption and Core Work placement. Human readability and feel remain open.

## Short human check

Compare holding Absorb while a connection is forming or blocked with holding it on material that is progressing. The first should be quieter; progressing material should show inward motion. Switch targets and release/rehold to check that old progress is not replayed. In Silt, merely holding a grain should not look like that grain was consumed. Actual completion should still behave as before.

CONNECTION20's broader integration checklist remains useful. Pulse/contact work, named-site consequence tracing and additional regional sound replies remain queued. This update does not close the historical whole-Silt disappearance or the human Core Work configuration comparison.

## Evidence

See RESULTS_CONNECTION21.md and CONNECTION21_EVIDENCE. The root-level ABSORB_CHECK and ABSORB_BROWSER files are optional audit utilities. Browser reruns need Playwright/Chromium; their onboarding, pose and bond-state setup is explicitly staged. Internal screenshots are not included as deliverables.
