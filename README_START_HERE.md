# BLOB: HOST CORE — D11G Rebased Owner Repair (CRLF)

**This package replaces the blocked D11G installer, not the game.** The earlier D11G install stopped on a hash guard because the active `CoreTendrilSurfaceContactSystem.js` uses CRLF line endings. Diffing all **909 logical lines** against the supplied BOT0 source showed no JavaScript differences. This package applies the **same 11 targeted D11G repair edits** to the exact user-uploaded version, preserving CRLF, with its own backup and hash guards.

**Prerequisites:** The current local source must still match SHA-256 `510ca8a4b114530001d5b4f5948a65d6e4c0aa1462bc989c0091d4448068c6a8`. D11B Silt shelf, D11D contact bootstrap, D11C and D11F diagnostics are assumed in place. Do not replace the current owner with an HC archive copy. No need to run the old `D11G_APPLY.py`.

## Install — from BLOB-HOST-CORE project root in PowerShell

Place `BLOB_BOT1_D11G_REBASED_OWNER_DELTA.zip` in the project root, then:

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11G_REBASED_OWNER_DELTA.zip' -DestinationPath '.' -Force
py .\D11G_REBASE_APPLY.py --check
py .\D11G_REBASE_APPLY.py --apply
node .\scripts\testBOT1D11GAnchorProvenance.mjs
```

Expected offline result: `BOT1-D11G: 10 owner-level behavior checks passed (offline only).` 

The patch touches only `src/player/CoreTendrilSurfaceContactSystem.js`. The new installer does **not** overwrite any old `D11G_BACKUP_ORIGINALS` folders. It creates and retains its own `D11G_REBASE_BACKUP_ORIGINALS` for undo.

## Live proof — same D11F policies

With Vite running (`http://127.0.0.1:5173`):

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11f_browser.py --browser-channel chrome --headed --rounds 3 --seconds 75 --output BOT1D11G_REBASE_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11f.py BOT1D11G_REBASE_RESULTS
Compress-Archive -Path '.\BOT1D11G_REBASE_RESULTS\*' -DestinationPath '.\BOT1D11G_REBASE_RESULTS.zip' -Force
```

Upload `BOT1D11G_REBASE_RESULTS.zip`. The offline checks **do not** certify live geometry. Compare 9 natural Silt attempts with HC positive and Away control. Passing requires sustained valid authored anchors, on-surface offsets at or below the diagnostic 0.35-unit warning threshold, no fabricated distant anchors, and deliberate release. The same run can still fail because an anchor is missing, support is lost, or live geometry doesn't cover the desired stride. Such failures are evidence for a future scoped repair, not grounds to restore boundary fallback.

## Revert this candidate

```powershell
py .\D11G_REBASE_APPLY.py --undo
```

This reverts the current source **only if** it is still byte-for-byte equal to the patched file; otherwise it refuses to overwrite subsequent work. Backup evidence is retained. Do not reapply without first archiving the retained backup directory.

## Ownership / limits

- Repair: `CoreTendrilSurfaceContactSystem.js` only (11 guarded edits).
- Frozen: `PlayerMovementController`, D11D `CoreEmbodimentSystem` bootstrap, Silt geometry, chemistry, Guide, Fold and bot policies.
- Geometry truth remains the referee: a carried surface ID isn't proof of a physical anchor.
- Earlier D11F findings remain unresolved until live runs show valid anchor provenance and support.
