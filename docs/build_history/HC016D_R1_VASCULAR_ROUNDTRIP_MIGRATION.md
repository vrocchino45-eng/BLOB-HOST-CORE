# BLOB: HOST CORE — HC016D / R1 Vascular Roundtrip Migration

## Mode
ARCHITECTURE MIGRATION / NO NEW GAMEPLAY.

## What this proves
HC016C migrated Hub -> Vascular away from GateSystem.
HC016D migrates Vascular -> Hub as well.

The complete **Hub -> Vascular -> Hub** roundtrip can now be owned by morph/local-cell transition systems while preserving the existing Vascular gameplay.

## Return ownership
`VascularHubMorphReturnSystem`:
- reads the existing Vascular return-fold readiness;
- uses the existing Interact input;
- requires the route to be completed and the player to be within the authored return range;
- performs a 0.66-second morph-owned handoff;
- retains player position;
- writes the existing Vascular return/history fields;
- changes `activeCellId` to Hub only when the morph completes.

## GateSystem
For both:
- `hub_to_vascular_route`
- `vascular_route_to_hub_chamber`

GateSystem is now observer-only and cannot call `completeCrossing()` for those boundaries.

During either active morph, the HC016B ledger firewall suppresses GateSystem's normal gate scan.

## Why roundtrip matters
This is the first reusable proof that a current route does not need a hard gate in either direction.

The pattern is now:

Hub signal anatomy
-> continuous morph
-> Vascular local cell gameplay
-> return fold becomes biologically ready
-> continuous morph
-> Hub signal anatomy

No player relocation and no level-complete teleport are required.

## Runtime/file-weight consequence
We are not deleting GateSystem yet because other boundaries still depend on it. But the Vascular entry/return branches inside GateSystem are now dead as mutation paths. Once Silt/Grave/Comb/Aperture are migrated, the entire mutation half of GateSystem can be removed rather than accumulating more compatibility conditions.

## Acceptance
1. Reach Hub after Grave return.
2. Pulse Vascular route body.
3. Confirm morph handoff into Vascular.
4. Complete Vascular gameplay.
5. Approach the existing return fold.
6. Press Interact exactly as before.
7. Confirm `vascularHubMorphReturn.phase` enters `morphing_vascular_flow_back_into_hub_signal`.
8. After ~0.66 s return to Hub at retained position.
9. Verify Vascular returned/completed history persists.
10. Confirm no second GateSystem crossing fires.
