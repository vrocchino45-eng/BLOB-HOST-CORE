#!/usr/bin/env python3
"""G1-D5 navigation probe policy: screenshot-derived weak-change cue, never owner truth."""
from __future__ import annotations
import io
from PIL import Image, ImageChops, ImageStat

# Crops away HUD margin and top status; central world may still contain dynamic particles.
CROP_FRACTIONS=(.26,.20,.90,.84)


def screen_difference(before:bytes,after:bytes)->float:
    a=Image.open(io.BytesIO(before)).convert('L')
    b=Image.open(io.BytesIO(after)).convert('L')
    if a.size!=b.size:raise ValueError('Frame size mismatch')
    w,h=a.size
    crop=tuple(round(v*k) for v,k in zip(CROP_FRACTIONS,(w,h,w,h)))
    a=a.crop(crop).resize((64,40));b=b.crop(crop).resize((64,40))
    return round(ImageStat.Stat(ImageChops.difference(a,b)).mean[0]/255,6)


def weak_visual_change(action_change:float,ambient_change:float)->bool:
    """Heuristic only: not evidence of physical displacement or an obstacle."""
    return action_change < max(.014,1.6*ambient_change+.005)

# Search is camera-relative and intentionally short. No world coords or Fold distance.
PATTERN=[('w',.58),('a',.52),('w',.58),('d',1.04),('w',.58),('a',.52),
         ('s',.40),('d',.60),('w',.66),('a',.60),('w',.66),('d',1.20)]

def next_probe(step:int,weak_streak:int,seed:int)->tuple[str,str,float,str]:
    if weak_streak>=2:
        # A different direction with a brief release rather than pressing into one attachment.
        return 'move', ('s' if (step+seed)%2 else 'd'), .54, 'visual_weak_change_recovery_probe'
    i=step%len(PATTERN)
    key,duration=PATTERN[i]
    if step>0 and step%len(PATTERN)==0:
        return 'look',('j' if (step//len(PATTERN)+seed)%2 else 'l'),.38,'new_heading_after_small_probes'
    return 'move',key,duration,'short_camera_relative_probe'


def public_inputs():return ('visible HUD','rendered screenshot pixels','seed','previous key attempts')
