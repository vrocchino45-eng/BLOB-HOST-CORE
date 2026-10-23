#!/usr/bin/env node
// BLOB C0C-VIS1-A — one-file, hash-guarded, reversible installer.
// Run from any working directory after extracting folder into BLOB project root.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(dir);
const route='src/routes/VascularRhythmRouteSystem.js';
const dest=path.join(root,route);
const payload=path.join(dir,'payload',route);
const backup=dest+'.C0C_VIS1_A_BACKUP';
const before='0399843208349c4a6315d4b339f3bc71de859594c0dc07b376a0f6f89cac385d';
const after='fb2c6897ea68b02b3cfe6f4f37b7e6ff11d5a80bf0da08a42f2eb18d250b9cbb';
const digest=b=>createHash('sha256').update(b).digest('hex');
const sha=f=>fs.existsSync(f)?digest(fs.readFileSync(f)):null;
const mode=process.argv.includes('--apply')?'apply':process.argv.includes('--revert')?'revert':'check';
if(sha(payload)!==after) {console.error('REFUSED: bundled payload hash does not match VIS1-A.');process.exit(2);}
const sourceHash=sha(dest);
const state=sourceHash===before?'TRACE1B_READY':sourceHash===after?'VIS1_INSTALLED':sourceHash===null?'MISSING':'DIFFERENT';
console.log(`${route}: ${state} (${sourceHash??'missing'})`);
if(mode==='check') {console.log('Read-only; to install run node BLOB_C0C_VIS1A_DELTA/apply.mjs --apply');process.exit(state==='DIFFERENT'||state==='MISSING'?2:0);}
if(mode==='apply') {
  if(state==='VIS1_INSTALLED') {console.log('Already installed. No changes.');process.exit(0);}
  if(state!=='TRACE1B_READY') {console.error('REFUSED: expected exact TRACE1-B source. No changes.');process.exit(2);}
  if(fs.existsSync(backup) && sha(backup)!==before){console.error('REFUSED: backup exists with unexpected contents.');process.exit(2);}
  // Preserve exact original source first, and only then replace known owner.
  if(!fs.existsSync(backup)) fs.writeFileSync(backup,fs.readFileSync(dest),{flag:'wx'});
  const tmp=dest+'.C0C_VIS1_A_INSTALL_TMP';
  if(fs.existsSync(tmp)){console.error('REFUSED: temporary install path already exists.');process.exit(2);}
  try {fs.copyFileSync(payload,tmp,fs.constants.COPYFILE_EXCL);fs.renameSync(tmp,dest);}
  catch(e){if(fs.existsSync(tmp))fs.unlinkSync(tmp);console.error('Installation failed; backed-up source preserved.');throw e;}
  if(sha(dest)!==after) {console.error('VERIFY FAILED: VIS1 source hash mismatch. Do not run gameplay.');process.exit(2);}
  console.log('C0C-VIS1-A INSTALLED. One gameplay owner changed; exact backup retained.');
} else {
  if(state!=='VIS1_INSTALLED'||sha(backup)!==before){console.error('REFUSED: revert requires exact VIS1 owner and exact TRACE1-B backup.');process.exit(2);}
  fs.copyFileSync(backup,dest);
  if(sha(dest)!==before){console.error('VERIFY FAILED: reverted source hash mismatch.');process.exit(2);}
  console.log('REVERTED to exact TRACE1-B owner; backup retained.');
}
