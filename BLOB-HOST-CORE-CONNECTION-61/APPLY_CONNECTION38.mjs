import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CONNECTION38_MANIFEST.json'),'utf8'));
const entries=manifest.entries,states=manifest.states,backupRoot=path.join(root,'CONNECTION38_BACKUP'),recordPath=path.join(backupRoot,'restore.json');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),norm=bytes=>sha(Buffer.from(bytes.toString('utf8').replaceAll('\r\n','\n')));
const target=e=>path.join(root,e.path),payload=e=>path.join(root,'CONNECTION38_PATCH',e.path),backup=e=>path.join(backupRoot,e.path);
const digest=file=>fs.existsSync(file)?norm(fs.readFileSync(file)):null;
function replace(file,bytes){fs.mkdirSync(path.dirname(file),{recursive:true});const temp=file+'.connection38-'+process.pid+'.tmp';try{fs.writeFileSync(temp,bytes,{flag:'wx'});fs.renameSync(temp,file);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
function currentMatches(state){return entries.every(e=>digest(target(e))===state.files[e.path]);}
function readBackup(){
 if(!fs.existsSync(recordPath))return null;
 const record=JSON.parse(fs.readFileSync(recordPath,'utf8')),state=states.find(s=>s.id===record.state);
 if(record.pass!=='CONNECTION38-BACKUP'||!state||!Array.isArray(record.files)||record.files.length!==entries.length)throw Error('Invalid baseline backup metadata. Nothing changed.');
 for(let i=0;i<entries.length;i++){
  const e=entries[i],saved=record.files[i];
  if(saved.path!==e.path||saved.before!==state.files[e.path])throw Error('Backup does not match the recognized baseline. Nothing changed.');
  if(saved.before===null){if(saved.raw!==null)throw Error('Invalid absent-file backup. Nothing changed.');}
  else if(!fs.existsSync(backup(e))||digest(backup(e))!==saved.before||sha(fs.readFileSync(backup(e)))!==saved.raw)throw Error('Original backup missing or changed: '+e.path+'. Nothing changed.');
 }
 return record;
}
function validateCurrent(record){for(let i=0;i<entries.length;i++){const e=entries[i],d=digest(target(e));if(d!==record.files[i].before&&d!==e.after)throw Error('Later/unrecognized edit: '+e.path+'. Nothing changed; preserve your work.');}}
try{
 const mode=process.argv[2]??'--apply';if(process.argv.length>3||!['--apply','--check','--restore'].includes(mode))throw Error('Usage: node APPLY_CONNECTION38.mjs [--apply | --check | --restore]');
 if(mode!=='--restore')for(const anchor of manifest.anchors)if(digest(path.join(root,anchor.path))!==anchor.sha256)throw Error('Unrecognized gameplay anchor: '+anchor.path+'. Nothing changed.');
 const record=readBackup(),state=states.find(currentMatches),final=entries.every(e=>digest(target(e))===e.after);
 if(record)validateCurrent(record);
 else if(!state)throw Error('No complete recognized CONNECTION36 checkpoint. Nothing changed; preserve later edits.');
 if(mode!=='--restore'&&!final)for(const e of entries){if(digest(payload(e))!==e.after)throw Error('Missing/invalid payload: '+e.path+'. Nothing changed.');if(!record&&fs.existsSync(backup(e))&&(!fs.existsSync(target(e))||sha(fs.readFileSync(backup(e)))!==sha(fs.readFileSync(target(e)))))throw Error('Conflicting partial backup: '+e.path+'. Nothing changed.');}
 if(mode==='--check'){console.log(final?'CONNECTION38 opt-in Core repair playtest already present.':record?'Recognized saved baseline or interrupted update; apply/restore can finish.':'Recognized '+state.id+'; ready for CONNECTION38 Surface repair.');process.exit(0);}
 if(mode==='--restore'){
  if(!record){console.log('No CONNECTION38 installation backup; nothing to restore.');process.exit(0);}
  for(let i=entries.length-1;i>=0;i--){const e=entries[i],saved=record.files[i];if(saved.before===null){if(fs.existsSync(target(e)))fs.unlinkSync(target(e));}else if(!fs.existsSync(target(e))||sha(fs.readFileSync(target(e)))!==saved.raw)replace(target(e),fs.readFileSync(backup(e)));}
  console.log('Restored exact original '+record.state+' files. Kept reports and backups. Reload if gameplay changed.');process.exit(0);
 }
 if(final){console.log('CONNECTION38 opt-in Core repair playtest already present. No files changed.');process.exit(0);}
 // The complete payload and any pre-existing partial backup passed preflight.
 let saved=record;
 if(!saved){
  saved={pass:'CONNECTION38-BACKUP',state:state.id,files:entries.map(e=>({path:e.path,before:state.files[e.path],raw:fs.existsSync(target(e))?sha(fs.readFileSync(target(e))):null}))};
  for(const e of entries)if(fs.existsSync(target(e))&&!fs.existsSync(backup(e))){fs.mkdirSync(path.dirname(backup(e)),{recursive:true});fs.writeFileSync(backup(e),fs.readFileSync(target(e)),{flag:'wx'});}
  replace(recordPath,Buffer.from(JSON.stringify(saved,null,2)+'\n'));
 }
 for(const e of entries)if(digest(target(e))!==e.after)replace(target(e),fs.readFileSync(payload(e)));
 console.log('Installed CONNECTION38 opt-in Core repair playtest from '+saved.state+'. Originals: CONNECTION38_BACKUP. Reload the game.');
}catch(error){console.error('[CONNECTION38] '+error.message);process.exitCode=1;}
