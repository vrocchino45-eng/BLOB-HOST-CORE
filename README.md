# BLOB HOST CORE — LS1E1T Targeting/ Stabilize Camera Wiring Repair

**Apply over LS1E1R**. This overlay has **one changed gameplay source file** (`src/core/GameRuntime.js`) plus a source regression checker and README. Do not replace the full project or delete any files.

## Player-observed failure / verified cause

The LS1E1 observation capture reports 22 Stabilize starts but no candidate or locked Silt grain, no contact/grips, and no free grain releases. Environmental Silt pressure and porous-packet actions still function.

LS1E1 / LS1E1R constructed `SiltPressureRouteSystem` without its `camera` dependency. In `SiltPressureRouteSystem.update...`, grain candidate selection is explicitly gated on `aiming && this.camera`; with undefined camera it can never select a candidate or display an aim marker. This makes the LT+A grip impossible even when gamepad events arrive. **Stabilize the world and Stabilize a held grain are distinct paths.**

## Change

- `src/core/GameRuntime.js`: restores **`camera: this.camera`** to the one `new SiltPressureRouteSystem({ ... })` registration, matching the previously working camera-targeting contract.
- No targeting thresholds, distances, motion response, Silt ownership ledger, trajectories, plate, Vascular/Host bridge, recorder, Core controls, or other behavior changed.

## Install and prove

1. Extract the ZIP over the current **LS1E1R** project folder, preserving `src/core/GameRuntime.js` path.
2. Hard-refresh browser (or restart Vite). Ensure no old module remains cached.
3. In Silt, aim the camera at a nearby eligible grain while holding **LT / Stabilize**. It should show the target marker and a non-null candidate ID.
4. While still aiming, press **A** to grip. Release deliberately with **A** or by letting go of LT; observe independent trajectory. Previously proven plate interaction should still work.
5. Press **Alt+Shift+R** for REC, test the area, stop with the same shortcut, and export via **Alt+Shift+E**. Upload `BLOB_LS1E1_OBSERVATION.json`.
6. Review recording: expect non-null candidate, owner changes into grip, Silt release events and Host receipt; Silt-to-Vascular signal is the next verification, not proven by this patch.

## Source checks and limitations

Run `node scripts/validateLS1E1T.mjs` from project root. The checker isolates Silt wiring, ensures camera guards remain in the Silt route, verifies essential Host/recorder wiring remains, and verifies camera object created before route initialization.

**Not claimed:** complete Vite/WebGL/browser game runtime test or player-visible acquisition. Those still require the above field test. This fixes the confirmed constructor dependency regression only.
