from pathlib import Path
import tempfile,shutil,subprocess,json
out=Path('deliverables/paired_demand2');entries=json.loads((out/'PAIRED_DEMAND2_MANIFEST.json').read_text())['files'];checks=[]
with tempfile.TemporaryDirectory() as t:
 root=Path(t);shutil.copytree(out,root,dirs_exist_ok=True)
 def seed():
  for e in entries:
   p=root/e['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((Path('audit/paired_demand2')/p.name).read_bytes())
 def run(mode='',success=True):
  r=subprocess.run(['node',str(root/'APPLY_PAIRED_DEMAND2.mjs')]+([mode] if mode else []),capture_output=True);assert (r.returncode==0)==success,r.stderr.decode()
 seed();run('--check');checks.append('both known baselines accepted')
 run()
 for e in entries:
  assert (root/e['path']).read_bytes()==(out/'PAIRED_DEMAND2_PATCH'/e['path']).read_bytes()
  assert (root/'PAIRED_DEMAND2_BACKUP'/e['path']).read_bytes()==(Path('audit/paired_demand2')/Path(e['path']).name).read_bytes()
 checks.append('exact two-file apply and backup');run();checks.append('idempotence');run('--restore')
 for e in entries:assert (root/e['path']).read_bytes()==(Path('audit/paired_demand2')/Path(e['path']).name).read_bytes()
 checks.append('exact two-file restore')
 for e in entries:
  seed();p=root/e['path'];p.write_bytes(p.read_bytes()+b'\n// later edit');before={x['path']:(root/x['path']).read_bytes() for x in entries};run(success=False);run('--restore',success=False)
  assert all((root/k).read_bytes()==v for k,v in before.items());checks.append('unknown '+e['path']+' prevents any apply/restore writes')
 seed();(root/'PAIRED_DEMAND2_PATCH'/entries[1]['path']).write_bytes(b'bad');before={x['path']:(root/x['path']).read_bytes() for x in entries};run(success=False);assert all((root/k).read_bytes()==v for k,v in before.items());checks.append('second payload corruption rejected before first write')
Path('audit/paired_demand2/installer.json').write_text(json.dumps({'summary':{'passed':len(checks),'failed':0},'checks':checks},indent=2));print(len(checks),'installer checks pass')
