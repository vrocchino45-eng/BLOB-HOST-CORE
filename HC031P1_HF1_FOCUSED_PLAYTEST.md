# HC-031P1-HF1 Focused Playtest — Destination Commit Latch

Target: 4–6 minutes. Export telemetry with **Shift+T**.

## Primary test
1. Play normally to Signal Chorus / Hub.
2. Approach Grave until it becomes an available A/E destination.
3. Press **A once** to commit.
4. While the living-tissue morph is carrying the Core toward Grave, deliberately press **A two or three more times**.
5. Spend enough time in Grave for the return fold to become usable, then return to Hub.
6. Approach Grave again and press **A once** for a second entry.
7. You may again tap A during the second morph to test the latch.
8. Export with **Shift+T**.

## Expected telemetry
For each real Hub→Grave crossing:
- one `hub.destination.available`
- one `action.deliberate_commitment`
- one `hub.destination.committed`
- `hub.destination.readiness_changed` becomes `commit_in_flight`
- one `transition.entered` with `activation: deliberate_destination_commit`
- one `route.resolved` with `releaseState: arrived_in_grave_memory`

Extra A presses during the morph may still appear as reserved A presses, but they must **not** create extra deliberate commitments or replace the pending route request.

## Regression checks
- first Grave destination can still become ready even when whole-Hub screen truth is false;
- no automatic crossing;
- Grave return fold still works;
- second Grave entry remains possible;
- movement and physical-language chains remain healthy;
- no new movement-progress blocks.
