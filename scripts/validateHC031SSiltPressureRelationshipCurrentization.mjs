import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { SiltPressureRouteSystem } from "../src/routes/SiltPressureRouteSystem.js";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const sha256 = (relativePath) => crypto
  .createHash("sha256")
  .update(fs.readFileSync(path.join(root, relativePath)))
  .digest("hex");

const pkg = readJson("package.json");
const contract = readJson("public/data/build/hc031sSiltPressureRelationshipCurrentizationContract.json");
const locked = readJson("public/data/build/hc031sLockedHashes.json");
const recipe = readJson("public/data/routes/siltPressureRouteCircuit_HC012A.json");
const routeSource = readText("src/routes/SiltPressureRouteSystem.js");
const objectiveSource = readText("src/systems/ObjectiveSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const telemetrySource = readText("src/core/SessionTelemetrySystem.js");
const mainSource = readText("src/main.js");

assert.equal(pkg.version, "0.31.40");
assert.equal(contract.pass, "HC-031S");
assert.equal(contract.parent, "HC-031R");
assert.match(mainSource, /buildId:\s*"HC-031S"/);
assert.match(mainSource, /buildLabel:\s*"Silt Pressure Relationship Currentization"/);
assert.equal(recipe.pass, "HC-012A");
assert.equal(recipe.currentizationPass, "HC-031S");
assert.equal(recipe.currentization.relationshipSource, "environmental_pressure");
assert.equal(recipe.currentization.stabilizeEstablishesRelationship, true);
assert.equal(recipe.currentization.pulseProjectsThroughRelationship, true);
assert.equal(recipe.currentization.pulseAloneCanReadPressure, false);
assert.equal(recipe.currentization.appetiteSelectionMode, "spatial_body_choice");
assert.equal(recipe.currentization.nounTargetingAuthorityChanged, false);
assert.equal(recipe.completion.pressureRelationshipReadIsCanonical, true);
assert.equal(recipe.completion.pulseAloneCanReadPressure, false);

// Ownership safety: Silt may shape its local pressure field and presentation but it
// may not move the Core, cross a boundary, or directly write route/global truth.
assert(!/this\.playerRoot\.position\.(?:set|copy|add|addScaledVector|sub)\(/.test(routeSource), "Silt currentization directly moves the player.");
assert(!/frameState\.activeCellId\s*=(?!=)/.test(routeSource), "Silt currentization directly changes active-cell truth.");
assert(!/frameState\.act1RouteHistory\s*=(?!=)/.test(routeSource), "Silt currentization directly changes route history.");
assert(!/frameState\.hubRouteCommitRequest\s*=(?!=)/.test(routeSource), "Silt currentization writes Hub commitment truth.");
assert.match(routeSource, /pressureRelationshipReady/);
assert.match(routeSource, /pulse_without_stabilized_pressure_relationship/);
assert.match(routeSource, /appetiteSelectionMode:\s*"spatial_body_choice"/);
assert.match(objectiveSource, /pressure_relationship_stabilize_then_pulse_read/);
assert.match(hudSource, /pressure relationship ready \/ Pulse/);
assert.match(telemetrySource, /silt\.pressure_relationship_read/);
assert.match(telemetrySource, /silt\.selective_draw\.completed/);
assert.match(telemetrySource, /silt\.relationship_route\.completed/);
assert.match(telemetrySource, /blob\.session\.telemetry\.v1\.42/);

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.name = "player_core_001";
scene.add(playerRoot);
const frameState = {
  buildId: "HC-031S",
  buildLabel: "Silt Pressure Relationship Currentization",
  activeCellId: "CELL_SILT_PRESSURE_ROUTE_001",
  frame: 0,
  runtimeSeconds: 0,
  input: {
    pulsePressed: false,
    pulseEventId: 0,
    stabilizeHeld: false,
    absorbHeld: false
  },
  verbComposition: {
    chord: "idle",
    relationshipBound: false,
    targetId: "none",
    intent: { pulse: false, absorb: false, stabilize: false }
  },
  physicalFeel: {},
  hostRhythm: {},
  coreWorldResonance: {}
};
const silt = new SiltPressureRouteSystem({
  recipeDataSystem: { data: { siltPressureRouteCircuit: recipe } },
  scene,
  playerRoot,
  frameState
});
silt.init();
silt.onRuntimeMount(frameState);
scene.updateMatrixWorld(true);
const originalEntry = silt.entryAnchor.clone();

function tick(dt = 0.05) {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  silt.update(dt, frameState);
  scene.updateMatrixWorld(true);
}
function placeAtProgress(progress) {
  const local = silt.pathCurve.getPointAt(progress);
  playerRoot.position.copy(originalEntry).add(local);
  scene.updateMatrixWorld(true);
  tick(0.01);
}
function holdStabilize(seconds = 0.25) {
  frameState.input.stabilizeHeld = true;
  frameState.verbComposition = {
    chord: "cohere",
    relationshipBound: false,
    targetId: "none",
    intent: { pulse: false, absorb: false, stabilize: true }
  };
  let elapsed = 0;
  while (elapsed < seconds - 1e-6) {
    const step = Math.min(0.05, seconds - elapsed);
    tick(step);
    elapsed += step;
  }
}
function releaseStabilize() {
  frameState.input.stabilizeHeld = false;
  frameState.verbComposition = {
    chord: "idle",
    relationshipBound: false,
    targetId: "none",
    intent: { pulse: false, absorb: false, stabilize: false }
  };
  tick(0.02);
}
function pulse() {
  frameState.input.pulseEventId += 1;
  frameState.input.pulsePressed = true;
  frameState.verbComposition = {
    chord: frameState.input.stabilizeHeld ? "cohere_project" : "project",
    relationshipBound: false,
    targetId: "none",
    intent: { pulse: true, absorb: false, stabilize: frameState.input.stabilizeHeld }
  };
  tick(0.01);
  frameState.input.pulsePressed = false;
  frameState.verbComposition = {
    chord: frameState.input.stabilizeHeld ? "cohere" : "idle",
    relationshipBound: false,
    targetId: "none",
    intent: { pulse: false, absorb: false, stabilize: frameState.input.stabilizeHeld }
  };
  tick(0.02);
}

// Pulse alone inside the authored read pocket is no longer enough. Stabilize owns
// relationship establishment, and Pulse only reads through that relationship.
placeAtProgress(0.2);
pulse();
assert.equal(frameState.siltPressureRoute.pressureRead, false);
assert.equal(frameState.siltPressureRoute.pressureReadSequence, 0);
assert.equal(frameState.siltPressureRoute.unboundPulseCount, 1);

holdStabilize(0.25);
assert.equal(frameState.siltPressureRoute.pressureRelationshipReady, true);
pulse();
assert.equal(frameState.siltPressureRoute.pressureRead, true);
assert.equal(frameState.siltPressureRoute.pressureReadCount, 1);
assert.equal(frameState.siltPressureRoute.pressureReadSequence, 1);
assert.equal(frameState.siltPressureRoute.lastPressureReadChord, "cohere_project");
assert.equal(frameState.siltPressureRoute.currentization.pulseAloneCanReadPressure, false);

// The same held Stabilize relationship continues into the existing brace instead
// of asking the player to switch to a route-specific control vocabulary.
let braceTicks = 0;
while (!frameState.siltPressureRoute.ribsReleased && braceTicks < 80) {
  tick(0.05);
  braceTicks += 1;
}
assert(braceTicks < 80, "Currentized pressure relationship could not brace the living ribs.");
releaseStabilize();
assert.equal(frameState.siltPressureRoute.ribsReleased, true);

// Keep the authored appetite consequence: physically entering packed residue and
// drawing it produces recoverable compression without erasing learned state.
const denseWorld = new THREE.Vector3();
silt.densePackets[0].getWorldPosition(denseWorld);
playerRoot.position.copy(denseWorld);
scene.updateMatrixWorld(true);
frameState.input.absorbHeld = true;
frameState.verbComposition = {
  chord: "draw",
  relationshipBound: false,
  targetId: "none",
  intent: { pulse: false, absorb: true, stabilize: false }
};
let failureTicks = 0;
while (!frameState.siltPressureRoute.compressionFailure && failureTicks < 40) {
  tick(0.05);
  failureTicks += 1;
}
frameState.input.absorbHeld = false;
tick(0.02);
assert(failureTicks < 40, "Packed residue did not produce the recoverable compression consequence.");
assert.equal(frameState.siltPressureRoute.pressureRead, true);
assert.equal(frameState.siltPressureRoute.ribsReleased, true);
assert.equal(frameState.siltPressureRoute.safeMatterAbsorbed, false);
assert.equal(frameState.siltPressureRoute.denseMatterLeftIntact, true);

// Stabilize recovers the pressure state without erasing retained relationship work.
holdStabilize(3.0);
releaseStabilize();
assert.equal(frameState.siltPressureRoute.compressionFailure, false);
assert.equal(frameState.siltPressureRoute.failureRecovered, true);
assert.equal(frameState.siltPressureRoute.pressureRead, true);
assert.equal(frameState.siltPressureRoute.ribsReleased, true);

// Spatial choice remains deliberate and route-local in S: approach the porous body
// before drawing. TargetingSystem is deliberately locked unchanged in this pass.
const safeWorld = new THREE.Vector3();
silt.safePacket.getWorldPosition(safeWorld);
playerRoot.position.copy(safeWorld);
scene.updateMatrixWorld(true);
frameState.input.absorbHeld = true;
frameState.verbComposition = {
  chord: "draw",
  relationshipBound: false,
  targetId: "none",
  intent: { pulse: false, absorb: true, stabilize: false }
};
let safeTicks = 0;
while (!frameState.siltPressureRoute.safeMatterAbsorbed && safeTicks < 60) {
  tick(0.05);
  safeTicks += 1;
}
frameState.input.absorbHeld = false;
tick(0.02);
assert(safeTicks < 60, "Porous Silt matter was not deliberately drawable after approach.");
assert.equal(frameState.siltPressureRoute.safeMatterAbsorbed, true);
assert.equal(frameState.siltPressureRoute.appetiteDrawSequence, 1);
assert.equal(frameState.siltPressureRoute.lastAppetiteDrawKind, "porous_nutrient");
assert.equal(frameState.siltPressureRoute.appetiteSelectionMode, "spatial_body_choice");
assert.equal(frameState.siltPressureRoute.denseMatterLeftIntact, true);

// Existing deep-release law remains and only forms the return breath. Silt still
// does not own the actual route crossing.
placeAtProgress(0.9);
let completionTicks = 0;
while (!silt.completed && completionTicks < 160) {
  tick(0.05);
  completionTicks += 1;
}
assert(completionTicks < 160, "Currentized Silt route could not settle into the existing return breath.");
assert.equal(frameState.siltPressureRoute.completed, true);
assert.equal(frameState.siltPressureRoute.returnFoldReady, true);
assert.equal(frameState.siltPressureRoute.stage, "return_breath");
assert.equal(frameState.activeCellId, "CELL_SILT_PRESSURE_ROUTE_001", "Silt owner crossed the boundary directly.");

// Read-only telemetry exposes the relationship read, spatial appetite choice and
// route release without owning any of them.
const telemetryFrameState = {
  ...frameState,
  buildId: "HC-031S",
  buildLabel: "Silt Pressure Relationship Currentization",
  runtimeSeconds: 10,
  targeting: {},
  playerAttachment: {},
  corePerformance: {},
  siltPressureRoute: {
    ...frameState.siltPressureRoute,
    pressureRead: false,
    pressureReadCount: 0,
    pressureReadSequence: 0,
    appetiteDrawSequence: 0,
    safeMatterAbsorbed: false,
    completed: false
  }
};
const telemetry = new SessionTelemetrySystem({ frameState: telemetryFrameState, monotonicNowMs: () => 10000 });
telemetryFrameState.siltPressureRoute = {
  ...frameState.siltPressureRoute,
  pressureRead: true,
  pressureReadCount: 1,
  pressureReadSequence: 1,
  appetiteDrawSequence: 0,
  safeMatterAbsorbed: false,
  completed: false,
  lastPressureReadChord: "cohere_project"
};
telemetry.observeSiltCurrentization(telemetryFrameState);
assert.equal(telemetry.events.filter((event) => event.type === "silt.pressure_relationship_read").length, 1);
const readEvent = telemetry.events.find((event) => event.type === "silt.pressure_relationship_read");
assert.equal(readEvent.percept.action, "stabilize_then_pulse");
assert.equal(readEvent.developer.pulseAloneCanReadPressure, false);

telemetryFrameState.siltPressureRoute = {
  ...frameState.siltPressureRoute,
  pressureReadSequence: 1,
  appetiteDrawSequence: 1,
  safeMatterAbsorbed: true,
  completed: false,
  lastAppetiteDrawKind: "porous_nutrient"
};
telemetry.observeSiltCurrentization(telemetryFrameState);
assert.equal(telemetry.events.filter((event) => event.type === "silt.selective_draw.completed").length, 1);
const drawEvent = telemetry.events.find((event) => event.type === "silt.selective_draw.completed");
assert.equal(drawEvent.percept.packedResidueLeftIntact, true);
assert.equal(drawEvent.developer.selectionMode, "spatial_body_choice");

telemetryFrameState.siltPressureRoute = { ...frameState.siltPressureRoute, completed: true };
telemetry.observeSiltCurrentization(telemetryFrameState);
assert.equal(telemetry.events.filter((event) => event.type === "silt.relationship_route.completed").length, 1);

// Neighbor locks: S may only currentize Silt + its observer/objective/player-facing text.
for (const [relativePath, expectedHash] of Object.entries(locked.files)) {
  assert.equal(sha256(relativePath), expectedHash, `${relativePath} changed outside HC031S scope.`);
}

console.log(`[HC031S] PASS — Silt preserves compressed anatomy, five living ribs, spatial porous-vs-packed appetite choice, recoverable squeeze, deep release and return breath while replacing Pulse-alone pressure permission with a Stabilize→Pulse environmental-pressure relationship; telemetry v1.42 exposes the read→selective draw→return causality and ${Object.keys(locked.files).length} neighboring gameplay owners remain unchanged.`);
