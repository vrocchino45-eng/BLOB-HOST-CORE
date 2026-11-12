const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const {createServer}=await import('../../installed_base/node_modules/vite/dist/node/index.js');
 const server=await createServer({root:path.resolve('candidate_base'),server:{host:'127.0.0.1',port:5173},logLevel:'warn'});await server.listen();
 const {default:packed}=await import('../../validation_browser/node_modules/@sparticuz/chromium/build/index.js');
 process.env.LD_LIBRARY_PATH=path.resolve('validation_browser/runtime')+':'+path.resolve('validation_browser/runtime/lib');
 const browser=await chromium.launch({executablePath:path.resolve('validation_browser/runtime/chromium'),headless:true,args:packed.args});
 try{
 const page=await browser.newPage({viewport:{width:960,height:540}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/src/main.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nwindow.__CAMERA_AUDIT_RUNTIME__=runtime;\n'});});
 await page.goto('http://127.0.0.1:5173/?bot1d11c=1',{waitUntil:'networkidle',timeout:60000});
 await page.waitForFunction(()=>window.__BLOB_D11C_PROBE__,{timeout:45000});
 const warmup=[];
 for(const [slot,cell] of [[3,'CELL_SIGNAL_CHORUS_NERVE_001'],[5,'CELL_VASCULAR_RHYTHM_ROUTE_001'],[4,'CELL_GRAVE_MEMORY_RESIDUE_BED_001'],[6,'CELL_SILT_PRESSURE_ROUTE_001']]){
  await page.keyboard.down('Shift');await page.keyboard.press('Digit'+slot);await page.keyboard.up('Shift');
  await page.waitForFunction(cell=>window.__CAMERA_AUDIT_RUNTIME__.frameState.activeCellId===cell,cell,{timeout:20000});
  await page.waitForTimeout(200);
  warmup.push(await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__;return {cell:r.frameState.activeCellId,silt:{active:r.siltPressureRouteSystem.active,prepared:r.siltPressureRouteSystem.prepared,visible:r.siltPressureRouteSystem.root?.visible??false},vascular:{active:r.vascularRhythmRouteSystem.active,prepared:r.vascularRhythmRouteSystem.prepared,visible:r.vascularRhythmRouteSystem.root?.visible??false},grave:{active:r.graveMemoryRouteSystem.active,prepared:r.graveMemoryRouteSystem.prepared,visible:r.graveMemoryRouteSystem.root?.visible??false}};}));
 }
 const result=await page.evaluate(async()=>{const {auditConnections}=await import('/SILT_CONNECTION1_BROWSER.mjs');return auditConnections(window.__CAMERA_AUDIT_RUNTIME__);});
 result.warmupRuntimeLifecycle=warmup;result.browserErrors=errors;fs.writeFileSync('audit/host_cause1/connections.json',JSON.stringify(result,null,2));console.log(JSON.stringify({summary:result.summary,interruption:result.observations.interruption,errors},null,2));
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
