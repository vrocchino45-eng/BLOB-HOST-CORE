import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { NearWorldFraming } from '../src/camera/NearWorldFraming.js';
import { SessionTelemetrySystem } from '../src/core/SessionTelemetrySystem.js';
import { WorldObjectCensusSystem } from '../src/debug/WorldObjectCensusSystem.js';
import { InputSystem } from '../src/input/InputSystem.js';
import { contactFlowPatch, MAX_FLOW_REACH, readFlowCoreProfile, SILT_FLOW_CELL, SILT_FLOW_SITE } from '../src/interaction/SiltFlowContract.js';
import { CoreEngineSystem } from '../src/player/CoreEngineSystem.js';
import { CoreFlowSystem } from '../src/player/CoreFlowSystem.js';
import { CoreRadialPerformanceSystem } from '../src/player/CoreRadialPerformanceSystem.js';
import { PlayerMovementController } from '../src/player/PlayerMovementController.js';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';
import { TargetingSystem } from '../src/targeting/TargetingSystem.js';
import { PlaytestHudSystem } from '../src/ui/PlaytestHudSystem.js';
import { RegionalTerritoryExpansion } from '../src/world/RegionalTerritoryExpansion.js';
import { c0e2SelectVolume, c0e2TerritoryPockets } from '../src/world/RegionalTerritoryVolume.js';

const step = 1 / 60;

function makeFrame() {
  return {
    frame: 0, runtimeSeconds: 0, activeHostId: 'HOST_ALPHA_WOUNDED_NURSERY', activeCellId: SILT_FLOW_CELL,
    firstSliceRuntimeMount: {
      mountSequence: 1, activeRuntimeCellId: SILT_FLOW_CELL, activeSystemIds: ['siltPressureRouteSystem']
    },
    targeting: { active: true, targetId: SILT_FLOW_SITE, attentionActive: true,
      attentionTargetId: SILT_FLOW_SITE, attentionSequence: 1, relationshipActive: false },
    playerComposition: { nutrient: 0.2 }, chemObjectState: { absorbedObjects: 0 },
    siltPressureRoute: { completed: false, returnFoldReady: false }, input: {}
  };
}

function makeCircuit({ framesPerBatch = 1, zone = 'inner_body' } = {}) {
  const frame = makeFrame();
  const root = new THREE.Group();
  const playerRoot = new THREE.Group();
  const body = new THREE.Group();
  body.name = 'player_seed_body_frame';
  playerRoot.add(body);
  const territory = new RegionalTerritoryExpansion({ kind: 'silt', parent: root, flowExperiment: true });
  const patch = territory.readFlowPatch(frame);
  playerRoot.position.copy(patch.center).add(new THREE.Vector3(0, 0, 1.18));
  const engine = new CoreEngineSystem({ frameState: frame, playerRoot });
  const radial = new CoreRadialPerformanceSystem({ frameState: frame, playerRoot });
  frame.spatialCoreChemistry = {
    retainedPieceCount: 3, counts: { membrane: 0, inner_body: 0, deep_core: 0, [zone]: 3 },
    topology: { id: zone, complete: true }
  };
  let request;
  const obstacles = [];
  const flow = new CoreFlowSystem({
    playerRoot,
    readPatch: current => territory.readFlowPatch(current),
    acceptFlow: (sample, current) => {
      request = sample;
      return territory.acceptFlow(sample, current);
    },
    readContactSurfaces: () => obstacles,
    renderReceiver: (state, progress) => territory.renderFlowFeedback(state, progress)
  });
  let index = 0;
  function tick(demand = 1, actionSequence = 1) {
    frame.frame = 1 + Math.floor(index / framesPerBatch);
    frame.runtimeSimulationSubstepIndex = index++ % framesPerBatch;
    frame.runtimeSimulationSubstepSeconds = step;
    frame.runtimeSeconds += step;
    frame.input = { flowDemand01: demand, flowActionSequence: actionSequence };
    engine.update(step);
    radial.update(step);
    territory.update({ dt: step, playerPosition: playerRoot.position, input: frame.input, frameState: frame });
    flow.update(step, frame);
    return frame.coreFlow;
  }
  return { frame, root, playerRoot, territory, patch, obstacles, flow, tick, get request() { return request; } };
}

test('The opt-in InputSystem latches calibrated RT, preserves B Cancel and requires release on reconnect', () => {
  const frame = makeFrame();
  for (const flowExperiment of [false, true]) {
    const input = new InputSystem({ flowExperiment });
    let device = true;
    let trigger = 0;
    input.readGamepad = () => ({ ...input.emptyGamepadState(), connected: device, name: 'Pad',
      absorbTriggerValue: trigger, absorbHeld: trigger > 0, cancelPressed: true, stabilizeHeld: true });
    input.update(step, frame);
    trigger = 0.32;
    input.update(step, frame);
    assert.equal(frame.input.cancelPressed, true);
    assert.equal(frame.input.stabilizeHeld, true);
    assert.equal(frame.input.absorbHeld, !flowExperiment);
    if (!flowExperiment) {
      assert.equal(Object.hasOwn(frame.input, 'flowDemand01'), false);
      continue;
    }
    assert.equal(frame.input.flowDemand01, 0.32);
    trigger = 0.85;
    input.update(step, frame);
    assert.equal(frame.input.flowDemand01, 0.85);
    assert.equal(frame.input.flowActionSequence, 1);
    device = false;
    trigger = 0;
    input.update(step, frame);
    assert.equal(frame.input.flowDemand01, 0);
    device = true;
    trigger = 0.85;
    input.update(step, frame);
    assert.equal(frame.input.flowDemand01, 0);
    assert.equal(frame.input.absorbHeld, false);
    trigger = 0;
    input.update(step, frame);
    trigger = 0.2;
    input.update(step, frame);
    assert.equal(frame.input.flowActionSequence, 2);
    frame.inspectionCamera = { active: true, coreWorkActive: true };
    input.update(step, frame);
    assert.equal(frame.input.flowDemand01, 0);
    assert.equal(frame.input.coreWorkManipDepth, 0.2);
    frame.inspectionCamera = null;
    input.update(step, frame);
    assert.equal(frame.input.absorbHeld, false);
    assert.equal(frame.input.flowDemand01, 0);
    trigger = 0;
    input.update(step, frame);
    frame.targeting = {};
    trigger = 1;
    input.update(step, frame);
    assert.equal(frame.input.absorbHeld, true);
    assert.equal(frame.input.flowDemand01, 0);
  }
});

test('Near World input is opt-in, edge-triggered and leaves modal controls and held Flow intact', (t) => {
  const buttons = Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }));
  const pad = { id: 'test pad', index: 0, mapping: 'standard', axes: [0, 0, 0, 0], buttons };
  t.mock.getter(globalThis, 'navigator', () => ({ getGamepads: () => [pad] }));
  const input = new InputSystem({ nearWorldExperiment: true, flowExperiment: true });
  const frame = makeFrame();
  const setButton = (index, value) => { buttons[index] = { pressed: value > 0, value }; };
  const tick = () => input.update(step, frame);
  tick();
  setButton(7, 0.42);
  setButton(14, 1);
  tick();
  assert.equal(frame.input.nearWorldToggleSequence, 1);
  const demand = frame.input.flowDemand01;
  const action = frame.input.flowActionSequence;
  assert.ok(demand > 0);
  tick();
  assert.equal(frame.input.nearWorldToggleSequence, 1);
  setButton(14, 0);
  tick();
  setButton(14, 1);
  tick();
  assert.equal(frame.input.nearWorldToggleSequence, 2);
  assert.equal(frame.input.flowDemand01, demand);
  assert.equal(frame.input.flowActionSequence, action);

  setButton(14, 0);
  tick();
  setButton(14, 1);
  setButton(8, 1);
  tick();
  assert.equal(frame.input.nearWorldToggleSequence, 2);
  frame.statusPage = { open: true };
  setButton(8, 0);
  setButton(14, 0);
  tick();
  setButton(14, 1);
  tick();
  assert.equal(frame.input.menuLeftPressed, true);
  assert.equal(frame.input.nearWorldToggleSequence, 2);

  frame.statusPage.open = false;
  frame.inspectionCamera = { active: true, coreWorkActive: true };
  setButton(14, 0);
  tick();
  setButton(14, 1);
  tick();
  assert.equal(frame.input.coreWorkSelectPrevPressed, true);
  assert.ok(frame.input.coreWorkManipDepth > 0);
  assert.equal(frame.input.nearWorldToggleSequence, 2);

  const keyboard = new InputSystem({ nearWorldExperiment: true });
  const standard = new InputSystem();
  const key = { code: 'KeyN', preventDefault() {} };
  keyboard.onKeyDown(key);
  standard.onKeyDown(key);
  keyboard.update(step, {});
  standard.update(step, {});
  assert.equal(keyboard.frameInput.nearWorldToggleSequence, 1);
  assert.equal(standard.frameInput.nearWorldToggleSequence, 0);
});

test('Near World preserves the gameplay sightline, clears authored walls and suspends during inspection', () => {
  const framing = new NearWorldFraming();
  const far = new THREE.PerspectiveCamera(58, 16 / 9, 0.06, 80);
  far.position.set(3, 3, 8);
  const core = new THREE.Vector3(0.2, 0, 0);
  far.lookAt(core);
  const direction = far.getWorldDirection(new THREE.Vector3());
  const originalPosition = far.position.clone();
  const originalRotation = far.quaternion.clone();
  const near = framing.update(1, 1, true, far, core, []);
  assert.ok(Math.abs(near.position.distanceTo(core) - 3.8) < 0.001);
  assert.deepEqual(near.getWorldDirection(new THREE.Vector3()), direction);
  assert.deepEqual(far.position, originalPosition);
  assert.ok(far.quaternion.equals(originalRotation));
  assert.equal(near.fov, far.fov);

  const wall = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 0.1));
  wall.quaternion.copy(far.quaternion);
  wall.position.copy(core).addScaledVector(direction, -3.4);
  const nearer = framing.update(step, 1, true, far, core, [{ object: wall }]);
  assert.ok(nearer.position.distanceTo(core) < 3.2);
  assert.ok(framing.obstructed);
  wall.position.copy(core).addScaledVector(direction, -2.4);
  assert.equal(framing.update(step, 1, true, far, core, [{ object: wall }]), far);
  wall.visible = false;
  assert.ok(framing.update(step, 1, true, far, core, [{ object: wall }]).position.distanceTo(core) > 3.7);
  assert.equal(framing.update(step, 1, false, far, core, []), far);
  assert.equal(framing.nearRequested, true);
  assert.equal(framing.update(step, 2, true, far, core, []), far);
});

test('Far and Near views produce identical receiver samples and retained site state for the same held action', () => {
  const reference = makeCircuit();
  const toggled = makeCircuit();
  const framing = new NearWorldFraming();
  const camera = new THREE.PerspectiveCamera(58, 16 / 9, 0.06, 80);
  camera.position.copy(toggled.playerRoot.position).add(new THREE.Vector3(1, 2, 8));
  camera.lookAt(toggled.playerRoot.position);
  for (let i = 0; i < 144; i++) {
    const sequence = i < 18 ? 0 : i < 100 ? 1 : 2;
    const presentation = framing.update(step, sequence, true, camera, toggled.playerRoot.position, []);
    if (i === 99) assert.ok(presentation.position.distanceTo(toggled.playerRoot.position) < 4);
    assert.deepEqual(toggled.tick(0.22).result, reference.tick(0.22).result);
    assert.deepEqual(toggled.territory.lastFlowResult, reference.territory.lastFlowResult);
  }
  assert.ok(toggled.territory.lastFlowResult.acceptedCurrent01 > 0);
});

test('The crown only reaches the authored disc from its exposed face and rejects obstruction', () => {
  const game = makeCircuit();
  const { patch } = game;
  const front = patch.center.clone().addScaledVector(patch.normal, 0.6);
  assert.ok(contactFlowPatch(patch, front, patch.normal.clone().negate(), MAX_FLOW_REACH));
  const back = patch.center.clone().addScaledVector(patch.normal, -0.6);
  assert.equal(contactFlowPatch(patch, back, patch.normal, MAX_FLOW_REACH), null);
  const side = front.clone().add(new THREE.Vector3(patch.radius + 0.05, 0, 0));
  assert.equal(contactFlowPatch(patch, side, patch.normal.clone().negate(), MAX_FLOW_REACH), null);

  game.playerRoot.position.z += 2;
  for (let i = 0; i < 30; i++) game.tick();
  assert.equal(game.frame.coreFlow.phase, 'disconnected');
  assert.equal(game.frame.coreFlow.reason, 'out_of_reach');
  assert.equal(game.frame.coreFlow.contactValid, false);
  assert.equal(game.territory.lastFlowResult, null);
  game.playerRoot.position.z -= 2;
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.03));
  wall.position.copy(patch.center).add(new THREE.Vector3(0, 0, 0.35));
  game.root.add(wall);
  game.obstacles.push(wall);
  assert.equal(game.tick().reason, 'obstructed');
  assert.equal(game.territory.lastFlowResult, null);
  wall.visible = false;
  assert.equal(game.tick().phase, 'contact');
  for (let i = 0; i < 5; i++) game.tick();
  assert.equal(game.frame.coreFlow.phase, 'conducting');
  assert.deepEqual(game.frame.coreFlow.tip, game.frame.coreFlow.contactPoint);
  for (const name of ['flow_forward_crown', 'flow_axial_tendril', 'flow_rear_conductor', 'flow_toroidal_return']) {
    assert.ok(game.playerRoot.getObjectByName(name)?.visible, name);
  }
});

test('The territory owner rejects forged, stale, duplicate and post-handoff samples', () => {
  const game = makeCircuit();
  for (let i = 0; i < 40; i++) game.tick();
  const sample = game.request;
  const retained = game.territory.snapshot().siteStates[0].imprint;
  assert.ok(retained > 0);
  assert.equal(game.territory.acceptFlow(sample, game.frame), null);
  game.frame.frame++;
  assert.equal(game.territory.acceptFlow(sample, game.frame), null);
  assert.equal(game.territory.acceptFlow({ ...sample, frame: game.frame.frame,
    profile: { ...readFlowCoreProfile(game.frame), recovery: 100 } }, game.frame), null);
  game.frame.firstSliceRuntimeMount.mountSequence++;
  assert.equal(game.territory.acceptFlow({ ...sample, frame: game.frame.frame,
    mountSequence: game.frame.firstSliceRuntimeMount.mountSequence }, game.frame), null);
  game.frame.targeting.targetId = 'different_target';
  assert.equal(game.tick().result, null);
  game.frame.targeting.targetId = SILT_FLOW_SITE;
  assert.equal(game.tick().demand01, 0);
  game.frame.activeCellId = 'CELL_SIGNAL_CHORUS_NERVE_001';
  assert.equal(game.tick(1, 2).phase, 'retracted');
  assert.equal(game.territory.acceptFlow(sample, game.frame), null);
  game.frame.activeCellId = SILT_FLOW_CELL;
  game.root.visible = false;
  assert.equal(game.tick(1, 3).result, null);
  assert.equal(game.territory.snapshot().siteStates[0].imprint, retained);
  game.root.visible = true;
  game.root.position.set(8, 0, 2);
  assert.equal(game.territory.snapshot().siteStates[0].imprint, retained);
  assert.notDeepEqual(game.territory.readFlowPatch(game.frame).center, game.patch.center);
});

test('Accepted current bounds strain and pressure, preserves mass and progression, then recovers', () => {
  const game = makeCircuit();
  const playerStart = game.playerRoot.position.clone();
  let peakCurrent = 0;
  let overloadCurrent;
  for (let i = 0; i < 280; i++) {
    const flow = game.tick();
    if (!flow.result) continue;
    const result = flow.result;
    peakCurrent = Math.max(peakCurrent, result.acceptedCurrent01);
    assert.ok(result.acceptedCurrent01 <= 0.55 && result.pressure01 <= 0.22);
    assert.ok(result.after.imprint >= result.before.imprint && result.after.imprint <= 1);
    assert.equal(result.after.strain, result.before.strain);
    assert.equal(result.after.void, result.before.void);
    assert.equal(result.materialTransferred, 0);
    assert.equal(result.progressionCredit, false);
    assert.equal(result.hostReceipt, false);
    if (flow.overloaded) overloadCurrent = result.acceptedCurrent01;
  }
  assert.ok(overloadCurrent > 0 && overloadCurrent < peakCurrent);
  assert.ok(game.playerRoot.position.equals(playerStart));
  assert.deepEqual(game.frame.playerComposition, { nutrient: 0.2 });
  assert.equal(game.frame.chemObjectState.absorbedObjects, 0);
  assert.deepEqual(game.frame.siltPressureRoute, { completed: false, returnFoldReady: false });
  assert.equal(game.tick(0).phase, 'recovering');
  assert.equal(game.frame.coreFlow.result, null);
  for (let i = 0; i < 180; i++) game.tick(0);
  assert.equal(game.frame.coreFlow.phase, 'retracted');
  assert.equal(game.frame.coreFlow.strain01, 0);
  assert.equal(game.frame.coreFlow.overloaded, false);
  assert.equal(game.territory.lastFlowResult, game.frame.coreFlow.lastResult);
  assert.equal(game.playerRoot.getObjectByName('core_flow_conductive_anatomy').visible, false);
});

test('Catch-up substeps match fixed steps and Core arrangements matter across 3, 6 and 12', () => {
  const fixed = makeCircuit();
  const catchUp = makeCircuit({ framesPerBatch: 4 });
  for (let i = 0; i < 120; i++) {
    fixed.tick(i < 100 ? 0.64 : 0);
    catchUp.tick(i < 100 ? 0.64 : 0);
  }
  assert.deepEqual(fixed.territory.snapshot().siteStates, catchUp.territory.snapshot().siteStates);
  assert.equal(fixed.frame.coreFlow.strain01, catchUp.frame.coreFlow.strain01);
  assert.equal(fixed.frame.coreFlow.circulation, catchUp.frame.coreFlow.circulation);

  const profiles = ['membrane', 'inner_body', 'deep_core'].map(zone => {
    const game = makeCircuit({ zone });
    return [3, 6, 12].map(phase => {
      game.frame.returnRegionEngine = { unlockedPhaseCount: phase };
      for (let i = 0; i < 40; i++) game.tick(0.44);
      assert.equal(game.frame.coreFlow.profile.phaseCount, phase);
      assert.equal(game.frame.coreFlow.result.profile.topologyId, zone);
      assert.equal(game.frame.corePerformance.endurance.reserve01, 1);
      return game.frame.coreFlow.result.acceptedCurrent01;
    });
  });
  for (let phase = 0; phase < 3; phase++) {
    assert.ok(profiles[0][phase] < profiles[1][phase] && profiles[1][phase] < profiles[2][phase]);
  }
});

test('A continuous approach from the Silt entry fits the authored movement envelope', () => {
  const game = makeCircuit();
  const center = { x: 0, y: 0, z: 0 };
  const pockets = c0e2TerritoryPockets(SILT_FLOW_CELL, center).flatMap(pocket => [pocket, ...pocket.bridges]);
  // Silt's first side-pocket bridges are part of the real movement owner's union.
  const base = { center, radii: { x: 1e-4, y: 1e-4, z: 1e-4 } };
  for (let i = 1; i <= 30; i++) {
    const point = new THREE.Vector3().lerp(game.playerRoot.position, i / 30);
    assert.ok(c0e2SelectVolume(point, base, pockets).normalizedDistance <= 1, point.toArray().join(','));
  }
});

function makeMountedSilt(flowExperiment = true) {
  const frame = makeFrame();
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  const body = new THREE.Group();
  body.name = 'player_seed_body_frame';
  playerRoot.add(body);
  scene.add(playerRoot);
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, 3);
  camera.lookAt(0, 0, -5);
  camera.updateMatrixWorld(true);
  const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
  const siltPressureRouteCircuit = json('../public/data/routes/siltPressureRouteCircuit_HC012A.json');
  const cell = json('../public/data/world/localCellRecipes.json').find(recipe => recipe.id === SILT_FLOW_CELL);
  const route = new SiltPressureRouteSystem({ frameState: frame, scene, playerRoot, camera, flowExperiment,
    recipeDataSystem: { data: { siltPressureRouteCircuit } } });
  route.init();
  route.onRuntimeMount(frame);
  frame.targeting = {};
  const targeting = new TargetingSystem({
    scene, camera, playerRoot, frameState: frame, chemObjectSystem: { objects: [] },
    readSiltFlowCandidate: current => route.territoryExpansion.readFlowCandidate(current, playerRoot.position)
  });
  targeting.init();
  const movement = new PlayerMovementController({ frameState: frame, camera, playerRoot, localCellRecipe: cell });
  const flow = new CoreFlowSystem({
    playerRoot, readPatch: current => route.territoryExpansion.readFlowPatch(current),
    acceptFlow: (request, current) => route.territoryExpansion.acceptFlow(request, current),
    readContactSurfaces: () => route.hcCrawlableSurfaceMeshes,
    renderReceiver: (state, progress) => route.territoryExpansion.renderFlowFeedback(state, progress)
  });
  function tick(input = {}, move = false) {
    frame.frame++;
    frame.runtimeSeconds += step;
    frame.runtimeSimulationSubstepSeconds = step;
    frame.input = input;
    targeting.update(step, frame);
    route.update(step, frame);
    if (move) movement.update(step, frame);
    if (flowExperiment) flow.update(step, frame);
  }
  return { frame, scene, camera, playerRoot, route, tick };
}

test('A normal mounted Silt approach acquires the same visible patch and delivers current', () => {
  const game = makeMountedSilt();
  const { frame, camera, playerRoot, route } = game;
  const patch = route.territoryExpansion.readFlowPatch(frame);
  assert.equal(patch.root.name, patch.id);
  assert.ok(route.root.getObjectByName(patch.id + '_mount'));
  const desired = patch.center.clone().add(new THREE.Vector3(0, 0, 1.13));
  const clamp = value => THREE.MathUtils.clamp(value, -1, 1);
  let attempts = 0;
  while (playerRoot.position.distanceTo(desired) > 0.17 && attempts++ < 480) {
    const delta = desired.clone().sub(playerRoot.position);
    game.tick({ moveX: clamp(delta.x * 1.8), moveY: clamp(delta.y * 1.8), moveZ: clamp(delta.z * 1.8) }, true);
  }
  assert.ok(attempts < 480, 'Movement owner could not reach the shelf approach');
  camera.position.copy(playerRoot.position).add(new THREE.Vector3(0, 0.5, 1.8));
  camera.lookAt(patch.center);
  camera.updateMatrixWorld(true);
  for (let i = 0; i < 20; i++) game.tick();
  assert.equal(frame.targeting.attentionTargetId, SILT_FLOW_SITE);
  for (let i = 0; i < 40; i++) game.tick({ flowDemand01: 0.68, flowActionSequence: 1 });
  assert.ok(frame.coreFlow.result?.acceptedCurrent01 > 0, frame.coreFlow.reason);
  assert.equal(frame.coreFlow.result.receiverId, patch.id);
  assert.equal(frame.siltPressureRoute.pressureRead, false);
  assert.equal(frame.siltPressureRoute.completed, false);
});

test('Off-axis world movement reaches the same Shelf approach with Far and Near framing', () => {
  const reference = makeMountedSilt();
  const toggled = makeMountedSilt();
  const framing = new NearWorldFraming();
  const patch = reference.route.territoryExpansion.readFlowPatch(reference.frame);
  const desired = patch.center.clone().add(new THREE.Vector3(0.15, 0, 1.13));
  for (const game of [reference, toggled]) {
    game.camera.position.set(2, 1.6, 5);
    game.camera.lookAt(new THREE.Vector3(2, 1.6, 0));
    game.camera.updateMatrixWorld(true);
  }
  const clamp = value => THREE.MathUtils.clamp(value, -1, 1);
  let nearFrames = 0;
  for (let i = 0; i < 480 && reference.playerRoot.position.distanceTo(desired) > 0.17; i++) {
    const delta = desired.clone().sub(reference.playerRoot.position);
    const input = { moveX: clamp(delta.x * 1.8), moveY: clamp(delta.y * 1.8), moveZ: clamp(delta.z * 1.8) };
    const view = framing.update(step, i < 12 ? 0 : i < 180 ? 1 : 2, true, toggled.camera,
      toggled.playerRoot.position, toggled.route.hcCrawlableSurfaceMeshes.map(object => ({ object })));
    if (view !== toggled.camera) nearFrames += 1;
    reference.tick(input, true);
    toggled.tick({ ...input }, true);
    assert.deepEqual(toggled.playerRoot.position, reference.playerRoot.position);
    assert.equal(toggled.frame.targeting.attentionTargetId, reference.frame.targeting.attentionTargetId);
    assert.equal(toggled.frame.targeting.attentionSequence, reference.frame.targeting.attentionSequence);
  }
  assert.ok(nearFrames > 0);
  assert.ok(toggled.playerRoot.position.distanceTo(desired) <= 0.17);
});

test('Shelf touch is distinct from delivery and each accepted sample drives the visual circuit', () => {
  const game = makeCircuit();
  const { uniforms } = game.territory.flowPatch;
  const selected = game.tick(0, 0);
  assert.equal(selected.ready, true);
  assert.equal(uniforms.shelfContact.value, 0);
  assert.equal(uniforms.shelfPressure.value, 0);
  assert.equal(game.flow.view, null);

  const originalAccept = game.territory.acceptFlow;
  game.territory.acceptFlow = () => null;
  let state = game.tick();
  while (!state.contactValid && state.step.frame < 30) state = game.tick();
  assert.equal(state.reason, 'contact');
  assert.equal(uniforms.shelfContact.value, 1);
  const { head, outboundAccent, returnAccent } = game.flow.view;
  const assertQuiet = () => {
    assert.equal(uniforms.shelfPressure.value, 0);
    assert.equal(outboundAccent.visible, false);
    assert.equal(returnAccent.visible, false);
    assert.equal(returnAccent.material.opacity, 0);
  };
  assertQuiet();
  for (let i = 0; i < 5; i++) state = game.tick();
  assert.equal(state.reason, 'receiver_rejected');
  assert.equal(uniforms.shelfContact.value, 1);
  assertQuiet();

  game.territory.acceptFlow = originalAccept;
  state = game.tick();
  assert.ok(state.result.acceptedCurrent01 > 0);
  assert.equal(outboundAccent.visible, true);
  assert.equal(returnAccent.visible, true);
  assert.equal(uniforms.shelfPressure.value, state.result.pressure01);
  assert.equal(returnAccent.material.opacity, 0.85 * Math.sqrt(state.result.resistance01));
  const progress = (2 * state.circulation) % 1;
  assert.equal(uniforms.shelfDeliveryProgress.value, progress);
  assert.ok(outboundAccent.position.equals(new THREE.Vector3(0, 0, -0.43).lerp(head.position, progress)));
  const previousPosition = outboundAccent.position.clone();
  const previousResistance = returnAccent.material.opacity;
  state = game.tick();
  assert.equal(uniforms.shelfPressure.value, state.result.pressure01);
  assert.equal(returnAccent.material.opacity, 0.85 * Math.sqrt(state.result.resistance01));
  assert.ok(!outboundAccent.position.equals(previousPosition));
  assert.ok(returnAccent.material.opacity > previousResistance);

  // The owner declined this sample even though the previous result is retained.
  game.territory.acceptFlow = () => null;
  state = game.tick();
  assert.equal(state.reason, 'receiver_rejected');
  assert.ok(state.lastResult.acceptedCurrent01 > 0);
  assert.equal(uniforms.shelfContact.value, 1);
  assertQuiet();
});

test('Release, obstruction, retarget, and Core Work clear live Flow cues on the first sample', () => {
  const interrupts = {
    release: game => game.tick(0),
    obstruction: game => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.03));
      wall.position.copy(game.patch.center).add(new THREE.Vector3(0, 0, 0.35));
      game.root.add(wall);
      game.obstacles.push(wall);
      return game.tick();
    },
    retarget: game => {
      game.frame.targeting.targetId = 'different_target';
      return game.tick();
    },
    coreWork: game => {
      game.frame.inspectionCamera = { active: true, coreWorkActive: true };
      return game.tick();
    }
  };
  for (const [name, interrupt] of Object.entries(interrupts)) {
    const game = makeCircuit();
    for (let i = 0; i < 35; i++) game.tick();
    const { uniforms, collarMaterial } = game.territory.flowPatch;
    const mark = collarMaterial.color.clone();
    const imprint = game.frame.coreFlow.result.after.imprint;
    const state = interrupt(game);
    assert.equal(state.result, null, name);
    assert.equal(uniforms.shelfContact.value, 0, name);
    assert.equal(uniforms.shelfPressure.value, 0, name);
    assert.equal(game.flow.view.outboundAccent.visible, false, name);
    assert.equal(game.flow.view.returnAccent.visible, false, name);
    assert.ok(collarMaterial.color.equals(mark), name);
    assert.equal(game.territory.flowPatch.site.imprint, imprint, name);
  }
});

test('The Shelf retains its owner-derived collar mark after an actual route unmount and remount', () => {
  const { frame, route, playerRoot, camera, tick } = makeMountedSilt();
  const territory = route.territoryExpansion;
  const patch = territory.readFlowPatch(frame);
  const { uniforms, collarMaterial, site } = territory.flowPatch;
  const dormantColor = collarMaterial.color.clone();
  playerRoot.position.copy(patch.center).add(new THREE.Vector3(0, 0, 1.18));
  camera.position.copy(playerRoot.position).add(new THREE.Vector3(0, 0.5, 1.8));
  camera.lookAt(patch.center);
  camera.updateMatrixWorld(true);
  for (let i = 0; i < 20; i++) tick();
  for (let i = 0; i < 38; i++) tick({ flowDemand01: 0.68, flowActionSequence: 1 });
  assert.ok(frame.coreFlow.result.acceptedCurrent01 > 0);
  const imprint = site.imprint;
  const markedColor = collarMaterial.color.clone();
  assert.ok(!markedColor.equals(dormantColor));

  route.onRuntimeUnmount(frame);
  frame.activeCellId = 'CELL_SIGNAL_CHORUS_NERVE_001';
  frame.firstSliceRuntimeMount.mountSequence++;
  tick();
  assert.equal(frame.coreFlow.result, null);
  assert.equal(uniforms.shelfContact.value, 0);
  assert.equal(uniforms.shelfPressure.value, 0);
  assert.equal(playerRoot.getObjectByName('flow_crown_current_tracer').visible, false);
  assert.equal(playerRoot.getObjectByName('flow_resistance_tracer').visible, false);

  frame.activeCellId = SILT_FLOW_CELL;
  frame.firstSliceRuntimeMount.mountSequence++;
  route.onRuntimeMount(frame);
  tick();
  assert.equal(route.territoryExpansion, territory);
  assert.equal(site.imprint, imprint);
  assert.ok(collarMaterial.color.equals(markedColor));
  assert.equal(uniforms.shelfPressure.value, 0);
});

test('The mounted Silt route still reads pressure, opens the ribs, accepts the packet and readies return', () => {
  const game = makeMountedSilt();
  const { frame, playerRoot, route } = game;
  playerRoot.position.copy(route.ribGroups[0].getWorldPosition(new THREE.Vector3()));
  for (let i = 0; i < 60; i++) game.tick({ stabilizeHeld: true });
  game.tick({ stabilizeHeld: true, pulsePressed: true, pulseEventId: 1 });
  assert.equal(frame.siltPressureRoute.pressureRead, true);
  for (let i = 0; i < 160 && !frame.siltPressureRoute.ribsReleased; i++) game.tick({ stabilizeHeld: true, pulseEventId: 1 });
  assert.equal(frame.siltPressureRoute.ribsReleased, true);
  playerRoot.position.copy(route.safePacket.getWorldPosition(new THREE.Vector3()));
  for (let i = 0; i < 160 && !frame.siltPressureRoute.safeMatterAbsorbed; i++) game.tick({ absorbHeld: true, pulseEventId: 1 });
  assert.equal(frame.siltPressureRoute.safeMatterAbsorbed, true);
  assert.equal(frame.siltPressureRoute.denseMatterLeftIntact, true);
  playerRoot.position.copy(route.pathCurve.getPointAt(0.9)).add(route.entryAnchor);
  for (let i = 0; i < 160 && !frame.siltPressureRoute.completed; i++) game.tick({ pulseEventId: 1 });
  assert.equal(frame.siltPressureRoute.returnFoldReady, true);
  assert.equal(frame.siltPressureRoute.completed, true);
  route.onRuntimeUnmount(frame);
  route.onRuntimeMount(frame);
  assert.equal(frame.siltPressureRoute.completed, true);
  assert.equal(frame.siltPressureRoute.returnFoldReady, true);
});

test('The existing Silt seat accepts and extracts one gripped identity without changing mass', () => {
  const { route } = makeMountedSilt();
  const seat = route.siltPlateSeat;
  const mass = route.materialIdentity.totalMass();
  const unit = route.livingCycle.units[0].id;
  const contact = { unitId: unit, heldPosition: [0, 0, 0], sitePosition: [0, 0, 0],
    isBraced: true, imprinted: true, actuallyTouching: true };
  assert.equal(seat.trySeat({ ...contact, imprinted: false }), null);
  const seated = seat.trySeat(contact);
  assert.equal(seated.outcome, 'plate-seated');
  assert.equal(seated.unitId, unit);
  assert.equal(seat.trySeat(contact), null);
  assert.equal(seat.tryExtract({ unitId: unit, gripAccepted: false }), null);
  const extracted = seat.tryExtract({ unitId: unit, gripAccepted: true });
  assert.equal(extracted.outcome, 'plate-extracted');
  assert.equal(extracted.unitId, unit);
  assert.equal(extracted.conservedMass, true);
  assert.equal(route.materialIdentity.totalMass(), mass);
});

test('Optional labels and exports use the owner result and distinguish live delivery from history', () => {
  const game = makeCircuit();
  const frame = game.frame;
  frame.quickLookInspector = { coreLabelsEnabled: true };
  const census = new WorldObjectCensusSystem({ frameState: frame });
  const telemetry = new SessionTelemetrySystem({ frameState: frame });
  const hud = new PlaytestHudSystem({ recipeDataSystem: { data: {} }, frameState: frame });
  game.tick();
  assert.match(hud.resolveHudState(frame, true).flowLine, /Crown extending/);
  for (let i = 0; i < 35; i++) game.tick();
  const result = game.territory.lastFlowResult;
  assert.equal(census.snapshot().siltFlow.result, result);
  assert.equal(telemetry.exportSession().developerTruth.siltFlow.result, result);
  assert.match(hud.resolveHudState(frame, true).flowLine, /Current accepted.*shelf imprint/);
  frame.quickLookInspector.coreLabelsEnabled = false;
  assert.equal(hud.resolveHudState(frame, true).flowLine, '');
  frame.statusPage = { open: true };
  game.tick();
  assert.equal(census.snapshot().siltFlow.result, null);
  assert.equal(telemetry.exportSession().developerTruth.siltFlow.lastResult, result);
  frame.statusPage = { open: false };
  assert.equal(game.tick().demand01, 0);
});

test('Flow labels explain selection, range, alignment, obstruction and receiver-confirmed delivery', () => {
  const game = makeCircuit();
  const { frame, patch, playerRoot } = game;
  frame.quickLookInspector = { coreLabelsEnabled: true };
  const hud = new PlaytestHudSystem({ recipeDataSystem: { data: {} }, frameState: frame });
  const read = () => hud.resolveHudState(frame, true).flowLine;
  frame.targeting.targetId = 'other_target';
  game.tick(0, 0);
  assert.match(read(), /No receiver selected/);
  frame.targeting.targetId = SILT_FLOW_SITE;
  game.tick(0, 0);
  assert.match(read(), /Shelf selected/);

  const approach = playerRoot.position.clone();
  playerRoot.position.z += 2;
  for (let i = 0; i < 25; i++) game.tick();
  assert.match(read(), /Out of reach.*move closer/);
  playerRoot.position.copy(approach);
  playerRoot.rotation.y = Math.PI;
  game.tick();
  assert.match(read(), /Crown misaligned.*steer the Core/);
  assert.doesNotMatch(read(), /Current accepted/);

  playerRoot.rotation.y = 0;
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.03));
  wall.position.copy(patch.center).add(new THREE.Vector3(0, 0, 0.35));
  game.root.add(wall);
  game.obstacles.push(wall);
  game.tick();
  assert.match(read(), /Contact obstructed/);
  wall.visible = false;
  game.tick();
  assert.match(read(), /Valid contact.*waiting for current/);
  assert.doesNotMatch(read(), /Current accepted/);
  const acceptFlow = game.territory.acceptFlow;
  game.territory.acceptFlow = () => null;
  for (let i = 0; i < 5; i++) game.tick();
  assert.match(read(), /Contact made.*current declined/);
  game.territory.acceptFlow = acceptFlow;
  game.tick();
  assert.match(read(), /Current accepted.*resistance/);
  for (let i = 0; i < 240 && !frame.coreFlow.overloaded; i++) game.tick();
  assert.match(read(), /Overload.*current limited.*resistance/);
  game.tick(0);
  assert.match(read(), /Released.*recovering/);
  assert.doesNotMatch(read(), /Current accepted/);
});

test('Session exports deduplicate Flow transitions while retaining frame, substep and receiver identity', () => {
  const game = makeCircuit({ framesPerBatch: 3 });
  const { frame, patch, playerRoot } = game;
  const telemetry = new SessionTelemetrySystem({ frameState: frame, monotonicNowMs: () => 0 });
  function tick(demand = 1, sequence = 1) {
    game.tick(demand, sequence);
    telemetry.update(step);
    return frame.coreFlow;
  }
  const snapshot = () => telemetry.exportSession();
  const history = () => snapshot().events.filter(event => event.type === 'flow.silt_contact_transition').map(event => event.developer);
  tick(0, 0);
  let firstAccepted;
  for (let i = 0; i < 35; i++) {
    const state = tick();
    firstAccepted ??= state.result;
  }
  assert.deepEqual(history().map(event => [event.previousPhase, event.newPhase, event.reason]), [
    [null, 'retracted', 'ready'], ['retracted', 'disconnected', 'extending'],
    ['disconnected', 'contact', 'contact'], ['contact', 'conducting', 'current_accepted']
  ]);
  const { hostId, cellId, mountSequence, frame: acceptedFrame, substep } = firstAccepted;
  assert.deepEqual(history().at(-1), {
    previousPhase: 'contact', newPhase: 'conducting', reason: 'current_accepted', receiverId: patch.id,
    actionSequence: 1, hostId, cellId, mountSequence, frame: acceptedFrame, substep
  });
  assert.ok(history().some(event => event.substep > 0));
  for (let i = 0; i < 5; i++) tick();
  assert.equal(history().length, 4);

  playerRoot.rotation.y = Math.PI;
  tick();
  assert.deepEqual(history().at(-1), {
    previousPhase: 'conducting', newPhase: 'disconnected', reason: 'align_core', receiverId: patch.id,
    actionSequence: 1, ...frame.coreFlow.step
  });
  assert.equal(snapshot().developerTruth.siltFlow.result, null);
  assert.ok(snapshot().developerTruth.siltFlow.lastResult.acceptedCurrent01 > 0);
  playerRoot.rotation.y = 0;
  for (let i = 0; i < 5; i++) tick();
  assert.equal(history().at(-1).reason, 'current_accepted');
  frame.targeting.targetId = 'other_target';
  tick();
  assert.equal(history().at(-1).reason, 'target_changed');
  assert.equal(history().at(-1).receiverId, patch.id);

  frame.targeting.targetId = SILT_FLOW_SITE;
  frame.targeting.attentionSequence++;
  for (let i = 0; i < 35; i++) tick(1, 2);
  assert.equal(history().at(-1).newPhase, 'conducting');
  frame.statusPage = { open: true };
  tick(0, 2);
  assert.equal(history().at(-1).reason, 'menu_open');
  assert.equal(history().at(-1).receiverId, patch.id);
  assert.equal(history().at(-1).actionSequence, 2);
  assert.equal(snapshot().developerTruth.siltFlow.result, null);

  frame.statusPage.open = false;
  frame.inspectionCamera = { active: true };
  tick(0, 2);
  assert.equal(history().at(-1).reason, 'inspection');
  frame.inspectionCamera.coreWorkActive = true;
  tick(0, 2);
  assert.equal(history().at(-1).reason, 'core_work');
  assert.equal(history().at(-1).receiverId, patch.id);
  frame.activeCellId = 'CELL_SIGNAL_CHORUS_NERVE_001';
  frame.firstSliceRuntimeMount.mountSequence++;
  tick(0, 2);
  assert.equal(history().at(-1).reason, 'outside_silt');
  assert.equal(history().at(-1).mountSequence, 2);
  const count = history().length;
  tick(0, 2);
  assert.equal(history().length, count);
});
