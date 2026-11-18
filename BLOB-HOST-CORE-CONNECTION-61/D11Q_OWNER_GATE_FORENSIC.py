#!/usr/bin/env python3
"""Read-only D11O owner-gate forensic report from original results folder."""
import json,pathlib,collections,sys
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'BOT1D11O_RESULTS')
rows=[]
for f in sorted(root.glob('*/RUN.json')):
 r=json.loads(f.read_text());
 if r.get('profile')!='natural_brake':continue
 t=json.loads((f.parent/'D11C_TRACE.json').read_text())
 marks={m['label']:m.get('ms') for m in t.get('interventions',[]) if 'label' in m}
 a,b=marks.get('start:away_vertical'),marks.get('end:away_vertical')
 frames=[x for x in t.get('releaseGate',{}).get('frames',[]) if a is not None and b is not None and a<=x.get('ms',-1)<=b and (x.get('preActive') or x.get('postActive'))]
 transitions=[x for x in t.get('firstFootholdEvents',{}).get('events',[]) if x.get('type')=='movement_attachment_transition' and (x.get('after') or {}).get('reason')=='deliberate_away_input' and a is not None and b is not None and a-150<=x.get('ms',-1)<=b+400]
 def bounds(k):
  nums=[x[k] for x in frames if isinstance(x.get(k),(int,float)) and not isinstance(x[k],bool)]
  return [min(nums),max(nums)] if nums else None
 rows.append({'folder':f.parent.name,'context':r.get('context'),'release':r.get('release'),'validPrecondition':(r.get('precondition') or {}).get('valid'),'released':bool(transitions),'attachedFrames':len(frames),'ownerAwayIntent':bounds('ownerAwayIntent'),'modeledThreshold':bounds('modeledReleaseThreshold'),'ownerPeelHoldAge':bounds('ownerPeelHoldAge'),'modeledHoldThreshold':bounds('modeledHoldThreshold'),'ownerPeelIntent':bounds('ownerPeelIntent'),'releaseArmedValues':dict(collections.Counter(str(x.get('ownerReleaseArmed')) for x in frames)),'modeledAwayGateValues':dict(collections.Counter(str(x.get('modeledAwayGateMet')) for x in frames)),'modeledHoldGateValues':dict(collections.Counter(str(x.get('modeledHoldGateMet')) for x in frames)),'detachReasons':dict(collections.Counter(str(x.get('detachReason')) for x in frames))})
result={'status':'READ_ONLY_FORENSIC','rows':rows,'limitations':['Modeled thresholds are not owner refusal reasons','releaseArmedValues must be compared with successful controls before interpretation','No gameplay changes']}
pathlib.Path('BOT1D11Q_FORENSIC.json').write_text(json.dumps(result,indent=2)+'\n')
print('D11Q inspected',len(rows),'release candidates; deliberate releases',sum(x['released'] for x in rows))
for x in rows:
 if not x['released']:print('UNRELEASED',x['folder'],'away',x['ownerAwayIntent'],'hold',x['ownerPeelHoldAge'],'awayGate',x['modeledAwayGateValues'],'holdGate',x['modeledHoldGateValues'])
