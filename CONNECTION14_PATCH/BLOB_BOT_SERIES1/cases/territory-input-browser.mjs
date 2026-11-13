import assert from 'node:assert/strict';
export async function territoryInputBrowser(page){
 await page.keyboard.down('Shift');await page.keyboard.press('Digit5');await page.keyboard.up('Shift');
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.active);
 const result=await page.evaluate(()=>{
  const r=window.__CAMERA_AUDIT_RUNTIME__,v=r.vascularRhythmRouteSystem,f=r.frameState,i=r.inputSystem,t=v.territoryExpansion;
  r.renderer.setAnimationLoop(null);i.keys.clear();i.mouseButtons.clear();f.inspectionCamera={active:false,coreWorkActive:false};
  const initial={mass:r.siltPressureRouteSystem.materialIdentity?.totalMass()??null,credits:f.returnRegionEngine.creditCount,receipts:r.hostConnectionReceiptLedger.acceptedTotal};
  function near(){t.root.updateWorldMatrix(true,false);r.playerCore.position.copy(t.root.localToWorld(t.sites[0].point.clone()));}
  function tick(){f.frame++;f.runtimeSeconds+=.05;i.update(.05,f);v.update(.05,f);}
  function pulse(){i.keys.add('KeyX');tick();i.keys.delete('KeyX');tick();}
  near();tick();const seeded=t.observationCount.pulse;pulse();const first={reads:t.observationCount.pulse,counter:f.input.pulseEventId,pressed:f.input.pulsePressed};
  f.activeCellId='CELL_SIGNAL_CHORUS_NERVE_001';tick();const tissueBefore=t.sites.map(s=>({imprint:s.imprint,strain:s.strain,void:s.void,reads:s.observations}));
  for(let n=0;n<3;n++)pulse();tick();const elsewhere={reads:t.observationCount.pulse,counter:f.input.pulseEventId,pressed:f.input.pulsePressed};
  f.activeCellId='CELL_VASCULAR_RHYTHM_ROUTE_001';v.onRuntimeMount(f);near();tick();
  const returned={reads:t.observationCount.pulse,counter:f.input.pulseEventId,pressed:f.input.pulsePressed,cursor:t.lastPulseEventId,tissue:t.sites.map(s=>({imprint:s.imprint,strain:s.strain,void:s.void,reads:s.observations}))};
  pulse();const fresh={reads:t.observationCount.pulse,counter:f.input.pulseEventId,pressed:f.input.pulsePressed};
  f.inspectionCamera={active:true,coreWorkActive:true};pulse();const work={reads:t.observationCount.pulse,counter:f.input.pulseEventId,pressed:f.input.pulsePressed};
  f.inspectionCamera={active:false,coreWorkActive:false};pulse();const resumed={reads:t.observationCount.pulse,counter:f.input.pulseEventId,pressed:f.input.pulsePressed};
  return {scope:'Actual InputSystem key state → canonical released Pulse → real Vascular route lifecycle and territory update. Paused renderer/registry, manual bounded ticks, direct cells, near-site player poses and Core Work context are fixtures. No ordinary navigation, physical gamepad or fresh campaign claim.',seeded,first,tissueBefore,elsewhere,returned,fresh,work,resumed,initial,final:{mass:r.siltPressureRouteSystem.materialIdentity?.totalMass()??null,credits:f.returnRegionEngine.creditCount,receipts:r.hostConnectionReceiptLedger.acceptedTotal}};
 });
 assert.equal(result.first.pressed,true);assert.equal(result.first.reads,result.seeded+1);assert.equal(result.elsewhere.reads,result.first.reads);assert.ok(result.elsewhere.counter>result.first.counter);assert.equal(result.elsewhere.pressed,false);
 assert.equal(result.returned.pressed,false);assert.equal(result.returned.reads,result.first.reads);assert.equal(result.returned.cursor,result.elsewhere.counter);assert.deepEqual(result.returned.tissue,result.tissueBefore);
 assert.equal(result.fresh.reads,result.first.reads+1);assert.equal(result.work.pressed,false);assert.equal(result.work.reads,result.fresh.reads);assert.equal(result.work.counter,result.fresh.counter);assert.equal(result.resumed.reads,result.fresh.reads+1);assert.deepEqual(result.initial,result.final);return result;
}
