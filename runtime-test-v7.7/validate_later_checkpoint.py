#!/usr/bin/env python3
"""Read-only later-checkpoint compatibility gate; never edits historical contracts."""
import hashlib,json,sys
from pathlib import Path
root=Path(sys.argv[1]).resolve()
sha=lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
contract=json.loads((root/'public/data/build/hc031w1StabilizedAimLocalContactContract.json').read_text())
w2=json.loads((root/'HC031W2A1_FILE_MANIFEST.json').read_text())
c0=json.loads((root/'BLOB_C0E2_COMPOUND_DELTA/MANIFEST.json').read_text())
movement='src/player/PlayerMovementController.js'; surface='src/player/CoreSurfaceTruthSystem.js'
checks={}
checks['historical_contract_identity']=contract.get('buildId')=='HC-031W1'
for rel,expected in contract['lockedFileHashes'].items():
    if rel in (movement,surface): continue
    checks['historical_unchanged:'+rel]=(root/rel).is_file() and sha(root/rel)==expected
for rel,manifest,basekey,outkey in [(movement,c0,'before','after'),(surface,w2,'expectedBaseSha256','sha256')]:
    entry=next((x for x in manifest['files'] if x.get('path')==rel),None)
    checks['authorized_chain:'+rel]=bool(entry and entry.get(basekey)==contract['lockedFileHashes'][rel] and (root/rel).is_file() and sha(root/rel)==entry.get(outkey))
checks['movement_backup_matches_historical']=(root/'BLOB_C0E2_COMPOUND_DELTA/backups'/movement).is_file() and sha(root/'BLOB_C0E2_COMPOUND_DELTA/backups'/movement)==contract['lockedFileHashes'][movement]
result={'gate':'C61-v7.5-later-checkpoint-compatibility','root':str(root),'checks':checks,'passed':sum(checks.values()),'total':len(checks),'success':all(checks.values())}
print(json.dumps(result,indent=2));sys.exit(0 if result['success'] else 1)
