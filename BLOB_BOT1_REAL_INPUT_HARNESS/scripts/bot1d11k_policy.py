"""D11K fixed-key diagnostic, not controller correction or gameplay modification.

Arm controls compare Brake counter-input with a duration-matched neutral step,
and compare fixed keyboard release axes after an otherwise frozen Brake route.
Owner telemetry is NEVER used to select inputs during a run.
"""
from bot1d11e_policy import course as frozen_course, entry_key

REVISION = 'BOT1-D11K-1'
CONTROLS = ('host_positive', 'away_control')
REFERENCE = ('natural_reference', 'natural_feather')
BRAKE = 'natural_brake'
ARMS = ('baseline', 'brake_no_counter', 'release_c_extended', 'release_forward_w', 'release_backward_s')
ALL_PROFILES = CONTROLS + REFERENCE + (BRAKE,)


def route(profile, arm='baseline'):
    if profile not in ALL_PROFILES:
        raise ValueError('Unknown D11K profile: '+str(profile))
    if arm not in ARMS or (profile != BRAKE and arm != 'baseline'):
        raise ValueError('Invalid D11K arm for profile')
    result = list(frozen_course(profile))
    if arm == 'brake_no_counter':
        i = next(i for i, x in enumerate(result) if x[0] == 'counter_momentum')
        assert result[i][1:] == ('s', 0.16)
        result[i] = ('counter_momentum_neutral_control', None, 0.16)
    elif arm in ('release_c_extended', 'release_forward_w', 'release_backward_s'):
        i = next(i for i, x in enumerate(result) if x[0] == 'away_vertical')
        label, key, duration = result[i]
        assert (key, duration) == ('c', 1.15)
        replacement = {'release_c_extended':('c', 1.75),
                       'release_forward_w':('w', 1.15),
                       'release_backward_s':('s', 1.15)}[arm]
        result[i] = (label, *replacement)
    return tuple(result)


def schedule(rounds=2):
    if rounds not in (1, 2, 3):
        raise ValueError('Rounds 1..3')
    items = [(1, 'host_positive', 'baseline'), (1, 'away_control', 'baseline')]
    comparisons = [(p, 'baseline') for p in REFERENCE] + [(BRAKE, a) for a in ARMS]
    for r in range(1, rounds+1):
        for p, a in (comparisons if r % 2 else list(reversed(comparisons))):
            items.append((r, p, a))
    return tuple(items)
