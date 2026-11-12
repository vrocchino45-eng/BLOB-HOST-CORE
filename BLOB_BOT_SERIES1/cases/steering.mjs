// Frame-cadenced test driver. Only DOM keyboard events are written; game physics,
// time, position, velocity, goal receipts and credit state remain game-owned.
export async function steer(page,mode){
 await page.evaluate(mode=>{
  const r=window.__CAMERA_AUDIT_RUNTIME__,original=r.tick,pressed=new Set(),start=r.frameState.runtimeSeconds;
  const state={mode,done:false,error:null,samples:[],startedAt:start,delivery:'Synthetic DOM keyboard events through InputSystem, once per real game tick'};
  window.__BLOB_BOT_STEERING__=state;
  const setKeys=want=>{const next=new Set(want);for(const code of pressed)if(!next.has(code)){window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));pressed.delete(code);}for(const code of next)if(!pressed.has(code)){window.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));pressed.add(code);}};
  const cleanup=()=>{setKeys([]);if(r.tick===driver)r.tick=original;};
  state.cancel=cleanup;
  function driver(...args){
   try{
    const f=r.frameState,v=r.vascularRhythmRouteSystem,s=r.siltPressureRouteSystem;
    const cell=mode==='vascular'?'CELL_VASCULAR_RHYTHM_ROUTE_001':'CELL_SILT_PRESSURE_ROUTE_001';
    const complete=mode==='vascular'?v.returnHandoff.completed:f.activeCellId==='CELL_SIGNAL_CHORUS_NERVE_001';
    if(complete){state.done=true;state.finishedAt=f.runtimeSeconds;cleanup();return original.apply(this,args);}
    if(f.activeCellId!==cell)throw Error('Unexpected cell during '+mode+' steering: '+f.activeCellId);
    if(f.runtimeSeconds-start>60)throw Error('Steering simulation budget exhausted');
    const p=r.playerCore.position,target=mode==='vascular'?v.valves[0].getWorldPosition(p.clone()):s.returnPosition.clone(),delta=target.sub(p);
    const velocity=f.playerKinematics?.velocity??{x:0,y:0,z:0};
    const control=delta.clone().multiplyScalar(.9).addScaledVector(p.clone().set(velocity.x,velocity.y,velocity.z),-1.1);
    const forward=r.camera.getWorldDirection(p.clone()),flat=forward.clone().setY(0).normalize(),right=flat.clone().cross(p.clone().set(0,1,0));
    const fd=control.dot(flat),rd=control.dot(right),keys=[];
    if(Math.abs(fd)>.18)keys.push(fd>0?'KeyW':'KeyS');
    if(Math.abs(rd)>.18)keys.push(rd>0?'KeyD':'KeyA');
    const vertical=control.y-(Math.abs(fd)>.18?(fd>0?1:-1)*forward.y*.55:0);
    if(Math.abs(vertical)>.18)keys.push(vertical>0?'KeyC':'KeyZ');
    if(mode==='vascular')keys.push('KeyQ');
    setKeys(keys);
    if(state.samples.length<1024)state.samples.push({clock:f.runtimeSeconds,distance:delta.length(),position:p.toArray(),velocity:{...velocity},keys,settleProgress:v.returnHandoff.snapshot().settleProgress});
   }catch(e){state.error=String(e);cleanup();}
   return original.apply(this,args);
  }
  r.tick=driver;
 },mode);
 try{
  await page.waitForFunction(()=>{const s=window.__BLOB_BOT_STEERING__;return s.done||s.error;},null,{timeout:900000,polling:1000});
  const result=await page.evaluate(()=>{const {cancel,...s}=window.__BLOB_BOT_STEERING__;return s;});
  if(result.error)throw Object.assign(Error(result.error),{steering:result});return result;
 }finally{await page.evaluate(()=>window.__BLOB_BOT_STEERING__?.cancel());}
}
