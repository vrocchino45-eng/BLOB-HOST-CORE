import * as THREE from "three";
import { GatheringGroundAliveSystem } from "../src/fields/GatheringGroundAliveSystem.js";

const assert = (condition, message) => { if (!condition) throw new Error(`[HC031U2 smoke] ${message}`); };
const makeRoot = (x, y, z) => { const r = new THREE.Group(); r.position.set(x, y, z); r.visible = true; return r; };

const frameState = {
  activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
  adjacentHostTerritory: { enteredTerritory: true },
  entityRelationshipGrammar: { byEntityId: {} },
  coreVerbEngineCoupling: { chord: "idle" }
};

const playerRoot = new THREE.Group();
playerRoot.position.set(7.2, 9.3, -54.0);

const entities = [
  { instanceId: "gathering_ground_watcher_001", root: makeRoot(7.4, 9.4, -54.2) },
  { instanceId: "gathering_ground_relay_a_001", root: makeRoot(3.5, 8.0, -55.0) },
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

const tick = (seconds, dt = 0.05) => {
  for (let t = 0; t < seconds - 1e-9; t += dt) system.update(dt, frameState);
};

const setWatcherChord = (active) => {
  frameState.coreVerbEngineCoupling.chord = active ? "cohere_project" : "idle";
  if (active) {
    frameState.entityRelationshipGrammar.byEntityId.gathering_ground_watcher_001 = {
      interpretation: "stable_interrogation", engagement01: 0.5, distance: 2
    };
  } else {
    delete frameState.entityRelationshipGrammar.byEntityId.gathering_ground_watcher_001;
  }
};

const setRelayChord = (active) => {
  frameState.coreVerbEngineCoupling.chord = active ? "cohere_draw" : "idle";
  if (active) {
    frameState.entityRelationshipGrammar.byEntityId.gathering_ground_relay_a_001 = {
      interpretation: "held_intake", engagement01: 0.5, distance: 2
    };
  } else {
    delete frameState.entityRelationshipGrammar.byEntityId.gathering_ground_relay_a_001;
  }
};

// Ambient behavior should take time instead of resolving immediately.
tick(2.5);
assert(frameState.gatheringGroundAlive.completedCount === 0, "ambient reads completed too early");
tick(11.2);
assert(frameState.gatheringGroundAlive.family.ambient.completed === 2, "two ambient reads should resolve by ~14s");

// Watcher response: prove sustained answer and interruption/retry.
setWatcherChord(true);
tick(0.8);
assert(frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation.state === "active", "Watcher response did not enter active phase");
assert(frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation.progress01 > 0, "Watcher response did not accumulate progress");
assert(frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation.progress01 < 1, "Watcher response still completed instantly");

setWatcherChord(false);
tick(0.4);
assert(frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation.state === "available", "Watcher chord break did not interrupt to available");
assert(frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation.interruptionCount >= 1, "Watcher interruption was not counted");

tick(1.3);
setWatcherChord(true);
tick(2.6);
assert(frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation.firstCompleted, "Watcher sustained response did not complete");
setWatcherChord(false);
tick(0.4);

// Relay sustained response.
setRelayChord(true);
tick(3.0);
assert(frameState.gatheringGroundAlive.encounters.reactive_relay_held_intake.firstCompleted, "Relay sustained response did not complete");
setRelayChord(false);

// Let first cross-territory consequences finish.
tick(6.6);
assert(frameState.gatheringGroundAlive.completedCount === 6, `expected initial LIFE 6/6, got ${frameState.gatheringGroundAlive.completedCount}`);
assert(frameState.gatheringGroundAlive.family.cross_territory.completed === 2, "cross-territory first reads did not complete");

// Wait through Watcher cooldown/release and trigger recurrence.
tick(2.0);
assert(
  frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation.state === "available",
  "Watcher relationship did not rearm after release + cooldown"
);
setWatcherChord(true);
tick(2.6);
setWatcherChord(false);
tick(5.6);

assert(frameState.gatheringGroundAlive.completedCount === 6, "recurrence changed first-read LIFE count");
assert(frameState.gatheringGroundAlive.ongoingResponseCycles >= 2, "Watcher recurrence + fresh Ridge echo should create ongoing cycles");
assert(frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation.recurrenceCount >= 1, "Watcher recurrence count missing");
assert(frameState.gatheringGroundAlive.encounters.cross_ridge_echo_return.recurrenceCount >= 1, "Ridge echo recurrence count missing");
assert(frameState.gatheringGroundAlive.memory.mode === "coherent", `expected coherent memory after deliberate responses, got ${frameState.gatheringGroundAlive.memory.mode}`);

const events = frameState.gatheringGroundAlive.recentEvents;
const watcherStarts = events.filter((e) => e.kind === "started" && e.encounterId === "reactive_watcher_stable_interrogation");
const watcherCompletes = events.filter((e) => e.kind === "completed" && e.encounterId === "reactive_watcher_stable_interrogation");
assert(watcherStarts.length >= 2 && watcherCompletes.length >= 2, "Watcher first-read + recurrence event trail missing");
for (const complete of watcherCompletes) {
  const prior = [...watcherStarts].reverse().find((start) => start.territoryAge <= complete.territoryAge);
  assert(prior && complete.territoryAge - prior.territoryAge >= 2.3, "Watcher reactive completion occurred effectively same-frame");
}

console.log("HC031U2 deterministic persistent ecology smoke PASS");
console.log(`- LIFE ${frameState.gatheringGroundAlive.completedCount}/6`);
console.log(`- LOOP ${frameState.gatheringGroundAlive.ongoingResponseCycles}`);
console.log(`- MEM ${frameState.gatheringGroundAlive.memory.mode}`);
