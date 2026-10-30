#!/usr/bin/env python3
"""Precommitted D9S observation-only course. No hidden owner input."""
from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class Trial:
    heading: str
    kind: str
    key: str | None
    duration: float
    label: str


def course():
    """Slow neutral/control trials let 400ms REC1 heartbeat sample camera only.

    Camera headings are names for timed key commands, NOT measured angles.
    Direction choices are precommitted: no gameplay-owner data are read.
    """
    return [
        Trial('center','idle',None,2.2,'ambient_center'),
        Trial('center','look','j',1.65,'look_left'),
        Trial('left','idle',None,2.2,'ambient_left'),
        Trial('left','look','l',1.65,'look_right'),
        Trial('center','idle',None,2.2,'ambient_return'),
        Trial('center','move','w',2.2,'travel_forward'),
        Trial('center','idle',None,2.2,'ambient_after_forward'),
        Trial('center','move','s',2.2,'travel_backward'),
        Trial('center','idle',None,2.2,'ambient_after_backward'),
        Trial('center','move','a',2.2,'travel_left'),
        Trial('center','idle',None,2.2,'ambient_after_left'),
        Trial('center','move','d',2.2,'travel_right'),
        Trial('center','idle',None,2.2,'ambient_after_right'),
    ]
