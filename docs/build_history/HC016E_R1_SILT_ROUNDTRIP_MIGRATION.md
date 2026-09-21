# BLOB: HOST CORE — HC016E / R1 Silt Roundtrip Migration

## Mode
ARCHITECTURE MIGRATION / NO NEW GAMEPLAY.

## Boundaries migrated
- Hub -> Silt Pressure
- Silt Pressure -> Hub

Together with HC016C/D, both Vascular and Silt now use morph/local-cell transition ownership in both directions.

## Existing Silt gameplay preserved
`SiltPressureRouteSystem` still exclusively owns:
- pressure reading;
- rib release;
- selective porous-matter absorb;
- protected dense matter;
- failure/recovery;
- completion;
- return-fold readiness.

No Silt gameplay mechanic was changed.

## Hub -> Silt
`HubSiltMorphTransitionSystem` uses:
- existing Hub Silt route-body distance;
- existing Grave-return prerequisite;
- existing destination preparation;
- existing Pulse input.

It performs a 0.74-second morph-owned handoff and then changes the active cell.

## Silt -> Hub
`SiltHubMorphReturnSystem` uses:
- existing Silt completion;
- existing return-fold readiness/distance;
- existing Interact input.

It performs a 0.70-second morph-owned return and preserves the existing Silt history fields:
pressure read, ribs released, safe matter absorbed, dense matter retained, failure/recovery, settled compression, and max depth.

## GateSystem
GateSystem is now observer-only for:
- hub_to_vascular_route
- vascular_route_to_hub_chamber
- hub_to_silt_burrow_route
- silt_burrow_route_to_hub_chamber

Those four mutation branches can no longer cause a world transition.

## Runtime-weight direction
The migration currently adds small temporary morph-owner modules because we are proving ownership safely. After Grave and the remaining threshold boundaries are migrated, R1 should consolidate these structurally-identical entry/return owners into a recipe-driven generic local-cell morph boundary system and delete the route-specific adapters. That is where source/file weight will begin dropping rather than increasing during migration.

## Acceptance
1. Reach Hub after Grave return.
2. Enter Vascular and return normally — regression.
3. Approach Silt route body and Pulse.
4. Confirm ~0.74 s Hub -> Silt morph with no GateSystem duplicate crossing.
5. Complete the existing Silt pressure loop.
6. Approach its return fold and Interact.
7. Confirm ~0.70 s Silt -> Hub morph.
8. Verify all Silt consequence/history fields persist.
9. Confirm player position is retained through both handoffs.
