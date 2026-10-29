#!/usr/bin/env python3
"""BOT1-D4 independent owner/REC1 referee; NEVER imported by browser policy."""
from __future__ import annotations
import argparse,collections,json,math,pathlib

def data(path):return json.loads(path.read_text(encoding='utf-8-sig'))
def number(x):return isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x)

def evaluate(folder):
    report={'folder':folder.name,'status':'MISSING','issues':[]}
    if not (folder/'REC1.json').exists() or not (folder/'RUN.json').exists():
        report['issues'].append('Missing RUN.json or REC1.json');return report
    run=data(folder/'RUN.json');rec=data(folder/'REC1.json')
    events=rec.get('events',[])
    fold=[e.get('state',{}) for e in events if e.get('type')=='bot1d-listening-fold-owner-state']
    active=[s for s in fold if s.get('active') is True and s.get('foldAvailable') is True]
    pulse_inputs=[e for e in events if e.get('type')=='game-pulse-event']
    pulse_witness=[e.get('witness',{}) for e in events if e.get('type')=='bot1c-watcher-pulse-owner-result']
    accepted=[w for w in pulse_witness if w.get('packetPulseReadAccepted') is True]
    clean=[e for e in events if e.get('type')=='guide0-nursery-outcome-pair' and e.get('outcome')=='tender_fed_clean_matter']
    scar=[e for e in events if e.get('type')=='guide0-nursery-outcome-pair' and e.get('outcome')=='tender_strained_scar_spread']
    guide=[e for e in events if e.get('type')=='guide0-core-guide-state']
    stage_vals=[s['stageIndex'] for s in active if isinstance(s.get('stageIndex'),int)]
    distances=[s['focusDistance'] for s in active if number(s.get('focusDistance')) and s['focusDistance']>0]
    states=[]
    for s in active:
        state={'index':s.get('stageIndex'),'stage':s.get('stage'),
               'ready':s.get('inApproach'),'focusReady':s.get('focusReady'),
               'completed':s.get('completed')}
        if not states or any(state.get(k)!=states[-1].get(k) for k in ('index','stage','ready','focusReady','completed')):
            states.append(state)
    actions=[x for x in run.get('actions',[]) if x.get('op') in ('pulse','hold','move','look','observe')]
    fold_actions=[x for x in actions if x.get('phase')=='fold']
    invite_by_hud=any(x.get('op')=='visible_invitation' for x in run.get('actions',[]))
    invited_by_owner=any(s.get('nurseryFoldInvitation') is True for s in fold)
    stage_max=max(stage_vals,default=None)
    completed=any(s.get('completed') is True and s.get('stageIndex')==5 for s in active)
    report.update({'status':run.get('status'), 'profile':run.get('profile'), 'seed':run.get('seed'),
        'captureSeconds':rec.get('captureDurationSeconds'),'detailsRetained':len(events),
        'detailsDropped':rec.get('summary',{}).get('captureRetention',{}).get('droppedDetails'),
        'pulseInputs':len(pulse_inputs), 'watcherWitnessed':len(pulse_witness),
        'watcherAccepted':len(accepted), 'cleanPlayerOutcomes':len(clean),
        'scarPlayerOutcomes':len(scar), 'ownerInvitation':invited_by_owner,
        'botSawInvitation':invite_by_hud, 'foldWitnessSamples':len(fold),
        'availableFoldSamples':len(active),'ownerApproachWitnessed':any(s.get('inApproach') is True for s in active),
        'ownerFocusReadyWitnessed':any(s.get('focusReady') is True for s in active),
        'maxOwnerStageIndex':stage_max,'ownerCompleted':completed,
        'firstAvailableFoldDistance':distances[0] if distances else None,
        'closestFoldDistance':min(distances) if distances else None,
        'lastFoldDistance':distances[-1] if distances else None,
        'stageWitnessChanges':states, 'actionCounts':dict(collections.Counter(a['op'] for a in actions)),
        'foldActionCounts':dict(collections.Counter(a['op'] for a in fold_actions)),
        'foldSearchKeys':dict(collections.Counter(a.get('key') for a in fold_actions if a['op']=='move')),
        'foldStageHints':dict(collections.Counter(a.get('stageHint') for a in fold_actions)),
        'guideSamples':len(guide),'guideLastReactions':dict(collections.Counter((x.get('state',{}).get('guide') or {}).get('lastReaction','unknown') for x in guide)),
        'errors':run.get('errors',[])})
    if not fold:report['issues'].append('No independent Fold owner witness; progression unknown')
    if not pulse_witness:report['issues'].append('No Watcher Pulse owner witness; nursery acceptance unknown')
    if not guide:report['issues'].append('No GUIDE0-W state witness; physical Guide response unknown')
    if not invited_by_owner:report['issues'].append('No owner-authenticated Fold invitation in this run')
    if not active:report['issues'].append('No owner-available Fold; distance/stage not gradable')
    if active and stage_max==0:report['issues'].append('Approach state not advanced; first Fold stage still open')
    if not completed:report['issues'].append('Full Fold completion not owner-proven')
    if len(pulse_inputs)!=len(pulse_witness):report['issues'].append('Pulse owner ID pairing incomplete; avoid classifying unpaired inputs')
    return report

def render(reports):
    lines=['# BLOB — BOT1-D4 Fold Wayfinding: Owner-Evidence Report','',
        'This is an **independent REC1 verdict**. The bot chooses keys using visible HUD, fixed search pattern, seed, and step count only. REC1 owner Fold distances and owner stage flags are never used by action policy.','',
        '| Profile | Invitation | Closest Fold | In approach | Focus ready | Max owner stage | Completed |',
        '|---|---|---:|---|---|---:|---|']
    def fmt(x):return f'{x:.3f}' if number(x) else 'unknown'
    for r in reports:
        lines.append(f"| {r.get('profile','?')} | {r.get('ownerInvitation',False)} | {fmt(r.get('closestFoldDistance'))} | {r.get('ownerApproachWitnessed',False)} | {r.get('ownerFocusReadyWitnessed',False)} | {r.get('maxOwnerStageIndex')} | {r.get('ownerCompleted',False)} |")
    lines.extend(['','## Per-run evidence'])
    for r in reports:
        lines.extend(['',f"### {r['folder']}",
            f"- {r.get('status')}; {r.get('captureSeconds')} seconds; {r.get('detailsRetained')} REC1 events; dropped {r.get('detailsDropped')}.",
            f"- Watcher: {r.get('pulseInputs')} input pulses, {r.get('watcherWitnessed')} owner witnesses, {r.get('watcherAccepted')} accepted, {r.get('cleanPlayerOutcomes')} clean and {r.get('scarPlayerOutcomes')} scar authored outcomes.",
            f"- Invitation: owner={r.get('ownerInvitation')}, visible bot={r.get('botSawInvitation')}; Fold state samples={r.get('availableFoldSamples')}; stage={r.get('maxOwnerStageIndex')}; completed={r.get('ownerCompleted')}.",
            f"- Owner Fold distances: initial {fmt(r.get('firstAvailableFoldDistance'))}, nearest {fmt(r.get('closestFoldDistance'))}, end {fmt(r.get('lastFoldDistance'))}.",
            f"- Fold keyboard attempts: {r.get('foldActionCounts')}; movement keys {r.get('foldSearchKeys')}; HUD stages {r.get('foldStageHints')}.",
            f"- Guide witnessed in {r.get('guideSamples')} samples; reactions {r.get('guideLastReactions')}.",
            f"- Owner stage/approach transition witnesses: {json.dumps(r.get('stageWitnessChanges',[]),ensure_ascii=False)}.",
            '- Evidence limits: '+('; '.join(r.get('issues') or ['No missing proof fields flagged']))+'.'])
    lines.extend(['','## Gate interpretation','',
      '- **Wayfinding passed** requires owner `inApproach=true` or `stageIndex>=1` after a legitimate invitation. A minimum distance alone is not a stage completion.',
      '- **Interaction passed** requires owner stage 2/3/4 evidence after the Pulse/hold/release sequence. Bot inputs alone do not count.',
      '- **Fold completed** requires owner `completed=true` at stage 5. A HUD line alone does not count.',
      '- If the bot fails, do not classify geometry or Guide as broken without independent visual and player comparisons. No gameplay source was changed by BOT1-D4.',
      '- Profiles/seed runs are exploratory, not a controlled efficacy trial; packet cycles and start states vary.',
      ''])
    return '\n'.join(lines)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('folder',nargs='?',default='BOT1D4_RESULTS')
    args=p.parse_args();root=pathlib.Path(args.folder)
    if not root.is_dir():p.error(f'folder missing: {root}')
    runs=sorted(x for x in root.iterdir() if x.is_dir() and x.name.startswith('BOT1D4_'))
    if not runs:p.error('No BOT1D4_* run folders found')
    reports=[evaluate(x) for x in runs]
    (root/'BOT1D4_EVIDENCE.json').write_text(json.dumps(reports,indent=2),encoding='utf8')
    (root/'BOT1D4_EVIDENCE.md').write_text(render(reports),encoding='utf8')
    for r in reports:print(f"{r['folder']}: invitation={r.get('ownerInvitation')} / approach={r.get('ownerApproachWitnessed')} / stage={r.get('maxOwnerStageIndex')} / completed={r.get('ownerCompleted')}")
    print('Wrote',root/'BOT1D4_EVIDENCE.md')
    return 0

if __name__=='__main__':raise SystemExit(main())
