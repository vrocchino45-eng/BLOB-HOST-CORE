import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StatusPageSystem } from "../src/ui/StatusPageSystem.js";
import { ObjectiveSystem } from "../src/systems/ObjectiveSystem.js";
import { GateSystem } from "../src/systems/GateSystem.js";
import { GateRegistry } from "../src/world/GateRegistry.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateVerticalReadabilityHubLatchHC008E] ${message}`);
};
const source = (file) => fs.readFileSync(path.join(root, file), "utf8");

class FakeElement {
  constructor() {
    this.style = {};
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
    this.scrollTop = 0;
  }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
}
globalThis.document = {
  body: new FakeElement(),
  createElement: () => new FakeElement()
};

const frameState = {
  frame: 810,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  currentMode: { id: "hub_mode", regionId: "hub_chamber" },
  input: { statusPageTogglePressed: true },
  playerComposition: {},
  chemistry: {},
  bondState: {},
  chemObjectState: {},
  controlMap: {},
  signalChorusLayeredInteraction: { completed: true },
  hubInvestigationGameplay: { investigationReady: false },
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
};

const objectiveRegistry = {
  getByRegionId: () => ({
    id: "hub_read_route_gates",
    regionId: "hub_chamber",
    steps: ["hub_junction_anchor_readable", "three_route_gate_layout_readable", "active_route_identity_distinguished", "first_memory_fragment_readable", "first_status_page_use"]
  })
};
const regionRegistry = { getByRuntimeCellId: () => ({ id: "hub_chamber" }) };
const gateRegistry = new GateRegistry(JSON.parse(source("public/data/gates/firstSliceGates_HC006I.json")));

const status = new StatusPageSystem({ appRoot: new FakeElement(), frameState });
const objectives = new ObjectiveSystem({ objectiveRegistry, regionRegistry, frameState });
const gates = new GateSystem({ gateRegistry, frameState });
status.init();

status.update(1 / 60, frameState);
assert(frameState.statusPage.open, "Status Page must open before investigation convergence.");
assert(frameState.statusPage.hubSelfReadingIntentLatched, "Hub self-reading intent must latch on open.");
assert(!frameState.statusPage.firstHubUseComplete, "Opening early must not bypass the investigation.");

frameState.frame += 1;
frameState.input.statusPageTogglePressed = false;
frameState.hubInvestigationGameplay.investigationReady = true;
status.update(1 / 60, frameState);
assert(frameState.statusPage.firstHubUseComplete, "Latched open intent did not commit when investigation became ready.");
assert(frameState.statusPage.firstHubUseCommitFrame === 811, "Deferred commit frame was not recorded.");

objectives.update(1 / 60, frameState);
assert(frameState.objectiveState.progress === 1 && frameState.objectiveState.complete, "Hub objective did not consume the repaired self-reading latch.");
gates.update(1 / 60, frameState);
assert(frameState.firstSliceGates.hub_to_grave_memory_route.crossable, "Grave Memory did not become crossable after the repaired latch.");

frameState.input.statusPageTogglePressed = true;
status.update(1 / 60, frameState);
assert(!frameState.statusPage.open, "Status Page did not close.");
assert(frameState.statusPage.firstHubUseComplete, "Hub self-reading completion did not persist after close.");

const cameraSource = source("src/core/GameRuntime.js");
assert(cameraSource.includes('pass: "HC-008E"') || cameraSource.includes('pass: "HC-008F"') || cameraSource.includes('pass: "HC-008G"'), "HC-008E-or-later camera diagnostics missing.");
assert(cameraSource.includes("normalizedAltitude * 0.16") || cameraSource.includes("normalizedAltitude * 0.22"), "Altitude-dependent camera pitch feedback missing.");
assert(cameraSource.includes("Math.abs(normalizedAltitude) * 3"), "Altitude-dependent field-of-view feedback missing.");

const ecologySource = source("src/opening/SurfaceWakeEcologicalCausalitySystem.js");
assert(ecologySource.includes("surface_wake_player_altitude_filament"), "Player altitude filament missing.");
assert(ecologySource.includes("surface_wake_player_altitude_anchor"), "Player lower-plane anchor missing.");
assert(ecologySource.includes("idleSeedPocketRingsSuppressed: true"), "Seed-pocket effect restraint diagnostic missing.");

const hudSource = source("src/ui/PlaytestHudSystem.js");
assert(hudSource.includes("listening learned / seed presented"), "Surface Wake seed-presentation label missing.");
assert(hudSource.includes("core grown / exit seam readable"), "Surface Wake outgrowth label missing.");

const morphSource = source("src/morph/LocalCellMorphSystem.js");
assert(morphSource.includes("progress * 1.85"), "Decisive Surface Wake presentation fade missing.");

console.log("HC-008E Vertical Readability and Hub Latch Repair validation passed.");
