# BLOB: HOST CORE — HC016I

## Mode
R1 FINAL FIRST-SLICE BOUNDARY MIGRATION / GATE AUTHORITY PROOF.

## Migrated
- Comb -> Aperture
- Aperture -> Comb

Both now use the existing recipe-driven `LocalCellBoundaryMorphSystem`.

### Comb -> Aperture
Preserves the existing gameplay contract:
- Comb challenge must be complete;
- Aperture view must be opened;
- destination must already be prepared;
- player must be inside the authored seal range;
- Stabilize must be held;
- a fresh Pulse must be pressed.

### Aperture -> Comb
Preserves the existing Aperture return fold, range, and Interact input.

## First-slice transition ownership after HC016I
- Surface -> Guide: LocalCellMorphSystem
- Guide -> Hub: SecondLocalCellMorphSystem
- Hub <-> Grave: LocalCellBoundaryMorphSystem
- Hub <-> Vascular: LocalCellBoundaryMorphSystem
- Hub <-> Silt: LocalCellBoundaryMorphSystem
- Hub <-> Comb: LocalCellBoundaryMorphSystem
- Comb <-> Aperture: LocalCellBoundaryMorphSystem

## GateSystem result
Every authored first-slice gate whose historical `runtimeTransitionAdapter` is `GateSystem` now has an observer-only return branch before GateSystem's input/crossing mutation path.

Therefore **normal gameplay no longer requires GateSystem to mutate `activeCellId`**.

GateSystem still contains dead compatibility crossing code in this build. It has not been deleted in HC016I so the migration can be tested independently from cleanup.

## Verification
- syntax PASS;
- final two recipes PASS;
- Stabilize+Pulse trigger preserved;
- Aperture return readiness preserved;
- runtime registration count unchanged;
- activeCell writer count unchanged;
- all authored GateSystem boundaries proven observer-only before mutation path.

## Next
HC016J should be a cleanup/removal pass:
1. remove GateSystem's production `completeCrossing()` mutation path and input-consuming crossing branches;
2. retain only derived/read-only gate compatibility state if still needed by HUD/Guide/legacy validators;
3. measure runtime/source reduction;
4. rerun route, Comb, Aperture, debug-jump, and active-cell ownership verification.
