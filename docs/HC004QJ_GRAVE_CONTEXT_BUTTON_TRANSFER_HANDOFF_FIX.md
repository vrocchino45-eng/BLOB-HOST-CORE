# HC-004QJ — Grave Context Button Transfer Handoff Fix

## Mode
Convergence repair. No route expansion.

## Screenshot-proven failure
The HC-004QI full-debug screenshot showed the initial Grave loop in a truthful ready state:

- Owner: `GraveReadBeforeAbsorbSystem`
- Stage: `safe_silt_transfer`
- Progress: 80%
- Ready: yes
- Expected/actual target: `residue_silt_cloud_001`
- Blocker: none

But the raw input line still reported A as `Pulse`, and the last A event was delivered as `scripted_context_button_0` to the pulse consumer. The final 20% therefore could not begin because `absorbHeld` never became true on the controller.

## Root cause
`InputSystem.getPulseContext()` checked `readLoop.safeMemoryTransferReady`, a field that does not exist. The authored state is `safeAbsorbReady`. Because the undefined field was negated, A remained contextual pulse for the entire initial Grave phase.

## Repair
In the initial Grave bed:

1. Before `safeAbsorbReady`, A remains pulse/listen so the husk, silt, scar, and seed can be read.
2. When `safeAbsorbReady === true` and transfer is incomplete, A becomes held absorb.
3. After transfer, the normal absorb default remains available while the stability layer takes ownership.
4. During the post-seam Grave response, A remains pulse/listen as authored.
5. X remains pulse throughout.

## Preserved systems
- HC-004QI initial-loop ownership and instruction alignment
- safe-silt transfer logic and protected remains
- Grave stability and exit-readiness
- scar-memory seam arrival and first-read loop
- verified fold-back
- post-seam Grave response

## Forbidden scope preserved
No gates, doors, teleports, branch menus, legacy chamber loaders, combat, dialogue trees, quest logs, new route content, or Act expansion were added.
