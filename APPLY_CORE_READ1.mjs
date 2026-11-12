import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const entries=[{"path": "src/ui/PlaytestHudSystem.js", "before": "8411b8b7fd6ffeb66ce36e4c5986da8d12c99f190f8dd3a36e5f9a03a0d04623", "after": "9cece3e0a3f24cafaa1ab8a65bf961074d5ca9bda70b7bb798fa1e45f8d7e729"}];
const hash=b=>createHash('sha256').update(b).digest('hex');
const digest=p=>fs.existsSync(p)?hash(fs.readFileSync(p)):null;
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'CORE_READ1_PATCH',e.path),backup=e=>path.join(root,'CORE_READ1_BACKUP',e.path);
const fail=m=>{throw new Error(m);};
function replace(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});const temp=p+'.core-read1-'+process.pid+'.tmp';try{fs.writeFileSync(temp,b,{flag:'wx'});fs.renameSync(temp,p);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
try{
 const mode=process.argv[2]??'--apply';
 if(!['--apply','--restore','--check'].includes(mode)||process.argv.length>3)fail('Usage: node APPLY_CORE_READ1.mjs [--apply | --restore | --check]');
 for(const e of entries){const current=digest(target(e));if(current!==e.before&&current!==e.after)fail('Unexpected version of '+e.path+'. Nothing changed. Do not force over later work.');}
 const allBase=entries.every(e=>digest(target(e))===e.before),allPatched=entries.every(e=>digest(target(e))===e.after);
 if(mode==='--check'){console.log(allPatched?'CORE-READ1 installed.':allBase?'Baseline matches; ready to install.':'Recognized partial install; apply or restore can finish it.');process.exit(0);}
 if(mode==='--restore'){
  if(allBase){console.log('Original HUD source already present. Nothing changed.');process.exit(0);}
  for(const e of entries)if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)fail('Verified original backup missing for '+e.path+'. Nothing changed.');
  // Restore importing source first, then remove only the exact files this patch added.
  for(const e of [...entries].reverse())if(digest(target(e))!==e.before){if(e.before)replace(target(e),fs.readFileSync(backup(e)));else fs.unlinkSync(target(e));}
  console.log('Restored original HUD source and removed exact patch additions. Reload the game page.');
 }else{
  if(allPatched){console.log('CORE-READ1 already installed. Nothing changed.');process.exit(0);}
  for(const e of entries){if(digest(payload(e))!==e.after)fail('Payload verification failed: '+e.path+'. Nothing changed.');if(e.before&&fs.existsSync(backup(e))&&digest(backup(e))!==e.before)fail('Unexpected backup: '+e.path+'. Nothing changed.');if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)fail('Original backup missing for partial installation. Nothing changed.');}
  for(const e of entries)if(e.before&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  // Dependencies first; replace the importing owner only after they are present.
  for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
  console.log('Installed CORE-READ1. Original HUD file saved in CORE_READ1_BACKUP. Reload the game page.');
 }
}catch(e){console.error('[CORE-READ1] '+e.message);process.exitCode=1;}
