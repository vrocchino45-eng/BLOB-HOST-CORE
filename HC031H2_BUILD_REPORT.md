# HC031H2 Build Report — Anchor-Carried Surface Identity

Parent: **HC031H1 — Unified Physical Contact Authority**

## Purpose
H1 proved the new authored suction authority could fire, but telemetry showed planted supports and same-frame SurfaceTruth rarely overlapped. Support plane, movement, and Stabilized Projection were therefore still requiring the same surface to be rediscovered after the sucker had already sealed.

## Governing law
`SurfaceTruth authorizes seal once -> sealed anchor retains authored surface identity -> support plane consumes anchors -> movement/projection consume support plane`

## Runtime changes
- Each tendril anchor now carries surface owner, mesh name, surface/profile/material IDs, adhesion, load tolerance, compliance, verb transmission, and normal.
- Reach/stride handoff preserves that relationship until peel/release; unrelated surfaces are never silently combined into one support plane.
- `CoreTendrilSupportPlaneSystem` derives support directly from sealed anchor-carried identity and no longer requires current SurfaceTruth after seal.
- `PlayerMovementController` accepts the carried support plane without requiring its current raycast surface ID to match.
- `StabilizedProjectionSystem` keeps the HC031G chord/rules but can source external brace material data from the carried support plane.
- Telemetry exposes carried surface identity, support-plane source, and external brace source.

## Locked scope
No new input, ability, target authority, Bond/Absorb rule, collider, raycast owner, BVH/physics dependency, route/progression change, or region expansion.

## Acceptance
A focused shelf test should show sustained samples where:

`anchorCarriedSurfaceIdentityActive=true`
→ `tendrilSupportPlaneActive=true`
→ `authoredSuctionSupportActive=true`
→ `attachmentAuthority=authored_suction_support`
→ `attachmentActive=true`
→ `tendrilLocomotionActive=true` while moving

and Stabilize+Pulse while attached should produce `stabilizedProjectionSurfaceBraced=true` with `externalBraceSource=anchor_carried_surface_identity`.
