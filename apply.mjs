#!/usr/bin/env node
// C0D1-A exact-hash guarded single-owner delivery. No forced overwrite.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const relative = 'src/routes/VascularSiltSignalReceiver.js';
const target = path.join(root, relative);
const payload = path.join(dir, 'payload', relative);
const backup = path.join(dir, 'backups/VascularSiltSignalReceiver.C0C4.js');
const manifest = JSON.parse(fs.readFileSync(path.join(dir,'MANIFEST.json'), 'utf8'));
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const mode = process.argv[2] ?? '--check';
if (!['--check','--apply','--revert'].includes(mode)) {
  console.error('Usage: node BLOB_C0D1A_DELTA/apply.mjs --check|--apply|--revert');process.exit(2);
}
if (!fs.existsSync(target)) {
  console.error('NOT_FOUND: run commands from BLOB-HOST-CORE root containing src/ and package.json');process.exit(2);
}
const current = fs.readFileSync(target);
const currentHash = hash(current);
const ready = currentHash === manifest.sourceBeforeSha256;
const installed = currentHash === manifest.sourceAfterSha256;
if (mode === '--check') {
  if (ready) console.log('C0C4_READY: exact pre-C0D1-A Vascular receiver found');
  else if (installed) console.log('C0D1A_INSTALLED: no changes needed');
  else { console.error('DIFFERENT: '+currentHash+'; do not force-install'); process.exitCode = 1; }
} else if (mode === '--apply') {
  if (installed) { console.log('C0D1A_INSTALLED: already applied'); process.exit(0); }
  if (!ready) { console.error('DIFFERENT: refuse overwrite of modified receiver');process.exit(1); }
  const bytes=fs.readFileSync(payload);
  if (hash(bytes)!==manifest.sourceAfterSha256) {console.error('INVALID_PAYLOAD: package hash mismatch');process.exit(1);}
  fs.mkdirSync(path.dirname(backup),{recursive:true});
  if (fs.existsSync(backup) && hash(fs.readFileSync(backup))!==manifest.sourceBeforeSha256) {
    console.error('DIFFERENT_BACKUP: refusing to overwrite backup');process.exit(1);
  }
  if (!fs.existsSync(backup)) fs.writeFileSync(backup,current);
  fs.writeFileSync(target,bytes);
  if (hash(fs.readFileSync(target))!==manifest.sourceAfterSha256) throw Error('Write check failed; backup preserved');
  console.log('C0D1-A INSTALLED: Vascular receiver now exposes local applied-effect records; no Host or Grave wiring.');
} else {
  if (ready) { console.log('C0C4_READY: no C0D1-A change to revert');process.exit(0); }
  if (!installed) {console.error('DIFFERENT: refuse revert of modified receiver');process.exit(1);}
  if (!fs.existsSync(backup) || hash(fs.readFileSync(backup))!==manifest.sourceBeforeSha256) {
    console.error('NO_VALID_BACKUP: revert refused');process.exit(1);
  }
  fs.writeFileSync(target,fs.readFileSync(backup));
  if(hash(fs.readFileSync(target))!==manifest.sourceBeforeSha256) throw Error('Revert verification failed');
  console.log('C0D1-A REVERTED: exact C0C4 receiver restored');
}
