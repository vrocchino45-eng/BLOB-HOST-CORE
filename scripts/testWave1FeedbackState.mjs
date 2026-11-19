import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { SessionTelemetrySystem } from '../src/core/SessionTelemetrySystem.js';
import { readHostLanguage } from '../src/language/HostLanguageGrammar.js';
import { CoreRadialPerformanceSystem } from '../src/player/CoreRadialPerformanceSystem.js';
import { buildCoreArrangementLabels, compactCoreArrangementLabelRows, coreArrangementLabelRows, previewCoreArrangement } from '../src/ui/CoreArrangementLabels.js';
import { PlaytestHudSystem } from '../src/ui/PlaytestHudSystem.js';
import { HostConditionSystem, readVascularHostPressure } from '../src/world/HostConditionSystem.js';

const cells = {
  grave: 'CELL_GRAVE_MEMORY_RESIDUE_BED_001',
  vascular: 'CELL_VASCULAR_RHYTHM_ROUTE_001',
  silt: 'CELL_SILT_PRESSURE_ROUTE_001'
};

test('Core labels and selected-piece previews use the live radial charge, recovery, endurance and stability', () => {
  const membrane = previewCoreArrangement({ deep_core:0, inner_body:0, membrane:3 });
  const middle = previewCoreArrangement({ deep_core:0, inner_body:3, membrane:0 });
  const inner = previewCoreArrangement({ deep_core:3, inner_body:0, membrane:0 });
  assert.ok(membrane.charge > middle.charge && middle.charge > inner.charge);
  for (const trait of ['recovery', 'endurance', 'stability']) {
    assert.ok(inner[trait] > middle[trait] && middle[trait] > membrane[trait]);
  }

  const frame = {
    inspectionCamera: { coreWorkActive:true },
    coreWorkManipulation: { selectedPieceId:'piece-1' },
    spatialCoreChemistry: {
      retainedPieceCount:3, counts:{ deep_core:1, inner_body:1, membrane:1 },
      topology:{ id:'three_way_balance', complete:true, distribution:'1:1:1' },
      placements:['deep_core', 'inner_body', 'membrane'].map((zoneId, i) => ({ pieceId:`piece-${i}`, zoneId }))
    }
  };
  const owner = new CoreRadialPerformanceSystem({ frameState:frame, playerRoot:{ userData:{} } });
  owner.reserve01 = 0.58;
  owner.update(0);
  const before = structuredClone(frame);
  const label = buildCoreArrangementLabels(frame);
  assert.equal(label.current.stability, frame.corePerformance.traits.stability);
  const move = label.previews.find(({ zoneId }) => zoneId === 'membrane');
  assert.equal(move.stability, previewCoreArrangement({ deep_core:1, inner_body:0, membrane:2 }, 0.58).stability);
  for (const rows of [coreArrangementLabelRows(label), compactCoreArrangementLabelRows(label)]) {
    assert.ok(rows.some(({ text }) => text.includes('Core stability')));
    const membraneMove = rows.find(({ title }) => title.includes('IF MOVED TO · Membrane'));
    for (const word of ['Pulse charge', 'recovery', 'endurance', 'stability']) assert.ok(membraneMove.text.includes(word));
  }
  assert.deepEqual(frame, before);
});

function interactionFrame() {
  return {
    activeCellId:'CELL_MEMBRANE_NURSERY_001', quickLookInspector:{ coreLabelsEnabled:true },
    input:{ stabilizeHeld:true, absorbHeld:true, pulsePressed:true },
    targeting:{ relationshipActive:true, relationshipTargetId:'plate', relationshipSequence:7, targetId:'plate', targetLabel:'Scar plate' },
    verbComposition:{ owner:'VerbCompositionSystem', relationshipBound:true, targetId:'plate',
      chord:'full_system', intent:{ pulse:true, absorb:true, stabilize:true, pulseReleaseEnvelope:1 },
      control:{ targetId:'plate', relationshipSequence:7, strength01:0.56 } },
    pulse:{ active:true, focusedObject:'plate', relationshipTargetId:'plate' },
    bondState:{ active:true, objectId:'plate', blockReason:'absorbing', absorbProgress:0.3 }
  };
}

test('The existing HUD and telemetry expose feedback through the existing label setting', () => {
  const frame = interactionFrame();
  const hud = new PlaytestHudSystem({ recipeDataSystem:{ data:{} }, frameState:frame });
  const telemetry = new SessionTelemetrySystem({ frameState:frame, monotonicNowMs:() => 0 });
  frame.playtestHud = hud.resolveHudState(frame, true);
  assert.match(frame.playtestHud.auditLine, /Temporary · Scar plate · Stabilize control 56% · Pulse focused · Absorb drawing 30%/);
  assert.deepEqual(telemetry.exportSession().developerTruth.wave1Feedback, frame.playtestHud.languageRead.feedback);

  frame.quickLookInspector.coreLabelsEnabled = false;
  assert.equal(telemetry.exportSession().developerTruth.wave1Feedback, null);
  frame.playtestHud = hud.resolveHudState(frame, true);
  assert.ok(!frame.playtestHud.auditLine.includes('Stabilize control'));
  frame.quickLookInspector.coreLabelsEnabled = true;
  frame.playtestHud = hud.resolveHudState(frame, false);
  assert.equal(telemetry.exportSession().developerTruth.wave1Feedback, null);
});

test('Stale or unintegrated verb data cannot claim that control or a target effect was established', () => {
  const frame = interactionFrame();
  frame.verbComposition.control.strength01 = 0;
  assert.equal(readHostLanguage(frame).feedback.interaction.control.state, 'acquiring');
  frame.targeting.relationshipSequence += 1;
  assert.equal(readHostLanguage(frame).feedback.interaction.control.state, 'held');
  delete frame.verbComposition.control;
  assert.equal(readHostLanguage(frame).feedback.interaction.control.strengthPercent, null);

  frame.pulse.focusedObject = 'another-target';
  frame.bondState.objectId = 'another-target';
  const read = readHostLanguage(frame).feedback.interaction;
  assert.equal(read.pulse, 'released');
  assert.deepEqual(read.absorb, { state:'held', progressPercent:null });
  frame.input.pulsePressed = false;
  frame.pulse.focusedObject = 'plate';
  frame.pulse.age = 0.2;
  frame.targeting.relationshipAge = 0.3;
  assert.equal(readHostLanguage(frame).feedback.interaction.pulse, 'focused');
  frame.targeting.relationshipAge = 0.1;
  assert.equal(readHostLanguage(frame).feedback.interaction.pulse, 'released');
  frame.input.pulseHeld = true;
  assert.equal(readHostLanguage(frame).feedback.interaction.pulse, 'charging');
  frame.targeting.relationshipActive = false;
  assert.equal(readHostLanguage(frame).feedback.interaction.control.state, 'unbound');
  frame.inspectionCamera = { active:true };
  assert.equal(readHostLanguage(frame), null);
});

function regionalFrame(region, verb, after) {
  const siteId = `${region}_local_site`;
  return {
    activeCellId:cells[region], quickLookInspector:{ coreLabelsEnabled:true },
    territoryExploration:{ active:true, owner:`${region}:RegionalTerritoryExpansion`, region,
      nearestSiteId:siteId, nearestSiteDistance:1, localStateRetainedDuringSession:true,
      siteStates:[{ id:siteId, ...after }],
      lastRead:{ kind:'c0e1_local_exploratory_read', region, siteId, verb, retainedDuringSession:true,
        before:{ imprint:0.2, strain:0.4, void:0.1 }, after },
      c0e3:{ pass:'C0E3', activeTravelingPackets:2, completedWaves:3 }
    }
  };
}

test('Regional response reports measured changes, session-retained values and temporary waves', () => {
  const cases = [
    ['grave', 'pulse', { imprint:0.32, strain:0.4, void:0.1 }, /GRAVE · Last local pulse · memory imprint \+12 pts/],
    ['vascular', 'stabilize', { imprint:0.2, strain:0.28, void:0.1 }, /VASCULAR · Last local stabilize · current load −12 pts/],
    ['silt', 'absorb', { imprint:0.2, strain:0.4, void:0.3 }, /SILT · Last local absorb · extraction trace \+20 pts/]
  ];
  for (const [region, verb, after, expected] of cases) {
    const frame = regionalFrame(region, verb, after);
    const before = structuredClone(frame);
    const read = readHostLanguage(frame);
    assert.match(read.lines.join('\n'), expected);
    assert.match(read.lines.join('\n'), /Retained this session/);
    assert.match(read.lines.join('\n'), /Temporary · 2 traveling waves/);
    assert.equal(read.noReceiptInferred, true);
    assert.deepEqual(frame, before);

    frame.territoryExploration.nearestSiteDistance = 5;
    const distant = readHostLanguage(frame).feedback.host;
    assert.equal(distant.lastVerb, null);
    assert.deepEqual(distant.retained, {});
    frame.activeCellId = 'CELL_SIGNAL_CHORUS_NERVE_001';
    assert.equal(readHostLanguage(frame).feedback, undefined);
  }
});

test('Vascular pressure is temporary and requires the mounted response from the current Host episode', () => {
  const frame = regionalFrame('vascular', 'pulse', { imprint:0.2, strain:0.6, void:0.1 });
  const host = JSON.parse(readFileSync(new URL('../public/data/hosts/HOST_ALPHA_WOUNDED_NURSERY.json', import.meta.url), 'utf8'));
  frame.activeHostId = host.id;
  const episode = host.externalPressureEpisode;
  frame.runtimeSeconds = episode.onsetSeconds + episode.riseSeconds / 2;
  new HostConditionSystem({ recipeDataSystem:{ get:() => host }, frameState:frame }).init();
  frame.vascularRhythmRoute = { active:true, hostPressureResponse:readVascularHostPressure(frame) };
  const current = readHostLanguage(frame);
  assert.equal(current.feedback.host.pressurePercent, 50);
  assert.match(current.lines.join('\n'), /Temporary · 2 traveling waves · Host pressure 50%/);
  frame.runtimeSeconds += 0.1;
  assert.equal(readHostLanguage(frame).feedback.host.pressurePercent, null);
});
