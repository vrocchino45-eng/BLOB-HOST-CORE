# HC-006C — Optional Tight Inspection Camera

## Interaction contract

The camera is a reading aid, not a gameplay owner.

```text
approach cadence knot
→ Y/V makes tight view available
→ player chooses close inspection
→ right stick adjusts framing
→ interaction continues through existing HC-006B rules
→ Y/V or safety condition returns to orbit view
```

## Input ownership

- Y / V: camera mode only
- A: pulse-listen or held resonance according to interaction stage
- X / Space: pulse
- R3 / C: reframe current camera mode
- left stick / WASD: camera-relative movement

## Rejection rules

The camera may not:

- complete an interaction
- create a generic target
- change active cell
- open a route
- force first-person view
- disable movement
- override contextual A/X/F behavior

## Why tight third-person

A close third-person composition retains the player as an embodied participant while making the tissue response readable. Permanent first-person framing would weaken scale awareness and make camera-relative movement harder to read in this prototype.
