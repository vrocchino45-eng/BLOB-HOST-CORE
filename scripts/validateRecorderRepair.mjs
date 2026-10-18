import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const rt = readFileSync(resolve(root,'src/core/GameRuntime.js'),'utf8');
let checks = 0;
const verify=(value,message)=>{ assert.ok(value,message); checks++; };
verify(rt.includes('import { WorldObjectCensusSystem } from "../debug/WorldObjectCensusSystem.js";'),'runtime imports recorder');
verify(rt.includes('this.worldObjectCensusSystem = new WorldObjectCensusSystem({'),'runtime constructs recorder');
verify(rt.includes('scene: this.scene,\n      frameState: this.frameState'),'recorder uses shared scene and frameState');
verify(rt.includes('this.registry.register("worldObjectCensusSystem", this.worldObjectCensusSystem, { update: false });'),'registry eagerly initializes recorder without per-frame update');
verify(rt.indexOf('this.createDebugSystems();') < rt.indexOf('this.registerRuntimeSystems();'),'construction precedes registration');
verify(!rt.includes('runtimeScope: "active_region",\n      lazyInit: true,\n      settleOnDeactivate: true\n    };\n    this.registry.register("worldObjectCensusSystem"'),'recorder not region lazy');

// Real recorder class in a minimal mocked browser. Verifies event binding,
// corner indicator, key repeat protection, stop and download intent.
const listeners = new Map();
globalThis.window = {
 addEventListener(type,handler){const v=listeners.get(type)??[];v.push(handler);listeners.set(type,v)},
 removeEventListener(type,handler){listeners.set(type,(listeners.get(type)??[]).filter(x=>x!==handler))}
};
const elements=[];
globalThis.document={
 body:{appendChild(el){elements.push(el);el.parentNode=this}},
 createElement(tag){const style={};Object.defineProperty(style,'cssText',{set(v){this.display=/display:none/.test(v)?'none':this.display}});return {tag,style,setAttribute(k,v){this[k]=v},click(){this.clicked=true;globalThis.__lastDownload=this.download},remove(){},textContent:'',href:null}}
};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads(){return []}}});
let timerCount=0;
let intervalCb=null;
globalThis.setInterval=(cb)=>{intervalCb=cb;return ++timerCount};
globalThis.clearInterval=()=>{};
globalThis.setTimeout=()=>99;
globalThis.clearTimeout=()=>{};
const {WorldObjectCensusSystem}=await import(pathToFileURL(resolve(root,'src/debug/WorldObjectCensusSystem.js')));
const fs={input:{},siltPressureRoute:{livingMaterialCycle:{conservedMass:8},materialIdentity:{records:[]}},hostConnections:{sequence:0,records:[]}};
const recorder=new WorldObjectCensusSystem({scene:{traverse(cb){}},frameState:fs});
recorder.init();
verify((listeners.get('keydown')??[]).length===1,'listener installed on initialization');
verify(elements.length===1 && elements[0].style.display==='none','corner indicator exists but initially hidden');
recorder.init();
verify((listeners.get('keydown')??[]).length===1,'re-init avoids duplicate listeners');
const key=(code,repeat=false)=>{let prevented=false;for(const handler of listeners.get('keydown')??[])handler({altKey:true,shiftKey:true,code,repeat,preventDefault(){prevented=true}});return prevented};
verify(key('KeyR'),'Alt Shift R intercepted');
verify(recorder.captureActive,'recording started');
verify(recorder.recIndicator.style.display==='block' && recorder.recIndicator.textContent.includes('● REC'),'visible REC indicator');
verify(recorder.captureEvents.some(e=>e.type==='capture-started'),'start event recorded');
verify(typeof intervalCb==='function','sampling timer installed');
key('KeyR',true);
verify(recorder.captureActive,'key repeat cannot toggle recording off');
intervalCb();
verify(recorder.recIndicator.textContent.includes('REC'),'timer preserves indicator');
key('KeyR');
verify(!recorder.captureActive,'second distinct key stops recording');
verify(recorder.recIndicator.textContent.includes('REC STOPPED'),'stop notification appears');
key('KeyE');
verify(globalThis.__lastDownload==='BLOB_LS1E1_OBSERVATION.json','Alt Shift E requests correct JSON');
verify(recorder.captureAggregate.eventCounts['capture-started']===1,'cumulative count retained');
verify(recorder.captureAggregate.eventCounts['capture-stopped']===1,'stop count retained');
console.log(JSON.stringify({pass:'LS1E1R-RECORDER-BOOT-REPAIR',checks,allPassed:true},null,2));
