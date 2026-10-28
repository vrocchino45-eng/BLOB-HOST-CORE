"""Visible-rendered-frame motion cue for BOT1-D3. Does not identify packet or matter class.

Uses screenshots (what a player can see) only. No DOM owner state, transforms,
world coordinates, depth buffer or machine-learning target classes.
"""
from __future__ import annotations
import io
import math


def motion_observation(frame_a: bytes, frame_b: bytes):
    try:
        from PIL import Image
    except ImportError:
        return {'available': False, 'reason': 'Pillow missing; use sweep or pip install pillow',
                'candidate': None, 'confidence': 0.0}
    a = Image.open(io.BytesIO(frame_a)).convert('RGB')
    b = Image.open(io.BytesIO(frame_b)).convert('RGB')
    if a.size != b.size:
        return {'available': False, 'reason': 'mismatched frames', 'candidate': None, 'confidence':0.0}
    w, h = a.size
    ap, bp = a.load(), b.load()
    # One snapshot per ~9x9 pixels. Exclude visible HUD / recorder overlay and bottom gate.
    step = max(6, int(w / 140))
    cells = [[0.0]*6 for _ in range(4)]
    n = 0
    for y in range(step, int(h*.88), step):
        for x in range(step, int(w*.96), step):
            if x < w*.33 and y < h*.32: continue  # HUD + recorder overlay
            if x > w*.36 and x < w*.63 and y > h*.87: continue  # tissue-shift overlay
            c, d = ap[x,y], bp[x,y]
            brightness = max(max(c),max(d))
            change = sum(abs(c[i]-d[i]) for i in range(3)) / 3
            # Dim scene; avoid counting insignificant noise, dark gradients.
            if brightness < 34 or change < 23: continue
            col = min(5, int(6*x/w)); row = min(3, int(4*y/h))
            cells[row][col] += min(80, change)
            n += 1
    total = sum(map(sum,cells))
    if total < 320 or n < 6:
        return {'available': True, 'candidate':None,'confidence':0.0,'movingPixels':n,
                'reason':'insufficient visible change', 'grid':[[int(v) for v in row] for row in cells]}
    # Pick the strongest window, not a target identity. The Guide and ambient effects
    # may also move; a high score is not proof of eligible packet presence.
    best = max(((cells[r][c],r,c) for r in range(4) for c in range(6)),key=lambda x:x[0])
    strength,r,c = best
    confidence = round(strength/total,3)
    return {'available':True,'candidate':{'x01':round((c+0.5)/6,3),
             'y01':round((r+0.5)/4,3),'gridCell':[r,c]},
            'confidence':confidence,'movingPixels':n,
            'reason':'unclassified screen motion; NOT a packet or clean/scar classification',
            'grid':[[int(v) for v in row] for row in cells]}


def cue_to_camera_key(cue, deadzone=.14):
    """Return one ordinary camera key aiming toward an unclassified motion patch."""
    if not cue or not cue.get('available') or not cue.get('candidate'):
        return None
    x = cue['candidate']['x01']-.5; y=cue['candidate']['y01']-.5
    if max(abs(x),abs(y)) < deadzone: return None
    if abs(x) >= abs(y): return 'l' if x>0 else 'j'
    return 'k' if y>0 else 'i'
