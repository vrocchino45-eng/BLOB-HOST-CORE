from pathlib import Path
import tempfile,shutil,subprocess,json
out=Path('deliverables/core_read1');base=Path('audit/core_read1/BASE_PlaytestHudSystem.js').read_bytes();new=Path('candidate_base/src/ui/PlaytestHudSystem.js').read_bytes();checks=[]
with tempfile.TemporaryDirectory() as t:
 root=Path(t);shutil.copytree(out,root,dirs_exist_ok=True);p=root/'src/ui/PlaytestHudSystem.js';p.parent.mkdir(parents=True);p.write_bytes(base)
 def run(mode='',success=True):
  r=subprocess.run(['node',str(root/'APPLY_CORE_READ1.mjs')]+([mode] if mode else []),capture_output=True);assert (r.returncode==0)==success,r.stderr.decode()
 run('--check');checks.append('baseline accepted')
 run();assert p.read_bytes()==new;assert (root/'CORE_READ1_BACKUP/src/ui/PlaytestHudSystem.js').read_bytes()==base;checks.append('exact apply and backup')
 run();assert p.read_bytes()==new;checks.append('idempotent apply')
 run('--restore');assert p.read_bytes()==base;checks.append('exact restore')
 p.write_bytes(base+b'\n// later edit');run(success=False);assert p.read_bytes()==base+b'\n// later edit';checks.append('unknown edit refused')
 run('--restore',success=False);checks.append('restore preserves unknown edit')
 p.write_bytes(base);(root/'CORE_READ1_PATCH/src/ui/PlaytestHudSystem.js').write_bytes(b'corrupt');run(success=False);assert p.read_bytes()==base;checks.append('corrupt payload refused before write')
Path('audit/core_read1/installer.json').write_text(json.dumps({'summary':{'passed':len(checks),'failed':0},'checks':checks},indent=2));print(len(checks),'installer checks pass')
