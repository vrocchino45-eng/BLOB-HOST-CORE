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



 const assert=require('node:assert/strict');
 const state=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;return {translation:f.blueprintTranslation,archive:f.compatibilityArchive,host:f.hostCondition,cell:f.activeCellId,credits:f.returnRegionEngine.creditCount,profile:r.recipeDataSystem.validationProfile,schema:r.recipeDataSystem.data.schemaValidationReport};});
 assert.equal(state.profile,'first_slice_runtime');assert.equal(state.translation.active,false);assert.equal(state.archive.registeredDuringFirstSliceBoot,false);assert.equal(state.credits,0);assert.equal(state.host.owner,'HostConditionSystem');assert.equal(errors.length,0);
 fs.writeFileSync('audit/archive_grave1/browser.json',JSON.stringify({pass:'ARCHIVE-GRAVE1-BROWSER',state,errors},null,2));console.log(JSON.stringify({profile:state.profile,archiveRegistered:state.archive.registeredDuringFirstSliceBoot,host:state.host.owner,errors}));
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
