import * as THREE from "three";
import { GatheringGroundAliveSystem } from "../src/fields/GatheringGroundAliveSystem.js";

const assert = (condition, message) => { if (!condition) throw new Error(`[HC031U2.1 smoke] ${message}`); };
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

const idle = () => {
  frameState.coreVerbEngineCoupling.chord = "idle";
  frameState.entityRelationshipGrammar.byEntityId = {};
};
const watcherTrigger = () => {
  frameState.coreVerbEngineCoupling.chord = "cohere_project";
  frameState.entityRelationshipGrammar.byEntityId = {
    [WATCHER]: { interpretation: "stable_interrogation", engagement01: 0.72, distance: 1.2 }
  };
};
const watcherSustain = () => {
  frameState.coreVerbEngineCoupling.chord = "cohere";
  frameState.entityRelationshipGrammar.byEntityId = {
    [WATCHER]: { interpretation: "anchored_observation", engagement01: 0.68, distance: 1.2 }
  };
};
const relayTrigger = () => {
  frameState.coreVerbEngineCoupling.chord = "cohere_draw";
  frameState.entityRelationshipGrammar.byEntityId = {
    [RELAY_A]: { interpretation: "held_intake", engagement01: 0.7, distance: 1.4 }
  };
};
const relaySustain = () => {
  frameState.coreVerbEngineCoupling.chord = "cohere";
  frameState.entityRelationshipGrammar.byEntityId = {
    [RELAY_A]: { interpretation: "flow_alignment", engagement01: 0.66, distance: 1.4 }
  };
};
const incompatible = () => {
  frameState.coreVerbEngineCoupling.chord = "draw";
  frameState.entityRelationshipGrammar.byEntityId = {
    [WATCHER]: { interpretation: "guarded_retraction", engagement01: 0.6, distance: 1.2 }
  };
};

// U2 ambient pacing remains intact.
tick(13.8);
assert(frameState.gatheringGroundAlive.family.ambient.completed === 2, "ambient pacing regressed");

// Pulse is the initiation impulse; Stabilize-only relationship sustains the answer.
watcherTrigger(); tick(0.15);
let watcher = frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation;
assert(watcher.state === "active" && watcher.intentLatched, "Watcher intent did not latch on Stabilize+Pulse initiation");
watcherSustain(); tick(0.9);
watcher = frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation;
assert(watcher.state === "active" && watcher.progress01 > 0.3, "Watcher did not sustain on anchored Stabilize relationship");

// A brief incompatible transition is tolerated without resetting progress.
const beforeBriefBreak = watcher.progress01;
incompatible(); tick(0.4);
watcher = frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation;
assert(watcher.state === "active", "brief normal relationship transition exceeded intent grace");
assert(watcher.progress01 >= beforeBriefBreak - 0.001, "brief transition reset Watcher progress");
watcherSustain(); tick(1.65);
watcher = frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation;
assert(watcher.firstCompleted, "latched Watcher relationship did not complete after Pulse release");
assert(watcher.interruptionCount === 0, "valid Watcher relationship was falsely interrupted");

// Relay: Absorb initiates, Stabilize-only flow alignment sustains.
relayTrigger(); tick(0.15);
let relay = frameState.gatheringGroundAlive.encounters.reactive_relay_held_intake;
assert(relay.state === "active" && relay.intentLatched, "Relay intent did not latch on Stabilize+Absorb initiation");
relaySustain(); tick(2.9);
relay = frameState.gatheringGroundAlive.encounters.reactive_relay_held_intake;
assert(relay.firstCompleted, "latched Relay relationship did not complete after Absorb release");
assert(relay.interruptionCount === 0, "valid Relay relationship was falsely interrupted");

// Let cross-territory first answers complete.
idle(); tick(6.6);
assert(frameState.gatheringGroundAlive.completedCount === 6, `expected LIFE 6/6, got ${frameState.gatheringGroundAlive.completedCount}`);

// Meaningful sustained incompatibility still interrupts after recurrence rearm.
tick(4.0);
watcher = frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation;
assert(watcher.state === "available", "Watcher did not rearm after real release + cooldown");
watcherTrigger(); tick(0.15); incompatible(); tick(0.8);
watcher = frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation;
assert(watcher.state === "available" && watcher.interruptionCount === 1, "sustained incompatible intent did not interrupt");

// Retry after backoff and prove recurrence + remote answer cycle.
idle(); tick(1.3); watcherTrigger(); tick(0.15); watcherSustain(); tick(2.5); idle(); tick(5.6);
watcher = frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation;
assert(watcher.recurrenceCount >= 1, "Watcher recurrence missing after intent-latched retry");
assert(frameState.gatheringGroundAlive.ongoingResponseCycles >= 2, "reactive recurrence + cross-territory answer did not create LOOP cycles");
assert(frameState.gatheringGroundAlive.memory.mode === "coherent", `stable cohere sustain should read coherent, got ${frameState.gatheringGroundAlive.memory.mode}`);

console.log("HC031U2.1 relationship intent latch smoke PASS");
console.log(`- LIFE ${frameState.gatheringGroundAlive.completedCount}/6`);
console.log(`- LOOP ${frameState.gatheringGroundAlive.ongoingResponseCycles}`);
console.log(`- MEM ${frameState.gatheringGroundAlive.memory.mode}`);
console.log(`- Watcher interruptions ${watcher.interruptionCount}`);
