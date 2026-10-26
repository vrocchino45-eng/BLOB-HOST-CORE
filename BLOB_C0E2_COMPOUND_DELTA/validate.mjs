import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
for(const script of ['scripts/validateC0E2CompoundSpatial.mjs',
 'scripts/validateC0E1CompoundTerritories.mjs',
 'scripts/validateC0CRecorderFullSession.mjs',
 'scripts/validateC0C2Accumulator.mjs']) {
 console.log(execFileSync(process.execPath,[path.join(root,script)],{encoding:'utf8',maxBuffer:1024*1024}));
}
