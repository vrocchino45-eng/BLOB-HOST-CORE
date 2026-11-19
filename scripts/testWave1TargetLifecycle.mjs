import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { Group, PerspectiveCamera, Scene } from 'three';
import { BondSystem } from '../src/chemistry/BondSystem.js';
import { ChemObjectSystem } from '../src/chemistry/ChemObjectSystem.js';
import { SystemRegistry } from '../src/core/SystemRegistry.js';
import { WorldObjectCensusSystem } from '../src/debug/WorldObjectCensusSystem.js';
import { ReactiveStateGrammarSystem } from '../src/interaction/ReactiveStateGrammarSystem.js';
import { VerbCompositionSystem } from '../src/interaction/VerbCompositionSystem.js';
import { ModeController } from '../src/modes/ModeController.js';
import { CoreEngineSystem } from '../src/player/CoreEngineSystem.js';
import { CoreRadialPerformanceSystem } from '../src/player/CoreRadialPerformanceSystem.js';
import { TargetingSystem } from '../src/targeting/TargetingSystem.js';

const nursery = 'CELL_MEMBRANE_NURSERY_001';
const guide = 'CELL_SCAR_FLOW_FOLD_001';
const silt = 'CELL_SILT_PRESSURE_ROUTE_001';
const step = 0.05;
const stabilize = { stabilizeHeld: true };
const frontId = 'scar_contamination_plate_001';
const nearId = 'nursery_mote';

function makeNursery() {
  const frameState = {
    frame: 0, runtimeSeconds: 0, activeCellId: nursery, input: {},
    firstSliceRuntimeMount: { mountSequence: 1 }, targetFocus: { allowedCells: [nursery] },
    chemObjectState: { absorbedObjects: 0 }, playerComposition: { scar: 0, nutrient: 0 }
  };
  const scene = new Scene();
  const playerRoot = new Group();
  scene.add(playerRoot);
  const camera = new PerspectiveCamera();
  camera.lookAt(0, 0, -1);
  camera.updateMatrixWorld(true);
  const materials = [
    { id: frontId, spawn: { position: [0, 0, -0.7] }, visual: {},
      chemistry: { bondTypes: ['soft_bond'] }, behavior: { onAbsorb: false } },
    { id: nearId, spawn: { position: [0.45, 0, 0.3] }, visual: {},
      chemistry: { bondTypes: ['soft_bond'], absorbDifficulty: 0.2 }, behavior: { onAbsorb: true },
      effects: { onPlayerComposition: { nutrient: 0.2 } } }
  ];
  const data = {
    chemObjectRecipes: new Map(materials.map(recipe => [recipe.id, recipe])),
    bondRecipes: new Map([['soft_bond', { id: 'soft_bond', behavior: { absorbThreshold: 0.12 } }]])
  };
  const recipeDataSystem = { data, get: (group, id) => data[group].get(id) };
  const chemObjectSystem = new ChemObjectSystem({
    recipeDataSystem, playerRoot, frameState,
    localCellRecipe: { id: nursery, contents: { chemObjects: materials.map(recipe => recipe.id) } },
    visualComposer: { scene, compose({ position }) {
      const root = new Group();
      root.position.fromArray(position);
      scene.add(root);
      return root;
    } }
  });
  const targeting = new TargetingSystem({ scene, camera, playerRoot, chemObjectSystem, frameState });
  const composition = new VerbCompositionSystem({ frameState });
  const bond = new BondSystem({ recipeDataSystem, chemObjectSystem, playerRoot, frameState });
  const census = new WorldObjectCensusSystem({ scene, frameState });
  for (const system of [chemObjectSystem, targeting, composition, bond]) system.init();

  function tick(input = {}) {
    frameState.frame++;
    frameState.runtimeSeconds += step;
    frameState.input = input;
    chemObjectSystem.update(step, frameState);
    targeting.update(step, frameState);
    composition.update(step, frameState);
    chemObjectSystem.applyPulseToObjects(frameState);
  }

  function acquireLock() {
    for (let index = 0; index < 5; index++) tick(stabilize);
    tick({ ...stabilize, interactPressed: true });
    assert.equal(frameState.targeting.relationshipTargetId, frontId);
    assert.equal(frameState.cameraAimLock.lockedId, frontId);
    assert.equal(targeting.openAimGlyph.visible, true);
  }

  return { frameState, playerRoot, targeting, chemObjectSystem, bond, census, tick, acquireLock, objects: chemObjectSystem.objects };
}

function assertClearedRelationship(game) {
  assert.equal(game.frameState.targeting.relationshipTargetId, 'none');
  assert.equal(game.frameState.controllerTargetingAudit.relationshipTargetId, 'none');
  assert.equal(game.frameState.cameraAimLock.lockedId, 'none');
  assert.equal(game.frameState.cameraAimLock.mode, 'hidden');
  assert.equal(game.targeting.openAimGlyph.visible, false);
}

test('Relationship release clears the lock and audit while preserving world attention', () => {
  const game = makeNursery();
  game.acquireLock();
  game.tick();
  assert.equal(game.frameState.targeting.relationshipPhase, 'releasing');
  for (let index = 0; index < 6; index++) game.tick();
  assertClearedRelationship(game);
  assert.equal(game.frameState.targeting.attentionTargetId, frontId);
  assert.equal(game.frameState.selectedObject, game.objects[0].root.userData);

  game.objects[0].root.visible = false;
  game.tick();
  assert.equal(game.frameState.targeting.targetId, 'none');
  assert.equal(game.frameState.selectedObject, game.playerRoot.userData);
});

test('Core Work clears world aim and requires fresh acquisition; external inspection retains aim', () => {
  const game = makeNursery();
  game.acquireLock();
  const originalSequence = game.frameState.targeting.relationshipSequence;
  game.frameState.inspectionCamera = { active: true, coreWorkActive: false };
  game.tick(stabilize);
  assert.equal(game.frameState.targeting.relationshipSequence, originalSequence);
  game.frameState.inspectionCamera.coreWorkActive = true;
  game.tick(stabilize);
  assertClearedRelationship(game);
  assert.equal(game.frameState.targeting.targetId, 'none');
  assert.equal(game.frameState.verbComposition.control, null);
  for (let index = 0; index < 5; index++) game.tick(stabilize);
  assert.equal(game.frameState.targeting.candidateId, 'none');
  assert.equal(game.frameState.targeting.regionClearSequence, 0);

  game.frameState.inspectionCamera.coreWorkActive = false;
  game.tick(stabilize);
  assert.equal(game.frameState.targeting.relationshipTargetId, 'none');
  assert.equal(game.frameState.controllerTargetingAudit.relationshipTargetId, 'none');
  assert.equal(game.frameState.cameraAimLock.lockedId, 'none');
  assert.equal(game.frameState.targeting.candidateId, frontId);
  for (let index = 0; index < 4; index++) game.tick(stabilize);
  assert.equal(game.frameState.targeting.relationshipTargetId, frontId);
  assert.equal(game.frameState.targeting.relationshipSequence, originalSequence + 1);
  assert.equal(game.frameState.cameraAimLock.lockedId, 'none');
});

test('Region handoff and unmount clear publications without replacing another producer’s selection', () => {
  const game = makeNursery();
  game.acquireLock();
  const otherSelection = { objectId: 'guide' };
  game.frameState.selectedObject = otherSelection;
  game.frameState.activeCellId = guide;
  game.frameState.firstSliceRuntimeMount.mountSequence++;
  game.tick(stabilize);
  assertClearedRelationship(game);
  assert.equal(game.frameState.targeting.candidateId, 'none');
  assert.equal(game.frameState.selectedObject, otherSelection);

  game.frameState.activeCellId = nursery;
  game.tick();
  game.acquireLock();
  game.targeting.onRuntimeUnmount(game.frameState);
  assertClearedRelationship(game);
  assert.equal(game.frameState.targeting.targetId, 'none');
  assert.equal(game.frameState.selectedObject, game.playerRoot.userData);
});

test('The production mount profile clears Nursery bond, assist and VFX on deactivation', () => {
  const game = makeNursery();
  const profile = JSON.parse(readFileSync(new URL('../public/data/runtime/act1RuntimeProfile_HC016M.json', import.meta.url)));
  const mount = { runtimeProfile: profile, lastRegionId: 'none', mountSequence: 0 };
  const registry = new SystemRegistry();
  registry.register('bondSystem', game.bond, { runtimeScope: 'active_region', lazyInit: true, settleOnDeactivate: true });
  ModeController.prototype.publishRuntimeMount.call(mount, game.frameState, { id: 'surface_wake' }, { id: 'landing' }, null);
  game.frameState.input = { absorbHeld: true };
  registry.update(step, game.frameState);
  assert.equal(game.frameState.bondState.active, true);
  assert.equal(game.frameState.interactionAssist.active, true);
  assert.equal(game.bond.bondLine.visible, true);

  game.frameState.activeCellId = guide;
  ModeController.prototype.publishRuntimeMount.call(mount, game.frameState, { id: 'guide_threshold' }, { id: 'threshold' }, null);
  registry.update(step, game.frameState);
  assert.equal(game.frameState.bondState.active, false);
  assert.equal(game.frameState.currentChemTarget, 'none');
  assert.equal(game.frameState.interactionAssist.active, false);
  assert.equal(game.bond.bondLine.visible, false);
  assert.equal(game.frameState.chemObjectState.absorbProgress, 0);
});

test('Consuming Nursery matter credits chemistry exactly once and publishes no active bond', () => {
  const game = makeNursery();
  const frameState = game.frameState;
  frameState.input = { absorbHeld: true };
  for (let index = 0; index < 100 && !frameState.chemObjectState.absorbedObjects; index++) {
    frameState.frame++;
    game.bond.update(step, frameState);
  }
  assert.equal(frameState.chemObjectState.absorbedObjects, 1);
  assert.equal(frameState.playerComposition.nutrient, 0.2);
  assert.equal(game.objects[1].absorbed, true);
  assert.equal(frameState.bondState.active, false);
  assert.equal(frameState.bondState.objectId, 'none');
  assert.equal(frameState.currentBond, 'none');
  assert.equal(frameState.interactionAssist.active, false);
  assert.equal(game.bond.bondLine.visible, false);
  assert.equal(frameState.chemObjectState.pulseResponse, `${nearId}: absorbed_via_soft_bond`);
  const observed = game.census.snapshot().verbDelivery.absorb;
  assert.equal(observed.status, 'observed');
  assert.deepEqual(observed.recipients.map(effect => effect.targetId), [nearId]);
  for (let index = 0; index < 4; index++) {
    frameState.frame++;
    game.bond.update(step, frameState);
  }
  const later = game.census.snapshot().verbDelivery.absorb;
  assert.equal(later.status, 'unknown');
  assert.equal(later.lastCompletion.objectId, nearId);
  assert.equal(frameState.chemObjectState.absorbedObjects, 1);
  assert.equal(frameState.playerComposition.nutrient, 0.2);
});

test('The census separates external providers, chemistry acquisition and Pulse recipients', () => {
  const game = makeNursery();
  game.acquireLock();
  const before = game.census.snapshot();
  assert.equal(before.summary.registeredAttentionCandidates, 0);
  assert.deepEqual(before.externalAttentionCandidates, []);
  assert.equal(before.canonicalTargeting.availableTargetCount, 2);
  assert.equal(before.canonicalTargeting.candidateScope, 'local_object');
  assert.equal(before.siltGrip.effectiveId, null);
  assert.equal(before.verbDelivery.stabilize.intendedTargetId, frontId);
  assert.equal(before.verbDelivery.stabilize.status, 'unknown');

  const externalRoot = new Group();
  externalRoot.position.set(1, 0, -2);
  game.frameState.entityAttentionCandidates = { active: true, items: [
    { id: 'living_noun', cellId: nursery, root: externalRoot, attentionScope: 'local_entity' }
  ] };
  game.tick({ ...stabilize, pulsePressed: true, pulseEventId: 1 });
  const after = game.census.snapshot();
  assert.equal(after.canonicalTargeting.availableTargetCount, 3);
  assert.deepEqual(after.externalAttentionCandidates.map(candidate => candidate.id), ['living_noun']);
  assert.deepEqual(after.attentionCandidates, after.externalAttentionCandidates);
  const pulse = after.verbDelivery.pulse;
  assert.equal(pulse.intendedTargetId, frontId);
  assert.equal(pulse.status, 'observed');
  assert.deepEqual(pulse.recipients.map(effect => effect.targetId), [frontId]);
  assert.deepEqual(pulse.ambientEffects.map(effect => effect.targetId), [nearId]);
  assert.equal(after.entityBridge.materialTarget.verbDestinations.pulse, frontId);
  assert.equal(after.entityBridge.materialTarget.verbDestinations.stabilize, 'unverified-legacy-route');
  game.frameState.pulse.active = false;
  assert.equal(game.census.snapshot().verbDelivery.pulse.status, 'unknown');
});

test('Stabilize delivery requires a matching reactive response in the world', () => {
  const game = makeNursery();
  game.acquireLock();
  const reactive = new ReactiveStateGrammarSystem({ frameState: game.frameState, chemObjectSystem: game.chemObjectSystem });
  reactive.init();
  reactive.update(step, game.frameState);
  const report = game.census.snapshot();
  assert.deepEqual(report.verbDelivery.stabilize.recipients.map(effect => effect.targetId), [frontId]);
  assert.equal(report.entityBridge.materialTarget.verbDestinations.stabilize, frontId);

  game.frameState.inspectionCamera = { active: true };
  assert.equal(game.census.snapshot().verbDelivery.stabilize.status, 'unknown');
});

test('Silt grip, appetite, ambient territory and unknown delivery remain separate', () => {
  const frameState = {
    frame: 5, activeCellId: silt, input: { pulseEventId: 4 },
    siltMaterialAim: { candidateId: 'grain', heldId: 'grain' },
    siltPressureRoute: { active: true, siltGrip: { position: [0, 0, 0] }, transactionTrace: { events: [
      { frame: 5, pulseEventId: 3, kind: 'held-material-motion', verb: 'pulse', heldGrainId: 'old', appliedDisplacement: 0.2 },
      { frame: 5, pulseEventId: 4, kind: 'held-material-motion', verb: 'pulse', heldGrainId: 'grain', appliedDisplacement: 0.2 },
      { frame: 5, kind: 'held-material-motion', verb: 'absorb', heldGrainId: 'grain', appliedDisplacement: 0 },
      { frame: 5, kind: 'absorb-route', decision: 'porous-packet-committed', appetiteObject: 'packet' }
    ] } },
    territoryExploration: { active: true, owner: 'silt:RegionalTerritoryExpansion', region: 'silt',
      lastRead: { kind: 'c0e1_local_exploratory_read', region: 'silt', verb: 'stabilize', siteId: 'site', localSequence: 6 } }
  };
  const census = new WorldObjectCensusSystem({ frameState });
  const report = census.snapshot();
  assert.equal(report.siltGrip.heldId, 'grain');
  assert.equal(report.canonicalTargeting.relationshipTargetId, null);
  assert.deepEqual(report.verbDelivery.pulse.recipients.map(effect => effect.targetId), ['grain']);
  assert.deepEqual(report.verbDelivery.absorb.recipients.map(effect => effect.targetId), ['packet']);
  assert.equal(report.verbDelivery.stabilize.lastTerritoryEffect.targetId, 'site');
  assert.equal(report.verbDelivery.stabilize.status, 'unknown');
  frameState.siltPressureRoute.transactionTrace.events[2].appliedDisplacement = 0.1;
  const twoRecipients = census.snapshot();
  assert.deepEqual(twoRecipients.verbDelivery.absorb.recipients.map(effect => effect.targetId), ['grain', 'packet']);
  assert.equal(twoRecipients.entityBridge.materialTarget.verbDestinations.absorb, 'unverified-legacy-route');
  frameState.frame++;
  frameState.activeCellId = guide;
  assert.equal(census.snapshot().verbDelivery.pulse.status, 'unknown');
  assert.equal(census.snapshot().verbDelivery.stabilize.lastTerritoryEffect, undefined);
});

test('Core progression keeps the 3, 6 and 12 phases and radial performance tradeoffs', () => {
  const readPhases = zone => {
    const playerRoot = new Group();
    const counts = { membrane: 0, inner_body: 0, deep_core: 0, [zone]: 3 };
    const frameState = { spatialCoreChemistry: { retainedPieceCount: 3, counts, topology: { id: zone, complete: true } } };
    const engine = new CoreEngineSystem({ playerRoot, frameState });
    const radial = new CoreRadialPerformanceSystem({ playerRoot, frameState });
    return [3, 6, 12].map(phase => {
      frameState.returnRegionEngine = { unlockedPhaseCount: phase };
      engine.update(step);
      radial.update(step);
      assert.equal(frameState.coreEngine.phaseCount, phase);
      return frameState.corePerformance;
    });
  };
  const membrane = readPhases('membrane');
  const deep = readPhases('deep_core');
  for (const [index, outer] of membrane.entries()) {
    const inner = deep[index];
    assert.ok(outer.verbModifiers.pulse.chargeRateMultiplier > inner.verbModifiers.pulse.chargeRateMultiplier);
    assert.ok(inner.verbModifiers.stabilize.coherenceMultiplier > outer.verbModifiers.stabilize.coherenceMultiplier);
    assert.ok(inner.traits.enduranceCapacity > outer.traits.enduranceCapacity);
    assert.ok(inner.traits.recovery > outer.traits.recovery);
    assert.ok(inner.traits.stability > outer.traits.stability);
  }
});
