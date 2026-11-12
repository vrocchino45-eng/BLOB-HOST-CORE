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
 await page.keyboard.down('Shift');await page.keyboard.press('Digit5');await page.keyboard.up('Shift');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.active);
 await page.evaluate(()=>{window.__CAMERA_AUDIT_RUNTIME__.frameState.runtimeSeconds=60;});await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.runtimeSeconds>=62.2,null,{timeout:30000});
 await page.evaluate(()=>{window.__CAMERA_AUDIT_RUNTIME__.frameState.runtimeSeconds=90;});await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.hostCondition.phase==='resting');
 await page.keyboard.down('Shift');await page.keyboard.press('Digit3');await page.keyboard.up('Shift');await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.active);
 await page.evaluate(()=>{window.__CAMERA_AUDIT_RUNTIME__.frameState.runtimeSeconds=105;});await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.hostCondition.phase==='holding');
 const downloadPromise=page.waitForEvent('download');await page.keyboard.down('Shift');await page.keyboard.press('t');await page.keyboard.up('Shift');const download=await downloadPromise;await download.saveAs('audit/host_trace1/session-internal.json');
 const session=JSON.parse(fs.readFileSync('audit/host_trace1/session-internal.json','utf8')),trace=session.developerTruth.hostCycle;
 assert.equal(session.schemaVersion,'blob.session.telemetry.v1.52');assert.ok(trace.records.some(x=>x.host.phase==='holding'&&x.localResponse?.flowScale===.97));assert.ok(trace.records.some(x=>x.host.phase==='resting'&&x.localResponse?.flowScale===1));assert.ok(trace.records.some(x=>x.host.phase==='holding'&&x.localResponse===null));assert.ok(trace.records.some(x=>x.reason==='mounted_active_interval'));assert.ok(!session.events.some(x=>x.type.startsWith('host.cycle')));assert.equal(errors.length,0);
 fs.writeFileSync('audit/host_trace1/browser.json',JSON.stringify({pass:'HOST-TRACE1-BROWSER',scope:'Actual runtime observer and real Shift+T download; monotonic Host clock fixtures select peak/rest/hidden phases. No observer records or gameplay result forced. Complete session kept internal; only bounded diagnostic trace included as evidence.',downloadedName:download.suggestedFilename(),schemaVersion:session.schemaVersion,legacyEventCount:session.events.length,trace,errors},null,2));console.log(JSON.stringify({downloadedName:download.suggestedFilename(),records:trace.records.length,phases:[...new Set(trace.records.map(x=>x.host.phase))],hiddenRecords:trace.records.filter(x=>x.localResponse===null).length,errors}));
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
