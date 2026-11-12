import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {siltArc} from './silt-driver.mjs';
import {steer} from './steering.mjs';
import {simulationClock} from './simulation-clock.mjs';
export async function runArc(page,{reportDir,errors}){
 const stages=[],held=new Set(),timing=simulationClock(page);
 async function keys(want){const next=new Set(want);for(const k of held)if(!next.has(k)){await page.keyboard.up(k);held.delete(k);}for(const k of next)if(!held.has(k)){await page.keyboard.down(k);held.add(k);}}
 await page.keyboard.down('Shift');await page.keyboard.press('Digit5');await page.keyboard.up('Shift');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.activeCellId==='CELL_VASCULAR_RHYTHM_ROUTE_001' && window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.active);
 await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__;r.frameState.act1RouteHistory={graveReturned:true,graveMemoryImprintCommitted:true,siltReturned:true,siltCompleted:true};r.returnRegionEngineSystem.secondPhaseCompleted.grave=true;});
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.hostCondition.phase==='holding',null,{timeout:240000});
 const setup=await page.evaluate(async()=>{const m=await import('/BLOB_BOT_SERIES1/fixtures/VASCULAR_II1_TEST_START.mjs');return m.stage();});

 const shot=label=>page.evaluate(label=>{const r=window.__CAMERA_AUDIT_RUNTIME__,v=r.vascularRhythmRouteSystem;return {label,cell:r.frameState.activeCellId,goal:r.frameState.vascularRhythmRoute.returnHandoff,credits:r.frameState.returnRegionEngine.creditCount,engine:r.frameState.coreEngine.phaseCount,event:r.frameState.returnRegionCompletionEvent,position:r.playerCore.position.toArray(),source:v.valves[1].getWorldPosition(r.playerCore.position.clone()).toArray(),receiver:v.valves[0].getWorldPosition(r.playerCore.position.clone()).toArray(),visual:{root:v.returnHandoffVisuals.root.visible,packet:v.returnHandoffVisuals.packet.visible,packetPosition:v.returnHandoffVisuals.packet.position.toArray()},nextAction:r.frameState.vascularRhythmRoute.nextAction,host:r.frameState.hostCondition,hostResponse:r.frameState.vascularRhythmRoute.hostPressureResponse};},label);
 await page.waitForTimeout(250);stages.push(await shot('qualified source'));
 fs.writeFileSync(path.join(reportDir, 'B03-initial_source.json'),JSON.stringify(stages.at(-1),null,2));
 await keys(['q']);try{await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.returnHandoff.sourceHold>=.18,null,{timeout:120000});}catch(e){const diag=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,v=r.vascularRhythmRouteSystem;return {input:r.frameState.input,inspection:r.frameState.inspectionCamera,goal:v.returnHandoff.snapshot({eligible:v.returnHandoffEligible(r.frameState)}),distance:v.returnHandoffSourceDistance,root:v.root.position.toArray(),scale:v.root.scale.toArray(),source:v.returnHandoffSource.toArray(),entry:v.entryAnchor.toArray(),player:r.playerCore.position.toArray(),history:r.frameState.act1RouteHistory,keys:[...r.inputSystem.keys]};});fs.writeFileSync(path.join(reportDir, 'B03-source_timeout.json'),JSON.stringify(diag,null,2));throw e;}await page.keyboard.down('x');await timing.advance(.1);await page.keyboard.up('x');
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.returnHandoff.handoffId,null,{timeout:120000});await keys([]);stages.push(await shot('projected current'));
 
 let vascularSteering;
 try{vascularSteering=await steer(page,'vascular');}finally{const trace=await page.evaluate(()=>{const {cancel,...s}=window.__BLOB_BOT_STEERING__??{};return s;});fs.writeFileSync(path.join(reportDir,'B03-vascular-steering.json'),JSON.stringify(trace,null,2));}
 const navigation=vascularSteering.samples;
 stages.push(await shot('settled and credited'));
 const vascularFinal=stages.at(-1);await keys([]);
 await page.keyboard.down('Shift');await page.keyboard.press('Digit6');await page.keyboard.up('Shift');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.siltPressureRouteSystem.active && window.__CAMERA_AUDIT_RUNTIME__.frameState.activeCellId==='CELL_SILT_PRESSURE_ROUTE_001');
 let siltResult;
 try{siltResult=await siltArc(page);}finally{const trace=await page.evaluate(()=>{const {cancel,...s}=window.__BLOB_BOT_SILT__??{};return s;});fs.writeFileSync(path.join(reportDir,'B03-silt-driver.json'),JSON.stringify(trace,null,2));}
 const {setup:siltSetup,contactFixture,stages:siltStages}=siltResult;
 let hubSteering;
 try{hubSteering=await steer(page,'hub');}finally{const trace=await page.evaluate(()=>{const {cancel,...s}=window.__BLOB_BOT_STEERING__??{};return s;});fs.writeFileSync(path.join(reportDir,'B03-return-steering.json'),JSON.stringify(trace,null,2));}
 const returnNavigation=hubSteering.samples;
 const returned=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__;return {cell:r.frameState.activeCellId,returnReady:r.frameState.siltPressureRoute.returnFoldReady,credits:r.frameState.returnRegionEngine.creditCount,engine:r.frameState.coreEngine.phaseCount};});

 assert.equal(returned.cell,'CELL_SIGNAL_CHORUS_NERVE_001');assert.equal(returned.credits,6);assert.equal(returned.engine,6);
 assert.equal(vascularFinal.credits,5);assert.equal(vascularFinal.engine,3);assert.ok(siltStages.every(x=>x.mass===8));
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.corePerformance.endurance.reserve01>.25,null,{timeout:120000});
 const state=label=>page.evaluate(label=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;return {label,cell:f.activeCellId,credit:f.returnRegionEngine.creditCount,phase:f.coreEngine.phaseCount,mass:r.siltPressureRouteSystem.materialIdentity.totalMass(),siltGoal:r.siltPressureRouteSystem.returnRoundTrip.snapshot(),host:r.hostConnectionReceiptLedger.acceptedTotal,performance:f.corePerformance,inspection:f.inspectionCamera,hud:document.body.innerText};},label);
 const followup=[await state('Hub idle after both actual goals')];
 await page.keyboard.down('q');await page.mouse.down({button:'right'});await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.corePerformance.endurance.coordination.active);followup.push(await state('paired reserve after actual regional publications'));
 await page.keyboard.press('f');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.active);await page.keyboard.press('g');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.coreWorkActive);await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.frameState.corePerformance.endurance.coordination.active);followup.push(await state('Core Work suspension after earned six'));
 await page.keyboard.up('q');await page.mouse.up({button:'right'});await page.keyboard.press('f');await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.active);followup.push(await state('world return retains six'));
 for(const x of followup){assert.equal(x.credit,6);assert.equal(x.phase,6);assert.equal(x.mass,8);assert.equal(x.siltGoal.completed,true);assert.equal(x.siltGoal.completionSequence,1);assert.equal(x.host,followup[0].host);}assert.ok(followup[1].hud.includes('paired drain'));assert.equal(errors.length,0);
 const result={pass:'HOST-CAUSE1-INTEGRATION',scope:'Full actual Vascular II and Silt II owner publications, return traversal and reserve/mode integration. Earlier four credits, source/contact poses remain declared fixtures. No six-credit completion or reserve result was forced.',followup,setup,siltSetup,contactFixture,steeringDelivery:vascularSteering.delivery,vascularStages:stages,siltStages,navigation,returnNavigation,returned,errors};fs.writeFileSync(path.join(reportDir, 'B03-browser.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({silt:siltStages.map(x=>({label:x.label,stage:x.goal.stage,credit:x.credits,engine:x.engine,mass:x.mass})),errors},null,2));

return result;
}
