# HC030A Focused Playtest — Reactive State Grammar

Target recording: **15–20 minutes**. Do not exceed ~25 minutes for this checkpoint.

## Primary question

Can you read **what condition the thing is in** from its behavior, and do the same verbs now feel meaningfully different when the target is coherent versus strained/unstable/failing?

Do not test by memorizing state names. Play normally and judge whether the object itself gives enough information to change what you try next.

## What to do

### 1. Establish a clean baseline

Find a calm / low-risk object and use single Pulse, Absorb and Stabilize. Notice how clean or regular its motion looks.

### 2. Work a scar / high-risk object

Stay on one retained relationship long enough to compare:

- Pulse before Stabilize.
- Stabilize for several seconds and watch whether the object's own deformation settles.
- Pulse again after it has settled.
- Hold Absorb and watch whether strain returns.

The target should not need a HUD label for you to notice that its condition changed.

### 3. Compare raw versus composed action

On the same target, compare:

- X vs LT+X.
- RT vs LT+RT.
- RT+X tension.
- LT+RT+X equilibrium.

The question is not "is the combo stronger?" It is whether Stabilize preserves coherence while the other force acts.

### 4. Full-system release test

Use all three on an unstable-looking target, hold briefly, then release. The held state should look more controlled than the underlying condition actually is. On release, some instability may become visible again.

If full-system simply looks like a permanent repair, mark that as a failure.

### 5. Normal play

Spend the final several minutes not deliberately testing states. Follow whatever seems interesting. We want to know whether state-reading starts influencing your choices naturally.

## Watch for

- Does Stabilize visibly settle the **target**, not just surround it with a lattice?
- Does Pulse on an unstable target look less clean than Pulse on a coherent one?
- Does resisted Absorb visibly build strain?
- Can you tell that LT+X / LT+RT preserve coherence without reading debug text?
- Does full-system read as "holding this together" rather than "ultimate move"?
- Do target deformations become too noisy, rubbery, or visually detached from the authored object?
- Does foreground Host geometry hide the state response at important moments?

## Telemetry

Export the JSON after the run. HC030A telemetry now retains up to **16,000 events** and records `chem.reactive_state.changed` when a target crosses coherent / strained / unstable / failing boundaries.

## Lock criterion

HC030A can lock when target condition is readable enough that the player sometimes changes verb choice because of what the object is doing, not because a prompt tells them what to press.
