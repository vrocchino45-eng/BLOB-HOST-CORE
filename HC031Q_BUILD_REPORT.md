# HC031Q — Return Consequence Canonicalization

## Parent
HC-031P1-HF1 — Destination Commit Latch

## Mode
Convergence / return-consequence canonicalization. No route gameplay rewrite.

## Why this pass exists
The HC031P1-HF1 telemetry proved Grave, Vascular, and Silt are already live, enterable, completable, returnable, and able to leave retained consequences. The audit found that the consequence chain already has useful ownership:

- `LocalCellBoundaryMorphSystem` persists route-return history.
- `CoreGrowthSystem` interprets retained Grave/Vascular/Silt state.
- `CoreEmbodimentSystem` presents retained anatomy on the Core.
- `HubChamberFoundationSystem` presents returned readings in Hub tissue.
- `HubInvestigationGameplaySystem` reads retained consequences for three-route convergence.

HC031Q therefore does **not** add a new memory manager or change route mechanics. It exposes the existing consequence chain as one canonical read-only Hub surface and repairs observer/presentation metadata that still assumed Grave was the only destination.

## KEEP
- Grave memory imprint / trace state.
- Vascular cadence, synchronization, circulation integrity, and recovered-desync state.
- Silt pressure read, rib release, selective matter decision, compression, and failure recovery state.
- Existing Core retained-anatomy presentations.
- Existing Hub Grave/Vascular/Silt echoes.
- Existing return folds and route completion criteria.
- P/P1/HF1 deliberate destination-commit behavior.

## Canonicalized in Q
`HubChamberFoundationSystem` now publishes a read-only `returnedReadings` surface:

- Grave → `memory_residue` / `retained_memory_imprint`
- Vascular → `rhythm_current` / `synchronized_return_current`
- Silt → `pressure_density` / `released_return_breath`

It also publishes:
- `returnReadingCount`
- `returnRecompositionState`
- explicit ownership truth showing this presentation has no gameplay authority.

## Observer repair
Session telemetry is now `blob.session.telemetry.v1.40`.

`hub.destination.readiness_changed` now reports the actual route that is available or in flight. Vascular and Silt no longer inherit Grave route/gate IDs in telemetry merely because the historical first-destination invitation still exists.

New event:
- `hub.return_recomposition.changed`

This event is emitted only when the set of retained Host readings changes and reports the owner chain without gaining progression authority.

## Presentation metadata repair
- Silt runtime compatibility now resolves to `CELL_SILT_PRESSURE_ROUTE_001` rather than falling through to Grave.
- The post-return layer hierarchy now has explicit Silt and three-reading states instead of stopping at the Vascular hierarchy.

## Locked / forbidden scope
HC031Q does not change:
- movement / attachment
- targeting
- Pulse / Absorb / Stabilize behavior
- Grave gameplay
- Vascular gameplay
- Silt gameplay
- route entry requirements
- route completion requirements
- return-fold rules
- Comb progression
- Aperture progression

20 neighboring gameplay owners are hash-locked unchanged.

## Validation
`npm run validate:current` passes:
- HC031Q canonicalization validator
- syntax checks
- RecipeDataSystem validation
- undefined-method audit

## Next
Use one playthrough to verify the retained-reading sequence in real telemetry. If clean, Q locks and HC031R becomes **Vascular Currentization**: KEEP / REBIND / RETIRE inside the already-working Vascular route rather than rebuilding the route itself.
