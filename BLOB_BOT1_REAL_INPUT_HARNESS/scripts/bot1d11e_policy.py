"""D11E natural-approach courses. Prescribed player inputs only; no owner-guided steering.

All Silt trials start at the ordinary Shift+6 debug entry, and NONE relocates the
Core. The debug entry is not proof of full route navigability.
"""
REVISION = 'BOT1-D11E-1'
TARGET = 'SILT_ENTRY_SEDIMENT_SHELF_D11B'
CELL = 'CELL_SILT_PRESSURE_ROUTE_001'
PROFILES = ('host_positive','natural_reference','natural_feather','natural_brake','away_control')
# (semantic label, physical keyboard key or None, seconds).  No hidden state used.
COURSES = {
    'host_positive': (
        ('host_neutral',None,1.5),('host_forward','w',0.6),('host_settle',None,1.6),
        ('host_side','a',0.4),('host_pause',None,1.5),
    ),
    # D11D original natural course, with an additional deliberate away trial.
    'natural_reference': (
        ('spawn_neutral',None,0.8),('approach_1','w',0.6),('pause_1',None,0.65),
        ('approach_2','w',0.4),('approach_settle',None,1.8),
        ('tangential','a',0.45),('post_tangent',None,0.7),
        ('away_vertical','c',1.15),('post_away',None,1.3),
    ),
    # Gentler two-part entry, designed to reduce momentum through first contact.
    'natural_feather': (
        ('spawn_neutral',None,0.8),('approach_1','w',0.36),('coast_1',None,0.35),
        ('approach_2','w',0.18),('approach_settle',None,2.0),
        ('tangential','a',0.45),('post_tangent',None,0.7),
        ('away_vertical','c',1.15),('post_away',None,1.3),
    ),
    # Compare short braking input rather than passive coasting. Not guaranteed optimal.
    'natural_brake': (
        ('spawn_neutral',None,0.8),('approach_1','w',0.52),
        ('counter_momentum','s',0.16),('approach_settle',None,2.0),
        ('tangential','a',0.45),('post_tangent',None,0.7),
        ('away_vertical','c',1.15),('post_away',None,1.3),
    ),
    # Never approach shelf; controls against a sticky bootstrap in open Silt entry.
    'away_control': (
        ('spawn_neutral',None,0.8),('move_away','c',1.1),
        ('away_observe',None,2.1),('move_side','d',0.4),('end_observe',None,1.0),
    ),
}

def course(profile):
    if profile not in PROFILES: raise ValueError('Unknown D11E profile: '+str(profile))
    items = COURSES[profile]
    if not items or any(key not in (None,'w','a','s','c','d') or not 0 < duration < 4 for _,key,duration in items):
        raise ValueError('Invalid D11E course')
    return items

def entry_key(profile):
    if profile not in PROFILES:raise ValueError('Unknown D11E profile')
    return 'Shift+1' if profile=='host_positive' else 'Shift+6'

def natural(profile):
    return profile.startswith('natural_')
