# HC-012C Acceptance Tests — Three-Route Hub Convergence

## Prerequisite state

1. Complete Grave Memory and return to the Hub.
2. Complete Vascular Rhythm and Silt Pressure in either order.
3. Return to the Hub with all three retained Core and Hub consequences visible.

Expected: the convergence weave becomes available only after all three returned histories are intact. No separate route switch or checklist marker appears.

## Continuous spiral weave

1. Move into the central weave around the comparison cradle.
2. Circle the cradle continuously while remaining inside the living tendrils.
3. Gradually spiral inward rather than cutting directly through the center.
4. When the weave is coherent, move into the final center radius.
5. Press Pulse once.

Expected:

- movement, not a timer, advances orbit and compression;
- one continuous direction builds coherence;
- the final Pulse holds the combined reading;
- the three route identities remain visibly distinct inside one state;
- a sealed six-rib Combward body becomes readable;
- no crossing prompt, teleport, new destination, or objective completion occurs.

## Soft recovery

1. Begin the weave.
2. Reverse direction once or leave the weave band briefly.
3. Return and continue circling inward.

Expected: coherence softens but completed route histories and accumulated understanding remain. There is no death, restart, hard reset, inventory loss, or requirement to replay a route.

## Route-order proof

Test both:

- Grave → Vascular → Silt → Hub
- Grave → Silt → Vascular → Hub

Expected: both orders unlock the same spiral weave and finish at the same sealed Combward state. Gate history may record the actual return order, but it must not alter the gameplay requirement or result.

## Persistence proof

After completion, restore the route-history snapshot or reload through the available test path.

Expected:

- `hubThreeRouteConvergenceCompleted` remains true;
- `hubCombwardBodyReadable` remains true;
- `hubThreeRouteConvergenceMode` remains `continuous_spiral_weave`;
- `combThresholdCrossable` remains false.

## Automated proof

```bash
npm run validate:three-route-hub-convergence
npm run validate:current
npm run build
```
