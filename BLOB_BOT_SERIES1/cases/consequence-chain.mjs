export async function auditConnections(r){
 const checks=[],observations={};const check=(name,fn)=>{try{fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',error:String(e.stack||e)});throw e;}};
 const ok=(v,m)=>{if(!v)throw new Error(m);};const same=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m);
 const f=r.frameState,s=r.siltPressureRouteSystem,v=r.vascularRhythmRouteSystem,g=r.graveMemoryRouteSystem,host=r.hostConnectionReceiptLedger;
 r.renderer.setAnimationLoop(null);
 const cells={silt:'CELL_SILT_PRESSURE_ROUTE_001',vascular:'CELL_VASCULAR_RHYTHM_ROUTE_001',grave:'CELL_GRAVE_MEMORY_RESIDUE_BED_001',hub:'CELL_SIGNAL_CHORUS_NERVE_001'};
 const input=r.inputSystem;input.keys.clear();input.mouseButtons.clear();f.inspectionCamera={active:false,coreWorkActive:false};
 function tick({q=false,commit=false,x=false,absorb=false}={},dt=.05){input.keys[q?'add':'delete']('KeyQ');input.keys[x?'add':'delete']('KeyX');input.mouseButtons[absorb?'add':'delete'](2);input.queued.interact=commit;f.frame=(f.frame??0)+1;f.runtimeSeconds=(f.runtimeSeconds??0)+dt;input.update(dt,f);s.update(dt,f);v.update(dt,f);g.update(dt,f);}
 function move(local){s.root.updateMatrixWorld(true);r.playerCore.position.copy(s.root.localToWorld(local.clone()));}
 function aim(local){s.root.updateMatrixWorld(true);const core=s.root.worldToLocal(r.playerCore.position.clone());r.camera.position.copy(s.root.localToWorld(core.clone().add(r.camera.position.clone().set(0,.2,3))));r.camera.lookAt(s.root.localToWorld(local.clone()));r.camera.updateMatrixWorld(true);}
 function cycleState(){return {elapsed:s.elapsed,units:s.livingCycle.units.map(u=>({id:u.id,phase:u.phase,age:u.age})),mass:s.materialIdentity.totalMass(),seat:s.siltPlateSeat.snapshot()};}
 try{
  ok(host,'runtime Host ledger missing');ok(s.active,'requires mounted Silt');
  observations.initial={cell:f.activeCellId,host:host.snapshot(),mass:s.materialIdentity.totalMass()};
  // Controlled prior progress: this audit does not earn the original porous packet.
  s.safeMatterAbsorbed=true;for(let i=0;i<320;i++)tick();
  let unit=s.livingCycle.units.find(u=>u.phase==='settled');ok(unit,'cycle has no settled unit');const body=s.livingMatterMeshes[s.livingCycle.units.indexOf(unit)].body;
  move(body.position.clone().add(body.position.clone().set(0,.1,1)));aim(body.position);tick({q:true,commit:true});
  check('Actual normalized input grips existing finite Silt grain',()=>{same(s.siltGrip.heldId,unit.id,'grip failed');same(s.materialIdentity.totalMass(),8,'mass changed');});
  f.activeCellId=cells.hub;tick();
  check('Region exit releases grip without generating a deliberate Host cause',()=>{same(s.siltGrip.heldId,null,'grip stranded');same(host.acceptedTotal,0,'exit invented Host cause');ok([...s.materialIdentity.records.values()].every(u=>u.owner!=='grip'),'owner stranded');});
  let frozen=cycleState();for(let i=0;i<80;i++)tick();
  check('Hidden Silt simulation remains paused',()=>same(cycleState(),frozen,'hidden cycle changed'));
  f.activeCellId=cells.silt;tick();
  move(body.position.clone().add(body.position.clone().set(0,.1,1)));aim(body.position);tick({q:true,commit:true});
  ok(s.siltGrip.heldId===unit.id,'reacquire after exit failed');
  const patch=r.camera.position.clone().fromArray(s.siltContact.position),core=patch.clone().add(patch.clone().set(0,.1,1));move(core);s.siltGripLocalOffset.copy(patch).sub(core);s.siltGrip.moveTo(patch.toArray(),core.toArray());aim(patch);tick({q:true});
  for(let i=0;i<2;i++){tick({q:true,x:true});tick({q:true});}tick({q:true,commit:true});
  check('Existing imprint and seat survive a real route update',()=>{same(s.siltPlateSeat.unitId,unit.id,'seat failed');same(s.siltGrip.heldId,null,'grip not cleared');same(host.acceptedTotal,0,'seat invented disturbance');});
  // A retained completed checkpoint is a fixture, not objective or traversal credit.
  s.completed=true;s.pressureRead=true;s.ribsReleased=true;s.returnFoldReady=true;
  const retained={seat:s.siltPlateSeat.unitId,mass:s.materialIdentity.totalMass(),local:body.position.toArray(),ids:s.livingCycle.units.map(u=>u.id)};
  f.activeCellId=cells.hub;tick();f.activeCellId=cells.silt;r.playerCore.position.add(r.playerCore.position.clone().set(20,0,0));tick();
  check('Remount retains completed checkpoint, seated identity and finite supply',()=>{same(s.siltPlateSeat.unitId,retained.seat,'seat lost');same(s.materialIdentity.totalMass(),retained.mass,'mass changed');same(s.livingCycle.units.map(u=>u.id),retained.ids,'identities changed');ok(s.completed&&s.safeMatterAbsorbed&&s.pressureRead&&s.ribsReleased,'checkpoint lost');});
  move(body.position.clone().add(body.position.clone().set(0,.1,1)));aim(body.position);tick({q:true,commit:true});
  check('Retained seated grain can be extracted after remount',()=>{same(s.siltGrip.heldId,unit.id,'extract failed');same(s.siltPlateSeat.unitId,null,'seat not cleared');});
  move(s.root.worldToLocal(r.playerCore.position.clone()).add(patch.clone().set(0,0,3)));tick({q:true});tick({q:true,commit:true});
  check('Deliberate free release emits exactly one authenticated Silt cause',()=>{same(host.acceptedTotal,1,'expected one Host cause');same(s.materialIdentity.totalMass(),8,'mass changed');ok(host.snapshot().records[0].materialTransfer===false,'material transfer claimed');});
  const vascularBefore=v.siltSignalReceiver.snapshot();f.activeCellId=cells.hub;tick();for(let i=0;i<10;i++)tick();
  check('Hidden Vascular does not consume pending Silt cause',()=>same(v.siltSignalReceiver.snapshot(),vascularBefore,'hidden receiver changed'));
  f.activeCellId=cells.vascular;tick();
  const received=v.siltSignalReceiver.receivedTotal;const effect=host.vascularEffectSnapshot({withRecords:true});
  check('Mounted Vascular applies one local effect with authenticated Silt parent',()=>{same(received,1,'cause not received');same(effect.acceptedTotal,1,'effect not authenticated');ok(v.siltSignalReceiver.membraneLoad>0,'no local load');same(effect.records[0].parentSiltReceiptId,host.snapshot().records[0].id,'parent mismatch');});
  for(let i=0;i<10;i++)tick();
  check('Repeated Vascular updates do not replay the cause',()=>{same(v.siltSignalReceiver.receivedTotal,received,'replayed cause');same(host.vascularEffectSnapshot({withRecords:true}).acceptedTotal,1,'duplicated applied effect');});
  const gBefore=g.vascularEffectMemory.snapshot({active:false});f.activeCellId=cells.hub;tick();for(let i=0;i<5;i++)tick();
  check('Hidden Grave does not consume Vascular memory',()=>same(g.vascularEffectMemory.snapshot({active:false}),gBefore,'hidden Grave changed'));
  f.activeCellId=cells.grave;tick();
  check('Mounted Grave receives applied Vascular history without moving Silt mass',()=>{same(g.vascularEffectMemory.receivedTotal,1,'Grave memory missing');ok(g.vascularEffectMemory.memoryPressure>0,'memory pressure missing');same(g.vascularEffectMemory.lastParentSiltReceiptId,host.snapshot().records[0].id,'lineage lost');same(s.materialIdentity.totalMass(),8,'remote mass mutation');});
  const remembered=g.vascularEffectMemory.memoryPressure;f.activeCellId=cells.hub;tick();f.activeCellId=cells.grave;tick();
  check('Grave remount does not duplicate retained memory pressure',()=>{same(g.vascularEffectMemory.receivedTotal,1,'memory duplicated');same(g.vascularEffectMemory.memoryPressure,remembered,'memory accumulated twice');});
  observations.beforeReturn={siltCause:host.snapshot(),vascularEffect:host.vascularEffectSnapshot({withRecords:true}),graveMemory:g.vascularEffectMemory.snapshot({active:true})};
  // Controlled near-resolution Grave II fixture. Use the actual evaluator and publisher;
  // no direct Host receipt fabrication, no claim of earning the Grave II puzzle.
  const resonance=r.graveResonanceGameplaySystem,returnOwner=r.graveReturnRegionSystem;ok(resonance&&returnOwner,'Grave II owners missing');
  f.act1RouteHistory={...(f.act1RouteHistory??{}),routeStates:{...(f.act1RouteHistory?.routeStates??{}),grave_memory_route:{entryCount:2,returned:true}}};
  const engine=r.returnRegionEngineSystem;engine.update(.05,f);
  check('Authenticated Grave memory feeds the existing Grave II layout',()=>{ok(f.returnRegionEngine.graveLayout.inputs.c0d3GraveIIHostMemory.applied,'memory not inherited');ok(f.returnRegionEngine.graveLayout.inputs.c0d3GraveIIHostMemory.inheritedPressure01>0,'no inherited pressure');});
  const creditsBefore=engine.completionKeys.size;
  f.graveReturnRegion={...(f.graveReturnRegion??{}),active:true};returnOwner.active=true;
  resonance.active=true;resonance.wasActive=true;resonance.interactionCount=3;resonance.touchedNodes=new Set(['retainedDraw','coherentPush']);
  for(const node of resonance.nodes.values())node.level01=.55;
  for(let i=0;i<22;i++){f.frame++;resonance.evaluateResolution(.08,resonance.metrics(),f);}
  check('Real Grave II completion evaluator publishes one authenticated return outcome',()=>{ok(resonance.completed,'resolution not completed');same(host.graveIIResolutionSnapshot({withRecords:true}).acceptedTotal,1,'completion not authenticated');const record=host.graveIIResolutionSnapshot({withRecords:true}).records[0];same(record.inheritedVascularMemory,true,'inherited memory lost');same(record.parentVascularEffectId,g.vascularEffectMemory.lastVascularEffectId,'return parent lost');});
  engine.update(.05,f);engine.update(.05,f);
  check('Existing return engine credits Grave phase two once',()=>{same(engine.completionKeys.size,creditsBefore+1,'completion credited repeatedly');same(engine.secondPhaseCompleted.grave,true,'phase two missing');});
  same(s.graveIIConsumedSequence,0,'Silt consumed while hidden');f.activeCellId=cells.silt;tick();
  check('Silt consumes Grave II pressure echo only after remount',()=>{same(s.graveIIConsumedSequence,1,'echo not consumed');same(s.graveIIResolutionId,'shared_memory','wrong category');same(s.graveIIPressureEcho,.028,'wrong bounded echo');same(s.pressureSettlingTarget(),.1-.028,'pressure target not coupled');});
  const echo=s.graveIIPressureEcho;for(let i=0;i<10;i++)tick();f.activeCellId=cells.hub;tick();f.activeCellId=cells.silt;tick();
  check('Return echo does not accumulate on repeated frames or remount',()=>{same(s.graveIIPressureEcho,echo,'echo accumulated');same(s.graveIIConsumedSequence,1,'cursor changed');same(s.materialIdentity.totalMass(),8,'mass changed');});
  observations.final={siltMass:s.materialIdentity.totalMass(),siltCompleted:s.completed,hostCauses:host.acceptedTotal,vascularEffects:host.vascularEffectSnapshot({withRecords:false}),graveMemory:g.vascularEffectMemory.snapshot({active:false}),returnOutcome:host.graveIIResolutionSnapshot({withRecords:true}),siltEcho:s.graveIIPressureEcho};
 }catch(e){observations.interruption=String(e.stack||e);}
 return {pass:'SILT-CONNECTION1',scope:'Actual initialized browser runtime owners; renderer paused for controlled fixtures and explicit full route updates using normalized InputSystem input. Direct cell changes and prior-progress/near-resolution fixtures are not ordinary navigation or puzzle acceptance.',checks,observations,summary:{expected:18,passed:checks.filter(x=>x.status==='PASS').length,failed:checks.filter(x=>x.status==='FAIL').length,complete:checks.length===18&&!observations.interruption},notVerified:['physical controller delivery','ordinary gate-free entry/return traversal','full registry scheduling during this manual-owner fixture','earning initial porous packet or Grave II resolution','cross-session persistence']};
}
