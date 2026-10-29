#!/usr/bin/env python3
"""Independent BOT1-D5 REC1 referee, with owner attachment vs free movement.

This module is never imported by BOT1-D5's gameplay driver.
"""
from __future__ import annotations
import argparse,collections,json,math,pathlib,statistics
from analyze_bot1d4 import evaluate as d4_evaluate


def js(path):return json.loads(path.read_text(encoding='utf-8-sig'))
def finite(x):return isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x)
def metric(x):return f'{x:.3f}' if finite(x) else 'unknown'
def median(x):return round(statistics.median(x),3) if x else None


def classify_movement(events,invitation_time=None):
    samples=[e for e in events if e.get('type')=='c0d4-mob1-movement-sample'
             and (invitation_time is None or e.get('time','')>=invitation_time)]
    counts=collections.Counter();speed={'attached':[],'free':[]};fw={'attached':[],'free':[]}
    key=collections.Counter()
    for e in samples:
        owner=e.get('owner') or {};movement=owner.get('motion') or {};att=owner.get('attachment') or {}
        state='attached' if att.get('active') is True else 'free'
        counts[state]+=1
        mode=movement.get('locomotionMode')
        if mode: key[mode]+=1
        if finite(movement.get('speed')):speed[state].append(movement['speed'])
        if finite(e.get('forwardSpeed')):fw[state].append(e['forwardSpeed'])
    return {'total':len(samples),'attachedSamples':counts['attached'],'freeSamples':counts['free'],
       'locomotionModes':dict(key),'medianSpeedAttached':median(speed['attached']),
       'medianSpeedFree':median(speed['free']),
       'medianForwardSpeedAttached':median(fw['attached']),
       'medianForwardSpeedFree':median(fw['free'])}


def evaluate(folder):
    base=d4_evaluate(folder)
    if not (folder/'REC1.json').exists() or not (folder/'RUN.json').exists():return base
    rec=js(folder/'REC1.json');run=js(folder/'RUN.json');events=rec.get('events',[])
    first_invitation=next((e.get('time') for e in events if e.get('type')=='bot1d-listening-fold-owner-state'
                      and (e.get('state') or {}).get('nurseryFoldInvitation') is True),None)
    warnings=[e for e in events if e.get('type')=='c0d4-mob1-sustained-low-progress']
    post=[e for e in warnings if first_invitation and e.get('time','')>=first_invitation]
    movements=[e for e in run.get('actions',[]) if e.get('op')=='move' and e.get('phase')=='fold']
    visual=[e for e in movements if isinstance(e.get('weakVisualChange'),bool)]
    guide=[e.get('state') or {} for e in events if e.get('type')=='guide0-core-guide-state']
    base.update({'revision':'BOT1-D5','profile':run.get('profile'),
        'invitationTimestamp':first_invitation,
        'movementAll':classify_movement(events),
        'movementAfterInvitation':classify_movement(events,first_invitation) if first_invitation else None,
        'lowProgressWarningsAll':len(warnings),'lowProgressWarningsAfterInvitation':len(post),
        'warningSurfaceIds':dict(collections.Counter(((e.get('owner') or {}).get('attachment') or {}).get('surfaceId','none') for e in post)),
        'botMovementProbes':len(movements),'botVisualMovementProbes':len(visual),
        'botWeakVisualMovementProbes':sum(e['weakVisualChange'] for e in visual),
        'guidePhysicalReactionKinds':dict(collections.Counter((s.get('guide') or {}).get('lastReaction','unknown') for s in guide)),
        'manualBaseline':run.get('profile')=='human'})
    if not first_invitation:base['issues'].append('No accepted clean invitation: Fold wayfinding not tested this run')
    if not visual and run.get('profile')=='probe':base['issues'].append('No Fold visual movement probes: invitation or stage may not have been reached')
    if run.get('profile')=='human':base['issues'].append('Human-driven control baseline; not autonomous bot performance')
    return base


def render(reports):
    lines=['# BOT1-D5 — Spatial Localization & Attachment Isolation','',
      'Independent REC1 referee: owner movement, Fold progress, and Guide outcomes are read **after** a session, never supplied to bot navigation. Pixel change is not physical movement proof.','',
      '| Trial | Clean invitation | Owner inApproach | Stage | Nearest Fold | Post-invitation attached / free samples | Post-invitation low-progress |',
      '|---|---|---|---:|---:|---:|---:|']
    for r in reports:
        mov=r.get('movementAfterInvitation') or {}
        lines.append(f"| {r.get('profile')} | {r.get('ownerInvitation')} | {r.get('ownerApproachWitnessed')} | {r.get('maxOwnerStageIndex')} | {metric(r.get('closestFoldDistance'))} | {mov.get('attachedSamples','n/a')} / {mov.get('freeSamples','n/a')} | {r.get('lowProgressWarningsAfterInvitation')} |")
    for r in reports:
        m=r.get('movementAfterInvitation') or {}
        lines.extend(['',f"## {r.get('profile')} — {r['folder']}",
          f"- Owner: Watcher accepted={r.get('watcherAccepted')}, clean={r.get('cleanPlayerOutcomes')}, scar={r.get('scarPlayerOutcomes')}, invited={r.get('ownerInvitation')}.",
          f"- Fold: inApproach={r.get('ownerApproachWitnessed')}, focusReady={r.get('ownerFocusReadyWitnessed')}, stage={r.get('maxOwnerStageIndex')}, completed={r.get('ownerCompleted')}. Closest Fold distance={metric(r.get('closestFoldDistance'))}.",
          f"- Post-invitation locomotion mode samples={m.get('locomotionModes')}; attachment states={m.get('attachedSamples')} attached, {m.get('freeSamples')} free.",
          f"- Median sampled actual speed: attached={metric(m.get('medianSpeedAttached'))}, free={metric(m.get('medianSpeedFree'))}. Median forward speed: attached={metric(m.get('medianForwardSpeedAttached'))}, free={metric(m.get('medianForwardSpeedFree'))}.",
          f"- Low-progress warnings after invitation={r.get('lowProgressWarningsAfterInvitation')}, surfaces={r.get('warningSurfaceIds')}.",
          f"- Bot attempted {r.get('botMovementProbes')} Fold movement probes, {r.get('botVisualMovementProbes')} with screenshot-difference witness, {r.get('botWeakVisualMovementProbes')} visually weak. This is a **visual heuristic**, not owner movement proof.",
          f"- Guide physical reaction labels={r.get('guidePhysicalReactionKinds')}.",
          f"- Evidence warnings: {'; '.join(r.get('issues') or [])}."])
    lines.extend(['','## Interpretation gate','',
      '- **G1-D5 approach pass:** requires authentic owner invitation and at least one `inApproach=true` OR `stageIndex>=1` owner witness. A close distance alone never passes.',
      '- **Locomotion diagnosis:** compare owner attached and free movement samples under similar inputs; association does not prove collision or causal blockage.',
      '- **Human reference:** if included, it tests whether a normal player can traverse the unchanged world. It is a baseline, not evidence of bot intelligence.',
      '- **Guide efficacy:** reaction labels and HUD text are evidence of outputs, not proof the Guide physically steered or stabilized the Core.',
      '- **Unresolved:** if neither bot nor human reaches Fold, add visual playtest and source review before changing the world.',
      ''])
    return '\n'.join(lines)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('folder',nargs='?',default='BOT1D5_RESULTS');args=p.parse_args()
    root=pathlib.Path(args.folder)
    if not root.is_dir():p.error(f'Results folder missing: {root}')
    runs=sorted(x for x in root.iterdir() if x.is_dir() and x.name.startswith('BOT1D5_'))
    if not runs:p.error('No BOT1D5_* run folders in results')
    reports=[evaluate(x) for x in runs]
    (root/'BOT1D5_EVIDENCE.json').write_text(json.dumps(reports,indent=2),encoding='utf8')
    (root/'BOT1D5_EVIDENCE.md').write_text(render(reports),encoding='utf8')
    for r in reports:print(f"{r['folder']}: invitation={r.get('ownerInvitation')}, approach={r.get('ownerApproachWitnessed')}, stage={r.get('maxOwnerStageIndex')}, attached={((r.get('movementAfterInvitation') or {}).get('attachedSamples'))}")
    print('Wrote',root/'BOT1D5_EVIDENCE.md')
if __name__=='__main__':main()
