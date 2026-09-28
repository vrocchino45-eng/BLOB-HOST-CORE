import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { VascularRhythmRouteSystem } from "../src/routes/VascularRhythmRouteSystem.js";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const sha256 = (relativePath) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relativePath))).digest("hex");

const pkg = readJson("package.json");
const contract = readJson("public/data/build/hc031rVascularRelationshipCurrentizationContract.json");
const locked = readJson("public/data/build/hc031rLockedHashes.json");
const recipe = readJson("public/data/routes/vascularRhythmRouteCircuit_HC011A1.json");
const routeSource = readText("src/routes/VascularRhythmRouteSystem.js");
const objectiveSource = readText("src/systems/ObjectiveSystem.js");
const telemetrySource = readText("src/core/SessionTelemetrySystem.js");
const mainSource = readText("src/main.js");

assert.equal(pkg.version, "0.31.39");
assert.equal(contract.pass, "HC-031R");
assert.equal(contract.parent, "HC-031Q");
assert.match(mainSource, /buildId:\s*"HC-031R"/);
assert.match(mainSource, /buildLabel:\s*"Vascular Relationship Currentization"/);
assert.equal(recipe.pass, "HC-011A1");
assert.equal(recipe.currentizationPass, "HC-031R");
assert.equal(recipe.currentization.inputTimingGate, false);
assert.equal(recipe.currentization.beatAlignmentAffectsQualityOnly, true);
assert.equal(recipe.currentization.stabilizeEstablishesRelationship, true);
assert.equal(recipe.currentization.pulseProjectsThroughRelationship, true);
assert.equal(recipe.completion.cadenceWindowIsProgressionGate, false);
assert.equal(recipe.completion.relationshipReadsAreCanonical, true);

// Ownership/static safety: Vascular remains a local route owner. It may shape the
// current field but cannot move the Core directly, cross a boundary, or write global
// progression/history truth.
assert(!/this\.playerRoot\.position\.(?:set|copy|add|addScaledVector|sub)\(/.test(routeSource), "Vascular currentization directly moves the player.");
assert(!/frameState\.activeCellId\s*=(?!=)/.test(routeSource), "Vascular currentization directly changes active-cell truth.");
assert(!/frameState\.act1RouteHistory\s*=(?!=)/.test(routeSource), "Vascular currentization directly changes route history.");
assert(!/frameState\.hubRouteCommitRequest\s*=(?!=)/.test(routeSource), "Vascular currentization writes Hub commitment truth.");
assert.match(routeSource, /legacyCadenceWindowProgressionAuthority:\s*false/);
assert.match(routeSource, /environmentalCurrentMayBeRelatedWithoutNounTarget:\s*true/);
assert.match(objectiveSource, /three_current_relationship_reads/);
assert.match(telemetrySource, /vascular\.relationship_read/);
assert.match(telemetrySource, /vascular\.relationship_route\.completed/);
assert.match(telemetrySource, /blob\.session\.telemetry\.v1\.41/);

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
playerRoot.name = "player_core_001";
scene.add(playerRoot);
const frameState = {
  buildId: "HC-031R",
  buildLabel: "Vascular Relationship Currentization",
  activeCellId: "CELL_VASCULAR_RHYTHM_ROUTE_001",
  frame: 0,
  runtimeSeconds: 0,
  input: {
    pulsePressed: false,
    pulseEventId: 0,
    pulseReleaseKind: "quick",
    stabilizeHeld: false,
    absorbHeld: false
  },
  playerKinematics: { velocity: { x: 0, y: 0, z: 0 } },
  physicalFeel: {},
  verbComposition: { chord: "idle", intent: { pulse: false, absorb: false, stabilize: false } },
  hostRhythm: {},
  coreWorldResonance: {}
};
const vascular = new VascularRhythmRouteSystem({
  recipeDataSystem: { data: { vascularRhythmRouteCircuit: recipe } },
  scene,
  playerRoot,
  frameState
});
vascular.init();
vascular.onRuntimeMount(frameState);
const originalEntry = vascular.entryAnchor.clone();

function tick(dt = 0.05) {
  frameState.frame += 1;
  frameState.runtimeSeconds += dt;
  vascular.update(dt, frameState);
}
function placeAtValve(index) {
  const progress = recipe.anatomy.valveProgress[index];
  const local = vascular.pathCurve.getPointAt(progress);
  playerRoot.position.copy(originalEntry).add(local);
  frameState.playerKinematics.velocity = { x: 0, y: 0, z: 0 };
}
function holdRelationship(seconds = 0.25) {
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
function pulse({ beatPhase = 0.2 } = {}) {
  // Deliberately choose a phase outside the legacy 0.68–0.93 cadence window.
  vascular.beatElapsed = (recipe.cadence.secondsPerBeat ?? 2.35) * beatPhase;
  vascular.cadencePhase = beatPhase;
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

// A button press alone is not a Vascular read anymore. The Core must first
// establish the environmental-current relationship with Stabilize.
placeAtValve(0);
frameState.input.stabilizeHeld = false;
tick(0.05);
pulse({ beatPhase: 0.8 }); // even aligned timing cannot substitute for relationship ownership
assert.equal(frameState.vascularRhythmRoute.relationshipReads, 0);
assert.equal(frameState.vascularRhythmRoute.lockedCadenceReads, 0);
assert.equal(frameState.vascularRhythmRoute.unboundPulseCount, 1);

// Three authored valve reads succeed with Stabilize->Pulse even deliberately
// outside the old cadence window. Rhythm remains quality, not permission.
for (let index = 0; index < 3; index += 1) {
  placeAtValve(index);
  holdRelationship(0.25);
  assert.equal(frameState.vascularRhythmRoute.currentRelationshipReady, true, `Valve ${index + 1} did not establish a current relationship.`);
  const before = frameState.vascularRhythmRoute.relationshipReads;
  pulse({ beatPhase: 0.2 });
  assert.equal(frameState.vascularRhythmRoute.relationshipReads, before + 1, `Valve ${index + 1} did not accept the current relationship read.`);
  assert.equal(frameState.vascularRhythmRoute.lockedCadenceReads, before + 1, "Legacy compatibility alias diverged from relationshipReads.");
  assert.equal(frameState.vascularRhythmRoute.lastRelationshipReadBeatAligned, false, "Off-window read was incorrectly treated as beat-aligned.");
  assert.equal(frameState.vascularRhythmRoute.currentization.inputTimingGate, false);
  assert.equal(frameState.vascularRhythmRoute.currentization.relationshipSource, "environmental_current");
}
assert.equal(frameState.vascularRhythmRoute.relationshipReads, 3);
assert.equal(frameState.vascularRhythmRoute.maxDepthProgress >= 0.78, true);

// Existing settle/recovery completion law remains. No route crossing is performed
// here; only the return current becomes ready for LocalCellBoundaryMorphSystem.
let settleTicks = 0;
while (!vascular.completed && settleTicks < 120) {
  frameState.input.stabilizeHeld = true;
  frameState.verbComposition = {
    chord: "cohere",
    relationshipBound: false,
    targetId: "none",
    intent: { pulse: false, absorb: false, stabilize: true }
  };
  tick(0.05);
  settleTicks += 1;
}
assert.equal(vascular.completed, true, "Three relationship reads could not settle into the existing return current.");
assert.equal(frameState.vascularRhythmRoute.returnFoldReady, true);
assert.equal(frameState.vascularRhythmRoute.currentReversedTowardHub, true);
assert.equal(frameState.activeCellId, "CELL_VASCULAR_RHYTHM_ROUTE_001", "Vascular owner crossed the boundary directly.");

// Read-only telemetry must expose why the currentized route progressed.
const telemetryFrameState = {
  ...frameState,
  buildId: "HC-031R",
  buildLabel: "Vascular Relationship Currentization",
  runtimeSeconds: 10,
  targeting: {},
  playerAttachment: {},
  corePerformance: {},
  vascularRhythmRoute: {
    ...frameState.vascularRhythmRoute,
    completed: false,
    relationshipReadSequence: 0,
    relationshipReads: 0,
    lockedCadenceReads: 0
  }
};
const telemetry = new SessionTelemetrySystem({ frameState: telemetryFrameState, monotonicNowMs: () => 10000 });
telemetryFrameState.vascularRhythmRoute = {
  ...frameState.vascularRhythmRoute,
  completed: false,
  relationshipReadSequence: 1,
  relationshipReads: 1,
  lockedCadenceReads: 1,
  lastRelationshipReadBeatAligned: false,
  lastRelationshipReadQuality: 0.72,
  lastRelationshipReadChord: "cohere_project"
};
telemetry.observeVascularCurrentization(telemetryFrameState);
assert.equal(telemetry.events.filter((event) => event.type === "vascular.relationship_read").length, 1);
const readEvent = telemetry.events.find((event) => event.type === "vascular.relationship_read");
assert.equal(readEvent.percept.action, "stabilize_then_pulse");
assert.equal(readEvent.percept.beatAligned, false);
assert.equal(readEvent.developer.inputTimingGate, false);
telemetryFrameState.vascularRhythmRoute = { ...frameState.vascularRhythmRoute, completed: true, relationshipReadSequence: 3 };
telemetry.observeVascularCurrentization(telemetryFrameState);
assert.equal(telemetry.events.filter((event) => event.type === "vascular.relationship_route.completed").length, 1);

// Neighbor locks: R may only currentize Vascular + its observer/objective/player-facing text.
for (const [relativePath, expectedHash] of Object.entries(locked.files)) {
  assert.equal(sha256(relativePath), expectedHash, `${relativePath} changed outside HC031R scope.`);
}

console.log(`[HC031R] PASS — Vascular preserves its living current, three valve depths, turbulence/recovery, return-current and boundary ownership while replacing hidden cadence-window permission with three Stabilize→Pulse environmental-current relationship reads; off-window reads succeed, timing is quality-only, telemetry v1.41 proves causality, and ${Object.keys(locked.files).length} neighboring gameplay owners remain unchanged.`);
