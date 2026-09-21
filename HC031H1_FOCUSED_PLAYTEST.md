# HC031H1 Focused Playtest

Use **Shift+1** to enter the Host Contact Shelf.

Run about **5–8 minutes**. The test is not about adding new behavior; it is about agreement between the behavior already visible and the movement authority.

1. Crawl onto stable membrane and keep moving long enough to see peel/replant cycles.
2. Stop while two or three suckers are visibly planted.
3. Move across scar, soft tissue, and residue if reachable.
4. Reverse direction a few times and deliberately pull away once.
5. Use **Stabilize + Pulse** once in free space and several times while visibly attached.
6. Export telemetry with **Shift+T**.

### Pass indicators
- Tendrils remain world-planted during body motion.
- Physical attachment no longer depends on being in the old Silt membrane chemistry state.
- Attachment does not flap off during a normal single-tendril handoff.
- Pull-away still releases safely.
- Telemetry includes `attachmentAuthority=authored_suction_support` while sucker contact is established.
- `tendrilSupportPlaneActive` appears during multi-anchor support.
- `tendrilLocomotionActive` appears while moving on those supports.
- At least some attached `cohere_project` samples report a surface-braced HC031G projection.

### Failure indicators
- Visible suckers are sealed while `attachmentActive` remains false for the entire contact.
- Non-crawlable geometry becomes sticky.
- The Core cannot detach.
- Attachment repeatedly toggles every step.
- Focused Pulse becomes unavailable away from a surface.
