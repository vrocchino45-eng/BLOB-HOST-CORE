#!/usr/bin/env python3
"""G1-D9 precommitted, owner-blind camera/translation calibration grammar.

The online controller never receives a Fold position, owner movement, camera
matrix, target identity, or REC1. Every test has neutral settle intervals.
"""
from __future__ import annotations
from dataclasses import dataclass
from bot1d7_vision import describe, difference
from bot1d8_motion import response

@dataclass(frozen=True)
class Trial:
    heading: str
    kind: str
    key: str | None
    duration: float
    label: str


def course():
    """Three camera-relative headings; matched axis controls, not navigation.

    'Center' is the initial camera orientation. Look j rotates left; l for
    twice the duration from that pose rotates right. Return is symmetric.
    These are keyboard durations, NOT measured camera angles.
    """
    out=[]
    for heading in ('center','left','right'):
        if heading=='left':
            out.append(Trial(heading,'look','j',.48,'enter_left_view'))
        if heading=='right':
            out.append(Trial(heading,'look','l',.96,'enter_right_view'))
        # Hold camera fixed through two +/- axis pairs, with neutral pauses.
        for key in ('w','s','a','d'):
            out.append(Trial(heading,'move',key,1.32,'matched_axis_'+key))
        # A neutral view landmark 'return test' does NOT undo translation.
        if heading=='left':
            out.append(Trial(heading,'look','l',.48,'return_center_from_left'))
        if heading=='right':
            out.append(Trial(heading,'look','j',.48,'return_center_from_right'))
    return out


def classify(observation, idle_before, idle_after, action_before, action_after, kind, history=()):
    """Separate screen response from physical-displacement claims.

    Call with screenshots: raw pixels always precede REC1 owner evaluation.
    """
    metric=response(action_before,action_after,idle_before,idle_after,history,action_kind=kind)
    view_before=describe(action_before)
    view_after=describe(action_after)
    return {
       'visual':metric,
       'candidateCountBefore':len(view_before['candidates']),
       'candidateCountAfter':len(view_after['candidates']),
       'appearanceDelta':difference(view_before,view_after),
       'semanticLandmarkKnown':False,
       'cameraRotationMeasured':False,
       'actualTranslationKnownOnline':False,
       'FoldBearingKnown':False,
       'interpretation':'screen_response_only_not_world_displacement'
    }


def landmark_return(reference_png, returned_png, idle_a_png, idle_b_png):
    """A descriptor match is a *candidate* repeat view, not place identity."""
    a,b=describe(reference_png),describe(returned_png)
    idle=difference(describe(idle_a_png),describe(idle_b_png))
    delta=difference(a,b)
    return {'appearanceDistance':delta,'idleAppearanceDistance':idle,
            'descriptorSimilar':bool(delta<=max(.015,2.0*idle)),
            'landmarkIdentityConfirmed':False,'positionReturnConfirmed':False,
            'interpretation':'appearance_similarity_can_reflect_repeated_geometry_or_camera'}


def online_signal_summary(probes):
    """Pure vision/schedule summary. Never reads an owner field."""
    moved=[p for p in probes if p.get('kind')=='move']
    looked=[p for p in probes if p.get('kind')=='look']
    n=lambda items:sum(bool(p.get('signal',{}).get('visual',{}).get('imageMotionAboveAmbient')) for p in items)
    return {'translationProbeCount':len(moved),'lookOnlyProbeCount':len(looked),
            'translationScreenMotionAboveAmbient':n(moved),
            'lookScreenMotionAboveAmbient':n(looked),
            'onlineWorldDisplacementProven':False,
            'onlineFoldDirectionKnown':False}
