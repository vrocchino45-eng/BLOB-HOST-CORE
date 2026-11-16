# CONNECTION56 — Hub commitment handoff recovery

Install over the applied CONNECTION55 checkpoint. Extract into your project root, keeping CONNECTION56_PATCH intact, then run:

```powershell
node .\APPLY_CONNECTION56.mjs --check
node .\APPLY_CONNECTION56.mjs
```

Reload. Existing controls and regional unlocks remain unchanged.

## Fixes

1. Comb entry no longer requires the whole-junction presentation to report complete. It requires the mounted Hub, earned regional returns, destination preparation, existing range, and a deliberate choice. This matches the separation of presentation from entry permission already used for the regional spokes.
2. A committed destination request is consumed only when the boundary owner can actually start it. If preparation or range briefly becomes unavailable between the offer and the handoff, the persistent choice waits rather than becoming a consumed, permanently pending request.

The previous source reproduces both stalls in the new owner-integration checks. One production file changes: LocalCellBoundaryMorphSystem.js. Pulse, proximity and other trigger types retain their earlier consumption behavior. No new region, camera treatment, control mapping, audio, progression credit or material behavior is added.

## Verification

- 40 quick cases / 639 checks pass, including 12 new AF01 groups.
- AF01 uses the actual SystemRegistry, deliberate-commitment, Hub investigation and boundary owners in their runtime-relative order. The boundary changes the active cell and entry history through its own normal transition updates.
- Checks cover direct Grave entry without local readings, Vascular/Silt with declared prior earned-history fixtures, earned Comb with incomplete presentation, preparation/range recovery, exactly one entry, and retained unearned-route/Stabilize/Core Work guards.
- Hub-body publications, resource preparation, logical input, player poses and prior regional history are explicit fixtures. This is not a full GameRuntime, InputSystem device-delivery, naturally earned campaign, browser-rendering or human-feel test. The prior boundary fixture changes only its relative recipe import path.
- The production build and installer tests pass. The existing Vite large-chunk advisory remains.
- Live browser navigation was not run; the Chromium launch restriction observed in CONNECTION54 remains unresolved. Human acceptance stays open.

The existing repair tests keep their assertions with an updated exact source pin. All earlier bot IDs, checkpoints, reports and backups remain indexed.

## Focused review

Enter Grave directly from the Hub, then choose another eligible route after returning. When all three regional returns are earned, approach Comb and commit without touring the local Hub territories again. Watch for a permanently pending choice or a second unexpected entry. A short focused clip is sufficient; keep recordings under 25 minutes and preserve the same session between clips.

New component case: `node .\BLOB_BOT_SERIES1\run.mjs --case=AF01`. Full quick suite: `node .\BLOB_BOT_SERIES1\run.mjs --quick`.

## Restore

```powershell
node .\APPLY_CONNECTION56.mjs --restore
```

Exact originals remain in CONNECTION56_BACKUP. Unknown later edits are protected. The installer and manifest retain the CONNECTION55 baseline identity and preserve unrelated work.

## Pass contract

| Field | Boundary |
|---|---|
| Mode | Convergence / handoff regression |
| Purpose | Prevent presentation state or early request consumption from stranding a valid Hub choice |
| Allowed scope | Comb mounted-Hub guard; commit-request consumption timing; registered-owner tests and packaging |
| Locked | Earned regional prerequisites, preparation, range, deliberate input, movement/camera/audio, physiology, materials and 3→6→12 progression |
| Delete/disable | Retire whole-Hub presentation completion as Comb permission and consuming unready commit requests |
| Visual/feel target | Same scene and controls; an offered choice starts once when its handoff is ready |
| Machine acceptance | Reproduce both prior stalls; verify all four destination handoffs and one-time entry; full quick suite, build and installer pass |
| Human acceptance | Normal Hub traversal remains clear and no committed destination becomes permanently pending; OPEN |
| Regression | No auto-entry, no unearned route unlock, no credit from entry or local readings; existing non-commit triggers retained |
| Deferred | Core occlusion, selected-piece hierarchy, adhesion feel and direct earned-benefit comparisons |
