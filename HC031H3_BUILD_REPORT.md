# HC031H3 Build Report — Brace Continuity

Parent: **HC031H2 — Anchor-Carried Surface Identity**

## Purpose
The second H2 telemetry test proved a clean `cohere_project` sample could overlap an active `authored_suction_support` physical attachment while the live support plane had already dropped out for the tendril handoff. Movement remained attached through its existing 0.22-second grace, but Stabilized Projection fell back to `self_braced`.

## Governing law
`live anchor support -> highest-fidelity external brace`

`live support temporarily absent + movement still owns valid authored suction attachment -> preserve external brace through the same movement-owned continuity`

`no valid physical Host attachment -> free-space self brace`

## Runtime changes
- `StabilizedProjectionSystem` now recognizes movement-retained authored suction attachment as a continuity brace source.
- Live anchor-carried support remains first priority and keeps full material/profile fidelity.
- The continuity fallback uses the movement-owned retained surface ID, support count, and support strength.
- No new grace timer is added; H3 consumes the existing 0.22-second `PlayerMovementController` continuity only.
- Session telemetry now distinguishes live-anchor brace from attachment-continuity brace.

## Locked scope
No PlayerMovementController tuning, tendril gait/replant change, support-plane change, SurfaceTruth change, control change, target/Bond change, ability change, region/progression change, collider/raycast change, or new dependency.

## Acceptance
A clean shelf test should produce `cohere_project` with Absorb off and, while authored suction attachment remains active during a handoff, report:

`stabilizedProjectionSurfaceBraced=true`

`stabilizedProjectionAttachmentContinuityBraceActive=true`

`stabilizedProjectionExternalBraceSource=authored_suction_attachment_continuity`

Live anchor overlap should continue to report `anchor_carried_surface_identity`.
