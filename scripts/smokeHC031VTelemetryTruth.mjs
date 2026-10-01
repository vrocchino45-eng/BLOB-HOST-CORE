import * as THREE from "three";
import { GatheringGroundAliveSystem } from "../src/fields/GatheringGroundAliveSystem.js";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const assert = (condition, message) => { if (!condition) throw new Error(`[HC031V smoke] ${message}`); };
const makeRoot = (x, y, z) => { const root = new THREE.Group(); root.position.set(x, y, z); root.visible = true; return root; };
const WATCHER = "gathering_ground_watcher_001";
const RELAY_A = "gathering_ground_relay_a_001";

const frameState = {
  activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
  adjacentHostTerritory: { enteredTerritory: true },
  targeting: {
    active: true,
    targetId: "gathering_ground_cluster",
    relationshipTargetId: "gathering_ground_cluster",
    candidateId: "gathering_ground_cluster",
    relationshipActive: true
  },
  entityRelationshipGrammar: { byEntityId: {} },
  coreVerbEngineCoupling: { chord: "idle" }
};
const playerRoot = new THREE.Group();
playerRoot.position.set(7.2, 9.3, -54.0);
const entities = [
  { instanceId: WATCHER, root: makeRoot(7.4, 9.4, -54.2) },
  { instanceId: RELAY_A, root: makeRoot(3.5, 8.0, -55.0) },
  { instanceId: "gathering_ground_relay_b_001", root: makeRoot(1.5, 9.6, -56.8) }
];
const system = new GatheringGroundAliveSystem({
  scene: new THREE.Scene(),
  playerRoot,
  frameState,
  entitySystem: { entities },
  apertureFieldsArrivalSystem: { entryAnchor: new THREE.Vector3(0, 0, 0) }
});
system.onRuntimeMount(frameState);
const tick = (seconds, dt = 0.05) => { for (let t = 0; t < seconds - 1e-9; t += dt) system.update(dt, frameState); };
const idle = () => { frameState.coreVerbEngineCoupling.chord = "idle"; frameState.entityRelationshipGrammar.byEntityId = {}; };
const watcherTrigger = () => {
  frameState.coreVerbEngineCoupling.chord = "cohere_project";
  frameState.entityRelationshipGrammar.byEntityId = { [WATCHER]: { interpretation: "stable_interrogation", engagement01: 0.72, distance: 1.2 } };
};
const watcherSustain = () => {
  frameState.coreVerbEngineCoupling.chord = "cohere";
  frameState.entityRelationshipGrammar.byEntityId = { [WATCHER]: { interpretation: "anchored_observation", engagement01: 0.68, distance: 1.2 } };
};
const relayTrigger = () => {
  frameState.coreVerbEngineCoupling.chord = "cohere_draw";
  frameState.entityRelationshipGrammar.byEntityId = { [RELAY_A]: { interpretation: "held_intake", engagement01: 0.70, distance: 1.4 } };
};
const relaySustain = () => {
  frameState.coreVerbEngineCoupling.chord = "cohere";
  frameState.entityRelationshipGrammar.byEntityId = { [RELAY_A]: { interpretation: "flow_alignment", engagement01: 0.66, distance: 1.4 } };
};

// Accepted U2.1 timings remain intact and still reach first-read 6/6.
tick(13.8);
watcherTrigger(); tick(0.15); watcherSustain(); tick(2.5);
const firstWatcherSignature = frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation.responseSignature;
assert(frameState.gatheringGroundAlive.responseRead.responseKind === "first_read", "first Watcher answer not labeled first_read");
assert(frameState.gatheringGroundAlive.responseRead.code === "W", "Watcher response code missing");
relayTrigger(); tick(0.15); relaySustain(); tick(2.9); idle(); tick(6.6);
assert(frameState.gatheringGroundAlive.completedCount === 6, `expected LIFE 6/6, got ${frameState.gatheringGroundAlive.completedCount}`);

// Release/cooldown/revisit gives a known response with a distinct signature.
idle(); tick(8.2); watcherTrigger(); tick(0.15); watcherSustain(); tick(2.5);
const watcher = frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation;
assert(watcher.recurrenceCount >= 1, "Watcher recurrence missing");
assert(frameState.gatheringGroundAlive.responseRead.responseKind === "known_response", "recurrence not labeled known_response");
assert(frameState.gatheringGroundAlive.responseRead.cycle >= 1, "known response cycle missing");
assert(watcher.responseSignature !== firstWatcherSignature, "recurrence did not rotate response signature");
assert(frameState.gatheringGroundAlive.responseRead.readable, "recent response not marked readable");

// Telemetry truth: known response is not information gain, but it is not no-gain either.
let nowMs = 0;
const telemetryFrame = {
  buildId: "HC-031V",
  buildLabel: "Living Response Readability / Telemetry Truth",
  runtimeSeconds: 0,
  activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
  targeting: { targetId: "gathering_ground_cluster" },
  gatheringGroundAlive: { active: true }
};
const telemetry = new SessionTelemetrySystem({ frameState: telemetryFrame, monotonicNowMs: () => nowMs });
telemetry.queueAttempt("pulse", { test: "known_response" });
assert(Math.abs(telemetry.pendingAttempts[0].resolveDelaySeconds - 3.4) < 1e-9, "Gathering Ground attempt window is not 3.4s");
nowMs = 2500;
telemetry.noteMeaningfulResponse("gathering_ground_known_response", { encounterId: "reactive_watcher_stable_interrogation", recurrenceCycle: 1 });
nowMs = 3500;
telemetry.resolvePendingAttempts();
let outcome = telemetry.events.filter((event) => event.type === "analysis.attempt.outcome").at(-1);
assert(outcome?.percept?.outcome === "meaningful_response", `known response classified as ${outcome?.percept?.outcome}`);
assert(outcome?.percept?.informationGainDelta === 0, "known response incorrectly added information gain");
assert(outcome?.percept?.meaningfulResponseDelta === 1, "known response delta missing");
assert(telemetry.noGainAttempts === 0, "known response incorrectly incremented no-gain count");

// New information retains priority over meaningful-known response.
telemetry.queueAttempt("absorb", { test: "new_information_priority" });
nowMs = 4000;
telemetry.noteInformationGain("test_new_information", 0.5, {});
telemetry.noteMeaningfulResponse("test_known_answer", {});
nowMs = 7000;
telemetry.resolvePendingAttempts();
outcome = telemetry.events.filter((event) => event.type === "analysis.attempt.outcome").at(-1);
assert(outcome?.percept?.outcome === "information_gain", "information gain did not retain outcome priority");

console.log("HC031V telemetry truth smoke PASS");
console.log(`- LIFE ${frameState.gatheringGroundAlive.completedCount}/6`);
console.log(`- LOOP ${frameState.gatheringGroundAlive.ongoingResponseCycles}`);
console.log(`- RESP ${frameState.gatheringGroundAlive.responseRead.responseKind} ${frameState.gatheringGroundAlive.responseRead.code}${frameState.gatheringGroundAlive.responseRead.cycle}/${frameState.gatheringGroundAlive.responseRead.signature}`);
console.log(`- telemetry meaningful responses ${telemetry.meaningfulResponseCount}`);
