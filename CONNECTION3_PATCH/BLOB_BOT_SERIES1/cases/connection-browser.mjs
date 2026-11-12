import assert from 'node:assert/strict';
export async function connectionBrowser(page){
 await page.keyboard.down('Shift');await page.keyboard.press('Digit5');await page.keyboard.up('Shift');
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.active);
 const setup=await page.evaluate(async()=>{const r=window.__CAMERA_AUDIT_RUNTIME__;r.frameState.act1RouteHistory={graveReturned:true,graveMemoryImprintCommitted:true,siltReturned:true,siltCompleted:true};r.returnRegionEngineSystem.secondPhaseCompleted.grave=true;const {stage}=await import('/BLOB_BOT_SERIES1/fixtures/VASCULAR_II1_TEST_START.mjs');return stage();});
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.spatialCoreChemistry?.retainedPieceCount===3);
 const samples=[];
 for(const [zone,radius,factor] of [['deep_core',.32,1.15],['membrane',1.12,.85]]){
  await page.evaluate(({radius})=>{const r=window.__CAMERA_AUDIT_RUNTIME__,e=r.coreEmbodimentSystem;for(const p of [e.memoryImprintRoot,e.vascularFilamentRoot,e.siltAdaptationRoot]){const anchor=p.userData.coreWorkAnchorLocal,base=p.userData.coreWorkBasePosition;if(!anchor||!base)throw Error('Missing actual retained-piece anchor');p.userData.coreWorkOffset.copy(base).set(radius,0,0).sub(anchor).sub(base);p.position.copy(base).add(p.userData.coreWorkOffset);}}, {radius});
  await page.waitForFunction(zone=>window.__CAMERA_AUDIT_RUNTIME__.frameState.spatialCoreChemistry.counts[zone]===3,zone,{timeout:120000});
  await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,v=r.vascularRhythmRouteSystem;r.playerCore.position.copy(v.pathCurve.getPointAt(.45));});
  await page.keyboard.down('q');
  await page.waitForFunction(factor=>{const r=window.__CAMERA_AUDIT_RUNTIME__,v=r.vascularRhythmRouteSystem;if(!v.coreCoherenceResponse?.eligible||v.coreCoherenceResponse.factor!==factor)return false;window.__BLOB_W03_CAPTURE__={response:v.coreCoherenceResponse,published:r.frameState.vascularRhythmRoute.coreCoherenceResponse,core:r.frameState.corePerformance,flow:r.frameState.physicalFeel.spatialFeel,movement:r.frameState.playerKinematics,credits:r.frameState.returnRegionEngine.creditCount,receipts:r.hostConnectionReceiptLedger.acceptedTotal,folds:v.wallFolds.length};return true;},factor,{timeout:120000});
  const sample=await page.evaluate(()=>window.__BLOB_W03_CAPTURE__);
  assert.equal(sample.response.factor,factor);assert.equal(sample.published.factor,factor);assert.ok(sample.folds>0);assert.ok(Number.isFinite(sample.flow.flowStrength));assert.equal(sample.receipts,0);assert.equal(sample.credits,4);samples.push({zone,...sample});await page.keyboard.up('q');
 }
 await page.keyboard.down('q');await page.keyboard.press('f');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.active);await page.keyboard.press('g');
 await page.waitForFunction(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__;return r.frameState.inspectionCamera.coreWorkActive&&r.vascularRhythmRouteSystem.coreCoherenceResponse.factor===1;});
 const work=await page.evaluate(()=>window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.coreCoherenceResponse);assert.equal(work.eligible,false);
 await page.keyboard.up('q');await page.keyboard.press('f');await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.active);
 await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,v=r.vascularRhythmRouteSystem;r.playerCore.position.copy(v.pathCurve.getPointAt(.45)).add(r.playerCore.position.clone().set(3,0,0));});await page.keyboard.down('q');
 await page.waitForFunction(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,v=r.vascularRhythmRouteSystem;return v.pathDistance>1.28&&v.coreCoherenceResponse.factor===1&&!v.coreCoherenceResponse.eligible;});
 const outside=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__;return {response:r.vascularRhythmRouteSystem.coreCoherenceResponse,attachment:r.frameState.playerAttachment,credits:r.frameState.returnRegionEngine.creditCount};});assert.equal(outside.credits,4);await page.keyboard.up('q');
 return {scope:'Actual running publication/current/movement outputs, real F/G mode input. Earlier four credits and retained-piece offset/near-current/outside-current poses are supplied fixtures. No coherence/current/goal result forced. Fold presence is not perceptual proof; attachment is observed, not asserted as a naturally acquired supported contact.',setup,samples,work,outside};
}
