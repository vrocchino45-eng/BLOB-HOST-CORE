import assert from 'node:assert/strict';
import {test} from 'node:test';
import {scoreFrameMapping} from './frame-mapping.mjs';

const step=(frame,substep)=>({hostId:'host',cellId:'cell',mountSequence:2,frame,substep});
const sample=(frame,substep,wallMs,flow)=>({step:step(frame,substep),wallMs,runtimeSeconds:1+frame/60,input:{flowSequence:4},flow});
const captures={frames:[{marker:1,frame:20,wallMs:1000},{marker:2,frame:21,wallMs:1160},{marker:3,frame:22,wallMs:1300}]};
const decoded=[{marker:1,encodedFrameObserved:1,ptsSeconds:.01},
  {marker:2,encodedFrameObserved:3,ptsSeconds:.20},{marker:9,encodedFrameObserved:4,ptsSeconds:.30}];

test('maps exact substep, consequence and decoded presentation marker',()=>{
 const result=scoreFrameMapping(captures,[sample(21,0,1130,null),sample(21,1,1150,{effect:{receiverId:'shelf'}})],
  decoded,{accepted:step(21,1)});
 const [event]=result.actions;
 assert.equal(event.status,'WITHIN_100_MS');
 assert.equal(event.marker,2);assert.equal(event.encodedFrameObserved,3);
 assert.equal(event.consequence.receiverId,'shelf');assert.equal(event.renderDelayMs,10);
 assert.equal(event.eventToFrameMs,40);
 assert.deepEqual(result.missingCapturedMarkers,[3]);
});
test('reports presentation delay and matched-frame gaps without fabricating success',()=>{
 const result=scoreFrameMapping(captures,[sample(21,0,1010,null),sample(22,0,1200,null)],
  decoded,{request:step(21,0),consequence:step(22,0),unrecorded:step(23,0)});
 assert.deepEqual(result.actions.map(e=>e.status),['OVER_100_MS','FRAME_NOT_ENCODED','MISSING_EVENT_SAMPLE']);
});
