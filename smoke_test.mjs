#!/usr/bin/env node
/* Offline synthetic browser smoke test; NOT a benchmark of real game/browser performance. */
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let time=0,nextId=1,events=[], downloads=0;
const listeners={};let focus=true;
function schedule(fn, delay=0){const id=nextId++;events.push({id,t:time+Math.max(0,delay),fn});return id;}
const cancel=(id)=>{events=events.filter(x=>x.id!==id);};
function emit(k){for(const fn of listeners[k]||[])fn();}
const window={innerWidth:1440,innerHeight:900,devicePixelRatio:1,
 addEventListener(k,f){(listeners[k] ||= new Set()).add(f);},
 removeEventListener(k,f){listeners[k]?.delete(f);}};
const document={visibilityState:'visible',hasFocus:()=>focus,
 addEventListener:window.addEventListener,removeEventListener:window.removeEventListener,
 body:{appendChild(){}},createElement:()=>({click(){downloads++;},remove(){},href:'',download:''})};
const ctx={window,document,performance:{now:()=>time},setTimeout:schedule,clearTimeout:cancel,
 requestAnimationFrame:(fn)=>schedule(()=>fn(time),time<7000?16:150),cancelAnimationFrame:cancel,
 navigator:{userAgent:'synthetic-smoke-test'},screen:{width:1440,height:900},
 PerformanceObserver:undefined,Blob:class{constructor(a,o){this.data=a;this.options=o;}},
 URL:{createObjectURL:()=> 'blob:smoke',revokeObjectURL(){}},console};
vm.runInNewContext(readFileSync(new URL('./w2a_browser_profiler.js',import.meta.url),'utf8'),ctx);
window.BLOB_W2A.arm({label:'synthetic_test',recording:false,route:'synthetic',delaySeconds:0,durationSeconds:20});
schedule(()=>{ document.visibilityState='hidden';emit('visibilitychange');},1000);
schedule(()=>{ document.visibilityState='visible';emit('visibilitychange');},1800);
schedule(()=>{ focus=false;emit('blur');},2000);
schedule(()=>{ focus=true;emit('focus');},2700);
let steps=0;
while(events.length && time<=20500 && steps++<25000){events.sort((a,b)=>a.t-b.t||a.id-b.id); const e=events.shift();time=e.t;e.fn();}
const result=window.BLOB_W2A.report;
assert(result,'Automatic stop must yield report');
assert.equal(result.schema,'blob.w2a.browser_frame_truth.v1');
assert(result.browserRafOnly.callbackCount>200,'frame monitor must observe rAF');
assert(result.browserRafOnly.over100Ms>0,'injected slow frames must appear');
assert(result.hiddenSeconds>0.7 && result.hiddenSeconds<1,'visibility state must be tracked');
assert(result.blurredSeconds>0.6 && result.blurredSeconds<1,'focus state must be tracked');
assert.equal(result.longTaskObserverAvailable,false);
assert(result.tenSecondWindows.length>=2);
window.BLOB_W2A.download();assert.equal(downloads,1);
writeFileSync(new URL('./smoke_unrecorded.json',import.meta.url),JSON.stringify(result,null,2));
console.log(`SMOKE PASS: ${result.browserRafOnly.callbackCount} rAF callbacks, ${result.browserRafOnly.over100Ms} slow intervals, ${result.hiddenSeconds}s hidden, download=${downloads}`);
