import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CHECKPOINT, OUTCOMES, loadScenario, validateScenario } from './scenario-contract.mjs';

const scenarioFile = layout => new URL(`./scenarios/${layout}.json`, import.meta.url);
const valid = (await loadScenario(scenarioFile('deep'))).scenario;

test('version one definitions validate on the exact build', async () => {
  for (const layout of ['deep', 'balanced', 'membrane']) {
    assert.equal((await loadScenario(scenarioFile(layout), CHECKPOINT)).status, 'PASS');
  }
});

test('wrong build is incompatible', () => {
  assert.equal(validateScenario(valid, '0'.repeat(40)).status, 'INCOMPATIBLE_BUILD');
  assert.equal(OUTCOMES.length, 5);
});

test('malformed documents fail before setup', async () => {
  const malformed = [
    entry => { delete entry.initialize; },
    entry => { entry.revision = 2; },
    entry => { entry.id = 'dl-exp-001.membrane'; },
    entry => { entry.environment.facing = [0, 0, 0]; },
    entry => { entry.environment.seed = 42; },
    entry => { entry.environment.cell = 'unknown'; },
    entry => { entry.authoritative.core.reserve = 1.5; },
    entry => { entry.authoritative.material.ids[1] = entry.authoritative.material.ids[0]; },
    entry => { entry.authoritative.material.custody = 'duplicated'; },
    entry => { entry.authoritative.relationships.grip = 'held'; },
    entry => { entry.derived.physiology = { response: 1 }; },
    entry => { entry.derived.chemistry = { exposure: 1 }; },
    entry => { entry.presentation.width = '768'; },
    entry => { entry.input.demand = 0; },
    entry => { entry.input.profile = 'ordinary'; },
    entry => { entry.requiredActions.splice(2, 1); },
    entry => { entry.acceptance.dose = 0; },
    entry => { entry.telemetry.splice(5, 1); },
    entry => { entry.reset = 'reuse ordinary session'; },
    entry => { entry.expectedDurationSeconds = 1; },
    entry => { entry.extra = 'unknown'; }
  ];
  for (const mutate of malformed) {
    const scenario = structuredClone(valid);
    mutate(scenario);
    const result = validateScenario(scenario);
    assert.equal(result.status, 'INVALID_SETUP', JSON.stringify(scenario));
    assert.ok(result.errors.length >= 1);
  }
  assert.equal((await loadScenario(new URL('./scenarios/absent.json', import.meta.url))).status, 'INVALID_SETUP');
});
