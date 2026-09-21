# HC-006KC Build Report — Hub Completion State Propagation

## Root cause

Live HC-006KB verification proved `StatusPageSystem` correctly committed the first Hub self-reading, but `HubChamberFoundationSystem` still tied `activeRouteIdentityDistinguished` to `SignalChorusLayeredInteractionSystem.completed`.

That layered interaction belongs to the later returned-Signal/Grave continuity work. Requiring it for the first Hub created a temporal ownership inversion: a first-slice Hub objective depended on a later-route interaction.

## Repair

- First-Hub route identity is now owned by the active Hub cell / HubMode presentation.
- The Hub's route-identity reveal begins on Hub arrival and no longer waits for post-Grave Signal layered completion.
- ObjectiveSystem still owns objective completion.
- GateSystem still owns crossability.
- StatusPageSystem still owns only the self-reading interaction fact.
- Gate blockers now distinguish `hub_foundation_readability_pending` from `first_hub_status_page_use_pending`.

## Result

The intended chain is now acyclic:

`Hub readability -> first Hub Status Page use -> objective complete -> Grave Memory crossable`.

The later Signal Chorus layered interaction remains preserved but no longer gates first-Hub completion.
