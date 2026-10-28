import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const folder=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(folder);
const manifest=JSON.parse(fs.readFileSync(path.join(folder,'MANIFEST.json'),'utf8'));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const getPath=f=>path.join(root,f.path);
const read=f=>fs.existsSync(getPath(f))?fs.readFileSync(getPath(f)):null;
const normalizedMatch=(bytes,expected)=>{
  if(bytes==null||!expected) return false;
  const decoded=bytes.toString('utf8');
  if(!decoded.includes('\r\n')||/\r(?!\n)/.test(decoded)) return false;
  return sha(Buffer.from(decoded.replace(/\r\n/g,'\n'),'utf8'))===expected;
};
const beforeMatch=(f,bytes)=>f.before===null?bytes===null:(bytes!==null&&(sha(bytes)===f.before||normalizedMatch(bytes,f.before)));
const afterMatch=(f,bytes)=>bytes!==null&&sha(bytes)===f.after;
const fail=msg=>{console.error('DIFFERENT: '+msg+'; nothing overwritten.');process.exit(2);};
const cmd=process.argv[2]??'--check';
if(!['--check','--apply','--revert'].includes(cmd)) fail('use --check, --apply or --revert');
const states=manifest.files.map(f=>({f,bytes:read(f)}));
const isReady=states.every(({f,bytes})=>beforeMatch(f,bytes));
const isInstalled=states.every(({f,bytes})=>afterMatch(f,bytes));
if(cmd==='--check'){
 if(isReady) console.log('BOT1D_READY: exact BOT1-D baseline or CRLF-only variant; GUIDE0-W may be installed');
 else if(isInstalled) console.log('GUIDE0W_INSTALLED: Core/Guide/Watcher/HUD read-only witness installed');
 else {for(const {f,bytes} of states){if(!beforeMatch(f,bytes)&&!afterMatch(f,bytes)) console.error('DIFFERENT FILE: '+f.path+' actual='+ (bytes?sha(bytes):'MISSING'));}fail('source does not match expected baseline');}
 process.exit(0);
}
if(cmd==='--apply'){
 if(isInstalled){console.log('GUIDE0W_INSTALLED: no changes necessary');process.exit(0);}
 if(!isReady) fail('exact BOT1-D source baseline required');
 const plan=manifest.files.map(f=>({f,body:fs.readFileSync(path.join(folder,'payload',f.path))}));
 for(const {f,body} of plan) if(sha(body)!==f.after) fail('corrupted payload '+f.path);
 for(const {f,bytes} of states){
   if(f.before!==null){const dest=path.join(folder,'backups',f.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);}
 }
 const installed=[];
 try {
  for(const {f,body} of plan){
   if(!beforeMatch(f,read(f))) throw Error('source changed since preflight: '+f.path);
   const dest=getPath(f);fs.mkdirSync(path.dirname(dest),{recursive:true});
   const temp=dest+'.GUIDE0W_TMP';fs.writeFileSync(temp,body);fs.renameSync(temp,dest);installed.push(f);
  }
 }catch(err){
  for(const f of installed.reverse()){
   if(f.before===null)fs.rmSync(getPath(f),{force:true});
   else fs.copyFileSync(path.join(folder,'backups',f.path),getPath(f));
  }
  fail('installation rolled back: '+err.message);
 }
 console.log('GUIDE0W_INSTALLED: read-only Core / Guide / Watcher / HUD witness; gameplay rules locked');
 process.exit(0);
}
if(!isInstalled)fail('revert requires untouched GUIDE0-W installation');
for(const f of manifest.files){
 if(f.before===null)continue;
 const backup=path.join(folder,'backups',f.path);
 if(!fs.existsSync(backup)||!beforeMatch(f,fs.readFileSync(backup)))fail('original backup missing/divergent: '+f.path);
}
for(const f of manifest.files){
 if(f.before===null)fs.rmSync(getPath(f),{force:true});
 else fs.copyFileSync(path.join(folder,'backups',f.path),getPath(f));
}
console.log('BOT1D_READY: original BOT1-D source restored and GUIDE0-W witness removed');
