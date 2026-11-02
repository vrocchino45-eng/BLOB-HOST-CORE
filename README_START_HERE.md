# BLOB — BOT1-D11H First Foothold Timing Diagnostic

**Mode:** targeted, test-only convergence diagnostic. **Gameplay files modified:** none.  
**Depends on:** installed D11B Silt shelf, D11D contact bootstrap, D11G rebased provenance repair, and D11C/D11F read-only diagnostic hook.  
**Do not install on the old, unpatched tendril owner.** D11H is designed to measure the corrected D11G owner, not replace it.

## Why this pass exists

D11G corrected off-surface Silt anchors (max observed offset about 0.13 versus 17.70 units in the earlier D11F batch), but only 3/9 natural approaches produced supported attachment. All nine observed eligible surface truth and reach initiation in the earlier 50ms recordings. We need finer timing to explain failures *before* changing the shelf or locomotion.

D11H adds a **read-only 25ms internal-state timeline** inside the existing opt-in D11C debug probe. It reads `CoreTendrilSurfaceContactSystem` phase/reach/anchor fields, `coreSurfaceTruth`, `CoreEmbodiment` contact state, support plane, and movement attachment. It does not call `beginReach`, change its return value, reposition the Core, or steer from owner data. The old D11F geometry trace remains independent evidence.

**Important measurement limit:** The trace *observes* the first transition into a reaching phase. It cannot directly capture a `beginReach` call rejected before any phase change. A 25ms sampler may also miss very short-lived transitions. D11H's categories are timing evidence, not conclusive causal attribution.

## Install in your local GitHub project (PowerShell)

Put `BLOB_BOT1_D11H_FIRST_FOOTHOLD_DIAGNOSTIC_DELTA.zip` in your **local** `BLOB-HOST-CORE` root. Avoid installing from the separate Google Drive copy.

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11H_FIRST_FOOTHOLD_DIAGNOSTIC_DELTA.zip' -DestinationPath '.' -Force
py .\D11H_APPLY.py --check
py .\D11H_APPLY.py --apply
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11h.py
```

Expected test result is `Ran 15 tests ... OK`. If preflight rejects a changed diagnostic source, **stop and provide the error**; do not force it. The patch adds only one import and an opt-in timeline collector to `src/debug/BOT1D11CDiagnosticProbe.js`, backing up the original to `D11H_BACKUP_ORIGINALS` before changing it.

## Live run

Start your normal Vite server at `http://127.0.0.1:5173`. Reuse the exact D11F bot policies to preserve comparison against D11G; these are not new input scripts.

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11f_browser.py --browser-channel chrome --headed --rounds 3 --seconds 75 --output BOT1D11H_RESULTS
```

The schedule comprises one HC positive control, nine natural Silt attempts (three per Reference/Feather/Brake policy), and one Away Control. No hidden owner data is used for navigation. Debug `Shift+6` entry remains a controlled *region entry*, not a substitute for normal world traversal.

## Referees and upload

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11f.py BOT1D11H_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11h.py BOT1D11H_RESULTS
Compress-Archive -Path '.\BOT1D11H_RESULTS\*' -DestinationPath '.\BOT1D11H_RESULTS.zip' -Force
```

Upload `BOT1D11H_RESULTS.zip`. D11F evaluates whether anchors are physically on the authored mesh. D11H distinguishes eligible/no-brush, brush/no-reach, reach/no-seal, seal/no-support, supported/no-release, and fully supported/verified release. The D11H audit file is `BOT1D11H_RESULTS/BOT1D11H_AUDIT.json`.

## Acceptance and development boundary

- All 11 recordings must contain D11C, D11F, and D11H evidence with zero capture errors and dropped REC1 details.
- HC remains a functional positive control; Away must not acquire accidental Silt support.
- Natural success means **supported attachment, valid anchored geometry, and deliberate release**. Merely reaching or momentarily attaching is insufficient.
- Distinguish causal hypotheses about contact windows and sealing from measured evidence. Even a 9/9 result is only one repeatability batch, not a final mechanical lock.
- No edits to movement, adhesion, chemistry, camera, Fold, Guide, surface network, or D11G owner are allowed in D11H.

## Revert only the D11H telemetry hook

```powershell
py .\D11H_APPLY.py --undo
```

This restores the D11C probe byte-for-byte while **retaining** D11F, D11G, and gameplay. The helper file may be left unused in the project; it is not imported after rollback.

## Files in the delta

- `D11H_APPLY.py` — guarded installer and rollback
- `src/debug/BOT1D11HFirstFootholdTimeline.js` — read-only first-contact sampler
- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1d11h.py` — independent diagnostic referee
- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/test_bot1d11h.py` — offline contract tests
- `MANIFEST_D11H.json` — scope, file list, validation summary

**Validation performed:** 15/15 D11H tests, 19/19 D11F tests, 31/31 D11E tests; JavaScript syntax; apply/undo/reapply; byte-for-byte rollback. Live D11H run is **pending**.
