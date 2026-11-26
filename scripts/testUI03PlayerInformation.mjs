import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import { Vector3 } from 'three';
import { currentPlayerInformation, projectPlayerInformation } from '../src/ui/PlayerInformationModel.js';

const HOST = 'HOST_ALPHA_WOUNDED_NURSERY';
const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const fixture = new URL('./testPI02DirectedSiltLaunch.mjs', import.meta.url);
const code = readFileSync(fixture, 'utf8');
const hudBinding = 'coreFlowSystem: flow, flowExperiment';
assert.ok(code.includes(hudBinding));
const end = code.indexOf("\ntest('keyboard and standard gamepad launch and retrieve");
assert.ok(end > 0);
const hook = registerHooks({ load(url, context, next) {
  return url === fixture.href ? { format: 'module', shortCircuit: true,
    source: "import {PlaytestHudSystem} from '../src/ui/PlaytestHudSystem.js';\n" + code.slice(0, end).replace(hudBinding,
      hudBinding + ', playtestHudSystem: {update: PlaytestHudSystem.prototype.update}')
      + '\nexport {makeGame,prepare,charge,commit,releasePulse,acquire};' } : next(url, context);
} });
let rig;
try { rig = await import(fixture.href); } finally { hook.deregister(); }

test('projection preserves owner bytes and separates unconfirmed candidates and retained history', () => {
  const step = { hostId: HOST, cellId: SILT, mountSequence: 2, frame: 40, substep: 1 };
  const stale = { ...step, mountSequence: 1, frame: 39, owner: 'silt:RegionalTerritoryExpansion',
    targetId: 'silt_porosity_shelf', receiverId: 'silt_porosity_shelf_front', actionSequence: 1,
    acceptedCurrent01: 0.4, pressure01: 0.2, resistance01: 0.3, after: { imprint: 0.1 } };
  const input = { stabilizeHeld: true, flowDemand01: 0.4 };
  const frame = {
    activeHostId: HOST, activeCellId: SILT, input, frame: 40, runtimeSimulationSubstepIndex: 1,
    firstSliceRuntimeMount: { mountSequence: 2, activeRuntimeCellId: SILT, activeSystemIds: ['targetingSystem'] },
    runtimeExecution: { frame: 40, executedSystemIds: ['targetingSystem','coreFlowSystem'] },
    targeting: { active: true, targetId: 'silt_porosity_shelf', candidateId: 'silt_porosity_shelf' },
    coreFlow: { step, contactValid: true, ready: true, phase: 'contact', demand01: 0.4,
      reason: 'contact', actionSequence: 1, result: stale, lastResult: stale },
    corePerformance: { endurance: { reservePercent: 0, reserve01: 0 }, traits: { stability: 1.1 } },
    spatialCoreChemistry: { placements: [{ pieceId: 'grip', zoneId: 'deep_core', family: 'silt' }] }
  };
  const baseline = structuredClone(frame);
  const info = projectPlayerInformation(frame);
  assert.deepEqual(frame, baseline);
  assert.equal(info.target, null);
  assert.equal(info.eligibility.flow.geometricContact, true);
  assert.equal(info.accepted.flow, null);
  assert.equal(info.history.lastFlowDelivery.step.mountSequence, 1);
  assert.equal(info.history.lastFlowDelivery.retainedImprintAfter, 0.1);
  assert.equal(info.core.reservePercent, 0);
  assert.throws(() => { info.core.placements[0].zone = 'membrane'; }, TypeError);
  assert.throws(() => { info.history.lastFlowDelivery.step.frame = 40; }, TypeError);
  frame.playerInformation = info;
  assert.equal(currentPlayerInformation(frame), info);
  frame.runtimeSimulationSubstepIndex++;
  assert.equal(currentPlayerInformation(frame), null);
});

test('ordinary RT remains Absorb and the Flow publication stays absent', t => {
  const game = rig.makeGame(t, { padMode: true });
  game.absorb(0.74);
  game.step();
  const model = currentPlayerInformation(game.frame);
  assert.equal(model.intent.absorb, true);
  assert.equal(model.intent.flowDemand01, 0);
  assert.equal(model.eligibility.flow, null);
  assert.equal(model.accepted.flow, null);
  assert.equal(model.context.mode, 'world');
});

test('real Flow publishes only the current receiver-confirmed sample and retains its history', t => {
  const game = rig.makeGame(t, { padMode: true, flowExperiment: true });
  const patch = game.route.territoryExpansion.readFlowPatch(game.frame);
  game.playerRoot.position.copy(patch.center).add(new Vector3(0, 0, 1.18));
  game.aimAt(game.route.root.worldToLocal(patch.center.clone()).toArray());
  game.stabilize(true);
  game.steps(22);
  assert.equal(game.frame.playerInformation.target.id, 'silt_porosity_shelf');
  assert.equal(game.frame.playerInformation.accepted.flow, null);
  game.absorb(0.65);
  game.steps(40);
  const model = game.frame.playerInformation;
  assert.ok(game.frame.coreFlow.result?.acceptedCurrent01 > 0, game.frame.coreFlow.reason);
  assert.equal(model.accepted.flow.actualRecipient, patch.id);
  assert.equal(model.accepted.flow.current01, game.frame.coreFlow.result.acceptedCurrent01);
  assert.equal(model.accepted.flow.pressure01, game.frame.coreFlow.result.pressure01);
  assert.deepEqual(model.accepted.flow.step, model.context.step);
  game.absorb(0);
  game.step();
  assert.equal(game.frame.playerInformation.accepted.flow, null);
  assert.ok(game.frame.playerInformation.history.lastFlowDelivery.current01 > 0);
  game.frame.statusPage = { open: true };
  game.step();
  assert.equal(game.frame.playerInformation.context.mode, 'menu');
  assert.equal(game.frame.playerInformation.target, null);
  assert.equal(game.frame.playerInformation.accepted.flow, null);
});

test('material acquisition, launch, actual contact, remount and retrieval keep their distinct truth', t => {
  const { game, unit } = rig.prepare(t, { padMode: true });
  const info = () => currentPlayerInformation(game.frame);
  assert.equal(info().heldMaterial.id, unit.id);
  game.step();
  assert.equal(info().heldMaterial.generation, unit.generation);
  const site = game.route.freeMaterialSurface;
  const start = new Vector3().fromArray(site.center);
  start.x -= site.radii[0] + 0.08;
  const route = game.route;
  game.playerRoot.position.copy(route.root.localToWorld(start.sub(route.siltGripLocalOffset)));
  game.steps(10);
  rig.charge(game, new Vector3(1, 0, 0));
  const launch = rig.commit(game);
  assert.equal(info().attempted.launch, true);
  assert.equal(info().heldMaterial, null);
  assert.equal(info().accepted.launch.grain, unit.id);
  assert.equal(info().accepted.launch.actualRecipient, null);
  assert.equal(info().accepted.launch.sequence, launch.chargeSequence);
  rig.releasePulse(game);
  game.stabilize(false);
  assert.equal(info().accepted.launch, null);
  let observed;
  for (let i = 0; i < 60 && !observed; i++) {
    game.step();
    observed = info().accepted.freeMaterial[0];
  }
  assert.equal(observed?.actualRecipient, site.id);
  assert.equal(observed.grain, unit.id);
  assert.deepEqual(observed.step, info().context.step);
  game.step(1 / 60, 0, 2);
  game.step(1 / 60, 1, 2);
  for (const contact of info().accepted.freeMaterial) {
    assert.notEqual(contact.id, observed.id);
    assert.deepEqual(contact.step, info().context.step);
  }
  const retainedId = info().history.lastFreeMaterialContact.id;
  game.mount(HUB);
  game.step();
  assert.equal(info().heldMaterial, null);
  assert.equal(info().accepted.freeMaterial.length, 0);
  assert.equal(info().history.lastFreeMaterialContact.id, retainedId);
  game.mount(SILT);
  game.step();
  for (const contact of info().accepted.freeMaterial) {
    assert.notEqual(contact.id, retainedId);
    assert.deepEqual(contact.step, info().context.step);
    assert.ok(contact.step.mountSequence > observed.step.mountSequence);
  }
  rig.acquire(game, unit);
  assert.equal(info().heldMaterial.id, unit.id);
  assert.equal(route.materialIdentity.totalMass(), 8);
});

test('inspection and Core Work suppress live world information while retaining layout', t => {
  const game = rig.makeGame(t, { padMode: true, flowExperiment: true });
  game.frame.spatialCoreChemistry = { topology: { id: 'three_way_balance', distribution: '1:1:1' },
    placements: [{ pieceId: 'test-memory', family: 'grave_memory_retention', zoneId: 'deep_core' }] };
  game.frame.inspectionCamera = { active: true, coreWorkActive: false };
  game.step();
  assert.equal(game.frame.playerInformation.context.mode, 'inspection');
  game.frame.inspectionCamera.coreWorkActive = true;
  game.frame.coreWorkManipulation = { selectedPieceId: 'test-memory' };
  game.step();
  const info = game.frame.playerInformation;
  assert.equal(info.context.mode, 'core_work');
  assert.equal(info.core.distribution, '1:1:1');
  assert.equal(info.core.selectedPiece, 'test-memory');
  assert.equal(info.target, null);
  assert.equal(info.heldMaterial, null);
  assert.equal(info.accepted.flow, null);
});
