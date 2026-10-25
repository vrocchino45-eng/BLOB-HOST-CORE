# BLOB — C0D4-MOB1 | Movement / Interaction Authority Observatory

## Scope

C0D4-MOB1 is a **single-file recorder-only** patch over the exact C0D4-OBS1 baseline. It does **not** alter movement speed, player forces, Hub guided-flight controls, interaction targeting, Grave II challenge conditions, or Host circuit behavior.

Adds these additive REC1 event types:

- `c0d4-mob1-movement-sample` — approximately every 900 ms while movement is requested; player intent, environment force, flow, velocity, boundary pressure, attachment, guided-flight state
- `c0d4-mob1-sustained-low-progress` — one observation per sustained episode; diagnostic candidate reason, not assertion of cause
- `c0d4-mob1-guidance-state-change` — Hub guide ownership/transition snapshots
- `c0d4-mob1-action-context` — A/X/LT/RT gamepad down with Hub/Grave owner state at sampling
- `c0d4-mob1-action-followup` — later owner snapshot; differences do not automatically prove an action was consumed

**Recorder schema version 2 and default export filename remain unchanged.** A new `mobilityObservationRevision: C0D4-MOB1` metadata field distinguishes this build.

## Install (VS Code PowerShell, from BLOB-HOST-CORE project root)

Extract the `BLOB_C0D4_MOB1_DELTA` folder beside `src` and `package.json`.

```powershell
node BLOB_C0D4_MOB1_DELTA/apply.mjs --check
node BLOB_C0D4_MOB1_DELTA/apply.mjs --apply
node BLOB_C0D4_MOB1_DELTA/validate.mjs
node scripts/validateC0CRecorderFullSession.mjs
npm run build
```

The first command must say `C0D4_OBS1_READY`. If `DIFFERENT`, stop; never replace the source by hand. Existing modified gameplay files from previous passes are not touched. A backup is kept inside the delta folder. Rollback:

```powershell
node BLOB_C0D4_MOB1_DELTA/apply.mjs --revert
```

## Field test

Start/stop REC1: `Alt+Shift+R`. Export: `Alt+Shift+E`. Without browser reload, reproduce strong current and unresponsive actions in **Signal Chorus (Hub)**, then in **Grave II**. Hold a direction against the force for ~2 seconds and press A/X with a nearby target in view. Upload the exported REC1 JSON plus an optional short gameplay clip. Stop whenever the fault appears; do not force a full circuit replay. The recorder can distinguish intentional guided ownership, attachment, boundary corrections, opposing flow, and unexplained low progress; it cannot prove which controller/target action was accepted by itself.

## Git

Commit only the changed tracked `src/debug/WorldObjectCensusSystem.js` after validation. Keep the delta installer/backups out of the game source history.
