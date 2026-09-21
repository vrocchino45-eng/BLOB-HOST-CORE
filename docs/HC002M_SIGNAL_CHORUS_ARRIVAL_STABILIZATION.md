# HC-002M — Signal Chorus Arrival Stabilization

## Purpose

HC-002L activated the second no-gate morph:

```text
CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

HC-002M stabilizes what happens after that morph completes. The destination cell should become the clear active play space instead of Scar-Flow objects, first-cell objects, or old guide behavior stealing focus.

## Added

- `src/morph/SignalChorusArrivalSystem.js`
- signal chorus arrival debug state
- active-cell arrival ring
- focus line toward the current signal chorus object
- source Scar-Flow / Nursery object suppression after second morph completion
- Guide behavior shifts into signal interpreter mode
- Watcher behavior shifts into signal listener mode
- Signal Chorus objects become target priority after arrival
- Morph panel gives Signal Chorus arrival instructions
- Motion signatures added for Signal Chorus objects

## Signal Chorus Arrival Focus Order

The arrival system intentionally guides the player toward listening before absorption:

```text
choir_resonance_node_001      → pulse to hear the chorus answer
listening_pore_membrane_001   → pulse to open listening tissue
harmonic_wave_thread_001      → follow the returning wave
seed_signal_bridge_001        → bridge warms after listening/response
```

## No-Gate Rule

This pass does not add:

```text
doors
gates
teleports
hard thresholds
new rooms
combat
new abilities
```

The cell changes because the host tissue becomes readable through chemistry and pulse response.

## Lock Target

HC-002M is successful when:

- second morph completes into `CELL_SIGNAL_CHORUS_NERVE_001`
- active cell remains Signal Chorus after arrival
- Scar-Flow hooks stop stealing target focus
- Signal Chorus objects become visible and targetable
- Guide reads as signal interpreter
- Watcher reads as signal listener
- morph panel says what to do next inside Signal Chorus
