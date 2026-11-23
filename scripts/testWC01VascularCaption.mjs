import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PlaytestHudSystem } from '../src/ui/PlaytestHudSystem.js';
import { createVascularFixture, exerciseVascularReadability } from './testWC01VascularReadability.mjs';

const HOLDING = 'Vascular current · Stabilize holding';
const READY = 'Vascular current · ready to Pulse';

function renderCaption(frame, labels) {
  const hud = new PlaytestHudSystem({ recipeDataSystem: { data: {} }, frameState: frame });
  const attributes = new Set();
  hud.el = {
    style: {},
    toggleAttribute(name, active) { active ? attributes.add(name) : attributes.delete(name); }
  };
  for (const key of ['titleEl', 'objectiveEl', 'flowEl', 'statusEl', 'auditEl', 'controlsEl']) {
    hud[key] = { style: {}, textContent: '' };
  }
  frame.quickLookInspector.coreLabelsEnabled = labels;
  const model = hud.resolveHudState(frame, true);
  hud.applyPanel(model, true);
  return { text: hud.objectiveEl.textContent, action: model.actionHint,
    tier: model.contextualLabel?.tier, decorated: attributes.has('data-contextual-labels') };
}

test('C1 Vascular caption distinguishes brace, readiness, projection and release', () => {
  const { frame, route, tick, atValve } = createVascularFixture();
  atValve(0);
  tick({ pulsePressed: true });
  assert.equal(route.lockedCadenceReads, 0);
  assert.notEqual(renderCaption(frame, true).text, READY);

  tick({ stabilizeHeld: true });
  assert.equal(frame.vascularRhythmRoute.stage, 'establish_current_relationship');
  assert.equal(renderCaption(frame, true).text, HOLDING);
  const braceOff = renderCaption(frame, false);
  assert.equal(braceOff.decorated, false);
  assert.match(braceOff.text, /Keep Stabilize held/);

  for (let i = 0; i < 3; i++) tick({ stabilizeHeld: true });
  assert.equal(frame.vascularRhythmRoute.stage, 'project_through_stabilized_current');
  assert.deepEqual(renderCaption(frame, true), {
    text: READY, action: frame.vascularRhythmRoute.nextAction, tier: 'interaction', decorated: true
  });
  const readyOff = renderCaption(frame, false);
  assert.equal(readyOff.decorated, false);
  assert.match(readyOff.text, /^Pulse while Stabilize is held/);

  tick({ stabilizeHeld: true, pulsePressed: true });
  assert.equal(route.lockedCadenceReads, 1);
  assert.match(frame.vascularRhythmRoute.lastInteraction, /projected_through_valve$/);
  assert.equal(frame.vascularRhythmRoute.currentRelationshipReady, false);
  assert.equal(renderCaption(frame, true).text, HOLDING);
  assert.match(renderCaption(frame, false).text, /next valve/);
  tick();
  assert.notEqual(renderCaption(frame, true).text, HOLDING);
  assert.notEqual(renderCaption(frame, true).text, READY);
});

test('C1 Vascular scatter, recovery and return retain route guidance precedence', () => {
  const { checkpoints, cues } = exerciseVascularReadability();
  for (const phase of ['scatter', 'recovery', 'hub-return-ready']) {
    const guest = checkpoints[phase].frame;
    // The parity checkpoints omit presentation strings. Reuse the measured owner action.
    guest.vascularRhythmRoute.nextAction = cues[phase].action;
    if (phase === 'hub-return-ready') {
      guest.localCellBoundaryMorphById = { vascular_to_hub: {
        returnPrerequisitesMet: true, distance: 0.4,
        proximityReturnGuard: { armed: true, departureDistance: 1.65 }
      }};
    }
    const on = renderCaption(guest, true);
    const off = renderCaption(guest, false);
    assert.match(on.text, phase === 'hub-return-ready' ? /Swim through to Hub/ : /reweave|settle/);
    assert.notEqual(on.text, READY);
    assert.equal(off.text, off.action);
    assert.equal(off.decorated, false);
  }
  assert.equal(checkpoints.scatter.frame.vascularRhythmRoute.desynchronized, true);
  assert.equal(checkpoints.recovery.frame.vascularRhythmRoute.stabilizing, true);
});

test('C1 Vascular transition and modal precedence do not promote an old readiness state', () => {
  const { checkpoints } = exerciseVascularReadability();
  const frame = checkpoints['ready-0'].frame;
  assert.equal(renderCaption(frame, true).text, READY);
  frame.localCellBoundaryMorph = { active: true };
  const transition = renderCaption(frame, true);
  assert.equal(transition.text, transition.action);
  assert.equal(transition.tier, 'instruction');
  frame.localCellBoundaryMorph.active = false;
  frame.statusPage = { open: true };
  assert.equal(renderCaption(frame, true).decorated, false);
  frame.statusPage.open = false;
  frame.tightInspectionCamera = { active: true, coreWorkActive: true };
  assert.equal(renderCaption(frame, true).decorated, false);
});
