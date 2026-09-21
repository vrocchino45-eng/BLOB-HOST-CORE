# HC-003I — Controller Onboarding / Comfort Pass

## Purpose

Tune the first playable minute for Xbox-style controller comfort without adding content.

The required opening remains:

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

Bloom Residue Fork remains a beyond-minute optional extension.

## What Changed

- Added controller comfort tuning data.
- Added a controller comfort readout system.
- Tuned left-stick dead zone and response curve.
- Tuned right-stick camera dead zone and response curve.
- Tuned camera yaw/pitch sensitivity.
- Added manual-camera override protection so opening/cinematic camera bias does not fight the right stick.
- Increased opening absorb forgiveness slightly.
- Increased target lock forgiveness slightly.
- Added keyboard fallback parity: `X` also pulses, alongside `Space`.

## Controls

```text
Left Stick = drift / local movement
RT / LT = rise / descend
A = hold absorb / pull
X = pulse
Right Stick = orbit / tilt camera
R3 = recenter camera
L3 or B = boost
```

Keyboard fallback:

```text
WASD / arrows = drift
Q / E = descend / rise
F = hold absorb
Space or X = pulse
I / J / K / L = camera
C = recenter
Shift = boost
```

## Forbidden Scope

No new cells, morphs, runtime routes, gates, doors, teleports, old chamber loading, combat, dialogue tree, quest log, or visual replacement campaign.
