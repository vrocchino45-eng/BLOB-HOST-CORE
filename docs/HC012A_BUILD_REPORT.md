# HC-012A Build Report — Silt Pressure Playable Route

## Result

The existing `CELL_SILT_PRESSURE_ROUTE_001` mount now has a dedicated gameplay and presentation owner. The route is a continuous pressure-and-appetite passage rather than an empty destination or trigger corridor.

## Authored circuit

- `SiltPressureRouteSystem` builds and owns the route only while Silt is mounted.
- Five asymmetric capsule ribs communicate pressure without object-defining rings.
- One warm porous nutrient packet is the valid Absorb target.
- Two dark packed-residue bodies remain in the world and punish greedy intake with recoverable compression.
- One deep organ releases the route after the player has read, braced, selected, and traversed.
- One three-lobe fold returns to Hub through GateSystem.

## Ownership

| Concern | Owner |
| --- | --- |
| Player movement and collision | PlayerMovementController |
| Silt gameplay and presentation | SiltPressureRouteSystem |
| Route boundary | Act1RouteContractSystem |
| Objective truth | ObjectiveSystem |
| Crossing and history | GateSystem |
| Player-facing guidance | GuidePromptSystem / PlaytestHudSystem |

The Silt owner never writes player position, active cell, objective state, gate state, or route history.

## Adversarial result

The focused validator enters through the real Hub gate, earns the pressure read and brace, deliberately pulls packed residue, verifies both earned steps remain, recovers compression from `1.00` in `1.57 seconds`, selects the porous packet, leaves two packed bodies intact, reaches the deep organ, and returns through GateSystem. Maximum simulated player step is `0.052` world units.

## Runtime scope

- Global systems: `15`
- Shared first-slice systems: `6`
- Base room budgets: `15 → 13 → 8 → 7`
- Vascular active budget: `8`
- Silt active budget: `8`
- Dormant compatibility systems: `20`, registered `0`
- New Silt registered systems: `1`
- New abilities/entities/classes/combat/input: `0`

## Production evidence

- Browser asset: `assets/index-BP9-HaMy.js`
- Served HTML SHA-256: `e50fb339483cc1251ec9325c169345d18c896da1f853eca08ddb3153d68efacc`
- Served JavaScript SHA-256: `87ae24e0f672ad592e2b747152f734f2de7d7ba101e8c18e7df0aa97098ecfae`
- Served and on-disk production bytes: identical
- Build note: Vite's existing chunk-size warning remains non-blocking

## Next pass

`HC-012B` should retain the Silt return consequence in the Core and Hub and prove all three route histories converge cleanly. It should not add another Silt mechanic.
