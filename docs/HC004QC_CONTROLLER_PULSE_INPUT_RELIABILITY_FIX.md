# HC-004QC — Controller Pulse Input Reliability Fix

## Verified live symptom

The HC-004QB screenshot showed:

- active Xbox 360 controller
- correct Signal Chorus cell and choir target
- correct interaction owner
- `PulseAge` continuing to rise

This isolates the active blocker below progression ownership: a fresh pulse event was not reaching the interaction system.

## Implementation

1. Read Xbox X through `pressed`, `touched`, or analog `value >= 0.35`.
2. Preserve rising-edge behavior so holding a button cannot skip several authored steps.
3. Treat A as contextual pulse-listen in pulse-only cells; preserve A absorb in absorb contexts.
4. Give each pulse an event id and source.
5. Record which runtime system consumed the event and which target it affected.
6. Surface raw mapping/button state in full debug mode.

## Locked scope

No new cells, routes, morph destinations, gates, doors, teleports, combat, dialogue tree, quest log, or entity spawn behavior.
