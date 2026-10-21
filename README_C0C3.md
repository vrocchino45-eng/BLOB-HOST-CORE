# BLOB: HOST CORE — C0C3 / Silt-Owned C01 Adapter

**Deliverable:** changed-files-only overlay. **Status:** OFFLINE PARITY PASS; local game/browser regression **NOT YET VERIFIED**.

## What changed

Only the owner `src/contact/SiltCompressionContact.js` changes in live gameplay. Its two expressions:

- accepted contact pressure: `Math.min(1, this.pressure + this.pressurePerPulse)` → `boundedAdd(this.pressure, this.pressurePerPulse, {lower:0,upper:1})`
- eligible recovery: `Math.max(0, this.pressure - seconds * (absorbHeld ? 1.4 : 0.8))` → `boundedRecovery(this.pressure, {dt:seconds,rate:absorbHeld?1.4:0.8,law:'linear',maxStepSeconds:0.1,lower:0,upper:1})`

The existing Silt class still authorizes touching/contact, Pulse direction, brace, imprint thresholds/hysteresis, grip reset, and event receipts. No runtime Host signal is produced by contact pressure alone. Nothing in Vascular, material ledger, input, camera, chemistry, audio, UI or REC1 is modified.

## Safe installation

1. In your **currently working LS1E2 + C0C-REC1 + C0C2** Git project, confirm clean/committed working state or copy the original file for rollback.
2. **BEFORE unzipping**, in PowerShell in project root:

   ```powershell
   (Get-FileHash .\src\contact\SiltCompressionContact.js -Algorithm SHA256).Hash
   ```

   Expected SHA256 for the D2M owner in the audited patch: `416CEF704A7727277FA2983FD68BFDE47741204E01648A06DF6187BDBC7E1BE2`.
   If your existing file **does not match**, **DO NOT overwrite it**: it is a divergent local version and needs a three-line integration/diff review first. The existing file may have been deliberately updated.
3. Ensure `src/hostCircuit/BoundedAccumulatorBehavior.js` from **C0C2** is present (unchanged).
4. Unzip C0C3 at the game project root, preserving directories. The class source is the only overwritten game file. The other files are a validator, read-only test fixture, and docs.
5. Run:

   ```powershell
   node scripts/validateC0C3Silt.mjs
   node scripts/validateC0C2Accumulator.mjs
   npm run build
   ```

   The first should show `OFFLINE_SILT_OWNER_PARITY_PASS`. The second should retain C0C2 parity and native owner proof. The third depends on the local installation/dependencies; **not run against the user's local tree here**.
6. Use the short field test below, then send the exported REC1 JSON (and brief comments/screenshot) before C0C4.

## Short in-game regression (Silt only, 4–7 minutes)

1. Reload the game, start REC1 (`Alt+Shift+R`), enter Silt.
2. **Negative control:** Pulse and Stabilize without holding a grain against the catchment. No `contact-pressed` or new Silt-release Host receipt should come from this alone.
3. Grip a grain with **LT+A**. Move it against the Silt catchment, optionally stabilize the contact, and Pulse *toward* the patch until `contact-pressed` and `temporary-imprint-formed` are observed. Pressure should rise in steps and saturate at 1.0.
4. Release the brace or use Absorb, then watch pressure fall and the temporary imprint relax. It must not remain permanently stamped.
5. Release the grain (or extract it if seated), confirming grip/tether/ownership behavior is unchanged. **An unseated release** may emit a Host provenance receipt; a contact press alone must not.
6. Stop REC1 (`Alt+Shift+R`) and export (`Alt+Shift+E`). Verify `droppedDetails: 0` and include any missed/accepted contact event descriptions.

**Pass conditions:** correct accepted and rejected contacts, local pressure/imprint recovery, no surprise grain creation or chemistry credit, normal grip behavior, no new Host receipt solely from pressure. **Do not require** a new visible feature: mathematical sharing should feel identical.

## Offline evidence

- Compared the **unmodified D2M SiltCompressionContact class** (test-only `scripts/fixtures/C0C3_SiltCompressionContact_D2M_REFERENCE.mjs`, SHA fixed) against the new integrated class.
- 12,144 matching owner `update()` calls; 36,450 assertions covering entire event arrays, complete snapshots, and exact scalar pressure (three distinct contact configurations; deterministic 12,000-update replay).
- Existing `node scripts/validateC0C2Accumulator.mjs`: 24,234 assertions, `OFFLINE_NUMERICAL_PASS`, native owner check `PASS` in isolated assembled test tree.
- No user browser/gameplay field validation or native Vite build performed in the isolated container.

## Rollback

Restore `src/contact/SiltCompressionContact.js` from your pre-install backup or Git (`git restore -- src/contact/SiltCompressionContact.js` **only if you have committed the original**, and you want to discard the patch). Test scripts/fixture/docs may be deleted independently. Do **not** remove C0C2's utility; it remains needed for C0C4.

## Next pass

C0C4 independently updates `src/routes/VascularSiltSignalReceiver.js` to reuse C01 while preserving receipt authority and bounded Vascular-owned membrane state. Then C0C5 repeats the two-region gameplay test.
