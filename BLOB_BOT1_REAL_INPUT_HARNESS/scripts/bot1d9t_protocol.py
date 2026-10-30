#!/usr/bin/env python3
"""D9T fixed input sequence derived from the actual successful D9S run.

This is a replication of ONE observed trajectory, not spatial learning. No hidden
Fold position or movement owner data informs online control.
"""
from bot1d9s_protocol import course

EXPECTED = (
    ('idle',None,2.2,'ambient_center'),
    ('look','j',1.65,'look_left'),
    ('idle',None,2.2,'ambient_left'),
    ('look','l',1.65,'look_right'),
    ('idle',None,2.2,'ambient_return'),
    ('move','w',2.2,'travel_forward'),
    ('idle',None,2.2,'ambient_after_forward'),
    ('move','s',2.2,'travel_backward'),
    ('idle',None,2.2,'ambient_after_backward'),
    ('move','a',2.2,'travel_left'),
)

def crossing_course():
    trials = course()[:10]
    observed = tuple((t.kind,t.key,t.duration,t.label) for t in trials)
    if observed != EXPECTED:
        raise RuntimeError('D9S calibration course changed; D9T replication locked to the original ten trials')
    return trials
