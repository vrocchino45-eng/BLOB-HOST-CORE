#!/usr/bin/env node
// C0D1-B exact-SHA multi-owner guarded relay delta; no force/partial install.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const base = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const mode = process.argv[2] ?? '--check';
if (!['--check','--apply','--revert'].includes(mode)) {
  console.error('Usage: node BLOB_C0D1B_DELTA/apply.mjs --check|--apply|--revert');
  process.exit(2);
}
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const m=JSON.parse(fs.readFileSync(path.join(base,'MANIFEST.json'),'utf8'));
const patch=JSON.parse(fs.readFileSync(path.join(base,'PATCH.json'),'utf8'));
const paths=m.changedGameplayFiles;
const pathAt = p => path.resolve(root,p);
const read = p => fs.readFileSync(pathAt(p));
if (!fs.existsSync(pathAt('package.json'))) {
  console.error('NOT_PROJECT_ROOT: run from BLOB-HOST-CORE root containing src/ and package.json');process.exit(2);
}
for (const [rel, expected] of Object.entries(m.requiredUnmodifiedDependency)) {
  if (!fs.existsSync(pathAt(rel)) || digest(read(rel))!==expected) {
    console.error(`DEPENDENCY_DIFFERENT: ${rel}. C0D1-A must be installed and unchanged.`);process.exit(1);
  }
}
const hashes={};
for(const rel of paths) {
  if(!fs.existsSync(pathAt(rel))) {console.error(`NOT_FOUND: ${rel}`);process.exit(2);}
  hashes[rel]=digest(read(rel));
}
const ready=paths.every(rel=>hashes[rel]===m.sourceBeforeSha256[rel]);
const installed=paths.every(rel=>hashes[rel]===m.sourceAfterSha256[rel]);
if (mode==='--check') {
  if (ready) console.log('C0D1A_VIS1B_READY: exact compatible sources found, two-owner relay patch ready');
  else if (installed) console.log('C0D1B_INSTALLED: exact files already active');
  else {console.error(`DIFFERENT: refuse mixed/unexpected files: ${JSON.stringify(hashes)}`);process.exitCode=1;}
  process.exit();
}
if (mode==='--apply' && installed) {console.log('C0D1B_INSTALLED: no changes needed');process.exit(0);}
if (mode==='--revert' && ready) {console.log('C0D1A_VIS1B_READY: already reverted');process.exit(0);}
if (mode==='--apply' && !ready || mode==='--revert' && !installed) {
  console.error('DIFFERENT: both source files must be in the exact expected state; no files changed');process.exit(1);
}
const backupDir=path.join(base,'backups');
const backupFile=rel=>path.join(backupDir,rel.replaceAll('/','__')+'.before_C0D1B');
if(mode==='--apply') {
  const original=fs.readFileSync(pathAt(patch.path),'utf8');
  if (original.split(patch.find).length!==2) {console.error('PATCH_ANCHOR_DIFFERENT: route content changed');process.exit(1);}
  const newRoute=Buffer.from(original.replace(patch.find,patch.replace),'utf8');
  const newLedger=fs.readFileSync(path.join(base,'payload/src/core/HostConnectionReceiptLedger.js'));
  const replacements={'src/core/HostConnectionReceiptLedger.js':newLedger,[patch.path]:newRoute};
  for(const rel of paths) {
    if(digest(replacements[rel])!==m.sourceAfterSha256[rel]) {
      console.error(`INVALID_PAYLOAD: ${rel}`);process.exit(1);
    }
    if(fs.existsSync(backupFile(rel)) && digest(fs.readFileSync(backupFile(rel)))!==m.sourceBeforeSha256[rel]){
      console.error(`DIFFERENT_BACKUP: ${rel}`);process.exit(1);
    }
  }
  fs.mkdirSync(backupDir,{recursive:true});
  for(const rel of paths)if(!fs.existsSync(backupFile(rel)))fs.writeFileSync(backupFile(rel),read(rel));
  const changed=[];
  try {
    for(const rel of paths){fs.writeFileSync(pathAt(rel),replacements[rel]);changed.push(rel);}
    for(const rel of paths)if(digest(read(rel))!==m.sourceAfterSha256[rel])throw Error(`Post-write mismatch ${rel}`);
  } catch(e) {
    for (const rel of changed)fs.writeFileSync(pathAt(rel),fs.readFileSync(backupFile(rel)));
    throw e;
  }
  console.log('C0D1-B INSTALLED: independent Host Vascular-effect relay; two owner files changed, exact backups retained; Grave unchanged.');
} else {
  for(const rel of paths)if(!fs.existsSync(backupFile(rel)) || digest(fs.readFileSync(backupFile(rel)))!==m.sourceBeforeSha256[rel]){
    console.error(`NO_VALID_BACKUP: ${rel}; refusing entire rollback`);process.exit(1);
  }
  const originals=Object.fromEntries(paths.map(rel=>[rel,fs.readFileSync(backupFile(rel))]));
  const changed=[];
  try {
    for(const rel of paths){fs.writeFileSync(pathAt(rel),originals[rel]);changed.push(rel);}
    for(const rel of paths)if(digest(read(rel))!==m.sourceBeforeSha256[rel])throw Error(`Rollback verification mismatch ${rel}`);
  } catch(e) {
    // No automatic restoration of installed sources without exact payload for both;
    // preserve backups and report write failure.
    throw e;
  }
  console.log('C0D1-B REVERTED: exact pre-B Host ledger and VIS1-B Vascular route restored; C0D1-A retained.');
}
