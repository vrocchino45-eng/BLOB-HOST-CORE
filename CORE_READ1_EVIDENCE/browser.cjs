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

 await page.keyboard.down('Shift');await page.keyboard.press('Digit3');await page.keyboard.up('Shift');
 await page.keyboard.press('f');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera?.active);
 const shot=async label=>{const state=await page.evaluate(label=>{const r=window.__CAMERA_AUDIT_RUNTIME__,e=r.coreEmbodimentSystem,f=r.frameState;return {label,hud:document.body.innerText,frame:f.frame,inspection:f.inspectionCamera,engine:f.coreEngine,credits:f.returnRegionEngine,changeAge:e.coreEngineArchitectureChangeAge,visual:f.coreEmbodiment?.coreEngineVisual,nodes:e.coreEnginePhaseNodes.map((n,i)=>{n.updateWorldMatrix(true,false);const p=n.getWorldPosition(n.position.clone()),ndc=p.clone().project(r.camera);let shown=true;for(let q=n;q;q=q.parent)shown=shown&&q.visible;return {i,function:n.userData.function,visible:n.visible,hierarchyVisible:shown,opacity:n.material.opacity,local:n.position.toArray(),screen:[(ndc.x+1)*480,(1-ndc.y)*270,ndc.z]};})};},label);await page.screenshot({path:'audit/core_read1/'+label+'.png'});return state;};
 await page.waitForTimeout(5000);const states=[await shot('three-inspect')];
 const fixture=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,f=r.frameState;f.act1RouteHistory={...f.act1RouteHistory,graveReturned:true,graveMemoryImprintCommitted:true,vascularReturned:true,vascularCompleted:true,siltReturned:true,siltCompleted:true};Object.assign(r.returnRegionEngineSystem.secondPhaseCompleted,{grave:true,vascular:true,silt:true});return {scope:'Controlled six-credit checkpoint to inspect actual progression consumer/rendering; no claim of newly earning regional goals.'};});
 await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.coreEngine.phaseCount===6);states.push(await shot('six-transition'));
 await page.waitForTimeout(1100);states.push(await shot('six-inspect'));
 await page.keyboard.down('q');await page.waitForTimeout(700);states.push(await shot('six-stabilize'));await page.keyboard.up('q');
 await page.keyboard.press('g');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.coreWorkActive);await page.waitForTimeout(700);states.push(await shot('six-work'));
 await page.keyboard.press('o');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.coreEngine.phaseCount===12);states.push(await shot('twelve-preview'));
 await page.keyboard.press('f');await page.waitForFunction(()=>!window.__CAMERA_AUDIT_RUNTIME__.frameState.inspectionCamera.active);
 const assert=require('node:assert/strict');for(const state of states){assert.equal(state.nodes.filter(n=>n.hierarchyVisible).length,state.engine.phaseCount);if(state.engine.phaseCount===6)assert.ok(state.hud.includes('two per function · earned'));}assert.ok(states.at(-1).hud.includes('four per function · debug preview'));assert.equal(errors.length,0);
 const result={pass:'CORE-READ1',fixture,states,exited:true,errors};fs.writeFileSync('audit/core_read1/browser.json',JSON.stringify(result,null,2));console.log(JSON.stringify({states:states.map(s=>({label:s.label,phase:s.engine.phaseCount,nodes:s.nodes.filter(n=>n.hierarchyVisible).length,changeAge:s.changeAge,credits:s.credits.creditCount})),errors},null,2));
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
