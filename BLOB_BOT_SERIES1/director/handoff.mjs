import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'vite';
import {chromium} from 'playwright';
import {ACTIVE_CHECKPOINT,loadScenario} from './scenario-contract.mjs';
import {buildCompatibility,readBuildIdentity} from './build-compatibility.mjs';
import {verifyStart} from './run.mjs';
import {decodeCapture} from './frame-mapping.mjs';

const root=path.resolve(import.meta.dirname,'../..');
const [outputArg,flag]=process.argv.slice(2);
const out=path.resolve(outputArg??'');
assert.ok(outputArg&&path.relative(root,out).startsWith('..'),'Use a new evidence directory outside the repository');
await fs.mkdir(out);
const build=readBuildIdentity(root,ACTIVE_CHECKPOINT), admission=buildCompatibility(build,ACTIVE_CHECKPOINT);
if(admission.status!=='PASS'){
  await fs.writeFile(path.join(out,'failure.json'),JSON.stringify({...admission,build},null,2)+'\n');
  throw new Error(admission.code+': '+admission.errors.join(', '));
}
const verify=flag==='--verify';
const layouts={deep:'Deep 3:0:0',balanced:'Balanced 1:1:1',membrane:'Membrane 0:0:3'};
const definitions={};
for(const id of Object.keys(layouts)){
  const loaded=await loadScenario(new URL('./scenarios/'+id+'.json',import.meta.url),build);
  assert.equal(loaded.status,'PASS');
  definitions[id]=loaded.scenario;
}
const server=await createServer({root,server:{host:'127.0.0.1',port:0,hmr:false},logLevel:'warn'});
const save=(name,data)=>fs.writeFile(path.join(out,name),JSON.stringify({build,scenarioRevisions:Object.values(definitions).map(({id,schema,revision})=>({id,schema,revision})),...data},null,2)+'\n',{flag:'wx'});
let browser,game;
const failures=[], operations=[];
try{
  await server.listen();
  const origin='http://127.0.0.1:'+server.httpServer.address().port;
  const executablePath=process.env.BLOB_BOT_CHROMIUM_EXECUTABLE;
  browser=await chromium.launch({headless:false,...(executablePath?{executablePath}:{}),
    args:JSON.parse(process.env.BLOB_BOT_CHROMIUM_ARGS??'[]')});
  const chooser=await browser.newPage({viewport:{width:740,height:480}});
  const choice=chooser.locator('#scenario');
  async function back(){
    const current=game;game=null;
    await chooser.bringToFront();
    await current?.context.close();
    operations.push({action:'scenario_selection',closed:current?.page.isClosed()??true});
    await chooser.locator('#state').evaluate(el=>{el.textContent='Choose a scenario';});
  }
  async function open(id,action,detail){
    const scenario=definitions[id];
    if(!scenario||!['load','reset','automate'].includes(action))throw new Error('Unknown Director action');
    if(game)await back();
    const context=await browser.newContext({acceptDownloads:true,viewport:{width:768,height:432}});
    const page=await context.newPage(); game={context,page,id};
    page.on('pageerror',error=>failures.push(error.message));
    await page.exposeFunction('returnToDirector',()=>{setTimeout(()=>{void back();},120);});
    await page.route('**/src/main.js',async route=>{
      const response=await route.fetch();
      await route.fulfill({response,body:(await response.text())+'\nwindow.__DIRECTOR_RUNTIME__=runtime;\n'});
    });
    await page.goto(origin+'/?flow=1',{waitUntil:'domcontentloaded',timeout:60_000});
    await page.bringToFront();
    console.log('Opened',action,id);
    await page.waitForFunction(()=>window.__DIRECTOR_RUNTIME__?.isRunning,null,{timeout:60_000});
    console.log('Runtime started');
    const storage=await page.evaluate(()=>Object.keys(localStorage));
    assert.ok(storage.every(key=>key.startsWith('blob.telemetry.session.')));
    await page.keyboard.press('Shift+Digit6');
    await page.waitForFunction(()=>{
      const r=window.__DIRECTOR_RUNTIME__;
      return r.siltPressureRouteSystem?.active&&r.siltPressureRouteSystem.territoryExpansion?.readFlowPatch(r.frameState);
    },null,{timeout:60_000});
    if(!await page.evaluate(()=>window.__DIRECTOR_RUNTIME__.frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded===true))
      await page.keyboard.press('p');
    await page.waitForFunction(()=>window.__DIRECTOR_RUNTIME__.frameState.spatialCoreChemistry?.retainedPieceCount===3,null,{timeout:60_000});
    console.log('Mounted and seeded');
    await page.evaluate(async ({scenario,automate,detail})=>{
      const {startHandoff}=await import('/BLOB_BOT_SERIES1/director/handoff-browser.mjs');
      window.__DIR_HANDOFF__=startHandoff(window.__DIRECTOR_RUNTIME__,scenario,automate,automate?{detail,phone:true}:null);
    },{scenario,automate:action==='automate',detail});
    await page.waitForFunction(()=>window.__DIR_HANDOFF__?.evidence.start,null,{timeout:60_000});
    const start=await page.evaluate(()=>window.__DIR_HANDOFF__.evidence.start);
    verifyStart(scenario,start);console.log('Verified start',id,action);
    game.start=start;
    operations.push({action,id,verified:true,storage,start});
    if(action!=='automate'){
      await page.evaluate(()=>window.__DIR_HANDOFF__.takeover());
      await page.waitForFunction(()=>window.__DIR_HANDOFF__.owner()==='human',null,{timeout:60_000});
    }
    return scenario.id+' · Start verified';
  }
  await chooser.exposeFunction('directorLoad',async(...args)=>{
    try{return await open(...args);}
    catch(error){console.error('Scenario setup:',error.stack);operations.push({action:'setup_error',error:error.message});throw error;}
  });
  await chooser.setContent(`<!doctype html><title>Director Lab · Scenario selection</title>
    <style>body{background:#162526;color:#edf6f5;font:18px system-ui;margin:36px}button,select{padding:8px;margin:8px 6px 0 0}#state{min-height:26px}</style>
    <h1>Director Lab</h1><label>Scenario <select id="scenario">
    ${Object.entries(layouts).map(([key,label])=>'<option value="'+key+'">Silt Shelf · '+label+'</option>').join('')}
    </select></label><p>Prepared at the Porosity Shelf with reserve 0.70. Experimental RT Flow is enabled.</p>
    <label><input type="checkbox" id="detail"> Focused connector capture</label>
    <p><button data-op="load">Load</button><button data-op="reset">Reset</button>
    <button data-op="automate">Automate and record</button></p><p id="state" role="status">Choose a scenario</p>
    <script>for(const b of document.querySelectorAll('[data-op]')) b.onclick=async()=>{
      const state=document.querySelector('#state'),buttons=[...document.querySelectorAll('button')];
      buttons.forEach(button=>button.disabled=true);state.textContent='Preparing and verifying start…';
      try{state.textContent=await window.directorLoad(document.querySelector('#scenario').value,b.dataset.op,document.querySelector('#detail').checked);}
      catch(e){state.textContent='Setup failed · '+e.message;}
      finally{buttons.forEach(button=>button.disabled=false);}
    }</script>`);
  if(!verify){
    console.log('Director chooser is open. Close it to exit.');
    await chooser.waitForEvent('close',{timeout:0});
  }else{
    const click=async action=>{
      await chooser.bringToFront();
      await chooser.locator('[data-op="'+action+'"]').click();
      await chooser.getByRole('status').filter({hasText:/Start verified|Setup failed/}).waitFor({timeout:185_000});
      const visible=await chooser.locator('#state').textContent();
      assert.match(visible,/Start verified/,visible);
      return game;
    };
    await choice.selectOption('balanced');
    const first=await click('load');
    const reset=await click('reset');
    assert.ok(first.page.isClosed());
    const stable=start=>{
      const {state,retained,patch}=start;
      return {pose:state.pose,facing:state.facing,reserve:state.reserve,patch,material:retained.material,receipts:retained.receipts,pieces:retained.pieces};
    };
    assert.deepEqual(stable(first.start),stable(reset.start));
    await reset.page.getByRole('button',{name:'Scenario selection'}).click();
    await chooser.getByRole('status').filter({hasText:'Choose a scenario'}).waitFor();
    await chooser.locator('#detail').check();
    const live=await click('automate');
    await live.page.waitForFunction(()=>window.__DIRECTOR_RUNTIME__.frameState.coreFlow?.result?.acceptedCurrent01>0,null,{timeout:95_000});
    const held=await live.page.evaluate(()=>{
      const f=window.__DIRECTOR_RUNTIME__.frameState;
      return {frame:f.frame,flow:f.coreFlow.result?.acceptedCurrent01??0,held:f.input.stabilizeHeld,sequence:f.input.flowActionSequence};
    });
    assert.ok(held.flow>0&&held.held);
    await live.page.getByRole('button',{name:'Take over',exact:true}).click();
    await live.page.getByRole('button',{name:'Human input active'}).waitFor({timeout:60_000});
    const transfer=await live.page.evaluate(()=>window.__DIR_HANDOFF__.transfer());
    assert.ok(transfer&&!transfer.active.some(Boolean));
    for(const key of ['material','progression','receipts','grip','seat'])assert.deepEqual(transfer.before[key],transfer.after[key]);
    await live.page.keyboard.down('w');
    await live.page.waitForFunction(()=>window.__DIRECTOR_RUNTIME__.frameState.input.moveZ<0,null,{timeout:45_000});
    await live.page.keyboard.up('w');
    const formats=await live.page.evaluate(()=>window.__DIR_HANDOFF__.recorder.supported);
    const downloadEvents=formats.map(format=>live.page.waitForEvent('download',{timeout:45000,predicate:d=>d.suggestedFilename().endsWith('.'+format)}));
    const raw=await live.page.evaluate(async ()=>{
      const hand=window.__DIR_HANDOFF__;
      return {trial:hand.evidence,handoff:hand.transfer(),capture:await hand.recorder.stop('shelf-handoff-detail')};
    });
    const downloads=await Promise.all(downloadEvents);
    for(const codec of raw.capture.files){
      const download=downloads.find(d=>d.suggestedFilename()===codec.name);
      assert.ok(download,codec.name);
      await download.saveAs(path.join(out,codec.name));
    }
    await back();
    await save('headed-handoff.json',{status:'PASS',held,transfer,operations,productionKeyboardAfterTransfer:true,physicalController:false,failures});
    await save('capture-source.json',raw);
    const mapping=await decodeCapture(browser,origin,out,raw);
    await save('capture-mapping.json',mapping);
    assert.deepEqual(failures,[]);
    console.log(JSON.stringify({headed:'PASS',formats:raw.capture.files,frames:raw.capture.frames.length,
      peakAudio:raw.capture.peakAudio,mapping}));
  }
}catch(error){
  await save('failure.json',{error:error.stack,operations,failures});
  throw error;
}finally{
  await browser?.close();
  await server.close();
}
