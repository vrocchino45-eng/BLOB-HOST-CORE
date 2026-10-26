import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const folder = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(folder);
const manifest = JSON.parse(fs.readFileSync(path.join(folder,'MANIFEST.json'),'utf8'));
const sha = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const current = f => { const p=path.join(root,f.path); return fs.existsSync(p) ? sha(fs.readFileSync(p)) : null; };
// Exact audit-verified alternate: Windows CRLF variant of the Hub owner only.
// SHA-256 of the screenshot's live Hub file and reproduced from the known LF baseline.
const hubPath = 'src/hub/HubChamberFoundationSystem.js';
const hubCRLFHash = '7f62cbf50b0d6f78348ccded5629ddcb81299792f50e8e65121fa179e0ea44f1';
const hubIsVerifiedCRLF = (f, hash) => {
  if (f.path !== hubPath || hash !== hubCRLFHash) return false;
  const bytes = fs.readFileSync(path.join(root, f.path));
  const text = bytes.toString('utf8');
  if (!text.includes('\r\n') || /\r(?!\n)/.test(text)) return false;
  return sha(Buffer.from(text.replace(/\r\n/g, '\n'),'utf8')) === f.before;
};
const matchesBefore = (f, hash) => hash === f.before || hubIsVerifiedCRLF(f, hash);
const fail = (message) => {console.error('DIFFERENT: '+message+'; nothing overwritten.');process.exit(2);};
const cmd = process.argv[2] ?? '--check';
if(!['--check','--apply','--revert'].includes(cmd)) fail('valid options: --check, --apply, --revert');
const states = manifest.files.map(f=>({f,hash:current(f)}));
const originals = states.every(({f,hash})=>matchesBefore(f,hash));
const crlfHub = states.some(({f,hash}) => hubIsVerifiedCRLF(f,hash));
const installed = states.every(({f,hash})=>hash===f.after);
if(cmd==='--check') {
 if(originals) console.log('C0D4_MOB1_READY: seven-file compound expansion can be applied safely' + (crlfHub ? ' (verified Hub CRLF variant accepted)' : ''));
 else if(installed) console.log('C0E1_INSTALLED: compound territories and recorder are installed');
 else fail('source hash mismatch; expected exact C0D4-MOB1 baseline');
 process.exit(0);
}
if(cmd==='--apply') {
 if(installed) {console.log('C0E1_INSTALLED: already installed, no changes');process.exit(0);}
 if(!originals) fail('all source files must match the C0D4-MOB1 baseline before applying');
 const plan = manifest.files.map(f=>({f,body:fs.readFileSync(path.join(folder,'payload',f.path))}));
 for(const {f,body} of plan) if(sha(body)!==f.after) fail('tampered payload '+f.path);
 for(const {f} of plan) {
   if(f.before) {
     const b=path.join(folder,'backups',f.path);fs.mkdirSync(path.dirname(b),{recursive:true});
     const live=fs.readFileSync(path.join(root,f.path));
     if(!matchesBefore(f,sha(live))) fail('source changed during preflight '+f.path);
     fs.writeFileSync(b,live);
   }
 }
 let completed=[];
 try {
   for(const {f,body} of plan) {
     const p=path.join(root,f.path);fs.mkdirSync(path.dirname(p),{recursive:true});
     const temp=p+'.C0E1_TMP';fs.writeFileSync(temp,body);fs.renameSync(temp,p);completed.push(f);
   }
 } catch(err) {
   for(const f of completed.reverse()) {
     const p=path.join(root,f.path);
     if(f.before) fs.copyFileSync(path.join(folder,'backups',f.path),p);
     else fs.rmSync(p,{force:true});
   }
   throw err;
 }
 console.log('C0E1_INSTALLED: 4 regional territory owners, 12 experimental sites, REC1 observation; source backups retained');
 process.exit(0);
}
// Backups may contain either the original LF bytes or the exact audited Hub CRLF bytes.
// Check the backup itself, not the installed source, to preserve exact byte-for-byte rollback.
const matchesBackup = (f, body) => {
  if (sha(body) === f.before) return true;
  if (f.path !== hubPath || sha(body) !== hubCRLFHash) return false;
  const decoded = body.toString('utf8');
  return decoded.includes('\r\n') && !/\r(?!\n)/.test(decoded) &&
    sha(Buffer.from(decoded.replace(/\r\n/g,'\n'),'utf8')) === f.before;
};
if(!installed) fail('revert requires exact unmodified C0E1 sources');
for(const f of manifest.files) {
 if(!f.before) continue;
 const backup=path.join(folder,'backups',f.path);
 if(!fs.existsSync(backup) || !matchesBackup(f,fs.readFileSync(backup))) fail('backup missing or divergent '+f.path);
}
for(const f of manifest.files) {
 const p=path.join(root,f.path);
 if(!f.before) fs.rmSync(p,{force:true});
 else fs.copyFileSync(path.join(folder,'backups',f.path),p);
}
console.log('C0D4_MOB1_READY: exact original source restored; new C0E1 files removed');
