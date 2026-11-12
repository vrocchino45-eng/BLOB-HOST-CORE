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
 await page.keyboard.down('Shift');await page.keyboard.press('Digit3');await page.keyboard.up('Shift');
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.corePerformance?.active,null,{timeout:15000});
 const fixture=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;f.act1RouteHistory={...f.act1RouteHistory,graveReturned:true,graveMemoryImprintCommitted:true,vascularReturned:true,vascularCompleted:true,siltReturned:true,siltCompleted:true};Object.assign(r.returnRegionEngineSystem.secondPhaseCompleted,{grave:true,vascular:true,silt:false});return {scope:'Controlled retained first returns and two prior phase-two completions. Real counter consumes supplied last completion fixture; new region goals are not earned by this harness. Normal keyboard/mouse input drives reserve.'};});
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.returnRegionEngine.creditCount===5);
 const shot=label=>page.evaluate(label=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;return {label,frame:f.frame,credits:f.returnRegionEngine.creditCount,engine:f.coreEngine.phaseCount,performance:f.corePerformance,input:{absorb:f.input.absorbHeld,stabilize:f.input.stabilizeHeld,boost:f.input.boostHeld},hud:document.body.innerText,inspection:f.inspectionCamera};},label);
 const states=[];await page.keyboard.down('q');await page.mouse.down({button:'right'});
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.input.absorbHeld&&window.__CAMERA_AUDIT_RUNTIME__.frameState.input.stabilizeHeld);await page.waitForTimeout(400);states.push(await shot('five-credit pair'));
 await page.keyboard.press('o');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.coreEngine.phaseCount===6);states.push(await shot('unearned six preview'));
 assert.equal(states.at(-1).performance.endurance.coordination.active,false);
 await page.evaluate(()=>{const f=window.__CAMERA_AUDIT_RUNTIME__.frameState;f.returnRegionCompletionEvent={key:'silt:phase_2',routeKey:'silt',phase:2,frame:f.frame};});
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.corePerformance.endurance.coordination.active);states.push(await shot('six-credit pair'));
 assert.ok(states.at(-1).hud.includes('paired drain'));await page.screenshot({path:'audit/paired_demand2/paired-world.png'});
 await page.keyboard.down('Shift');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.input.boostHeld);states.push(await shot('boost priority'));await page.keyboard.up('Shift');assert.equal(states.at(-1).performance.endurance.coordination.active,false);assert.ok(!states.at(-1).hud.includes('paired drain'));
 await page.mouse.up({button:'right'});await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.frameState.input.absorbHeld);states.push(await shot('single stabilize'));assert.equal(states.at(-1).performance.endurance.coordination.active,false);
 await page.mouse.down({button:'right'});await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.corePerformance.endurance.coordination.active);
 await page.keyboard.press('f');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.active);states.push(await shot('inspection pair'));await page.screenshot({path:'audit/paired_demand2/paired-inspection.png'});
 await page.keyboard.press('g');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.coreWorkActive);await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.frameState.corePerformance.endurance.coordination.active);states.push(await shot('Core Work suspended inputs'));
 await page.keyboard.up('q');await page.mouse.up({button:'right'});await page.keyboard.press('f');await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.active);await page.waitForTimeout(100);states.push(await shot('world idle'));
 assert.equal(states.at(-1).performance.endurance.coordination.active,false);assert.equal(states.at(-1).credits,6);assert.equal(errors.length,0);
 fs.writeFileSync('audit/paired_demand2/browser.json',JSON.stringify({pass:'PAIRED-DEMAND2-BROWSER',fixture,states,errors},null,2));console.log(JSON.stringify({states:states.map(s=>({label:s.label,credits:s.credits,engine:s.engine,active:s.performance.endurance.coordination.active,factor:s.performance.endurance.coordination.factor})),errors},null,2));
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
