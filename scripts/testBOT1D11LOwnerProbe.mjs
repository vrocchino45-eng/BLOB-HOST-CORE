// Offline smoke test: diagnostic wrapper preserves owner method effects and return.
import assert from 'node:assert/strict';
import { installBOT1D11LReleaseGateRecorder } from '../src/debug/BOT1D11LReleaseGateRecorder.js';
const normal={x:0,y:1,z:0};
const intent={x:0,y:.9,z:0,dot(n){return this.x*n.x+this.y*n.y+this.z*n.z;}};
const m={
  intent,attachmentActive:true,attachmentDetachReason:'none',attachmentStrength:.6,
  attachmentPeelHoldAge:0,attachmentPeelIntent01:0,attachmentReleaseArmed:false,
  attachmentReleaseTension:0,attachmentContactGapAge:0,attachmentContactGapActive:false,
  attachmentOwnerNormal:normal,tendrilSupportNormal:normal,
  attachmentSurfaceNormal:normal,boundarySurfaceNormal:normal,
  attachmentOwnerAuthority:'authored_suction_support',attachmentOwnerSurfaceId:'SILT_ENTRY_SEDIMENT_SHELF_D11B',
  tendrilSupportCount:2,
  updateChemistryAttachmentState(dt,frameState){
    const activeContactNormal=this.attachmentOwnerNormal;
    const awayIntent=Math.max(0,this.intent.dot(activeContactNormal));
    this.attachmentReleaseTension = awayIntent;
    if(this.attachmentActive && awayIntent >= 0.34)this.attachmentPeelHoldAge+=dt;
    this.attachmentPeelIntent01=awayIntent;
    const releaseThreshold = 0.50 + this.attachmentStrength * 0.08;
    const releaseHoldThreshold = 0.11 + this.attachmentStrength * 0.035;
    this.attachmentReleaseArmed=Boolean(this.attachmentActive &&
      awayIntent>=releaseThreshold && this.attachmentPeelHoldAge>=releaseHoldThreshold);
    if(this.attachmentReleaseArmed){this.attachmentActive=false;
      this.attachmentDetachReason='deliberate_away_input';}
    return frameState.input.moveY;
  }
};
const original=m.updateChemistryAttachmentState;
const runtime={playerMovementController:m,
  frameState:{activeCellId:'CELL_SILT_PRESSURE_ROUTE_001',input:{moveX:0,moveY:1,moveZ:0}}};
const recorder=installBOT1D11LReleaseGateRecorder(runtime);
recorder.reset();
assert.equal(m.updateChemistryAttachmentState(.075,runtime.frameState),1);
assert.equal(m.attachmentActive,true);
assert.equal(m.updateChemistryAttachmentState(.075,runtime.frameState),1);
assert.equal(m.attachmentActive,false);
const dump=recorder.dump();
assert.equal(dump.hooked,true);
assert.equal(dump.coverage.modelVerified,true);
assert.equal(dump.droppedFrames,0);
assert.equal(dump.frames.length,2);
assert.equal(dump.frames[0].ownerAwayIntent,.9);
assert.equal(dump.frames[0].ownerPeelHoldAge,.075);
assert.equal(dump.frames[1].detachReason,'deliberate_away_input');
assert.equal(dump.frames[1].postActive,false);
assert.equal(dump.frames[1].input.moveY,1);
assert.equal(dump.ownerDataUsedForSteering,false);
assert.ok(dump.events.some(e=>e.to==='deliberately_released'));
recorder.stop();
assert.equal(m.updateChemistryAttachmentState,original);
console.log('D11L owner-method observer: PASS (real owner method called, release seen, restored)');

// If the user's owner law changes, do not silently trust historical threshold math.
const changed={...m, attachmentActive:true, attachmentPeelHoldAge:0,
  updateChemistryAttachmentState(dt){this.attachmentReleaseTension=.2;return dt;}};
const shifted=installBOT1D11LReleaseGateRecorder({...runtime,playerMovementController:changed});
changed.updateChemistryAttachmentState(.1,runtime.frameState);
assert.equal(shifted.dump().coverage.modelVerified,false);
shifted.stop();
console.log('D11L changed-owner signature safety: PASS (threshold model unverified)');
