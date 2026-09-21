# HC016W — Three-Route Gameplay Convergence

**Mode:** convergence / authority correction / no expansion.

The post-expansion family now measures roughly:
- Grave: 18.0 units primary depth, broad and sparse.
- Vascular: 23.98 units along one directional rhythmic current.
- Silt: 24.20 units through a tight/open/tight pressure passage.

## Audit finding
HC016U's Vascular recipe has the expanded traversal envelope, but the active
`Act1RouteContractSystem` installs `movementBounds` from `act1RouteContracts_HC012A.json`.
That contract was still `[4.8, 3.35, 7.2]`, so it could silently impose the old short-route boundary.

HC016W corrects the owning contract to `[4.5, 3.2, 22.5]`.
Silt remains `[6.8, 4.25, 21.2]` and Grave retains its route-owned
`[5.4, 3.5, 19.2]` envelope.

## Locked
Core scale, existing mechanics, chemistry, route ownership, crossing ownership,
camera modes, Grave HC016T geometry, Vascular HC016U geometry, and Silt HC016V geometry.

## Test
Run Hub → Grave → Hub, Hub → Vascular → Hub, and Hub → Silt → Hub.
Check full traversal, route identity, trigger spacing, dead-air, camera readability,
and return-fold completion. In particular, Vascular should no longer encounter an
old invisible short-route boundary.

## Next
HC016X is a feel/readability tuning pass based on what the three-route test actually
shows. Do not expand the routes again unless testing demonstrates a specific need.
