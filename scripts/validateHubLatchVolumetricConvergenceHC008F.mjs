import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { InputSystem } from "../src/input/InputSystem.js";
import { StatusPageSystem } from "../src/ui/StatusPageSystem.js";
import { ObjectiveSystem } from "../src/systems/ObjectiveSystem.js";
import { GateSystem } from "../src/systems/GateSystem.js";
import { GateRegistry } from "../src/world/GateRegistry.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateHubLatchVolumetricConvergenceHC008F] ${message}`);
};
const source = (file) => fs.readFileSync(path.join(root, file), "utf8");

class FakeElement {
  constructor() {
    this.style = {};
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
    this.scrollTop = 0;
    this.id = "";
  }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
}

globalThis.document = {
  body: new FakeElement(),
  createElement: () => new FakeElement()
};

const makeFrame = (frame = 900, investigationReady = false) => ({
  frame,
  runtimeSeconds: frame / 60,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  currentMode: { id: "hub_mode", regionId: "hub_chamber" },
  input: {},
  playerComposition: {},
  chemistry: {},
  bondState: {},
  chemObjectState: {},
  controlMap: {},
  signalChorusLayeredInteraction: { completed: true },
  hubInvestigationGameplay: { investigationReady },
  hubChamberFoundation: {
    active: true,
    completed: true,
    centralAnchorReadable: true,
    threeRouteLayoutReadable: true,
    activeRouteIdentityDistinguished: true,
    firstMemoryFragmentReadable: true,
    activeRouteId: "grave_memory_route",
    routeCount: 3,
    dormantRouteCount: 2
  }
});

const keyEvent = (code) => ({
  code,
  repeat: false,
  preventDefault() {}
});

const frameState = makeFrame();
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: { getGamepads: () => [] }
});
const input = new InputSystem();
const status = new StatusPageSystem({ appRoot: new FakeElement(), frameState });
status.init();

input.onKeyDown(keyEvent("Tab"));
input.update(1 / 60, frameState);
assert(frameState.input.statusPageTogglePressed, "Keyboard Tab did not produce a Status action.");
assert(frameState.input.statusPageEventId === 1, "Keyboard Status action did not receive sequence 1.");
assert(frameState.input.statusPageSource === "keyboard_tab", "Keyboard Status source was not retained.");
status.update(1 / 60, frameState);
assert(frameState.statusPage.open, "Keyboard Status action did not reach StatusPageSystem.");
assert(frameState.statusPage.hubSelfReadingIntentLatched, "Early Hub self-reading intent did not latch.");
assert(!frameState.statusPage.firstHubUseComplete, "Early Status open bypassed Hub investigation.");
assert(frameState.statusPageInputAudit.consumedBy === "StatusPageSystem", "Status action consumption was not audited.");

frameState.frame += 1;
frameState.hubInvestigationGameplay.investigationReady = true;
input.onKeyUp(keyEvent("Tab"));
input.update(1 / 60, frameState);
status.update(1 / 60, frameState);
assert(frameState.statusPage.firstHubUseComplete, "Latched keyboard intent did not commit after investigation readiness.");
assert(frameState.statusPage.commitConfirmationVisible, "Self-reading commit confirmation was not published.");
assert(frameState.statusPageInputAudit.result === "hub_self_reading_committed", "Commit audit result is missing.");

const objectiveRegistry = {
  getByRegionId: () => ({
    id: "hub_read_route_gates",
    regionId: "hub_chamber",
    steps: [
      "hub_junction_anchor_readable",
      "three_route_gate_layout_readable",
      "active_route_identity_distinguished",
      "first_memory_fragment_readable",
      "first_status_page_use"
    ]
  })
};
const regionRegistry = { getByRuntimeCellId: () => ({ id: "hub_chamber" }) };
const gateRegistry = new GateRegistry(JSON.parse(source("public/data/gates/firstSliceGates_HC006I.json")));
const objectives = new ObjectiveSystem({ objectiveRegistry, regionRegistry, frameState });
const gates = new GateSystem({ gateRegistry, frameState });
objectives.update(1 / 60, frameState);
gates.update(1 / 60, frameState);
assert(frameState.objectiveState.complete, "ObjectiveSystem did not consume committed self-reading.");
assert(frameState.firstSliceGates.hub_to_grave_memory_route.crossable, "GateSystem did not make Grave Memory crossable.");
frameState.frame += 1;
input.update(1 / 60, frameState);
status.update(1 / 60, frameState);
assert(frameState.statusPage.objectiveConsumedCompletion, "Objective consumption proof was not published.");
assert(frameState.statusPage.gateConsumedCompletion, "Gate consumption proof was not published.");

const buttons = Array.from({ length: 16 }, () => ({ value: 0, pressed: false, touched: false }));
const pad = { index: 0, id: "HC008F test pad", mapping: "standard", axes: [0, 0, 0, 0], buttons };
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: { getGamepads: () => [pad] }
});
const controllerFrame = makeFrame(960, true);
const controllerInput = new InputSystem();
const controllerStatus = new StatusPageSystem({ appRoot: new FakeElement(), frameState: controllerFrame });
controllerStatus.init();

buttons[8] = { value: 1, pressed: true, touched: true };
controllerInput.update(1 / 60, controllerFrame);
controllerStatus.update(1 / 60, controllerFrame);
assert(controllerFrame.statusPage.open, "Controller View/Select did not open Status.");
assert(controllerFrame.statusPage.lastToggleSource === "gamepad_view_select_button_8", "View/Select source was not retained.");

controllerFrame.frame += 1;
buttons[8] = { value: 0, pressed: false, touched: false };
controllerInput.update(1 / 60, controllerFrame);
controllerStatus.update(1 / 60, controllerFrame);
controllerFrame.frame += 1;
buttons[9] = { value: 1, pressed: true, touched: true };
controllerInput.update(1 / 60, controllerFrame);
controllerStatus.update(1 / 60, controllerFrame);
assert(!controllerFrame.statusPage.open, "Controller Menu/Start fallback did not close Status.");
assert(controllerFrame.statusPage.lastToggleSource === "gamepad_menu_start_button_9", "Menu/Start source was not retained.");

const cameraSource = source("src/core/GameRuntime.js");
assert(cameraSource.includes("verticalCameraAnchorY"), "Delayed vertical camera anchor is missing.");
assert(cameraSource.includes("screenAltitudeOffset"), "Visible screen-space altitude offset diagnostic is missing.");
assert(cameraSource.includes("hubTerritoryFraming"), "Hub volumetric camera framing diagnostic is missing.");

const environmentSource = source("src/visual/composers/EnvironmentVisualComposer.js");
assert(environmentSource.includes("nursery_vertical_support_rib"), "Vertical nursery anatomy supports are missing.");
assert(environmentSource.includes("opacity: 0.14"), "Milky nursery enclosure was not reduced.");

const ecologySource = source("src/opening/SurfaceWakeEcologicalCausalitySystem.js");
assert(ecologySource.includes("surface_wake_altitude_landmark_"), "Three altitude landmarks are missing.");
assert(ecologySource.includes("phaseAge <= 2.2"), "Seed presentation effect is not time-bounded.");

const targetingSource = source("src/targeting/TargetingSystem.js");
assert(targetingSource.includes("body_first_context_only_reticle"), "Context-only targeting visual policy is missing.");
assert(targetingSource.includes("idlePointerSuppressed"), "Idle pointer suppression diagnostic is missing.");

const hubSource = source("src/hub/HubChamberFoundationSystem.js");
assert(!hubSource.includes("new THREE.TorusGeometry"), "Hub foundation still constructs orbital ring bodies.");
assert(hubSource.includes("hub_gate_vascular_rhythm_vessel"), "Vascular route body is missing.");
assert(hubSource.includes("hub_gate_silt_compressed_plate"), "Silt route body is missing.");
assert(hubSource.includes("retainedSignalIdentityHidden"), "Retained Signal Chorus suppression is not explicit.");

const hubRecipe = JSON.parse(source("public/data/hub/hubChamberPresentationLock_HC006JA.json"))[0];
const byId = Object.fromEntries(hubRecipe.routes.map((route) => [route.id, route]));
assert(byId.vascular_route.position[1] > 1.5, "Vascular route is not in the upper territory.");
assert(Math.abs(byId.grave_memory_route.position[1]) < 0.75, "Grave route is not in the middle territory.");
assert(byId.silt_burrow_route.position[1] < -1.5, "Silt route is not in the lower territory.");
for (const route of Object.values(byId)) {
  const [x, y, z] = route.position;
  const normalizedBoundaryRadius = Math.hypot(x / 6.4, y / 3.45, z / 4.8);
  assert(normalizedBoundaryRadius <= 1.22, `${route.id} territory is outside practical player reach.`);
}

console.log("HC-008F Hub Latch Proof + Volumetric Traversal Convergence validation passed.");
