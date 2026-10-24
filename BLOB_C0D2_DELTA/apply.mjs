#!/usr/bin/env node
/** C0D2 guarded, reversible one-owner method patch + one tiny pure helper. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=process.cwd();
const base=path.dirname(fileURLToPath(import.meta.url));
const mode=process.argv[2]??'--check';
const manifest=JSON.parse(fs.readFileSync(path.join(base,'MANIFEST.json'),'utf8'));
const patch=JSON.parse(fs.readFileSync(path.join(base,'PATCH.json'),'utf8')).patches;
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(path.join(root,p));
const existing=manifest.existingChangedFiles[0], fresh=manifest.newGameplayFile;
const backup=path.join(base,'backups',existing.replaceAll('/','__')+'.before_C0D2');
function refuse(message){console.error(message);process.exit(1)}
if(!['--check','--apply','--revert'].includes(mode))refuse('USAGE: --check|--apply|--revert');
if(!fs.existsSync(path.join(root,'package.json')))refuse('NOT_PROJECT_ROOT: open BLOB-HOST-CORE root');
for(const [p,hash] of Object.entries(manifest.lockedDependencies))
 if(!fs.existsSync(path.join(root,p)) || sha(read(p))!==hash)refuse(`DEPENDENCY_DIFFERENT: ${p}`);
if(!fs.existsSync(path.join(root,existing)))refuse(`MISSING_OWNER: ${existing}`);
const payload=fs.readFileSync(path.join(base,'payload',fresh));
if(sha(payload)!==manifest.afterSha256[fresh])refuse('BAD_PACKAGE: helper payload hash differs');
const routeHash=sha(read(existing)),helperExists=fs.existsSync(path.join(root,fresh));
const ready=routeHash===manifest.beforeSha256[existing]&&!helperExists;
const installed=routeHash===manifest.afterSha256[existing]&&helperExists&&sha(read(fresh))===manifest.afterSha256[fresh];
if(mode==='--check'){
 if(ready)console.log('C0D1C_READY: C0D2 exact Grave I recovery feedback patch may be applied');
 else if(installed)console.log('C0D2_INSTALLED: exact Grave I recovery feedback already active');
 else refuse(`DIFFERENT: Grave owner or C0D2 helper differs (${routeHash})`);
 process.exit(0);
}
if(mode==='--apply'&&installed){console.log('C0D2_INSTALLED: idempotent');process.exit(0)}
if(mode==='--revert'&&ready){console.log('C0D1C_READY: already reverted');process.exit(0)}
if((mode==='--apply'&&!ready)||(mode==='--revert'&&!installed))refuse('DIFFERENT: exact expected source required; no files written');
if(mode==='--apply'){
 let modified=read(existing).toString('utf8');
 for(const {find,replace} of patch[existing]){
  if(modified.split(find).length!==2)refuse('PATCH_ANCHOR_DIFFERENT: no writes performed');
  modified=modified.replace(find,replace);
 }
 const bytes=Buffer.from(modified,'utf8');
 if(sha(bytes)!==manifest.afterSha256[existing])refuse('POSTPATCH_HASH_DIFFERENT: no writes performed');
 if(fs.existsSync(backup)&&sha(fs.readFileSync(backup))!==manifest.beforeSha256[existing])refuse('BACKUP_DIFFERENT');
 fs.mkdirSync(path.dirname(backup),{recursive:true});
 if(!fs.existsSync(backup))fs.writeFileSync(backup,read(existing));
 try{
  fs.writeFileSync(path.join(root,existing),bytes);
  fs.writeFileSync(path.join(root,fresh),payload,{flag:'wx'});
  if(sha(read(existing))!==manifest.afterSha256[existing]||sha(read(fresh))!==manifest.afterSha256[fresh])throw Error('POSTWRITE_VERIFY');
 }catch(err){
  fs.writeFileSync(path.join(root,existing),fs.readFileSync(backup));
  fs.rmSync(path.join(root,fresh),{force:true});
  throw err;
 }
 console.log('C0D2 INSTALLED: Grave I stabilization recovery depends on retained Vascular memory; Silt/Host/Vascular untouched.');
}else{
 if(!fs.existsSync(backup)||sha(fs.readFileSync(backup))!==manifest.beforeSha256[existing])refuse('NO_VALID_BACKUP: refusing rollback');
 const modified=read(existing);
 try{
  fs.writeFileSync(path.join(root,existing),fs.readFileSync(backup));
  fs.rmSync(path.join(root,fresh));
  if(sha(read(existing))!==manifest.beforeSha256[existing]||fs.existsSync(path.join(root,fresh)))throw Error('REVERT_VERIFY');
 }catch(err){fs.writeFileSync(path.join(root,existing),modified);if(!fs.existsSync(path.join(root,fresh)))fs.writeFileSync(path.join(root,fresh),payload);throw err;}
 console.log('C0D2 REVERTED: exact C0D1-C Grave I owner restored; later C0D2 helper removed.');
}
