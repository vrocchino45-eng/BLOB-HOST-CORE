# BLOB: HOST CORE — HC016H

## Mode
R1 GENERIC BOUNDARY MIGRATION / NO NEW GAMEPLAY.

## Migrated
- Hub -> Comb Threshold
- Comb Threshold -> Hub

Both are now recipes in `LocalCellBoundaryMorphSystem`. No new transition class and no new runtime registration were added.

## Hub -> Comb
Preserves the existing three-route convergence requirement, Hub Combward body distance, Pulse trigger, destination preparation, and retained player position.

## Comb -> Hub
Preserves the existing Comb return fold and Interact trigger. Returning does not require finishing the Comb challenge; if Comb completion was already earned, that state remains retained.

## GateSystem
GateSystem is observer-only for eight migrated boundaries:
Hub <-> Grave, Hub <-> Vascular, Hub <-> Silt, and Hub <-> Comb.

Only Comb <-> Aperture remains as normal-play GateSystem mutation authority.

## Verification
- changed JavaScript syntax PASS;
- two Comb recipes present;
- generic readiness/history paths present;
- Gate observer branches present;
- runtime registration count unchanged;
- true activeCellId writer count unchanged.

## Next
Migrate Comb <-> Aperture into the same generic boundary owner. If that passes, normal gameplay should no longer require GateSystem to mutate `activeCellId`, allowing the next pass to remove its crossing authority from the active runtime.
