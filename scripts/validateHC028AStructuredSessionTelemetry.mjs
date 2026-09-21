import fs from "node:fs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const runtimeSource = fs.readFileSync("src/core/GameRuntime.js", "utf8");
const mainSource = fs.readFileSync("src/main.js", "utf8");
const statusSource = fs.readFileSync("src/ui/StatusPageSystem.js", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const identity = JSON.parse(fs.readFileSync("public/data/build/currentBuildIdentity_HC028A.json", "utf8"));
const contract = JSON.parse(fs.readFileSync("public/data/build/hc028aStructuredSessionTelemetryContract.json", "utf8"));
const hashes = JSON.parse(fs.readFileSync("public/data/build/hc028aLockedGoldenInquiryHashes.json", "utf8"));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

assert.match(mainSource, /buildId:\s*"HC-028A"/);
assert.match(mainSource, /Structured Session Telemetry Foundation/);
assert.match(runtimeSource, /SessionTelemetrySystem/);
assert.match(runtimeSource, /registry\.register\("sessionTelemetrySystem"/);
assert.ok(runtimeSource.indexOf('registry.register("sessionTelemetrySystem"') > runtimeSource.indexOf('registry.register("playtestHudSystem"'), "telemetry must observe resolved runtime state after the HUD/gameplay stack");
assert.match(statusSource, /"Telemetry"/);
assert.match(statusSource, /Shift\+T/);
assert.match(statusSource, /Shift\+M/);
assert.equal(packageJson.version, "0.28.0");
assert.equal(identity.id, "HC-028A");
assert.equal(identity.parent, "HC-027L1");
assert.equal(identity.baseline, "HC027L1_GOLDEN_INQUIRY_BASELINE_01");
assert.equal(identity.sourceJsCount, 93);
assert.equal(identity.newSourceModules, 1);
assert.equal(contract.schemaVersion, "blob.session.telemetry.v1");
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

const frameState = {
  buildId: "HC-028A",
  buildLabel: "Structured Session Telemetry Foundation",
  runtimeSeconds: 0,
  frame: 0,
  activeCellId: "CELL_ALPHA_INTERNAL",
  input: {},
  inputSource: {},
  targeting: { targetId: "none" },
  playerKinematics: {
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    speed: 0
  },
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
  }
};

const system = new SessionTelemetrySystem({ frameState });
system.init();
assert.equal(frameState.sessionTelemetry.active, true);
assert.equal(frameState.sessionTelemetry.gameplayAuthority, false);
assert.equal(frameState.sessionTelemetry.baselineId, "HC027L1_GOLDEN_INQUIRY_BASELINE_01");
assert.equal(system.events[0].type, "session.started");
assert.equal(system.coreSnapshots.length, 1);

// Quick Pulse + local return.
frameState.runtimeSeconds = 1;
frameState.frame = 60;
frameState.input = {
  pulsePressed: true,
  pulseEventId: 1,
  pulseReleaseKind: "quick",
  pulseReleaseCharge01: 0,
  pulseHoldSeconds: 0.12,
  pulseSource: "gamepad_x_button_2"
};
frameState.coreSensoryResponse = {
  newReturns: [{ id: "AUTHORED_SEED_17", reachClass: "local_actionable", distance: 2.7, pulseMode: "quick", observationCount: 1, resolutionStage: 1, structuralInterpretation: "presence_only", responseClass: "living_seed", responseLabel: "pulse_contract", position: { x: 2, y: 0, z: 1 }, pulseEventId: 1 }]
};
system.update(1 / 60, frameState);
assert.equal(system.buildSummary().quickPulses, 1);
assert.equal(system.buildSummary().sonarReturns, 1);
assert.ok(system.events.some((event) => event.type === "sonar.resolution.increased"));
const sonarEvent = system.events.find((event) => event.type === "sonar.return");
assert.match(sonarEvent.percept.source, /^anon_\d{3}$/);
assert.equal(sonarEvent.percept.source.includes("SEED"), false);
assert.equal(sonarEvent.developer.sourceId, "AUTHORED_SEED_17");

// Repeated deep read must retain observation/resolution evidence.
frameState.runtimeSeconds = 2;
frameState.frame = 120;
frameState.input = { pulsePressed: true, pulseEventId: 2, pulseReleaseKind: "charged", pulseReleaseCharge01: 0.8, pulseHoldSeconds: 1.1, pulseSource: "gamepad_x_button_2" };
frameState.coreSensoryResponse = {
  newReturns: [{ id: "AUTHORED_SEED_17", reachClass: "deep_structural", distance: 7.4, pulseMode: "charged", observationCount: 2, resolutionStage: 2, structuralInterpretation: "layered_volume_between_core_and_answer", responseClass: "living_seed", responseLabel: "pulse_contract", position: { x: 7, y: 1, z: 2 }, pulseEventId: 2 }]
};
system.update(1 / 60, frameState);
assert.equal(system.buildSummary().chargedPulses, 1);
assert.equal(system.buildSummary().deepSonarReturns, 1);
const deepEvent = system.events.find((event) => event.type === "sonar.return" && event.developer?.reachClass === "deep_structural");
assert.equal(deepEvent.percept.returnCharacter, "broad_diffuse");
assert.equal("reachClass" in deepEvent.percept, false);
assert.equal("structuralInterpretation" in deepEvent.percept, false);
assert.ok(system.buildSummary().resolutionIncreases >= 2);

// Sustained verbs, consequence, relationship, semantic stagnation, topology and cell transition.
frameState.runtimeSeconds = 3;
frameState.frame = 180;
frameState.input = { absorbHeld: true };
frameState.coreSensoryResponse = { newReturns: [] };
system.update(1 / 60, frameState);
frameState.runtimeSeconds = 4.5;
frameState.frame = 270;
frameState.input = { absorbHeld: false, stabilizeHeld: true };
system.update(1 / 60, frameState);
frameState.runtimeSeconds = 6;
frameState.frame = 360;
frameState.input = { stabilizeHeld: false };
frameState.signalPlainLocalConsequenceEvent = { eventId: "consequence_1", conditionId: "phase_slip", consequenceId: "held_coherence", sourceVerbDebugOnly: "stabilize", durationSeconds: 34, nodeNumber: 3 };
frameState.signalPlainEcology = { consequenceNextQuestion: { primary: { active: true, eventId: "relationship_1", id: "link_internal", relation: "coherence_exposes_gap", strength: 0.7, sourceNodeNumber: 3, targetNodeNumber: 2 } } };
frameState.interactionComposition.rhythmLock.semanticStagnationRisk = true;
frameState.interactionComposition.rhythmLock.semanticChangeAge = 19;
frameState.corePerformance = { ...frameState.corePerformance, topologyId: "deep_bias", distribution: "2:1:0", personality: "endurance-biased", weights: { deep: 2 / 3, inner: 1 / 3, membrane: 0 } };
frameState.activeCellId = "CELL_BETA_INTERNAL";
system.update(1 / 60, frameState);

const summary = system.buildSummary();
assert.equal(summary.absorbUses, 1);
assert.ok(summary.absorbHeldSeconds >= 1.4);
assert.equal(summary.stabilizeUses, 1);
assert.ok(summary.stabilizeHeldSeconds >= 1.4);
assert.equal(summary.consequences, 1);
assert.equal(summary.relationships, 1);
assert.equal(summary.semanticStagnationEntries, 1);
assert.equal(summary.cellChanges, 1);
assert.equal(summary.finalCore.personality, "endurance-biased");
assert.ok(system.coreSnapshots.length >= 2, "topology change should force a Core snapshot");

const exported = system.exportSession();
assert.equal(exported.schemaVersion, "blob.session.telemetry.v1");
assert.equal(exported.session.gameplayAuthority, false);
assert.ok(exported.developerTruth.sourceAliasMap[sonarEvent.percept.source] === "AUTHORED_SEED_17");
assert.ok(Object.values(exported.developerTruth.semanticAliasMap).includes("phase_slip"));
assert.match(exported.developerTruth.note, /must not receive developerTruth/);
assert.ok(exported.movementSamples.length > 0);
assert.ok(exported.coreSnapshots.length > 0);

// Browser-persistence contract smoke with a minimal localStorage stand-in.
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key)
};
assert.equal(system.persist(true), true);
assert.ok(storage.has(`blob.telemetry.session.${system.sessionId}`));
assert.ok(storage.has("blob.telemetry.session.index.v1"));
delete globalThis.localStorage;

// Verify the observer does not rewrite canonical gameplay inputs.
assert.deepEqual(frameState.input, { stabilizeHeld: false });

console.log("HC028A Structured Session Telemetry: PASS");
console.log(JSON.stringify({
  events: summary.eventCount,
  movementSamples: summary.movementSampleCount,
  coreSnapshots: summary.coreSnapshotCount,
  quickPulses: summary.quickPulses,
  chargedPulses: summary.chargedPulses,
  sonarReturns: summary.sonarReturns,
  deepSonarReturns: summary.deepSonarReturns,
  consequences: summary.consequences,
  relationships: summary.relationships,
  semanticStagnationEntries: summary.semanticStagnationEntries,
  finalCore: summary.finalCore
}, null, 2));
