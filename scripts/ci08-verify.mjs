import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function install() {
  // The inherited mirror is private. Use public registry tarballs with exactly
  // the same locked versions and integrity digests, then restore the lockfile.
  const lockFile = 'package-lock.json';
  const original = fs.readFileSync(lockFile);
  const lock = JSON.parse(original.toString());
  const mirrorPath = '/artifactory/api/npm/npm-public/';
  for (const item of Object.values(lock.packages)) {
    if (!item.resolved?.startsWith('https:')) continue;
    const url = new URL(item.resolved);
    if (!url.pathname.startsWith(mirrorPath)) continue;
    assert.ok(item.integrity, 'Mirror replacement requires a locked integrity digest');
    item.resolved = 'https://registry.npmjs.org/' + url.pathname.slice(mirrorPath.length);
  }
  try {
    fs.writeFileSync(lockFile, JSON.stringify(lock, null, 2) + '\n');
    const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
    const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm ci --no-audit --no-fund'] : ['ci', '--no-audit', '--no-fund'];
    const run = spawnSync(command, args, { stdio: 'inherit' });
    process.exitCode = run.status ?? 1;
  } finally {
    fs.writeFileSync(lockFile, original);
  }
}

if (process.argv[2] === '--install') {
  install();
  process.exit(process.exitCode);
}

const out = path.resolve(process.argv[2] ?? 'CI08_RESULTS');
fs.mkdirSync(out, { recursive: true });
const cwd = process.cwd();
const git = (...args) => {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
};
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const source = git('rev-parse', 'HEAD');
if (process.env.GITHUB_SHA) assert.equal(process.env.GITHUB_SHA, source);
const plan = JSON.parse(fs.readFileSync(new URL('./ci08-plan.json', import.meta.url)));
if (process.argv[3] === '--numerical') plan.push({
  id: 'nf02-pi04-analytical', count: 16,
  args: ['--test','--test-reporter=tap','BLOB_BOT_SERIES1/director/numerics/NF02-contract.test.mjs',
    'BLOB_BOT_SERIES1/director/numerics/PI04-reference.test.mjs',
    'BLOB_BOT_SERIES1/director/numerics/NF04-contract.test.mjs']
});
const baseline = path.resolve(process.argv[4] ?? '');
const revision3 = path.resolve(process.argv[5] ?? '');
const revision4=path.resolve(process.argv[6] ?? '');
const revision5=path.resolve(process.argv[7] ?? '');
const revision6=path.resolve(process.argv[8] ?? '');
const baseCommit = '462f1278ea069b41b4c0216335f4bb9363ee38af';
assert.equal(git('-C', baseline, 'rev-parse', 'HEAD'), baseCommit);
assert.equal(git('-C', baseline, 'status', '--porcelain'), '');
assert.equal(git('-C', revision3, 'rev-parse', 'HEAD'), '133c979aa0fd420eeede40d51df55c7bda668663');
assert.equal(git('-C', revision3, 'status', '--porcelain'), '');
assert.equal(git('-C', revision4, 'rev-parse', 'HEAD'), '85b2b2732321646d0b9eed9fc159b72b87dff790');
assert.equal(git('-C', revision4, 'status', '--porcelain'), '');
assert.equal(git('-C', revision5, 'rev-parse', 'HEAD'), '0ce25cb38a303a63bcb86adb3be6c820fcde182f');
assert.equal(git('-C', revision5, 'status', '--porcelain'), '');
assert.equal(git('-C', revision6, 'rev-parse', 'HEAD'), 'cb4b746f4e677e8bc104b9bdd42eb8de4029980f');
assert.equal(git('-C', revision6, 'status', '--porcelain'), '');
const {buildCompatibility,readBuildIdentity}=await import('../BLOB_BOT_SERIES1/director/build-compatibility.mjs');
const {ACTIVE_CHECKPOINT}=await import('../BLOB_BOT_SERIES1/director/scenario-contract.mjs');
const accepted=buildCompatibility(readBuildIdentity(baseline,ACTIVE_CHECKPOINT),ACTIVE_CHECKPOINT);
const candidate=buildCompatibility(readBuildIdentity(cwd,ACTIVE_CHECKPOINT),ACTIVE_CHECKPOINT);
assert.equal(accepted.status,'PASS');
assert.equal(candidate.code,'GAMEPLAY_FINGERPRINT_MISMATCH');
const summary = { source, baseline:baseCommit, fingerprintGate:{baseline:accepted.code,candidate:candidate.code}, node: process.version, platform: process.platform, cases: [], verdict: 'PASS' };
const scrub = value => value.split(cwd).join('<checkout>').split(out).join('<evidence>');
for (const check of plan) {
  const args = check.build ? ['node_modules/vite/bin/vite.js', 'build', '--outDir', path.join(out, 'dist')] : check.args;
  const run = spawnSync(process.execPath, args, {
    cwd: check.id === 'director-compatibility' ? baseline : check.id === 'director-revision-3' ? revision3 : check.id === 'director-revision-4' ? revision4 : check.id === 'director-revision-5' ? revision5 : check.id === 'director-revision-6' ? revision6 : cwd,
    env: { ...process.env, BLOB_DIRECTOR_RUNNER_SHA:check.id==='director-revision-4'?'85b2b2732321646d0b9eed9fc159b72b87dff790':check.id==='director-revision-5'?'0ce25cb38a303a63bcb86adb3be6c820fcde182f':check.id==='director-revision-6'?'cb4b746f4e677e8bc104b9bdd42eb8de4029980f':source, BLOB_PI05_REPORT:path.join(out,'pi05-mounted.json'), BLOB_PI06_REPORT:path.join(out,'pi06-mounted.json'), BLOB_DIRECTOR_IN01_ROOT:baseline, BLOB_NF05_MOUNTED:path.join(out,'mounted.json'), ...(check.id === 'pi04-runtime' ? {BLOB_PI04_MOUNTED_REPORT:path.join(out,'mounted.json')} : {}) },
    encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 240000
  });
  const log = scrub((run.stdout ?? '') + (run.stderr ?? '') + (run.error?.message ?? ''));
  const passed = Number(log.match(/^# pass (\d+)$/m)?.[1] ?? 0);
  const expected = check.exception;
  const verdict = expected ? (run.status === 1 && log.includes(expected) ? 'BASELINE_EXCEPTION' : 'FAIL')
    : run.status === 0 && (check.count === undefined || passed === check.count) ? 'PASS' : 'FAIL';
  const filename = check.id + '.log';
  fs.writeFileSync(path.join(out, filename), log);
  summary.cases.push({ id: check.id, exitCode: run.status, passed, verdict, expected, log: filename });
  if (verdict === 'FAIL') summary.verdict = 'FAIL';
  console.log(check.id, verdict, passed);
}
const dist = path.join(out, 'dist');
if (fs.existsSync(dist)) {
  const files = fs.readdirSync(dist, { recursive: true, withFileTypes: true }).filter(entry => entry.isFile());
  summary.buildFiles = files.map(entry => {
    const file = path.join(entry.parentPath, entry.name);
    return { path: path.relative(dist, file).split(path.sep).join('/'), sha256: digest(fs.readFileSync(file)) };
  }).sort((a, b) => a.path.localeCompare(b.path, 'en'));
}
fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
process.exitCode = Number(summary.verdict !== 'PASS');
