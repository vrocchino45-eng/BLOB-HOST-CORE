#!/usr/bin/env python3
"""C61 Windows runtime gate v7.8: read-only, machine-readable, Windows npm.cmd support."""
import hashlib, json, os, shutil, subprocess, sys
from pathlib import Path
root = Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path.cwd()
here = Path(__file__).resolve().parent
result = {'gate':'C61-v7.8','root':str(root),'checks':{}}
def run(cmd):
    try:
        p = subprocess.run(cmd,cwd=root,text=True,capture_output=True,timeout=180,errors='replace')
        return {'exit':p.returncode,'stdout':p.stdout[-12000:],'stderr':p.stderr[-8000:]}
    except (OSError,subprocess.TimeoutExpired) as exc:
        return {'exit':127,'error':str(exc),'command':cmd[0]}
if not (root/'package.json').is_file():
    result['status']='FAIL';result['error']='GameRoot must contain package.json'
else:
    lock=root/'package-lock.json'
    result['lock_sha256']=hashlib.sha256(lock.read_bytes()).hexdigest() if lock.is_file() else None
    result['checks']['checkpoint_provenance']=run([sys.executable,str(here/'validate_later_checkpoint.py'),str(root)])
    result['checks']['undefined_methods']=run(['node','scripts/auditUndefinedThisMethods.mjs'])
    result['checks']['dependencies']=run(['node','--input-type=module','-e',"import('three').then(()=>import('vite')).then(()=>console.log('three/vite available')).catch(e=>{console.error(e.code||e.message);process.exit(2)})"])
    if result['checks']['dependencies']['exit']==0:
        npm='npm.cmd' if os.name=='nt' else 'npm'
        result['checks']['build']=run([npm,'run','build'])
    else:
        result['checks']['build']={'status':'NOT RUN: dependencies unavailable'}
    failed=any(c.get('exit',0)!=0 for k,c in result['checks'].items() if k!='dependencies')
    blocked=result['checks']['dependencies']['exit']!=0
    result['status']='FAIL' if failed else 'BLOCKED_DEPENDENCIES' if blocked else 'PASS'
print(json.dumps(result,indent=2))
sys.exit(0 if result['status']=='PASS' else 2 if result['status']=='BLOCKED_DEPENDENCIES' else 1)
