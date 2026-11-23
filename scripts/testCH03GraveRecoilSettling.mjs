import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { ChemObjectSystem } from '../src/chemistry/ChemObjectSystem.js';
import { resolveLocalChemistryContext } from '../src/chemistry/LocalChemistryContextSystem.js';
import { buildBoundedSimulationSteps } from '../src/core/BoundedSimulationCatchUp.js';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { RecipeDataSystem } from '../src/data/RecipeDataSystem.js';
import { CoreEmbodimentSystem } from '../src/player/CoreEmbodimentSystem.js';
import { CoreRadialPerformanceSystem } from '../src/player/CoreRadialPerformanceSystem.js';
import { GraveMemoryRouteSystem } from '../src/routes/GraveMemoryRouteSystem.js';
import { GraveResonanceGameplaySystem } from '../src/routes/GraveResonanceGameplaySystem.js';
import { GraveReturnRegionSystem } from '../src/routes/GraveReturnRegionSystem.js';
import { ReturnRegionEngineSystem } from '../src/routes/ReturnRegionEngineSystem.js';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';

const HOST = 'HOST_ALPHA_WOUNDED_NURSERY';
const GRAVE = 'CELL_GRAVE_MEMORY_RESIDUE_BED_001';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const RESIDUE = 'residue_silt_cloud_001';
const STEP = 0.05;
const HOLD = { stabilizeHeld: true };
const DEEP = 'deep_core', INNER = 'inner_body', MEMBRANE = 'membrane';
const MATURE_GRAVE = {
  owner: 'CoreGrowthSystem', firstGrowthCommitted: true,
  graveMemoryImprintCommitted: true, safeMemoryTransferComplete: true, graveRouteReturned: true
};
const recipes = new RecipeDataSystem();
const originalFetch = globalThis.fetch;
globalThis.fetch = async request => {
  try {
    return new Response(readFileSync(new URL('../public' + String(request), import.meta.url)));
  } catch {
    return new Response(null, { status: 404 });
  }
};
try {
  await recipes.loadAll();
} finally {
  globalThis.fetch = originalFetch;
}
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, actual + ' versus ' + expected);

function arrange(game, zones) {
  const { frameState: frame, playerRoot } = game;
  const body = new CoreEmbodimentSystem(game);
  body.bodyFrame = new THREE.Group();
  playerRoot.add(body.bodyFrame);
  body.createMemoryImprint();
  body.createVascularReturnFilament();
  body.createSiltPressureAdaptation();
  const radius = { [DEEP]: 0.33, [INNER]: 0.69, [MEMBRANE]: 1.04 };
  const pieces = [body.memoryImprintRoot, body.vascularFilamentRoot, body.siltAdaptationRoot];
  frame.inspectionCamera = { active: true, coreWorkActive: true };
  let eventId = 0;
  const manipulate = input => {
    frame.input = input;
    body.updateCoreWorkManipulation(0, STEP, frame);
  };
  for (const [index, piece] of pieces.entries()) {
    piece.visible = true;
    if (index > 0) manipulate({ coreWorkSelectNextPressed: true });
    manipulate({ coreWorkPressed: true, coreWorkEventId: ++eventId });
    for (let i = 0; i < 40; i++) {
      const distance = piece.userData.coreWorkAnchorLocal.clone().add(piece.position).length();
      const depth = (radius[zones[index]] - distance) / (STEP * body.coreWorkDepthSpeed);
      manipulate({ coreWorkManipDepth: THREE.MathUtils.clamp(depth, -1, 1) });
    }
    manipulate({ coreWorkPressed: true, coreWorkEventId: ++eventId });
  }
  frame.inspectionCamera = { active: false, coreWorkActive: false };
  frame.input = {};
  body.updateSpatialCoreChemistry(0, STEP, frame);
  assert.deepEqual(frame.spatialCoreChemistry.placements.map(piece => piece.zoneId), zones);
}

// Stage the completed Grave I visit, then let the real Grave II owner and Host
// ledger resolve the current revisit. Landmark input uses retained targeting.
export function createGraveFixture({
  Route = GraveMemoryRouteSystem, zones = [DEEP, INNER, MEMBRANE],
  resolve = true, authenticate = true, earned = true
} = {}) {
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  const camera = new THREE.PerspectiveCamera();
  const ledger = new HostConnectionReceiptLedger();
  const frame = {
    frame: 0, runtimeSeconds: 0, activeHostId: HOST, activeCellId: GRAVE, input: {},
    firstSliceRuntimeMount: {
      active: true, mountStatus: 'active_region_mounted', mountSequence: 1,
      activeRuntimeCellId: GRAVE, activeSystemIds: ['graveMemoryRouteSystem']
    },
    act1RouteHistory: {
      graveReturned: true, graveMemoryImprintCommitted: true,
      routeStates: { grave_memory_route: { entryCount: 2, returned: true } }
    },
    coreGrowth: earned ? { ...MATURE_GRAVE } : {},
    playerComposition: { nutrient: 0.4 }, chemObjectState: { absorbedObjects: 0 }
  };
  const shared = {
    scene, playerRoot, camera, frameState: frame, recipeDataSystem: recipes,
    hostConnectionReceiptLedger: ledger
  };
  const chemObjectSystem = new ChemObjectSystem({
    ...shared, localCellRecipe: recipes.get('localCellRecipes', HUB),
    visualComposer: { compose({ position, scale }) {
      const root = new THREE.Group();
      root.position.fromArray(position);
      root.scale.setScalar(scale);
      scene.add(root);
      return root;
    } }
  });
  const grave = new Route({ ...shared, chemObjectSystem });
  const engine = new ReturnRegionEngineSystem(shared);
  const returned = new GraveReturnRegionSystem({ ...shared, graveMemoryRouteSystem: grave });
  const resonance = new GraveResonanceGameplaySystem({
    ...shared, chemObjectSystem, graveReturnRegionSystem: returned,
    hostConnectionReceiptLedger: authenticate ? ledger : null
  });
  const radial = new CoreRadialPerformanceSystem(shared);
  for (const owner of [grave, engine, returned, resonance]) owner.init();
  Object.assign(grave, {
    completed: true, safeMemoryTransferComplete: true, returnFoldReady: true,
    graveMemoryImprintCommitted: true, siltRead: true, siltStabilized: true,
    residueRecoilRisk: 0, traceIntegrity: 1
  });
  arrange(shared, zones);

  function tick(input = {}, { step = STEP, batch = 1, beforeGrave } = {}) {
    const { steps, substepCount } = buildBoundedSimulationSteps(step * batch);
    assert.equal(substepCount, batch);
    frame.frame++;
    frame.input = { ...input };
    frame.runtimeSimulationSubstepCount = substepCount;
    return steps.map((dt, substep) => {
      frame.runtimeSimulationSubstepIndex = substep;
      frame.runtimeSimulationSubstepSeconds = dt;
      frame.runtimeSeconds += dt;
      frame.localChemistryContext = resolveLocalChemistryContext(recipes, frame);
      beforeGrave?.(frame);
      grave.update(dt, frame);
      engine.update(dt, frame);
      returned.update(dt, frame);
      resonance.update(dt, frame);
      radial.update(dt, frame);
      return { recoil: grave.residueRecoilRisk, trace: grave.traceIntegrity, reserve: radial.reserve01 };
    });
  }

  function atResidue() {
    grave.objectItems.get(RESIDUE).root.getWorldPosition(playerRoot.position);
  }
  function mount(cell) {
    frame.activeCellId = cell;
    frame.firstSliceRuntimeMount = {
      active: true, mountStatus: 'active_region_mounted', activeRuntimeCellId: cell,
      mountSequence: frame.firstSliceRuntimeMount.mountSequence + 1,
      activeSystemIds: cell === GRAVE ? ['graveMemoryRouteSystem'] : []
    };
    if (cell === GRAVE) {
      grave.onRuntimeMount(frame);
      atResidue();
    }
  }

  tick();
  if (resolve) {
    for (const node of resonance.nodes.values()) node.level01 = 0.55;
    for (const node of resonance.nodes.values()) {
      frame.targeting = { relationshipActive: true, relationshipTargetId: node.objectId };
      tick(HOLD);
    }
    frame.targeting = {};
    for (let step = 0; !resonance.completed && step < 40; step++) tick();
    assert.equal(resonance.completed, true);
    assert.equal(ledger.graveIIResolutionSnapshot().acceptedTotal, authenticate ? 1 : 0);
    assert.equal(frame.graveResonanceGameplay.resolutionId, 'shared_memory');
    // Match the runtime handoff that consumes a completed event next substep.
    tick();
  }
  atResidue();
  radial.reserve01 = 0.6;
  radial.stabilizeHoldSeconds = 0;
  return { ...shared, frame, grave, engine, returned, resonance, radial, ledger, tick, mount, atResidue };
}

function recover(game, { recoil = 0.08, trace = 1, input = HOLD, beforeGrave } = {}) {
  Object.assign(game.grave, { residueRecoilRisk: recoil, traceIntegrity: trace });
  const [result] = game.tick(input, { beforeGrave });
  return { removed: recoil - result.recoil, restored: result.trace - trace, ...result };
}

function prepareOnlyNative(game) {
  game.frame.corePerformance.stabilizeSample = null;
}

test('Deep Memory Knot redirects 0.00225 of earned trace capacity and leaves the full trace intact', () => {
  const game = createGraveFixture();
  const control = createGraveFixture();
  prepareOnlyNative(control);
  const settled = recover(game), native = recover(control);
  close(native.removed, 0.02415);
  close(settled.removed - native.removed, 0.00225);
  close(settled.removed, 0.02640);
  assert.equal(settled.trace, 1);
  assert.equal(game.frame.coreGraveRecovery.multiplier, 1.15);
  assert.equal(game.frame.graveVascularEffectMemory.recoveryCoupling.witness, null);
  assert.equal(settled.reserve, native.reserve);
  assert.deepEqual(game.ledger.graveIIResolutionSnapshot(), control.ledger.graveIIResolutionSnapshot());
  assert.deepEqual(game.frame.graveResonanceGameplay, control.frame.graveResonanceGameplay);
  assert.deepEqual(game.frame.returnRegionEngine, control.frame.returnRegionEngine);
  assert.equal(game.grave.returnFoldReady, control.grave.returnFoldReady);
  game.tick();
  control.tick();
  close(control.frame.physicalFeel.pressure - game.frame.physicalFeel.pressure, 0.24 * 0.00225);
});

test('Inner and membrane Grave placements keep native recovery at the same radial counts', () => {
  const games = [[DEEP, INNER, MEMBRANE], [INNER, DEEP, MEMBRANE], [MEMBRANE, DEEP, INNER]]
    .map(zones => createGraveFixture({ zones }));
  const results = games.map(game => recover(game));
  const [deep, ...others] = games;
  for (const game of others) {
    assert.equal(game.frame.corePerformance.distribution, '1:1:1');
    assert.deepEqual(game.frame.corePerformance.traits, deep.frame.corePerformance.traits);
    assert.deepEqual(game.frame.corePerformance.verbModifiers, deep.frame.corePerformance.verbModifiers);
  }
  close(results[0].removed, 0.02640);
  for (const result of results.slice(1)) {
    close(result.removed, 0.02415);
    assert.equal(result.reserve, results[0].reserve);
  }
});

test('The redirected amount follows the authored trace rate and clips to remaining recoil', () => {
  const varied = createGraveFixture();
  varied.grave.recipe = {
    ...varied.grave.recipe, interaction: { ...varied.grave.recipe.interaction, traceRecoveryPerSecond: 0.40 }
  };
  close(recover(varied).removed, 0.02715);

  const clipped = createGraveFixture();
  const result = recover(clipped, { recoil: 0.025 });
  close(result.removed, 0.025);
  assert.equal(result.recoil, 0);
  assert.equal(result.trace, 1);
});

test('Before Grave II resolution, recoil and trace follow the native authored rates', () => {
  const game = createGraveFixture({ resolve: false });
  const result = recover(game, { recoil: 0.6, trace: 0.45 });
  close(result.removed, 0.02415);
  close(result.restored, 0.01725);
  assert.equal(game.resonance.completed, false);
  assert.equal(game.ledger.graveIIResolutionSnapshot().acceptedTotal, 0);
  close(recover(game).removed, 0.02415);
});

test('A completed resonance publication without an authentic Host resolution stays neutral', () => {
  const game = createGraveFixture({ authenticate: false });
  assert.equal(game.frame.graveResonanceGameplay.completed, true);
  close(recover(game).removed, 0.02415);
  const event = game.frame.returnRegionCompletionEvent;
  assert.equal(game.ledger.observeGraveIIResolution(event, { source: {}, frameState: game.frame }), null);
  assert.equal(game.ledger.graveIIResolutionSnapshot().rejectedTotal, 1);
  close(recover(game).removed, 0.02415);
});

for (const [name, configure, options, expected] of [
  ['unearned Grave', () => {}, { earned: false }, 0.021],
  ['already full trace required', () => {}, { trace: 0.99 }, 0.02415],
  ['unsafe recoil before native settling', () => {}, { recoil: 0.19 }, 0.02415],
  ['released Stabilize', () => {}, { input: {} }, 0],
  ['outside authored range', game => { game.playerRoot.position.x += 10; }, {}, 0],
  ['unread residue', game => { game.grave.siltRead = false; }, {}, 0],
  ['unsettled residue', game => { game.grave.siltStabilized = false; }, {}, 0],
  ['return fold pending', game => { game.grave.returnFoldReady = false; }, {}, 0.02415],
  ['foreign resolution', game => { game.frame.graveResonanceGameplay.resolutionId = 'quiet_retention'; }, {}, 0.02415],
  ['forming topology', game => { game.frame.spatialCoreChemistry.topology.complete = false; }, {}, 0.02415],
  ['debug-seeded Core', game => { game.frame.coreGrowth.debugCoreWorkRetainedAnatomySeeded = true; }, {}, 0.02415],
  ['inspection', game => { game.frame.inspectionCamera = { active: true }; }, {}, 0.021],
  ['Core Work', game => { game.frame.tightInspectionCamera = { coreWorkActive: true }; }, {}, 0.021],
  ['status page', game => { game.frame.statusPage = { open: true }; }, {}, 0.02415],
  ['transition in progress', game => { game.frame.localCellBoundaryMorph = { active: true }; }, {}, 0.02415]
]) {
  test('Native fallback for ' + name, () => {
    const game = createGraveFixture(options);
    configure(game);
    close(recover(game, options).removed, expected);
  });
}

for (const [key, value] of Object.entries({
  sampledFrame: -1, sampledSubstep: 1, hostId: 'foreign-host', cellId: HUB, mountSequence: 0, debugAnatomy: true
})) {
  test('A prior sample with invalid ' + key + ' cannot authorize extra settling', () => {
    const game = createGraveFixture();
    const sample = game.frame.corePerformance.stabilizeSample;
    game.frame.corePerformance.stabilizeSample = Object.freeze({ ...sample, [key]: value });
    close(recover(game).removed, 0.02415);
  });
}

test('Leaving and returning preserves the receipt and requires a fresh mounted prior sample', () => {
  const game = createGraveFixture();
  const receipt = game.ledger.graveIIResolutionSnapshot();
  game.mount(HUB);
  assert.equal(recover(game).removed, 0);
  game.mount(GRAVE);
  close(recover(game).removed, 0.02415);
  game.atResidue();
  close(recover(game).removed, 0.02640);
  assert.deepEqual(game.ledger.graveIIResolutionSnapshot(), receipt);

  game.grave.onRuntimeUnmount(game.frame);
  game.grave.onRuntimeMount(game.frame);
  game.atResidue();
  close(recover(game).removed, 0.02415);
  close(recover(game).removed, 0.02640);
});

test('Fixed and catch-up steps deliver the same recoil, integrity and reserve results', () => {
  const games = [1, 3].map(() => createGraveFixture());
  const traces = games.map((game, index) => {
    const batch = index === 0 ? 1 : 3;
    game.tick({}, { step: 0.04 });
    game.grave.residueRecoilRisk = 0.15;
    const trace = [];
    for (let i = 0; i < 6 / batch; i++) trace.push(...game.tick(HOLD, { step: 0.04, batch }));
    return trace;
  });
  close(0.15 - traces[0][0].recoil, 0.0264 * 0.04 / 0.05);
  for (const [index, single] of traces[0].entries()) {
    for (const field of ['recoil', 'trace', 'reserve']) close(single[field], traces[1][index][field]);
  }
});

test('The accepted Grave II outcome still reaches Silt once with the same pressure echo and mass', () => {
  const game = createGraveFixture();
  const ledger = game.ledger.graveIIResolutionSnapshot();
  const result = recover(game);
  close(result.removed, 0.02640);
  assert.deepEqual(game.ledger.graveIIResolutionSnapshot(), ledger);
  const silt = new SiltPressureRouteSystem(game);
  silt.init();
  game.mount(SILT);
  silt.completed = true;
  silt.update(STEP, game.frame);
  assert.equal(silt.graveIIConsumedSequence, ledger.sequence);
  assert.equal(silt.graveIIReceiptId, ledger.lastReceiptId);
  assert.equal(silt.graveIIPressureEcho, 0.028);
  close(silt.pressureSettlingTarget(), 0.072);
  silt.update(STEP, game.frame);
  assert.equal(silt.graveIIPressureEcho, 0.028);
  assert.equal(silt.materialIdentity.totalMass(), 8);
  assert.deepEqual(game.ledger.graveIIResolutionSnapshot(), ledger);
});
