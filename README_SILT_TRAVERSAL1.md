# BLOB: HOST CORE — SILT-TRAVERSAL1 checkpoint

November 8, 2026, America/New_York. Mode: integration convergence audit. Current build remains SILT-VIS1. No installation or production patch accompanies this checkpoint.

## Result

The running browser crossed all four boundaries in Silt → Hub → Vascular → Hub → Grave using keyboard movement and the existing Commit action. The real renderer and system registry continued running. After the declared starting fixtures, the audit did not write the active cell, teleport the player, call the boundary completion method, or manually update route owners.

| Crossing | Trigger used | Recorded boundary |
| --- | --- | --- |
| Silt → Hub | Move into completed return fold after departure | silt_to_hub |
| Hub → Vascular | Approach Vascular body, press E / Commit | hub_to_vascular |
| Vascular → Hub | Depart arrival fold, then approach completed return fold | vascular_to_hub |
| Hub → Grave | Approach Grave body, press E / Commit | hub_to_grave |

Every crossing was recorded by LocalCellBoundaryMorphSystem as a recipe-driven continuous anatomical morph. Silt's return count was one. Vascular's entry and return counts were each one. The completed Vascular checkpoint did not immediately eject the player before departure. No browser JavaScript or console errors were recorded.

Ten post-run verification checks passed, including the four crossings, return departure guard, transition ownership, counts, browser errors and unchanged VIS1 source. These ten checks describe one traversal run, not ten independent play sessions.

## Test boundaries

The browser first used existing debug staging to prepare Grave and Silt. The audit supplied a previously completed Silt/Grave checkpoint, the prerequisite Grave history, and one initial Silt starting position on the authored passage. On entering Vascular it supplied a previously completed Vascular checkpoint without changing player position. These fixtures allow return-fold testing without re-earning puzzles that were outside this pass.

Navigation used real keyboard down/up events, normalized by InputSystem and interpreted by the running movement controller. The automation read runtime target positions and camera directions for steering. Hub approaches stopped within the authored interaction range rather than trying to occupy the exact center of a route body. The existing guided approach after Commit remained owned by the boundary system.

This verifies reachable automated crossings from controlled completed checkpoints. It does not establish human wayfinding, camera comfort, physical controller feel, earning the route objectives, or persistence across application reloads. The player already confirmed that the Silt interaction is clear and appears to work; that provisional acceptance is preserved.

## Pass contract

Purpose: cover the actual traversal path that CONNECTION1's manual-owner fixtures bypassed. Allowed scope: inspect readiness and existing boundaries; operate keyboard movement/Commit in a disposable browser; record transition history. Locked: all production code, VIS1 fog treatment, accepted Silt material interaction, movement and attachment authority, Guide behavior, material supply, progression ownership, audio and checkpoint numbering. Delete/disable targets: none in production; temporary runtime exposure ended when the audit browser closed.

Visual/feel target: preserve the current game while verifying that completed routes can return and the Hub can commit to the next route. Acceptance: four actual boundary crossings, correct transition ownership and counts, no immediate return bounce, no browser errors. Regression: the Silt file still exactly matches the shipped VIS1 payload. No gameplay change was made, so another build or repeat of the already-passing material suite was unnecessary.

## Current state

- Silt material interaction: provisionally accepted by player feedback.
- Intermittent visibility issue: not currently recurring; not declared conclusively fixed.
- Cross-region consequence chain: CONNECTION1's 18 controlled checks passed.
- Actual keyboard/registry traversal: the four crossings above passed.
- Production changes required by this pass: none.

This closes the two identified automated integration gaps for this slice. A human connected run can still supply evidence about navigation and experience; no additional feature or readability blocker is inferred from these results.
