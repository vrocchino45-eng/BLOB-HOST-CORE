"""D11B live contact proof: short ordinary-input trials, no owner-state steering.

The D11B shelf is centered at (-0.18,-0.75,-2.65) in the Silt route.
These routes intentionally differ in how quickly they approach that shelf.
They DO NOT guarantee proximity, contact, or a mechanically accepted latch.
"""
REVISION = 'BOT1-D11B-LIVE-1'
SILT = 'CELL_SILT_PRESSURE_ROUTE_001'
NURSERY = 'CELL_MEMBRANE_NURSERY_001'
SHELF = 'SILT_ENTRY_SEDIMENT_SHELF_D11B'
PROFILES = ('host_positive', 'silt_short', 'silt_slow', 'silt_return')
# (label, keyboard key or None, duration seconds)
COURSES = {
    'host_positive': (
        ('at_host_entry', None, 1.3),
        ('host_brief_forward', 'w', 0.6),
        ('host_settle', None, 1.4),
        ('host_away_trial', 's', 1.2),
        ('host_final_neutral', None, 1.5),
    ),
    'silt_short': (
        ('at_silt_entry', None, 0.8),
        ('silt_approach_short', 'w', 0.95),
        ('silt_settle', None, 1.5),
        ('silt_away_trial', 's', 0.9),
        ('silt_final_neutral', None, 1.5),
    ),
    'silt_slow': (
        ('at_silt_entry', None, 0.8),
        ('silt_step_one', 'w', 0.6),
        ('silt_pause_one', None, 0.65),
        ('silt_step_two', 'w', 0.4),
        ('silt_settle', None, 1.5),
        ('silt_away_trial', 's', 0.9),
        ('silt_final_neutral', None, 1.5),
    ),
    'silt_return': (
        ('at_silt_entry', None, 0.8),
        ('silt_approach_long', 'w', 1.35),
        ('silt_settle', None, 1.5),
        ('silt_away_trial', 's', 0.95),
        ('silt_final_neutral', None, 1.5),
    ),
}

def course(profile):
    if profile not in PROFILES: raise ValueError(f'Unknown profile: {profile}')
    steps = COURSES[profile]
    if not steps or any(k not in ('w', 's', None) or not 0 < secs <= 5.0 for _,k,secs in steps):
        raise ValueError('Invalid course')
    return steps

def intended_cell(profile):
    return NURSERY if profile == 'host_positive' else SILT

def entry_key(profile):
    return 'Shift+1' if profile == 'host_positive' else 'Shift+6'

def contract():
    return {
       'revision': REVISION,
       'ownerStateForLiveSteering': False,
       'liveInputs': 'ordinary W/S keyboard, existing Shift+1 or Shift+6 debug entries',
       'offlineEvidence': 'recorded REC1 owner snapshots, not HUD Contact attached',
       'siltTargetSurfaceId': SHELF,
       'sourceChangeRequired': 'D11B authored shelf patch already applied',
       'limitations': [
           'Short scripted inputs do not guarantee an eligible contact approach.',
           'No contact normal is available in existing REC1 mobility snapshots.',
           'If attachment is never observed, release is not tested.',
           'An observed release after S does not prove S caused the release.',
           'A missing sampled transition cannot rule out a brief unsampled event.',
           'Host positive-control debug start is not a natural gameplay path.'
       ]
    }
