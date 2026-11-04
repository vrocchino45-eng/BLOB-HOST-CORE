#!/usr/bin/env python3
"""BLOB Guide Signal Language v0 -- pure event-to-expression simulator.

Does NOT connect to a game runtime, play audio, move anything, or claim
subjective intelligence. Rhythm, light and movement share semantic meaning;
only presentation personality changes. No gameplay owner is mutated.
"""
from __future__ import annotations
import dataclasses,json,sys
from pathlib import Path

SCHEMA='hc.perception.v0'
CODEBOOK={
 'support_confirmed':{
    'message':'stable_support','rhythmUnits':[3],'toneShape':'low-to-gentle-rise',
    'light':'one soft sustained glow','gesture':'settle into close relaxed orbit',
    'accessible':'Support confirmed'},
 'support_lost_unexpected':{
    'message':'concern_contact_lost','rhythmUnits':[1,1,1],'toneShape':'three descending brief chirps',
    'light':'three brief brightness dips','gesture':'small recoil then cautious return',
    'accessible':'Unexpected support lost'},
 'unfamiliar_material_observed':{
    'message':'curious_new_material','rhythmUnits':[1,2],'toneShape':'short then held questioning interval',
    'light':'short then sustained light pulse','gesture':'approach, investigate, hover',
    'accessible':'Unfamiliar material noticed'},
}

@dataclasses.dataclass
class GuideSignalInterpreter:
    cooldown_ms:int=850
    def __post_init__(self):
        self.known_materials=set()
        self.support_active=False
        self.last_by_kind={}
        self.emitted=[]
    def ingest(self,event):
        if event.get('schema')!=SCHEMA:return None
        kind=event.get('kind')
        if kind not in CODEBOOK:return None
        t=event.get('observedAtMs')
        if not isinstance(t,(int,float)) or t<0:return None
        # These fields are illustrative mock perception contract, not live
        # owner events; consumers must validate real provenance at integration.
        if not event.get('perceivable',False):return None
        if kind=='support_confirmed':
            if not event.get('geometryVerified') or event.get('supportCount',0)<1:return None
            if self.support_active:return None
            self.support_active=True
        elif kind=='support_lost_unexpected':
            if not self.support_active or event.get('intentionalRelease',False):
                if event.get('intentionalRelease',False):self.support_active=False
                return None
            self.support_active=False
        elif kind=='unfamiliar_material_observed':
            material=event.get('materialId')
            if not material or material in self.known_materials:return None
            self.known_materials.add(material)
        prev=self.last_by_kind.get(kind)
        if prev is not None and t-prev<self.cooldown_ms:return None
        self.last_by_kind[kind]=t
        meaning=CODEBOOK[kind]
        out={'eventId':event.get('eventId'), 'kind':kind,'message':meaning['message'],
             'meaning':meaning['accessible'],'atMs':t,'channels':{
               'audio':{'rhythmUnits':meaning['rhythmUnits'],'toneShape':meaning['toneShape']},
               'light':{'rhythmUnits':meaning['rhythmUnits'],'visualExpression':meaning['light']},
               'movement':{'gesture':meaning['gesture']}},
             'personality':event.get('affect','curious'),
             'accessibleText':meaning['accessible'],
             'ownerAuthority':'read_only_expression_no_movement_or_physics_control'}
        self.emitted.append(out)
        return out

def demo():
    e=GuideSignalInterpreter();events=[
      {'schema':SCHEMA,'eventId':'1','kind':'unfamiliar_material_observed','observedAtMs':500,
       'perceivable':True,'materialId':'silt.residue_weak','affect':'curious'},
      {'schema':SCHEMA,'eventId':'2','kind':'support_confirmed','observedAtMs':1700,
       'perceivable':True,'geometryVerified':True,'supportCount':2,'affect':'relieved'},
      {'schema':SCHEMA,'eventId':'3','kind':'support_lost_unexpected','observedAtMs':2600,
       'perceivable':True,'intentionalRelease':False,'affect':'startled'},
      {'schema':SCHEMA,'eventId':'4','kind':'support_confirmed','observedAtMs':3700,
       'perceivable':True,'geometryVerified':True,'supportCount':1,'affect':'careful'},
      {'schema':SCHEMA,'eventId':'5','kind':'support_lost_unexpected','observedAtMs':4500,
       'perceivable':True,'intentionalRelease':True,'affect':'calm'}]
    for event in events:e.ingest(event)
    return {'status':'ISOLATED_MOCK_ONLY','schema':SCHEMA,'signals':e.emitted,
       'eventsProvided':len(events),'signalsProduced':len(e.emitted),
       'limits':['No live Guide hook','No audio generated','No gameplay movement effect',
                 'Authoritative runtime perception events still to be designed']}
if __name__=='__main__':
    dest=Path(sys.argv[1] if len(sys.argv)>1 else 'GUIDE_SIGNAL_DEMO.json')
    dest.write_text(json.dumps(demo(),indent=2)+'\n',encoding='utf-8')
    print('Guide signal mock demo:',dest,'signals=',demo()['signalsProduced'])
