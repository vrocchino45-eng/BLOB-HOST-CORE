import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { VascularRhythmRouteSystem } from '../src/routes/VascularRhythmRouteSystem.js';
import { createReweaveFixture } from './testCH01VascularRecovery.mjs';

const STEP = .05;
const RESIDUAL = .085267;
const HIGH = [2, 1, 0];
const LOW = [0, 0, 3];
const HOLD = { stabilizeHeld: true };
const CELL = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const BASE = '4d375086969984b4d962c4864ebb97e44022bb9c';
const ROUTE_FILE = 'src/routes/VascularRhythmRouteSystem.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const routeUrl = new URL('../' + ROUTE_FILE, import.meta.url);
const baselineSource = execFileSync('git', [
  '--no-optional-locks', '-c', 'safe.directory=' + root.replaceAll('\\', '/').replace(/\/$/, ''),
  '-C', root, 'show', BASE + ':' + ROUTE_FILE
], { encoding: 'utf8' }).replace(/(from\s+")([^"]+)(")/g, (_, before, specifier, after) => {
  const resolved = specifier.startsWith('.') ? new URL(specifier, routeUrl).href : import.meta.resolve(specifier);
  return before + resolved + after;
});
const { VascularRhythmRouteSystem: Baseline } = await import(
  'data:text/javascript;base64,' + Buffer.from(baselineSource).toString('base64')
);

function fixture(Route, layout = HIGH, completed = true) {
  const game = createReweaveFixture(layout, Route);
  const { frame, route, radial } = game;
  // Owner publications are staged here for exact arithmetic and rejection
  // cases. The companion browser test earns these fields through gameplay.
  frame.coreGrowth = {
    owner: 'CoreGrowthSystem', firstGrowthCommitted: true,
    vascularRhythmRetained: true, vascularRouteReturned: true, vascularCadenceReads: 3,
    graveMemoryImprintCommitted: true, safeMemoryTransferComplete: true, graveRouteReturned: true,
    siltPressureRetained: true, siltRouteReturned: true, siltPressureRead: true,
    siltRibsReleased: true, siltSafeMatterAbsorbed: true, siltDenseMatterLeftIntact: true
  };
  frame.act1RouteHistory = {
    vascularReturned: true, vascularCompleted: true,
    routeStates: { vascular_route: {
      completed: true, returned: true, returnCount: 1, entryCount: 2,
      transitionOwner: 'LocalCellBoundaryMorphSystem'
    } }
  };
  frame.returnRegionEngine = Object.freeze({ unlockedPhaseCount: 3, creditCount: 3 });
  Object.assign(route, {
    completed, returnFoldReady: completed, lockedCadenceReads: completed ? 3 : 0,
    relationshipReadSequence: completed ? 3 : 0, turbulence: RESIDUAL,
    circulationIntegrity: .91, desynchronized: false
  });
  game.atValve(1);
  radial.update(0, frame);
  return game;
}

const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-12, actual + ' versus ' + expected);
const neutral = {
  eligible: false, factor: 1, turbulenceRemoved: 0, integrityRestored: 0, neutralReason: 'post_read'
};

function snapshot(game) {
  const { route, frame, radial, ledger, playerRoot } = game;
  return {
    frame: structuredClone(frame),
    routeScalars: Object.fromEntries(Object.entries(route).filter(([, value]) =>
      ['number', 'boolean', 'string'].includes(typeof value))),
    reserve: radial.reserve01,
    position: playerRoot.position.toArray(),
    receipts: ledger.snapshot(),
    effects: ledger.vascularEffectSnapshot(),
    resolution: ledger.graveIIResolutionSnapshot()
  };
}

function current(game) {
  const { frame, route } = game;
  const { physicalFeel: feel } = frame;
  // Remove the published directional term from X to measure the transverse
  // swirl amplitude, with a completed route's outward direction of -1.
  const swirl = (feel.flowVector.x + route.closestTangent.x * feel.spatialFeel.flowStrength)
    / Math.sin(route.elapsed * 4.1);
  return { swirl, viscosity: feel.viscosity, pressure: feel.pressure, acceleration: feel.accelerationScale };
}

for (const [name, layout, factor, removed] of [
  ['eligible neutral coherence', LOW, 1, .023],
  ['eligible maximum coherence', HIGH, 1.10, .0253]
]) {
  test(name + ' settles only the residual with measured physical response', context => {
    const base = fixture(Baseline, layout);
    const next = fixture(VascularRhythmRouteSystem, layout);
    assert.deepEqual(base.step(), neutral);
    const witness = next.step();
    assert.deepEqual({ ...witness, turbulenceRemoved: removed }, {
      eligible: true, factor, turbulenceRemoved: removed, integrityRestored: 0,
      mode: 'return_current_residual', neutralReason: factor === 1 ? 'coherence_at_or_below_neutral' : null
    });
    close(witness.turbulenceRemoved, removed);
    close(next.route.turbulence, RESIDUAL - removed);
    const previous = current(base);
    const actual = current(next);
    const feel = next.frame.physicalFeel.spatialFeel;
    close(previous.swirl - actual.swirl,
      removed * .20 * (1 + feel.pulseWake * .28) * (1 - feel.absorbShear * .18) * (1 - feel.stabilizeCalm * .68));
    close(previous.viscosity - actual.viscosity, removed * .24);
    close(previous.pressure - actual.pressure, removed * .16);
    close(actual.acceleration - previous.acceleration, removed * .12);
    if (factor === 1.10) close(previous.viscosity - actual.viscosity, .006072);

    assert.deepEqual(next.route.coreCoherenceResponse, base.route.coreCoherenceResponse);
    assert.equal(feel.flowStrength, base.frame.physicalFeel.spatialFeel.flowStrength);
    for (const field of ['circulationIntegrity', 'lockedCadenceReads', 'relationshipReadSequence',
      'completed', 'returnFoldReady', 'stabilizeSeconds', 'recoverySeconds', 'synchronization']) {
      assert.equal(next.route[field], base.route[field], field);
    }
    assert.equal(next.route.circulationIntegrity, .91);
    assert.deepEqual(next.frame.act1RouteHistory, base.frame.act1RouteHistory);
    assert.deepEqual(next.frame.returnRegionEngine, base.frame.returnRegionEngine);
    assert.deepEqual(next.frame.returnRegionCompletionEvent, base.frame.returnRegionCompletionEvent);
    assert.deepEqual(next.frame.corePerformance, base.frame.corePerformance);
    assert.equal(next.radial.reserve01, base.radial.reserve01);
    assert.deepEqual(next.ledger.snapshot(), base.ledger.snapshot());
    assert.deepEqual(next.ledger.vascularEffectSnapshot(), base.ledger.vascularEffectSnapshot());
    assert.deepEqual(next.route.siltSignalReceiver.snapshot(), base.route.siltSignalReceiver.snapshot());
    context.diagnostic(JSON.stringify({ factor, before: RESIDUAL, remaining: next.route.turbulence,
      removed: witness.turbulenceRemoved, integrity: next.route.circulationIntegrity,
      previous, actual, ordinaryReserve: next.radial.reserve01 }));
  });
}

function invalidDistance(game) {
  const samplePlayerPath = game.route.samplePlayerPath.bind(game.route);
  game.route.samplePlayerPath = (...args) => ({ ...samplePlayerPath(...args), distance: -1 });
}

const fallbacks = [
  ['zero residual', game => { game.route.turbulence = 0; }],
  ['Stabilize released', () => {}, {}],
  ['invalid current distance', invalidDistance],
  ['outside authored current but inside the native fringe', game => { game.playerRoot.position.y += 1.65; }],
  ['outside authored interaction range', game => { game.playerRoot.position.x += 15; }],
  ['forming topology', game => { game.frame.spatialCoreChemistry.retainedPieceCount = 2; }],
  ['topology identity mismatch', game => game.editSample({ topologyId: 'other' })],
  ['debug anatomy in the sample', game => game.editSample({ debugAnatomy: true })],
  ['debug growth flag', game => { game.frame.coreGrowth.debugCoreWorkRetainedAnatomySeeded = true; }],
  ['missing earned return record', game => { delete game.frame.act1RouteHistory.routeStates.vascular_route; }],
  ['wrong return owner', game => { game.frame.act1RouteHistory.routeStates.vascular_route.transitionOwner = 'debug'; }],
  ['never crossed the return', game => { game.frame.act1RouteHistory.routeStates.vascular_route.returnCount = 0; }],
  ['missing original route completion', game => { game.route.lockedCadenceReads = 2; }],
  ['unready return', game => { game.route.returnFoldReady = false; }],
  ['unearned growth', game => { game.frame.coreGrowth.siltRouteReturned = false; }],
  ['foreign Host sample', game => game.editSample({ hostId: 'other_host' })],
  ['foreign cell sample', game => game.editSample({ cellId: HUB })],
  ['stale mount sample', game => game.editSample({ mountSequence: 0 })],
  ['inactive runtime mount', game => { game.frame.firstSliceRuntimeMount.active = false; }],
  ['stale frame sample', game => game.editSample({ sampledFrame: 2 })],
  ['stale substep sample', game => game.editSample({ sampledSubstepCount: 2 })],
  ['stale sample time', game => game.editSample({ sampledRuntimeSeconds: .01 })],
  ['invalid coherence', game => game.editSample({ coherenceMultiplier: Infinity })],
  ['Core Work input', () => {}, { ...HOLD, primaryActionContext: 'core_work' }],
  ['Core Work entry', () => {}, { ...HOLD, coreWorkViewPressed: true }],
  ['inspection', game => { game.frame.inspectionCamera = { active: true }; }],
  ['held Core Work piece', game => { game.frame.coreWorkManipulation = { held: true }; }],
  ['open Status Page', game => { game.frame.statusPage = { open: true }; }]
];

for (const [description, stage, input = HOLD] of fallbacks) {
  test(description + ' matches the original ineligible return exactly', () => {
    const base = fixture(Baseline);
    const next = fixture(VascularRhythmRouteSystem);
    for (const game of [base, next]) stage(game);
    assert.deepEqual(next.step(input), neutral);
    assert.deepEqual(base.step(input), neutral);
    assert.deepEqual(snapshot(next), snapshot(base));
  });
}

test('Native cadence and recovery are identical before completion and on the completion step', () => {
  for (const reads of [0, 1, 2, 3]) {
    for (const layout of [HIGH, LOW]) {
      for (const input of [{}, HOLD, { ...HOLD, pulsePressed: true }]) {
        for (const turbulence of [.18, .5]) {
          const base = fixture(Baseline, layout, false);
          const next = fixture(VascularRhythmRouteSystem, layout, false);
          for (const game of [base, next]) {
            Object.assign(game.route, {
              lockedCadenceReads: reads, relationshipReadSequence: reads, turbulence,
              desynchronized: turbulence > .34, maxDepthProgress: .82, synchronization: 1,
              stabilizeSeconds: 1
            });
            game.atValve(Math.min(reads, 2));
            game.step(input);
          }
          assert.deepEqual(snapshot(next), snapshot(base));
          if (reads === 3 && turbulence === .18) {
            assert.equal(next.route.completed, true);
            assert.equal(next.route.coreReweave.mode, undefined);
          }
        }
      }
    }
  }
});

test('Actual removal clips to zero and subsequent holds show no new recovery', () => {
  const game = fixture(VascularRhythmRouteSystem);
  game.route.turbulence = .005;
  const first = game.step();
  assert.equal(first.turbulenceRemoved, .005);
  assert.equal(first.integrityRestored, 0);
  assert.equal(game.route.turbulence, 0);
  assert.deepEqual(game.step(), neutral);
});

test('One prior sample can settle at most once per frame/substep even if replayed as a copy', () => {
  const game = fixture(VascularRhythmRouteSystem);
  const prior = game.frame.corePerformance.stabilizeSample;
  assert.equal(game.step().eligible, true);
  const after = game.route.turbulence;
  game.editSample(prior);
  game.route.update(STEP, game.frame);
  assert.equal(game.route.turbulence, after);
  game.radial.update(0, game.frame);
  assert.equal(game.step().eligible, true);
  close(game.route.turbulence, RESIDUAL - 2 * .0253);
});

test('Unmount and remount preserve residual and require a new mounted prior sample', () => {
  const game = fixture(VascularRhythmRouteSystem);
  game.frame.activeCellId = HUB;
  game.route.onRuntimeUnmount(game.frame);
  assert.equal(game.route.turbulence, RESIDUAL);
  game.frame.activeCellId = CELL;
  game.frame.firstSliceRuntimeMount.mountSequence++;
  game.route.onRuntimeMount(game.frame);
  assert.deepEqual(game.step(), neutral);
  assert.equal(game.route.turbulence, RESIDUAL);
  assert.equal(game.step().mode, 'return_current_residual');
  close(game.route.turbulence, RESIDUAL - .0253);
});

test('Two fixed steps equal two catch-up substeps with distinct recovery witnesses', () => {
  const fixed = fixture(VascularRhythmRouteSystem);
  const catchUp = fixture(VascularRhythmRouteSystem);
  for (let i = 0; i < 2; i++) {
    const single = fixed.step();
    const batched = catchUp.step(HOLD, { substep: i, count: 2 });
    assert.deepEqual(single, batched);
    assert.equal(batched.eligible, true);
    assert.equal(catchUp.route.turbulence, fixed.route.turbulence);
    assert.equal(catchUp.route.circulationIntegrity, fixed.route.circulationIntegrity);
    assert.equal(catchUp.radial.reserve01, fixed.radial.reserve01);
    assert.deepEqual(current(catchUp), current(fixed));
  }
});
