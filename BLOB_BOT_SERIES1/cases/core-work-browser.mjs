import assert from 'node:assert/strict';
export async function coreWorkBrowser(page){
 // Material conservation must be measured from an initialized regional owner,
 // not a null optional snapshot before Silt has ever mounted.
 await page.keyboard.down('Shift');await page.keyboard.press('Digit6');await page.keyboard.up('Shift');
 await page.waitForFunction(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__;return r.siltPressureRouteSystem.active&&r.siltPressureRouteSystem.materialIdentity;});
 await page.keyboard.down('Shift');await page.keyboard.press('Digit5');await page.keyboard.up('Shift');
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.active);
 const setup=await page.evaluate(async()=>{const r=window.__CAMERA_AUDIT_RUNTIME__;r.frameState.act1RouteHistory={graveReturned:true,graveMemoryImprintCommitted:true,siltReturned:true,siltCompleted:true};r.returnRegionEngineSystem.secondPhaseCompleted.grave=true;const {stage}=await import('/BLOB_BOT_SERIES1/fixtures/VASCULAR_II1_TEST_START.mjs');return stage();});
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.spatialCoreChemistry?.retainedPieceCount===3);
 // Retained anatomy can publish before the supplied history's fourth credit.
 // Wait for both actual owners rather than sampling across that setup boundary.
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.returnRegionEngine.creditCount===4);
 const shot=label=>page.evaluate(label=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;return {label,clock:f.runtimeSeconds,work:f.coreWorkManipulation,chemistry:f.spatialCoreChemistry,performance:f.corePerformance,response:r.vascularRhythmRouteSystem.coreCoherenceResponse,credits:f.returnRegionEngine.creditCount,phase:f.coreEngine.phaseCount,receipts:r.hostConnectionReceiptLedger.acceptedTotal,mass:r.siltPressureRouteSystem.materialIdentity?.totalMass()??null};},label);
 const baseline=await shot('prior-progress fixture');assert.equal(baseline.credits,4);assert.equal(baseline.phase,3);assert.equal(baseline.mass,8);const placements=[],world=[];
 for(const [zone,button] of [['deep_core','in'],['membrane','out']]){
  await page.keyboard.press('f');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.active);await page.keyboard.press('g');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.coreWorkActive);
  const visited=[];
  for(let n=0;n<3;n++){
   const selected=await page.evaluate(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.coreWorkManipulation.selectedPieceId);assert.ok(!visited.includes(selected));visited.push(selected);
   await page.keyboard.press('e');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.coreWorkManipulation.held);
   if(button==='in')await page.keyboard.down('q');else await page.mouse.down({button:'right'});
   await page.waitForFunction(({zone,button})=>{const f=window.__CAMERA_AUDIT_RUNTIME__.frameState,w=f.coreWorkManipulation;return w.selectedChemistry?.zoneId===zone&&(button==='in'?w.selectedRadius<.34:w.selectedRadius>1.08)&&f.input.absorbHeld===false&&f.input.stabilizeHeld===false;},{zone,button},{timeout:45000});
   if(button==='in')await page.keyboard.up('q');else await page.mouse.up({button:'right'});
   await page.keyboard.press('e');await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.frameState.coreWorkManipulation.held);
   placements.push(await shot(zone+' placed '+selected));
   if(n<2){await page.keyboard.press('ArrowRight');await page.waitForFunction(prior=>window.__CAMERA_AUDIT_RUNTIME__.frameState.coreWorkManipulation.selectedPieceId!==prior,selected);}
  }
  await page.waitForFunction(zone=>window.__CAMERA_AUDIT_RUNTIME__.frameState.spatialCoreChemistry.counts[zone]===3,zone);
  await page.keyboard.press('f');await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.active);
  await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,v=r.vascularRhythmRouteSystem;r.playerCore.position.copy(v.pathCurve.getPointAt(.45)).add(v.entryAnchor);});
  await page.keyboard.down('q');await page.waitForFunction(zone=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;return r.vascularRhythmRouteSystem.coreCoherenceResponse?.eligible&&f.spatialCoreChemistry.counts[zone]===3;},zone);
  const start=await shot(zone+' world held start');await page.waitForFunction(t=>window.__CAMERA_AUDIT_RUNTIME__.frameState.runtimeSeconds>=t+.6,start.clock);const end=await shot(zone+' world held end');
  world.push({zone,start,end});await page.keyboard.up('q');
 }
 for(const row of placements){assert.equal(row.work.held,false);assert.equal(row.response.factor,1);assert.equal(row.response.eligible,false);assert.equal(row.credits,baseline.credits);assert.equal(row.phase,baseline.phase);assert.equal(row.receipts,baseline.receipts);assert.equal(row.mass,baseline.mass);}
 for(const row of world){assert.equal(row.end.chemistry.counts[row.zone],3);assert.equal(row.end.credits,baseline.credits);assert.equal(row.end.phase,baseline.phase);assert.equal(row.end.receipts,baseline.receipts);assert.equal(row.end.mass,baseline.mass);assert.ok(row.end.performance.endurance.reserve01<=row.start.performance.endurance.reserve01);}
 assert.ok(world[0].end.response.factor>1);assert.ok(world[1].end.response.factor<1);
 return {scope:'Actual keyboard/mouse → InputSystem → Core Work selection/grab/depth/place → live chemistry/radial → Vascular response. Prior returned pieces/four credits and in-current player sampling pose are explicit fixtures. No piece offsets, counts, physiology, reserve or factors are assigned by the test. No physical gamepad or naturally earned campaign claim.',setup,baseline,placements,world};
}
