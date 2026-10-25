# BLOB: HOST CORE — C0D4-OBS1 (Recorder Coverage)

**Mode:** observation-only circuit convergence. Requires **C0D3-C** installed and working (C0D1-C / C0D2 / C0D3-A/B/C sequence), with the standard C0C-REC1 recorder. Does not introduce new gameplay behavior.

## Install on Windows

Extract the `BLOB_C0D4_OBS1_DELTA` folder beside `src` and `package.json` in your existing BLOB-HOST-CORE project. In VS Code PowerShell from the project root:

```powershell
node BLOB_C0D4_OBS1_DELTA/apply.mjs --check
node BLOB_C0D4_OBS1_DELTA/apply.mjs --apply
node BLOB_C0D4_OBS1_DELTA/validate.mjs
node scripts/validateC0CRecorderFullSession.mjs
npm run build
```

First check must be `C0D3C_READY`. If it says `DIFFERENT`, **stop**. Installer verifies both file hashes and both packaged payloads before writing, keeps originals in `BLOB_C0D4_OBS1_DELTA/backups`, refuses mixed/divergent source, and permits safe rollback:

```powershell
node BLOB_C0D4_OBS1_DELTA/apply.mjs --revert
```

Only **two source files** change: `src/debug/WorldObjectCensusSystem.js` (read-only observations), `src/core/GameRuntime.js` (provides the existing Host ledger to the recorder). The source modules governing Silt, Vascular, Grave I, Grave II, Host receipt authentication, controls, player movement, chemistry, and progression are all untouched. Only commit those two intentional source changes; installer assets/backups are deployment material and need not be committed.

## What the recorder adds

The original C0C-REC1 export **filename, revision, schema version 2, hotkeys and legacy summaries are retained**. Additive `circuitObservationRevision: "C0D4-OBS1"` and `summary.circuit` identify the new observations. `summary.circuit.finalState` reports the final published states and Host channel counters.

New append-only, change-based event types:

- `c0d4-circuit-baseline` and `c0d4-active-cell-change`
- `c0d4-host-vascular-effect` and `c0d4-host-grave-ii-outcome`, with genuine Host record IDs and parent relationship when available
- `c0d4-host-receipt-gap` for missing/pruned Host records; missing facts are not reconstructed
- `c0d4-grave-i-change` and `c0d4-grave-memory-change` (read count, completion, imported effects, memory pressure, eligible recovery consequence)
- `c0d4-grave-ii-change` (changed layout **separate from** three-landmark resolution and credit)
- `c0d4-silt-feedback-change` (Grave II receipt and the actual compression target)
- `c0d4-host-vascular-channel-change` and `c0d4-host-grave-channel-change` (Host accepted/rejected/duplicate totals)

The recorder **does not** simulate regions while unmounted, infer control actions from raw button presses, or claim grain/material transfer between cells. Full REC1 chronology continues to be appended; sampling remains 150 ms and source ring pruning may still conceal upstream events.

## C0D4 field acceptance — two short tests

**A. Clean path**: New game runtime. Start REC with `Alt+Shift+R`; visit Grave I before Vascular; confirm Grave memory has no authenticated Vascular effect. Stop REC with `Alt+Shift+R` and export JSON with `Alt+Shift+E`. This is the zero-history control.

**B. Connected path**: Fresh game runtime. Start REC. In Silt make one to three deliberate **unseated** grain releases; visit Vascular in the same runtime and let it respond; visit Grave I, read/stabilize and complete the existing route; leave and **return** to Grave II and resolve its existing three-landmark resonance. Return to completed Silt, and observe its pressure settling. End REC and export. Stay below approximately **25 minutes of video per upload** if recording video. If progression stalls, export a **partial** REC1 and note where.

**Do not reload the page** between cells; Host memories are runtime-local. This is not a new shortcut, completion credit, or tuning pass. No video is required for installation; gameplay acceptance is pending.

## Acceptance and failure conditions

1. Every Silt parent is a legitimate disturbance; Vascular applied effect becomes a distinct Host receipt.
2. Grave I only consumes eligible applied effects while mounted and never repeats credits on return.
3. Grave II *layout active* may be observed without a completed resonance challenge; never conflate them.
4. Grave II's Host completion outcome must be genuine, singular and lineage-preserving when the upstream parent was retained.
5. Silt consumes the eligible Grave II outcome once; the target stays bounded. No new material or progression credit.
6. A missing event must appear as missing/gap, never silently invented. Export alone cannot prove that normal play achieved a completion not recorded.

**Validation boundary:** offline tests confirm wiring and recorder logic, not Vite or browser traversal. Windows `npm run build` and the actual playtest remain user-side checks.
