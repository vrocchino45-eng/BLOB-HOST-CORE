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



 await page.keyboard.down('Shift');await page.keyboard.press('Digit5');await page.keyboard.up('Shift');await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.vascularRhythmRouteSystem.active);
 await page.evaluate(()=>{window.__CAMERA_AUDIT_RUNTIME__.frameState.runtimeSeconds=60;});await page.waitForFunction(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.hostCondition.phase==='holding');
 const result=await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__,v=r.vascularRhythmRouteSystem,fold=v.wallFolds[4],s=v.hostPressureResponse;v.root.updateWorldMatrix(true,true);const target=fold.getWorldPosition(r.playerCore.position.clone()),normal=r.playerCore.position.clone().set(0,0,1).applyQuaternion(fold.getWorldQuaternion(r.camera.quaternion.clone())).normalize(),camera=r.camera.clone();camera.fov=50;camera.position.copy(target).addScaledVector(normal,3.5);camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);const saved=v.wallFolds.map(x=>({scale:x.scale.clone(),emissive:x.material.emissiveIntensity,opacity:x.material.opacity}));r.renderer.render(r.scene,camera);const peak=r.renderer.domElement.toDataURL('image/png');for(const x of v.wallFolds){x.scale.x/=1-s.visualCompression;x.scale.z/=1-s.visualCompression*.625;x.material.emissiveIntensity-=s.amplitude*.28;x.material.opacity-=s.amplitude*.12;}r.renderer.render(r.scene,camera);const neutral=r.renderer.domElement.toDataURL('image/png');v.wallFolds.forEach((x,i)=>{x.scale.copy(saved[i].scale);x.material.emissiveIntensity=saved[i].emissive;x.material.opacity=saved[i].opacity;});return {peak,neutral,evidence:{host:r.frameState.hostCondition,response:s,fold:fold.name,scope:'Controlled peak clock and close diagnostic camera. Same frozen scene/time/renderer; only Host visual contribution temporarily removed for neutral comparison, then fully restored. Not another normal-onset test.'}};});
 fs.writeFileSync('audit/host_cause1/matched-peak.png',Buffer.from(result.peak.split(',')[1],'base64'));fs.writeFileSync('audit/host_cause1/matched-neutral.png',Buffer.from(result.neutral.split(',')[1],'base64'));fs.writeFileSync('audit/host_cause1/render.json',JSON.stringify({...result.evidence,errors},null,2));console.log('Saved matched visual comparison; errors: '+errors.length);
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
