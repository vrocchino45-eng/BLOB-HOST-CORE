#!/usr/bin/env python3
"""G1-D7: visible-frame landmarks and viewpoint comparison; no game owner access.

This is a candidate detector, NOT a Fold recognizer. Color segmentation will see
ambient materials and moving particles. Novelty measures appearance only, not
world displacement, range, or semantic goal direction.
"""
from __future__ import annotations
from collections import deque
from io import BytesIO
import math
from PIL import Image,ImageFilter

# Exclude the upper-left HUD, top border and bottom tutorial, but preserve much
# of the playable environment. Settings are fractions of a 1280x720 screenshot.
W,H = 112,64

def _sample(png:bytes):
    im=Image.open(BytesIO(png)).convert('RGB')
    ww,hh=im.size
    # HUD overlay occupies upper left; mask that portion instead of cropping the world.
    im=im.resize((W,H),Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(.35))
    return im.convert('HSV'),im

def describe(png:bytes):
    hsv,rgb=_sample(png)
    p=list(hsv.getdata()); q=list(rgb.getdata());mask=[False]*(W*H)
    # Python/Pillow hue is in 0..255: cyan / green-blue from teal membranes.
    # This is deliberately broad: it may identify non-target material.
    features=[]
    for y in range(H):
        for x in range(W):
            idx=y*W+x;h,s,v=p[idx]
            if y < 10 or y > 56 or (x < 29 and y < 24): continue
            if 94 <= h <= 151 and s>=54 and v>=38:
                mask[idx]=True
    seen=set();blobs=[]
    for i,on in enumerate(mask):
        if not on or i in seen:continue
        stack=[i];seen.add(i);total_x=total_y=count=0
        while stack:
            k=stack.pop();y,x=divmod(k,W)
            total_x+=x;total_y+=y;count+=1
            for j in (k-1,k+1,k-W,k+W):
                if j<0 or j>=W*H or j in seen or not mask[j]:continue
                jy,jx=divmod(j,W)
                if abs(jx-x)+abs(jy-y)!=1:continue
                seen.add(j);stack.append(j)
        if count>=9:
            blobs.append({'screenX':round(total_x/count/(W-1),3),
                          'screenY':round(total_y/count/(H-1),3),
                          'areaPixels':count,'label':'cyan_material_candidate_not_fold'})
    blobs.sort(key=lambda x:x['areaPixels'],reverse=True)
    # Region-scale composition descriptor for viewpoint novelty; no object IDs.
    descriptor=[]
    for gy in range(3):
        for gx in range(4):
            cnt=0;cyan=gold=red=brightness=0.
            for yy in range(10+gy*15,10+(gy+1)*15,2):
                for xx in range(gx*28,(gx+1)*28,2):
                    if xx<29 and yy<24:continue
                    h,s,v=p[yy*W+xx];cnt+=1
                    cyan+=bool(94<=h<=151 and s>=54 and v>=38)
                    gold+=bool(17<=h<=50 and s>=75 and v>=60)
                    red+=bool((h<=16 or h>=242) and s>=68 and v>=45)
                    brightness+=v/255
            descriptor.extend(round(x/max(cnt,1),3) for x in (cyan,gold,red,brightness))
    return {'descriptor':descriptor,'candidates':blobs[:5],
            'cyanPixelCount':sum(mask),'frameSize':[W,H],
            'confidence':'CANDIDATES_ONLY_NO_FOLD_IDENTITY'}

def difference(a:dict,b:dict)->float:
    """0..1 approximate appearance novelty; not distance."""
    x,y=a['descriptor'],b['descriptor']
    if len(x)!=len(y):raise ValueError('Descriptor lengths differ')
    return round(sum(abs(c-d) for c,d in zip(x,y))/len(x),5)

def choose(survey:dict,history:list,previous:str|None=None):
    """Three camera-relative views. Prefer under-explored appearances.

    `survey` keys: left, center, right. Requires no Fold coordinate/owner state.
    When all views are similar, report ambiguity; move in persistent selected
    heading, never alternate W/S immediately after each movement.
    """
    keys=('left','center','right')
    if set(survey)!=set(keys):raise ValueError('Need left, center and right survey views')
    score={}
    for k in keys:
        desc=survey[k]
        if history:
            novelty=min(difference(desc,h) for h in history[-14:])
        else:novelty=0.
        # Suppress high-confidence assumptions: a broad cyan mask is NOT a Fold cue.
        # Stable heading prior avoids ping-pong when views are indistinguishable.
        stickiness=.004 if k==previous else 0.
        score[k]=round(novelty+stickiness,5)
    ranked=sorted(keys,key=lambda k:score[k],reverse=True)
    selected=ranked[0]
    if max(score.values())-min(score.values())<.006 and previous in keys:
        selected=previous
    return {'selected':selected,'scores':score,
            'ambiguous':max(score.values())-min(score.values())<.009,
            'basis':'viewpoint_appearance_novelty_and_heading_persistence',
            'goalDirectionKnown':False}


def classify_progress(before:dict,after:dict,ambient:float):
    delta=difference(before,after)
    # Pixel appearance can change from environment animation or camera parallax.
    return {'appearanceDelta':delta,'ambientDelta':round(ambient,5),
            'visualChangeAboveAmbient':delta>max(.012,1.6*ambient),
            'worldDisplacementProven':False,'FoldApproachProven':False}
