# BLOB: HOST CORE — HC016C / R1 First Hard-Boundary Migration

## Mode
ARCHITECTURE MIGRATION / NO NEW GAMEPLAY.

## Boundary migrated
`Hub -> Vascular Rhythm`

Before this pass, GateSystem:
1. evaluated the existing Hub route body;
2. consumed Pulse;
3. directly set `activeCellId = CELL_VASCULAR_RHYTHM_ROUTE_001`;
4. wrote route-entry history.

HC016C removes steps 2-4 from GateSystem for this boundary.

## New ownership
`HubVascularMorphTransitionSystem` now:
- reads the existing Hub vascular route body's distance;
- requires the already-authored Grave return / Grave objective completion;
- requires Vascular destination preparation from `FirstSliceTransitionCoordinator`;
- consumes the same fresh Pulse input;
- publishes a 0.72-second morph-owned handoff state;
- retains player position;
- changes `activeCellId` only after the morph completes;
- writes the existing route-entry history schema.

Vascular gameplay remains owned by `VascularRhythmRouteSystem`.

## GateSystem status
GateSystem still computes/publishes compatibility/readability for `hub_to_vascular_route`, but `tryCross()` now explicitly returns without mutating the world for that gate.

During the active morph the HC016B ownership firewall also suppresses the normal GateSystem scan.

## Why this is important
This is the first current hard transition whose causal owner has been removed from GateSystem without removing the existing route gameplay.

The migration separates:
- **destination preparation** → Transition Coordinator
- **continuous physical handoff** → Morph owner
- **route gameplay** → Vascular system
- **legacy gate description** → temporary compatibility observer

## Runtime weight
This is still an incremental reduction, not the final cleanup. GateSystem remains registered because other legacy boundaries still use it. Once enough boundaries are migrated, GateSystem can leave the active update loop and its gate registry/runtime validation baggage can be retired.

## Acceptance
1. Existing Surface/Guide/Hub flow remains unchanged.
2. After Grave return, approach the existing Vascular route body in Hub.
3. Pulse it exactly as before.
4. `hubVascularMorph.phase` becomes `morphing_hub_signal_into_vascular_flow`.
5. GateSystem reports the migrated boundary as non-mutating.
6. After ~0.72 s the active cell becomes `CELL_VASCULAR_RHYTHM_ROUTE_001`.
7. Vascular gameplay mounts at the player's retained position.
8. Route history records Vascular as entered with transition owner `HubVascularMorphTransitionSystem`.
9. No duplicate crossing occurs.
