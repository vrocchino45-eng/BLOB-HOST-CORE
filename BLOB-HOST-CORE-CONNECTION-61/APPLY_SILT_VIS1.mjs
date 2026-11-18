import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const relative='src/routes/SiltPressureRouteSystem.js';
const target=path.join(root,relative),payload=path.join(root,'SILT_VIS1_PATCH',relative);
const backup=path.join(root,'SILT_VIS1_BACKUP',relative);
const baseHash='6090c5b0ec1834ef51e8fe8e2df401b79b1b4de4e66e12b9c45d6d11e023ed0b';
const patchHash='108c16d27289743767ec509421cdfe478fdc6dd2426e9ff695b3a8007f78602d';
const hash=b=>createHash('sha256').update(b).digest('hex');
const fail=m=>{throw new Error(m);};
function replace(bytes){const temp=target+'.silt-vis1-'+process.pid+'.tmp';try{fs.writeFileSync(temp,bytes,{flag:'wx'});fs.renameSync(temp,target);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
try{
 const mode=process.argv[2]??'--apply';
 if(!['--apply','--restore','--check'].includes(mode)||process.argv.length>3)fail('Usage: node APPLY_SILT_VIS1.mjs [--apply | --restore | --check]');
 if(!fs.existsSync(target))fail('Extract this package into the BLOB-HOST-CORE repository root. Source file was not found.');
 const current=fs.readFileSync(target),currentHash=hash(current);
 if(mode==='--check'){
  if(![baseHash,patchHash].includes(currentHash))fail('Source differs from the exported integration base and VIS1. Nothing changed.');
  console.log(currentHash===patchHash?'SILT-VIS1 already installed.':'SILT-VIS1 baseline matches; ready to apply.');
 }else if(mode==='--restore'){
  if(currentHash===baseHash){console.log('Original Silt source already present. Nothing changed.');process.exit(0);}
  if(currentHash!==patchHash)fail('Source has changed since VIS1. Refusing to overwrite later work.');
  if(!fs.existsSync(backup)||hash(fs.readFileSync(backup))!==baseHash)fail('Verified original backup was not found. Nothing changed.');
  replace(fs.readFileSync(backup));console.log('Restored original Silt source. Reload the game page.');
 }else{
  if(currentHash===patchHash){console.log('SILT-VIS1 already installed. Nothing changed.');process.exit(0);}
  if(currentHash!==baseHash)fail('Source differs from the exported integration base. Nothing changed; do not force this patch over a newer file.');
  const bytes=fs.readFileSync(payload);if(hash(bytes)!==patchHash)fail('Patch payload failed verification. Nothing changed.');
  if(fs.existsSync(backup)){if(hash(fs.readFileSync(backup))!==baseHash)fail('An unexpected backup already exists. Nothing changed.');}
  else{fs.mkdirSync(path.dirname(backup),{recursive:true});fs.writeFileSync(backup,current,{flag:'wx'});}
  replace(bytes);console.log('Installed SILT-VIS1: Silt geology fog adjustment. Original saved in SILT_VIS1_BACKUP. Reload the game page.');
 }
}catch(e){console.error('[SILT-VIS1] '+e.message);process.exitCode=1;}
