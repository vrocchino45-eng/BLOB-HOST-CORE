from pathlib import Path
import tempfile,subprocess,json,shutil
out=Path('deliverables/authority1');entries=json.loads((out/'AUTHORITY1_MANIFEST.json').read_text())['files'];checks=[]
with tempfile.TemporaryDirectory() as t:
 root=Path(t);shutil.copytree(out,root,dirs_exist_ok=True)
 def seed():
  for e in entries:
   p=root/e['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((Path('audit/authority1/BASE')/e['path']).read_bytes())
 def run(mode='',ok=True):
  r=subprocess.run(['node',str(root/'APPLY_AUTHORITY1.mjs')]+([mode] if mode else []),capture_output=True);assert (r.returncode==0)==ok,r.stderr.decode()
 seed();run('--check');checks.append('all baselines checked');run()
 for e in entries:
  assert (root/e['path']).read_bytes()==(out/'AUTHORITY1_PATCH'/e['path']).read_bytes();assert (root/'AUTHORITY1_BACKUP'/e['path']).read_bytes()==(Path('audit/authority1/BASE')/e['path']).read_bytes()
 checks.append('exact three-file apply and backups');run();checks.append('idempotent');run('--restore')
 for e in entries:assert (root/e['path']).read_bytes()==(Path('audit/authority1/BASE')/e['path']).read_bytes()
 checks.append('exact restore')
 for e in entries:
  seed();p=root/e['path'];p.write_bytes(p.read_bytes()+b' ');before={e['path']:(root/e['path']).read_bytes() for e in entries};run(ok=False);run('--restore',ok=False);assert all((root/k).read_bytes()==v for k,v in before.items());checks.append('unknown edit protected: '+e['path'])
 seed();(root/'AUTHORITY1_PATCH'/entries[-1]['path']).write_bytes(b'bad');before={e['path']:(root/e['path']).read_bytes() for e in entries};run(ok=False);assert all((root/k).read_bytes()==v for k,v in before.items());checks.append('last corrupt payload rejected before writes')
Path('audit/authority1/installer.json').write_text(json.dumps({'summary':{'passed':len(checks),'failed':0},'checks':checks},indent=2));print(len(checks),'installer checks passed')
