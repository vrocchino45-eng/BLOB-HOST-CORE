import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {RecipeDataSystem} from '../../src/data/RecipeDataSystem.js';
import {InputSystem} from '../../src/input/InputSystem.js';
import {SiltPressureRouteSystem} from '../../src/routes/SiltPressureRouteSystem.js';
import {HostConnectionReceiptLedger} from '../../src/core/HostConnectionReceiptLedger.js';
const oldFetch=globalThis.fetch;globalThis.fetch=async p=>{try{return new Response(fs.readFileSync(new URL('../../public'+p,import.meta.url)),{status:200});}catch{return new Response('',{status:404});}};
const data=new RecipeDataSystem();try{await data.loadAll();}finally{globalThis.fetch=oldFetch;}
const checks=[];const check=(name,fn)=>{try{fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',error:String(e.stack||e)});}};
const f={activeCellId:'CELL_SILT_PRESSURE_ROUTE_001',runtimeSeconds:0,frame:0,input:{}};
const scene=new THREE.Scene(),player=new THREE.Object3D(),camera=new THREE.PerspectiveCamera(60,1,.1,100),input=new InputSystem(),host=new HostConnectionReceiptLedger();
const r=new SiltPressureRouteSystem({recipeDataSystem:data,scene,playerRoot:player,frameState:f,camera,hostConnectionReceiptLedger:host});r.init();r.onRuntimeMount(f);
function tick({q=true,commit=false,x=false,absorb=false}={}){input.keys[q?'add':'delete']('KeyQ');input.keys[x?'add':'delete']('KeyX');input.mouseButtons[absorb?'add':'delete'](2);input.queued.interact=commit;f.frame++;f.runtimeSeconds+=.05;input.update(.05,f);r.update(.05,f);}
function aim(local){r.root.updateMatrixWorld(true);const core=r.root.worldToLocal(player.position.clone());camera.position.copy(r.root.localToWorld(core.clone().add(new THREE.Vector3(0,.2,3))));camera.lookAt(r.root.localToWorld(local.clone()));camera.updateMatrixWorld(true);}
check('Actual recipe initializes eight units and one crawlable shelf',()=>{assert.equal(r.livingCycle.unitCount,8);assert.equal(r.hcCrawlableSurfaceMeshes.length,1);assert.equal(r.livingCycle.recipe.releaseIntervalSeconds,5.6);assert.equal(THREE.REVISION,'179');});
// Controlled prior-progress fixture, not proof of earning the original safe packet.
r.safeMatterAbsorbed=true;for(let i=0;i<320;i++)tick({q:false});
const unit=r.livingCycle.units.find(u=>u.phase==='settled');assert.ok(unit,'natural cycle must provide a settled unit');const index=r.livingCycle.units.indexOf(unit),body=r.livingMatterMeshes[index].body;
player.position.copy(r.root.localToWorld(body.position.clone().add(new THREE.Vector3(0,.1,1))));aim(body.position);
check('Normalized Q and commit acquire grain; same full update reconciles grip owner',()=>{const age=unit.age;tick({commit:true});assert.equal(f.input.interactPressed,true);assert.equal(r.siltGrip.heldId,unit.id);assert.equal(r.materialIdentity.get(unit.id).owner,'grip');assert.equal(unit.age,age);assert.equal(r.materialIdentity.totalMass(),8);});
check('Absent commit edge retains lock and withholds grain from ecology',()=>{const age=unit.age;for(let i=0;i<5;i++)tick();assert.equal(f.input.interactPressed,false);assert.equal(r.siltGrip.heldId,unit.id);assert.equal(unit.age,age);});
const patch=new THREE.Vector3().fromArray(r.siltContact.position),core=patch.clone().add(new THREE.Vector3(0,.1,1));
player.position.copy(r.root.localToWorld(core.clone()));r.siltGripLocalOffset.copy(patch).sub(core);r.siltGrip.moveTo(patch.toArray(),core.toArray());aim(patch);tick();
for(let i=0;i<2;i++){tick({x:true});tick({x:false});}
check('Normalized Pulse release loads actual braced contact and imprint',()=>{assert.equal(r.siltContact.braced,true);assert.equal(r.siltContact.imprinted,true);assert.ok(r.siltContact.presses>=2);});
check('Commit seats grain, returns environment ownership and excludes free trajectory',()=>{tick({commit:true});assert.equal(r.siltPlateSeat.unitId,unit.id);assert.equal(r.siltGrip.heldId,null);assert.equal(r.materialIdentity.get(unit.id).owner,'environment');assert.equal(r.siltTrajectory.free.has(unit.id),false);assert.equal(host.acceptedTotal,0);});
check('Seated grain stays excluded during full route updates',()=>{const age=unit.age;for(let i=0;i<5;i++)tick();assert.equal(unit.age,age);assert.equal(r.materialIdentity.totalMass(),8);});
aim(body.position);
check('Normalized commit extracts seated grain and reconciles grip ownership',()=>{tick({commit:true});assert.equal(r.siltPlateSeat.unitId,null);assert.equal(r.siltGrip.heldId,unit.id);assert.equal(r.materialIdentity.get(unit.id).owner,'grip');assert.equal(r.siltPlateSeat.extractions,1);});
check('Core Work suppresses world input before route and releases existing grip',()=>{f.inspectionCamera={active:true,coreWorkActive:true};tick({commit:true,absorb:true});assert.equal(f.input.interactPressed,false);assert.equal(f.input.stabilizeHeld,false);assert.equal(f.input.absorbHeld,false);assert.equal(r.siltGrip.heldId,null);f.inspectionCamera={active:false};});
check('Full unmount clears local grip owners without route-exit Host effect',()=>{const before=host.acceptedTotal;f.activeCellId='CELL_SIGNAL_CHORUS_NERVE_001';tick({q:false});assert.equal(r.active,false);assert.equal(r.root.visible,false);assert.ok([...r.materialIdentity.records.values()].every(u=>u.owner!=='grip'));assert.equal(host.acceptedTotal,before);});
const report={pass:'SILT-INSTALLED-INTEGRATION1',scope:'real InputSystem.update -> full SiltPressureRouteSystem.update with actual recipes and Three.js 0.179.1; headless controlled prior-progress, Core positions and held-contact placement',threeRevision:THREE.REVISION,checks,summary:{passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length},notVerified:['browser renderer and human feel','physical device event delivery','GameRuntime/SystemRegistry overall scheduling','earning initial safe-packet progression','player movement/attachment integration','intermittent Silt visual disappearance']};
fs.writeFileSync(process.env.BLOB_BOT_REPORT,JSON.stringify(report,null,2));console.log(JSON.stringify(report.summary));if(report.summary.failed)process.exitCode=1;
