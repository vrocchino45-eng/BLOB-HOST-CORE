import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(dir);
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'MANIFEST.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const dest=p=>path.join(root,p);
const read=p=>fs.existsSync(dest(p))?fs.readFileSync(dest(p)):null;
const lfMatch=(bytes,hash)=>bytes!==null&&hash&&bytes.includes(13)&&
  sha(Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n'),'utf8'))===hash;
const before=(f,b)=>f.before===null?b===null:b!==null&&(sha(b)===f.before||lfMatch(b,f.before));
const after=(f,b)=>b!==null&&sha(b)===f.after;
const die=m=>{console.error('DIFFERENT: '+m+'; nothing overwritten.');process.exit(2);};
const command=process.argv[2]??'--check';
if(!['--check','--apply','--revert'].includes(command))die('use --check / --apply / --revert');
const anchor=read(manifest.anchor.path);
if(anchor===null||!(sha(anchor)===manifest.anchor.sha256||lfMatch(anchor,manifest.anchor.sha256)))
 die('requires C0E3 source; '+manifest.anchor.path+' did not match');
const states=manifest.files.map(f=>({f,bytes:read(f.path)}));
const ready=states.every(({f,bytes})=>before(f,bytes));
const installed=states.every(({f,bytes})=>after(f,bytes));
if(command==='--check'){
 if(ready)console.log('C0E3_READY: canonical HUD baseline present; read-only language install safe');
 else if(installed)console.log('C0E3_LANG1_INSTALLED: language matches intended source');
 else {for(const {f,bytes} of states)if(!before(f,bytes)&&!after(f,bytes))
    console.error('DIFFERENT FILE: '+f.path+' actual='+ (bytes?sha(bytes):'MISSING'));
    die('baseline mismatch');}
 process.exit(0);
}
if(command==='--apply'){
 if(installed){console.log('C0E3_LANG1_INSTALLED: no changes necessary');process.exit(0);}
 if(!ready)die('source differs from C0E3 baseline');
 const planned=manifest.files.map(f=>({f,bytes:fs.readFileSync(path.join(dir,'payload',f.path))}));
 for(const {f,bytes} of planned)if(sha(bytes)!==f.after)die('payload hash mismatch '+f.path);
 for(const {f,bytes} of states){
  if(f.before===null)continue;
  const backup=path.join(dir,'backups',f.path);
  if(fs.existsSync(backup)&&!before(f,fs.readFileSync(backup)))die('divergent existing backup '+f.path);
 }
 for(const {f,bytes} of states){
  if(f.before===null)continue;
  const backup=path.join(dir,'backups',f.path);
  fs.mkdirSync(path.dirname(backup),{recursive:true});fs.writeFileSync(backup,bytes);
 }
 const applied=[];
 try{
  for(const {f,bytes} of planned){
   if(!before(f,read(f.path)))throw Error('source changed during installation '+f.path);
   const out=dest(f.path);fs.mkdirSync(path.dirname(out),{recursive:true});
   const temp=out+'.LANG1_TMP';fs.writeFileSync(temp,bytes);fs.renameSync(temp,out);applied.push(f);
  }
 }catch(e){
  for(const f of applied.reverse()){
   if(f.before===null)fs.rmSync(dest(f.path),{force:true});
   else fs.copyFileSync(path.join(dir,'backups',f.path),dest(f.path));
  }
  die('installation aborted and rolled back: '+e.message);
 }
 console.log('C0E3_LANG1_INSTALLED: shared verb/HUD vocabulary; ALL gameplay equations and Host receipts unchanged.');
 process.exit(0);
}
if(!installed)die('rollback requires unchanged LANG1 installation');
for(const f of manifest.files){
 if(f.before===null)continue;
 const backup=path.join(dir,'backups',f.path);
 if(!fs.existsSync(backup)||!before(f,fs.readFileSync(backup)))die('backup missing or divergent '+f.path);
}
for(const f of manifest.files){
 if(f.before===null)fs.rmSync(dest(f.path),{force:true});
 else fs.copyFileSync(path.join(dir,'backups',f.path),dest(f.path));
}
console.log('C0E3_READY: restored exact source and original line endings');
