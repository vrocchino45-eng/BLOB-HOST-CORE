# BLOB: HOST CORE — C0C2 C01 Stateless Accumulator Parity

**Deliverable:** changed-files-only ZIP; **mode:** convergence / mathematical foundation; **pass:** C0C2.

## What this does

Adds an **owner-neutral pure math helper** (`src/hostCircuit/BoundedAccumulatorBehavior.js`) plus an offline parity validator (`scripts/validateC0C2Accumulator.mjs`). It does **not** connect the helper to any live gameplay owner yet. There is **no visible or playable change** by design.

Next passes migrate one owner at a time: C0C3 Silt contact, C0C4 Vascular receiver, C0C5 real two-region field regression. Do not skip those gates or call this a working new circuit engine.

## Install on Windows

1. Preserve your current **LS1E2 + C0C-REC1** working folder; optional: make a backup or git commit.
2. Unzip this archive into that folder **preserving folder paths**. It creates two files. It does not overwrite existing owner, recorder, camera or visual code.
3. Open the Vite project's root in PowerShell / VS Code terminal and run:

   ```powershell
   node scripts/validateC0C2Accumulator.mjs
   ```

4. Look for `result: OFFLINE_NUMERICAL_PASS` and ideally `ownerProof: PASS` if both region source classes are present. If the owner files are missing, **stop before implementing C0C3/C0C4** and reconcile the worktree; the validator will say `UNVERIFIED`.
5. Optionally run `npm run build` to confirm normal project compilation still succeeds. Test actual controls only if you want an extra safety check; C0C2 does not touch them.

## Owned source equations used for parity

- Silt native owner: `src/contact/SiltCompressionContact.js` from the D2M overlay. On an accepted contact Pulse, `pressure := min(1,pressure+0.42)`. When eligible to recover, `pressure := max(0,pressure-min(max(dt,0),0.1)*(absorbHeld?1.4:0.8))`. Grip release resets pressure in the **owner**.
- Vascular native owner: `src/routes/VascularSiltSignalReceiver.js` from LS1E2. On an authenticated receipt, increment `0.14 + 0.055*clamp(norm(releaseVelocity)/2.5,0,1)`, saturate load at `0.85`. On mounted update, decay `load*exp(-min(dt,0.25)*0.018)`, clamp, then set to zero if `<0.0001`. Flow multiplier stays `1 - membraneLoad*0.085` **in the owner**.
- These are *independent* regional instances with different eligibility and provenance. Silt contact pressure does **not** directly create Vascular receipts. Unseated deliberate grain release does.

## Numerical proof performed with this package

`node scripts/validateC0C2Accumulator.mjs` was run in an isolated ESM test tree alongside *actual audited source files* `SiltCompressionContact.js` and `VascularSiltSignalReceiver.js` extracted from their previous build overlays.

- **24,234 assertions PASS**, including exact expected saturation, linear and exponential recovery, invalid/negative dt, invalid configuration rejection and a seeded 12,000-step two-owner mathematical replay.
- Native-source contract checks include Silt contact presses, imprint formation, release reset, Vascular receipt acceptance, duplicate suppression, forged receipt rejection, decay and flow multiplier.
- `node --check` passes for both new files.

**Not claimed:** newest user working folder visually tested, latest git commit reconciled, browser game regression run, C0C3/C0C4 wired, shell/motor/Guide/trace integration complete.

## Source inventory caveat

The available full `BLOB-HOST-CORE (2).zip` baseline predates certain LS1 overlays; the authoritative contact class resides in `BLOB_LS1D1D2M_CONTACT_PULSE_ARBITRATION_CHANGED_FILES.zip`, and the receiver in `BLOB_LS1E2_FIRST_FUNCTIONAL_VASCULAR_RECEIVER_CHANGED_FILES.zip`. Current live gameplay and REC1 JSON demonstrate the behavior, **not** that a partial reconstructed source tree is the exact user's installed tree. Check files locally before later integration.

## Files in this ZIP

- **NEW** `src/hostCircuit/BoundedAccumulatorBehavior.js`: stateless saturated scalar add and owner-selected recovery law.
- **NEW** `scripts/validateC0C2Accumulator.mjs`: reference equations, stress parity, optional native-source tests.
- **DOC** `README_C0C2.md`, `C0C2_PASS_REPORT.md`, `C0C2_PATCH_MANIFEST.json`.
- **MODIFIED:** none. **DELETED/DISABLED:** none.

## What to test in the game when C0C3 and C0C4 ship

1. Fresh reload, start REC1; in Silt, Pulse/Stabilize **without a grain release**; source receipt count should not increase.
2. Grip one grain LT+A, press it against catchment using Stabilize + directed Pulse; verify compress/recover/imprint/relax. Source release receipt does **not** arise from this press alone.
3. Release an unseated held grain deliberately; verify a source Host receipt and original Silt ownership conservation.
4. Visit Vascular without reloading; accepted receipt count increases once and load/flow changes while mounted. Wait 20–40 seconds and observe recovery.
5. Export `Alt+Shift+E`; verify REC1 zero discarded details, screenshot Vascular receiver and report visual feel.

**No need to repeat this test for C0C2 alone**, because the kernel is intentionally not imported by gameplay systems.

## Rollback

Delete only `src/hostCircuit/BoundedAccumulatorBehavior.js` and `scripts/validateC0C2Accumulator.mjs` (if you installed them from this patch). No preexisting files were overwritten.
