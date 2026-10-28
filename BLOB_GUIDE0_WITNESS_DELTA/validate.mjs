import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const folder=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(folder);
const m=JSON.parse(fs.readFileSync(path.join(folder,'MANIFEST.json')));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for (const f of m.files){
 const target=path.join(root,f.path);
 if(!fs.existsSync(target)||sha(fs.readFileSync(target))!==f.after){
   console.error('GUIDE0-W not fully installed or file changed: '+f.path);
   process.exit(2);
 }
}
const src=path.join(root,'src/debug/WorldObjectCensusSystem.js');
execFileSync(process.execPath,[path.join(folder,'source_contract.mjs'),src],{stdio:'inherit'});
console.log('GUIDE0W_VALIDATED: exact installed bytes + read-only cross-owner evidence fixtures.');
