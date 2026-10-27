import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const folder=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(folder);
const {files}=JSON.parse(fs.readFileSync(path.join(folder,'MANIFEST.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const file of files){
 const loc=path.join(root,file.path);
 if(!fs.existsSync(loc)||sha(fs.readFileSync(loc))!==file.after)
   throw Error('C0E3_NOT_INSTALLED_OR_MODIFIED: '+file.path);
}
for(const script of ['scripts/validateC0E3LivingRegionalCircuit.mjs',
 'scripts/validateC0E2BTerritoryConvergence.mjs',
 'scripts/validateC0E2CompoundSpatial.mjs','scripts/validateC0E1CompoundTerritories.mjs',
 'scripts/validateC0CRecorderFullSession.mjs','scripts/validateC0C2Accumulator.mjs']){
 execFileSync(process.execPath,[script],{cwd:root,stdio:'inherit',timeout:90000});
}
console.log('C0E3 VALIDATED: new living response + C0E2-B/C0E2/C0E1/REC1/accumulator checks all passed. Browser rendering not verified.');
