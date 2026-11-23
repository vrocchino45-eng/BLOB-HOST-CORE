import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { buildBoundedSimulationSteps } from '../src/core/BoundedSimulationCatchUp.js';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { SILT_FLOW_CELL, SILT_FLOW_SITE } from '../src/interaction/SiltFlowContract.js';
import { CoreEmbodimentSystem } from '../src/player/CoreEmbodimentSystem.js';
import { CoreEngineSystem } from '../src/player/CoreEngineSystem.js';
import { CoreFlowSystem } from '../src/player/CoreFlowSystem.js';
import { CoreRadialPerformanceSystem } from '../src/player/CoreRadialPerformanceSystem.js';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';
import { TargetingSystem } from '../src/targeting/TargetingSystem.js';

const HOST = 'HOST_ALPHA_WOUNDED_NURSERY';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const STEP = 1 / 60;
const DEMAND = 0.50;
const RESERVE = 0.75;
const RECIPE = JSON.parse(readFileSync(
  new URL('../public/data/routes/siltPressureRouteCircuit_HC012A.json', import.meta.url), 'utf8'
));

function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12, actual + ' versus ' + expected);
}

// Fix pose and optionally reserve to compare identical loads. Targeting, crown
// contact, receiver ownership, and reserve settlement remain production code.
export function createShelfFixture({
  imprint = 0, layout = [2, 1, 0], pinReserve = true, receive = null
} = {}) {
  const [deep_core, inner_body, membrane] = layout;
  const counts = { deep_core, inner_body, membrane };
  const retainedPieceCount = deep_core + inner_body + membrane;
  const topology = CoreEmbodimentSystem.prototype.getWholeCoreTopology(counts, retainedPieceCount);
  const frame = {
    frame: 0,
    runtimeSeconds: 0,
    activeHostId: HOST,
    activeCellId: SILT_FLOW_CELL,
    firstSliceRuntimeMount: {
      activeRuntimeCellId: SILT_FLOW_CELL, mountSequence: 1, activeSystemIds: ['siltPressureRouteSystem']
    },
    spatialCoreChemistry: { counts, retainedPieceCount, topology },
    playerComposition: { nutrient: 0.2 },
    chemObjectState: { absorbedObjects: 0 },
    input: {}
  };
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  const body = new THREE.Group();
  body.name = 'player_seed_body_frame';
  playerRoot.add(body);
  const camera = new THREE.PerspectiveCamera();
  scene.add(playerRoot, camera);
  const ledger = new HostConnectionReceiptLedger();
  const route = new SiltPressureRouteSystem({
    scene, playerRoot, camera, frameState: frame, flowExperiment: true,
    hostConnectionReceiptLedger: ledger, recipeDataSystem: { data: { siltPressureRouteCircuit: RECIPE } }
  });
  route.init();
  route.onRuntimeMount(frame);
  const territory = route.territoryExpansion;
  const site = territory.flowPatch.site;
  site.imprint = imprint;
  const targeting = new TargetingSystem({
    scene, camera, playerRoot, frameState: frame, chemObjectSystem: { objects: [] },
    readSiltFlowCandidate: current => territory.readFlowCandidate(current, playerRoot.position)
  });
  targeting.init();
  const engine = new CoreEngineSystem({ playerRoot, frameState: frame });
  const radial = new CoreRadialPerformanceSystem({ playerRoot, frameState: frame });
  radial.reserve01 = RESERVE;
  const blockers = [];
  const flow = new CoreFlowSystem({
    playerRoot,
    readPatch: current => route.active ? territory.readFlowPatch(current) : null,
    readContactSurfaces: () => [...route.hcCrawlableSurfaceMeshes, ...blockers],
    acceptFlow: (request, current) => receive
      ? receive(territory, request, current)
      : territory.acceptFlow(request, current),
    renderReceiver: (state, progress) => territory.renderFlowFeedback(state, progress)
  });

  function align(depth = 0.75) {
    const patch = territory.readFlowPatch(frame);
    // Put the crown origin on the outward normal for an exactly head-on match.
    playerRoot.position.copy(patch.center).addScaledVector(patch.normal, depth);
    playerRoot.position.z += 0.43;
    camera.position.copy(playerRoot.position).add(new THREE.Vector3(0, 0.5, 1.8));
    camera.lookAt(patch.center);
    camera.updateMatrixWorld(true);
  }

  function block() {
    const patch = territory.readFlowPatch(frame);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    wall.position.copy(patch.center).addScaledVector(patch.normal, 0.28);
    wall.quaternion.copy(patch.root.quaternion);
    scene.add(wall);
    blockers.push(wall);
  }

  let sequence = 0;
  let holding = false;
  function tick(demand = 0, { step = STEP, batch = 1 } = {}) {
    if (demand > 0 && !holding) sequence++;
    holding = demand > 0;
    frame.frame++;
    frame.input = { flowDemand01: demand, flowActionSequence: sequence };
    const { steps, substepCount } = buildBoundedSimulationSteps(step * batch);
    assert.equal(substepCount, batch);
    frame.runtimeSimulationSubstepCount = substepCount;
    return steps.map((dt, substep) => {
      frame.runtimeSimulationSubstepIndex = substep;
      frame.runtimeSimulationSubstepSeconds = dt;
      frame.runtimeSeconds += dt;
      targeting.update(dt, frame);
      route.update(dt, frame);
      engine.update(dt, frame);
      if (pinReserve) radial.reserve01 = RESERVE;
      radial.update(pinReserve ? 0 : dt, frame);
      flow.update(dt, frame);
      radial.settleFlowReserve(dt, frame);
      return { flow: frame.coreFlow, settlement: frame.siltFlowReserveSettlement };
    });
  }

  function prepareAim() {
    for (let i = 0; i < 20; i++) tick();
    assert.equal(frame.targeting.attentionTargetId, SILT_FLOW_SITE);
  }

  function firstDelivery(demand = DEMAND) {
    for (let i = 0; i < 24; i++) {
      const [sample] = tick(demand);
      if (sample.flow.result) return sample;
    }
    assert.fail(frame.coreFlow.reason);
  }

  function switchCell(cell) {
    frame.activeCellId = cell;
    const inSilt = cell === SILT_FLOW_CELL;
    frame.firstSliceRuntimeMount = {
      activeRuntimeCellId: cell,
      mountSequence: frame.firstSliceRuntimeMount.mountSequence + 1,
      activeSystemIds: inSilt ? ['siltPressureRouteSystem'] : []
    };
    if (inSilt) {
      playerRoot.position.set(3, 0, -2);
      route.onRuntimeMount(frame);
      align();
    } else {
      targeting.onRuntimeUnmount(frame);
    }
    return tick()[0];
  }

  align();
  return { frame, route, site, territory, ledger, align, block, tick, prepareAim, firstDelivery, switchCell };
}

function assertSettled({ flow, settlement }) {
  assert.equal(settlement.status, 'settled');
  assert.equal(settlement.reserveBefore, RESERVE);
  const { acceptedCurrent01, resistance01 } = flow.result;
  close(settlement.actualDebit, 0.09 * acceptedCurrent01 * resistance01 * STEP);
}

test('Pristine and saturated Shelf retain the exact first-contact and full-imprint bounds', () => {
  const pristine = createShelfFixture();
  pristine.prepareAim();
  const sample = pristine.firstDelivery();
  const { pressure01, before, after } = sample.flow.result;
  assert.equal(before.imprint, 0);
  close(pressure01, 0.1715795676);
  assert.equal(after.imprint, pressure01 * STEP * 0.42);

  for (const imprint of [0.9999996, 1]) {
    const fixture = createShelfFixture({ imprint });
    fixture.prepareAim();
    let accepted = 0;
    for (let i = 0; i < 70; i++) {
      const [delivery] = fixture.tick(1);
      const result = delivery.flow.result;
      if (!result) continue;
      accepted++;
      assert.ok(result.pressure01 > 0);
      close(result.after.imprint - result.before.imprint,
        result.pressure01 * STEP * 0.42 * (1 - result.before.imprint));
      assert.ok(result.after.imprint >= imprint && result.after.imprint <= 1);
    }
    assert.ok(accepted > 0);
    if (imprint === 1) assert.equal(fixture.site.imprint, 1);
    else assert.ok(fixture.site.imprint > imprint);
  }
});

test('Matched 0.50 imprint halves retention while pressure, current, resistance and immediate debit match CH01-P1', () => {
  const game = createShelfFixture({ imprint: 0.50 });
  game.prepareAim();
  const first = game.firstDelivery();
  const oldGain = 0.136766322 * STEP * 0.42;
  assertSettled(first);
  assert.equal(first.flow.result.before.imprint, 0.50);
  close(first.flow.result.acceptedCurrent01, 0.19538046);
  close(first.flow.result.resistance01, 0.45);
  close(first.flow.result.pressure01, 0.136766322);
  close(first.settlement.actualDebit, 0.0001318818105);
  close(first.flow.result.after.imprint - 0.50, oldGain * 0.50);
  const [next] = game.tick(DEMAND);
  close(next.flow.result.resistance01, 0.45013403099556);
  close(next.flow.result.pressure01, 0.136732993043097);
  assert.ok(next.flow.result.resistance01 < 0.45026806199112);
  assert.ok(next.flow.result.pressure01 > 0.13669966408619366);
});

test('Release and same-session remount retain ownership without changing materials or permissions', () => {
  const game = createShelfFixture({ imprint: 0.50 });
  const originalLedger = game.ledger.snapshot();
  const originalMass = game.route.materialIdentity.snapshot();
  const materialState = game.route.livingCycle.snapshot();
  game.prepareAim();
  const first = game.firstDelivery();
  for (let i = 0; i < 30; i++) game.tick(DEMAND);
  const retained = game.site.imprint;
  const pressureFlags = () => [game.route.pressureRead, game.route.ribsReleased,
    game.route.safeMatterAbsorbed, game.route.completed, game.route.returnFoldReady];
  assert.deepEqual(pressureFlags(), [false, false, false, false, false]);
  assert.equal(game.tick()[0].flow.result, null);
  assert.equal(game.switchCell(HUB).flow.result, null);
  assert.equal(game.switchCell(SILT_FLOW_CELL).flow.result, null);
  assert.equal(game.route.territoryExpansion, game.territory);
  assert.equal(game.territory.flowPatch.site, game.site);
  assert.equal(game.site.imprint, retained);
  game.prepareAim();
  const revisit = game.firstDelivery();
  assert.equal(revisit.flow.result.before.imprint, retained);
  assert.equal(revisit.flow.result.mountSequence, 3);
  assert.equal(revisit.flow.result.actionSequence, 2);
  assert.ok(revisit.flow.result.resistance01 > first.flow.result.resistance01);
  assert.ok(revisit.flow.result.pressure01 < first.flow.result.pressure01);
  assert.deepEqual(pressureFlags(), [false, false, false, false, false]);
  assert.deepEqual(game.ledger.snapshot(), originalLedger);
  assert.deepEqual(game.route.materialIdentity.snapshot(), originalMass);
  assert.equal(game.route.materialIdentity.totalMass(), 8);
  assert.deepEqual(game.route.livingCycle.snapshot().counts, materialState.counts);
  assert.equal(revisit.flow.result.materialTransferred, 0);
  assert.equal(revisit.flow.result.progressionCredit, false);
  assert.equal(revisit.flow.result.hostReceipt, false);
});

for (const [reason, arrange] of [
  ['out_of_reach', game => game.align(1.4)],
  ['obstructed', game => game.block()]
]) {
  test('Shelf preserves imprint and reserve when the crown is ' + reason, () => {
    const game = createShelfFixture({ imprint: 0.50 });
    arrange(game);
    game.prepareAim();
    let sample;
    for (let i = 0; i < 24; i++) [sample] = game.tick(DEMAND);
    assert.equal(sample.flow.reason, reason);
    assert.equal(sample.flow.result, null);
    assert.equal(sample.settlement.actualDebit, 0);
    assert.equal(game.site.imprint, 0.50);
  });
}

for (const [field, value] of Object.entries({
  hostId: 'different-host', cellId: HUB, mountSequence: 0, substep: 1
})) {
  test('Receiver rejects stale ' + field + ' before retaining imprint', () => {
    let attempts = 0;
    const game = createShelfFixture({ imprint: 0.50, receive(territory, request, frame) {
      assert.notEqual(request[field], value);
      attempts++;
      assert.equal(territory.acceptFlow({ ...request, [field]: value }, frame), null);
      return null;
    } });
    game.prepareAim();
    let sample;
    for (let i = 0; i < 24; i++) [sample] = game.tick(DEMAND);
    assert.ok(attempts > 0);
    assert.equal(sample.flow.reason, 'receiver_rejected');
    assert.equal(sample.settlement.actualDebit, 0);
    assert.equal(game.site.imprint, 0.50);
  });
}

test('Forming topology retains the existing neutral performance at an imprinted Shelf', () => {
  const game = createShelfFixture({ imprint: 0.50, layout: [0, 0, 0] });
  game.prepareAim();
  const sample = game.firstDelivery();
  assertSettled(sample);
  assert.deepEqual(sample.flow.result.profile, {
    topologyId: 'forming_topology', phaseCount: 3, reserve01: 0.75,
    stability: 1, recovery: 1, enduranceCapacity: 1
  });
  close(sample.flow.result.pressure01, 0.119196);
  close(sample.flow.result.after.imprint - 0.50, 0.119196 * STEP * 0.42 * 0.50);
});

test('Fixed and catch-up simulation agree on imprint, physical delivery and reserve', () => {
  const games = [1, 3].map(() => createShelfFixture({ imprint: 0.50, pinReserve: false }));
  games.forEach(game => game.prepareAim());
  const histories = games.map((game, gameIndex) => {
    const batch = gameIndex === 0 ? 1 : 3;
    const samples = [];
    for (let i = 0; i < 90 / batch; i++) {
      for (const { flow, settlement } of game.tick(DEMAND, { step: 0.04, batch })) {
        samples.push({
          phase: flow.phase, reason: flow.reason, contact: flow.contactValid,
          imprint: flow.result?.after.imprint ?? 0.50, pressure: flow.result?.pressure01 ?? 0,
          resistance: flow.result?.resistance01 ?? 0, debit: settlement?.actualDebit ?? 0
        });
      }
    }
    return samples;
  });
  assert.equal(histories[0].length, histories[1].length);
  assert.ok(histories[0].some(row => row.phase === 'overload'));
  for (const [index, fixed] of histories[0].entries()) {
    const caughtUp = histories[1][index];
    for (const key of ['phase', 'reason', 'contact']) assert.equal(caughtUp[key], fixed[key]);
    for (const key of ['imprint', 'pressure', 'resistance', 'debit']) close(caughtUp[key], fixed[key]);
  }
});
