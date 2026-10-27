// BOT0 / C0E3 deterministic source-level agent preflight, not a browser player.
// Add this file to <BLOB project>/scripts and run:
//   node scripts/botC0E3ConvergencePreflight.mjs
// Pure source owner tests. Does not move a browser player or prove visual legibility.
import assert from 'node:assert/strict';
import { c0e2bApplyLocalCoupling } from '../src/world/RegionalTerritoryCoupling.js';
import { c0e3ApplyPressureRelief, c0e3AdvancePacket, c0e3CreatePackets } from '../src/world/RegionalTerritoryDynamics.js';
import { CoreEngineSystem } from '../src/player/CoreEngineSystem.js';
import { VerbCompositionSystem } from '../src/interaction/VerbCompositionSystem.js';
const regions=['silt','vascular','grave','hub'];
const verbs=['pulse','stabilize','absorb'];
const check=(yes,message)=>assert.ok(yes,message);
const makeSites=()=>Array.from({length:3},()=>({imprint:0,strain:0,void:0,c0e3Cooldown:0,c0e3ReliefFlash:0}));
const runPolicy=({region, name, duration=45, dt=0.05, policy, seed=0xB10B})=>{
  const sites=makeSites();const packets=new Map();
  let experiments=0, coupled=0, redistribute=0, saturated=0, relieved=0, transmitted=0,
    packetFinished=0, packetDelivered=0, packetDissipated=0, maxActivePackets=0, totalInput=0, maxState=0;
  let randomState=seed>>>0;
  const random=()=>((randomState=(Math.imul(randomState,1664525)+1013904223)>>>0)/4294967296);
  const step=(source,verb)=>{
    const result=c0e2bApplyLocalCoupling(region,sites,source,verb);
    const relief=c0e3ApplyPressureRelief(region,sites,source,result);
    const emitted=c0e3CreatePackets(region,source,result);
    check(result.noHostReceipt && result.noMaterialTransfer && result.noProgressionCredit,'coupling authority leak');
    check(relief.noHostReceipt,'relief authority leak');
    experiments++;totalInput++;
    if(result.localResponse==='coupled')coupled++;
    if(result.localResponse==='saturation_redistributed')redistribute++;
    if(result.localResponse==='network_saturated')saturated++;
    if(relief.applied)relieved++;
    transmitted+=result.transmitted;
    for(const pkt of emitted){
      const key=`${pkt.from}:${pkt.to}`; const current=packets.get(key);
      if(!current || (current.kind==='dissipation'&&pkt.kind==='transmission'))packets.set(key,pkt);
      else if(current.kind==='transmission'&&pkt.kind==='transmission')current.amount=Math.min(1,current.amount+pkt.amount);
      // Like live C0E3: rapid input cannot restart the leading edge.
    }
  };
  const tickCount=Math.ceil(duration/dt);
  for(let tick=0;tick<tickCount;tick++){
    const t=tick*dt;
    const command=policy({t,tick,random,sites});
    if(command)step(command.site,command.verb);
    for(const site of sites)site.c0e3Cooldown=Math.max(0,site.c0e3Cooldown-dt);
    for(const [key,packet] of packets){
      const next=c0e3AdvancePacket(packet,dt);
      if(next.complete){packetFinished++;if(next.delivered)packetDelivered++;else packetDissipated++;packets.delete(key);}
      else packets.set(key,next);
    }
    maxActivePackets=Math.max(maxActivePackets,packets.size);
    for(const site of sites)for(const key of ['strain','imprint','void']){
      const v=site[key];check(Number.isFinite(v)&&v>=-1e-9&&v<=1+1e-9,`${name}/${region} unbounded ${key}: ${v}`);
      maxState=Math.max(maxState,v);
    }
    check(packets.size<=6,`${name}/${region}: packet map unbounded`);
  }
  return {name,region,experiments,coupled,redistribute,saturated,relieved,transmitted:+transmitted.toFixed(3),
    packetFinished,packetDelivered,packetDissipated,maxActivePackets,maxState:+maxState.toFixed(3),
    siteStates:sites.map(s=>Object.fromEntries(['imprint','strain','void'].map(k=>[k,+s[k].toFixed(4)])))};
};
const policies={
  observer:({tick})=>null,
  novice:({tick})=>tick%50===0?{site:Math.floor(tick/50)%3,verb:verbs[Math.floor(tick/50)%3]}:null,
  deliberate_experimenter:({tick})=>tick%9===0?{site:Math.floor(tick/180)%3,verb:verbs[Math.floor(tick/90)%3]}:null,
  rapid_spammer:({tick})=>tick%2===0?{site:0,verb:'pulse'}:null,
  braced_oscillator:({tick})=>tick%7===0?{site:1,verb:tick%14===0?'stabilize':'pulse'}:null,
  chaotic_seeded:({tick,random})=>tick%3===0?{site:Math.floor(random()*3),verb:verbs[Math.floor(random()*3)]}:null,
  backtracker:({t,tick})=>t>12&&t<27?null:tick%8===0?{site:t>27?2:0,verb:t>27?'absorb':'pulse'}:null
};
const reports=[];
for(const region of regions)for(const [name,policy] of Object.entries(policies)){
  const r=runPolicy({region,name,policy});reports.push(r);
  if(name==='observer')check(r.experiments===0 && r.packetFinished===0,`idle generated action: ${region}`);
  if(name==='rapid_spammer')check(r.packetDelivered>0,`spammer starved all deliveries: ${region}`);
  if(name==='deliberate_experimenter')check(r.packetFinished>0,`no waveform completed: ${region}`);
  if(name==='backtracker')check(r.experiments>0,`backtracker lost continuation: ${region}`);
}
// Source-grounded exact accounting fixture (all-empty Silt pulse).
const silt=makeSites();const pulse=c0e2bApplyLocalCoupling('silt',silt,0,'pulse');
const approx=(a,b)=>check(Math.abs(a-b)<1e-9,`expected ${b} received ${a}`);
approx(silt[0].strain,0.185);approx(silt[1].strain,0.0325);approx(silt[2].strain,0.0325);
approx(silt.reduce((sum,s)=>sum+s.strain,0),0.25);
check(pulse.transfer.length===2 && pulse.noHostReceipt,'Silt base example mismatch');
// The 3/6/12 Core system has a debug override and progression-consumer input.
// This test intentionally does NOT claim phase equilibrium or physics.
const coreFrame={frame:1,input:{},returnRegionEngine:{unlockedPhaseCount:3},playerKinematics:{speed:0}};
const core=new CoreEngineSystem({frameState:coreFrame,playerRoot:{userData:{}}});core.init();core.update(0.05);
check(coreFrame.coreEngine.phaseCount===3,'default phase not 3');
coreFrame.frame++;coreFrame.input.debugCoreEngineCyclePressed=true;core.update(0.05);
check(coreFrame.coreEngine.phaseCount===6 && coreFrame.coreEngine.lastEvent.startsWith('phase_fire:'),'debug did not cycle phase');
check(coreFrame.coreEngine.progressionUnlockedPhaseCount===3,'debug mistakenly unlocks progress');
coreFrame.frame++;coreFrame.input.debugCoreEngineCyclePressed=false;core.update(0.05);
coreFrame.returnRegionEngine.unlockedPhaseCount=12;coreFrame.frame++;core.update(0.05);
check(coreFrame.coreEngine.phaseCount===12 && coreFrame.coreEngine.progressionUnlockedPhaseCount===12,'progression 12 consumer not working');
check(coreFrame.coreEngine.gameplayAuthority===false && coreFrame.coreEngine.chemistryAuthority===false,
 'core sequence wrongly claims gameplay/chemistry');
// Canonical chord composer still owns combinations; this is NOT target acceptance.
const chordFrame={input:{pulseEventId:0},frame:0};
const chords=new VerbCompositionSystem({frameState:chordFrame});chords.init();
check(chordFrame.verbComposition!==undefined,'composer did not publish');
const summary={pass:'BOT0_SOURCE_PREFLIGHT',scope:'pure_source_and_scripted_policy_only',
 noBrowserNavigationTest:true,noVisualComprehensionTest:true,noRealRouteCompletionTest:true,
 regionCount:regions.length,profileCount:Object.keys(policies).length,scenarios:reports.length,
 totalExperiments:reports.reduce((n,r)=>n+r.experiments,0),
 totalCompletedPackets:reports.reduce((n,r)=>n+r.packetFinished,0),
 totalReliefEvents:reports.reduce((n,r)=>n+r.relieved,0),
 allBounded:reports.every(r=>r.maxState<=1),
 spamDeliveryEveryRegion:regions.every(region=>reports.find(r=>r.region===region&&r.name==='rapid_spammer')?.packetDelivered>0),
 exactSiltPulseAccountingPassed:true,corePhaseDebugDistinctFromProgression:true,
 canonicalChordPublisherChecked:true};
console.log('BOT0 source-level preflight PASS');console.log(JSON.stringify({summary,reports},null,2));
