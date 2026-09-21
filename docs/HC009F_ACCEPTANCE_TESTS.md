# HC-009F Acceptance Tests

## Purpose

Verify that the two first-slice tissue crossings no longer concentrate destination construction or feel frozen, without weakening any HC-009E gameplay prerequisite.

## Live timing pass

1. Start a normal Surface Wake run with F1 hidden.
2. Complete one deliberate Pulse-led nursery success and the unchanged Listening Fold sequence.
3. Absorb the protected seed and earn the Surface-to-Guide morph.
4. During the crossing, confirm movement remains responsive, destination anatomy fades in rather than popping, and progress does not visibly hold.
5. Complete the Guide Threshold pressure, alignment, response, release, and settle sequence.
6. During the Guide-to-Hub crossing, confirm the same continuous control and progressive visual handoff.
7. Enter Hub Chamber and verify its anatomy is present on the first rendered Hub view.
8. Open F1 after the crossing.

## Required F1 evidence

- Transition preparation reaches the full job count.
- `S→G` and `G→H` both report `ready`.
- `stalled` remains `no`.
- No preparation job reports a failure.
- The maximum frame gap is recorded; repeated gaps above 80 ms require a targeted replay.
- Active-region execution remains `15 → 13 → 8`.
- Dormant compatibility registration remains zero.

## Regression proof

- The Fold does not appear before deliberate nursery agency.
- Prepared chemistry is not visible, pulse-readable, targetable, or absorbable before activation.
- Binding Core growth, Guide recognition, Hub investigation, Status self-reading, and Grave Memory crossability remain unchanged.
- Vascular Rhythm and Silt Pressure remain dormant.
- The coordinator does not appear in `SystemRegistry`.
- `npm run validate:current` and `npm run build` pass.

## Failure classification

- A job failure points to dormant resource construction.
- A gap during shader preparation points to the warmup job or driver behavior.
- A smooth frame graph with a perceived pause points to blend pacing or camera settle.
- A first-Hub-frame hitch with both boundaries ready points to mount activation or render submission rather than geometry construction.
