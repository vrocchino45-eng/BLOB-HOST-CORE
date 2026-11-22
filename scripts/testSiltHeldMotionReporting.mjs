import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { buildBoundedSimulationSteps } from '../src/core/BoundedSimulationCatchUp.js';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { WorldObjectCensusSystem } from '../src/debug/WorldObjectCensusSystem.js';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';
import { VascularSiltSignalReceiver } from '../src/routes/VascularSiltSignalReceiver.js';

const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const HOST = 'HOST_ALPHA_WOUNDED_NURSERY';
const recipe = JSON.parse(readFileSync(new URL('../public/data/routes/siltPressureRouteCircuit_HC012A.json', import.meta.url)));
const reservoir = recipe.habitatFoundation.habitats.find(habitat => habitat.id === 'reservoir').center;
const batch = buildBoundedSimulationSteps(0.15).steps;
const step = batch[0];
const stabilize = { stabilizeHeld: true };
const pulse = { ...stabilize, pulsePressed: true, pulseEventId: 2 };
const absorb = { ...stabilize, absorbHeld: true };
const composed = { ...pulse, absorbHeld: true };
const distance = (a, b) => Math.hypot(...a.map((value, axis) => value - b[axis]));
const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`);

function makeSilt(Route = SiltPressureRouteSystem) {
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  const camera = new THREE.PerspectiveCamera();
  const ledger = new HostConnectionReceiptLedger();
  scene.add(playerRoot, camera);
  const frame = {
    frame: 0, runtimeSeconds: 0, activeCellId: SILT, activeHostId: HOST,
    firstSliceRuntimeMount: { activeRuntimeCellId: SILT, mountSequence: 1, activeSystemIds: ['siltPressureRouteSystem'] },
    input: {}, playerComposition: { nutrient: 0.2 }, chemObjectState: { absorbedObjects: 0 }
  };
  const route = new Route({ frameState: frame, scene, playerRoot, camera,
    recipeDataSystem: { data: { siltPressureRouteCircuit: recipe } }, hostConnectionReceiptLedger: ledger,
    flowExperiment: true });
  route.init();
  route.onRuntimeMount(frame);
  const unit = route.livingCycle.units[1];
  const census = new WorldObjectCensusSystem({ scene, frameState: frame });

  function tickStep(input, substep = 0, substepCount = 1) {
    frame.input = input;
    frame.runtimeSimulationSubstepIndex = substep;
    frame.runtimeSimulationSubstepCount = substepCount;
    frame.runtimeSimulationSubstepSeconds = step;
    frame.runtimeSeconds += step;
    route.update(step, frame);
  }

  function tick(input = {}) {
    frame.frame++;
    tickStep(input);
  }

  function place(localPosition) {
    playerRoot.position.copy(route.root.localToWorld(new THREE.Vector3().fromArray(localPosition)));
  }

  function grip(radius, center = reservoir) {
    place(center);
    const position = [center[0] + radius, center[1], center[2]];
    assert.ok(route.siltGrip.tryGrip({ unit, unitPosition: position, corePosition: center,
      stabilizeHeld: true, aPressed: true }));
    assert.ok(route.siltTrajectory.beginHold(unit.id, position));
    route.siltGripLocalOffset.set(radius, 0, 0);
  }

  function mount(cell) {
    frame.activeCellId = cell;
    frame.firstSliceRuntimeMount = { activeRuntimeCellId: cell,
      mountSequence: frame.firstSliceRuntimeMount.mountSequence + 1,
      activeSystemIds: cell === SILT ? ['siltPressureRouteSystem'] : [] };
    if (cell === SILT) route.onRuntimeMount(frame);
    else route.onRuntimeUnmount(frame);
  }

  // Stage an earned absorb flag and two deterministic phase/pose inputs. The
  // production route wakes the stock and owns every subsequent movement.
  route.safeMatterAbsorbed = true;
  tick();
  Object.assign(route.livingCycle.units[0], { phase: 'growing', age: 1 });
  Object.assign(unit, { phase: 'garden_transit', age: 2 });
  tick();
  return { route, frame, ledger, unit, census, playerRoot, camera, tick, tickStep, place, grip, mount };
}

const motion = game => game.frame.siltPressureRoute.heldMaterialMotion.acceptedMotion;
const decisions = game => game.frame.siltPressureRoute.transactionTrace.events;

function observe(game, input, next = () => game.tick(input)) {
  const start = [...game.route.siltGrip.position];
  next();
  const sample = motion(game).current;
  assert.ok(sample);
  const { frame, route, unit } = game;
  const end = frame.siltPressureRoute.siltGrip.position;
  assert.deepEqual(sample.startPosition, start);
  assert.deepEqual(sample.endPosition, end);
  assert.deepEqual(sample.endPosition, route.livingMatterMeshes[1].body.position.toArray());
  assert.equal(sample.unitId, unit.id);
  assert.equal(sample.generation, unit.generation);
  assert.equal(sample.hostId, HOST);
  assert.equal(sample.cellId, SILT);
  assert.equal(sample.mountCount, route.mountCount);
  assert.equal(sample.mountSequence, frame.firstSliceRuntimeMount.mountSequence);
  assert.equal(sample.frame, frame.frame);
  assert.equal(sample.substep, frame.runtimeSimulationSubstepIndex);
  assert.deepEqual(sample.netDisplacement, end.map((value, axis) => value - start[axis]));
  close(sample.netDistance, distance(start, end));
  close(sample.radialDisplacement, distance(end, sample.corePosition) - distance(start, sample.corePosition));
  return sample;
}

// These fixtures move on X. Derive release from accepted travel and the
// independent Pulse term in the existing trajectory rules.
const limitSpeed = speed => THREE.MathUtils.clamp(speed, -2.1, 2.1);
const expectedHeldVelocityX = (sample, prior = 0) => prior * 0.78 + limitSpeed(sample.netDisplacement[0] / step) * 0.22;
function expectedPulseX(sample) {
  if (sample.pulse.braced || sample.pulse.appliedOutward <= 0.001) return 0;
  const offset = THREE.MathUtils.clamp(sample.endPosition[0] - sample.corePosition[0], -1, 1);
  return offset * Math.min(1.35, 0.55 + sample.pulse.appliedOutward * 2.1);
}

function releaseWithExpectedX(game, expected) {
  game.tick({ ...stabilize, interactPressed: true });
  const receipt = game.ledger.snapshot().records.at(-1);
  assert.ok(receipt);
  close(receipt.releaseVelocity[0], limitSpeed(expected), 0.00005 + 1e-9);
  close(receipt.releaseVelocity[1], 0);
  close(receipt.releaseVelocity[2], 0);
  return receipt;
}

test('Pulse and Absorb alone report the accepted pose and their own components', () => {
  for (const [input, outward, inward] of [[pulse, 0.28, 0], [absorb, 0, 0.036]]) {
    const game = makeSilt();
    game.grip(0.9);
    const sample = observe(game, input);
    close(sample.pulse.requestedOutward, outward);
    close(sample.pulse.appliedOutward, outward);
    close(sample.absorb.requestedInward, inward);
    close(sample.absorb.appliedInward, inward);
    close(sample.radialDisplacement, outward - inward);
    const legacy = game.frame.siltPressureRoute.heldMaterialMotion.lastReceipt;
    assert.equal(legacy.verb, outward > 0 ? 'pulse' : 'absorb');
    close(legacy.appliedDisplacement, outward + inward);
    const receipt = releaseWithExpectedX(game, expectedHeldVelocityX(sample) + expectedPulseX(sample));
    assert.ok(outward > 0 ? receipt.releaseVelocity[0] > 0 : receipt.releaseVelocity[0] < 0);
  }
});

test('Matched composed steps agree despite different receipt order and preserve C2 provenance', () => {
  const cases = [
    { before: stabilize, mode: 'current-step', lastVerb: 'absorb' },
    { before: absorb, mode: 'deferred', lastVerb: 'pulse' }
  ];
  const outcomes = [];
  for (const { before, mode, lastVerb } of cases) {
    const game = makeSilt();
    const chemistry = structuredClone(game.frame.chemObjectState);
    const composition = structuredClone(game.frame.playerComposition);
    game.grip(0.38);
    close(observe(game, before).netDistance, 0);
    const sample = observe(game, composed);
    assert.equal(sample.absorb.receiptMode, mode);
    close(sample.pulse.appliedOutward, 0.28);
    close(sample.absorb.appliedInward, 0.036);
    close(sample.radialDisplacement, 0.244);
    assert.equal(game.frame.siltPressureRoute.heldMaterialMotion.lastReceipt.verb, lastVerb);
    const track = game.route.siltTrajectory.held.get(game.unit.id);
    close(track.velocity[0], expectedHeldVelocityX(sample));
    close(track.pulse[0], expectedPulseX(sample));
    const receipt = releaseWithExpectedX(game, expectedHeldVelocityX(sample) + expectedPulseX(sample));
    assert.equal(motion(game).current, null);
    const host = game.ledger.snapshot();
    assert.equal(host.records.length, 1);
    const release = decisions(game).find(decision => decision.kind === 'silt-trajectory');
    assert.equal(receipt.id, `${SILT}:silt-trajectory:6`);
    assert.equal(receipt.sourceReceiptSequence, release.sequence);
    assert.equal(receipt.subjectId, game.unit.id);
    assert.deepEqual(receipt.origin, [1.724, -0.43, -12.2]);
    assert.equal(game.ledger.observeSiltRelease(release), null);
    const vascular = new VascularSiltSignalReceiver();
    assert.equal(vascular.receive(host), 1);
    assert.equal(vascular.receive(host), 0);
    const [effect] = vascular.appliedEffects;
    assert.equal(effect.parentSiltReceiptId, receipt.id);
    assert.equal(effect.parentSiltDecisionSequence, release.sequence);
    close(effect.appliedDelta, 0.14 + 0.055 * Math.min(Math.hypot(...receipt.releaseVelocity) / 2.5, 1));
    assert.ok(game.ledger.observeVascularAppliedEffect(effect));
    assert.equal(game.route.materialIdentity.totalMass(), 8);
    assert.equal(game.unit.generation, sample.generation);
    assert.deepEqual(game.frame.chemObjectState, chemistry);
    assert.deepEqual(game.frame.playerComposition, composition);
    assert.equal(game.frame.siltPressureRoute.gardenSeepExchange.imprint, 0);
    assert.equal(game.route.territoryExpansion.flowPatch.site.imprint, 0);
    outcomes.push({
      pose: [sample.startPosition, sample.endPosition, sample.netDisplacement],
      velocity: receipt.releaseVelocity,
      load: effect.appliedDelta
    });
  }
  assert.deepEqual(outcomes[0].pose, outcomes[1].pose);
  outcomes[0].velocity.forEach((value, axis) => close(value, outcomes[1].velocity[axis]));
  close(outcomes[0].load, outcomes[1].load);
});

test('The outer limit clips the applied Pulse contribution and the composed step resolves inward', () => {
  const game = makeSilt();
  game.grip(1.59);
  const sample = observe(game, composed);
  close(sample.pulse.requestedOutward, 0.28);
  close(sample.pulse.appliedOutward, 0.0099);
  close(sample.absorb.appliedInward, 0.036);
  close(sample.radialDisplacement, -0.0261);
  close(sample.netDistance, 0.0261);
  assert.ok(expectedHeldVelocityX(sample) < 0);
  assert.ok(expectedPulseX(sample) > 0);
  releaseWithExpectedX(game, expectedHeldVelocityX(sample) + expectedPulseX(sample));
});

test('A braced Pulse reports zero accepted movement and retains the separate pressure receipt', () => {
  const game = makeSilt();
  const [x, y, z] = game.route.siltContact.position;
  game.grip(0.9, [x - 0.9, y, z]);
  observe(game, stabilize);
  assert.equal(game.route.siltContact.braced, true);
  const sample = observe(game, pulse);
  assert.equal(sample.pulse.braced, true);
  close(sample.pulse.requestedOutward, 0.28);
  close(sample.pulse.appliedOutward, 0);
  close(sample.netDistance, 0);
  assert.equal(game.frame.siltPressureRoute.heldMaterialMotion.lastReceipt.outcome, 'stabilized-contact-resistance');
  close(game.route.siltContact.pressure, 0.42);
  releaseWithExpectedX(game, 0);
});

test('An RT-off flush preserves the previous receipt and supplies no current pull recipient', () => {
  const game = makeSilt();
  game.grip(0.9);
  observe(game, absorb);
  const deferred = observe(game, absorb);
  assert.equal(deferred.absorb.receiptMode, 'deferred');
  close(deferred.absorb.appliedInward, 0.036);
  assert.equal(game.census.readVerbDelivery(game.frame).absorb.recipients[0].effect, 'held_grain_pull');
  const priorVelocity = game.route.siltTrajectory.held.get(game.unit.id).velocity[0];
  const sample = observe(game, pulse);
  assert.equal(sample.absorb.receiptMode, 'prior-step-flush');
  close(sample.absorb.appliedInward, 0);
  close(sample.radialDisplacement, 0.28);
  const legacy = game.frame.siltPressureRoute.heldMaterialMotion.lastReceipt;
  assert.equal(legacy.verb, 'absorb');
  assert.equal(legacy.receiptReason, 'absorb-ended');
  close(legacy.appliedDisplacement, 0.036);
  const output = game.census.readVerbDelivery(game.frame);
  assert.equal(output.pulse.recipients[0].effect, 'held_grain_push');
  assert.deepEqual(output.absorb.recipients, []);
  assert.deepEqual(game.census.authoritySnapshot().heldMaterialMotion.acceptedMotion.current, sample);
  // The legacy fallback also distinguishes a flush by its existing reason.
  delete game.frame.siltPressureRoute.heldMaterialMotion.acceptedMotion;
  assert.deepEqual(game.census.readVerbDelivery(game.frame).absorb.recipients, []);
  releaseWithExpectedX(game, expectedHeldVelocityX(sample, priorVelocity) + expectedPulseX(sample));
});

test('One rendered frame retains all substeps with unique identities and no recorder duplicates', () => {
  const game = makeSilt();
  game.grip(0.9);
  game.census.captureActive = true;
  game.census.sampleSiltHeldMotion();
  game.frame.frame++;
  const samples = [composed, absorb, stabilize].map((input, index) =>
    observe(game, input, () => game.tickStep(input, index, batch.length)));
  assert.deepEqual(samples.map(sample => sample.substep), [0, 1, 2]);
  assert.deepEqual(samples.map(sample => sample.sequence), [1, 2, 3]);
  assert.ok(samples.every(sample => sample.frame === game.frame.frame));
  assert.equal(samples[2].absorb.receiptMode, 'prior-step-flush');
  close(samples[2].absorb.appliedInward, 0);
  assert.equal(game.census.readVerbDelivery(game.frame).absorb.recipients.length, 1);
  game.tickStep(stabilize, 2, batch.length);
  assert.deepEqual(motion(game).samples, samples);
  game.census.sampleSiltHeldMotion();
  game.census.sampleSiltHeldMotion();
  assert.deepEqual(game.census.captureEvents.filter(event => event.type === 'silt-accepted-held-motion')
    .map(event => event.motion), samples);
});

test('Release, unmount and remount clear the live sample and retain separately identified history', () => {
  const game = makeSilt();
  game.grip(0.9);
  observe(game, absorb);
  const previous = observe(game, absorb);
  game.tick({ ...stabilize, interactPressed: true });
  assert.equal(motion(game).current, null);
  assert.deepEqual(game.census.readVerbDelivery(game.frame).absorb.recipients, []);
  assert.equal(game.ledger.snapshot().records.length, 1);
  const stored = motion(game).samples;
  game.mount(HUB);
  assert.equal(motion(game).current, null);
  assert.deepEqual(motion(game).samples, stored);
  game.mount(SILT);
  assert.equal(motion(game).current, null);
  game.tick();
  assert.equal(motion(game).current, null);
  game.grip(0.9);
  const next = observe(game, absorb);
  assert.equal(next.mountSequence, previous.mountSequence + 2);
  assert.equal(next.sequence, previous.sequence + 1);
  assert.deepEqual(motion(game).samples.slice(0, -1), stored);
});

test('No grip or a rejected pose leaves the accepted-motion trace empty', () => {
  const game = makeSilt();
  game.tick(composed);
  assert.equal(motion(game).current, null);
  assert.deepEqual(motion(game).samples, []);
  game.grip(0.9);
  const before = [...game.route.siltGrip.position];
  game.route.siltGrip.moveTo = () => false;
  game.tick({ ...pulse, pulseEventId: 3 });
  assert.deepEqual(game.route.siltGrip.position, before);
  assert.equal(motion(game).current, null);
  assert.deepEqual(motion(game).samples, []);
  assert.equal(decisions(game).at(-1).outcome, 'grip-rejected-position');
  releaseWithExpectedX(game, 0);
});

test('Accepted acquisition headroom and Core follow appear as motion without verb components', () => {
  const game = makeSilt();
  const { route, playerRoot, camera } = game;
  const body = route.livingMatterMeshes[1].body;
  const original = body.position.toArray();
  const world = route.root.localToWorld(body.position.clone());
  playerRoot.position.copy(world).add(new THREE.Vector3(0, 0, 1.6));
  camera.position.copy(playerRoot.position).add(new THREE.Vector3(0, 0.1, 1));
  camera.lookAt(world);
  game.tick({ ...stabilize, interactPressed: true });
  const acquisition = motion(game).current;
  assert.equal(acquisition.kind, 'grip-acquisition');
  assert.deepEqual(acquisition.startPosition, original);
  assert.deepEqual(acquisition.endPosition, route.siltGrip.position);
  close(acquisition.radialDisplacement, -0.45);
  close(acquisition.netDistance, 0.45);
  close(acquisition.pulse.appliedOutward, 0);
  close(acquisition.absorb.appliedInward, 0);

  playerRoot.position.x += 0.2;
  const follow = observe(game, stabilize);
  close(follow.netDisplacement[0], 0.2);
  close(follow.pulse.appliedOutward, 0);
  close(follow.absorb.appliedInward, 0);
  releaseWithExpectedX(game, expectedHeldVelocityX(follow));
});

test('Batched pulls describe their applied step and the recorder reports a bounded history gap', () => {
  const game = makeSilt();
  game.grip(0.9);
  game.census.captureActive = true;
  game.census.sampleSiltHeldMotion();
  observe(game, absorb);
  const pullWindow = [observe(game, absorb)];
  while (pullWindow.at(-1).absorb.receiptMode === 'deferred' && pullWindow.length < 8) {
    pullWindow.push(observe(game, absorb));
  }
  assert.equal(pullWindow.at(-1).absorb.receiptMode, 'batched');
  close(pullWindow.at(-1).absorb.appliedInward, 0.036);
  const reportedPull = pullWindow.reduce((sum, sample) => sum + sample.absorb.appliedInward, 0);
  close(game.frame.siltPressureRoute.heldMaterialMotion.lastReceipt.appliedDisplacement, reportedPull);
  const priorSequence = motion(game).lastSequence;
  for (let i = 0; i < 64; i++) game.tick(stabilize);
  assert.equal(motion(game).samples.length, 64);
  game.census.sampleSiltHeldMotion();
  const gap = game.census.captureEvents.find(event => event.type === 'silt-accepted-held-motion-gap');
  assert.equal(gap.firstAvailableSequence, priorSequence + 1);
  assert.equal(gap.lastRecordedSequence, 0);
  assert.equal(game.census.captureEvents.filter(event => event.type === 'silt-accepted-held-motion').length, 64);
});

test('At the inner limit a Pulse moves the grain and an Absorb-only step stays still', () => {
  for (const input of [pulse, absorb]) {
    const game = makeSilt();
    game.grip(0.38);
    const sample = observe(game, input);
    close(sample.netDistance, input === pulse ? 0.28 : 0);
    close(sample.absorb.appliedInward, 0);
    releaseWithExpectedX(game, expectedHeldVelocityX(sample) + expectedPulseX(sample));
  }
});

test('A clipped Pulse with zero applied travel differs from opposing components that sum to zero', () => {
  for (const [radius, input, appliedOutward] of [[1.5999, pulse, 0], [1.5999 - 0.036, composed, 0.036]]) {
    const game = makeSilt();
    game.grip(radius);
    const sample = observe(game, input);
    close(sample.netDistance, 0);
    close(sample.pulse.appliedOutward, appliedOutward);
    close(game.route.siltTrajectory.held.get(game.unit.id).pulse[0], expectedPulseX(sample));
    const receipt = releaseWithExpectedX(game, expectedPulseX(sample));
    assert.equal(receipt.releaseVelocity[0] > 0, appliedOutward > 0);
  }
});

test('The physical Pulse cutoff uses the accepted contribution before receipt rounding', () => {
  for (const outward of [0.00096, 0.00104]) {
    const game = makeSilt();
    game.grip(1.5999 - outward);
    const sample = observe(game, pulse);
    close(sample.pulse.appliedOutward, outward);
    assert.equal(game.frame.siltPressureRoute.heldMaterialMotion.lastReceipt.appliedDisplacement, 0.001);
    const track = game.route.siltTrajectory.held.get(game.unit.id);
    close(track.pulse[0], expectedPulseX(sample));
    assert.equal(track.pulse[0] > 0, outward > 0.001);
    releaseWithExpectedX(game, expectedHeldVelocityX(sample) + expectedPulseX(sample));
  }
});

test('Absorb opening a brace preserves the existing brace gate on the release sample', () => {
  const game = makeSilt();
  const [x, y, z] = game.route.siltContact.position;
  game.grip(0.9, [x - 0.9, y, z]);
  observe(game, stabilize);
  assert.equal(game.route.siltContact.braced, true);
  const sample = observe(game, composed);
  assert.equal(game.route.siltContact.braced, false);
  close(sample.radialDisplacement, 0.244);
  close(sample.pulse.appliedOutward, 0.28);
  close(game.route.siltTrajectory.held.get(game.unit.id).pulse[0], 0);
  releaseWithExpectedX(game, expectedHeldVelocityX(sample));
});

test('Matching substeps preserve release through catch-up, and real elapsed steps still decay it', () => {
  const delayed = [];
  for (const grouped of [false, true]) {
    const game = makeSilt();
    game.grip(0.38);
    const inputs = [composed, pulse, stabilize];
    if (grouped) game.frame.frame++;
    const samples = inputs.map((input, index) => observe(game, input, () => {
      if (grouped) game.tickStep(input, index, batch.length);
      else game.tick(input);
    }));
    // The same Pulse ID arriving a second time cannot refresh its memory.
    for (const sample of samples.slice(1)) {
      close(sample.netDistance, 0);
      close(sample.pulse.appliedOutward, 0);
    }
    const [start] = samples;
    const age = step * (inputs.length - 1);
    const track = game.route.siltTrajectory.held.get(game.unit.id);
    close(track.pulseAge, age);
    const carriedVelocity = expectedHeldVelocityX(start) * 0.78 ** (inputs.length - 1);
    const pulseMemory = expectedPulseX(start) * Math.exp(-age * 0.25);
    const receipt = releaseWithExpectedX(game, carriedVelocity + pulseMemory);
    assert.ok(receipt.releaseVelocity[0] < expectedHeldVelocityX(start) + expectedPulseX(start));
    delayed.push(receipt.releaseVelocity);
  }
  delayed[0].forEach((value, axis) => close(value, delayed[1][axis]));
});

test('Core Work interruption and Silt unmount clear the grip without reusing Pulse on reacquisition', () => {
  for (const reason of ['core-work-suspended', 'region-hidden']) {
    const game = makeSilt();
    game.route.siltResistanceExperiment = true;
    game.grip(0.9);
    const pulseSample = observe(game, pulse);
    if (reason === 'core-work-suspended') {
      game.frame.inspectionCamera = { active: true, coreWorkActive: true };
      game.tick();
      delete game.frame.inspectionCamera;
    } else {
      game.mount(HUB);
    }
    assert.equal(game.route.siltGrip.heldId, null);
    assert.equal(motion(game).current, null);
    assert.equal(game.ledger.snapshot().records.length, 0);
    const forced = decisions(game).findLast(decision => decision.kind === 'silt-trajectory');
    assert.equal(forced.reason, reason);
    close(forced.velocity[0], expectedHeldVelocityX(pulseSample) + expectedPulseX(pulseSample), 0.00005 + 1e-9);
    assert.equal(game.route.siltTrajectory.readCurrentReleasePosition(game.unit.id, game.unit.generation, pulseSample.mountCount), null);
    if (reason === 'region-hidden') game.mount(SILT);

    game.grip(0.9);
    const newGrip = observe(game, stabilize);
    close(newGrip.netDistance, 0);
    assert.deepEqual(game.route.siltTrajectory.held.get(game.unit.id).pulse, [0, 0, 0]);
    const receipt = releaseWithExpectedX(game, 0);
    assert.equal(game.ledger.snapshot().records.length, 1);
    assert.equal(receipt.subjectId, game.unit.id);
    assert.equal(newGrip.generation, pulseSample.generation);
    const { siltTrajectory, mountCount } = game.route;
    assert.ok(siltTrajectory.readCurrentReleasePosition(game.unit.id, game.unit.generation, mountCount));
    assert.equal(siltTrajectory.readCurrentReleasePosition(game.unit.id, game.unit.generation + 1, mountCount), null);
  }
});
