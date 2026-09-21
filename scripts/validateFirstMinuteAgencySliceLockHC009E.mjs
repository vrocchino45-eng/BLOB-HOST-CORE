import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { SurfaceWakeGameplaySystem } from "../src/opening/SurfaceWakeGameplaySystem.js";
import { SurfaceWakeLayeredInteractionSystem } from "../src/opening/SurfaceWakeLayeredInteractionSystem.js";
import { FirstSliceCohesionSystem } from "../src/core/FirstSliceCohesionSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const readText = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateFirstMinuteAgencySliceLockHC009E] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const runtimeProfile = readJson(
  manifest?.id === "HC-012C"
    ? "public/data/runtime/act1RuntimeProfile_HC012C.json"
    : manifest?.id === "HC-012B"
    ? "public/data/runtime/act1RuntimeProfile_HC012B.json"
    : manifest?.id === "HC-012A"
    ? "public/data/runtime/act1RuntimeProfile_HC012A.json"
    : manifest?.id === "HC-011B"
    ? "public/data/runtime/act1RuntimeProfile_HC011B.json"
    : manifest?.id === "HC-011A1"
    ? "public/data/runtime/act1RuntimeProfile_HC011A1.json"
    : manifest?.id === "HC-011A"
    ? "public/data/runtime/act1RuntimeProfile_HC011A.json"
    : manifest?.id === "HC-010G"
    ? "public/data/runtime/act1RuntimeProfile_HC010G.json"
    : manifest?.id === "HC-010F"
    ? "public/data/runtime/act1RuntimeProfile_HC010F.json"
    : manifest?.id === "HC-010E"
    ? "public/data/runtime/act1RuntimeProfile_HC010E.json"
    : manifest?.id === "HC-010D"
    ? "public/data/runtime/act1RuntimeProfile_HC010D.json"
    : manifest?.id === "HC-010C"
    ? "public/data/runtime/act1RuntimeProfile_HC010C.json"
    : manifest?.id === "HC-010B"
    ? "public/data/runtime/act1RuntimeProfile_HC010B.json"
    : manifest?.id === "HC-010A"
    ? "public/data/runtime/act1RuntimeProfile_HC010A.json"
    : manifest?.id === "HC-009G"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009G.json"
    : manifest?.id === "HC-009F"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009F.json"
    : "public/data/runtime/firstSliceRuntimeProfile_HC009E.json"
);
const gameplayRecipe = readJson("public/data/opening/surfaceWakeGameplayRecipes.json")[0];
const circuitRecipe = readJson("public/data/opening/surfaceWakeLivingCircuit_HC009C.json");
const layeredRecipe = readJson("public/data/opening/surfaceWakeLayeredInteractionRecipes.json")[0];
const cohesionRecipe = readJson("public/data/core/firstSliceCohesion_HC007E.json");

assert(
  (((manifest.id === "HC-009E" && manifest.version === "0.0.114")
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
assert(
  [
    "FIRST_SLICE_RUNTIME_PROFILE_HC009E",
    "FIRST_SLICE_RUNTIME_PROFILE_HC009F",
    "FIRST_SLICE_RUNTIME_PROFILE_HC009G",
    "ACT1_RUNTIME_PROFILE_HC010A",
    "ACT1_RUNTIME_PROFILE_HC010B",
    "ACT1_RUNTIME_PROFILE_HC010C",
    "ACT1_RUNTIME_PROFILE_HC010D",
    "ACT1_RUNTIME_PROFILE_HC010E",
    "ACT1_RUNTIME_PROFILE_HC010F",
    "ACT1_RUNTIME_PROFILE_HC010G",
    "ACT1_RUNTIME_PROFILE_HC011A",
    "ACT1_RUNTIME_PROFILE_HC011A1",
    "ACT1_RUNTIME_PROFILE_HC011B",
    "ACT1_RUNTIME_PROFILE_HC012A",
    "ACT1_RUNTIME_PROFILE_HC012B",
    "ACT1_RUNTIME_PROFILE_HC012C",
    "ACT1_RUNTIME_PROFILE_HC013A",
    "ACT1_RUNTIME_PROFILE_HC013B"
  ].includes(runtimeProfile.id),
  "runtime profile identity mismatch"
);
assert(runtimeProfile.globalSystemIds.length === 15, "global runtime budget changed");
assert(
  runtimeProfile.firstSlicePath
    .map((regionId) => runtimeProfile.regions[regionId]?.activeUpdateBudget)
    .join("|") === "15|13|8",
  "first-slice mount budgets changed"
);
assert(runtimeProfile.dormantCompatibilitySystemIds.length === 20, "compatibility archive size changed");
assert(circuitRecipe.agencyLock?.pulseRequiredBeforeFiltering, "Pulse-first agency contract missing");
assert(circuitRecipe.agencyLock?.passiveCyclesDoNotCountAsPlayerSuccess, "passive ecology still counts as agency");
assert(circuitRecipe.constraints?.passiveSuccessCanRevealFold === false, "passive success may reveal the Fold");
assert(cohesionRecipe.sliceLock?.criteria?.length === 8, "vertical-slice lock criteria changed");
assert(cohesionRecipe.visual?.enabled === false, "decorative cohesion visuals were re-enabled");

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);

const objects = [];
const makeObject = (id, position = [0, 0, 0]) => {
  const objectRoot = new THREE.Group();
  objectRoot.name = id;
  objectRoot.position.set(...position);
  objectRoot.add(new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.18, 0),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x111111 })
  ));
  scene.add(objectRoot);
  const object = {
    recipe: { id, spawn: { scale: 1 } },
    root: objectRoot,
    absorbed: false
  };
  objects.push(object);
  return object;
};

makeObject("flux_current_ribbon_001", [0, 0, 0]);
makeObject("scar_contamination_plate_001", [2, -0.8, -1]);
makeObject("signal_vapor_thread_001", [-1, 1, -2]);
makeObject("surface_wake_membrane_mote_001");
makeObject("surface_wake_membrane_mote_002");
makeObject("surface_wake_membrane_mote_003");
makeObject("nursery_membrane_tender_001", [1.72, 0.96, -1.48]);
makeObject("membrane_watcher_001", [-2.85, 2.18, -2.45]);

const recipeDataSystem = {
  data: {
    surfaceWakeLivingCircuit: circuitRecipe,
    firstSliceCohesion: cohesionRecipe
  },
  get(category, id) {
    if (category === "surfaceWakeGameplayRecipes" && id === gameplayRecipe.id) return gameplayRecipe;
    if (category === "surfaceWakeLayeredInteractionRecipes" && id === layeredRecipe.id) return layeredRecipe;
    throw new Error(`Unexpected recipe request ${category}:${id}`);
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
  playerComposition: { form: 0.2, flux: 0.1, scar: 0.02, seed: 0.24, signal: 0.1 },
  physicalFeel: {},
  firstSliceObjectives: {},
  firstSliceGates: {}
};

const gameplay = new SurfaceWakeGameplaySystem({
  recipeDataSystem,
  chemObjectSystem,
  scene,
  playerRoot,
  frameState
});
gameplay.init();
const fold = new SurfaceWakeLayeredInteractionSystem({
  recipeDataSystem,
  scene,
  playerRoot,
  frameState
});
fold.init();
const cohesion = new FirstSliceCohesionSystem({
  recipeDataSystem,
  playerRoot,
  frameState
});
cohesion.init();

const tick = (dt, updateFold = true) => {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  gameplay.update(dt, frameState);
  if (updateFold) fold.update(dt, frameState);
  cohesion.update(dt, frameState);
};
const moveToPacket = () => {
  if (gameplay.packetActive) playerRoot.position.copy(gameplay.packetRoot.position);
};
const pulsePacket = () => {
  moveToPacket();
  frameState.input.pulsePressed = true;
  frameState.input.pulseEventId += 1;
  tick(1 / 60);
  frameState.input.pulsePressed = false;
};

// Ambient ecology stays alive, but it cannot impersonate player agency.
tick(circuitRecipe.cycle.initialDelaySeconds + 0.01);
assert(gameplay.packetMatterType === "clean_nutrient_cluster", "first authored packet changed");
gameplay.packetProgress = 0.995;
tick(0.1);
assert(frameState.nurseryCircuit.lastOutcome === "tender_passively_received_clean_matter", "clean ambient cycle was not classified as passive");
assert(frameState.nurseryCircuit.passiveCycleCount === 1, "passive cycle was not retained");
assert(frameState.nurseryCircuit.playerAuthoredSuccessfulCycleCount === 0, "passive cycle counted as player success");
assert(!frameState.nurseryCircuit.agencyProven, "passive ecology proved agency");
assert(!frameState.nurseryCircuit.foldInvitation, "passive ecology revealed the Fold");
assert(!frameState.surfaceWakeLayeredInteraction.foldAvailable, "Fold became available before agency");
assert(!fold.root.visible && fold.stageIndex === 0, "latent Fold remained visible or advanced");
assert(!frameState.firstSliceCohesion.sliceLockReady, "vertical-slice lock skipped the agency prerequisite");

// Stabilize alone may damp pressure, but it cannot read or filter unknown matter.
tick(circuitRecipe.cycle.restSeconds + 0.01);
assert(gameplay.packetMatterType === "scar_touched_cluster", "second authored packet changed");
gameplay.packetProgress = 0.36;
gameplay.packetPath.getPointAt(gameplay.packetProgress, gameplay.packetRoot.position);
moveToPacket();
const unreadPurity = gameplay.packetPurity;
for (let index = 0; index < 12; index += 1) {
  frameState.input.stabilizeHeld = true;
  tick(0.05);
  moveToPacket();
}
frameState.input.stabilizeHeld = false;
assert(!frameState.nurseryCircuit.packetIdentified, "Stabilize silently identified unread matter");
assert(gameplay.packetPurity === unreadPurity, "Stabilize purified matter before Pulse");

// Pulse establishes the Watcher's read; a successful player-authored outcome
// then proves agency and reveals the pre-existing Fold.
pulsePacket();
assert(frameState.nurseryCircuit.packetPulseRead, "Pulse did not author the packet reading");
for (let index = 0; index < 28; index += 1) {
  gameplay.packetPath.getPointAt(gameplay.packetProgress, gameplay.packetRoot.position);
  moveToPacket();
  frameState.input.stabilizeHeld = true;
  tick(0.05);
}
frameState.input.stabilizeHeld = false;
assert(gameplay.packetPurity >= circuitRecipe.outcomes.cleanDeliveryThreshold, "Pulse-led Stabilize did not filter matter");
gameplay.packetProgress = 0.995;
tick(0.1);
assert(frameState.nurseryCircuit.lastOutcome === "tender_fed_filtered_matter", "authored recovery did not feed the Tender");
assert(frameState.nurseryCircuit.playerAuthoredSuccessfulCycleCount === 1, "authored success was not retained");
assert(frameState.nurseryCircuit.agencyProven, "authored success did not prove agency");
assert(frameState.nurseryCircuit.foldInvitation, "Watcher did not reveal the Fold");
tick(0.9);
assert(frameState.surfaceWakeLayeredInteraction.foldAvailable, "existing Fold did not become available");
assert(fold.root.visible && fold.emergenceProgress >= 0.99, "Fold emergence did not become visible");
assert(frameState.surfaceWakeLayeredInteraction.interactionRequirementsChanged === false, "Fold requirements changed");
assert(!frameState.nurseryCircuit.directTriggerCompletion, "nursery circuit completed the Fold directly");
assert(!frameState.nurseryCircuit.directSeedAbsorption, "nursery circuit absorbed the protected seed");
assert(!frameState.nurseryCircuit.directMorphActivation, "nursery circuit started the morph");

// The lock is read-only and cannot be satisfied by dormant compatibility data.
frameState.signalChorusInteraction = { preparedForNextBranch: true };
cohesion.update(0.01, frameState);
assert(!frameState.firstSliceCohesion.sliceLockReady, "Signal Chorus compatibility state shortcut the lock");

const criteriaFrames = [
  ["surfaceWakeLayeredInteraction", { completed: true }],
  ["coreGrowth", { nurseryAgencyProven: true, firstGrowthCommitted: true }],
  ["guideThresholdGameplay", { coreGrowthPressureTested: true }],
  ["hubChamberFoundation", { coreGrowthRecognized: true }],
  ["hubInvestigationGameplay", { investigationReady: true }],
  ["statusPage", { firstHubUseComplete: true }]
];
for (const [key, value] of criteriaFrames) {
  frameState[key] = { ...(frameState[key] ?? {}), ...value };
  cohesion.update(0.01, frameState);
  assert(!frameState.firstSliceCohesion.sliceLockReady, `slice locked before ${key} handoff was complete`);
}
frameState.firstSliceGates = {
  hub_to_grave_memory_route: { crossable: true }
};
cohesion.update(0.01, frameState);
assert(frameState.firstSliceCohesion.sliceLockReady, "complete three-room truth chain did not lock the slice");
assert(frameState.firstSliceCohesion.missingLockCriteria.length === 0, "locked slice still reports missing criteria");
assert(frameState.firstSliceCohesion.directTriggerCompletion === false, "lock observer claimed trigger ownership");
assert(frameState.firstSliceCohesion.directObjectiveCompletion === false, "lock observer claimed objective ownership");
assert(frameState.firstSliceCohesion.directGateMutation === false, "lock observer claimed gate ownership");
for (const ring of cohesion.lessonRings.values()) assert(!ring.visible && ring.material.opacity === 0, "decorative lesson ring returned");
for (const bead of cohesion.practiceBeads.values()) assert(!bead.visible && bead.material.opacity === 0, "decorative practice bead returned");

const coreGrowthSource = readText("src/player/CoreGrowthSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const morphReadabilitySource = readText("src/morph/MorphReadabilitySystem.js");
const debugSource = readText("src/debug/RecipeDebugOverlay.js");
assert(coreGrowthSource.includes("if (!this.nurseryAgencyProven) return 0;"), "growth still advances without agency");
assert(hudSource.includes("frameState.firstSliceCohesion?.sliceLockReady"), "HUD does not consume the real slice lock");
assert(morphReadabilitySource.includes("frameState.firstSliceCohesion?.sliceLockReady"), "morph readout does not consume the real slice lock");
assert(debugSource.includes("firstSliceCohesion?.sliceLockReady"), "debug readout does not consume the real slice lock");

console.log("HC-009E First-Minute Agency + Vertical-Slice Lock validation passed.");
