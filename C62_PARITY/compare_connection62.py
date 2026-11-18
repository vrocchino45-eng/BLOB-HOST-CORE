#!/usr/bin/env python3
"""Read-only C62 source parity check. Usage: python compare_connection62.py CLEAN_ROOT ACTIVE_ROOT"""
import hashlib, json, sys
from pathlib import Path
if len(sys.argv)!=3:
    sys.exit('Usage: python compare_connection62.py CLEAN_ROOT ACTIVE_ROOT')
clean, active = [Path(x).resolve() for x in sys.argv[1:]]
paths = [
 'src/fields/ApertureAdjacentTerritorySystem.js',
 'src/fields/MembraneRidgeGameplaySystem.js',
 'src/player/CoreSurfaceTruthSystem.js',
 'BLOB_C0E2_COMPOUND_DELTA/backups/src/player/PlayerMovementController.js',
 'src/player/PlayerMovementController.js',
 'public/data/build/hc031w1StabilizedAimLocalContactContract.json',
 'HC031W2A1_FILE_MANIFEST.json',
 'BLOB_C0E2_COMPOUND_DELTA/MANIFEST.json',
]
def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None
entries=[]
for rel in paths:
    a,b=digest(clean/rel),digest(active/rel)
    entries.append({'path':rel,'clean_sha256':a,'active_sha256':b,'match':a==b and a is not None})
result={'clean_root':str(clean),'active_root':str(active),'matches':sum(e['match'] for e in entries),'total':len(entries),'files':entries}
print(json.dumps(result,indent=2))
sys.exit(0 if all(e['match'] for e in entries) else 1)
