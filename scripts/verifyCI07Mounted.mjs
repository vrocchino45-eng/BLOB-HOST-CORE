import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

import {verifyIN03Admission} from '../BLOB_BOT_SERIES1/director/in03-admission.mjs';
const [root,out]=process.argv.slice(2);
verifyIN03Admission(root, process.env.GITHUB_SHA ?? process.env.BLOB_DIRECTOR_RUNNER_SHA);
const motion=process.argv.includes('--motion');
const rev=execFileSync('git',['--no-optional-locks','-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const admission=JSON.parse(await fs.readFile(path.join(root,'src/contact/siltPairAdmission.json')));
const restitution=JSON.parse(await fs.readFile(path.join(root,'src/contact/siltPairRestitutionAdmission.json')));
const require=createRequire(path.join(root,'package.json'));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
const {chromium}=require('./BLOB_BOT_SERIES1/node_modules/playwright');
await fs.mkdir(out);
const server=await createServer({root,cacheDir:path.join(out,'vite-cache'),logLevel:'warn',server:{host:'127.0.0.1',port:0,hmr:false}});
const cases=[];
let browser;
try{
 await server.listen();
 browser=await chromium.launch({headless:true,args:JSON.parse(process.env.BLOB_BOT_CHROMIUM_ARGS??'[]')});
 const origin='http://127.0.0.1:'+server.httpServer.address().port;
 for(const [mode,miss] of [...['e0-equal','e05-equal','e1-equal','e0-one-to-three','e05-one-to-three','e1-one-to-three'].map(mode=>[mode,false]),['e1-one-to-three',true],['disabled',false],['legacy',false]]){
  const context=await browser.newContext({viewport:{width:960,height:540}});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    const values=window.__PI04_PAD__=[0,0,0,0,0,0,0,0];
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{id:'PI04 test pad',mapping:'standard',index:0,
      connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},(_,i)=>{const value=values[i]??0;
        return {value,pressed:value>.5,touched:value>0};})}]});
   });
   await page.route('**/src/main.js',async route=>{
     const response=await route.fetch();
     await route.fulfill({response,body:(await response.text())+'\nwindow.__PI04_RUNTIME__=runtime;\n'});
   });
   await page.goto(origin+(mode==='disabled'?'/':mode==='legacy'?'/?siltPair=equal&siltRestitution=e1-equal':'/?siltRestitution='+mode),{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.__PI04_RUNTIME__?.isRunning,null,{timeout:60000});
   await page.keyboard.press('Shift+Digit6');
   await page.waitForFunction(()=>window.__PI04_RUNTIME__?.siltPressureRouteSystem?.active,null,{timeout:40000});
   const result=await page.evaluate(({admission,mode,miss,motion})=>{
    const r=window.__PI04_RUNTIME__,f=r.frameState, route=r.siltPressureRouteSystem, owner=route.siltTrajectory;
    const check=(v,message)=>{if(!v)throw new Error(message);};
    const same=(a,b,message)=>check(JSON.stringify(a)===JSON.stringify(b),message);
    check((owner.pairFixture?.id??'disabled')===(mode==='legacy'?'equal':mode==='disabled'?mode:'pi05:'+mode),'opt-in from main did not reach the existing trajectory owner');
    r.renderer.setAnimationLoop(null);
    f.inspectionCamera={active:false,coreWorkActive:false};
    f.tightInspectionCamera={active:false,coreWorkActive:false};
    r.inputSystem.keys.clear();r.inputSystem.mouseButtons.clear();
    route.safeMatterAbsorbed=true; // Declared prior checkpoint, unearned in this replay.
    const pad=window.__PI04_PAD__,vec=array=>r.camera.position.clone().fromArray(array);
    function tick(dt=1/60){
      f.frame++;
      f.runtimeSeconds+=dt;
      f.runtimeSimulationSubstepCount=1;f.runtimeSimulationSubstepIndex=0;f.runtimeSimulationSubstepSeconds=dt;
      r.inputSystem.update(dt,f);r.targetingSystem.update(dt,f);route.update(dt,f);
    }
    const [A,B]=admission.scope.ids;
    const unit=id=>route.livingCycle.units.find(u=>u.id===id);
    const mesh=id=>route.livingMatterMeshes.find(m=>m.unitId===id).body;
    const place=position=>r.playerCore.position.copy(r.playerCore.parent.worldToLocal(route.root.localToWorld(vec(position))));
    const camera=direction=>{
     const where=r.playerCore.getWorldPosition(vec([0,0,0]));
     r.camera.position.copy(where).add(vec([0,0,.35]));
     r.camera.lookAt(r.camera.position.clone().add(vec(direction)));
     r.camera.updateMatrixWorld(true);
    };
    function acquire(id){
     pad[6]=1;
     for(let i=0;i<64&&route.siltGrip.heldId!==id;i++){
      const p=mesh(id).position.clone();
      place(p.clone().add(vec([0,0,.76])).toArray());camera([0,0,-1]);
      tick();
      if (f.siltMaterialAim?.candidateId===id){pad[0]=1;tick();pad[0]=0;tick();}
     }
     check(route.siltGrip.heldId===id,'acquisition failed for '+id+': '+JSON.stringify(f.siltMaterialAim));
    }
    function release(id,direction){
     const sequence=route.lastMaterialLaunch?.chargeSequence??0;
     camera(direction);pad[2]=1;for(let i=0;i<48;i++)tick();
     check(f.siltPressureRoute?.materialLaunch?.ready,'no native launch authorization: '+JSON.stringify(f.siltPressureRoute?.materialLaunch));
     pad[0]=1;tick();pad[0]=0;pad[2]=0;tick();pad[6]=0;tick();
     const event=route.lastMaterialLaunch;
     check(event.unitId===id&&event.chargeSequence>sequence,'native directed release failed');
     return structuredClone(event);
    }
    for(let i=0;i<650&&unit(A).phase==='reservoir';i++)tick();
    acquire(A);
    const releases=[release(A,[0,1,0])];
    for(let i=0;i<1000&&unit(B).phase==='reservoir';i++)tick();
    acquire(B);releases.push(release(B,[1,0,0]));
    const receipt=JSON.stringify(r.hostConnectionReceiptLedger.snapshot({withRecords:true}));
    const progress=[route.completed,route.pressureRead,route.ribsReleased,route.safeMatterAbsorbed,route.returnFoldReady];
    const seed=miss?admission.measuredCorridor.miss:admission.measuredCorridor.seed;
    const initial=[];
    for(const [id,pos,v] of [[A,seed.positionA,seed.velocityA],[B,seed.positionB,seed.velocityB]]){
     const record=owner.free.get(id);check(record?.freeContact?.source,'missing authentic directed release '+id);
     initial.push({id,position:pos,velocity:v,stamp:record.freeContact.source,releaseSequence:record.freeContact.releaseSequence});
     record.position=[...pos];record.velocity=[...v];
    }
    const trialSetup={corePhase:f.coreEngine?.phaseCount??null,coreTopology:f.spatialCoreChemistry?.topology?.id??null,
      coreDistribution:f.spatialCoreChemistry?.topology?.distribution??null,reserve:r.coreRadialPerformanceSystem.reserve01,
      clock:{frame:f.frame,simSeconds:f.runtimeSeconds,step:f.runtimeSimulationSubstepSeconds},camera:r.camera.position.toArray(),
      mountSequence:f.firstSliceRuntimeMount.mountSequence,padTape:'Acquire with LT+A. Hold X for 48 steps. Commit with A. Release X and LT.'};
    const captures=[];
    function visual(label){
     const look=route.root.localToWorld(vec(seed.positionB).add(vec([-.09,0,0])));
     r.camera.position.copy(look).add(vec([.14,.12,.72]));r.camera.lookAt(look);r.camera.updateMatrixWorld(true);
     r.renderer.render(r.scene,r.camera);
     captures.push({label,frame:f.frame,simSeconds:f.runtimeSeconds,png:r.renderer.domElement.toDataURL('image/png')});
    }
    function measureGeometry(event) {
     const localToWorld = position => route.root.localToWorld(vec(position));
     const origin = localToWorld([0,0,0]);
     const axis = localToWorld(event.normal).sub(origin).normalize();
     r.scene.updateMatrixWorld(true);
     const bodies = event.units.map(unit => {
      const presentation = route.livingMatterMeshes.find(item => item.unitId === unit.id);
      const center = presentation.body.getWorldPosition(vec([0,0,0]));
      const physicalEnd = localToWorld(owner.get(unit.id).position);
      const physicalContact = localToWorld(unit.contactPosition);
      const posedVertices = [presentation.fragment, presentation.bud].filter(part => part.visible).flatMap(part => {
       const vertices = part.geometry.getAttribute('position');
       return Array.from({length:vertices.count}, (_, index) => center.clone().fromBufferAttribute(vertices,index).applyMatrix4(part.matrixWorld));
      });
      check(posedVertices.length > 0,'no visible grain geometry');
      const bounds = [0,1,2].map(i => [Math.min(...posedVertices.map(v=>v.getComponent(i))),Math.max(...posedVertices.map(v=>v.getComponent(i)))]);
      const visualBoundsCenter = vec(bounds.map(([lo,hi]) => (lo+hi)/2));
      const projection = posedVertices.map(v => v.clone().sub(center).dot(axis));
      return {unitId:unit.id,radius:unit.radius,physicalContact,physicalEnd,center,visualBoundsCenter,
       endCenterOffset:center.distanceTo(physicalEnd),bounds,normalSupport:[Math.min(...projection),Math.max(...projection)],posedVertices};
     });
     const [first,second] = bodies;
     const proxyDistance = second.physicalContact.clone().sub(first.physicalContact).dot(axis);
     const endDistance = second.center.clone().sub(first.center).dot(axis);
     const visualSupport = first.normalSupport[1]-second.normalSupport[0];
     const look = first.center.clone().lerp(second.center,.5);
     const cameraBefore = {position:r.camera.position.clone(),rotation:r.camera.quaternion.clone()};
     const views = [
      ['detail',[.14,.12,.72]],['far',[.45,.38,2.4]],['oblique',[1.5,.3,.5]]
     ].map(([name,offset]) => {
      r.camera.position.copy(look).add(vec(offset)); r.camera.lookAt(look); r.camera.updateMatrixWorld(true);
      const project = point => point.clone().project(r.camera);
      const [a,b]=bodies.map(body=>project(body.center));
      const bounds = bodies.map(body=>[0,1].map(i=>{
       const values=body.posedVertices.map(vertex=>project(vertex).getComponent(i));
       return [Math.min(...values),Math.max(...values)];
      }));
      const overlapNdc = [0,1].map(i=>Math.min(bounds[0][i][1],bounds[1][i][1])-Math.max(bounds[0][i][0],bounds[1][i][0]));
      return {name,offset,centerPixels: Math.hypot((a.x-b.x)*960/2,(a.y-b.y)*540/2),boundsNdc:bounds,overlapNdc};
     });
     r.camera.position.copy(cameraBefore.position);r.camera.quaternion.copy(cameraBefore.rotation);r.camera.updateMatrixWorld(true);
     return {contactId:event.id,axis:axis.toArray(),proxyDistance,proxyClearance:proxyDistance-first.radius-second.radius,
      inferredAtContactVisualClearance:proxyDistance-visualSupport,renderedStepVisualClearance:endDistance-visualSupport,
      views,bodies:bodies.map(({posedVertices,...body})=>Object.fromEntries(Object.entries(body).map(([key,value])=>[key,value?.isVector3?value.toArray():value])))};
    }
    const timeline=[];
    let geometry=null;
    let observed=false;
    for(let i=0;i<(miss?34:36);i++){
     tick();
     const event=owner.pairContacts?.at(-1)??null;
     timeline.push({frame:f.frame,step:f.runtimeSimulationSubstepIndex,seconds:f.runtimeSeconds,
       units:[owner.get(A),owner.get(B)],contactId:event?.id??null});
     if(motion&&!miss&&mode!=='disabled'&&mode!=='legacy')visual('motion-'+String(i).padStart(3,'0'));
     if(!miss&&mode!=='disabled'&&i===0)visual('approach');
     if(!miss&&event&&!observed){geometry=measureGeometry(event);visual('accepted');observed=true;}
    }
    if(!miss&&mode!=='disabled')visual('after');
    const events=structuredClone(owner.pairContacts??[]);
    check(events.length===(miss||mode==='disabled'?0:1),'unexpected mounted impact count '+events.length);
    check(owner.freeContacts.length===0,'experimental corridor leaked to native fixed surface');
    check(route.materialIdentity.totalMass()===8,'eight Q changed');
    check(receipt===JSON.stringify(r.hostConnectionReceiptLedger.snapshot({withRecords:true})),'impulse modified Host receipts');
    same(progress,[route.completed,route.pressureRead,route.ribsReleased,route.safeMatterAbsorbed,route.returnFoldReady],'progress changed at impact');
    for(const id of [A,B])same(mesh(id).position.toArray(),owner.get(id).position,'presentation diverges from trajectory');
    const retrievals=[];
    if(!miss&&mode!=='disabled'){
     for(const [i,id] of [A,B].entries()){
      acquire(id);check(!owner.has(id),'free authority persisted after grip');
      const released=release(id,i===0?[-1,0,0]:[1,0,0]);
      retrievals.push({id,newRelease:owner.free.get(id).freeContact.releaseSequence,nativeRelease:released});
     }
    }
    return {host:f.activeHostId,cell:f.activeCellId,scope:'Staged prior absorb and incoming pose; native InputSystem and route owner. Explicit admitted steps, no unassisted traversal or human Experience.',
      releases,initial,events,timeline,retrievals,geometry,trialSetup,receiptParityAtContact:true,inventoryQ:route.materialIdentity.totalMass(),captures};
   },{admission,mode,miss,motion});
   assert.deepEqual(errors,[]);
   const {captures,...data}=result;
   for(const image of captures){
    const code=Buffer.from(image.png.split(',')[1],'base64');
    assert.ok(code.length>1800);
    image.file=mode+'-'+image.label+'.png';
    await fs.writeFile(path.join(out,image.file),code);
    delete image.png;
   }
   onceModeAssertion(data,mode,miss);
   cases.push({mode,miss,...data,captures});
   console.log(mode,miss?'near miss':'contact',data.events.length,data.retrievals.length);
  }finally{await context.close();}
 }
 await fs.writeFile(path.join(out,'summary.json'),JSON.stringify({status:'PASS',revision:6,commit:rev,chromium:browser.version(),cases},null,2)+'\n');
}finally{await browser?.close();await server.close();}

function onceModeAssertion(data,mode,miss){
 assert.equal(data.inventoryQ,8);
 if(miss||mode==='disabled')return;
 assert.ok(Math.abs(data.geometry.proxyClearance)<1e-10);
 assert.ok(data.geometry.bodies.every(body=>body.endCenterOffset<1e-10));
 const [event]=data.events;
 const fixture=mode==='legacy'?'equal':'pi05:'+mode;
 const e=mode==='legacy'?0:restitution.fixtures[fixture].restitution;
 assert.equal(event.fixture,fixture);
 assert.equal(event.restitution,mode==='legacy'?undefined:e);
 assert.deepEqual(event.actualRecipientIds,admission.scope.ids);
 const [a,b]=event.units;
 const vn=(key)=>event.normal.reduce((sum,n,i)=>sum+(b[key][i]-a[key][i])*n,0);
 assert.ok(vn('incomingVelocity')<0);
 assert.ok(Math.abs(vn('outgoingVelocity')+e*vn('incomingVelocity'))<=1e-12);
 assert.ok(event.kineticEnergyAfter<=event.kineticEnergyBefore+1e-12);
 if(e===1)assert.ok(Math.abs(event.kineticEnergyAfter-event.kineticEnergyBefore)<1e-12);
 event.momentumAfter.forEach((value,i)=>assert.ok(Math.abs(value-event.momentumBefore[i])<=1e-12));
 assert.equal(data.retrievals.length,2);
}
