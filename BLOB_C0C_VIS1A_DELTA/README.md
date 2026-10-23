# BLOB HOST CORE — C0C-VIS1-A (small changed-file delivery)

**Milestone:** Vascular pressure-anatomy readability. **Scope:** exactly one gameplay source file; 0 new runtime systems.

## Install — Windows PowerShell / VS Code

1. Copy this entire `BLOB_C0C_VIS1A_DELTA` folder into your **existing** `BLOB-HOST-CORE` project root, beside `src`, `scripts`, and `package.json`. Do not unzip the entire older 3.9 MB source archive over newer work.
2. Open the PowerShell terminal **in the game root** and run:

```powershell
node BLOB_C0C_VIS1A_DELTA/apply.mjs --check
node BLOB_C0C_VIS1A_DELTA/apply.mjs --apply
node scripts/validateC0CVis1A.mjs
node scripts/testC0CVis1AThree.mjs
npm run build
node BLOB_C0C_VIS1A_DELTA/apply.mjs --check
```

The first check **must** report `TRACE1B_READY`, or `VIS1_INSTALLED` if you've already installed this exact pass. `DIFFERENT` means your source diverged: **do not force or overwrite**. The final check should report `VIS1_INSTALLED`. If validation or build fails, stop and share terminal output.

This delta contains a ready-patched source file under `payload/`, but **extraction alone does not alter game source**. The installer checks the current route's SHA-256, makes an exact backup, then installs the one replacement owner safely. It is compatible with the existing project's VIS1 backup naming and guarded patcher. It will not overwrite a modified owner.

## Test in browser

1. Restart Vite and refresh. Start REC1 with **Alt+Shift+R**.
2. In Silt, make **2–3 legitimate unseated grain releases** (grip `LT+A`; release the loose grain). Pulse alone is not a cross-region receipt.
3. Reach **Vascular without browser refresh**, observe existing membrane-fold compression and traveling-wave onset around the main current.
4. Remain there **45–75 seconds**, watch the folds recover, stop REC1 **Alt+Shift+R** and export **Alt+Shift+E**.
5. Upload the REC1 JSON plus a short video or screenshots if available; compare loaded and recovering tissue without relying on HUD numbers.

Optional analyzer:
```powershell
node scripts/analyzeC0CVis1A.mjs "ACTUAL_EXPORTED_REC1_FILENAME.json" --out C0C_VIS1_A_FIELD.json
```

## Rollback

```powershell
node BLOB_C0C_VIS1A_DELTA/apply.mjs --revert
```

Revert requires the unchanged VIS1-A file and exact source backup; it refuses to overwrite later edits. Preserve your working tree/Git checkpoint.

## Locks / limits

Silt mechanics, Silt/Vascular receipt provenance, receiver calculations, movement, targeting, three verbs, camera, Host ledger, physics, chemistry, progression and save state are unchanged. This is only a stronger visual expression of existing Vascular state. Offline owner tests and causal regressions passed in the assembled archive. The Three.js mesh smoke test and Vite build **could not be completed in this environment** because installed project npm dependencies are unavailable. Browser visibility and controller test are required before acceptance.
