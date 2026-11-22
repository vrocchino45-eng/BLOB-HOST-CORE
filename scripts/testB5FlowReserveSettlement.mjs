import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { ChemObjectSystem } from '../src/chemistry/ChemObjectSystem.js';
import { buildBoundedSimulationSteps } from '../src/core/BoundedSimulationCatchUp.js';
import { GameRuntime } from '../src/core/GameRuntime.js';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { SessionTelemetrySystem } from '../src/core/SessionTelemetrySystem.js';
import { SystemRegistry } from '../src/core/SystemRegistry.js';
import { RecipeDataSystem } from '../src/data/RecipeDataSystem.js';
import { SILT_FLOW_CELL as SILT, SILT_FLOW_SITE } from '../src/interaction/SiltFlowContract.js';
import { CoreEmbodimentSystem } from '../src/player/CoreEmbodimentSystem.js';
import { CoreEngineSystem } from '../src/player/CoreEngineSystem.js';
import { CoreFlowSystem } from '../src/player/CoreFlowSystem.js';
import { CoreRadialPerformanceSystem } from '../src/player/CoreRadialPerformanceSystem.js';
import { GraveMemoryRouteSystem } from '../src/routes/GraveMemoryRouteSystem.js';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';
import { VascularRhythmRouteSystem } from '../src/routes/VascularRhythmRouteSystem.js';
import { RegionalTerritoryExpansion } from '../src/world/RegionalTerritoryExpansion.js';

const HOST = 'HOST_ALPHA_WOUNDED_NURSERY';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const VASCULAR = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const GRAVE = 'CELL_GRAVE_MEMORY_RESIDUE_BED_001';
const STEP = 1 / 60;
const HOLD = { stabilizeHeld: true };
const START_RESERVE = 0.6;
const ROUTES = { [SILT]: 'siltPressureRouteSystem', [VASCULAR]: 'vascularRhythmRouteSystem', [GRAVE]: 'graveMemoryRouteSystem' };
const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);

async function loadRecipes() {
  const data = new RecipeDataSystem();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async request => {
    try {
      return new Response(readFileSync(new URL(`../public${String(request)}`, import.meta.url)));
    } catch {
      return new Response(null, { status: 404 });
    }
  };
  try {
    await data.loadAll();
    return data;
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function makeCircuit({ enabled = true, settle = true, zone = 'inner_body', recipes = null } = {}) {
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  const camera = new THREE.PerspectiveCamera();
  const body = new THREE.Group();
  body.name = 'player_seed_body_frame';
  playerRoot.add(body);
  scene.add(playerRoot, camera);
  const frame = {
    frame: 0, runtimeSeconds: 0, activeHostId: HOST, activeCellId: SILT,
    firstSliceRuntimeMount: { activeRuntimeCellId: SILT, mountSequence: 1, activeSystemIds: [ROUTES[SILT]] },
    targeting: { active: true, attentionActive: true, targetId: SILT_FLOW_SITE,
      attentionTargetId: SILT_FLOW_SITE, attentionSequence: 1, relationshipActive: false },
    act1RouteHistory: {}, playerComposition: { nutrient: 0.2 }, chemObjectState: { absorbedObjects: 0 }, input: {}
  };
  if (zone) frame.spatialCoreChemistry = {
    retainedPieceCount: 3, counts: { membrane: 0, inner_body: 0, deep_core: 0, [zone]: 3 },
    topology: { id: zone, complete: true }
  };
  const ledger = new HostConnectionReceiptLedger();
  const shared = { scene, playerRoot, camera, frameState: frame, recipeDataSystem: recipes,
    hostConnectionReceiptLedger: ledger, flowExperiment: enabled };
  const radial = new CoreRadialPerformanceSystem(shared);
  const engine = new CoreEngineSystem(shared);
  const telemetry = new SessionTelemetrySystem({ frameState: frame, monotonicNowMs: () => frame.runtimeSeconds * 1000 });
  const localTerritory = recipes ? null : new RegionalTerritoryExpansion({ kind: 'silt', parent: scene, flowExperiment: enabled });
  const silt = recipes ? new SiltPressureRouteSystem(shared) : null;
  const vascular = recipes ? new VascularRhythmRouteSystem(shared) : null;
  const grave = recipes ? new GraveMemoryRouteSystem({
    ...shared,
    chemObjectSystem: new ChemObjectSystem({
      ...shared, localCellRecipe: recipes.get('localCellRecipes', HUB),
      visualComposer: {
        compose({ position, scale }) {
          const root = new THREE.Group();
          root.position.fromArray(position);
          root.scale.setScalar(scale);
          scene.add(root);
          return root;
        }
      }
    })
  }) : null;
  const territory = () => silt?.territoryExpansion ?? localTerritory;
  let rejectDelivery = false;
  const flow = new CoreFlowSystem({
    playerRoot, readPatch: state => territory().readFlowPatch(state),
    acceptFlow: (request, state) => rejectDelivery ? null : territory().acceptFlow(request, state),
    readContactSurfaces: () => silt?.hcCrawlableSurfaceMeshes ?? [],
    renderReceiver: (state, progress) => territory().renderFlowFeedback(state, progress)
  });
  const registry = new SystemRegistry();
  // Run production registration with the fixture's actual owners. Skip
  // unavailable systems and the unrelated deferred chemistry callback.
  GameRuntime.prototype.registerRuntimeSystems.call({
    registry: { register(id, system, options) {
      if (system && id !== 'chemPulseResponse' && (settle || id !== 'coreFlowReserveSettlement')) {
        registry.register(id, system, options);
      }
    } },
    flowExperiment: enabled, coreRadialPerformanceSystem: radial, coreEngineSystem: engine,
    coreFlowSystem: flow, sessionTelemetrySystem: telemetry, siltPressureRouteSystem: silt,
    vascularRhythmRouteSystem: vascular, graveMemoryRouteSystem: grave
  });
  radial.reserve01 = START_RESERVE;
  let actionSequence = 0;
  let previousDemand = 0;

  function mount(cell) {
    if (cell === frame.activeCellId) return;
    frame.activeCellId = cell;
    frame.firstSliceRuntimeMount = { activeRuntimeCellId: cell, mountSequence: frame.firstSliceRuntimeMount.mountSequence + 1,
      activeSystemIds: ROUTES[cell] ? [ROUTES[cell]] : [] };
  }
  function align() {
    const patch = territory().readFlowPatch(frame);
    assert.ok(patch);
    playerRoot.position.copy(patch.center).add(new THREE.Vector3(0, 0, 1.18));
  }
  function tick(demand = 0, { step = STEP, batch = 1, input = {} } = {}) {
    if (demand > 0 && previousDemand === 0) actionSequence += 1;
    previousDemand = demand;
    frame.frame += 1;
    frame.input = { ...input, flowDemand01: demand, flowActionSequence: actionSequence };
    const { steps, substepCount } = buildBoundedSimulationSteps(step * batch);
    assert.equal(substepCount, batch);
    frame.runtimeSimulationSubstepCount = substepCount;
    return steps.map((dt, substep) => {
      frame.runtimeSimulationSubstepIndex = substep;
      frame.runtimeSimulationSubstepSeconds = dt;
      frame.runtimeSeconds += dt;
      if (localTerritory && frame.activeCellId === SILT) {
        localTerritory.update({ dt, playerPosition: playerRoot.position, input: frame.input, frameState: frame });
      }
      registry.update(dt, frame);
      return { flow: frame.coreFlow, receipt: frame.siltFlowReserveSettlement };
    });
  }
  function firstDelivery(demand = 0.44) {
    for (let i = 0; i < 40; i += 1) {
      const [sample] = tick(demand);
      if (sample.flow?.result?.acceptedCurrent01 > 0) return sample;
    }
    assert.fail('fixture did not conduct to the authored receiver');
  }
  if (recipes) tick();
  if (enabled) align();
  return {
    frame, scene, playerRoot, body, radial, registry, telemetry, ledger, silt, vascular, grave, tick, firstDelivery, mount,
    get imprint() { return territory().flowPatch.site.imprint; },
    set imprint(value) { territory().flowPatch.site.imprint = value; },
    rejectDelivery() { rejectDelivery = true; },
    exportSettlement: () => telemetry.exportSession().developerTruth.siltFlow?.reserveSettlement
  };
}

function assertDebit({ flow, receipt }) {
  const result = flow.result;
  assert.equal(receipt.status, 'settled');
  for (const key of ['receiverId', 'actionSequence', 'hostId', 'cellId', 'mountSequence', 'frame', 'substep',
    'acceptedCurrent01', 'resistance01']) assert.equal(receipt[key], result[key]);
  close(receipt.requestedDebit, 0.09 * result.acceptedCurrent01 * result.resistance01 * receipt.stepSeconds);
  close(receipt.actualDebit, Math.min(receipt.reserveBefore, receipt.requestedDebit));
  close(receipt.reserveAfter, receipt.reserveBefore - receipt.actualDebit);
}

test('Production registration keeps settlement opt-in and between Flow and telemetry', () => {
  const disabled = makeCircuit({ enabled: false });
  const idle = makeCircuit({ enabled: false });
  const enabled = makeCircuit();
  for (let i = 0; i < 30; i += 1) {
    disabled.tick(1);
    idle.tick();
  }
  assert.equal(disabled.radial.reserve01, idle.radial.reserve01);
  assert.equal(disabled.frame.coreFlow, undefined);
  assert.equal(disabled.exportSettlement(), undefined);
  assert.equal(disabled.registry.has('coreFlowReserveSettlement'), false);
  assert.deepEqual(enabled.registry.updateOrder.filter(id => id !== 'coreEngineSystem'),
    ['coreRadialPerformanceSystem', 'coreFlowSystem', 'coreFlowReserveSettlement', 'sessionTelemetrySystem']);
});

test('Selection, misalignment, dwell and receiver rejection each leave reserve equal to idle', () => {
  const idle = makeCircuit();
  const misaligned = makeCircuit();
  const rejected = makeCircuit();
  misaligned.body.rotation.y = Math.PI;
  rejected.rejectDelivery();
  const reasons = new Set();
  const [selection] = idle.tick();
  assert.equal(selection.receipt, null);
  misaligned.tick();
  rejected.tick();
  for (let i = 0; i < 40; i += 1) {
    idle.tick();
    const [alignedSample] = rejected.tick(1);
    const [miss] = misaligned.tick(1);
    assert.equal(miss.receipt.reason, 'align_core');
    assert.equal(miss.receipt.actualDebit, 0);
    assert.equal(alignedSample.receipt.actualDebit, 0);
    assert.equal(alignedSample.flow.result, null);
    reasons.add(alignedSample.receipt.reason);
  }
  assert.equal(misaligned.radial.reserve01, idle.radial.reserve01);
  assert.equal(rejected.radial.reserve01, idle.radial.reserve01);
  assert.deepEqual([misaligned.imprint, rejected.imprint], [0, 0]);
  assert.ok(reasons.has('contact_dwell'));
  assert.ok(reasons.has('receiver_rejected'));
  assert.equal(rejected.exportSettlement().lastRejected.reason, 'receiver_rejected');
});

test('A short delivery preserves same-step pressure and imprint and updates the next profile', context => {
  const game = makeCircuit();
  const control = makeCircuit({ settle: false });
  // Place the starting reserve just above a publication rounding boundary at contact.
  game.radial.reserve01 = control.radial.reserve01 = 0.60080;
  const paid = game.firstDelivery();
  const reference = control.firstDelivery();
  assert.deepEqual(paid.flow, reference.flow);
  assert.equal(game.imprint, control.imprint);
  assertDebit(paid);
  assert.equal(paid.receipt.reserveBefore, control.radial.reserve01);
  assert.equal(paid.receipt.reserveAfter, game.radial.reserve01);
  assert.equal(paid.flow.result.profile.reserve01, game.frame.corePerformance.endurance.reserve01);
  assert.deepEqual(game.exportSettlement().current, paid.receipt);
  context.diagnostic(`Short delivery reserve ${paid.receipt.reserveBefore.toFixed(9)} → ${paid.receipt.reserveAfter.toFixed(9)} at I=${paid.receipt.acceptedCurrent01.toFixed(6)}, R=${paid.receipt.resistance01.toFixed(6)}`);

  const [next] = game.tick(0.44);
  const [nextUnpaid] = control.tick(0.44);
  assert.equal(next.flow.result.resistance01, nextUnpaid.flow.result.resistance01);
  assert.ok(next.flow.result.profile.reserve01 < nextUnpaid.flow.result.profile.reserve01);
  const expectedGap = 0.44 * 0.12 * (nextUnpaid.flow.result.profile.reserve01 - next.flow.result.profile.reserve01)
    * next.flow.result.conductivity01 * (1 - next.flow.result.resistance01);
  assert.ok(expectedGap > 0);
  close(nextUnpaid.flow.result.acceptedCurrent01 - next.flow.result.acceptedCurrent01, expectedGap);
});

test('Sustained delivery preserves overload at matched profiles and costs only accepted work', context => {
  const game = makeCircuit();
  const control = makeCircuit({ settle: false });
  let debit = 0;
  let overloadStep = null;
  for (let i = 0; i < 90; i += 1) {
    control.radial.reserve01 = game.radial.reserve01;
    const [reference] = control.tick(1);
    const [sample] = game.tick(1);
    assert.deepEqual(sample.flow, reference.flow);
    if (!sample.flow.result) continue;
    assertDebit(sample);
    debit += sample.receipt.actualDebit;
    if (sample.flow.overloaded && overloadStep === null) overloadStep = i + 1;
  }
  assert.ok(overloadStep !== null && debit > 0);
  close(game.radial.reserve01, START_RESERVE + 0.105 * STEP * 90 - debit);
  assert.equal(game.imprint, control.imprint);
  assert.deepEqual(game.frame.playerComposition, { nutrient: 0.2 });
  assert.deepEqual(game.frame.chemObjectState, { absorbedObjects: 0 });
  context.diagnostic(`Full RT overload at step ${overloadStep}, total debit ${debit.toFixed(9)}, reserve ${game.radial.reserve01.toFixed(9)}`);
});

test('Returned resistance scales the cost, and the debit clips at low and empty reserve', context => {
  const low = makeCircuit();
  const high = makeCircuit();
  high.imprint = 0.6;
  const a = low.firstDelivery();
  const b = high.firstDelivery();
  assertDebit(a);
  assertDebit(b);
  assert.ok(b.receipt.resistance01 > a.receipt.resistance01);
  assert.ok(b.receipt.actualDebit > a.receipt.actualDebit);
  context.diagnostic(`Returned resistance ${a.receipt.resistance01.toFixed(6)} → ${b.receipt.resistance01.toFixed(6)}, debit ${a.receipt.actualDebit.toFixed(9)} → ${b.receipt.actualDebit.toFixed(9)}`);

  const drain = 0.09 / (1.05 * 1.12);
  high.radial.reserve01 = drain * STEP + 0.00001;
  const [limited] = high.tick(0.44, { input: { boostHeld: true } });
  assertDebit(limited);
  close(limited.receipt.reserveBefore, 0.00001);
  close(limited.receipt.actualDebit, 0.00001);
  assert.equal(limited.receipt.reason, 'reserve_limited');
  assert.equal(high.radial.reserve01, 0);
  const [empty] = high.tick(0.44, { input: { boostHeld: true } });
  assertDebit(empty);
  assert.ok(empty.receipt.requestedDebit > 0);
  assert.equal(empty.receipt.actualDebit, 0);
  assert.equal(high.radial.reserve01, 0);
});

test('Zero, stale, mismatched and replayed deliveries never debit reserve or replace last settlement', () => {
  const game = makeCircuit();
  const accepted = game.firstDelivery();
  const { frame, radial } = game;
  const reserve = radial.reserve01;
  const result = accepted.flow.result;
  function reject(reason) {
    radial.settleFlowReserve(STEP, frame);
    game.telemetry.observeSiltFlow(frame);
    assert.equal(frame.siltFlowReserveSettlement.reason, reason);
    assert.equal(frame.siltFlowReserveSettlement.actualDebit, 0);
    assert.equal(radial.reserve01, reserve);
    assert.deepEqual(game.exportSettlement().lastSettled, accepted.receipt);
  }
  reject('duplicate_step');
  frame.frame += 1;
  reject('stale_delivery');
  frame.frame -= 1;
  for (const [fields, reason] of [
    [{ acceptedCurrent01: 0 }, 'zero_current'], [{ resistance01: Infinity }, 'invalid_delivery'],
    [{ owner: 'foreign' }, 'delivery_identity_mismatch'], [{ actionSequence: 2 }, 'delivery_identity_mismatch'],
    [{ receiverId: 'wrong-patch' }, 'delivery_identity_mismatch'], [{ hostId: 'wrong-host' }, 'stale_delivery'],
    [{ cellId: HUB }, 'stale_delivery'], [{ mountSequence: 2 }, 'stale_delivery'], [{ substep: 2 }, 'stale_delivery']
  ]) {
    frame.coreFlow = { ...accepted.flow, result: { ...result, ...fields } };
    reject(reason);
  }
  frame.coreFlow = { ...accepted.flow, result: null, reason: 'receiver_rejected' };
  reject('receiver_rejected');
  assert.equal(game.exportSettlement().lastRejected.reason, 'receiver_rejected');
  assert.equal(game.exportSettlement().lastSettled.actualDebit, accepted.receipt.actualDebit);
});

test('Fixed and catch-up steps agree and the final debit survives release or unmount', () => {
  const fixed = makeCircuit();
  const catchUp = makeCircuit();
  const singles = [];
  const batches = [];
  for (let i = 0; i < 12; i += 1) {
    batches.push(...catchUp.tick(0.74, { step: 0.04, batch: 3 }));
    for (let j = 0; j < 3; j += 1) singles.push(...fixed.tick(0.74, { step: 0.04 }));
  }
  for (const [index, sample] of batches.entries()) {
    assert.equal(sample.flow.phase, singles[index].flow.phase);
    close(sample.receipt.actualDebit, singles[index].receipt.actualDebit);
  }
  assert.ok(batches.filter(sample => sample.receipt.status === 'settled').length > 3);
  close(fixed.radial.reserve01, catchUp.radial.reserve01);
  close(fixed.imprint, catchUp.imprint);
  assert.equal(catchUp.frame.siltFlowReserveSettlement.substep, 2);
  assert.equal(catchUp.frame.siltFlowReserveSettlement.reserveAfter, catchUp.radial.reserve01);

  for (const [game, leave] of [[fixed, false], [catchUp, true]]) {
    const last = game.frame.siltFlowReserveSettlement;
    const imprint = game.imprint;
    if (leave) game.mount(HUB);
    game.tick();
    assert.equal(game.frame.coreFlow.result, null);
    assert.equal(game.exportSettlement().current, null);
    assert.deepEqual(game.exportSettlement().lastSettled, last);
    assert.equal(game.imprint, imprint);
    if (leave) {
      game.mount(SILT);
      game.tick();
      assert.equal(game.imprint, imprint);
      assert.deepEqual(game.exportSettlement().lastSettled, last);
    }
  }
  const inspection = makeCircuit();
  const finalDelivery = inspection.firstDelivery();
  inspection.frame.inspectionCamera = { active: true };
  inspection.tick();
  assert.equal(inspection.frame.coreFlow.result, null);
  assert.equal(inspection.exportSettlement().current, null);
  assert.deepEqual(inspection.exportSettlement().lastSettled, finalDelivery.receipt);
});

test('Legal radial placements feed real current and retain their existing profiles', context => {
  const debits = [];
  for (const [zone, radius] of [['membrane', 1.04], ['deep_core', 0.33]]) {
    const game = makeCircuit({ zone: null });
    const { scene, playerRoot, body, frame } = game;
    const embodiment = new CoreEmbodimentSystem({ scene, playerRoot, frameState: frame });
    embodiment.bodyFrame = body;
    embodiment.createMemoryImprint();
    embodiment.createVascularReturnFilament();
    embodiment.createSiltPressureAdaptation();
    for (const piece of [embodiment.memoryImprintRoot, embodiment.vascularFilamentRoot, embodiment.siltAdaptationRoot]) {
      const anchor = piece.userData.coreWorkAnchorLocal;
      piece.position.copy(anchor).setLength(radius).sub(anchor);
      piece.userData.coreWorkOffset.copy(piece.position);
      piece.visible = true;
    }
    embodiment.updateSpatialCoreChemistry(0, STEP, frame);
    assert.deepEqual(frame.spatialCoreChemistry.placements.map(piece => piece.zoneId), [zone, zone, zone]);
    const delivery = game.firstDelivery();
    assertDebit(delivery);
    assert.equal(delivery.flow.result.profile.topologyId, frame.spatialCoreChemistry.topology.id);
    debits.push(delivery.receipt.actualDebit);
  }
  assert.ok(debits[1] > debits[0]);
  context.diagnostic(`First membrane/deep delivery debits ${debits.map(value => value.toFixed(9)).join('/')}`);
});

test('Mounted Flow leaves the subsequent authenticated B5-B Grave recovery unchanged', async () => {
  const recipes = await loadRecipes();
  const withFlow = makeCircuit({ recipes, zone: null });
  const control = makeCircuit({ recipes, zone: null, settle: false });
  for (const game of [withFlow, control]) {
    const { silt, tick, mount, playerRoot, ledger, grave, radial, frame } = game;
    const delivery = game.firstDelivery();
    if (game === withFlow) assertDebit(delivery);
    assert.equal(silt.materialIdentity.totalMass(), 8);
    assert.equal(ledger.acceptedTotal, 0);
    assert.equal(frame.chemObjectState.absorbedObjects, 0);
    silt.safeMatterAbsorbed = true;
    tick();
    const unit = silt.livingCycle.units[1];
    Object.assign(unit, { phase: 'garden_transit', age: 2 });
    tick();
    const center = silt.recipe.habitatFoundation.habitats.find(habitat => habitat.id === 'reservoir').center;
    playerRoot.position.copy(silt.root.localToWorld(new THREE.Vector3().fromArray(center)));
    const position = [center[0] + 0.9, center[1], center[2]];
    assert.ok(silt.siltGrip.tryGrip({ unit, unitPosition: position, corePosition: center, stabilizeHeld: true, aPressed: true }));
    assert.ok(silt.siltTrajectory.beginHold(unit.id, position));
    silt.siltGripLocalOffset.set(0.9, 0, 0);
    tick(0, { step: 0.05, input: { ...HOLD, pulsePressed: true, pulseEventId: 2 } });
    tick(0, { step: 0.05, input: { ...HOLD, interactPressed: true } });
    assert.equal(ledger.acceptedTotal, 1);
    assert.deepEqual(ledger.snapshot().records[0].releaseVelocity, [1.6, 0, 0]);
    for (const cell of [HUB, VASCULAR, HUB, GRAVE]) {
      mount(cell);
      tick();
    }
    assert.equal(grave.vascularEffectMemory.receivedTotal, 1);
    grave.objectItems.get('residue_silt_cloud_001').root.getWorldPosition(playerRoot.position);
    Object.assign(grave, { residueRecoilRisk: 0.6, traceIntegrity: 0.45, siltRead: true, siltStabilized: true });
    Object.assign(radial, { reserve01: START_RESERVE, stabilizeHoldSeconds: 0, pulseDemandAge: 99 });
    tick(0, { step: 0.05, input: HOLD });
    assert.ok(frame.graveVascularEffectMemory.recoveryCoupling.witness);
    close(radial.reserve01, START_RESERVE - 0.00075 / 1.02628);
    assert.equal(ledger.vascularEffectSnapshot().acceptedTotal, 1);
    assert.equal(frame.chemObjectState.absorbedObjects, 0);
    assert.equal(silt.materialIdentity.totalMass(), 8);
  }
  assert.equal(withFlow.radial.reserve01, control.radial.reserve01);
  assert.deepEqual(withFlow.frame.graveVascularEffectMemory.recoveryCoupling.witness,
    control.frame.graveVascularEffectMemory.recoveryCoupling.witness);
  assert.equal(withFlow.exportSettlement().lastSettled.cellId, SILT);
  assert.equal(withFlow.exportSettlement().current, null);
});
