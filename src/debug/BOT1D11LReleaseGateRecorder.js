// BOT1-D11L: diagnostic-only observation of the movement owner's release gate.
// Never modifies gameplay values or uses observations to choose input.
// `attachmentReleaseTension` is the owner-computed outward intent, whereas
// inferred active-normal choice and threshold model are explicitly derived.
const TARGET = 'SILT_ENTRY_SEDIMENT_SHELF_D11B';
const finite = v => typeof v === 'number' && Number.isFinite(v);
const num = v => finite(v) ? Number(v.toFixed(5)) : null;
const vec = v => v && finite(v.x) && finite(v.y) && finite(v.z)
  ? { x:num(v.x), y:num(v.y), z:num(v.z) } : null;
const dot = (a,b) => a && b ? num(a.x*b.x+a.y*b.y+a.z*b.z) : null;
const norm = a => a ? num(Math.hypot(a.x,a.y,a.z)) : null;
const smallInput = input => ({
  moveX:num(input?.moveX), moveY:num(input?.moveY), moveZ:num(input?.moveZ),
  boostHeld:Boolean(input?.boostHeld), pulseHeld:Boolean(input?.pulseHeld),
  absorbHeld:Boolean(input?.absorbHeld), stabilizeHeld:Boolean(input?.stabilizeHeld)
});
function sourceEvidence(fn) {
  const body = Function.prototype.toString.call(fn);
  const tests = {
    ownerAwayIntent:body.includes('this.attachmentReleaseTension = awayIntent'),
    dotProduct:body.includes('this.intent.dot(activeContactNormal)'),
    holdLowerGate:body.includes('awayIntent >= 0.34'),
    strengthReleaseGate:body.includes('0.50 + this.attachmentStrength * 0.08'),
    strengthHoldGate:body.includes('0.11 + this.attachmentStrength * 0.035'),
    deliberateDetach:body.includes('deliberate_away_input')
  };
  return { checks:tests, modelVerified:Object.values(tests).every(Boolean),
    note:'Runtime method-signature checks, not a SHA/hash or a claim of byte-identical local source.' };
}

export function installBOT1D11LReleaseGateRecorder(runtime) {
  let origin=performance.now(), active=true, hooked=false, restored=false;
  let droppedFrames=0, frames=[], events=[], lastClass=null, coverage=null;
  const limit=9500, eventLimit=3000;
  let owner=null, original=null, instrumented=null;
  const ms=()=>Math.round(performance.now()-origin);
  function record(type,data) {
    if(!active) return;
    if(events.length<eventLimit) events.push({ms:ms(),type,...data});
  }
  function observe(self,dt,f,wasActive,priorReason) {
    const intent=vec(self.intent), ownerNormal=vec(self.attachmentOwnerNormal),
      tendrilNormal=vec(self.tendrilSupportNormal), surfaceNormal=vec(self.attachmentSurfaceNormal),
      boundaryNormal=vec(self.boundarySurfaceNormal);
    const strength=num(self.attachmentStrength);
    const away=num(self.attachmentReleaseTension); // owner-computed; includes any change in actual owner law
    const holdAge=num(self.attachmentPeelHoldAge);
    const threshold=coverage?.modelVerified && strength!==null ? num(0.50+strength*0.08) : null;
    const holdThreshold=coverage?.modelVerified && strength!==null ? num(0.11+strength*0.035) : null;
    const currentlyActive=Boolean(self.attachmentActive);
    const reason=String(self.attachmentDetachReason??'none');
    const frame={ms:ms(),dt:num(dt),cell:f?.activeCellId??'none',
      preActive:Boolean(wasActive),postActive:currentlyActive,detachReason:reason,
      ownerAuthority:self.attachmentOwnerAuthority??'none',
      ownerSurfaceId:self.attachmentOwnerSurfaceId??'none',
      input:smallInput(f?.input), intent, intentMagnitude:norm(intent),
      // The owner scalar above is authoritative. Candidates below are *not* the local variable.
      candidateNormals:{owner:ownerNormal,tendril:tendrilNormal,
        surface:surfaceNormal,boundary:boundaryNormal},
      candidateDots:{owner:dot(intent,ownerNormal),tendril:dot(intent,tendrilNormal),
        surface:dot(intent,surfaceNormal),boundary:dot(intent,boundaryNormal)},
      ownerAwayIntent:away,ownerPeelHoldAge:holdAge,
      ownerPeelIntent:num(self.attachmentPeelIntent01),ownerReleaseArmed:Boolean(self.attachmentReleaseArmed),
      ownerAttachmentStrength:strength,ownerContactGapAge:num(self.attachmentContactGapAge),
      ownerContactGapActive:Boolean(self.attachmentContactGapActive),
      ownerSupportCount:self.tendrilSupportCount??null,
      modeledReleaseThreshold:threshold,modeledHoldThreshold:holdThreshold,
      modeledAwayGateMet:threshold===null||away===null?null:away>=threshold,
      modeledHoldGateMet:holdThreshold===null||holdAge===null?null:holdAge>=holdThreshold};
    if(frames.length<limit) frames.push(frame); else droppedFrames++;
    const cls=!wasActive && !currentlyActive?'not_attached':
      reason==='deliberate_away_input' && !currentlyActive?'deliberately_released':
      !currentlyActive?'detached_other':
      threshold===null||holdThreshold===null?'gate_model_unverified':
      away===null?'away_scalar_missing':
      away<threshold?'away_below_modeled_threshold':
      holdAge===null||holdAge<holdThreshold?'peel_hold_below_modeled_threshold':
      self.attachmentReleaseArmed?'release_armed':'modeled_gates_met_but_not_armed';
    if(cls!==lastClass || (wasActive && !currentlyActive) || (priorReason!==reason && reason!=='none')) {
      record('release_gate_class_transition', {from:lastClass,to:cls,
        ownerAwayIntent:away,ownerPeelHoldAge:holdAge,
        ownerReleaseArmed:Boolean(self.attachmentReleaseArmed),detachReason:reason,
        ownerSurfaceId:self.attachmentOwnerSurfaceId??'none'});
      lastClass=cls;
    }
  }
  function tryHook(){
    if(hooked || !active) return;
    const m=runtime.playerMovementController;
    if(!m||typeof m.updateChemistryAttachmentState!=='function') return;
    owner=m;
    original=m.updateChemistryAttachmentState;
    coverage=sourceEvidence(original);
    instrumented=function(...args){
      const before=Boolean(this.attachmentActive),priorReason=this.attachmentDetachReason??'none';
      const result=Reflect.apply(original,this,args);
      // Observe the owner's computed values after its real method ran.
      // No effects on return value, method arguments, or gameplay state.
      if(active) observe(this,args[0],args[1]??runtime.frameState,before,priorReason);
      return result;
    };
    m.updateChemistryAttachmentState=instrumented;
    hooked=true;
    record('hook_installed',{owner:'PlayerMovementController.updateChemistryAttachmentState',
      coverage});
  }
  tryHook();
  const timer=setInterval(tryHook,250);
  return Object.freeze({
    reset(){origin=performance.now();frames=[];events=[];lastClass=null;droppedFrames=0;
      tryHook();record('probe_reset',{hooked});},
    dump(){tryHook();return {revision:'BOT1-D11L-1',hooked,ownerMethod:
      'PlayerMovementController.updateChemistryAttachmentState',coverage,
      target:TARGET,ownerDataUsedForSteering:false,frames:frames.slice(),
      events:events.slice(),droppedFrames,maxFrames:limit,
      note:'OwnerAwayIntent and peelHoldAge are read directly after actual owner method. Candidate normals and modeled threshold reasons are derived, not owner-issued refusal codes.'};},
    stop(){active=false;clearInterval(timer);if(!restored&&owner?.updateChemistryAttachmentState===instrumented){
      owner.updateChemistryAttachmentState=original;restored=true;}}
  });
}
