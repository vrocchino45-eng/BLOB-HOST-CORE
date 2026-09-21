# HC031H1 Build Report — Unified Physical Contact Authority

Parent: **HC031H — Planted Contact Support Assimilation**

## Purpose
HC031H telemetry proved that suction anchors could exist while `PlayerMovementController` still reported `attachmentActive=false`. HC031H1 removes that ownership split.

## Governing law
`registered crawlable surface + valid world-planted suction support = physical contact`

The older Silt/membrane chemistry attachment proof remains supported, but chemistry no longer universally grants permission for every authored suction relationship.

## Runtime changes
- `CoreTendrilSurfaceContactSystem` publishes mechanical contact eligibility from authored surface truth + sealed suction support, independent of the older visual `contactState` flag.
- `CoreTendrilSupportPlaneSystem` can activate from sealed world anchors + authored surface truth without first requiring movement attachment to already be active.
- `PlayerMovementController` consumes prior-frame suction support as a legitimate physical attachment authority.
- A 0.22 s support grace prevents a normal peel/replant handoff from dropping physical attachment for a single transient gap.
- Legacy chemistry attachment remains available as `legacy_chemistry_membrane`.
- Session telemetry now exposes contact authority and authored suction support explicitly.

## Locked systems
HC029C verb composition and HC031G Stabilized Projection remain byte-locked. Targeting, Bond/Absorb, Grave systems, surface-authoring vocabulary, Core growth, and visual grammar are also locked through the parent hash contract.

## Forbidden scope honored
No new controls, ability, collider, raycast owner, physics engine, BVH dependency, region content, progression logic, or wall/ceiling traversal expansion.

## Acceptance target
A valid sucker sealed to membrane/scar/soft/residue should cause telemetry to agree:

`authoredSuctionSupportActive=true` → `attachmentAuthority=authored_suction_support` → `attachmentActive=true` → support plane may activate → tendril locomotion may activate.

During `Stabilize + Pulse`, a valid attached relationship should also permit HC031G to report a surface-braced projection rather than only `self_braced`.
