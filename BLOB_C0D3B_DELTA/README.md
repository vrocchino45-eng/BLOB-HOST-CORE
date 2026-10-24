# BLOB — C0D3-B: Grave II resolution to Host

**Current required build:** C0D3-A, after C0D2. Only this pass's three changed gameplay files are included.

## What changes
- The existing HC-031B Grave II resonance owner still resolves three-landmark coupling by its *original* rule: 3 interactions, at least 2 landmarks, and 1.65s held inside one of its existing three valid resolution bands.
- At the exact moment Grave II resolves, the owner sends its **actual existing completion event** to a separate, bounded Host outcome channel. Host cross-checks active Grave, qualified second visit, owner state, matching frame, resolution, source sequence, and replay.
- Host keeps the outcome across region remounts during the current runtime. If an authentic Vascular parent is still retained, it includes that parent ID. It does not pretend the parent exists when it does not.
- Grave II geometry transformation is *not* a completion. Normal Grave II completion credit remains owned by ReturnRegionEngineSystem; the new Host outcome provides **zero extra credit**.
- Silt does **not** consume this outcome yet; that is C0D3-C. No new visuals, movement, chemistry, material flow, save persistence, or always-on remote simulation.

## Install (PowerShell from BLOB-HOST-CORE project root)
Extract `BLOB_C0D3B_DELTA` beside `src` and `package.json`.

```powershell
node BLOB_C0D3B_DELTA/apply.mjs --check
node BLOB_C0D3B_DELTA/apply.mjs --apply
node BLOB_C0D3B_DELTA/validate.mjs
npm run build
```
The first check must print `C0D3A_READY` (or `C0D3B_INSTALLED` if repeated). **If DIFFERENT, stop and do not overwrite.** The installer checks all three hashes before touching a file, preserves exact backups inside `BLOB_C0D3B_DELTA/backups/`, and refuses mixed/partially modified states.

## Rollback
```powershell
node BLOB_C0D3B_DELTA/apply.mjs --revert
```
Only reverts if all three targets still match this package and all three backups match the previous exact hashes.

## Scope and proof
- Offline validation: real GraveResonanceGameplaySystem.update() completes and publishes one event; Host verifies it. Parent/no-parent, replay, fake, off-route, first-visit and partial-event tests.
- Older HC031B and C0C4 validators contain strict hashes for pre-C0D1B/pre-C0D3B source and may report hash mismatches; these are not gameplay test failures. C0C2/C0C3/REC1 still usable.
- I cannot confirm your Windows Vite/browser execution here; run `npm run build` locally and later a focused Grave II playtest to verify the experience.

**Next:** C0D3-C: a bounded Silt-owned reaction to a legitimate Grave II outcome. Do not interpret this pass alone as closing the physical loop.
