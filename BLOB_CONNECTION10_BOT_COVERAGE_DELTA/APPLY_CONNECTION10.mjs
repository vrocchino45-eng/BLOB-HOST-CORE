import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url)),entries=[{"path": "BLOB_BOT_SERIES1/plan.json", "before": "585624879b059fdb88180a521f693a3f5cbfd0f855c0fe05ce082eda9ecdedfb", "after": "1c937d992d358382abdc5af0809e257a91629095cc35472578d16e1944b6f714"}, {"path": "BLOB_BOT_SERIES1/cases/browser.mjs", "before": "4e280e69d60b22e8ab2d3d2f9788bd470b4523f3bc0b537c3919f8eccfc967f7", "after": "5ff8b7f459b6d8db870df34dc20f821d783e0a67673e933337067b61c2f39f4a"}, {"path": "BLOB_BOT_SERIES1/README.md", "before": "18f8b9e744a65ac057037996a43f3ca750cd5872b66c4c1344109d22af0e3cbc", "after": "3bf40a2e25237774f9a9f87b2fd7116d6bd0c6994067c99b8f6166d47148f773"}, {"path": "BLOB_BOT_SERIES1/cases/consequence-chain.mjs", "before": null, "after": "934c7c2833add5d3f79fdf003a14af3bb7384fd4ba08f8b527606f8356981343"}, {"path": "BLOB_BOT_SERIES1/cases/C02.mjs", "before": null, "after": "939f98b231085f1a5b2df242c392e4091b6b9cfde6a239c16068cd325f0efd09"}];
const hash=b=>createHash('sha256').update(b.toString('utf8').replaceAll('\r\n','\n')).digest('hex');
const digest=p=>fs.existsSync(p)?hash(fs.readFileSync(p)):null;
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'CONNECTION10_PATCH',e.path),backup=e=>path.join(root,'CONNECTION10_BACKUP',e.path);
function replace(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});const tmp=p+'.connection10-'+process.pid+'.tmp';try{fs.writeFileSync(tmp,b,{flag:'wx'});fs.renameSync(tmp,p);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}}
try{
 const mode=process.argv[2]??'--apply';if(process.argv.length>3||!['--apply','--check','--restore'].includes(mode))throw Error('Usage: node APPLY_CONNECTION10.mjs [--apply | --check | --restore]');
 for(const e of entries){const d=digest(target(e));if(d!==e.before&&d!==e.after)throw Error('Unexpected version of '+e.path+'. Nothing changed; preserve later edits.');}
 const patched=entries.every(e=>digest(target(e))===e.after),base=entries.every(e=>digest(target(e))===e.before);
 if(mode==='--check'){console.log(patched?'CONNECTION10 installed.':base?'Expected baseline; ready to apply.':'Recognized partial installation; apply or restore can finish.');process.exit(0);}
 if(mode==='--restore'){
  if(base){console.log('Baseline already present.');process.exit(0);}
  for(const e of entries)if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Verified original backup missing for '+e.path+'. Nothing changed.');
  for(const e of [...entries].reverse())if(digest(target(e))!==e.before){if(e.before)replace(target(e),fs.readFileSync(backup(e)));else fs.unlinkSync(target(e));}
  console.log('Restored original sources/tools; kept prior reports and baseline backups. The gameplay build is unchanged.');
 }else{
  if(patched){console.log('CONNECTION10 already installed.');process.exit(0);}
  for(const e of entries){if(digest(payload(e))!==e.after)throw Error('Invalid patch payload '+e.path+'. Nothing changed.');if(e.before&&fs.existsSync(backup(e))&&digest(backup(e))!==e.before)throw Error('Backup conflict '+e.path+'. Nothing changed.');if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Missing baseline backup '+e.path+'. Nothing changed.');}
  for(const e of entries)if(e.before&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
  console.log('Installed CONNECTION10. Originals are in CONNECTION10_BACKUP. The gameplay build is unchanged.');
 }
}catch(e){console.error('[CONNECTION10] '+e.message);process.exitCode=1;}
