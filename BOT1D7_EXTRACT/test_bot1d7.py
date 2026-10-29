#!/usr/bin/env python3
"""G1-D7 OFFLINE tests: image descriptors, public-only policy, independent referee."""
from __future__ import annotations
import inspect,io,json,pathlib,tempfile
from PIL import Image,ImageDraw
import bot1d7_vision as v
import bot1d7_browser as runner
from analyze_bot1d7 import judge


def new_frame(offset=0,color=(26,170,162),hud='HUD'):
    im=Image.new('RGB',(1280,720),(8,8,20));d=ImageDraw.Draw(im)
    # HUD color changes must not be treated as new world direction.
    d.rectangle((0,0,308,155),fill=(22,27,34) if hud=='HUD' else (150,10,55))
    d.ellipse((550+offset,330,780+offset,600),fill=color)
    d.rectangle((870,350,970,530),fill=(204,91,55))
    out=io.BytesIO();im.save(out,format='PNG');return out.getvalue()


def run():
    n=0
    def check(condition,reason):
        nonlocal n
        if not condition:raise AssertionError(reason)
        n+=1
    frame=new_frame();same=new_frame(hud='ALTERNATE');shift=new_frame(110)
    a=v.describe(frame);b=v.describe(same);c=v.describe(shift)
    check(len(a['descriptor'])==48,'Descriptor dimensions')
    check(len(a['candidates'])>0,'Find cyan candidate')
    check(a['confidence']=='CANDIDATES_ONLY_NO_FOLD_IDENTITY','No target claim')
    check('not_fold' in a['candidates'][0]['label'],'Candidate explicitly unidentified')
    check(a['candidates'][0]['areaPixels']>=9,'Minimum blob size')
    check(a['candidates'][0]['screenX']>0.2,'World location detected')
    check(a['frameSize']==[112,64],'Frame normalization')
    check(v.difference(a,b)==0,'HUD masking')
    check(v.difference(a,a)==0,'Same frame identical')
    check(v.difference(a,c)>.001,'Shift changes spatial appearance')
    check(v.difference(c,a)==v.difference(a,c),'Novelty symmetric')
    check(v.classify_progress(a,c,0)['appearanceDelta']>0,'Delta reported')
    check(not v.classify_progress(a,c,0)['worldDisplacementProven'],'No fake displacement')
    check(not v.classify_progress(a,c,0)['FoldApproachProven'],'No fake Fold approach')
    check(not v.classify_progress(a,b,0)['visualChangeAboveAmbient'],'No fake motion')
    sample={'left':c,'center':a,'right':b}
    d=v.choose(sample,[a],None)
    check(d['selected']=='left','Fresh camera view preferred')
    check(d['goalDirectionKnown'] is False,'No target direction claim')
    check('novelty' in d['basis'],'Public evidence basis')
    check(isinstance(d['ambiguous'],bool),'Ambiguity recorded')
    check(set(d['scores'])=={'left','center','right'},'Scores traceable')
    check(v.choose({'left':a,'center':a,'right':a},[a],'right')['selected']=='right','Maintain heading on ambiguity')
    check(v.choose({'left':a,'center':a,'right':a},[a],'right')['ambiguous'],'Ambiguous same views')
    try:v.choose({'left':a,'right':b},[],None)
    except ValueError:check(True,'Missing center rejected')
    else:raise AssertionError('Must reject missing camera view')
    check('getSession(' not in inspect.getsource(v),'No telemetry in online vision')
    check(inspect.getsource(runner).count('window.BLOB_TELEMETRY')==1,'Only recorder readiness check permitted')
    check('getSession ===' in inspect.getsource(runner),'Wait for recorder readiness only')
    check('action_for_step' in inspect.getsource(runner),'Nursery baseline frozen')
    check('checkpoint(' in inspect.getsource(runner),'Recorder checkpoints retained')
    check('choose(' in inspect.getsource(runner),'Vision chooser used')
    check('move' in inspect.getsource(runner),'Real movement action')
    from bot1d6_policy import stage
    check(stage('Follow the opening membrane. Y inspects the Core')=='fold_search','Stage parsing preserved')
    check(stage('Hold LT to stabilize. Y inspects the Core')=='fold_hold','Fold hold parsed')
    check(stage('Release LT and remain nearby. Y inspects the Core')=='fold_release','Release parsed')
    with tempfile.TemporaryDirectory() as tmp:
        base=pathlib.Path(tmp);d=base/'BOT1D7_fake_visual_s11';d.mkdir()
        rec={'captureStartedAt':'2026-10-29T02:00:00Z','captureActive':False,
             'events':[{'time':'2026-10-29T02:00:09Z','type':'bot1d-listening-fold-owner-state',
                 'state':{'foldAvailable':True,'stage':'approach_listening_fold','stageIndex':0,
                          'completed':False,'focusDistance':7.1}}]}
        (d/'REC1.json').write_text(json.dumps(rec),encoding='utf8')
        (d/'RUN.json').write_text(json.dumps({'surveys':[{'initialCandidates':[{'areaPixels':90}],
                         'ambiguous':True,'chosenHeading':'left','movement':{'visualChangeAboveAmbient':True}}],
                         'checkpoints':[]}),encoding='utf8')
        j=judge(d)
        check(j['status']=='INVITED_NO_FOLD_STAGE','Invitation not folded success')
        check(j['visualSurveys']==1,'Survey count')
        check(j['candidateFrames']==1,'Candidate count')
        check(j['ambiguousSurveys']==1,'Ambiguity count')
        check(j['appearanceChangedAboveAmbient']==1,'Visual change count')
        check(not j['ownerCertifiedFoldComplete'],'No inferred completion')
        check(j['minimumOwnerFocusDistanceWhenAvailable']==7.1,'Ground truth offline only')
        check(j['chosenHeadingCounts']=={'left':1},'Heading accountability')
        check(j['gameplayChanged'] is False,'Gameplay frozen')
    return {'pass':'BOT1-D7','assertions':n,'status':'OFFLINE_PUBLIC_VISION_AND_REFEREE_PASS',
        'limitations':'Synthetic descriptor fixtures and independent saved D6 screenshots; real BLOB Chrome navigation not proven.'}

if __name__=='__main__':print(json.dumps(run(),indent=2))
