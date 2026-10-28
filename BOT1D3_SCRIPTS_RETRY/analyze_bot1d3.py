#!/usr/bin/env python3
"""BOT1-D3 + GUIDE0-W independent REC1 evaluator; no decisions/owner mutation."""
from __future__ import annotations
import argparse, collections, json, pathlib, sys


def load(path):return json.loads(path.read_text(encoding='utf-8-sig'))
def vnum(value):return isinstance(value,(int,float)) and not isinstance(value,bool)

def evaluate(run_dir):
    report={'folder':run_dir.name,'status':'MISSING','issues':[]}
    rfile, efile=run_dir/'RUN.json',run_dir/'REC1.json'
    if not rfile.exists() or not efile.exists():
        report['issues'].append('RUN.json or REC1.json missing')
        return report
    run,rec=load(rfile),load(efile)
    es=rec.get('events',[]); counts=collections.Counter(e.get('type') for e in es)
    pulses=[e for e in es if e.get('type')=='game-pulse-event']
    witnesses=[e.get('witness',{}) for e in es if e.get('type')=='bot1c-watcher-pulse-owner-result']
    pairs=[e for e in es if e.get('type')=='guide0-pulse-owner-pair']
    outcomes=[e for e in es if e.get('type')=='guide0-nursery-outcome-pair']
    guide_states=[e.get('state',{}) for e in es if e.get('type')=='guide0-core-guide-state']
    fold=[e.get('state',{}) for e in es if e.get('type')=='bot1d-listening-fold-owner-state']
    owners=[e.get('state',{}) for e in es if e.get('type')=='bot1c-watcher-owner-state-change']
    accepted=[w for w in witnesses if w.get('packetPulseReadAccepted') is True]
    rejected=[w for w in witnesses if w.get('packetPulseReadAccepted') is False]
    distances=[w.get('packetDistance') for w in witnesses if vnum(w.get('packetDistance'))]
    near=[w for w in witnesses if not w.get('packetPulseReadAccepted') and
          vnum(w.get('packetDistance')) and vnum(w.get('readRange')) and
          0 <= w['packetDistance']-w['readRange'] <= .5]
    pulse_ids=[e.get('pulseEventId') for e in pulses if vnum(e.get('pulseEventId'))]
    witness_ids=[w.get('pulseEventId') for w in witnesses if vnum(w.get('pulseEventId'))]
    unfinished=[p for p in pulse_ids if p not in witness_ids]
    reactions=collections.Counter((s.get('guide') or {}).get('lastReaction','unknown') for s in guide_states)
    poses=collections.Counter((s.get('guide') or {}).get('state','unknown') for s in guide_states)
    outcome_types=collections.Counter(e.get('outcome','unknown') for e in outcomes)
    accepted_clean=[e for e in outcomes if e.get('outcome')=='tender_fed_clean_matter']
    accepted_scar=[e for e in outcomes if e.get('outcome')=='tender_strained_scar_spread']
    # The outcome is independent of an input; don't call it player-authored unless
    # the outcome type itself is the owner-authoritative player-specific kind.
    rel={'guide0Present':bool(guide_states),'pulsePairs':len(pairs),
       'pairsWithGuide':sum(1 for p in pairs if (p.get('guide') or {}).get('present')),
       'guideLastReactions':dict(reactions),'guidePoseStates':dict(poses),
       'guideOutcomes':dict(outcome_types),
       'ownerAcceptedReads':len(accepted),'cleanPlayerOutcomeCount':len(accepted_clean),
       'scarPlayerOutcomeCount':len(accepted_scar)}
    all_fold=[s for s in fold if s.get('active')]
    max_stage=max([s.get('stageIndex',0) for s in all_fold if vnum(s.get('stageIndex'))],default=0)
    completion=any(s.get('completed') is True for s in all_fold)
    invitation=any(s.get('nurseryFoldInvitation') is True for s in fold) or any(
            s.get('foldInvitation') is True for s in owners)
    owner_invite=any(s.get('foldInvitation') is True for s in owners)
    direct_attempts=[a for a in run.get('actions',[]) if a.get('op')=='pulse']
    motion_cues=[a.get('motionCue') for a in run.get('actions',[]) if a.get('motionCue')]
    out={**report,'status':run.get('status'), 'profile':run.get('profile'), 'seed':run.get('seed'),
      'captureSeconds':rec.get('captureDurationSeconds'), 'detailsRetained':len(es),
      'detailsDropped':rec.get('summary',{}).get('captureRetention',{}).get('droppedDetails'),
      'inputPulseAttempts':len(direct_attempts),'REC1PulseInputs':len(pulses),
      'ownerWitnessedPulseIds':len(witnesses),'ownerAccepted':len(accepted),
      'ownerRejected':len(rejected),
      'rejectionReasons':dict(collections.Counter(w.get('reason','unspecified') for w in rejected)),
      'closestRecordedPulseDistance':min(distances) if distances else None,
      'nearMissesWithinHalfUnit':len(near), 'nearMissSamples':[
        {'pulseEventId':x.get('pulseEventId'),'distance':x.get('packetDistance'),'readRange':x.get('readRange')} for x in near[:12]],
      'uncorrelatedInputPulseIds':unfinished[:25],
      'actualGuideWitness':rel,'ownerFoldInvitation':invitation, 'invitationExplicitOwner':owner_invite,
      'botObservedFoldInvitation':any(a.get('op')=='visible_invitation' for a in run.get('actions',[])),
      'maxFoldStageIndex':max_stage,'foldComplete':completion,
      'visualMotionSamples':len(motion_cues),
      'visualMotionCandidateFrames':sum(bool(x.get('candidate')) for x in motion_cues),
      'actionCounts':dict(collections.Counter(a.get('op') for a in run.get('actions',[]))),
      'pageErrors':run.get('errors',[]),'issues':[]}
    if not witnesses:out['issues'].append('No owner pulse witness; acceptance cannot be graded')
    if not guide_states:out['issues'].append('No GUIDE0 state witness; physical Guide interpretation unknown')
    if not counts.get('guide0-nursery-outcome-pair'):out['issues'].append('No nursery outcome pairing; clean/scar comparison unavailable')
    if not fold:out['issues'].append('No Fold owner witness; Fold continuation unknown')
    if unfinished:out['issues'].append('Some Pulse inputs lack exact owner witness; input does not prove reading')
    if not out['ownerAccepted']:out['issues'].append('No owner-accepted packet read in this run')
    if not accepted_clean or not accepted_scar:out['issues'].append('Both clean and scar player-authored outcomes not observed in this run')
    return out


def make_md(reports):
    lines=['# BLOB — BOT1-D3 Perception / GUIDE0-W Field Evaluation','',
      'Independent REC1 verdict. Camera and movement actions read only visible HUD and optional rendered pixel differences; they never read owner packet coordinates, material class, guide decision, or REC1 before choosing an action.','',
      '| Trial | Pulse inputs | Owner accepted | Closest Pulse (units) | Near misses | Guide pairs | Fold stage |',
      '|---|---:|---:|---:|---:|---:|---:|']
    for r in reports:
        d=r.get('closestRecordedPulseDistance')
        lines.append(f"| {r['folder']} | {r.get('REC1PulseInputs',0)} | {r.get('ownerAccepted',0)} | {f'{d:.3f}' if d is not None else 'unknown'} | {r.get('nearMissesWithinHalfUnit',0)} | {r.get('actualGuideWitness',{}).get('pulsePairs',0)} | {r.get('maxFoldStageIndex','?')} |")
    lines += ['','## Case-by-case evidence']
    for r in reports:
        lines+=['',f"### {r['folder']}",
          f"- Status: `{r.get('status')}`; {r.get('captureSeconds')} s, {r.get('detailsRetained')} events, dropped {r.get('detailsDropped')}.",
          f"- Bot actions: `{r.get('actionCounts')}`; visible motion candidate frames: {r.get('visualMotionCandidateFrames')}/{r.get('visualMotionSamples')}.",
          f"- Owner reasons: `{r.get('rejectionReasons')}`; accepted: {r.get('ownerAccepted')}; uncorrelated Pulse IDs: {r.get('uncorrelatedInputPulseIds')}",
          f"- Guide reactions: `{r.get('actualGuideWitness',{}).get('guideLastReactions')}`; outcomes: `{r.get('actualGuideWitness',{}).get('guideOutcomes')}`.",
          f"- Invitation: owner={r.get('ownerFoldInvitation')}, bot-visible={r.get('botObservedFoldInvitation')}; Fold completed: {r.get('foldComplete')}."]
        if r.get('issues'):
            lines+=['- Evidence limits: '+'; '.join(r['issues'])+'.']
    lines += ['','## Progression gate',
       '', 'G1-D3 is **passed only for acquisition** on trials with a real owner-accepted read. A clean-matter continuation requires a player-authored clean outcome and a separate Fold invitation; a Fold completion requires an owner completion witness. A Guide response is not the same as an owner-accepted read. The two profiles are exploratory comparisons, not controlled A/B performance claims: run order and random material cycles can differ.',
       '', '## Next circuit decision',
       '', 'Use witnessed failures to place a justified *sensory/feedback component* only after repeatable player-facing evidence. A motion-cue candidate means visible pixels changed; it does not identify clean or scar matter. No Host receipts or player physical motion can be inferred from visualization events alone.', '']
    return '\n'.join(lines)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('folder',nargs='?',default='BOT1D3_RESULTS')
    a=p.parse_args();root=pathlib.Path(a.folder)
    if not root.is_dir():p.error(f'folder does not exist: {root}')
    folders=sorted((x for x in root.iterdir() if x.is_dir() and x.name.startswith('BOT1D3_')))
    if not folders:p.error('no BOT1D3_* run folders found')
    reports=[evaluate(path) for path in folders]
    (root/'BOT1D3_EVIDENCE.json').write_text(json.dumps(reports,indent=2),encoding='utf-8')
    (root/'BOT1D3_EVIDENCE.md').write_text(make_md(reports),encoding='utf-8')
    print(f'Analyzed {len(reports)} trials; wrote {root / "BOT1D3_EVIDENCE.md"}')
    for r in reports:print(f"{r['folder']}: {r.get('ownerAccepted',0)} accepted / {r.get('REC1PulseInputs',0)} recorded pulses, Fold {r.get('maxFoldStageIndex',0)}")
    return 0

if __name__=='__main__':raise SystemExit(main())
