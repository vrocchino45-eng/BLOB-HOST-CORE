#!/usr/bin/env python3
"""C62 provenance: exact bytes first; CRLF/LF equivalence only as fallback."""
import hashlib,json,sys
from pathlib import Path
root=Path(sys.argv[1]).resolve()
def raw(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def normalized(p): return hashlib.sha256(p.read_bytes().replace(b'\r\n',b'\n')).hexdigest()
def matches(p,expected): return p.is_file() and (raw(p)==expected or normalized(p)==expected)
contract=json.loads((root/'public/data/build/hc031w1StabilizedAimLocalContactContract.json').read_text())
w2=json.loads((root/'HC031W2A1_FILE_MANIFEST.json').read_text())
c0=json.loads((root/'BLOB_C0E2_COMPOUND_DELTA/MANIFEST.json').read_text())
movement='src/player/PlayerMovementController.js';surface='src/player/CoreSurfaceTruthSystem.js'
checks={'historical_contract_identity':contract.get('buildId')=='HC-031W1'}
for rel,expected in contract['lockedFileHashes'].items():
    if rel not in (movement,surface): checks['historical_unchanged:'+rel]=matches(root/rel,expected)
for rel,manifest,basekey,outkey in [(movement,c0,'before','after'),(surface,w2,'expectedBaseSha256','sha256')]:
    entry=next((x for x in manifest['files'] if x.get('path')==rel),None)
    checks['authorized_chain:'+rel]=bool(entry and entry.get(basekey)==contract['lockedFileHashes'][rel] and matches(root/rel,entry.get(outkey)))
checks['movement_backup_matches_historical']=matches(root/'BLOB_C0E2_COMPOUND_DELTA/backups'/movement,contract['lockedFileHashes'][movement])
result={'gate':'C62-normalized-provenance','checks':checks,'passed':sum(checks.values()),'total':len(checks),'success':all(checks.values()),'normalization':'CRLF to LF only; original manifests unchanged'}
print(json.dumps(result,indent=2));sys.exit(0 if result['success'] else 1)
