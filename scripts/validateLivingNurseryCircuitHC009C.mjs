import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { SurfaceWakeGameplaySystem } from "../src/opening/SurfaceWakeGameplaySystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const readText = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateLivingNurseryCircuitHC009C] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const profile = readJson(
  manifest.id === "HC-014D"

    ? "public/data/runtime/act1RuntimeProfile_HC014D.json"

    : manifest.id === "HC-014C"

    ? "public/data/runtime/act1RuntimeProfile_HC014C.json"
    : manifest.id === "HC-014B"
    ? "public/data/runtime/act1RuntimeProfile_HC014B.json"
    : manifest.id === "HC-014A"
    ? "public/data/runtime/act1RuntimeProfile_HC014A.json"
    : manifest.id === "HC-013D"
    ? "public/data/runtime/act1RuntimeProfile_HC013D.json"
    : manifest.id === "HC-013C"
      ? "public/data/runtime/act1RuntimeProfile_HC013C.json"
      : manifest.id === "HC-013B"
    ? "public/data/runtime/act1RuntimeProfile_HC013B.json"
    : manifest.id === "HC-013A"
    ? "public/data/runtime/act1RuntimeProfile_HC013A.json"
    : manifest.id === "HC-012C"
    ? "public/data/runtime/act1RuntimeProfile_HC012C.json"
    : manifest.id === "HC-012B"
    ? "public/data/runtime/act1RuntimeProfile_HC012B.json"
    : manifest.id === "HC-012A"
    ? "public/data/runtime/act1RuntimeProfile_HC012A.json"
    : manifest.id === "HC-011B"
    ? "public/data/runtime/act1RuntimeProfile_HC011B.json"
    : manifest.id === "HC-011A1"
    ? "public/data/runtime/act1RuntimeProfile_HC011A1.json"
    : manifest.id === "HC-011A"
    ? "public/data/runtime/act1RuntimeProfile_HC011A.json"
    : manifest.id === "HC-010G"
    ? "public/data/runtime/act1RuntimeProfile_HC010G.json"
    : manifest.id === "HC-010F"
    ? "public/data/runtime/act1RuntimeProfile_HC010F.json"
    : manifest.id === "HC-010E"
    ? "public/data/runtime/act1RuntimeProfile_HC010E.json"
    : manifest.id === "HC-010D"
    ? "public/data/runtime/act1RuntimeProfile_HC010D.json"
    : manifest.id === "HC-010C"
    ? "public/data/runtime/act1RuntimeProfile_HC010C.json"
    : manifest.id === "HC-010B"
    ? "public/data/runtime/act1RuntimeProfile_HC010B.json"
    : manifest.id === "HC-010A"
    ? "public/data/runtime/act1RuntimeProfile_HC010A.json"
    : manifest.id === "HC-009G"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009G.json"
    : manifest.id === "HC-009F"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009F.json"
    : manifest.id === "HC-009E"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009E.json"
    : manifest.id === "HC-009D"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009D.json"
    : "public/data/runtime/firstSliceRuntimeProfile_HC009B.json"
);
const gameplayRecipe = readJson("public/data/opening/surfaceWakeGameplayRecipes.json")[0];
const circuitRecipe = readJson("public/data/opening/surfaceWakeLivingCircuit_HC009C.json");

assert(
  (((manifest.id === "HC-009C" && manifest.version === "0.0.112")
  || (manifest.id === "HC-009D" && manifest.version === "0.0.113")
  || (manifest.id === "HC-009E" && manifest.version === "0.0.114")
  || (manifest.id === "HC-009F" && manifest.version === "0.0.115")
  || (manifest.id === "HC-009G" && manifest.version === "0.0.116")
  || (manifest.id === "HC-010A" && manifest.version === "0.0.117")
  || (manifest.id === "HC-010B" && manifest.version === "0.0.118")
  || (manifest.id === "HC-010C" && manifest.version === "0.0.119")
  || (manifest.id === "HC-010D" && manifest.version === "0.0.120")
  || (manifest.id === "HC-010E" && manifest.version === "0.0.121")
  || (manifest.id === "HC-010F" && manifest.version === "0.0.122")
  || (manifest.id === "HC-010G" && manifest.version === "0.0.123")
  || (manifest.id === "HC-011A" && manifest.version === "0.0.124")
  || (manifest.id === "HC-011A1" && manifest.version === "0.0.125")
  || (manifest.id === "HC-011B" && manifest.version === "0.0.126")
  || (manifest.id === "HC-012A" && manifest.version === "0.0.127")
  || (manifest.id === "HC-012B" && manifest.version === "0.0.128")
  || (manifest.id === "HC-012C" && manifest.version === "0.0.129")
  || (manifest.id === "HC-013A" && manifest.version === "0.0.130")
  || (manifest.id === "HC-013B" && manifest.version === "0.0.131")
  || ((manifest.id === "HC-013C" && manifest.version === "0.0.132") || (manifest.id === "HC-013D" && manifest.version === "0.0.133") || (manifest.id === "HC-014A" && manifest.version === "0.0.134") || (manifest.id === "HC-014B" && manifest.version === "0.0.135") || (manifest.id === "HC-014D" && manifest.version === "0.0.137") || (manifest.id === "HC-014C" && manifest.version === "0.0.136") || (manifest.id === "HC-014D" && manifest.version === "0.0.137") || (manifest.id === "HC-014C" && manifest.version === "0.0.136"))) || (manifest.id === "HC-014G" && manifest.version === "0.0.140") || (manifest.id === "HC-014I" && manifest.version === "0.0.142")),
  "manifest identity mismatch"
);
assert(pkg.version === manifest.version, "package identity mismatch");
assert(circuitRecipe.id === "SURFACE_WAKE_LIVING_NURSERY_CIRCUIT_HC009C", "living circuit recipe missing");
assert(circuitRecipe.authority.gameplayOwner === "SurfaceWakeGameplaySystem", "gameplay authority changed");
assert(circuitRecipe.constraints.addsEntity === false, "circuit added an entity");
assert(circuitRecipe.constraints.changesFoldRequirements === false, "circuit changed Fold requirements");
assert(profile.regions.surface_wake.activeUpdateBudget === 15, "Surface mount budget changed");
assert(
  profile.firstSlicePath
    .map((regionId) => profile.regions[regionId]?.activeUpdateBudget)
    .join("|") === "15|13|8",
  "first-slice mount budgets changed"
);
assert(profile.dormantCompatibilitySystemIds.length === 20, "compatibility archive size changed");

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);

const makeObject = (id, position = [0, 0, 0]) => {
  const objectRoot = new THREE.Group();
  objectRoot.name = id;
  objectRoot.position.set(...position);
  objectRoot.add(new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.18, 0),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x111111 })
  ));
  scene.add(objectRoot);
  return {
    recipe: { id, spawn: { scale: 1 } },
    root: objectRoot,
    absorbed: false
  };
};

const objects = [
  makeObject("flux_current_ribbon_001", [0, 0, 0]),
  makeObject("scar_contamination_plate_001", [2, -0.8, -1]),
  makeObject("signal_vapor_thread_001", [-1, 1, -2]),
  makeObject("surface_wake_membrane_mote_001"),
  makeObject("surface_wake_membrane_mote_002"),
  makeObject("surface_wake_membrane_mote_003")
];
makeObject("nursery_membrane_tender_001", [1.72, 0.96, -1.48]);
makeObject("membrane_watcher_001", [-2.85, 2.18, -2.45]);

const recipeDataSystem = {
  data: { surfaceWakeLivingCircuit: circuitRecipe },
  get(category, id) {
    assert(category === "surfaceWakeGameplayRecipes" && id === gameplayRecipe.id, "unexpected recipe request");
    return gameplayRecipe;
  }
};
const chemObjectSystem = { objects };
const frameState = {
  frame: 0,
  runtimeSeconds: 0,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  input: {
    pulsePressed: false,
    pulseEventId: 0,
    absorbHeld: false,
    stabilizeHeld: false
  },
  pulse: { affectedObjects: [] },
  playerComposition: { scar: 0.02 },
  physicalFeel: {}
};

const system = new SurfaceWakeGameplaySystem({
  recipeDataSystem,
  chemObjectSystem,
  scene,
  playerRoot,
  frameState
});
system.init();

const tick = (dt) => {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  system.update(dt, frameState);
};
const moveToPacket = () => {
  if (system.packetActive) playerRoot.position.copy(system.packetRoot.position);
};
const pulsePacket = () => {
  moveToPacket();
  frameState.input.pulsePressed = true;
  frameState.input.pulseEventId += 1;
  tick(1 / 60);
  frameState.input.pulsePressed = false;
};

tick(circuitRecipe.cycle.initialDelaySeconds + 0.01);
assert(frameState.nurseryCircuit.packetActive, "first matter packet did not enter the current");
assert(frameState.nurseryCircuit.matterType === "clean_nutrient_cluster", "first packet is not authored clean nourishment");
assert(scene.getObjectByName("surface_wake_current_carried_matter_packet"), "packet has no embodied world object");
assert(!scene.getObjectByName("living_circuit_readability_ring"), "object-defining circuit ring returned");

pulsePacket();
assert(frameState.nurseryCircuit.packetIdentified, "Pulse did not let the Watcher identify matter");
system.packetProgress = 0.995;
tick(0.1);
assert(frameState.nurseryCircuit.lastOutcome === "tender_fed_clean_matter", "clean matter did not feed the Tender");
assert(frameState.nurseryCircuit.tenderFedCount === 1, "Tender food state was not retained");
assert(frameState.nurseryCircuit.foldInvitation, "successful nursery intervention did not reveal the existing Fold");
assert(!frameState.nurseryCircuit.directTriggerCompletion, "living circuit directly completed the Fold");
assert(!frameState.nurseryCircuit.directSeedAbsorption, "living circuit absorbed the protected seed");
assert(!frameState.nurseryCircuit.directMorphActivation, "living circuit started the morph");

tick(circuitRecipe.cycle.restSeconds + 0.01);
assert(frameState.nurseryCircuit.matterType === "scar_touched_cluster", "second authored packet is not scar-touched matter");
pulsePacket();
system.packetProgress = 0.995;
tick(0.1);
assert(frameState.nurseryCircuit.lastOutcome === "tender_strained_scar_spread", "untreated contamination did not strain the Tender");
assert(frameState.nurseryCircuit.failedCycleCount === 1, "failure state was not retained");
const strainedIntegrity = frameState.nurseryCircuit.tenderIntegrity;
const raisedScarLoad = frameState.nurseryCircuit.scarLoad;

tick(circuitRecipe.cycle.restSeconds + 0.01);
assert(frameState.nurseryCircuit.matterType === "mixed_membrane_cluster", "third authored packet is not mixed recoverable matter");
pulsePacket();
system.packetProgress = 0.34;
for (let index = 0; index < 28; index += 1) {
  system.packetPath.getPointAt(system.packetProgress, system.packetRoot.position);
  moveToPacket();
  frameState.input.stabilizeHeld = true;
  tick(0.05);
}
frameState.input.stabilizeHeld = false;
assert(system.packetPurity >= circuitRecipe.outcomes.cleanDeliveryThreshold, "Stabilize did not filter recoverable matter");
system.packetProgress = 0.995;
tick(0.1);
assert(frameState.nurseryCircuit.lastOutcome === "tender_fed_filtered_matter", "filtered matter did not feed the Tender");
assert(frameState.nurseryCircuit.tenderIntegrity > strainedIntegrity, "successful later cycle did not recover Tender integrity");
assert(frameState.nurseryCircuit.scarLoad < raisedScarLoad, "successful later cycle did not reduce scar load");
assert(frameState.nurseryCircuit.persistentConsequence, "circuit consequence is not persistent");
assert(frameState.nurseryCircuit.recoverable, "failure path is not recoverable");
assert(frameState.nurseryCircuit.foodState === "tender_has_received_food", "entity food state missing");
assert(frameState.nurseryCircuit.entityChangedByPlayer, "entity consequence missing");
assert(frameState.nurseryCircuit.regionChangedByPlayer, "region consequence missing");

const gameplaySource = readText("src/opening/SurfaceWakeGameplaySystem.js");
const entitySource = readText("src/ecology/EntitySystem.js");
const ecologySource = readText("src/opening/SurfaceWakeEcologicalCausalitySystem.js");
assert(gameplaySource.includes("current carries matter → pulse/read → stabilize/filter or absorb"), "player-facing circuit contract missing");
assert(gameplaySource.includes("SurfaceWakeGameplaySystem"), "gameplay owner missing from runtime state");
assert(entitySource.includes("foodState") && entitySource.includes("fearState") && entitySource.includes("functionState") && entitySource.includes("failureState"), "Tender lacks food/fear/function/failure embodiment");
assert(entitySource.includes("turning_toward_listening_fold"), "Watcher does not reveal the existing Fold");
assert(ecologySource.includes("ecologyRemainsObserver: true"), "ecology layer did not remain an observer");

console.log("HC-009C One Living Nursery Circuit validation passed.");
