# HC-031P Focused Playtest — First Host Destination Commitment

Target length: **6–9 minutes**. Export telemetry with **Shift+T**.

## Main run

1. Play Surface Wake normally; do not intentionally optimize the route.
2. Follow the Host continuation through Guide Threshold into Signal Chorus / Hub.
3. On first Hub arrival, spend a few seconds looking rather than opening debug/UI.
4. Look for one route body that feels awake and carries motion outward from the Hub center. That should be **Grave Memory**.
5. You may Pulse/read it for context, but that should not be mandatory.
6. Move physically toward that route body.
7. When it becomes commitment-ready, press **A** on controller (or **E** keyboard) once.
8. Confirm the world morphs continuously into Grave rather than teleporting or requiring another hidden checklist.
9. In Grave, interact/read for at least 60–90 seconds. If the return fold becomes naturally readable, use it and confirm the Hub return; otherwise stop there rather than forcing completion.
10. Export with **Shift+T**.

## What should feel true

- Signal Chorus reads like a junction inside one Host, not a level-select screen.
- Grave is visibly the one awake first destination; Vascular/Silt remain present but dormant.
- The cue is anatomical movement, not an objective arrow.
- Pulse may tell you what Grave is; it does not choose Grave for you.
- **A is meaningfully different from the three verbs: it commits to the destination.**
- Crossing remains a morph through living tissue.

## Telemetry expected

Build: `HC-031P`
Schema: `blob.session.telemetry.v1.38`

Expected sequence:

`hub.destination.available`
→ `action.deliberate_commitment`
→ `hub.destination.committed`
→ `transition.entered` (`grave_memory_route`, `deliberate_destination_commit`)
→ `route.resolved` (`arrived_in_grave_memory`)

Optional return evidence:

`transition.entered` (`grave_memory_route`, `remembered_return_fold`)

## Regression checks

- O/O1 nursery continuation still works without mandatory safe-seed absorption.
- Guide→Signal morph remains continuous.
- No automatic Hub→Grave crossing occurs without A/E.
- Vascular and Silt do not become first-route alternatives before Grave return.
- Movement/attachment/verbs/targeting feel unchanged.
