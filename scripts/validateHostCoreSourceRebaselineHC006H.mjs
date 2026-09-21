import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { InputSystem } from "../src/input/InputSystem.js";
import { ControlMap, HOST_CORE_CONTROL_MAP_ID } from "../src/input/ControlMap.js";
import { HOST_CORE_SOURCE_AUTHORITY } from "../src/core/HostCoreSourceAuthority.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateHostCoreSourceRebaselineHC006H] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const translation = readJson("public/data/planning/blueprintTranslationLayer_HC003F.json");
const surface = readJson("public/data/opening/surfaceWakeLayeredInteractionRecipes.json")[0];
const guide = readJson("public/data/morph/guideThresholdLayeredInteractionRecipes.json")[0];
const chorus = readJson("public/data/morph/signalChorusLayeredInteractionRecipes.json")[0];
const camera = readJson("public/data/camera/inspectionCameraProfiles.json")[0];
const controlSource = readText("src/input/ControlMap.js");
const inputSource = readText("src/input/InputSystem.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const surfaceSource = readText("src/opening/SurfaceWakeLayeredInteractionSystem.js");
const guideSource = readText("src/morph/GuideThresholdLayeredInteractionSystem.js");
const chorusSource = readText("src/morph/SignalChorusLayeredInteractionSystem.js");

if (["HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(manifest.version === (manifest.id === "HC-014I" ? "0.0.142" : manifest.id === "HC-014G" ? "0.0.140" : manifest.id === "HC-014F" ? "0.0.139" : manifest.id === "HC-014E" ? "0.0.138" : manifest.id === "HC-014D" ? "0.0.137" : manifest.id === "HC-014C" ? "0.0.136" : manifest.id === "HC-014B" ? "0.0.135" : manifest.id === "HC-014A" ? "0.0.134" : manifest.id === "HC-013D" ? "0.0.133" : manifest.id === "HC-013C" ? "0.0.132" : manifest.id === "HC-013B" ? "0.0.131" : manifest.id === "HC-013A" ? "0.0.130" : manifest.id === "HC-012C" ? "0.0.129" : manifest.id === "HC-012B" ? "0.0.128" : "0.0.127") && pkg.version === manifest.version, "HC-012A/HC-012B source-lineage identity mismatch.");
} else if (manifest.id === "HC-011B") {
  assert(manifest.version === "0.0.126" && pkg.version === manifest.version, "HC-011B source-lineage identity mismatch.");
} else if (manifest.id === "HC-011A1") {
  assert(manifest.version === "0.0.125" && pkg.version === manifest.version, "HC-011A1 source-lineage identity mismatch.");
} else if (manifest.id === "HC-011A") {
  assert(manifest.version === "0.0.124" && pkg.version === manifest.version, "HC-011A source-lineage identity mismatch.");
} else if (manifest.id === "HC-010G") {
  assert(manifest.version === "0.0.123" && pkg.version === manifest.version, "HC-010G source-lineage identity mismatch.");
} else if (manifest.id === "HC-010F") {
  assert(manifest.version === "0.0.122" && pkg.version === manifest.version, "HC-010F source-lineage identity mismatch.");
} else if (manifest.id === "HC-010E") {
  assert(manifest.version === "0.0.121" && pkg.version === manifest.version, "HC-010E source-lineage identity mismatch.");
} else if (manifest.id === "HC-010D") {
  assert(manifest.version === "0.0.120" && pkg.version === manifest.version, "HC-010D source-lineage identity mismatch.");
} else if (manifest.id === "HC-010C") {
  assert(manifest.version === "0.0.119" && pkg.version === manifest.version, "HC-010C source-lineage identity mismatch.");
} else if (manifest.id === "HC-010B") {
  assert(manifest.version === "0.0.118" && pkg.version === manifest.version, "HC-010B source-lineage identity mismatch.");
} else if (manifest.id === "HC-010A") {
  assert(manifest.version === "0.0.117" && pkg.version === manifest.version, "HC-010A source-lineage identity mismatch.");
} else {
  assert([["HC-006H", "0.0.88"], ["HC-006HA", "0.0.89"], ["HC-006I", "0.0.90"], ["HC-006IA", "0.0.91"], ["HC-006J", "0.0.92"], ["HC-006JA", "0.0.93"], ["HC-006K", "0.0.94"], ["HC-006KA", "0.0.95"], ["HC-006KB", "0.0.96"], ["HC-006KC", "0.0.97"], ["HC-006KD", "0.0.98"], ["HC-007A", "0.0.99"], ["HC-007B", "0.0.100"], ["HC-007C", "0.0.101"], ["HC-007D", "0.0.102", "0.0.103", "0.0.104", "0.0.105"], ["HC-007E", "0.0.103", "0.0.104", "0.0.105"], ["HC-008B", "0.0.104"], ["HC-008C", "0.0.105"], ["HC-008D", "0.0.106"], ["HC-008E", "0.0.107", "0.0.108"], ["HC-008F", "0.0.108"], ["HC-008G", "0.0.109"], ["HC-009A", "0.0.110"], ["HC-009B", "0.0.111"], ["HC-009C", "0.0.112"], ["HC-009D", "0.0.113"], ["HC-009E", "0.0.114"], ["HC-009F", "0.0.115"], ["HC-009G", "0.0.116"]].some(([id, version]) => manifest.id === id && manifest.version === version), "manifest must preserve the HC-006H source rebaseline through HC-009G.");
  assert(["0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109", "0.0.110", "0.0.111", "0.0.112", "0.0.113", "0.0.114", "0.0.115", "0.0.116"].includes(pkg.version), "package must preserve the HC-006H source rebaseline through 0.0.115.");
}
assert(manifest.primaryBuildReference === HOST_CORE_SOURCE_AUTHORITY.sourcePackage, "manifest must use the authoritative HOST CORE source package.");
assert(translation.primaryReference === HOST_CORE_SOURCE_AUTHORITY.sourcePackage, "translation layer must use the authoritative HOST CORE source package.");
assert(HOST_CORE_SOURCE_AUTHORITY.firstSlice.join("|") === "surface_wake|guide_threshold|hub_chamber", "first slice must be Surface Wake → Guide Threshold → Hub Chamber.");
assert(controlSource.includes("HOST_CORE_CANONICAL_CONTROLS_V1"), "canonical ControlMap source is missing.");
assert(inputSource.includes("this.controlMap.mapKeyboard") && inputSource.includes("this.controlMap.mapGamepad"), "InputSystem must delegate physical mapping to ControlMap.");
assert(runtimeSource.includes("HOST_CORE_SOURCE_AUTHORITY"), "GameRuntime must publish source authority.");

for (const name of [
  "HOST_CORE_Blueprint_v1.md",
  "HOST_CORE_Implementation_Plan_v1.md",
  "HOST_CORE_Controls_UI_Camera_v1.md",
  "HOST_CORE_Chemistry_Core_Growth_v1.md",
  "HOST_CORE_Region_Grammar_v1.md"
]) {
  assert(existsSync(join(root, "reference_docs", name)), `reference doc must travel with build: ${name}`);
}

assert(translation.translationRule.includes("Authored GateSystem thresholds are valid"), "true-source translation must restore authored GateSystem validity.");
assert(!translation.translationRule.includes("old chambers/gates do not return"), "blanket no-gates rule must be removed.");
assert(translation.legacyBlueprintRoleMap.find((entry) => entry.legacyRole === "Hub Chamber")?.translationStatus === "functional_proxy_not_first_slice_lock", "Signal Chorus must be documented as a Hub proxy, not a completed Hub Chamber lock.");

for (const recipe of [surface, guide, chorus]) {
  assert(recipe.controlMap === HOST_CORE_CONTROL_MAP_ID, `${recipe.id} must bind the canonical ControlMap.`);
  const text = JSON.stringify(recipe);
  assert(!text.includes("A/F") && !text.includes("A/X") && !text.includes("A or X") && !text.includes("Y/V"), `${recipe.id} contains stale control copy.`);
}
assert(camera.activation.controllerButtonIndex === 3 && camera.activation.keyboardCode === "KeyF", "Guide focus camera must use Y / F.");
assert(camera.activation.keyboardAliases?.includes("KeyV"), "V must remain an explicit compatibility alias.");

assert(!surfaceSource.includes("input?.absorbHeld ||") && !surfaceSource.includes("contextButtonDown"), "Surface Wake stabilize interaction must not accept absorb or A context fallback.");
assert(!guideSource.includes("input?.absorbHeld ||") && !guideSource.includes("contextButtonDown"), "Guide Threshold stabilize interaction must not accept absorb or A context fallback.");
assert(!chorusSource.includes("resonanceHeld || frameState.input?.absorbHeld"), "Signal Chorus stabilize interaction must not accept absorb fallback.");

const buttons = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }));
const pad = { index: 0, id: "Test Xbox Controller", mapping: "standard", axes: [0, 0, 0, 0], buttons };
Object.defineProperty(globalThis, "navigator", { configurable: true, value: { getGamepads: () => [pad] } });
const frame = {
  frame: 1,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  input: {},
  inputSource: {},
  targeting: { targetId: "none" },
  controllerOnboarding: { tuning: null },
  surfaceWakeLayeredInteraction: { active: true, completed: false, expectsHold: false }
};
const input = new InputSystem({ controlMap: new ControlMap() });
const setButton = (index, value = 0, pressed = value > 0) => { buttons[index] = { value, pressed, touched: false }; };
const next = () => { frame.frame += 1; input.update(1 / 60, frame); };

// X = Pulse only.
setButton(2, 1, true); next();
assert(frame.input.pulsePressed && !frame.input.interactPressed, "X must produce pulse only.");
setButton(2, 0, false); next();

// A = Interact only.
setButton(0, 1, true); next();
assert(frame.input.interactPressed, "A must produce interact.");
assert(!frame.input.pulsePressed && !frame.input.absorbHeld && !frame.input.stabilizeHeld, "A must never become pulse, absorb, or stabilize.");
setButton(0, 0, false); next();

// RT = Absorb, never vertical movement.
setButton(7, 1, true); next();
assert(frame.input.absorbHeld && !frame.input.stabilizeHeld, "RT must own absorb.");
assert(frame.input.moveY === 0, "RT must not move vertically.");
setButton(7, 0, false); next();

// LT = Stabilize and the temporary resonance compatibility alias.
setButton(6, 1, true); next();
assert(frame.input.stabilizeHeld && frame.input.resonanceHeld, "LT must own stabilize and resonance compatibility.");
assert(!frame.input.absorbHeld && frame.input.moveY === 0, "LT must not absorb or move vertically.");
setButton(6, 0, false); next();

// Y = Guide focus and current tight-camera toggle.
setButton(3, 1, true); next();
assert(frame.input.guideFocusPressed && frame.input.toggleInspectionCameraPressed, "Y must own Guide focus and current tight-camera toggle.");
setButton(3, 0, false); next();

// R3 = Recenter / target lock action edge.
setButton(11, 1, true); next();
assert(frame.input.recenterCameraPressed, "R3 must produce recenter.");

assert(frame.controlMap.id === HOST_CORE_CONTROL_MAP_ID && frame.inputSource.canonicalControlsActive, "runtime must publish canonical ControlMap diagnostics.");
assert(frame.inputSource.contextButtonActsAsPulse === false && frame.inputSource.contextButtonActsAsHold === false, "legacy A contextual remapping must remain disabled.");

console.log("validateHostCoreSourceRebaselineHC006H validation passed.");
