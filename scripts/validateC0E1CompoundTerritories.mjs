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
const THREE={Group:Obj,Object3D:Obj,Vector3:Vec,Mesh,InstancedMesh:IMesh,
  DodecahedronGeometry:Geometry,IcosahedronGeometry:Geometry,CapsuleGeometry:Geometry,
  SphereGeometry:Geometry,TubeGeometry:Geometry,TorusGeometry:Geometry,CatmullRomCurve3:Geometry,
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
let body=load('src/world/RegionalTerritoryExpansion.js');
body=body.replace(/^import \* as THREE from 'three';\n/m, '')
  .replace(/^import \{ c0e2bApplyLocalCoupling \} from '.\/RegionalTerritoryCoupling.js';\n/m,'')
  .replace(/^import \{ c0e2TerritoryPockets \} from '.\/RegionalTerritoryVolume.js';\n/m, '')
  .replace(/^import \{ territoryDefinition \} from '.\/RegionalTerritoryDefinitions.js';\n/m, '')
  .replace(/^export \{ territoryDefinition \} from '.\/RegionalTerritoryDefinitions.js';\n/m, '')
  .replace(/^export (const|function|class) /gm, '$1 ');
body+='\n;globalThis.__out={territoryDefinition,territoryClamp01,territorySignal,RegionalTerritoryExpansion};';
vm.runInNewContext(body,context,{filename:'RegionalTerritoryExpansion.js'});
const {territoryDefinition,territoryClamp01,territorySignal,RegionalTerritoryExpansion}=context.__out;
for(const [kind,center] of Object.entries({silt:[0,0,0],vascular:[0,0,0],grave:[0,0,0],hub:[0,0,0]})){
  const spec=territoryDefinition(kind);
  check(spec.sites.length===3,`${kind} three rooted territories`);
  check(new Set(spec.sites.map(s=>s.id)).size===3,`${kind} unique IDs`);
  const root=new Obj();
  const system=new RegionalTerritoryExpansion({kind,parent:root});
  check(root.children.includes(system.root),`${kind} attached to owner's root`);
  check(system.sites.length===3,`${kind} all sites built`);
  check(system.root.userData.targetingSuppressed,`${kind} non-targetable region`);
  check(system.root.userData.changesProgression===false,`${kind} no progression mutation`);
  check(system.sites.every(s=>s.ribs.count===6&&s.flecks.count===12),`${kind} true instanced 3→6→12`);
  check(system.sites.every(s=>s.group.userData.targetingSuppressed),`${kind} non-targetable sites`);
  const frameState={input:{pulseEventId:0},progressionMarker:'fixed'};
  const centerPoint=system.sites[0].point.clone();
  system.update({dt:.016,playerPosition:centerPoint,input:frameState.input,signal01:0.5,frameState});
  check(frameState.territoryExploration.nearestSiteId===spec.sites[0].id,`${kind} near-space discovery`);
  check(frameState.progressionMarker==='fixed',`${kind} unmodified progression`);
  const pulseInput={pulseEventId:1};
  system.update({dt:.016,playerPosition:centerPoint,input:pulseInput,signal01:.5,frameState});
  check(system.experiments.length===1&&system.experiments[0].verb==='pulse',`${kind} pulse observation`);
  system.update({dt:.016,playerPosition:centerPoint,input:pulseInput,frameState});
  check(system.experiments.length===1,`${kind} no repeat per pulse event ID`);
  for(let i=0;i<9;i++)system.update({dt:.12,playerPosition:centerPoint,input:{pulseEventId:1,stabilizeHeld:true},frameState});
  check(system.experiments.filter(e=>e.verb==='stabilize').length===1,`${kind} hold threshold once`);
  for(let i=0;i<9;i++)system.update({dt:.12,playerPosition:centerPoint,input:{pulseEventId:1,absorbHeld:true},frameState});
  check(system.experiments.filter(e=>e.verb==='absorb').length===1,`${kind} absorb observation once`);
  check(system.experiments.every(e=>e.noHostReceipt&&e.noMatterTransfer&&e.noProgressionCredit),`${kind} read-only claims`);
  check(system.snapshot().structuralSites===3,`${kind} snapshot authored structure`);
  for(let i=2;i<18;i++){
    system.update({dt:.016,playerPosition:centerPoint,input:{pulseEventId:i},frameState});
  }
  check(system.experiments.length===12,`${kind} experiment journal bounded`);
  check(system.lastLocalExperiment.localSequence===19,`${kind} monotonic sequence across journal prune`);
  // Verify all authored sites stay inside existing traversable ellipsoids / Silt path corridor.
  const bounds= kind==='vascular'?[4.5,3.2,22.5]: kind==='grave'?[5.4,3.5,19.2]:kind==='silt'?[5.5,3.8,20.0]:[7,5,11];
  for(const site of spec.sites){const [x,y,z]=site.point;
    check((x/bounds[0])**2+(y/bounds[1])**2+(z/bounds[2])**2<1, `${kind} ${site.id} inside proposed region limits`);
  }
}
check(territorySignal('silt',{siltPressureEcho:.04})===1,'full Silt authenticated echo signal');
check(territorySignal('vascular',{membraneLoad:.85})===1,'Vascular 0.85 cap normalization');
check(territorySignal('grave',{memoryPressure:.62})===.62,'Grave memory pressure');
check(territorySignal('hub',{siltReceived:1,vascularReceived:1,graveResolved:1})===1,'Hub 3 component sum');
check(territoryClamp01(-22)===0&&territoryClamp01(4)===1,'numeric bound');
for(const f of ['src/routes/SiltPressureRouteSystem.js','src/routes/VascularRhythmRouteSystem.js','src/routes/GraveMemoryRouteSystem.js','src/hub/HubChamberFoundationSystem.js']){
 const src=load(f);check(src.includes('new RegionalTerritoryExpansion'),`${f} mount hook`);
 check(src.includes('this.territoryExpansion?.update'),`${f} mounted update hook`);
 execFileSync(process.execPath,['--check',path.join(base,f)]);
}
const recorder=load('src/debug/WorldObjectCensusSystem.js');
check(recorder.includes("this.recordEvent('c0e1-territory-discovered'"),'REC1 site proximity record');
check(recorder.includes("this.recordEvent('c0e1-territory-verb-read'"),'REC1 verb observation record');
check(recorder.includes("recorderRevision: 'C0C-REC1'"),'REC1 legacy revision retained');
check(recorder.includes("recorderSchemaVersion: 2"),'REC1 legacy schema retained');
check(load('src/hub/HubChamberFoundationSystem.js').includes('frameState.vascularRhythmRoute?.siltSignalResponse?.receivedTotal'), 'Hub uses actual Vascular owner publication');
execFileSync(process.execPath,['--check',path.join(base,'src/world/RegionalTerritoryExpansion.js')]);
execFileSync(process.execPath,['--check',path.join(base,'src/debug/WorldObjectCensusSystem.js')]);
console.log(JSON.stringify({pass:'C0E1',result:'OFFLINE_COMPOUND_TERRITORY_AND_RECORDER_PASS',assertions:checks,
  regions:4,authoredSites:12,grammar:'3/6/12',interface:'read_only_experiments',
  limitation:'Mock scene graph; actual Three.js / Vite / visual playtest required'},null,2));
