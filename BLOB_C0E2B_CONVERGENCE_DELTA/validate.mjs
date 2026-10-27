import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const folder=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(folder);
const manifest=JSON.parse(fs.readFileSync(path.join(folder,'MANIFEST.json'),'utf8'));
for(const f of manifest.files) if(!fs.existsSync(path.join(root,f.path))) throw new Error('MISSING: '+f.path);
for(const name of ['validateC0E2BTerritoryConvergence.mjs','validateC0E2CompoundSpatial.mjs',
 'validateC0E1CompoundTerritories.mjs','validateC0CRecorderFullSession.mjs','validateC0C2Accumulator.mjs']) {
 const output=execFileSync(process.execPath,[path.join(root,'scripts',name)],{cwd:root,encoding:'utf8'});
 console.log(output.trim());
}
