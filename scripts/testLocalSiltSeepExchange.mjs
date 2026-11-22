import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { buildBoundedSimulationSteps } from '../src/core/BoundedSimulationCatchUp.js';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';

const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const SYSTEM = 'siltPressureRouteSystem';
const recipe = JSON.parse(readFileSync(new URL('../public/data/routes/siltPressureRouteCircuit_HC012A.json', import.meta.url)));
const garden = recipe.habitatFoundation.habitats.find(habitat => habitat.id === 'garden');
const outsideGarden = recipe.habitatFoundation.habitats.find(habitat => habitat.id === 'reservoir').center;
const catchUpDelta = 0.15;
const step = buildBoundedSimulationSteps(catchUpDelta).steps[0];
const gardenDistance = position => Math.hypot(...position.map((value, index) =>
  (value - garden.center[index]) / garden.radii[index]));

function makeRoute({ wake = true } = {}) {
  const frame = {
    frame: 0, runtimeSeconds: 0, activeHostId: 'HOST_ALPHA_WOUNDED_NURSERY', activeCellId: SILT,
    firstSliceRuntimeMount: { mountSequence: 1, activeRuntimeCellId: SILT, activeSystemIds: [SYSTEM] },
    playerComposition: { nutrient: 0.2 }, chemObjectState: { absorbedObjects: 0 }, input: {}
  };
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  const camera = new THREE.PerspectiveCamera();
  const host = new HostConnectionReceiptLedger();
  scene.add(playerRoot);
  const route = new SiltPressureRouteSystem({
    frameState: frame, scene, playerRoot, camera, flowExperiment: true,
    recipeDataSystem: { data: { siltPressureRouteCircuit: recipe } }, hostConnectionReceiptLedger: host
  });
  route.init();
  route.onRuntimeMount(frame);

  function tick(input = {}, delta = step) {
    frame.input = input;
    frame.frame++;
    const batch = buildBoundedSimulationSteps(delta);
    frame.runtimeSimulationSubstepCount = batch.substepCount;
    for (const [index, dt] of batch.steps.entries()) {
      frame.runtimeSimulationSubstepIndex = index;
      frame.runtimeSimulationSubstepSeconds = dt;
      frame.runtimeSeconds += dt;
      route.update(dt, frame);
    }
  }

  if (wake) {
    // Position at the native route interactions and use its real wake condition.
    playerRoot.position.copy(route.ribGroups[0].getWorldPosition(new THREE.Vector3()));
    for (let i = 0; i < 60; i++) tick({ stabilizeHeld: true });
    tick({ stabilizeHeld: true, pulsePressed: true, pulseEventId: 1 });
    for (let i = 0; i < 120 && !route.ribsReleased; i++) tick({ stabilizeHeld: true, pulseEventId: 1 });
    assert.equal(route.ribsReleased, true);
    playerRoot.position.copy(route.safePacket.getWorldPosition(new THREE.Vector3()));
    for (let i = 0; i < 120 && !route.safeMatterAbsorbed; i++) tick({ absorbHeld: true, pulseEventId: 1 });
    assert.equal(route.safeMatterAbsorbed, true);
    assert.equal(route.livingCycle.firstAbsorbTriggerCount, 1);
  }

  function waitUntil(condition, delta = step) {
    for (let i = 0; !condition() && i < Math.ceil(180 / delta); i++) tick({}, delta);
    assert.ok(condition(), 'expected native transition within 180 seconds');
  }

  function changeCell(cell) {
    frame.activeCellId = cell;
    frame.firstSliceRuntimeMount = { mountSequence: frame.firstSliceRuntimeMount.mountSequence + 1,
      activeRuntimeCellId: cell, activeSystemIds: cell === SILT ? [SYSTEM] : [] };
    if (cell === SILT) route.onRuntimeMount(frame);
    else route.onRuntimeUnmount(frame);
  }

  return { route, frame, tick, waitUntil, changeCell, host, playerRoot,
    unit: route.livingCycle.units[0], body: route.livingMatterMeshes[0].body,
    get garden() { return frame.siltPressureRoute.gardenSeepExchange; } };
}

function approachGarden(game) {
  game.waitUntil(() => game.unit.phase === 'garden_transit' && game.unit.age > 7.96);
  assert.ok(gardenDistance(game.body.position.toArray()) < 1);
}

function divertResolvedSettledPosition(game) {
  const animate = game.route.animateLivingMatter.bind(game.route);
  game.route.animateLivingMatter = dt => {
    animate(dt);
    for (const [index, unit] of game.route.livingCycle.units.entries()) {
      if (unit.phase === 'settled') game.route.livingMatterMeshes[index].body.position.fromArray(outsideGarden);
    }
  };
}

function independentState({ route, frame, host }) {
  const { completed, returnFoldReady, pressureRead, ribsReleased, safeMatterAbsorbed } = frame.siltPressureRoute;
  return {
    livingMass: route.livingCycle.snapshot().conservedMass,
    material: route.materialIdentity.snapshot(),
    host: host.snapshot(),
    shelfImprint: route.territoryExpansion.flowPatch.site.imprint,
    playerComposition: { ...frame.playerComposition },
    chemistry: { ...frame.chemObjectState },
    progression: { completed, returnFoldReady, pressureRead, ribsReleased, safeMatterAbsorbed }
  };
}

test('A legitimately awakened grain arrives and settles inside the authored Garden with neutral input', () => {
  const game = makeRoute();
  const start = game.frame.runtimeSeconds;
  const path = game.route.livingMatterPaths.garden_transit;
  const endpoint = recipe.habitatFoundation.connections.find(edge => edge.id === 'reservoir_to_garden').to;
  assert.ok(path.getPointAt(1).distanceTo(new THREE.Vector3().fromArray(endpoint)) < 1e-8);
  game.waitUntil(() => game.garden.imprint > 0);
  const { lastDelivery: delivery, imprint, arrivalSecondsRemaining } = game.garden;
  const event = game.route.livingCycle.events.find(event => event.sequence === delivery.sequence);
  assert.deepEqual(game.frame.input, {});
  assert.ok(game.frame.runtimeSeconds - start >= 13.9 && game.frame.runtimeSeconds - start <= 14.1);
  assert.equal(game.garden.receiverId, 'silt_sediment_garden');
  assert.deepEqual(event, { sequence: delivery.sequence, kind: 'settled', unitId: game.unit.id });
  assert.equal(delivery.generation, game.unit.generation);
  assert.equal(delivery.mountSequence, 1);
  assert.equal(delivery.cellId, SILT);
  assert.equal(delivery.frame, game.frame.frame);
  assert.ok(gardenDistance(delivery.approachPosition) < 1);
  assert.ok(gardenDistance(delivery.position) < 1);
  assert.deepEqual(delivery.position, game.body.position.toArray());
  assert.equal(imprint, 1 / 8);
  assert.equal(arrivalSecondsRemaining, 1.2);
});

test('Matching native settled events outside the Garden do not deliver and provide a no-delivery control', () => {
  const receiving = makeRoute();
  const control = makeRoute();
  divertResolvedSettledPosition(control);
  const before = independentState(receiving);
  approachGarden(receiving);
  approachGarden(control);
  receiving.tick();
  control.tick();
  assert.equal(receiving.unit.phase, 'settled');
  assert.equal(control.unit.phase, 'settled');
  assert.ok(gardenDistance(control.body.position.toArray()) > 1);
  assert.deepEqual(receiving.route.livingCycle.snapshot(), control.route.livingCycle.snapshot());
  assert.equal(receiving.garden.imprint, 1 / 8);
  assert.equal(control.garden.imprint, 0);
  assert.equal(control.garden.lastDelivery, null);
  assert.equal(control.garden.arrivalSecondsRemaining, 0);
  assert.deepEqual(independentState(receiving), before);
  assert.deepEqual(independentState(receiving), independentState(control));
  assert.equal(before.livingMass, 8);
  assert.equal(before.material.records.length, 8);
});

test('An in-pocket settled pose cannot substitute for an outside resolved approach or a different grain', () => {
  for (const defect of ['outside approach', 'identity mismatch']) {
    const game = makeRoute();
    approachGarden(game);
    if (defect === 'outside approach') game.body.position.fromArray(outsideGarden);
    else game.route.livingMatterMeshes[0].unitId = game.route.livingCycle.units[1].id;
    game.tick();
    assert.equal(game.unit.phase, 'settled');
    assert.ok(gardenDistance(game.body.position.toArray()) < 1);
    assert.equal(game.garden.imprint, 0, defect);
  }
});

test('A dormant reservoir does not awaken or create a delivery under neutral input', () => {
  const game = makeRoute({ wake: false });
  const state = independentState(game);
  for (let i = 0; i < 200; i++) game.tick({}, catchUpDelta);
  assert.equal(game.route.livingCycle.active, false);
  assert.equal(game.route.livingCycle.elapsed, 0);
  assert.equal(game.garden.imprint, 0);
  assert.equal(game.garden.lastDelivery, null);
  assert.deepEqual(independentState(game), state);
});

test('Held, seated and disturbed free grains cannot qualify even at the receiving pocket', () => {
  const game = makeRoute();
  approachGarden(game);
  const { route, body, unit, playerRoot } = game;
  const position = body.position.toArray();
  playerRoot.position.copy(route.root.localToWorld(body.position.clone()));
  const grip = route.siltGrip;
  assert.equal(grip.tryGrip({ unit, unitPosition: position, corePosition: position,
    stabilizeHeld: true, aPressed: true }), true);
  game.tick({ stabilizeHeld: true });
  assert.equal(grip.heldId, unit.id);
  assert.equal(unit.phase, 'garden_transit');
  assert.equal(game.garden.imprint, 0);
  grip.release();
  assert.ok(route.siltPlateSeat.trySeat({ unitId: unit.id, heldPosition: position,
    isBraced: true, imprinted: true, actuallyTouching: true }));
  game.tick();
  assert.equal(unit.phase, 'garden_transit');
  assert.equal(game.garden.imprint, 0);
  assert.ok(route.siltPlateSeat.tryExtract({ unitId: unit.id, gripAccepted: true }));
  assert.equal(route.siltTrajectory.beginHold(unit.id, position), true);
  assert.ok(route.siltTrajectory.release(unit.id, position));
  game.tick();
  assert.equal(unit.phase, 'settled');
  assert.ok(gardenDistance(body.position.toArray()) < 1);
  assert.equal(game.garden.imprint, 0);
});

test('Duplicate native event observation cannot increase imprint or restart the arrival cue', () => {
  const game = makeRoute();
  approachGarden(game);
  const { route, frame } = game;
  let witness;
  const receive = route.receiveGardenSeepArrivals.bind(route);
  route.receiveGardenSeepArrivals = (frameState, dt, step) => {
    witness = step;
    receive(frameState, dt, step);
  };
  game.tick();
  const delivery = game.garden.lastDelivery;
  assert.ok(delivery);
  const arrivedAt = route.gardenSeep.arrivalAt;
  receive(frame, step, witness);
  assert.equal(route.gardenSeep.imprint, 1 / 8);
  assert.deepEqual(route.gardenSeep.lastDelivery, delivery);
  assert.equal(route.gardenSeep.arrivalAt, arrivedAt);
});

test('A settled event witnessed under another frame, substep, cell or mount is stale', () => {
  for (const change of [
    game => { game.frame.frame++; },
    game => { game.frame.runtimeSimulationSubstepCount = 2; game.frame.runtimeSimulationSubstepIndex++; },
    game => { game.frame.activeCellId = HUB; },
    game => { game.frame.firstSliceRuntimeMount.activeSystemIds = []; },
    game => { game.changeCell(HUB); game.changeCell(SILT); }
  ]) {
    const game = makeRoute();
    approachGarden(game);
    const receive = game.route.receiveGardenSeepArrivals.bind(game.route);
    game.route.receiveGardenSeepArrivals = (frame, dt, witness) => {
      assert.ok(witness);
      change(game);
      receive(frame, dt, witness);
    };
    game.tick();
    assert.equal(game.unit.phase, 'settled');
    assert.equal(game.garden.imprint, 0);
    assert.equal(game.garden.lastDelivery, null);
  }
});

test('The Garden saturates at one after eight actual arrivals, then later settlements do not replay the cue', () => {
  const game = makeRoute();
  game.waitUntil(() => game.garden.imprint === 1, catchUpDelta);
  const saturated = game.garden.lastDelivery;
  assert.equal(saturated.imprintBefore, 7 / 8);
  assert.equal(saturated.imprintAfter, 1);
  game.waitUntil(() => game.route.livingCycle.events.some(event =>
    event.kind === 'settled' && event.sequence > saturated.sequence), catchUpDelta);
  game.waitUntil(() => game.garden.arrivalSecondsRemaining === 0, catchUpDelta);
  assert.equal(game.garden.imprint, 1);
  assert.deepEqual(game.garden.lastDelivery, saturated);
  assert.equal(game.garden.arrivalSecondsRemaining, 0);
  assert.equal(game.route.materialIdentity.totalMass(), 8);
});

test('Fixed updates and the runtime catch-up planner produce identical delivered identities and receiver values', () => {
  const fixed = makeRoute();
  const catchUp = makeRoute();
  for (let i = 0; i < 240; i++) {
    for (let j = 0; j < 3; j++) fixed.tick();
    catchUp.tick({}, catchUpDelta);
    const withoutStamp = ({ frame, substep, ...delivery }) => delivery;
    assert.equal(catchUp.garden.imprint, fixed.garden.imprint);
    assert.equal(catchUp.garden.arrivalSecondsRemaining, fixed.garden.arrivalSecondsRemaining);
    if (fixed.garden.lastDelivery) {
      assert.deepEqual(withoutStamp(catchUp.garden.lastDelivery), withoutStamp(fixed.garden.lastDelivery));
      assert.ok(catchUp.garden.lastDelivery.substep < 3);
    }
  }
  assert.ok(fixed.garden.imprint > 1 / 8);
  assert.deepEqual(catchUp.route.livingCycle.snapshot(), fixed.route.livingCycle.snapshot());
});

test('Leaving clears the one-shot geometry, retains the bed mark and pauses Silt until a fresh mount', () => {
  const game = makeRoute();
  const bed = game.route.gardenSeepBed.mesh;
  const bare = { height: bed.scale.y, opacity: bed.material.opacity };
  game.playerRoot.position.copy(game.route.pathCurve.getPointAt(0.9)).add(game.route.entryAnchor);
  game.waitUntil(() => game.frame.siltPressureRoute.completed);
  assert.equal(game.frame.siltPressureRoute.returnFoldReady, true);
  game.waitUntil(() => game.garden.imprint > 0);
  const { lastDelivery, imprint } = game.garden;
  for (let i = 0; i < 8; i++) game.tick();
  assert.ok(bed.position.x !== 0 && bed.position.z !== 0);
  const liveHeight = bed.scale.y;
  const phase = game.route.livingCycle.snapshot();
  game.changeCell(HUB);
  for (let i = 0; i < 480; i++) game.tick({}, catchUpDelta);
  assert.deepEqual(game.route.livingCycle.snapshot(), phase);
  assert.equal(game.garden.imprint, imprint);
  assert.equal(game.garden.arrivalSecondsRemaining, 0);
  assert.equal(game.route.root.visible, false);

  game.playerRoot.position.set(7, 1, 3);
  game.changeCell(SILT);
  game.tick();
  assert.equal(game.route.root.visible, true);
  assert.equal(game.garden.arrivalSecondsRemaining, 0);
  assert.deepEqual(game.garden.lastDelivery, lastDelivery);
  assert.equal(game.garden.imprint, imprint);
  assert.equal(Math.hypot(bed.position.x, bed.position.z), 0);
  assert.equal(game.frame.siltPressureRoute.completed, true);
  assert.equal(game.frame.siltPressureRoute.returnFoldReady, true);
  assert.ok(bed.scale.y > bare.height && bed.scale.y < liveHeight);
  assert.ok(bed.material.opacity > bare.opacity);
  assert.ok(game.route.livingCycle.elapsed - phase.elapsedActiveSeconds < step + 1e-8);
  game.waitUntil(() => game.garden.imprint > imprint);
  assert.equal(game.garden.lastDelivery.mountSequence, 3);
  assert.ok(game.garden.lastDelivery.sequence > lastDelivery.sequence);
});
