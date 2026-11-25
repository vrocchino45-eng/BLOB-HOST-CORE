import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

const [base, candidate, out, browserPath] = process.argv.slice(2);
await fs.mkdir(out, {recursive:true});
const require=createRequire(path.join(base,'package.json'));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
const {chromium}=require('./BLOB_BOT_SERIES1/node_modules/playwright');
const scenario=JSON.parse(await fs.readFile(path.join(base,'BLOB_BOT_SERIES1/director/scenarios/balanced.json'),'utf8'));
const browser=await chromium.launch({headless:false,executablePath:browserPath});
const readings={};
try {
  for(const [name,root] of Object.entries({base,candidate})) {
    const server=await createServer({root,cacheDir:path.join(out,'vite-'+name),logLevel:'warn',
      server:{host:'127.0.0.1',port:0,hmr:false}});
    await server.listen();
    const origin='http://127.0.0.1:'+server.httpServer.address().port;
    try {
      const viewport={width:960,height:540};
      const world=await browser.newContext({viewport});
      const work=await world.newPage();
      await probe(work);
      await work.goto(origin,{waitUntil:'domcontentloaded',timeout:90000});
      await work.waitForFunction(()=>window.__UI03_RUNTIME__?.isRunning
        && document.querySelector('#playtest-hud-panel')?.firstElementChild?.textContent,null,{timeout:90000});
      const view=() => work.evaluate(()=>{
        const el=document.querySelector('#playtest-hud-panel'), r=window.__UI03_RUNTIME__;
        return {cell:r.frameState.activeCellId, label:el.firstElementChild.textContent,
          objective:el.children[1].textContent, position:[getComputedStyle(el).left,getComputedStyle(el).top],
          visible:getComputedStyle(el).display!=='none', elements:el.children.length,
          reserve:r.frameState.playtestHud.corePerformanceReservePercent,
          model:r.frameState.playerInformation?.context.mode??null };
      });
      readings[name]={world:await view()};
      await work.keyboard.press('f');
      await work.waitForFunction(()=>window.__UI03_RUNTIME__.frameState.inspectionCamera?.active,null,{timeout:20000});
      const inspected=await view(); readings[name].inspection=inspected.model;
      await work.keyboard.press('g');
      await work.waitForFunction(()=>window.__UI03_RUNTIME__.frameState.inspectionCamera?.coreWorkActive,null,{timeout:20000});
      readings[name].coreWork=(await view()).model;
      await world.close();

      const record=name==='candidate';
      const flow=await browser.newContext({viewport,...(record?{recordVideo:{dir:out,size:viewport}}:{})});
      const page=await flow.newPage(), errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.addInitScript(()=>{
        const pad=window.__UI03_PAD__={lt:0,rt:0};
        Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{id:'standard verification pad',
          mapping:'standard',index:0,connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},(_,i)=>{
            const value=i===6?pad.lt:i===7?pad.rt:0;return {value,pressed:value>.5,touched:value>0};
          })}]});
      });
      await probe(page);
      await page.goto(origin+'/?flow=1',{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(()=>window.__UI03_RUNTIME__?.isRunning,null,{timeout:90000});
      await page.keyboard.press('Shift+Digit6');
      await page.waitForFunction(()=>window.__UI03_RUNTIME__?.siltPressureRouteSystem?.active,null,{timeout:90000});
      if (!await page.evaluate(()=>window.__UI03_RUNTIME__.frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded===true))
        await page.keyboard.press('p');
      await page.waitForFunction(()=>window.__UI03_RUNTIME__.frameState.spatialCoreChemistry?.retainedPieceCount===3,null,{timeout:90000});
      const start=await page.evaluate(async scenario=>{
        const {stageShelf}=await import('/BLOB_BOT_SERIES1/director/shelf-stage.mjs');
        const r=window.__UI03_RUNTIME__, {state}=stageShelf(r,scenario);
        window.__UI03_PAD__.lt=.82;
        return {pose:state.pose,reserve:state.reserve,facing:state.facing};
      },scenario);
      await page.waitForFunction(()=>window.__UI03_RUNTIME__.frameState.targeting?.targetId==='silt_porosity_shelf',null,{timeout:15000});
      await page.evaluate(()=>{window.__UI03_PAD__.rt=.46;});
      const read=await page.waitForFunction(()=>{
        const f=window.__UI03_RUNTIME__.frameState;
        const owner=f.coreFlow?.result;
        if(!(owner?.acceptedCurrent01>0))return false;
        const shared=f.playerInformation?.accepted.flow;
        return {receiver:owner.receiverId,current:owner.acceptedCurrent01,target:f.targeting?.targetId,
          shared:shared?.current01??null,sharedTarget:f.playerInformation?.target?.id??null,frame:f.frame,
          flowLine:document.querySelector('#playtest-flow-readout')?.textContent??null};
      },null,{timeout:20000});
      readings[name].flow={start,...await read.jsonValue()};
      await page.screenshot({path:path.join(out,name+'-flow.png')});
      await page.evaluate(()=>{window.__UI03_PAD__.rt=0;window.__UI03_PAD__.lt=0;});
      await page.waitForFunction(()=>!window.__UI03_RUNTIME__.frameState.coreFlow?.result,null,{timeout:15000});
      const released=await page.evaluate(()=>{
        const f=window.__UI03_RUNTIME__.frameState;
        return {live:f.playerInformation?.accepted.flow??null,prior:f.playerInformation?.history.lastFlowDelivery?.current01??null};
      });
      readings[name].release=released;
      assert.deepEqual(errors,[]);
      const video=page.video();
      await flow.close();
      if(video)await video.saveAs(path.join(out,'UI03-flow-visual-review.webm'));
    } finally { await server.close(); }
  }
  const {base:before,candidate:after}=readings;
  assert.deepEqual({...after.world,model:null},before.world);
  assert.deepEqual(after.flow.start,before.flow.start);
  assert.equal(after.inspection,'inspection');
  assert.equal(after.coreWork,'core_work');
  assert.equal(after.flow.receiver,before.flow.receiver);
  assert.equal(after.flow.sharedTarget,after.flow.target);
  assert.ok(after.flow.shared>0);
  assert.equal(after.flow.shared,after.flow.current);
  assert.equal(after.release.live,null);
  assert.ok(after.release.prior>0);
  const result={verdict:'PASS', browser:browser.version(), scope:'Matched browser DOM, native keyboard context, and actual Flow receipt with a staged pose and standard gamepad adapter. Video is a visual witness with no encoded simulation-frame synchronization or human acceptance.', readings};
  await fs.writeFile(path.join(out,'UI03-browser.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
} finally { await browser.close(); }

async function probe(page){
  await page.route('**/src/main.js',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text())+'\nwindow.__UI03_RUNTIME__=runtime;\n'});
  });
}
