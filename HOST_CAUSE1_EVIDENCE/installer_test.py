from pathlib import Path
import tempfile,subprocess,json,shutil
out=Path('deliverables/host_cause1');entries=json.loads((out/'HOST_CAUSE1_MANIFEST.json').read_text())['files'];checks=[]
with tempfile.TemporaryDirectory() as t:
 root=Path(t);shutil.copytree(out,root,dirs_exist_ok=True)
 for e in json.loads(Path('deliverables/authority1/AUTHORITY1_MANIFEST.json').read_text())['files']:
  if e['path'].endswith('.js'):
   p=root/e['path'];p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(Path('candidate_base')/e['path'],p)
 def seed():
  for e in entries:
   p=root/e['path'];p.parent.mkdir(parents=True,exist_ok=True)
   if e['before'] is None:p.unlink(missing_ok=True)
   else:p.write_bytes((Path('audit/host_cause1/BASE')/e['path']).read_bytes())
 def run(mode='',ok=True):
  r=subprocess.run(['node',str(root/'APPLY_HOST_CAUSE1.mjs')]+([mode] if mode else []),capture_output=True);assert (r.returncode==0)==ok,r.stderr.decode()
 seed();run('--check');checks.append('exact baselines and authority prerequisite')
 run()
 for e in entries:
  assert (root/e['path']).read_bytes()==(out/'HOST_CAUSE1_PATCH'/e['path']).read_bytes()
  if e['before']:assert (root/'HOST_CAUSE1_BACKUP'/e['path']).read_bytes()==(Path('audit/host_cause1/BASE')/e['path']).read_bytes()
 checks.append('exact four-file install and original backups');run();checks.append('idempotent')
 run('--restore')
 for e in entries:
  if e['before']:assert (root/e['path']).read_bytes()==(Path('audit/host_cause1/BASE')/e['path']).read_bytes()
  else:assert not (root/e['path']).exists()
 checks.append('restore originals and remove exact new module')
 for e in entries:
  seed();p=root/e['path'];p.write_bytes((p.read_bytes() if p.exists() else b'')+b'unknown');before={e['path']:((root/e['path']).read_bytes() if (root/e['path']).exists() else None) for e in entries};run(ok=False);run('--restore',ok=False);assert all(((root/k).read_bytes() if (root/k).exists() else None)==v for k,v in before.items());checks.append('later edits protected: '+e['path'])
 seed();(root/'HOST_CAUSE1_PATCH'/entries[-1]['path']).write_bytes(b'bad');run(ok=False);assert not (root/entries[0]['path']).exists();checks.append('late corrupt payload prevents new-module write')
 seed();(root/'src/core/HostCoreSourceAuthority.js').write_bytes(b'old authority');run(ok=False);assert not (root/entries[0]['path']).exists();checks.append('missing authority prerequisite prevents writes')
Path('audit/host_cause1/installer.json').write_text(json.dumps({'summary':{'passed':len(checks),'failed':0},'checks':checks},indent=2));print(len(checks),'installer checks passed')
