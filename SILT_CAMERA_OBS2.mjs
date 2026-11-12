import * as THREE from 'three';
import {SiltPressureRouteSystem} from './src/routes/SiltPressureRouteSystem.js';
const key='__BLOB_SILT_CAMERA_OBS2__';
if(!globalThis[key]){
 const proto=SiltPressureRouteSystem.prototype,original=proto.update;
 const routes=new Set(),saved=new Map(),captures=[];let active=true,comparison=false;
 const vec=v=>v?{x:v.x,y:v.y,z:v.z}:null;
 const shells=r=>{const out=[];r.root?.traverse(o=>{
  if(o.isMesh&&o.name?.endsWith('_irregular_inward_stone_stratum'))out.push(o);
 });return out;};
 function snapshot(label){
  const data={label,comparison,regions:[...routes].map(r=>{
   r.root?.updateWorldMatrix(true,true);
   const camera=r.camera?.getWorldPosition(new THREE.Vector3());
   const player=r.playerRoot?.getWorldPosition(new THREE.Vector3());
   return {t:r.frameState?.runtimeSeconds,cell:r.frameState?.activeCellId,routeActive:r.active,
    rootVisible:r.root?.visible,camera:vec(camera),player:vec(player),
    cameraPlayerDistance:camera&&player?camera.distanceTo(player):null,
    cameraNear:r.camera?.near,cameraFar:r.camera?.far,cameraFov:r.camera?.fov,
    shells:shells(r).map(o=>{
     const c=camera?o.worldToLocal(camera.clone()):null,p=player?o.worldToLocal(player.clone()):null;
     const materials=Array.isArray(o.material)?o.material:[o.material];
     let visible=true;for(let a=o;a;a=a.parent)if(a.visible===false)visible=false;
     return {name:o.name,effectivelyVisible:visible,side:materials.map(m=>m.side),opacity:materials.map(m=>m.opacity),
      cameraInShellLocalSpace:vec(c),playerInShellLocalSpace:vec(p),
      cameraLocalRadius:c?.length(),playerLocalRadius:p?.length(),
      note:'Local radii are approximate relative to a deformed unit-sphere shell with openings; not an exact inside/outside test.'};
    })};
  })};
  captures.push(data);if(captures.length>20)captures.shift();return data;
 }
 function update(...args){if(active)routes.add(this);return Reflect.apply(original,this,args);}
 proto.update=update;
 const restore=()=>{for(const [m,side]of saved){m.side=side;m.needsUpdate=true;}saved.clear();comparison=false;};
 const api={capture:()=>snapshot('manual'),showExteriors(){
  snapshot('before_double_side');
  for(const r of routes)for(const o of shells(r))for(const m of Array.isArray(o.material)?o.material:[o.material]){
   if(!saved.has(m))saved.set(m,m.side);m.side=THREE.DoubleSide;m.needsUpdate=true;
  }
  comparison=true;return snapshot('after_double_side');
 },restore(){restore();return snapshot('restored_original_sides');},
 dump(){return {pass:'SILT-CAMERA-OBS2',scope:'temporary cave-shell sidedness comparison and camera/player snapshot; no attachment repair',
  sideLegend:{0:'FrontSide',1:'BackSide',2:'DoubleSide'},active,comparison,routeCount:routes.size,
  captures:captures.slice(),note:'Human visual result required. No automated PASS/FAIL. Only named visual cave shell materials change; movement and surface metadata remain untouched.'};},
 download(){snapshot('export');const report=api.dump();const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='SILT_CAMERA_OBS2_REPORT.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return report;},
 stop(){restore();active=false;if(proto.update===update)proto.update=original;return api.dump();}};
 globalThis[key]=Object.freeze(api);
}
export const observer=globalThis[key];
