import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HostConnectionReceiptLedger } from '../src/core/HostConnectionReceiptLedger.js';
import { PlaytestHudSystem } from '../src/ui/PlaytestHudSystem.js';
import { buildQuickLookSnapshot, QuickLookInspectorSystem } from '../src/ui/QuickLookInspectorSystem.js';

const SILT = 'CELL_SILT_PRESSURE_ROUTE_001';
const HUB = 'CELL_SIGNAL_CHORUS_NERVE_001';
const VASCULAR = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const GRAVE = 'CELL_GRAVE_MEMORY_RESIDUE_BED_001';

function setup(cell = SILT, labels = true) {
  const frame = {
    activeCellId: cell, activeHostId: 'test-host', frame: 30, runtimeSeconds: 20,
    firstSliceRuntimeMount: {
      activeRuntimeCellId: cell, mountSequence: 3, activeSystemIds: cell === SILT ? ['siltPressureRouteSystem'] : []
    },
    quickLookInspector: { coreLabelsEnabled: labels },
    siltPressureRoute: { active: cell === SILT, nextAction: 'Follow the pressure passage.' },
    vascularRhythmRoute: { active: cell === VASCULAR, nextAction: 'Ride to the next valve.' },
    graveMemoryRoute: { active: cell === GRAVE, nextAction: 'Read the old Core husk.' }
  };
  const hud = new PlaytestHudSystem({ recipeDataSystem: { data: {} }, frameState: frame });
  return { frame, read: () => hud.resolveHudState(frame, true) };
}

function publishSiltRelease(frame, reason = 'deliberate-release') {
  const ledger = new HostConnectionReceiptLedger();
  const decision = {
    kind: 'silt-trajectory', outcome: 'released-with-trajectory', reason, unitId: 'silt-grain-01',
    frame: frame.frame, sequence: 2, siltElapsedSeconds: 1, position: [1, 2, 3], velocity: [0, 0, 1],
    noMaterialTransfer: true, progressionCredit: false
  };
  const receipt = ledger.observeSiltRelease(decision);
  frame.siltPressureRoute.transactionTrace = { events: [decision] };
  frame.hostConnections = ledger.snapshot();
  return receipt;
}

function setupGardenDelivery() {
  const { frame, read } = setup();
  const silt = frame.siltPressureRoute;
  silt.habitatFoundation = { currentHabitatId: 'garden' };
  const garden = {
    receiverId: 'silt_sediment_garden', imprint: 0.125, arrivalSecondsRemaining: 1.2,
    lastDelivery: {
      sequence: 7, unitId: 'silt-grain-01', generation: 0, imprintBefore: 0, imprintAfter: 0.125,
      cellId: SILT, mountSequence: frame.firstSliceRuntimeMount.mountSequence, frame: frame.frame, substep: 0
    }
  };
  silt.gardenSeepExchange = garden;
  return { frame, read, silt, garden };
}

test('Idle keeps route guidance and canonical attention adds a single primary identity', () => {
  const { frame, read } = setup();
  assert.equal(read().primaryInstruction, 'Follow the pressure passage.');
  frame.targeting = { active: true, targetLabel: 'Merely nearby' };
  assert.equal(read().primaryInstruction, 'Follow the pressure passage.');

  frame.targeting = { active: true, attentionActive: true, targetId: 'silt_pore', targetLabel: 'Silt pore' };
  const state = read();
  assert.equal(state.primaryInstruction, 'Silt pore');
  assert.equal(state.contextualLabel.tier, 'primary');
  assert.equal(state.actionHint, 'Follow the pressure passage.');
  frame.playtestHud = state;
  const inspector = new QuickLookInspectorSystem({ frameState: frame });
  assert.deepEqual(inspector.resolveBubbles({}), []);
});

test('Grip and contact outrank selection, while alignment loss and overload distinguish blocked delivery', () => {
  const { frame, read } = setup();
  frame.targeting = { active: true, targetId: 'silt_porosity_shelf', targetLabel: 'Porosity Shelf' };
  frame.coreFlow = { ready: true, reason: 'ready', phase: 'retracted' };
  assert.equal(read().primaryInstruction, 'Porosity Shelf · release, then hold RT');

  Object.assign(frame.coreFlow, { demand01: 0.5, contactValid: true, reason: 'contact' });
  assert.equal(read().primaryInstruction, 'Shelf contact · waiting for current');

  frame.siltPressureRoute.siltGrip = { heldId: 'silt-grain-01' };
  frame.siltPressureRoute.siltContact = { braced: true };
  assert.equal(read().primaryInstruction, 'Silt grain · braced contact');
  delete frame.siltPressureRoute.siltGrip;

  Object.assign(frame.coreFlow, { contactValid: false, reason: 'align_core' });
  assert.equal(read().primaryInstruction, 'Align the Core with the Shelf');
  Object.assign(frame.coreFlow, { contactValid: true, reason: 'receiver_rejected' });
  assert.equal(read().primaryInstruction, 'Shelf contact · current declined');

  const result = { acceptedCurrent01: 0.4, pressure01: 0.2, resistance01: 0.3, after: { imprint: 0.02 } };
  Object.assign(frame.coreFlow, { result, reason: 'current_accepted' });
  assert.equal(read().primaryInstruction, 'Shelf · current accepted, resistance felt');
  assert.match(read().flowLine, /pressure 0\.20 · resistance 0\.30/);
  frame.coreFlow.overloaded = true;
  assert.equal(read().primaryInstruction, 'Shelf overload · current limited');
});

test('T1-A remains the actionable instruction near the fold and yields to active interaction farther away', () => {
  const { frame, read } = setup();
  frame.localCellBoundaryMorphById = { silt_to_hub: {
    recipeId: 'silt_to_hub', distance: 0.5, returnPrerequisitesMet: false,
    proximityReturnGuard: { armed: false, departureDistance: 1.65 }
  }};
  assert.equal(read().primaryInstruction, 'Follow the pressure passage.');
  const fold = frame.localCellBoundaryMorphById.silt_to_hub;
  fold.returnPrerequisitesMet = true;
  frame.siltPressureRoute.siltGrip = { heldId: 'silt-grain-01' };
  assert.equal(read().primaryInstruction, 'Move away, then approach the fold again');
  Object.assign(fold, { distance: 3 });
  fold.proximityReturnGuard.armed = true;
  assert.equal(read().primaryInstruction, 'Silt grain · gripped');
  fold.distance = 1.5;
  assert.equal(read().primaryInstruction, 'Swim through to Hub');
  frame.quickLookInspector.coreLabelsEnabled = false;
  assert.equal(read().primaryInstruction, 'Follow the pressure passage.');
  assert.equal(read().contextualLabel, null);
});

test('Hub direct-entry guidance and Core Work retain their existing action slots', () => {
  const { frame, read } = setup(HUB);
  frame.hubInvestigationGameplay = { active: true, nextAction: 'Press A / E to enter Vascular.' };
  assert.equal(read().primaryInstruction, frame.hubInvestigationGameplay.nextAction);
  frame.tightInspectionCamera = { active: true, coreWorkActive: true };
  assert.equal(read().contextualLabel, null);
  assert.match(read().primaryInstruction, /Core/);
});

test('Only a qualified Silt release outranks passive identity and keeps provenance in the notes', () => {
  const { frame, read } = setup();
  frame.targeting = { active: true, attentionActive: true, targetId: 'pore', targetLabel: 'Silt pore' };
  assert.equal(publishSiltRelease(frame, 'unmount'), null);
  assert.equal(read().primaryInstruction, 'Silt pore');
  const receipt = publishSiltRelease(frame);
  assert.ok(receipt);
  const active = read();
  assert.equal(active.contextualLabel.tier, 'consequence');
  assert.equal(active.primaryInstruction, 'Silt signal · disturbance released');
  assert.equal(active.primaryInstruction.includes(receipt.id), false);
  assert.ok(buildQuickLookSnapshot(frame).history.some(line => line.includes(receipt.id)));
  frame.runtimeSeconds += 3;
  frame.frame += 180;
  assert.equal(read().primaryInstruction, 'Silt pore');
  assert.equal(read().contextualLabel.history, 'Silt signal · release recorded');
});

test('Vascular presents a confirmed membrane change and retains history without replay on remount', () => {
  const { frame, read } = setup(VASCULAR);
  const route = frame.vascularRhythmRoute;
  const receiptId = 'vascular-effect:1';
  route.hostConnectionObservation = { observedCount: 1, mostRecentCauseId: 'silt-release:2' };
  route.siltSignalResponse = { receivedTotal: 1, directionalFlowScale: 0.99 };
  route.siltArrivalPresentation = {
    authority: 'HostConnectionReceiptLedger', kind: 'vascular_membrane_load_change_applied',
    receiptId, parentSiltReceiptId: 'silt-release:2', appliedDelta: 0, materialTransfer: false, ageSeconds: 0.1
  };
  route.presentationTrace = { vis1: { arrivalReceiptId: receiptId } };
  assert.equal(read().primaryInstruction, 'Ride to the next valve.');

  route.siltArrivalPresentation.appliedDelta = 0.15;
  assert.equal(read().primaryInstruction, 'Silt signal · membrane responded');
  assert.ok(buildQuickLookSnapshot(frame).history.includes('Applied membrane load: +0.150'));
  assert.ok(buildQuickLookSnapshot(frame).history.some(line => line.includes('grain stayed in Silt')));

  frame.firstSliceRuntimeMount.mountSequence++;
  assert.equal(read().contextualLabel.tier, 'primary');
  assert.equal(read().contextualLabel.history, 'Silt signal · Vascular response recorded');
});

test('Grave remembers the same Silt source and distinguishes available recovery from applied recovery', () => {
  const { frame, read } = setup(GRAVE);
  frame.graveVascularEffectMemory = {
    active: true, memoryPressure: 0.15, recoveryCoupling: { multiplier: 1.022, eligibleNow: true },
    gameplayConsequenceApplied: false
  };
  const presentation = {
    authority: 'GraveVascularEffectMemory', kind: 'positive_vascular_memory_retained',
    parentSiltReceiptId: 'silt-release:2', receiptId: 'vascular-effect:1', memoryDelta: 0.15,
    materialTransfer: false, ageSeconds: 0, echo: { arrivalStrength: 0.5, retainedStrength: 0.07 }
  };
  frame.graveMemoryRoute.vascularMemoryPresentation = presentation;
  assert.equal(read().primaryInstruction, 'Silt signal · memory settled');
  frame.firstSliceRuntimeMount.mountSequence++;
  presentation.echo.arrivalStrength = 0;
  assert.equal(read().contextualLabel.history, 'Silt signal · memory retained');
  assert.ok(buildQuickLookSnapshot(frame).history.includes('Silt receipt: silt-release:2'));
  assert.ok(buildQuickLookSnapshot(frame).history.includes('Vascular effect: vascular-effect:1'));
  assert.ok(buildQuickLookSnapshot(frame).history.includes('Recovery multiplier: ×1.022'));
  frame.graveMemoryRoute.warning = 'residue_recoil_recovering';
  frame.input = { stabilizeHeld: true };
  assert.equal(read().primaryInstruction, 'Grave residue · recovering');
  frame.graveVascularEffectMemory.gameplayConsequenceApplied = true;
  assert.equal(read().primaryInstruction, 'Silt signal · aiding Grave recovery');
  frame.input.stabilizeHeld = false;
  assert.equal(read().primaryInstruction, 'Hold Stabilize on the residue');
  assert.equal(read().contextualLabel.history, 'Silt signal · memory assisted recovery');
  frame.quickLookInspector.coreLabelsEnabled = false;
  assert.equal(read().contextualLabel, null);
});

test('The Silt owner controls the boost cue in Reservoir and Veins and its expiration', () => {
  const { frame, read } = setup();
  const cycle = { active: true, flowBoostRemaining: 7 };
  const habitat = { currentHabitatId: 'reservoir' };
  Object.assign(frame.siltPressureRoute, { livingMaterialCycle: cycle, habitatFoundation: habitat });

  for (const currentHabitatId of ['reservoir', 'veins']) {
    habitat.currentHabitatId = currentHabitatId;
    assert.equal(read().primaryInstruction, 'Follow the pressure passage.');
    assert.equal(read().contextualLabel.history, 'Seep transport boosted');
  }

  cycle.flowBoostRemaining = 0;
  frame.input = { pulsePressed: true, pulseEventId: 2 };
  cycle.lastEvent = 'pulse_redirected_seep_pressure';
  assert.equal(read().contextualLabel.history, undefined);

  cycle.flowBoostRemaining = 2;
  for (const currentHabitatId of ['garden', 'throat']) {
    habitat.currentHabitatId = currentHabitatId;
    assert.equal(read().contextualLabel.history, undefined);
  }
  habitat.currentHabitatId = 'veins';
  cycle.active = false;
  assert.equal(read().contextualLabel.history, undefined);
  cycle.active = true;
  frame.siltPressureRoute.active = false;
  assert.equal(read().contextualLabel.history, undefined);
});

test('A verified local arrival occupies the spare secondary slot independently of Pulse', () => {
  const { frame, read, silt } = setupGardenDelivery();
  const arrived = { tier: 'primary', text: 'Follow the pressure passage.', history: 'Sediment arrived' };
  assert.deepEqual(read().contextualLabel, arrived);

  silt.livingMaterialCycle = { active: true, flowBoostRemaining: 3 };
  frame.input = { pulsePressed: true, pulseEventId: 2 };
  assert.deepEqual(read().contextualLabel, arrived);
  frame.targeting = { active: true, attentionActive: true, targetId: 'pore', targetLabel: 'Silt pore' };
  assert.deepEqual(read().contextualLabel, { ...arrived, text: 'Silt pore' });
  silt.habitatFoundation.currentHabitatId = 'throat';
  assert.equal(read().contextualLabel.history, undefined);
});

test('A settled phase, Garden placement and zero imprint cannot report an arrival', () => {
  const { frame, read, silt, garden } = setupGardenDelivery();
  garden.imprint = 0;
  assert.equal(read().contextualLabel.history, undefined);

  garden.lastDelivery = null;
  silt.livingMaterialCycle = { active: true, counts: { settled: 1 }, lastEvent: 'settled' };
  frame.input = { pulsePressed: true };
  assert.equal(read().contextualLabel.history, undefined);

  garden.imprint = 0.125;
  // Even an active-looking timer cannot report a live arrival without its delivery.
  assert.equal(read().contextualLabel.history, 'Garden imprint retained');
});

test('Arrival expiry and same-session remount keep only the retained Garden imprint', () => {
  const { frame, read, silt, garden } = setupGardenDelivery();
  garden.arrivalSecondsRemaining = 0.01;
  assert.equal(read().contextualLabel.history, 'Sediment arrived');
  garden.arrivalSecondsRemaining = 0;
  assert.equal(read().contextualLabel.history, 'Garden imprint retained');

  silt.active = false;
  assert.equal(read().contextualLabel.history, undefined);
  frame.firstSliceRuntimeMount.mountSequence++;
  silt.active = true;
  assert.equal(read().contextualLabel.history, 'Garden imprint retained');
  // An old delivery cannot replay even if its old cue timer is still present.
  garden.arrivalSecondsRemaining = 1.2;
  assert.equal(read().contextualLabel.history, 'Garden imprint retained');
});

test('Return-fold, safety and grip guidance reserve their priority during an arrival', () => {
  const { frame, read, silt } = setupGardenDelivery();
  const check = text => assert.deepEqual(read().contextualLabel, { tier: 'instruction', text });
  const fold = { recipeId: 'silt_to_hub', distance: 0.5, returnPrerequisitesMet: true,
    proximityReturnGuard: { armed: false, departureDistance: 1.65 } };
  frame.localCellBoundaryMorphById = { silt_to_hub: fold };
  check('Move away, then approach the fold again');
  fold.proximityReturnGuard.armed = true;
  check('Swim through to Hub');

  delete frame.localCellBoundaryMorphById;
  silt.compressionFailure = true;
  check('Follow the pressure passage.');
  silt.compressionFailure = false;
  silt.siltGrip = { heldId: 'silt-grain-01' };
  assert.deepEqual(read().contextualLabel, { tier: 'interaction', text: 'Silt grain · gripped' });
  delete silt.siltGrip;
  frame.siltMaterialAim = { candidateId: 'silt-grain-01' };
  assert.deepEqual(read().contextualLabel,
    { tier: 'primary', text: 'Silt grain · LT + A to grip', history: undefined });
});

test('F1 guidance and C2 live consequences or history take precedence over Garden feedback', () => {
  const { frame, read } = setupGardenDelivery();
  frame.coreFlow = { ready: true, reason: 'ready' };
  assert.equal(read().primaryInstruction, 'Porosity Shelf · release, then hold RT');
  assert.equal(read().contextualLabel.history, undefined);
  frame.coreFlow = { demand01: 0.5, reason: 'align_core' };
  assert.deepEqual(read().contextualLabel, { tier: 'instruction', text: 'Align the Core with the Shelf' });
  frame.coreFlow = { contactValid: true };
  assert.deepEqual(read().contextualLabel, { tier: 'interaction', text: 'Shelf contact · waiting for current' });
  frame.coreFlow.result = { acceptedCurrent01: 0.4, pressure01: 0.2, resistance01: 0.3, after: { imprint: 0.02 } };
  assert.deepEqual(read().contextualLabel,
    { tier: 'interaction', text: 'Shelf · current accepted, resistance felt' });
  delete frame.coreFlow;
  assert.equal(read().contextualLabel.history, 'Sediment arrived');
  assert.ok(publishSiltRelease(frame));
  assert.deepEqual(read().contextualLabel, { tier: 'consequence', text: 'Silt signal · disturbance released' });

  frame.frame += 180;
  frame.runtimeSeconds += 3;
  assert.equal(read().primaryInstruction, 'Follow the pressure passage.');
  assert.equal(read().contextualLabel.history, 'Silt signal · release recorded');
});

test('Reading either label setting leaves owner state intact and labels off suppresses environmental text', () => {
  const { frame, read, silt, garden } = setupGardenDelivery();
  silt.livingMaterialCycle = { active: true, flowBoostRemaining: 4 };
  const cases = [
    ['reservoir', 1.2, 'Seep transport boosted'],
    ['garden', 1.2, 'Sediment arrived'],
    ['garden', 0, 'Garden imprint retained']
  ];
  for (const [habitat, remaining, expected] of cases) {
    silt.habitatFoundation.currentHabitatId = habitat;
    garden.arrivalSecondsRemaining = remaining;
    for (const labels of [true, false]) {
      frame.quickLookInspector.coreLabelsEnabled = labels;
      const before = structuredClone(frame);
      const state = read();
      if (labels) assert.equal(state.contextualLabel.history, expected);
      else assert.equal(state.contextualLabel, null);
      assert.equal(state.primaryInstruction, 'Follow the pressure passage.');
      assert.deepEqual(frame, before);
    }
  }
});
