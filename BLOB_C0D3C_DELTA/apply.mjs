import {readFileSync,writeFileSync,existsSync,mkdirSync,renameSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const base=dirname(fileURLToPath(import.meta.url)),root=resolve(base,'..');
const m=JSON.parse(readFileSync(resolve(base,'MANIFEST.json'),'utf8'));
const sum=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const files=m.changedGameplayFiles.map(rel=>({rel,target:resolve(root,rel),payload:resolve(base,'payload',rel),backup:resolve(base,'backups',rel),expected:m.expectedFiles[rel]}));
const fail=s=>{console.error(s);process.exitCode=2};
const action=process.argv[2]??'--check';
if(!['--check','--apply','--revert'].includes(action)){fail('Usage: --check | --apply | --revert');process.exit();}
if(files.some(f=>!existsSync(f.target)||!existsSync(f.payload)||sum(f.payload)!==f.expected.afterSha256)){
 fail('MISSING_OR_DAMAGED: target source or package payload absent');process.exit();
}
const state=files.map(f=>sum(f.target)===f.expected.beforeSha256?'before':sum(f.target)===f.expected.afterSha256?'after':'different');
const before=state.every(v=>v==='before'),after=state.every(v=>v==='after');
if(action==='--check'){
 if(before)console.log('C0D3B_READY: exact Silt owner source found');
 else if(after)console.log('C0D3C_INSTALLED: already installed');
 else fail('DIFFERENT: local Silt source does not match this package; no changes made: '+JSON.stringify(state));
} else if(action==='--apply'){
 if(after) console.log('C0D3C_INSTALLED: no changes needed');
 else if(!before) fail('DIFFERENT: refusing divergent Silt source');
 else if(files.some(f=>existsSync(f.backup)&&sum(f.backup)!==f.expected.beforeSha256))fail('BACKUP_CONFLICT: original backup differs');
 else {
  try{
   for(const f of files){mkdirSync(dirname(f.backup),{recursive:true});if(!existsSync(f.backup))writeFileSync(f.backup,readFileSync(f.target));}
   for(const f of files){const tmp=f.target+'.c0d3c-tmp';writeFileSync(tmp,readFileSync(f.payload));renameSync(tmp,f.target);}
   if(files.some(f=>sum(f.target)!==f.expected.afterSha256))throw new Error('installed hash mismatch');
   console.log('C0D3C_INSTALLED: one Silt gameplay owner changed; exact backup saved');
  }catch(error){for(const f of files)if(existsSync(f.backup)&&sum(f.backup)===f.expected.beforeSha256)writeFileSync(f.target,readFileSync(f.backup));fail('INSTALL_FAILED_AND_ROLLED_BACK: '+error.message)}
 }
}else{
 if(before)console.log('C0D3B_READY: already reverted');
 else if(!after)fail('DIFFERENT: cannot safely revert modified source');
 else if(files.some(f=>!existsSync(f.backup)||sum(f.backup)!==f.expected.beforeSha256))fail('BACKUP_MISSING_OR_DIFFERENT');
 else {for(const f of files)writeFileSync(f.target,readFileSync(f.backup));console.log('C0D3B_RESTORED: previous Silt owner restored');}
}
