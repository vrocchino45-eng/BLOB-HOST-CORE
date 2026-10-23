# BLOB — C0D1-A Local Applied-Effect Contract

## Scope
One gameplay file changed: `src/routes/VascularSiltSignalReceiver.js`. No Host or Grave wiring. No changes to Silt, route presentation (VIS1-B), current, recovery law, controller, Core or progression. This is a **functional contract addition**, with no expected visible gameplay difference yet.

## Install from BLOB-HOST-CORE project root
Extract `BLOB_C0D1A_DELTA` next to `src/` and `package.json`.

```powershell
node BLOB_C0D1A_DELTA/apply.mjs --check
node BLOB_C0D1A_DELTA/apply.mjs --apply
node BLOB_C0D1A_DELTA/validate.mjs
npm run build
```

`--check` must show `C0C4_READY`. If it says `DIFFERENT`, stop: your local source diverged; do not overwrite changes. `--apply` automatically preserves an exact pre-change copy under `BLOB_C0D1A_DELTA/backups`.

To roll back only this pass (provided source has not been modified since):

```powershell
node BLOB_C0D1A_DELTA/apply.mjs --revert
```

## Contract
The receiver retains its old `snapshot()` byte-for-byte equivalent in field meanings and its old acceptance/recovery logic. It now independently exposes `appliedEffectSnapshot({afterSequence})`, a capped 64-entry read-only stream of immutable records only when validated Silt receipts **actually increase** Vascular membrane load. Saturated receipts are still counted normally but do not create false effects. Each event records parent Silt receipt ID/sequence, Vascular event ID/sequence, before/after load and exact applied delta. No material, remote simulation or progression is claimed.

**This step is not yet a three-region circuit**: C0D1-B must authenticate and relay these events through an independent Host-owned channel; C0D1-C must introduce Grave I as a local consumer. Do not expect new HUD or visible effects from C0D1-A.

## Test notes
`node scripts/validateC0C4Vascular.mjs` is pinned to the old receiver's exact SHA-256 and will fail *that source-hash assertion* after this deliberate single-file change. The included `validate.mjs` independently verifies legacy output parity with the untouched LS1E2 fixture and the new event contract. Do not change old validators or restore old source to silence the expected pin failure. Run C0C2, C0C3, REC1 separately if desired.
