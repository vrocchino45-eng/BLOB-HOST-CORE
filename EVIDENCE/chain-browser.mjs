import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const root=path.resolve(process.argv[2]??'candidate_base'),req=createRequire(path.join(root,'package.json'));const {createServer}=await import(pathToFileURL(req.resolve('vite')));const {chromium}=await import(pathToFileURL(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright/index.mjs')));const {default:packed}=await import(pathToFileURL(path.resolve('validation_browser/node_modules/@sparticuz/chromium/build/index.js')));
fs.mkdirSync('deliverables/connection10/EVIDENCE',{recursive:true});
const inventory=()=>{const out={};function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())scan(p);else out[path.relative(root,p).replaceAll(path.sep,'/')]=createHash('sha256').update(fs.readFileSync(p)).digest('hex');}}for(const n of ['src','public'])scan(path.join(root,n));for(const n of ['package.json','index.html'])out[n]=createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex');return out;};const before=inventory(),errors=[];let server,browser;
try{
 server=await createServer({root,server:{host:'127.0.0.1',port:0},logLevel:'warn'});await server.listen();
 browser=await chromium.launch({executablePath:path.resolve('validation_browser/runtime/chromium'),args:packed.args,env:{...process.env,LD_LIBRARY_PATH:path.resolve('validation_browser/runtime')+':'+path.resolve('validation_browser/runtime/lib')}});
 const page=await browser.newPage({viewport:{width:960,height:540}});page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/src/main.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nwindow.__CAMERA_AUDIT_RUNTIME__=runtime;\n'});});
 await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/?bot1d11c=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__BLOB_D11C_PROBE__);
 const warmup=[];
 for(const [slot,cell] of [[3,'CELL_SIGNAL_CHORUS_NERVE_001'],[5,'CELL_VASCULAR_RHYTHM_ROUTE_001'],[4,'CELL_GRAVE_MEMORY_RESIDUE_BED_001'],[6,'CELL_SILT_PRESSURE_ROUTE_001']]){
  await page.keyboard.down('Shift');await page.keyboard.press('Digit'+slot);await page.keyboard.up('Shift');
  await page.waitForFunction(cell=>window.__CAMERA_AUDIT_RUNTIME__.frameState.activeCellId===cell,cell);
  await page.waitForTimeout(200);
  warmup.push(await page.evaluate(()=>{const r=window.__CAMERA_AUDIT_RUNTIME__;return {cell:r.frameState.activeCellId,silt:r.siltPressureRouteSystem.active,vascular:r.vascularRhythmRouteSystem.active,grave:r.graveMemoryRouteSystem.active};}));
 }
 const result=await page.evaluate(async()=>{const {auditConnections}=await import('/SILT_CONNECTION1_BROWSER.mjs');return auditConnections(window.__CAMERA_AUDIT_RUNTIME__);});
 assert.equal(errors.length,0);assert.equal(result.summary.passed,18);assert.equal(result.summary.failed,0);assert.deepEqual(inventory(),before);
 const report={pass:'CONNECTION10-CHAIN',status:'PASS',scope:'Existing 18-check connection audit rerun on accepted source. Normalized Input and real route/evaluator owners, with explicit direct cell switches and prior-progress/near-resolution fixtures; not ordinary navigation or fresh campaign.',result,warmup,errors,productionFilesUnchanged:true,productionHashes:before};
 fs.writeFileSync('deliverables/connection10/EVIDENCE/chain-browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({summary:result.summary,errors,observations:result.observations},null,2));
}finally{if(browser)await browser.close();if(server)await server.close();}
