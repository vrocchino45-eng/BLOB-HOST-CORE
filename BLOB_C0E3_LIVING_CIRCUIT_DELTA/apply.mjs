import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const folder=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(folder);
const manifest=JSON.parse(fs.readFileSync(path.join(folder,'MANIFEST.json'),'utf8'));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const filePath=f=>path.join(root,f.path);
const read=f=>fs.existsSync(filePath(f))?fs.readFileSync(filePath(f)):null;
const isLfEquivalent=(b,hash)=>{
  if(b==null||!hash)return false;
  const str=b.toString('utf8');
  return str.includes('\r\n')&&!/\r(?!\n)/.test(str) &&
    sha(Buffer.from(str.replace(/\r\n/g,'\n'),'utf8'))===hash;
};
const matchesBefore=(f,b)=>f.before===null?b===null:
  (b!==null&&(sha(b)===f.before||isLfEquivalent(b,f.before)));
const matchesAfter=(f,b)=>b!==null&&sha(b)===f.after;
const stop=msg=>{console.error('DIFFERENT: '+msg+'; nothing overwritten.');process.exit(2);};
const command=process.argv[2]??'--check';
if(!['--check','--apply','--revert'].includes(command))stop('use --check, --apply or --revert');
const state=manifest.files.map(f=>({f,bytes:read(f)}));
const ready=state.every(({f,bytes})=>matchesBefore(f,bytes));
const installed=state.every(({f,bytes})=>matchesAfter(f,bytes));
if(command==='--check'){
 if(ready)console.log('C0E2B_READY: exact source or verified CRLF-only variant; C0E3 can be installed');
 else if(installed)console.log('C0E3_INSTALLED: five files match the intended build');
 else {for(const {f,bytes} of state)if(!matchesBefore(f,bytes)&&!matchesAfter(f,bytes))
   console.error('DIFFERENT FILE: '+f.path+' actual='+ (bytes?sha(bytes):'MISSING'));
  stop('source is not the exact C0E2-B baseline');}
 process.exit(0);
}
if(command==='--apply'){
 if(installed){console.log('C0E3_INSTALLED: no changes necessary');process.exit(0);}
 if(!ready)stop('all five files must match C0E2-B source');
 const plan=manifest.files.map(f=>({f,bytes:fs.readFileSync(path.join(folder,'payload',f.path))}));
 for(const {f,bytes} of plan)if(sha(bytes)!==f.after)stop('payload corrupted: '+f.path);
 // Back up originals byte-for-byte; never overwrite existing backups silently.
 for(const {f,bytes} of state){
  if(f.before===null)continue;
  const backup=path.join(folder,'backups',f.path);
  if(fs.existsSync(backup)&&!matchesBefore(f,fs.readFileSync(backup)))stop('unexpected backup: '+f.path);
 }
 for(const {f,bytes} of state){
  if(f.before===null)continue;
  const backup=path.join(folder,'backups',f.path);
  fs.mkdirSync(path.dirname(backup),{recursive:true});fs.writeFileSync(backup,bytes);
 }
 const applied=[];
 try{
  for(const {f,bytes} of plan){
   if(!matchesBefore(f,read(f)))throw Error('source modified since preflight: '+f.path);
   const target=filePath(f);fs.mkdirSync(path.dirname(target),{recursive:true});
   const temporary=target+'.C0E3_TMP';fs.writeFileSync(temporary,bytes);fs.renameSync(temporary,target);
   applied.push(f);
  }
 }catch(error){
  for(const f of applied.reverse()){
   if(f.before===null)fs.rmSync(filePath(f),{force:true});
   else fs.copyFileSync(path.join(folder,'backups',f.path),filePath(f));
  }
  stop('installation aborted and rolled back: '+error.message);
 }
 console.log('C0E3_INSTALLED: four living regional circuits; bounded traveling responses and manual relief. Host circuit and physics untouched.');
 process.exit(0);
}
if(!installed)stop('rollback only allowed for unchanged C0E3 installation');
for(const f of manifest.files){
 if(f.before===null)continue;
 const backup=path.join(folder,'backups',f.path);
 if(!fs.existsSync(backup)||!matchesBefore(f,fs.readFileSync(backup)))stop('backup missing or divergent: '+f.path);
}
for(const f of manifest.files){
 if(f.before===null)fs.rmSync(filePath(f),{force:true});
 else fs.copyFileSync(path.join(folder,'backups',f.path),filePath(f));
}
console.log('C0E2B_READY: all files restored from original backups, including Windows line endings');
