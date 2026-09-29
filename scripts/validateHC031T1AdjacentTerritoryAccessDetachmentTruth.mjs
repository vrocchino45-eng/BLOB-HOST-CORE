import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { ApertureAdjacentTerritorySystem } from "../src/fields/ApertureAdjacentTerritorySystem.js";
import { ApertureFieldsArrivalSystem } from "../src/fields/ApertureFieldsArrivalSystem.js";
import { CoreTendrilSurfaceContactSystem } from "../src/player/CoreTendrilSurfaceContactSystem.js";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const sha256 = (relativePath) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relativePath))).digest("hex");

const pkg = readJson("package.json");
const contract = readJson("public/data/build/hc031t1AdjacentTerritoryAccessDetachmentTruthContract.json");
const locked = readJson("public/data/build/hc031t1LockedHashes.json");
const mainSource = readText("src/main.js");
const arrivalSource = readText("src/fields/ApertureFieldsArrivalSystem.js");
const territorySource = readText("src/fields/ApertureAdjacentTerritorySystem.js");
const tendrilSource = readText("src/player/CoreTendrilSurfaceContactSystem.js");
const telemetrySource = readText("src/core/SessionTelemetrySystem.js");

assert.equal(pkg.version, "0.31.42");
assert.equal(contract.pass, "HC-031T1");
assert.equal(contract.parent, "HC-031T");
assert.equal(contract.telemetrySchema, "blob.session.telemetry.v1.44");
assert.match(mainSource, /buildId:\s*"HC-031T1"/);
assert.match(mainSource, /buildLabel:\s*"Adjacent Territory Access \+ Detachment Truth"/);
assert.match(arrivalSource, /signal_plain_membrane_ridge_observation_ellipsoid/);
assert.match(territorySource, /aimThreshold = 0\.62/);
assert.match(tendrilSource, /movement ellipsoid is a safety volume, not a sucker target/);
assert.match(telemetrySource, /movement\.boundary_clamped/);
assert.match(telemetrySource, /blob\.session\.telemetry\.v1\.44/);

// Ownership safety: T1 does not take movement or targeting authority.
assert(!/this\.playerRoot\.position\.(?:set|copy|add|addScaledVector|sub)\(/.test(territorySource), "Adjacent territory system directly moves the player.");
assert(!/frameState\.activeCellId\s*=(?!=)/.test(territorySource), "Adjacent territory system directly changes active-cell truth.");

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 500);
scene.add(camera);

const frameState = {
  buildId: "HC-031T1",
  buildLabel: "Adjacent Territory Access + Detachment Truth",
  activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
  frame: 0,
  runtimeSeconds: 0,
  input: { pulsePressed: false, pulseEventId: 0, stabilizeHeld: false, absorbHeld: false },
  signalPlainEcology: { completed: true, localResponse: 1 },
  membraneRidgeGameplay: { completed: false },
  adjacentHostTerritory: { traversalOpen: false },
  physicalFeel: {},
  act1RouteHistory: {}
};

// Pre-open Aperture volume: the third Membrane Ridge contour is comfortably inside,
// but Gathering Ground center is still outside until the local ridge proof opens it.
const arrival = new ApertureFieldsArrivalSystem({ scene, playerRoot, frameState });
arrival.init();
arrival.onRuntimeMount(frameState);
arrival.update(0.05, frameState);
const bounds = frameState.physicalFeel.movementBounds;
assert.equal(bounds.mode, "signal_plain_membrane_ridge_observation_ellipsoid");
assert.deepEqual(bounds.radii, { x: 32, y: 12, z: 43 });
const norm = (point) => {
  const dx = (point.x - bounds.center.x) / bounds.radii.x;
  const dy = (point.y - bounds.center.y) / bounds.radii.y;
  const dz = (point.z - bounds.center.z) / bounds.radii.z;
  return Math.hypot(dx, dy, dz);
};
const ridge3 = new THREE.Vector3(21.7, 2.1, -47.4);
const gatheringCenter = new THREE.Vector3(3.5, 8.5, -62.0);
assert(norm(ridge3) < 0.82, `Membrane Ridge contour 3 lacks maneuvering margin: ${norm(ridge3)}`);
assert(norm(gatheringCenter) > 1.0, "Gathering Ground became physically local before traversal opened.");

// Macro acquisition reads visible body elements, not only the hidden center point.
const territory = new ApertureAdjacentTerritorySystem({ scene, camera, playerRoot, frameState });
territory.init();
territory.onRuntimeMount(frameState);
playerRoot.position.set(10, 5, -50);
const visibleDetail = territory.detailBodies[4];
const visibleDetailWorld = territory.entryAnchor.clone().add(visibleDetail.position);
camera.position.set(10, 5, -47);
camera.lookAt(visibleDetailWorld);
camera.updateMatrixWorld(true);
scene.updateMatrixWorld(true);
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
tick(0.01);
assert.equal(frameState.adjacentHostTerritory.aimed, true);
assert.notEqual(frameState.adjacentHostTerritory.aimSource, "none");
pulse();
assert.equal(frameState.adjacentHostTerritory.observationCount, 1);
assert.equal(frameState.adjacentHostTerritory.detailTier, "ring_b_neighbor");
frameState.input.stabilizeHeld = true;
for (let i = 0; i < 18; i += 1) tick(0.05);
assert.equal(frameState.adjacentHostTerritory.relationshipEstablished, true);
frameState.membraneRidgeGameplay.completed = true;
tick(0.05);
assert.equal(frameState.adjacentHostTerritory.traversalOpen, true);
arrival.update(0.05, frameState);
assert.equal(frameState.physicalFeel.movementBounds.mode, "adjacent_gathering_territory_open_ellipsoid");

// Boundary-only contact can still deform the Core elsewhere, but it cannot seal
// suction tendrils without authored surface truth or a live physical attachment.
const tendrilScene = new THREE.Scene();
const tendrilPlayer = new THREE.Group();
tendrilScene.add(tendrilPlayer);
const tendrilFrame = {
  playerKinematics: {
    movementBoundary: {
      owner: "PlayerMovementController",
      center: { x: 0, y: 0, z: 0 },
      radii: { x: 10, y: 6, z: 12 },
      surfaceNormal: { x: 0, y: 1, z: 0 }
    },
    velocity: { x: 0, y: 0, z: 0 },
    desiredMoveVector: { x: 0, y: 0, z: 0 }
  },
  coreContactLanguage: { state: "attached" },
  playerAttachment: { active: false, state: "free" },
  coreSurfaceTruth: { valid: false, mechanicalEligible: false },
  tightInspectionCamera: { coreWorkActive: false }
};
const tendrils = new CoreTendrilSurfaceContactSystem({ scene: tendrilScene, playerRoot: tendrilPlayer, frameState: tendrilFrame });
tendrils.init();
tendrils.update(0.05, tendrilFrame);
assert.equal(tendrilFrame.coreTendrilContact.contactState, "suspended");
assert.equal(tendrilFrame.coreTendrilContact.sealedCount, 0);
assert.equal(tendrilFrame.coreTendrilContact.boundaryOnlyContactSuppressed, true);

// A real authored surface still bootstraps tendril contact.
tendrilFrame.coreSurfaceTruth = {
  valid: true,
  mechanicalEligible: true,
  owner: "CoreSurfaceTruthSystem",
  meshName: "validator_surface",
  surfaceId: "validator_surface_001",
  profileId: "validator",
  materialFamily: "membrane",
  distance: 0.2,
  point: { x: 0, y: -0.2, z: 0 },
  normal: { x: 0, y: 1, z: 0 },
  adhesion: 0.8,
  loadTolerance: 0.8,
  compliance: 0.5,
  verbTransmission: { pulse: 0.5, absorb: 0.5, stabilize: 0.5 }
};
for (let i = 0; i < 8; i += 1) tendrils.update(0.05, tendrilFrame);
assert.equal(tendrilFrame.coreTendrilContact.contactState, "attached");
assert((tendrilFrame.coreTendrilContact.sealedCount + tendrilFrame.coreTendrilContact.reachingCount) > 0);

// Read-only boundary clamp telemetry closes the HC031T blind spot.
const telemetryFrame = {
  buildId: "HC-031T1",
  buildLabel: "Adjacent Territory Access + Detachment Truth",
  runtimeSeconds: 0,
  activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
  playerKinematics: {
    inputMagnitude: 1,
    position: { x: 1, y: 2, z: 3 },
    desiredMoveVector: { x: 0, y: 0, z: -1 },
    movementBoundary: {
      mode: "signal_plain_membrane_ridge_observation_ellipsoid",
      regionId: "aperture_fields",
      normalizedDistance: 1,
      pressure: 0.12,
      proximity: 1
    }
  },
  playerAttachment: { active: false },
  coreTendrilContact: { contactState: "suspended", sealedCount: 0 }
};
let nowMs = 10000;
const telemetry = new SessionTelemetrySystem({ frameState: telemetryFrame, monotonicNowMs: () => nowMs });
telemetry.observeMovementBoundaryClamp(telemetryFrame, { wallT: 0 });
telemetry.observeMovementBoundaryClamp(telemetryFrame, { wallT: 0.5 });
assert(telemetry.events.some((event) => event.type === "movement.boundary_clamped"));

for (const [relativePath, expected] of Object.entries(locked.files)) {
  assert.equal(sha256(relativePath), expected, `Locked owner changed: ${relativePath}`);
}

console.log(`[HC031T1] PASS — Membrane Ridge has pre-open maneuvering clearance, Gathering Ground remains outside until traversal opens, macro-body acquisition works, boundary-only tendril contact is suppressed, authored surface bootstrap remains intact, boundary-clamp telemetry is observable, and ${Object.keys(locked.files).length} neighboring owners are unchanged.`);
