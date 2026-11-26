import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

const [root, out, edge] = process.argv.slice(2);
const require = createRequire(path.join(root,'package.json'));
const {createServer} = await import(pathToFileURL(require.resolve('vite')).href);
const {chromium}=require('./BLOB_BOT_SERIES1/node_modules/playwright');
const scenario = JSON.parse(await fs.readFile(path.join(root,'BLOB_BOT_SERIES1/director/scenarios/balanced.json'),'utf8'));
await fs.mkdir(out);
const server=await createServer({root,cacheDir:path.join(out,'vite-cache'),logLevel:'warn',server:{host:'127.0.0.1',port:0,hmr:false}});
const cpu=()=>os.cpus().reduce((s,c)=>[s[0]+c.times.idle,s[1]+Object.values(c.times).reduce((x,y)=>x+y,0)],[0,0]);
let browser;
const runs=[];
try {
  await server.listen();
  browser=await chromium.launch({executablePath:edge,headless:true});
  const origin='http://127.0.0.1:'+server.httpServer.address().port;
  for(const zone of ['Surface Wake','Silt Shelf','Core Work']) {
   for(const pixelRatio of [1,.5,1]) {
    const before=cpu();
    const context=await browser.newContext({viewport:{width:768,height:432},deviceScaleFactor:1});
    try {
     const page=await context.newPage();
     const session=await context.newCDPSession(page);const trace=[];
     session.on('Tracing.dataCollected',event=>trace.push(...event.value));
     await page.addInitScript(()=>{
       const pad=window.__PF06_PAD__={buttons:[],axes:[0,0,0,0]};
       Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{id:'PF06 staged pad',mapping:'standard',index:0,connected:true,
         axes:pad.axes,buttons:Array.from({length:17},(_,i)=>{const value=pad.buttons[i]??0;return{value,pressed:value>.5,touched:value>0};})}]});
     });
     await page.route('**/src/main.js',async route=>{
       const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nwindow.__PF06_RUNTIME__=runtime;\n'});
     });
     await page.goto(origin+'/?flow=1',{waitUntil:'domcontentloaded',timeout:90000});
     await page.waitForFunction(()=>window.__PF06_RUNTIME__?.isRunning,null,{timeout:90000});
     if(zone!=='Surface Wake') {
       await page.keyboard.press('Shift+Digit6');
       await page.waitForFunction(()=>window.__PF06_RUNTIME__?.siltPressureRouteSystem?.active,null,{timeout:65000});
       if(!await page.evaluate(()=>window.__PF06_RUNTIME__.frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded))await page.keyboard.press('p');
       await page.waitForFunction(()=>window.__PF06_RUNTIME__.frameState.spatialCoreChemistry?.retainedPieceCount===3,null,{timeout:45000});
     }
     if(zone==='Core Work') {
       await page.evaluate(()=>{window.__PF06_PAD__.buttons[3]=1;});
       await page.waitForFunction(()=>window.__PF06_RUNTIME__.frameState.inspectionCamera?.active||window.__PF06_RUNTIME__.frameState.tightInspectionCamera?.active,null,{timeout:30000});
       await page.evaluate(()=>{window.__PF06_PAD__.buttons[3]=0;window.__PF06_PAD__.buttons[13]=1;});
       await page.waitForFunction(()=>window.__PF06_RUNTIME__.frameState.inspectionCamera?.coreWorkActive||window.__PF06_RUNTIME__.frameState.tightInspectionCamera?.coreWorkActive,null,{timeout:30000});
       await page.evaluate(()=>{window.__PF06_PAD__.buttons[13]=0;});
     }
     await session.send('HeapProfiler.startSampling',{samplingInterval:524288,includeObjectsCollectedByMinorGC:true});
     await session.send('Tracing.start',{categories:'devtools.timeline,v8',transferMode:'ReportEvents'});
     await page.evaluate(async ({zone,pixelRatio,scenario})=>{
       const r=window.__PF06_RUNTIME__,f=r.frameState,gl=r.renderer.getContext();
       const dbg=gl.getExtension('WEBGL_debug_renderer_info');
       const gpu=gl.getExtension('EXT_disjoint_timer_query_webgl2');
       const renderer=gl.getParameter(dbg?.UNMASKED_RENDERER_WEBGL??gl.RENDERER);
       if(zone==='Silt Shelf'){
         const {stageShelf}=await import('/BLOB_BOT_SERIES1/director/shelf-stage.mjs');
         stageShelf(r,scenario);
         window.__PF06_PAD__.buttons[6]=.82;
         window.__PF06_PAD__.buttons[7]=.46;
       }
       r.renderer.setPixelRatio(pixelRatio);
       const visible={total:0,hidden:0,visibleMeshes:0,hiddenMeshes:0};
       r.scene.traverse(o=>{let show=true;for(let x=o;x;x=x.parent)if(!x.visible){show=false;break;}
        visible.total++;if(!show)visible.hidden++;if(o.isMesh)visible[show?'visibleMeshes':'hiddenMeshes']++;});
       let counters={}, rows=[], queries=[], work=0, wallLast, marker=0, start={frame:f.frame,cell:f.activeCellId,
        pose:r.playerCore.position.toArray(),look:r.camera.position.toArray(),attached:f.playerAttachment?.active??false};
       const add=(k,v=1)=>counters[k]=(counters[k]??0)+v;
       const wrap=(o,k,label)=>{
         const orig=o[k];o[k]=function(...args){const now=performance.now();try{return orig.apply(this,args);}finally{add(label,performance.now()-now);}};
       };
       wrap(r.registry,'update','registrySubstepsMs');
       wrap(r.scene,'updateMatrixWorld','sceneMatrixMs');
       const direct=r.renderer.renderBufferDirect;
       r.renderer.renderBufferDirect=function(camera,scene,geometry,mat,object,group){
         const kind=mat.transmission>0?'transmissive':mat.transparent?'transparent':'opaque';
         add('draw.'+kind);return direct.apply(this,arguments);
       };
       const native=r.renderer.render;
       r.renderer.render=function(scene,camera){
         if(scene!==r.scene||this.getRenderTarget()!==null)return native.apply(this,arguments);
         for(let i=queries.length-1;i>=0;i--){
           const {query,row}=queries[i];if(!gl.getQueryParameter(query,gl.QUERY_RESULT_AVAILABLE))continue;
           if(!gl.getParameter(gpu.GPU_DISJOINT_EXT))row.gpuMs=gl.getQueryParameter(query,gl.QUERY_RESULT)/1e6;
           gl.deleteQuery(query);queries.splice(i,1);
         }
         const query=gpu&&marker>=5&&marker<29&&queries.length<6?gl.createQuery():null;
         if(query)gl.beginQuery(gpu.TIME_ELAPSED_EXT,query);
         const begin=performance.now();
         const out=native.apply(this,arguments);
         if(query)gl.endQuery(gpu.TIME_ELAPSED_EXT);
         const now=performance.now(), row={frame:f.frame,wallMs:wallLast===undefined?null:now-wallLast,
           rawMs:f.runtimeFrameRawDeltaMs,admittedMs:f.runtimeFrameSimulatedDeltaMs,discardedMs:f.runtimeFrameDroppedDeltaMs,
           slices:f.runtimeSimulationSubstepCount,drawCalls:this.info.render.calls,cpuRenderMs:now-begin,gpuMs:null,
           attached:f.playerAttachment?.active??false,flow:f.coreFlow?.result?.acceptedCurrent01??null,...counters};
         work+=f.runtimeFrameSimulatedDeltaMs??0;wallLast=now;counters={};
         if(marker>=5&&marker<29){rows.push(row);if(query)queries.push({query,row});}
         marker++;
         if(marker===35){
           window.__PF06_RESULT__={renderer,gpuAvailable:Boolean(gpu),visible,start,rows,measuredPixels:[gl.drawingBufferWidth,gl.drawingBufferHeight],
             end:{frame:f.frame,cell:f.activeCellId,pose:r.playerCore.position.toArray(),attached:f.playerAttachment?.active??false,work}};
           r.renderer.render=native;
         }
         return out;
       };
     },{zone,pixelRatio,scenario});
     await page.waitForFunction(()=>window.__PF06_RESULT__,null,{timeout:90000});
     const result=await page.evaluate(()=>window.__PF06_RESULT__);
     const traceEnd=new Promise(resolve=>session.once('Tracing.tracingComplete',resolve));await session.send('Tracing.end');await traceEnd;
     const {profile}=await session.send('HeapProfiler.stopSampling');
     const allocated={};
     const visit=node=>{const location=node.callFrame?.url?.replace(/^https?:\/\/[^/]+/,'').replace(/^\/@fs\/.*$/,'<dependency>')||'native/unsymbolized';
       if(node.selfSize)allocated[location]=(allocated[location]??0)+node.selfSize;for(const child of node.children??[])visit(child);};visit(profile.head);
     const gc=trace.filter(x=>x.ph==='X'&&/^(MinorGC|MajorGC)$/.test(x.name)).map(x=>({kind:x.name,ms:(x.dur??0)/1000}));
     const after=cpu(),wholeHostBusy=1-(after[0]-before[0])/(after[1]-before[1]);
     runs.push({zone,pixelRatio,...result,allocationSampleBytes:524288,allocated,gc,wholeHostBusy});
     await fs.writeFile(path.join(out,'measurements.json'),JSON.stringify({source:execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),runs},null,2)+'\n');
     console.log(zone,pixelRatio,result.renderer,result.rows.length);
    } finally { await context.close(); }
   }
  }
} finally {await browser?.close();await server.close();}
