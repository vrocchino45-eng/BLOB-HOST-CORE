import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

const [root,out,edge]=process.argv.slice(2);
const require=createRequire(path.join(root,'package.json'));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
const {chromium}=require('./BLOB_BOT_SERIES1/node_modules/playwright');
const scenario=JSON.parse(await fs.readFile(path.join(root,'BLOB_BOT_SERIES1/director/scenarios/balanced.json')));
await fs.mkdir(out);
const server=await createServer({root,cacheDir:path.join(out,'vite-cache'),logLevel:'warn',server:{host:'127.0.0.1',port:0,hmr:false}});
let browser;
try{
 await server.listen();
 browser=await chromium.launch({headless:false,executablePath:edge});
 const page=await browser.newPage({viewport:{width:768,height:432}});
 await page.addInitScript(()=>{
  const pad=window.__PF04_PAD__={lt:0,rt:0};
  Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{id:'PF04 standard pad',mapping:'standard',
    index:0,connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},(_,i)=>{const value=i===6?pad.lt:i===7?pad.rt:0;
      return {value,pressed:value>.5,touched:value>0};})}]});
 });
 await page.route('**/src/main.js',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(await response.text())+'\nwindow.__PF04_RUNTIME__=runtime;\n'});
 });
 await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/?flow=1',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.__PF04_RUNTIME__?.isRunning,null,{timeout:90000});
 await page.keyboard.press('Shift+Digit6');
 await page.waitForFunction(()=>window.__PF04_RUNTIME__?.siltPressureRouteSystem?.active,null,{timeout:90000});
 if(!await page.evaluate(()=>window.__PF04_RUNTIME__.frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded===true))await page.keyboard.press('p');
 await page.waitForFunction(()=>window.__PF04_RUNTIME__.frameState.spatialCoreChemistry?.retainedPieceCount===3,null,{timeout:90000});
 await page.evaluate(async scenario=>{
  const {stageShelf}=await import('/BLOB_BOT_SERIES1/director/shelf-stage.mjs');
  stageShelf(window.__PF04_RUNTIME__,scenario);
  window.__PF04_PAD__.lt=.82;
 },scenario);
 await page.waitForFunction(()=>window.__PF04_RUNTIME__.frameState.targeting?.targetId==='silt_porosity_shelf',null,{timeout:20000});
 await page.evaluate(()=>{window.__PF04_PAD__.rt=.46;});
 await page.waitForFunction(()=>window.__PF04_RUNTIME__.frameState.coreFlow?.result?.acceptedCurrent01>0,null,{timeout:20000});
 const result=await page.evaluate(()=>{
  const r=window.__PF04_RUNTIME__,renderer=r.renderer;
  const snapshot=()=>JSON.stringify({cell:r.frameState.activeCellId,frame:r.frameState.frame,step:r.frameState.runtimeSimulationSubstepIndex,
   time:r.frameState.runtimeSeconds,aim:r.frameState.targeting?.targetId,pose:r.playerCore.position.toArray(),
   flow:r.frameState.coreFlow?.result,reserve:r.frameState.corePerformance?.endurance?.reserve01,
   ledger:r.siltPressureRouteSystem.materialIdentity.snapshot(),receipts:r.hostConnectionReceiptLedger.acceptedTotal});
  const before=snapshot(),direct=renderer.renderBufferDirect;
  const matches=(object,group)=>{
   const names=[];let core=false;
   for(let node=object;node&&node!==r.scene;node=node.parent){
     names.push(node.name??'');if(node===r.playerCore)core=true;
   }
   if(group==='silt-motes')return names.some(x=>/^silt_shift_mote_/.test(x));
   if(group==='particles')return object.isPoints||names.some(x=>/mote|visual_seep_grains|seed_fluid_wake|ambient_particles/i.test(x));
   if(group==='core-shell')return core&&names.includes('soft_membrane_shell');
   if(group==='flow')return names.includes('core_flow_conductive_anatomy');
   return false;
  };
  const captures={};
  for(const group of ['control','silt-motes','particles','core-shell','flow']){
   let count=0;
   renderer.renderBufferDirect=function(camera,scene,geometry,material,object){
    if(!this.getRenderTarget()&&material.transparent&&!(material.transmission>0)&&matches(object,group)){count++;return;}
    return direct.apply(this,arguments);
   };
   try{
    renderer.render(r.scene,r.renderCamera??r.camera);
    captures[group]={skipped:count,png:renderer.domElement.toDataURL('image/png')};
   }finally{renderer.renderBufferDirect=direct;}
  }
  return {parity:snapshot()===before,sample:JSON.parse(before),captures};
 });
 assert.ok(result.parity);
 const captures=[];
 for(const [name,{skipped,png}] of Object.entries(result.captures)){
  const bytes=Buffer.from(png.split(',')[1],'base64');
  assert.ok(bytes.length>1500,'real rendered capture');
  await fs.writeFile(path.join(out,name+'.png'),bytes);
  captures.push({group:name,renderedCallsOmitted:skipped,file:name+'.png',bytes:bytes.length});
 }
 assert.ok(captures.find(x=>x.group==='silt-motes').renderedCallsOmitted>0);
 assert.ok(captures.find(x=>x.group==='flow').renderedCallsOmitted>0);
 const summary={verdict:'PASS',scope:'Several draw submissions of the exact same accepted frame and camera, outside timed runs. Exact parity across the observed owner fields.',parity:true,sample:result.sample,captures};
 await fs.writeFile(path.join(out,'visual.json'),JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify(captures));
}finally{await browser?.close();await server.close();}
