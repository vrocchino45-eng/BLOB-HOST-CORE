#!/usr/bin/env python3
"""BOT1-D3 source/runtime compatibility preflight: read-only, no game mutation."""
from __future__ import annotations
import argparse, pathlib, sys, json

REQUIRED={
 'src/input/ControlMap.js':['KeyI','KeyJ','KeyK','KeyL'],
 'src/opening/SurfaceWakeGameplaySystem.js':['packetReadRange','packetPulseRead'],
 'src/debug/WorldObjectCensusSystem.js':['bot1c-watcher-pulse-owner-result',
             'guide0-core-guide-state','guide0-pulse-owner-pair','bot1d-listening-fold-owner-state'],
 'src/ui/PlaytestHudSystem.js':['playtest-hud-panel']}

def check(root):
    entries=[]
    for path,needles in REQUIRED.items():
        f=root/path
        if not f.exists():entries.append({'file':path,'status':'MISSING'});continue
        txt=f.read_text(encoding='utf-8-sig')
        absent=[n for n in needles if n not in txt]
        entries.append({'file':path,'status':'PASS' if not absent else 'DIFFERENT',
                        'requiredTokensAbsent':absent})
    return entries

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--project',default='.')
    a=p.parse_args();results=check(pathlib.Path(a.project))
    print(json.dumps({'pass':'BOT1-D3','result':'READY' if all(x['status']=='PASS' for x in results) else 'STOP_SOURCE_MISMATCH',
                      'checks':results},indent=2))
    sys.exit(0 if all(x['status']=='PASS' for x in results) else 2)
