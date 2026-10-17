# BLOB: HOST CORE — LS1D1D2N1 Interaction Matrix / Plate Seating

## Installation

**Changed-files overlay, NOT a standalone build. Apply on top of LS1D1D2M.** Overwrite only the paths included in this archive. Do not replace the entire game, change HC/LS1 indexed histories, or apply the deferred D2E authority guard.

### Changed source files

- `src/contact/SiltPlateSeat.js` — **new** pure one-site seat/extract relationship state.
- `src/routes/SiltPressureRouteSystem.js` — connects deliberate release, actual contact/imprint and regrip to the seat; retains same reused grain mesh at the authored plate.
- `src/routes/SiltLivingMaterialCycle.js` — permits multiple independently withheld identities (Core grip and plate site); existing callers passing `heldUnitId` alone still work.
- `src/debug/WorldObjectCensusSystem.js` — reports site relationship and seat/extract receipts in JSON.
- `docs/BLOB_INTERACTION_MATRIX_V1.md` — conceptual verb/relationship matrix with each row marked implemented or proposed.

## Goal and evidence

D2M's actual player observation confirmed **22 pressure presses, four imprints, 19 braced Pulse receipts** and improved control. The next missing relationship was **a material grain staying at the plate after the Core releases it**. D2N1 implements only this authored Silt interaction; it is not a general system of orbiting material or universal sockets.

### Specific sequence implemented

1. **LT + A** — deliberately grip an eligible Silt grain using the existing camera/selection authority.
2. Bring it into real proximity of the single garden contact patch while holding **LT / Stabilize**.
3. **X / Pulse at least twice** while touching and braced. The two qualifying presses produce D2M's threshold imprint. Free Pulse, contact pressure and control constants are unmodified.
4. **Release with A or let go of LT**, while the imprint is complete and contact is still legitimately braced. The grain seats at its **actual contact position**. It stays at the plate when the Core moves away. Site glow remains pale gold; the Core grip releases. RT withdrawal **does not** seat a grain.
5. Return to the plate, move within the original **1.6-unit** tether reach, aim at the same grain and press **LT + A** again. The grain is extracted from the site *only if the existing grip succeeds*. Use **RT** to pull it, or **X** to push as before.
6. The receiving plate accepts only **one** grain at a time. A second, unseated grain keeps its own native material cycle. A grain released before imprint is **not seated** and returns to the existing native Silt path.

## Critical authority distinctions

- **Matter and site are separate.** While seated, the identity ledger still reports owner `environment`, representation `individual`. A site occupancy record is a spatial relationship, not a new mass owner. Grip uses the original owner `grip`; release restores `environment`.
- **Same physical identity.** No clone, spawn, replacement mesh, new recipe/chemistry or Silt progression requirement. Conserved material mass remains eight units. A seated unit is withheld from the existing cycle while anchored, and is released back into its normal cycle after extraction and free release.
- **Same original motion.** Unbraced Pulse +0.28/tap, Absorb 0.72/sec, min/max radius 0.38 / 1.60, brace boundary and D2M pressure thresholds unchanged.
- **Bounded locality.** Site position persists across Silt unmount/remount **in the same runtime**. No saved-game serialization, persistent storage, cross-region physical simulation, actual collision/force, fracture, or material chemistry.
- **Not D2O trajectory memory.** An unseated grain presently returns to its scripted native cycle, *not* a new independent ballistic/native-attractor path. D2O is the isolated pass to address the user's longer-term North Star motion requirement.

## Manual acceptance / 2–3 minute field test

1. Load Silt after applying D2N1 over D2M. Start recorder **Alt+Shift+R**.
2. Verify a held grain away from the plate still responds to X and RT exactly like D2M.
3. Bring another valid grain into real plate contact; while LT holds the brace, Pulse twice. See pressure and gold imprint.
4. Release **A** while still at the plate. The grain should **stay on the plate** as the Core moves away farther than the former tether radius; tether disappears but the gold seat remains.
5. Return within 1.6, camera aim, press **LT+A**. The **same grain** should resume Core grip; its seat clears. RT withdraws it. Repeat one more time.
6. While one grain is seated, test another grain elsewhere: it must continue circulating and remain manipulable. Deliberately try pressing a second grain onto the occupied plate; it must not replace the first or create an extra mass unit.
7. Leave and revisit Silt in the same running game; check whether the seat retained its grain. Confirm standard Silt porous packet completion still works.
8. Stop with **Alt+Shift+R**; export with **Alt+Shift+E** as `BLOB_LS1D1D2N1_OBSERVATION.json`. Upload JSON and describe whether release now feels like an intentional *placement*, not a snap.

Expected recorded decisions: `silt-seat:plate-seated`, `silt-seat:plate-extracted`; `siltPlateSeat.occupied` and `unitId`; original eight material IDs/mass/ledger owner accounting. **Existing recorder contact `imprinted` may go false after Core grip releases because the retained occupancy is now in `siltPlateSeat`, not temporary `siltContact` pressure.**

## Validation

- 29 assertions: genuine original Silt grip, actual route release/reacquire, contact and visual retention, duplicate site rejection, independent unit pause, movement locks.
- 41 assertions: Silt identity ledger, LS1B lifecycle and backward compatibility, recorder site-state publication, original contact pressure rules.
- **70/70** assertions passed in isolated Node tests.
- Four modified/new JS syntax checks passed; ZIP CRC and SHA-256 are included in the separate validation summary.
- **NOT tested:** real Vite/browser/WebGL render, gamepad feel, visual visibility on the user's machine, persisted save/load, or D2O motion. Player field test required.

## Build pass rules

**Mode:** convergence / implementation proof. **Purpose:** establish one reusable grammar example where Stabilize/Pulse pressure prepares a receiving site and deliberate release seats individually conserved matter. **Allowed:** Silt site relation, dual-withheld Silt cycle, visuals and receipts, companion matrix reference. **Forbidden:** rewriting movement/targeting, environmental cycle for other regions, owner schema, chemistry or progression. **Locks:** D2I/D2M, camera, Guide, ecology, Hub/Surface. **Delete/disable:** none. **Visual:** gold persistent plate and one retained visible grain. **Acceptance:** place, leave, return, extract; **regression:** eight IDs/mass, grip and nonseated native cycle, independent unrelated verbs and Silt completion.
