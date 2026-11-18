import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const entries=[{"path": "src/world/HostConditionSystem.js", "before": null, "after": "17df354479259ebcd3fa5d327a112efbc3ceb67595e9717404d474944138d861"}, {"path": "public/data/hosts/HOST_ALPHA_WOUNDED_NURSERY.json", "before": "fa2a394ddc349755be109384adc9d3bc996ea9e9eca4b8a45e88a7f0d384aa9f", "after": "c0a0a3a525571948b5e43fcbc74b10a19c7bd5978eab7f412c9c33f55ea49fb2"}, {"path": "src/core/GameRuntime.js", "before": "bac8d38cb5b1ca1ef61bf43118048c6e03c4e4d96377e47cb0d968365fd8abfb", "after": "e1b4f761221789c78663589d57b5babc68d61532eb53958a5f8a245699214c74"}, {"path": "src/routes/VascularRhythmRouteSystem.js", "before": "baf9ea9099e2387fe6c35e358756be814ca167921c76828488d4fe22c51217cd", "after": "cb602fc7f884c5f1941751e8295e272ec6651b6ce0a184945d138ede1c5ae56b"}];
const hash=b=>createHash('sha256').update(b).digest('hex');
const digest=p=>fs.existsSync(p)?hash(fs.readFileSync(p)):null;
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'HOST_CAUSE1_PATCH',e.path),backup=e=>path.join(root,'HOST_CAUSE1_BACKUP',e.path);
const fail=m=>{throw new Error(m);};
function replace(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});const temp=p+'.host-cause1-'+process.pid+'.tmp';try{fs.writeFileSync(temp,b,{flag:'wx'});fs.renameSync(temp,p);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
try{
 const mode=process.argv[2]??'--apply';
 if(!['--apply','--restore','--check'].includes(mode)||process.argv.length>3)fail('Usage: node APPLY_HOST_CAUSE1.mjs [--apply | --restore | --check]');

 if(mode!=='--restore') for(const p of [{"path": "src/core/HostCoreSourceAuthority.js", "sha256": "7cc5d6ef122b653fe44da2c1b22173aa1ec03a28ad617965468388d1696762ab"}, {"path": "src/data/RecipeDataSystem.js", "sha256": "e81b4ff3bc585ab0d966b28f1976e1c3aa1f4b0bfc4d28f42380f5109fb00b7f"}]) if(digest(path.join(root,p.path))!==p.sha256) fail('Install AUTHORITY1 first; unexpected authority source. Nothing changed.');
 for(const e of entries){const current=digest(target(e));if(current!==e.before&&current!==e.after)fail('Unexpected version of '+e.path+'. Nothing changed. Do not force over later work.');}
 const allBase=entries.every(e=>digest(target(e))===e.before),allPatched=entries.every(e=>digest(target(e))===e.after);
 if(mode==='--check'){console.log(allPatched?'HOST_CAUSE1 installed.':allBase?'Baseline matches; ready to install.':'Recognized partial install; apply or restore can finish it.');process.exit(0);}
 if(mode==='--restore'){
  if(allBase){console.log('Original files source already present. Nothing changed.');process.exit(0);}
  for(const e of entries)if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)fail('Verified original backup missing for '+e.path+'. Nothing changed.');
  // Restore importing source first, then remove only the exact files this patch added.
  for(const e of [...entries].reverse())if(digest(target(e))!==e.before){if(e.before)replace(target(e),fs.readFileSync(backup(e)));else fs.unlinkSync(target(e));}
  console.log('Restored original files source and removed exact patch additions. Reload the game page.');
 }else{
  if(allPatched){console.log('HOST_CAUSE1 already installed. Nothing changed.');process.exit(0);}
  for(const e of entries){if(digest(payload(e))!==e.after)fail('Payload verification failed: '+e.path+'. Nothing changed.');if(e.before&&fs.existsSync(backup(e))&&digest(backup(e))!==e.before)fail('Unexpected backup: '+e.path+'. Nothing changed.');if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)fail('Original backup missing for partial installation. Nothing changed.');}
  for(const e of entries)if(e.before&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  // Dependencies first; replace the importing owner only after they are present.
  for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
  console.log('Installed HOST_CAUSE1. Original files file saved in HOST_CAUSE1_BACKUP. Reload the game page.');
 }
}catch(e){console.error('[HOST_CAUSE1] '+e.message);process.exitCode=1;}
