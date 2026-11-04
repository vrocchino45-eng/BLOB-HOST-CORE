#!/usr/bin/env python3
"""D11O physical, geometry and owner-release scorer. No gameplay edits.

D11N physical scorer receives an in-memory revision adaptation only: its
accepted D11N start receipt is checked without changing stored result files.
Normal geometry is observed after fixed input, never used to direct bot input.
"""
from __future__ import annotations
import argparse,collections,copy,json,math,pathlib
from bot1d11o_policy import REVISION,schedule,RELEASES,CONTROLS,CONTEXTS
from analyze_bot1d11n import run_row as d11n_row
from bot1d11o_browser import evaluate_precondition

def mark(trace,key):
    return next((m.get('ms') for m in trace.get('interventions') or [] if m.get('label')==key),None)
def valid_number(n):return isinstance(n,(int,float)) and not isinstance(n,bool) and math.isfinite(n)

def classify_release(trace,run,physical):
    pre=run.get('precondition') or {}
    start,end=mark(trace,'start:away_vertical'),mark(trace,'end:away_vertical')
    if not pre.get('valid'):return {'class':'PRECONDITION_NOT_MET','testable':False,'ownerModelVerified':None,'actualDeliberateRelease':False}
    if not run.get('releaseAttempted') or start is None or end is None:
        return {'class':'PRECONDITION_MET_NO_RELEASE_INTERVAL','testable':False,'actualDeliberateRelease':False}
    events=(trace.get('firstFootholdEvents') or {}).get('events') or []
    # The owner must actually report the deliberate release, while the held
    # action is in force or in the short post-input completion interval.
    transitions=[e for e in events if e.get('type')=='movement_attachment_transition' and
      (e.get('after') or {}).get('reason')=='deliberate_away_input' and
      start-150<=e.get('ms',-1000)<=end+400 and (e.get('after') or {}).get('state')=='free']
    gate=trace.get('releaseGate') or {}
    frames=[f for f in (gate.get('frames') or []) if start<=f.get('ms',-1)<=end and
        (f.get('preActive') or f.get('postActive'))]
    owner_model=bool((gate.get('coverage') or {}).get('modelVerified'))
    # Distinguish physical owner fields from modeled explanatory thresholds.
    intents=[f['ownerAwayIntent'] for f in frames if valid_number(f.get('ownerAwayIntent'))]
    thresholds=[f['modeledReleaseThreshold'] for f in frames if valid_number(f.get('modeledReleaseThreshold'))]
    normalys=[(f.get('candidateNormals') or {}).get('owner',{}).get('y') for f in frames]
    normalys=[n for n in normalys if valid_number(n)]
    physical_normalys=[(s.get('plane') or {}).get('normal',{}).get('y') for s in trace.get('samples') or [] if
        start<=s.get('ms',-1)<=end and isinstance((s.get('plane') or {}).get('normal'),dict)]
    physical_normalys=[n for n in physical_normalys if valid_number(n)]
    actual=bool(transitions)
    if not frames:kind='MISSING_ATTACHED_OWNER_FRAMES'
    elif actual:kind='DELIVERED_DELIBERATE_RELEASE'
    elif not owner_model:kind='UNRELEASED_OWNER_MODEL_UNVERIFIED'
    elif intents and thresholds and max(intents)<min(thresholds):kind='UNRELEASED_OUTWARD_GATE_BELOW_THRESHOLD'
    else:kind='UNRELEASED_OTHER_GATE_OR_OWNER_REVIEW'
    return {'class':kind,'testable':True,'actualDeliberateRelease':actual,'ownerModelVerified':owner_model,
      'releaseStartMs':start,'releaseEndMs':end,'attachedOwnerFrameCount':len(frames),
      'ownerAwayIntentMax':max(intents,default=None), 'modeledThresholdMin':min(thresholds,default=None),
      'ownerNormalYRange':[min(normalys),max(normalys)] if normalys else None,
      'physicalPlaneNormalYRange':[min(physical_normalys),max(physical_normalys)] if physical_normalys else None,
      'actualDeliberateReleaseEvents':len(transitions),
      'physicalGeometryGatePassed':physical.get('geometryGatePassed'),
      'limitation':'Owner-away-intent is captured; threshold is a matched-source model; sampled normal is not continuous contact truth.'}

def run_row(trace,run):
    adapted=copy.deepcopy(run)
    adapted['revision']='BOT1-D11N-1'
    # No changes to start receipts, scores or captured event facts.
    physical=d11n_row(adapted,trace)
    pre=run.get('precondition') or {}
    if run.get('profile')=='natural_brake':
        physical_pre=bool(pre.get('valid') and run.get('releaseAttempted'))
        # Receipt is checked again from stored *raw* samples, not merely trusted
        # from RUN.json: witness 3 samples within 8 latest BEFORE release start.
        before=mark(trace,'start:away_vertical') or mark(trace,'start:precondition_abort_neutral')
        eligible=[x for x in trace.get('samples') or [] if before is not None and x.get('ms',0)<=before]
        fresh=evaluate_precondition({'samples':eligible})
        pre_valid=physical_pre and fresh['valid']
        release=classify_release(trace,run,physical)
        if not pre_valid:release['class']='UNVERIFIED_PRECONDITION' if physical_pre else 'PRECONDITION_NOT_MET'
        candidate_good=bool(physical['captureValid'] and pre_valid and physical.get('geometryGatePassed') and
            not physical.get('geometryWarning') and not physical.get('soleSealedPeelViolations') and
            release['actualDeliberateRelease'] and release['class']=='DELIVERED_DELIBERATE_RELEASE')
    else:
        fresh=None;pre_valid=None
        release={'class':'CONTROL','testable':False,'actualDeliberateRelease':physical.get('deliberateRelease')}
        candidate_good=bool(physical['captureValid'] and physical['testPass'] and
            not physical.get('geometryWarning') and not physical.get('soleSealedPeelViolations'))
    return {'round':run.get('round'),'profile':run.get('profile'),'context':run.get('context'),
      'release':run.get('release'),'captureValid':physical.get('captureValid'),
      'startValid':(physical.get('start') or {}).get('valid'),
      'preconditionFromRunner':pre,'preconditionRechecked':fresh,'preconditionVerified':pre_valid,
      'observedPreconditionNormalClass':normal_class((fresh or {}).get('terminalNormal')),
      'releaseResult':release,'testPass':candidate_good,
      'geometryGatePassed':physical.get('geometryGatePassed'),'geometryWarning':physical.get('geometryWarning'),
      'maxAnchorToMesh':physical.get('maxAnchorToCarriedMesh'),
      'soleAnchorPressurePeels':physical.get('soleSealedPeelViolations'),
      'physicalEvaluation':'D11N scorer with in-memory revision adaptation; release verified independently at D11O action interval'}

def normal_class(normal):
    if not isinstance(normal,dict) or not valid_number(normal.get('y')):
        return 'UNKNOWN'
    ay=abs(normal['y'])
    if ay>=.85:return 'NEAR_VERTICAL_NORMAL'
    if .25<=ay<.75:return 'TILTED_NORMAL'
    return 'OTHER_NORMAL'

def audit(root):
    root=pathlib.Path(root);path=root/'BOT1D11O_RUN_INDEX.json'
    index=json.loads(path.read_text('utf-8')) if path.exists() else {}
    rounds=index.get('rounds');expected=schedule(rounds) if isinstance(rounds,int) and 1<=rounds<=5 else []
    rows=[]
    for f in sorted(root.glob('*/RUN.json')):
        run=json.loads(f.read_text('utf-8'))
        trace_path=f.parent/'D11C_TRACE.json'
        if trace_path.is_file():
            try:row=run_row(json.loads(trace_path.read_text('utf-8')),run)
            except Exception as exc:row={'captureValid':False,'testPass':False,'error':str(exc),
                'round':run.get('round'),'profile':run.get('profile'),'context':run.get('context'),'release':run.get('release')}
        else:row={'captureValid':False,'testPass':False,'missingTrace':True,
                'round':run.get('round'),'profile':run.get('profile'),'context':run.get('context'),'release':run.get('release')}
        row['folder']=f.parent.name;rows.append(row)
    observed=collections.Counter((r.get('round'),r.get('profile'),r.get('context'),r.get('release')) for r in rows)
    complete=bool(expected) and observed==collections.Counter(expected)
    release_rows=[r for r in rows if r.get('profile')=='natural_brake']
    control=[r for r in rows if r.get('profile') in CONTROLS]
    comparisons={}
    for context in CONTEXTS:
        comparisons[context]={}
        for direction in RELEASES:
            subset=[r for r in release_rows if r['context']==context and r['release']==direction]
            comparisons[context][direction]={'runs':len(subset),'preconditionVerified':sum(r.get('preconditionVerified') is True for r in subset),
                'released':sum((r.get('releaseResult') or {}).get('actualDeliberateRelease',False) and
                    r.get('preconditionVerified') is True for r in subset),
                'geometryWarnings':sum(bool(r.get('geometryWarning')) for r in subset),
                'classes':dict(collections.Counter((r.get('releaseResult') or {}).get('class','UNKNOWN') for r in subset))}
    no_geometry=[r['folder'] for r in rows if r.get('geometryWarning') or r.get('soleAnchorPressurePeels')]
    observed_normals=dict(collections.Counter(r.get('observedPreconditionNormalClass','UNKNOWN') for r in release_rows if r.get('preconditionVerified') is True))
    return {'revision':REVISION,'runs':len(rows),'matrixComplete':complete,
      'capturesComplete':complete and all(r.get('captureValid') for r in rows),
      'controlPasses':sum(r.get('testPass') for r in control),'controlTotal':len(control),
      'releaseCandidateTotal':len(release_rows),'releasePreconditions':sum(r.get('preconditionVerified') is True for r in release_rows),
      'candidateDeliberateReleases':sum((r.get('releaseResult') or {}).get('actualDeliberateRelease',False) and
          r.get('preconditionVerified') is True for r in release_rows),
      'geometryPeelWarnings':no_geometry,'observedNormalClasses':observed_normals,
      'bothNormalRegimesObserved':bool(observed_normals.get('TILTED_NORMAL') and observed_normals.get('NEAR_VERTICAL_NORMAL')),
      'comparisons':comparisons,'rows':rows,
      'decision':'REVIEW_RELEASE_DIRECTION_AND_OWNER_AUTHORITY' if complete and all(r.get('captureValid') for r in rows)
        else 'D11O_INCOMPLETE',
      'notALock':'This is a diagnostic comparison from controlled debug entry, not complete HC/LS movement or Fold regression.',
      'limitations':['Fixed keys are never chosen from live normals','A precondition failure is not a release failure',
        'Tilted vs upward physical normals must be observed; a context label does not prove tilt',
        'A modeled threshold is not an owner-issued refusal reason','D11O alone does not certify D10B Fold']}

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('root');a=p.parse_args(argv)
    root=pathlib.Path(a.root)
    if not root.is_dir():p.error('Results folder missing')
    result=audit(root);(root/'BOT1D11O_AUDIT.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(f"D11O matrix={result['matrixComplete']} captures={result['capturesComplete']} runs={result['runs']}")
    print(f" controls={result['controlPasses']}/{result['controlTotal']} preconditions={result['releasePreconditions']}/{result['releaseCandidateTotal']} releases={result['candidateDeliberateReleases']}")
    print(' normal regimes=',result['observedNormalClasses'],'both regimes observed=',result['bothNormalRegimesObserved'])
    for context,dirs in result['comparisons'].items():
        for direction,v in dirs.items():print(' ',context,direction,v)
    return 0 if result['capturesComplete'] else 2
if __name__=='__main__':raise SystemExit(main())
