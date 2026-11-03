#!/usr/bin/env python3
"""BOT1-D11J conservative acceptance referee for D11F repeat routes with D11I events.
Never interprets a UI cue or carried surface ID alone as mechanical support.
"""
from __future__ import annotations
import argparse, collections, json, pathlib

REQUIRED = {'natural_reference':3,'natural_feather':3,'natural_brake':3,'host_positive':1,'away_control':1}
NATURAL = {'natural_reference','natural_feather','natural_brake'}

def classify_events(events):
    """Return observed unsafe solo-stride events and owner support milestones."""
    planted = set(); solo=[]; initially_sealed=0
    transitions=[]
    for ev in events:
        kind=ev.get('type');before=ev.get('before') or {};after=ev.get('after') or {}
        if kind=='tendril_phase_transition':
            idx=after.get('index',before.get('index'))
            if ev.get('to')=='sealed' and after.get('anchorSurface') not in (None,'none'):
                planted.add(idx); initially_sealed+=1
            if ev.get('from')=='sealed' and ev.get('to')!='sealed':
                planted.discard(idx)
        elif kind=='peel_attempt':
            idx=before.get('index')
            if ev.get('strideDestinationProvided') is True and before.get('phase')=='sealed':
                if idx in planted and len(planted) <= 1:
                    solo.append({'ms':ev.get('ms'),'index':idx,'sealedCount':len(planted)})
            planted.discard(idx)
        elif kind=='movement_attachment_transition':
            transitions.append((after.get('state'),after.get('reason')))
    return {'soloPressurePeels':solo,'sealsObserved':initially_sealed,
            'attachedObserved':any(state=='attached' for state,_ in transitions),
            'deliberateReleaseObserved':any(state=='releasing' and reason=='deliberate_away_input' for state,reason in transitions),
            'freeAfterReleaseObserved':any(state=='free' and reason=='deliberate_away_input' for state,reason in transitions)}

def score(root):
    root=pathlib.Path(root)
    geometry_path=root/'BOT1D11F_AUDIT.json'
    geo={}
    if geometry_path.is_file():
        audit=json.loads(geometry_path.read_text(encoding='utf-8'))
        geo={item['folder']:item for item in audit.get('runs',[]) if 'folder' in item}
    rows=[]
    for folder in sorted(p for p in root.iterdir() if p.is_dir() and (p/'RUN.json').is_file()):
        run=json.loads((folder/'RUN.json').read_text('utf-8'))
        profile=run.get('profile','unknown');status=run.get('status')
        entry={'folder':folder.name,'profile':profile,'round':run.get('round'),'capture':status,
               'eventHook':False,'eventDrops':None,'earlySoloStridePeels':None,
               'geometryGate':None,'attached':False,'deliberateRelease':False,'freeAfterRelease':False,'pass':False,
               'classification':'MISSING_EVIDENCE'}
        trace_path=folder/'D11C_TRACE.json'
        if trace_path.is_file():
            trace=json.loads(trace_path.read_text('utf-8'))
            e=trace.get('firstFootholdEvents') or {}
            if e.get('revision')=='BOT1-D11I-1' and e.get('hooked') and isinstance(e.get('events'),list):
                entry['eventHook']=True;entry['eventDrops']=e.get('droppedEvents')
                summary=classify_events(e['events'])
                entry['earlySoloStridePeels']=summary['soloPressurePeels']
                entry['attached']=summary['attachedObserved']
                entry['deliberateRelease']=summary['deliberateReleaseObserved']
                entry['freeAfterRelease']=summary['freeAfterReleaseObserved']
        if folder.name in geo:
            entry['geometryGate']=geo[folder.name].get('gatePassed')
            entry['geometryClassification']=geo[folder.name].get('classification')
            entry['maxAnchorToCarriedMesh']=geo[folder.name].get('maxAnchorToCarriedMesh')
        if status!='CAPTURED':entry['classification']='CAPTURE_ERROR'
        elif not entry['eventHook'] or entry['eventDrops'] is None or entry['geometryGate'] is None:
            entry['classification']='INCOMPLETE_EVIDENCE'
        elif entry['eventDrops']:
            entry['classification']='EVENT_DROPS'
        elif profile in NATURAL:
            if entry['earlySoloStridePeels']:
                entry['classification']='EARLY_SOLO_PRESSURE_PEEL'
            elif not entry['geometryGate']:
                entry['classification']='GEOMETRY_OR_SUPPORT_FAILURE'
            elif not entry['attached']:
                entry['classification']='NO_ATTACHMENT'
            elif not (entry['deliberateRelease'] and entry['freeAfterRelease']):
                entry['classification']='RELEASE_NOT_PROVEN'
            else:
                entry['classification']='NATURAL_PASS';entry['pass']=True
        elif profile == 'host_positive':
            entry['pass']=bool(entry['geometryGate']);entry['classification']='HOST_CONTROL_PASS' if entry['pass'] else 'HOST_CONTROL_FAILURE'
        elif profile == 'away_control':
            entry['pass']=bool(entry['geometryGate']) and not entry['attached'];entry['classification']='AWAY_CONTROL_PASS' if entry['pass'] else 'AWAY_CONTROL_FAILURE'
        else:entry['classification']='UNEXPECTED_PROFILE'
        rows.append(entry)
    counts=collections.Counter(x['profile'] for x in rows)
    complete=all(counts.get(p,0)==n for p,n in REQUIRED.items()) and sum(counts.values())==11
    verdict=complete and all(r['pass'] for r in rows)
    return {'revision':'BOT1-D11J-1','matrixComplete':complete,'liveGatePassed':verdict,
            'observedCounts':dict(counts),'requiredCounts':REQUIRED,
            'passCounts':dict(collections.Counter(r['profile'] for r in rows if r['pass'])),
            'failureCounts':dict(collections.Counter(r['classification'] for r in rows if not r['pass'])),
            'runs':rows,
            'note':'Event-level single-support analysis requires D11I probe; geometry/support validity requires independent D11F audit. Absence of an observed early peel alone does not prove the runtime fix.'}

def main():
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('folder',type=pathlib.Path)
    args=a.parse_args();out=score(args.folder)
    dest=args.folder/'BOT1D11J_AUDIT.json';dest.write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
    print('BOT1-D11J matrix:',out['matrixComplete'],'live gate:',out['liveGatePassed'])
    for r in out['runs']:
        print(f"  {r['profile']} round {r['round']}: {r['classification']}" )
    print('Report:',dest)
    if not out['liveGatePassed']:raise SystemExit(2)

if __name__=='__main__':main()
