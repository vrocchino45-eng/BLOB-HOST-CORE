import hashlib,json,sys,zipfile
from pathlib import Path
base=Path(sys.argv[1]); root=Path(sys.argv[2])
paths=['src/fields/ApertureAdjacentTerritorySystem.js','src/fields/MembraneRidgeGameplaySystem.js','src/player/CoreSurfaceTruthSystem.js','BLOB_C0E2_COMPOUND_DELTA/backups/src/player/PlayerMovementController.js','src/player/PlayerMovementController.js','src/input/InputSystem.js','src/ecology/EntityRelationshipGrammarSystem.js','src/world/CrawlableSurfaceRegistry.js']
def norm(b):return b.replace(b'\r\n',b'\n').replace(b'\r',b'\n')
def sha(b):return hashlib.sha256(b).hexdigest()
with zipfile.ZipFile(base) as z:
 report=[]
 for p in paths:
  matches=[n for n in z.namelist() if n.endswith('/'+p) or n==p]
  local=root.joinpath(*p.split('/'))
  if not local.is_file():report.append({'path':p,'status':'LOCAL_MISSING'});continue
  lb=local.read_bytes()
  candidates=[(n,z.read(n)) for n in matches]
  exact=[n for n,b in candidates if b==lb]
  normalized=[n for n,b in candidates if norm(b)==norm(lb)]
  if exact: status='BYTE_MATCH'
  elif normalized:status='LINE_ENDINGS_ONLY'
  elif candidates:status='CONTENT_DIFFERENT'
  else:status='BASELINE_MISSING'
  report.append({'path':p,'status':status,'baseline_candidates':len(matches),'matching_candidates':exact or normalized,'working_sha256':sha(lb)})
 print(json.dumps({'checks':report,'all_content_matches':all(x['status'] in ('BYTE_MATCH','LINE_ENDINGS_ONLY') for x in report)},indent=2))
