import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { SignalPlainEcologySystem } from '../src/fields/SignalPlainEcologySystem.js';

const inputSource = fs.readFileSync('src/input/InputSystem.js','utf8');
const jumpSource = fs.readFileSync('src/debug/DebugAreaJumpSystem.js','utf8');
assert.match(inputSource,/debugJumpDirect = Boolean\(event\.shiftKey\)/);
assert.match(jumpSource,/Ctrl\+Shift\+8/);
assert.match(jumpSource,/debugSignalPlainJumpRequest/);

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
const frameState = { activeCellId:'CELL_APERTURE_FIELDS_ARRIVAL_001', frame:1, runtimeSeconds:0, input:{} };
const sys = new SignalPlainEcologySystem({scene, playerRoot, frameState});
sys.onRuntimeMount(frameState);
assert.equal(frameState.signalPlainEcology.observedCount,0);
frameState.debugSignalPlainJumpRequest={pending:true,resetEncounter:true,requestedAtFrame:1};
sys.update(1/60,frameState);
assert.equal(frameState.debugSignalPlainJumpRequest.pending,false);
assert.equal(frameState.debugAreaJump.signalPlainDirectPositionReached,true);
assert.equal(frameState.signalPlainEcology.observedCount,0);
assert.ok(frameState.signalPlainEcology.signalPlainDistance < 5.5);

// Move onto node 1 and observe it once.
playerRoot.position.copy(sys.signalCenter).add(sys.nodes[0].group.position);
frameState.frame=2; frameState.runtimeSeconds=.1; frameState.input={interactPressed:true,interactEventId:1};
sys.update(1/60,frameState);
assert.equal(frameState.signalPlainEcology.observedCount,1);
assert.equal(frameState.signalPlainEcology.observedNodes[0].visualState,'read_and_retained');
assert.equal(frameState.signalPlainEcology.cumulativeOrganResponse,1/3);
assert.ok(sys.nodes[0].halo.material.opacity > sys.nodes[1].halo.material.opacity);

// Existing HC-015A rule remains: duplicate read does not advance.
frameState.frame=3; frameState.runtimeSeconds=.2; frameState.input={interactPressed:true,interactEventId:2};
sys.update(1/60,frameState);
assert.equal(frameState.signalPlainEcology.observedCount,1);
console.log('HC-015B Signal Plain readability/direct-debug validation passed.');
