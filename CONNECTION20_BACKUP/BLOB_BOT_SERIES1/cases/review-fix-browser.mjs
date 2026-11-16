import assert from 'node:assert/strict';

export async function reviewFixBrowser(page){
 const HUB='CELL_SIGNAL_CHORUS_NERVE_001';
 async function warp(slot){await page.keyboard.down('Shift');await page.keyboard.press('Digit'+slot);await page.keyboard.up('Shift');}
 await warp(6);
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.siltPressureRouteSystem.materialIdentity);
 // Explicit prior Grave completion/return fixture, not earned progression.
 await page.evaluate(()=>{
  const r=window.__CAMERA_AUDIT_RUNTIME__,g=r.graveMemoryRouteSystem,f=r.frameState;
  g.completed=true;g.safeMemoryTransferComplete=true;g.graveMemoryImprintCommitted=true;g.returnFoldReady=true;
  f.act1RouteHistory={...f.act1RouteHistory,graveEntered:true,graveReturned:true,graveMemoryImprintCommitted:true,graveEntryCount:2,routeStates:{...f.act1RouteHistory?.routeStates,grave_memory_route:{entered:true,returned:true,completed:true,entryCount:2,returnCount:1}}};
  const h=r.hubChamberFoundationSystem,original=h.evaluateSpatialReadability;
  h.evaluateSpatialReadability=function(...args){return {...original.apply(this,args),verified:false};};
 });
 const crossings=[];
 for(const [id,cell] of [['vascular_route','CELL_VASCULAR_RHYTHM_ROUTE_001'],['silt_burrow_route','CELL_SILT_PRESSURE_ROUTE_001'],['grave_memory_route','CELL_GRAVE_MEMORY_RESIDUE_BED_001']]){
  await page.evaluate(id=>window.__REVIEW_FIX_STAGE__=id,id);
  await warp(3);
  await page.waitForFunction(()=>{const f=window.__CAMERA_AUDIT_RUNTIME__.frameState;return f.activeCellId==='CELL_SIGNAL_CHORUS_NERVE_001'&&f.hubChamberFoundation?.active;});
  await page.waitForFunction(id=>{const f=window.__CAMERA_AUDIT_RUNTIME__.frameState;return f.hubChamberFoundation.routes.some(b=>b.id===id&&b.activeRoute&&b.destinationMounted&&b.playableReady&&!b.gameplayPending);},id);
  await page.evaluate(id=>{const r=window.__CAMERA_AUDIT_RUNTIME__,b=r.frameState.hubChamberFoundation.routes.find(b=>b.id===id);r.playerCore.position.fromArray(b.position);r.playerMovementController?.velocity?.set(0,0,0);},id);
  await page.waitForFunction(id=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState,b=f.hubChamberFoundation.routes.find(b=>b.id===id);r.playerCore.position.fromArray(b.position);return f.hubRouteCommit?.routeId===id&&f.hubRouteCommit.available;},id);
  const before=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;return {cell:f.activeCellId,presentationComplete:f.hubChamberFoundation.completed,commit:f.hubRouteCommit,credits:f.returnRegionEngine.creditCount,receipts:r.hostConnectionReceiptLedger.acceptedTotal,mass:r.siltPressureRouteSystem.materialIdentity.totalMass()};});
  assert.equal(before.cell,HUB);assert.equal(before.presentationComplete,false);
  await page.keyboard.press('e');
  await page.waitForFunction(cell=>window.__CAMERA_AUDIT_RUNTIME__.frameState.activeCellId===cell,cell,{timeout:30000});
  // Let the registry actually unmount Hub before the next debug re-entry. A
  // same-frame warp would skip that normal lifecycle boundary and retain its latch.
  await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.hubRouteCommit?.active===false);
  const after=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;return {cell:f.activeCellId,request:f.hubRouteCommitRequest,credits:f.returnRegionEngine.creditCount,receipts:r.hostConnectionReceiptLedger.acceptedTotal,mass:r.siltPressureRouteSystem.materialIdentity.totalMass()};});
  assert.equal(after.request.routeId,id);assert.equal(after.request.consequenceAuthority,'LocalCellBoundaryMorphSystem');assert.equal(after.credits,before.credits);assert.equal(after.receipts,before.receipts);assert.equal(after.mass,before.mass);crossings.push({id,before,after});
 }
 await page.waitForFunction(()=>{const f=window.__CAMERA_AUDIT_RUNTIME__.frameState;return f.graveResonanceGameplay?.active&&f.guidePrompt?.contentOwner==='GraveResonanceGameplaySystem';});
 const guidance=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;return {regional:f.graveResonanceGameplay,guide:f.guidePrompt,hud:f.playtestHud,visible:document.getElementById('playtest-hud-panel').textContent};});
 assert.equal(guidance.guide.objectiveLine,guidance.regional.nextAction);assert.ok(guidance.visible.includes(guidance.regional.nextAction));assert.ok(!guidance.visible.includes('The memory pearl is retained. Return'));
 return {scope:'Running registry and real keyboard E → InputSystem → commitment → boundary crossing for three routes. Debug platform entries, prior Grave completion/return, near-body player poses, and forced-false presentation verification are explicit fixtures. No from-zero campaign, physical controller or human readability claim. Route readiness/candidates, commitment events, crossing state, credits, receipts and mass are observed rather than injected.',crossings,guidance};
}
