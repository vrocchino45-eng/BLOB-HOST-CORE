import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const [root,scratch,browserPath,out]=process.argv.slice(2);
for(const [key,folder] of Object.entries({TEMP:'tmp',TMP:'tmp',PLAYWRIGHT_BROWSERS_PATH:'browser-cache'}))
  process.env[key]=path.join(scratch,folder);
await fs.mkdir(out);
const require=createRequire(path.join(root,'package.json'));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
const {chromium}=require('./BLOB_BOT_SERIES1/node_modules/playwright');
const server=await createServer({root,cacheDir:path.join(scratch,'vite-cache','exp'),server:{host:'127.0.0.1',port:0,hmr:false},logLevel:'warn'});
let browser;
try {
  await server.listen();
  browser=await chromium.launch({headless:false,executablePath:browserPath});
  for(const layout of ['deep','balanced','membrane']){
    const data=JSON.parse(await fs.readFile(path.join(root,'BLOB_BOT_SERIES1/director/scenarios',layout+'.json'),'utf8'));
    const viewport={width:768,height:432};
    const context=await browser.newContext({viewport,recordVideo:{dir:path.join(out,'raw'),size:viewport}});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      const pad=window.__EXP_PAD__={lt:0,rt:0};
      Object.defineProperty(navigator,'getGamepads',{value:()=>[{id:'Director fixture',index:0,mapping:'standard',connected:true,axes:[0,0,0,0],
        buttons:Array.from({length:17},(_,i)=>{const value=i===6?pad.lt:i===7?pad.rt:0;return{value,pressed:value>.5,touched:value>0};})}]});
    });
    await page.route('**/src/main.js',async route=>{
      const response=await route.fetch();
      await route.fulfill({response,body:(await response.text())+'\nwindow.__EXP_RUNTIME__=runtime;\n'});
    });
    await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/?flow=1',{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.__EXP_RUNTIME__?.isRunning,null,{timeout:90000});
    await page.keyboard.press('Shift+Digit6');
    await page.waitForFunction(()=>window.__EXP_RUNTIME__.siltPressureRouteSystem?.active,null,{timeout:90000});
    if(!await page.evaluate(()=>window.__EXP_RUNTIME__.frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded===true)) await page.keyboard.press('p');
    await page.waitForFunction(()=>window.__EXP_RUNTIME__.frameState.spatialCoreChemistry?.retainedPieceCount===3,null,{timeout:90000});
    await page.evaluate(async data=>{
      const r=window.__EXP_RUNTIME__, pad=window.__EXP_PAD__;
      const {stageShelf,sample,retained}=await import('/BLOB_BOT_SERIES1/director/shelf-stage.mjs');
      const badge=document.createElement('div');
      badge.style.cssText='position:fixed;top:8px;right:10px;z-index:99999;background:#11252d;color:white;font:13px system-ui;padding:6px';
      document.body.append(badge);
      const native=r.registry.update;
      const rows=[], seen=new Set();
      const tests=[
        [0.42,'align',1,0,0],[0.7,'contact',1,.65,0],[0.34,'displaced',1,.65,.95],
        [0.64,'realigned',1,.65,0],[0.95,'recover',0,0,0],
        [0.5,'align',1,0,0],[1.02,'high demand',1,.95,0],[1.3,'released',0,0,0]];
      let start,elapsed=0,index=0,previous=0,pose;
      r.registry.update=function(dt,frame){
        if(!start){ start=stageShelf(r,data);pose=r.playerCore.position.clone(); }
        const [duration,phase,lt,rt,offset]=tests[index];
        if(!seen.has(index)){r.playerCore.position.copy(pose);r.playerCore.position.x+=offset;seen.add(index);}
        pad.lt=lt;pad.rt=rt;
        const result=native.call(this,dt,frame);
        elapsed+=dt;
        const current=sample(r);
        rows.push({elapsed,phase,rt,...current});
        badge.textContent=data.id+' | '+phase+' | sim '+elapsed.toFixed(2)+' s';
        if(elapsed-previous>=duration){
          previous=elapsed;
          if(++index===tests.length){r.registry.update=native;Object.assign(pad,{lt:0,rt:0});window.__EXP_RESULTS__={status:'PASS',start,rows,final:retained(r)};}
        }
        return result;
      };
    },data);
    await page.waitForFunction(()=>window.__EXP_RESULTS__,null,{timeout:115000});
    const result=await page.evaluate(()=>window.__EXP_RESULTS__);
    const video=page.video();
    await context.close();
    await video.saveAs(path.join(out,layout+'-disturbance-and-demand.webm'));
    assert.deepEqual(errors,[]);
    for(const phase of ['contact','realigned','high demand']){
      if(!result.rows.some(x=>x.phase===phase&&x.flow?.effect?.acceptedCurrent01>0))result.status='PARTIAL';
    }
    assert.equal(result.final.material.mass,8);
    await fs.writeFile(path.join(out,layout+'.json'),JSON.stringify(result,null,2)+'\n');
    console.log(layout,result.status,result.rows.length);
  }
}finally{await browser?.close();await server.close();}
