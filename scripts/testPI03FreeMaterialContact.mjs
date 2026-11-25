import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import { Vector3 } from 'three';
import { SiltTrajectoryMemory } from '../src/contact/SiltTrajectoryMemory.js';

const recipe = JSON.parse(readFileSync(new URL('../public/data/routes/siltPressureRouteCircuit_HC012A.json', import.meta.url)));
const candidates = recipe.hcCrawlableSurfaceProof.surfaces.filter(site => site.freeMaterialContact);
assert.deepEqual(candidates.map(site => site.id), ['SILT_ENTRY_SEDIMENT_SHELF_D11B']);
const [site] = candidates;
const surface = { id: site.id, center: site.position, radii: site.scale };
const [, y, z] = surface.center;
const entryX = surface.center[0] - surface.radii[0];
const context = { hostId: 'HOST_ALPHA_WOUNDED_NURSERY', cellId: 'CELL_SILT_PRESSURE_ROUTE_001', generation: 4,
  mountCount: 1, mountSequence: 3, frame: 100, substep: 0 };
const id = 'silt-grain-test';
const open = (position, directedPulse = { direction: [1, 0, 0], displacement: 0.28 }) => {
  const owner = new SiltTrajectoryMemory();
  assert.ok(owner.beginHold(id, position));
  assert.ok(owner.release(id, position, { directedPulse, freeContactSource: context }));
  return owner;
};
const advance = (owner, dt, step = context, target = surface.center) => owner.advance(id, dt, target, null, { surface, step });
const impacts = owner => owner.snapshot().freeMaterialContacts ?? [];
const near = (a, b, tolerance = 1e-6) => assert.ok(Math.abs(a - b) <= tolerance, String(a) + ' vs ' + b);
const length = values => Math.hypot(...values);

test('first ingress is delivered to the authored recipient before the intended endpoint', () => {
  const owner = open([entryX - 0.025, y, z]);
  const result = advance(owner, 0.1, context, [entryX + 3, y, z]);
  const [event] = impacts(owner);
  assert.ok(event);
  assert.equal(impacts(owner).length, 1);
  assert.equal(event.receiverId, site.id);
  assert.deepEqual([event.unitId, event.generation, event.frame, event.substep, event.mountSequence], [id, 4, 100, 0, 3]);
  near(event.contactPosition[0], entryX);
  near(event.normal[0], -1);
  near(event.incomingVelocity[0], event.inwardSpeedRemoved);
  near(length(result.velocity), 0);
  assert.equal(event.response, 'accepted-stop-inward');
  assert.ok(event.deduplicationId.includes(site.id));
});

test('swept contact finds low and high speed ingress and rejects a near miss', () => {
  for (const displacement of [0, 0.28]) {
    const owner = open([entryX - 0.005, y, z], { direction: [1, 0, 0], displacement });
    advance(owner, 0.025);
    assert.equal(impacts(owner).length, 1);
    assert.ok(impacts(owner)[0].inwardSpeedRemoved > 0);
  }
  const miss = open([entryX - 0.05, y + surface.radii[1] + 0.002, z]);
  advance(miss, 0.25, context, [entryX + 2, y + surface.radii[1] + 0.002, z]);
  assert.equal(impacts(miss).length, 0);
});

test('split catch-up, repeated overlap and duplicate steps preserve actual pose and emit a single impact', () => {
  const start = [entryX - 0.032, y, z];
  const batched = open(start);
  const split = open(start);
  advance(batched, 0.1);
  const last = { ...context, substep: 3 };
  for (let substep = 0; substep <= 3; substep++) advance(split, 0.025, { ...context, substep });
  const pose = split.get(id);
  advance(split, 0.025, last);
  assert.deepEqual(split.get(id), pose);
  near(batched.get(id).position[0], pose.position[0]);
  near(batched.get(id).velocity[0], pose.velocity[0]);
  assert.equal(impacts(split).length, 1);
  assert.equal(impacts(batched).length, 1);
});

test('same release recontacts after separation and retains history through a fresh mount', () => {
  const owner = open([entryX - 0.01, y, z]);
  advance(owner, 0.05);
  for (let frame = 101; frame < 110; frame++) advance(owner, 0.2, { ...context, frame }, [entryX - 1, y, z]);
  assert.ok(owner.get(id).position[0] < entryX - 0.05);
  const remount = { ...context, mountCount: 2, mountSequence: 5 };
  for (let frame = 110; frame < 130; frame++) advance(owner, 0.2, { ...remount, frame }, [entryX + 1, y, z]);
  const records = impacts(owner);
  assert.equal(records.length, 2);
  assert.equal(records[1].mountSequence, 5);
  assert.equal(records[1].releaseSequence, records[0].releaseSequence);
  assert.notEqual(records[1].deduplicationId, records[0].deduplicationId);
  assert.equal(owner.snapshot().materialTransfer, false);
  assert.equal(owner.snapshot().progressionCredit, false);
  assert.ok(owner.beginHold(id, owner.get(id).position));
  assert.equal(owner.snapshot().reacquisitions, 1);
  assert.equal(advance(owner, 0.1, { ...remount, frame: 130 }), null);
  assert.deepEqual(impacts(owner), records);
});

test('wrong host, cell, generation or stale mount receive no accepted sample', () => {
  for (const wrong of [{ hostId: 'other' }, { cellId: 'other' }, { generation: 5 },
    { frame: 110, mountSequence: 2 }, { frame: 110, mountCount: 0 }]) {
    const owner = open([entryX - 0.01, y, z]);
    advance(owner, 0.1, { ...context, ...wrong });
    assert.equal(impacts(owner).length, 0);
  }
});

test('ordinary release retains its existing trajectory with and without contact capability', () => {
  const start = [entryX - 0.005, y, z];
  const baseline = open(start, null);
  const tested = open(start, null);
  assert.deepEqual(advance(tested, 0.25), baseline.advance(id, 0.25, surface.center));
  assert.equal(impacts(tested).length, 0);
});

const fixture = new URL('./testPI02DirectedSiltLaunch.mjs', import.meta.url);
const [definition] = readFileSync(fixture, 'utf8').split("\ntest('keyboard and standard gamepad launch and retrieve");
const hook = registerHooks({ load(url, ctx, next) {
  return url === fixture.href
    ? { format: 'module', shortCircuit: true, source: definition + '\nexport {prepare,charge,commit,releasePulse,grainMesh,receipts,acquire,tap};' }
    : next(url, ctx);
} });
let rig;
try { rig = await import(fixture.href); } finally { hook.deregister(); }

test('mounted gameplay launches, contacts and retrieves the same conserved grain with no extra credit', t => {
  const { game, unit } = rig.prepare(t, { padMode: true });
  const route = game.route;
  const direction = new Vector3(1, 0, 0);
  const start = new Vector3(entryX - 0.08, y, z);
  game.playerRoot.position.copy(route.root.localToWorld(start.clone().sub(route.siltGripLocalOffset)));
  game.steps(10);
  const before = rig.receipts(game).acceptedTotal;
  const completed = route.completed;
  assert.equal(impacts(route.siltTrajectory).length, 0);
  rig.charge(game, direction);
  assert.ok(route.siltGrip.position[0] < entryX);
  const launch = rig.commit(game);
  const afterLaunch = rig.receipts(game);
  rig.releasePulse(game);
  game.stabilize(false);
  game.steps(42);
  const [impact] = impacts(route.siltTrajectory);
  assert.ok(impact, JSON.stringify({launch, pose: route.siltTrajectory.get(unit.id), start: start.toArray()}));
  assert.equal(impact.unitId, unit.id);
  assert.equal(impact.generation, unit.generation);
  assert.equal(impact.receiverId, site.id);
  assert.equal(route.materialIdentity.totalMass(), 8);
  // Directed release may already qualify for a native C2 receipt; impact cannot add another.
  assert.ok(afterLaunch.acceptedTotal - before <= 1);
  assert.deepEqual(rig.receipts(game), afterLaunch);
  assert.equal(route.completed, completed);
  const after = rig.receipts(game).acceptedTotal;
  game.mount('CELL_SIGNAL_CHORUS_NERVE_001');
  game.step();
  const outside = route.siltTrajectory.get(unit.id);
  game.steps(5);
  assert.deepEqual(route.siltTrajectory.get(unit.id), outside);
  game.mount(context.cellId);
  game.step();
  assert.equal(impacts(route.siltTrajectory)[0].deduplicationId, impact.deduplicationId);
  assert.equal(route.materialIdentity.totalMass(), 8);
  rig.acquire(game, unit);
  assert.equal(route.materialIdentity.get(unit.id).owner, 'grip');
  assert.equal(rig.receipts(game).acceptedTotal, after);
  assert.equal(route.materialIdentity.totalMass(), 8);
});


test('the canonically selected Shelf does not override intervening sediment contact', t => {
  const { game, unit } = rig.prepare(t, { padMode: true, flowExperiment: true });
  const route = game.route;
  // Grip the living grain from the reverse side through the same LT+A owner.
  rig.tap(game, 'interact');
  assert.equal(route.siltGrip.heldId, null);
  const towardGrain = new Vector3(0.30, 0, 0.69);
  for (let attempt = 0; attempt < 35 && route.siltGrip.heldId !== unit.id; attempt++) {
    const grain = rig.grainMesh(game, unit).position;
    game.playerRoot.position.copy(route.root.localToWorld(grain.clone().sub(towardGrain)));
    game.aimAt(grain.toArray());
    game.step();
    if (game.frame.siltMaterialAim.candidateId === unit.id) rig.tap(game, 'interact');
  }
  assert.equal(route.siltGrip.heldId, unit.id);
  assert.ok(route.siltGripLocalOffset.z > 0.50);

  const shelf = route.territoryExpansion.readFlowPatch(game.frame);
  const destination = route.root.worldToLocal(shelf.center.clone());
  const measuredApproach = new Vector3(-1.10, -0.75, -2.30);
  game.playerRoot.position.copy(route.root.localToWorld(measuredApproach));
  assert.ok(game.playerRoot.position.distanceTo(shelf.center) < 3.2);
  game.aimAt(destination.toArray());
  game.steps(24);
  assert.equal(game.frame.targeting.targetId, 'silt_porosity_shelf',
    JSON.stringify({ player: measuredApproach, destination, target: game.frame.targeting.targetId }));
  const progress = [route.completed, route.pressureRead, route.ribsReleased, route.safeMatterAbsorbed];
  const chemistry = structuredClone(game.frame.chemObjectState);
  const imprint = route.territoryExpansion.flowPatch.site.imprint;
  assert.equal(route.siltPlateSeat.unitId, null);
  game.pulse(true);
  game.steps(48);
  const launch = rig.commit(game);
  const ledger = rig.receipts(game);
  assert.equal(launch.intendedTargetId, 'silt_porosity_shelf');
  assert.equal(launch.actualRecipientId, null);
  assert.equal(game.frame.targeting.targetId, 'silt_porosity_shelf');
  assert.equal(route.siltPlateSeat.unitId, null);
  rig.releasePulse(game);

  let delivered;
  for (let i = 0; i < 100 && !delivered; i++) {
    game.step();
    assert.equal(game.frame.coreFlow?.result ?? null, null);
    delivered = impacts(route.siltTrajectory)[0];
  }
  assert.ok(delivered, JSON.stringify({ launch, position: route.siltTrajectory.get(unit.id), heldOffset: route.siltGripLocalOffset }));
  assert.equal(game.frame.targeting.targetId, 'silt_porosity_shelf');
  assert.equal(delivered.receiverId, site.id);
  assert.equal(delivered.unitId, unit.id);
  const impactPoint = new Vector3().fromArray(delivered.contactPosition);
  const beforeDestination = impactPoint.clone().sub(new Vector3().fromArray(launch.releasePosition));
  const launchUnit = new Vector3().fromArray(launch.releaseDirection);
  assert.ok(beforeDestination.dot(launchUnit) > 0);
  assert.ok(beforeDestination.dot(launchUnit) < destination.clone().sub(new Vector3().fromArray(launch.releasePosition)).dot(launchUnit));
  near(new Vector3().fromArray(delivered.incomingVelocity).dot(new Vector3().fromArray(delivered.normal)), -delivered.inwardSpeedRemoved);
  assert.deepEqual(rig.receipts(game), ledger);
  assert.deepEqual([route.completed, route.pressureRead, route.ribsReleased, route.safeMatterAbsorbed], progress);
  assert.deepEqual(game.frame.chemObjectState, chemistry);
  assert.equal(route.territoryExpansion.flowPatch.site.imprint, imprint);
  assert.equal(route.siltPlateSeat.unitId, null);
  assert.equal(route.materialIdentity.totalMass(), 8);
  console.log(JSON.stringify({ canonicalSelection: game.frame.targeting.targetId,
    coreToShelf: game.playerRoot.position.distanceTo(shelf.center), launch, delivered, downstreamEndpoint: destination.toArray(),
    ledgerTotal: ledger.acceptedTotal, mass: route.materialIdentity.totalMass() }));
});

test('oblique ingress removes inward speed and preserves the accepted tangent', () => {
  const heading = new Vector3(1, 0.18, 0.25).normalize();
  const owner = open([entryX - 0.005, y, z], { direction: heading.toArray(), displacement: 0.28 });
  const result = advance(owner, 0.025);
  const [event] = impacts(owner);
  assert.ok(event);
  const normal = new Vector3().fromArray(event.normal);
  const incoming = new Vector3().fromArray(event.incomingVelocity);
  const applied = new Vector3().fromArray(result.velocity);
  const tangent = incoming.clone().addScaledVector(normal, event.inwardSpeedRemoved);
  assert.ok(tangent.length() > 0.15);
  near(applied.dot(normal), 0, 1e-10);
  near(applied.distanceTo(tangent), 0, 1e-10);
});

