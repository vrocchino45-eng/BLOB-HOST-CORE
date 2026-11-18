import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url)),entries=[{"path": "BLOB_BOT_SERIES1/run.mjs", "before": "d26a120d1901fbabb911824b5e47a57276d45169b1f0940118097d3f5ffe86ff", "after": "23421c1153c186b8165695a1c825de1801dbc9e7a98131cee3290fa91f0df9e1"}, {"path": "BLOB_BOT_SERIES1/check-runner.mjs", "before": "2c9de75304847cccad096ef2398e0daca9598b0833a1342b2c68e5088511ec75", "after": "c8199d1831be2571b7cf86d815a7fdd1d5df806fe19151f190956a44abf280ed"}, {"path": "BLOB_BOT_SERIES1/README.md", "before": "3bf40a2e25237774f9a9f87b2fd7116d6bd0c6994067c99b8f6166d47148f773", "after": "2111e710f3cd8f88c974db1cdaf8a86e7e2fca711d0a9c6371c1e29b1f56a347"}, {"path": "BLOB_BOT_SERIES1/plan.json", "before": "1c937d992d358382abdc5af0809e257a91629095cc35472578d16e1944b6f714", "after": "5060c0603237997bc8b7f2396460a6768246f9ec2ea51e42c8ccc429e6682fda"}, {"path": "BLOB_BOT_SERIES1/source-identity.mjs", "before": null, "after": "0208acc12c04f589a745d939376e7804de936674eb9f0766a100711fe2b2ff69"}, {"path": "BLOB_BOT_SERIES1/compare-source.mjs", "before": null, "after": "6ecee374ccfe18a0f86108e61a5deca6419f6de5dfaf0f5ef766d1605ef89d24"}, {"path": "BLOB_BOT_SERIES1/check-source-identity.mjs", "before": null, "after": "35000aba3df722a6921bf5930ae1bab161c2db326f7850dfb9876dfa2df76814"}];
const hash=b=>createHash('sha256').update(b.toString('utf8').replaceAll('\r\n','\n')).digest('hex');
const digest=p=>fs.existsSync(p)?hash(fs.readFileSync(p)):null;
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'CONNECTION11_PATCH',e.path),backup=e=>path.join(root,'CONNECTION11_BACKUP',e.path);
function replace(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});const tmp=p+'.connection11-'+process.pid+'.tmp';try{fs.writeFileSync(tmp,b,{flag:'wx'});fs.renameSync(tmp,p);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}}
try{
 const mode=process.argv[2]??'--apply';if(process.argv.length>3||!['--apply','--check','--restore'].includes(mode))throw Error('Usage: node APPLY_CONNECTION11.mjs [--apply | --check | --restore]');
 for(const e of entries){const d=digest(target(e));if(d!==e.before&&d!==e.after)throw Error('Unexpected version of '+e.path+'. Nothing changed; preserve later edits.');}
 const patched=entries.every(e=>digest(target(e))===e.after),base=entries.every(e=>digest(target(e))===e.before);
 if(mode==='--check'){console.log(patched?'CONNECTION11 installed.':base?'Expected baseline; ready to apply.':'Recognized partial installation; apply or restore can finish.');process.exit(0);}
 if(mode==='--restore'){
  if(base){console.log('Baseline already present.');process.exit(0);}
  for(const e of entries)if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Verified original backup missing for '+e.path+'. Nothing changed.');
  for(const e of [...entries].reverse())if(digest(target(e))!==e.before){if(e.before)replace(target(e),fs.readFileSync(backup(e)));else fs.unlinkSync(target(e));}
  console.log('Restored original sources/tools; kept prior reports and baseline backups. The gameplay build is unchanged.');
 }else{
  if(patched){console.log('CONNECTION11 already installed.');process.exit(0);}
  for(const e of entries){if(digest(payload(e))!==e.after)throw Error('Invalid patch payload '+e.path+'. Nothing changed.');if(e.before&&fs.existsSync(backup(e))&&digest(backup(e))!==e.before)throw Error('Backup conflict '+e.path+'. Nothing changed.');if(e.before&&digest(target(e))===e.after&&digest(backup(e))!==e.before)throw Error('Missing baseline backup '+e.path+'. Nothing changed.');}
  for(const e of entries)if(e.before&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
  console.log('Installed CONNECTION11. Originals are in CONNECTION11_BACKUP. The gameplay build is unchanged.');
 }
}catch(e){console.error('[CONNECTION11] '+e.message);process.exitCode=1;}
