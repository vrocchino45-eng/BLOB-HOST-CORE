"""D11M acquisition-envelope comparison: fixed-input, no telemetry steering.

Round order alternates both Brake counter-input and release-owner recorder
conditions. Only the D11L diagnostic recorder is stopped in 'observer_off';
D11C/F/H/I probes and the actual game movement system remain unchanged.
"""
from bot1d11e_policy import course, entry_key

REVISION = 'BOT1-D11M-1'
ARMS = ('baseline', 'neutral_counter')
OBSERVERS = ('observer_on', 'observer_off')
CONTROLS = ('host_positive', 'away_control')
REFERENCE = ('natural_reference', 'natural_feather')
BRAKE = 'natural_brake'


def route(profile, arm='baseline'):
    if profile not in CONTROLS + REFERENCE + (BRAKE,):
        raise ValueError('Unknown D11M profile '+str(profile))
    if arm not in ARMS or (profile != BRAKE and arm != 'baseline'):
        raise ValueError('Invalid arm for profile')
    out = list(course(profile))
    if arm == 'neutral_counter':
        items = [(i, a) for i, a in enumerate(out) if a[0] == 'counter_momentum']
        if len(items) != 1 or items[0][1][1:] != ('s', .16):
            raise ValueError('Frozen D11E Brake counter step changed')
        out[items[0][0]] = ('counter_momentum_neutral_control', None, .16)
    return tuple(out)


def schedule(pairs=3):
    if not isinstance(pairs, int) or not 1 <= pairs <= 7:
        raise ValueError('pairs must be 1..7')
    # On/off controls validate that disabling just D11L does not remove core probes.
    rows = [(1, 'host_positive', 'baseline', 'observer_on'),
            (1, 'away_control', 'baseline', 'observer_off')]
    # Balanced reference for both observation modes.
    for j, obs in enumerate(OBSERVERS):
        for p in (REFERENCE if j == 0 else tuple(reversed(REFERENCE))):
            rows.append((1, p, 'baseline', obs))
    for rnd in range(1, pairs+1):
        obs_order = OBSERVERS if rnd % 2 else tuple(reversed(OBSERVERS))
        for obs in obs_order:
            arm_order = ARMS if rnd % 2 else tuple(reversed(ARMS))
            for arm in arm_order:
                rows.append((rnd, BRAKE, arm, obs))
    return tuple(rows)
