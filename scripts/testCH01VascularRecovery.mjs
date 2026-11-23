import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { resolveLocalChemistryContext } from '../src/chemistry/LocalChemistryContextSystem.js';
import { CoreEmbodimentSystem } from '../src/player/CoreEmbodimentSystem.js';
import { CoreRadialPerformanceSystem } from '../src/player/CoreRadialPerformanceSystem.js';
import { readPriorCoreStabilizeSample } from '../src/player/CoreStabilizeSample.js';
import { createVascularFixture } from './testWC01VascularReadability.mjs';

const readRecipe = file => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));
const cells = readRecipe('../public/data/world/localCellRecipes.json');
const host = readRecipe('../public/data/hosts/HOST_ALPHA_WOUNDED_NURSERY.json');
const chemistryRecipes = {
  get(kind, id) {
    return kind === 'hosts' && id === host.id ? host : cells.find(cell => cell.id === id);
  }
};
const STEP = 0.05;
const HOLD = { stabilizeHeld: true };
const DEEP_INNER = [2, 1, 0];
const ALL_MEMBRANE = [0, 0, 3];
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, actual + ' versus ' + expected);

export function createReweaveFixture(distribution = DEEP_INNER, Route) {
  const game = createVascularFixture(Route);
  const { frame, route, playerRoot, atValve } = game;
  const [deep_core, inner_body, membrane] = distribution;
  const counts = { deep_core, inner_body, membrane };
  const retainedPieceCount = deep_core + inner_body + membrane;
  const topology = CoreEmbodimentSystem.prototype.getWholeCoreTopology(counts, retainedPieceCount);
  frame.spatialCoreChemistry = { counts, retainedPieceCount, topology };
  frame.firstSliceRuntimeMount = {
    active: true, mountSequence: 1, activeRuntimeCellId: frame.activeCellId, mountStatus: 'active_region_mounted'
  };
  frame.returnRegionEngine = Object.freeze({ unlockedPhaseCount: 3, creditCount: 0 });
  const radial = new CoreRadialPerformanceSystem({ frameState: frame, playerRoot });
  radial.update(0, frame);
  atValve(0);
  Object.assign(route, { turbulence: 0.50, circulationIntegrity: 0.65, desynchronized: true });
  let pulseEventId = 0;

  // Same order as the runtime: local context and the route precede the radial producer.
  function step(input = HOLD, { substep = 0, count = 1, beforeRoute } = {}) {
    if (input.pulsePressed) pulseEventId++;
    if (substep === 0) frame.frame++;
    frame.runtimeSeconds += STEP;
    frame.runtimeSimulationSubstepIndex = substep;
    frame.runtimeSimulationSubstepCount = count;
    frame.input = { ...input, pulseEventId };
    frame.localChemistryContext = resolveLocalChemistryContext(chemistryRecipes, frame);
    assert.equal(frame.localChemistryContext.active, true);
    beforeRoute?.(frame);
    route.update(STEP, frame);
    radial.update(STEP, frame);
    return frame.vascularRhythmRoute.coreReweave;
  }
  function editSample(change) {
    frame.corePerformance.stabilizeSample = Object.freeze({ ...frame.corePerformance.stabilizeSample, ...change });
  }
  return { ...game, radial, step, editSample };
}

function neutral(evidence, reason, removed = 0, restored = 0) {
  assert.equal(evidence.eligible, false);
  assert.equal(evidence.factor, 1);
  assert.equal(evidence.neutralReason, reason);
  close(evidence.turbulenceRemoved, removed);
  close(evidence.integrityRestored, restored);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  test('Matched scattered Vascular step uses the real 2:1:0 and 0:0:3 Core profiles', context => {
    const deep = createReweaveFixture(DEEP_INNER);
    const membrane = createReweaveFixture(ALL_MEMBRANE);
    const before = [deep, membrane].map(g => g.frame.corePerformance.verbModifiers.stabilize.coherenceMultiplier);
    assert.ok(before[0] > 1.10 && before[1] < 1);
    const high = deep.step(), low = membrane.step();
    assert.equal(high.eligible, true);
    assert.equal(high.factor, 1.10);
    assert.equal(high.neutralReason, null);
    close(high.turbulenceRemoved, 0.0253);
    close(high.integrityRestored, 0.0187);
    assert.equal(low.eligible, true);
    assert.equal(low.factor, 1);
    assert.equal(low.neutralReason, 'coherence_at_or_below_neutral');
    close(low.turbulenceRemoved, 0.023);
    close(low.integrityRestored, 0.017);
    close(deep.route.turbulence, 0.50 - 0.0253);
    close(deep.route.circulationIntegrity, 0.65 + 0.0187);
    close(membrane.route.turbulence, 0.50 - 0.023);
    close(membrane.route.circulationIntegrity, 0.65 + 0.017);
    assert.equal(deep.route.lockedCadenceReads, 0);
    assert.equal(membrane.route.lockedCadenceReads, 0);
    context.diagnostic(JSON.stringify({ deep: high, membrane: low }));
  });

  test('Release clears the last live evidence and restoring LT reads a fresh sample', () => {
    const game = createReweaveFixture();
    assert.equal(game.step().eligible, true);
    const { turbulence, circulationIntegrity } = game.route;
    neutral(game.step({}), 'stabilize_released');
    close(game.route.turbulence, turbulence);
    close(game.route.circulationIntegrity, circulationIntegrity);
    assert.equal(game.step().eligible, true);
  });

  test('Out-of-range hold contributes no recovery', () => {
    const game = createReweaveFixture();
    game.playerRoot.position.x += 10;
    neutral(game.step(), 'outside_current');
    assert.equal(game.route.stabilizing, false);
  });

  test('The native Stabilize fringe retains its original rate outside the authored current', () => {
    const game = createReweaveFixture();
    game.playerRoot.position.y += 1.25;
    neutral(game.step(), 'outside_current', 0.023, 0.017);
    assert.equal(game.route.stabilizing, true);
    assert.ok(game.route.pathDistance > game.route.recipe.anatomy.corridorRadius);
  });

  const invalidCases = [
    ['inspection', g => { g.frame.inspectionCamera = { active: true }; }, 'world_action_suspended'],
    ['Core Work', g => { g.frame.tightInspectionCamera = { active: true, coreWorkActive: true }; }, 'world_action_suspended'],
    ['skipped simulation frame', g => { g.frame.frame++; }, 'invalid_or_stale_sample'],
    ['wrong timestamp', g => g.editSample({ sampledRuntimeSeconds: 0.01 }), 'invalid_or_stale_sample'],
    ['foreign Host', g => g.editSample({ hostId: 'foreign' }), 'invalid_or_stale_sample'],
    ['foreign cell', g => g.editSample({ cellId: 'foreign' }), 'invalid_or_stale_sample'],
    ['invalid Core coherence', g => g.editSample({ coherenceMultiplier: Infinity }), 'invalid_or_stale_sample'],
    ['mount sequence mismatch', g => { g.frame.firstSliceRuntimeMount.mountSequence++; }, 'mount_mismatch'],
    ['unmounted authority', g => { g.frame.firstSliceRuntimeMount.active = false; }, 'mount_mismatch'],
    ['foreign mount cell', g => { g.frame.firstSliceRuntimeMount.activeRuntimeCellId = 'foreign'; }, 'mount_mismatch'],
    ['debug-seeded sample', g => g.editSample({ debugAnatomy: true }), 'debug_anatomy'],
    ['debug enabled on this step', g => { g.frame.coreGrowth = { debugCoreWorkRetainedAnatomySeeded: true }; }, 'debug_anatomy']
  ];
  for (const [name, configure, reason] of invalidCases) {
    test(name + ' preserves the original reweave rate', () => {
      const game = createReweaveFixture();
      configure(game);
      neutral(game.step(), reason, 0.023, 0.017);
      close(game.route.turbulence, 0.50 - 0.023);
      close(game.route.circulationIntegrity, 0.65 + 0.017);
    });
  }

  test('Forming Core and non-scattered circulation use native recovery', () => {
    const forming = createReweaveFixture([1, 1, 0]);
    neutral(forming.step(), 'forming_topology', 0.023, 0.017);
    const steady = createReweaveFixture();
    Object.assign(steady.route, { turbulence: 0.20, circulationIntegrity: 0.90, desynchronized: false });
    neutral(steady.step(), 'not_scattered', 0.023, 0.017);
  });

  test('Core Work exit needs a world-mode sample published after the suspension', () => {
    const game = createReweaveFixture();
    game.frame.inspectionCamera = { active: true, coreWorkActive: true };
    neutral(game.step({ primaryActionContext: 'core_work' }), 'world_action_suspended');
    game.frame.inspectionCamera = { active: false, coreWorkActive: false };
    neutral(game.step(), 'invalid_or_stale_sample', 0.023, 0.017);
    assert.equal(game.step().eligible, true);
  });

  test('Unmount clears evidence and remount rejects the previous lifetime until a fresh owner sample', () => {
    const game = createReweaveFixture();
    const { frame, route } = game;
    assert.equal(game.step().eligible, true);
    const previous = frame.corePerformance.stabilizeSample;
    assert.equal(previous.mountSequence, 1);

    const cell = frame.activeCellId;
    frame.activeCellId = 'CELL_SIGNAL_CHORUS_NERVE_001';
    frame.firstSliceRuntimeMount.activeRuntimeCellId = frame.activeCellId;
    frame.firstSliceRuntimeMount.mountSequence++;
    route.update(STEP, frame);
    neutral(frame.vascularRhythmRoute.coreReweave, 'not_mounted');
    assert.equal(route.active, false);

    frame.activeCellId = cell;
    frame.firstSliceRuntimeMount.activeRuntimeCellId = cell;
    frame.firstSliceRuntimeMount.mountSequence++;
    route.onRuntimeMount(frame);
    neutral(frame.vascularRhythmRoute.coreReweave, 'awaiting_mount_sample');
    game.atValve(0);
    neutral(game.step(), 'mount_mismatch', 0.023, 0.017);
    assert.equal(frame.corePerformance.stabilizeSample.mountSequence, 3);
    assert.equal(game.step().eligible, true);

    // Explicit owner remount in the same cell, even if the mode counter has not advanced.
    route.onRuntimeUnmount(frame);
    route.onRuntimeMount(frame);
    game.atValve(0);
    neutral(game.step(), 'mount_mismatch', 0.023, 0.017);
    assert.equal(game.step().eligible, true);
  });

  test('Legacy prior-step reader remains compatible when no mount stamp exists', () => {
    const game = createReweaveFixture();
    delete game.frame.firstSliceRuntimeMount;
    game.radial.update(0, game.frame);
    neutral(game.step(HOLD, { beforeRoute(frame) {
      assert.equal(readPriorCoreStabilizeSample(frame, STEP)?.mountSequence, null);
    } }), 'mount_mismatch', 0.023, 0.017);
  });

  test('Catch-up substeps match fixed-step recovery and reject an out-of-order prior sample', () => {
    const fixed = createReweaveFixture(), catchUp = createReweaveFixture();
    for (let index = 0; index < 3; index++) {
      const accepted = fixed.step();
      assert.equal(accepted.eligible, true);
      assert.deepEqual(catchUp.step(HOLD, { substep: index, count: 3 }), accepted);
    }
    assert.equal(catchUp.route.turbulence, fixed.route.turbulence);
    assert.equal(catchUp.route.circulationIntegrity, fixed.route.circulationIntegrity);
    assert.equal(catchUp.radial.reserve01, fixed.radial.reserve01);
    neutral(catchUp.step(HOLD, { substep: 2, count: 3, beforeRoute() {
      catchUp.editSample({ sampledSubstep: 0 });
    } }), 'invalid_or_stale_sample', 0.023, 0.017);
  });

  test('Evidence reports actual physical clipping at the turbulence and integrity bounds', () => {
    const clippedTurbulence = createReweaveFixture();
    clippedTurbulence.route.turbulence = 0.005;
    const t = clippedTurbulence.step();
    assert.equal(t.factor, 1.10);
    assert.equal(clippedTurbulence.route.turbulence, 0);
    close(t.turbulenceRemoved, 0.005);
    close(t.integrityRestored, 0.0187);

    const clippedIntegrity = createReweaveFixture();
    clippedIntegrity.route.circulationIntegrity = 0.995;
    const i = clippedIntegrity.step();
    assert.equal(i.factor, 1.10);
    assert.equal(clippedIntegrity.route.circulationIntegrity, 1);
    close(i.integrityRestored, 0.005);
    close(i.turbulenceRemoved, 0.0253);
  });

  test('Reweave leaves receipts, phase, credits and return permission with their original owners', () => {
    const game = createReweaveFixture();
    const { frame, route, ledger } = game;
    const history = structuredClone(frame.act1RouteHistory);
    const receipts = structuredClone([ledger.snapshot(), ledger.vascularEffectSnapshot(), ledger.graveIIResolutionSnapshot()]);
    const engine = frame.returnRegionEngine;
    assert.equal(game.step().eligible, true);
    assert.deepEqual([ledger.snapshot(), ledger.vascularEffectSnapshot(), ledger.graveIIResolutionSnapshot()], receipts);
    assert.deepEqual(frame.act1RouteHistory, history);
    assert.equal(frame.returnRegionEngine, engine);
    assert.equal(route.lockedCadenceReads, 0);
    assert.equal(route.returnFoldReady, false);
  });

  test('Post-read recovery and valve eligibility retain their original behavior', () => {
    const afterReads = createReweaveFixture();
    afterReads.route.lockedCadenceReads = 3;
    afterReads.atValve(2);
    neutral(afterReads.step(), 'post_read', 0.0552, 0.0408);
    assert.equal(afterReads.route.currentRelationshipReady, false);
    assert.equal(afterReads.route.returnFoldReady, false);

    const boosted = createReweaveFixture(), control = createReweaveFixture();
    const controlStep = input => control.step(input, { beforeRoute() { control.editSample({ active: false }); } });
    for (let i = 0; i < 4; i++) {
      boosted.step();
      controlStep(HOLD);
      assert.equal(boosted.route.currentRelationshipSeconds, control.route.currentRelationshipSeconds);
      assert.equal(boosted.route.currentRelationshipReady, control.route.currentRelationshipReady);
    }
    assert.equal(boosted.route.currentRelationshipReady, true);
    boosted.step({ ...HOLD, pulsePressed: true });
    controlStep({ ...HOLD, pulsePressed: true });
    assert.equal(boosted.route.lockedCadenceReads, 1);
    assert.equal(boosted.route.lockedCadenceReads, control.route.lockedCadenceReads);
    assert.equal(boosted.route.lastRelationshipReadBeatAligned, control.route.lastRelationshipReadBeatAligned);
    assert.equal(boosted.route.lastRelationshipReadQuality, control.route.lastRelationshipReadQuality);
    assert.equal(boosted.route.currentRelationshipReady, false);
  });
}
