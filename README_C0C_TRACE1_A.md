# BLOB: HOST CORE — C0C-TRACE1-A
## Read-only cause → receipt → owner → presentation-source wiring

**Pass mode:** Observability / convergence. **Status:** OFFLINE TESTED; browser playtest NOT claimed.

### Purpose

Give every accepted Silt release a traceable ID through the existing Host provenance ledger into Vascular's receiving state, and identify which **existing** Vascular presentation source expressions consume that state. We do **not** add gameplay, visuals, audio, chemistry, progression, or material transport in this pass.

### Install (changed files only)

Extract the ZIP at the root of your existing BLOB-HOST-CORE checkout. Only new paths are added:

- `scripts/traceC0CCircuit.mjs` — read-only trace + optional source signature scan
- `scripts/testC0CTrace.mjs` — deterministic offline failure fixtures
- `reports/C0C_TRACE1_A_FIELD_TRACE.json` — a reference report generated from the October 21 C0C5 REC1 capture (not a complete recording)
- `README_C0C_TRACE1_A.md`, `C0C_TRACE1_A_TEST_REPORT.md`, `C0C_TRACE1_A_PATCH_MANIFEST.json`

**No existing files or gameplay modules are replaced. No deletions.**

### Run in VS Code PowerShell

```powershell
node scripts/testC0CTrace.mjs --source=src/routes/VascularRhythmRouteSystem.js
node scripts/traceC0CCircuit.mjs "1BLOB_C0C5_REC1_OBSERVATION.json" --source src/routes/VascularRhythmRouteSystem.js --out C0C_TRACE1_A_RUN.json
```

Change the recording path to wherever your JSON export is saved. `--source` verifies that the expected expressions **exist** in your installed Vascular source; omit it when that file is unavailable. `--out` saves a full per-cause JSON trace; without it the command prints a compact summary.

Exit codes: `0` = observed chain with no contradictions; `3` = incomplete evidence; `2` = contradiction; `1` = invalid input/path.

### What the October 21 field recording shows

- **5** actual Silt release decisions, **5** Host cause receipts, **5** Vascular accepted receipts.
- Every cause matches a released Silt grain, keeps the original receipt ID, and occurs before its receiver event.
- All 5 receipts were consumed on Vascular arrival at approximately **03:18** into the recording, raising load to **0.85**.
- Final owner load **0.1528**, current multiplier **0.987**, reflecting subsequent relaxation (not a captured continuous decay curve).
- Presentation source audit finds existing coupling to current strength, current motes, vessel envelope emissive + opacity, and braid emissive. These are **source expressions, not proof the user saw them**.

### Existing visual sensitivity, not an animation spec

The current source gives a receiving load capped at **0.85**:

| Sink | Source-coupled behavior | Peak mathematical sensitivity |
|---|---|---|
| Core current force | base flow multiplied by `(1 - 0.085 * load)` | up to **7.225% reduction** |
| Moving current motes | same multiplier | up to **7.225% reduction** |
| Vessel opacity | `+ 0.048 * load` | up to **+0.0408 opacity units** |
| Vessel emissive intensity | `+ load * (0.17 + 0.075 * sin(...))` | roughly **+0.0808 to +0.2083** intensity units |
| Braid emissive intensity | `+ load * (0.12 + 0.035 * sin(...))` | roughly **+0.0723 to +0.1318** intensity units |

These terms coexist with other animated inputs, so **they may not be perceptually distinguishable**. This agrees with the C0C5 player report. Treat these calculations as known source coupling, not a visual acceptance pass.

### Locked / forbidden

- Keep LS1E2 Host receipts signal-only: **no physical Silt grain transfer**, no new mass, no chemistry transfer, no route credit.
- Preserve the working C0C2/C0C3/C0C4 accumulator ownership and REC1 capture behavior.
- Don't change directional current strength, targeting, controller controls, rendering, sound or camera in TRACE1-A.
- No new `Host` authoritative state introduced by this inspection tool.

### Acceptance and regression

- `node scripts/testC0CTrace.mjs ...` passes all deterministic fixtures, including malformed receipt identity, duplicate/out-of-range checks and missing Vascular observations.
- Latest C0C5 recording returns `OBSERVED_CHAIN`, five matching chains, no contradictions.
- Earlier Silt-only recording without Vascular receiver returns `EVIDENCE_INCOMPLETE`, not a false positive.
- Static source scan reports `SOURCE_SIGNALS_FOUND` for the audited LS1E2 Vascular system. If your local code differs, it reports `SOURCE_RECONCILIATION_NEEDED` instead of silently assuming the wiring.
- As **no gameplay files are touched**, existing C0C2–C0C5 checks and the previous Vite build remain the gameplay baseline. Rerun them only if installed code is changed separately.

### Next dependency

**TRACE1-B** should add a strictly read-only, rate-limited observer of *actual runtime* owner load and world-presented parameters (if direct proof is needed) before VIS1 modifies any visual response. VIS1 will still need a human-visible field test. Do not equate provenance receipts, inferred mathematical output, and observed pixels.
