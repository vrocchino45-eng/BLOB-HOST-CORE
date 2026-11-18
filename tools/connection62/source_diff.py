import hashlib, json, zipfile, difflib, sys, datetime
from pathlib import Path
from tkinter import Tk, filedialog, messagebox

FILES = [
 'src/fields/ApertureAdjacentTerritorySystem.js',
 'src/fields/MembraneRidgeGameplaySystem.js',
 'src/player/CoreSurfaceTruthSystem.js',
 'BLOB_C0E2_COMPOUND_DELTA/backups/src/player/PlayerMovementController.js',
 'src/player/PlayerMovementController.js',
 'src/input/InputSystem.js',
 'src/ecology/EntityRelationshipGrammarSystem.js',
 'src/world/CrawlableSurfaceRegistry.js',
]
root=Path(__file__).resolve().parents[2]
ui=Tk();ui.withdraw();ui.attributes('-topmost', True)
messagebox.showinfo('BLOB C62 source comparison', 'Select the original BLOB-HOST-CORE-CONNECTION-61.zip file. Your game files will NOT be changed.')
chosen=filedialog.askopenfilename(title='Select Connection 61 baseline ZIP',filetypes=[('ZIP files','*.zip')]);ui.destroy()
if not chosen:
 print('Cancelled: no baseline ZIP selected.');sys.exit(2)
out=root/'C62_SOURCE_DIFF_RESULTS';out.mkdir(exist_ok=True)
report={'generated_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseline_zip_name':Path(chosen).name,'working_root':str(root),'files':[]}
def digest(b):return hashlib.sha256(b).hexdigest()
with zipfile.ZipFile(chosen) as z:
 names=z.namelist()
 for rel in FILES:
  matches=[n for n in names if n.endswith('/'+rel) or n==rel]
  if len(matches)!=1:
   report['files'].append({'path':rel,'status':'baseline_not_unique_or_missing','matches':len(matches)});continue
  a=z.read(matches[0]);p=root/rel
  if not p.is_file():
   report['files'].append({'path':rel,'status':'working_file_missing','baseline_sha256':digest(a)});continue
  b=p.read_bytes();same=a==b
  entry={'path':rel,'status':'MATCH' if same else 'DIFFERENT','baseline_sha256':digest(a),'working_sha256':digest(b),'baseline_bytes':len(a),'working_bytes':len(b)}
  if not same:
   lines=list(difflib.unified_diff(a.decode('utf-8','replace').splitlines(keepends=True),b.decode('utf-8','replace').splitlines(keepends=True),fromfile='Connection61/'+rel,tofile='Windows/'+rel))
   diffname=rel.replace('/','__')+'.diff.txt';(out/diffname).write_text(''.join(lines[:5000])+('\n[DIFF TRUNCATED]\n' if len(lines)>5000 else ''),encoding='utf-8');entry['diff_file']=diffname;entry['diff_lines']=len(lines)
  report['files'].append(entry)
(out/'comparison.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
import shutil
for n in ('gate-result.json','status.txt'):
 src=root/'C62_RESULTS'/n
 if src.is_file():shutil.copy2(src,out/n)
archive=root/'C62_SOURCE_DIFF_RESULTS.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED) as result:
 for p in out.iterdir():
  if p.is_file():result.write(p,arcname='C62_SOURCE_DIFF_RESULTS/'+p.name)
print('\nSource comparison completed.');print('MATCH:',sum(x['status']=='MATCH' for x in report['files']));print('DIFFERENT:',sum(x['status']=='DIFFERENT' for x in report['files']));print('Upload:',archive)
