# HC-031K-HF1 Focused Playtest

Run a short 3–6 minute contact test. Do not broaden into progression testing yet.

Repeat this loop several times:

1. Fly onto the Host Contact Shelf and acquire attachment.
2. Stay neutral for 2–3 seconds.
3. Crawl laterally across visible seams.
4. Reverse direction while remaining attached.
5. Briefly stop and resume tangential movement.
6. Deliberately push away until peel/release occurs.
7. Fly clear, re-approach, and land again.
8. Include at least one light/glancing brush where you do not intend to attach.

## Expected Feel
- attachment survives ordinary seams and brief contact uncertainty;
- no return of the old trapped/constricted surface feeling;
- deliberate away-input still releases predictably;
- free flight after release remains authoritative;
- brushing does not become unwanted suction.

## Telemetry Check
Export with Shift+T. The header should report:
- `buildId: HC-031K-HF1`
- `schemaVersion: blob.session.telemetry.v1.30`
- `implementationPass: HC-031K-HF1`

Useful events now include:
- `movement.surface_brush`
- `movement.surface_contact_gap_tolerated`
- `movement.surface_support_identity_transferred`
- `movement.surface_detached`

For K closure, unintended `contact_authority_lost` should be absent or exceptional. A true prolonged loss should report `sustained_contact_loss`; deliberate exits should report `deliberate_away_input`.
