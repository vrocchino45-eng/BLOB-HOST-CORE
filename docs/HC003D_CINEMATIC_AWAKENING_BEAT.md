# HC-003D — Cinematic Awakening Beat Prototype

## Purpose

HC-003D adds the first cinematic feel layer to the opening playable minute. The goal is not to create a cutscene. The goal is to make the start feel like a microscopic awakening inside a vast wounded nursery host.

## Added system

```text
src/cinematic/CinematicAwakeningSystem.js
```

## Added data

```text
public/data/cinematic/cinematicAwakeningBeat_HC003D.json
```

## Active beats

```text
camera_settle
host_pulse_seed_cue
guide_reveal
first_fold_emphasis
scar_flow_release
signal_chorus_release
beyond_minute_release
```

## Visual/feel cues

```text
distant host pulse ring
Folded Lantern reveal ring
micro-to-macro scale thread
first tissue fold emphasis ring
small cinematic camera bias
```

## Control rule

No cinematic cue may lock player control.

Manual camera control has priority over cinematic camera bias.

```text
Right Stick orbit / tilt
R3 recenter
I/J/K/L camera
C recenter
```

## Forbidden scope

```text
no cutscene lockout
no dialogue tree
no new cell
no new morph destination
no new ability
no combat
no Act expansion
```
