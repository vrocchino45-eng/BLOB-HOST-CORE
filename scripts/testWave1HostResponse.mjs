import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { Group, Vector3 } from 'three';
import { LocalChemistryContextSystem } from '../src/chemistry/LocalChemistryContextSystem.js';
import { VerbCompositionSystem } from '../src/interaction/VerbCompositionSystem.js';
import { RegionalTerritoryExpansion, territoryDefinition } from '../src/world/RegionalTerritoryExpansion.js';

const json = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const cells = json('../public/data/world/localCellRecipes.json');
const host = json('../public/data/hosts/HOST_ALPHA_WOUNDED_NURSERY.json');
const step = 0.06;
const chargedPulse = { pulsePressed: true, pulseEventId: 1, pulseReleaseKind: 'charged', pulseReleaseCharge01: 1 };

function makeTerritory(kind, { validChemistry = true, phaseCount = 3 } = {}) {
  const cell = cells.find(({ id }) => id === territoryDefinition(kind).cell);
  const frameState = {
    frame: 0,
    runtimeSeconds: 0,
    activeHostId: host.id,
    activeCellId: cell.id,
    coreEngine: Object.freeze({ active: true, phaseCount }),
    hostCondition: Object.freeze({ amplitude: 0.7 }),
    physicalFeel: Object.freeze({ pressure: 0.4 })
  };
  const recipes = {
    get(group, id) {
      if (group === 'localCellRecipes' && id === cell.id) return cell;
      if (group === 'hosts' && id === host.id) return host;
    }
  };
  const chemistry = new LocalChemistryContextSystem({ recipeDataSystem: recipes, frameState });
  const composition = new VerbCompositionSystem({ frameState });
  const territory = new RegionalTerritoryExpansion({ kind, parent: new Group() });
  composition.init();
  const point = territory.root.localToWorld(territory.sites[0].point.clone());

  function tick(input = {}, { location = point, sample = true } = {}) {
    frameState.frame += 1;
    frameState.runtimeSeconds += step;
    frameState.input = input;
    if (validChemistry && sample) chemistry.update(step, frameState);
    composition.update(step, frameState);
    territory.update({ dt: step, playerPosition: location, input, frameState });
  }

  tick();
  territory.sites[0].strain = 0.55;
  return {
    frameState,
    territory,
    tick,
    act(verb) {
      if (verb === 'pulse') tick(chargedPulse);
      else for (let i = 0; i < 12; i += 1) tick({ [`${verb}Held`]: true });
      const event = frameState.territoryExplorationLastRead;
      assert.equal(event.verb, verb);
      return event;
    }
  };
}

const signatures = {
  grave: { pulse: ['imprint', 1], absorb: ['imprint', 1], stabilize: ['imprint', 1] },
  vascular: { pulse: ['strain', 1], absorb: ['strain', -1], stabilize: ['strain', -1] },
  silt: { pulse: ['strain', 1], absorb: ['void', 1], stabilize: ['imprint', 1] }
};

for (const [kind, verbs] of Object.entries(signatures)) {
  test(`${kind} chemistry shapes each verb in the existing local circuit`, () => {
    for (const [verb, [component, direction]] of Object.entries(verbs)) {
      const local = makeTerritory(kind);
      const baseline = makeTerritory(kind, { validChemistry: false }).act(verb);
      const event = local.act(verb);
      assert.equal(event.region, kind);
      assert.equal(event.localSequence, 1);
      assert.ok((event.after[component] - baseline.after[component]) * direction > 0.025, verb);
      assert.ok(event.noHostReceipt && event.noMatterTransfer && event.noProgressionCredit);
      for (const state of local.frameState.territoryExploration.siteStates) {
        for (const key of ['imprint', 'strain', 'void']) assert.ok(state[key] >= 0 && state[key] <= 1);
      }
      assert.equal(local.frameState.physicalFeel.pressure, 0.4);
      assert.equal(local.frameState.hostCondition.amplitude, 0.7);
    }
  });
}

test('Pulse answers actual releases once, with charge and the ambient chord effect', () => {
  const game = makeTerritory('grave');
  game.tick({ pulseHeld: true, pulseCharge01: 1 });
  assert.equal(game.territory.observationCount.pulse, 0);
  const charged = game.act('pulse');
  assert.equal(charged.livingCircuit.emittedPackets.length, 2);
  assert.ok(charged.localCircuit.transfer.some(({ component }) => component === 'imprint'));
  game.tick(chargedPulse);
  game.tick({ pulseEventId: 1 });
  assert.equal(game.territory.observationCount.pulse, 1);
  for (let i = 0; i < 25; i += 1) game.tick({ pulseEventId: 1 });
  assert.equal(game.frameState.territoryExploration.c0e3.completedWaves, 2);

  const quick = makeTerritory('grave');
  quick.tick({ pulsePressed: true, pulseEventId: 1, pulseReleaseKind: 'quick' });
  const opposed = makeTerritory('grave');
  opposed.tick({ ...chargedPulse, absorbHeld: true });
  assert.ok(charged.after.imprint > quick.frameState.territoryExplorationLastRead.after.imprint);
  assert.ok(charged.after.imprint > opposed.frameState.territoryExplorationLastRead.after.imprint);

  const remote = makeTerritory('grave');
  remote.tick(chargedPulse, { location: new Vector3(100, 0, 0) });
  remote.tick(chargedPulse);
  assert.equal(remote.territory.observationCount.pulse, 0);
});

test('Local response uses a current cell chemistry sample and preserves Hub behavior', () => {
  const expected = makeTerritory('grave', { validChemistry: false }).act('pulse').after;
  const stale = makeTerritory('grave');
  stale.tick(chargedPulse, { sample: false });
  assert.deepEqual(stale.frameState.territoryExplorationLastRead.after, expected);
  const transition = makeTerritory('grave');
  transition.frameState.localCellBoundaryMorph = { active: true };
  assert.deepEqual(transition.act('pulse').after, expected);

  const hub = makeTerritory('hub');
  const legacyHub = makeTerritory('hub', { validChemistry: false });
  assert.deepEqual(hub.act('pulse'), legacyHub.act('pulse'));
});

test('The Host response preserves the 3, 6, and 12 Core phases and territory structure', () => {
  const outcomes = [3, 6, 12].map((phaseCount) => {
    const game = makeTerritory('silt', { phaseCount });
    const outcome = game.act('stabilize');
    const snapshot = game.frameState.territoryExploration;
    assert.equal(game.frameState.coreEngine.phaseCount, phaseCount);
    assert.deepEqual([snapshot.structuralSites, snapshot.counterpartRibsPerSite, snapshot.phaseFlecksPerSite], [3, 6, 12]);
    return outcome.after;
  });
  assert.deepEqual(outcomes, [outcomes[0], outcomes[0], outcomes[0]]);
});
