# BLOB — C0D3-C: Grave II completion returns to Silt pressure

**Required exact source:** C0D3-B (on top of C0D3-A, C0D2, C0D1-C/B/A).

## Changed gameplay files

- `src/routes/SiltPressureRouteSystem.js` (one existing owner only)
- No Host, Grave, Vascular, material registry, runtime orchestration, controller, or camera source is modified in this pass.

## Gameplay contract

- On an **active Silt visit**, Silt reads the Host ledger's already-authenticated Grave II completion receipt. It does **not** infer success from merely returning to Grave II or from a text/UI flag.
- **One receipt can be used once for the runtime**, including repeat frames and unmount/remount. Only the first accepted Grave II completion in this runtime changes Silt. No off-route Silt simulation.
- The three authentic Grave II completion types provide three small, fixed adjustments to **the existing completed-Silt compression settling target**:
  - `quiet_retention`: target goes from 0.100 to **0.082**
  - `shared_memory`: target **0.072**
  - `held_contradiction`: target **0.060**
- Original exponential compression settling rate (`1 - exp(-dt * 1.7)`) is unchanged. Without a Grave II outcome, the original target of 0.100 stays exact.
- **Uncompleted Silt**, existing appetite/pressure-rib objectives, failure state, material behavior and all completion gates keep their original values and guards. Once the Silt passage is already released, the returned Host outcome is interpreted as a slightly more relaxed local pressure equilibrium; this may indirectly change derived local pressure feel because compression is already an input to that existing feel computation.
- Adds a read-only `frameState.siltPressureRoute.graveIIPressureFeedback` diagnostic object for telemetry.
- No new physical transport, completion credit, sound, visual assets, progression shortcuts, save persistence, or global simulation.

## Install — VS Code / PowerShell

Extract **`BLOB_C0D3C_DELTA`** to your `BLOB-HOST-CORE` project root, next to `src` and `package.json`. Run from the project root:

```powershell
node BLOB_C0D3C_DELTA/apply.mjs --check
node BLOB_C0D3C_DELTA/apply.mjs --apply
node BLOB_C0D3C_DELTA/validate.mjs
npm run build
```

`--check` must say **`C0D3B_READY`**. If it says `DIFFERENT`, stop, do not force-install; upload a current Git/source ZIP or the file for reconciliation. `C0D3C_INSTALLED` means it's already applied. Installer keeps an exact backup in the delta's `backups/` folder.

## Rollback

```powershell
node BLOB_C0D3C_DELTA/apply.mjs --revert
```

Revert refuses if current source or backup differs from the recorded SHA-256 values. Does not touch other gameplay files.

## Offline validation / limits

- **369 test assertions**, authentic Host receipts from three separate actual Grave II resonance outcomes (`GraveResonanceGameplaySystem.update()`), with optional Vascular ancestry verified in the shared-memory case; tested no receipt/off-route guard/idempotence/remount/legacy uncompleted-Silt targets/settling equation unchanged.
- **C0D3-B** relay validator (62 assertions), existing C0C2 accumulator (24,234), C0C3 contact regression (~36K), and REC1 (5/5) passed in the development source.
- Earlier C0D2 validation hardcodes a **pre-C0D3-B Host ledger hash**, so that historical hash assertion correctly rejects the newer ledger file. The newer C0D3-B relay regression passes.
- This environment lacks the Vite/Three dependencies needed for a production build or rendered browser gameplay. Run `npm run build` and eventually record an actual Silt → Vascular → Grave I → Grave II → Silt visit; check `graveIIPressureFeedback.receiptId` and compare `compression` before/after. A completed Grave II resolution is mandatory; entering the transformed space alone will not count.

## Milestone boundary

C0D3-C proves one full **authenticated functional feedback loop** in offline code. It does **not** prove visible feedback, the complete browser traversal, or general-purpose circulation physics. Those require a focused C0D4 browser/circuit acceptance pass, not speculative expansion.
