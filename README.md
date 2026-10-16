# BLOB: HOST CORE — LS1D1D2H Held-Material Motion

**Apply after LS1D1D2G Transaction Route Audit.** Changed-files-only ZIP; copy the `src/` folder over the current game project, preserving all other files. Restart Vite/reload the game as needed. Do NOT apply the deferred LS1D1D2E experimental authority guard.

## Exact replacements (2 files)

- `src/routes/SiltPressureRouteSystem.js`
- `src/debug/WorldObjectCensusSystem.js`

No other files are changed. **Do not delete, reset, or replace** the LS1 base project, existing patches, Hub, Surface, legacy ecology, or other routes. Historical HC build indices remain referenced.

## Mode / scope / locks

Mode: **first functional convergence of a committed Silt material target**. Only the existing Silt grip's positional offset changes.

- **Locked:** Stabilize alone is never an automatic grab; LT + A commits, A releases, releasing LT releases; aim candidate may change independently of committed object. Existing Grip Authority, Material Identity Ledger, 8-unit cycle, environmental pressure Pulse, spatial packet Absorb, chemistry, region progression and traversal are not modified.
- **Pulse:** on a fresh canonical Pulse event **while a grain was already held**, move the held grain **outward from the Core** by up to 0.28 local units, subject to the existing 1.6-unit grip limit. This is bounded kinematic displacement, **not a force/velocity impulse**. If already at outer limit, the receipt records the bound instead of inventing an effect.
- **Absorb:** while held, move the held grain **inward toward the Core** at 0.72 local units/second, clamped to 0.38 units minimum range. This does **not** consume, transfer or award material; environmental spatial Absorb continues unchanged.
- **Follow:** without Pulse or Absorb, the grain continues to follow the Core at its maintained local grip offset. Movement targets the committed ID only; it does not follow the camera candidate.
- **Release:** normal A/LT release, same material ID; material ownership returns to environment through existing ledger path. No mass creation or loss.

## Telemetry

The already-enabled **Alt+Shift+R** REC toggle and **Alt+Shift+E** export remain. Export name: `BLOB_LS1D1D2H_OBSERVATION.json`.

`frameState.siltPressureRoute.heldMaterialMotion` reports held ID, radius, Pulse count, cumulative inward motion and the latest action receipt. `transactionTrace` now contains `kind: "held-material-motion"` receipts alongside the untouched Silt environmental route receipts, including exact source Pulse event ID, accepted positional displacement or boundary rejection. Exported summary includes held material motion counts separately from force or transfer proofs.

The recorder samples every 150 ms and the route keeps only 64 bounded receipts. Small events may be dropped if sampling stalls. Neither physics impulse nor material consumption is claimed.

## Test (about 1–2 minutes)

1. Enter LS1 Silt. Hit **Alt+Shift+R once**; confirm `● REC 00:00` is visible, then release those keys.
2. Hold **LT**; aim at a glowing Silt grain and press **A once** to lock.
3. Use **Pulse** a few times. Observe an outward change in held-ball distance, up to the tether boundary.
4. Hold **RT (Absorb)** while the ball is held: observe the ball pull closer (not disappear). Rotate camera to a different grain; lock should stay on original.
5. Release with **A** or LT; confirm return to its environment behavior.
6. Stop with **Alt+Shift+R**, export with **Alt+Shift+E**, upload `BLOB_LS1D1D2H_OBSERVATION.json`.

## Acceptance / regressions

- Pulse while held changes accepted grip position outward (or explicitly reports tether boundary); no new grip is created by Pulse.
- Absorb while held changes accepted position inward without changing ownership, unit count, chemistry count or mass.
- Existing global/environmental Pulse/Absorb routes still run, Silt progression remains possible, camera candidate can change without reassigning lock, release returns ownership.
- Historic ecology and traversal are left untouched; test them in live gameplay separately if this pass appears to affect them.

## Verification

- Source syntax: `node --check` **2/2 PASS**.
- D2H Silt grip / identity / cycle / recorder component bot using real project classes and a minimal THREE math stub: **26/26 PASS**.
- Retained D2G environmental Pulse and Absorb branch tests: **14/14 PASS**.
- Retained D2F recording, grip, material identity checks: **24/24 PASS**.
- Full rendered Vite/Three playthrough: **NOT RUN**; external package dependencies unavailable.
- No physics-engine impulse, Core intake, material recipe, or Force/Transfer guarantee is claimed. The next pass can address Core intake ownership only after the appropriate Core inventory/chemistry contract is designed.
