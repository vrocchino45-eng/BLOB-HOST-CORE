# BLOB: HOST CORE — HC016G

## Mode
R1 ARCHITECTURE CONSOLIDATION / PERFORMANCE & SOURCE-WEIGHT CONVERGENCE.

## What changed
The six temporary route-specific transition systems proven across HC016C-F have been removed and replaced by:

- `LocalCellBoundaryMorphSystem.js`
- `LocalCellBoundaryRecipeRegistry.js`

One runtime system now owns all six migrated Hub route boundaries through recipes:
- Hub -> Grave
- Grave -> Hub
- Hub -> Vascular
- Vascular -> Hub
- Hub -> Silt
- Silt -> Hub

## Behavior preserved
Recipes preserve each boundary's:
- source/destination cell;
- Pulse vs Interact trigger;
- interaction range;
- handoff duration;
- existing prerequisites;
- preparation flag;
- route-history schema;
- Grave memory consequence persistence;
- Vascular rhythm consequence persistence;
- Silt pressure consequence persistence.

Compatibility aliases remain temporarily available in `frameState` so existing debug/telemetry consumers do not break during R1.

## Actual reduction
Temporary adapter implementation before consolidation:
- 873 source lines
- 30609 bytes
- 6 runtime system registrations

Generic implementation after consolidation:
- 476 source lines
- 17894 bytes
- 1 runtime system registration

Net:
- 397 fewer source lines
- 12715 fewer source bytes in the transition implementation
- 5 fewer active runtime registrations

This is the first R1 pass that reduces active-system count as well as clarifying ownership.

## GateSystem
GateSystem remains observer-only for all six route boundaries. It still retains its compatibility mutation path solely for remaining unmigrated Hub/Comb/Aperture boundaries.

## Verification
- all changed JavaScript syntax PASS;
- six recipe definitions present;
- old adapter files deleted;
- old adapter imports/properties/registrations removed;
- generic owner registered before RuntimeStateLedger/GateSystem;
- Gate observer branches preserved;
- active-cell mutation inventory regenerated.

## Next
Now migrate Hub <-> Comb using this generic recipe system rather than creating new classes. If the generic system accepts that seam cleanly, then migrate Comb <-> Aperture. After those four boundaries move, GateSystem's mutation path should have no production owner left and can be removed from the active runtime.
