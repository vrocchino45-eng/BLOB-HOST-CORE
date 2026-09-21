import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { HubInvestigationGameplaySystem } from "../src/hub/HubInvestigationGameplaySystem.js";
import { GateSystem } from "../src/systems/GateSystem.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const readText = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const manifest = readJson("public/data/build/buildManifest.json");
const profile = manifest.id === "HC-014I" ? readJson("public/data/runtime/act1RuntimeProfile_HC014I.json") : manifest.id === "HC-014G" ? readJson("public/data/runtime/act1RuntimeProfile_HC014G.json") : readJson("public/data/runtime/act1RuntimeProfile_HC012C.json");
const hubRecipe = readJson("public/data/hub/hubInvestigationGameplay_HC007C.json")[0];
const gateData = readJson("public/data/gates/firstSliceGates_HC006I.json");

assert(["HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id), `Unexpected successor build ${manifest.id}`);
assert.equal(profile.id, manifest.id === "HC-014I" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014G" ? "ACT1_RUNTIME_PROFILE_HC014G" : "ACT1_RUNTIME_PROFILE_HC012C");
assert.equal(profile.pass, manifest.id === "HC-014I" ? "HC-014I" : manifest.id === "HC-014G" ? "HC-014G" : "HC-012C");
assert.equal(profile.threeRouteHubConvergence.mode, "continuous_spiral_weave");
assert.equal(profile.threeRouteHubConvergence.routeOrderIndependent, true);
assert.equal(profile.threeRouteHubConvergence.routeTriggerChecklist, false);
assert.equal(profile.threeRouteHubConvergence.oneFinalPulse, true);
assert.equal(profile.threeRouteHubConvergence.combThresholdCrossable, manifest.id === "HC-012C" ? false : true);
assert.equal(profile.threeRouteHubConvergence.newRegisteredSystemCount, 0);
assert.equal(hubRecipe.threeRouteConvergence.failurePolicy, "soft_coherence_decay_without_reset_or_restart");
assert.equal(hubRecipe.threeRouteConvergence.combThresholdCrossable, false);
if (manifest.id === "HC-012C") {
  assert.equal(gateData.some((gate) => /comb/i.test(gate.id) || /comb/i.test(gate.to)), false, "HC-012C must not add a Comb gate or destination.");
} else {
  const combEntry = gateData.find((gate) => gate.id === "hub_to_comb_threshold");
  const apertureContract = gateData.find((gate) => gate.id === "comb_threshold_to_aperture_fields");
  assert.equal(combEntry?.wakeCondition, "hubThreeRouteConvergenceCompleted");
  assert.equal(apertureContract?.playableReady, ["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id));
}

const frameState = {
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  frame: 0,
  runtimeSeconds: 0,
  currentMode: { regionId: "hub_chamber" },
  hubChamberFoundation: { active: true },
  input: { pulsePressed: false, pulseEventId: 0 },
  playerKinematics: { speed: 1 },
  physicalFeel: {},
  act1RouteHistory: {
    pass: "HC-012B",
    snapshotVersion: 1,
    routeStates: {
      grave_memory_route: { completed: true, returned: true, lastCrossingFrame: 100 },
      vascular_route: { completed: true, returned: true, lastCrossingFrame: 200 },
      silt_burrow_route: { completed: true, returned: true, lastCrossingFrame: 300 }
    },
    graveReturned: true,
    graveMemoryImprintCommitted: true,
    vascularReturned: true,
    vascularCompleted: true,
    vascularCadenceReads: 3,
    siltReturned: true,
    siltCompleted: true,
    siltPressureRead: true,
    siltRibsReleased: true,
    siltSafeMatterAbsorbed: true,
    siltDenseMatterLeftIntact: true
  }
};
const playerRoot = new THREE.Group();
const scene = new THREE.Scene();
const recipeDataSystem = {
  get(category, id) {
    assert.equal(category, "hubInvestigationGameplayRecipes");
    assert.equal(id, "HUB_INVESTIGATION_GAMEPLAY_HC007C");
    return hubRecipe;
  }
};
const system = new HubInvestigationGameplaySystem({ recipeDataSystem, scene, playerRoot, frameState });
system.init();
system.routeReads = new Set(["grave_memory_route", "vascular_route", "silt_burrow_route"]);
system.memoryRead = true;
system.returnedToCenter = true;
system.investigationReady = true;

const center = new THREE.Vector3(...hubRecipe.threeRouteConvergence.centerPosition);
const steps = 280;
for (let index = 0; index < steps; index += 1) {
  const t = index / (steps - 1);
  const angle = t * Math.PI * 2.05;
  const radius = THREE.MathUtils.lerp(2.85, 0.86, t);
  playerRoot.position.set(
    center.x + Math.cos(angle) * radius,
    center.y + Math.sin(angle) * radius,
    center.z
  );
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  frameState.input = { pulsePressed: false, pulseEventId: 0 };
  frameState.hubChamberFoundation = { active: true };
  system.update(1 / 60, frameState);
}

assert.equal(frameState.hubInvestigationGameplay.threeRouteConvergence.available, true);
assert.equal(frameState.hubInvestigationGameplay.threeRouteConvergence.started, true);
assert.ok(frameState.hubInvestigationGameplay.threeRouteConvergence.orbitProgress >= 1);
assert.ok(frameState.hubInvestigationGameplay.threeRouteConvergence.compressionProgress >= 0.82);
assert.equal(frameState.hubInvestigationGameplay.threeRouteConvergence.readyForPulse, true);
assert.equal(frameState.hubInvestigationGameplay.threeRouteConvergence.routeTriggerChecklist, false);

frameState.frame += 1;
frameState.input = { pulsePressed: true, pulseEventId: 1 };
frameState.hubChamberFoundation = { active: true };
system.update(1 / 60, frameState);
assert.equal(frameState.hubInvestigationGameplay.threeRouteConvergence.completed, true);
assert.equal(frameState.hubInvestigationGameplay.threeRouteConvergence.combwardBodyReadable, true);
assert.equal(frameState.hubInvestigationGameplay.threeRouteConvergence.combThresholdCrossable, false);
assert.equal(frameState.hubInvestigationGameplay.threeRouteConvergence.directGateMutation, false);
assert.equal(frameState.hubInvestigationGameplay.threeRouteConvergence.directObjectiveMutation, false);

const gateRegistry = { list: () => [] };
const gateSystem = new GateSystem({ gateRegistry, frameState });
gateSystem.update(0, frameState);
assert.equal(frameState.act1RouteHistory.hubThreeRouteConvergenceCompleted, true);
assert.equal(frameState.act1RouteHistory.hubCombwardBodyReadable, true);
assert.equal(frameState.act1RouteHistory.combThresholdCrossable, false);
assert.deepEqual(frameState.act1RouteHistory.hubThreeRouteConvergenceRouteOrder, [
  "grave_memory_route",
  "vascular_route",
  "silt_burrow_route"
]);

const snapshot = gateSystem.createHistorySnapshot(frameState);
const restored = { buildId: "HC-012C" };
gateSystem.restoreHistory(snapshot, restored);
assert.equal(restored.act1RouteHistory.hubThreeRouteConvergenceCompleted, true);
assert.equal(restored.act1RouteHistory.hubCombwardBodyReadable, true);
assert.equal(restored.act1RouteHistory.combThresholdCrossable, false);
assert.deepEqual(restored.act1RouteHistory.hubThreeRouteConvergenceRouteOrder, snapshot.hubThreeRouteConvergenceRouteOrder);

// Prove the other valid post-Grave route order converges to the same sealed state.
const alternateOrderFrame = {
  buildId: "HC-012C",
  frame: 901,
  hubInvestigationGameplay: {
    threeRouteConvergence: { completed: true, completionFrame: 901 }
  },
  act1RouteHistory: {
    pass: "HC-012B",
    snapshotVersion: 1,
    routeStates: {
      grave_memory_route: { completed: true, returned: true, lastCrossingFrame: 100 },
      silt_burrow_route: { completed: true, returned: true, lastCrossingFrame: 200 },
      vascular_route: { completed: true, returned: true, lastCrossingFrame: 300 }
    }
  }
};
const alternateOrderGateSystem = new GateSystem({ gateRegistry, frameState: alternateOrderFrame });
alternateOrderGateSystem.update(0, alternateOrderFrame);
assert.equal(alternateOrderFrame.act1RouteHistory.hubThreeRouteConvergenceCompleted, true);
assert.equal(alternateOrderFrame.act1RouteHistory.hubCombwardBodyReadable, true);
assert.equal(alternateOrderFrame.act1RouteHistory.combThresholdCrossable, false);
assert.deepEqual(alternateOrderFrame.act1RouteHistory.hubThreeRouteConvergenceRouteOrder, [
  "grave_memory_route",
  "silt_burrow_route",
  "vascular_route"
]);

const hubSource = readText("src/hub/HubChamberFoundationSystem.js");
assert.match(hubSource, /hub_three_route_convergence_HC012C/);
assert.match(hubSource, /hub_combward_sealed_body_HC012C/);
assert.match(hubSource, manifest.id === "HC-012C" ? /combThresholdCrossable: false/ : /combThresholdCrossable: Boolean\(thresholds\[0\]\?\.crossable\)/);
assert.match(hubSource, /convergenceTendrilCount/);
if (manifest.id === "HC-012C") assert.doesNotMatch(hubSource, /hub_to_comb_threshold/);
else assert.match(hubSource, /hub_to_comb_threshold/);

const gameSource = readText("src/hub/HubInvestigationGameplaySystem.js");
assert.match(gameSource, /continuous_spiral_weave/);
assert.match(gameSource, /routeTriggerChecklist: false/);
assert.match(gameSource, /oneFinalPulse: true/);
assert.match(gameSource, /directGateMutation: false/);
assert.match(gameSource, /directObjectiveMutation: false/);

console.log("HC-012C three-route Hub convergence validation passed.");
