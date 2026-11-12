// Temporary diagnostic. Original methods, arguments, results and errors remain authoritative.
export function installSiltObserver(Route, Movement) {
 const rp=Route.prototype, mp=Movement.prototype;
 if(typeof rp.update!=='function'||typeof mp.update!=='function')throw Error('Required Silt/movement methods missing');
 const routeUpdate=rp.update, movementUpdate=mp.update, routes=new Set(), watches=[], frames=[], events=[];
 let active=true,lastAttachment=null,totalEvents=0,lastSample=-Infinity;
 const plain=v=>v?{x:v.x,y:v.y,z:v.z}:null;
 const add=(type,data={})=>{totalEvents++;if(events.length<300)events.push({type,...data});};
 const safe=fn=>{try{return fn();}catch(e){add('observer_error',{error:String(e)});return null;}};
 const context=f=>({t:f?.runtimeSeconds,frame:f?.frame,cell:f?.activeCellId,
  attachment:f?.playerAttachment?{active:f.playerAttachment.active,reason:f.playerAttachment.detachReason,
   blocked:f.playerAttachment.reacquireBlocked,clearance:f.playerAttachment.releaseClearance}:null,
  surfaceTruth:f?.coreSurfaceTruth??f?.surfaceTruth??null});
 function snapshot(r){
  let meshes=0,hidden=0,transparent=0;const hiddenNames=[],invalid=[],ancestors=[];
  for(let p=r.root;p;p=p.parent)if(p.visible===false)ancestors.push(p.name||p.type);
  r.root?.traverse(o=>{
   if([o.position,o.scale,o.rotation].some(v=>v&&![v.x,v.y,v.z].every(Number.isFinite))&&invalid.length<12)invalid.push(o.name||o.type);
   if(!o.isMesh)return;meshes++;
   let visible=true;for(let p=o;p;p=p.parent)if(p.visible===false)visible=false;
   if(!visible){hidden++;if(hiddenNames.length<12)hiddenNames.push(o.name||o.type);}
   const mats=Array.isArray(o.material)?o.material:[o.material];
   if(mats.every(m=>!m||m.visible===false||(m.transparent&&m.opacity<=.001)))transparent++;
  });
  return {routeActive:r.active,rootExists:!!r.root,rootName:r.root?.name,
   rootParent:r.root?.parent?.name||r.root?.parent?.type||null,rootVisible:r.root?.visible,
   position:plain(r.root?.position),scale:plain(r.root?.scale),hiddenAncestors:ancestors,
   meshCount:meshes,hiddenMeshes:hidden,zeroAlphaOrHiddenMaterialMeshes:transparent,hiddenNames,invalidTransforms:invalid,
   crawlable:(r.hcCrawlableSurfaceMeshes??[]).map(o=>({name:o.name,visible:o.visible,
    position:plain(o.position),scale:plain(o.scale),opacity:o.material?.opacity,materialVisible:o.material?.visible,
    parent:o.parent?.name,surfaceContactDisabled:o.userData?.surfaceContactDisabled??false})),
   lastInteraction:r.lastInteraction};
 }
 function watch(r){
  routes.add(r);const o=r.root;if(!o||watches.some(w=>w.object===o))return;
  const descriptor=Object.getOwnPropertyDescriptor(o,'visible');
  if(!descriptor||!descriptor.configurable||!('value'in descriptor)||!descriptor.writable){add('visibility_watch_unavailable');return;}
  let value=o.visible;
  const get=()=>value,set=next=>{const before=value;value=next;if(active&&before!==next)safe(()=>add('root_visibility_write',{
   ...context(r.frameState),before,after:next,caller:new Error().stack,silt:snapshot(r)}));};
  Object.defineProperty(o,'visible',{configurable:true,enumerable:descriptor.enumerable,get,set});
  watches.push({object:o,descriptor,get,value:()=>value});
  add('route_observed',{...context(r.frameState),silt:snapshot(r)});
 }
 function update(...args){
  if(active)safe(()=>watch(this));
  let result;try{result=Reflect.apply(routeUpdate,this,args);}catch(e){if(active)safe(()=>add('route_update_threw',{
   ...context(args[1]??this.frameState),error:String(e.stack||e),silt:snapshot(this)}));throw e;}
  if(active)safe(()=>{
   watch(this);const f=args[1]??this.frameState,t=f?.runtimeSeconds??0;
   if(t-lastSample>=1||lastSample===-Infinity){lastSample=t;frames.push({...context(f),silt:snapshot(this)});if(frames.length>90)frames.shift();}
  });return result;
 }
 function move(...args){
  const result=Reflect.apply(movementUpdate,this,args);
  if(active)safe(()=>{const f=args[1]??this.frameState,a=f?.playerAttachment?.active;
   if(typeof a==='boolean'&&a!==lastAttachment){add('attachment_transition',{...context(f),before:lastAttachment,after:a,
    routes:[...routes].map(snapshot)});lastAttachment=a;}
  });return result;
 }
 rp.update=update;mp.update=move;
 const dump=()=>({pass:'SILT-RELEASE-OBS1',scope:'diagnostic capture; no repair or acceptance claim',
  active,totalEvents,droppedEvents:Math.max(0,totalEvents-events.length),events:events.slice(),recentFrames:frames.slice(),
  current:[...routes].map(r=>({...context(r.frameState),silt:snapshot(r)})),
  note:'Runtime visibility-write callers and before/after state. Zero-alpha counts describe materials, not camera occlusion or collision proof.'});
 return Object.freeze({dump,stop(){active=false;if(rp.update===update)rp.update=routeUpdate;if(mp.update===move)mp.update=movementUpdate;
  for(const w of watches){const d=Object.getOwnPropertyDescriptor(w.object,'visible');if(d?.get===w.get)Object.defineProperty(w.object,'visible',{...w.descriptor,value:w.value()});}
  return dump();}});
}
