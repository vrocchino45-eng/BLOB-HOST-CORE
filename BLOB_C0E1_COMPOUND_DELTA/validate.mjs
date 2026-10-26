import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tests=['scripts/validateC0E1CompoundTerritories.mjs','scripts/validateC0CRecorderFullSession.mjs'];
for(const f of tests){const r=spawnSync(process.execPath,[path.join(root,f)],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
console.log('C0E1: compound mock scene + legacy REC1 checks passed; browser visibility not asserted');
