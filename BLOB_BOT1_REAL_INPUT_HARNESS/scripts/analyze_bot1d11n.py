#!/usr/bin/env python3
"""D11N controlled-origin certification audit, incorporating D11M/D11F/D11J gates.

Prior D11M scorer is used ONLY for its original mesh/contact interpretation;
its expected revision is adapted in-memory and explicitly recorded below.
No captured source files or stored RUN.json are altered.
"""
from __future__ import annotations
import argparse, collections, copy, json, math, pathlib
from bot1d11m_policy import schedule, BRAKE
from analyze_bot1d11m import summarize_run as d11m_summarize
REVISION='BOT1-D11N-1'
PREVIOUS='BOT1-D11M-1'
ORIGIN={'x':-0.04,'y':-0.07,'z':-0.17}

def valid_pose(p,tol=.005):
    return isinstance(p,dict) and all(isinstance(p.get(k),(int,float)) and math.isfinite(p[k]) and abs(p[k]-ORIGIN[k])<=tol for k in ORIGIN)

def receipt_from_trace(trace):
    return next((x for x in trace.get('interventions',[]) if x.get('kind')=='controlled_preapproach_start_d11n'),None)

def check_start(run,trace):
    if run.get('profile')=='host_positive':
        return {'valid':run.get('controlledDebugStart') is False and run.get('controlledStartReceipt') is None,'kind':'hc_unchanged','cameraQuaternion':None}
    a=run.get('controlledStartReceipt') or {}; b=receipt_from_trace(trace) or {}
    checks={'runReceipt':a.get('kind')=='controlled_preapproach_start_d11n',
      'traceReceipt':b.get('kind')=='controlled_preapproach_start_d11n',
      'matchingPosition':a.get('position')==b.get('position'),
      'canonicalWorldOrigin':valid_pose(a.get('position')) and valid_pose(b.get('expectedPosition')),
      'notShelfContactTeleport':isinstance(a.get('shelfDistanceFromOrigin'),(int,float)) and a['shelfDistanceFromOrigin']>=1.5,
      'momentumCleared':a.get('momentumReset') is True,
      'noPreexistingAttachment':a.get('preExistingContact') is False,
      'noOwnerSteering':a.get('ownerDataUsedForSteering') is False,
      'cellCorrect':a.get('cell')=='CELL_SILT_PRESSURE_ROUTE_001',
      'controlledDeclared':run.get('controlledDebugStart') is True,
      'noCameraSteering':a.get('cameraHeadingForced') is False}
    q=a.get('cameraQuaternion')
    qvalid=isinstance(q,list) and len(q)==4 and all(isinstance(v,(int,float)) and math.isfinite(v) for v in q)
    checks['cameraQuaternionRecorded']=qvalid
    return {'valid':all(checks.values()),'kind':'silt_preapproach','checks':checks,
      'position':a.get('position'),'cameraQuaternion':q if qvalid else None,
      'shelfCenter':a.get('shelfCenter')}

def angle_degrees(a,b):
    if not (a and b):return None
    na=math.sqrt(sum(x*x for x in a));nb=math.sqrt(sum(x*x for x in b))
    if na<.5 or nb<.5:return None
    dot=abs(sum(x*y for x,y in zip(a,b))/(na*nb))
    return round(math.degrees(2*math.acos(max(-1,min(1,dot)))),3)

def run_row(run,trace):
    # Prior scorer accepts only D11M revision. Clone metadata in memory so the
    # exact D11M physical/mesh checks remain usable; never rewrite artifacts.
    adapted=copy.deepcopy(run);adapted['revision']=PREVIOUS
    # Legacy D11K scorer rejects any controlled debug start by design.
    # The new controlled pre-approach receipt is validated independently below;
    # this flag is adapted only for its unchanged physical/geometry evaluation.
    adapted['controlledDebugStart']=False
    old=d11m_summarize(trace,adapted)
    start=check_start(run,trace)
    old.update({'revision':run.get('revision'), 'start':start,
                'captureValid':bool(old.get('captureValid') and run.get('revision')==REVISION and
                     run.get('status')=='CAPTURED' and not run.get('errors') and start['valid']),
                'priorScorer': 'D11M physical/event scorer with revision and legacy uncontrolled-start flag adapted in memory; D11N start verified independently'})
    old['testPass']=(old['captureValid'] and
        (old['geometryGatePassed'] and not old['geometryWarning'] and not old['soleSealedPeelViolations']) and
        (old['acquiredBeforeRelease'] and old['deliberateRelease'] if run.get('profile','').startswith('natural_') else True))
    return old

def audit(root):
    root=pathlib.Path(root)
    idx_path=root/'BOT1D11N_RUN_INDEX.json'
    idx=json.loads(idx_path.read_text('utf-8')) if idx_path.exists() else {}
    pairs=idx.get('pairs'); expected=schedule(pairs) if isinstance(pairs,int) and 1<=pairs<=7 else ()
    rows=[]
    for p in sorted(root.glob('*/RUN.json')):
        run=json.loads(p.read_text('utf-8'))
        trace_path=p.parent/'D11C_TRACE.json'
        if not trace_path.is_file():
            rows.append({'folder':p.parent.name,'captureValid':False,'testPass':False,'missingTrace':True,
                 'round':run.get('round'),'profile':run.get('profile'),'arm':run.get('arm'),'observer':run.get('observer')})
            continue
        try:
            row=run_row(run,json.loads(trace_path.read_text('utf-8')))
        except Exception as exc:
            row={'round':run.get('round'),'profile':run.get('profile'),'arm':run.get('arm'),'observer':run.get('observer'),
                'captureValid':False,'testPass':False,'auditError':str(exc)}
        row['folder']=p.parent.name;rows.append(row)
    actual=collections.Counter((r.get('round'),r.get('profile'),r.get('arm'),r.get('observer')) for r in rows)
    matrix=bool(expected) and actual==collections.Counter(expected)
    brake=[r for r in rows if r.get('profile')==BRAKE]
    neutral=[r for r in brake if r.get('arm')=='neutral_counter']
    base=[r for r in brake if r.get('arm')=='baseline']
    refs=[r for r in rows if r.get('profile') in ('natural_reference','natural_feather')]
    control=[r for r in rows if r.get('profile') in ('host_positive','away_control')]
    paired=[]
    for rnd in range(1,(pairs or 0)+1):
        for obs in ('observer_on','observer_off'):
            a=next((x for x in brake if x.get('round')==rnd and x.get('observer')==obs and x.get('arm')=='baseline'),None)
            b=next((x for x in brake if x.get('round')==rnd and x.get('observer')==obs and x.get('arm')=='neutral_counter'),None)
            if not a or not b:continue
            qa=(a.get('start') or {}).get('cameraQuaternion');qb=(b.get('start') or {}).get('cameraQuaternion')
            da=(a.get('acquisitionEnvelope') or {}).get('minEligibleDistanceBeforeRelease')
            db=(b.get('acquisitionEnvelope') or {}).get('minEligibleDistanceBeforeRelease')
            paired.append({'round':rnd,'observer':obs,'cameraOrientationDifferenceDeg':angle_degrees(qa,qb),
                 'baselineAcquired':a.get('acquiredBeforeRelease'), 'neutralAcquired':b.get('acquiredBeforeRelease'),
                 'baselineMinEligibleDistance':da,'neutralMinEligibleDistance':db,
                 'neutralMinusBaseline':round(db-da,4) if isinstance(da,(int,float)) and isinstance(db,(int,float)) else None})
    cam_warnings=[p for p in paired if p['cameraOrientationDifferenceDeg'] is None or p['cameraOrientationDifferenceDeg']>4]
    # Camera is measured, not forced. Warn rather than falsely label a true
    # orientation-controlled physical A/B if the samples show drift.
    natural=[r for r in rows if r.get('profile','').startswith('natural_')]
    complete=matrix and all(x.get('captureValid') for x in rows)
    nonadversarial=neutral+refs
    geometries=[r.get('folder') for r in rows if r.get('geometryWarning') or r.get('soleSealedPeelViolations')]
    return {'revision':REVISION,'runsCaptured':len(rows),'matrixComplete':matrix,'capturesComplete':complete,
       'controlledStartValid':all(r.get('start',{}).get('valid',False) for r in rows),
       'naturalAttached':sum(bool(x.get('acquiredBeforeRelease')) for x in natural),'naturalCount':len(natural),
       'baselineAttached':sum(bool(x.get('acquiredBeforeRelease')) for x in base),'baselineCount':len(base),
       'neutralAttached':sum(bool(x.get('acquiredBeforeRelease')) for x in neutral),'neutralCount':len(neutral),
       'nonAdversarialPassed':sum(bool(x.get('testPass')) for x in nonadversarial),'nonAdversarialCount':len(nonadversarial),
       'controlPassed':sum(bool(x.get('testPass')) for x in control),'controlCount':len(control),
       'cameraHeadingDifferences':paired,'cameraHeadingWarnings':cam_warnings,
       'geometryOrPeelWarnings':geometries,'rows':rows,
       'decision': 'CANDIDATE_FOR_ATTACHED_TILTED_RELEASE_AND_FULL_REGRESSION' if complete and not cam_warnings and
           len(nonadversarial)>=9 and all(x.get('testPass') for x in nonadversarial+control) and not geometries
          else 'D11N_REVIEW_OR_REPEAT_REQUIRED',
       'caveats': ['Debug Shift+6 entry is not navigation proof; D11N normalizes to the frozen post-entry pre-approach reference pose, not the shelf',
          'World player pose and momentum controlled; camera quaternion is recorded but not actively forced',
          'Test runs still have timing jitter and sampled, not continuous, contact distance',
          'Legacy D11M/D11K physical scorer requires uncontrolled start; its revision/start flag is adapted only in memory, while D11N independently validates the real controlled-start receipt; no stored artifacts edited',
          'No Core propulsion, Guide signal, adhesion or gameplay owner changed']}

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('root');opt=p.parse_args(argv)
    root=pathlib.Path(opt.root)
    if not root.is_dir():p.error('Missing results directory')
    res=audit(root)
    (root/'BOT1D11N_AUDIT.json').write_text(json.dumps(res,indent=2)+'\n',encoding='utf-8')
    print(f"D11N runs={res['runsCaptured']} matrix={res['matrixComplete']} captures={res['capturesComplete']}")
    print(f"  Neutral attached={res['neutralAttached']}/{res['neutralCount']} non-adversarial pass={res['nonAdversarialPassed']}/{res['nonAdversarialCount']}")
    print(f"  HC/Away control passes={res['controlPassed']}/{res['controlCount']}, camera pair warnings={len(res['cameraHeadingWarnings'])}")
    print(f"  geometry/sole-anchor warnings={len(res['geometryOrPeelWarnings'])} decision={res['decision']}")
    return 0 if res['capturesComplete'] else 2
if __name__=='__main__':raise SystemExit(main())
