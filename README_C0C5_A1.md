# BLOB: HOST CORE — C0C5-A1 / Automated Circuit Field Audit

**Pass:** C0C5-A1 (test-only addition). **Current gameplay baseline:** LS1E2 + REC1 + C0C2/C0C3/C0C4. **Live C0C4 field acceptance:** still pending.

## What this adds and does not add

Adds only three NEW `scripts/*.mjs` files. No edits to gameplay, no new core/host/region code, no new UI, no renderer dependency, no controller changes, no npm package changes, no migrations, no deleted files.

- `scripts/analyzeC0C5Recording.mjs`: reads a REC1 JSON and checks full event retention; source-release-to-receipt match; authenticated signal-only source constraints; Vascular receiver accepted IDs, dedupe and ordering; state bounds, flow multiplier and forbidden effects; observed post-receipt recovery; conserved Silt cycle mass when available.
- `scripts/testC0C5RecordingAudit.mjs`: deterministic synthetic positive and eight negative/missing-evidence cases. No game data copied into the package.
- `scripts/runC0C5Checks.mjs`: one command to invoke the existing C0C2/C0C3/C0C4 parity checks, audit self-test, optional REC1 recording audit, and optionally the real Vite production build.

This is a **recording verifier, not a simulated playthrough or deterministic replay**. REC1 can drop source producer-ring data before polling; events are observations, not game logic proof. A recording cannot independently attest the installed source hash or browser build. The C0C4 adapter and C0C5 gameplay still need user-side acceptance.

## Install: changed files only

1. Preserve current working tree with Git/backup. C0C2, C0C3, C0C4 and REC1 must already be installed in your **actual** game for live C0C5.
2. Extract the ZIP at the `BLOB-HOST-CORE` project root. Keep folder paths. All three scripts are new files: **do not replace any gameplay file**.
3. From a PowerShell terminal in the project root:

```powershell
node scripts/testC0C5RecordingAudit.mjs
node scripts/runC0C5Checks.mjs --build
```

Expected: C0C2 numerical, C0C3 Silt, C0C4 Vascular parity, C0C5-A1 selftest and Vite build all PASS. The runner will honestly fail when a required dependency/test script is missing. Note: pre-existing C0C2 validator prints stale `kernelUnusedByGameplay:true` (false after C0C3/C0C4 adoption)—do not use that field as proof of runtime import state.

## With a gameplay REC1 JSON (run after field test)

```powershell
node scripts/analyzeC0C5Recording.mjs ".\1BLOB_NEW_C0C4_REC1_OBSERVATION.json" --out ".\C0C5_FIELD_REPORT.json"
node scripts/runC0C5Checks.mjs --recording ".\1BLOB_NEW_C0C4_REC1_OBSERVATION.json" --build
```

Replace the example JSON name with your **real exported filename**. Paths containing spaces must be quoted.

**Statuses:**
- `OBSERVED_CHAIN_WITH_OPEN_GATES`: the recorder contains matching Silt release/Host cause/accepted Vascular receipt events with no contradictions; only evidence unavailable from a JSON export remains open (especially build revision, visual perception, or time-resolved recovery measurement).
- `INCOMPLETE_FIELD_EVIDENCE`: required observations are missing (for example, no Vascular visit); this is **not a pass or a failure**.
- `FAIL`: contradictory evidence, e.g. duplicate accepted ID, broken receipt identity, broken receiver bounds, lost details, material creation flags, or Silt cycle mass change.

Exit status: `0` on observed chain/no contradiction, `3` on incomplete field data, `2` on validation failure, `1` on malformed invocation/input. The consolidated runner uses the same policy.

## C0C5 field plan (no new feature)

1. Reload game, start REC1 with `Alt+Shift+R`. Perform a **negative control**: Pulse or press/braced-contact in Silt; **don't release a loose grain** yet. A pressure imprint does not constitute a cross-region receipt.
2. Grip a free Silt grain `LT+A`, deliberately release it **unseated**; repeat as needed. Silt `released-with-trajectory` should produce one authenticated Host cause per accepted source release.
3. Without refreshing, enter Vascular and observe `receivedTotal`, `sourceReceiptGaps`, `membraneLoad`, `directionalFlowScale`.
4. Wait 20–40 sec while Vascular is mounted and capture a before/after diagnostic screenshot. After the last receipt, load should decrease and the current multiplier approach 1.0. No requirement that reweaving percentage advance.
5. Leave/re-enter Vascular in the same runtime. Verify that previously received receipts are not applied twice. Stop REC1 `Alt+Shift+R`, export `Alt+Shift+E`.
6. Run analyzer on the export; retain screens and a note about whether membrane/current movement or audio responded *without* the HUD.

If a real new recording lacks the full receipt chain, return `INCOMPLETE` and inspect the browser path rather than adding new gameplay systems.

## Offline developer validation performed

Test workspace assembled with the **uploaded C0C2/C0C3/C0C4 overlay sources**, not a fresh copy of the user's installed complete game. All scripts executed together:

| Validator | Measured outcome |
| --- | --- |
| C0C2 | 24,234 assertions, PASS |
| C0C3 | 36,450 assertions, PASS |
| C0C4 | 117,393 assertions, PASS |
| C0C5-A1 | Positive fixture + 8 negative or missing-evidence variants, PASS |
| Historical Oct 21 C0C3 REC1 | 2,310/2,310 retained, four Host causes matched four accepted Vascular receipts, 26 checks PASS, 0 contradictory checks, 1 deliberately INCOMPLETE gate (revision/build cannot be attested from JSON) |
| Earlier C0C REC1 without Vascular visit | Correctly labelled `INCOMPLETE_FIELD_EVIDENCE`, 0 contradictory checks |

These are **tool validation samples**, not acceptance of C0C4 on the user's latest local gameplay build. No production build was performed in this isolated assembled test workspace.

## Locked systems / rollback

Locks: receiver provenance authority, Silt material lifecycle, bounded C01 behavior, Vascular clock and response, verb mapping, targeting, camera, visual/audio ownership, native progression, save scope. Forbidden: new cross-region matter transfer, source invention, phantom route credit, simulated unmounted region ticks.

Rollback: remove the three `scripts/` files; no gameplay rollback is necessary. Existing C0C2/C0C3/C0C4 scripts and runtime code remain untouched.

**Next actual pass:** C0C5 user-side live validation and capture. Only after that do we decide whether to converge on C0C-TRACE1 causal trace or expand AUTO1 beyond recording analysis.
