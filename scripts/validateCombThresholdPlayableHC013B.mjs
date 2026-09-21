import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { CombThresholdPlayableSystem } from "../src/thresholds/CombThresholdPlayableSystem.js";
import { ObjectiveSystem } from "../src/systems/ObjectiveSystem.js";
import { GateSystem } from "../src/systems/GateSystem.js";

const root = process.cwd();
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const readText = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
const profile = manifest.id === "HC-014I" ? readJson("public/data/runtime/act1RuntimeProfile_HC014I.json") : manifest.id === "HC-014G" ? readJson("public/data/runtime/act1RuntimeProfile_HC014G.json") : readJson("public/data/runtime/act1RuntimeProfile_HC013C.json");
const foundation = readJson("public/data/thresholds/combThresholdFoundation_HC013A.json");
const recipe = readJson("public/data/thresholds/combThresholdPlayable_HC013B.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const objectives = readJson("public/data/objectives/firstSliceObjectives_HC006I.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const pkg = readJson("package.json");

assert.ok(["HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
assert.ok(["0.0.131", "0.0.132", "0.0.133", "0.0.134", "0.0.135", "0.0.136", "0.0.137", "0.0.138", "0.0.139", "0.0.140", "0.0.142"].includes(manifest.version));
assert.ok(["0.0.131", "0.0.132", "0.0.133", "0.0.134", "0.0.135", "0.0.136", "0.0.137", "0.0.138", "0.0.139", "0.0.140", "0.0.142"].includes(pkg.version));
assert.ok(["ACT1_RUNTIME_PROFILE_HC013B", "ACT1_RUNTIME_PROFILE_HC013C", "ACT1_RUNTIME_PROFILE_HC013D", "ACT1_RUNTIME_PROFILE_HC014A", "ACT1_RUNTIME_PROFILE_HC014B", "ACT1_RUNTIME_PROFILE_HC014C", "ACT1_RUNTIME_PROFILE_HC014D", "ACT1_RUNTIME_PROFILE_HC014E", "ACT1_RUNTIME_PROFILE_HC014F", "ACT1_RUNTIME_PROFILE_HC014G"].includes(profile.id));
assert.ok(["HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(profile.pass));
assert.equal(profile.referenceBuild, ["HC-014G", "HC-014I"].includes(manifest.id) ? "HC-014E" : "HC-013A");
assert.equal(profile.regions.comb_threshold.gameplayOwner, "CombThresholdPlayableSystem");
assert.deepEqual(profile.regions.comb_threshold.systemIds, ["combThresholdFoundationSystem", "combThresholdPlayableSystem"]);
assert.equal(profile.regions.comb_threshold.activeUpdateBudget, 8);
assert.equal(profile.combThresholdFoundation.recipeId, foundation.id);
assert.equal(profile.combThresholdPlayable.recipeId, recipe.id);
assert.equal(profile.combThresholdPlayable.requiredFilterReads, 6);
assert.equal(profile.combThresholdPlayable.oneFinalPulse, true);
assert.equal(profile.combThresholdPlayable.mistakesResetRun, false);
assert.equal(profile.combThresholdPlayable.apertureDestinationMounted, ["HC-014A","HC-014B","HC-014C","HC-014D","HC-014E","HC-014F","HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(profile.combThresholdPlayable.apertureCrossable, ["HC-014A","HC-014B","HC-014C","HC-014D","HC-014E","HC-014F","HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(profile.combThresholdPlayable.newRegisteredSystemCount, 1);

assert.equal(recipe.id, "COMB_THRESHOLD_PLAYABLE_PROOF_HC013B");
assert.equal(recipe.interaction.filterBandZ.length, 6);
assert.equal(recipe.interaction.requiredFilterReads, 6);
assert.equal(recipe.interaction.stabilizeRequiredForRead, true);
assert.equal(recipe.interaction.centeredMovementRequiredForRead, true);
assert.equal(recipe.interaction.cadenceWindowRequiredForRead, true);
assert.equal(recipe.interaction.mistakesResetRun, false);
assert.equal(recipe.interaction.hardMovementGate, false);
assert.equal(recipe.completion.firstFieldReveal, true);
assert.equal(recipe.completion.apertureDestinationMounted, false);
assert.equal(recipe.completion.apertureCrossable, false);
for (const key of ["newAbilityUnlocks", "newEntities", "newBaseVerbs"]) assert.equal(recipe.constraints[key], 0);
for (const key of ["directObjectiveMutation", "directGateMutation", "directActiveCellMutation", "forcedPlayerRelocation", "apertureFieldsImplemented", "hardFailureRestart"]) assert.equal(recipe.constraints[key], false);

const combRegion = regions.find((entry) => entry.id === "comb_threshold");
const combObjective = objectives.find((entry) => entry.id === "comb_threshold_playable_synthesis");
const apertureGate = gates.find((entry) => entry.id === "comb_threshold_to_aperture_fields");
assert.equal(combRegion.objective, combObjective.id);
assert.ok(["ACT1_RUNTIME_PROFILE_HC013B", "ACT1_RUNTIME_PROFILE_HC013C", "ACT1_RUNTIME_PROFILE_HC013D", "ACT1_RUNTIME_PROFILE_HC014A", "ACT1_RUNTIME_PROFILE_HC014B", "ACT1_RUNTIME_PROFILE_HC014C", "ACT1_RUNTIME_PROFILE_HC014D", "ACT1_RUNTIME_PROFILE_HC014D", "ACT1_RUNTIME_PROFILE_HC014E", "ACT1_RUNTIME_PROFILE_HC014F", "ACT1_RUNTIME_PROFILE_HC014G"].includes(combRegion.runtimeMountProfile));
assert.equal(combObjective.implementationStatus, "playable_synthesis_complete_first_field_reveal_only_HC013B");
assert.equal(apertureGate.playableReady, ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id) ? true : false);
assert.equal(apertureGate.runtimeCompatibilityDestination, "CELL_APERTURE_FIELDS_ARRIVAL_001");
assert.equal(regions.some((entry) => entry.id === "aperture_fields"), ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));

const makeFrame = () => ({
  buildId: "HC-013B",
  buildManifest: manifest,
  activeCellId: "CELL_COMB_THRESHOLD_FILTER_001",
  frame: 1,
  input: { pulsePressed: false, pulseEventId: 0, stabilizeHeld: false },
  combThresholdFoundation: {
    active: true,
    entryPosition: { x: 0, y: 0, z: 0 },
    apertureDestinationMounted: false,
    apertureCrossable: false
  },
  act1RouteHistory: {
    hubThreeRouteConvergenceCompleted: true,
    combEntered: true,
    routeStates: {}
  }
});

const recipeDataSystem = { data: { combThresholdPlayable: recipe } };
const playerRoot = new THREE.Object3D();
const frame = makeFrame();
const system = new CombThresholdPlayableSystem({ recipeDataSystem, playerRoot, frameState: frame });
system.init();

const pulseAt = (z, eventId, { centered = true, stabilized = true, open = true } = {}) => {
  playerRoot.position.set(centered ? 0 : 1.5, 0, z);
  system.elapsed = open ? 0 : recipe.interaction.cadencePeriodSeconds * 0.5;
  frame.frame += 1;
  frame.input = { pulsePressed: true, pulseEventId: eventId, stabilizeHeld: stabilized };
  system.update(0.001, frame);
  frame.input = { pulsePressed: false, pulseEventId: eventId, stabilizeHeld: stabilized };
};

// A mistake is recoverable and cannot invent a completed read.
pulseAt(recipe.interaction.filterBandZ[0], 1, { centered: false, stabilized: false, open: false });
assert.equal(frame.combThresholdPlayable.successfulFilterReads, 0);
assert(frame.combThresholdPlayable.coherence >= recipe.interaction.minimumCoherenceAfterError);
assert.equal(frame.combThresholdPlayable.failureRecoverable, true);
assert.equal(frame.combThresholdPlayable.hardRestart, false);

for (let index = 0; index < recipe.interaction.filterBandZ.length; index += 1) {
  pulseAt(recipe.interaction.filterBandZ[index], index + 2);
  assert.equal(frame.combThresholdPlayable.completedBands[index], true);
  assert.equal(frame.combThresholdPlayable.successfulFilterReads, index + 1);
}
assert.equal(frame.combThresholdPlayable.successfulFilterReads, 6);
const readsBeforeMiss = frame.combThresholdPlayable.successfulFilterReads;
pulseAt(recipe.interaction.finalSealZ, 20, { centered: true, stabilized: false, open: true });
assert.equal(frame.combThresholdPlayable.successfulFilterReads, readsBeforeMiss, "final-read miss must not erase earned bands");
assert.equal(frame.combThresholdPlayable.challengeComplete, false);

playerRoot.position.set(0, 0, recipe.interaction.finalSealZ);
frame.input = { pulsePressed: false, pulseEventId: 20, stabilizeHeld: true };
frame.frame += 1;
system.update((recipe.interaction.finalMembraneStabilizeSeconds ?? 0.55) + 0.02, frame);
pulseAt(recipe.interaction.finalSealZ, 21, { centered: true, stabilized: true, open: true });
assert.equal(frame.combThresholdPlayable.challengeComplete, true);
assert.equal(frame.combThresholdPlayable.apertureCrossable, false);
frame.input = { pulsePressed: false, pulseEventId: 21, stabilizeHeld: true };
frame.frame += 1;
system.update(recipe.interaction.finalRevealSeconds, frame);
assert.equal(frame.combThresholdPlayable.completed, true);
assert.equal(frame.combThresholdPlayable.apertureRevealWitnessed, true);
assert.equal(frame.combThresholdPlayable.apertureDestinationMounted, false);
assert.equal(frame.combThresholdPlayable.apertureGameplayReady, false);
assert.equal(frame.combThresholdPlayable.apertureCrossable, false);

const objectiveRegistry = {
  getByRegionId: (id) => id === "comb_threshold" ? combObjective : null
};
const regionRegistry = {
  getByRuntimeCellId: (id) => id === "CELL_COMB_THRESHOLD_FILTER_001" ? combRegion : null
};
const objectiveSystem = new ObjectiveSystem({ objectiveRegistry, regionRegistry, frameState: frame });
objectiveSystem.update(0, frame);
assert.equal(frame.firstSliceObjectives.comb_threshold_playable_synthesis.complete, true);
assert.equal(frame.objectiveState.complete, true);
assert.equal(frame.objectiveState.stepState.aperture_destination_remains_unmounted, true);

const gateRegistry = { list: () => [] };
const gateSystem = new GateSystem({ gateRegistry, frameState: frame, regionRegistry, runtimeProfile: profile });
gateSystem.update(0, frame);
assert.equal(frame.act1RouteHistory.combThresholdPlayableCompleted, true);
assert.equal(frame.act1RouteHistory.combThresholdFilterReads, 6);
assert.equal(frame.act1RouteHistory.apertureFirstFieldRevealWitnessed, true);
assert.equal(frame.act1RouteHistory.apertureCrossable, ["HC-014A","HC-014B","HC-014C","HC-014D","HC-014E","HC-014F","HC-014G", "HC-014I"].includes(manifest.id));
const snapshot = gateSystem.createHistorySnapshot(frame);
const restoredFrame = { buildId: "HC-013B" };
gateSystem.restoreHistory(snapshot, restoredFrame);
assert.equal(restoredFrame.act1RouteHistory.combThresholdPlayableCompleted, true);
assert.equal(restoredFrame.act1RouteHistory.combThresholdFilterReads, 6);
assert.equal(restoredFrame.act1RouteHistory.apertureFirstFieldRevealWitnessed, true);
assert.equal(restoredFrame.act1RouteHistory.apertureDestinationMounted, ["HC-014A","HC-014B","HC-014C","HC-014D","HC-014E","HC-014F","HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(restoredFrame.act1RouteHistory.apertureCrossable, ["HC-014A","HC-014B","HC-014C","HC-014D","HC-014E","HC-014F","HC-014G", "HC-014I"].includes(manifest.id));

const gameplaySource = readText("src/thresholds/CombThresholdPlayableSystem.js");
const foundationSource = readText("src/thresholds/CombThresholdFoundationSystem.js");
const runtimeSource = readText("src/core/GameRuntime.js");
assert.match(runtimeSource, /combThresholdPlayableSystem/);
assert.match(runtimeSource, /new CombThresholdPlayableSystem/);
assert.match(foundationSource, /completedBands/);
assert.match(foundationSource, /apertureRevealProgress/);
assert.doesNotMatch(gameplaySource, /frameState\.activeCellId\s*=/);
assert.doesNotMatch(gameplaySource, /frameState\.firstSliceObjectives\s*=/);
assert.doesNotMatch(gameplaySource, /frameState\.firstSliceGates\s*=/);
assert.doesNotMatch(gameplaySource, /playerRoot\.position\.(copy|set)\(/);

console.log("HC-013B Comb Threshold playable proof validation passed.");
