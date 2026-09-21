# HC-012A Acceptance Tests

## Clean route

1. Complete Grave Memory and return to Hub.
2. Confirm both upper Vascular and lower Silt bodies are awake.
3. Approach the lower body and Pulse to enter.
4. Move between the first low ribs and Pulse once.
5. Hold LT until the five ribs remain open.
6. Approach the warm porous packet and hold RT.
7. Move to the deep organ.
8. Follow the amber return breath and press A/E at the fold.

Expected: no restart, teleport, marker checklist, combat, or new ability. The player returns to Hub and Silt remains replayable.

## Failure and recovery

1. Re-enter Silt.
2. Earn the pressure read and rib brace.
3. Hold RT beside a dark packed-residue body.
4. Observe the route compress.
5. Release RT and hold LT while inside the passage.

Expected: the passage reopens within a few seconds. The prior read and brace remain earned; the packed body remains; no inventory or health is lost.

## F1 evidence

After returning to Hub, verify:

```text
Route contracts: mounted 2/2 awake:2/2 pending:0 crossable:2
```

During Silt, verify the active owner is `SiltPressureRouteSystem`, the mount budget is `8`, packed residue is intact, failure count increments once in the recovery test, and return becomes ready only after all route conditions are complete.
