#!/usr/bin/env python3
"""Offline BOT1-D5 policy, pixel and owner-referee tests; NOT a game playtest."""
from __future__ import annotations
import io,json,pathlib,sys,tempfile
from PIL import Image
from bot1d5_policy import screen_difference,weak_visual_change,next_probe,public_inputs
from analyze_bot1d5 import classify_movement,evaluate,render

checks=0
def ok(test,note):
    global checks;assert test,note;checks+=1

def image(color):
    img=Image.new('RGB',(1280,720),color)
    s=io.BytesIO();img.save(s,format='PNG');return s.getvalue()

black=image('black');white=image('white')
ok(screen_difference(black,black)==0,'static identical pixels')
ok(screen_difference(black,white)>.9,'changed scene')
ok(weak_visual_change(0,.002),'weak change with animated background')
ok(not weak_visual_change(.20,.002),'obvious screen difference')
ok(weak_visual_change(.1,.1),'animated background can defeat heuristic')
ok('REC1' not in public_inputs(),'no recorder policy')
ok('visible HUD' in public_inputs(),'visible policy')
for i in range(18):
    op,key,dur,why=next_probe(i,0,11)
    ok(op in ('move','look') and key in 'wadsjl' and dur>0,'key plan')
ok(next_probe(2,2,11)[3]=='visual_weak_change_recovery_probe','recovery triggered')
ok(next_probe(2,1,11)[3]!='visual_weak_change_recovery_probe','not premature recovery')

events=[]
def mv(t,attached,mode,speed,fwd):
    return {'type':'c0d4-mob1-movement-sample','time':t,
      'owner':{'attachment':{'active':attached,'surfaceId':'S1' if attached else 'none'},
               'motion':{'locomotionMode':mode,'speed':speed}},'forwardSpeed':fwd}
events.extend([mv('2026-10-28T20:01:00Z',False,'normal',2,.5),
               mv('2026-10-28T20:02:00Z',True,'surface_tendril_pull',.1,-.2),
               mv('2026-10-28T20:03:00Z',False,'normal',3,1)])
m=classify_movement(events)
ok(m['total']==3,'all movement samples')
ok(m['attachedSamples']==1,'attached')
ok(m['freeSamples']==2,'free')
ok(m['medianSpeedAttached']==.1,'attached speed')
ok(m['medianSpeedFree']==2.5,'free speed median')
n=classify_movement(events,'2026-10-28T20:02:00Z')
ok(n['total']==2,'timestamp cut')
ok(n['attachedSamples']==1,'post-cut attached')
ok(n['freeSamples']==1,'post-cut free')
ok(classify_movement([])['total']==0,'empty safe')
with tempfile.TemporaryDirectory() as td:
    f=pathlib.Path(td)/'BOT1D5_fixture_probe_s11';f.mkdir()
    run={'status':'CAPTURED','profile':'probe','seed':11,'actions':[
         {'phase':'fold','op':'move','weakVisualChange':True},
         {'phase':'fold','op':'move','weakVisualChange':False}], 'errors':[]}
    rec={'captureDurationSeconds':50,'summary':{'captureRetention':{'droppedDetails':0}},
         'events':[
         {'type':'bot1d-listening-fold-owner-state','time':'2026-10-28T20:02:00Z','state':{'active':True,'foldAvailable':True,'nurseryFoldInvitation':True,'stageIndex':0,'inApproach':False,'focusReady':False,'focusDistance':4.2,'completed':False}},
         mv('2026-10-28T20:02:20Z',True,'surface_tendril_pull',.1,-.2),
         {'type':'c0d4-mob1-sustained-low-progress','time':'2026-10-28T20:02:21Z','owner':{'attachment':{'surfaceId':'S1'}}},
         {'type':'guide0-core-guide-state','state':{'guide':{'lastReaction':'guide_waited_for_world_response'}}},
         {'type':'game-pulse-event','pulseEventId':1},
         {'type':'bot1c-watcher-pulse-owner-result','witness':{'packetPulseReadAccepted':True}}
         ]}
    (f/'RUN.json').write_text(json.dumps(run))
    (f/'REC1.json').write_text(json.dumps(rec))
    r=evaluate(f)
    ok(r['status']=='CAPTURED','read run')
    ok(r['ownerInvitation'] is True,'invitation owner')
    ok(r['ownerApproachWitnessed'] is False,'never infer approach from distance')
    ok(r['botWeakVisualMovementProbes']==1,'weak visual count')
    ok(r['movementAfterInvitation']['attachedSamples']==1,'attachment referee')
    ok(r['lowProgressWarningsAfterInvitation']==1,'stalled event')
    ok(r['warningSurfaceIds']['S1']==1,'surface provenance')
    ok('owner movement' in render([r]).lower(),'report rubric')
print(json.dumps({'pass':'BOT1-D5','result':'OFFLINE_POLICY_AND_REPLAY_REFEREE_PASS',
    'assertions':checks,'limitation':'Synthetic fixtures and optional REC1 replay; NO real BOT1-D5 browser navigation proven'},indent=2))
