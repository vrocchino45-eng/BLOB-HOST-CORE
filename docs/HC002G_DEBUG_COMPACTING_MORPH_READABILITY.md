# HC-002G — Debug Compacting + Morph Readability Cleanup

## Purpose

HC-002G is a readability and stabilization pass based on the current playtest screenshot.

The build is now functional enough that the main blocker is not missing systems. The blocker is clarity:

- debug panels cover too much of the play space
- morph instructions read too technically
- selected object is not obvious enough in-world
- Guide / reticle / signal / bond visuals can visually stack together
- current test staging places too many support objects near the player

## Scope

Allowed:

```text
compact debug modes
world-facing morph panel text
selected-object readability halo
visual overlap reduction
entity/orbiter staging cleanup
```

Forbidden:

```text
new cells
new entities
new orbiters
new abilities
combat
dialogue system
new progression branch
```

## Debug Modes

```text
F1 = full debug
F2 = compact debug
F3 = hide debug
Back/Select = cycle debug modes
```

Default mode is now compact so the user can actually see the world while testing.

## Morph Text Cleanup

Technical message:

```text
waiting_for_composition_growth
```

World-facing replacement:

```text
The nursery is still feeding the seed-core.
Hold absorb on the safe seed until Form and Seed settle.
```

Ready state:

```text
Scar pressure is listening.
Pulse the scar plate or signal thread to let the cell fold.
```

Morphing state:

```text
The membrane is folding through scar pressure...
Keep moving. Stay with the pressure. No door, no teleport.
```

## Visual Staging Cleanup

The initial support systems are offset slightly so the center no longer feels like one pile of rings and helper bodies.

- Tender is staged farther right / above.
- Watcher is anchored farther left / up.
- Guide hovers farther forward/up from player.
- Signal thread is nudged away from the center cluster.
- Target pointer line opacity is reduced.
- Guide shimmer opacity is reduced.
- A selected-object halo clarifies the active target.

## Acceptance Tests

- [ ] Debug starts compact.
- [ ] F1 switches to full debug.
- [ ] F2 switches to compact debug.
- [ ] F3 hides debug.
- [ ] Controller Back/Select cycles modes.
- [ ] Morph panel language is readable as in-world guidance.
- [ ] Target halo identifies the selected object.
- [ ] Guide/Tender/Watcher/target visuals are less clustered.
- [ ] HC-002F morph trigger reliability remains intact.
