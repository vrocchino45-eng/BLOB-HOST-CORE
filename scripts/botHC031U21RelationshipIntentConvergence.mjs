import * as THREE from "three";
import { GatheringGroundAliveSystem } from "../src/fields/GatheringGroundAliveSystem.js";

const assert = (condition, message) => { if (!condition) throw new Error(`[HC031U2.1 bots] ${message}`); };
const WATCHER = "gathering_ground_watcher_001";
const RELAY_A = "gathering_ground_relay_a_001";
const makeRoot = (x,y,z) => { const r = new THREE.Group(); r.position.set(x,y,z); r.visible = true; return r; };
const createHarness = () => {
  const frameState = {
    activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
    adjacentHostTerritory: { enteredTerritory: true },
    targeting: { active:true, targetId:"gathering_ground_cluster", relationshipTargetId:"gathering_ground_cluster", candidateId:"gathering_ground_cluster", relationshipActive:true },
    entityRelationshipGrammar: { byEntityId: {} },
    coreVerbEngineCoupling: { chord: "idle" }
  };
  const playerRoot = new THREE.Group(); playerRoot.position.set(7.2,9.3,-54);
  const entities = [
    {instanceId:WATCHER,root:makeRoot(7.4,9.4,-54.2)},
    {instanceId:RELAY_A,root:makeRoot(3.5,8,-55)},
    {instanceId:"gathering_ground_relay_b_001",root:makeRoot(1.5,9.6,-56.8)}
  ];
  const system = new GatheringGroundAliveSystem({ scene:new THREE.Scene(), playerRoot, frameState, entitySystem:{entities}, apertureFieldsArrivalSystem:{entryAnchor:new THREE.Vector3()} });
  system.onRuntimeMount(frameState); return {system,frameState,playerRoot};
};
const idle = (f) => { f.coreVerbEngineCoupling.chord="idle"; f.entityRelationshipGrammar.byEntityId={}; };
const wTrigger = (f) => { f.coreVerbEngineCoupling.chord="cohere_project"; f.entityRelationshipGrammar.byEntityId={ [WATCHER]:{interpretation:"stable_interrogation",engagement01:.7,distance:1.2} }; };
const wSustain = (f) => { f.coreVerbEngineCoupling.chord="cohere"; f.entityRelationshipGrammar.byEntityId={ [WATCHER]:{interpretation:"anchored_observation",engagement01:.66,distance:1.2} }; };
const rTrigger = (f) => { f.coreVerbEngineCoupling.chord="cohere_draw"; f.entityRelationshipGrammar.byEntityId={ [RELAY_A]:{interpretation:"held_intake",engagement01:.7,distance:1.2} }; };
const rSustain = (f) => { f.coreVerbEngineCoupling.chord="cohere"; f.entityRelationshipGrammar.byEntityId={ [RELAY_A]:{interpretation:"flow_alignment",engagement01:.66,distance:1.2} }; };
const pressure = (f) => { f.coreVerbEngineCoupling.chord="project"; f.entityRelationshipGrammar.byEntityId={ [WATCHER]:{interpretation:"answering_probe",engagement01:.65,distance:1.2} }; };

const policies = {
  normal_explorer({frameState}) {
    const a=frameState.gatheringGroundAlive; if(!a) return idle(frameState);
    const w=a.encounters.reactive_watcher_stable_interrogation, r=a.encounters.reactive_relay_held_intake;
    if(w?.state==="available" && w.retryBackoff<=0 && (w.completionCount===0 || a.ongoingResponseCycles<2)) return wTrigger(frameState);
    if(w?.state==="active") return wSustain(frameState);
    if(r?.state==="available" && r.retryBackoff<=0 && r.completionCount===0) return rTrigger(frameState);
    if(r?.state==="active") return rSustain(frameState);
    idle(frameState);
  },
  slow_observer({frameState}) { idle(frameState); },
  aggressive_verb_user({frameState,t}) {
    const a=frameState.gatheringGroundAlive; if(!a || t<7) return pressure(frameState);
    const phase=Math.floor(t*2.5)%5; if(phase===0) wTrigger(frameState); else if(phase===2) rTrigger(frameState); else pressure(frameState);
  },
  boundary_stress({frameState,playerRoot,t}) {
    const away=Math.floor(t/2.2)%2===1; playerRoot.position.set(away?30:7.2,away?13:9.3,away?-42:-54);
    const a=frameState.gatheringGroundAlive; if(!a) return idle(frameState);
    const w=a.encounters.reactive_watcher_stable_interrogation; if(w?.state==="available") wTrigger(frameState); else if(w?.state==="active") wSustain(frameState); else idle(frameState);
  },
  backtracker({frameState,playerRoot,t}) {
    const away=t>=18&&t<42; playerRoot.position.set(away?27:7.2,away?11:9.3,away?-43:-54);
    const a=frameState.gatheringGroundAlive; if(!a || away) return idle(frameState);
    const w=a.encounters.reactive_watcher_stable_interrogation, r=a.encounters.reactive_relay_held_intake;
    if(w?.completionCount===0 && w?.state==="available") return wTrigger(frameState);
    if(w?.state==="active") return wSustain(frameState);
    if(t>=42 && r?.completionCount===0 && r?.state==="available") return rTrigger(frameState);
    if(r?.state==="active") return rSustain(frameState);
    idle(frameState);
  },
  chaotic_fixed_seed: (()=>{let seed=0x21c0ffee; const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/0x100000000}; return ({frameState,playerRoot,t})=>{ if(Math.floor(t*3)!==Math.floor((t-.05)*3)){const x=rnd();playerRoot.position.set(x<.15?28:7.2,x<.15?12:9.3,x<.15?-44:-54);} const slot=Math.floor(t*4)%9; if(slot===0)wTrigger(frameState); else if(slot===3)rTrigger(frameState); else if(slot===5)idle(frameState); else pressure(frameState); };})()
};

const run=(name,policy,duration=120,dt=.05)=>{const h=createHarness(); for(let t=0;t<duration-1e-9;t+=dt){policy({...h,t,dt});h.system.update(dt,h.frameState);} const a=h.frameState.gatheringGroundAlive; const vals=Object.values(a.encounters); return {name,final:a.completedCount,cycles:a.ongoingResponseCycles,memory:a.memory.mode,interruptions:vals.reduce((n,e)=>n+(e.interruptionCount||0),0),watcher:a.encounters.reactive_watcher_stable_interrogation,relay:a.encounters.reactive_relay_held_intake};};
const results=Object.entries(policies).map(([n,p])=>run(n,p)); const by=Object.fromEntries(results.map(r=>[r.name,r]));
assert(by.normal_explorer.final===6,"normal explorer should reach LIFE 6/6 with impulse->stabilize sustain");
assert(by.normal_explorer.cycles>=2,"normal explorer should reach recurrent LOOP");
assert(by.normal_explorer.watcher.interruptionCount===0 && by.normal_explorer.relay.interruptionCount===0,"normal explorer should not be falsely interrupted");
assert(by.slow_observer.final===2,"slow observer should remain ambient-only");
assert(by.aggressive_verb_user.interruptions>0,"aggressive switching should still interrupt");
assert(by.boundary_stress.interruptions>0,"leaving local body should still interrupt");
assert(by.backtracker.final===6,"backtracker should preserve state and finish on return");
assert(by.chaotic_fixed_seed.interruptions>0,"chaotic switching should still interrupt");
console.log("HC031U2.1 six-profile relationship intent convergence PASS");
for(const r of results) console.log(`${r.name} | LIFE ${r.final}/6 | LOOP ${r.cycles} | MEM ${r.memory} | INT ${r.interruptions}`);
