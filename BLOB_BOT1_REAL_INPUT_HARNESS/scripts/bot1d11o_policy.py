"""D11O fixed, predeclared input matrix. No surface-normal-driven steering."""
from bot1d11m_policy import route as prior_route
REVISION='BOT1-D11O-1'
CONTEXTS=('tangential','neutral_dwell')
RELEASES={'up_c':('c',),'up_left_ca':('c','a'),'up_right_cd':('c','d')}
CONTROLS=('host_positive','away_control','natural_reference','natural_feather')

def schedule(rounds=2):
    if not isinstance(rounds,int) or not 1<=rounds<=5:raise ValueError('rounds must be 1..5')
    # Controls once each; candidate conditions balanced and rotated each round.
    rows=[(1,p,'control','control') for p in CONTROLS]
    for r in range(1,rounds+1):
        contexts=CONTEXTS if r%2 else tuple(reversed(CONTEXTS))
        for i,ctx in enumerate(contexts):
            release_names=list(RELEASES)
            shift=(r+i-1)%len(release_names)
            release_names=release_names[shift:]+release_names[:shift]
            rows.extend((r,'natural_brake',ctx,name) for name in release_names)
    return tuple(rows)

def approach(context):
    if context not in CONTEXTS:raise ValueError('invalid context')
    steps=list(prior_route('natural_brake','neutral_counter'))
    pos=next(i for i,a in enumerate(steps) if a[0]=='tangential')
    assert steps[pos:pos+2]==[('tangential','a',0.45),('post_tangent',None,0.7)]
    if context=='neutral_dwell':steps[pos:pos+2]=[('tangential_neutral',None,0.45),('post_tangent',None,0.7)]
    return tuple(steps[:pos+2]) # only pre-release steps: no 'away_vertical' from prior

def control_route(profile):
    if profile not in CONTROLS:raise ValueError('invalid control')
    return prior_route(profile,'baseline')
