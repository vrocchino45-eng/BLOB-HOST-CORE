# BLOB: HOST CORE — HC016J

## Mode
R1 CLEANUP / GATE MUTATION REMOVAL.

HC016I proved every normal-play first-slice transition is morph-owned. HC016J removes the dead production crossing side from GateSystem.

## Removed
- `GateSystem.tryCross()`
- `GateSystem.completeCrossing()`
- Gate-owned Pulse consumption
- Gate-owned Interact consumption
- Gate-owned `activeCellId` mutation
- crossing-only counters

## Retained
GateSystem remains temporarily registered as a read-only compatibility observer for derived gate readability/state consumed by HUD, Guide, debug, and older validators.

## Measured reduction
- GateSystem lines: 969 -> 632 (337 removed)
- GateSystem bytes: 44262 -> 30127 (14135 removed)
- GateSystem `activeCellId` mutation sites: 0

## Runtime ownership
Surface -> Guide remains `LocalCellMorphSystem`.
Guide -> Hub remains `SecondLocalCellMorphSystem`.
All ten subsequent authored boundaries are `LocalCellBoundaryMorphSystem`.
DebugAreaJump remains an explicit developer bypass only.

## Next
HC016K should trace every live reader of GateSystem-derived state. Redirect presentation/debug consumers to morph/local-cell derived state where practical, then unregister/delete GateSystem if no live gameplay-facing consumer requires it.
