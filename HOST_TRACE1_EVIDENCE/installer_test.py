from pathlib import Path
import tempfile,shutil,subprocess,json
out=Path('deliverables/host_trace1');base=Path('audit/host_trace1/BASE_SessionTelemetrySystem.js').read_bytes();new=Path('candidate_base/src/core/SessionTelemetrySystem.js').read_bytes();checks=[]
with tempfile.TemporaryDirectory() as t:
 root=Path(t);shutil.copytree(out,root,dirs_exist_ok=True);p=root/'src/core/SessionTelemetrySystem.js';p.parent.mkdir(parents=True);p.write_bytes(base);d=root/'src/data/RecipeDataSystem.js';d.parent.mkdir(parents=True);shutil.copyfile('candidate_base/src/data/RecipeDataSystem.js',d)
 def run(mode='',ok=True):
  r=subprocess.run(['node',str(root/'APPLY_HOST_TRACE1.mjs')]+([mode] if mode else []),capture_output=True);assert (r.returncode==0)==ok,r.stderr.decode()
 run('--check');checks.append('baseline and prerequisite accepted');run();assert p.read_bytes()==new;assert (root/'HOST_TRACE1_BACKUP/src/core/SessionTelemetrySystem.js').read_bytes()==base;checks.append('exact apply and backup');run();checks.append('idempotence');run('--restore');assert p.read_bytes()==base;checks.append('exact restore');p.write_bytes(base+b'changed');run(ok=False);run('--restore',ok=False);assert p.read_bytes()==base+b'changed';checks.append('later edits preserved');p.write_bytes(base);(root/'HOST_TRACE1_PATCH/src/core/SessionTelemetrySystem.js').write_bytes(b'bad');run(ok=False);assert p.read_bytes()==base;checks.append('corrupt payload refused');d.write_bytes(b'old');run(ok=False);assert p.read_bytes()==base;checks.append('missing prerequisite refused')
Path('audit/host_trace1/installer.json').write_text(json.dumps({'summary':{'passed':len(checks),'failed':0},'checks':checks},indent=2));print(len(checks),'installer checks passed')
