#!/usr/bin/env python3
"""Read-only C61 v7.6 gate. Exit 0 passed, 2 dependency blocked, 1 failed."""
import json,subprocess,sys,hashlib
from pathlib import Path
root=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path.cwd()
here=Path(__file__).resolve().parent
result={'gate':'C61-v7.6','root':str(root),'checks':{}}
def run(cmd):
 p=subprocess.run(cmd,cwd=root,text=True,capture_output=True,timeout=120)
 return {'exit':p.returncode,'stdout':p.stdout[-4000:],'stderr':p.stderr[-2000:]}
if not (root/'package.json').exists():
 print('Expected game checkout root as argument',file=sys.stderr);sys.exit(1)
result['lock_sha256']=hashlib.sha256((root/'package-lock.json').read_bytes()).hexdigest() if (root/'package-lock.json').exists() else None
result['checks']['checkpoint_provenance']=run([sys.executable,str(here/'validate_later_checkpoint.py'),str(root)])
result['checks']['undefined_methods']=run(['node','scripts/auditUndefinedThisMethods.mjs'])
result['checks']['dependencies']=run(['node','--input-type=module','-e',"import('three').then(()=>import('vite')).then(()=>console.log('three/vite available')).catch(e=>{console.error(e.code||e.message);process.exit(2)})"])
if result['checks']['dependencies']['exit']==0:
 result['checks']['build']=run(['npm','run','build'])
else: result['checks']['build']={'status':'NOT RUN: dependencies unavailable'}
failed=any(v.get('exit',0) not in (0,) for k,v in result['checks'].items() if k!='dependencies' and 'exit' in v)
blocked=result['checks']['dependencies']['exit']!=0
result['status']='FAIL' if failed else 'BLOCKED_DEPENDENCIES' if blocked else 'PASS' if result['checks']['build']['exit']==0 else 'FAIL'
print(json.dumps(result,indent=2));sys.exit(1 if result['status']=='FAIL' else 2 if blocked else 0)
