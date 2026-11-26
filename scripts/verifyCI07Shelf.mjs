import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

const [root,out]=process.argv.slice(2);
await fs.mkdir(out);
const require=createRequire(path.join(root,'package.json'));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
const {chromium}=require('./BLOB_BOT_SERIES1/node_modules/playwright');
const scenario=JSON.parse(await fs.readFile(path.join(root,'BLOB_BOT_SERIES1/director/scenarios/balanced.json')));
const server=await createServer({root,cacheDir:path.join(out,'vite-cache'),logLevel:'warn',server:{host:'127.0.0.1',port:0,hmr:false}});
let browser;
try {
 await server.listen();browser=await chromium.launch({headless:true,args:JSON.parse(process.env.BLOB_BOT_CHROMIUM_ARGS??'[]')});
 const page=await browser.newPage({viewport:{width:880,height:500}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  const pad=window.__UI04_PAD__={lt:0,rt:0};
  Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{id:'UI04 standard fixture',mapping:'standard',index:0,connected:true,axes:[0,0,0,0],
    buttons:Array.from({length:17},(_,i)=>{const value=i===6?pad.lt:i===7?pad.rt:0;return{value,pressed:value>.5,touched:value>0};})}]});
 });
 await page.route('**/src/main.js',async route=>{
  const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nwindow.__UI04_RUNTIME__=runtime;\n'});
 });
 await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/?flow=1',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.__UI04_RUNTIME__?.isRunning,null,{timeout:90000});
 await page.keyboard.press('Shift+Digit6');
 await page.waitForFunction(()=>window.__UI04_RUNTIME__?.siltPressureRouteSystem?.active,null,{timeout:60000});
 if(!await page.evaluate(()=>window.__UI04_RUNTIME__.frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded))await page.keyboard.press('p');
 await page.waitForFunction(()=>window.__UI04_RUNTIME__.frameState.spatialCoreChemistry?.retainedPieceCount===3,null,{timeout:45000});
 await page.evaluate(async scenario=>{
  const r=window.__UI04_RUNTIME__, f=r.frameState;
  const {stageShelf}=await import('/BLOB_BOT_SERIES1/director/shelf-stage.mjs');
  stageShelf(r,scenario);
  if(f.quickLookInspector?.coreLabelsEnabled!==true&&r.quickLookInspectorSystem)r.quickLookInspectorSystem.open=true;
  window.__UI04_PAD__.lt=.82;
 },scenario);
 await page.waitForFunction(()=>window.__UI04_RUNTIME__.frameState.targeting?.targetId==='silt_porosity_shelf',null,{timeout:60000});
 await page.evaluate(()=>{window.__UI04_PAD__.rt=.46;});
 await page.waitForFunction(()=>window.__UI04_RUNTIME__.frameState.coreFlow?.result?.acceptedCurrent01>0,null,{timeout:60000});
 const active=await page.evaluate(()=>{
  const r=window.__UI04_RUNTIME__, f=r.frameState;
  r.renderer.setAnimationLoop(null);
  const v=f.playerInformation.accepted.flow,c=f.coreFlow;
  return {owner:c.result,model:v,text:r.playtestHudSystem.flowEl?.textContent??null,frame:f.frame,line:f.playtestHud.flowLine};
 });
 assert.equal(active.model.actualRecipient,active.owner.receiverId);
 assert.equal(active.model.current01,active.owner.acceptedCurrent01);
 assert.equal(active.model.pressure01,active.owner.pressure01);
 assert.match(active.text,/Current accepted|Overload · current limited/);
 await page.screenshot({path:path.join(out,'UI04-accepted.png')});
 const variations=await page.evaluate(()=>{
  const r=window.__UI04_RUNTIME__,f=r.frameState,h=r.playtestHudSystem;
  const current=f.playerInformation,mount=f.firstSliceRuntimeMount, labels=f.quickLookInspector;
  const read=state=>h.resolveHudState(state,true).flowLine;
  return {
    fresh:read(f),
    missing:read({...f,playerInformation:null}),
    stale:read({...f,playerInformation:{...current,context:{...current.context,frame:current.context.frame-1}}}),
    interrupted:read({...f,statusPage:{open:true}}),
    labelsOff:read({...f,quickLookInspector:{...labels,coreLabelsEnabled:false}}),
    oldMount:read({...f,firstSliceRuntimeMount:{...mount,mountSequence:mount.mountSequence+1}}),
    released:read({...f,coreFlow:{...f.coreFlow,contactValid:false,result:null,phase:'recovering'}})
  };
 });
 assert.equal(variations.fresh,variations.missing);assert.equal(variations.stale,variations.fresh);
 assert.equal(variations.interrupted,'');assert.equal(variations.labelsOff,'');
 assert.doesNotMatch(variations.oldMount,/Current accepted/);assert.match(variations.released,/Released/);
 assert.deepEqual(errors,[]);
 await fs.writeFile(path.join(out,'UI04-browser.json'),JSON.stringify({verdict:'PASS',chromium:browser.version(),active,variations,
  scope:'Native accepted receiver and DOM. Interruption/read-model variants applied to presentation-only readback of the same mounted browser frame.'},null,2)+'\n');
 console.log('UI04 mounted Chromium presentation passed');
}finally{await browser?.close();await server.close();}
