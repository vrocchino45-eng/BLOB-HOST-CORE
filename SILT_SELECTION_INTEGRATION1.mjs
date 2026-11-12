import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SiltPressureRouteSystem} from './src/routes/SiltPressureRouteSystem.js';
import {MaterialIdentityLedger} from './src/ecology/MaterialIdentityLedger.js';
import {HostConnectionReceiptLedger} from './src/core/HostConnectionReceiptLedger.js';
const checks=[];function check(name,fn){try{fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',error:String(e.stack||e)});}}
function fixture({positions=[[0,0,-1.4],[.6,0,-.3]],seated=false,translated=false}={}){
 const f={frame:1,runtimeSeconds:1,activeCellId:'CELL_SILT_PRESSURE_ROUTE_001',input:{},siltMaterialAim:{}};
 const scene=new THREE.Scene(),playerRoot=new THREE.Object3D(),camera=new THREE.PerspectiveCamera(60,1,.1,100);
 const r=new SiltPressureRouteSystem({recipeDataSystem:{},scene,playerRoot,frameState:f,camera,
  hostConnectionReceiptLedger:new HostConnectionReceiptLedger()});
 r.root=new THREE.Group();scene.add(r.root);
 if(translated){r.root.position.set(10,3,-8);r.root.rotation.y=.7;}
 r.livingCycle={active:true,unitCount:8,units:Array.from({length:8},(_,i)=>({id:`silt-grain-0${i+1}`,mass:1,phase:i<positions.length?'settled':'reservoir'}))};
 r.livingMatterMeshes=r.livingCycle.units.map((u,i)=>{const body=new THREE.Object3D();body.position.fromArray(positions[i]??[0,0,-10]);body.visible=i<positions.length;r.root.add(body);return {body};});
 r.materialIdentity=new MaterialIdentityLedger({originRegion:'silt',originSignature:'fixture'});
 for(const u of r.livingCycle.units)r.materialIdentity.register({id:u.id,mass:u.mass});
 r.localPlayer.set(0,0,0);r.root.updateMatrixWorld(true);
 playerRoot.position.copy(r.root.localToWorld(new THREE.Vector3()));
 function aim(point){camera.position.copy(r.root.localToWorld(new THREE.Vector3(0,0,3)));camera.lookAt(r.root.localToWorld(new THREE.Vector3(...point)));camera.updateMatrixWorld(true);}
 aim(positions[0]);
 if(seated){const p=positions[0];assert.ok(r.siltPlateSeat.trySeat({unitId:'silt-grain-01',heldPosition:p,isBraced:true,imprinted:true,actuallyTouching:true}));}
 function tick(input={stabilizeHeld:true,interactPressed:true}){f.input=input;r.updateSiltGrip(f,.05);return f.siltMaterialAim;}
 return {r,f,aim,tick};
}
check('Camera alignment wins over a nearer off-axis grain',()=>{const {r,tick}=fixture();const a=tick();assert.equal(a.heldId,'silt-grain-01');assert.equal(r.siltGrip.heldId,'silt-grain-01');});
check('Translated and rotated route selects the same local grain',()=>{const {tick}=fixture({translated:true});assert.equal(tick().heldId,'silt-grain-01');});
check('Outside grip range cannot become a camera candidate',()=>{const {tick}=fixture({positions:[[0,0,-2.21]]});const a=tick();assert.equal(a.candidateId,null);assert.equal(a.heldId,null);});
check('Candidate outside aim cone is rejected',()=>{const {tick,aim}=fixture({positions:[[0,0,-1]]});aim([10,0,3]);assert.equal(tick().heldId,null);});
check('Hidden visual body cannot be acquired',()=>{const {r,tick}=fixture({positions:[[0,0,-1]]});r.livingMatterMeshes[0].body.visible=false;assert.equal(tick().heldId,null);});
check('Grip acquisition needs fresh commit and stabilize',()=>{for(const input of [{stabilizeHeld:true,interactPressed:false},{stabilizeHeld:false,interactPressed:true}]){const {tick}=fixture();assert.equal(tick(input).heldId,null);}});
check('Aiming at another grain does not redirect the committed grip',()=>{
 const {r,tick,aim}=fixture({positions:[[0,0,-1.4],[.8,0,-.2]]});tick();aim([.8,0,-.2]);const a=tick({stabilizeHeld:true,interactPressed:false});
 assert.equal(a.candidateId,'silt-grain-02');assert.equal(a.heldId,'silt-grain-01');assert.equal(a.lockedId,'silt-grain-01');assert.equal(r.siltGrip.heldId,'silt-grain-01');
});
check('New unseated grip leaves outward headroom without moving the Core',()=>{
 const {r,tick}=fixture({positions:[[0,0,-2]]});const before=r.playerRoot.position.clone();tick();assert.ok(Math.abs(r.siltGripLocalOffset.length()-1.15)<1e-8);
 assert.deepEqual(r.playerRoot.position,before);assert.equal(r.materialIdentity.totalMass(),8);
});
check('Close grain is not pushed outward to the preferred radius',()=>{const {r,tick}=fixture({positions:[[0,0,-.5]]});tick();assert.ok(Math.abs(r.siltGripLocalOffset.length()-.5)<1e-8);});
check('Seated grain inside extraction leash keeps exact position on accepted grip',()=>{
 const {r,tick}=fixture({positions:[[0,0,-1]],seated:true});const before=[...r.siltPlateSeat.position];assert.equal(tick().heldId,'silt-grain-01');
 assert.equal(r.siltPlateSeat.unitId,null);assert.deepEqual(r.siltGrip.position,before);assert.equal(r.siltPlateSeat.extractions,1);
 assert.equal(r.hostConnectionReceiptLedger.acceptedTotal,0);assert.ok(r.siltTrajectory.held.has('silt-grain-01'));
});
check('Seated grain outside 1.59 extraction gate remains seated',()=>{const {r,tick}=fixture({positions:[[0,0,-1.6]],seated:true});assert.equal(tick().heldId,null);assert.equal(r.siltPlateSeat.unitId,'silt-grain-01');assert.equal(r.siltPlateSeat.extractions,0);});
check('Extraction does not repeat while commit is absent',()=>{const {r,tick}=fixture({positions:[[0,0,-1]],seated:true});tick();for(let i=0;i<10;i++)tick({stabilizeHeld:true,interactPressed:false});assert.equal(r.siltPlateSeat.extractions,1);assert.equal(r.siltGrip.heldId,'silt-grain-01');});
const report={pass:'SILT-SELECTION-INTEGRATION1',scope:'full production route module evaluation and real updateSiltGrip calls with real Three.js camera/transforms and controlled scene/units; no renderer or authored data',
 threeRevision:THREE.REVISION,routeSHA256:createHash('sha256').update(readFileSync(new URL('./src/routes/SiltPressureRouteSystem.js',import.meta.url))).digest('hex'),checks,
 summary:{passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length},
 notVerified:['installed dependency version parity','actual authored geometry/recipe','renderer, visual quality and occlusion','InputSystem -> route timing and full route.update','post-grip ledger reconciliation loop','GSL rapid-release live acceptance','intermittent Silt disappearance']};
console.log(JSON.stringify(report,null,2));if(report.summary.failed)process.exitCode=1;
