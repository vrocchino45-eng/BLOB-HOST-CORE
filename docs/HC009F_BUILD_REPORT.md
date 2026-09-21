# HC-009F Build Report

## Outcome

HC-009F streamlines both first-slice transition boundaries while preserving the complete HC-009E vertical-slice lock.

## Root causes

- Destination geometry was constructed synchronously inside both morph `startMorph()` calls.
- Guide Threshold and Hub Chamber built their first-entry presentation resources only after the active cell changed.
- Base post-trigger tissue blends took roughly seven to eight seconds without optional boosts.
- Invisible destination objects still participated in generic animation loops.

## Implementation

- `FirstSliceTransitionCoordinator` schedules one hidden preparation job per idle window.
- `SystemRegistry.prepareSystem()` initializes a dormant region system once without calling its gameplay update or mounting it.
- Local and second morph owners expose hidden resource preparation and explicit activation paths.
- Hidden destination chemistry is excluded from targeting, Pulse, bonding, and animation through existing visibility contracts.
- Prepared shader programs compile against hidden clones in one batch per boundary after its geometry preparation.
- Both morphs use a `0.20` base blend rate and preserve all existing action/confidence boosts.
- The runtime records last/max frame gap, gaps over 80 ms, preparation status, and suspected progress stalls.

## Ownership

The coordinator is not registered as an updater and cannot complete progression. `LocalCellMorphSystem`, `SecondLocalCellMorphSystem`, `ModeController`, `StatusPageSystem`, `ObjectiveSystem`, and `GateSystem` remain authoritative.

The active-region budgets remain:

| Region | Budget |
| --- | ---: |
| Surface Wake | 15 |
| Guide Threshold | 13 |
| Hub Chamber | 8 |

Twenty compatibility systems remain retained but dormant.

## Validation

- Focused HC-009F dormant-preparation and timing-diagnostic simulation
- Full inherited HC-009E through HC-006 lineage
- Recipe-data and legacy-archive loading
- Undefined-method audit
- Production Vite build

The existing Vite chunk-size warning remains non-blocking.
