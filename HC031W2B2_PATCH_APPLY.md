# HC-031W2B2 — Pulse/Sonar Spatial Reveal — Patch Apply

## Base
Apply this changed-files-only patch **over HC-031W2B1.1 — Camera-Relative Hierarchy Balance**.

Do not apply it directly to HC-031W2B1 or an older W2A build. B1.1 is now the locked static depth-hierarchy parent.

## Apply
1. Stop the Vite dev server.
2. Copy this patch's `src/` and `scripts/` folders into the project root, preserving paths and overwriting the matching files.
3. Restart Vite.
4. Hard refresh / open a fresh game tab.

## Test
Run about **4–6 minutes** through Surface Wake -> Scar/Guide -> Hub. Use several quick Pulses and at least two repeated Pulses on the same nearby object. If practical, include one charged/deep Pulse.

Primary evidence: gameplay video. Secondary evidence: Shift+T JSON.

Acceptance: Pulse should read as **emit -> contact/local contour -> directional return**, with near actionable anatomy resolving more completely than distant structure. Repeated reads should add structural information rather than simply make the same cage brighter. The B1.1 static depth hierarchy must remain intact between pulses.

## Locked
No Pulse range/power change, no targeting/controller change, no movement, camera, chemistry, progression, route, static hierarchy, geometry-budget, or W2A timing changes.
