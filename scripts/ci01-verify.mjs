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

const out = path.resolve(process.argv[2] ?? 'CI01_RESULTS');
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
const plan = JSON.parse(fs.readFileSync(new URL('./ci01-plan.json', import.meta.url)));
const summary = { source, node: process.version, platform: process.platform, cases: [], verdict: 'PASS' };
const scrub = value => value.split(cwd).join('<checkout>').split(out).join('<evidence>');
for (const check of plan) {
  const args = check.build ? ['node_modules/vite/bin/vite.js', 'build', '--outDir', path.join(out, 'dist')] : check.args;
  const run = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 240000 });
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
