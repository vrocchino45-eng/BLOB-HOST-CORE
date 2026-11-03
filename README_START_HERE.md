# BLOB — BOT1-D11L Release Gate & Input Ownership (diagnostic-only)

This pass **does not** change PlayerMovementController, CoreTendrilSurfaceContactSystem, adhesion, authored geometry, or bot steering.

## Prerequisites

Existing installed BOT1-D11C + D11F + D11H + D11I diagnostics, D11K test harness (including its D11E/D11F dependencies), D11G anchor-provenance repair and D11J handoff owner. Vite / Playwright Chrome setup remains as before.

## What D11L records

- The **actual owner's** per-update computed `attachmentReleaseTension` (outward intent), `attachmentPeelHoldAge`, `attachmentReleaseArmed`, attachment strength/authority, and detachment reason.
- The owner's normalized camera-relative `intent` vector and raw movement input.
- The movement owner's candidate surface/owner/tendril/boundary normals and their derived dot products. **These candidates do not prove which normal the owner selected for each update**, because `activeContactNormal` is local inside the owner method. The actual owner-computed away-intent scalar remains definitive.
- A runtime signature check for the expected release threshold `0.50 + strength * 0.08` and required hold `0.11 + strength * 0.035`. Model explanation is enabled only when these strings and related semantics match the live method. Signature confirmation is NOT byte-hash verification.
- D11K's existing owner events and D11F true-mesh anchor measurements.

Observer attaches only when the D11C probe is enabled using `?bot1d11c=1` in development, wraps the owner's method without altering its return value, arguments or gameplay state, and restores the original wrapper when stopped.

## Install in repository root

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11L_RELEASE_GATE_DIAGNOSTIC_DELTA.zip' -DestinationPath '.' -Force
py .\D11L_APPLY.py --check
py .\D11L_APPLY.py --apply
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11l.py
node .\scripts\testBOT1D11LOwnerProbe.mjs
```

If the probe version differs from D11I, the installer refuses to patch. **Do not force the install.** A backup + checksummed manifest are created. Undo before other edits with `py .\D11L_APPLY.py --undo`. Other diagnostic patch installers may refuse to undo out of order.

## Source-owner identity check

The source used to derive the model in the D11K audit is a historical extracted `PlayerMovementController.js`. It is **not** claimed to match your live working tree. The D11L observer performs a limited runtime method-signature check and sets `modelVerified=false` if it no longer recognizes the expected release rule. For manual verification:

```powershell
Get-FileHash .\src\player\PlayerMovementController.js -Algorithm SHA256
```

Compare against any source you intentionally identify as current; do not overwrite the owner simply to match an older hash.

## Run Vite at http://127.0.0.1:5173 then run

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11l_browser.py --browser-channel chrome --headed --rounds 2 --seconds 75 --output BOT1D11L_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11l.py BOT1D11L_RESULTS
Compress-Archive -Path '.\BOT1D11L_RESULTS\*' -DestinationPath '.\BOT1D11L_RESULTS.zip' -Force
```

Upload `BOT1D11L_RESULTS.zip` for comparison. D11L reuses D11K's **16 fixed-input test routes** (including HC and Away), not a surface-normal driven bot. Reference / Feather remain unchanged. Nonattached trials do not count as release successes/failures. A full D10B Fold regression is still required before LS1 lock.

## Constraints and interpretation

- **Real events:** D11I owner reach/seal/attachment events; D11L owner-method computed away-intent/peel age; D11F mesh geometry.
- **Derived interpretations:** D11L modeled threshold categories, candidate-normal dot products, D11I brushing gate guesses. Do not conflate diagnostic categories with code-issued refusal reasons.
- The recorder limits frames to 9,500 per run and **explicitly invalidates** the test if overflow occurs. Do not silently drop records.
- If the owner's function signature doesn't match known semantics, the analyzer reports an unverified model instead of assuming thresholds. In that case use source inspection; do not tune physics based on guesses.
- D11G and D11J remain experimental; zero geometry warnings and clean owner traces are necessary but not sufficient for cross-region lock.
