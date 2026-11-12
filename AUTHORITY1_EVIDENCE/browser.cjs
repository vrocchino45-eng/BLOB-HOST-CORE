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
 const state=await page.evaluate(async()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,layer=await(await fetch('/data/planning/blueprintTranslationLayer_HC003F.json')).json(),a=r.createBlueprintTranslationState(layer);return {live:r.frameState.blueprintTranslation,explicitArchive:a,activeCell:r.frameState.activeCellId,credits:r.frameState.returnRegionEngine?.creditCount};});
 assert.equal(state.live.primaryReference,'BLOB_HOST_CORE_REBUILD_BLUEPRINT_v0_1.zip');assert.equal(state.live.active,false);assert.equal(state.explicitArchive.primaryReference,state.live.primaryReference);assert.ok(state.explicitArchive.translationRule.includes('No hard gates'));assert.equal(errors.length,0);
 fs.writeFileSync('audit/authority1/browser.json',JSON.stringify({pass:'AUTHORITY1-BROWSER',state,errors,qualification:'Explicit archive mapping is a direct read-only method call; it is not activated or mounted in normal runtime.'},null,2));console.log(JSON.stringify({livePrimary:state.live.primaryReference,archiveActiveInNormalRuntime:state.live.active,errors}));
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
