import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { buildBoundedSimulationSteps } from '../src/core/BoundedSimulationCatchUp.js';
import { GameRuntime } from '../src/core/GameRuntime.js';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { SystemRegistry } from '../src/core/SystemRegistry.js';
import { InputSystem } from '../src/input/InputSystem.js';
import { VerbCompositionSystem } from '../src/interaction/VerbCompositionSystem.js';
import { CoreFlowSystem } from '../src/player/CoreFlowSystem.js';
import { CoreRadialPerformanceSystem } from '../src/player/CoreRadialPerformanceSystem.js';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';
import { TargetingSystem } from '../src/targeting/TargetingSystem.js';

const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const HOST = 'HOST_ALPHA_WOUNDED_NURSERY';
const SHELF = 'silt_porosity_shelf';
const STEP = 1 / 60;
const FORWARD = new THREE.Vector3(0, 0, -1);
const LEFT = new THREE.Vector3(-0.61, 0.20, -0.77).normalize();
const RIGHT = new THREE.Vector3(0.61, 0.20, -0.77).normalize();
const vec = array => new THREE.Vector3().fromArray(array);
const near = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) <= tolerance, String(a) + ' differs from ' + b);
const recipe = JSON.parse(readFileSync(new URL('../public/data/routes/siltPressureRouteCircuit_HC012A.json', import.meta.url)));

function makeGame(t, { padMode = false, flowExperiment = false } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const playerRoot = new THREE.Group();
  const body = new THREE.Group();
  body.name = 'player_seed_body_frame';
  playerRoot.add(body);
  scene.add(camera, playerRoot);
  const mountState = (cellId, mountSequence) => ({ activeRuntimeCellId: cellId, mountSequence,
    activeSystemIds: cellId === SILT ? ['siltPressureRouteSystem', 'targetingSystem'] : [] });
  const frame = { frame: 0, runtimeSeconds: 0, activeCellId: SILT, activeHostId: HOST, input: {},
    firstSliceRuntimeMount: mountState(SILT, 1), playerComposition: { nutrient: 0.2 },
    chemObjectState: { absorbedObjects: 0 } };
  const ledger = new HostConnectionReceiptLedger();
  const route = new SiltPressureRouteSystem({ scene, camera, playerRoot, frameState: frame,
    flowExperiment, recipeDataSystem: { data: { siltPressureRouteCircuit: recipe } }, hostConnectionReceiptLedger: ledger });
  const keyboard = new InputSystem({ flowExperiment });
  // The tests feed existing event handlers directly; there is no browser DOM.
  keyboard.init = () => {};
  const buttons = Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }));
  const pad = { id: 'standard test pad', index: 0, mapping: 'standard', axes: [0, 0, 0, 0], buttons };
  t.mock.getter(globalThis, 'navigator', () => ({ getGamepads: () => padMode ? [pad] : [] }));
  const targeting = new TargetingSystem({ scene, camera, playerRoot, frameState: frame, chemObjectSystem: { objects: [] },
    readSiltFlowCandidate: flowExperiment
      ? state => route.territoryExpansion?.readFlowCandidate(state, playerRoot.position) : null });
  const composition = new VerbCompositionSystem({ frameState: frame });
  const radial = new CoreRadialPerformanceSystem({ frameState: frame, playerRoot });
  const flow = flowExperiment ? new CoreFlowSystem({
    playerRoot, readPatch: state => route.territoryExpansion.readFlowPatch(state),
    acceptFlow: (request, state) => route.territoryExpansion.acceptFlow(request, state),
    readContactSurfaces: () => route.hcCrawlableSurfaceMeshes
  }) : null;
  const registry = new SystemRegistry();
  // Approach poses and scene construction are fixture setup. Normalized
  // keyboard and standard-pad edges run through the production owner order.
  GameRuntime.prototype.registerRuntimeSystems.call({
    registry: { register(id, system, options) { if (system && id !== 'chemPulseResponse') registry.register(id, system, options); } },
    inputSystem: keyboard, targetingSystem: targeting, verbCompositionSystem: composition,
    siltPressureRouteSystem: route, coreRadialPerformanceSystem: radial, coreFlowSystem: flow, flowExperiment
  });
  function step(dt = STEP, substep = 0, count = 1) {
    if (substep === 0) frame.frame++;
    frame.runtimeSeconds += dt;
    frame.runtimeSimulationSubstepIndex = substep;
    frame.runtimeSimulationSubstepCount = count;
    frame.runtimeSimulationSubstepSeconds = dt;
    registry.update(dt, frame);
  }
  function setButton(index, code, down) {
    if (padMode) buttons[index] = { value: Number(down), pressed: down };
    else keyboard[down ? 'onKeyDown' : 'onKeyUp']({ code, repeat: false, preventDefault() {} });
  }
  step();
  return { frame, route, targeting, radial, ledger, playerRoot, camera, step,
    steps(n) { for (let i = 0; i < n; i++) step(); },
    pulse(down) { setButton(2, 'KeyX', down); },
    stabilize(down) { setButton(6, 'KeyQ', down); },
    interact(down) { setButton(0, 'KeyE', down); },
    absorb(value) {
      if (padMode) buttons[7] = { value, pressed: value > 0 };
      else keyboard[value > 0 ? 'onMouseDown' : 'onMouseUp']({ button: 2 });
    },
    aim(direction) {
      camera.position.copy(playerRoot.position).add(new THREE.Vector3(0, 0, 0.35));
      camera.lookAt(camera.position.clone().add(direction));
      camera.updateMatrixWorld(true);
    },
    aimAt(local) {
      const target = route.root.localToWorld(vec(local));
      this.aim(target.sub(playerRoot.position.clone().add(new THREE.Vector3(0, 0, 0.35))).normalize());
    },
    mount(cellId) {
      frame.activeCellId = cellId;
      frame.firstSliceRuntimeMount = mountState(cellId, frame.firstSliceRuntimeMount.mountSequence + 1);
    }
  };
}

function tap(game, command) {
  game[command](true);
  game.step();
  game[command](false);
  game.step();
}

function grainMesh(game, unit) {
  return game.route.livingMatterMeshes[game.route.livingCycle.units.indexOf(unit)].body;
}

function acquire(game, unit) {
  game.stabilize(true);
  for (let i = 0; i < 35 && game.route.siltGrip.heldId !== unit.id; i++) {
    const local = grainMesh(game, unit).position.toArray();
    game.playerRoot.position.copy(game.route.root.localToWorld(vec(local).add(new THREE.Vector3(0, 0, 0.76))));
    game.aimAt(local);
    game.step();
    if (game.frame.siltMaterialAim.candidateId === unit.id) tap(game, 'interact');
  }
  assert.equal(game.route.siltGrip.heldId, unit.id);
  assert.equal(game.route.materialIdentity.get(unit.id).owner, 'grip');
}

function prepare(t, options) {
  const game = makeGame(t, options);
  const { route, playerRoot } = game;
  playerRoot.position.copy(route.ribGroups[0].getWorldPosition(new THREE.Vector3()));
  game.aim(FORWARD);
  game.stabilize(true);
  game.steps(60);
  tap(game, 'pulse');
  assert.equal(route.pressureRead, true);
  for (let i = 0; i < 160 && !route.ribsReleased; i++) game.step();
  assert.equal(route.ribsReleased, true);
  game.stabilize(false);
  playerRoot.position.copy(route.safePacket.getWorldPosition(new THREE.Vector3()));
  game.aim(FORWARD.clone().negate());
  game.steps(3);
  game.absorb(1);
  for (let i = 0; i < 160 && !route.safeMatterAbsorbed; i++) game.step();
  game.absorb(0);
  game.step();
  assert.equal(route.safeMatterAbsorbed, true);
  let unit;
  for (let i = 0; i < 700 && !unit; i++) {
    game.step();
    unit = route.livingCycle.units.find((grain, index) => ['veins', 'garden_transit', 'settled'].includes(grain.phase)
      && route.livingMatterMeshes[index].body.visible);
  }
  assert.ok(unit, 'the native cycle surfaced an eligible grain');
  acquire(game, unit);
  return { game, unit };
}

const status = game => game.frame.siltPressureRoute.materialLaunch;
const launch = game => status(game).lastCommitment;
const receipts = game => game.ledger.snapshot({ withRecords: true });
const releases = game => game.route.transactionTrace.filter(row => row.kind === 'silt-trajectory');

function charge(game, aim = LEFT, steps = 48) {
  game.aim(aim);
  game.pulse(true);
  game.steps(steps);
  assert.equal(status(game).ready, true);
}

function commit(game) {
  game.interact(true);
  game.step();
  game.interact(false);
  assert.ok(launch(game), status(game).rejectionReason);
  assert.equal(game.frame.input.interactPressed, false);
  assert.equal(game.frame.input.pulsePressed, false);
  return launch(game);
}

function releasePulse(game) {
  game.pulse(false);
  game.step();
}

function prepareGarden(game) {
  const route = game.route;
  const garden = vec(route.siltContact.position);
  game.playerRoot.position.copy(route.root.localToWorld(garden.clone().sub(route.siltGripLocalOffset)));
  game.aimAt(garden.toArray());
  game.steps(15);
  for (let i = 0; i < 8 && !route.siltContact.imprinted; i++) {
    tap(game, 'pulse');
    game.steps(2);
  }
  assert.ok(route.siltContact.imprinted && route.siltContact.braced);
}

test('keyboard and standard gamepad launch and retrieve the same grain, then use the existing seat and extraction', t => {
  const compared = [false, true].map(padMode => {
    const { game, unit } = prepare(t, { padMode });
    const mesh = grainMesh(game, unit);
    const generation = unit.generation;
    const position = game.route.siltGrip.position.slice();
    charge(game);
    const reserveBefore = game.radial.reserve01;
    const result = commit(game);
    assert.deepEqual([result.unitId, result.generation, result.hostId, result.cellId, result.mountSequence, result.frame, result.substep],
      [unit.id, generation, HOST, SILT, 1, game.frame.frame, 0]);
    position.forEach((v, i) => near(result.releasePosition[i], v, 0.00006));
    assert.equal(game.route.siltGrip.heldId, null);
    assert.equal(game.route.materialIdentity.get(unit.id).owner, 'environment');
    const firstDelta = vec(game.route.siltTrajectory.get(unit.id).position).sub(vec(position));
    assert.ok(firstDelta.dot(LEFT) > 0 && firstDelta.length() <= STEP * 2.1 + 1e-8);
    const receipt = receipts(game).records.at(-1);
    assert.deepEqual([receipt.subjectId, receipt.materialTransfer, receipt.routeCredit, receipt.worldConsequence],
      [unit.id, false, false, false]);
    assert.equal(receipt.sourceReceiptSequence, result.releaseDecisionSequence);
    assert.deepEqual(receipt.releaseVelocity, result.releaseVelocity);
    const reserveAfter = game.radial.reserve01;
    releasePulse(game);
    assert.equal(game.frame.input.pulsePressed, false);
    game.steps(10);
    acquire(game, unit);
    assert.equal(game.route.siltTrajectory.has(unit.id), false);
    prepareGarden(game);
    tap(game, 'interact');
    assert.equal(game.route.siltPlateSeat.unitId, unit.id);
    const anchor = game.route.entryAnchor.clone();
    game.mount(HUB);
    game.playerRoot.position.copy(anchor);
    game.mount(SILT);
    game.step();
    assert.equal(game.route.siltPlateSeat.unitId, unit.id);
    acquire(game, unit);
    assert.equal(game.route.siltPlateSeat.unitId, null);
    assert.equal(grainMesh(game, unit), mesh);
    assert.equal(unit.generation, generation);
    assert.equal(game.route.materialIdentity.totalMass(), 8);
    assert.equal(receipts(game).acceptedTotal, 1);
    return { ...result, receipt, reserveBefore, reserveAfter, firstDelta: firstDelta.toArray(), mass: 8 };
  });
  assert.deepEqual(compared[0], compared[1]);
  t.diagnostic(JSON.stringify(compared[0]));
});

test('matched off-axis directions and low or high valid charge use the existing bounded impulse', t => {
  const samples = [[LEFT, 48], [RIGHT, 48], [LEFT, 26], [LEFT, 88]].map(([aim, time]) => {
    const { game } = prepare(t);
    charge(game, aim, time);
    const result = commit(game);
    assert.equal(result.intendedTargetId, null);
    assert.equal(result.actualRecipientId, null);
    assert.ok(vec(result.releaseDirection).dot(aim) > 0.999999);
    const velocity = vec(result.releaseVelocity);
    const speed = velocity.length();
    assert.ok(speed <= 2.1 && velocity.normalize().dot(aim) > 0.99998);
    near(speed, Math.min(1.35, 0.55 + 0.28 * result.charge01 * 2.1), 0.00009);
    return { ...result, speed };
  });
  const [left, right, low, high] = samples;
  assert.deepEqual(left.releasePosition, right.releasePosition);
  near(left.speed, right.speed, 1e-6);
  assert.ok(left.releaseVelocity[0] < 0 && right.releaseVelocity[0] > 0);
  assert.ok(low.charge01 > 0 && high.charge01 > low.charge01 && high.speed > low.speed);
  t.diagnostic(JSON.stringify(samples));
});

test('ordinary quick and charged Pulse retain tether displacement and ordinary A/E release', t => {
  for (const pulseSteps of [2, 85]) {
    const { game, unit } = prepare(t);
    const radius = game.route.siltGripLocalOffset.length();
    game.aim(RIGHT);
    game.pulse(true);
    game.steps(pulseSteps);
    releasePulse(game);
    assert.equal(game.frame.input.pulseReleaseKind, pulseSteps === 2 ? 'quick' : 'charged');
    near(game.route.siltGripLocalOffset.length() - radius, 0.28);
    assert.equal(game.route.siltGrip.heldId, unit.id);
    tap(game, 'interact');
    assert.equal(game.route.siltGrip.heldId, null);
    assert.equal(launch(game), null);
    assert.equal(releases(game).at(-1).launch, undefined);
  }
  const { game } = prepare(t);
  game.pulse(true);
  game.steps(2);
  tap(game, 'interact');
  assert.equal(game.route.siltGrip.heldId, null);
  assert.equal(launch(game), null);
  assert.equal(receipts(game).acceptedTotal, 1);
});

test('valid commitment takes the interaction edge ahead of an otherwise eligible seat', t => {
  const { game, unit } = prepare(t);
  prepareGarden(game);
  charge(game, RIGHT);
  assert.equal(commit(game).unitId, unit.id);
  assert.equal(game.route.siltPlateSeat.unitId, null);
  assert.equal(game.route.siltTrajectory.has(unit.id), true);
  assert.ok(!game.route.transactionTrace.some(row => row.kind === 'silt-seat'));
});

test('missing, stale or invalid aim rejects without releasing the grain or consuming Pulse', t => {
  for (const [mode, reason] of [['missing', 'stale_aim'], ['stale', 'stale_aim'], ['invalid', 'invalid_aim']]) {
    const { game, unit } = prepare(t);
    charge(game);
    const update = game.targeting.update;
    game.targeting.update = function (dt, frame) {
      if (mode === 'invalid') {
        update.call(this, dt, frame);
        frame.targeting.siltLaunchAim.direction = [0, 0, 0];
      } else if (mode === 'missing') delete frame.targeting.siltLaunchAim;
      frame.input.interactPressed = true; // A rejected reservation must not fall through to ordinary release.
    };
    game.interact(true);
    game.step();
    game.interact(false);
    assert.equal(status(game).rejectionReason, reason);
    assert.equal(status(game).attempted, true);
    assert.equal(game.route.siltGrip.heldId, unit.id);
    assert.equal(receipts(game).acceptedTotal, 0);
    assert.equal(game.radial.lastMaterialLaunchSequence, 0);
    game.targeting.update = update;
    releasePulse(game);
    assert.equal(game.frame.input.pulseReleaseKind, 'charged');
    assert.equal(game.route.siltGrip.heldId, unit.id);
  }
});

test('menu, inspection, Core Work and transition invalidate a continuing charge', t => {
  for (const [key, value] of [
    ['statusPage', { open: true }], ['inspectionCamera', { active: true }],
    ['inspectionCamera', { active: true, coreWorkActive: true }],
    ['localCellBoundaryMorph', { active: true }], ['firstSliceRuntimeMount', null]
  ]) {
    const { game, unit } = prepare(t);
    charge(game);
    const previous = game.frame[key];
    game.frame[key] = value;
    game.step();
    assert.equal(status(game).ready, false);
    assert.equal(launch(game), null);
    game.frame[key] = previous;
    if (!game.route.siltGrip.heldId) acquire(game, unit);
    tap(game, 'interact');
    assert.equal(launch(game), null);
    assert.equal(game.route.siltGrip.heldId, unit.id);
    assert.ok(status(game).rejectionReason);
  }
});

test('a remount requires a fresh charge and retains ordinary departure provenance', t => {
  const { game, unit } = prepare(t);
  charge(game);
  const anchor = game.route.entryAnchor.clone();
  game.mount(HUB);
  game.step();
  assert.equal(receipts(game).acceptedTotal, 0);
  game.playerRoot.position.copy(anchor);
  game.mount(SILT);
  game.step();
  acquire(game, unit);
  tap(game, 'interact');
  assert.equal(launch(game), null);
  assert.equal(game.route.siltGrip.heldId, unit.id);
  releasePulse(game);
  charge(game);
  assert.equal(commit(game).mountSequence, 3);
  assert.equal(game.route.materialIdentity.totalMass(), 8);
});

test('holding the interaction edge and releasing X cannot duplicate launch or reopen reserve demand', t => {
  const { game } = prepare(t, { padMode: true });
  charge(game, LEFT, 88);
  const previousOrdinary = game.frame.input.pulseEventId;
  const before = game.radial.reserve01;
  game.interact(true);
  game.step();
  const result = launch(game);
  assert.ok(result && game.radial.reserve01 < before);
  assert.equal(game.radial.pulseDemandAge, 0);
  const peak = game.radial.pulseDemandPeak;
  game.step();
  near(game.radial.pulseDemandAge, STEP);
  assert.equal(game.frame.input.pulseHeld, false);
  releasePulse(game);
  near(game.radial.pulseDemandAge, STEP * 2);
  assert.equal(game.frame.input.pulseEventId, previousOrdinary);
  assert.equal(releases(game).length, 1);
  assert.equal(receipts(game).acceptedTotal, 1);
  assert.equal(game.route.siltGrip.heldId, null);
  assert.equal(game.radial.lastMaterialLaunchSequence, result.chargeSequence);
  assert.equal(game.radial.pulseDemandPeak, peak);
  game.interact(false);
  game.step();
  tap(game, 'pulse');
  assert.equal(game.frame.input.pulseEventId, previousOrdinary + 1);
  assert.equal(releases(game).length, 1);
});

test('launch uses the existing charged Pulse reserve peak and commit-step debit', t => {
  const check = directed => {
    const { game } = prepare(t);
    charge(game, LEFT, 95);
    const before = game.radial.reserve01;
    if (directed) commit(game); else releasePulse(game);
    return { peak: game.radial.pulseDemandPeak, age: game.radial.pulseDemandAge,
      debit: before - game.radial.reserve01, launch: launch(game) };
  };
  const directed = check(true);
  const native = check(false);
  assert.equal(directed.launch.charge01, 1);
  assert.equal(directed.peak, native.peak);
  assert.deepEqual([directed.age, native.age], [0, 0]);
  near(directed.debit, native.debit);
  t.diagnostic(JSON.stringify({ directed, native }));
});

test('retargeting a held grain to the Shelf preserves canonical intent and independent Flow ownership', t => {
  for (const enabled of [false, true]) {
    const { game, unit } = prepare(t, { padMode: true, flowExperiment: enabled });
    charge(game);
    if (enabled) {
      assert.notEqual(game.frame.targeting.targetId, SHELF);
      const shelf = game.route.territoryExpansion.readFlowPatch(game.frame);
      game.playerRoot.position.copy(shelf.center).add(new THREE.Vector3(0, 0, 1.18));
      game.aimAt(game.route.root.worldToLocal(shelf.center.clone()).toArray());
      game.steps(24);
      assert.equal(game.frame.targeting.targetId, SHELF);
      assert.equal(game.route.siltGrip.heldId, unit.id);
      assert.equal(game.frame.coreFlow.result, null);
      game.absorb(0.6);
      game.steps(40);
      assert.ok(game.frame.coreFlow.result?.acceptedCurrent01 > 0);
    }
    const action = game.frame.input.flowActionSequence;
    const result = commit(game);
    assert.equal(result.unitId, unit.id);
    assert.equal(result.actualRecipientId, null);
    assert.equal(result.intendedTargetId, enabled ? SHELF : null);
    assert.equal(game.frame.input.flowActionSequence, action);
    assert.equal(game.frame.input.absorbHeld, false);
    assert.equal(Boolean(game.frame.coreFlow?.result?.acceptedCurrent01), enabled);
    assert.equal(receipts(game).acceptedTotal, 1);
    assert.equal(game.route.materialIdentity.totalMass(), 8);
  }
});

test('fixed and bounded catch-up steps produce one equivalent release and reserve envelope', t => {
  function sample(batch) {
    const { game } = prepare(t, { padMode: true });
    const dt = buildBoundedSimulationSteps(0.15).steps[0];
    game.aim(LEFT);
    game.pulse(true);
    for (let i = 0; i < 18; i++) game.step(dt);
    assert.equal(status(game).ready, true);
    if (batch) {
      const steps = buildBoundedSimulationSteps(dt * 3).steps;
      assert.equal(steps.length, 3);
      game.step(steps[0], 0, 3);
      game.interact(true);
      game.step(steps[1], 1, 3);
      game.step(steps[2], 2, 3);
    } else {
      game.step(dt);
      game.interact(true);
      game.step(dt);
      game.step(dt);
    }
    assert.equal(launch(game).substep, batch ? 1 : 0);
    assert.equal(releases(game).length, 1);
    assert.equal(receipts(game).acceptedTotal, 1);
    return { position: game.route.siltTrajectory.get(launch(game).unitId).position,
      velocity: launch(game).releaseVelocity, reserve: game.radial.reserve01, age: game.radial.pulseDemandAge };
  }
  assert.deepEqual(sample(true), sample(false));
});
