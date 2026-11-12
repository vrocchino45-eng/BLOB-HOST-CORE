import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const entries=[{"path": "src/core/HostCoreSourceAuthority.js", "before": "23dfa2e4f5b4a927a931a740518a056a9bee725d1454f98068d354e5f135166f", "after": "7cc5d6ef122b653fe44da2c1b22173aa1ec03a28ad617965468388d1696762ab"}, {"path": "public/data/planning/blueprintTranslationLayer_HC003F.json", "before": "5c2ed2373148f8132ba5b9e66bdf1ffcb9001fe1c63376121d67fe3653b6db63", "after": "067094a8308ec6f8f2dd434856fff95eaf12e772a4bcdabe684be5e93312e495"}, {"path": "src/data/RecipeDataSystem.js", "before": "76cd0fd9475b147d945f1b8842208702000c12cd1d82e687f8553bb7939ce787", "after": "e81b4ff3bc585ab0d966b28f1976e1c3aa1f4b0bfc4d28f42380f5109fb00b7f"}];
const hash=b=>createHash('sha256').update(b).digest('hex');
const digest=p=>fs.existsSync(p)?hash(fs.readFileSync(p)):null;
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'AUTHORITY1_PATCH',e.path),backup=e=>path.join(root,'AUTHORITY1_BACKUP',e.path);
const fail=m=>{throw new Error(m);};
function replace(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});const temp=p+'.authority1-'+process.pid+'.tmp';try{fs.writeFileSync(temp,b,{flag:'wx'});fs.renameSync(temp,p);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
try{
 const mode=process.argv[2]??'--apply';
 if(!['--apply','--restore','--check'].includes(mode)||process.argv.length>3)fail('Usage: node APPLY_AUTHORITY1.mjs [--apply | --restore | --check]');
 for(const e of entries){const current=digest(target(e));if(current!==e.before&&current!==e.after)fail('Unexpected version of '+e.path+'. Nothing changed. Do not force over later work.');}
 const allBase=entries.every(e=>digest(target(e))===e.before),allPatched=entries.every(e=>digest(target(e))===e.after);
 if(mode==='--check'){console.log(allPatched?'AUTHORITY1 installed.':allBase?'Baseline matches; ready to install.':'Recognized partial install; apply or restore can finish it.');process.exit(0);}
 if(mode==='--restore'){
  if(allBase){console.log('Original files source already present. Nothing changed.');process.exit(0);}
  for(const e of entries)if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)fail('Verified original backup missing for '+e.path+'. Nothing changed.');
  // Restore importing source first, then remove only the exact files this patch added.
  for(const e of [...entries].reverse())if(digest(target(e))!==e.before){if(e.before)replace(target(e),fs.readFileSync(backup(e)));else fs.unlinkSync(target(e));}
  console.log('Restored original files source and removed exact patch additions. Reload the game page.');
 }else{
  if(allPatched){console.log('AUTHORITY1 already installed. Nothing changed.');process.exit(0);}
  for(const e of entries){if(digest(payload(e))!==e.after)fail('Payload verification failed: '+e.path+'. Nothing changed.');if(e.before&&fs.existsSync(backup(e))&&digest(backup(e))!==e.before)fail('Unexpected backup: '+e.path+'. Nothing changed.');if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)fail('Original backup missing for partial installation. Nothing changed.');}
  for(const e of entries)if(e.before&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  // Dependencies first; replace the importing owner only after they are present.
  for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
  console.log('Installed AUTHORITY1. Original files file saved in AUTHORITY1_BACKUP. Reload the game page.');
 }
}catch(e){console.error('[AUTHORITY1] '+e.message);process.exitCode=1;}
