# BLOB: HOST CORE — C0C-VIS1-B (pressure-band visual convergence)

**Mode:** Visual Lock / Convergence. **Only gameplay file edited:** `src/routes/VascularRhythmRouteSystem.js`.

This is a **method-only**, exact VIS1-A → VIS1-B guarded patch. VIS1-B makes the existing nine Vascular folds and supporting braids more legible under accepted Silt pressure without changing the Silt↔Vascular receipt ledger, receiver, movement, current equation, physics, progression, camera, targeting, three verbs, or save state. It adds **no meshes or runtime systems**.

## Install (Windows PowerShell / VS Code)

Extract this folder into the **current BLOB-HOST-CORE root** (alongside `src`, `scripts`, `package.json`). DO NOT replace the whole game or drop a new version of a historical ZIP over your latest work.

```powershell
node BLOB_C0C_VIS1B_DELTA/apply.mjs --check
node BLOB_C0C_VIS1B_DELTA/apply.mjs --apply
node BLOB_C0C_VIS1B_DELTA/validate.mjs
npm run build
node BLOB_C0C_VIS1B_DELTA/apply.mjs --check
```

Check must return `VIS1A_READY` before apply, `VIS1B_INSTALLED` after. `DIFFERENT` means your local code is not the exact known VIS1-A source. **Stop; do not force it.** The installer backs up the entire pre-patch file within `BLOB_C0C_VIS1B_DELTA/backups/`. Keep that folder to allow rollback.

**Earlier `scripts/validateC0CVis1A.mjs` is hash-locked to VIS1-A.** It is expected to report a source hash mismatch after this pass. Use `BLOB_C0C_VIS1B_DELTA/validate.mjs` for VIS1-B instead. Earlier C0C2/C0C3/C0C4/REC1 checks should remain valid.

## What changed and why

- Replace broad saturating compression with a **narrower, directed pressure band** moving along the original folds; capped at the *same* 26% radial compression and 33% Y expansion.
- Reveal the original folds by **reducing loaded envelope opacity** while retaining its silhouette; previously more load increased shell opacity.
- Give pressure-bearing folds a **local cyan-emissive tissue response**, not an extra overlay or gold objective marker.
- Keep meaningful RESTING, RECEIPT ONSET, LOADED, and RECOVERING state labels in the existing TRACE1-B `vis1` presentation trace; never use them as gameplay input.
- Clear the temporary loaded-tissue hue after load returns to zero.

## Browser acceptance (new short REC1 capture)

1. Start a clean session / REC1 with `Alt+Shift+R` while in **Silt**.
2. Create 2–3 **actual grip + release events** with loose Silt grains. Pulse alone does not produce the same cross-region provenance.
3. Enter **Vascular without refreshing**, and watch both the folds and the surrounding membrane before focusing on the gold exit marker.
4. For a useful visual comparison, keep the camera reasonably steady for 10–15 seconds upon entry and then for another 25–40 seconds as load recovers.
5. Stop REC1 with `Alt+Shift+R`, export with `Alt+Shift+E`, and share JSON + short gameplay video.

**Acceptance gate:** movement, controls, and previous route completion unchanged; at least one visually identifiable traveling band (not merely a HUD number); tissue more legible when loaded; recovery visibly softens the response. A successful local build or JSON alone cannot prove pixel contrast.

## Safe rollback

```powershell
node BLOB_C0C_VIS1B_DELTA/apply.mjs --revert
```

This restores only the exact original VIS1-A source when the installed VIS1-B owner is still untouched; it will not overwrite subsequent user edits.

## Boundaries / pending proof

This is a visual pass, not a gameplay feature. Material never arrives from Silt to Vascular. Receipt accumulation still occurs at Vascular mount and can saturate; addressing time semantics or networking is **not** part of VIS1-B. Brightness, depth composition, and player readability are pending local browser inspection. Do not treat the offline validator as a visual proof.
