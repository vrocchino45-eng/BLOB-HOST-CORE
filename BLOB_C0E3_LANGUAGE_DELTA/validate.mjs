import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const d=path.dirname(fileURLToPath(import.meta.url));
const r=spawnSync(process.execPath,[path.join(path.dirname(d),'scripts','validateC0E3LanguageHud.mjs')],{stdio:'inherit'});
process.exit(r.status??1);
