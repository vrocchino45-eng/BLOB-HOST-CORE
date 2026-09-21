import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { ControlMap } from "../src/input/ControlMap.js";
import { PlayerMovementController } from "../src/player/PlayerMovementController.js";
import { CoreEmbodimentSystem } from "../src/player/CoreEmbodimentSystem.js";
import { ChemObjectVisualComposer } from "../src/visual/composers/ChemObjectVisualComposer.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const readText = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateCoreEmbodimentVolumetricMotionHC009B] ${message}`);
};
const approximate = (actual, expected, tolerance = 0.0001) =>
  Math.abs(actual - expected) <= tolerance;

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const profile = manifest.id === "HC-014I" ? readJson("public/data/runtime/act1RuntimeProfile_HC014I.json") : manifest.id === "HC-014G" ? readJson("public/data/runtime/act1RuntimeProfile_HC014G.json") : readJson(
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
const guideGameplay = readJson("public/data/morph/guideThresholdGameplayRecipes.json")[0];
const guideLayered = readJson("public/data/morph/guideThresholdLayeredInteractionRecipes.json")[0];

assert(
  (((manifest.id === "HC-009B" && manifest.version === "0.0.111")
  || (manifest.id === "HC-009C" && manifest.version === "0.0.112")
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
assert(
  [
    "FIRST_SLICE_RUNTIME_PROFILE_HC009B",
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
    "ACT1_RUNTIME_PROFILE_HC014B", "ACT1_RUNTIME_PROFILE_HC014C", "ACT1_RUNTIME_PROFILE_HC014D", "ACT1_RUNTIME_PROFILE_HC014E", "ACT1_RUNTIME_PROFILE_HC014F", "ACT1_RUNTIME_PROFILE_HC014G"
  ].includes(profile.id),
  "runtime profile identity mismatch"
);
assert(profile.globalSystemIds.includes("playerMovement"), "translation owner missing from global runtime");
if (["HC-009D", "HC-009E", "HC-009F", "HC-009G", "HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(profile.globalSystemIds.includes("coreGrowthSystem"), "growth owner missing from global runtime");
  assert(!profile.globalSystemIds.includes("coreEmbodimentSystem"), "body collaborator remained a parallel updater");
} else {
  assert(profile.globalSystemIds.includes("coreEmbodimentSystem"), "body-language owner missing from global runtime");
}
assert(profile.globalSystemIds.length === 15, "HC-009B global system count changed");
assert(profile.dormantCompatibilitySystemIds.length === 20, "compatibility archive size changed");
assert(
  profile.firstSlicePath
    .map((regionId) => profile.regions[regionId]?.activeUpdateBudget)
    .join("|") === "15|13|8",
  "HC-009A active-region budgets changed"
);

const controlMap = new ControlMap();
const mappedFor = (activeIndex) => controlMap.mapGamepad({
  leftX: 0,
  leftY: 0,
  rightX: 0,
  rightY: 0,
  triggerLeft: 0,
  triggerRight: 0,
  button: (index) => ({ down: index === activeIndex, value: index === activeIndex ? 1 : 0 }),
  pressedEdge: () => false
});
assert(mappedFor(5).gameplayVerticalY === 1, "RB must publish gameplay rise");
assert(mappedFor(4).gameplayVerticalY === -1, "LB must publish gameplay descent");
assert(mappedFor(12).moveY === 1, "D-Pad Up ascent alternative changed");
assert(mappedFor(13).moveY === -1, "D-Pad Down descent alternative changed");
assert(mappedFor(5).absorbHeld === false && mappedFor(5).stabilizeHeld === false, "vertical bumpers stole RT/LT verbs");
const inputSource = readText("src/input/InputSystem.js");
assert(inputSource.includes("statusOpen ? 0 : (gamepad.gameplayVerticalY ?? 0)"), "Status Page does not suppress gameplay bumper lift");

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
new ChemObjectVisualComposer().composePlayerSeedCore(playerRoot);

const requiredProxyParts = [
  "player_seed_body_frame",
  "soft_membrane_shell",
  "seed_core_inner_mantle",
  "player_seed_directional_prow",
  "player_seed_rear_lobe",
  "inner_seed_light",
  "core_pulse_wave"
];
for (const name of requiredProxyParts) {
  assert(playerRoot.getObjectByName(name), `authored Seed Core proxy lost ${name}`);
}
for (let index = 1; index <= 4; index += 1) {
  assert(playerRoot.getObjectByName(`player_seed_propulsion_fin_${index}`), `propulsion fin ${index} missing`);
}
for (let index = 1; index <= 3; index += 1) {
  assert(playerRoot.getObjectByName(`player_seed_trailing_veil_${index}`), `trailing veil ${index} missing`);
}
for (const forbiddenName of [
  "weak_signal_ring",
  "player_readability_halo",
  "player_vertical_depth_glint",
  "player_seed_protective_rib"
]) {
  assert(!playerRoot.getObjectByName(forbiddenName), `idle object-defining effect returned: ${forbiddenName}`);
}

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(0, -4, 8);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld(true);
const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  input: {
    moveX: 0,
    moveY: 0,
    moveZ: -1,
    boostHeld: false,
    absorbHeld: false,
    stabilizeHeld: false
  },
  controllerOnboarding: {
    tuning: {
      movement: {
        baseAcceleration: 10.8,
        verticalScale: 0.8,
        dragBase: 2.15,
        dragViscosityMultiplier: 4.1,
        speedLimit: 3.75
      }
    }
  },
  physicalFeel: {
    viscosity: 0.48,
    pressure: 0.42,
    flowVector: { x: 0.22, y: 0.18, z: -0.3 }
  },
  pulse: { active: false }
};
const movement = new PlayerMovementController({
  playerRoot,
  camera,
  frameState,
  localCellRecipe: { physicalFeel: frameState.physicalFeel }
});
movement.buildCameraRelativeIntent(frameState.input, 0.8);
assert(movement.intent.y > 0.35, "pitched camera-forward input was flattened onto XZ");
assert(approximate(movement.intent.y, movement.cameraForward.y, 0.001), "stick forward does not follow full camera pitch");

const embodiment = new CoreEmbodimentSystem({ scene, playerRoot, frameState });
embodiment.init();
for (let index = 0; index < 90; index += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  movement.update(1 / 60, frameState);
  embodiment.update(1 / 60, frameState);
}
assert(playerRoot.position.y > 0.35, "pitched forward thrust did not change actual altitude");
assert(frameState.playerKinematics.movementReference === "camera_relative_embodied_free_3d", "movement diagnostic reference mismatch");
assert(frameState.playerKinematics.cameraPitchAffectsForwardMovement, "camera pitch contract is not published");
assert(frameState.playerKinematics.fluidSlip > 0, "fluid-relative inertia is not observable");
assert(frameState.coreEmbodiment.owner === "CoreEmbodimentSystem", "body-language authority mismatch");
assert(frameState.coreEmbodiment.translationOwner === "PlayerMovementController", "translation authority mismatch");
assert(frameState.coreEmbodiment.authoredProxyParts.fins === 4, "Core embodiment did not bind four fins");
assert(frameState.coreEmbodiment.authoredProxyParts.trailingVeils === 3, "Core embodiment did not bind three veils");
assert(frameState.coreEmbodiment.authoredProxyParts.wakeMotes === 12, "Core wake contract changed");
assert(frameState.coreEmbodiment.objectDefiningRings === false, "Core returned to object-defining rings");
assert(scene.getObjectByName("player_seed_fluid_wake"), "world-space movement wake missing");

frameState.pulse.active = true;
embodiment.update(1 / 60, frameState);
const pulseWave = playerRoot.getObjectByName("core_pulse_wave");
assert(pulseWave.visible && pulseWave.material.opacity > 0, "Pulse wave did not become visible");
frameState.pulse.active = false;
for (let index = 0; index < 30; index += 1) embodiment.update(1 / 60, frameState);
assert(!pulseWave.visible && pulseWave.material.opacity === 0, "Pulse wave did not clear inside its transient window");

const verticalExcursion = (points) => {
  const ys = points.map((point) => point[1]);
  return Math.max(...ys) - Math.min(...ys);
};
assert(guideGameplay.path.volumetricPath, "Guide gameplay path is not marked volumetric");
assert(verticalExcursion(guideGameplay.path.points) >= 1.7, "Guide gameplay path lacks the authored vertical excursion");
assert(guideLayered.geometry.volumetricPath, "Guide layered path is not marked volumetric");
assert(verticalExcursion(guideLayered.geometry.pathPoints) >= 1.5, "Guide layered path lacks the authored vertical excursion");
assert(guideGameplay.visual.objectDefiningRings === false, "Guide recipe permits object-defining rings");

const guideGameplaySource = readText("src/morph/GuideThresholdGameplaySystem.js");
const guideLayeredSource = readText("src/morph/GuideThresholdLayeredInteractionSystem.js");
assert(!guideGameplaySource.includes("projection.tangent).setY(0)"), "Guide gameplay tangent is still planar");
assert(!guideLayeredSource.includes("projection.tangent).setY(0)"), "Guide layered tangent is still planar");
assert(!guideLayeredSource.includes("this.frameDisplacement.clone().setY(0)"), "Guide motion agreement is still planar");
assert(guideGameplaySource.includes("guide_gameplay_pressure_body_"), "Guide pressure bodies missing");
assert(guideLayeredSource.includes("anatomicalPressureBody"), "Guide settling anatomy missing");
assert(!guideGameplaySource.includes("this.convergenceMarker = new THREE.Mesh(new THREE.TorusGeometry"), "Guide convergence is still a ring body");
assert(!guideLayeredSource.includes("this.focusMarker = new THREE.Mesh(new THREE.TorusGeometry"), "Guide focus is still a ring body");

const surfaceSource = readText("src/opening/SurfaceWakeEcologicalCausalitySystem.js");
assert(surfaceSource.includes("upper_foreground_rib"), "Surface foreground altitude anatomy missing");
assert(surfaceSource.includes("lower_foreground_lip"), "Surface lower foreground anatomy missing");
assert(surfaceSource.includes("for (let index = 0; index < 30; index += 1)"), "Surface depth-mote field missing");
assert(!surfaceSource.includes("surface_wake_player_altitude_filament"), "player altitude debug filament returned");

const runtimeSource = readText("src/core/GameRuntime.js");
if (["HC-009D", "HC-009E", "HC-009F", "HC-009G", "HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(runtimeSource.includes('this.registry.register("coreGrowthSystem"'), "Core growth is not registered globally");
  assert(!runtimeSource.includes('this.registry.register("coreEmbodimentSystem"'), "Core embodiment is still registered in parallel");
} else {
  assert(runtimeSource.includes('this.registry.register("coreEmbodimentSystem"'), "Core embodiment is not registered globally");
}
assert(runtimeSource.includes("inSurfaceWake || inGuideThreshold || inHubVolume"), "Guide Threshold is excluded from volumetric camera behavior");
assert(runtimeSource.includes("cameraMotionLead"), "camera motion lead missing");
assert(runtimeSource.includes("coreEmbodiment?.bank"), "camera bank does not read the embodied Core");
assert(runtimeSource.includes("coreEmbodiment?.fluidSlip"), "camera FOV does not read fluid slip");

assert(manifest.systemsLocked.includes("SurfaceWakeLayeredInteractionSystem completion ownership"), "Listening Fold owner changed");
assert(manifest.systemsLocked.includes("BondSystem protected-seed absorption ownership"), "protected-seed owner changed");
assert(manifest.systemsLocked.includes("ObjectiveSystem objective completion ownership"), "objective owner changed");
assert(manifest.systemsLocked.includes("GateSystem route availability ownership"), "gate owner changed");

console.log("HC-009B Core Embodiment and Volumetric Motion validation passed.");
