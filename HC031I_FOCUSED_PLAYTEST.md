# HC031I Focused Playtest — Host Contact Ecology Continuation

## Setup
- Use **Shift+1** for Surface Wake / Host Contact Shelf.
- 5–8 minutes is enough.
- Do not hunt for a hidden completion condition; there is none.

## What to test
1. Crawl from the entry shelf onto the broader membrane continuation.
2. Stop, reverse, and let several tendril peel/replant cycles happen on membrane.
3. Move onto the scar buttress and use **Stabilize + Pulse** while visibly attached.
4. Move onto the residue wash and try ordinary crawling, then attached Stabilize + Pulse.
5. On residue, also try **Stabilize alone** briefly and see whether the material presentation reads as temporarily cohering rather than simply glowing.
6. Leave each surface and watch whether its response settles rather than snapping off instantly.

## Acceptance questions
- Does the continuation feel like one Host space rather than three test props?
- Does membrane feel alive/forgiving while crawling without moving the physical anchor out from under the Core?
- Does scar make the same Stabilized Projection feel more structurally supported?
- Does residue visibly yield/slump under load without trapping or blocking traversal?
- Is Stabilize-alone on residue readable as coherence, not a new ability?
- Can the player ignore all deeper interaction and still leave/move freely?
- Do the response shells remain visually subordinate to the Core/object interaction?

## Telemetry
Export with **Shift+T**. Useful fields now include:
- `hostContactEcologySurfaceId`
- `hostContactEcologyRole`
- `hostContactEcologyResponseMode`
- `hostContactMembraneCarry01`
- `hostContactScarBrace01`
- `hostContactResidueYield01`
- `hostContactResidueCohesion01`

Expected examples:
- membrane crawl -> `hostContactEcologyRole=living_membrane_path`
- scar attached Stabilize+Pulse -> `hostContactEcologyResponseMode=scar_bearing_focused_recoil`
- residue crawl -> `residue_slumping_under_traversal`
- residue Stabilize alone -> `residue_temporarily_cohering`

No merge decision should depend on a hidden score; video/feel plus telemetry agreement are the acceptance basis.
