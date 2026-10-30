#!/usr/bin/env python3
"""G1-D9U public-HUD arrival policy. No hidden owner inputs, ever.

Course remains D9T (D9S indexes 0..9). Arrival uses bounded keyboard actions
and objective text displayed to an ordinary player. This is not visual SLAM.
"""
from __future__ import annotations
from bot1d6_policy import objective, stage

LEFT_TOTAL_SECONDS = 2.20
LEFT_SLICE_SECONDS = .20
SETTLE_SECONDS = .78
NUDGE_SECONDS = .20
NUDGE_LIMIT = 2
POST_NUDGE_SETTLE_SECONDS = .88

# These are *visible* text cues, not a read of Fold owner state.
PUBLIC_ANSWER_PHRASES = (
    "let the fold's answer travel through the nursery",
    'let the fold’s answer travel through the nursery',
    'press x once to pulse-read the fold',
    'pulse once with x',
    'pulse-read the fold',
)

def visible_cue(hud: str) -> str:
    obj = objective(hud).lower()
    if any(p in obj for p in PUBLIC_ANSWER_PHRASES):
        return 'visible_fold_answer'
    s = stage(hud)
    if s in ('fold_pulse','fold_hold','fold_watch','fold_release','fold_complete'):
        return 'visible_fold_answer'
    if s == 'fold_search':
        return 'fold_search'
    return 'unknown'

def arrival_strategy(hud: str, correction_count: int) -> str:
    """Conservative online state transition; no owner/position arguments."""
    if visible_cue(hud) == 'visible_fold_answer':
        return 'STOP_ON_PUBLIC_ANSWER'
    if correction_count >= NUDGE_LIMIT:
        return 'STOP_AFTER_BOUNDED_TRIAL'
    return 'NUDGE_AND_SETTLE'

def run_arrival(page, get_hud, *, sleep=None, on_observation=None):
    """Perform the D9T left crossing then bounded settling/corrections.

    Purely public input/output: ``get_hud(page)`` returns visible HUD text.
    Never calls telemetry APIs. Logs every segment for independent REC1 review.
    """
    if sleep is None:
        sleep = lambda sec: page.wait_for_timeout(round(1000*sec))
    if on_observation is None:
        on_observation = lambda entry: None
    import datetime
    now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
    segments=[]
    elapsed=0.0
    answer_seen=False
    def sample(label, duration):
        nonlocal answer_seen
        hud = get_hud(page)
        entry={'at':now(),'label':label,'duration':round(duration,3),
               'cue':visible_cue(hud),'publicObjective':objective(hud)[:230]}
        segments.append(entry);on_observation(entry)
        if entry['cue']=='visible_fold_answer':answer_seen=True
        return entry['cue']
    # Keyboard-down in bounded increments so the public HUD can stop the action.
    pressed=False
    try:
        page.keyboard.down('a');pressed=True
        while elapsed < LEFT_TOTAL_SECONDS - 0.00001:
            dt=min(LEFT_SLICE_SECONDS, LEFT_TOTAL_SECONDS-elapsed)
            sleep(dt);elapsed+=dt
            if sample('left_movement_chunk',dt)=='visible_fold_answer':
                break
    finally:
        if pressed:page.keyboard.up('a')
    sample('left_released',0)
    sleep(SETTLE_SECONDS)
    cue=sample('neutral_settle',SETTLE_SECONDS)
    corrections=[]
    for i in range(NUDGE_LIMIT):
        if answer_seen:break
        page.keyboard.down('a')
        try:sleep(NUDGE_SECONDS)
        finally:page.keyboard.up('a')
        corrections.append({'key':'a','seconds':NUDGE_SECONDS,'index':i+1})
        sample('bounded_left_nudge',NUDGE_SECONDS)
        sleep(POST_NUDGE_SETTLE_SECONDS)
        cue=sample('post_nudge_settle',POST_NUDGE_SETTLE_SECONDS)
    verdict='PUBLIC_ANSWER_SEEN' if answer_seen else 'NO_PUBLIC_ANSWER'
    return {'publicVerdict':verdict,'leftHoldSeconds':round(elapsed,3),
            'corrections':corrections,'segments':segments,
            'noHiddenOwnerAccess':True,'cannotCertifyStage':True}
