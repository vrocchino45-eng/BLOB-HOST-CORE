# CONNECTION57 — Hub pending-choice lifecycle

Install over the applied CONNECTION56 checkpoint. Extract into your project root, keeping CONNECTION57_PATCH intact, then run:

```powershell
node .\APPLY_CONNECTION57.mjs --check
node .\APPLY_CONNECTION57.mjs
```

Reload the game. Exact originals are retained in CONNECTION57_BACKUP.

## What changes

An unstarted destination choice now ends when you leave the Hub, use the existing Cancel input, or enter Core Work. Returning to the Hub or exiting Core Work requires a fresh A/E choice instead of replaying the old request. Matching Hub events emitted during departure are acknowledged so they cannot be replayed later.

A boundary crossing that has already started retains its existing authority. The Hub recognizes the boundary's initial claim before its first guided-flight publication; cancellation of a queued choice cannot erase an already-started crossing. Normal completion clears the old request, and cancellation only clears the request matching the Hub's private event, route, gate, source and owner identity.

External Core inspection alone and a temporary preparation/range delay retain the deliberate waiting behavior from CONNECTION56. This pass changes one production file, HubInvestigationGameplaySystem.js. It adds no content, input remapping, physiology, progression, audio or camera change.

## Verification and limitations

- 41 quick cases / 651 checks pass, including 12 new AG01 groups.
- Prior Hub source reproduces stale travel after departure/re-entry and queued travel while Core Work is active.
- Registered-owner checks verify cancellation, same-frame Core Work intent, fresh re-selection, recognition of an already-started boundary, one-time entry, stale-event acknowledgement, exact request identity protection, and retained preparation/inspection waiting behavior.
- The production build and installer checks pass. The existing Vite large-chunk advisory remains.
- Tests use actual registry, commitment, Hub and boundary owners with declared logical input, readiness, body/history, Core Work and foreign-cell fixtures. They do not run InputSystem device delivery, full inspection-camera lifecycle, full GameRuntime, rendering or a naturally earned campaign.
- Live browser navigation was not run. The Chromium launch restriction observed in CONNECTION54 remains unresolved; human acceptance is open.

The existing repair assertions and thresholds remain intact with an updated exact source pin. Older case IDs, reports and checkpoints remain indexed.

## Focused review

Use normal Hub route choices and Core Work. If a destination is still waiting to start, cancelling it or changing to Core Work should leave you free to make a new choice later. Returning to the Hub should never send you into the old destination by itself. Crossings already underway should still finish normally.

A short focused session is enough. Keep clips under 25 minutes and preserve the same game session between clips. New test case: `node .\BLOB_BOT_SERIES1\run.mjs --case=AG01`. Full quick suite: `node .\BLOB_BOT_SERIES1\run.mjs --quick`.

## Restore

```powershell
node .\APPLY_CONNECTION57.mjs --restore
```

Restore reinstates exact original CONNECTION56 files and protects later edits. Unrelated reports and prior backups remain preserved.

## Pass contract

| Field | Boundary |
|---|---|
| Mode | Convergence / interruption regression |
| Purpose | Give an unstarted Hub choice a clear lifetime without taking authority from an active boundary |
| Allowed scope | Private queued-request cleanup, stale Hub-event acknowledgement, Core Work/cancel guard, registered-owner tests and installer |
| Locked | Started crossings, regional unlocks, preparation/range, movement/camera/audio, material ownership, physiology and 3→6→12 progression |
| Delete/disable | Retire replay of abandoned Hub choices after departure or Core Work entry |
| Visual/feel target | Existing world and controls; queued travel does not surprise you after changing tasks |
| Machine acceptance | Prior failures reproduced; interruption and fresh-choice cases pass; full quick suite, build and installer pass |
| Human acceptance | No stale destination starts after returning to Hub or leaving Core Work; OPEN |
| Regression | Active boundary completes once; temporary readiness loss and external inspection retain valid pending intent; no earned unlock is fabricated |
| Deferred | Core occlusion, selected-piece hierarchy, adhesion feel and direct earned-benefit comparisons |
