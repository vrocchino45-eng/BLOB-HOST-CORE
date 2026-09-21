# HC-009C Acceptance Tests

## Scope

This pass turns Surface Wake into one repeatable living gameplay circuit. It must not add a region, route, entity, ability, gate, combat loop, permanent class, or alternate progression branch.

## Automated acceptance

Run:

```bash
npm run validate:living-nursery-circuit
npm run validate:current
npm run build
```

The focused validator proves:

1. build identity is `HC-009C / 0.0.112`;
2. the HC-009A 15/13/8 active-region budgets remain unchanged;
3. 20 compatibility systems remain dormant;
4. `SurfaceWakeGameplaySystem` is the circuit gameplay owner;
5. current-carried matter has an embodied world object and no object-defining ring;
6. Pulse identifies matter through the Watcher;
7. clean matter can feed the Tender;
8. untreated contaminated matter strains the Tender and raises scar load;
9. a later Pulse-and-Stabilize cycle filters matter, feeds the Tender, restores integrity, and lowers scar load;
10. Tender food, fear, function, and failure states persist;
11. the Watcher reveals the existing Listening Fold after a successful cycle;
12. the circuit never directly completes the Fold, absorbs the protected seed, or starts the morph;
13. failures remain recoverable;
14. the established three-room progression owners remain unchanged.

## Live controller test

### Read the cycle

- Hide diagnostics with F1.
- Wait near the visible current mouth for the first moving matter packet.
- Follow it through the volume.
- Pulse with X while close enough.
- Confirm the Watcher changes from tracking unread matter to identifying it.
- Confirm the packet brightens briefly without gaining a permanent ring.

### Feed the Tender

- Let the first clean packet reach the Tender.
- Confirm the Tender opens, receives it, and shifts into a feeding/repair response.
- Confirm the Watcher turns toward the Listening Fold after the successful cycle.
- Do not enter the Fold yet; remain long enough to see the next cycle.

### Observe a failure

- Pulse-read the scar-touched packet.
- Do not Stabilize it.
- Let it reach the Tender.
- Confirm the Tender contracts, the Watcher warns, and the scar response increases.
- Confirm the game does not dead-end or punish the player with a restart.

### Recover

- Pulse-read the next mixed packet.
- Move beside it during the middle of its path.
- Hold LT Stabilize while traveling with it.
- Confirm the packet's color and body soften toward clean nourishment.
- Let it reach the Tender.
- Confirm the Tender recovers, scar pressure lowers, and the successful state persists into the next cycle.

### Existing progression

- Approach the Listening Fold after the Watcher reveals it.
- Complete the existing Pulse/sustain/release lesson.
- Absorb the protected seed with RT.
- Complete the established Surface Wake → Guide Threshold → Hub Chamber handoff.
- Confirm no circuit action bypasses those steps.

## Live pass criteria

HC-009C passes when, with F1 hidden:

- the player can see matter enter, travel, and reach a living recipient;
- clean, contaminated, and filterable matter read as different bodies;
- the Tender visibly has food, fear, function, and failure states;
- the Watcher visibly identifies risk and points attention toward the Fold;
- an untreated failure changes the nursery but remains recoverable;
- a later successful intervention produces an unmistakable persistent improvement;
- the space between awakening and the Fold feels like play rather than waiting for a trigger;
- the full established three-room slice remains completable.
