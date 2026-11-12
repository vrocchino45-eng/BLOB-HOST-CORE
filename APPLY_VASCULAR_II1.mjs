import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const entries=[{"path": "src/routes/VascularReturnHandoff.js", "before": null, "after": "beca06ef8b2bbee79fca86bf7db994ed36266cec16565cec78f8cc6e4a8a2b49"}, {"path": "VASCULAR_II1_TEST_START.mjs", "before": null, "after": "ebf4dd8d27df54ddf06fb8360a0c21c8cd18bcccfee4a14199afa5d1ee396246"}, {"path": "src/routes/VascularRhythmRouteSystem.js", "before": "ff986332b69ad75f8d555b822450d988a7c8ee1dab1e27a823a35ab784714986", "after": "baf9ea9099e2387fe6c35e358756be814ca167921c76828488d4fe22c51217cd"}];
const hash=b=>createHash('sha256').update(b).digest('hex');
const digest=p=>fs.existsSync(p)?hash(fs.readFileSync(p)):null;
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'VASCULAR_II1_PATCH',e.path),backup=e=>path.join(root,'VASCULAR_II1_BACKUP',e.path);
const fail=m=>{throw new Error(m);};
function replace(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});const temp=p+'.vascular-ii1-'+process.pid+'.tmp';try{fs.writeFileSync(temp,b,{flag:'wx'});fs.renameSync(temp,p);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
try{
 const mode=process.argv[2]??'--apply';
 if(!['--apply','--restore','--check'].includes(mode)||process.argv.length>3)fail('Usage: node APPLY_VASCULAR_II1.mjs [--apply | --restore | --check]');
 for(const e of entries){const current=digest(target(e));if(current!==e.before&&current!==e.after)fail('Unexpected version of '+e.path+'. Nothing changed. Do not force over later work.');}
 const allBase=entries.every(e=>digest(target(e))===e.before),allPatched=entries.every(e=>digest(target(e))===e.after);
 if(mode==='--check'){console.log(allPatched?'VASCULAR-II1 installed.':allBase?'Baseline matches; ready to install.':'Recognized partial install; apply or restore can finish it.');process.exit(0);}
 if(mode==='--restore'){
  if(allBase){console.log('Original Vascular source already present. Nothing changed.');process.exit(0);}
  for(const e of entries)if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)fail('Verified original backup missing for '+e.path+'. Nothing changed.');
  // Restore importing source first, then remove only the exact files this patch added.
  for(const e of [...entries].reverse())if(digest(target(e))!==e.before){if(e.before)replace(target(e),fs.readFileSync(backup(e)));else fs.unlinkSync(target(e));}
  console.log('Restored original Vascular source and removed exact patch additions. Reload the game page.');
 }else{
  if(allPatched){console.log('VASCULAR-II1 already installed. Nothing changed.');process.exit(0);}
  for(const e of entries){if(digest(payload(e))!==e.after)fail('Payload verification failed: '+e.path+'. Nothing changed.');if(e.before&&fs.existsSync(backup(e))&&digest(backup(e))!==e.before)fail('Unexpected backup: '+e.path+'. Nothing changed.');if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)fail('Original backup missing for partial installation. Nothing changed.');}
  for(const e of entries)if(e.before&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  // Dependencies first; replace the importing owner only after they are present.
  for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
  console.log('Installed VASCULAR-II1. Original Vascular file saved in VASCULAR_II1_BACKUP. Reload the game page.');
 }
}catch(e){console.error('[VASCULAR-II1] '+e.message);process.exitCode=1;}
