import assert from 'node:assert/strict';
export async function currentVisualBrowser(page){
 await page.keyboard.down('Shift');await page.keyboard.press('Digit5');await page.keyboard.up('Shift');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.active);
 const result=await page.evaluate(()=>{
  const r=window.__CAMERA_AUDIT_RUNTIME__,v=r.vascularRhythmRouteSystem,base=r.frameState,ids=v.currentMotes.map(m=>m.uuid),rows=[],sample={distance:0,progress:.45,tangent:v.pathCurve.getTangentAt(.45)};
  const saved={completed:v.completed,active:v.active,stabilizing:v.stabilizing,calm:v.traversalStabilizeCalm,pulse:v.traversalPulseWake,absorb:v.traversalAbsorbShear,phase:v.currentMoteTravelPhase,rate:v.currentMoteVisualRate,ratio:v.currentMoteCoherenceRatio,coherence:v.coreCoherenceResponse,pressure:v.hostPressureResponse};
  try{
  const initialMass=r.siltPressureRouteSystem.materialIdentity?.totalMass()??null;
  for(const coherence of [1.382,.665,1]){
   const frame={...base,input:{stabilizeHeld:true},inspectionCamera:{coreWorkActive:false},corePerformance:{active:true,owner:'CoreRadialPerformanceSystem',verbModifiers:{stabilize:{coherenceMultiplier:coherence}}}};
   v.currentMoteTravelPhase=0;v.stabilizing=true;v.traversalStabilizeCalm=.8;v.traversalPulseWake=0;v.traversalAbsorbShear=0;v.completed=false;
   v.applyDynamicCurrent(frame,sample);const physical=JSON.stringify(frame.physicalFeel);for(let i=0;i<10;i++)v.updateCurrentMoteTravel(.02,frame);v.animate(0,frame,sample);
   const held={phase:v.currentMoteTravelPhase,ratio:v.currentMoteCoherenceRatio,rate:v.currentMoteVisualRate,positions:v.currentMotes.map(m=>m.position.toArray()),progress:v.currentMotes.map(m=>m.userData.renderedTravelProgress)};
   const physicsUnchanged=physical===JSON.stringify(frame.physicalFeel);
   frame.corePerformance.verbModifiers.stabilize.coherenceMultiplier=coherence===1.382?.665:1.382;v.applyDynamicCurrent(frame,sample);v.updateCurrentMoteTravel(0,frame);for(let i=0;i<4;i++)v.animate(0,frame,sample);
   const unchanged={phase:v.currentMoteTravelPhase,positions:v.currentMotes.map(m=>m.position.toArray())};
   v.completed=true;v.updateCurrentMoteTravel(0,frame);v.animate(0,frame,sample);const reversedPhase=v.currentMoteTravelPhase;v.updateCurrentMoteTravel(.02,frame);const reversedNext=v.currentMoteTravelPhase;
   rows.push({coherence,held,unchanged,reversedPhase,reversedNext,particleIds:v.currentMotes.map(m=>m.uuid),physicsUnaffectedByVisualUpdates:physicsUnchanged});
  }
  const frame={...base,activeCellId:'CELL_SIGNAL_CHORUS_NERVE_001'},phase=v.currentMoteTravelPhase;v.onRuntimeUnmount(frame);v.update(.05,frame);frame.runtimeSeconds+=100;v.updateCurrentMoteTravel(100,frame);const hiddenPhase=v.currentMoteTravelPhase;frame.activeCellId='CELL_VASCULAR_RHYTHM_ROUTE_001';v.onRuntimeMount(frame);return {rows,ids,phase,hiddenPhase,remountedPhase:v.currentMoteTravelPhase,initialMass,mass:r.siltPressureRouteSystem.materialIdentity?.totalMass()??null,credits:base.returnRegionEngine.creditCount,receipts:r.hostConnectionReceiptLedger.acceptedTotal};
  }finally{v.completed=saved.completed;v.active=saved.active;v.stabilizing=saved.stabilizing;v.traversalStabilizeCalm=saved.calm;v.traversalPulseWake=saved.pulse;v.traversalAbsorbShear=saved.absorb;v.currentMoteTravelPhase=saved.phase;v.currentMoteVisualRate=saved.rate;v.currentMoteCoherenceRatio=saved.ratio;v.coreCoherenceResponse=saved.coherence;v.hostPressureResponse=saved.pressure;v.setVisible(saved.active);}
 });
 assert.equal(result.ids.length,24);assert.ok(result.rows[0].held.phase<result.rows[1].held.phase);assert.notDeepEqual(result.rows[0].held.positions,result.rows[1].held.positions);assert.equal(result.rows[2].held.ratio,1);
 for(const row of result.rows){assert.equal(row.physicsUnaffectedByVisualUpdates,true);assert.equal(row.held.phase,row.unchanged.phase);assert.deepEqual(row.held.positions,row.unchanged.positions);assert.equal(row.reversedPhase,row.held.phase);assert.ok(row.reversedNext<row.reversedPhase);assert.deepEqual(row.particleIds,result.ids);}
 assert.equal(result.phase,result.hiddenPhase);assert.equal(result.phase,result.remountedPhase);assert.equal(result.mass,result.initialMass);assert.equal(result.credits,0);assert.equal(result.receipts,0);
 return {scope:'Matched actual current/visual owner calls and object positions inside a running browser. Coherence, intent, calm, path, starting phase, completion-direction flag and hidden-clock jump are explicit fixtures. No renderer/camera replacement, new gameplay result, naturally earned placement or human perception claim.',...result};
}
