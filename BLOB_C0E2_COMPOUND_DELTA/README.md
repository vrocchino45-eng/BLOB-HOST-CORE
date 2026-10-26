# BLOB — C0E2 compound spatial expansion

Requires C0E1 already installed (Windows installer fix accepted). **Changed-files-only ZIP**, not a full game or rebase.

In VS Code PowerShell, from the BLOB-HOST-CORE root:

```powershell
node BLOB_C0E2_COMPOUND_DELTA/apply.mjs --check
node BLOB_C0E2_COMPOUND_DELTA/apply.mjs --apply
node BLOB_C0E2_COMPOUND_DELTA/validate.mjs
npm run build
```

Check must report `C0E1_READY`. Stop if `DIFFERENT`. This checks SHA-256 content (allowing only verified CRLF normalization), stages exact backup bytes, and refuses unexpected edits.

## Implemented
- **Actual movement-envelope expansion:** Original per-region ellipsoid remains authoritative; for each of 12 sites, one extended side pocket and two overlapping connector ellipsoids are added to the physically allowed area. All in the existing cell, no teleport or new gates. PlayerMovementController stays the single movement authority. No new collision meshes or terrain solidity.
- **Anatomical continuity:** C0E1 sites now lead to differentiated distal cavity membranes, connective tissue and rims; they cannot be selected as gameplay targets. Shared site definitions prevent the visuals and envelope from diverging.
- **Local bounded experiments:** Pulse, Stabilize and Absorb modify site-local strain, imprint and void in [0,1], reflected by geometry; retained during the single runtime session on return visits. No chemistry transfer, save-file persistence, or Host receipts.
- **REC1:** Keeps schema v2 and existing keyboard controls; adds `c0e2-pocket-discovered` and per-read before/after local state. `territorySpatialRevision` is additive.

## Locked
C0D circuitry, Grave II completion, all route objectives, movement input mappings, Hub commits and original traversal envelopes. No expanded hard collision or off-route simulation.

## Rollback
```powershell
node BLOB_C0E2_COMPOUND_DELTA/apply.mjs --revert
```
Requires unmodified installed sources and verified backups. Do not commit `BLOB_C0E2_COMPOUND_DELTA/backups/` or any other backups to Git.

## Field acceptance
Test normal movement from original chamber through a connective corridor into each distal pocket. Confirm 12 `c0e2-pocket-discovered` observations where possible, response differences between verbs and retained local changes upon return. Also check controls and previous Grave II circuit progression. Offline geometric/mocked scene tests **do not** prove live Three.js rendering or camera clearance; Windows `npm run build` and playtest are pending.
