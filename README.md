# LS1D1B — Runtime Silt Grip (experimental)

Merge only changed files into current BLOB-HOST-CORE. Back up/commit first.

- Stabilize + A grips nearest eligible visible Silt grain within 2.2 local units, after LS1B cycle awakens.
- While holding Stabilize, the grain follows the Core at its initial relative offset, bounded by grip authority.
- Release Stabilize or press A again to release; leaving Silt also releases.
- Held grain pauses its LS1B cycle phase/age; all eight identities and mass are conserved.
- Snapshot includes `siltGrip` for telemetry. No new HUD display, shell attachment or persistence.
- Existing deliberate commitment system remains unchanged. If an authored A commitment is offered at the same moment, input priority still requires gameplay verification.

Run: `node scripts/validateLS1D1BGripIntegration.mjs`

Playtest: awaken LS1B via canonical packet, approach a moving grain, hold Stabilize + press A, move, release, confirm grain resumes its cycle. Confirm existing A interaction and Silt progression are not disturbed.
