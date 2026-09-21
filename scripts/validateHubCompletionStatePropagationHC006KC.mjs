import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";
import { StatusPageSystem } from "../src/ui/StatusPageSystem.js";
import { ObjectiveSystem } from "../src/systems/ObjectiveSystem.js";
import { GateSystem } from "../src/systems/GateSystem.js";
import { RegionRegistry } from "../src/world/RegionRegistry.js";
import { ObjectiveRegistry } from "../src/world/ObjectiveRegistry.js";
import { GateRegistry } from "../src/world/GateRegistry.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateHubCompletionStatePropagationHC006KC] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
assert(
  (([["HC-006KC","0.0.97"],["HC-006KD","0.0.98"],["HC-007A","0.0.99"],["HC-007B","0.0.100"],["HC-007C","0.0.101"],["HC-007D", "0.0.102", "0.0.103", "0.0.104", "0.0.105"], ["HC-007E", "0.0.103", "0.0.104", "0.0.105"], ["HC-008B", "0.0.104"], ["HC-008C", "0.0.105"], ["HC-008D", "0.0.106"], ["HC-008E", "0.0.107", "0.0.108"], ["HC-008F", "0.0.108"], ["HC-008G", "0.0.109"]].some(([id, version]) => manifest.id === id && manifest.version === version)) || (manifest.id === "HC-014G" && manifest.version === "0.0.140") || (manifest.id === "HC-014I" && manifest.version === "0.0.142")),
  "manifest identity mismatch"
);
assert(["0.0.97","0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), "package version mismatch");

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

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.position.set(0.2, -0.22, -1.4);
scene.add(playerRoot);

const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  currentMode: {
    id: "hub_mode",
    regionId: "hub_chamber",
    regionDisplayName: "Hub Chamber",
    label: "Hub Mode",
    hostFunction: "internal Host junction for authored route identity",
    gateOutId: "hub_first_route_gate_set",
    visualLanguageId: "hub_chamber_route_chorus"
  },
  input: {},
  playerComposition: {},
  chemistry: {},
  bondState: {},
  chemObjectState: {},
  controlMap: {},
  guideThresholdLayeredInteraction: { completed: true, stage: "guide_threshold_complete_retained" },
  secondLocalCellMorph: { completed: true },
  // Critical live regression: the later post-Grave layered interaction has not run.
  signalChorusLayeredInteraction: { active: false, completed: false, stage: "inactive", progress: 0 },
  graveRouteLock: { routeLocked: false },
  interactionInspectionFocus: {},
  promptStack: {},
  nonFatalSystemErrors: []
};

const hub = new HubChamberFoundationSystem({ recipeDataSystem, scene, playerRoot, frameState });
hub.init();
for (let i = 0; i < 180; i += 1) {
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  hub.update(1 / 60, frameState);
}

assert(frameState.hubChamberFoundation.completed === true, "first-Hub foundation remained incomplete without the later post-Grave layered interaction");
assert(frameState.hubChamberFoundation.activeRouteIdentityDistinguished === true, "first-Hub active route identity still depends on the later layered interaction");
assert(frameState.hubPresentationOwnership?.hubInstructionsExclusive === true, "HubMode did not take exclusive presentation ownership when its own junction became readable");

const regionRegistry = new RegionRegistry(readJson("public/data/world/firstSliceRegions_HC006I.json"));
const objectiveRegistry = new ObjectiveRegistry(readJson("public/data/objectives/firstSliceObjectives_HC006I.json"));
const gateRegistry = new GateRegistry(readJson("public/data/gates/firstSliceGates_HC006I.json"));
const objectives = new ObjectiveSystem({ objectiveRegistry, regionRegistry, frameState });
const gates = new GateSystem({ gateRegistry, frameState });
const status = new StatusPageSystem({ appRoot: new FakeElement(), frameState });
status.init();

objectives.update(1 / 60, frameState);
gates.update(1 / 60, frameState);
assert(frameState.objectiveState.progress === 0.8 && frameState.objectiveState.complete === false, "Hub objective should wait at 80% only for first Status Page use");
assert(frameState.firstSliceGates.hub_to_grave_memory_route.status === "readable", "Grave Memory should be readable before self-reading");
assert(frameState.firstSliceGates.hub_to_grave_memory_route.departureBlockedBy === "first_hub_status_page_use_pending", "pre-self-reading blocker is not explicit");

status.activeTabIndex = 2;
frameState.input = { statusPageTogglePressed: true };
status.update(1 / 60, frameState);
assert(frameState.statusPage.firstHubUseComplete === true, "firstHubUse did not commit on open");

// Same runtime tick: derived ownership systems consume the committed self-reading.
objectives.update(1 / 60, frameState);
gates.update(1 / 60, frameState);
assert(frameState.objectiveState.progress === 1 && frameState.objectiveState.complete === true, "Hub objective did not propagate to 100%");
const graveGate = frameState.firstSliceGates.hub_to_grave_memory_route;
assert(graveGate.status === "crossable" && graveGate.crossable === true, "Grave Memory did not become crossable");
assert(graveGate.departureBlockedBy === "none", "crossable Grave Memory retained a false blocker");

// Hub presentation consumes firstHubUse on the next presentation update and exposes it to the Region tab.
frameState.input = {};
hub.update(1 / 60, frameState);
objectives.update(1 / 60, frameState);
gates.update(1 / 60, frameState);
await Promise.resolve();
status.render(frameState);
assert(status.content.innerHTML.includes("100%"), "open Region tab did not show 100% after propagation");
assert(status.content.innerHTML.includes("crossable"), "open Region tab did not show Grave Memory crossable");

console.log("HC-006KC Hub completion state propagation validation passed.");
