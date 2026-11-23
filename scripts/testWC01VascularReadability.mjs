import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import * as THREE from 'three';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { LocalCellBoundaryMorphSystem } from '../src/morph/LocalCellBoundaryMorphSystem.js';
import { VascularRhythmRouteSystem } from '../src/routes/VascularRhythmRouteSystem.js';

const CELL = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const STEP = 0.05;
const recipe = JSON.parse(readFileSync(new URL('../public/data/routes/vascularRhythmRouteCircuit_HC011A1.json', import.meta.url)));
export const scenarios = ['none', 'authentic', 'duplicate-stale', 'saturated', 'release-revisit'];

// A public-API, ledger-authenticated source transaction. No forged receiver event.
function release(sequence) {
  return { kind: 'silt-trajectory', outcome: 'released-with-trajectory',
    reason: 'deliberate-release', noMaterialTransfer: true, progressionCredit: false,
    unitId: 'silt-grain-01', sequence, position: [0.495, 0, 0],
    velocity: [1.1, 0, 0], siltElapsedSeconds: sequence * 0.25 };
}

export function createVascularFixture(Route = VascularRhythmRouteSystem) {
  const frame = { frame: 0, runtimeSeconds: 0, activeCellId: CELL, input: {},
    activeHostId: 'HOST_ALPHA_WOUNDED_NURSERY', act1RouteHistory: {},
    playerKinematics: { velocity: { x: 0, y: 0, z: 0 } }, physicalFeel: {},
    quickLookInspector: { coreLabelsEnabled: false } };
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  scene.add(playerRoot);
  const ledger = new HostConnectionReceiptLedger();
  const route = new Route({ scene, playerRoot, frameState: frame,
    recipeDataSystem: { data: { vascularRhythmRouteCircuit: recipe } },
    hostConnectionReceiptLedger: ledger });
  route.init();
  route.onRuntimeMount(frame);
  let pulseId = 0;
  const tick = (input = {}, dt = STEP) => {
    if (input.pulsePressed) pulseId++;
    frame.input = { pulseEventId: pulseId, ...input };
    frame.frame++;
    frame.runtimeSeconds += dt;
    route.update(dt, frame);
  };
  const atValve = index => playerRoot.position.copy(route.entryAnchor)
    .add(route.pathCurve.getPointAt(recipe.anatomy.valveProgress[index]));
  return { frame, scene, playerRoot, ledger, route, tick, atValve };
}

function boundaryReadiness(frame) {
  return LocalCellBoundaryMorphSystem.prototype.evaluateReadiness.call({
    routeReturnReadiness: LocalCellBoundaryMorphSystem.prototype.routeReturnReadiness
  }, { readiness: 'vascular_return', interactionRange: recipe.returnFold.interactionRange }, frame);
}

function state(game) {
  // Compare every published field except the three explicitly authorized strings.
  // Includes full presentationTrace: C2 anatomy and mote travel must also match.
  const frame = structuredClone(game.frame);
  delete frame.vascularRhythmRoute.guideLine;
  delete frame.vascularRhythmRoute.objectiveLine;
  delete frame.vascularRhythmRoute.nextAction;
  return { frame,
    scalars: Object.fromEntries(Object.entries(game.route).filter(([, value]) =>
      ['number', 'boolean', 'string'].includes(typeof value))),
    player: game.playerRoot.position.toArray(),
    current: structuredClone(game.frame.physicalFeel),
    receiverLoad: game.route.siltSignalReceiver.membraneLoad,
    receiverEffects: game.route.siltSignalReceiver.appliedEffectSnapshot(),
    receipts: game.ledger.snapshot(), effects: game.ledger.vascularEffectSnapshot(),
    boundary: boundaryReadiness(game.frame) };
}

function cue(game) {
  const { route } = game;
  const lobe = route.valves[Math.min(route.lockedCadenceReads, 2)].children.find(x => x.isMesh);
  return { guide: route.guideLine(), action: route.nextAction(),
    color: route.chargeCore.material.color.getHex(),
    emissive: route.chargeCore.material.emissiveIntensity,
    light: route.chargeLight.intensity, scale: route.chargeCore.scale.x,
    lobeX: lobe.position.x, lobeBaseX: lobe.userData.basePosition.x,
    lobeSide: lobe.userData.side, rootVisible: route.root.visible,
    handoff: route.returnHandoffAction() };
}

// Exported solely so a short stdin script can replay this exact fixture against
// the approved Git blob, without writing a baseline copy or helper to the repo.
export function exerciseVascularReadability(Route = VascularRhythmRouteSystem, scenario = 'none') {
  assert.ok(scenarios.includes(scenario));
  const game = createVascularFixture(Route);
  const { route, frame, playerRoot, ledger, tick, atValve } = game;
  const trace = [];
  const checkpoints = {};
  const cues = {};
  const record = label => {
    const snapshot = state(game);
    trace.push(snapshot);
    if (label) { checkpoints[label] = snapshot; cues[label] = cue(game); }
  };
  const step = (input, label, dt) => { tick(input, dt); record(label); };
  if (scenario === 'saturated') route.siltSignalReceiver.membraneLoad = 0.85;
  if (!['none', 'release-revisit'].includes(scenario)) assert.ok(ledger.observeSiltRelease(release(1)));
  if (scenario === 'duplicate-stale') {
    assert.ok(ledger.observeSiltRelease(release(2)));
    assert.equal(ledger.observeSiltRelease(release(2)), null);
    assert.equal(ledger.observeSiltRelease(release(1)), null);
    assert.equal(ledger.observeSiltRelease({ ...release(3), reason: 'region-hidden' }), null);
  }
  step({}, 'arrival');
  // Neutral transit: supplied positions/kinematics, not a controller or physics simulation.
  for (let i = 1; i <= 6; i++) {
    const progress = i * 0.025;
    playerRoot.position.copy(route.entryAnchor).add(route.pathCurve.getPointAt(progress));
    const tangent = route.pathCurve.getTangentAt(progress);
    frame.playerKinematics.velocity = { x: tangent.x * 0.2, y: tangent.y * 0.2, z: tangent.z * 0.2 };
    step({}, i === 6 ? 'transit' : undefined);
  }
  frame.playerKinematics.velocity = { x: 0, y: 0, z: 0 };
  atValve(0);
  // A cadence accent alone cannot establish the current relationship.
  route.beatElapsed = recipe.cadence.secondsPerBeat * 0.75;
  step({}, 'cadence-only');
  step({ pulsePressed: true }, 'unbound');
  assert.equal(route.lockedCadenceReads, 0);
  for (let index = 0; index < 3; index++) {
    atValve(index);
    route.beatElapsed = recipe.cadence.secondsPerBeat * 0.1;
    step({ stabilizeHeld: true }, `brace-${index}`);
    for (let i = 0; i < 3; i++) step({ stabilizeHeld: true });
    assert.equal(route.currentRelationshipReady, true);
    assert.equal(route.pulseWindowOpen(), false);
    record(`ready-${index}`);
    step({ stabilizeHeld: true, pulsePressed: true }, `projection-${index}`);
    assert.equal(route.lockedCadenceReads, index + 1);
    assert.equal(route.lastRelationshipReadBeatAligned, false);
  }
  assert.equal(route.completed, false);
  // Drift causes a real scatter after three reads, without calling a damage helper.
  playerRoot.position.x += 5;
  for (let i = 0; i < 120 && !route.desynchronized; i++) step({});
  assert.equal(route.desynchronized, true);
  record('scatter');
  step({ pulsePressed: true }, 'extra-pulse');
  assert.equal(route.lockedCadenceReads, 3);
  assert.equal(route.postReadPulseIgnoredCount, 1);
  atValve(2);
  step({ stabilizeHeld: true }, 'recovery');
  for (let i = 0; i < 80 && !route.completed; i++) step({ stabilizeHeld: true });
  assert.equal(route.completed, true);
  record('completed');
  playerRoot.position.copy(route.returnPosition);
  step({}, 'hub-return-ready');
  assert.equal(boundaryReadiness(frame).ready, true);
  const retainedLoad = route.siltSignalReceiver.membraneLoad;
  frame.activeCellId = HUB;
  step({}, 'unmounted');
  step({}, 'hidden', 0.25);
  assert.equal(route.siltSignalReceiver.membraneLoad, retainedLoad);
  if (scenario === 'release-revisit') {
    assert.ok(ledger.observeSiltRelease(release(1)));
    step({}, 'hidden-release');
    assert.equal(route.siltSignalReceiver.receivedTotal, 0);
  }
  frame.act1RouteHistory = { vascularReturned: true,
    routeStates: { vascular_route: { returned: true, entryCount: 2 } } };
  frame.activeCellId = CELL;
  step({}, 'qualified-revisit');
  assert.equal(frame.vascularRhythmRoute.returnHandoff.eligible, true);
  // The diagnostic retains historical identity; only a fresh applied effect
  // may restart the visible arrival accent. Do not erase the owner's history.
  assert.equal(route.vis1Applied.arrivalReceiptId !== null, scenario === 'release-revisit');
  atValve(1);
  for (let i = 0; i < 4; i++) step({ stabilizeHeld: true });
  step({ stabilizeHeld: true, pulsePressed: true }, 'handoff-send');
  assert.equal(route.returnHandoff.handoffId, 'vascular:handoff:1');
  for (let i = 0; i < 41; i++) step({});
  atValve(0);
  for (let i = 0; i < 15; i++) step({ stabilizeHeld: true });
  assert.equal(route.returnHandoff.completed, true);
  record('handoff-complete');
  assert.equal(frame.returnRegionCompletionEvent.key, 'vascular:phase_2');
  return { trace, checkpoints, cues };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  test('V01 native readiness follows the owner with labels off, independently of cadence and C2', () => {
    const { checkpoints: s, cues } = exerciseVascularReadability();
    assert.equal(s['cadence-only'].frame.vascularRhythmRoute.pulseWindowOpen, true);
    assert.equal(s['cadence-only'].frame.vascularRhythmRoute.currentRelationshipReady, false);
    assert.equal(cues['cadence-only'].color, recipe.visual.signalColor);
    assert.equal(cues['cadence-only'].emissive, 0.76);
    assert.equal(cues['brace-0'].emissive, 1);
    assert.match(cues['brace-0'].guide, /forming/);
    assert.equal(cues['ready-0'].color, recipe.visual.readyColor);
    assert.equal(cues['ready-0'].emissive, 1.35);
    assert.equal(cues['ready-0'].light, 1.85);
    const opening = c => (c.lobeX - c.lobeBaseX) / (c.lobeSide * 0.18);
    assert.ok(Math.abs(opening(cues['brace-0']) - 0.62) < 1e-12);
    assert.ok(Math.abs(opening(cues['ready-0']) - 1) < 1e-12);
    assert.match(cues['projection-0'].guide, /1\/3 retained/);
    assert.match(cues.scatter.guide, /three current reads are retained/);
    assert.equal(cues.scatter.color, recipe.visual.desyncColor);
    assert.equal(cues.recovery.color, recipe.visual.recoveryColor);
    assert.match(cues.recovery.guide, /reweaves/);
    assert.equal(cues.unmounted.rootVisible, false);
    assert.equal(cues['qualified-revisit'].guide, cues['qualified-revisit'].handoff);
  });

  for (const scenario of scenarios) {
    test(`V01 deterministic ${scenario} trace preserves reads, load, identity, return and Vascular II`, () => {
      const result = exerciseVascularReadability(VascularRhythmRouteSystem, scenario);
      assert.deepEqual(result, exerciseVascularReadability(VascularRhythmRouteSystem, scenario));
      const arrival = result.checkpoints.arrival;
      const expected = ['none', 'release-revisit'].includes(scenario) ? 0 : scenario === 'duplicate-stale' ? 2 : 1;
      assert.equal(arrival.receipts.acceptedTotal, expected);
      assert.equal(arrival.frame.vascularRhythmRoute.siltSignalResponse.receivedTotal, expected);
      assert.equal(arrival.effects.acceptedTotal, scenario === 'saturated' ? 0 : expected);
      assert.equal(arrival.receipts.duplicateTotal, scenario === 'duplicate-stale' ? 2 : 0);
      assert.equal(arrival.receipts.rejectedTotal, scenario === 'duplicate-stale' ? 1 : 0);
      if (expected) {
        assert.equal(arrival.receipts.records[0].id, 'CELL_SILT_PRESSURE_ROUTE_001:silt-trajectory:1');
        assert.equal(arrival.receipts.records[0].subjectId, 'silt-grain-01');
        assert.equal(arrival.receipts.records[0].simulationSeconds, 0.25);
      }
      if (scenario === 'saturated') assert.equal(arrival.frame.vascularRhythmRoute.siltArrivalPresentation, null);
      for (const effect of arrival.effects.records) {
        assert.ok(effect.appliedDelta > 0);
        assert.equal(effect.materialTransfer, false);
        assert.equal(effect.routeCredit, false);
      }
      if (scenario === 'release-revisit') {
        assert.equal(result.checkpoints['hidden-release'].receiverLoad, 0);
        assert.equal(result.checkpoints['qualified-revisit'].effects.acceptedTotal, 1);
        assert.ok(result.checkpoints['qualified-revisit'].receiverLoad > 0);
      }
      assert.equal(result.checkpoints.scatter.frame.vascularRhythmRoute.relationshipReads, 3);
      assert.equal(result.checkpoints['hub-return-ready'].boundary.ready, true);
      assert.equal(result.checkpoints['handoff-complete'].frame.returnRegionCompletionEvent.sequence, 1);
    });
  }

  test('V01 ready permission remains readable during recovery; release and range loss remove it', () => {
    const game = createVascularFixture();
    game.atValve(0);
    // A matched damaged initial state exercises the existing recovery/ready overlap.
    game.route.turbulence = 0.6;
    for (let i = 0; i < 4; i++) game.tick({ stabilizeHeld: true });
    assert.equal(game.route.desynchronized, true);
    assert.equal(game.route.currentRelationshipReady, true);
    assert.equal(cue(game).color, recipe.visual.readyColor);
    assert.match(cue(game).action, /^Pulse while Stabilize is held/);
    game.tick();
    assert.equal(game.route.currentRelationshipReady, false);
    assert.equal(cue(game).color, recipe.visual.desyncColor);
    game.playerRoot.position.x += 5;
    game.tick({ stabilizeHeld: true });
    assert.equal(game.route.stabilizing, false);
    assert.match(cue(game).action, /^Move back inside/);
  });
}