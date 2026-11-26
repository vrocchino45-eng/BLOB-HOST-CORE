import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

const [root,out]=process.argv.slice(2);
const require=createRequire(path.join(root,'package.json'));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
const {chromium}=require('./BLOB_BOT_SERIES1/node_modules/playwright');
const scenario=JSON.parse(await fs.readFile(path.join(root,'BLOB_BOT_SERIES1/director/scenarios/balanced.json')));
await fs.mkdir(out);
const server=await createServer({root,cacheDir:path.join(out,'vite-cache'),logLevel:'warn',server:{host:'127.0.0.1',port:0,hmr:false}});
let browser;
const reports=[];
try {
 await server.listen();
 browser=await chromium.launch({headless:true,executablePath:process.env.BLOB_ED13_BROWSER,args:JSON.parse(process.env.BLOB_BOT_CHROMIUM_ARGS??'[]')});
 for(const name of ['surface-wake','silt-shelf','core-work']){
  const context=await browser.newContext({viewport:{width:880,height:500}});
  try {
   const page=await context.newPage(), errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    const values=window.__ED13_PAD__=Array(17).fill(0);
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{id:'ED13 standard staged pad',
     mapping:'standard',index:0,connected:true,axes:[0,0,0,0],
     buttons:values.map(value=>({value,pressed:value>.5,touched:value>0}))}]});
   });
   await page.route('**/src/main.js',async route=>{
    const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nwindow.__ED13_RUNTIME__=runtime;\n'});
   });
   const mounted=name!=='surface-wake';
   await page.goto('http://127.0.0.1:'+server.httpServer.address().port+(name==='silt-shelf'?'/?flow=1':'/'),
    {waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__ED13_RUNTIME__?.isRunning,null,{timeout:90000});
   if(mounted){
    await page.keyboard.press('Shift+Digit6');
    await page.waitForFunction(()=>window.__ED13_RUNTIME__.siltPressureRouteSystem?.active,null,{timeout:60000});
    if(!await page.evaluate(()=>window.__ED13_RUNTIME__.frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded)) await page.keyboard.press('p');
    await page.waitForFunction(()=>window.__ED13_RUNTIME__.frameState.spatialCoreChemistry?.retainedPieceCount===3,null,{timeout:45000});
   }
   if(name==='silt-shelf') await page.evaluate(async setup=>{
    const {stageShelf}=await import('/BLOB_BOT_SERIES1/director/shelf-stage.mjs');stageShelf(window.__ED13_RUNTIME__,setup);
   },scenario);
   if(name==='core-work'){
    await page.evaluate(()=>{window.__ED13_PAD__[3]=1;});
    await page.waitForFunction(()=>{const f=window.__ED13_RUNTIME__.frameState;return f.inspectionCamera?.active||f.tightInspectionCamera?.active;},
     null,{timeout:30000});
    await page.evaluate(()=>{window.__ED13_PAD__[3]=0;window.__ED13_PAD__[13]=1;});
    await page.waitForFunction(()=>{const f=window.__ED13_RUNTIME__.frameState;return f.inspectionCamera?.coreWorkActive||f.tightInspectionCamera?.coreWorkActive;},
     null,{timeout:30000});
    await page.evaluate(()=>{window.__ED13_PAD__[13]=0;});
   }
   await page.evaluate(()=>{
    const r=window.__ED13_RUNTIME__, f=r.frameState, render=r.renderer.render;
    const captures=window.__ED13_CAPTURES__=[];
    let seen=0;
    r.renderer.render=function(scene,camera){
     const result=render.apply(this,arguments);
     if(scene===r.scene&&this.getRenderTarget()===null&&++seen%4===0){
      captures.push({frame:f.frame,simSeconds:f.runtimeSeconds,cell:f.activeCellId,
       pose:r.playerCore.position.toArray(),camera:camera.position.toArray(),
       context:{work:!!(f.inspectionCamera?.coreWorkActive||f.tightInspectionCamera?.coreWorkActive),phase:f.coreFlow?.phase??null},
       png:this.domElement.toDataURL('image/png')});
      if(captures.length===18)r.renderer.render=render;
     }
     return result;
    };
   });
   await page.waitForFunction(()=>window.__ED13_CAPTURES__?.length===18,null,{timeout:90000});
   const captures=await page.evaluate(()=>window.__ED13_CAPTURES__);
   for(const [i,row] of captures.entries()){
    const bytes=Buffer.from(row.png.split(',')[1],'base64');assert.ok(bytes.length>1800);
    row.file=name+'-'+String(i).padStart(2,'0')+'.png';
    await fs.writeFile(path.join(out,row.file),bytes);
    delete row.png;
   }
   assert.deepEqual(errors,[]);
   if(name==='core-work')assert.ok(captures.every(x=>x.context.work));
   if(name==='silt-shelf')assert.ok(captures.every(x=>x.cell==='CELL_SILT_PRESSURE_ROUTE_001'));
   reports.push({name,scope:mounted?'Debug mount and prepared viewpoint, native renderer and chronology':'Ordinary boot, neutral-input world observation',captures});
   console.log(name,captures.length,'measured native frames');
  }finally{await context.close();}
 }
 await fs.writeFile(path.join(out,'summary.json'),JSON.stringify({
  source:execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),verdict:'OBSERVED',reports,
  classification:'Staged visual audit. Sound/comfort and human acceptance remain unverified.'
 },null,2)+'\n');
}finally{await browser?.close();await server.close();}
