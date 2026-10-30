#!/usr/bin/env python3
"""Offline fixtures for BOT1-D9; no live game required.

Tests calibration schema, screen limits, sparse owner matching, gate logic,
source hygiene, and syntax of the browser. Counts each assertion explicitly.
"""
from __future__ import annotations
import ast,datetime,io,json,pathlib,sys,unittest
from PIL import Image,ImageDraw
from bot1d9_calibration import Trial,course,classify,landmark_return,online_signal_summary
from analyze_bot1d9 import owner_samples,match_owner_window,verdict,timestamp

PATH=pathlib.Path(__file__).parent
EPOCH=datetime.datetime(2026,10,28,tzinfo=datetime.timezone.utc)
def iso(sec):return (EPOCH+datetime.timedelta(seconds=sec)).isoformat().replace('+00:00','Z')
def frame(dx=0):
    im=Image.new('RGB',(1280,720),(6,10,20));d=ImageDraw.Draw(im)
    for i in range(14):
        x=250+i*52+dx
        d.rectangle((x,145+(i%3)*35,x+11,315+(i%3)*35),fill=(26,180,170))
    buf=io.BytesIO();im.save(buf,format='PNG');return buf.getvalue()
def sample(t,x,y=0,z=0,b=.1,p=0):
    return {'time':iso(t),'type':'c0d4-mob1-movement-sample',
            'owner':{'motion':{'position':{'x':x,'y':y,'z':z},'speed':abs(x),
                     'boundaryPressure':p,'c0e2bNormalizedBoundaryDistance':b},
                     'attachment':{'active':False}}}

class Checks(unittest.TestCase):
    count=0
    def ok(self,c):Checks.count+=1;self.assertTrue(c)
    def test_course(self):
        c=course()
        self.ok(len(c)==16)
        self.ok([x.heading for x in c if x.kind=='move']==['center']*4+['left']*4+['right']*4)
        self.ok([x.key for x in c if x.kind=='move']==['w','s','a','d']*3)
        self.ok([x.key for x in c if x.kind=='look']==['j','l','l','j'])
        self.ok(all(x.duration>=1.3 for x in c if x.kind=='move'))
        self.ok(all(x.kind in ('look','move') for x in c))
        self.ok(all(x.label for x in c))
        self.ok(len({x.label for x in c})>=8)
        self.ok(all(x.duration<=1.35 for x in c))
        self.ok(all(x.key in ('w','s','a','d') for x in c if x.kind=='move'))
    def test_image_evidence(self):
        a=frame(0);b=frame(5)
        q=classify(None,a,a,a,b,'move')
        self.ok(q['actualTranslationKnownOnline'] is False)
        self.ok(q['cameraRotationMeasured'] is False)
        self.ok(q['FoldBearingKnown'] is False)
        self.ok(q['semanticLandmarkKnown'] is False)
        self.ok(q['visual']['worldDisplacementProven'] is False)
        self.ok(q['visual']['FoldDirectionKnown'] is False)
        self.ok(q['visual']['actionKind']=='move')
        self.ok(isinstance(q['appearanceDelta'],(int,float)))
        c=landmark_return(a,a,a,a)
        self.ok(c['descriptorSimilar'] is True)
        self.ok(c['landmarkIdentityConfirmed'] is False)
        self.ok(c['positionReturnConfirmed'] is False)
        self.ok(c['appearanceDistance']==0)
        summary=online_signal_summary([{'kind':'move','signal':{'visual':{'imageMotionAboveAmbient':True}}},
            {'kind':'look','signal':{'visual':{'imageMotionAboveAmbient':False}}}])
        self.ok(summary['translationProbeCount']==1)
        self.ok(summary['lookOnlyProbeCount']==1)
        self.ok(summary['translationScreenMotionAboveAmbient']==1)
        self.ok(summary['lookScreenMotionAboveAmbient']==0)
        self.ok(summary['onlineWorldDisplacementProven'] is False)
    def test_owner_brackets(self):
        r={'events':[sample(1,1),sample(2,2),sample(3,5),sample(4,5.3)]}
        ss=owner_samples(r)
        self.ok(len(ss)==4)
        self.ok(ss[0]['xyz']==(1,0,0))
        self.ok(ss[0]['attachment'] is False)
        p={'atStart':iso(2.25),'atEnd':iso(2.75)}
        m=match_owner_window(p,ss)
        self.ok(m['coverage']=='BRACKETED_SPARSE_OWNER')
        self.ok(m['worldPositionDeltaAcrossBracket']==3)
        self.ok(m['ownerSampleIntervalSeconds']==1)
        self.ok(m['possibleEnvironmentalDrift'])
        self.ok('limitation' in m)
        self.ok(match_owner_window({'atStart':iso(20),'atEnd':iso(21)},ss)['coverage']=='UNKNOWN_NO_BRACKET')
        self.ok(match_owner_window({'atStart':iso(8),'atEnd':iso(7)},ss)['coverage']=='UNKNOWN_TIMING')
        self.ok(match_owner_window({'atStart':'nope','atEnd':iso(3)},ss)['coverage']=='UNKNOWN_TIMING')
        self.ok(timestamp(iso(1))==EPOCH.timestamp()+1)
        self.ok(timestamp(None) is None)
        self.ok(owner_samples({'events':[{'type':'not-movement'},{'type':'c0d4-mob1-movement-sample','owner':{}}]})==[])
    def test_referee_gate(self):
        # Owner Fold invitation is authentic, but no approach; trial set incomplete.
        rec={'captureStartedAt':iso(0),'events':[
           {'type':'bot1d-listening-fold-owner-state','time':iso(1),
            'state':{'foldAvailable':True,'stageIndex':0,'focusDistance':9}},
           sample(1,0),sample(2,1)]}
        result=verdict(rec,{'status':'CAPTURED','probes':[],'onlineSummary':{}},False)
        self.ok(result['gateA']=='INCOMPLETE_CALIBRATION_COURSE')
        self.ok(result['gateB']=='NOT_TESTED_AS_ROUTE')
        self.ok(result['gateC']=='NOT_PASSED')
        self.ok(result['invitationSeconds']==1)
        self.ok(result['maxFoldStageIndex']==0)
        self.ok(result['calibrationComplete'] is False)
        self.ok(result['probeCount']==0)
        rec['events'].append({'type':'bot1d-listening-fold-owner-state','time':iso(4),
            'state':{'foldAvailable':True,'stageIndex':1,'inApproach':True}})
        after=verdict(rec,{'status':'CAPTURED','probes':[]},False)
        self.ok(after['gateC']=='PASS')
        self.ok(after['maxFoldStageIndex']>=1)
    def test_source_hygiene(self):
        # Verify the ON-LINE modules cannot directly import analysis/REC1.
        for name in ('bot1d9_calibration.py','bot1d9_browser.py'):
            src=(PATH/name).read_text(encoding='utf-8')
            tree=ast.parse(src)
            imports=[]
            for n in ast.walk(tree):
                if isinstance(n,ast.ImportFrom):imports.append(n.module or '')
                if isinstance(n,ast.Import):imports.extend(x.name for x in n.names)
            self.ok(not any(x.startswith('analyze') for x in imports))
            self.ok('bot1d9' in name)
            self.ok('owner_samples' not in imports)
        self.ok('calibration' in (PATH/'bot1d9_browser.py').read_text().lower())
        for name in ('bot1d9_browser.py','bot1d9_calibration.py','analyze_bot1d9.py'):
            compile((PATH/name).read_text(encoding='utf-8'),name,'exec')
            self.ok(True)

if __name__=='__main__':
    suite=unittest.defaultTestLoader.loadTestsFromTestCase(Checks)
    result=unittest.TextTestRunner(verbosity=1).run(suite)
    # Test suite increments counter only on successful assertions (fail fast per test).
    print(json.dumps({'pass':'BOT1-D9','result':'OFFLINE_CALIBRATION_POLICY_PASS' if result.wasSuccessful() else 'FAIL',
                      'assertions':Checks.count,'realGameplayRunProven':False}))
    raise SystemExit(0 if result.wasSuccessful() else 1)
