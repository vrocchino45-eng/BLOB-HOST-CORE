import fs from "node:fs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const mainSource = fs.readFileSync("src/main.js", "utf8");
const runtimeSource = fs.readFileSync("src/core/GameRuntime.js", "utf8");
const statusSource = fs.readFileSync("src/ui/StatusPageSystem.js", "utf8");
const debugSource = fs.readFileSync("src/debug/RecipeDebugOverlay.js", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const identity = JSON.parse(fs.readFileSync("public/data/build/currentBuildIdentity_HC028A1.json", "utf8"));
const contract = JSON.parse(fs.readFileSync("public/data/build/hc028a1TelemetryCalibrationConfusionContract.json", "utf8"));
const hashes = JSON.parse(fs.readFileSync("public/data/build/hc028a1LockedGoldenInquiryHashes.json", "utf8"));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

assert.match(mainSource, /buildId:\s*"HC-028A1"/);
assert.match(mainSource, /Telemetry Calibration \+ Confusion Detection/);
assert.match(runtimeSource, /SessionTelemetrySystem/);
assert.ok(runtimeSource.indexOf('registry.register("sessionTelemetrySystem"') > runtimeSource.indexOf('registry.register("playtestHudSystem"'), "telemetry remains last read-only observer");
assert.match(statusSource, /Semantic-churn entries/);
assert.match(debugSource, /Insight: gain age/);
assert.equal(packageJson.version, "0.28.1");
assert.equal(identity.id, "HC-028A1");
assert.equal(identity.parent, "HC-028A");
assert.equal(identity.baseline, "HC027L1_GOLDEN_INQUIRY_BASELINE_01");
assert.equal(identity.sourceJsCount, 93);
assert.equal(contract.schemaVersion, "blob.session.telemetry.v1.1");
assert.equal(contract.authority.gameplay, false);
assert.equal(contract.authority.inputMutation, false);
for (const [rel, expected] of Object.entries(hashes.lockedGameplayOwners ?? {})) {
  assert.equal(sha(rel), expected, `golden gameplay owner drifted: ${rel}`);
}

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".js")) sourceFiles.push(full);
  }
};
walk("src");
assert.equal(sourceFiles.length, 93);

let wallMs = 0;
const frameState = {
  buildId: "HC-028A1",
  buildLabel: "Telemetry Calibration + Confusion Detection",
  runtimeSeconds: 0,
  frame: 0,
  activeCellId: "CELL_ALPHA_INTERNAL",
  input: {},
  inputSource: {},
  targeting: { targetId: "TARGET_A" },
  playerKinematics: { position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, speed: 0 },
  corePerformance: {
    topologyId: "triadic_balance",
    distribution: "1:1:1",
    personality: "triadic balance",
    weights: { deep: 1 / 3, inner: 1 / 3, membrane: 1 / 3 },
    endurance: { reserve01: 1, demand01: 0, instabilityRisk01: 0 },
    verbModifiers: { pulse: {}, absorb: {}, stabilize: {} }
  },
  coreEngine: { phaseCount: 3, currentPhaseIndex: 0, currentPhaseLabel: "pulse_1", rpm: 3200, load01: 0.2 },
  coreGrowth: { displayStage: "Seed Core" },
  coreEmbodiment: { bodyRecipe: "authored_seed_core_proxy_v2" },
  spatialCoreChemistry: { retainedPieceCount: 3, topology: { distribution: "1:1:1" } },
  interactionComposition: {
    rhythm: { beat: "observe" },
    rhythmLock: { semanticChangeAge: 0, meaningfulChangeAge: 0, semanticStagnationRisk: false, semanticRepeatCount: 0, deadTimeRisk: false }
  },
  coreSensoryResponse: { newReturns: [] }
};

const system = new SessionTelemetrySystem({ frameState, monotonicNowMs: () => wallMs });
system.init();
assert.equal(frameState.sessionTelemetry.pass, "HC-028A1");
assert.equal(system.schemaVersion, "blob.session.telemetry.v1.1");

const step = ({ wall = 1, sim = wall, input = {}, target, returns = [], consequence = null, relationship = null } = {}) => {
  wallMs += wall * 1000;
  frameState.runtimeSeconds += sim;
  frameState.frame += Math.max(1, Math.round(sim * 60));
  frameState.input = input;
  if (target !== undefined) frameState.targeting.targetId = target;
  frameState.coreSensoryResponse = { newReturns: returns };
  frameState.signalPlainLocalConsequenceEvent = consequence;
  frameState.signalPlainEcology = relationship ? { consequenceNextQuestion: { primary: relationship } } : {};
  system.update(1 / 60, frameState);
};

// Establish real information gain through three sonar resolution stages.
for (let stage = 1; stage <= 3; stage += 1) {
  step({
    wall: 1,
    input: { pulsePressed: true, pulseEventId: stage, pulseReleaseKind: "quick", pulseReleaseCharge01: 0, pulseHoldSeconds: 0.12, pulseSource: "gamepad_x_button_2" },
    returns: [{ id: "AUTHORED_SIGNAL", reachClass: "local_actionable", distance: 2, pulseMode: "quick", observationCount: stage, resolutionStage: stage, structuralInterpretation: stage === 1 ? "presence_only" : stage === 2 ? "layered_volume_between_core_and_answer" : "material_response_confirmed", responseClass: "signal_resonant", responseLabel: "answering_ring", position: { x: 2, y: 0, z: 0 }, pulseEventId: stage }]
  });
}
assert.ok(system.informationGainCount >= 3);
assert.equal(system.semanticChurnActive, false);

// Human-marker calibration signature: high effort + repeated max resolution + target switching + no gain.
for (let i = 0; i < 9; i += 1) {
  const eventId = 10 + i;
  const input = {
    pulsePressed: true,
    pulseEventId: eventId,
    pulseReleaseKind: "quick",
    pulseReleaseCharge01: 0,
    pulseHoldSeconds: 0.14,
    pulseSource: "gamepad_x_button_2",
    absorbHeld: i === 2 || i === 3 || i === 6,
    stabilizeHeld: i === 4 || i === 5 || i === 7
  };
  step({
    wall: 1,
    input,
    target: i % 2 === 0 ? "TARGET_A" : "TARGET_B",
    returns: [{ id: "AUTHORED_SIGNAL", reachClass: "local_actionable", distance: 1.2, pulseMode: "quick", observationCount: 4 + i, resolutionStage: 3, structuralInterpretation: "material_response_confirmed", responseClass: "signal_resonant", responseLabel: "answering_ring", position: { x: 1.2, y: 0, z: 0 }, pulseEventId: eventId }]
  });
}
assert.equal(system.semanticChurnActive, true, "calibrated high-effort/no-gain pattern should enter semantic churn");
assert.ok(system.redundantMaxResolutionReturns >= 6);
assert.ok(system.events.some((event) => event.type === "rhythm.semantic_churn.entered"));
assert.ok(system.events.some((event) => event.type === "analysis.attempt.outcome" && event.percept?.outcome === "no_gain"));

const marker = system.mark("confusing_here");
assert.equal(marker.percept.detectorAgreement, "semantic_churn_active");
assert.equal(marker.percept.context.semanticChurnActive, true);
assert.ok(marker.percept.context.eventCounts["sonar.redundant_max_resolution"] >= 3);
assert.ok(marker.percept.context.currentTarget.startsWith("anon_"));

// New information must clear the churn condition on the next resolved frame.
step({
  wall: 1,
  input: {},
  consequence: { eventId: "consequence_1", conditionId: "phase_slip", consequenceId: "held_coherence", sourceVerbDebugOnly: "stabilize", durationSeconds: 34, nodeNumber: 3 }
});
assert.equal(system.semanticChurnActive, false);
assert.ok(system.events.some((event) => event.type === "rhythm.semantic_churn.cleared"));

// Wall clock must remain independent of paused/slowed simulation time.
const beforeDrift = system.exportSession().session.wallMinusSimSeconds;
step({ wall: 5, sim: 0, input: {} });
const exported = system.exportSession();
assert.ok(exported.session.wallMinusSimSeconds >= beforeDrift + 4.9);
assert.equal(exported.schemaVersion, "blob.session.telemetry.v1.1");
assert.ok(exported.events.every((event) => Number.isFinite(event.wallT) && Number.isFinite(event.simT)));
assert.ok(exported.movementSamples.every((sample) => Number.isFinite(sample.wallT) && Number.isFinite(sample.simT)));
assert.ok(exported.summary.semanticChurnEntries >= 1);
assert.ok(exported.summary.informationGainEvents >= 4);
assert.ok(exported.summary.redundantMaxResolutionReturns >= 6);
assert.ok(exported.summary.noGainAttempts >= 1);

// Observer must not mutate canonical gameplay input.
const canonicalInput = { moveX: 0.5, pulseHeld: false, absorbHeld: false, stabilizeHeld: false };
frameState.input = structuredClone(canonicalInput);
step({ wall: 0.5, sim: 0.5, input: frameState.input });
assert.deepEqual(frameState.input, canonicalInput);

// Persistence contract still works.
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key)
};
assert.equal(system.persist(true), true);
assert.ok(storage.has(`blob.telemetry.session.${system.sessionId}`));
delete globalThis.localStorage;

console.log("HC028A1 Telemetry Calibration + Confusion Detection: PASS");
console.log(JSON.stringify({
  schemaVersion: exported.schemaVersion,
  wallDurationSeconds: exported.session.wallDurationSeconds,
  simDurationSeconds: exported.session.simDurationSeconds,
  wallMinusSimSeconds: exported.session.wallMinusSimSeconds,
  informationGainEvents: exported.summary.informationGainEvents,
  semanticChurnEntries: exported.summary.semanticChurnEntries,
  redundantMaxResolutionReturns: exported.summary.redundantMaxResolutionReturns,
  noGainAttempts: exported.summary.noGainAttempts,
  markerDetectorAgreement: marker.percept.detectorAgreement
}, null, 2));
