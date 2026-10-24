#!/usr/bin/env node
/** C0D1-C exact-sha two existing-owner edits plus one new Grave helper. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=process.cwd();
const base=path.dirname(fileURLToPath(import.meta.url));
const mode=process.argv[2]??'--check';
const m=JSON.parse(fs.readFileSync(path.join(base,'MANIFEST.json'),'utf8'));
const patch=JSON.parse(fs.readFileSync(path.join(base,'PATCH.json'),'utf8')).patches;
const sha=b=>createHash('sha256').update(b).digest('hex');
const located=p=>path.resolve(root,p);
const get=p=>fs.readFileSync(located(p));
function refuse(s){console.error(s);process.exit(1);}
if(!['--check','--apply','--revert'].includes(mode)) refuse('USAGE: --check|--apply|--revert');
if(!fs.existsSync(located('package.json'))) refuse('NOT_PROJECT_ROOT: open root containing package.json');
for(const [p,h] of Object.entries(m.lockedDependencySha256)) if(!fs.existsSync(located(p))||sha(get(p))!==h) refuse(`DEPENDENCY_DIFFERENT: ${p}`);
for(const p of m.existingChangedFiles) if(!fs.existsSync(located(p))) refuse(`NOT_FOUND: ${p}`);
const existing=m.existingChangedFiles;
const fresh=m.newGameplayFile;
const newPayload=fs.readFileSync(path.join(base,'payload',fresh));
if(sha(newPayload)!==m.afterSha256[fresh]) refuse('INVALID_NEW_PAYLOAD');
const current=Object.fromEntries(existing.map(p=>[p,sha(get(p))]));
const ready=existing.every(p=>current[p]===m.beforeSha256[p]) && !fs.existsSync(located(fresh));
const installed=existing.every(p=>current[p]===m.afterSha256[p]) && fs.existsSync(located(fresh)) && sha(get(fresh))===m.afterSha256[fresh];
if(mode==='--check') {
 if(ready) console.log('C0D1B_READY: exact B source and Vascular relay present; Grave receiver ready');
 else if(installed) console.log('C0D1C_INSTALLED: exactly expected Grave receiver and runtime wiring');
 else refuse(`DIFFERENT: refuse mixed source/new helper; ${JSON.stringify(current)}`);
 process.exit(0);
}
if(mode==='--apply'&&installed){console.log('C0D1C_INSTALLED: idempotent');process.exit(0);}
if(mode==='--revert'&&ready){console.log('C0D1B_READY: already reverted');process.exit(0);}
if((mode==='--apply'&&!ready)||(mode==='--revert'&&!installed)) refuse('DIFFERENT: no changes written');
const backups=path.join(base,'backups');
const backupName=p=>path.join(backups,p.replaceAll('/','__')+'.before_C0D1C');
if(mode==='--apply'){
 const dest={};
 for(const p of existing){
  let result=get(p).toString('utf8');
  for(const {find,replace} of patch[p]){
   if(result.split(find).length!==2) refuse(`PATCH_ANCHOR_DIFFERENT: ${p}`);
   result=result.replace(find,replace);
  }
  const bytes=Buffer.from(result,'utf8');
  if(sha(bytes)!==m.afterSha256[p]) refuse(`POSTPATCH_HASH_DIFFERENT: ${p}`);
  dest[p]=bytes;
  if(fs.existsSync(backupName(p))&&sha(fs.readFileSync(backupName(p)))!==m.beforeSha256[p])refuse(`BAD_BACKUP: ${p}`);
 }
 fs.mkdirSync(backups,{recursive:true});
 for(const p of existing)if(!fs.existsSync(backupName(p)))fs.writeFileSync(backupName(p),get(p));
 const changed=[];
 try{
  for(const p of existing){fs.writeFileSync(located(p),dest[p]);changed.push(p);}
  fs.writeFileSync(located(fresh),newPayload);changed.push(fresh);
  for(const [p,h] of Object.entries(m.afterSha256))if(sha(get(p))!==h)throw Error(`VERIFY_ERROR: ${p}`);
 }catch(err){
  for(const p of changed)if(p===fresh)fs.rmSync(located(p),{force:true});else fs.writeFileSync(located(p),fs.readFileSync(backupName(p)));
  throw err;
 }
 console.log('C0D1-C INSTALLED: Grave I memory owner active only when mounted; no Grave objective or Grave II changes.');
}else{
 for(const p of existing)if(!fs.existsSync(backupName(p))||sha(fs.readFileSync(backupName(p)))!==m.beforeSha256[p])refuse(`NO_VALID_BACKUP: ${p}`);
 const installedCopies=Object.fromEntries(existing.map(p=>[p,get(p)]));
 try{
  for(const p of existing)fs.writeFileSync(located(p),fs.readFileSync(backupName(p)));
  fs.rmSync(located(fresh));
  for(const p of existing)if(sha(get(p))!==m.beforeSha256[p])throw Error(`VERIFY_REVERT: ${p}`);
 }catch(err){
  for(const p of existing)fs.writeFileSync(located(p),installedCopies[p]);
  if(!fs.existsSync(located(fresh)))fs.writeFileSync(located(fresh),newPayload);
  throw err;
 }
 console.log('C0D1-C REVERTED: exact pre-C Grave and runtime; C0D1-A/B and VIS1-B remain active.');
}
