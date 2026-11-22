import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { ChemObjectSystem } from '../src/chemistry/ChemObjectSystem.js';
import { buildBoundedSimulationSteps } from '../src/core/BoundedSimulationCatchUp.js';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { SystemRegistry } from '../src/core/SystemRegistry.js';
import { RecipeDataSystem } from '../src/data/RecipeDataSystem.js';
import { CoreEmbodimentSystem } from '../src/player/CoreEmbodimentSystem.js';
import { CoreRadialPerformanceSystem } from '../src/player/CoreRadialPerformanceSystem.js';
import { GraveMemoryRouteSystem } from '../src/routes/GraveMemoryRouteSystem.js';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';
import { VascularRhythmRouteSystem } from '../src/routes/VascularRhythmRouteSystem.js';
import { readCascadeLabel, readContextualWorldLabel } from '../src/ui/ContextualWorldLabels.js';

const HOST = 'HOST_ALPHA_WOUNDED_NURSERY';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const VASCULAR = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const GRAVE = 'CELL_GRAVE_MEMORY_RESIDUE_BED_001';
const STEP = 0.05;
const HOLD = { stabilizeHeld: true };
const START_RESERVE = 0.6;
const DAMAGE = { residueRecoilRisk: 0.6, traceIntegrity: 0.45 };
const EARNED_GRAVE = {
  owner: 'CoreGrowthSystem', firstGrowthCommitted: true, graveRouteReturned: true,
  graveMemoryImprintCommitted: true, safeMemoryTransferComplete: true
};
const activeRoutes = {
  [SILT]: 'siltPressureRouteSystem', [VASCULAR]: 'vascularRhythmRouteSystem', [GRAVE]: 'graveMemoryRouteSystem'
};
const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);

const recipes = new RecipeDataSystem();
const originalFetch = globalThis.fetch;
globalThis.fetch = async request => {
  try {
    return new Response(readFileSync(new URL(`../public${String(request)}`, import.meta.url)));
  } catch {
    return new Response(null, { status: 404 });
  }
};
try {
  await recipes.loadAll();
} finally {
  globalThis.fetch = originalFetch;
}

function makeFixture() {
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  const camera = new THREE.PerspectiveCamera();
  scene.add(playerRoot, camera);
  const frame = {
    frame: 0, runtimeSeconds: 0, activeHostId: HOST, activeCellId: HUB, input: {},
    firstSliceRuntimeMount: { activeRuntimeCellId: HUB, mountSequence: 1, activeSystemIds: [] },
    act1RouteHistory: {}, playerComposition: { nutrient: 0.4 }, chemObjectState: { absorbedObjects: 0 },
    quickLookInspector: { coreLabelsEnabled: true }
  };
  const ledger = new HostConnectionReceiptLedger();
  const shared = { scene, playerRoot, camera, frameState: frame,
    recipeDataSystem: recipes, hostConnectionReceiptLedger: ledger };
  const visualComposer = {
    compose({ position, scale }) {
      const root = new THREE.Group();
      root.position.fromArray(position);
      root.scale.setScalar(scale);
      scene.add(root);
      return root;
    }
  };
  const chemObjectSystem = new ChemObjectSystem({ ...shared, visualComposer,
    localCellRecipe: recipes.get('localCellRecipes', HUB) });
  const silt = new SiltPressureRouteSystem(shared);
  const vascular = new VascularRhythmRouteSystem(shared);
  const grave = new GraveMemoryRouteSystem({ ...shared, chemObjectSystem });
  const radial = new CoreRadialPerformanceSystem(shared);
  const registry = new SystemRegistry();
  const regionScope = { runtimeScope: 'active_region', lazyInit: true };
  registry.register(activeRoutes[SILT], silt, regionScope);
  registry.register(activeRoutes[VASCULAR], vascular, regionScope);
  registry.register(activeRoutes[GRAVE], grave, regionScope);
  registry.register('coreRadialPerformanceSystem', radial);

  function mount(cell) {
    if (cell === frame.activeCellId) return;
    frame.activeCellId = cell;
    frame.firstSliceRuntimeMount = {
      activeRuntimeCellId: cell, mountSequence: frame.firstSliceRuntimeMount.mountSequence + 1,
      activeSystemIds: activeRoutes[cell] ? [activeRoutes[cell]] : []
    };
  }

  function tick(input = {}, seconds = STEP, update = dt => registry.update(dt, frame)) {
    frame.frame += 1;
    frame.input = input;
    const { steps, substepCount } = buildBoundedSimulationSteps(seconds);
    frame.runtimeSimulationSubstepCount = substepCount;
    for (const [substep, dt] of steps.entries()) {
      frame.runtimeSimulationSubstepIndex = substep;
      frame.runtimeSimulationSubstepSeconds = dt;
      frame.runtimeSeconds += dt;
      update(dt);
    }
  }

  return { ...shared, frame, ledger, silt, vascular, grave, radial, registry, mount, tick };
}

function arrangeCore(game, zone) {
  const { frame, playerRoot } = game;
  const embodiment = new CoreEmbodimentSystem(game);
  embodiment.bodyFrame = new THREE.Group();
  playerRoot.add(embodiment.bodyFrame);
  embodiment.createMemoryImprint();
  embodiment.createVascularReturnFilament();
  embodiment.createSiltPressureAdaptation();
  const pieces = [embodiment.memoryImprintRoot, embodiment.vascularFilamentRoot, embodiment.siltAdaptationRoot];
  const radius = zone === 'deep_core' ? 0.33 : 1.04;
  let eventId = 0;
  frame.inspectionCamera = { active: true, coreWorkActive: true };
  function manipulate(input) {
    frame.input = input;
    embodiment.updateCoreWorkManipulation(0, STEP, frame);
  }
  for (const [index, piece] of pieces.entries()) {
    piece.visible = true;
    if (index > 0) manipulate({ coreWorkSelectNextPressed: true });
    manipulate({ coreWorkPressed: true, coreWorkEventId: ++eventId });
    for (let i = 0; i < 30; i += 1) {
      const delta = radius - piece.userData.coreWorkAnchorLocal.clone().add(piece.position).length();
      manipulate({ coreWorkManipDepth: THREE.MathUtils.clamp(delta / (STEP * embodiment.coreWorkDepthSpeed), -1, 1) });
    }
    manipulate({ coreWorkPressed: true, coreWorkEventId: ++eventId });
  }
  frame.inspectionCamera = { active: false, coreWorkActive: false };
  embodiment.updateSpatialCoreChemistry(0, STEP, frame);
  assert.deepEqual(frame.spatialCoreChemistry.placements.map(placement => placement.zoneId), [zone, zone, zone]);
}

function prepareRecovery({ release = true, zone, earned = false } = {}) {
  const game = makeFixture();
  const { mount, tick, silt, vascular, grave, playerRoot, frame, ledger, radial } = game;
  mount(SILT);
  tick();
  // Stage the earned packet and a native transit pose, then let the real route
  // resolve held motion, release, and C2 receipt creation.
  silt.safeMatterAbsorbed = true;
  tick();
  const unit = silt.livingCycle.units[1];
  Object.assign(unit, { phase: 'garden_transit', age: 2 });
  tick();
  const center = silt.recipe.habitatFoundation.habitats.find(habitat => habitat.id === 'reservoir').center;
  playerRoot.position.copy(silt.root.localToWorld(new THREE.Vector3().fromArray(center)));
  if (release) {
    const radius = 0.9;
    const start = [center[0] + radius, center[1], center[2]];
    assert.ok(silt.siltGrip.tryGrip({ unit, unitPosition: start, corePosition: center,
      stabilizeHeld: true, aPressed: true }));
    assert.ok(silt.siltTrajectory.beginHold(unit.id, start));
    silt.siltGripLocalOffset.set(radius, 0, 0);
    tick({ ...HOLD, pulsePressed: true, pulseEventId: 2 });
    tick({ ...HOLD, interactPressed: true });
  } else {
    tick();
    tick();
  }
  mount(HUB);
  tick();
  mount(VASCULAR);
  tick();
  game.vascularLoad = vascular.siltSignalReceiver.membraneLoad;
  game.vascularCurrent = { ...frame.physicalFeel.flowVector };
  mount(HUB);
  tick();
  mount(GRAVE);
  tick();
  if (zone) arrangeCore(game, zone);
  if (earned) frame.coreGrowth = EARNED_GRAVE;
  grave.objectItems.get('residue_silt_cloud_001').root.getWorldPosition(playerRoot.position);
  Object.assign(grave, DAMAGE, { siltRead: true, siltStabilized: true, absorbWasHeld: true });
  assert.equal(grave.circuitEnabled, true);
  radial.reserve01 = START_RESERVE;
  radial.stabilizeHoldSeconds = 0;
  radial.absorbHoldSeconds = 0;
  radial.pulseDemandAge = 99;
  assert.equal(ledger.acceptedTotal, release ? 1 : 0);
  assert.equal(ledger.vascularEffectSnapshot().acceptedTotal, release ? 1 : 0);
  assert.equal(grave.vascularEffectMemory.receivedTotal, release ? 1 : 0);
  assert.equal(silt.materialIdentity.totalMass(), 8);
  return game;
}

const coupling = game => game.frame.graveVascularEffectMemory.recoveryCoupling;
const demand = game => game.frame.corePerformance.verbModifiers.stabilize.demand01;
const slopes = (game, dt = STEP) => [
  (DAMAGE.residueRecoilRisk - game.grave.residueRecoilRisk) / dt,
  (game.grave.traceIntegrity - DAMAGE.traceIntegrity) / dt
];
const reserveSpent = game => START_RESERVE - game.radial.reserve01;
const effectFraction = witness => (witness.recoilReduction + witness.traceRecovery) / witness.baseRecoveryBudget;
const comparison = (context, name, control, game) => context.diagnostic(
  `${name}: reserve spent ${reserveSpent(control).toFixed(9)} → ${reserveSpent(game).toFixed(9)}, `
  + `Stabilize demand ${demand(control)} → ${demand(game)}, recovery/s ${slopes(game).map(rate => rate.toFixed(6)).join('/')}`
);

test('An authenticated release reduces only Stabilize demand during measured, marginal trace recovery', context => {
  const control = prepareRecovery({ release: false });
  const game = prepareRecovery();
  const receipt = game.ledger.snapshot().records[0];
  const applied = game.ledger.vascularEffectSnapshot().records[0];
  const routesBefore = { ...game.frame.act1RouteHistory };
  const materialBefore = game.silt.materialIdentity.snapshot();
  const chemistryBefore = { ...game.frame.chemObjectState };
  const compositionBefore = { ...game.frame.playerComposition };
  assert.deepEqual(receipt.releaseVelocity, [1.6, 0, 0]);
  assert.equal(applied.parentSiltReceiptId, receipt.id);
  close(applied.appliedDelta, 0.1752);
  close(game.vascularLoad, applied.appliedDelta * Math.exp(-0.018 * STEP));
  assert.notDeepEqual(game.vascularCurrent, control.vascularCurrent);

  for (const fixture of [control, game]) fixture.tick(HOLD);
  const witness = coupling(game).witness;
  assert.equal(coupling(control).witness, null);
  assert.equal(witness.owner, 'GraveMemoryRouteSystem');
  assert.equal(witness.vascularEffectId, applied.id);
  assert.equal(witness.parentSiltReceiptId, receipt.id);
  assert.equal(witness.subjectId, receipt.subjectId);
  assert.equal(witness.hostSequence, applied.sequence);
  assert.equal(witness.hostId, HOST);
  assert.equal(witness.cellId, GRAVE);
  assert.equal(witness.mountSequence, game.frame.firstSliceRuntimeMount.mountSequence);
  assert.equal(witness.frame, game.frame.frame);
  assert.equal(witness.substep, 0);
  assert.equal(witness.stepSeconds, STEP);
  close(witness.recoilReduction, control.grave.residueRecoilRisk - game.grave.residueRecoilRisk);
  close(witness.traceRecovery, game.grave.traceIntegrity - control.grave.traceIntegrity);
  close(effectFraction(witness), 0.02628);
  assert.deepEqual(slopes(control).map(rate => rate.toFixed(5)), ['0.42000', '0.30000']);
  assert.deepEqual(slopes(game).map(rate => rate.toFixed(5)), ['0.43104', '0.30788']);
  close(reserveSpent(control), 0.00075);
  close(reserveSpent(game), reserveSpent(control) / (1 + effectFraction(witness)));
  assert.deepEqual([demand(control), demand(game)], [0.2, 0.195]);
  assert.equal(coupling(game).assistedRecoveryTicks, 1);
  assert.equal(game.frame.graveVascularEffectMemory.gameplayConsequenceApplied, true);
  assert.equal(readContextualWorldLabel(game.frame, { action: 'recover' }).text, 'Silt signal · aiding Grave recovery');
  assert.deepEqual(game.ledger.snapshot().records, [receipt]);
  assert.deepEqual(game.ledger.vascularEffectSnapshot().records, [applied]);
  assert.deepEqual(game.silt.materialIdentity.snapshot(), materialBefore);
  assert.deepEqual(game.frame.act1RouteHistory, routesBefore);
  assert.deepEqual(game.frame.chemObjectState, chemistryBefore);
  assert.deepEqual(game.frame.playerComposition, compositionBefore);
  comparison(context, 'Unarranged Core', control, game);
});

test('Intact, out-of-range, unheld, unread, unsettled and fully clipped traces emit no witness', () => {
  const cases = [
    ({ grave }) => Object.assign(grave, { residueRecoilRisk: 0, traceIntegrity: 1 }),
    ({ playerRoot }) => playerRoot.position.x += 30,
    () => {},
    ({ grave }) => grave.siltRead = false,
    ({ grave }) => grave.siltStabilized = false,
    ({ grave }) => Object.assign(grave, { residueRecoilRisk: 0.001, traceIntegrity: 0.999 }),
    ({ frame }) => frame.activeHostId = 'foreign-host'
  ];
  for (const [index, prepare] of cases.entries()) {
    const game = prepareRecovery();
    prepare(game);
    game.tick(index === 2 ? {} : HOLD);
    assert.equal(coupling(game).witness, null);
    assert.equal(coupling(game).eligibleNow, false);
    assert.equal(coupling(game).assistedRecoveryTicks, 0);
    assert.equal(game.frame.graveVascularEffectMemory.gameplayConsequenceApplied, false);
    close(game.radial.reserve01, index === 2 ? 0.605 : 0.59925);
  }

  const partial = prepareRecovery();
  partial.grave.residueRecoilRisk = 0;
  partial.tick(HOLD);
  assert.equal(coupling(partial).witness.recoilReduction, 0);
  assert.ok(coupling(partial).witness.traceRecovery > 0);
  assert.ok(effectFraction(coupling(partial).witness) < 0.02628);
});

test('Earned Core sets the same recovery ceiling in both cases and suppresses false feedback', context => {
  const control = prepareRecovery({ release: false, earned: true });
  const game = prepareRecovery({ earned: true });
  for (const fixture of [control, game]) fixture.tick(HOLD);
  assert.deepEqual(slopes(control), slopes(game));
  close(slopes(game)[0], 0.483);
  close(slopes(game)[1], 0.345);
  assert.equal(game.frame.coreGraveRecovery.source, 'earned_grave_core');
  assert.equal(coupling(game).multiplier, 1);
  assert.equal(coupling(game).eligibleNow, false);
  assert.equal(coupling(game).witness, null);
  assert.equal(game.frame.graveVascularEffectMemory.gameplayConsequenceApplied, false);
  assert.equal(reserveSpent(game), reserveSpent(control));
  assert.equal(demand(game), demand(control));
  assert.equal(readCascadeLabel(game.frame).history, 'Silt signal · memory retained');
  assert.equal(readContextualWorldLabel(game.frame, { action: 'recover' }).text, 'Grave residue · recovering');
  comparison(context, 'Earned Grave Core', control, game);

  // Exercise the upper-bound tie after receiving a real C2 memory record.
  game.grave.vascularEffectMemory.memoryPressure = 1;
  for (const fixture of [control, game]) {
    Object.assign(fixture.grave, DAMAGE);
    fixture.radial.reserve01 = START_RESERVE;
    fixture.tick(HOLD);
  }
  assert.equal(game.frame.coreGraveRecovery.worldMultiplier, game.frame.coreGraveRecovery.coreMultiplier);
  assert.equal(game.frame.coreGraveRecovery.source, 'earned_grave_core');
  assert.equal(coupling(game).multiplier, 1);
  assert.equal(coupling(game).witness, null);
  assert.equal(coupling(game).assistedRecoveryTicks, 0);
  assert.equal(reserveSpent(game), reserveSpent(control));
});

test('Two Core Work layouts retain their cost law, including concurrent verbs and paired coordination', context => {
  for (const zone of ['deep_core', 'membrane']) {
    const control = prepareRecovery({ release: false, zone });
    const game = prepareRecovery({ zone });
    const input = { ...HOLD, absorbHeld: true, pulsePressed: true, pulseEventId: 8, pulseReleaseCharge01: 0.01 };
    for (const fixture of [control, game]) {
      fixture.frame.returnRegionEngine = { unlockedPhaseCount: 6 };
      fixture.tick(input);
    }
    const a = control.frame.corePerformance;
    const b = game.frame.corePerformance;
    assert.equal(a.topologyId, b.topologyId);
    assert.deepEqual(a.traits, b.traits);
    assert.deepEqual(a.verbModifiers.pulse.demand01, b.verbModifiers.pulse.demand01);
    assert.deepEqual(a.verbModifiers.absorb.demand01, b.verbModifiers.absorb.demand01);
    assert.equal(a.verbModifiers.stabilize.costMultiplier, b.verbModifiers.stabilize.costMultiplier);
    assert.equal(a.endurance.recoveryPerSecond, b.endurance.recoveryPerSecond);
    assert.equal(a.endurance.coordination.factor, b.endurance.coordination.factor);
    assert.equal(a.endurance.coordination.sharedFraction, b.endurance.coordination.sharedFraction);
    assert.ok(demand(game) < demand(control));
    assert.ok(reserveSpent(game) > 0 && reserveSpent(game) < reserveSpent(control));
    if (zone === 'deep_core') assert.ok(a.verbModifiers.stabilize.costMultiplier < 1);
    else assert.ok(a.verbModifiers.stabilize.costMultiplier > 1);
    comparison(context, zone, control, game);
  }
  const control = prepareRecovery({ release: false, zone: 'deep_core' });
  const game = prepareRecovery({ zone: 'deep_core' });
  for (const fixture of [control, game]) fixture.tick({ ...HOLD, boostHeld: true });
  assert.equal(reserveSpent(game), reserveSpent(control));
  game.radial.reserve01 = 0;
  game.tick(HOLD);
  assert.equal(game.radial.reserve01, 0);
});

test('Catch-up and fixed steps agree, and one witness cannot reduce demand twice', context => {
  const fixed = prepareRecovery();
  const catchUp = prepareRecovery();
  const witnesses = [];
  for (let index = 0; index < 3; index += 1) fixed.tick(HOLD);
  catchUp.tick(HOLD, 0.15, dt => {
    catchUp.registry.update(dt, catchUp.frame);
    witnesses.push(coupling(catchUp).witness);
  });
  assert.deepEqual(witnesses.map(witness => witness.substep), [0, 1, 2]);
  assert.ok(witnesses.every(witness => witness.frame === catchUp.frame.frame));
  assert.equal(coupling(catchUp).assistedRecoveryTicks, 3);
  close(reserveSpent(catchUp), reserveSpent(fixed));
  close(catchUp.grave.residueRecoilRisk, fixed.grave.residueRecoilRisk);
  close(catchUp.grave.traceIntegrity, fixed.grave.traceIntegrity);
  context.diagnostic(`Three fixed or catch-up steps spend ${reserveSpent(catchUp).toFixed(9)} reserve`);

  // A replayed witness is ignored. A directly repeated physiology update
  // retains the baseline behavior of charging its ordinary Stabilize cost.
  const charged = catchUp.radial.reserve01;
  coupling(fixed).witness = null;
  fixed.radial.update(STEP, fixed.frame);
  catchUp.radial.update(STEP, catchUp.frame);
  close(catchUp.radial.reserve01, fixed.radial.reserve01);
  assert.equal(demand(catchUp), demand(fixed));
  assert.ok(charged > catchUp.radial.reserve01);
});

test('Grave clears live evidence on interruption and remounts from retained C2 memory', () => {
  const game = prepareRecovery();
  const { frame, mount, tick, grave } = game;
  tick(HOLD);
  const firstWitness = coupling(game).witness;
  for (const inspection of [{ active: true }, { active: true, coreWorkActive: true }]) {
    frame.inspectionCamera = inspection;
    tick(HOLD);
    assert.equal(coupling(game).witness, null);
    assert.equal(coupling(game).eligibleNow, false);
    assert.equal(coupling(game).assistedRecoveryTicks, 1);
    assert.equal(demand(game), 0.2);
  }
  frame.inspectionCamera = { active: false, coreWorkActive: false };
  mount(HUB);
  tick();
  assert.equal(frame.graveVascularEffectMemory.active, false);
  assert.equal(coupling(game).witness, null);
  mount(GRAVE);
  tick();
  assert.equal(coupling(game).witness, null);
  assert.equal(grave.vascularEffectMemory.memoryPressure, firstWitness.memoryPressure);
  assert.equal(grave.vascularEffectMemory.receivedTotal, 1);
  grave.objectItems.get('residue_silt_cloud_001').root.getWorldPosition(game.playerRoot.position);
  tick(HOLD);
  const current = coupling(game).witness;
  assert.ok(current.mountSequence > firstWitness.mountSequence);
  assert.equal(current.hostSequence, firstWitness.hostSequence);
  assert.equal(current.vascularEffectId, firstWitness.vascularEffectId);
});

test('Core rejects stale, foreign, mismatched and invalid witnesses independently of Grave', () => {
  const game = prepareRecovery();
  game.tick(HOLD);
  const frame = game.frame;
  const witness = coupling(game).witness;
  const memory = frame.graveVascularEffectMemory;
  const attempts = [
    { frame: witness.frame - 1 }, { substep: 1 }, { stepSeconds: 0.01 },
    { hostId: 'foreign-host' }, { cellId: VASCULAR }, { mountSequence: witness.mountSequence - 1 },
    { owner: 'other-owner' }, { vascularEffectId: 'foreign-effect' },
    { parentSiltReceiptId: 'foreign-release' }, { hostSequence: 0 }, { subjectId: 'silt-grain-07' },
    { memoryPressure: 1 }, { recoilReduction: 0, traceRecovery: 0 }, { recoilReduction: 1 }, { baseRecoveryBudget: NaN }
  ];
  const sampleReserve = sampleFrame => {
    const radial = new CoreRadialPerformanceSystem({ playerRoot: game.playerRoot, frameState: sampleFrame });
    radial.reserve01 = START_RESERVE;
    radial.update(STEP, sampleFrame);
    return radial.reserve01;
  };
  assert.ok(sampleReserve({ ...frame }) > 0.59925);
  for (const mismatch of attempts) {
    const altered = { ...witness, ...mismatch };
    const state = { ...memory, recoveryCoupling: { ...memory.recoveryCoupling, witness: altered } };
    close(sampleReserve({ ...frame, graveVascularEffectMemory: state }), 0.59925);
  }
  close(sampleReserve({ ...frame, firstSliceRuntimeMount: { ...frame.firstSliceRuntimeMount, activeSystemIds: [] } }), 0.59925);
  close(sampleReserve({ ...frame, graveVascularEffectMemory: { ...memory, active: false } }), 0.59925);
  close(sampleReserve({ ...frame, tightInspectionCamera: { active: true } }), 0.59925);
});
