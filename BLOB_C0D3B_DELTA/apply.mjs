import {readFileSync,writeFileSync,existsSync,mkdirSync,renameSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
const base=dirname(fileURLToPath(import.meta.url)), root=resolve(base,'..');
const m=JSON.parse(readFileSync(resolve(base,'MANIFEST.json'),'utf8'));
const sum=(p)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const fail=(s)=>{console.error(s);process.exitCode=2;};
const files=m.changedGameplayFiles.map(rel=>({rel,target:resolve(root,rel),payload:resolve(base,'payload',rel),backup:resolve(base,'backups',rel),expected:m.expectedFiles[rel]}));
const arg=process.argv[2]??'--check';
if(!['--check','--apply','--revert'].includes(arg)){fail('Usage: --check | --apply | --revert');process.exit();}
if(files.some(f=>!existsSync(f.target)||!existsSync(f.payload)||sum(f.payload)!==f.expected.afterSha256)){fail('MISSING_OR_DAMAGED: target or package payload absent');process.exit();}
const states=files.map(f=>sum(f.target)===f.expected.beforeSha256?'before':sum(f.target)===f.expected.afterSha256?'after':'different');
const before=states.every(x=>x==='before'), after=states.every(x=>x==='after');
if(arg==='--check'){
 if(before) console.log('C0D3A_READY: exact Grave II and Host owner baselines found');
 else if(after) console.log('C0D3B_INSTALLED: already installed');
 else fail('DIFFERENT: no files changed; mixed or unknown source hashes: '+JSON.stringify(Object.fromEntries(files.map((f,i)=>[f.rel,states[i]]))));
} else if(arg==='--apply'){
 if(after) console.log('C0D3B_INSTALLED: no changes needed');
 else if(!before) fail('DIFFERENT: refusing partial or divergent installation');
 else if(files.some(f=>existsSync(f.backup)&&sum(f.backup)!==f.expected.beforeSha256)) fail('BACKUP_CONFLICT: refusing installation');
 else{
  try{
   for(const f of files){mkdirSync(dirname(f.backup),{recursive:true});if(!existsSync(f.backup))writeFileSync(f.backup,readFileSync(f.target));}
   for(const f of files){const temp=f.target+'.c0d3b-tmp';writeFileSync(temp,readFileSync(f.payload));renameSync(temp,f.target);}
   if(files.some(f=>sum(f.target)!==f.expected.afterSha256)) throw new Error('installed hash mismatch');
   console.log('C0D3B_INSTALLED: three owned source files updated; exact backups retained; Grave II outcome now reaches Host');
  }catch(e){for(const f of files){if(existsSync(f.backup)&&sum(f.backup)===f.expected.beforeSha256)writeFileSync(f.target,readFileSync(f.backup));}fail('INSTALL_FAILED_AND_ROLLED_BACK: '+e.message);}
 }
} else {
 if(before) console.log('C0D3A_READY: already reverted');
 else if(!after) fail('DIFFERENT: cannot safely revert modified or mixed targets');
 else if(files.some(f=>!existsSync(f.backup)||sum(f.backup)!==f.expected.beforeSha256)) fail('BACKUP_MISSING_OR_DIFFERENT');
 else{for(const f of files) writeFileSync(f.target,readFileSync(f.backup));console.log('C0D3A_RESTORED: exact previous three files restored');}
}
