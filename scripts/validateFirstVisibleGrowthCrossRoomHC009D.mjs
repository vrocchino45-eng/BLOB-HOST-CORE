import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { ChemObjectVisualComposer } from "../src/visual/composers/ChemObjectVisualComposer.js";
import { CoreEmbodimentSystem } from "../src/player/CoreEmbodimentSystem.js";
import { CoreGrowthSystem } from "../src/player/CoreGrowthSystem.js";
import { PlayerMovementController } from "../src/player/PlayerMovementController.js";
import { GuideThresholdGameplaySystem } from "../src/morph/GuideThresholdGameplaySystem.js";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const readText = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateFirstVisibleGrowthCrossRoomHC009D] ${message}`);
};
const colorDistance = (a, b) => Math.sqrt(
  ((a.r - b.r) ** 2)
  + ((a.g - b.g) ** 2)
  + ((a.b - b.b) ** 2)
);

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
    : "public/data/runtime/firstSliceRuntimeProfile_HC009D.json"
);
const growthRecipe = readJson("public/data/core/firstVisibleCoreGrowth_HC009D.json");
const guideRecipe = readJson("public/data/morph/guideThresholdGameplayRecipes.json")[0];
const hubRecipe = readJson("public/data/hub/hubChamberPresentationLock_HC006JA.json")[0];
const hubGameplayRecipe = readJson("public/data/hub/hubInvestigationGameplay_HC007C.json")[0];

assert(
  (((manifest.id === "HC-009D" && manifest.version === "0.0.113")
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
assert(growthRecipe.id === "FIRST_VISIBLE_CORE_GROWTH_HC009D", "growth recipe missing");
assert(growthRecipe.constraints.permanentClass === false, "growth recipe created a permanent class");
assert(growthRecipe.constraints.addsAbility === false, "growth recipe added an ability");
assert(growthRecipe.constraints.directTriggerCompletion === false, "growth recipe owns a trigger");
assert(growthRecipe.constraints.directObjectiveCompletion === false, "growth recipe owns an objective");
assert(growthRecipe.constraints.directGateMutation === false, "growth recipe owns a gate");
assert(growthRecipe.constraints.changesDestination === false, "growth recipe changed a destination");

assert(
  [
    "FIRST_SLICE_RUNTIME_PROFILE_HC009D",
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
    "ACT1_RUNTIME_PROFILE_HC013B",
    "ACT1_RUNTIME_PROFILE_HC013C",
    "ACT1_RUNTIME_PROFILE_HC013D",
    "ACT1_RUNTIME_PROFILE_HC014A",
    "ACT1_RUNTIME_PROFILE_HC014B", "ACT1_RUNTIME_PROFILE_HC014C", "ACT1_RUNTIME_PROFILE_HC014D"
  ].includes(profile.id),
  "runtime profile identity mismatch"
);
assert(profile.globalSystemIds.length === 15, "global runtime budget changed");
assert(profile.globalSystemIds.includes("coreGrowthSystem"), "CoreGrowthSystem registry owner missing");
assert(!profile.globalSystemIds.includes("coreEmbodimentSystem"), "CoreEmbodimentSystem remained a parallel updater");
assert(profile.dormantCompatibilitySystemIds.length === 20, "compatibility archive size changed");
assert(
  profile.firstSlicePath
    .map((regionId) => profile.regions[regionId]?.activeUpdateBudget)
    .join("|") === "15|13|8",
  "first-slice region budgets changed"
);

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
new ChemObjectVisualComposer().composePlayerSeedCore(playerRoot);

const safeSeedRoot = new THREE.Group();
safeSeedRoot.name = "dormant_seed_nutrient_001";
safeSeedRoot.visible = true;
scene.add(safeSeedRoot);
const safeSeed = {
  recipe: { id: "dormant_seed_nutrient_001" },
  root: safeSeedRoot,
  absorbed: false,
  cellId: "CELL_MEMBRANE_NURSERY_001"
};

const guideObjects = [
  guideRecipe.worldReads.memoryFleckId,
  guideRecipe.worldReads.pressureCurrentId,
  guideRecipe.worldReads.clotId,
  ...guideRecipe.optionalRewards
].map((id) => {
  const objectRoot = new THREE.Group();
  objectRoot.name = id;
  objectRoot.visible = true;
  scene.add(objectRoot);
  return {
    recipe: { id },
    root: objectRoot,
    absorbed: false,
    cellId: "CELL_SCAR_FLOW_FOLD_001"
  };
});
const chemObjectSystem = { objects: [safeSeed, ...guideObjects] };
const recipeDataSystem = {
  data: { firstVisibleCoreGrowth: growthRecipe },
  get(category, id) {
    if (category === "guideThresholdGameplayRecipes" && id === guideRecipe.id) return guideRecipe;
    if (category === "hubChamberFoundationRecipes" && id === hubRecipe.id) return hubRecipe;
    if (category === "hubInvestigationGameplayRecipes" && id === hubGameplayRecipe.id) return hubGameplayRecipe;
    throw new Error(`Unexpected recipe request ${category}:${id}`);
  }
};

const frameState = {
  frame: 0,
  runtimeSeconds: 0,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  currentMode: { id: "landing_mode", regionId: "surface_wake" },
  input: {
    moveX: 0,
    moveY: 0,
    moveZ: -1,
    pulsePressed: false,
    pulseEventId: 0,
    absorbHeld: false,
    stabilizeHeld: false,
    boostHeld: false
  },
  playerComposition: { form: 0.2, flux: 0.1, scar: 0.02, seed: 0.24, signal: 0.1 },
  physicalFeel: {
    viscosity: 0.48,
    pressure: 0.42,
    flowVector: { x: 0.22, y: 0.12, z: -0.3 }
  },
  playerKinematics: {
    velocity: { x: 0, y: 0, z: 0 },
    flowVector: { x: 0.22, y: 0.12, z: -0.3 },
    speed: 0,
    pressure: 0.42,
    viscosity: 0.48,
    boundaryPressure: 0
  },
  pulse: { active: false },
  nurseryCircuit: {
    agencyProven: false,
    resolvedCycleCount: 0,
    successfulCycleCount: 0,
    failedCycleCount: 0,
    tenderFedCount: 0,
    coreNourishedCount: 0,
    tenderTrust: 0.32,
    tenderIntegrity: 0.72,
    scarLoad: 0.22,
    lastOutcome: "none",
    history: []
  },
  objectiveState: { id: "objective_sentinel", complete: false },
  gateState: { id: "gate_sentinel", crossable: false }
};

const embodiment = new CoreEmbodimentSystem({ scene, playerRoot, frameState });
const growth = new CoreGrowthSystem({
  recipeDataSystem,
  chemObjectSystem,
  playerRoot,
  frameState,
  embodimentSystem: embodiment
});
growth.init();

const tickGrowth = (seconds, dt = 1 / 60) => {
  const frames = Math.ceil(seconds / dt);
  for (let index = 0; index < frames; index += 1) {
    frameState.frame += 1;
    frameState.runtimeSeconds += dt;
    growth.update(dt, frameState);
  }
};

tickGrowth(0.5);
assert(frameState.coreGrowth.stageId === "seed_core", "Core changed without a lived consequence");
assert(frameState.coreGrowth.growthProgress === 0, "growth advanced before ecology supplied history");

frameState.nurseryCircuit = {
  agencyProven: true,
  resolvedCycleCount: 1,
  successfulCycleCount: 1,
  failedCycleCount: 0,
  tenderFedCount: 1,
  coreNourishedCount: 0,
  tenderTrust: 0.75,
  tenderIntegrity: 0.9,
  scarLoad: 0.1,
  lastOutcome: "tender_fed_filtered_matter",
  history: [
    { sequence: 1, outcome: "tender_fed_filtered_matter", matterType: "mixed_membrane_cluster" }
  ]
};
tickGrowth(1.6);
assert(frameState.coreGrowth.stageId === "binding_core_emerging", "successful nursery consequence did not bud a Binding Core");
assert(frameState.coreGrowth.growthProgress >= 0.6, "successful circuit did not reach its authored emerging target");
assert(frameState.coreGrowth.biasLabel === "tender_attuned_binding", "care intervention did not shape the soft bias");
assert(frameState.coreGrowth.visibleShellRestructuring, "growth exists only as numeric state");

const firstPetal = playerRoot.getObjectByName("player_growth_binding_petal_1");
assert(firstPetal?.visible && firstPetal.material.opacity > 0.2, "Binding Core petals did not unfold");
assert(firstPetal.geometry.type !== "TorusGeometry", "growth anatomy reverted to a ring");
assert(frameState.coreEmbodiment.authoredProxyParts.growthPetals === 6, "Binding petal anatomy count changed");
assert(frameState.coreEmbodiment.authoredProxyParts.scarPlates === 5, "scar plate anatomy count changed");
assert(frameState.coreEmbodiment.authoredProxyParts.connectionNodes === 4, "connection-node anatomy count changed");

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(0, -3.2, 7.5);
camera.lookAt(0, 0.6, 0);
camera.updateMatrixWorld(true);
frameState.controllerOnboarding = {
  tuning: {
    movement: {
      baseAcceleration: 10.8,
      verticalScale: 0.8,
      dragBase: 2.15,
      dragViscosityMultiplier: 4.1,
      flowPressureMultiplier: 0.75,
      speedLimit: 3.75
    }
  }
};
const movement = new PlayerMovementController({
  playerRoot,
  camera,
  frameState,
  localCellRecipe: { physicalFeel: frameState.physicalFeel }
});
movement.update(1 / 60, frameState);
assert(frameState.playerKinematics.growthMovementApplied, "movement ignored Core growth");
assert(frameState.playerKinematics.growthMovementModifiers.flowCouplingMultiplier < 1, "new shell did not alter current coupling");
assert(frameState.playerKinematics.abilityUnlockedByGrowth === false, "movement treated growth as a new ability");

safeSeed.absorbed = true;
safeSeed.root.userData.absorbed = true;
tickGrowth(1.1);
assert(frameState.coreGrowth.stageId === "binding_core", "protected seed did not complete the first Binding Core");
assert(frameState.coreGrowth.firstGrowthCommitted, "first visible growth did not commit");
assert(frameState.coreGrowth.protectedSeedMassIntegrated, "protected seed mass was not retained");
assert(frameState.coreGrowth.growthProgress >= 0.85, "bound-stage threshold was not reached");
assert(frameState.coreGrowth.abilityUnlocks.length === 0, "Binding Core silently unlocked an ability");

frameState.playerComposition.scar = 0.4;
frameState.nurseryCircuit = {
  agencyProven: true,
  resolvedCycleCount: 8,
  successfulCycleCount: 1,
  failedCycleCount: 7,
  tenderFedCount: 1,
  coreNourishedCount: 0,
  tenderTrust: 0.08,
  tenderIntegrity: 0.2,
  scarLoad: 1,
  lastOutcome: "core_absorbed_scar_contamination",
  history: [
    ...frameState.nurseryCircuit.history,
    ...Array.from({ length: 6 }, (_, index) => ({
      sequence: 10 + index,
      outcome: "core_absorbed_scar_contamination",
      matterType: "scar_touched_cluster"
    }))
  ]
};
tickGrowth(2);
assert(frameState.coreGrowth.stageId === "binding_core", "soft chemistry shifted the persistent bodily stage");
assert(frameState.coreGrowth.biasLabel === "scar_tempered_binding", "scar history did not reshape the reversible bias");

frameState.playerComposition.scar = 0.02;
frameState.nurseryCircuit = {
  agencyProven: true,
  resolvedCycleCount: 34,
  successfulCycleCount: 27,
  failedCycleCount: 7,
  tenderFedCount: 25,
  coreNourishedCount: 2,
  tenderTrust: 1,
  tenderIntegrity: 1,
  scarLoad: 0.05,
  lastOutcome: "tender_fed_filtered_matter",
  history: [
    ...frameState.nurseryCircuit.history,
    ...Array.from({ length: 26 }, (_, index) => ({
      sequence: 100 + index,
      outcome: "tender_fed_filtered_matter",
      matterType: "mixed_membrane_cluster"
    }))
  ]
};
tickGrowth(2);
assert(frameState.coreGrowth.biasLabel === "tender_attuned_binding", "soft chemistry bias did not reverse after later care");
assert(frameState.coreGrowth.stageId === "binding_core", "bias reversal erased retained growth");
assert(frameState.coreGrowth.permanentClass === false, "reversible bias became a permanent class");

frameState.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
frameState.currentMode = { id: "threshold_mode", regionId: "guide_threshold" };
frameState.localCellMorph = { completed: true };
frameState.secondLocalCellMorph = { started: false, completed: false };
const guide = new GuideThresholdGameplaySystem({
  recipeDataSystem,
  chemObjectSystem,
  scene,
  playerRoot,
  frameState
});
guide.init();
playerRoot.position.copy(guide.path.getPoint(0.24));
guide.update(1 / 30, frameState);
assert(frameState.guideThresholdGameplay.coreGrowthPressureTested, "Guide Threshold did not test the retained form");
assert(
  frameState.guideThresholdGameplay.inheritedPressureResponseMultiplier
    === frameState.coreGrowth.movementModifiers.pressureResponseMultiplier,
  "Guide Threshold did not consume the Core's pressure response"
);
assert(frameState.guideThresholdGameplay.crossRoomConsequence, "Guide did not publish the cross-room consequence");
assert(frameState.guideThresholdGameplay.directTriggerMutationByGrowth === false, "growth bypassed the Guide trigger");
growth.update(1 / 30, frameState);
assert(frameState.coreGrowth.guidePressureTested, "Core did not retain Guide recognition");

frameState.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
frameState.currentMode = { id: "hub_mode", regionId: "hub_chamber" };
frameState.signalChorusLayeredInteraction = { active: true, completed: true, stage: "layered_interaction_complete" };
frameState.hubInvestigationGameplay = {
  routeReads: [],
  routeReadCount: 0,
  routeCount: 3,
  allRoutesRead: false,
  memoryRead: false,
  returnedToCenter: false,
  investigationReady: false
};
frameState.statusPage = { firstHubUseComplete: false };
frameState.graveRouteLock = { routeLocked: false };
frameState.firstSliceGates = {
  hub_to_grave_memory_route: { readable: true, crossable: false }
};
frameState.promptStack = {};
frameState.interactionInspectionFocus = {};

const foundation = new HubChamberFoundationSystem({
  recipeDataSystem,
  scene,
  playerRoot,
  frameState
});
foundation.init();
const baseCradleColor = foundation.anchorBasin.userData.baseColor.clone();
for (let index = 0; index < 100; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  foundation.update(1 / 60, frameState);
}
assert(frameState.hubChamberFoundation.coreGrowthRecognized, "Hub did not recognize the retained Core form");
assert(
  frameState.hubChamberFoundation.growthReflectionMechanism === "comparison_cradle_material_echo",
  "Hub reflection added a new presentation owner"
);
assert(
  colorDistance(foundation.anchorBasin.material.color, baseCradleColor) > 0.02,
  "existing Hub cradle did not visibly echo the Core bias"
);
assert(frameState.hubChamberFoundation.directObjectiveMutationByGrowth === false, "Hub growth reflection changed the objective");
assert(frameState.hubChamberFoundation.directGateMutationByGrowth === false, "Hub growth reflection changed a gate");
growth.update(1 / 60, frameState);
assert(frameState.coreGrowth.hubReflectionObserved, "Core did not retain Hub recognition");

assert(frameState.objectiveState.id === "objective_sentinel" && !frameState.objectiveState.complete, "growth mutated objective truth");
assert(frameState.gateState.id === "gate_sentinel" && !frameState.gateState.crossable, "growth mutated gate truth");
assert(frameState.coreGrowth.destinationChanged === false, "growth changed the established destination");

const runtimeSource = readText("src/core/GameRuntime.js");
const growthSource = readText("src/player/CoreGrowthSystem.js");
const guideSource = readText("src/morph/GuideThresholdGameplaySystem.js");
const hubSource = readText("src/hub/HubChamberFoundationSystem.js");
assert(runtimeSource.includes('this.registry.register("coreGrowthSystem"'), "CoreGrowthSystem is not the registered authority");
assert(!runtimeSource.includes('this.registry.register("coreEmbodimentSystem"'), "body collaborator is still registered separately");
assert(growthSource.includes("this.embodimentSystem.update(dt, frameState)"), "growth owner does not drive body language");
assert(guideSource.includes("coreGrowthPressureTested"), "Guide recognition contract missing");
assert(hubSource.includes("comparison_cradle_material_echo"), "Hub recognition contract missing");

for (const owner of [
  "SurfaceWakeLayeredInteractionSystem completion ownership",
  "BondSystem protected-seed absorption ownership",
  "ObjectiveSystem objective completion ownership",
  "GateSystem route availability ownership"
]) {
  assert(manifest.systemsLocked.includes(owner), `progression owner changed: ${owner}`);
}

console.log("HC-009D First Visible Growth + Cross-Room Consequence validation passed.");
