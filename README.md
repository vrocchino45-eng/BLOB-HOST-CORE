# BLOB: HOST CORE — LS1D1D2P1 / Existing Three-Habitat Trajectory Proof

**Changed-files diagnostic overlay. Not a complete game. Install directly over D2O1.**

## Mode and purpose

**Convergence / audit pass.** D2O1 motion and D2N1V visible seating are player-accepted provisional mechanics. This pass asks whether the same altered free-grain trajectory ever enters another **existing** connected Silt habitat, rather than assuming a larger world or tuning the North Star spring without evidence.

There are already three authored, connected LS1A Silt habitats:
- **Garden** (sediment catchment and plate), around `[-5.35, -0.74, -10.4]`, ellipsoid radii `[3.15, 2.35, 3.3]`.
- **Reservoir** (porous compression zone), around `[1.1, -0.43, -12.2]`, radii `[3.35, 2.0, 3.4]`.
- **Veins** (exchange/return flow), around `[5.8, -0.62, -16.2]`, radii `[2.85, 2.2, 3.25]`.

The connecting **passages** classify as `between` unless inside one of those ellipsoids. Labels are observations, **not** collision boundaries or geography/phase authorities. These positions are from the existing LS1A Silt recipe; this patch does not change them.

## Changed files

- `src/contact/SiltTrajectoryFieldProbe.js` — **NEW** small read-only habitat travel probe for at most eight known free grains, sampled at most every 250 ms. Records first observed free position, maximum distance traveled relative to that sample, maximum native-path error, which authored habitat volumes were entered, and crossing counts. Historical observations remain after pickup/seating, but `currentlyFree` becomes false.
- `src/routes/SiltPressureRouteSystem.js` — **CHANGED** constructs the probe, samples after D2O1 motion is advanced, publishes `siltTrajectoryField` alongside existing state. The native path, spring/drag, Pulse/Absorb bounds, plate seat and visual rendering are unmodified.
- `src/debug/WorldObjectCensusSystem.js` — **CHANGED** captures read-only field data in `authoritySnapshot`, records sparse milestone receipts, and includes `summary.siltTrajectoryField`. Export renamed to `BLOB_LS1D1D2P1_OBSERVATION.json`.

## Locked / forbidden

**Locked:** eight unit identity/mass and individual meshes; LS1B ecology clock and native phase paths; D2O1 spring 0.44, drag 0.74, max speed 2.1, max acceleration 1.8; D2M/D2I hold/move/pressure; D2N1V wireframe plate; route progression; Core, Guide, camera, input, regional boundaries.

**Forbidden / not included:** modifying movement constraints; adding a new habitat; recoloring/repositioning material; changing material phase eligibility; introducing collision impulses, force, chemistry, spawn/consumption or long-distance save persistence; beginning off-route simulation; generalized multiple receiving sites.

**Delete/disable:** none. Don't install older deferred experimental authority-guard patch.

## Playtest: 4–6 minutes, no special new controls

1. Apply over D2O1; open the same Silt space. Start capture: **Alt + Shift + R**.
2. In Garden, grip a free circulating grain (**LT + A**), Pulse/Absorb it away from its usual route, and release **without seating**. Give it 10–20 seconds while observing its motion.
3. Use the existing path toward **Reservoir**, and later **Veins**, to see whether that grain or another disturbed grain actually wanders between cavities. The Core may traverse; the grain does not automatically follow the Core and no cross-habitat travel is guaranteed. If it returns to native circulation before reaching another cavity, that is valuable negative evidence.
4. Seat a different grain at the Garden plate, fly away, and return. Confirm visually that the wireframe-attached grain stays in place; deliberately retrieve it if desired.
5. Stop capture: **Alt + Shift + R**. Export: **Alt + Shift + E**. Upload `BLOB_LS1D1D2P1_OBSERVATION.json` with a short observation: did any grain seem to reach a different habitat, or did it return before leaving the originating cavity?

## Acceptance / interpretation

- `summary.siltTrajectoryField.finalState` lists `habitatCrossings`, `traveledThreeUnits` and per-grain `visitedHabitats`, `currentHabitat`, `currentlyFree`, `maximumReleaseDistance`, `maximumNativeError`.
- A field **crossing** counts only after the same grain is observed inside a *different authored habitat* from its last known habitat. `between` is deliberately not counted as a fourth habitat.
- `traveledThreeUnits` is a coarse metric of distance between the initial **sampled** free position and later positions, **not** distance along the whole path or physics energy.
- The free-grain movement, original native paths, and plate seat must look and work exactly as in D2O1/D2N1V; moving the player toward another habitat must not automatically drag free grains along.
- At export material ledger must still conserve eight grains. There must be no chemistry or route-credit transfer due to the field probe.
- If no crossings occur, do **not** invent an expansion or declare movement broken. We have proved only the current amplitude/reach under the chosen player actions, and may subsequently design a separate larger/longer drift field pass.

## Limitations

At most 250-ms sampling can miss a very fast brief habitat entry. The route-local free-grain state does not advance while Silt is hidden; the probe is not a global world-space material agent. Ellipsoids approximate authored cavities and do not encode the full connecting corridor geometry. Multiple releases of the same ID share cumulative history relative to the first sampled free position. The probe does not infer actual rendered visibility, collision/contact, or force.

## Checks

25 focused Node unit/integration assertions pass, including three real LS1A habitat labels, exclusion of passages, deduplicated crossings, negative evidence, eight-unit cap, historical `currentlyFree` cleanup, read-only authority flags, source hook ordering, and export wiring. JS syntax checks pass. A source diff audit confirms only the described insertions versus the D2O1 overlay. Full rendered Vite/browser regression and extended playtime validation have **not** been run here.

**Next decision:** If crossings are measured and visible, keep current North Star values and choose a second *different* receiving-surface interaction from the original verb matrix. If crossings are rarely achieved, define a separated D2Q field-scale physics/geometry trial using live evidence, not automatic retuning in D2P1.
