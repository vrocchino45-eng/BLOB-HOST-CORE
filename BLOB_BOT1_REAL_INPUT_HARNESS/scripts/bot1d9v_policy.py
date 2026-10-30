#!/usr/bin/env python3
"""D9V public-cue entry + immediate bounded Pulse policy.

Only visible HUD words, elapsed time and ordinary keyboard input control actions.
Owner REC1, world positions, Fold distance/focus and Guide internal state are OFFLINE ONLY.
"""
from __future__ import annotations
import datetime
from bot1d6_policy import objective, stage
from bot1d9u_policy import visible_cue, LEFT_TOTAL_SECONDS, LEFT_SLICE_SECONDS, NUDGE_LIMIT, NUDGE_SECONDS

# D9U established Stage 1 near the left-key release. D9V does not change the
# course; it attempts the requested Pulse before the long D9U neutral settle.
RELEASE_CHECK_SECONDS=.09
PUBLIC_CUE_WAIT_STEP=.16
PUBLIC_CUE_WAIT_STEPS=5
PULSE_SETTLE_SECONDS=.33
PULSE_LIMIT=2
POST_NUDGE_SETTLE_SECONDS=.26


def public_phase(hud: str) -> str:
    s=stage(hud)
    if s in ('fold_hold','fold_watch','fold_release','fold_complete','beyond_fold'):
        return s
    if s=='fold_pulse' or visible_cue(hud)=='visible_fold_answer':
        return 'fold_answer_visible'
    if s=='fold_search':return 'fold_search'
    return 'unknown'


def should_pulse(phase: str, attempts: int) -> bool:
    return phase=='fold_answer_visible' and attempts<PULSE_LIMIT


def approach_and_pulse(page,get_hud, *, sleep=None,on_observation=None):
    """Run fixed D9U left crossing and a strictly bounded post-cue Pulse.

    A transient public cue is latched. A second pulse requires the *current* HUD
    to continue requesting the Fold answer; it is never fired merely because
    the first pulse was not confirmed in hidden owner data.
    """
    if sleep is None:sleep=lambda secs:page.wait_for_timeout(round(1000*secs))
    if on_observation is None:on_observation=lambda e:None
    now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds')
    segments=[];pulses=[];left_elapsed=0.;cue_seen=False;nudges=[]
    def sample(label,secs=0.0):
        nonlocal cue_seen
        h=get_hud(page);ph=public_phase(h)
        entry={'at':now(),'label':label,'durationSeconds':round(secs,3),
               'phase':ph,'objective':objective(h)[:250]}
        segments.append(entry);on_observation(entry)
        if ph in ('fold_answer_visible','fold_hold','fold_watch','fold_release','fold_complete','beyond_fold'):
            cue_seen=True
        return ph
    def pulse_if_requested(label):
        ph=sample(label+'_before')
        if not should_pulse(ph,len(pulses)):return False
        page.keyboard.press('x')
        entry={'at':now(),'kind':'pulse','key':'x','index':len(pulses)+1,'reason':label,
               'publicPhaseAtAction':ph}
        pulses.append(entry);on_observation(entry)
        sleep(PULSE_SETTLE_SECONDS)
        sample(label+'_after',PULSE_SETTLE_SECONDS)
        return True
    pressed=False
    try:
        page.keyboard.down('a');pressed=True
        while left_elapsed<LEFT_TOTAL_SECONDS-1e-5:
            dt=min(LEFT_SLICE_SECONDS,LEFT_TOTAL_SECONDS-left_elapsed)
            sleep(dt);left_elapsed+=dt
            ph=sample('left_movement_chunk',dt)
            if ph not in ('fold_search','unknown'):
                break
    finally:
        if pressed:page.keyboard.up('a')
    sample('left_released')
    sleep(RELEASE_CHECK_SECONDS)
    ph=sample('release_check',RELEASE_CHECK_SECONDS)
    if not cue_seen:
        for _ in range(PUBLIC_CUE_WAIT_STEPS):
            sleep(PUBLIC_CUE_WAIT_STEP)
            ph=sample('wait_for_public_answer',PUBLIC_CUE_WAIT_STEP)
            if cue_seen:break
    # If no public stage ever appeared, use same bounded left correction as D9U.
    if not cue_seen:
        for i in range(NUDGE_LIMIT):
            page.keyboard.down('a')
            try:sleep(NUDGE_SECONDS)
            finally:page.keyboard.up('a')
            nudges.append({'key':'a','seconds':NUDGE_SECONDS,'index':i+1})
            sample('bounded_left_nudge',NUDGE_SECONDS)
            sleep(POST_NUDGE_SETTLE_SECONDS)
            sample('post_nudge_settle',POST_NUDGE_SETTLE_SECONDS)
            if cue_seen:break
    if cue_seen:
        pulse_if_requested('first_visible_fold_answer')
        # A second Pulse is optional and only used if the public Fold answer
        # *still* requests Pulse after the first attempt (no blind spam).
        pulse_if_requested('second_visible_fold_answer_if_still_requested')
    end_phase=sample('post_pulse_final')
    return {'publicVerdict':'PUBLIC_ANSWER_SEEN' if cue_seen else 'NO_PUBLIC_ANSWER',
        'leftHoldSeconds':round(left_elapsed,3),'corrections':nudges,
        'pulseActions':pulses,'segments':segments,'endVisiblePhase':end_phase,
        'noHiddenOwnerAccess':True,'cannotCertifyStage2':True}
