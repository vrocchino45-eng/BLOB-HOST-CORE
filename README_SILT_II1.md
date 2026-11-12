# BLOB: HOST CORE — SILT-II1 delta

November 9, 2026, America/New_York. Mode: bounded implementation / convergence. Current checkpoint: SILT-VIS1 + accepted VASCULAR-II1 + SILT-II1. Historical HC/LS1 names remain indexed.

## Install

Use this after SILT-VIS1; keep your accepted VASCULAR-II1 installation for the complete earned 6-phase arc. Put BLOB_SILT_II1_DELTA.zip in the BLOB-HOST-CORE repository folder. In that folder's PowerShell terminal:

```powershell
Expand-Archive -LiteralPath .\BLOB_SILT_II1_DELTA.zip -DestinationPath . -Force
node .\APPLY_SILT_II1.mjs
```

Reload the game page. No dependency installation is required.

The installer verifies the current Silt source and all payloads, backs up the exact VIS1 Silt owner, adds its dependency before replacing the owner, and refuses unexpected versions. Do not force its payload over a newer source file.

To restore the prior Silt version:

```powershell
node .\APPLY_SILT_II1.mjs --restore
```

Restore preserves Vascular II and the original VIS1 fog treatment. It refuses later edits and removes only exact additions owned by this delta.

## Play Silt II

Complete Silt's first route, return to the Hub and enter Silt again. On that qualified revisit, perform one fresh journey with the same grain:

1. Aim at a circulating grain, hold LT and press A to grip it.
2. Bring it into the garden patch and Pulse through the held/braced contact until it imprints.
3. Keep LT held and press A to seat it.
4. Aim at that seated grain; hold LT and press A to extract it.
5. Move it clear of the patch and press A with LT held to release it.
6. Keep it free while the existing trajectory settles it near its circulation path.

Keyboard equivalents: Q = LT/Stabilize, E = A/Commit, X = Pulse. Absorb retains its existing use when moving the grain; it is not an artificial mandatory button step.

The HUD names the current step. Completion says “Silt II round trip complete.” The original amber return fold remains available. If you leave before the final native return, unfinished goal state is retained and evaluated after you return; the hidden region does not advance. Core Work suspends goal evaluation and cannot substitute for the deliberate release step. Existing material behavior during Core Work remains unchanged.

A fresh completed journey awards silt:phase_2 once. When the other five distinct credits have been earned, that is credit six and CoreEngineSystem switches to 6-phase: two phases per Pulse, Absorb and Stabilize function. Repeated receipts, remounts, old first-visit interactions, autonomous grain growth and wave finishes do not add another credit. The 12-phase threshold and O debug preview are unchanged.

## Optional short test setup

This skips replay of first-route prerequisites for a focused interaction test. It stages past first-route completion/return, a qualified Silt revisit and a near-grain starting pose. It does not create grains, advance the ecology clock, supply new journey receipts, complete Silt II or seed the other routes' credits.

After reloading the game, press Shift+6. In the **game browser's Developer Tools Console** (F12), run this there, not in PowerShell:

```javascript
await (await import('/SILT_II1_TEST_START.mjs')).stage()
```

Return focus to the game, aim at the nearby grain and perform the journey. The setup refuses to erase a pending/completed attempt. Its temporary route wrapper is restored on success or failure. If the grain moves before acquisition, follow/aim normally; the helper does not freeze it.

Credit totals in this optional setup depend on the rest of that runtime's progress. A standalone Silt test does not establish that the other five credits were earned. Runtime progress is not a new cross-session save feature.

## Implementation

Production changes are confined to src/routes/SiltPressureRouteSystem.js and the new src/routes/SiltReturnRoundTrip.js. The optional root SILT_II1_TEST_START.mjs file is never imported by normal boot.

The goal reads receipts at the existing authoritative decision point, so a bounded 64-row diagnostic trace cannot discard required evidence before observation. It stores one bounded attempt, one grain ID and ordered proof sequence references. The eligibility cursor excludes first-visit receipts. A different grain cannot supply the selected grain's seat/extraction/release proof. Choosing another grain before seating starts a clean attempt. Reacquiring a released grain requires a fresh deliberate release before native-return completion.

The final proof comes from that grain's existing free-trajectory nearNative state on a subsequent active advance, with environment ownership, no grip/seat and eight conserved mass units. A global near-native message from another grain is insufficient. The existing 0.22/0.32 native-attractor thresholds are unchanged; no extra dwell or speed timer was added.

Only the Silt regional owner publishes the completed canonical event. ReturnRegionEngineSystem remains the credit/unlock authority and CoreEngineSystem remains the consumer. A different same-frame completion publication is preserved; Silt waits for a later free publication slot.

This observer does not change grip range, aim selection, contact pressure, imprint requirements, seating, extraction, trajectories, material identity/physics, first-route completion, VIS1 rendering, return crossings, player/Guide/camera authority, controls, audio, or the accepted Vascular II source.

## Validation

- 14/14 combined integration checks pass using real normalized InputSystem input, both new regional goal owners, the actual Grave II completion evaluator, existing credit owner and Core engine. Retained first-return/near-resolution and contact/player-position fixtures were supplied. Actual receipts and the native trajectory supplied the new goal proof. The sequence reached six credits and 6-phase with mass eight, then survived repeated frames/remount. Core Work release exclusion, publication-slot contention and already-awarded exclusion were checked.
- 13/13 synthetic receipt-negative checks pass: stale/inactive receipts, missing imprint, mixed IDs, new attempts, relaxed imprints, implicit exit release, suspended receipts, another grain's native state, invalid ownership/mass, no subsequent advance, reacquisition and repeated completion. These test the observer contract, not earned gameplay.
- Existing accepted material regression: 9/9 pass with the changed Silt owner.
- Existing regional connection regression: 18/18 pass.
- Running browser with original scheduling: actual keyboard input completed Vascular II, then actual input completed Silt II's grip/imprint/seat/extract/release. The existing trajectory supplied native return. The counter reached six, the engine reached 6-phase, mass stayed eight, and keyboard movement through the original return fold reached the Hub with six retained. No recorded JavaScript or console errors.
- Browser qualifications: the earlier four credits were a declared past-progress fixture; the optional staging helpers provided qualified revisits/source poses, and the Silt contact pose/accepted held position was explicitly staged. No Silt goal proof, near-native flag or new completion credit was written by the browser harness. This is not a from-zero human campaign or physical controller test.
- Production Vite build passes; the existing large-chunk warning remains. Exact Three.js 0.179.1 and Vite 7.1.0 were exercised; full transitive dependency-lock parity remains unestablished locally.
- Eight installer checks pass: exact apply/backup, idempotence, restore, interrupted dependency-only install recovery, later-edit/version protection and whole-payload validation.
- Scope checks preserve the accepted Vascular II file hashes, the VIS1 shader hook, Core/return engine and all existing material/contact helper bytes.

One existing semantic detail was exposed by the Core Work fixture: the legacy grip-release path can still emit a Host disturbance when normalized mode input releases a grip. This goal explicitly excludes that mode transition from its completion proof. Host receipt classification was not rewritten in this pass and remains a separate audit item.

## Acceptance and boundaries

Purpose: complete the already-defined Silt II earned round trip and connect its one credit to the existing 6-phase threshold. Allowed scope: a narrow observer, regional publication and player-facing step text. Locked systems and original verb/matter rules remain as above. Delete/disable targets: none in production; temporary test exposures end on browser close. Visual/feel target: use the already accepted grain interaction and make the earned journey/result explicit. Human acceptance of Silt II and the full earned arc remains pending.

Try one same-grain journey, wait for the completion line, and return to the Hub. The previous intermittent Silt visibility issue is not reopened as a test requirement. Phase III/IV content and earned 12-phase are outside this delta.
