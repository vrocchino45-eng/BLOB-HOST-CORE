"""D11C prescribed diagnostic input courses: owner state never steers natural runs."""
REVISION = 'BOT1-D11C-1'
PROFILES = ('host_positive', 'silt_natural', 'silt_controlled', 'silt_controlled_peel')
TARGET = 'SILT_ENTRY_SEDIMENT_SHELF_D11B'
CELL = 'CELL_SILT_PRESSURE_ROUTE_001'
# label, key, held seconds; None means neutral wait
COURSES = {
 'host_positive': (('host_neutral',None,1.5),('host_forward','w',0.6),('host_settle',None,1.6),('host_side','a',0.4),('host_pause',None,1.5)),
 'silt_natural': (('spawn_neutral',None,0.8),('approach_1','w',0.6),('pause_1',None,0.65),('approach_2','w',0.4),('approach_settle',None,1.8),('tangent','a',0.3),('end_neutral',None,1.5)),
 'silt_controlled': (('controlled_settle',None,2.1),('tangential_a','a',0.32),('post_tangent',None,1.7)),
 'silt_controlled_peel': (('controlled_settle',None,2.2),('tangential_a','a',0.3),('post_tangent',None,0.6),('away_vertical','c',1.15),('post_away',None,1.6))
}
def course(profile):
    if profile not in PROFILES: raise ValueError('Unknown D11C profile: '+profile)
    steps=COURSES[profile]
    if any(k not in (None,'w','a','c') or not 0 < secs < 4 for _,k,secs in steps):
        raise ValueError('Invalid D11C course')
    return steps

def entry_key(profile):
    return 'Shift+1' if profile == 'host_positive' else 'Shift+6'

def controlled(profile):
    return profile.startswith('silt_controlled')
