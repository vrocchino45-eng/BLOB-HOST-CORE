import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { buildBoundedSimulationSteps } from '../src/core/BoundedSimulationCatchUp.js';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { LocalCellBoundaryMorphSystem } from '../src/morph/LocalCellBoundaryMorphSystem.js';
import { LOCAL_CELL_BOUNDARY_RECIPES_HC016G } from '../src/morph/LocalCellBoundaryRecipeRegistry.js';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';

const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const recipe = JSON.parse(readFileSync('public/data/routes/siltPressureRouteCircuit_HC012A.json'));
const catchUp = 0.15;
const step = buildBoundedSimulationSteps(catchUp).steps[0];
const distance = (a, b) => Math.hypot(...a.map((value, index) => value - b[index]));
const speed = track => Math.hypot(...track.velocity);

function makeSilt(options = {}, Route = SiltPressureRouteSystem) {
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  const camera = new THREE.PerspectiveCamera();
  const ledger = new HostConnectionReceiptLedger();
  scene.add(playerRoot, camera);
  const frame = {
    frame: 0, runtimeSeconds: 0, activeCellId: SILT, activeHostId: 'HOST_ALPHA_WOUNDED_NURSERY',
    firstSliceRuntimeMount: { activeRuntimeCellId: SILT, mountSequence: 1, activeSystemIds: ['siltPressureRouteSystem'] },
    input: {}, playerComposition: { nutrient: 0.2 }, chemObjectState: { absorbedObjects: 0 }
  };
  const route = new Route({ ...options, flowExperiment: true, camera, scene, playerRoot,
    frameState: frame, hostConnectionReceiptLedger: ledger, recipeDataSystem: { data: { siltPressureRouteCircuit: recipe } } });
  route.init();
  route.onRuntimeMount(frame);

  function tick(input = {}, delta = step) {
    const batch = buildBoundedSimulationSteps(delta);
    frame.frame++;
    frame.input = input;
    frame.runtimeSimulationSubstepCount = batch.substepCount;
    for (const [index, dt] of batch.steps.entries()) {
      frame.runtimeSimulationSubstepIndex = index;
      frame.runtimeSimulationSubstepSeconds = dt;
      frame.runtimeSeconds += dt;
      route.update(dt, frame);
    }
  }

  function mount(cell) {
    frame.activeCellId = cell;
    frame.firstSliceRuntimeMount = { activeRuntimeCellId: cell,
      mountSequence: frame.firstSliceRuntimeMount.mountSequence + 1,
      activeSystemIds: cell === SILT ? ['siltPressureRouteSystem'] : [] };
    if (cell === SILT) route.onRuntimeMount(frame);
    else route.onRuntimeUnmount(frame);
  }

  return { route, frame, tick, mount, ledger, playerRoot, units: route.livingCycle.units };
}

function stageGarden(game, phase = 'mature') {
  // Preserve the normal awake transition, then stage precise phases to
  // isolate spatial and lifecycle guards from unrelated release times.
  game.route.safeMatterAbsorbed = true;
  game.tick();
  Object.assign(game.units[0], { phase, age: 1 });
  Object.assign(game.units[1], { phase: 'garden_transit', age: 2 });
  game.tick();
  return game;
}

function positionOf(game, index) {
  return game.route.livingMatterMeshes[index].body.position.toArray();
}

function hold(game, index, position, coreOffset = 0) {
  const { route, units, playerRoot } = game;
  const core = [position[0] - coreOffset, position[1], position[2]];
  playerRoot.position.copy(route.root.localToWorld(new THREE.Vector3().fromArray(core)));
  const unit = units[index];
  assert.ok(route.siltGrip.tryGrip({ unit, unitPosition: position, corePosition: core,
    stabilizeHeld: true, aPressed: true }));
  assert.ok(route.siltTrajectory.beginHold(unit.id, position));
  route.siltGripLocalOffset.set(coreOffset, 0, 0);
  // Use the holder's existing accepted Pulse motion sample to seed a
  // controlled release heading. The production route records the release.
  route.siltTrajectory.sampleHeld(unit.id, position, step,
    { pulseDirection: [1, 0, 0], pulseDisplacement: 0.28 });
}

function release(game, offset = 0, index = 1) {
  const center = positionOf(game, 0);
  hold(game, index, [center[0] + offset, center[1], center[2]], 0.9);
  game.tick({ interactPressed: true, stabilizeHeld: true });
  assert.ok(game.route.siltTrajectory.has(game.units[index].id));
}

function track(game, index = 1) {
  return game.route.siltTrajectory.get(game.units[index].id);
}

function protectedState({ route, frame, ledger }) {
  const { completed, returnFoldReady, safeMatterAbsorbed, ribsReleased } = frame.siltPressureRoute;
  return {
    phaseAndAge: route.livingCycle.snapshot(),
    material: route.materialIdentity.snapshot(),
    receipts: ledger.snapshot(),
    garden: frame.siltPressureRoute.gardenSeepExchange,
    shelf: route.territoryExpansion.flowPatch.site.imprint,
    progression: { completed, returnFoldReady, safeMatterAbsorbed, ribsReleased },
    chemistry: frame.chemObjectState
  };
}

test('The default and explicit disabled routes produce identical positions and state', () => {
  const defaultGame = stageGarden(makeSilt());
  const disabled = stageGarden(makeSilt({ siltResistanceExperiment: false }));
  for (const game of [defaultGame, disabled]) release(game);
  for (let i = 0; i < 60; i++) {
    defaultGame.tick();
    disabled.tick();
    assert.deepEqual(track(defaultGame), track(disabled));
    assert.deepEqual(defaultGame.units.map((_, j) => positionOf(defaultGame, j)),
      disabled.units.map((_, j) => positionOf(disabled, j)));
  }
  assert.equal(defaultGame.route.selectSiltBudResistance(defaultGame.frame), null);
  assert.deepEqual(protectedState(defaultGame), protectedState(disabled));
});

test('A mature bud reduces speed with distance falloff and never reverses the increment', () => {
  const measured = [];
  for (const offset of [0, 0.6, 0.86]) {
    const control = stageGarden(makeSilt());
    const enabled = stageGarden(makeSilt({ siltResistanceExperiment: true }));
    for (const game of [control, enabled]) release(game, offset);
    const baseline = track(control), resisted = track(enabled);
    const dot = baseline.velocity.reduce((sum, value, i) => sum + value * resisted.velocity[i], 0);
    assert.ok(dot / (speed(baseline) * speed(resisted)) > 0.999);
    const reduction = 1 - speed(resisted) / speed(baseline);
    assert.ok(reduction >= 0 && reduction <= 1 - Math.exp(-0.28 * step) + 1e-8);
    measured.push(reduction);
    if (offset === 0.86) assert.deepEqual(baseline, resisted);
    assert.deepEqual(protectedState(enabled), protectedState(control));
    assert.equal(enabled.ledger.snapshot().records.length, 1);
    assert.equal(enabled.route.materialIdentity.totalMass(), 8);
  }
  assert.ok(measured[0] > measured[1] && measured[1] > measured[2]);
});

test('Native maturation supports resistance after the earned route and preserves the actual Hub crossing', () => {
  const exit = LOCAL_CELL_BOUNDARY_RECIPES_HC016G.find(recipe => recipe.id === 'silt_to_hub');
  const results = [];
  for (const enabled of [false, true]) {
    const game = makeSilt({ siltResistanceExperiment: enabled });
    const { route, frame, playerRoot, tick } = game;
    playerRoot.position.copy(route.ribGroups[0].getWorldPosition(new THREE.Vector3()));
    for (let i = 0; i < 60; i++) tick({ stabilizeHeld: true });
    tick({ stabilizeHeld: true, pulsePressed: true, pulseEventId: 1 });
    for (let i = 0; i < 160 && !route.ribsReleased; i++) tick({ stabilizeHeld: true, pulseEventId: 1 });
    assert.ok(route.ribsReleased);
    playerRoot.position.copy(route.safePacket.getWorldPosition(new THREE.Vector3()));
    for (let i = 0; i < 160 && !route.safeMatterAbsorbed; i++) tick({ absorbHeld: true, pulseEventId: 1 });
    assert.ok(route.livingCycle.active);
    playerRoot.position.copy(route.pathCurve.getPointAt(0.9)).add(route.entryAnchor);
    for (let i = 0; i < 160 && !route.completed; i++) tick({ pulseEventId: 1 });
    assert.ok(route.completed && route.returnFoldReady);
    for (let i = 0; game.units[0].phase !== 'mature' && i < 400; i++) tick({}, catchUp);
    assert.equal(game.units[0].phase, 'mature');
    const index = game.units.findIndex(unit => ['veins', 'garden_transit', 'settled'].includes(unit.phase));
    assert.ok(index > 0);
    release(game, 0, index);
    const selected = route.selectSiltBudResistance(frame);
    assert.equal(selected?.receiverId, enabled ? game.units[index].id : undefined);
    assert.ok(frame.siltPressureRoute.gardenSeepExchange.imprint > 0);

    const boundary = new LocalCellBoundaryMorphSystem({ playerRoot, frameState: frame, recipes: [exit] });
    boundary.init();
    tick();
    boundary.update(step, frame);
    assert.equal(frame.localCellBoundaryMorphById[exit.id].proximityReturnGuard.armed, true);
    playerRoot.position.copy(route.returnPosition);
    tick();
    boundary.update(step, frame);
    assert.equal(boundary.activeRecipeId, exit.id);
    boundary.update(exit.durationSeconds, frame);
    assert.equal(frame.activeCellId, HUB);
    results.push({ history: frame.act1RouteHistory, state: protectedState(game) });
  }
  assert.deepEqual(results[0], results[1]);
});

test('Growing, recycled, dormant and no-longer-owned sources do not slow another grain', () => {
  for (const phase of ['growing', 'reservoir', 'dormant', 'missing identity']) {
    const control = stageGarden(makeSilt(), phase === 'missing identity' || phase === 'dormant' ? 'mature' : phase);
    const enabled = stageGarden(makeSilt({ siltResistanceExperiment: true }),
      phase === 'missing identity' || phase === 'dormant' ? 'mature' : phase);
    for (const game of [control, enabled]) {
      if (phase === 'reservoir') game.units[0].generation++;
      if (phase === 'missing identity') {
        // Bypass the pair selection only when the source lacks its ledger identity.
        game.route.materialIdentity.records.delete(game.units[0].id);
      }
      release(game);
      if (phase === 'dormant') game.route.livingCycle.active = false;
    }
    assert.equal(enabled.route.selectSiltBudResistance(enabled.frame), null, phase);
    if (phase !== 'dormant') assert.deepEqual(track(enabled), track(control), phase);
  }
  const dormant = makeSilt({ siltResistanceExperiment: true });
  for (let i = 0; i < 240; i++) dormant.tick({}, catchUp);
  assert.equal(dormant.route.livingCycle.active, false);
  assert.equal(dormant.route.selectSiltBudResistance(dormant.frame), null);
});

test('Only one eligible free receiver is selected in stable grain identity order', () => {
  const game = stageGarden(makeSilt({ siltResistanceExperiment: true }));
  const { route, units } = game;
  const center = positionOf(game, 0);
  const releaseContext = { generation: 0, mountCount: route.mountCount };
  for (const index of [2, 1]) {
    assert.ok(route.siltTrajectory.beginHold(units[index].id, center));
    assert.ok(route.siltTrajectory.release(units[index].id, center, { releaseContext }));
  }
  assert.equal(route.selectSiltBudResistance(game.frame)?.receiverId, units[1].id);
  units[1].generation++;
  assert.equal(route.selectSiltBudResistance(game.frame)?.receiverId, units[2].id);
  assert.ok(route.siltPlateSeat.trySeat({ unitId: units[2].id, heldPosition: center,
    isBraced: true, imprinted: true, actuallyTouching: true }));
  assert.equal(route.selectSiltBudResistance(game.frame), null);
  const seated = track(game, 2);
  game.tick();
  assert.deepEqual(track(game, 2), seated);
});

test('Held material and the pending return-goal grain are excluded from B3', () => {
  const game = stageGarden(makeSilt({ siltResistanceExperiment: true }));
  const { route, units, frame } = game;
  route.completed = true;
  route.returnFoldReady = true;
  frame.act1RouteHistory = { siltReturned: true, routeStates: { silt_burrow_route: { entryCount: 2 } } };
  hold(game, 1, positionOf(game, 0), 0.9);
  assert.equal(route.selectSiltBudResistance(frame), null);
  game.tick({ stabilizeHeld: true });
  assert.equal(route.siltGrip.heldId, units[1].id);
  assert.equal(track(game), null);
  route.returnRoundTrip.grainId = units[1].id;
  route.returnRoundTrip.stage = 'extracted';
  game.tick({ stabilizeHeld: true, interactPressed: true });
  assert.equal(route.returnRoundTrip.active, true);
  assert.equal(route.returnRoundTrip.stage, 'released_pending_native');
  assert.equal(route.selectSiltBudResistance(frame), null);
  assert.ok(track(game));
  assert.equal(frame.siltPressureRoute.completed, true);
  assert.equal(frame.siltPressureRoute.returnFoldReady, true);
});

test('Native circulation and a verified B1 arrival are identical with the flag enabled', () => {
  const a = stageGarden(makeSilt());
  const b = stageGarden(makeSilt({ siltResistanceExperiment: true }));
  for (const game of [a, b]) {
    game.units[1].age = 7.91;
    game.tick();
    assert.equal(game.route.selectSiltBudResistance(game.frame), null);
    game.tick();
    assert.equal(game.units[1].phase, 'settled');
    assert.equal(game.frame.siltPressureRoute.gardenSeepExchange.imprint, 0.125);
  }
  assert.deepEqual(positionOf(b, 1), positionOf(a, 1));
  assert.deepEqual(protectedState(b), protectedState(a));
});

test('Removing the source mesh from the scene leaves the full resistance trace identical', () => {
  const visible = stageGarden(makeSilt({ siltResistanceExperiment: true }));
  const hidden = stageGarden(makeSilt({ siltResistanceExperiment: true }));
  const source = hidden.route.livingMatterMeshes[0];
  source.body.remove(source.bud);
  // A render-only displacement must not move the resolved bud source.
  source.body.position.set(80, 80, 80);
  const center = positionOf(visible, 0);
  for (const game of [visible, hidden]) {
    hold(game, 1, center, 0.9);
    game.tick({ stabilizeHeld: true, interactPressed: true });
  }
  for (let i = 0; i < 20; i++) {
    assert.deepEqual(track(hidden), track(visible));
    hidden.tick();
    visible.tick();
  }
});

test('Fixed steps and runtime catch-up agree while the free grain crosses the resistance zone', () => {
  const fixed = stageGarden(makeSilt({ siltResistanceExperiment: true }));
  const batched = stageGarden(makeSilt({ siltResistanceExperiment: true }));
  for (const game of [fixed, batched]) release(game, -0.6);
  let stepsInRange = 0;
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 3; j++) {
      if (fixed.route.selectSiltBudResistance(fixed.frame)) stepsInRange++;
      fixed.tick();
    }
    batched.tick({}, catchUp);
    assert.deepEqual(track(fixed), track(batched));
    assert.deepEqual(fixed.route.livingCycle.snapshot(), batched.route.livingCycle.snapshot());
  }
  assert.ok(stepsInRange > 3 && stepsInRange < 36);
});

test('The grain exits without stopping and its ordinary recovery resumes immediately', () => {
  const enabled = stageGarden(makeSilt({ siltResistanceExperiment: true }));
  const switchOff = stageGarden(makeSilt({ siltResistanceExperiment: true }));
  for (const game of [enabled, switchOff]) release(game, -0.65);
  const center = positionOf(enabled, 0);
  let ticks = 0;
  while (distance(track(enabled).position, center) < 0.85 && ticks++ < 60) {
    assert.ok(track(enabled).velocity[0] > 0);
    enabled.tick();
    switchOff.tick();
  }
  assert.ok(ticks > 1 && ticks < 60 && distance(track(enabled).position, center) >= 0.85);
  switchOff.route.siltResistanceExperiment = false;
  for (let i = 0; i < 15; i++) {
    enabled.tick();
    switchOff.tick();
    assert.deepEqual(track(enabled), track(switchOff));
  }
});

test('Unmount pauses trajectories and an old release cannot supply the new mount', () => {
  const game = stageGarden(makeSilt({ siltResistanceExperiment: true }));
  release(game);
  const { route, frame } = game;
  assert.ok(route.selectSiltBudResistance(frame));
  const before = track(game);
  game.mount(HUB);
  assert.equal(route.selectSiltBudResistance(frame), null);
  for (let i = 0; i < 80; i++) game.tick({}, catchUp);
  assert.deepEqual(track(game), before);
  game.mount(SILT);
  assert.equal(route.selectSiltBudResistance(frame), null);
  game.tick();
  assert.notDeepEqual(track(game), before);
});
