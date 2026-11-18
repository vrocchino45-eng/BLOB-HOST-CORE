from pathlib import Path
import hashlib,sys
root=Path.cwd()
target=root/'src/debug/WorldObjectCensusSystem.js'
patch=Path(__file__).with_name('WorldObjectCensusSystem.js')
if not target.is_file(): sys.exit('STOP: run from BLOB-HOST-CORE repository root')
original=target.read_bytes()
if hashlib.sha256(original).hexdigest() != '934c6aefdf548cd1c33a81dd81c0f6c388156e774a9dcae3fae46971c3875428':
    sys.exit('STOP: recorder source differs from verified baseline; no files changed. Send current src/debug/WorldObjectCensusSystem.js for a safe rebase.')
if not patch.is_file(): sys.exit('STOP: patch payload missing')
backup=target.with_name(target.name+'.GSL4E2F_OBS1.bak')
if backup.exists(): sys.exit('STOP: backup already exists; no files changed')
backup.write_bytes(original)
target.write_bytes(patch.read_bytes())
print('PASS: GSL-4E2F-OBS1 recorder-only patch installed; backup:', backup)
