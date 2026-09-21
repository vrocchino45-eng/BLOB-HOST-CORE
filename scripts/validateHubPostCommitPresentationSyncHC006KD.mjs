import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const manifest = json("public/data/build/buildManifest.json");
const pkg = json("package.json");
assert(
  ((["HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id) && ["0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version)) || (manifest.id === "HC-014G" && manifest.version === "0.0.140") || (manifest.id === "HC-014I" && manifest.version === "0.0.142")),
  "manifest identity mismatch"
);
assert(["0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), "package version mismatch");

const morphSource = read("src/morph/MorphReadabilitySystem.js");
const hubBranch = morphSource.indexOf("const hubPresentationActive");
const signalBranch = morphSource.indexOf("const signalReturnState = frameState.signalChorusReturnState");
assert(hubBranch >= 0 && signalBranch > hubBranch, "Hub tissue presentation must preempt retained Signal Chorus return messaging.");
assert(morphSource.includes("Hub junction: Grave Memory is crossable."), "crossable Hub tissue status missing");
assert(morphSource.includes("Vascular Rhythm and Silt Pressure remain dormant."), "dormant-route tissue guidance missing");

const hubSource = read("src/hub/HubChamberFoundationSystem.js");
assert(
  hubSource.includes('gateAvailability = publishedGate?.crossable')
    || hubSource.includes('gateAvailability: routeCrossable'),
  "Hub active gate visual must read GateSystem crossability"
);
assert(hubSource.includes('postCommitPresentationSynced'), "post-commit presentation diagnostic missing");
assert(hubSource.includes('staleSignalReturnMessagingSuppressed'), "stale Signal suppression diagnostic missing");

// Minimal state simulation for player-facing route status after commit.
const recipe = {
  id: "HUB_CHAMBER_PRESENTATION_LOCK_HC006JA",
  sourceCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  activation: { revealSeconds: 0.4 },
  junction: { position:[0,0,0], radius:1, ringCount:3, memoryFragmentPosition:[0,0,0] },
  visual: {},
  camera: {},
  routes: [
    { id:"grave_memory_route", displayName:"Grave Memory", gateId:"hub_to_grave_memory_route", status:"active_route", position:[2,0,0], controlA:[.5,0,0], controlB:[1,0,0], color:0xffffff, secondaryColor:0xffd9a0 },
    { id:"vascular_rhythm_route", displayName:"Vascular Rhythm", gateId:"hub_to_vascular_route", status:"dormant_route", position:[-2,0,0], controlA:[-.5,0,0], controlB:[-1,0,0], color:0x99ccff, secondaryColor:0xffffff }
  ]
};
const recipeDataSystem = { get: () => recipe };
const scene = { add(){}, getObjectByName(){ return null; } };
const playerRoot = { position: { distanceTo(){ return 0; } } };
const frameState = {
  activeCellId:"CELL_SIGNAL_CHORUS_NERVE_001",
  runtimeSeconds:10,
  statusPage:{ firstHubUseComplete:true },
  firstSliceGates:{ hub_to_grave_memory_route:{ id:"hub_to_grave_memory_route", readable:true, crossable:true } },
  graveRouteLock:{ routeLocked:true },
  signalChorusLayeredInteraction:{ completed:false, active:false }
};
const hub = new HubChamberFoundationSystem({ recipeDataSystem, scene, playerRoot, frameState });
hub.recipe = recipe;
hub.reveal = 1;
hub.routeIdentityReveal = 1;
const state = hub.createState(true, true);
const grave = state.routes.find((route) => route.id === "grave_memory_route");
assert(state.fullHubComplete === true, "Hub must remain complete after committed self-reading");
assert(state.activeRouteCrossable === true, "Hub active route must remain crossable");
assert(grave?.runtimeStatus === "crossable", `Region route status should say crossable, got ${grave?.runtimeStatus}`);
assert(state.nextAction.includes("Grave Memory is crossable"), "Hub next action must communicate crossable route");

console.log("HC-006KD Hub post-commit presentation sync validation passed.");
