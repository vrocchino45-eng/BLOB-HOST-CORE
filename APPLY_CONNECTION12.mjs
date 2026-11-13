import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url)),entries=[{"path": "src/world/RegionalTerritoryExpansion.js", "before": "0362439d44a44b8d6004bf96fd67cf32bc31d464b4d7e52f17537e5553e18a34", "after": "26c2012e80a6405baf0fce942349bd986cda4bc47b48e1251c59fb2c409babf2"}, {"path": "BLOB_BOT_SERIES1/plan.json", "before": "5060c0603237997bc8b7f2396460a6768246f9ec2ea51e42c8ccc429e6682fda", "after": "af9443ac0879bb30201192c255215cb997a451d8989db1ea461baff04e4781f7"}, {"path": "BLOB_BOT_SERIES1/cases/browser.mjs", "before": "5ff8b7f459b6d8db870df34dc20f821d783e0a67673e933337067b61c2f39f4a", "after": "d137dc337a53350d0af9f77150784400c2addd6bac4fe639d92e2964a2e3d488"}, {"path": "BLOB_BOT_SERIES1/README.md", "before": "2111e710f3cd8f88c974db1cdaf8a86e7e2fca711d0a9c6371c1e29b1f56a347", "after": "b23ef7766399722e9cbb7c21de1889f6f09da4481007a688555dedd21a311d47"}, {"path": "BLOB_BOT_SERIES1/cases/L01.mjs", "before": null, "after": "734f293baa1fbf9a0c80c008861d2c5a9786301861117a4b77882094566fbc68"}, {"path": "BLOB_BOT_SERIES1/cases/territory-input-browser.mjs", "before": null, "after": "89fe795de8cf8de7fe64d73dccaad36915fc6e27f7c8fe0f1c7374cec25d2c83"}];
const hash=b=>createHash('sha256').update(b.toString('utf8').replaceAll('\r\n','\n')).digest('hex');
const digest=p=>fs.existsSync(p)?hash(fs.readFileSync(p)):null;
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'CONNECTION12_PATCH',e.path),backup=e=>path.join(root,'CONNECTION12_BACKUP',e.path);
function replace(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});const tmp=p+'.connection12-'+process.pid+'.tmp';try{fs.writeFileSync(tmp,b,{flag:'wx'});fs.renameSync(tmp,p);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}}
try{
 const mode=process.argv[2]??'--apply';if(process.argv.length>3||!['--apply','--check','--restore'].includes(mode))throw Error('Usage: node APPLY_CONNECTION12.mjs [--apply | --check | --restore]');
 for(const e of entries){const d=digest(target(e));if(d!==e.before&&d!==e.after)throw Error('Unexpected version of '+e.path+'. Nothing changed; preserve later edits.');}
 const patched=entries.every(e=>digest(target(e))===e.after),base=entries.every(e=>digest(target(e))===e.before);
 if(mode==='--check'){console.log(patched?'CONNECTION12 installed.':base?'Expected baseline; ready to apply.':'Recognized partial installation; apply or restore can finish.');process.exit(0);}
 if(mode==='--restore'){
  if(base){console.log('Baseline already present.');process.exit(0);}
  for(const e of entries)if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Verified original backup missing for '+e.path+'. Nothing changed.');
  for(const e of [...entries].reverse())if(digest(target(e))!==e.before){if(e.before)replace(target(e),fs.readFileSync(backup(e)));else fs.unlinkSync(target(e));}
  console.log('Restored original sources/tools; kept prior reports and baseline backups. Reload the game.');
 }else{
  if(patched){console.log('CONNECTION12 already installed.');process.exit(0);}
  for(const e of entries){if(digest(payload(e))!==e.after)throw Error('Invalid patch payload '+e.path+'. Nothing changed.');if(e.before&&fs.existsSync(backup(e))&&digest(backup(e))!==e.before)throw Error('Backup conflict '+e.path+'. Nothing changed.');if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Missing baseline backup '+e.path+'. Nothing changed.');}
  for(const e of entries)if(e.before&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
  console.log('Installed CONNECTION12. Originals are in CONNECTION12_BACKUP. Reload the game.');
 }
}catch(e){console.error('[CONNECTION12] '+e.message);process.exitCode=1;}
