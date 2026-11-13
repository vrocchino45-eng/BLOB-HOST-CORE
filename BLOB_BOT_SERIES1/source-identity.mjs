import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const schema='blob.bot.source-identity.v1';
const policy='utf8-text-crlf-to-lf-only-v1';
const textExtensions=new Set(['.js','.mjs','.cjs','.ts','.tsx','.jsx','.json','.css','.html','.htm','.md','.txt','.svg','.glsl','.vert','.frag','.wgsl','.yaml','.yml','.csv','.xml']);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const comparePath=(a,b)=>a.path<b.path?-1:a.path>b.path?1:0;
function canonical(files){return JSON.stringify({schema,algorithm:'sha256',textPolicy:policy,files});}

// Separate from the runner's byte-exact mutation guard. Only CRLF in recognized
// UTF-8 text is normalized; binary bytes, whitespace, BOM and final newline stay significant.
export function sourceIdentity(root){
 const files=[];
 function add(file){const relative=path.relative(root,file).replaceAll(path.sep,'/'),bytes=fs.readFileSync(file),text=textExtensions.has(path.extname(relative).toLowerCase());
  const normalized=text?Buffer.from(new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes).replaceAll('\r\n','\n'),'utf8'):bytes;
  files.push({path:relative,encoding:text?'utf8-crlf-normalized':'binary',sha256:hash(normalized)});
 }
 function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else add(file);}}
 for(const dir of ['src','public'])scan(path.join(root,dir));
 for(const file of ['package.json','index.html'])if(fs.existsSync(path.join(root,file)))add(path.join(root,file));
 files.sort(comparePath);return {schema,algorithm:'sha256',textPolicy:policy,fileCount:files.length,fingerprint:hash(canonical(files)),files};
}

export function validateSourceIdentity(value){
 if(value?.schema!==schema||value.algorithm!=='sha256'||value.textPolicy!==policy||!Array.isArray(value.files)||value.fileCount!==value.files.length)throw Error('Missing or unsupported portable source identity');
 const names=new Set();let previous=null;
 for(const file of value.files){if(typeof file.path!=='string'||!file.path||file.path.startsWith('/')||file.path.includes('\\')||file.path.split('/').some(s=>s==='..'||s==='.'||s==='')||names.has(file.path)||previous!==null&&previous>=file.path||!['binary','utf8-crlf-normalized'].includes(file.encoding)||!/^[0-9a-f]{64}$/.test(file.sha256))throw Error('Invalid source-identity file manifest');names.add(file.path);previous=file.path;}
 if(value.fingerprint!==hash(canonical(value.files)))throw Error('Source-identity fingerprint does not match its manifest');return value;
}

export function compareSourceIdentities(a,b){
 validateSourceIdentity(a);validateSourceIdentity(b);
 const left=new Map(a.files.map(f=>[f.path,f])),right=new Map(b.files.map(f=>[f.path,f])),changes=[];
 for(const name of [...new Set([...left.keys(),...right.keys()])].sort()){
  const x=left.get(name),y=right.get(name);
  if(!x)changes.push({path:name,kind:'added'});else if(!y)changes.push({path:name,kind:'removed'});else if(x.sha256!==y.sha256||x.encoding!==y.encoding)changes.push({path:name,kind:'changed'});
 }
 return {equivalent:changes.length===0,changes};
}
