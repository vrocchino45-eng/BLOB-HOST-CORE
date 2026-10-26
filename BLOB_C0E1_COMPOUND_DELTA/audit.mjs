// Read-only C0E1 baseline audit. No modifications to game files, Git, or installer.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const manifestFile = path.join(here, 'MANIFEST.json');
if (!fs.existsSync(manifestFile)) {
  console.error('Manifest not found. Put audit.mjs beside BLOB_C0E1_COMPOUND_DELTA/MANIFEST.json.');
  process.exit(2);
}
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const root = path.dirname(here);
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
let divergent = 0, ready = 0, installed = 0;
console.log(`C0E1 SOURCE COMPATIBILITY | root: ${root}`);
console.log('Read-only audit; nothing will be overwritten.');
for (const f of manifest.files) {
  const livePath = path.join(root, f.path);
  const body = fs.existsSync(livePath) ? fs.readFileSync(livePath) : null;
  const actual = body && sha(body);
  const expected = f.before;
  const target = f.after;
  let status = '';
  if (actual === target) {status = 'ALREADY_C0E1';installed++;}
  else if (actual === expected) {status = 'READY';ready++;}
  else {
    status = 'DIFFERENT';divergent++;
    if (body && expected !== null) {
      const norm = sha(Buffer.from(body.toString('utf8').replace(/\r\n/g, '\n')));
      if (norm === expected) status += ' (CRLF line endings only vs expected LF)';
      const withBOM = body.length >= 3 && body[0]===0xef && body[1]===0xbb && body[2]===0xbf;
      if (withBOM && sha(body.subarray(3))===expected) status += ' (UTF-8 BOM only)';
    }
  }
  console.log(`\n${status.padEnd(18)} ${f.path}`);
  if (status.startsWith('DIFFERENT')) {
    console.log('  Actual   : '+(actual ?? '<missing>'));
    console.log('  Expected : '+(expected ?? '<absent>'));
    console.log('  C0E1     : '+target);
    if (f.before !== null && fs.existsSync(path.join(here,'payload',f.path))) {
      console.log('  Tip      : compare active source with older patch payload; DO NOT overwrite until reconciled.');
    }
  }
}
console.log(`\nTOTALS: ready=${ready} already_C0E1=${installed} different=${divergent}`);
if (divergent === 0 && installed === manifest.files.length) console.log('RESULT: C0E1 is already fully installed.');
else if (divergent === 0 && ready === manifest.files.length) console.log('RESULT: exact base confirmed. Standard --apply is safe.');
else if (divergent === 0) console.log('RESULT: mixed known base/C0E1. Original installer cannot apply partial state; reconcile first.');
else console.log('RESULT: STOP. Do not force installer. Review the DIFFERENT paths.');
