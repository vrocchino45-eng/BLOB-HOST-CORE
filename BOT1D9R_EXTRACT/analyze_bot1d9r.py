#!/usr/bin/env python3
"""BOT1-D9R read-only OFFLINE referee correction.

Trial intervals and owner movement samples are ONLY used after the browser run.
This module is not imported by an online bot. Never certifies Fold bearing, camera
transform, movement causality or landmark identity from screenshot changes.
"""
from __future__ import annotations
import argparse, csv, datetime, json, math, pathlib, statistics
from analyze_bot1d6 import load_run
from analyze_bot1d9 import owner_samples, timestamp, verdict


def match_trial_samples(probe, samples):
    start, stop = timestamp(probe.get('atStart')), timestamp(probe.get('atEnd'))
    if start is None or stop is None or stop < start:
        return {'coverage': 'INVALID_TRIAL_TIME', 'sampleCount': 0}
    within = [s for s in samples if start <= s['t'] <= stop]
    n = len(within)
    if n < 2:
        return {'coverage': 'NOT_SAMPLED_IN_TRIAL' if n == 0 else 'ONLY_ONE_IN_TRIAL',
                'sampleCount': n,
                'limitation': 'No position delta may be established across this trial.'}
    first, last = within[0], within[-1]
    delta = tuple(round(last['xyz'][i] - first['xyz'][i], 3) for i in range(3))
    all_attached = all(s['attachment'] for s in within)
    all_free = all(not s['attachment'] for s in within)
    attach_class = 'attached' if all_attached else ('free' if all_free else 'changed_during_trial')
    return {'coverage': 'IN_TRIAL_OWNER_PAIR', 'sampleCount': n,
        'sampleIntervalSeconds': round(last['t']-first['t'], 3),
        'actionDurationSeconds': round(stop-start, 3),
        'partialTrialDisplacement': round(math.dist(first['xyz'], last['xyz']), 3),
        'deltaXYZ': delta, 'attachmentClass': attach_class,
        'averagePressureDuringSamples': round(statistics.mean(s['pressure'] for s in within),4),
        'maximumNormalizedBoundaryDistance': round(max(s['boundary'] for s in within),4),
        'limitation': 'Displacement between two samples INSIDE a trial: not start-to-end, not isolated from flow or attachment.'}


def reevaluate(rec, run, checkpoint=False):
    base=verdict(rec,run,checkpoint)
    samples=owner_samples(rec)
    rows=[]
    for p in run.get('probes',[]):
        row={'index':p.get('index'), 'heading':p.get('heading'), 'kind':p.get('kind'),
             'key':p.get('key'), 'start':p.get('atStart'), 'end':p.get('atEnd'),
             'visualAboveAmbient':(p.get('signal') or {}).get('visual',{}).get('imageMotionAboveAmbient')}
        row.update(match_trial_samples(p,samples)); rows.append(row)
    move=[r for r in rows if r['kind']=='move']
    look=[r for r in rows if r['kind']=='look']
    paired_move=[r for r in move if r['coverage']=='IN_TRIAL_OWNER_PAIR']
    paired_look=[r for r in look if r['coverage']=='IN_TRIAL_OWNER_PAIR']
    free=[r for r in paired_move if r['attachmentClass']=='free']
    attached=[r for r in paired_move if r['attachmentClass']=='attached']
    mixed=[r for r in paired_move if r['attachmentClass']=='changed_during_trial']
    if not base['calibrationComplete']:
        gate='INCOMPLETE_COURSE'
    elif len(paired_move)<len(move):
        gate='PARTIAL_MOVEMENT_OWNER_COVERAGE'
    elif len(paired_look)<2:
        gate='TRANSLATION_SAMPLED_CAMERA_ONLY_UNMEASURED'
    else:
        gate='OWNER_SAMPLES_AVAILABLE_FOR_REVIEW_NOT_SEMANTIC_CALIBRATION'
    def med(lst): return round(statistics.median(x['partialTrialDisplacement'] for x in lst),3) if lst else None
    return {'revision':'BOT1-D9R-OFFLINE-AUDIT',
        'source':'BOT1-D9 existing RUN.json + REC1.json, no new browser run',
        'runStatus':run.get('status'), 'eventCount':len(rec.get('events',[])),
        'checkpointOnly':bool(checkpoint), 'calibrationComplete':base['calibrationComplete'],
        'originalGateA':base['gateA'], 'correctedCoverageGate':gate,
        'foldApproach':base['gateC'], 'maxFoldStageIndex':base['maxFoldStageIndex'],
        'minFoldFocusDistance':base['minOwnerFoldFocusDistance'],
        'trialCount':len(rows), 'moveTrials':len(move), 'lookTrials':len(look),
        'moveTrialsPairedInternally':len(paired_move), 'lookTrialsPairedInternally':len(paired_look),
        'freeMoveTrialsPaired':len(free), 'attachedMoveTrialsPaired':len(attached),
        'attachmentTransitionMoveTrials':len(mixed),
        'medianPartialDisplacementFree':med(free),
        'medianPartialDisplacementAttached':med(attached),
        'medianPartialDisplacementMixed':med(mixed),
        'visualMoveAboveAmbient':sum(r['visualAboveAmbient'] is True for r in move),
        'visualLookAboveAmbient':sum(r['visualAboveAmbient'] is True for r in look),
        'limitations':[
            'REC1 movement samples are event/sampling conditioned. The absence of look-only samples is unknown movement, not zero displacement.',
            'Movement deltas are between two owner samples INSIDE each trial, not full action start/end ground truth.',
            'Surface attachment and environmental flow confound the camera-relative motor calibration.',
            'A visible scene-motion score does not prove a unique landmark, travel direction, Fold bearing, or successful interaction.',
            'Do not feed post-run owner samples or Fold distance into the online bot policy.'
        ], 'trials':rows}


def as_markdown(report):
    r=report
    lines=["# BLOB — BOT1-D9R corrected calibration audit", "",
      "**Existing recording only. No new gameplay, bot navigation, or REC1 data collected.**", "",
      f"Original verdict: `{r['originalGateA']}`. Corrected evidence-coverage status: `{r['correctedCoverageGate']}`.","",
      '| Metric | Reading |','|---|---:|']
    for name,key in [('Trials','trialCount'),('Paired translation trials','moveTrialsPairedInternally'),('Paired look-only trials','lookTrialsPairedInternally'),('Free translation trials','freeMoveTrialsPaired'),('Attached translation trials','attachedMoveTrialsPaired'),('Attachment-change trials','attachmentTransitionMoveTrials'),('Median partial free displacement','medianPartialDisplacementFree'),('Median partial attached displacement','medianPartialDisplacementAttached'),('Fold stages reached','maxFoldStageIndex')]:
        lines.append(f'| {name} | {r[key]} |')
    lines += ['', '## Owner movement pairs observed *within* trials','',
      '| Trial | Heading | Key | Visual > idle | Owner samples | Partial delta | Attachment |',
      '|---:|---|---|---|---:|---:|---|']
    for row in r['trials']:
        lines.append(f"| {row['index']} | {row['heading']} | {row['key']} | {row['visualAboveAmbient']} | {row['sampleCount']} | {row.get('partialTrialDisplacement','unknown')} | {row.get('attachmentClass','not sampled')} |")
    lines += ['', '## Interpretation', '',
      'D9 collected two owner movement positions within each of twelve move trials. The old evaluator falsely marked them unpaired because it demanded pre-action and post-action samples outside each window.',
      'The four look-only trials produced no in-trial movement-owner positions. This cannot certify that camera-only input produces no translation.',
      'Much of the movement course occurred while attached to the surface; therefore movement differences by camera heading cannot be attributed to camera orientation alone.',
      '', '## Evidence restrictions', '']
    lines += ['- '+x for x in r['limitations']]
    return '\n'.join(lines)+'\n'


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('results_folder')
    a=ap.parse_args();root=pathlib.Path(a.results_folder)
    if not root.is_dir():ap.error('Results folder missing: '+str(root))
    folders=sorted(x for x in root.iterdir() if x.is_dir() and x.name.startswith('BOT1D9_'))
    if not folders:ap.error('No BOT1D9_ run folders found')
    outputs=[]
    for f in folders:
        rec,run,checkpoint=load_run(f)
        if rec is None:outputs.append({'folder':f.name,'status':'NO_REC1'});continue
        report=reevaluate(rec,run,checkpoint);report['folder']=f.name;outputs.append(report)
        (f/'BOT1D9R_EVIDENCE.md').write_text(as_markdown(report),encoding='utf-8')
        with (f/'BOT1D9R_TRIALS.csv').open('w',newline='',encoding='utf-8') as fp:
            fields=['index','heading','kind','key','start','end','visualAboveAmbient','coverage','sampleCount','sampleIntervalSeconds','partialTrialDisplacement','deltaXYZ','attachmentClass','averagePressureDuringSamples','maximumNormalizedBoundaryDistance']
            wr=csv.DictWriter(fp,fieldnames=fields,extrasaction='ignore');wr.writeheader();wr.writerows(report['trials'])
        print(f.name, report['correctedCoverageGate'], 'moves',report['moveTrialsPairedInternally'],'look',report['lookTrialsPairedInternally'])
    (root/'BOT1D9R_EVIDENCE.json').write_text(json.dumps(outputs,indent=2),encoding='utf-8')
    return 2 if any(x.get('status')=='NO_REC1' for x in outputs) else 0

if __name__=='__main__':raise SystemExit(main())
