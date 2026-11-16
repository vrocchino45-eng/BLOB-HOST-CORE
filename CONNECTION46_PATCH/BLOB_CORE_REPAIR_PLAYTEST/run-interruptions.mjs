// CONNECTION45: presentation-only source rebase; existing repair interruption scenarios retained.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {sourceIdentity} from '../BLOB_BOT_SERIES1/source-identity.mjs';

const root=process.cwd(),require=createRequire(import.meta.url);
let api;
try { api=require('playwright'); }
catch { try { api=require(path.join(root,'BLOB_BOT_SERIES1/node_modules/playwright')); }
catch { api=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright')); } }
const baseline='f5b1cbd0c1ad52ba33b4b6162c5bf1d018fb90b2dd3ef7f1b7751aac83461429';
const identity=sourceIdentity(root);
assert.equal(identity.fingerprint,baseline,'This verification targets CONNECTION40.');
const server=await createServer({root,server:{host:'127.0.0.1',port:0},logLevel:'warn'});
const checks=[],errors=[];
let browser,page,stage='boot';
try {
  await server.listen();
  browser=await api.chromium.launch({headless:true,
    ...(process.env.BLOB_BOT_CHROMIUM_EXECUTABLE?{executablePath:process.env.BLOB_BOT_CHROMIUM_EXECUTABLE}:{}),
    args:JSON.parse(process.env.BLOB_BOT_CHROMIUM_ARGS??'[]')});
  page=await browser.newPage({viewport:{width:960,height:540}});
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/src/main.js',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text())+'\nwindow.__SURFACE_CLOSEOUT__=runtime;\n'});
  });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/?bot1d11c=1&coreRepairTrial=1`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__SURFACE_CLOSEOUT__?.isRunning);
  await page.evaluate(()=>{
    const c=window.__SURFACE_CLOSEOUT__.firstSliceTransitionCoordinator;
    c.autoSchedule=false;
    if(c.scheduleHandle!=null){cancelIdleCallback(c.scheduleHandle);clearTimeout(c.scheduleHandle);}
    c.scheduled=false;
  });
  await page.waitForFunction(()=>!window.__SURFACE_CLOSEOUT__.firstSliceTransitionCoordinator.running,null,{timeout:90000});
  await page.evaluate(()=>{
    const r=window.__SURFACE_CLOSEOUT__,f=r.frameState,id='scar_contamination_plate_001';
    r.renderer.setAnimationLoop(null);
    window.__closeoutPose=(target=id)=>{
      const item=r.chemObjectSystem.objects.find(x=>x.recipe.id===target);
      r.playerCore.position.copy(item.root.getWorldPosition(r.playerCore.position.clone())).z+=1.2;
      r.playerMovementController.velocity.set(0,0,0);
    };
    window.__closeoutRead=()=>{
      const item=r.chemObjectSystem.objects.find(x=>x.recipe.id===id),s=r.reactiveStateGrammarSystem.states.get(id);
      return {frame:f.frame,cell:f.activeCellId,inspection:!!f.inspectionCamera?.active,
        work:!!f.inspectionCamera?.coreWorkActive||!!f.tightInspectionCamera?.coreWorkActive,
        held:{pulse:f.input.pulseHeld,stabilize:f.input.stabilizeHeld},pulseEvent:f.input.pulseEventId,
        target:f.targeting?.relationshipTargetId,focus:f.reactiveStateGrammar?.targetId,
        active:!!f.reactiveStateGrammar?.active,objects:Object.keys(f.reactiveStateGrammar?.objects??{}),
        personalities:Object.keys(f.responsePersonality?.objects??{}),
        condition:s?.condition01,stage:s?.stage,stateChanges:r.reactiveStateGrammarSystem.stateChangeCount,
        stateEvent:r.reactiveStateGrammarSystem.stageEventSequence,retainedStates:r.reactiveStateGrammarSystem.states.size,
        hasRootState:Object.hasOwn(item.root.userData,'reactiveState'),
        hasRootPersonality:Object.hasOwn(item.root.userData,'responsePersonality'),
        rootPosition:item.root.position.toArray(),plateAbsorbed:item.absorbed,
        objectCount:r.chemObjectSystem.objects.length,composition:structuredClone(f.playerComposition),
        credits:f.returnRegionEngine?.creditCount,receipts:r.hostConnectionReceiptLedger.acceptedTotal,
        executed:f.runtimeExecution.executedSystemIds};
    };
    window.__closeoutStep=(count,aim=id)=>{
      for(let i=0;i<count;i++){
        if(aim){
          const item=r.chemObjectSystem.objects.find(x=>x.recipe.id===aim);
          const p=item.root.getWorldPosition(r.playerCore.position.clone());
          r.camera.position.copy(p);r.camera.position.z+=.85;r.camera.position.y+=.15;
          r.camera.lookAt(p);r.camera.updateMatrixWorld(true);
        }
        f.frame=++r.frame;f.runtimeSeconds+=1/60;f.runtimeSimulationSubstepIndex=0;f.runtimeSimulationSubstepCount=1;
        r.registry.update(1/60,f);r.coreVerbPhysicalizationSystem.update(1/60,f);
      }
      return window.__closeoutRead();
    };
    window.__closeoutPose();
  });
  async function step(count=1,aim='scar_contamination_plate_001'){
    return page.evaluate(({count,aim})=>window.__closeoutStep(count,aim),{count,aim});
  }
  const observe=()=>page.evaluate(()=>window.__closeoutRead());
  function frozen(a,b){
    for(const key of ['condition','stage','stateChanges','stateEvent','retainedStates'])assert.deepEqual(b[key],a[key],key);
    assert.equal(b.focus,'none');assert.equal(b.active,false);
    assert.deepEqual(b.objects,[]);assert.deepEqual(b.personalities,[]);
    assert.equal(b.hasRootState,false);assert.equal(b.hasRootPersonality,false);
  }
  await page.keyboard.press('p');await step(120);const initial=await step(90);
  stage='strain';
  for(let i=0;i<4;i++){
    await page.keyboard.down('x');await step(45);await page.keyboard.up('x');await step(2);
  }
  const strained=await observe();
  assert.ok(strained.condition>.72);assert.equal(strained.stage,'failing');
  checks.push({name:'Actual Pulse and normal targeting establish a persistent failing material',status:'PASS'});

  stage='inspection';
  await page.keyboard.down('q');await step(4);
  await page.keyboard.press('f');const inspection=await step(3,null);
  assert.equal(inspection.inspection,true);assert.equal(inspection.work,false);
  const inspectionHeld=await step(90,null);frozen(inspection,inspectionHeld);
  checks.push({name:'Inspection freezes condition/events while physical Stabilize stays held and clears fallback snapshots',status:'PASS'});

  stage='Core-Work';
  await page.keyboard.press('g');const work=await step(3,null);
  assert.equal(work.work,true);
  await page.keyboard.down('x');const workPulse=await step(60,null);
  frozen(work,workPulse);await page.keyboard.up('x');const workRelease=await step(3,null);frozen(work,workRelease);
  checks.push({name:'Core Work Pulse hold/release cannot mutate world material or replay a stage event',status:'PASS'});

  stage='resume';
  await page.keyboard.up('q');await page.keyboard.press('f');const returned=await step(3,null);
  assert.equal(returned.inspection,false);assert.equal(returned.work,false);
  await page.evaluate(()=>window.__closeoutPose());
  const resumedIdle=await step(90);assert.ok(resumedIdle.condition<=workRelease.condition);
  assert.equal(resumedIdle.stateEvent,workRelease.stateEvent);
  await page.keyboard.down('q');const reacquired=await step(30);
  assert.equal(reacquired.target,'scar_contamination_plate_001');assert.equal(reacquired.focus,'scar_contamination_plate_001');
  assert.ok(reacquired.condition<resumedIdle.condition);
  checks.push({name:'World return does not replay the Core Work Pulse and normal input reacquires the retained plate',status:'PASS'});

  stage='held-region-exit';
  const remounts=[];
  for(let cycle=0;cycle<2;cycle++){
    await page.keyboard.down('Shift');await page.keyboard.press('Digit3');await page.keyboard.up('Shift');
    const outside=await step(3,null);assert.equal(outside.cell,'CELL_SIGNAL_CHORUS_NERVE_001');
    const outsideHeld=await step(120,null);frozen(outside,outsideHeld);
    assert.ok(!outsideHeld.executed.includes('reactiveStateGrammarSystem'));
    await page.keyboard.down('Shift');await page.keyboard.press('Digit1');await page.keyboard.up('Shift');
    const returned=await step(3,null);assert.equal(returned.cell,'CELL_MEMBRANE_NURSERY_001');
    await page.keyboard.up('q');await page.evaluate(()=>window.__closeoutPose());await step(90);
    await page.keyboard.down('q');const contact=await step(15);
    assert.equal(contact.focus,'scar_contamination_plate_001');assert.equal(contact.retainedStates,1);
    remounts.push({outside,outsideHeld,returned,contact});
  }
  checks.push({name:'Two held-input exits pause history, clear contact and preserve one state through remount',status:'PASS'});

  stage='handoff';
  await page.keyboard.up('q');await page.evaluate(()=>window.__closeoutPose('surface_wake_membrane_mote_001'));
  await step(90,'surface_wake_membrane_mote_001');await page.keyboard.down('q');const other=await step(30,'surface_wake_membrane_mote_001');
  assert.equal(other.target,'surface_wake_membrane_mote_001');assert.equal(other.active,false);assert.equal(other.focus,'none');
  assert.deepEqual(other.objects,['scar_contamination_plate_001']);assert.deepEqual(other.personalities,['scar_contamination_plate_001']);
  await page.keyboard.up('q');
  checks.push({name:'Actual handoff to a different material does not expand the response scope',status:'PASS'});

  const final=await observe();
  for(const key of ['composition','credits','receipts','rootPosition','objectCount'])assert.deepEqual(final[key],initial[key],key);
  assert.equal(final.plateAbsorbed,false);assert.equal(final.retainedStates,1);
  assert.deepEqual(errors,[]);assert.equal(sourceIdentity(root).fingerprint,identity.fingerprint);
  checks.push({name:'Composition, credits, receipts, object identity and source remain unchanged',status:'PASS'});
  const report={pass:'CONNECTION38',status:'PASS',summary:{passed:checks.length,failed:0},checks,
    sourceIdentity:identity,productionSourceUnchanged:true,
    scope:'Actual keyboard F/G/Q/X, normal targeting, registered owner updates. Camera/player poses, paused rendering/preparation, deterministic 60 Hz registry time and debug Hub/Surface entries are declared fixtures. Condition and relationships are never injected. Snapshot comparison starts after mode entry settles; it does not assert a reordering of the existing frame. No natural campaign, physical gamepad or human readability acceptance.',
    initial,strained,inspection,inspectionHeld,work,workPulse,workRelease,returned,resumedIdle,reacquired,remounts,other,final,errors};
  fs.mkdirSync(new URL('./reports/',import.meta.url),{recursive:true});
  fs.writeFileSync(process.env.BLOB_CLOSEOUT_REPORT??new URL('./reports/browser.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({summary:report.summary,conditions:{strained:strained.condition,inspection:inspection.condition,inspectionHeld:inspectionHeld.condition,work:work.condition,workPulse:workPulse.condition,resumed:resumedIdle.condition,reacquired:reacquired.condition},remounts:remounts.length,handoff:other.target}));
}catch(error){
  if(page)try{
    const detail=await page.evaluate(()=>({snapshot:window.__closeoutRead?.(),input:window.__SURFACE_CLOSEOUT__?.frameState.input,inspection:window.__SURFACE_CLOSEOUT__?.frameState.inspectionCamera}));
    fs.mkdirSync(new URL('./reports/',import.meta.url),{recursive:true});
    fs.writeFileSync(new URL('./reports/failure.json',import.meta.url),JSON.stringify({stage,error:String(error.stack),detail,checks,errors},null,2));
  }catch{}
  throw error;
}finally{if(browser)await browser.close();await server.close();}
