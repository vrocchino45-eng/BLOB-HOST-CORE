# HC-002O — Signal Chorus Exit Readiness

## Purpose

HC-002O defines when the Signal Chorus cell is ready to reveal the next no-gate tissue fold. This is a planning/data pass only.

The current playable chain remains:

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

The next planned morph is not runtime-active yet.

## Exit rule

```text
SIGNAL_CHORUS_EXIT_READINESS_001
```

The Signal Chorus is considered prepared only after the full Signal Chorus loop is complete:

```text
choir_heard
→ pore_opened
→ wave_followed
→ bridge_warmed
→ signal_chorus_tuned
```

## Composition requirements

```text
Seed   >= 0.26
Signal >= 0.10
Form   >= 0.30
```

## World-facing rule

The choir can carry the player only after the player has listened, answered, and warmed the seed-signal bridge.

## Forbidden behavior

The next morph must not be a gate, door, hard threshold, teleport, chamber load, or fade-to-new-room. It must remain a tissue recomposition under continuous player control.
