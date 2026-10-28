#!/usr/bin/env python3
"""Offline BOT1-D3 fixture verification (no real BLOB game executed)."""
from __future__ import annotations
import io, pathlib, tempfile, json
from PIL import Image, ImageDraw
from bot1d3_browser import interpret, action_for_step
from bot1d3_motion import motion_observation, cue_to_camera_key
from analyze_bot1d3 import evaluate

def png(img):
    o=io.BytesIO();img.save(o,'PNG');return o.getvalue()
def main():
    checks=0
    def ok(cond,msg):
        nonlocal checks
        assert cond,msg
        checks+=1
    ok(interpret('BLOB / Pulse the moving matter. Q stabilize legend')=='packet_instruction','objective before legend')
    ok(interpret('Follow the Watcher\'s turn toward the Listening Fold')=='fold_invitation','Fold invitation')
    ok(interpret('Observe the next matter cycle.')=='wait_for_packet','waiting')
    a=Image.new('RGB',(1280,720),(7,8,13));b=a.copy()
    ImageDraw.Draw(b).ellipse([940,245,1010,315],fill=(210,150,60))
    cue=motion_observation(png(a),png(b))
    ok(cue['available'] and cue['candidate'] is not None,'visual cue from screenshot pixels')
    ok(cue_to_camera_key(cue)=='l','use ordinary IJKL rightward camera')
    ok(action_for_step('motion',0,'packet_instruction',cue,11,False)[:2]==('look','l'),'profile reacts to rendered cue')
    ok(action_for_step('sweep',0,'packet_instruction',cue,11,False)[0]=='pulse','sweep initiates Pulse')
    ok(action_for_step('motion',8,'packet_instruction',None,11,False)[0]=='pulse','fallback Pulse without hidden owner')
    ok(action_for_step('idle',1,'packet_instruction',cue,11,False)[0]=='observe','control observer')
    with tempfile.TemporaryDirectory() as t:
        root=pathlib.Path(t)/'BOT1D3_fixture_s11';root.mkdir()
        run={'status':'CAPTURED','profile':'sweep','seed':11,'actions':[{'op':'pulse'}], 'errors':[]}
        events=[
         {'type':'game-pulse-event','pulseEventId':11},
         {'type':'bot1c-watcher-pulse-owner-result','witness':{'pulseEventId':11,'packetDistance':3.455,'readRange':3.4,'packetPulseReadAccepted':False,'reason':'packet_out_of_read_range'}},
         {'type':'guide0-pulse-owner-pair','pulseEventId':11,'guide':{'present':True}},
         {'type':'guide0-core-guide-state','state':{'guide':{'state':'answering_player_pulse','lastReaction':'guide_waited_for_world_response'}}},
         {'type':'bot1d-listening-fold-owner-state','state':{'active':True,'stageIndex':0,'completed':False,'nurseryFoldInvitation':False}},
        ]
        rec={'captureDurationSeconds':25,'events':events,'summary':{'captureRetention':{'droppedDetails':0}}}
        (root/'RUN.json').write_text(json.dumps(run));(root/'REC1.json').write_text(json.dumps(rec))
        d=evaluate(root)
        ok(d['ownerAccepted']==0 and d['nearMissesWithinHalfUnit']==1,'near miss not counted as accepted')
        ok(d['actualGuideWitness']['pulsePairs']==1 and d['actualGuideWitness']['ownerAcceptedReads']==0,'guide reaction separate from owner acceptance')
        ok(d['maxFoldStageIndex']==0 and not d['foldComplete'],'owner Fold grading')
        events[1]['witness'].update({'packetDistance':3.07,'packetPulseReadAccepted':True,'reason':'packet_read_accepted'})
        rec['events']=events;(root/'REC1.json').write_text(json.dumps(rec))
        d=evaluate(root)
        ok(d['ownerAccepted']==1 and d['nearMissesWithinHalfUnit']==0,'accepted owner read distinguished')
        ok(not d['ownerFoldInvitation'],'accepted reading alone does not grant invitation')
    print(json.dumps({'pass':'BOT1-D3-FIXTURE','assertions':checks,'result':'OFFLINE_POLICY_AND_REFEREE_PASS',
                      'limitation':'synthetic test; browser gameplay not run'},indent=2))
if __name__=='__main__': main()
