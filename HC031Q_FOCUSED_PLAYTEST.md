# HC031Q Focused Playtest — Return Consequence Canonicalization

## Goal
Prove that the existing first-route areas return three distinct Host readings through the current runtime without changing their gameplay.

## Suggested run
About 8–12 minutes is enough if the routes remain familiar.

1. Play normally into Signal Chorus / Hub.
2. Enter Grave with A and return through its remembered fold.
3. Spend a few seconds in Hub so its returned state is visible.
4. Enter Vascular and complete its current route normally.
5. Return to Hub and pause briefly.
6. Enter Silt and complete its current route normally.
7. Return to Hub and pause briefly.
8. If Comb becomes readable naturally, you may look at it, but do not force additional progression for this test.
9. Export telemetry with Shift+T.

## What should be true
### After Grave return
`hub.return_recomposition.changed`
- retainedReadingCount: 1
- retainedFunctions includes `memory_residue`

### After Vascular return
A second recomposition event should show:
- retainedReadingCount: 2
- retainedFunctions includes `memory_residue` and `rhythm_current`

### After Silt return
A third recomposition event should show:
- retainedReadingCount: 3
- retainedFunctions includes `memory_residue`, `rhythm_current`, `pressure_density`
- state: `three_reading_host_recomposition`

### Destination telemetry
When Vascular or Silt is available / committed / in flight:
- readiness routeId must match that actual route
- readiness gateId must match that route
- it must not fall back to Grave

## Regression locks
- one A/E choice still produces one destination commitment
- route transitions still occur once
- Vascular still reaches `return_current`
- Silt still reaches `return_breath`
- no movement-progress blocks are introduced
- Grave/Vascular/Silt internal gameplay should feel unchanged from HF1
