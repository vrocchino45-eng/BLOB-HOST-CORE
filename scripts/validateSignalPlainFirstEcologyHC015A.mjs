import assert from 'node:assert/strict';
import * as THREE from 'three';
import { SignalPlainEcologySystem } from '../src/fields/SignalPlainEcologySystem.js';

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
const frameState = { activeCellId: 'CELL_APERTURE_FIELDS_ARRIVAL_001', frame: 1, runtimeSeconds: 0, input: {} };
const sys = new SignalPlainEcologySystem({ scene, playerRoot, frameState });
sys.onRuntimeMount(frameState);

// Debug/mount alone must award nothing.
sys.update(0.1, frameState);
assert.equal(frameState.signalPlainEcology.observedCount, 0);
assert.equal(frameState.signalPlainEcology.completed, false);
assert.equal(frameState.signalPlainEcology.mutatesGlobalProgression, false);

// Move to each authored node and observe once. Duplicates do not advance.
for (let i = 0; i < 3; i += 1) {
  playerRoot.position.copy(sys.signalCenter).add(sys.nodes[i].group.position);
  frameState.frame += 1;
  frameState.input = { interactPressed: true, interactEventId: frameState.frame };
  sys.update(0.05, frameState);
  assert.equal(frameState.signalPlainEcology.observedCount, i + 1);
  frameState.frame += 1;
  frameState.input = { interactPressed: true, interactEventId: frameState.frame };
  sys.update(0.05, frameState);
  assert.equal(frameState.signalPlainEcology.observedCount, i + 1);
}

// Premature pulse before settle cannot complete.
playerRoot.position.copy(sys.signalCenter);
frameState.frame += 1;
frameState.input = { pulsePressed: true, pulseEventId: frameState.frame };
sys.update(0.05, frameState);
assert.equal(frameState.signalPlainEcology.completed, false);

// Stabilize to ready.
frameState.input = { stabilizeHeld: true };
for (let i = 0; i < 40; i += 1) { frameState.frame += 1; frameState.runtimeSeconds += 0.05; sys.update(0.05, frameState); }
assert.equal(frameState.signalPlainEcology.ready, true);

// Fresh pulse completes only local response.
frameState.frame += 1;
frameState.input = { stabilizeHeld: true, pulsePressed: true, pulseEventId: frameState.frame };
sys.update(0.05, frameState);
assert.equal(frameState.signalPlainEcology.completed, true);
assert.equal(frameState.signalPlainEcology.opensGate, false);
assert.equal(frameState.signalPlainEcology.grantsAbility, false);
assert.equal(frameState.signalPlainEcology.spawnsCombat, false);

// Outside Aperture stays dormant.
frameState.activeCellId = 'CELL_COMB_THRESHOLD_FILTER_001';
sys.onRuntimeUnmount(frameState);
sys.update(0.1, frameState);
assert.equal(frameState.signalPlainEcology.active, false);
console.log('HC-015A Signal Plain first ecology validation passed.');
