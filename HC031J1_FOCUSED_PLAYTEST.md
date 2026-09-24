# HC031J1 — Focused Playtest

Run this as a short 3–5 minute feel check.

1. Press **Shift+1** and establish visible suction on the contact shelf.
2. Release the stick. Confirm the Core remains attached without drifting free.
3. Move sideways along the surface. Confirm the existing tendril plant/pull crawl still reads.
4. Push into the surface briefly. Confirm this does not detach the Core.
5. Hold directly away from the contacted surface. Confirm a short unload/peel and release within roughly 0.25 seconds.
6. Keep holding away. Confirm the Core gains free movement and does not immediately snap back.
7. Return to the shelf deliberately. Confirm suction can establish again after real clearance.
8. Repeat on membrane, scar, and residue if convenient; the movement rule should be consistent while their material response remains distinct.
9. Export telemetry with **Shift+T**.

Primary feel question: **Can I choose to leave the surface without fighting the suction, while still believing the tendrils are carrying the Core during a crawl?**

Useful telemetry truth:

- `movement.surface_detached` should report `deliberate_away_input`.
- `attachmentPeelIntent01` should rise before detachment.
- `attachmentReacquireBlocked` should remain true until cooldown and clearance are satisfied.
- `movement.surface_reacquire_unblocked` should occur only after clearance reaches at least `0.26`.
