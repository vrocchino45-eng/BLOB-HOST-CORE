#!/usr/bin/env python3
"""G1-D8 offline policy, motion proxy and independent owner-referee tests."""
from __future__ import annotations
import inspect,io,json,pathlib,tempfile
from PIL import Image,ImageDraw
from bot1d8_motion import patch_flow,response
from bot1d8_policy import Steering,COURSE
from analyze_bot1d8 import judge,movement_truth
import bot1d8_browser as runner
import bot1d8_policy as policy


def png(offset=0,hud=0,scene=True):
    img=Image.new('RGB',(1280,720),(11,12,21));d=ImageDraw.Draw(img)
    d.rectangle((0,0,300,155),fill=(240,30,80) if hud else (40,42,54))
    if scene:
        for i in range(9):
            x=365+i*89+offset
            d.ellipse((x,280+(i%3)*55,x+35,320+(i%3)*55),fill=(20+i*20,130,160))
        d.rectangle((455+offset,455,900+offset,512),fill=(190,180,60))
    output=io.BytesIO();img.save(output,format='PNG');return output.getvalue()


def run():
    count=0
    def ok(x,why):
        nonlocal count
        if not x:raise AssertionError(why)
        count+=1
    a=png();b=png();move=png(offset=70);hud_changed=png(hud=1)
    aa=patch_flow(a,b);bb=patch_flow(a,move)
    ok(aa['medianMotionPixels']==0,'Static flow zero')
    ok(aa['trackedPatches']>=0,'Static tracker shape')
    ok(isinstance(bb['trackedPatches'],int),'Tracked count')
    ok(bb['medianMotionPixels']>=0,'Nonnegative flow')
    ok(len(bb['medianVector'])==2,'Motion vector')
    ok(bb['flowSpreadPixels']>=0,'Flow spread')
    r=response(a,move,a,b,action_kind='move')
    ok(r['actionKind']=='move','Movement labelled')
    ok(r['appearanceDelta']>0,'Image change visible')
    ok(r['ambientAppearanceDelta']==0,'Idle baseline')
    ok(r['worldDisplacementProven'] is False,'No fake world motion')
    ok(r['boundaryPressureKnownOnline'] is False,'No online pressure')
    ok(r['FoldDirectionKnown'] is False,'No target inference')
    ok(r['cameraKeyDuringMove'] is False,'No simultaneous look')
    ok(isinstance(r['imageMotionAboveAmbient'],bool),'Motion threshold classified')
    ok(response(a,b,a,b,action_kind='move')['imageMotionAboveAmbient'] is False,'Idle no motion')
    ok(response(a,hud_changed,a,b,action_kind='move')['appearanceDelta']==0,'HUD masked')
    ok(response(a,a,a,b,[__import__('bot1d7_vision').describe(a)],'move')['sceneRevisited'],'Recognize revisited scene')
    try:response(a,b,a,b,action_kind='teleport')
    except ValueError:ok(True,'Unknown action rejected')
    else:raise AssertionError('bad action')
    s=Steering();ok(s.choose()[1]=='s','Initial backing out')
    ok(s.choose()[3]=='initial_reverse_clearance_probe','Start rationale')
    ok(len(COURSE)>=10,'Balanced course')
    ok(any(x[1]=='j' for x in COURSE),'Left camera turn')
    ok(any(x[1]=='l' for x in COURSE),'Right camera turn')
    ok(any(x[1]=='a' for x in COURSE),'Lateral left')
    ok(any(x[1]=='d' for x in COURSE),'Lateral right')
    ok(any(x[1]=='w' for x in COURSE),'Forward')
    ok(any(x[1]=='s' for x in COURSE),'Reverse')
    s.observe(s.choose(),r);ok(s.step==1,'State advances')
    s.poor_motion=2;choice=s.choose()
    ok(choice[1]=='s','Weak-response retreat')
    ok('not_boundary_proof' in choice[3],'No false boundary certainty')
    ok(s.recovery_count==1,'Recovery counted')
    s.observe(choice,r)
    s.revisit_streak=3;choice=s.choose()
    ok(choice[0]=='look','Revisit causes look-only reframe')
    ok(choice[1]=='l','Alternating reframe first after existing recovery')
    ok(s.recovery_count==2,'Revisit recovery counted')
    ok(s.summary()['onlineBoundaryPressureObserved'] is False,'No owner pressure used')
    ok(s.summary()['goalDirectionKnown'] is False,'No target assumed')
    ok('getSession(' not in inspect.getsource(policy),'No owner API in steering')
    ok('getSession(' not in inspect.getsource(__import__('bot1d8_motion')),'No owner API in motion')
    ok(inspect.getsource(runner).count('window.BLOB_TELEMETRY')==1,'Only recorder-ready check')
    ok('checkpoint(' in inspect.getsource(runner),'Checkpoints retained')
    ok('response(' in inspect.getsource(runner),'Visual motion used')
    ok('Steering(' in inspect.getsource(runner),'Steering used')
    ok('action_for_step(' in inspect.getsource(runner),'Nursery baseline retained')
    ok('stage(h)' in inspect.getsource(runner),'Public HUD stage read')
    # Synthetic owner referee MUST stay offline.
    rec={'captureStartedAt':'2026-10-29T02:00:00Z','captureActive':False,
         'events':[
         {'time':'2026-10-29T02:00:02Z','type':'bot1d-listening-fold-owner-state',
          'state':{'foldAvailable':True,'stageIndex':0,'stage':'approach_listening_fold','focusDistance':6.0}},
         {'time':'2026-10-29T02:00:03Z','type':'c0d4-mob1-movement-sample',
          'owner':{'motion':{'boundaryPressure':.12,'c0e2bNormalizedBoundaryDistance':1,
                     'position':{'x':2,'y':0,'z':0}},'attachment':{'active':False}}},
         {'time':'2026-10-29T02:00:05Z','type':'c0d4-mob1-movement-sample',
          'owner':{'motion':{'boundaryPressure':0,'c0e2bNormalizedBoundaryDistance':.5,
                     'position':{'x':0,'y':0,'z':0}},'attachment':{'active':False}}}]}
    truth=movement_truth(rec)
    ok(truth['postInvitationMovementSamples']==2,'Owner samples after invitation')
    ok(truth['ownerAtBoundaryWithPressureSamples']==1,'Detect pressure')
    ok(truth['ownerBoundaryRatio']==.5,'Ratio')
    ok(truth['sampledStartEndDistance']==2,'Signed displacement vector distance')
    ok(truth['sampledCumulativeDistance']==2,'Cumulative distance')
    ok(truth['minimumNormalizedBoundaryDistance']==.5,'Boundary escape observed')
    ok(truth['postInvitationAttachedSamples']==0,'No attached')
    with tempfile.TemporaryDirectory() as temp:
        folder=pathlib.Path(temp)/'BOT1D8_fake_motion_s11';folder.mkdir()
        (folder/'REC1.json').write_text(json.dumps(rec),encoding='utf8')
        (folder/'RUN.json').write_text(json.dumps({'status':'CAPTURED',
          'movementProbes':[{'op':'move','key':'s','visual':r},
                            {'op':'look','key':'j','visual':{}},
                            {'op':'move','key':'w','visual':r}],
          'checkpoints':[],'steering':{'recoveryCount':1}}),encoding='utf8')
        result=judge(folder)
        ok(result['status']=='INVITED_NO_FOLD_STAGE','No fabricated stage')
        ok(result['acceptance']=='NOT_PASSED','Invitation fails gate')
        ok(result['motionProbeCount']==2,'Separate movement probes')
        ok(result['cameraOnlyProbeCount']==1,'Separate camera probes')
        ok(result['recoveryCount']==1,'Recovery traced')
        ok(result['ownerMotion']['ownerAtBoundaryWithPressureSamples']==1,'Independent truth joined')
        ok(result['gameplayChanged'] is False,'Game frozen')
    return {'pass':'BOT1-D8','assertions':count,'status':'OFFLINE_MOTION_POLICY_AND_OWNER_REFEREE_PASS',
       'limitations':'Synthetic fixtures only; does not prove camera relative accuracy or Fold progress in BLOB.'}

if __name__=='__main__':print(json.dumps(run(),indent=2))
