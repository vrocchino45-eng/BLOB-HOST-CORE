#!/usr/bin/env python3
"""G1-D8 pixel-motion proxy. Public screenshot data only; NOT world displacement.

Fixed-camera movement is deliberately separated from look-only tests by the
runner. Scene animation, camera stabilization and parallax confound image flow.
"""
from __future__ import annotations
from io import BytesIO
import math, statistics
from PIL import Image, ImageFilter
from bot1d7_vision import describe, difference

SIZE=(144,81)

def grayscale(png):
    image=Image.open(BytesIO(png)).convert('L').resize(SIZE,Image.Resampling.BILINEAR)
    return image.filter(ImageFilter.GaussianBlur(.55))

def patch_flow(before,after):
    """Estimate background-screen motion from high-contrast patches.

    This is intentionally a coarse *visual* signal. No game coordinates, camera
    matrices, target labels, hidden telemetry or owner state are accessed.
    """
    a=grayscale(before);b=grayscale(after)
    ap=a.load();bp=b.load();matches=[]
    for cy in (28,39,50,61):
        for cx in (40,57,74,91,108,125):
            # The local search excludes HUD, edge/corners, and central low texture.
            tile=[ap[cx+dx,cy+dy] for dy in (-3,0,3) for dx in (-3,0,3)]
            if max(tile)-min(tile)<17:continue
            best=10**9;best_shift=(0,0)
            for oy in range(-6,7,2):
                for ox in range(-6,7,2):
                    e=sum(abs(tile[i]-bp[cx+dx+ox,cy+dy+oy])
                          for i,(dy,dx) in enumerate(( (dy,dx) for dy in (-3,0,3) for dx in (-3,0,3) )))
                    if e<best:best=e;best_shift=(ox,oy)
            # Exclude poor matches. Animated material may still slip through.
            if best<=300:matches.append(best_shift)
    if not matches:return {'trackedPatches':0,'medianMotionPixels':0.,
                           'flowSpreadPixels':0.,'medianVector':[0,0]}
    lengths=[math.hypot(x,y) for x,y in matches]
    mx=statistics.median(x for x,y in matches)
    my=statistics.median(y for x,y in matches)
    spread=statistics.median(math.hypot(x-mx,y-my) for x,y in matches)
    return {'trackedPatches':len(matches),'medianMotionPixels':round(statistics.median(lengths),3),
            'flowSpreadPixels':round(spread,3),'medianVector':[mx,my]}

def response(before,after,idle_before,idle_after,history=(),action_kind='move'):
    if action_kind not in ('move','look','observe'):raise ValueError('Unknown action category')
    p=patch_flow(before,after)
    ambient=patch_flow(idle_before,idle_after)
    a=describe(before);b=describe(after)
    idle_a=describe(idle_before);idle_b=describe(idle_after)
    novelty=difference(a,b);noise=difference(idle_a,idle_b)
    # Use *image* metric only. Tracking confidence matters: D7 color novelty
    # alone was elevated even when the Core pressed into an ellipsoid boundary.
    response_ratio=round(p['medianMotionPixels']/max(.5,ambient['medianMotionPixels']),3)
    strong=(p['trackedPatches']>=5 and
            p['medianMotionPixels']>=2. and
            p['medianMotionPixels']>=ambient['medianMotionPixels']+1.25)
    familiar=False
    if history:
        familiar=min(difference(b,h) for h in history[-15:])<.01
    return {'actionKind':action_kind,'screenFlow':p,'ambientFlow':ambient,
            'appearanceDelta':novelty,'ambientAppearanceDelta':noise,
            'motionToAmbientRatio':response_ratio,
            'imageMotionAboveAmbient':bool(strong),
            'sceneRevisited':familiar,
            'cameraKeyDuringMove':False if action_kind=='move' else None,
            'worldDisplacementProven':False,
            'boundaryPressureKnownOnline':False,
            'FoldDirectionKnown':False,
            'limitations':'Public screenshot movement can reflect animation, parallax or camera; REC1 referee is independent.'}
