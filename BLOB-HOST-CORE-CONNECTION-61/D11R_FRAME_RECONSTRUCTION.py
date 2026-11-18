#!/usr/bin/env python3
"""D11R read-only frame-level owner gate reconstruction. Standard library only."""
import json,zipfile,sys,pathlib

def analyze(z):
 rows=[]
 for name in sorted(n for n in z.namelist() if n.endswith('/D11C_TRACE.json')):
  trace=json.loads(z.read(name)); gate=trace.get('releaseGate') or {}; frames=gate.get('frames') or []
  active=[f for f in frames if f.get('preActive') or f.get('postActive')]
  if not active: continue
  release=any(f.get('detachReason')=='deliberate_away_input' for f in frames)
  away=[f for f in active if f.get('modeledAwayGateMet') is True]
  hold=[f for f in active if f.get('modeledHoldGateMet') is True]
  overlap=[f for f in active if f.get('modeledAwayGateMet') is True and f.get('modeledHoldGateMet') is True]
  transitions=[]; prev=None
  for f in active:
   state=(f.get('modeledAwayGateMet'),f.get('modeledHoldGateMet'),f.get('detachReason'))
   if state!=prev:
    transitions.append({'ms':f.get('ms'),'away':state[0],'hold':state[1],'detach':state[2],'awayIntent':f.get('ownerAwayIntent'),'holdAge':f.get('ownerPeelHoldAge'),'ownerArmed':f.get('ownerReleaseArmed')});prev=state
  rows.append({'run':name.split('/')[0],'released':release,'attachedFrames':len(active),'awayFrames':len(away),'holdFrames':len(hold),'simultaneousModeledGateFrames':len(overlap),'overlapMs':[f.get('ms') for f in overlap],'maxAway':max((f.get('ownerAwayIntent') or 0 for f in active),default=0),'maxHoldAge':max((f.get('ownerPeelHoldAge') or 0 for f in active),default=0),'transitions':transitions,'note':'Modeled gates are NOT authoritative owner refusal reasons. Sampling may miss transitions.'})
 return {'status':'READ_ONLY_FRAME_RECONSTRUCTION','schema':'BOT1-D11R-1','runs':rows,'limitations':['No physics changes','Modeled gates may not match actual release decision','Sampled owner frames may miss sub-frame changes','Do not infer causality from peak values']}

def main():
 path=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '1BOT1D11O_RESULTS.zip')
 if path.is_dir():
  import io
  b=io.BytesIO()
  with zipfile.ZipFile(b,'w') as z:
   for p in path.rglob('D11C_TRACE.json'):z.write(p,p.relative_to(path).as_posix())
  b.seek(0);z=zipfile.ZipFile(b)
 else:z=zipfile.ZipFile(path)
 result=analyze(z);target=pathlib.Path(sys.argv[2] if len(sys.argv)>2 else 'BOT1D11R_FRAME_RECONSTRUCTION.json');target.write_text(json.dumps(result,indent=2),encoding='utf-8')
 for r in result['runs']:
  if any(s in r['run'] for s in ['tangential','feather']):print(r['run'].split('_natural_')[-1], 'release',r['released'],'overlap',r['simultaneousModeledGateFrames'],'away',r['awayFrames'],'hold',r['holdFrames'])
 print('Wrote',target,'runs',len(result['runs']))
if __name__=='__main__':main()
