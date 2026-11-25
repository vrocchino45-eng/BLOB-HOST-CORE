import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { buildCompatibility, CHECKPOINT, readBuildIdentity } from './build-compatibility.mjs';
import { loadScenario, validateScenario } from './scenario-contract.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const actual = readBuildIdentity(root);
const scenario = (await loadScenario(new URL('./scenarios/balanced.json', import.meta.url), actual)).scenario;
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'director-authority-'));
const git = (...args) => execFileSync('git', ['-C', fixture, '-c', 'user.name=Fixture', '-c',
  'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', ...args], { encoding: 'utf8', windowsHide: true }).trim();
const write = (name, text) => {
  const file = path.join(fixture, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};
const commit = label => { git('add', '-A'); git('commit', '-qm', label); return git('rev-parse', 'HEAD'); };
git('init', '-q');
git('config', 'core.autocrlf', 'false');
write('src/main.js', 'export const fixture = true;\n');
write('public/state.json', '{}\n');
write('package.json', '{"type":"module"}\n');
write('package-lock.json', '{"version":"test-lock"}\n');
write('index.html', '<title>Fixture</title>\n');
write('BLOB_BOT_SERIES1/director/run.mjs', 'export const revision = 1;\n');
write('BLOB_BOT_SERIES1/source-identity.mjs', 'export {};\n');
write('BLOB_BOT_SERIES1/package-lock.json', '{}\n');
write('.gitignore', '.env.local\n');
const baseline = commit('baseline');
const before = readBuildIdentity(fixture, baseline);
write('docs/notes.md', 'Documentation only\n');
const docCommit = commit('docs');
const docs = readBuildIdentity(fixture, baseline);
write('BLOB_BOT_SERIES1/director/run.mjs', 'export const revision = 2;\n');
const toolCommit = commit('tooling');
const tooling = readBuildIdentity(fixture, baseline);
write('package-lock.json', '{"version":"different"}\n');
const configCommit = commit('dependency inputs');
const changedLock = readBuildIdentity(fixture, baseline);
write('src/main.js', 'export const fixture = false;\n');
const dirty = readBuildIdentity(fixture, baseline);
write('.env.local', 'VITE_TEST_FLAG=true\n');
const ignoredConfig = readBuildIdentity(fixture, baseline);

test('PI02 topology accepts its exact scenario checkpoint and the actual working tree', () => {
  assert.equal(actual.gameplayCheckpoint, CHECKPOINT);
  assert.equal(actual.gameplayAncestry, true);
  assert.deepEqual(actual.workingGameplayDifferences, []);
  assert.equal(validateScenario(scenario, actual).status, 'PASS');
  assert.equal(buildCompatibility({ ...actual, commit: CHECKPOINT }).code, 'EXACT_CHECKPOINT');
  assert.equal(buildCompatibility(before, baseline).code, 'EXACT_CHECKPOINT');
});
test('compatible descendants preserve the gameplay fingerprint and their own exact source commit', () => {
  assert.equal(docs.commit, docCommit);
  assert.equal(tooling.commit, toolCommit);
  for (const value of [docs, tooling]) {
    assert.equal(value.gameplayFingerprint, before.gameplayFingerprint);
    assert.equal(buildCompatibility(value, baseline).code, 'COMPATIBLE_GAMEPLAY_DESCENDANT');
  }
  assert.equal(docs.toolingRevision, before.toolingRevision);
  assert.notEqual(tooling.toolingRevision, docs.toolingRevision);
});
test('reject dependency input changes and dirty or ignored gameplay inputs', () => {
  assert.equal(changedLock.commit, configCommit);
  assert.equal(buildCompatibility(changedLock, baseline).code, 'GAMEPLAY_FINGERPRINT_MISMATCH');
  assert.ok(dirty.workingGameplayDifferences.includes('src/main.js'));
  assert.equal(buildCompatibility(dirty, baseline).code, 'MODIFIED_GAMEPLAY_INPUTS');
  assert.ok(ignoredConfig.workingGameplayDifferences.includes('.env.local'));
});
test('diagnostics separate missing identity, unrelated ancestry and unknown scenario revision', () => {
  for (const value of [undefined, 'bad-format']) {
    assert.equal(validateScenario(scenario, { ...actual, gameplayFingerprint: value }).code, 'INVALID_BUILD_IDENTITY');
  }
  assert.equal(validateScenario(scenario, { ...actual, gameplayAncestry: false }).code, 'BASELINE_ANCESTRY_MISMATCH');
  assert.equal(validateScenario({ ...scenario, revision: 2 }, actual).code, 'UNSUPPORTED_SCENARIO_REVISION');
  assert.equal(validateScenario({ ...scenario, build: { checkpoint: '1'.repeat(40) } }, actual).code, 'UNSUPPORTED_SCENARIO_CHECKPOINT');
});

