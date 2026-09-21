# HC-002N — Signal Chorus Interaction Loop

## Purpose

HC-002N makes the Signal Chorus Nerve playable after arrival. The player now has a small loop inside the second morphed cell:

```text
hear choir
→ open listening pore
→ follow harmonic wave
→ warm seed-signal bridge
→ tune signal chorus
```

This pass does not add a third cell, combat, gates, doors, teleporting, dialogue, or new abilities.

## New Runtime System

```text
src/morph/SignalChorusInteractionSystem.js
```

The system activates only after:

```text
secondLocalCellMorph.completed === true
activeCellId === CELL_SIGNAL_CHORUS_NERVE_001
signalChorusArrival.readyForSignalLoop === true
```

## New Data

```text
public/data/morph/signalChorusInteractionRecipes.json
```

Primary loop:

```text
SIGNAL_CHORUS_LOOP_001
```

## Stages

### 1. choir_heard

Focus object:

```text
choir_resonance_node_001
```

Expected verb:

```text
pulse
```

Meaning:

```text
the chorus answers only when called, not consumed
```

### 2. pore_opened

Focus object:

```text
listening_pore_membrane_001
```

Expected verb:

```text
pulse
```

Meaning:

```text
the host opens listening tissue when pressure is gentle
```

### 3. wave_followed

Focus object:

```text
harmonic_wave_thread_001
```

Expected verb:

```text
pulse or proximity
```

Meaning:

```text
follow the returning wave until the nerve becomes readable
```

### 4. bridge_warmed

Focus object:

```text
seed_signal_bridge_001
```

Expected verb:

```text
pulse before absorb
```

Meaning:

```text
seed and signal can bridge after listening is established
```

### 5. signal_chorus_tuned

Focus object:

```text
seed_signal_bridge_001
```

Expected verb:

```text
hold presence
```

Meaning:

```text
the chorus is stable enough to plan the next branch
```

## New Metrics

```text
listenTrust
answerStrength
harmony
bridgeWarmth
forceRisk
```

The loop is prepared for the next branch when listening, answer, harmony, and bridge warmth are high enough and forced-absorb risk is low enough.

## Visual Feedback

Adds:

```text
signal_chorus_loop_focus_ring
signal_chorus_loop_answer_ring
signal_chorus_bridge_warmth_ring
signal_chorus_loop_focus_line
```

## Design Rule

Signal Chorus is not a pickup area. It should teach:

```text
listen before force
pulse before absorb
relation before consumption
```
