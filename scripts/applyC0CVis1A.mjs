#!/usr/bin/env node
// C0C-VIS1-A: exact-hash, reversible, source-aware anatomical visual patch.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(fs.readFileSync(path.resolve(directory, '../patches/C0C_VIS1_A_PATCH.json'), 'utf8'));
const root = process.cwd();
const mode = process.argv.includes('--apply') ? 'apply' : process.argv.includes('--revert') ? 'revert' : 'check';
const digest = value => createHash('sha256').update(value).digest('hex');
const backup = file => `${file}.C0C_VIS1_A_BACKUP`;
const targets = spec.targets.map(target => {
  const full = path.resolve(root, target.path);
  if (!full.startsWith(root + path.sep)) throw new Error(`Invalid target path: ${target.path}`);
  if (!fs.existsSync(full)) throw new Error(`Missing source: ${target.path}`);
  const content = fs.readFileSync(full, 'utf8');
  return {
    ...target, full, content,
    status: digest(content) === target.expectedBeforeSha256 ? 'TRACE1B_READY'
      : digest(content) === target.expectedAfterSha256 ? 'VIS1_INSTALLED' : 'DIFFERENT'
  };
});
for (const target of targets) console.log(`${target.path}: ${target.status} (${digest(target.content)})`);
if (mode === 'check') {
  console.log('Read-only. Apply only if TRACE1B_READY; do not overwrite DIFFERENT source.');
  process.exit(targets.every(t => t.status !== 'DIFFERENT') ? 0 : 2);
}
if (mode === 'apply') {
  if (targets.every(t => t.status === 'VIS1_INSTALLED')) {
    console.log('VIS1-A already installed; nothing written.');
    process.exit(0);
  }
  if (targets.some(t => t.status !== 'TRACE1B_READY')) {
    console.error('REFUSED: source differs from audited TRACE1-B. Nothing written.');
    process.exit(2);
  }
  const changed = targets.map(t => {
    let output = t.content;
    for (const operation of t.operations) {
      if (output.split(operation.before).length !== 2)
        throw new Error(`Missing or ambiguous patch anchor: ${t.path}`);
      output = output.replace(operation.before, operation.after);
    }
    if (digest(output) !== t.expectedAfterSha256)
      throw new Error(`Post-patch hash mismatch: ${t.path}`);
    if (fs.existsSync(backup(t.full)) && digest(fs.readFileSync(backup(t.full))) !== t.expectedBeforeSha256)
      throw new Error(`Conflicting backup: ${backup(t.full)}`);
    return { ...t, output };
  });
  for (const t of changed) {
    if (!fs.existsSync(backup(t.full))) fs.writeFileSync(backup(t.full), t.content, { flag: 'wx' });
  }
  try {
    for (const t of changed) fs.writeFileSync(t.full, t.output, 'utf8');
  } catch (error) {
    for (const t of changed) fs.writeFileSync(t.full, t.content, 'utf8');
    console.error('Failed to write files; original bytes restored.');
    throw error;
  }
  console.log('C0C-VIS1-A applied; TRACE1-B source preserved in an exact backup.');
} else {
  if (targets.some(t => t.status !== 'VIS1_INSTALLED')) {
    console.error('REFUSED: rollback requires exact installed VIS1-A hash.');
    process.exit(2);
  }
  for (const t of targets) {
    if (!fs.existsSync(backup(t.full)) || digest(fs.readFileSync(backup(t.full))) !== t.expectedBeforeSha256) {
      console.error(`REFUSED: original backup absent or modified (${backup(t.full)}).`);
      process.exit(2);
    }
  }
  for (const t of targets) fs.copyFileSync(backup(t.full), t.full);
  console.log('C0C-VIS1-A reverted to TRACE1-B, with original backup retained.');
}
