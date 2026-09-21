import fs from "node:fs";
import * as THREE from "three";
import { ControlMap } from "../src/input/ControlMap.js";
import { PlayerMovementController } from "../src/player/PlayerMovementController.js";

function assert(
  ((condition, message) {
  if (!condition) throw new Error(`[validateSurfaceWakeReadabilityVerticalityHC008D] ${message}`);
}

const json = (path) => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const source = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const manifest = json("public/data/build/buildManifest.json");
const pkg = json("package.json");
assert(
  (manifest.id === "HC-008D" && manifest.version === "0.0.106")
  || (manifest.id === "HC-008E" && manifest.version === "0.0.107")
  || (manifest.id === "HC-008F" && manifest.version === "0.0.108") || (manifest.id === "HC-008G" && manifest.version === "0.0.109")) || (manifest.id === "HC-014G" && manifest.version === "0.0.140") || (manifest.id === "HC-014I" && manifest.version === "0.0.142")),
  "manifest identity mismatch"
);
assert(["0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), "package identity mismatch");

const controls = new ControlMap();
const button = (index) => ({ down: index === 12, value: index === 12 ? 1 : 0 });
const mapped = controls.mapGamepad({ leftX: 0, leftY: 0, rightX: 0, rightY: 0, triggerLeft: 0, triggerRight: 0, button, pressedEdge: () => false });
assert(mapped.moveY === 1, "D-Pad Up must produce ascent");
assert(mapped.stabilizeHeld === false && mapped.absorbHeld === false, "vertical movement must not steal ability triggers");

const playerRoot = new THREE.Group();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(0, 2.4, 8.4);
camera.lookAt(0, 0, 0);
const frameState = {
  input: { moveX: 0, moveY: 1, moveZ: 0 },
  controllerOnboarding: { tuning: { movement: { baseAcceleration: 11.15, verticalScale: 0.9, dragBase: 2.05, dragViscosityMultiplier: 3.95 } } },
  physicalFeel: { viscosity: 0.5, pressure: 0, flowVector: { x: 0, y: 0, z: 0 } }
};
const movement = new PlayerMovementController({ playerRoot, camera, frameState, localCellRecipe: { physicalFeel: frameState.physicalFeel } });
for (let i = 0; i < 60; i += 1) movement.update(1 / 60, frameState);
assert(playerRoot.position.y > 0.3, "sustained ascent input must change player altitude");
assert(frameState.playerKinematics.movementReference === "camera_relative_free_3d", "movement diagnostics must report free 3D traversal");
assert(frameState.playerKinematics.verticalReference === "world_y_dpad_or_keyboard", "vertical reference mismatch");

const entities = json("public/data/ecology/entityRecipes.json");
const chemistry = json("public/data/chemistry/chemObjectRecipes.json");
const layered = json("public/data/opening/surfaceWakeLayeredInteractionRecipes.json")[0];
const byId = (list, id) => list.find((entry) => entry.id === id);
const y = (entry) => entry.spawn.position[1];
assert(y(byId(entities, "membrane_watcher_001")) >= 2, "Watcher must occupy upper layer");
assert(layered.geometry.anchor[1] >= 1, "Listening Fold must occupy upper layer");
assert(y(byId(chemistry, "dormant_seed_nutrient_001")) > 0.4, "protected seed must occupy middle-upper pocket");
assert(y(byId(chemistry, "scar_contamination_plate_001")) < -1, "scar must occupy lower wounded layer");
assert(y(byId(chemistry, "surface_wake_membrane_mote_001")) - y(byId(chemistry, "surface_wake_membrane_mote_003")) > 1.5, "motes must teach vertical traversal across distinct heights");

assert(source("src/player/PlayerMovementController.js").includes("y: 3.45"), "vertical membrane boundary must be expanded");
assert(
  source("src/morph/LocalCellMorphSystem.js").includes("Math.max(0.04, 1 - eased * 1.18)")
  || source("src/morph/LocalCellMorphSystem.js").includes("1 - Math.min(1, progress * 1.85)"),
  "source presentation must converge away during handoff"
);
assert(source("src/opening/SurfaceWakeEcologicalCausalitySystem.js").includes("focalEffectsPolicy"), "focal effect discipline diagnostics missing");

assert(layered.timing.approachHoldSeconds === 0.42, "Listening Fold approach timing changed");
assert(layered.timing.sustainSeconds === 1.35, "Listening Fold stabilize timing changed");
assert(layered.completion.safeSeedObjectId === "dormant_seed_nutrient_001", "protected-seed owner changed");

console.log("HC-008D Surface Wake readability convergence and vertical traversal validation passed.");
