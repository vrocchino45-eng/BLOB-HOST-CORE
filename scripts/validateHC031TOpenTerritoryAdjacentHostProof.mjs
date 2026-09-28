import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { ApertureAdjacentTerritorySystem } from "../src/fields/ApertureAdjacentTerritorySystem.js";
import { ApertureFieldsArrivalSystem } from "../src/fields/ApertureFieldsArrivalSystem.js";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const sha256 = (relativePath) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relativePath))).digest("hex");

const pkg = readJson("package.json");
const contract = readJson("public/data/build/hc031tOpenTerritoryAdjacentHostProofContract.json");
const locked = readJson("public/data/build/hc031tLockedHashes.json");
const territorySource = readText("src/fields/ApertureAdjacentTerritorySystem.js");
const arrivalSource = readText("src/fields/ApertureFieldsArrivalSystem.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const telemetrySource = readText("src/core/SessionTelemetrySystem.js");
const mainSource = readText("src/main.js");

assert.equal(pkg.version, "0.31.41");
assert.equal(contract.pass, "HC-031T");
assert.equal(contract.parent, "HC-031S");
assert.equal(contract.telemetrySchema, "blob.session.telemetry.v1.43");
assert.match(mainSource, /buildId:\s*"HC-031T"/);
assert.match(mainSource, /buildLabel:\s*"Open Territory \/ Adjacent Host Proof"/);
assert.match(runtimeSource, /ApertureAdjacentTerritorySystem/);
assert.match(telemetrySource, /blob\.session\.telemetry\.v1\.43/);
assert.match(telemetrySource, /world\.adjacent_territory\.observed/);
assert.match(telemetrySource, /world\.adjacent_territory\.entered/);
assert.match(arrivalSource, /adjacent_gathering_territory_open_ellipsoid/);

// Ownership safety: the new territory system may read player/camera state and own
// its own presentation, but cannot move the player, change active-cell truth, or
// mutate route history / progression.
assert(!/this\.playerRoot\.position\.(?:set|copy|add|addScaledVector|sub)\(/.test(territorySource), "Adjacent territory system directly moves the player.");
assert(!/frameState\.activeCellId\s*=(?!=)/.test(territorySource), "Adjacent territory system directly changes active-cell truth.");
assert(!/frameState\.act1RouteHistory\s*=(?!=)/.test(territorySource), "Adjacent territory system mutates route history.");
assert(!/hubRouteCommitRequest/.test(territorySource), "Adjacent territory system writes Hub route commitment truth.");

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 500);
scene.add(camera);
camera.position.set(0, 0, 0);

const frameState = {
  buildId: "HC-031T",
  buildLabel: "Open Territory / Adjacent Host Proof",
  activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
  frame: 0,
  runtimeSeconds: 0,
  input: { pulsePressed: false, pulseEventId: 0, stabilizeHeld: false, absorbHeld: false },
  signalPlainEcology: { completed: true, localResponse: 1 },
  membraneRidgeGameplay: { completed: false },
  physicalFeel: {},
  act1RouteHistory: {}
};

const territory = new ApertureAdjacentTerritorySystem({ scene, camera, playerRoot, frameState });
territory.init();
territory.onRuntimeMount(frameState);
scene.updateMatrixWorld(true);
const territoryWorld = new THREE.Vector3(3.5, 8.5, -62.0);
camera.lookAt(territoryWorld);
camera.updateMatrixWorld(true);

function tick(dt = 0.05) {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  territory.update(dt, frameState);
  scene.updateMatrixWorld(true);
}
function pulse() {
  frameState.input.pulseEventId += 1;
  frameState.input.pulsePressed = true;
  tick(0.01);
  frameState.input.pulsePressed = false;
  tick(0.02);
}

// Ring C exists before traversal and can be read remotely with the camera/aim.
tick(0.01);
assert.equal(frameState.adjacentHostTerritory.detailTier, "ring_c_distant");
assert(frameState.adjacentHostTerritory.aimDot > 0.99);
assert.equal(frameState.adjacentHostTerritory.traversalOpen, false);
pulse();
assert.equal(frameState.adjacentHostTerritory.observationCount, 1);
assert.equal(frameState.adjacentHostTerritory.observationStage, "contour");
assert.equal(frameState.adjacentHostTerritory.detailTier, "ring_b_neighbor");

// Stabilize creates a bounded remote relationship; it does not move the territory.
frameState.input.stabilizeHeld = true;
for (let i = 0; i < 18; i += 1) tick(0.05);
assert.equal(frameState.adjacentHostTerritory.relationshipEstablished, true);
assert.equal(frameState.adjacentHostTerritory.relationshipSequence, 1);
const playerBeforeOpen = playerRoot.position.clone();

// Membrane Ridge remains the existing local proof. When it completes, connective
// anatomy becomes traversable and ApertureFieldsArrivalSystem expands its bounds.
frameState.membraneRidgeGameplay.completed = true;
tick(0.05);
assert.equal(frameState.adjacentHostTerritory.traversalOpen, true);
assert.equal(frameState.adjacentHostTerritory.connectiveAnatomyVisible, true);
assert(playerRoot.position.distanceTo(playerBeforeOpen) < 1e-9, "Opening adjacent territory moved the player.");

const arrival = new ApertureFieldsArrivalSystem({ scene, playerRoot, frameState });
arrival.init();
arrival.onRuntimeMount(frameState);
arrival.update(0.05, frameState);
assert.equal(frameState.physicalFeel.movementBounds.owner, "PlayerMovementController");
assert.equal(frameState.physicalFeel.movementBounds.tuningOwner, "ApertureFieldsArrivalSystem");
assert.equal(frameState.physicalFeel.movementBounds.mode, "adjacent_gathering_territory_open_ellipsoid");
assert(frameState.physicalFeel.movementBounds.radii.z >= 52);

// Continuous physical approach promotes the neighboring territory to local detail
// inside the same active cell: no teleport and no cell transition.
playerRoot.position.copy(territoryWorld);
scene.updateMatrixWorld(true);
tick(0.05);
assert.equal(frameState.adjacentHostTerritory.enteredTerritory, true);
assert.equal(frameState.adjacentHostTerritory.detailTier, "ring_a_local");
assert.equal(frameState.activeCellId, "CELL_APERTURE_FIELDS_ARRIVAL_001");
assert.equal(frameState.adjacentHostTerritory.teleportRequired, false);
assert.equal(frameState.adjacentHostTerritory.activeCellChangesRequired, false);

// Read-only telemetry exposes observation -> relationship -> traversal -> entry.
const telemetryFrame = {
  ...frameState,
  runtimeSeconds: 10,
  buildId: "HC-031T",
  buildLabel: "Open Territory / Adjacent Host Proof"
};
const telemetry = new SessionTelemetrySystem({ frameState: telemetryFrame, monotonicNowMs: () => 10000 });
telemetry.lastAdjacentTerritoryObservationSequence = 0;
telemetry.lastAdjacentTerritoryRelationshipSequence = 0;
telemetry.lastAdjacentTerritoryTraversalSequence = 0;
telemetry.lastAdjacentTerritoryEntrySequence = 0;
telemetry.observeAdjacentTerritory(telemetryFrame);
const types = telemetry.events.map((event) => event.type);
assert(types.includes("world.adjacent_territory.observed"));
assert(types.includes("world.adjacent_territory.relationship_established"));
assert(types.includes("world.adjacent_territory.traversal_opened"));
assert(types.includes("world.adjacent_territory.entered"));

for (const [relativePath, expected] of Object.entries(locked.files)) {
  assert.equal(sha256(relativePath), expected, `Locked neighboring owner changed: ${relativePath}`);
}

console.log(`[HC031T] PASS — Gathering Ground now moves from distant ghost context to remotely readable/reactive neighbor to continuously reachable local territory without teleport or active-cell change; ApertureFieldsArrivalSystem remains bounds owner and ${Object.keys(locked.files).length} neighboring gameplay owners are unchanged.`);
