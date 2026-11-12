from pathlib import Path
import tempfile,shutil,subprocess,json
out=Path('deliverables/archive_grave1');base=Path('audit/archive_grave1/BASE_RecipeDataSystem.js').read_bytes();new=Path('candidate_base/src/data/RecipeDataSystem.js').read_bytes();checks=[]
with tempfile.TemporaryDirectory() as t:
 root=Path(t);shutil.copytree(out,root,dirs_exist_ok=True);p=root/'src/data/RecipeDataSystem.js';p.parent.mkdir(parents=True);p.write_bytes(base)
 def run(mode='',ok=True):
  r=subprocess.run(['node',str(root/'APPLY_ARCHIVE_GRAVE1.mjs')]+([mode] if mode else []),capture_output=True);assert (r.returncode==0)==ok,r.stderr.decode()
 run('--check');checks.append('known baseline check');run();assert p.read_bytes()==new;assert (root/'ARCHIVE_GRAVE1_BACKUP/src/data/RecipeDataSystem.js').read_bytes()==base;checks.append('exact apply and backup');run();checks.append('idempotence');run('--restore');assert p.read_bytes()==base;checks.append('exact restore')
 p.write_bytes(base+b'\n// later edit');run(ok=False);run('--restore',ok=False);assert p.read_bytes()==base+b'\n// later edit';checks.append('apply/restore preserve later edits')
 p.write_bytes(base);(root/'ARCHIVE_GRAVE1_PATCH/src/data/RecipeDataSystem.js').write_bytes(b'bad');run(ok=False);assert p.read_bytes()==base;checks.append('corrupt payload refused before write')
Path('audit/archive_grave1/installer.json').write_text(json.dumps({'summary':{'passed':len(checks),'failed':0},'checks':checks},indent=2));print(len(checks),'installer checks passed')
