# BLOB: HOST CORE — LS1D1D2J Reversible Silt Contact

## Apply
Apply this **changed-files patch over LS1D1D2I** (not a standalone game). Extract the included `src/` directory into your existing project, replacing the two listed existing files and adding one new module. Keep all other files and the historical HC/LS1 index. Do **not** apply deferred `LS1D1D2E_AUTHORITY_GUARD`.

Files:
- `src/contact/SiltCompressionContact.js` (new, pure reversible contact state)
- `src/routes/SiltPressureRouteSystem.js` (one authored garden catchment patch, contact receipts, visual pressure/echo)
- `src/debug/WorldObjectCensusSystem.js` (D2J contact telemetry export)

## Mode / purpose
**Convergence → one functional Silt interaction.** Move beyond push/pull without introducing a second chemistry or material system. The Core deliberately holds a conserved grain; an outward Pulse toward one visible sediment catchment patch loads compression. After two effective presses a temporary imprint forms. Absorb draws the grain back and relaxes that pressure; releasing the grain also clears it. A short afterimage fades. The player can repeat this with the same grain or another grain.

## Spatial scope
A single **amber-brown compression patch** sits low on the sediment bed in the existing **garden** Silt habitat (the sediment catchment/nursery). It has a subtle ring and brightens under pressure. The grain must physically approach the patch while locked; pressing elsewhere, pressing away, hitting the outer tether limit, or having a merely selected candidate **does not** load the patch. This uses proximity and an accepted kinematic Pulse displacement, **not** Three.js collision or physics force.

## Locked / forbidden changes
- Lock D2I movement feel: LT + A deliberate grip, A/LT release, initial 1.15 radius headroom, bounded Pulse push and held Absorb pull, camera-independent committed ID, existing tether/limit cues.
- Lock eight Silt grain IDs, lifecycle, `MaterialIdentityLedger` owners/mass/composition, canonical porous nutrient, existing pressure and appetite routes, objectives, chemistry, ecology, Guide, Hub/Surface crossing, and historical HC numbers.
- No new progression gates, rewards, recipes, damage, colliders, player movement, material absorption, material duplication, force physics, or persistent deformation. **Do not** infer that this is a chemistry bond or fracture.
- All existing geologic shell/banks stay visual-only. Only the new authored catchment patch responds to committed-grain proximity.

## Test / visual and feel target (2–4 minutes)
1. Use the existing Silt entry. Complete the original porous packet interaction to wake the eight-grain living cycle; this patch does not bypass the original route.
2. Start REC: **Alt + Shift + R**. Locate the low sediment bed in the **garden** lobe and the amber-brown contact patch with a thin ring.
3. Hold **LT**, aim at a moving grain, and press **A** to lock it. Move the Core and held grain toward the garden patch. Note: the grain must be close to the patch, not merely the Core.
4. Pulse **toward** the patch, and if it remains within contact range Pulse a second time. The patch should brighten/compress and show a pale temporary echo/imprint. A Pulse at max tether reach or directed away should do nothing to the patch.
5. Hold **RT** to pull the grain away. The patch should recover. Release with A or LT, then confirm the grain remains in the living Silt cycle. Try the same behavior again if desired.
6. Stop REC with **Alt + Shift + R**; export JSON with **Alt + Shift + E** as `BLOB_LS1D1D2J_OBSERVATION.json`.

If an imprint is hard to reach in this test, **do not force another input redesign**: report whether you could find the patch, maneuver the held grain near it, and get `contact-entered` / `contact-pressed` in telemetry. The spatial accessibility should be judged on actual gameplay.

## Acceptance
- A committed grain approaches one visible authored Silt patch; a real outward Pulse **toward** the patch increments reversible pressure; a second effective press forms one temporary imprint.
- Stationary/away/blocked Pulse and candidate-only inputs do not create phantom contact pressure.
- RT withdrawal, spatial separation, or grip release undoes compression and clears the imprint (short-lived visual echo may remain).
- The existing material ledger holds exactly 8 units, the grain identity and release owner survive, and old Silt pressure/packet progression still work without any new route credit.
- The JSON contains independent `silt-contact` outcomes and a final `siltContact` snapshot; no claim of collision physics or Core intake.

## Validation limits
Component bots: **136/136 checks** (52 new contact/visual/source checks; 46 D2I movement/grip regressions; 14 environmental-route checks; 24 existing recorder/ledger checks). 3/3 JavaScript syntax checks. All bot checks are source/component tests with stubbed geometry where applicable, **not a rendered game playthrough**. Source behavior is supported; spatial reachability, perceived visuals, performance, and control feel must be field tested. No test proves external ecology/Hub traversal beyond the unchanged source paths.
