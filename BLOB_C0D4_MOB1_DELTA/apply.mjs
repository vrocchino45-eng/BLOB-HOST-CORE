import {readFileSync,writeFileSync,existsSync,mkdirSync,rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
const folder=dirname(fileURLToPath(import.meta.url));
const root=resolve(folder,'..');
const manifest=JSON.parse(readFileSync(join(folder,'MANIFEST.json'),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const files=manifest.changedFiles.map(row=>({
  ...row,live:join(root,row.path),payload:join(folder,'payload',row.path),backup:join(folder,'backups',row.path)
}));
const mode=process.argv[2]??'--check';
const die=(msg)=>{console.error(msg);process.exitCode=2};
if(!['--check','--apply','--revert'].includes(mode)) die('Usage: node BLOB_C0D4_MOB1_DELTA/apply.mjs --check|--apply|--revert');
else {
  const current=files.map(f=>existsSync(f.live)?hash(readFileSync(f.live)):null);
  const before=files.every((f,i)=>current[i]===f.beforeSha256);
  const after=files.every((f,i)=>current[i]===f.afterSha256);
  if(mode==='--check') {
    if(before) console.log('C0D4_OBS1_READY: exact recorder baseline found');
    else if(after) console.log('C0D4_MOB1_INSTALLED: exact diagnostic revision already active');
    else die('DIFFERENT: current recorder does not match expected OBS1 or MOB1 source; no changes made: '+JSON.stringify(current));
  } else if(mode==='--apply') {
    if(after) console.log('C0D4_MOB1_INSTALLED: no changes needed');
    else if(!before) die('DIFFERENT: refusing to overwrite divergent recorder');
    else {
      try {
        const payload=files.map(f=>readFileSync(f.payload));
        if(payload.some((b,i)=>hash(b)!==files[i].afterSha256)) throw Error('PAYLOAD_CORRUPTED');
        if(files.some(f=>existsSync(f.backup))) throw Error('BACKUP_ALREADY_EXISTS');
        const originals=files.map(f=>readFileSync(f.live));
        files.forEach((f,i)=>{mkdirSync(dirname(f.backup),{recursive:true});writeFileSync(f.backup,originals[i]);});
        try {
          files.forEach((f,i)=>writeFileSync(f.live,payload[i]));
          if(files.some(f=>hash(readFileSync(f.live))!==f.afterSha256)) throw Error('POST_INSTALL_HASH_MISMATCH');
        } catch(error) {files.forEach((f,i)=>writeFileSync(f.live,originals[i]));throw error;}
        console.log('C0D4-MOB1 INSTALLED: one recorder owner changed; no gameplay logic modified; exact backup saved');
      } catch(error){die('INSTALL_ABORTED: '+error.message)}
    }
  } else {
    if(!after) die('DIFFERENT: recorder no longer matches MOB1; refusing rollback');
    else if(files.some(f=>!existsSync(f.backup)||hash(readFileSync(f.backup))!==f.beforeSha256)) die('BACKUP_MISSING_OR_DIFFERENT: refusing rollback');
    else {files.forEach(f=>{writeFileSync(f.live,readFileSync(f.backup));rmSync(f.backup)});
      console.log('C0D4-MOB1 REVERTED: exact OBS1 source restored')}
  }
}
