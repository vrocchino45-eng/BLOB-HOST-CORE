import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { HubChamberFoundationSystem } from "../src/hub/HubChamberFoundationSystem.js";
import { HubInvestigationGameplaySystem } from "../src/hub/HubInvestigationGameplaySystem.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (file) => fs.readFileSync(path.join(root, file), "utf8");
const json = (file) => JSON.parse(source(file));
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateHubSpatialAuthorityConvergenceHC008G] ${message}`);
};

const manifest = json("public/data/build/buildManifest.json");
const pkg = json("package.json");
const hubRecipe = json("public/data/hub/hubChamberPresentationLock_HC006JA.json")[0];
const investigationRecipe = json("public/data/hub/hubInvestigationGameplay_HC007C.json")[0];

assert(
  (((manifest.id === "HC-008G" && manifest.version === "0.0.109")
  || (manifest.id === "HC-009A" && manifest.version === "0.0.110")
  || (manifest.id === "HC-009B" && manifest.version === "0.0.111")
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
assert(hubRecipe.spatialAuthority?.pass === "HC-008G", "Hub spatial-authority recipe contract missing");
assert(hubRecipe.spatialAuthority?.visualOwner === "HubChamberFoundationSystem", "Hub visual owner changed");
assert(investigationRecipe.visual?.duplicateMarkersDisabledBy === "HC-008G", "duplicate investigation marker disable is missing");

const byId = Object.fromEntries(hubRecipe.routes.map((route) => [route.id, route]));
assert(byId.vascular_route.position[1] > 2, "Vascular Rhythm is not an upper territory");
assert(Math.abs(byId.grave_memory_route.position[1]) < 0.75, "Grave Memory is not a middle territory");
assert(byId.silt_burrow_route.position[1] < -2, "Silt Pressure is not a lower territory");
assert(
  Math.abs(byId.vascular_route.position[0] - byId.silt_burrow_route.position[0]) >= 9,
  "upper and lower territories lost wide lateral separation"
);

const hubSource = source("src/hub/HubChamberFoundationSystem.js");
const investigationSource = source("src/hub/HubInvestigationGameplaySystem.js");
const cameraSource = source("src/core/GameRuntime.js");
const playerComposerSource = source("src/visual/composers/ChemObjectVisualComposer.js");
const visualComposerSource = source("src/visual/VisualComposer.js");

assert(hubSource.includes("hub_chamber_spatial_authority_HC008G"), "single Hub authority root missing");
assert(hubSource.includes("hub_route_corridor_"), "anatomical route corridors missing");
assert(hubSource.includes("hub_route_comparison_basin"), "return-to-center comparison cradle missing");
assert(hubSource.includes("hub_foreground_frame_rib_"), "foreground depth anatomy missing");
assert(hubSource.includes("hub_background_membrane_lobe_"), "background depth anatomy missing");
assert(hubSource.includes("hub_player_identity_wake_"), "player motion wake missing");
assert(!hubSource.includes("hub_route_spoke_"), "global route spokes still exist");
assert(!hubSource.includes("new THREE.TorusGeometry"), "Hub authority still constructs orbital rings");
assert(investigationSource.includes("logicOnly: true"), "Hub investigation is not logic-only");
assert(
  investigationSource.includes('visualAuthorityDelegatedTo: "HubChamberFoundationSystem"'),
  "Hub investigation does not delegate visual authority"
);
assert(!investigationSource.includes("hub_investigation_marker_"), "duplicate route marker geometry still exists");
assert(!investigationSource.includes("hub_investigation_memory_marker"), "duplicate memory marker geometry still exists");
assert(!investigationSource.includes("hub_investigation_center_return_marker"), "duplicate center marker geometry still exists");
assert(cameraSource.includes("player_tethered_territory_exploration"), "local Hub exploration camera mode missing");
assert(cameraSource.includes("hubExplorationDistance"), "closer Hub exploration distance missing");
assert(cameraSource.includes("hubWholeJunctionViewAvailableThroughGuideFocus"), "wide Guide-focus view preservation missing");
assert(
  playerComposerSource.includes("player_seed_orientation_fin_")
  || playerComposerSource.includes("player_seed_propulsion_fin_"),
  "body-first player fins missing"
);
assert(
  visualComposerSource.includes("hub_body_first_identity")
  || visualComposerSource.includes("authored_seed_body"),
  "Hub player identity mode missing"
);
assert(visualComposerSource.includes("idleOrbitEffectsSuppressed"), "Hub player idle-ring suppression missing");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(requestPath) {
  const relative = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  return JSON.parse(fs.readFileSync(path.join(root, "public", relative), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.position.set(0.1, -0.15, -1.25);
scene.add(playerRoot);

const legacyNames = [
  "signal_chorus_layered_interaction_HC006B",
  "signal_chorus_combward_pressure_HC005D",
  "signal_chorus_living_tissue_identity_HC006A",
  "choir_resonance_node_001",
  "listening_pore_membrane_001",
  "harmonic_wave_thread_001",
  "seed_signal_bridge_001",
  "membrane_watcher_001",
  "guide_path_shimmer_line",
  "signal_chorus_nerve_surface_001",
  "signal_chorus_soft_haze_001"
];
for (const name of legacyNames) {
  const object = new THREE.Group();
  object.name = name;
  object.visible = true;
  scene.add(object);
}

const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
  input: { pulsePressed: false, pulseEventId: 0 },
  playerKinematics: {
    position: { x: playerRoot.position.x, y: playerRoot.position.y, z: playerRoot.position.z },
    velocity: { x: 0, y: 0, z: -0.4 },
    speed: 0.4,
    altitude: playerRoot.position.y
  },
  signalChorusLayeredInteraction: {
    active: true,
    completed: true,
    stage: "layered_interaction_complete"
  },
  statusPage: { firstHubUseComplete: false },
  graveRouteLock: { routeLocked: false },
  firstSliceGates: {
    hub_to_grave_memory_route: { readable: true, crossable: false }
  },
  physicalFeel: { viscosity: 0.48, pressure: 0.18 },
  promptStack: {},
  interactionInspectionFocus: {}
};

const foundation = new HubChamberFoundationSystem({
  recipeDataSystem,
  scene,
  playerRoot,
  frameState
});
const investigation = new HubInvestigationGameplaySystem({
  recipeDataSystem,
  scene,
  playerRoot,
  frameState
});
foundation.init();
investigation.init();

const updateFrame = (position = null, pulse = false) => {
  if (position) playerRoot.position.fromArray(position);
  frameState.playerKinematics.position = {
    x: playerRoot.position.x,
    y: playerRoot.position.y,
    z: playerRoot.position.z
  };
  frameState.playerKinematics.altitude = playerRoot.position.y;
  frameState.input.pulsePressed = pulse;
  if (pulse) frameState.input.pulseEventId += 1;
  frameState.frame += 1;
  frameState.runtimeSeconds += 1 / 60;
  foundation.update(1 / 60, frameState);
  investigation.update(1 / 60, frameState);
  frameState.input.pulsePressed = false;
};

for (let index = 0; index < 150; index += 1) updateFrame();

assert(frameState.hubChamberFoundation.active, "Hub authority did not activate");
assert(frameState.hubChamberFoundation.singleCompositionOwner, "single Hub composition owner not published");
assert(frameState.hubChamberFoundation.routeCorridorCount === 3, "three anatomical route corridors not published");
assert(frameState.hubChamberFoundation.depthLayerCount === 3, "three depth layers not published");
assert(frameState.hubChamberFoundation.cameraMode === "player_tethered_territory_exploration", "Hub did not leave wide establishing view");
assert(frameState.hubPresentationOwnership?.owner === "HubChamberFoundationSystem", "Hub presentation owner changed");
assert(frameState.hubReadability?.investigationVisualsDelegated, "investigation visual delegation not published");
assert(frameState.hubReadability?.longConnectorLinesDisabled, "long connector-line suppression not published");
assert(investigation.root.children.length === 0, "logic-only investigation created visual children");
assert(frameState.hubInvestigationGameplay.visualAuthorityDelegatedTo === "HubChamberFoundationSystem", "investigation state lost delegated authority");

for (const name of legacyNames) {
  assert(scene.getObjectByName(name)?.visible === false, `${name} remained visible under Hub authority`);
}

for (const route of hubRecipe.routes) {
  const corridor = scene.getObjectByName(`hub_route_corridor_${route.id}`);
  const gate = scene.getObjectByName(`hub_route_gate_${route.id}`);
  const backdrop = scene.getObjectByName(`hub_territory_backdrop_${route.id}`);
  assert(corridor && gate && backdrop, `${route.id} territory composition incomplete`);
  const bodies = [];
  corridor.traverse((child) => {
    if (child.name?.includes("_corridor_body_")) bodies.push(child);
  });
  assert(bodies.length >= 7, `${route.id} corridor lacks traversable body landmarks`);
}

for (const route of investigationRecipe.routes) {
  updateFrame(route.position, true);
  updateFrame(route.position, false);
  assert(frameState.hubInvestigationGameplay.routeReads.includes(route.id), `${route.id} reading failed`);
}
updateFrame(investigationRecipe.memoryFragment.position, true);
updateFrame(investigationRecipe.memoryFragment.position, false);
assert(frameState.hubInvestigationGameplay.memoryRead, "suspended memory reading failed");
updateFrame(investigationRecipe.center.position, false);
updateFrame(investigationRecipe.center.position, false);
assert(frameState.hubInvestigationGameplay.investigationReady, "return-to-center comparison failed");

foundation.update(1 / 60, frameState);
for (const route of hubRecipe.routes) {
  const leaf = scene.getObjectByName(`hub_comparison_leaf_${route.id}`);
  assert(leaf?.visible && leaf.material.opacity >= 0.5, `${route.id} did not persist in the comparison cradle`);
}

assert(frameState.hubChamberFoundation.routeActivated === false, "presentation authority activated a route");
assert(frameState.hubChamberFoundation.newRouteContentActivated === false, "presentation authority activated new content");
assert(frameState.hubInvestigationGameplay.directObjectiveCompletion === false, "investigation bypassed ObjectiveSystem");
assert(frameState.hubInvestigationGameplay.dormantRoutesOpened === false, "investigation opened dormant routes");

console.log("HC-008G Hub Spatial Authority Convergence validation passed.");
