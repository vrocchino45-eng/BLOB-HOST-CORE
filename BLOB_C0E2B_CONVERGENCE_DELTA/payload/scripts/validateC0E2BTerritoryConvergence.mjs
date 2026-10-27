import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {c0e2bApplyLocalCoupling,C0E2B_CIRCUIT} from '../src/world/RegionalTerritoryCoupling.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
let tests=0;const check=(condition,reason)=>{assert.ok(condition,reason);tests++};
const vars=['imprint','strain','void'];
const kinds=['silt','vascular','grave','hub'];
const verbs=['pulse','stabilize','absorb'];
for(const kind of kinds){
  check(C0E2B_CIRCUIT[kind].share>0 && C0E2B_CIRCUIT[kind].share<.5,`${kind} bounded propagation`);
  for(const verb of verbs)for(let index=0;index<3;index++){
    const sites=Array.from({length:3},()=>({imprint:0,strain:0,void:0}));
    const result=c0e2bApplyLocalCoupling(kind,sites,index,verb);
    check(result.outgoingDirections===2,`${kind}/${verb} two neighbors`);
    check(result.transfer.length>0,`${kind}/${verb} neighbor receives distinct local change`);
    check(result.siteStates.length===3,`${kind}/${verb} three site states`);
    check(result.transfer.every(t=>t.from===index && t.to!==index),`${kind}/${verb} source-only transfer`);
    check(result.noHostReceipt && result.noProgressionCredit && result.noMaterialTransfer,`${kind}/${verb} no Host forgery`);
    check(sites.every(s=>vars.every(key=>s[key]>=0 && s[key]<=1)),`${kind}/${verb} bounded`);
    // Saturation must remain interactive but never generate unbounded growth.
    const saturatedSites=Array.from({length:3},()=>({imprint:0,strain:0,void:0}));
    if(verb==='pulse') saturatedSites[index].strain=1;
    if(verb==='stabilize') saturatedSites[index].imprint=1;
    if(verb==='absorb') saturatedSites[index].void=1;
    const saturated=c0e2bApplyLocalCoupling(kind,saturatedSites,index,verb);
    check(saturated.saturated,`${kind}/${verb} saturation detected`);
    check(saturated.transmitted>0,`${kind}/${verb} overflow propagates`);
    const allFull=Array.from({length:3},()=>({imprint:1,strain:1,void:1}));
    const drained=c0e2bApplyLocalCoupling(kind,allFull,index,verb);
    check(drained.transmitted===0,`${kind}/${verb} no perpetual gain when all saturated`);
    check(drained.dissipated>0,`${kind}/${verb} excess dissipates`);
    check(drained.localResponse==='network_saturated',`${kind}/${verb} distinguish fully saturated network`);
  }
}
let seed=0x91832;
const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
let maxTotal=0;
for(let cycle=0;cycle<4000;cycle++){
  const kind=kinds[cycle%4],verb=verbs[(cycle>>2)%3], index=cycle%3;
  const sites=Array.from({length:3},()=>Object.fromEntries(vars.map(v=>[v,random()])));
  const before=sites.map(s=>({...s}));
  const result=c0e2bApplyLocalCoupling(kind,sites,index,verb);
  check(sites.every(s=>vars.every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=1)),`finite bound ${cycle}`);
  check(result.transfer.length<=4,`max 2 neighbors x 2 positive components ${cycle}`);
  check(result.dissipated>=0&&result.transmitted>=0,`nonnegative flux ${cycle}`);
  check(result.transfer.every(t=>t.from===index && t.to!==index),`no off-region source ${cycle}`);
  // Only local source may lose state under stabilize/absorb; receivers receive positives.
  check(sites.every((s,i)=>i===index||vars.every(k=>s[k]>=before[i][k]-1e-8)),`no remote destructive mutation ${cycle}`);
  const total=sites.reduce((v,s)=>v+vars.reduce((w,k)=>w+s[k],0),0);
  maxTotal=Math.max(maxTotal,total);
}
for (const [file,pattern] of [
 ['src/world/RegionalTerritoryExpansion.js','c0e2bApplyLocalCoupling'],
 ['src/debug/WorldObjectCensusSystem.js','c0e2b-movement-volume-change'],
 ['src/debug/WorldObjectCensusSystem.js','c0e2b-nearest-unvisited-pocket'],
 ['src/world/RegionalTerritoryExpansion.js','c0e2b_local_link']
]) check(read(file).includes(pattern),`${file} integration ${pattern}`);
for(const file of ['src/routes/SiltPressureRouteSystem.js','src/routes/VascularRhythmRouteSystem.js',
 'src/routes/GraveMemoryRouteSystem.js','src/hub/HubChamberFoundationSystem.js',
 'src/player/PlayerMovementController.js','src/core/GameRuntime.js']) check(!read(file).includes('C0E2-B'),`${file} locked owner`);
check(maxTotal<=9.0000001,'bounded triad');
console.log(JSON.stringify({pass:'C0E2-B',status:'BOUNDED_LOCAL_CONVERGENCE_AND_OBSERVATION_PASS',checks:tests,
 regions:4,sites:12,directedConnections:24,subsystemsChanged:['territory presentation','read-only REC1 observation'],
 geometry:'C0E2 unchanged',physics:'unchanged',HostCircuit:'unchanged',
 limits:'Offline numerical test and source integration only. Browser visual acceptance, side-volume traversal and active route feel still need Windows field test.'},null,2));
