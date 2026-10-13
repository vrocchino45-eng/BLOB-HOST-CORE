# LS1B — Build report

**Mode:** Integrated living-cycle prototype; conditional candidate for user browser acceptance. **Runtime baseline:** reconstructed source, not the user’s live Git checkout.

## Scope and ownership
- Added pure logic `SiltLivingMaterialCycle.js` as the **sole authority** for LS1B Silt’s eight finite material units, phase, mass/identity, generation, and return; no new ObjectiveSystem, GateSystem, ChemObjectSystem or TargetingSystem authority.
- Extended existing `SiltPressureRouteSystem.js` to create one pooled set of eight fixed material meshes + one reservoir stock mesh and to read the cycle every active Silt tick. All are non-targetable and parented under the existing Silt root; no new per-frame object spawning, route crossings, extra HUD prompts or global visual changes.
- Authored `livingMaterialCycle` recipe in existing `siltPressureRouteCircuit_HC012A.json`: source is the **canonical one-time yellow porous absorption**, then the separately conserved reservoir stock cycles through veins, Garden settling, paired buds, and return. `safeMatterAbsorbed` and `appetiteDrawSequence` are never reset.
- Player Pulse **near Reservoir/Veins** temporarily accelerates seep transport; Stabilize **in Garden** accelerates growth. Autonomous behavior works without either input. These influence local existing verbs; no new controls.
- Updated old LS1A and LS1A2 geometry validators to tolerate the new separately-owned finite matter system instead of insisting that every later pass must contain zero renewable material.

## Automated checks — passed
- `validateLS1BLivingSiltMaterialCycle.mjs`: 1,200s fixed-step logic run, 8 retained IDs, invariant mass=8, bounded event log, full deposition→bud→return→regeneration, 128 release events / 122 refill events, one initial activation, one Pulse event under held input, Garden Stabilize intervention, no ticking outside mounted Silt, no duplicate route credit, exact mesh-instance reuse on remount.
- `validateLS1ASiltHabitatFoundation.mjs`: movement boundary and all 3 habitat anchors / 4 connectors, existing pressure/brace/absorb/deep completion and return.
- `validateLS1A2SiltContainedGeologicMedium.mjs`: real openings, fixed geologic shapes and 96 pooled visual grains, 20-minute no-geometry-growth.
- `validateHC016VSiltSpatialExpansion.mjs`; W2B2/B3/B3.1; HXP2A1 Hub response; W2A5.4 live admission; HC031W1 HF1 target-clear; HC031U2.1 intent latch; RecipeData load; undefined-this-method audit.

## Limits / known non-gates
- No browser/GPU/controller playback in this environment. User must verify visibility/timing and perceived relationship between existing pressure lesson and new living cycle.
- `npm run build` **not certified** in the Windows-derived source archive under Linux: optional `@rollup/rollup-linux-x64-gnu` package missing; do not treat this as a code compilation success.
- Historical HC031W1 and HC031U2 validators fail on **pre-existing frozen-file hash assertions** after previous W2A/B revisions / this targeted edit; newer functional tests for their relevant behavior passed. Do not update old hashes to camouflage their historical scope.
- Only **active-cell time** is simulated. Runtime instance survives Silt unmount/remount, but browser reload/game-save persistence is not implemented. Not claiming passive ecology while outside Silt, physicized sediment or independent organisms.

## Acceptance/Regression
Accept LS1B when user sees multiple full reservoir-to-Garden cycles and at least one returning replenishment, source packet remains consumed and route still completes, movement and targeting remain correct and the new pieces do not disappear or multiply. If the matter is visually too tiny or routes unclear, adjust **Silt-only material presentation**, do not reopen W2B global grammar.
