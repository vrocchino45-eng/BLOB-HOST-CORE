#!/usr/bin/env python3
"""G1-D9W online experiments: Stage 3 hold and seed-13 acquisition.

Input policy reads public HUD strings, previous ordinary inputs, and elapsed time.
No REC1, owner states, packet positions, or Guide telemetry is available to actions.
"""
from __future__ import annotations
import datetime
from bot1d6_policy import objective
from bot1d9v_policy import public_phase, RELEASE_CHECK_SECONDS, PUBLIC_CUE_WAIT_STEP, PUBLIC_CUE_WAIT_STEPS
from bot1d9u_policy import LEFT_TOTAL_SECONDS, LEFT_SLICE_SECONDS, NUDGE_LIMIT, NUDGE_SECONDS, POST_NUDGE_SETTLE_SECONDS
from bot1d3_browser import action_for_step

# Stage 3 action is a preregistered experimental Q hold, NOT an assertion that
# Stage 2 is publicly confirmed. D9V's HUD sometimes remained on Stage 1 words.
HOLD_KEY='q'
HOLD_SECONDS=1.50
HOLD_SAMPLE_SECONDS=.25
POST_PULSE_SECONDS=.10
AFTER_HOLD_SECONDS=.30

def stamp():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds')

def approach_pulse_hold(page, get_hud, *, sleep=None, on_observation=None):
    if sleep is None: sleep=lambda seconds:page.wait_for_timeout(round(seconds*1000))
    if on_observation is None: on_observation=lambda e:None
    observations=[];holds=[];pulses=[];left_elapsed=0.0;seen=False;corrections=[]
    def sample(label, duration=0.0):
        nonlocal seen
        h=get_hud(page);phase=public_phase(h)
        entry={'at':stamp(),'label':label,'seconds':round(duration,3),
               'publicPhase':phase,'objective':objective(h)[:230]}
        observations.append(entry);on_observation(entry)
        if phase in ('fold_answer_visible','fold_hold','fold_watch','fold_release','fold_complete','beyond_fold'):
            seen=True
        return phase
    # The original D9T left course is unchanged (keyboard A = lateral left).
    page.keyboard.down('a')
    try:
        while left_elapsed < LEFT_TOTAL_SECONDS-1e-5:
            dt=min(LEFT_SLICE_SECONDS,LEFT_TOTAL_SECONDS-left_elapsed)
            sleep(dt);left_elapsed+=dt
            if sample('left_chunk',dt) not in ('fold_search','unknown'): break
    finally:
        page.keyboard.up('a')
    sample('left_released')
    sleep(RELEASE_CHECK_SECONDS);sample('after_release',RELEASE_CHECK_SECONDS)
    if not seen:
        for _ in range(PUBLIC_CUE_WAIT_STEPS):
            sleep(PUBLIC_CUE_WAIT_STEP);sample('await_visible_answer',PUBLIC_CUE_WAIT_STEP)
            if seen: break
    if not seen:
        for i in range(NUDGE_LIMIT):
            page.keyboard.down('a')
            try:sleep(NUDGE_SECONDS)
            finally:page.keyboard.up('a')
            corrections.append({'key':'a','seconds':NUDGE_SECONDS,'index':i+1})
            sample('bounded_left_correction',NUDGE_SECONDS)
            sleep(POST_NUDGE_SETTLE_SECONDS);sample('post_correction',POST_NUDGE_SETTLE_SECONDS)
            if seen: break
    if seen and sample('before_first_pulse')=='fold_answer_visible':
        at=stamp();page.keyboard.press('x')
        pulse={'at':at,'key':'x','reason':'visible_fold_answer','number':1}
        pulses.append(pulse);on_observation(pulse)
        sleep(POST_PULSE_SECONDS);phase=sample('immediately_after_pulse',POST_PULSE_SECONDS)
        # This hold tests the known visible Q Stabilize control. If the HUD
        # still says 'answer', owner Stage 2 is UNKNOWN ONLINE.
        # Never pretend that the cue proves acceptance.
        if phase not in ('fold_watch','fold_release','fold_complete','beyond_fold'):
            action={'atStart':stamp(),'key':HOLD_KEY,'plannedSeconds':HOLD_SECONDS,
                    'reason':'bounded_stabilize_probe_after_public_pulse',
                    'publicPhaseAtStart':phase,'ownerStageUnknownOnline':True}
            page.keyboard.down(HOLD_KEY)
            try:
                elapsed=0.0
                while elapsed < HOLD_SECONDS-1e-6:
                    dt=min(HOLD_SAMPLE_SECONDS,HOLD_SECONDS-elapsed)
                    sleep(dt);elapsed+=dt
                    phase=sample('stabilize_held',dt)
                    if phase in ('fold_watch','fold_release','fold_complete','beyond_fold'):
                        break
            finally:
                page.keyboard.up(HOLD_KEY)
            action['atEnd']=stamp();action['actualRequestedSeconds']=round(elapsed,3)
            holds.append(action);on_observation(action)
            sleep(AFTER_HOLD_SECONDS);sample('after_hold',AFTER_HOLD_SECONDS)
    final=sample('final_public_state')
    return {'publicVerdict':'PUBLIC_ANSWER_SEEN' if seen else 'NO_PUBLIC_ANSWER',
        'leftHoldSeconds':round(left_elapsed,3),'corrections':corrections,'pulseActions':pulses,
        'holdActions':holds,'segments':observations,'endVisiblePhase':final,
        'noHiddenOwnerAccess':True,'noOnlineOwnerCertification':True}


def acquisition_action(step: int, seed: int, public_stage: str):
    """Precommitted seed-13 acquisition variation; cannot consult packet distance.

    W/D9V fixed sweep persists for seed 11. Seed 13 periodically changes
    heading and retreats before reattempting the moving-matter read.
    """
    if seed!=13:
        return action_for_step('sweep',step,public_stage,None,seed,False)
    k=step%12
    if k==0:return ('move','a',.78)
    if k==1:return ('observe',None,.32)
    if k==2:return ('move','s',.65)
    if k==3:return ('look','j',.36)
    if k==4:return ('pulse',None,.28) if public_stage=='packet_instruction' else ('observe',None,.32)
    # Keep actual player-targeting heuristics identical to existing sweep.
    return action_for_step('sweep',step,public_stage,None,seed,False)
