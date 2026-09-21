# HC016Y — Route Physical Feel

## Mode
FEEL / CONTINUOUS TRAVERSAL / NO NEW GAMEPLAY SYSTEM

## Purpose
HC016T/U/V created enough physical territory.
HC016X normalized Core scale and traversal speed.
HC016Y makes the **space between interactions affect play**.

The existing `PlayerMovementController` remains the only translation owner.
Existing route systems continue to own their physical conditions.

## Shared movement contract
`physicalFeel` can now optionally publish:
- accelerationScale
- speedScale
- boostScale
- flowCouplingScale
- withFlowSpeedBonus
- againstFlowSpeedPenalty
- routeFeelProfile
- spatialFeel

Outside a route, every field falls back to neutral behavior.

### Grave
Grave is a weighted memory bed rather than an empty open room.

Continuous behavior:
- mild settling weight;
- a very small residue drift;
- movement becomes more resistant as Grave recoil rises;
- boost remains usable but muted compared with open traversal;
- once the reading is complete, the bed gives a faint drift toward the return side.

No new trigger or Grave mechanic was introduced.

### Vascular
Vascular now continuously rewards circulation.

Continuous behavior:
- centerline flow is stronger;
- movement **with** the current receives up to a 24% directional speed benefit;
- pushing directly **against** circulation can lose up to 20% of usable speed;
- flow coupling is stronger;
- turbulence still disrupts clean travel and remains recoverable through existing Stabilize behavior;
- completed circulation reverses as before and now physically helps the return read more clearly.

The three valve interactions are unchanged.

### Silt
Silt uses the HC016V spatial grammar as physical gameplay.

Continuous behavior:
- tight entry/deep sections resist acceleration, top speed, and boost;
- the porous-choice pocket around 60% progress visibly *feels* freer;
- bracing ribs restores some mobility;
- compression failure suppresses movement further;
- after deep release, the return breath gives a clear movement release and stronger return flow.

Pressure-read, brace, porous-vs-packed choice, failure, recovery, completion and return rules are unchanged.

## Locked
- Core visual scale: 0.52
- normal movement cap: 4.65
- HC016X L3 boost
- route dimensions
- Pulse/Absorb/target reach
- chemistry
- progression ownership
- camera architecture
- Surface → Guide → Hub

## Test
Run all three routes with both normal movement and L3.

What should be perceptible without reading HUD text:
1. Grave feels heavier/quieter than Hub.
2. Vascular is noticeably easier/faster when moving with circulation than against it.
3. Silt suppresses speed in compressed passages.
4. Silt's porous-choice pocket gives a physical sense of relief.
5. Silt release/return feels freer than entry.
6. L3 still works everywhere, but each route shapes it differently.
7. Interactions and return folds remain unchanged.

## Next
Do not add another subsystem automatically. Use the next gameplay run to decide whether
HC016Z should tune route feel, readability, or move to the next rebuild milestone.
