import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { InputSystem } from "../src/input/InputSystem.js";
import { SignalChorusArrivalSystem } from "../src/morph/SignalChorusArrivalSystem.js";
import { SignalChorusInteractionSystem } from "../src/morph/SignalChorusInteractionSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateControllerPulseInputReliability] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const packageJson = readJson("package.json");
const localCells = readJson("public/data/world/localCellRecipes.json");
const chemRecipes = readJson("public/data/chemistry/chemObjectRecipes.json");
const signalLoops = readJson("public/data/morph/signalChorusInteractionRecipes.json");

if (["HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(manifest.version === (manifest.id === "HC-014I" ? "0.0.142" : manifest.id === "HC-014G" ? "0.0.140" : manifest.id === "HC-014F" ? "0.0.139" : manifest.id === "HC-014E" ? "0.0.138" : manifest.id === "HC-014D" ? "0.0.137" : manifest.id === "HC-014C" ? "0.0.136" : manifest.id === "HC-014B" ? "0.0.135" : manifest.id === "HC-014A" ? "0.0.134" : manifest.id === "HC-013D" ? "0.0.133" : manifest.id === "HC-013C" ? "0.0.132" : manifest.id === "HC-013B" ? "0.0.131" : manifest.id === "HC-013A" ? "0.0.130" : manifest.id === "HC-012C" ? "0.0.129" : manifest.id === "HC-012B" ? "0.0.128" : "0.0.127") && packageJson.version === manifest.version, "HC-012A/HC-012B controller lineage identity mismatch.");
} else if (manifest.id === "HC-011B") {
  assert(manifest.version === "0.0.126" && packageJson.version === manifest.version, "HC-011B controller lineage identity mismatch.");
} else if (manifest.id === "HC-011A1") {
  assert(manifest.version === "0.0.125" && packageJson.version === manifest.version, "HC-011A1 controller lineage identity mismatch.");
} else if (manifest.id === "HC-011A") {
  assert(manifest.version === "0.0.124" && packageJson.version === manifest.version, "HC-011A controller lineage identity mismatch.");
} else if (manifest.id === "HC-010G") {
  assert(manifest.version === "0.0.123" && packageJson.version === manifest.version, "HC-010G controller lineage identity mismatch.");
} else if (manifest.id === "HC-010F") {
  assert(manifest.version === "0.0.122" && packageJson.version === manifest.version, "HC-010F controller lineage identity mismatch.");
} else if (manifest.id === "HC-010E") {
  assert(manifest.version === "0.0.121" && packageJson.version === manifest.version, "HC-010E controller lineage identity mismatch.");
} else if (manifest.id === "HC-010D") {
  assert(manifest.version === "0.0.120" && packageJson.version === manifest.version, "HC-010D controller lineage identity mismatch.");
} else if (manifest.id === "HC-010C") {
  assert(manifest.version === "0.0.119" && packageJson.version === manifest.version, "HC-010C controller lineage identity mismatch.");
} else if (manifest.id === "HC-010B") {
  assert(manifest.version === "0.0.118" && packageJson.version === manifest.version, "HC-010B controller lineage identity mismatch.");
} else if (manifest.id === "HC-010A") {
  assert(manifest.version === "0.0.117" && packageJson.version === manifest.version, "HC-010A controller lineage identity mismatch.");
} else {
assert(["HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D", "HC-006A", "HC-006B", "HC-006C", "HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G", "HC-009A", "HC-009B", "HC-009C", "HC-009D", "HC-009E", "HC-009F", "HC-009G"] .includes(manifest.id), "manifest must preserve controller lineage.");
assert(["0.0.66", "0.0.67", "0.0.68", "0.0.69", "0.0.70", "0.0.71", "0.0.72", "0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109", "0.0.110", "0.0.111", "0.0.112", "0.0.113", "0.0.114", "0.0.115", "0.0.116"].includes(packageJson.version), "package version must preserve controller lineage.");
}

const buttons = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }));
const pad = {
  index: 0,
  id: "Xbox 360 Controller (XInput STANDARD GAMEPAD)",
  mapping: "standard",
  axes: [0, 0, 0, 0],
  buttons
};

Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: { getGamepads: () => [pad] }
});

function baseFrame(cellId) {
  return {
    frame: 1,
    runtimeSeconds: 0,
    activeCellId: cellId,
    input: {},
    inputSource: {},
    targeting: { targetId: "none" },
    controllerOnboarding: { tuning: null }
  };
}

function setButton(index, { pressed = false, touched = false, value = 0 } = {}) {
  buttons[index] = { pressed, touched, value };
}

// X must work even when a browser/driver exposes analog value without pressed=true.
const input = new InputSystem();
const signalFrame = baseFrame("CELL_SIGNAL_CHORUS_NERVE_001");
setButton(2, { value: 1, pressed: false });
input.update(1 / 60, signalFrame);
assert(signalFrame.input.pulsePressed === true, "X analog value must create a pulse edge.");
assert(signalFrame.input.pulseSource === "gamepad_x_button_2", "X pulse source must be reported.");
assert(signalFrame.inputSource.gamepadMapping === "standard", "standard gamepad mapping must be reported.");
assert(signalFrame.inputSource.pulseButtonValue === 1, "raw X value must be exposed.");
assert(signalFrame.inputSource.pulseSequence === 1, "first X edge must increment pulse sequence once.");

// Holding must not repeat.
signalFrame.frame += 1;
input.update(1 / 60, signalFrame);
assert(signalFrame.input.pulsePressed === false, "held X must not repeat pulse events.");
assert(signalFrame.inputSource.pulseSequence === 1, "held X must not increment pulse sequence.");

// Release and press must create a new event.
setButton(2, { value: 0, pressed: false });
signalFrame.frame += 1;
input.update(1 / 60, signalFrame);
setButton(2, { value: 1, pressed: true });
signalFrame.frame += 1;
input.update(1 / 60, signalFrame);
assert(signalFrame.input.pulsePressed === true, "new X press after release must create a pulse.");
assert(signalFrame.inputSource.pulseSequence === 2, "second X edge must increment pulse sequence.");

// A is canonical Interact in every region; it may not remap to pulse or absorb.
setButton(2, { value: 0 });
setButton(0, { value: 0 });
signalFrame.frame += 1;
input.update(1 / 60, signalFrame);
setButton(0, { value: 1, pressed: true });
signalFrame.frame += 1;
input.update(1 / 60, signalFrame);
assert(signalFrame.input.interactPressed === true, "A must produce canonical interact.");
assert(signalFrame.input.pulsePressed === false, "A must not become pulse in Signal Chorus.");
assert(signalFrame.input.absorbHeld === false, "A must not become absorb.");
assert(signalFrame.inputSource.contextButtonActsAsPulse === false, "legacy A pulse remapping must be disabled.");

// RT is canonical absorb and must not create vertical movement.
setButton(0, { value: 0 });
signalFrame.frame += 1;
input.update(1 / 60, signalFrame);
signalFrame.activeCellId = "CELL_MEMBRANE_NURSERY_001";
setButton(7, { value: 1, pressed: true });
signalFrame.frame += 1;
input.update(1 / 60, signalFrame);
assert(signalFrame.input.absorbHeld === true, "RT must own absorb in Nursery.");
assert(signalFrame.input.moveY === 0, "RT must not drive vertical movement.");
setButton(7, { value: 0 });
signalFrame.frame += 1;
input.update(1 / 60, signalFrame);

// Execute the real Signal Chorus consumer against an InputSystem-produced pulse event.
setButton(0, { value: 0 });
setButton(2, { value: 0 });
const runtimeInput = new InputSystem();
const signalCell = localCells.find((entry) => entry.id === "CELL_SIGNAL_CHORUS_NERVE_001");
const loop = signalLoops.find((entry) => entry.id === "SIGNAL_CHORUS_LOOP_001");
assert(signalCell && loop, "authored Signal Chorus cell and loop must exist.");

const recipeById = new Map(chemRecipes.map((entry) => [entry.id, entry]));
const objects = signalCell.contents.chemObjects.map((id) => {
  const recipe = recipeById.get(id);
  assert(recipe, `missing authored chem object ${id}.`);
  const rootObject = new THREE.Group();
  rootObject.position.set(...recipe.spawn.position);
  rootObject.visible = true;
  rootObject.userData = { recipeId: id, objectId: id };
  return { recipe, root: rootObject, cellId: signalCell.id, absorbed: false, pulseAge: 999 };
});

const playerRoot = new THREE.Group();
playerRoot.position.set(0, 0, 0);
const scene = new THREE.Scene();
const frameState = {
  frame: 20,
  runtimeSeconds: 1,
  secondLocalCellMorph: { completed: true },
  activeCellId: signalCell.id,
  input: {},
  inputSource: {},
  targeting: { targetId: "choir_resonance_node_001" },
  selectedObject: null,
  lockState: {},
  controllerOnboarding: { tuning: null },
  playerComposition: { signal: 0.20, seed: 0.40, scar: 0.10 },
  chemistry: {},
  physicalFeel: {},
  chemObjectState: { pulseResponse: "none" }
};
const visualComposer = { composedObjects: [] };
const chemObjectSystem = { objects };
const recipeDataSystem = {
  get(type, id) {
    if (type === "signalChorusInteractionRecipes" && id === loop.id) return loop;
    throw new Error(`unexpected recipe request ${type}:${id}`);
  }
};
const arrival = new SignalChorusArrivalSystem({ visualComposer, chemObjectSystem, playerRoot, scene, frameState });
const interaction = new SignalChorusInteractionSystem({ recipeDataSystem, chemObjectSystem, playerRoot, scene, frameState });
arrival.init();
interaction.init();

// Stage the cell without a pulse.
runtimeInput.update(1 / 60, frameState);
arrival.update(1 / 60, frameState);
interaction.update(1 / 60, frameState);
assert(frameState.signalChorusInteraction.currentFocus === "choir_resonance_node_001", "choir node must be initial focus.");

// Produce a raw-value X event and prove the real interaction consumes it.
setButton(2, { value: 1, pressed: false });
frameState.frame += 1;
runtimeInput.update(1 / 60, frameState);
arrival.update(1 / 60, frameState);
interaction.update(1 / 60, frameState);
assert(frameState.signalChorusInteraction.stageIndex === 1, "InputSystem-produced X pulse must advance Signal Chorus to stage 1.");
assert(frameState.signalChorusInteraction.currentFocus === "listening_pore_membrane_001", "consumed pulse must hand focus to listening pore.");
assert(frameState.inputActionAudit.consumedBy === "SignalChorusInteractionSystem", "pulse audit must identify the runtime consumer.");
assert(frameState.inputActionAudit.consumedTargetId === "choir_resonance_node_001", "pulse audit must identify the consumed target.");
assert(frameState.inputActionAudit.eventId === frameState.input.pulseEventId, "produced and consumed pulse event ids must match.");

console.log("[validateControllerPulseInputReliability] canonical X pulse, A interact, RT absorb, and Signal Chorus consumption passed.");
