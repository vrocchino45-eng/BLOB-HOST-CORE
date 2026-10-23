#!/usr/bin/env node
// C0C-VIS1-B: hash-guarded, one-owner method-only patch; no forced overwrites.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const folder = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const target = path.join(root, 'src/routes/VascularRhythmRouteSystem.js');
const backup = path.join(folder, 'backups/VascularRhythmRouteSystem.VIS1A.js');
const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'MANIFEST.json'), 'utf8'));
const patch = JSON.parse(fs.readFileSync(path.join(folder, 'PATCH.json'), 'utf8'));
const sha = data => createHash('sha256').update(data).digest('hex');
const mode = process.argv[2] || '--check';
if (!['--check','--apply','--revert'].includes(mode)) {
  console.error('Usage: node BLOB_C0C_VIS1B_DELTA/apply.mjs --check|--apply|--revert');
  process.exit(2);
}
if (!fs.existsSync(target)) {console.error('NOT_FOUND: run this from your BLOB project root');process.exit(2);}
const current = fs.readFileSync(target);
const currentSha = sha(current);
const ready = currentSha === manifest.sourceBeforeSha256;
const installed = currentSha === manifest.sourceAfterSha256;
if (mode === '--check') {
  if (ready) console.log('VIS1A_READY: C0C-VIS1-B can be applied to exact current VIS1-A source');
  else if (installed) console.log('VIS1B_INSTALLED: C0C-VIS1-B is present');
  else { console.error('DIFFERENT: source hash '+currentSha+'; do not overwrite or force');process.exit(1); }
  process.exit(0);
}
if (mode === '--apply') {
  if (installed) {console.log('VIS1B_INSTALLED: no changes');process.exit(0);}
  if (!ready) {console.error('DIFFERENT: exact VIS1-A file required. No changes made.');process.exit(1);}
  const before = current.toString('utf8');
  if (before.split(patch.before).length !== 2) throw Error('Expected VIS1-A method not unique; no changes made');
  const updated = before.replace(patch.before,patch.after);
  if (sha(updated) !== manifest.sourceAfterSha256) throw Error('Patched file hash differs; no changes made');
  fs.mkdirSync(path.dirname(backup),{recursive:true});
  if (fs.existsSync(backup) && sha(fs.readFileSync(backup)) !== manifest.sourceBeforeSha256) {
    throw Error('Existing VIS1-B backup differs; refusing to overwrite');
  }
  if (!fs.existsSync(backup)) fs.writeFileSync(backup,current);
  fs.writeFileSync(target,updated);
  if (sha(fs.readFileSync(target)) !== manifest.sourceAfterSha256) throw Error('Write verification failed; backup preserved');
  console.log('C0C-VIS1-B INSTALLED. One Vascular visual method changed; exact VIS1-A backup retained inside delta/backups.');
} else {
  if (ready) {console.log('VIS1A_READY: no VIS1-B change to revert');process.exit(0);}
  if (!installed) {console.error('DIFFERENT: refuse to revert user-modified owner');process.exit(1);}
  if (!fs.existsSync(backup) || sha(fs.readFileSync(backup))!==manifest.sourceBeforeSha256) {
    console.error('NO_VALID_BACKUP: cannot safely revert');process.exit(1);
  }
  fs.writeFileSync(target,fs.readFileSync(backup));
  if(sha(fs.readFileSync(target))!==manifest.sourceBeforeSha256)throw Error('Revert verification failed');
  console.log('VIS1-A RESTORED exactly; VIS1-B no longer installed');
}
