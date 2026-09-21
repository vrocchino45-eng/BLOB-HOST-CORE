# HC-005D — Signal Chorus Combward Pressure Seed

## Pass mode

Feature Mode — constrained passive world cue

## Purpose

Prove that the completed Grave reading can make the next Act 1 direction spatially readable at Signal Chorus before any route, threshold, target, or input becomes active.

## Allowed scope

- one passive combward resonance pressure
- authored pressure geometry and timing
- Guide/HUD language separating readable direction from open route
- F1 pressure diagnostics
- focused validation and documentation

## Forbidden scope

- Comb Threshold runtime
- Aperture Fields runtime
- new local cell or morph destination
- target lock or interaction
- pulse/absorb activation
- gate, door, teleport, branch menu, or player relocation
- reopening Grave or replaying the original Signal Chorus loop
- combat or ecology expansion

## Systems locked

- HC-003N opening gold slice
- Bloom-to-Grave handoff
- complete Grave interaction sequence through HC-004R
- HC-005A continuous return
- HC-005B durable Signal Chorus return ownership
- HC-005C readability and camera-relative movement
- contextual A/X controller handoff

## Implementation

After `SignalChorusReturnStateSystem` has held the verified return state for at least 1.25 seconds, `SignalChorusNextRoutePressureSystem` reveals:

- four signal-memory strands leaving one side of the Chorus
- five open comb-like ribs
- three outward-moving resonance pulses

The cue is a scene-only presentation group. It is not registered as a chemistry object, does not enter targeting, does not accept input, and does not change the active cell.

## Ownership

```text
Authoritative owner: SignalChorusReturnStateSystem
Passive presentation: SignalChorusNextRoutePressureSystem
Active cell: CELL_SIGNAL_CHORUS_NERVE_001
Route active: false
Target required: false
Input required: false
```

## Visual target

The cue should look like one side of the living nerve is being combed into a directional cadence. The ribs remain open and incomplete so they do not read as a doorway or portal.

## Feel target

The player should understand: “something lies this way,” while also understanding: “it is not open yet.”

## Delete / disable targets

- route cues that become targetable before activation
- full rings that read as gates
- prompts that claim the next route is open

## Next pass

HC-005E should lock the cue’s composition and readability from multiple camera angles before any activation mechanic is planned.
