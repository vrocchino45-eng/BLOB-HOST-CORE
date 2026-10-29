#!/usr/bin/env python3
"""BOT1-D4 offline policy and adjudication fixtures. NOT a game run."""
from __future__ import annotations
import json,pathlib,tempfile
from bot1d4_policy import visible_stage, fold_action,policy_inputs_are_public
from analyze_bot1d4 import evaluate

def main():
    checks=0
    def ok(cond,label):
        nonlocal checks
        assert cond,label;checks+=1
    phrase={
        'Fold invitation':('Follow the Watcher\'s turn toward the Listening Fold','fold_search'),
        'approach':('Move through the nursery and follow reactions toward the deeper listening fold.','fold_search'),
        'observation':('Press X once to pulse-read the fold. Q stabilize','fold_pulse'),
        'hold':('Hold LT to stabilize the resonance. This is not absorption.','hold'),
        'watch':('Keep still and watch the response pass through the membrane.','watch'),
        'release':('Release LT and remain nearby until the fold becomes calm.','release'),
        'complete':('The safe seed is now readable.','complete_message'),
        'packet':('Pulse the moving matter. Q stabilize legend','packet')}
    for name,(src,expected) in phrase.items():ok(visible_stage(src)==expected,name)
    ok(fold_action('hold','lanes',0,11)[:2]==('hold','q'),'Hold uses Q')
    ok(fold_action('fold_pulse','lanes',0,11)[0]=='pulse','Fold Pulse')
    ok(fold_action('release','lanes',0,11)[0]=='observe','Release no held key')
    ok(fold_action('watch','lanes',0,11)[0]=='observe','Watch not extra Pulse')
    for profile in ('lanes','lobes'):
        actions=[fold_action('fold_search',profile,i,11) for i in range(35)]
        keys={a[1] for a in actions if a[0]=='move'}
        ok({'w','a','s','d'}.issubset(keys),profile+' covers 4 movement directions')
        ok(sum(a[0]=='look' for a in actions)<len(actions)/4,profile+' limits camera turns')
        ok(not any(a[0] in ('pulse','hold') for a in actions),profile+' no Pulse spam during search')
    ok('owner coordinates' not in ' '.join(policy_inputs_are_public()).lower(),'No owner position in public policy')
    with tempfile.TemporaryDirectory() as tmp:
        root=pathlib.Path(tmp)/'BOT1D4_fixture_lanes_s11';root.mkdir()
        (root/'RUN.json').write_text(json.dumps({'status':'CAPTURED','profile':'lanes','seed':11,
            'actions':[{'op':'visible_invitation'},{'phase':'fold','op':'move','key':'a'}],'errors':[]}))
        rec={'captureDurationSeconds':60,'summary':{'captureRetention':{'droppedDetails':0}},'events':[
           {'type':'game-pulse-event','pulseEventId':1},
           {'type':'bot1c-watcher-pulse-owner-result','witness':{'pulseEventId':1,'packetPulseReadAccepted':True}},
           {'type':'bot1c-watcher-owner-state-change','state':{'foldInvitation':True}},
           {'type':'guide0-core-guide-state','state':{'guide':{'lastReaction':'guide_waited_for_world_response'}}},
           {'type':'bot1d-listening-fold-owner-state','state':{'active':True,'foldAvailable':True,'nurseryFoldInvitation':True,
                  'stageIndex':0,'focusDistance':4.7,'inApproach':False,'focusReady':False,'completed':False}},
           {'type':'bot1d-listening-fold-owner-state','state':{'active':True,'foldAvailable':True,'nurseryFoldInvitation':True,
                  'stageIndex':0,'focusDistance':2.4,'inApproach':False,'focusReady':False,'completed':False}}
        ]}
        (root/'REC1.json').write_text(json.dumps(rec))
        r=evaluate(root)
        ok(r['ownerInvitation'] and r['maxOwnerStageIndex']==0,'Invitation no Fold completion')
        ok(not r['ownerApproachWitnessed'] and not r['ownerCompleted'],'Near does not mean accepted')
        ok(r['closestFoldDistance']==2.4,'Distance retained only in independent verdict')
        rec['events'].append({'type':'bot1d-listening-fold-owner-state','state':{'active':True,'foldAvailable':True,
                   'nurseryFoldInvitation':True,'stageIndex':2,'stage':'sustain_first_resonance','focusDistance':2.1,
                   'inApproach':True,'focusReady':True,'completed':False}})
        (root/'REC1.json').write_text(json.dumps(rec))
        r=evaluate(root)
        ok(r['maxOwnerStageIndex']==2 and r['ownerApproachWitnessed'] and not r['ownerCompleted'],
           'Owner partial stage accepted without claiming completion')
        rec['events'].append({'type':'bot1d-listening-fold-owner-state','state':{'active':True,'foldAvailable':True,
                   'nurseryFoldInvitation':True,'stageIndex':5,'stage':'surface_wake_complete','focusDistance':2.1,
                   'inApproach':True,'focusReady':True,'completed':True}})
        (root/'REC1.json').write_text(json.dumps(rec));r=evaluate(root)
        ok(r['ownerCompleted'] and r['maxOwnerStageIndex']==5,'Owner completion accepted')
    print(json.dumps({'pass':'BOT1-D4','assertions':checks,
          'result':'OFFLINE_HUD_POLICY_AND_OWNER_VERDICT_PASS',
          'limitations':'No 3D browser gameplay run; no movement/Guide efficacy proven'},indent=2))

if __name__=='__main__':main()
