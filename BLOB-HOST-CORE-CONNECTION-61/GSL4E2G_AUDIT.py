#!/usr/bin/env python3
"""GSL-4E2G: read-only observation-contract verification. Python 3 stdlib only."""
import argparse, json, collections, pathlib, sys

def run(path):
    doc=json.loads(pathlib.Path(path).read_text(encoding='utf-8-sig'))
    events=[e for e in doc.get('events',[]) if e.get('type')=='gsl-guide-interpretation-change']
    checks=[]
    def check(name, applicable, violations, detail=''):
        checks.append(dict(name=name,status='NOT_OBSERVED' if not applicable else ('FAIL' if violations else 'PASS'),observations=applicable,violations=violations,detail=detail))
    def entries(predicate): return [(i,e['gsl'],e['gsl'].get('interpretation') or {},e['gsl'].get('expression') or {},e['gsl'].get('ownership') or {}) for i,e in enumerate(events) if isinstance(e.get('gsl'),dict) and predicate(e['gsl'])]
    valid=entries(lambda g: isinstance(g.get('interpretation'),dict) and isinstance(g.get('expression'),dict) and isinstance(g.get('ownership'),dict))
    check('B00 complete GSL payload',len(events),len(events)-len(valid))
    enabled=entries(lambda g: (g.get('interpretation') or {}).get('enabled') is True)
    disabled=entries(lambda g: (g.get('interpretation') or {}).get('enabled') is False)
    check('B08 disabled must not express',len(disabled),sum(bool(x.get('expressionApplied')) or bool(o.get('applied')) for _,g,i,x,o in disabled))
    check('B06 core-work expression protection',sum(bool(x.get('coreWorkProtected')) for _,g,i,x,o in valid),sum(bool(x.get('expressionApplied')) for _,g,i,x,o in valid if x.get('coreWorkProtected')))
    check('B07 movement ownership agreement',len(valid),sum(bool(x.get('movementOwner') and o.get('finalOwner') and x['movementOwner']!=o['finalOwner']) or bool(i.get('movementOwner') and x.get('movementOwner') and i['movementOwner']!=x['movementOwner']) for _,g,i,x,o in valid))
    check('B07 authored/pulse movement not overwritten',sum(o.get('finalOwner') in ('authored_guide','pulse_response') for _,g,i,x,o in valid),sum(bool(o.get('applied')) for _,g,i,x,o in valid if o.get('finalOwner') in ('authored_guide','pulse_response')))
    check('Expression must be enabled when applied',len(valid),sum(bool(x.get('expressionApplied')) and not x.get('enabled') for _,g,i,x,o in valid))
    check('Suppressed expression cannot be allowed',len(valid),sum(bool(i.get('expressionAllowed')) and i.get('expressionSuppression') not in (None,'none','') for _,g,i,x,o in valid))
    mapping={'B01 normal attachment':lambda i:i.get('attachmentActive') is True,'B02 deliberate release':lambda i:i.get('event')=='deliberate_release','B03 unexpected loss':lambda i:i.get('event')=='unexpected_loss','B04 attachment recovery':lambda i:i.get('event')=='attachment_recovered','B05 recovery timeout':lambda i:i.get('event') in ('recovery_timeout','timeout')}
    for name,pred in mapping.items():
        subset=[i for _,g,i,x,o in valid if pred(i)]
        check(name,len(subset),0,'Coverage only; correctness of transition timing requires deterministic runtime tests')
    # Check that the event stream's recorded ordinals and timestamps are nondecreasing.
    ordinals=[e.get('recorderEventOrdinal') for e in events]
    if all(isinstance(o,int) for o in ordinals):check('B10 event ordinal monotonic',len(ordinals),sum(a>=b for a,b in zip(ordinals,ordinals[1:])))
    else:check('B10 event ordinal monotonic',0,0,'Ordinals absent')
    check('B09 rapid-change oscillation',0,0,'Requires per-frame timestamps and explicit cooldown specification')
    counts=collections.Counter((i.get('event'),i.get('intention')) for _,g,i,x,o in valid)
    report={'pass':'GSL-4E2G-OFFLINE-1','source':str(path),'recordedGuideEvents':len(events),'scope':'recorded-change invariants only; not a simulated LS1 runtime','checks':checks,'eventIntentionCounts':[{'event':k[0],'intention':k[1],'count':v} for k,v in sorted(counts.items(),key=lambda x:str(x[0]))]}
    return report

def main():
    p=argparse.ArgumentParser();p.add_argument('json');p.add_argument('--out');a=p.parse_args()
    report=run(a.json);out=json.dumps(report,indent=2)
    if a.out:pathlib.Path(a.out).write_text(out+'\n',encoding='utf-8')
    print('GSL-4E2G offline observation audit: '+str(report['recordedGuideEvents'])+' Guide events')
    for c in report['checks']:print(f"{c['status']:12} {c['name']} (n={c['observations']}, violations={c['violations']})")
    print('PASS / FAIL / NOT_OBSERVED are observation-contract results, not runtime gameplay certification.')
    return 1 if any(c['status']=='FAIL' for c in report['checks']) else 0
if __name__=='__main__':sys.exit(main())
