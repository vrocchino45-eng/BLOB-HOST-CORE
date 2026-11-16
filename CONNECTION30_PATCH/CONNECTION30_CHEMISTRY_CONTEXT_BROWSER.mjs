import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {createServer} from 'vite';import {sourceIdentity} from './BLOB_BOT_SERIES1/source-identity.mjs';import {reviewFixBrowser} from './BLOB_BOT_SERIES1/cases/review-fix-browser.mjs';
const require=createRequire(import.meta.url);let api;try{api=require('playwright');}catch{api=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));}
const root=process.cwd(),identity=sourceIdentity(root),server=await createServer({root,server:{host:'127.0.0.1',port:0},logLevel:'warn'}),errors=[];let browser,page;
try{
 await server.listen();browser=await api.chromium.launch({headless:true,...(process.env.BLOB_BOT_CHROMIUM_EXECUTABLE?{executablePath:process.env.BLOB_BOT_CHROMIUM_EXECUTABLE}:{}),args:JSON.parse(process.env.BLOB_BOT_CHROMIUM_ARGS??'[]')});page=await browser.newPage({viewport:{width:960,height:540},acceptDownloads:true});page.on('pageerror',e=>errors.push(String(e)));
 await page.route('**/src/main.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nwindow.__CAMERA_AUDIT_RUNTIME__=runtime;\n'});});await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/?bot1d11c=1`,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__?.isRunning);
 await page.evaluate(()=>{const c=window.__CAMERA_AUDIT_RUNTIME__.firstSliceTransitionCoordinator;c.autoSchedule=false;if(c.scheduleHandle!=null){cancelIdleCallback(c.scheduleHandle);clearTimeout(c.scheduleHandle);}c.scheduled=false;});await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.firstSliceTransitionCoordinator.running,null,{timeout:90000});
 async function installTrace(){return await page.evaluate(async()=>{
  const r=window.__CAMERA_AUDIT_RUNTIME__,m=await import('/src/chemistry/LocalChemistryContextSystem.js');r.__contextInspector=m.inspectLocalChemistryContext;r.__contextReader=m.readLocalChemistryContext;r.__contextTrace=[];
  const telemetry=r.sessionTelemetrySystem,original=telemetry.update;let lastKey=null;
  telemetry.update=function(dt,f){const result=original.call(this,dt,f),view=m.inspectLocalChemistryContext(f),key=[f.activeCellId,view.active,view.reason,r.__REVIEW_FIX_STAGE__,f.hubRouteCommitFlight?.active].join(':');if(key!==lastKey){lastKey=key;r.__contextTrace.push({frame:f.frame,time:f.runtimeSeconds,cell:f.activeCellId,rawCell:f.localChemistryContext?.cellId,active:view.active,reason:view.reason,flux:view.domains?.flux??null,boundaryActive:Boolean(f.localCellBoundaryMorph?.active),flightActive:Boolean(f.hubRouteCommitFlight?.active)});if(r.__contextTrace.length>128)r.__contextTrace.shift();}return result;};
  const order=r.registry.updateOrder;return {autoPreparationEnabled:r.firstSliceTransitionCoordinator.autoSchedule,contextRegistrations:order.filter(id=>id==='localChemistryContextSystem').length,contextIndex:order.indexOf('localChemistryContextSystem'),morphIndex:order.indexOf('secondLocalCellMorphSystem'),bondIndex:order.indexOf('bondSystem'),boundaryIndex:order.indexOf('localCellBoundaryMorphSystem')};
 });}
 const setup=await installTrace();
 assert.equal(setup.contextRegistrations,1);assert.ok(setup.morphIndex<setup.contextIndex&&setup.contextIndex<setup.bondIndex&&setup.bondIndex<setup.boundaryIndex);
 const debugMounts=[];
 for(const [slot,cell] of [[5,'CELL_VASCULAR_RHYTHM_ROUTE_001'],[6,'CELL_SILT_PRESSURE_ROUTE_001'],[4,'CELL_GRAVE_MEMORY_RESIDUE_BED_001']]){
  await page.keyboard.down('Shift');await page.keyboard.press('Digit'+slot);await page.keyboard.up('Shift');await page.waitForFunction(id=>{const r=window.__CAMERA_AUDIT_RUNTIME__;return r.frameState.activeCellId===id&&r.__contextReader(r.frameState)?.cellId===id;},cell);
  debugMounts.push(await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState,c=r.__contextReader(f),recipe=r.recipeDataSystem.get('localCellRecipes',f.activeCellId);return {cell:f.activeCellId,context:c,recipe:recipe.chemistryField,legacy:f.chemistry};}));
 }
 for(const row of debugMounts){assert.deepEqual(row.context.domains,row.recipe);assert.equal(row.context.recipeId,row.cell);}
 // Existing U02 driver uses actual E-input commitment and boundary crossing.
 // Its debug entries/prior Grave history/near-body poses remain declared fixtures.
 // Use a fresh runtime for the ordinary commitment driver. Debug visits in
 // the preceding scenario must not become its prior-history assumptions.
 await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/?bot1d11c=1`,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__?.isRunning);

 const transitionSetup=await installTrace();assert.equal(transitionSetup.contextRegistrations,1);assert.equal(transitionSetup.autoPreparationEnabled,true);
 const crossings=await reviewFixBrowser(page);
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.__contextReader(window.__CAMERA_AUDIT_RUNTIME__.frameState)?.active);
 const pending=page.waitForEvent('download');await page.keyboard.down('Shift');await page.keyboard.press('t');await page.keyboard.up('Shift');const download=await pending,file=process.env.BLOB_BOT_REPORT?process.env.BLOB_BOT_REPORT+'.session.tmp.json':'CONNECTION30_SESSION.tmp.json';await download.saveAs(file);const exported=JSON.parse(fs.readFileSync(file));fs.unlinkSync(file);
 const detail=await page.evaluate(()=>{
  const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;r.renderer.setAnimationLoop(null);const legacy=()=>JSON.stringify({chemistry:f.chemistry,physical:f.physicalFeel,player:f.playerComposition,bond:f.bondState,engine:f.returnRegionEngine,mass:r.siltPressureRouteSystem.materialIdentity.totalMass(),host:r.hostConnectionReceiptLedger.snapshot()}),before=legacy(),refs=[f.chemistry,f.physicalFeel,f.playerComposition];
  r.localChemistryContextSystem.update(0,f);const current=r.__contextInspector(f),raw=f.localChemistryContext;
  const unchanged=before===legacy()&&refs[0]===f.chemistry&&refs[1]===f.physicalFeel&&refs[2]===f.playerComposition;
  const saved=f.activeCellId;f.activeCellId='CELL_VASCULAR_RHYTHM_ROUTE_001';const rejected=r.__contextInspector(f);f.activeCellId=saved;
  return {current,rawFrozen:Object.isFrozen(raw)&&Object.isFrozen(raw.domains),unchanged,rejected,trace:r.__contextTrace};
 });
 assert.equal(crossings.crossings.length,3);assert.equal(detail.unchanged,true);assert.equal(detail.rawFrozen,true);assert.equal(detail.rejected.active,false);assert.equal(detail.rejected.reason,'cell_or_host_changed');assert.equal(detail.rejected.domains,null);
 assert.ok(detail.trace.some(row=>!row.active&&['boundary_transition_unresolved','commit_flight_unresolved'].includes(row.reason)));
 assert.ok(detail.trace.some(row=>!row.active&&row.reason==='cell_or_host_changed'&&row.rawCell!==row.cell));
 for(const cell of ['CELL_VASCULAR_RHYTHM_ROUTE_001','CELL_SILT_PRESSURE_ROUTE_001','CELL_GRAVE_MEMORY_RESIDUE_BED_001'])assert.ok(detail.trace.some(row=>row.active&&row.cell===cell));
 assert.equal(exported.schemaVersion,'blob.session.telemetry.v1.52');assert.equal(exported.developerTruth.localChemistryContext.active,true);assert.equal(exported.developerTruth.localChemistryContext.cellId,'CELL_GRAVE_MEMORY_RESIDUE_BED_001');assert.equal(exported.developerTruth.localChemistryContext.domains.flux,.22);
 assert.deepEqual(errors,[]);assert.equal(sourceIdentity(root).fingerprint,identity.fingerprint);
 const report={case:'N02',status:'PASS',summary:{passed:1,failed:0},scope:'Actual registry placement, three debug region mounts, actual E-input → commitment → boundary crossings from the existing U02 driver, late-frame invalidation, next-sample recovery and actual Shift+T session download. Prior Grave history, near-route poses and false presentation verification remain declared fixtures; this does not establish naturally earned traversal or physical-controller/human feel acceptance.',sourceIdentity:identity,productionSourceUnchanged:true,setup,transitionSetup,debugMounts,crossings,detail,exportedContext:exported.developerTruth.localChemistryContext,errors};fs.writeFileSync(process.env.BLOB_BOT_REPORT??'CONNECTION30_CONTEXT_BROWSER.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({crossings:crossings.crossings.length,traceRows:detail.trace.length,lateInvalidation:detail.trace.some(x=>x.reason==='cell_or_host_changed'),exportedCell:report.exportedContext.cellId}));
}catch(e){
 if(page)try{const diagnostic=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r?.frameState;return {stage:window.__REVIEW_FIX_STAGE__,cell:f?.activeCellId,context:f?.localChemistryContext,hub:f?.hubChamberFoundation,commit:f?.hubRouteCommit,preparation:{autoSchedule:r?.firstSliceTransitionCoordinator?.autoSchedule,running:r?.firstSliceTransitionCoordinator?.running},trace:r?.__contextTrace};});fs.writeFileSync((process.env.BLOB_BOT_REPORT??'CONNECTION30_CONTEXT_BROWSER.json')+'.failure.json',JSON.stringify({error:String(e),diagnostic},null,2));}catch{}
 console.error(e.stack??String(e));throw e;}finally{if(browser)await browser.close();await server.close();}
