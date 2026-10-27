import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {C0E3_PHYSIOLOGY,c0e3ApplyPressureRelief,c0e3AdvancePacket,c0e3CreatePackets}
  from '../src/world/RegionalTerritoryDynamics.js';
import {c0e2bApplyLocalCoupling} from '../src/world/RegionalTerritoryCoupling.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
let checks=0;
const check=(c,message)=>{assert.ok(c,message);checks++;};
const kinds=['silt','vascular','grave','hub'];
const verbs=['pulse','stabilize','absorb'];
const names=new Set();
for (const kind of kinds) {
  const config=C0E3_PHYSIOLOGY[kind];
  check(config?.transit>0&&config.transit<2,kind+' travel time');
  check(config?.relief>0&&config.relief<0.1,kind+' bounded release');
  check(config?.cooldown>=1&&config.cooldown<=2,kind+' deliberate cooldown');
  names.add(config.name);
  for(const verb of verbs)for(let source=0;source<3;source++){
    const triad=Array.from({length:3},()=>({imprint:0,strain:0,void:0,c0e3Cooldown:0}));
    const result=c0e2bApplyLocalCoupling(kind,triad,source,verb);
    const packets=c0e3CreatePackets(kind,source,result);
    check(packets.length===2,kind+'/'+verb+' two directed packets');
    check(packets.every(p=>p.kind==='transmission'&&p.amount>0),kind+'/'+verb+' legitimate local transfers');
    check(packets.every(p=>p.from===source&&p.to!==source),kind+'/'+verb+' no self receipt');
    const start=JSON.stringify(triad);
    const relief=c0e3ApplyPressureRelief(kind,triad,source,result);
    check(!relief.applied&&JSON.stringify(triad)===start,kind+'/'+verb+' no surprise relief');
    for(const packet of packets){
      let p=packet,seen=0,previous=0;
      for(let n=0;n<40&&!p.complete;n++){
        p=c0e3AdvancePacket(p,.12);
        check(p.progress>=previous&&p.progress<=1,kind+' monotonic wave');
        check(p.intensity>=0&&p.intensity<=1,kind+' bounded intensity');
        previous=p.progress;seen++;
      }
      check(seen>=2&&seen<=20&&p.delivered&&p.complete,kind+' settled arrival');
    }
    const fully=Array.from({length:3},()=>({imprint:1,strain:1,void:1,c0e3Cooldown:0}));
    const blocked=c0e2bApplyLocalCoupling(kind,fully,source,verb);
    check(blocked.localResponse==='network_saturated',kind+' full network is diagnostic');
    const preRelief=fully[source][config.reliefComponent];
    const bounded=c0e3ApplyPressureRelief(kind,fully,source,blocked);
    check(bounded.applied && bounded.noHostReceipt&&bounded.noMaterialTransfer&&bounded.noProgressionCredit,kind+' safe relief');
    check(fully.every(site=>['imprint','strain','void'].every(k=>site[k]>=0&&site[k]<=1)),kind+' local bounds');
    check(Math.abs(fully[source][config.reliefComponent]-(preRelief-config.relief))<1e-9,kind+' correct component drained');
    const retry=c0e3ApplyPressureRelief(kind,fully,source,blocked);
    check(!retry.applied&&retry.reason==='cooldown',kind+' cooldown blocks spam');
    const dissipations=c0e3CreatePackets(kind,source,blocked);
    check(dissipations.length===2&&dissipations.every(p=>p.kind==='dissipation'&&p.amount===0),kind+' not fake transfer');
    for(const event of dissipations){let p=event;
      for(let n=0;n<35&&!p.complete;n++)p=c0e3AdvancePacket(p,.12);
      check(p.complete&&!p.delivered&&p.progress<=0.23+1e-9,kind+' relief never reaches receiver');
    }
  }
}
check(names.size===4,'unique physiological identities');
let rng=61317;
const random=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)/4294967296;};
for(let i=0;i<3500;i++){
  const kind=kinds[i%4];
  const source=i%3;
  const triad=Array.from({length:3},()=>({imprint:random(),strain:random(),void:random(),c0e3Cooldown:0}));
  const response=c0e2bApplyLocalCoupling(kind,triad,source,verbs[Math.floor(i/3)%3]);
  const drained=c0e3ApplyPressureRelief(kind,triad,source,response);
  check(triad.every(site=>['imprint','strain','void'].every(k=>Number.isFinite(site[k])&&site[k]>=0&&site[k]<=1)),`random bound ${i}`);
  check(drained.noHostReceipt,`source isolation ${i}`);
  const packets=c0e3CreatePackets(kind,source,response);
  check(packets.length<=2&&packets.every(p=>p.to!==source),`bounded direction ${i}`);
}
// Mock scene integration makes sure packet meshes actually move and only the
// graphical region instance responds. Does not claim production Three rendering.
class Vec {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;this.isVector3=true;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  fromArray(a){return this.set(...a);}
  clone(){return new Vec(this.x,this.y,this.z);}
  copy(p){return this.set(p.x,p.y,p.z);}
  lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this;}
  add(p){return this.set(this.x+p.x,this.y+p.y,this.z+p.z);}
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}
  setScalar(v){return this.set(v,v,v);}
}
class Obj {
  constructor(){this.userData={};this.position=new Vec();this.rotation=new Vec();this.scale=new Vec(1,1,1);this.matrix={};this.children=[];this.name='';}
  add(c){c.parent=this;this.children.push(c);}
  traverse(fn){fn(this);for(const c of this.children)c.traverse?.(fn);}
  worldToLocal(v){let node=this;while(node){v.add(new Vec(-node.position.x,-node.position.y,-node.position.z));node=node.parent;}return v;}
  updateMatrix(){this.matrix={};}
}
class Mat {constructor(o={}){Object.assign(this,o);}}
class Geo {constructor(...args){this.args=args;}}
class Curve extends Geo {getPoint(t){const p=this.args[0],f=Math.max(0,Math.min(1,t))*(p.length-1);const i=Math.min(p.length-2,Math.floor(f));return p[i].clone().lerp(p[i+1],f-i);}}
class Mesh extends Obj {constructor(g,m){super();this.geometry=g;this.material=m;}}
class InstancedMesh extends Mesh {constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={needsUpdate:false};}setMatrixAt(){}}
const THREE={Group:Obj,Object3D:Obj,Vector3:Vec,Mesh,InstancedMesh,
  DodecahedronGeometry:Geo,IcosahedronGeometry:Geo,CapsuleGeometry:Geo,
  SphereGeometry:Geo,TubeGeometry:Geo,TorusGeometry:Geo,CatmullRomCurve3:Curve,
  MeshStandardMaterial:Mat,MeshBasicMaterial:Mat,DoubleSide:2};
const ctx={THREE,Math,Number,Object,Set,Array,Error,console};ctx.globalThis=ctx;
const evaluate=(f)=>{
  const code=text(f).replace(/^import .*;\n/gm,'').replace(/^export \{ .* \} from .*;\n/gm,'')
    .replace(/^export (const|function|class) /gm,'$1 ');
  vm.runInNewContext(code,ctx,{filename:f});
};
for(const f of ['src/world/RegionalTerritoryDefinitions.js','src/world/RegionalTerritoryVolume.js',
  'src/world/RegionalTerritoryCoupling.js','src/world/RegionalTerritoryDynamics.js',
  'src/world/RegionalTerritoryExpansion.js'])evaluate(f);
const RegionalTerritoryExpansion=vm.runInNewContext('RegionalTerritoryExpansion',ctx);
for(const kind of kinds){
 const scene=new Obj(),system=new RegionalTerritoryExpansion({kind,parent:scene});
 check(system.localLinks.length===6,kind+' six directed visual paths');
 check(system.localLinks.every(l=>l.packetMarker.userData.targetingSuppressed),kind+' suppress packet target ownership');
 const point=system.sites[0].point.clone();
 const frameState={hostSequence:'unchanged',progression:'locked'};
 system.update({dt:.016,playerPosition:point,input:{pulseEventId:0},frameState});
 system.update({dt:.016,playerPosition:point,input:{pulseEventId:1},frameState});
 check(frameState.territoryExplorationLastRead?.livingCircuit?.emittedPackets?.length===2,kind+' response packet record');
 check(system.localLinks.filter(l=>l.packet).length===2,kind+' two waves in flight');
 let previous=0;for(let n=0;n<18;n++){
  // Hammering Pulse in the same territory must not restart in-flight waves.
  // Call every other frame to exercise the former lost-arrival case.
  const pulseEventId=n%2===0?2+Math.floor(n/2):1+Math.ceil(n/2);
  system.update({dt:.1,playerPosition:point,input:{pulseEventId},frameState});
  const active=system.localLinks.filter(l=>l.packet);
  check(active.length<=2,kind+' bounded wave mesh count');
  for(const l of active){
    check(Number.isFinite(l.packetMarker.position.x)&&l.packetMarker.visible,kind+' visible moving marker');
    check(l.packet.progress>=0&&l.packet.progress<=1,kind+' bounded visual progress');
  }
  if(active.length)previous=active[0].packet.progress;
 }
 check(system.c0e3WavesCompleted>=2,kind+' packets delivered despite repeated presses');
 const afterBarrage=system.c0e3WavesCompleted;
 for(let n=0;n<20;n++)system.update({dt:.12,playerPosition:point,input:{pulseEventId:10},frameState});
 check(system.c0e3WavesCompleted>=afterBarrage,kind+' final wave can finish');
 check(system.localLinks.every(l=>!l.packet&&!l.packetMarker.visible),kind+' packet meshes dormant again');
 check(frameState.hostSequence==='unchanged'&&frameState.progression==='locked',kind+' no owner mutation');
 check(system.snapshot().c0e3.completedWaves>=2,kind+' additive readout');
 for(const site of system.sites){site.strain=1;site.imprint=1;site.void=1;}
 const before=system.experimentSequence;
 system.update({dt:.016,playerPosition:point,input:{pulseEventId:20},frameState});
 check(system.experimentSequence===before+1,kind+' deliberate saturation interaction');
 const living=frameState.territoryExplorationLastRead.livingCircuit;
 check(living.relief.applied&&living.relief.noHostReceipt,kind+' authorized local relief');
 check(living.emittedPackets.every(p=>p.kind==='dissipation'&&p.amount===0),kind+' no phantom neighbor transmission');
 check(system.sites[0][C0E3_PHYSIOLOGY[kind].reliefComponent]<1,kind+' small capacity reopened');
 check(system.c0e3ReliefCount===1,kind+' finite relief counter');
 check(system.root.userData.changesProgression===false,kind+' original owner locks still mounted');
}
const locked=['src/routes/SiltPressureRouteSystem.js','src/routes/VascularRhythmRouteSystem.js',
  'src/routes/GraveMemoryRouteSystem.js','src/hub/HubChamberFoundationSystem.js',
  'src/player/PlayerMovementController.js','src/core/GameRuntime.js',
  'src/world/RegionalTerritoryCoupling.js','src/debug/WorldObjectCensusSystem.js'];
for(const p of locked)check(!text(p).includes('C0E3'),p+' not edited');
console.log(JSON.stringify({pass:'C0E3',result:'OFFLINE_LIVING_REGIONAL_CIRCUIT_PASS',checks,
 regions:4,sites:12,directedConnections:24,visiblePacketMeshes:24,
 eventTypes:['local_transmission','visible_dissipation','capacity_relief'],
 scope:'presentation plus limited bounded local state',
 locks:'Host ledger, route completion, physics, input, original REC1 schema unchanged',
 limits:'Mock 3D scene tests do not establish production Three.js appearance, camera readability, performance, or Windows Vite build.'},null,2));
