# BLOB: HOST CORE — HC016B / R1 Runtime Ownership

## Mode
ARCHITECTURE IMPLEMENTATION / NO NEW GAMEPLAY.

## Trace result
The earliest two rebuild seams are already morph-owned:

- Surface Wake -> Guide: `LocalCellMorphSystem.completeMorph()` sets `activeCellId`.
- Guide -> Hub: `SecondLocalCellMorphSystem.completeMorph()` sets `activeCellId`.
- `FirstSliceTransitionCoordinator` already identifies these owners as the morph systems.

GateSystem becomes an active mutation owner later at Hub -> route, route -> Hub and Comb <-> Aperture.

## Changes

### 1. RuntimeStateLedgerSystem
Introduces an explicit read-only ownership ledger for:
- Host state
- Local Cell state
- Chemistry state
- Player Composition state
- Presentation state
- Legacy compatibility state

During active local-cell morphs, the ledger declares:
`canLegacyGateMutateActiveCell: false`.

### 2. Gate transition-authority firewall
During Surface -> Guide or Guide -> Hub continuous morph:
- GateSystem skips its normal gate scan/update work.
- GateSystem publishes passive compatibility telemetry.
- GateSystem is forbidden from mutating `activeCellId`.
- A defensive check at `completeCrossing()` blocks any accidental legacy mutation.

This both reduces runtime work during active morphs and makes ownership deterministic.

### 3. Transition coordinator role clarification
The coordinator remains responsible for dormant preparation / shader warmup, but its published policy now explicitly states that it does not own the transition.

## What was NOT changed
- No player-facing mechanic.
- No route logic removed.
- No GateSystem deletion yet.
- No objective behavior changed yet.
- No UI/Guide behavior changed.
- No chemistry recipes changed.
- No camera/movement tuning changed.
- No content added.

## R1 next step
Migrate the first still-hard transition. Recommended candidate: Hub -> one route, because GateSystem currently performs the `activeCellId` mutation there. Create a local-cell/morph transition adapter that owns the physical handoff while GateSystem becomes a derived compatibility observer.

## Runtime-weight effect
GateSystem now performs no full gate scan during active morph-owned boundaries. This is a small but real first reduction in per-frame compatibility work. Larger reductions come when Hub/route and Comb/Aperture gate mutations are migrated and GateSystem can be removed from the active update loop entirely.
