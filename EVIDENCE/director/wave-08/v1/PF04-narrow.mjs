import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const [root, scratch, edge, out] = process.argv.slice(2);
for (const [key, folder] of Object.entries({TEMP:'tmp',TMP:'tmp',npm_config_cache:'npm-cache',PLAYWRIGHT_BROWSERS_PATH:'browser-cache'}))
  process.env[key] = path.join(scratch, folder);
await fs.mkdir(out);
const source=execFileSync('git',['--no-optional-locks','-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const req=createRequire(path.join(root,'package.json'));
const {createServer}=await import(pathToFileURL(req.resolve('vite')).href);
const {chromium}=req('./BLOB_BOT_SERIES1/node_modules/playwright');
const {decodeCapture}=await import(pathToFileURL(path.join(root,'BLOB_BOT_SERIES1/director/frame-mapping.mjs')).href);
const scenario=JSON.parse(await fs.readFile(path.join(root,'BLOB_BOT_SERIES1/director/scenarios/balanced.json'),'utf8'));
const server=await createServer({root,cacheDir:path.join(scratch,'vite-cache','pf04-narrow'),logLevel:'warn',server:{host:'127.0.0.1',port:0,hmr:false}});
const omittedGroups=['control','silt-motes','core-shell'];
const runs=[];
const stats=list=>{
  const numbers=list.filter(Number.isFinite).sort((a,b)=>a-b);
  const at=n=>numbers[Math.min(numbers.length-1,Math.floor(numbers.length*n))]??null;
  return {count:numbers.length,min:at(0),p50:at(.5),p90:at(.9),p95:at(.95),max:at(1)};
};
let browser;
try {
  await server.listen();
  browser=await chromium.launch({headless:false,executablePath:edge});
  const origin='http://127.0.0.1:'+server.httpServer.address().port;
  for(let repeat=1;repeat<=2;repeat++){
    for(const omitted of repeat===1?omittedGroups:[...omittedGroups].reverse()){
      const mode='bot-telemetry-'+omitted;
      const tag=mode+'-'+repeat,record=mode.endsWith('recording'), controlled=mode.startsWith('bot');
      const viewport={width:768,height:432};
      const context=await browser.newContext({viewport,...(record?{recordVideo:{dir:path.join(out,'raw'),size:viewport}}:{})});
      const page=await context.newPage(),errors=[];
      const cdp=await context.newCDPSession(page);
      await cdp.send('Performance.enable');
      await cdp.send('HeapProfiler.startSampling',{samplingInterval:65536,includeObjectsCollectedByMajorGC:true,includeObjectsCollectedByMinorGC:true});
      const traces=[];
      cdp.on('Tracing.dataCollected', ({value}) => traces.push(...value));
      page.on('pageerror',err=>errors.push(err.message));
      if(controlled)await page.addInitScript(()=>{
        const pad=window.__PF04_PAD__={lt:0,rt:0};
        Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{id:'PF04 staged pad',mapping:'standard',index:0,connected:true,
          axes:[0,0,0,0],buttons:Array.from({length:17},(_,i)=>{const value=i===6?pad.lt:i===7?pad.rt:0;return{value,pressed:value>.5,touched:value>0};})}]});
      });
      await page.route('**/src/main.js',async r=>{
        const response=await r.fetch();
        await r.fulfill({response,body:(await response.text())+'\nwindow.__PF04_RUNTIME__=runtime;\n'});
      });
      await page.goto(origin+'/?flow=1',{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(()=>window.__PF04_RUNTIME__?.isRunning,null,{timeout:90000});
      await page.keyboard.press('Shift+Digit6');
      await page.waitForFunction(()=>window.__PF04_RUNTIME__?.siltPressureRouteSystem?.active,null,{timeout:90000});
      if(!await page.evaluate(()=>window.__PF04_RUNTIME__.frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded===true))await page.keyboard.press('p');
      await page.waitForFunction(()=>window.__PF04_RUNTIME__.frameState.spatialCoreChemistry?.retainedPieceCount===3,null,{timeout:90000});
      await page.evaluate(()=>{window.__PF04_WARM__=window.__PF04_RUNTIME__.frameState.frame;});
      await page.waitForFunction(()=>window.__PF04_RUNTIME__.frameState.frame>=window.__PF04_WARM__+16,null,{timeout:90000});

      const heapBefore=await cdp.send('Performance.getMetrics');
      await cdp.send('Tracing.start',{categories:'devtools.timeline,v8',transferMode:'ReportEvents'});
      await page.evaluate(async ({mode,scenario,omitted})=>{
        const r=window.__PF04_RUNTIME__, gl=r.renderer.getContext(), dbg=gl.getExtension('WEBGL_debug_renderer_info');
        const renderer=gl.getParameter(dbg?.UNMASKED_RENDERER_WEBGL??gl.RENDERER);
        const ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');
        const {stageShelf,sample}=await import('/BLOB_BOT_SERIES1/director/shelf-stage.mjs');
        const isBot=mode.startsWith('bot'), extra=mode.includes('telemetry'), rec=mode.endsWith('recording');
        const start=stageShelf(r,scenario);
        if(mode==='director-inactive') {
          const {startHandoff}=await import('/BLOB_BOT_SERIES1/director/handoff-browser.mjs');
          window.__PF04_INACTIVE__=startHandoff;
        }
        const pad=window.__PF04_PAD__, rows=[], pending=[], samples=[], events={}, actions={};
        let now, startFrame, simulation=0, previousCpu, sampleStarted=false, endingFrame;
        const clocks=new Map();
        const wrap=(obj,key,label)=>{
          if(typeof obj?.[key]!=='function')return false;
          const fn=obj[key];
          obj[key]=function(...args){
            const started=performance.now();
            try{return fn.apply(this,args);}finally{clocks.set(label,(clocks.get(label)??0)+performance.now()-started);}
          };
          return true;
        };
        const sensors={hud:wrap(r.playtestHudSystem,'update','hud'),telemetry:wrap(r.sessionTelemetrySystem,'update','productionTelemetry'),
          sceneTraversal:wrap(r.scene,'updateMatrixWorld','sceneTraversal')};
        const registered=[...r.registry.systems.entries()];
        for(const [name, child] of registered) wrap(child,'update','child:'+name);
        const classify=(object)=>{
          const lineage=[];
          let playerBranch=false;
          for(let next=object;next&&next!==r.scene;next=next.parent){
            lineage.push(next.name??'');
            playerBranch ||= next===r.playerCore;
          }
          if(lineage.some(name=>name==='core_flow_conductive_anatomy'))return 'flow';
          if(playerBranch&&lineage.includes('soft_membrane_shell'))return 'core-shell';
          if(lineage.includes('soft_membrane_vein_arc'))return 'environment-membrane';
          if(lineage.some(name=>/^silt_shift_mote_/.test(name)))return 'silt-motes';
          if(lineage.some(name=>/tendril|filopod/i.test(name)&&!/LS1D1D2I/.test(name)))return 'tendrils';
          if(lineage.some(name=>/core_engine_triadic_phase_root|player_(grave_memory|vascular_return|silt_pressure_adaptation)/i.test(name)))return 'core-interior';
          if(object.isPoints||lineage.some(name=>/mote|visual_seep_grains|seed_fluid_wake|ambient_particles/i.test(name)))return 'particles';
          if(lineage.some(name=>/silt_contained_geologic_medium|silt_seep_cavern|silt_compressed_residue_passage|silt_residue_bank/i.test(name)))return 'silt-atmosphere';
          return 'other';
        };
        const groupCounts=new Map(),groupNames=new Map(),categories=new WeakMap();
        const ownerTruth=()=>{
          const f=r.frameState,t=r.siltPressureRouteSystem;
          return JSON.stringify({step:[f.activeHostId,f.activeCellId,f.firstSliceRuntimeMount?.mountSequence,f.frame,f.runtimeSimulationSubstepIndex],
            seconds:f.runtimeSeconds, pose:r.playerCore.position.toArray(), facing:r.playerCore.quaternion.toArray(),
            aim:f.targeting?.targetId,attachment:f.playerAttachment?.active, result:f.coreFlow?.result??null,
            held:t.siltGrip.heldId,material:t.materialIdentity.snapshot(), receipts:r.hostConnectionReceiptLedger.acceptedTotal,
            reserve:f.corePerformance?.endurance?.reserve01, progression:[t.pressureRead,t.ribsReleased,t.safeMatterAbsorbed]});
        };
        const witnesses=[];
        let exactPresentationParity=true, parityChecks=0;
        const direct=r.renderer.renderBufferDirect;
        r.renderer.renderBufferDirect=function(camera,scene,geometry,material,object,group){
          const category=material.transmission>0?'transmissive':material.transparent?'transparent':'opaque';
          const pass=this.getRenderTarget()?'offscreen':'main';
          const type=material.type??'unknown';
          let groupName;
          if(pass==='main'&&category==='transparent'){
            groupName=categories.get(object);
            if(!groupName){groupName=classify(object);categories.set(object,groupName);}
            groupCounts.set(groupName,(groupCounts.get(groupName)??0)+1);
            const named=groupNames.get(groupName)??new Set();
            if(object.name&&named.size<32)named.add(object.name);
            groupNames.set(groupName,named);
            const counter='authored:'+groupName;
            clocks.set(counter,(clocks.get(counter)??0)+1);
            if(groupName===omitted){
              clocks.set('omittedCalls',(clocks.get('omittedCalls')??0)+1);
              return;
            }
          }
          const t=performance.now();
          try{return direct.apply(this,arguments);}finally{
            for(const key of ['pass:'+pass+':'+category,'material:'+type]){
              const n='count:'+key, ms='submit:'+key;
              clocks.set(n,(clocks.get(n)??0)+1);
              clocks.set(ms,(clocks.get(ms)??0)+performance.now()-t);
            }
          }
        };
        const begin=r.frameTruthObserver.beginFrame, end=r.frameTruthObserver.endFrame;
        r.frameTruthObserver.beginFrame=function(...args){now=performance.now();return begin.apply(this,args);};
        r.frameTruthObserver.endFrame=function(...args){try{return end.apply(this,args);}finally{
          previousCpu=performance.now()-now;
          if(rows.at(-1)?.frame===r.frameState.frame)rows.at(-1).cpuFrame=previousCpu;
        }};
        const registry=r.registry.update;
        r.registry.update=function(dt,frame){
          if(!sampleStarted){
            startFrame=frame.frame;
            sampleStarted=true;
          }
          if(isBot){
            const live=simulation<1.25;
            pad.lt=live?0.82:0;
            pad.rt=live&&simulation>=0.28?0.46:0;
          }
          const startRegistry=performance.now();
          const result=registry.call(this,dt,frame);
          clocks.set('registry',(clocks.get('registry')??0)+performance.now()-startRegistry);
          if(isBot){
            const telemetryStart=performance.now();
            const step={hostId:frame.activeHostId,cellId:frame.activeCellId,
              mountSequence:frame.firstSliceRuntimeMount?.mountSequence,frame:frame.frame,substep:frame.runtimeSimulationSubstepIndex};
            const returned=frame.coreFlow?.result;
            const input=frame.input;
            const mark=(id)=>{if(!actions[id]){actions[id]=step;events[id]={wallMs:performance.now(),simulation};}};
            if(frame.targeting?.targetId==='silt_porosity_shelf')mark('canonical_selection');
            if(input.flowDemand01>0)mark('analog_flow_request');
            if(returned?.acceptedCurrent01>0)mark('accepted_current');
            if(simulation>=1.25&&!input.flowDemand01&&!returned)mark('release');
            if(extra){samples.push(sample(r));clocks.set('directorTelemetry',(clocks.get('directorTelemetry')??0)+performance.now()-telemetryStart);}
          }
          simulation+=dt;
          return result;
        };
        const stamp=rec?document.createElement('canvas'):null;
        if(stamp){stamp.width=190;stamp.height=10;stamp.style.cssText='position:fixed;bottom:0;left:0;z-index:2147483647;pointer-events:none';document.body.append(stamp);}
        const paint=stamp?.getContext('2d'), native=r.renderer.render;
        r.renderer.render=function(scene,camera){
          if(scene!==r.scene||this.getRenderTarget()!==null)return native.call(this,scene,camera);
          if(ext){
            for(let i=pending.length-1;i>=0;i--){
              const {query,row}=pending[i];
              if(!gl.getQueryParameter(query,gl.QUERY_RESULT_AVAILABLE))continue;
              if(!gl.getParameter(ext.GPU_DISJOINT_EXT))row.gpuMs=gl.getQueryParameter(query,gl.QUERY_RESULT)/1e6;
              gl.deleteQuery(query);pending.splice(i,1);
            }
          }
          const query=ext&&rows.length<42&&pending.length<6?gl.createQuery():null;
          if(query)gl.beginQuery(ext.TIME_ELAPSED_EXT,query);
          const verify=(rows.length===10||rows.length===22||rows.length===31);
          const beforeTruth=verify?ownerTruth():null;
          const before=performance.now();
          try{return native.call(this,scene,camera);}finally{
            if(query)gl.endQuery(ext.TIME_ELAPSED_EXT);
            const renderElapsed=performance.now()-before;
            if(verify){ exactPresentationParity &&= beforeTruth===ownerTruth();parityChecks++;witnesses.push(JSON.parse(beforeTruth));}
            const f=r.frameState, info=this.info.render, marker=rows.length+1;
            const row={marker,frame:f.frame,substep:f.runtimeSimulationSubstepIndex,sim:f.runtimeSeconds,wallMs:performance.now(),
              rawMs:f.runtimeFrameRawDeltaMs,simulationMs:f.runtimeFrameSimulatedDeltaMs,discardedMs:f.runtimeFrameDroppedDeltaMs,
              stepCount:f.runtimeSimulationSubstepCount,renderSubmission:renderElapsed,drawCalls:info.calls,triangles:info.triangles,
              programs:this.info.programs?.length??null,gpuMs:null,skipped:f.runtimeExecution?.skippedRegionSystemIds??[],...Object.fromEntries(clocks)};
            clocks.clear();
            if(rows.length<42){
              rows.push(row);
              if(paint)for(let i=0;i<19;i++){
                paint.fillStyle=(i<3?[1,0,1][i]:((marker>>(i-3))&1))?'white':'black';
                paint.fillRect(i*10,0,10,10);
              }
            }
            if(query)pending.push({query,row});
            if(rows.length===42&&!endingFrame)endingFrame=f.frame;
            if(endingFrame&&f.frame>=endingFrame+6){
              r.renderer.render=native;r.renderer.renderBufferDirect=direct;r.registry.update=registry;
              const visibility={visible:0,hidden:0,visibleMeshes:0,hiddenMeshes:0};
              r.scene.traverse(object=>{
                let isVisible=true;
                for(let item=object;item;item=item.parent) if(!item.visible){isVisible=false;break;}
                visibility[isVisible?'visible':'hidden']++;
                if(object.isMesh)visibility[isVisible?'visibleMeshes':'hiddenMeshes']++;
              });if(pad)Object.assign(pad,{lt:0,rt:0});
              window.__PF04_RESULT__={renderer,querySupported:Boolean(ext),sensors,visibility,rows,events,exactPresentationParity,parityChecks,witnesses,
                groupNames:Object.fromEntries([...groupNames].map(([k,names])=>[k,[...names]])),groupCounts:Object.fromEntries(groupCounts),
                trial:{actions,samples,start:undefined},start:{pose:start.state.pose,reserve:start.state.reserve,cell:f.activeCellId,
                  facing:start.state.facing},startFrame};
            }
          }
        };
      },{mode,scenario,omitted});
      await page.waitForFunction(()=>window.__PF04_RESULT__,null,{timeout:100000});
      const data=await page.evaluate(()=>window.__PF04_RESULT__);
      const traceDone=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
      await cdp.send('Tracing.end'); await traceDone;
      const heapAfter=await cdp.send('Performance.getMetrics');
      const {profile}=await cdp.send('HeapProfiler.stopSampling');
      const heap=metrics=>Object.fromEntries(metrics.metrics.filter(x=>['JSHeapUsedSize','JSHeapTotalSize','Nodes','TaskDuration','ScriptDuration','LayoutDuration'].includes(x.name)).map(x=>[x.name,x.value]));
      const gc=traces.filter(x=>x.ph==='X' && /^(MinorGC|MajorGC|V8\.GCScavenger|V8\.GCCompactor)$/.test(x.name));
      const allocBySource={};
      function countAlloc(node){
        const key=(node.callFrame?.url??'').split('?')[0].replace(/^https?:\/\/[^/]+/,'')||'native or unsymbolized';
        if(node.selfSize)allocBySource[key]=(allocBySource[key]??0)+node.selfSize;
        for(const child of node.children??[])countAlloc(child);
      }
      countAlloc(profile.head);
      const instrumentation={heapBefore:heap(heapBefore),heapAfter:heap(heapAfter),
        gc:gc.map(({name,dur})=>({name,ms:(dur??0)/1000})),
        sampledAllocationBySource:Object.entries(allocBySource).sort((a,b)=>b[1]-a[1]).slice(0,16)};
      const video=page.video();
      await context.close();
      assert.deepEqual(errors,[]);
      const rows=data.rows.slice(1),sum=key=>rows.reduce((n,x)=>n+x[key],0);
      const recordName=tag+'.webm';
      if(video)await video.saveAs(path.join(out,recordName));
      let mapping=null;
      if(record&&data.trial.samples.length){
        const encoded=await decodeCapture(browser,origin,out,{trial:data.trial,capture:{frames:data.rows,peakAudio:0,
          files:[{name:recordName,format:'webm',mime:'video/webm;codecs=vp8',nativeAudioTrack:false}]}});
        mapping=encoded.webm;
      }
      const result={source,tag,mode,omitted,repeat,recording:record,renderer:data.renderer,start:data.start,sensors:data.sensors,
        visibility:data.visibility,instrumentation,groupNames:data.groupNames,groupCounts:data.groupCounts,
        exactPresentationParity:data.exactPresentationParity,parityChecks:data.parityChecks,skippedRegionSystems:[...new Set(rows.flatMap(x=>x.skipped))],stats:Object.fromEntries(['rawMs','cpuFrame','renderSubmission','registry','gpuMs','sceneTraversal','hud','productionTelemetry','directorTelemetry','drawCalls','triangles','programs','stepCount',...new Set(rows.flatMap(r=>Object.keys(r).filter(k=>/^(child:|count:|submit:|authored:|omittedCalls)/.test(k))))]
          .map(k=>[k,stats(rows.map(row=>row[k]))])),
        wallMs:sum('rawMs'),simulationMs:sum('simulationMs'),discardedMs:sum('discardedMs'),actions:data.trial.actions,mapping};
      assert.equal(data.exactPresentationParity,true);
      assert.equal(data.parityChecks,3);
      assert.deepEqual(Object.keys(data.trial.actions),['canonical_selection','analog_flow_request','accepted_current','release']);
      runs.push(result);
      await fs.writeFile(path.join(out,tag+'.json'),JSON.stringify({result,...data},null,2)+'\n',{flag:'wx'});
      console.log(JSON.stringify({tag,renderer:data.renderer,p50:result.stats.rawMs.p50,discardedMs:result.discardedMs,
        actions:Object.keys(data.trial.actions),aligned:result.mapping?.encodedMarkers??null}));
    }
  }
  for(const x of runs)assert.deepEqual(x.start,runs[0].start);
  await fs.writeFile(path.join(out,'matrix.json'),JSON.stringify(runs,null,2)+'\n',{flag:'wx'});
}finally{await browser?.close();await server.close();}
