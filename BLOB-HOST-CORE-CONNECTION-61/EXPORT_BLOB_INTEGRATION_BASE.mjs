// Run from the existing BLOB repository root. Reads project files; writes one new ZIP.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {deflateRawSync} from 'node:zlib';
const root=process.cwd(),selected=new Map(),skipped=[];
const maxBytes=128*1024*1024;let total=0;
function add(relative){
 const name=relative.split(path.sep).join('/');if(selected.has(name))return;
 const full=path.resolve(root,relative),rel=path.relative(root,full);
 if(rel.startsWith('..')||path.isAbsolute(rel)||!fs.existsSync(full))return;
 if(!fs.lstatSync(full).isFile())return;
 const bytes=fs.readFileSync(full);total+=bytes.length;if(total>maxBytes)throw Error('Selected inputs exceed 128 MiB; no ZIP written.');
 selected.set(name,bytes);
}
function walk(relative,jsonOnly=false){
 const full=path.resolve(root,relative);if(!fs.existsSync(full))return;
 for(const entry of fs.readdirSync(full,{withFileTypes:true})){
  const p=path.join(relative,entry.name);
  if(entry.isSymbolicLink()||entry.name.startsWith('.')||entry.name==='node_modules')continue;
  if(entry.isDirectory())walk(p,jsonOnly);
  else if(entry.isFile()){
   if(jsonOnly&&!entry.name.endsWith('.json'))continue;
   if(/\.(bak|zip|mp4|log)$|\.preStage|\.preD|_BACKUP/i.test(entry.name)){skipped.push(p);continue;}
   add(p);
  }
 }
}
if(!fs.existsSync(path.join(root,'src','core','GameRuntime.js')))throw Error('Run this from the BLOB-HOST-CORE repository root (containing src/core/GameRuntime.js).');
walk('src');walk(path.join('public','data'),true);walk('data',true);
for(const n of ['package.json','package-lock.json','npm-shrinkwrap.json','pnpm-lock.yaml','yarn.lock','bun.lock','index.html','vite.config.js','vite.config.mjs','vite.config.cjs','vite.config.ts'])add(n);
// Include actual project-local code dependencies outside src, such as the root Guide adapter.
const missingLocalImports=new Set();
for(const [name,bytes] of selected){
 if(!/\.(mjs|js|cjs|ts)$/.test(name))continue;
 const text=bytes.toString('utf8');
 const re=/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+)['"]/g;
 for(const m of text.matchAll(re)){
  const p=path.normalize(path.join(path.dirname(name),m[1]));
  if(p.split(path.sep).includes('node_modules'))continue;
  if(/\.(mjs|js|cjs|json|ts)$/.test(p)){
   if(!fs.existsSync(path.resolve(root,p)))missingLocalImports.add(p);else add(p);
  }
 }
}
let installedThree=null;
try{installedThree=JSON.parse(fs.readFileSync(path.join(root,'node_modules','three','package.json'),'utf8')).version;}catch{}
const manifest={pass:'BLOB-INTEGRATION-BASE1',createdUTC:new Date().toISOString(),nodeVersion:process.version,
 installedThreeVersion:installedThree,scope:'source, local code imports, dependency declarations/lockfiles and authored JSON; no node_modules or media',
 missing:[],missingLocalImports:[...missingLocalImports],excludedBackupCount:skipped.length,files:[...selected].map(([name,b])=>({path:name,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')}))};
if(!selected.has('package.json'))manifest.missing.push('package.json');
if(!['package-lock.json','npm-shrinkwrap.json','pnpm-lock.yaml','yarn.lock','bun.lock'].some(n=>selected.has(n)))manifest.missing.push('dependency lockfile');
if(![...selected.keys()].some(n=>/^(public\/)?data\/.+\.json$/.test(n)))manifest.missing.push('authored data JSON');
manifest.status=manifest.missing.length||missingLocalImports.size?'INCOMPLETE':'CAPTURED';
selected.set('BLOB_INTEGRATION_BASE_MANIFEST.json',Buffer.from(JSON.stringify(manifest,null,2)));
const table=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(b){let c=0xffffffff;for(const n of b)c=table[(c^n)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
const chunks=[],central=[];let offset=0;
for(const [name,bytes]of selected){
 const filename=Buffer.from(name,'utf8'),compressed=deflateRawSync(bytes),crc=crc32(bytes);
 const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(8,8);h.writeUInt16LE(33,12);
 h.writeUInt32LE(crc,14);h.writeUInt32LE(compressed.length,18);h.writeUInt32LE(bytes.length,22);h.writeUInt16LE(filename.length,26);
 chunks.push(h,filename,compressed);
 const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(8,10);c.writeUInt16LE(33,14);
 c.writeUInt32LE(crc,16);c.writeUInt32LE(compressed.length,20);c.writeUInt32LE(bytes.length,24);c.writeUInt16LE(filename.length,28);c.writeUInt32LE(offset,42);
 central.push(c,filename);offset+=h.length+filename.length+compressed.length;
}
const centralBytes=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(selected.size,8);end.writeUInt16LE(selected.size,10);end.writeUInt32LE(centralBytes.length,12);end.writeUInt32LE(offset,16);
const output=path.join(root,'BLOB_INTEGRATION_BASE_'+Date.now()+'.zip');
fs.writeFileSync(output,Buffer.concat([...chunks,centralBytes,end]),{flag:'wx'});
console.log(JSON.stringify({status:manifest.status,output,fileCount:selected.size,installedThreeVersion:installedThree,missing:manifest.missing,bytes:fs.statSync(output).size},null,2));
