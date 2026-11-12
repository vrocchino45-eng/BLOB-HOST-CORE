# BLOB: HOST CORE — VASCULAR-II1 delta

November 8, 2026, America/New_York. Mode: bounded implementation / convergence. Adds the defined earned Vascular II handoff. Silt II is not implemented in this delta. Existing HC/LS1 identities remain indexed; the current checkpoint is SILT-VIS1 + VASCULAR-II1.

## Install

Put BLOB_VASCULAR_II1_DELTA.zip in the BLOB-HOST-CORE repository folder. In that folder's PowerShell terminal:

```powershell
Expand-Archive -LiteralPath .\BLOB_VASCULAR_II1_DELTA.zip -DestinationPath . -Force
node .\APPLY_VASCULAR_II1.mjs
```

Reload the game page. No dependency installation is needed.

The installer verifies the existing regional source, verifies every payload before modifying any file, and backs up the original Vascular owner. It adds the helper before replacing the importing owner. If a file differs from the expected versions, it stops; do not force the payload over newer work.

To undo this delta:

```powershell
node .\APPLY_VASCULAR_II1.mjs --restore
```

Restore refuses to overwrite later edits. It preserves Silt's VIS1 change and removes only the exact files this delta added.

## Play Vascular II

Complete Vascular's first route, return to the Hub and enter Vascular again. On that qualified revisit:

1. Approach the amber ring at the branch valve.
2. Hold LT (Q keyboard) briefly, then tap/release Pulse X while keeping LT held.
3. Follow the gold response toward the green intake ring.
4. Hold LT at intake until the paired current settles.

No precise beat timing is required. The source hold is 0.18 active seconds, response travel is 2.0 active seconds, and receiving stabilization is 0.75 active seconds. The HUD supplies the next action. The waiting receiver has no timed catch failure. If you leave it, unfinished settling relaxes while the accepted send remains available.

The original return fold remains available throughout; this goal does not trap the player. Unfinished handoff travel/settling pauses while the region is hidden or Core Work is active. Re-entry retains the accepted send. Repeated Pulses, old event IDs and remounts cannot repeat the completion credit.

One canonical vascular:phase_2 event is published after active receiving completes. ReturnRegionEngineSystem counts it; CoreEngineSystem stays a consumer. If the earlier four distinct credits are already earned, this is credit five and the engine correctly stays at 3-phase. The missing Silt II goal will supply credit six in a later pass. This delta does not unlock 6-phase early or change the O debug preview.

## Optional short test setup

This is a test-only alternative to replaying first-route prerequisites after a reload. It stages prior Vascular completion/return and a qualified revisit; it is not proof that those prerequisites were earned during that session. It never writes a new handoff, phase-two completion or phase-two credit, and it does not seed the other routes' credits.

After reloading the game, press Shift+5. Open the **game browser's Developer Tools Console** (F12), and run this there, not in PowerShell:

```javascript
await (await import('/VASCULAR_II1_TEST_START.mjs')).stage()
```

Return focus to the game and perform the four actions above. The setup places the player at the branch valve. It restores its temporary route wrapper on success or failure. If the current runtime already has a pending/completed handoff, it stops instead of erasing progress; continue that attempt or reload for a fresh test.

## Implementation boundary

Production files: one changed regional owner, src/routes/VascularRhythmRouteSystem.js, and one new bounded state helper, src/routes/VascularReturnHandoff.js. The optional root VASCULAR_II1_TEST_START.mjs module is not imported by the game.

The new state is local to Vascular. It checks real world positions of the existing branch/intake valves and normalized input. An eligible fresh source Pulse creates one bounded handoff, shown by a gold response moving between the two existing valves. An arrived response requires active receiving Stabilize; idle waiting or receiving without sending cannot complete it. Amber/green rings identify the paired valves. They remain non-targeting presentation objects and do not become physical attachment surfaces.

A completion waits if another owner has already published a different completion in the same frame, preserving the shared credit owner's next-update consumption. Old first-visit reads, first-route completion flags, passive Host membrane-load recovery and received Silt receipts do not become new credits.

Locked systems preserved: first-visit Vascular completion/recovery and return behavior; Silt material/visibility; original movement/contact/Guide/camera/control authority; audio; finite material; triadic engine and 6/12 thresholds; existing Host lineage; crossing ownership and historical numbering. Delete/disable targets: no production system. Temporary browser test exposure was removed when the disposable browser closed.

## Validation

- 14/14 actual-recipe route/InputSystem/credit/engine integration checks pass. These use controlled positions and retained first-return history; they cover ineligible first visits, source/receiver negatives, accepted send, hidden pause, partial settle recovery, Core Work suspension, one-time credit, remount retention, same-frame completion-slot protection and already-awarded protection.
- Original-versus-changed first-visit simulation completes identically: three reads, completion/recovery fields and return instruction match exactly under identical controlled inputs and positions.
- Running browser with the original system registry: optional test setup succeeded, real keyboard LT/Q + Pulse sent the response, keyboard movement reached intake, LT/Q received it, the counter moved from a declared four-credit fixture to five, the engine stayed at 3-phase, and movement through the original return fold reached the Hub with five credits retained. No recorded JavaScript or console errors.
- Existing cross-region connection regression: 18/18 controlled checks pass with the changed regional owner.
- Production Vite build passes (166 modules). Existing large-chunk warning remains. Exact Three.js 0.179.1 and Vite 7.1.0 were used; full transitive dependency-lock parity remains unestablished in this environment.
- Installer: eight apply/backup/idempotence/restore/partial-install/version/payload protection checks pass.
- Scope comparison: among the 703 exported baseline files, only Vascular and the previously delivered VIS1 Silt file differ. Silt still exactly matches the shipped VIS1 payload. New production code is confined to the Vascular handoff helper.

An initial browser setup timed out before the source hold was established. The corrected harness waits for the actual route to mount before staging, then supplies input promptly; the full send/receive/return sequence passed. No gameplay rule was changed to satisfy that setup timeout.

Human acceptance of the new Vascular II experience is pending. The automated setup uses retained-progress and source-position fixtures and reads world positions for navigation, so it does not prove earning the earlier objectives, human wayfinding, physical controller feel or audio. Existing provisional Silt acceptance remains separate evidence.

## Short acceptance check

Try one branch → intake handoff and return to the Hub. Check the amber/green distinction, whether the gold response is easy to follow, whether receiving feels deliberate, and whether the return still works. A short observation or clip is sufficient; there is no need to hunt the old Silt disappearance. Silt II remains the next separate implementation pass after this new goal is reviewed.
