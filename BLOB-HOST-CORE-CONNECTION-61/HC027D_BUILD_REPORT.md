# HC027D Build Report — Core Sensory / Physiological Expression

## Purpose
Convert the existing Pulse / Absorb / Stabilize verbs from mostly event-attached presentation into an embodied sensory/physiological language while preserving gameplay authority and the locked HC027B/HC027C architecture.

## New owner
### `CoreSensoryResponseSystem`
Owns presentation-only Pulse propagation/return interpretation.

Reads:
- existing `frameState.pulse.affectedObjects`
- existing chemistry object positions/recipes
- existing movement-boundary telemetry
- existing HC027C radial-performance weights

Publishes:
- outgoing wave speed/radius telemetry
- material contact events
- return events
- material response classes

Does not own:
- gameplay Pulse range
- target selection
- chemistry mutation
- movement
- progression
- hidden-state reveal

## Pulse sonar law
Existing gameplay interaction range remains `4.25`.

For an answering material at distance `d` and radial wave speed `v`:
- contact time = `d / v`
- return time = `2d / v`

Radial speeds:
- Deep = `5.2`
- Inner = `6.6`
- Membrane = `8.2`

At 2 world units:
- Deep return ≈ `0.769s`
- Membrane return ≈ `0.488s`

The difference is expression/readability, not a range or targeting advantage.

## Material answer classes
- Host membrane
- living seed / bloom material
- scar / memory material
- signal / resonant material
- fluid / current material
- dense structure
- general living material

## Visual expression
`CoreVerbPhysicalizationSystem` now:
- emits one expanding sonar front from the launch origin
- waits for true sensory contact timing before contact flashes
- sends return motes from contact points back toward the Core
- gives different response families distinct response colors

Immediate target flashes on button press were removed from the Pulse presentation path.

## Audio expression
`EventAnchoredHostAudioSystem` now adds:

### Pulse
- radial-character emission sound
- delayed spatial response based on return event
- material-family timbre

### Absorb
- intake start
- periodic target flow or empty draw
- capture response
- release response

### Stabilize
- begin response
- two-tone convergence toward a shared center
- lock reinforcement near high progress
- release response

HC027D mix:
- master `0.68`
- panner ref distance `2.8`
- panner rolloff `0.62`

## Dependency correction
The existing `CoreVerbPhysicalizationSystem` was constructed before `ChemObjectSystem`, leaving its chemistry reference null. HC027D rebinds that dependency immediately after chemistry construction. No gameplay root or chemistry authority is transferred.

## Architecture locks
Unchanged:
- HC027B 3→6→12 engine grammar
- HC027C radial reserve/output performance law
- boost-only movement consequence
- normal movement
- authored Pulse affected-object range
- route progression
- region topology
- collision ownership
- chemistry truth

## Validation results
- focused HC027D behavior PASS
- Deep 5.2 vs Membrane 8.2 wave-speed proof PASS
- emit → contact → return event ordering PASS
- inherited validator chain PASS
- 92 JS syntax PASS
- 308 JSON parse PASS
- import graph PASS
- undefined-method audit PASS

## Environment limitation
Production Vite bundling could not run because this handoff does not include `node_modules/vite`. The build command was attempted and fails at module resolution for the missing Vite executable.
