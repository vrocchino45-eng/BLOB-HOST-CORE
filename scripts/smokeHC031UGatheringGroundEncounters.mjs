import * as THREE from "three";
import { GatheringGroundAliveSystem } from "../src/fields/GatheringGroundAliveSystem.js";

const assert = (condition, message) => { if (!condition) throw new Error(`[HC031U smoke] ${message}`); };
const root = (x,y,z) => { const r = new THREE.Group(); r.position.set(x,y,z); r.visible = true; return r; };

const frameState = {
  activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
  adjacentHostTerritory: { enteredTerritory: true },
  entityRelationshipGrammar: { byEntityId: {} }
};
const playerRoot = new THREE.Group();
playerRoot.position.set(7.2,9.3,-54.0);
const entities = [
  { instanceId: "gathering_ground_watcher_001", root: root(7.4,9.4,-54.2) },
  { instanceId: "gathering_ground_relay_a_001", root: root(0.4,7.2,-58.4) },
  { instanceId: "gathering_ground_relay_b_001", root: root(-3.8,10.2,-53.8) }
];
const system = new GatheringGroundAliveSystem({
  scene: new THREE.Scene(),
  playerRoot,
  frameState,
  entitySystem: { entities },
  apertureFieldsArrivalSystem: { entryAnchor: new THREE.Vector3(0,0,0) }
});
system.onRuntimeMount(frameState);

const tick = (seconds, dt=0.1) => { for (let t=0; t<seconds-1e-9; t+=dt) system.update(dt, frameState); };

tick(7.0);
assert(frameState.gatheringGroundAlive.encounters.ambient_watcher_sweep.state === "completed", "ambient Watcher sweep did not complete");
assert(frameState.gatheringGroundAlive.encounters.ambient_relay_exchange.state === "completed", "ambient relay exchange did not complete");

frameState.entityRelationshipGrammar.byEntityId.gathering_ground_watcher_001 = {
  interpretation: "stable_interrogation", engagement01: 0.5, distance: 2
};
system.update(0.1, frameState);
assert(frameState.gatheringGroundAlive.encounters.reactive_watcher_stable_interrogation.state === "completed", "Watcher Stable+Pulse encounter did not complete");

frameState.entityRelationshipGrammar.byEntityId.gathering_ground_relay_a_001 = {
  interpretation: "held_intake", engagement01: 0.5, distance: 2
};
system.update(0.1, frameState);
assert(frameState.gatheringGroundAlive.encounters.reactive_relay_held_intake.state === "completed", "Relay Stable+Absorb encounter did not complete");

tick(5.0);
assert(frameState.gatheringGroundAlive.completedCount === 6, `expected 6/6 completed, got ${frameState.gatheringGroundAlive.completedCount}`);
assert(frameState.gatheringGroundAlive.family.ambient.completed === 2, "ambient family should be 2/2");
assert(frameState.gatheringGroundAlive.family.reactive.completed === 2, "reactive family should be 2/2");
assert(frameState.gatheringGroundAlive.family.cross_territory.completed === 2, "cross family should be 2/2");
assert(frameState.gatheringGroundAlive.recentEvents.some((e) => e.kind === "completed" && e.encounterId === "cross_ridge_echo_return"), "ridge echo completion event missing");
assert(frameState.gatheringGroundAlive.recentEvents.some((e) => e.kind === "completed" && e.encounterId === "cross_matter_spill_return"), "matter spill completion event missing");

console.log("HC031U deterministic encounter smoke PASS — 6/6");
