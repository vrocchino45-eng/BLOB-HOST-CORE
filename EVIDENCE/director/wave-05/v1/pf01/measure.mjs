import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const [root, scratch, edge, out] = process.argv.slice(2);
for (const [key, folder] of Object.entries({TEMP:'tmp',TMP:'tmp',npm_config_cache:'npm-cache',PLAYWRIGHT_BROWSERS_PATH:'browser-cache'}))
  process.env[key] = path.join(scratch, folder);
await fs.mkdir(out);
const req = createRequire(path.join(root,'package.json'));
const {createServer} = await import(pathToFileURL(req.resolve('vite')).href);
const {chromium} = req('./BLOB_BOT_SERIES1/node_modules/playwright');
const server = await createServer({root, cacheDir:path.join(scratch,'vite-cache','pf01'), logLevel:'warn',
  server:{host:'127.0.0.1',port:0,hmr:false}});
const modes = [[false,false],[true,false],[true,true],[false,true]];
let browser;
const runs = [];
const stats = list => {
  const values = list.filter(Number.isFinite).sort((a,b)=>a-b);
  const p = n => values[Math.min(values.length-1,Math.floor(values.length*n))] ?? null;
  return {count:values.length,min:p(0),p50:p(.5),p90:p(.9),max:p(1)};
};
try {
  await server.listen();
  browser = await chromium.launch({headless:false,executablePath:edge});
  const address = 'http://127.0.0.1:'+server.httpServer.address().port;
  for (const [development, recording] of modes) {
    const label = (development?'development':'ordinary') + (recording?'-video':'-none');
    const viewport = {width:768,height:432};
    const context = await browser.newContext({viewport, ...(recording ? {recordVideo:{dir:path.join(out,'raw'),size:viewport}} : {})});
    const page = await context.newPage(), errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    await page.route('**/src/main.js',async route => {
      const response=await route.fetch();
      await route.fulfill({response,body:(await response.text())+'\nwindow.__PF01_RUNTIME__=runtime;\n'});
    });
    const video=page.video();
    await page.goto(address+(development?'/?flow=1':'/'),{waitUntil:'domcontentloaded',timeout:70000});
    await page.waitForFunction(()=>window.__PF01_RUNTIME__?.isRunning,null,{timeout:70_000});
    await page.keyboard.press('Shift+Digit6');
    await page.waitForFunction(()=>window.__PF01_RUNTIME__?.siltPressureRouteSystem?.active,null,{timeout:70_000});
    await page.evaluate(()=>{
      const r=window.__PF01_RUNTIME__;
      const f=r.frameState, first=f.frame;
      window.__PF01_START__=first;
    });
    await page.waitForFunction(()=>window.__PF01_RUNTIME__.frameState.frame>=window.__PF01_START__+24,null,{timeout:50_000});
    await page.evaluate(()=>{
      const r=window.__PF01_RUNTIME__, gl=r.renderer.getContext();
      const dbg=gl.getExtension('WEBGL_debug_renderer_info');
      const ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');
      const renderer=gl.getParameter(dbg?.UNMASKED_RENDERER_WEBGL??gl.RENDERER);
      r.playerCore.position.set(0,0,-1);
      r.playerMovementController.velocity.set(0,0,0);
      r.camera.position.set(0.25,4.3,8.5);
      r.camera.lookAt(r.playerCore.position);
      r.camera.updateMatrixWorld(true);
      const pose=r.playerCore.position.toArray();
      const cam=r.camera.position.toArray();
      const native=r.renderer.render, rows=[], pending=[];
      const times=[];
      const wrap=(obj,key,label)=>{
        if(typeof obj?.[key]!=='function')return false;
        const method=obj[key];
        obj[key]=function(...args){
          const t=performance.now();
          try { return method.apply(this,args); } finally { times.push([label,performance.now()-t]); }
        };
        return true;
      };
      const sensors={registry:wrap(r.registry,'update','registry'),
        hud:wrap(r.playtestHudSystem,'update','hud'),
        telemetry:wrap(r.sessionTelemetrySystem,'update','telemetry'),
        camera:wrap(r,'updateCamera','camera')};
      r.renderer.render=function(scene,camera){
        if(scene!==r.scene||this.getRenderTarget()!==null) return native.call(this,scene,camera);
        if (ext) {
          for (let i=pending.length-1;i>=0;i--) {
            const {query,row}=pending[i];
            if (!gl.getQueryParameter(query,gl.QUERY_RESULT_AVAILABLE)) continue;
            if (!gl.getParameter(ext.GPU_DISJOINT_EXT)) row.gpuMs=gl.getQueryParameter(query,gl.QUERY_RESULT)/1e6;
            gl.deleteQuery(query); pending.splice(i,1);
          }
        }
        const query=ext&&rows.length<32&&pending.length<6 ? gl.createQuery() : null;
        if(query)gl.beginQuery(ext.TIME_ELAPSED_EXT,query);
        const now=performance.now();
        try {return native.call(this,scene,camera);} finally {
          if(query)gl.endQuery(ext.TIME_ELAPSED_EXT);
          const f=r.frameState, info=this.info.render;
          const row={frame:f.frame, substep:f.runtimeSimulationSubstepIndex, raw:f.runtimeFrameRawDeltaMs,
            simulated:f.runtimeFrameSimulatedDeltaMs,dropped:f.runtimeFrameDroppedDeltaMs,
            stepCount:f.runtimeSimulationSubstepCount, wall:performance.now(),cpuRender:performance.now()-now,
            calls:info.calls, triangles:info.triangles, programs:this.info.programs?.length??null, gpuMs:null};
          for(const [label,ms] of times.splice(0))row[label]=(row[label]??0)+ms;
          if(rows.length<32) rows.push(row);
          if(query) pending.push({query,row});
          if(rows.length===32&&!window.__PF01_LAST__)window.__PF01_LAST__=f.frame;
          if(window.__PF01_LAST__&&f.frame>=window.__PF01_LAST__+6) {
            r.renderer.render=native;
            window.__PF01_OUTPUT__={renderer,sensors,gpuQueries:Boolean(ext),pose,cam,rows,cell:f.activeCellId};
          }
        }
      };
    });
    await page.waitForFunction(()=>window.__PF01_OUTPUT__,null,{timeout:80_000});
    const data=await page.evaluate(()=>window.__PF01_OUTPUT__);
    await context.close();
    assert.deepEqual(errors,[]);
    if(video)await video.saveAs(path.join(out,label+'.webm'));
    const rows=data.rows.slice(1);
    const sum=key=>rows.reduce((n,x)=>n+x[key],0);
    const result={label,development,recording,...data,stats:Object.fromEntries(
      ['raw','cpuRender','registry','camera','gpuMs','hud','telemetry','triangles','calls','programs','stepCount'].map(k=>[k,stats(rows.map(x=>x[k]))])),
      wallMs:sum('raw'),simulationMs:sum('simulated'),discardedMs:sum('dropped'),availableGpuSamples:stats(rows.map(x=>x.gpuMs)).count};
    await fs.writeFile(path.join(out,label+'.json'),JSON.stringify(result,null,2)+'\n');
    runs.push(result);
    console.log(JSON.stringify({label,renderer:result.renderer,wall:result.wallMs,simulation:result.simulationMs,dropped:result.discardedMs,stats:result.stats,sensors:result.sensors}));
  }
  await fs.writeFile(path.join(out,'matrix.json'),JSON.stringify(runs,null,2)+'\n');
} finally {await browser?.close();await server.close();}

