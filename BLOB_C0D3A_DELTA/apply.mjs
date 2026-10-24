import {readFileSync,writeFileSync,existsSync,mkdirSync,renameSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const base=dirname(fileURLToPath(import.meta.url));
const root=resolve(base,'..');
const rel='src/routes/ReturnRegionEngineSystem.js';
const target=resolve(root,rel);
const src=resolve(base,'payload',rel);
const backup=resolve(base,'backups/ReturnRegionEngineSystem.C0D2.js');
const m=JSON.parse(readFileSync(resolve(base,'MANIFEST.json'),'utf8'));
const sum=(path)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const arg=process.argv[2]??'--check';
const die=(label)=>{console.error(label);process.exitCode=2;};
if(!existsSync(target)||!existsSync(src)){die('MISSING: target or package payload absent');process.exit();}
const cur=sum(target);
if(sum(src)!==m.installedSha256){die('DAMAGED: payload differs from manifest');process.exit();}
if (arg==='--check') {
 if(cur===m.baselineSha256) console.log('C0D2_READY: Grave return layout exact baseline found');
 else if(cur===m.installedSha256) console.log('C0D3A_INSTALLED: package already applied');
 else die(`DIFFERENT: no file changed; found ${cur}`);
} else if(arg==='--apply') {
 if(cur===m.installedSha256) console.log('C0D3A_INSTALLED: already applied, no overwrite');
 else if(cur!==m.baselineSha256) die(`DIFFERENT: no file changed; found ${cur}`);
 else {
  mkdirSync(dirname(backup),{recursive:true});
  if(existsSync(backup)&&sum(backup)!==m.baselineSha256){die('BACKUP_CONFLICT: no file changed');process.exit();}
  if(!existsSync(backup)) writeFileSync(backup,readFileSync(target));
  writeFileSync(target,readFileSync(src));
  if(sum(target)!==m.installedSha256){die('INSTALL_VERIFY_FAILED');process.exit();}
  console.log('C0D3A_INSTALLED: one return-layout owner updated; C0D2 backup retained');
 }
} else if(arg==='--revert') {
 if(cur===m.baselineSha256) console.log('C0D2_READY: already reverted');
 else if(cur!==m.installedSha256) die('DIFFERENT: refusing to revert modified target');
 else if(!existsSync(backup)||sum(backup)!==m.baselineSha256) die('BACKUP_MISSING_OR_DIFFERENT');
 else {writeFileSync(target,readFileSync(backup));console.log('C0D2_RESTORED: exact prior source restored');}
} else die('Usage: --check | --apply | --revert');
