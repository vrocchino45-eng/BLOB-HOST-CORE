import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { EventAnchoredHostAudioSystem } from '../src/audio/EventAnchoredHostAudioSystem.js';
import { ChemObjectSystem } from '../src/chemistry/ChemObjectSystem.js';
import { SiltTrajectoryMemory } from '../src/contact/SiltTrajectoryMemory.js';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { RecipeDataSystem } from '../src/data/RecipeDataSystem.js';
import { GraveMemoryRouteSystem } from '../src/routes/GraveMemoryRouteSystem.js';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';
import { VascularRhythmRouteSystem } from '../src/routes/VascularRhythmRouteSystem.js';
import { ChemObjectVisualComposer } from '../src/visual/composers/ChemObjectVisualComposer.js';
import { CASCADE_CRESTS } from '../src/visual/CascadeCrests.js';
import { readCascadeLabel } from '../src/ui/ContextualWorldLabels.js';
import { PlaytestHudSystem } from '../src/ui/PlaytestHudSystem.js';

const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const VASCULAR = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const GRAVE = 'CELL_GRAVE_MEMORY_RESIDUE_BED_001';
const RESIDUE = 'residue_silt_cloud_001';
const STEP = 1 / 30;

const data = new RecipeDataSystem();
const originalFetch = globalThis.fetch;
globalThis.fetch = async request => {
  try {
    return new Response(readFileSync(new URL(`../public${String(request)}`, import.meta.url)));
  } catch {
    return new Response(null, { status: 404 });
  }
};
try {
  await data.loadAll();
} finally {
  globalThis.fetch = originalFetch;
}

function setup() {
  const frame = {
    frame: 0, runtimeSeconds: 0, activeHostId: 'HOST_ALPHA_WOUNDED_NURSERY',
    activeCellId: HUB, input: {}, playerComposition: { nutrient: 0.4 }, act1RouteHistory: {},
    firstSliceRuntimeMount: { mountSequence: 1, activeRuntimeCellId: HUB },
    quickLookInspector: { coreLabelsEnabled: true }
  };
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Group();
  const camera = new THREE.PerspectiveCamera();
  const ledger = new HostConnectionReceiptLedger();
  const shared = { recipeDataSystem: data, scene, playerRoot, camera, frameState: frame, hostConnectionReceiptLedger: ledger };
  const silt = new SiltPressureRouteSystem({ ...shared, flowExperiment: true });
  const vascular = new VascularRhythmRouteSystem(shared);
  const residue = new THREE.Group();
  new ChemObjectVisualComposer().composeResidueSiltCloud(residue);
  scene.add(residue);
  const grave = new GraveMemoryRouteSystem({
    ...shared,
    chemObjectSystem: {
      objects: [], spawnCellObjects: () => [{ recipe: { id: RESIDUE }, root: residue }],
      setObjectOpacity: ChemObjectSystem.prototype.setObjectOpacity
    }
  });
  const hud = new PlaytestHudSystem(shared);
  const owners = [silt, vascular, grave];
  for (const owner of owners) owner.init();

  const step = (cell, dt = STEP, input = {}) => {
    if (cell !== frame.activeCellId) {
      frame.firstSliceRuntimeMount = {
        activeRuntimeCellId: cell, mountSequence: frame.firstSliceRuntimeMount.mountSequence + 1,
        activeSystemIds: cell === SILT ? ['siltPressureRouteSystem'] : []
      };
    }
    frame.activeCellId = cell;
    frame.runtimeSeconds += dt;
    frame.frame++;
    frame.input = input;
    for (const owner of owners) owner.update(dt, frame);
  };
  const run = (cell, seconds) => {
    for (let i = 0; i < Math.ceil(seconds / STEP); i++) step(cell);
  };
  return { scene, camera, frame, silt, vascular, grave, ledger, hud, step, run };
}

function releaseTrajectory(reason = 'deliberate-release') {
  const movement = new SiltTrajectoryMemory();
  movement.beginHold('silt-grain-01', [0, 0, 0]);
  for (let i = 1; i <= 9; i++) movement.sampleHeld('silt-grain-01', [i * 0.055, 0, 0], 0.05, {});
  return movement.release('silt-grain-01', [0.495, 0, 0], { reason });
}

function qualifyRelease(game) {
  game.step(SILT);
  const release = releaseTrajectory();
  assert.equal(release.outcome, 'released-with-trajectory');
  game.silt.recordSiltDecision('silt-trajectory', release, game.frame);
  game.step(SILT);
  return game.ledger.snapshot().records.at(-1);
}

test('A qualified release drives one directional pair without moving or consuming matter', () => {
  const game = setup();
  const receipt = qualifyRelease(game);
  const { silt, frame } = game;
  const cue = frame.siltPressureRoute.cascadeReleasePresentation;
  assert.equal(cue.receiptId, receipt.id);
  assert.equal(cue.activeCrests, 1);
  const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(silt.releaseCrestRoot.quaternion);
  assert.ok(direction.dot(new THREE.Vector3(...receipt.releaseVelocity).normalize()) > 0.999);
  assert.deepEqual(silt.releaseCrestRoot.position.toArray(), receipt.origin);
  assert.equal(readCascadeLabel(frame).receiptId, receipt.id);
  assert.equal(game.hud.resolveHudState(frame, true).contextualLabel.tier, 'consequence');

  const leadStart = silt.releaseCrests[0].position.z;
  game.run(SILT, CASCADE_CRESTS[1].delay + 0.10);
  assert.equal(frame.siltPressureRoute.cascadeReleasePresentation.activeCrests, 2);
  assert.ok(silt.releaseCrests[0].position.z > leadStart);
  assert.ok(silt.releaseCrests[0].position.z > silt.releaseCrests[1].position.z);
  assert.deepEqual(new THREE.Raycaster().intersectObject(silt.releaseCrestRoot, true), []);
  const age = frame.siltPressureRoute.cascadeReleasePresentation.ageSeconds;
  silt.recordSiltDecision('silt-trajectory', { ...releaseTrajectory(), sequence: receipt.sourceReceiptSequence }, frame);
  game.step(SILT);
  assert.equal(game.ledger.snapshot().acceptedTotal, 1);
  assert.equal(game.ledger.snapshot().duplicateTotal, 1);
  assert.ok(frame.siltPressureRoute.cascadeReleasePresentation.ageSeconds > age);
  game.run(SILT, 1.3);
  assert.equal(frame.siltPressureRoute.cascadeReleasePresentation, null);
  assert.equal(silt.releaseCrestRoot.visible, false);
  assert.equal(silt.materialIdentity.totalMass(), 8);
  assert.equal(silt.completed, false);
  assert.equal(receipt.materialTransfer, false);
  assert.equal(receipt.routeCredit, false);
});

test('An ineligible release, forged transaction, or button-only attempt leaves Silt crests hidden', () => {
  const game = setup();
  game.step(SILT, STEP, { pulsePressed: true, interactPressed: true, flowDemand01: 1 });
  game.silt.recordSiltDecision('silt-trajectory', releaseTrajectory('region-hidden'), game.frame);
  game.silt.recordSiltDecision('silt-trajectory', { ...releaseTrajectory(), noMaterialTransfer: false }, game.frame);
  game.step(SILT);
  assert.equal(game.ledger.snapshot().acceptedTotal, 0);
  assert.equal(game.silt.releaseCrestRoot.visible, false);
  assert.equal(game.frame.siltPressureRoute.cascadeReleasePresentation, null);
});

test('A positive Vascular effect travels as two existing folds and ends on unmount', () => {
  const game = setup();
  const receipt = qualifyRelease(game);
  game.step(VASCULAR);
  const effect = game.frame.vascularRhythmRoute.siltArrivalPresentation;
  assert.equal(effect.parentSiltReceiptId, receipt.id);
  const mechanical = game.ledger.vascularEffectSnapshot().records[0];
  assert.equal(effect.appliedDelta, mechanical.appliedDelta);
  assert.equal(readCascadeLabel(game.frame).receiptId, effect.receiptId);
  const first = game.vascular.vis1Applied.arrivalFrontFold;
  assert.ok(game.vascular.vis1Applied.receiptArrivalStrength > 0);
  game.run(VASCULAR, 0.70);
  const visual = game.vascular.vis1Applied;
  assert.notEqual(visual.arrivalFrontFold, first);
  assert.ok(visual.arrivalEchoFold);
  assert.notEqual(visual.arrivalEchoFold, visual.arrivalFrontFold);
  assert.ok(visual.peakRadialCompression <= 0.26);
  assert.equal(game.ledger.vascularEffectSnapshot().acceptedTotal, 1);
  game.step(HUB);
  game.step(VASCULAR);
  assert.equal(game.vascular.vis1Applied.arrivalReceiptId, null);
  assert.equal(game.vascular.vis1Applied.receiptArrivalStrength, 0);
  assert.ok(game.vascular.siltSignalReceiver.membraneLoad > 0);
});

test('Vascular cadence and current match with the cascade renderer enabled or bypassed', () => {
  const exercise = render => {
    const game = setup();
    const { vascular, frame } = game;
    if (!render) vascular.applySiltPressureAnatomy = () => {};
    qualifyRelease(game);
    game.step(VASCULAR);
    const valves = vascular.recipe.anatomy.valveProgress;
    const trace = [];
    const tick = input => {
      game.step(VASCULAR, STEP, input);
      trace.push({
        reads: vascular.lockedCadenceReads,
        ready: vascular.currentRelationshipReady,
        load: vascular.siltSignalReceiver.membraneLoad,
        currentMultiplier: frame.vascularRhythmRoute.siltSignalResponse.directionalFlowScale,
        flowVector: frame.physicalFeel?.flowVector && { ...frame.physicalFeel.flowVector },
        open: vascular.returnFoldReady
      });
    };
    for (const [index, valve] of valves.entries()) {
      vascular.playerRoot.position.copy(vascular.pathCurve.getPointAt(valve)).add(vascular.entryAnchor);
      for (let held = 0; held < 12; held++) tick({ stabilizeHeld: true });
      assert.equal(vascular.currentRelationshipReady, true);
      tick({ stabilizeHeld: true, pulsePressed: true, pulseEventId: index + 1 });
      assert.equal(vascular.lockedCadenceReads, index + 1);
    }
    for (let held = 0; held < 240 && !vascular.returnFoldReady; held++) tick({ stabilizeHeld: true });
    assert.equal(vascular.returnFoldReady, true);
    return trace;
  };

  assert.deepEqual(exercise(true), exercise(false));
});

test('Saturated and forged arrivals cannot create a Vascular or Grave one-shot', () => {
  const game = setup();
  const receipt = qualifyRelease(game);
  game.vascular.siltSignalReceiver.membraneLoad = 0.85;
  game.step(VASCULAR);
  assert.equal(game.ledger.vascularEffectSnapshot().acceptedTotal, 0);
  assert.equal(game.frame.vascularRhythmRoute.siltSignalResponse.receivedTotal, 1);
  assert.equal(game.vascular.vis1Applied.receiptArrivalStrength, 0);
  assert.equal(game.vascular.vis1Applied.arrivalReceiptId, null);
  game.run(VASCULAR, 0.15);
  assert.equal(game.ledger.vascularEffectSnapshot().acceptedTotal, 0);
  assert.equal(game.ledger.observeVascularAppliedEffect({ parentSiltReceiptId: receipt.id, appliedDelta: 0.1 }), null);
  game.step(GRAVE);
  assert.equal(game.frame.graveMemoryRoute.vascularMemoryPresentation, null);
  assert.equal(game.grave.readVascularMemoryEcho().retainedStrength, 0);

  const fullMemory = setup();
  qualifyRelease(fullMemory);
  fullMemory.step(VASCULAR);
  fullMemory.grave.vascularEffectMemory.memoryPressure = 1;
  fullMemory.step(GRAVE);
  assert.equal(fullMemory.ledger.vascularEffectSnapshot().acceptedTotal, 1);
  assert.equal(fullMemory.grave.vascularEffectMemory.receivedTotal, 1);
  assert.equal(fullMemory.grave.readVascularMemoryEcho().arrivalStrength, 0);
  assert.ok(fullMemory.grave.readVascularMemoryEcho().retainedStrength > 0);
});

test('Grave bends its authored rings on arrival and restores only the retained form after remount', () => {
  const game = setup();
  const receipt = qualifyRelease(game);
  game.step(VASCULAR);
  game.step(GRAVE);
  const { frame, grave } = game;
  const parts = grave.landmarkVisuals.get(RESIDUE).parts;
  const rings = parts.get('silt_threaded_void');
  const memoryMesh = parts.get('silt_memory_echo')[0];
  const event = frame.graveMemoryRoute.vascularMemoryPresentation;
  assert.equal(event.parentSiltReceiptId, receipt.id);
  assert.equal(event.echo.crests[1], 0);
  assert.ok(event.echo.crests[0] > 0);
  assert.ok(rings[0].material.opacity > rings[1].material.opacity);
  assert.ok(memoryMesh.visible);
  const arrivalOpacity = memoryMesh.material.opacity;
  game.run(GRAVE, CASCADE_CRESTS[1].delay + 0.08);
  assert.ok(frame.graveMemoryRoute.vascularMemoryPresentation.echo.crests[1] > 0);
  const pressure = grave.vascularEffectMemory.memoryPressure;
  game.step(HUB);
  game.step(GRAVE);
  const retained = frame.graveMemoryRoute.vascularMemoryPresentation;
  assert.equal(retained.receiptId, event.receiptId);
  assert.equal(retained.echo.arrivalStrength, 0);
  assert.ok(retained.echo.retainedStrength > 0);
  assert.ok(memoryMesh.visible);
  assert.ok(memoryMesh.material.opacity < arrivalOpacity);
  assert.equal(grave.vascularEffectMemory.memoryPressure, pressure);
  assert.equal(grave.vascularEffectMemory.receivedTotal, 1);
});

test('Labels and existing one-shot audio signatures reference the same render event IDs', () => {
  const game = setup();
  qualifyRelease(game);
  const audio = Object.create(EventAnchoredHostAudioSystem.prototype);
  const sounds = [];
  Object.assign(audio, {
    unlocked: true, context: { state: 'running' }, masterGain: {},
    lastVascularArrivalSequence: 0, lastGraveMemorySequence: 0,
    lastVascularArrivalAudioAt: -99, lastGraveMemoryAudioAt: -99,
    vascularArrivalSignatureCount: 0, graveMemorySignatureCount: 0,
    playTone: () => {}, recordEvent: sound => sounds.push(sound)
  });
  game.step(VASCULAR);
  const v = game.frame.vascularRhythmRoute.siltArrivalPresentation;
  assert.equal(game.vascular.vis1Applied.arrivalReceiptId, v.receiptId);
  assert.equal(readCascadeLabel(game.frame).receiptId, v.receiptId);
  audio.handleVascularSiltArrival(game.frame);
  game.step(GRAVE);
  const m = game.frame.graveMemoryRoute.vascularMemoryPresentation;
  assert.equal(m.receiptId, v.receiptId);
  assert.equal(readCascadeLabel(game.frame).receiptId, m.receiptId);
  audio.handleGraveVascularMemory(game.frame);
  game.step(HUB);
  game.step(GRAVE);
  audio.handleGraveVascularMemory(game.frame);
  assert.deepEqual(sounds, [`vascular_silt_arrival:${v.sequence}`, `grave_vascular_memory:${m.sequence}`]);
});

test('Repeated crossings and label changes keep the same mesh and material allocations', t => {
  const game = setup();
  qualifyRelease(game);
  const allocations = () => {
    const meshes = [];
    game.scene.traverse(object => { if (object.isMesh) meshes.push(object); });
    return meshes.map(mesh => [mesh.uuid, mesh.geometry.uuid, mesh.material.uuid]);
  };
  const initial = allocations();
  game.frame.quickLookInspector.coreLabelsEnabled = false;
  assert.equal(game.hud.resolveHudState(game.frame, true).contextualLabel, null);
  assert.ok(game.silt.releaseCrestRoot.visible);
  const start = performance.now();
  for (let i = 0; i < 6; i++) {
    for (const cell of [HUB, VASCULAR, HUB, GRAVE, HUB, SILT]) game.step(cell);
    assert.deepEqual(allocations(), initial);
    assert.equal(game.silt.releaseCrestRoot.visible, false);
  }
  t.diagnostic(`36 owner steps and ${initial.length} stable mesh allocations checked in ${(performance.now() - start).toFixed(1)} ms`);
  assert.equal(game.ledger.snapshot().acceptedTotal, 1);
  assert.equal(game.ledger.vascularEffectSnapshot().acceptedTotal, 1);
  assert.equal(game.grave.vascularEffectMemory.receivedTotal, 1);
});
