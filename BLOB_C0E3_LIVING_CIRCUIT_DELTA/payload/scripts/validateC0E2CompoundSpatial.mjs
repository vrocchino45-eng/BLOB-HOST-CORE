import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = file => fs.readFileSync(path.join(base, file), 'utf8');
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
// A small deterministic mock scene graph. This DOES NOT claim a Three.js render.
class Vec {
  constructor(x=0, y=0, z=0) { this.x=x; this.y=y; this.z=z; this.isVector3=true; }
  set(x,y,z) { this.x=x; this.y=y; this.z=z; return this; }
  fromArray(a) { return this.set(a[0],a[1],a[2]); }
  clone() { return new Vec(this.x,this.y,this.z); }
  copy(v) { return this.set(v.x,v.y,v.z); }
  lerp(v,t) { this.x+=(v.x-this.x)*t; this.y+=(v.y-this.y)*t; this.z+=(v.z-this.z)*t; return this; }
  add(v) { this.x+=v.x; this.y+=v.y; this.z+=v.z; return this; }
  distanceTo(v) { return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z); }
  setScalar(n) { return this.set(n,n,n); }
}
class Obj {
  constructor() { this.userData={}; this.children=[]; this.position=new Vec(); this.rotation=new Vec(); this.scale=new Vec(1,1,1); this.matrix={}; this.name=''; }
  add(child) { child.parent=this; this.children.push(child); }
  traverse(fn) { fn(this); for (const child of this.children) child.traverse?.(fn); }
  worldToLocal(point) { // child -> parent coordinate transform, position only
    const hierarchy=[]; let p=this;
    while (p) {hierarchy.unshift(p);p=p.parent;}
    for(const h of hierarchy) point.add(new Vec(-h.position.x,-h.position.y,-h.position.z));
    return point;
  }
  updateMatrix() { this.matrix={position:this.position.clone()}; }
}
class Mat {constructor(options={}) { Object.assign(this, options); }}
class Mesh extends Obj { constructor(geometry,material) {super();this.geometry=geometry;this.material=material;} }
class IMesh extends Mesh { constructor(g,m,count) {super(g,m);this.count=count;this.instanceMatrix={needsUpdate:false};this.matrices=[];} setMatrixAt(i,m){this.matrices[i]=m;} }
class Geometry {constructor(...args){this.args=args;}}
class Curve extends Geometry {
  getPoint(t) {
    const points=this.args[0], k=Math.max(0,Math.min(1,t))*(points.length-1);
    const index=Math.min(points.length-2,Math.floor(k));
    return points[index].clone().lerp(points[index+1],k-index);
  }
}
const THREE={Group:Obj,Object3D:Obj,Vector3:Vec,Mesh,InstancedMesh:IMesh,
  DodecahedronGeometry:Geometry,IcosahedronGeometry:Geometry,CapsuleGeometry:Geometry,
  SphereGeometry:Geometry,TubeGeometry:Geometry,TorusGeometry:Geometry,CatmullRomCurve3:Curve,
  MeshStandardMaterial:Mat,MeshBasicMaterial:Mat,DoubleSide:2};
let defs=load('src/world/RegionalTerritoryDefinitions.js').replace(/^export /gm, '');
const context={THREE,Math,Number,Object,Set,Array,Error,console};context.globalThis=context;
vm.runInNewContext(defs,context,{filename:'RegionalTerritoryDefinitions.js'});
let volumes=load('src/world/RegionalTerritoryVolume.js');
volumes=volumes.replace(/^import \{ territoryDefinition \} from '.\/RegionalTerritoryDefinitions.js';\n/m,'')
  .replace(/^export (const|function) /gm, '$1 ');
vm.runInNewContext(volumes,context,{filename:'RegionalTerritoryVolume.js'});
let coupling=load('src/world/RegionalTerritoryCoupling.js').replace(/^export (const|function) /gm,'$1 ');
vm.runInNewContext(coupling,context,{filename:'RegionalTerritoryCoupling.js'});
let dynamics=load('src/world/RegionalTerritoryDynamics.js').replace(/^export (const|function) /gm,'$1 ');
vm.runInNewContext(dynamics,context,{filename:'RegionalTerritoryDynamics.js'});
let body=load('src/world/RegionalTerritoryExpansion.js');
body=body.replace(/^import \{ C0E3_PHYSIOLOGY, c0e3ApplyPressureRelief, c0e3AdvancePacket, c0e3CreatePackets \} from '.\/RegionalTerritoryDynamics.js';\n/m,'');
body=body.replace(/^import \* as THREE from 'three';\n/m, '')
  .replace(/^import \{ c0e2bApplyLocalCoupling \} from '.\/RegionalTerritoryCoupling.js';\n/m,'')
  .replace(/^import \{ c0e2TerritoryPockets \} from '.\/RegionalTerritoryVolume.js';\n/m, '')
  .replace(/^import \{ territoryDefinition \} from '.\/RegionalTerritoryDefinitions.js';\n/m, '')
  .replace(/^export \{ territoryDefinition \} from '.\/RegionalTerritoryDefinitions.js';\n/m, '')
  .replace(/^export (const|function|class) /gm, '$1 ');
body+='\n;globalThis.__out={territoryDefinition,territoryClamp01,territorySignal,RegionalTerritoryExpansion};';
vm.runInNewContext(body,context,{filename:'RegionalTerritoryExpansion.js'});
const {territoryDefinition,territoryClamp01,territorySignal,RegionalTerritoryExpansion}=context.__out;

const {c0e2TerritoryPockets,c0e2SelectVolume,c0e2NormalizedDistance,C0E2_REGION_CELLS}=context;
const regionCases = [
  ['silt','CELL_SILT_PRESSURE_ROUTE_001',[13.8,6.25,26.8]],
  ['vascular','CELL_VASCULAR_RHYTHM_ROUTE_001',[4.5,3.2,22.5]],
  ['grave','CELL_GRAVE_MEMORY_RESIDUE_BED_001',[5.4,3.5,19.2]],
  ['hub','CELL_SIGNAL_CHORUS_NERVE_001',[6.4,3.45,4.8]]
];
const baseBoundary=(r) => ({id:'original_envelope',center:{x:0,y:0,z:0},radii:{x:r[0],y:r[1],z:r[2]}});
for(const [kind,cell,radii] of regionCases){
  const orig=baseBoundary(radii);
  const pockets=c0e2TerritoryPockets(cell,orig.center);
  check(pockets.length===3,`${kind} 3 distal pockets`);
  check(pockets.every(p=>p.bridges.length===2),`${kind} bridge count`);
  const shapes=pockets.flatMap(p=>[p,...p.bridges]);
  check(shapes.length===9,`${kind} connected union segments`);
  check(pockets.every(p=>p.kind===kind),`${kind} owner ID`);
  const parent=new Obj();
  const territory=new RegionalTerritoryExpansion({kind,parent,offset:kind==='hub'?[.1,-.15,-1.8]:[0,0,0]});
  check(territory.sites.length===3,`${kind} C0E1 sites retained`);
  let pulseCount=0;
  for(const [index,pocket] of pockets.entries()){
    const site=territory.sites[index];
    check(site.id===pocket.id,`${kind} ${site.id} same identity`);
    check(Boolean(site.pocketBody&&site.passage),`${kind} ${site.id} connected visible anatomy`);
    check(site.pocketBody.userData.targetingSuppressed === true,`${kind} ${site.id} passive meshes`);
    const point=new Vec(pocket.center.x,pocket.center.y,pocket.center.z);
    const local=territory.root.worldToLocal(point);
    check(site.pocketLocal.distanceTo(local)<1e-6,`${kind} ${site.id} visually aligned with movement envelope`);
    check(c0e2SelectVolume(pocket.center,orig,shapes).normalizedDistance<1,`${kind} ${site.id} inside distal pocket`);
    let maxDistance=0;
    for(let step=0;step<=400;step++) {
      const t=step/400;
      const location={x:pocket.center.x*t,y:pocket.center.y*t,z:pocket.center.z*t};
      const selected=c0e2SelectVolume(location,orig,shapes);
      maxDistance=Math.max(maxDistance,selected.normalizedDistance);
      check(selected.normalizedDistance<=1.0000001,`${kind} ${site.id} contiguous traversable sample ${step}`);
    }
    check(maxDistance<1,`${kind} ${site.id} no discontinuity`);
    const sitePoint=pocket.sitePoint;
    check(c0e2SelectVolume(sitePoint,orig,shapes).normalizedDistance<1,`${kind} ${site.id} original site remains reachable`);
    check(c0e2NormalizedDistance(pocket.center,orig)>1.01,`${kind} ${site.id} genuinely beyond original volume`);
    territory.update({dt:.016,playerPosition:point,input:{pulseEventId:pulseCount}});
    check(site.pocketVisited===true,`${kind} ${site.id} distal visit acknowledged`);
    territory.update({dt:.016,playerPosition:site.point.clone().add(territory.root.position),input:{pulseEventId:++pulseCount}});
    check(site.strain>0,`${kind} ${site.id} pulse causes bounded local strain`);
    for(let n=2;n<=35;n++) territory.update({dt:.016,playerPosition:site.point.clone().add(territory.root.position),input:{pulseEventId:++pulseCount}});
    check(site.strain<=1,`${kind} ${site.id} no runaway local response`);
    territory.update({dt:.016,playerPosition:site.point.clone().add(territory.root.position),input:{pulseEventId:pulseCount,stabilizeHeld:true}});
    for(let n=0;n<9;n++) territory.update({dt:.12,playerPosition:site.point.clone().add(territory.root.position),input:{pulseEventId:pulseCount,stabilizeHeld:true}});
    check(site.imprint>0,`${kind} ${site.id} stabilize leaves imprint`);
    const remembered=site.imprint;
    territory.update({dt:.12,playerPosition:new Vec(100,100,100),input:{pulseEventId:pulseCount}});
    check(site.imprint===remembered,`${kind} ${site.id} retained state beyond encounter`);
    check(territory.snapshot().siteStates[index].imprint>0,`${kind} ${site.id} published local memory`);
    check(territory.snapshot().routeProgressionChanged===false,`${kind} ${site.id} progression locked`);
    check(territory.lastLocalExperiment.noHostReceipt===true,`${kind} ${site.id} no Host forgery`);
  }
  check(c0e2SelectVolume({x:0,y:0,z:0},orig,shapes).source==='legacy',`${kind} original core safe`);
  check(territory.snapshot().pocketsVisited===3,`${kind} all distal pockets visited`);
  territory.dispose?.();
}
check(c0e2TerritoryPockets('CELL_MEMBRANE_NURSERY_001',{x:0,y:0,z:0}).length===0,'unrelated cells do not expand');
check(c0e2TerritoryPockets('CELL_SIGNAL_CHORUS_NERVE_001',{x:NaN,y:0,z:0}).length===0,'invalid anchor rejected');
const movement=load('src/player/PlayerMovementController.js');
check(movement.includes('this.configureC0E2Territory(frameState)'), 'single movement owner sets up volume');
check(movement.includes('c0e2SelectVolume(p, this.c0e2BaseBoundary, this.c0e2Pockets)'), 'movement telemetry selects union');
check(movement.includes('this.applyMembraneBoundary(dt)'), 'existing projection continues owning collision');
check(!movement.includes('C0E2_SKIP_COLLISION'), 'no collision bypass');
const census=load('src/debug/WorldObjectCensusSystem.js');
check(census.includes('c0e2-pocket-discovered'), 'REC1 records visited distal pocket');
check(census.includes("recorderSchemaVersion: 2"), 'REC1 compatibility retained');
const fixed=[
  'src/routes/SiltPressureRouteSystem.js', 'src/routes/VascularRhythmRouteSystem.js',
  'src/routes/GraveMemoryRouteSystem.js', 'src/hub/HubChamberFoundationSystem.js',
  'src/core/GameRuntime.js'
];
for(const file of fixed) check(!load(file).includes('C0E2'),`${file} original gameplay owner unchanged`);
for(const file of ['src/world/RegionalTerritoryVolume.js','src/world/RegionalTerritoryDefinitions.js',
 'src/world/RegionalTerritoryExpansion.js','src/player/PlayerMovementController.js',
 'src/debug/WorldObjectCensusSystem.js']) execFileSync(process.execPath,['--check',path.join(base,file)]);
console.log(JSON.stringify({pass:'C0E2',result:'COMPOUND_CONNECTED_VOLUME_AND_RETENTION_PASS',assertions:checks,
  regions:4,existingSites:12,newDistalPockets:12,connectorVolumes:24,
  physicalEnvelope:'legacy plus three overlapping branch corridors',
  retainedExperiments:'bounded session-local imprint strain void',
  claimLimit:'Mock scene and geometric envelope; browser visibility, camera, collisions with independently authored surfaces, and player reachability still need user playtest'},null,2));
