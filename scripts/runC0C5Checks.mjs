/** BLOB C0C5-A1 runner: existing C0C2/C0C3/C0C4 parity + audit selftest + optional recording & Vite build.
 * Usage: node scripts/runC0C5Checks.mjs [--recording "path/REC1.json"] [--build]
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const recIdx = args.indexOf('--recording');
const rec = recIdx >= 0 ? args[recIdx + 1] : null;
if (recIdx >= 0 && (!rec || rec.startsWith('--'))) {
  console.error('Specify a path after --recording');process.exit(1);
}
const jobs = [
  ['C0C2 shared accumulator parity','scripts/validateC0C2Accumulator.mjs'],
  ['C0C3 Silt parity','scripts/validateC0C3Silt.mjs'],
  ['C0C4 Vascular parity','scripts/validateC0C4Vascular.mjs'],
  ['C0C5-A1 recorder audit self-test','scripts/testC0C5RecordingAudit.mjs']
];
if (rec) jobs.push(['C0C5 field recording','scripts/analyzeC0C5Recording.mjs',resolve(rec)]);
let bad=false, incomplete=false;
for (const [label, script, ...extra] of jobs) {
  console.log(`\n========== ${label} ==========`);
  const path=resolve(root,script);
  if (!existsSync(path)) {console.error(`MISSING ${path}`);bad=true;continue;}
  const r=spawnSync(process.execPath,[path,...extra],{cwd:root,stdio:'inherit'});
  if (r.error || r.status === null) {console.error(`FAILED EXECUTION: ${r.error?.message ?? 'terminated'}`);bad=true;}
  else if (r.status===3 && extra.length) {console.warn('INCOMPLETE: recording lacks needed live evidence');incomplete=true;}
  else if (r.status!==0) {console.error(`FAIL (${r.status}): ${label}`);bad=true;}
}
if (args.includes('--build')) {
  console.log('\n========== Vite production build ==========' );
  const cmd=process.platform==='win32'?'npm.cmd':'npm';
  const r=spawnSync(cmd,['run','build'],{cwd:root,stdio:'inherit',shell:process.platform==='win32'});
  if (r.error || r.status!==0) {console.error('Production build failed');bad=true;}
}
console.log('\n'+JSON.stringify({pass:'C0C5-A1',result:bad?'FAILED':incomplete?'INCOMPLETE_FIELD_EVIDENCE':'AUTOMATION_CHECKS_PASSED',
  note:'C0C5 field acceptance still requires live REC1 evidence and visible/feel observation; source parity is not runtime proof.'},null,2));
process.exitCode=bad?2:incomplete?3:0;
