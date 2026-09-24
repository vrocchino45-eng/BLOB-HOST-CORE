# HC031J1 — Build Report

## Pass mode

Feel Repair / Convergence.

## Purpose

Restore a deliberate, readable handoff from attached surface crawl to free movement without weakening neutral suction or changing the accepted tendril gait.

## Evidence

The HC031J session spent 222 movement samples attached at an average speed of about 0.30, versus about 1.18 while free, despite strong movement input. Direct attached input was fixed at 4%, all normal velocity was removed, and suction could reacquire after a 0.30-second timer. Code inspection also found that authored surface normals were interpreted with the wrong sign for release intent.

## Allowed scope

- `PlayerMovementController` peel, release, and reacquisition handoff
- read-only session telemetry for the handoff
- build identity, contract, validator, and focused documentation

## Locked scope

- controls and camera-relative movement grammar
- tangent surface crawl and planted-anchor ownership
- surface eligibility, profiles, raycasts, and support-plane derivation
- HC031J contact symbols and HC031I4 ecology presentation
- verb meanings/output, targeting, routes, objectives, and progression

## Implementation

- Corrected away intent to use the positive contact-to-Core normal direction.
- Added a bounded suction-unloading envelope beginning at 0.20 away intent.
- Requires strong away intent for roughly 0.13 seconds at typical adhesion before release.
- Raises direct input from 4% toward 52% only during peel.
- Reduces ride-height correction and anchor restraint during the peel envelope.
- Applies release impulse along the verified away normal.
- Extends cooldown to 0.55 seconds and also requires 0.26 units of physical clearance before suction may reacquire.
- Records peel, release reason, clearance, reacquisition blocking, and discrete detach/attach events.

## Acceptance

- Neutral input remains attached.
- Tangent input retains the existing planted-anchor crawl.
- Strong away input releases within approximately 0.25 seconds.
- Into-surface input does not trigger release.
- The Core cannot immediately snap back to the released surface.
- Normal free movement regains full authority after release.
- HC031J contact symbols and all locked gameplay systems remain unchanged.
