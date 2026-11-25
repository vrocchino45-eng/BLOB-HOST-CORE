import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const CHECKPOINT = '2f90256a1047b748bf99f7aec39b70b2ed1aeffe';
const INPUTS = ['src', 'public', 'index.html', 'package.json', 'package-lock.json', 'npm-shrinkwrap.json',
  '.npmrc', ':(glob).env*', ':(glob)vite.config.*', ':(glob)postcss.config.*',
  ':(glob)tsconfig*.json', ':(glob)jsconfig*.json'];
const HEX40 = /^[0-9a-f]{40}$/;
const HEX64 = /^[0-9a-f]{64}$/;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const gitArgs = (root, args) => ['--no-optional-locks', '-C', root, ...args];
const git = (root, ...args) => execFileSync('git', gitArgs(root, args), { windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
const entryPath = entry => entry.slice(entry.indexOf('\t') + 1);
const authorityConfig = /^(?:\.env.*|vite\.config\..*|postcss\.config\..*|(?:tsconfig|jsconfig).*\.json)$/;
function tree(root, commit) {
  const rootConfig = git(root, 'ls-tree', '-z', commit).toString().split('\0').filter(Boolean)
    .map(entryPath).filter(file => authorityConfig.test(file));
  return git(root, 'ls-tree', '-r', '-z', commit, '--', ...INPUTS.filter(file => !file.startsWith(':')), ...rootConfig);
}

function inspectWorkingInputs(root, treeBytes) {
  const porcelain = git(root, 'status', '--porcelain=v1', '-z', '--ignored=matching', '--untracked-files=all', '--', ...INPUTS)
    .toString().split('\0').filter(Boolean);
  const paths = new Set(porcelain.map(entry => entry.slice(3)));
  for (const entry of treeBytes.toString().split('\0').filter(Boolean)) {
    const tab = entry.indexOf('\t');
    const [mode, kind, oid] = entry.slice(0, tab).split(' ');
    const filename = entry.slice(tab + 1);
    const file = path.join(root, filename);
    if (kind !== 'blob' || mode === '120000' || !fs.existsSync(file) || !fs.lstatSync(file).isFile()) {
      paths.add(filename);
      continue;
    }
    const bytes = fs.readFileSync(file);
    const workingOid = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
    if (workingOid !== oid) paths.add(filename);
  }
  return [...paths].sort();
}

function toolingRevision(root) {
  const base = path.join(root, 'BLOB_BOT_SERIES1/director');
  const dirFiles = fs.readdirSync(base, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(mjs|json)$/.test(entry.name))
    .map(entry => path.relative(root, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'));
  const files = [...dirFiles, 'BLOB_BOT_SERIES1/source-identity.mjs', 'BLOB_BOT_SERIES1/package-lock.json'].sort();
  return sha256(JSON.stringify(files.map(file => [file, sha256(fs.readFileSync(path.join(root, file)))])));
}

export function readBuildIdentity(root, checkpoint = CHECKPOINT) {
  const commit = git(root, 'rev-parse', 'HEAD').toString().trim();
  const ancestry = spawnSync('git', gitArgs(root, ['merge-base', '--is-ancestor', checkpoint, commit]), { windowsHide: true });
  const found = ancestry.status === 0;
  const basisExists = found || ancestry.status === 1;
  const current = tree(root, commit);
  return {
    commit,
    gameplayCheckpoint: checkpoint,
    gameplayAncestry: found,
    gameplayFingerprint: sha256(current),
    requiredGameplayFingerprint: basisExists ? sha256(tree(root, checkpoint)) : null,
    workingGameplayDifferences: inspectWorkingInputs(root, current),
    toolingRevision: toolingRevision(root)
  };
}

export function buildCompatibility(identity, checkpoint = CHECKPOINT) {
  if (!identity || !HEX40.test(identity.commit ?? '') || !HEX64.test(identity.gameplayFingerprint ?? '')
    || !HEX64.test(identity.requiredGameplayFingerprint ?? '') || !HEX64.test(identity.toolingRevision ?? '')
    || !Array.isArray(identity.workingGameplayDifferences)) {
    return { status: 'INCOMPATIBLE_BUILD', code: 'INVALID_BUILD_IDENTITY', errors: ['Missing or invalid source, gameplay fingerprint, or tooling identity'] };
  }
  if (identity.gameplayCheckpoint !== checkpoint || identity.gameplayAncestry !== true) {
    return { status: 'INCOMPATIBLE_BUILD', code: 'BASELINE_ANCESTRY_MISMATCH', errors: ['Source is outside the required gameplay ancestry'] };
  }
  if (identity.workingGameplayDifferences.length) {
    return { status: 'INCOMPATIBLE_BUILD', code: 'MODIFIED_GAMEPLAY_INPUTS',
      errors: ['Unadmitted working gameplay inputs: ' + identity.workingGameplayDifferences.join(', ')] };
  }
  if (identity.gameplayFingerprint !== identity.requiredGameplayFingerprint) {
    return { status: 'INCOMPATIBLE_BUILD', code: 'GAMEPLAY_FINGERPRINT_MISMATCH', errors: ['Authoritative gameplay input bytes differ from the required checkpoint'] };
  }
  return { status: 'PASS', code: identity.commit === checkpoint ? 'EXACT_CHECKPOINT' : 'COMPATIBLE_GAMEPLAY_DESCENDANT', errors: [] };
}
