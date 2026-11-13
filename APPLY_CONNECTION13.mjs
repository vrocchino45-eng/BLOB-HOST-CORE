import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url)),entries=[{"path": "BLOB_BOT_SERIES1/plan.json", "before": "af9443ac0879bb30201192c255215cb997a451d8989db1ea461baff04e4781f7", "after": "ba4daab01c147c104134036c683a9e1dc7ce13d8f6e7cbe77189799355d8188e"}, {"path": "BLOB_BOT_SERIES1/cases/browser.mjs", "before": "d137dc337a53350d0af9f77150784400c2addd6bac4fe639d92e2964a2e3d488", "after": "f2395a28abc920b0e7c10d41467606ca0b7c05e05b2e15f38bbf8f1dcb19f1e6"}, {"path": "BLOB_BOT_SERIES1/README.md", "before": "b23ef7766399722e9cbb7c21de1889f6f09da4481007a688555dedd21a311d47", "after": "e65b73ae130f47726a2fa222cf11a2e4c969dcacc2ffc4686ebeab18bfcb304a"}, {"path": "BLOB_BOT_SERIES1/cases/core-work-browser.mjs", "before": null, "after": "2cb48905835d0daf81ce0847cfa168c8e4a39bbfc518fc50b0732066929d396b"}];
const hash=b=>createHash('sha256').update(b.toString('utf8').replaceAll('\r\n','\n')).digest('hex');
const digest=p=>fs.existsSync(p)?hash(fs.readFileSync(p)):null;
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'CONNECTION13_PATCH',e.path),backup=e=>path.join(root,'CONNECTION13_BACKUP',e.path);
function replace(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});const tmp=p+'.connection13-'+process.pid+'.tmp';try{fs.writeFileSync(tmp,b,{flag:'wx'});fs.renameSync(tmp,p);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}}
try{
 const mode=process.argv[2]??'--apply';if(process.argv.length>3||!['--apply','--check','--restore'].includes(mode))throw Error('Usage: node APPLY_CONNECTION13.mjs [--apply | --check | --restore]');
 for(const e of entries){const d=digest(target(e));if(d!==e.before&&d!==e.after)throw Error('Unexpected version of '+e.path+'. Nothing changed; preserve later edits.');}
 const patched=entries.every(e=>digest(target(e))===e.after),base=entries.every(e=>digest(target(e))===e.before);
 if(mode==='--check'){console.log(patched?'CONNECTION13 installed.':base?'Expected baseline; ready to apply.':'Recognized partial installation; apply or restore can finish.');process.exit(0);}
 if(mode==='--restore'){
  if(base){console.log('Baseline already present.');process.exit(0);}
  for(const e of entries)if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Verified original backup missing for '+e.path+'. Nothing changed.');
  for(const e of [...entries].reverse())if(digest(target(e))!==e.before){if(e.before)replace(target(e),fs.readFileSync(backup(e)));else fs.unlinkSync(target(e));}
  console.log('Restored original sources/tools; kept prior reports and baseline backups. Gameplay is unchanged.');
 }else{
  if(patched){console.log('CONNECTION13 already installed.');process.exit(0);}
  for(const e of entries){if(digest(payload(e))!==e.after)throw Error('Invalid patch payload '+e.path+'. Nothing changed.');if(e.before&&fs.existsSync(backup(e))&&digest(backup(e))!==e.before)throw Error('Backup conflict '+e.path+'. Nothing changed.');if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Missing baseline backup '+e.path+'. Nothing changed.');}
  for(const e of entries)if(e.before&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
  console.log('Installed CONNECTION13. Originals are in CONNECTION13_BACKUP. Gameplay is unchanged.');
 }
}catch(e){console.error('[CONNECTION13] '+e.message);process.exitCode=1;}
