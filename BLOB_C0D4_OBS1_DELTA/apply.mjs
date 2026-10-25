import {readFileSync, writeFileSync, existsSync, mkdirSync, rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const dir=dirname(fileURLToPath(import.meta.url));
const project=resolve(dir,'..');
const manifest=JSON.parse(readFileSync(join(dir,'MANIFEST.json'),'utf8'));
const digest=b=>createHash('sha256').update(b).digest('hex');
const fail=(message)=>{console.error(message); process.exitCode=2;};
const rows=manifest.changedFiles.map(spec=>({
  ...spec,
  pathOnDisk:join(project,spec.path),
  payloadPath:join(dir,'payload',spec.path),
  backupPath:join(dir,'backups',spec.path)
}));
const mode=process.argv[2]??'--check';
if (!['--check','--apply','--revert'].includes(mode)) {fail('Usage: node BLOB_C0D4_OBS1_DELTA/apply.mjs --check|--apply|--revert');}
else {
  const hashes=rows.map(row=>({path:row.path,actual:existsSync(row.pathOnDisk)?digest(readFileSync(row.pathOnDisk)):null}));
  const before=rows.every((row,i)=>hashes[i].actual===row.beforeSha256);
  const after=rows.every((row,i)=>hashes[i].actual===row.afterSha256);
  if (mode==='--check') {
    if(before) console.log('C0D3C_READY: original REC1 and C0D3-C runtime exact baselines found');
    else if(after) console.log('C0D4_OBS1_INSTALLED: observation delta already installed');
    else fail('DIFFERENT: source files do not match expected C0D3-C or OBS1 revisions; no files changed: '+JSON.stringify(hashes));
  } else if(mode==='--apply') {
    if(after) console.log('C0D4_OBS1_INSTALLED: nothing to change (idempotent)');
    else if(!before) fail('DIFFERENT: refusing to overwrite divergent/mixed owner files; no files changed');
    else {
      try {
        const payloads=rows.map(row=>readFileSync(row.payloadPath));
        if(payloads.some((b,i)=>digest(b)!==rows[i].afterSha256)) throw Error('DELTA_CORRUPTED: payload hash check failed');
        if(rows.some(row=>existsSync(row.backupPath))) throw Error('BACKUP_EXISTS: examine previous installation first; no files changed');
        const originals=rows.map(row=>readFileSync(row.pathOnDisk));
        rows.forEach((row,i)=>{
          mkdirSync(dirname(row.backupPath),{recursive:true});writeFileSync(row.backupPath,originals[i]);
        });
        try {
          rows.forEach((row,i)=>writeFileSync(row.pathOnDisk,payloads[i]));
          if(rows.some(row=>digest(readFileSync(row.pathOnDisk))!==row.afterSha256)) throw Error('post-install hash mismatch');
        } catch(e) {
          rows.forEach((row,i)=>writeFileSync(row.pathOnDisk,originals[i]));
          throw e;
        }
        console.log('C0D4-OBS1 INSTALLED: 2 diagnostic/runtime-wiring paths changed; old REC1 schema retained; backups saved');
      } catch(e){fail('INSTALL_ABORTED: '+e.message);}
    }
  } else if(mode==='--revert') {
    if(!after) fail('DIFFERENT: cannot revert; owner files do not match OBS1 payloads');
    else if(rows.some(row=>!existsSync(row.backupPath)||digest(readFileSync(row.backupPath))!==row.beforeSha256)) fail('BACKUP_MISSING_OR_DIFFERENT: cannot revert');
    else {
      rows.forEach(row=>writeFileSync(row.pathOnDisk,readFileSync(row.backupPath)));
      rows.forEach(row=>rmSync(row.backupPath));
      console.log('C0D4-OBS1 REVERTED: original recorder and runtime restored exactly');
    }
  }
}
