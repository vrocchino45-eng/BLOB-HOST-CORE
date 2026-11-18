import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url)),entries=[{"path": "src/routes/VascularRhythmRouteSystem.js", "before": "25d16da7ae8bfa04f1f53e955ccfb182240cc332b0070f5f81fd3b94513312ea", "after": "48a422c200329e20d3d114d054988d9bba71efd3c6528ea5df32655c1fb7674d"}, {"path": "BLOB_BOT_SERIES1/plan.json", "before": "94f22b677e7d085e93be5e67440144213a0405093057f092572d4fe47b092a59", "after": "585624879b059fdb88180a521f693a3f5cbfd0f855c0fe05ce082eda9ecdedfb"}, {"path": "BLOB_BOT_SERIES1/cases/browser.mjs", "before": "2b65b54e456756a189ca84e742cc3a6c390e1c11b487ddb870ba04b3605a3c3e", "after": "4e280e69d60b22e8ab2d3d2f9788bd470b4523f3bc0b537c3919f8eccfc967f7"}, {"path": "BLOB_BOT_SERIES1/README.md", "before": "48ce3c31407bc4b902a5ca95e0170face6cd0eb6e47c20a48ed1ac0a9c82262c", "after": "18f8b9e744a65ac057037996a43f3ca750cd5872b66c4c1344109d22af0e3cbc"}, {"path": "BLOB_BOT_SERIES1/cases/W04.mjs", "before": null, "after": "26dbc98147141d2d1b41fc6e9aa4f347df16e375ccb805ba53add8ee7b715798"}, {"path": "BLOB_BOT_SERIES1/cases/current-visual-browser.mjs", "before": null, "after": "b84396abbc937d5add82885d4f45ca3783f023e3c1663740d63e867289d5b3f9"}, {"path": "BLOB_BOT_SERIES1/fixtures/BASE_CONNECTION3_VascularRhythmRouteSystem.js", "before": null, "after": "25d16da7ae8bfa04f1f53e955ccfb182240cc332b0070f5f81fd3b94513312ea"}];
const hash=b=>createHash('sha256').update(b.toString('utf8').replaceAll('\r\n','\n')).digest('hex');
const digest=p=>fs.existsSync(p)?hash(fs.readFileSync(p)):null;
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'CONNECTION5_PATCH',e.path),backup=e=>path.join(root,'CONNECTION5_BACKUP',e.path);
function replace(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});const tmp=p+'.connection5-'+process.pid+'.tmp';try{fs.writeFileSync(tmp,b,{flag:'wx'});fs.renameSync(tmp,p);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}}
try{
 const mode=process.argv[2]??'--apply';if(process.argv.length>3||!['--apply','--check','--restore'].includes(mode))throw Error('Usage: node APPLY_CONNECTION5.mjs [--apply | --check | --restore]');
 for(const e of entries){const d=digest(target(e));if(d!==e.before&&d!==e.after)throw Error('Unexpected version of '+e.path+'. Nothing changed; preserve later edits.');}
 const patched=entries.every(e=>digest(target(e))===e.after),base=entries.every(e=>digest(target(e))===e.before);
 if(mode==='--check'){console.log(patched?'CONNECTION5 installed.':base?'Expected baseline; ready to apply.':'Recognized partial installation; apply or restore can finish.');process.exit(0);}
 if(mode==='--restore'){
  if(base){console.log('Baseline already present.');process.exit(0);}
  for(const e of entries)if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Verified original backup missing for '+e.path+'. Nothing changed.');
  for(const e of [...entries].reverse())if(digest(target(e))!==e.before){if(e.before)replace(target(e),fs.readFileSync(backup(e)));else fs.unlinkSync(target(e));}
  console.log('Restored original sources/tools; kept prior reports and baseline backups. Reload the game.');
 }else{
  if(patched){console.log('CONNECTION5 already installed.');process.exit(0);}
  for(const e of entries){if(digest(payload(e))!==e.after)throw Error('Invalid patch payload '+e.path+'. Nothing changed.');if(e.before&&fs.existsSync(backup(e))&&digest(backup(e))!==e.before)throw Error('Backup conflict '+e.path+'. Nothing changed.');if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Missing baseline backup '+e.path+'. Nothing changed.');}
  for(const e of entries)if(e.before&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
  console.log('Installed CONNECTION5. Originals are in CONNECTION5_BACKUP. Reload the game.');
 }
}catch(e){console.error('[CONNECTION5] '+e.message);process.exitCode=1;}
