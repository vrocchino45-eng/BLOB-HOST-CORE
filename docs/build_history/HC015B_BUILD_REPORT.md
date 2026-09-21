# BLOB: HOST CORE — HC-015B Build Report

## Mode
Ecology readability and spatial-play convergence.

## Purpose
Preserve the HC-015A Signal Plain rules while making the encounter readable through the world itself and reducing iteration time with a direct local debug test position.

## Changes
- Signal Plain nodes now publish and render persistent dormant, nearest-unread, and read/retained states.
- Each unique observation wakes one corresponding receptive-organ lobe; cumulative response reaches 1/3, 2/3, then 3/3 before stabilization.
- Observed nodes remain visibly changed instead of returning to an ambiguous dormant look.
- Ctrl/Cmd+Shift+8 jumps to a Signal Plain test position and resets only the local Signal Plain encounter.
- Ctrl/Cmd+8 remains the authentic Aperture arrival jump.
- Direct debug access does not complete observations, gates, routes, objectives, or global progression.

## Locked
- Three unique observations -> Stabilize at receptive center -> fresh Pulse.
- Aperture movement/camera bounds and landmark positions.
- Comb/Aperture GateSystem ownership and return path.
- Ctrl/Cmd+1..8 area jumps.

## Validation
- `npm run validate:signal-plain-readability` — PASS
- `npm run validate:signal-plain-first-ecology` — PASS
- `npm run validate:signal-plain-debug-jump` — PASS (HC-015A historical contract)
- `npm run validate:recipe-data` — PASS; current build HC-015B
- `npm run audit:undefined-methods` — PASS
- `npm run build` — PASS
