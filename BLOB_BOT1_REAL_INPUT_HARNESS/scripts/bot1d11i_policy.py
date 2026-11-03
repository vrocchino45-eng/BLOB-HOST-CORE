"""D11I matched dwell intervention: all steering is prescribed keyboard input.

Natural reference/feather D11E routes are unchanged in baseline arm. Dwell 0.70s
is either placed immediately AFTER final approach movement or BEFORE approach.
This equal-total-pause control separates contact settling from elapsed time.
"""
from bot1d11e_policy import course as frozen_course, entry_key
ARMS=('baseline','contact_dwell','timing_control')
NATURAL=('natural_reference','natural_feather')
CONTROLS=('host_positive','away_control')
PROFILES=NATURAL+CONTROLS
EXTRA_DWELL_SECONDS=0.70

def route(profile,arm='baseline'):
    if profile not in PROFILES:raise ValueError('Unknown D11I profile: '+str(profile))
    if arm not in ARMS:raise ValueError('Unknown D11I arm: '+str(arm))
    baseline=list(frozen_course(profile))
    if profile in CONTROLS or arm=='baseline':return tuple(baseline)
    if arm=='contact_dwell':
        idx=next(i for i,(label,_,_) in enumerate(baseline) if label=='approach_2')
        baseline.insert(idx+1,('D11I_near_shelf_neutral_dwell',None,EXTRA_DWELL_SECONDS))
    else:
        idx=next(i for i,(label,_,_) in enumerate(baseline) if label=='spawn_neutral')
        baseline.insert(idx+1,('D11I_pre_approach_timing_control',None,EXTRA_DWELL_SECONDS))
    return tuple(baseline)

def schedule(rounds=2):
    if rounds<1 or rounds>3:raise ValueError('Rounds must be 1..3')
    items=[(1,'host_positive','baseline'),(1,'away_control','baseline')]
    variants=[(p,a) for p in NATURAL for a in ARMS]
    for r in range(1,rounds+1):
        for p,a in (variants if r%2 else list(reversed(variants))):items.append((r,p,a))
    return items
