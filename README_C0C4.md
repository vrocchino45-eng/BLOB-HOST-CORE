# BLOB: HOST CORE — C0C4 / Vascular-Owned C01 Accumulator Adapter

**Deliverable:** changed-files-only overlay. **Status:** OFFLINE OWNER PARITY PASS; user's local build and gameplay test PENDING.

## Purpose and scope

Integrate the existing C0C2 stateless accumulator into Vascular's LS1E2 Silt-signal receiver, as projected by C0C1/C0C4. Silt and Vascular share **mathematics only**, not identities, simulation clocks, inventories or local state. No new gameplay is introduced.

### Exactly one live code file changes

`src/routes/VascularSiltSignalReceiver.js` — imports `boundedAdd` and `boundedRecovery`, then replaces:

- Existing accepted-receipt `clamp(load + increment, 0, 0.85)` with `boundedAdd(load, increment, { lower:0, upper:0.85 })`.
- Existing mounted-only exponential recovery and small-value cutoff with `boundedRecovery(load, { dt, rate:.018, law:'exponential', maxStepSeconds:.25, lower:0, upper:.85, cutoff:.0001 })`.

**Unchanged:** every LS1E2 receipt guard (source schema, source ID, material flags, subject identity, velocity/position), ledger sequence advance, duplicate and gap accounting, the 32 recent-receipt history, flow multiplier `1-load*.085`, snapshot schema, reweaving/progression, scene and audio, region lifecycle and controls, Silt adapter, REC1 recording.

New test-only files:

- `scripts/validateC0C4Vascular.mjs` — compares full owner snapshots and unrounded state against untouched LS1E2 receiver.
- `scripts/fixtures/C0C4_VascularSiltSignalReceiver_LS1E2_REFERENCE.mjs` — SHA-verified ORIGINAL receiver copy; **not imported by game**.

Existing dependency from C0C2: `src/hostCircuit/BoundedAccumulatorBehavior.js` (not duplicated in this ZIP).

## Install safely (PowerShell from BLOB-HOST-CORE project root)

1. Commit/backup your current working project before replacing any file.
2. Check the original receiver's hash **before** extracting:

   ```powershell
   (Get-FileHash .\src\routes\VascularSiltSignalReceiver.js -Algorithm SHA256).Hash
   ```

   Expected **unchanged LS1E2** hash:

   `6705AC01FD9E0B81A361092D54437B96DDEE44F5DE92DF1CEDFF86848B00063F`

   If it does **not match**, don't overwrite. A different current receiver may contain real work. If it already matches the **new C0C4** hash in the manifest, the integration may already be installed.
3. Ensure the C0C2 utility and the accepted C0C3 Silt source are installed.
4. Extract this ZIP **to the project root**, retaining relative `src/` and `scripts/` folders. Do not extract the `src/` folder into another `src/` folder.
5. Run:

   ```powershell
   node scripts/validateC0C4Vascular.mjs
   node scripts/validateC0C3Silt.mjs
   node scripts/validateC0C2Accumulator.mjs
   npm run build
   ```

   The C0C4 output must show `OFFLINE_VASCULAR_OWNER_PARITY_PASS` with 117393 assertions. The old C0C2 validator contains a **legacy hardcoded** `kernelUnusedByGameplay: true` status line; that flag is outdated once C0C3/C0C4 use the kernel. Judge C0C2 numeric/assertion result, not that old status field.

## Short gameplay smoke test (2–4 minutes if convenient)

- Load the game normally, visit Vascular and confirm there are no runtime errors. Existing rhythm/current visuals and controls should behave like LS1E2; **no new visual feature is expected**.
- New local loads only arise from authenticated Silt-release Host receipts; a Silt contact press alone must not create remote load.
- After a new Silt release, enter Vascular without reloading. Inspect the debug receipt counter, membrane load and current multiplier. A received receipt should increment the count **once**, load should be above zero, and current multiplier below 1.0. Wait while mounted and observe load decay.
- Export REC1 JSON (`Alt+Shift+R` start/stop, `Alt+Shift+E` export). See `C0C5_PLAYTEST_CARD.md` for full acceptance test.

## Validation evidence (isolated container, not user's PC)

- Original LS1E2 class fixture SHA256 verified; modified source has only three hunk groups (one import, one add expression, one recovery expression).
- 12,397 owner snapshots compared, 117,393 assertions, 5,820 receipt probes and 6,531 recovery probes; exact comparison of unrounded pressure, state, receipt history and flow.
- Other owner validations still pass in an assembled **test project**: C0C3 36,450 assertions and C0C2 24,234 assertions. This is not a Vite/gameplay test.
- No material arrival, chemistry credit, progression alteration, save persistence, or background/off-route simulation is added or claimed.

## Rollback

Restore **only** `src/routes/VascularSiltSignalReceiver.js` from your prior Git revision/backup, preserving C0C2+C0C3. Validation and fixture files can remain; they have no runtime role. Use the new source SHA256 in `C0C4_PATCH_MANIFEST.json` to verify the applied package.

## Convergence gate

**C0C4 offline accepted; local field acceptance pending**. Before C0C5 closeout, obtain successful local commands, REC1 export of the Silt → Host → Vascular path, and a screenshot/subjective indication of membrane/current response. If gameplay diverges, stop and regress against the verified LS1E2 reference rather than layering new features.
