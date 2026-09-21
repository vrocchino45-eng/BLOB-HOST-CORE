# HC-009B Acceptance Tests

## Scope

This pass proves Core embodiment and volumetric motion inside the locked Surface Wake → Guide Threshold → Hub Chamber slice. It must not add new regions, progression gates, abilities, entities, chemistry branches, combat, or permanent classes.

## Automated acceptance

Run:

```bash
npm run validate:core-embodiment-volumetric-motion
npm run validate:current
npm run build
```

The focused validator proves:

1. build identity is `HC-009B / 0.0.111`;
2. the HC-009A 15/13/8 active-region budgets remain unchanged;
3. 20 compatibility systems remain dormant;
4. RB publishes rise and LB publishes descent;
5. D-Pad ascent/descent remains available;
6. Status Page suppresses gameplay bumper lift while retaining tab navigation;
7. camera-pitched forward input contributes world Y;
8. sustained pitched thrust changes actual altitude;
9. flow-relative slip remains observable;
10. translation belongs to `PlayerMovementController`;
11. body language belongs to `CoreEmbodimentSystem`;
12. the Core binds four fins, three trailing veils, and twelve wake motes;
13. the authored player proxy has no idle halo, glint, or orbit ribs;
14. Pulse appears and clears within its transient window;
15. Guide Threshold contains at least 1.5 world units of vertical excursion;
16. Guide path agreement uses full-3D tangents;
17. Guide pressure/convergence bodies are not idle torus markers;
18. Surface Wake retains foreground and background altitude anatomy;
19. all established progression owners remain unchanged.

## Live controller test

### Seed Core identity

- Hide diagnostics with F3.
- Stop moving.
- Confirm the Core still reads as an asymmetrical body with a prow and trailing anatomy.
- Confirm no idle ring or vertical line is needed to identify it.
- Pulse once with X.
- Confirm one spherical wave expands and disappears.

### Camera-relative volume

- Pitch the camera upward with Right Stick.
- Hold Left Stick forward.
- Confirm the Core travels upward along the view direction.
- Pitch downward and repeat.
- Confirm the Core travels downward rather than remaining on a horizontal plane.
- Use RB and LB to add deliberate rise and fall without changing the camera.
- Confirm D-Pad Up/Down still works as an alternate.

### Fluid embodiment

- Enter the Surface Wake current at an angle.
- Release Left Stick.
- Confirm the Core coasts relative to the current instead of stopping immediately.
- Cross the current laterally.
- Confirm fins, veils, body stretch/compression, wake, and camera lead respond to motion.
- Contact the membrane boundary gently.
- Confirm the body compresses and recoils without leaving the playable volume.

### Surface Wake depth

- Circle the Tender and protected seed.
- Pass above and below the Tender's guarding canopy.
- Rise toward the Watcher and Listening Fold.
- Descend toward the scar shelf.
- Confirm foreground anatomy crosses in front of the Core and background anatomy remains behind it.
- Complete the existing Listening Fold and seed sequence without F1.

### Guide Threshold volume

- Enter Guide Threshold and follow the current through its low entry, high crest, and lower settling point.
- Confirm the current carries the Core vertically.
- Pulse to reveal flow, stabilize through turbulence, and release at the existing settle.
- Confirm the original threshold completion and Hub handoff remain intact.

### Status context

- Open Status with View/Select, Menu/Start, or Tab.
- Use LB/RB to change Status tabs.
- Confirm the Core does not rise/fall while Status is open.
- Close Status and confirm LB/RB immediately return to rise/fall.

## Live pass criteria

HC-009B passes when, with F1 hidden:

- the Core is unmistakable as the player's body;
- altitude changes are visible through parallax, occlusion, scale, camera lag, and anatomy crossing;
- the player can intentionally move above, below, in front of, and behind first-slice anatomy;
- Guide Threshold requires actual three-dimensional traversal;
- effects communicate actions without becoming object bodies;
- the entire established three-room progression remains completable.
