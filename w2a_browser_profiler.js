/*
 BLOB HC-031W2A Frame Truth / browser-only observer, v1.0
 Paste whole file into Chrome/Edge DevTools Console in the game tab (Snippets is fine).
 No game source edits, no gameplay hooks, no graphics/HUD additions, no network calls.
 Provides window.BLOB_W2A.arm({label,delaySeconds:8,durationSeconds:120});
 Browser rAF observations are NOT game update or render counts.
*/
(() => {
  'use strict';
  const KEY = 'BLOB_W2A';
  if (window[KEY] && typeof window[KEY].dispose === 'function') window[KEY].dispose();
  const VERSION = 'HC-031W2A-browser-rAF-v1.0';
  const state = {
    phase: 'idle', timer: null, stopTimer: null, rafId: null, observer: null,
    removeListeners: [], lastReport: null, run: null
  };
  const now = () => performance.now();
  const round = (x, digits=2) => Number.isFinite(x) ? +x.toFixed(digits) : null;
  const percentile = (values, fraction) => {
    if (!values.length) return null;
    const sorted=values.slice().sort((a,b)=>a-b);
    return round(sorted[Math.min(sorted.length-1, Math.ceil(fraction*sorted.length)-1)]);
  };
  const current = () => ({hidden: document.visibilityState !== 'visible', blurred: !document.hasFocus()});
  function trackClock(r,t) {
    if (r.lastClock === null) { r.lastClock=t; return; }
    const delta=Math.max(0,t-r.lastClock); r.lastClock=t;
    if (r.hidden) r.hiddenMs += delta;
    if (r.blurred) r.blurredMs += delta;
  }
  function addLifecycle(r,name,t) {
    trackClock(r,t);
    const next=current(); r.hidden=next.hidden; r.blurred=next.blurred;
    if (r.lifecycle.length < 100) r.lifecycle.push({wallSecond:round((t-r.startMs)/1000,3),event:name,hidden:r.hidden,blurred:r.blurred});
  }
  function makeBucket(index) {
    return {index,intervalMs:[],rafCallbacks:0,thresholds:{over50:0,over100:0,over250:0,over1000:0},maxGapMs:0, longTaskCount:0,longTaskTotalMs:0};
  }
  function summarizeBucket(b) {
    const xs=b.intervalMs;
    return {startSecond:b.index*10,endSecond:(b.index+1)*10,observedRafCallbacks:b.rafCallbacks,
      eligibleVisibleFrameIntervals:xs.length,visibleIntervalP50Ms:percentile(xs,0.50),visibleIntervalP95Ms:percentile(xs,0.95),visibleIntervalP99Ms:percentile(xs,0.99),
      visibleMaxGapMs:round(b.maxGapMs),...b.thresholds,
      longTaskCount:b.longTaskCount,longTaskTotalMs:round(b.longTaskTotalMs)};
  }
  function bucket(r,t){const index=Math.max(0,Math.floor((t-r.startMs)/10000));return r.buckets[index] ||=makeBucket(index);}
  function begin(options) {
    if (state.phase !== 'armed') return;
    const t=now(), env=current();
    const r={version:VERSION,options,startMs:t,startIso:new Date().toISOString(),
      hidden:env.hidden,blurred:env.blurred,hiddenMs:0,blurredMs:0,lastClock:t,
      lastRafMs:null,lastRafVisibility:null,buckets:[],intervals:[],rafCallbacks:0,
      crossVisibilityGaps:0,excludedHiddenIntervals:0,lifecycle:[],longTaskAvailable:false,longTaskCount:0,longTasks:[],
      audio:undefined};
    state.run=r;state.phase='running';
    const onVisibility=()=>addLifecycle(r,'visibilitychange',now());
    const onFocus=()=>addLifecycle(r,'focus',now());
    const onBlur=()=>addLifecycle(r,'blur',now());
    document.addEventListener('visibilitychange',onVisibility);
    window.addEventListener('focus',onFocus);window.addEventListener('blur',onBlur);
    state.removeListeners=[()=>document.removeEventListener('visibilitychange',onVisibility),()=>window.removeEventListener('focus',onFocus),()=>window.removeEventListener('blur',onBlur)];
    try {
      if (typeof PerformanceObserver !== 'undefined' && (PerformanceObserver.supportedEntryTypes||[]).includes('longtask')) {
        state.observer=new PerformanceObserver((list)=>{
          for (const e of list.getEntries()) {
            const b=bucket(r,e.startTime), entry={second:round((e.startTime-r.startMs)/1000,3),durationMs:round(e.duration)};
            b.longTaskCount++;b.longTaskTotalMs+=e.duration;r.longTaskCount++;
            if(r.longTasks.length<100)r.longTasks.push(entry);
          }
        });
        state.observer.observe({entryTypes:['longtask']});r.longTaskAvailable=true;
      }
    } catch (_) {r.longTaskAvailable=false;}
    function tick(t) {
      if (state.phase !== 'running')return;
      trackClock(r,t); r.rafCallbacks++;
      const b=bucket(r,t);b.rafCallbacks++;
      const hidden=document.visibilityState!=='visible';
      if(r.lastRafMs!==null) {
        const dt=t-r.lastRafMs;
        if(!hidden && !r.lastRafVisibility && Number.isFinite(dt) && dt>=0){
          r.intervals.push(dt); b.intervalMs.push(dt);b.maxGapMs=Math.max(b.maxGapMs,dt);
          if(dt>50)b.thresholds.over50++;
          if(dt>100)b.thresholds.over100++;
          if(dt>250)b.thresholds.over250++;
          if(dt>1000)b.thresholds.over1000++;
        } else if(hidden || r.lastRafVisibility){r.excludedHiddenIntervals++; if(hidden!==r.lastRafVisibility)r.crossVisibilityGaps++;}
      }
      r.lastRafMs=t;r.lastRafVisibility=hidden;
      state.rafId=requestAnimationFrame(tick);
    }
    state.rafId=requestAnimationFrame(tick);
    state.stopTimer=setTimeout(()=>api.stop('auto-duration-complete'),options.durationSeconds*1000);
    console.info(`[BLOB W2A] STARTED ${options.label}; ${options.durationSeconds}s. Close DevTools for the route. Browser rAF monitor only; gameplay untouched.`);
  }
  function stop(reason='manual') {
    if(state.phase==='armed') {clearTimeout(state.timer);state.phase='idle';console.info('[BLOB W2A] Armed run cancelled.');return null;}
    if(state.phase!=='running')return state.lastReport;
    const r=state.run,end=now();trackClock(r,end);
    state.phase='finished';if(state.rafId!==null)cancelAnimationFrame(state.rafId);
    clearTimeout(state.stopTimer);
    state.removeListeners.forEach(f=>f());state.removeListeners=[];
    if(state.observer){try{state.observer.disconnect();}catch(_){} state.observer=null;}
    const elapsedMs=end-r.startMs, visibleMs=Math.max(0,elapsedMs-r.hiddenMs);
    const report={schema:'blob.w2a.browser_frame_truth.v1',profilerVersion:VERSION, label:r.options.label,
      manualConditions:{recording:r.options.recording,route:r.options.route,notes:r.options.notes},
      startedAtIso:r.startIso,endedAtIso:new Date().toISOString(),stopReason:reason,
      durationWallSeconds:round(elapsedMs/1000,3),visibleSeconds:round(visibleMs/1000,3),hiddenSeconds:round(r.hiddenMs/1000,3),blurredSeconds:round(r.blurredMs/1000,3),
      browser:{userAgent:navigator.userAgent,devicePixelRatio:window.devicePixelRatio||1,innerWidth:window.innerWidth,innerHeight:window.innerHeight,
        screenWidth:screen.width,screenHeight:screen.height,visibilityAtEnd:document.visibilityState,
        canvasSurfaces:typeof document.querySelectorAll==='function'?Array.from(document.querySelectorAll('canvas')).slice(0,6).map(c=>({drawingWidth:c.width,drawingHeight:c.height,cssWidth:Math.round(c.getBoundingClientRect().width),cssHeight:Math.round(c.getBoundingClientRect().height)})):[]},
      browserRafOnly:{callbackCount:r.rafCallbacks,callbacksPerVisibleSecond:round(r.rafCallbacks/(visibleMs/1000||1)),
        eligibleIntervalCount:r.intervals.length,p50Ms:percentile(r.intervals,.50),p95Ms:percentile(r.intervals,.95),p99Ms:percentile(r.intervals,.99),
        maxMs:r.intervals.length?round(r.intervals.reduce((a,b)=>Math.max(a,b),0)):null,
        over100Ms:r.intervals.filter(x=>x>100).length,over250Ms:r.intervals.filter(x=>x>250).length,over1000Ms:r.intervals.filter(x=>x>1000).length,
        excludedHiddenIntervals:r.excludedHiddenIntervals,crossVisibilityGaps:r.crossVisibilityGaps},
      longTaskObserverAvailable:r.longTaskAvailable,longTaskCount:r.longTaskCount,
      longTasksFirst100:r.longTasks,lifecycleEvents:r.lifecycle,tenSecondWindows:r.buckets.filter(Boolean).map(summarizeBucket),
      importantLimits:['Independent observer of browser requestAnimationFrame opportunities; NOT game update count, game draw count, simulation delta, or FPS of encoded video.',
      'Browser focus/visibility time is measured separately; blur alone does not establish throttling.',
      'Console opening/closing may affect head and tail. Compare same route and foreground state.']};
    state.lastReport=report;state.run=null;
    console.info('[BLOB W2A] FINISHED',report);console.table(report.tenSecondWindows);
    console.info('Export with BLOB_W2A.download(). No gameplay files were changed.');
    return report;
  }
  const api={
    arm(opts={}){
      if(state.phase==='running'||state.phase==='armed')throw new Error('Finish or cancel the current W2A run first.');
      const options={label:typeof opts.label==='string'&&opts.label.trim()?opts.label.trim():'unlabelled',
        route:opts.route||'not specified',recording:opts.recording===true,notes:opts.notes||'',
        delaySeconds:Math.max(0,Math.min(60,Number.isFinite(opts.delaySeconds)?opts.delaySeconds:8)),
        durationSeconds:Math.max(20,Math.min(600,Number.isFinite(opts.durationSeconds)?opts.durationSeconds:120))};
      state.phase='armed';state.timer=setTimeout(()=>begin(options),options.delaySeconds*1000);
      console.info(`[BLOB W2A] ARMED: ${options.label}. Starts in ${options.delaySeconds}s, records ${options.durationSeconds}s. Close DevTools now; keep game tab foreground.`);
      return options;
    }, stop, get report(){return state.lastReport;},
    download(name){
      if(!state.lastReport)throw new Error('No finished report. Wait for auto-stop or call BLOB_W2A.stop().');
      const safe=(name||state.lastReport.label).replace(/[^a-z0-9_\-]+/gi,'_').slice(0,70);
      const blob=new Blob([JSON.stringify(state.lastReport,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`BLOB_W2A_${safe}.json`;
      document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    },
    dispose(){if(state.phase==='running')stop('profiler-replaced');if(state.phase==='armed')clearTimeout(state.timer);state.removeListeners.forEach(f=>f());if(state.observer)state.observer.disconnect();if(state.rafId!==null)cancelAnimationFrame(state.rafId);clearTimeout(state.stopTimer);state.phase='disposed';}
  };
  window[KEY]=api;
  console.info('[BLOB W2A] Installed. Example: BLOB_W2A.arm({label:"surface_unrecorded", route:"Surface Wake", recording:false, delaySeconds:8, durationSeconds:120});');
})();
