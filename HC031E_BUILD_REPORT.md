# HC031E Build Report — Tendril Surface Contact Proof

## Mode
Contained embodiment/contact proof. No traversal rewrite.

## Purpose
Make the Core visibly occupy authored Host surfaces through three temporary suction relationships before tendrils are allowed to drive locomotion.

## Runtime addition
- `src/player/CoreTendrilSurfaceContactSystem.js`

The system reads the same-frame `playerKinematics.movementBoundary` and `coreContactLanguage` already authored by the locked movement/embodiment stack.

## Behavior
- **Suspended:** tendrils retract.
- **Brushing:** one exploratory tendril reaches toward the trusted surface.
- **Attached:** three tendrils establish a distributed support triangle.
- **Surface travel:** pads remain planted until stretch/drift exceeds a bounded threshold, then one tendril peels, reaches ahead, seals, and hands stepping authority to the next tendril.
- **Release:** suction pad flattens less, peels asymmetrically, then the tendril recoils.

The suction tip visibly transitions `approach -> flatten/seal -> tension hold -> peel -> recoil/reach`.

## Authority lock
HC031E does **not**:
- move the Core;
- alter PlayerMovementController velocity or boundary behavior;
- add collision;
- raycast decorative geometry;
- add controls or a tendril button;
- change chemistry, targeting, Bond/Absorb, Grave resonance, rupture, consequence, route or progression state.

PlayerMovementController remains sole movement/attachment authority. The three tendrils are presentation/embodiment proof only.

## Why the authored boundary is used
HC025C already established the movement envelope as the only trusted contactable surface source. HC031E therefore deliberately does not attach tendrils to arbitrary decorative meshes. True mesh/surface contact is a later traversal stage only after contact ownership is redesigned explicitly.

## Acceptance test
1. Approach an authored movement boundary until the Core contact language becomes brushing/attached.
2. Confirm one tendril reaches first and three eventually seal.
3. Move tangentially along the surface and look for planted pads plus one-at-a-time peel/reach/reseal behavior.
4. Pull away and confirm pads visibly peel rather than pop off.
5. Confirm movement feel, camera, verbs, rupture/Absorb, Grave exit and progression remain unchanged.

## Out of scope
- tendril-driven translation;
- wall/ceiling gravity/orientation rewrite;
- material-specific adhesion strength;
- individual tendril control;
- surface scarring/history accumulation.
