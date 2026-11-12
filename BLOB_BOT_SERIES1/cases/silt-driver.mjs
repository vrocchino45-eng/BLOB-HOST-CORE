// Keeps the existing declared Silt poses/previous-progress fixtures, but schedules
// all goal inputs on actual game frames rather than remote command round trips.
export async function siltArc(page){
 await page.evaluate(async()=>{
  const {stage}=await import('/BLOB_BOT_SERIES1/fixtures/SILT_II1_TEST_START.mjs');
  const setup=await stage(),r=window.__CAMERA_AUDIT_RUNTIME__,s=r.siltPressureRouteSystem,original=r.tick,pressed=new Set();
  r.cameraYaw=0;r.cameraPitch=.18;
  const out={done:false,error:null,setup,stages:[],contactFixture:null,releaseFixture:null,delivery:'Synthetic DOM keyboard events through InputSystem once per real tick; existing prior-progress/contact/release poses remain declared fixtures'};
  window.__BLOB_BOT_SILT__=out;
  let phase='acquire',phaseAt=r.frameState.runtimeSeconds,pulses=0,grainId=null;
  const started=phaseAt;
  function key(code,down){if(pressed.has(code)===down)return;window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code,bubbles:true}));if(down)pressed.add(code);else pressed.delete(code);}
  function tap(code){key(code,true);key(code,false);}
  function cleanup(){for(const code of [...pressed])key(code,false);if(r.tick===driver)r.tick=original;}
  out.cancel=cleanup;
  function shot(label){const f=r.frameState;out.stages.push({label,clock:f.runtimeSeconds,goal:s.returnRoundTrip.snapshot(),held:s.siltGrip.heldId,seated:s.siltPlateSeat.unitId,credits:f.returnRegionEngine.creditCount,engine:f.coreEngine.phaseCount,mass:s.materialIdentity.totalMass(),position:r.playerCore.position.toArray()});}
  function next(p){phase=p;phaseAt=r.frameState.runtimeSeconds;out.phase=p;}
  function driver(...args){
   try{
    const f=r.frameState,g=s.returnRoundTrip,now=f.runtimeSeconds;
    if(f.activeCellId!=='CELL_SILT_PRESSURE_ROUTE_001')throw Error('Silt driver left its cell');
    if(now-started>90)throw Error('Silt driver simulation budget exhausted at '+phase);
    if(s.materialIdentity.totalMass()!==8)throw Error('Silt mass conservation failed');
    key('KeyQ',phase!=='native');
    if(phase==='acquire'){
     if(s.siltGrip.heldId){grainId=s.siltGrip.heldId;shot('actual grip');next('contact');}
     else if(f.siltMaterialAim?.candidateId)tap('KeyE');
    }else if(phase==='contact'){
     const patch=r.playerCore.position.clone().fromArray(s.siltContact.position),core=patch.clone().add(patch.clone().set(0,.1,1));
     r.playerCore.position.copy(s.root.localToWorld(core.clone()));s.siltGripLocalOffset.copy(patch).sub(core);
     const accepted=s.siltGrip.moveTo(patch.toArray(),core.toArray());
     out.contactFixture={scope:'One controlled player/accepted held-grain contact pose, same fixture as earlier B03. No goal proof written.',accepted,grainId};
     if(!accepted)throw Error('Contact pose rejected');next('brace');
    }else if(phase==='brace'){
     if(s.siltContact.braced){key('KeyX',true);next('pulse_down');}
    }else if(phase==='pulse_down'){
     if(now-phaseAt>=.1){key('KeyX',false);pulses++;next('pulse_gap');}
    }else if(phase==='pulse_gap'){
     if(g.stage==='imprinted'){shot('actual imprint');tap('KeyE');next('seat');}
     else if(now-phaseAt>=.15){if(pulses>=2)throw Error('Two actual pulses did not imprint');key('KeyX',true);next('pulse_down');}
    }else if(phase==='seat'){
     if(g.stage==='seated'){shot('actual seat');next('extract');}
     else if(!s.siltGrip.heldId)throw Error('Seat input released grain without seating');
    }else if(phase==='extract'){
     if(g.stage==='extracted'){shot('actual extraction');r.playerCore.position.z+=3;out.releaseFixture={scope:'One existing B03 player release-clearance pose: world z +3. No grain/native/goal state forced.'};next('clearance');}
     else if(now-phaseAt>=.3&&f.siltMaterialAim?.candidateId===grainId)tap('KeyE');
    }else if(phase==='clearance'){
     if(now-phaseAt>=.2){tap('KeyE');next('release');}
    }else if(phase==='release'){
     if(g.stage==='released_pending_native'){shot('actual free release');next('native');}
     else if(g.stage==='seated')throw Error('Release clearance did not prevent reseating');
    }else if(phase==='native'){
     if(g.completed&&f.returnRegionEngine.creditCount===6&&f.coreEngine.phaseCount===6){shot('native return and six-phase credit');out.done=true;cleanup();}
    }
   }catch(e){out.error=String(e);shot('failure');cleanup();}
   return original.apply(this,args);
  }
  r.tick=driver;
 });
 try{
  await page.waitForFunction(()=>{const s=window.__BLOB_BOT_SILT__;return s.done||s.error;},null,{timeout:900000,polling:1000});
  const result=await page.evaluate(()=>{const {cancel,...s}=window.__BLOB_BOT_SILT__;return s;});if(result.error)throw Error(result.error);return result;
 }finally{await page.evaluate(()=>window.__BLOB_BOT_SILT__?.cancel());}
}
