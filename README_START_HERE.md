# BLOB: HOST CORE — BOT1-D11J Support-Preserving First Foothold

**Mode:** guarded experimental single-owner patch + conservative live referee.  
**Baseline:** D11G *rebased* tendril owner (CRLF). D11D contact bootstrap, D11B Silt shelf, D11F geometry probe, and D11I event observer remain installed.  
**Scope:** only `src/player/CoreTendrilSurfaceContactSystem.js` is modified by the installer. No movement-controller, chemistry, material, surface geometry, or bot steering changes.

## Why this exists

D11I showed that all 12 natural tests reached/sealed an initial Silt anchor, then a pressure-driven peel began ~2–3 ms after attachment. Four runs lost support before a replacement anchor was ready. D11G previously eliminated false geometry-boundary footholds; that protection must remain in place.

D11J guards **ordinary pressure-driven stepping** so a valid sealed support is not peeled before *another* sealed, authored, locally reachable support exists. Reaching/peeling tendrils do not count as replacement support. Normal outward-input release, contact-state release, and D11G no-truth overextension release are untouched. The alternate-support check is a conservative **owner-state and reach-envelope check**; the independent D11F mesh audit is still required to prove geometry.

## Installation (project root, PowerShell)

Put the ZIP in the project root (same folder as `src` and `BLOB_BOT1_REAL_INPUT_HARNESS`).

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11J_FIRST_FOOTHOLD_HANDOFF_DELTA.zip' -DestinationPath '.' -Force

py .\D11J_APPLY.py --check
py .\D11J_APPLY.py --apply
node .\scripts\testBOT1D11JSupportHandoff.mjs
node .\scripts\testBOT1D11GAnchorProvenance.mjs
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_analyze_bot1d11j.py
```

The installer verifies the **exact** D11G rebased owner SHA-256 and the patched output SHA. If your current file has changed, it **stops**. Do not bypass it or replace the owner with an old HC source. Upload the current owner to rebase.

`D11J_BACKUP_ORIGINALS/` contains the prepatch byte-identical source plus an install record. A second apply is harmless and reports already installed. Older HC historical validator failures from hardcoded build names are not addressed by D11J.

## Live mobility test

Keep the D11B surface, D11D bootstrap, D11C hook, D11F geometric inspector, D11H first-foothold probe and D11I owner-event observer installed. The live referee needs both geometry and owner events. Start Vite at `http://127.0.0.1:5173`.

Reuse the frozen input policies from D11F (no new bot navigation logic):

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11f_browser.py --browser-channel chrome --headed --rounds 3 --seconds 75 --output BOT1D11J_RESULTS

py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11f.py BOT1D11J_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11h.py BOT1D11J_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11j.py BOT1D11J_RESULTS

Compress-Archive -Path '.\BOT1D11J_RESULTS\*' -DestinationPath '.\BOT1D11J_RESULTS.zip' -Force
```

**Upload `BOT1D11J_RESULTS.zip`.** The analyzer will intentionally report a nonzero exit code if the full live acceptance gate fails; keep the results and upload them anyway.

The planned live matrix is 11 independent runs: Reference, Feather, and Brake (3 each), plus one HC Positive and one Away Control. The D11J referee expects `D11C_TRACE.json` with `firstFootholdEvents` revision `BOT1-D11I-1`, plus a D11F audit. It checks for any early solo pressure peel, real owner attachment/release, and the independent geometric support gate. If the event hook is missing, it refuses to pass the run rather than assuming no peel occurred.

**The pass is not certified until these live results arrive.** The temporary repair could reduce contact loss or expose a different bottleneck; do not expand Silt surfaces yet. D10B Fold regression must be preserved before promotion to a stable checkpoint.

## Undo (before making other edits to the owner)

```powershell
py .\D11J_APPLY.py --undo
```

Undo is guarded. If the owner has been edited since D11J installation, rollback refuses to overwrite the newer work. The installer does **not** remove D11G, D11D, or the instrumentation.

## Package contents

- `D11J_APPLY.py` — guarded CRLF-preserving single-owner installer and rollback
- `D11J_PATCH_OPERATIONS.json` — exact source/target hashes and three scoped edits
- `scripts/testBOT1D11JSupportHandoff.mjs` — 15 deterministic owner-level tests
- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1d11j.py` — conservative live referee
- `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/test_analyze_bot1d11j.py` — 7 referee tests
- `MANIFEST_D11J.json` — source and verification manifest

No full 1500+ file snapshot. No game binaries or gameplay data changes.
