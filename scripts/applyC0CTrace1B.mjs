#!/usr/bin/env node
// C0C-TRACE1-B / apply exact, reversible, guarded instrumentation delta.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(fs.readFileSync(path.resolve(here, '../patches/C0C_TRACE1_B_PATCH.json'), 'utf8'));
const root = process.cwd();
const mode = process.argv.includes('--apply') ? 'apply' : process.argv.includes('--revert') ? 'revert' : 'check';
const sha = x => createHash('sha256').update(x).digest('hex');
const backupPath = filename => `${filename}.C0C_TRACE1_B_BACKUP`;
const targets = spec.targets.map(target => {
  const file = path.resolve(root, target.path);
  if (!file.startsWith(root + path.sep)) throw new Error(`Unsafe target path: ${target.path}`);
  const source = fs.readFileSync(file, 'utf8');
  const state = sha(source) === target.expectedBeforeSha256 ? 'original'
    : sha(source) === target.expectedAfterSha256 ? 'instrumented' : 'different';
  return { ...target, file, source, state };
});

for (const entry of targets) {
  console.log(`${entry.path}: ${entry.state.toUpperCase()} (${sha(entry.source)})`);
}
if (mode === 'check') {
  console.log('Read-only check. Use --apply to install or --revert to restore original source.');
  process.exit(targets.every(t => t.state !== 'different') ? 0 : 2);
}

if (mode === 'apply') {
  if (targets.every(t => t.state === 'instrumented')) {
    console.log('TRACE1-B already applied; no files changed.'); process.exit(0);
  }
  if (targets.some(t => t.state !== 'original')) {
    console.error('REFUSED: every target must match the audited original (or both already installed). No files changed.');
    process.exit(2);
  }
  const applied = targets.map(t => {
    let output = t.source;
    for (const op of t.operations) {
      if (output.split(op.before).length !== 2) throw new Error(`Missing or ambiguous patch anchor: ${t.path}`);
      output = output.replace(op.before, op.after);
    }
    if (sha(output) !== t.expectedAfterSha256) throw new Error(`Output hash mismatch: ${t.path}`);
    if (fs.existsSync(backupPath(t.file)) && sha(fs.readFileSync(backupPath(t.file))) !== t.expectedBeforeSha256)
      throw new Error(`Existing backup differs from audited original: ${backupPath(t.file)}`);
    return { ...t, output };
  });
  for (const t of applied) if (!fs.existsSync(backupPath(t.file)))
    fs.writeFileSync(backupPath(t.file), t.source, { flag: 'wx' });
  try {
    for (const t of applied) fs.writeFileSync(t.file, t.output);
  } catch (err) {
    for (const t of applied) fs.writeFileSync(t.file, t.source);
    console.error('Write failed; originals restored.');
    throw err;
  }
  console.log('C0C-TRACE1-B applied to 2 owner files; exact backups retained.');
} else {
  if (targets.some(t => t.state !== 'instrumented')) {
    console.error('REFUSED: --revert only operates on exact TRACE1-B installed source.'); process.exit(2);
  }
  for (const t of targets) {
    const backup = backupPath(t.file);
    if (!fs.existsSync(backup) || sha(fs.readFileSync(backup)) !== t.expectedBeforeSha256) {
      console.error(`REFUSED: missing or modified original backup: ${backup}`); process.exit(2);
    }
  }
  for (const t of targets) fs.copyFileSync(backupPath(t.file), t.file);
  console.log('C0C-TRACE1-B reverted from original backups. Backups retained.');
}
