import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {sourceIdentity,compareSourceIdentities} from './source-identity.mjs';
const args=process.argv.slice(2),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
try{
 if(args.length!==2)throw Error('Usage: node BLOB_BOT_SERIES1/compare-source.mjs SUMMARY_A SUMMARY_B | --current SUMMARY');
 const read=file=>JSON.parse(fs.readFileSync(file,'utf8')).sourceIdentity;
 const a=args[0]==='--current'?read(args[1]):read(args[0]);
 const b=args[0]==='--current'?sourceIdentity(root):read(args[1]);
 const result=compareSourceIdentities(a,b);console.log(JSON.stringify({scope:'Gameplay src/public/package/index under declared text-normalization policy; excludes harness, dependencies, build output and runtime state.',...result},null,2));
 if(!result.equivalent)process.exitCode=1;
}catch(error){console.error(String(error.message)+'; legacy raw hashes alone cannot establish portable equivalence.');process.exitCode=2;}
