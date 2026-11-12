import fs from 'node:fs';import assert from 'node:assert/strict';
import {CoreRadialPerformanceSystem as Existing} from '../../candidate_base/src/player/CoreRadialPerformanceSystem.js';
const src=fs.readFileSync(new URL('../../candidate_base/src/player/CoreRadialPerformanceSystem.js',import.meta.url),'utf8');
const needle='const verbDemandTotal = (absorbDemand + stabilizeDemand + pulseDemand) * compositionDemandMultiplier;';assert.ok(src.includes(needle));
const modified=src.replace(needle,`const rawVerbSum = absorbDemand + stabilizeDemand + pulseDemand;
    const dominantDemand = Math.max(absorbDemand, stabilizeDemand, pulseDemand);
    const paired = profile.active && (frameState.returnRegionEngine?.unlockedPhaseCount ?? 3) >= 6;
    const verbDemandTotal = (rawVerbSum - (paired ? .20 * (rawVerbSum - dominantDemand) : 0)) * compositionDemandMultiplier;`);
const {CoreRadialPerformanceSystem:Model}=await import('data:text/javascript;base64,'+Buffer.from(modified).toString('base64'));
const topologies={deep:[3,0,0],inner:[0,3,0],membrane:[0,0,3],balanced:[1,1,1]};
function simulate(Owner,counts,unlocked,kind,seconds=5){const f={input:{absorbHeld:kind==='pair'||kind==='absorb'||kind==='boost-pair',stabilizeHeld:kind==='pair'||kind==='boost-pair',boostHeld:kind==='boost'||kind==='boost-pair'},returnRegionEngine:{unlockedPhaseCount:unlocked},spatialCoreChemistry:{retainedPieceCount:3,counts:{deep_core:counts[0],inner_body:counts[1],membrane:counts[2]},topology:{id:counts.join(':'),complete:true}},verbComposition:{effects:{enduranceDemandMultiplier:1.2}}};const o=new Owner({frameState:f,playerRoot:{userData:{}}});o.init();o.reserve01=.75;for(let i=0;i<seconds/.02;i++)o.update(.02,f);return {reserve:o.reserve01,read:f.corePerformance};}
const checks=[],check=(name,fn)=>{fn();checks.push({name,status:'PASS'});};const rows=[];
for(const [name,counts] of Object.entries(topologies)){
 const base=simulate(Existing,counts,3,'pair'),current6=simulate(Existing,counts,6,'pair'),three=simulate(Model,counts,3,'pair'),six=simulate(Model,counts,6,'pair');
 check(name+': existing owner is architecture independent',()=>assert.deepEqual(base,current6));
 check(name+': proposed three-phase remains exactly baseline',()=>assert.deepEqual(base,three));
 for(const kind of ['idle','absorb','boost','boost-pair'])check(name+': '+kind+' preserves baseline',()=>assert.deepEqual(simulate(Existing,counts,3,kind),simulate(Model,counts,6,kind)));
 check(name+': paired demand stays positive and no worse than baseline',()=>{assert.ok(six.reserve>=base.reserve);assert.ok(six.read.endurance.demand01>0);});
 rows.push({topology:name,initialReserve:.75,seconds:5,current3ReservePercent:base.reserve*100,current6ReservePercent:current6.reserve*100,proposed6ReservePercent:six.reserve*100,proposedGainPercentagePoints:(six.reserve-base.reserve)*100,currentFinalDemand:base.read.endurance.demand01,proposedFinalDemand:six.read.endurance.demand01});
}
const report={status:'OFFLINE PROPOSAL ONLY; NO PRODUCTION CHANGE',coefficient:.20,scope:'Actual radial owner versus in-memory candidate formula; controlled topology, input, reserve and 1.2 composition multiplier; not natural gameplay or feel acceptance.',checks,summary:{passed:checks.length,failed:0},rows};fs.writeFileSync(new URL('./results.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify({summary:report.summary,rows},null,2));
