import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildCompatibility, CHECKPOINT, readBuildIdentity } from './build-compatibility.mjs';

export const SCHEMA = 'blob.dev-scenario.v1';
export { CHECKPOINT };
const root = path.resolve(import.meta.dirname, '../..');
export const OUTCOMES = Object.freeze(['PASS', 'FAIL', 'NOT_EXERCISED', 'INVALID_SETUP', 'INCOMPATIBLE_BUILD']);
const text = value => typeof value === 'string' && value.length > 0;
const fraction = value => Number.isFinite(value) && value >= 0 && value <= 1;
const positive = value => Number.isFinite(value) && value > 0;
const vector = value => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
const oneOf = (...values) => value => values.includes(value);
const exact = value => oneOf(value);
const zone = oneOf('deep_core', 'inner_body', 'membrane');
const sha = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const requiredActions = ['canonical_selection', 'analog_flow_request', 'accepted_current', 'release', 'recovery_window'];
const requiredTelemetry = ['start', 'state', 'input', 'time', 'camera', 'reserve', 'flow', 'material', 'receipts', 'coverage'];
const arrayOf = (check, length) => value => Array.isArray(value) && value.length === length && value.every(check);
const integer = value => Number.isSafeInteger(value) && value >= 1;
const grain = (id, index) => id === `silt-grain-${String(index + 1).padStart(2, '0')}`;

function record(checks) {
  return (value, errors = [], at = 'scenario') => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
      errors.push(`${at} must be an object`);
      return false;
    }
    const oldLength = errors.length;
    for (const key of Object.keys(value)) if (!Object.hasOwn(checks, key)) errors.push(`${at}.${key} is unknown`);
    for (const [key, check] of Object.entries(checks)) {
      const keyPath = `${at}.${key}`;
      const before = errors.length;
      if (!Object.hasOwn(value, key) || (!check(value[key], errors, keyPath) && errors.length === before)) {
        errors.push(`${keyPath} is missing or invalid`);
      }
    }
    return oldLength === errors.length;
  };
}

const validateShape = record({
  schema: exact(SCHEMA),
  id: value => typeof value === 'string' && /^dl-exp-001\.(deep|balanced|membrane)$/.test(value),
  revision: exact(1),
  build: record({ checkpoint: sha }),
  environment: record({
    host: exact('HOST_ALPHA_WOUNDED_NURSERY'), cell: exact('CELL_SILT_PRESSURE_ROUTE_001'),
    receiver: exact('silt_porosity_shelf_front'), seed: exact(null), origin: exact('receiver-center-world'),
    offset: vector, facing: vector
  }),
  authoritative: record({
    core: record({ placements: arrayOf(zone, 3), reserve: fraction, source: exact('existing-debug-anatomy') }),
    material: record({ ids: value => Array.isArray(value) && value.length === 8 && value.every(grain),
      custody: exact('native-cycle'), generation: exact(0), totalMass: exact(8), cycle: exact('dormant') }),
    regional: record({ progression: exact('fresh'), receipts: exact(0), imprint: exact(0) }),
    relationships: record({ flow: exact('released'), attachment: exact('unattached'), grip: exact('unheld') })
  }),
  derived: record({ physiology: exact('derive-from-owner'), chemistry: exact('derive-from-owner') }),
  presentation: record({
    camera: exact('far-world'), yaw: Number.isFinite, pitch: Number.isFinite,
    width: exact(768), height: exact(432)
  }),
  input: record({ profile: exact('experimental-flow'), standardPad: exact(true), start: exact('neutral'),
    stabilize: fraction, demand: fraction }),
  initialize: exact('mounted-silt-shelf-v1'),
  requiredActions: value => arrayOf(text, requiredActions.length)(value) && requiredActions.every((s, i) => value[i] === s),
  acceptance: record({
    heldSeconds: positive, dose: fraction, minimumDose: fraction, objectiveLimitSeconds: positive, recoverySeconds: positive
  }),
  telemetry: value => arrayOf(text, requiredTelemetry.length)(value) && requiredTelemetry.every((s, i) => value[i] === s),
  reset: exact('fresh-disposable-browser-context'),
  expectedDurationSeconds: integer
});

export function validateScenario(scenario, identity = readBuildIdentity(root)) {
  if (scenario?.schema !== undefined && scenario.schema !== SCHEMA || scenario?.revision !== undefined && scenario.revision !== 1) {
    return { status: 'INVALID_SETUP', code: 'UNSUPPORTED_SCENARIO_REVISION', errors: ['The scenario schema and revision must be blob.dev-scenario.v1 revision 1'] };
  }
  const errors = [];
  if (!validateShape(scenario, errors)) return { status: 'INVALID_SETUP', errors };
  const layout = scenario.id.split('.').at(-1);
  const expected = {
    deep: ['deep_core', 'deep_core', 'deep_core'],
    balanced: ['deep_core', 'inner_body', 'membrane'],
    membrane: ['membrane', 'membrane', 'membrane']
  }[layout];
  if (scenario.authoritative.core.placements.some((entry, index) => entry !== expected[index])) errors.push('Scenario ID and layout disagree');
  if (Math.abs(Math.hypot(...scenario.environment.facing) - 1) > 1e-8) errors.push('Facing must be normalized');
  if (scenario.input.demand <= 0 || scenario.input.stabilize <= 0) errors.push('Analog action requires positive stabilize and demand');
  const rule = scenario.acceptance;
  if (rule.minimumDose <= 0 || rule.dose < rule.minimumDose || rule.heldSeconds > rule.objectiveLimitSeconds
    || scenario.expectedDurationSeconds < rule.objectiveLimitSeconds + rule.recoverySeconds) {
    errors.push('Duration and dose predicates are inconsistent');
  }
  if (errors.length) return { status: 'INVALID_SETUP', errors };
  if (scenario.build.checkpoint !== CHECKPOINT) {
    return { status: 'INCOMPATIBLE_BUILD', code: 'UNSUPPORTED_SCENARIO_CHECKPOINT', errors: ['Scenario references an unadmitted gameplay checkpoint'] };
  }
  return buildCompatibility(identity, scenario.build.checkpoint);
}

export async function loadScenario(path, identity) {
  let scenario;
  try {
    scenario = JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    return { status: 'INVALID_SETUP', errors: [error.message], scenario: null };
  }
  return { ...validateScenario(scenario, identity), scenario };
}
