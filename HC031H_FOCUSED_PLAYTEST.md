# HC031H Focused Playtest — Planted Contact Support Assimilation

## Git branch

Recommended branch name:

`experiment/hc031h-planted-contact-support`

Create it from the accepted HC031G `main` checkpoint before copying this build into the permanent repository folder.

## Duration

5–8 minutes is enough.

## Primary question

**Does attached movement now read and feel like the Core is moving over world-planted supports, rather than the suckers following a continuously translating body?**

## Test sequence

1. Use Shift+1 to approach the Host Contact Shelf.
2. Attach to stable membrane and move forward slowly for several seconds.
3. Stop completely. Watch whether the Core settles over its planted support triangle.
4. Move forward again and watch which sucker peels. The over-stretched support should replant while the others remain fixed.
5. Reverse direction. There should be a brief support reorganization rather than instant sliding.
6. Move across the soft slope and scar brace. Watch ride height and body orientation, especially for sinking or sudden normal changes.
7. Use Stabilize + Pulse once free-floating and once while supported. The HC031G ability rule should feel unchanged.
8. Export telemetry with Shift+T.

## Visual acceptance

A freeze-frame during attached travel should usually allow us to identify:

- at least two visibly planted supports;
- one support under greater strain or in peel/reach;
- the Core riding above the support plane rather than intersecting it;
- a newly planted sucker that stays fixed while the Core advances over it.

## Telemetry acceptance

The exported JSON should contain movement samples with:

- `tendrilLocomotionActive: true`
- `tendrilSupportCount >= 1`
- `tendrilSupportPlaneActive: true` once planted support is established
- a real `attachmentSurfaceId`
- `stabilizedProjectionMode` and `stabilizedProjectionSurfaceBraced` during comparison pulses

If the video looks attached but these fields remain inactive, treat that as instrumentation failure rather than silently accepting the system.

## Regression checks

- Free-flight controls unchanged.
- Stabilize + Pulse remains available without anchoring.
- No new button is required to plant/replant tendrils.
- Non-crawlable geometry remains ignored.
- Absorb/Bond behavior unchanged.
- Grave/rupture/progression unchanged.

## Do not evaluate yet

Do not judge wall/ceiling crawling, edge wrapping, moving vascular walls, or BVH surface queries in this pass. They are intentionally deferred.
