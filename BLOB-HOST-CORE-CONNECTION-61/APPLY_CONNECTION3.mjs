import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url)),entries=[{"path": "src/routes/VascularRhythmRouteSystem.js", "before": "cb602fc7f884c5f1941751e8295e272ec6651b6ce0a184945d138ede1c5ae56b", "after": "25d16da7ae8bfa04f1f53e955ccfb182240cc332b0070f5f81fd3b94513312ea"}, {"path": "BLOB_BOT_SERIES1/plan.json", "before": "e5c2bc2c3f210ce5220227b6826212d42033727b64a969651ca86632a4fb0dd3", "after": "94f22b677e7d085e93be5e67440144213a0405093057f092572d4fe47b092a59"}, {"path": "BLOB_BOT_SERIES1/README.md", "before": "65e510b8e7ac49cf30ad793bb57e59e028ef729948d837566bb51eee62cadc94", "after": "48ce3c31407bc4b902a5ca95e0170face6cd0eb6e47c20a48ed1ac0a9c82262c"}, {"path": "BLOB_BOT_SERIES1/cases/browser.mjs", "before": "0f8a1ab6a51a1069c0367f4736f69c561d9aa0a1b6c4af523fccaf6b04defafc", "after": "2b65b54e456756a189ca84e742cc3a6c390e1c11b487ddb870ba04b3605a3c3e"}, {"path": "BLOB_BOT_SERIES1/cases/W01.mjs", "before": null, "after": "35dfc4e036e355e0327b396539b0fa02afb732fe5b96f3fb97977ff51782d937"}, {"path": "BLOB_BOT_SERIES1/cases/W02.mjs", "before": null, "after": "a22bed3aa086479e14e2ffc28dd22b92dfb51a2d8db8126cb9a255a6b256c8a5"}, {"path": "BLOB_BOT_SERIES1/cases/connection-browser.mjs", "before": null, "after": "c4e6825fbfbc3d609dca6bda856899327a910e3393829008db0f6b792b8220de"}, {"path": "BLOB_BOT_SERIES1/fixtures/BASE_CONNECTION2_VascularRhythmRouteSystem.js", "before": null, "after": "cb602fc7f884c5f1941751e8295e272ec6651b6ce0a184945d138ede1c5ae56b"}];
const hash=b=>createHash('sha256').update(b.toString('utf8').replaceAll('\r\n','\n')).digest('hex');
const digest=p=>fs.existsSync(p)?hash(fs.readFileSync(p)):null;
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'CONNECTION3_PATCH',e.path),backup=e=>path.join(root,'CONNECTION3_BACKUP',e.path);
function replace(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});const tmp=p+'.connection3-'+process.pid+'.tmp';try{fs.writeFileSync(tmp,b,{flag:'wx'});fs.renameSync(tmp,p);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}}
try{
 const mode=process.argv[2]??'--apply';if(process.argv.length>3||!['--apply','--check','--restore'].includes(mode))throw Error('Usage: node APPLY_CONNECTION3.mjs [--apply | --check | --restore]');
 for(const e of entries){const d=digest(target(e));if(d!==e.before&&d!==e.after)throw Error('Unexpected version of '+e.path+'. Nothing changed; preserve later edits.');}
 const patched=entries.every(e=>digest(target(e))===e.after),base=entries.every(e=>digest(target(e))===e.before);
 if(mode==='--check'){console.log(patched?'CONNECTION3 installed.':base?'Expected baseline; ready to apply.':'Recognized partial installation; apply or restore can finish.');process.exit(0);}
 if(mode==='--restore'){
  if(base){console.log('Baseline already present.');process.exit(0);}
  for(const e of entries)if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Verified original backup missing for '+e.path+'. Nothing changed.');
  for(const e of [...entries].reverse())if(digest(target(e))!==e.before){if(e.before)replace(target(e),fs.readFileSync(backup(e)));else fs.unlinkSync(target(e));}
  console.log('Restored original sources/tools; kept prior reports and baseline backups. Reload the game.');
 }else{
  if(patched){console.log('CONNECTION3 already installed.');process.exit(0);}
  for(const e of entries){if(digest(payload(e))!==e.after)throw Error('Invalid patch payload '+e.path+'. Nothing changed.');if(e.before&&fs.existsSync(backup(e))&&digest(backup(e))!==e.before)throw Error('Backup conflict '+e.path+'. Nothing changed.');if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Missing baseline backup '+e.path+'. Nothing changed.');}
  for(const e of entries)if(e.before&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
  console.log('Installed CONNECTION3. Originals are in CONNECTION3_BACKUP. Reload the game.');
 }
}catch(e){console.error('[CONNECTION3] '+e.message);process.exitCode=1;}
