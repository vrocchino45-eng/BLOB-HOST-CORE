import a from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

const [root,specFile,out]=process.argv.slice(2);
const spec=JSON.parse(fs.readFileSync(specFile,'utf8'));
const git=(...args)=>execFileSync('git',['--no-optional-locks','-C',root,...args],{encoding:'utf8'}).trim();
const commit=git('rev-parse','HEAD');
a.equal(commit,spec.gameplay);
a.equal(git('diff','HEAD','--name-only','--','src','public','scripts','package-lock.json'),'');
const fixtureFile=pathToFileURL(path.join(root,'scripts/testCH03GraveRecoilSettling.mjs'));
const fixtureCode=fs.readFileSync(fixtureFile,'utf8');
const cut=fixtureCode.indexOf("\ntest('Deep Memory Knot");
a.ok(cut>0);
const hook=registerHooks({load(url,ctx,next){
  return url===fixtureFile.href?{format:'module',shortCircuit:true,source:fixtureCode.slice(0,cut)+'\nexport { recover };\n'}:next(url,ctx);
}});
let fixture;
try{fixture=await import(fixtureFile.href);}finally{hook.deregister();}
const zones=spec.zones, results=[], matched=new Map();
for(const grave of zones)for(const vascular of zones)for(const silt of zones){
  const assignment=[grave,vascular,silt];
  const game=fixture.createGraveFixture({zones:assignment});
  const { frame }=game;
  a.deepEqual(frame.spatialCoreChemistry.placements.map(piece=>piece.family),spec.familyOrder);
  a.deepEqual(frame.spatialCoreChemistry.placements.map(piece=>piece.zoneId),assignment);
  a.equal(frame.spatialCoreChemistry.topology.complete,true);
  const radial=game.radial.resolveProfile(frame);
  const {distribution,traits,weights}=radial;
  const v={traits,weights};
  if(matched.has(distribution))a.deepEqual(v,matched.get(distribution));
  else matched.set(distribution,v);
  const result=fixture.recover(game,{recoil:spec.control.recoilBefore,trace:spec.control.traceBefore});
  const chemistry=frame.coreChemistryOutput;
  const recovery={recoilRemoved:result.removed,trace:result.trace,reserve:result.reserve,
    earnedFactor:frame.coreGraveRecovery?.multiplier??null,
    authenticReceipts:game.ledger.graveIIResolutionSnapshot().acceptedTotal};
  const near=(v,target)=>Math.abs(v-target)<1e-12;
  a.ok(near(recovery.recoilRemoved,grave==='deep_core'?0.02640:0.02415));
  a.equal(recovery.authenticReceipts,1);
  a.equal(recovery.trace,1);
  const row={assignment:Object.fromEntries(spec.familyOrder.map((id,i)=>[id,assignment[i]])),
    distribution,traits,weights,placement:frame.spatialCoreChemistry.placements,
    exposure:{memory:chemistry.memory,rhythm:chemistry.rhythm,pressure:chemistry.pressure,
      siltMembrane:chemistry.siltMembraneExposure,active:chemistry.active,dominant:chemistry.dominantMode,
      cloud:chemistry.cloudPatternId,siltOutputDirection:chemistry.siltWorldDirection},
    recovery};
  results.push(row);
}
a.equal(results.length,27);a.equal(matched.size,10);
for(const [group,count] of [['2:0:1',3],['1:1:1',6]])a.equal(results.filter(row=>row.distribution===group).length,count);
fs.writeFileSync(out,JSON.stringify({commit,spec,results,distributions:matched.size},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({commit,assignments:results.length,distributions:matched.size,
  matched:results.filter(row=>spec.matchedGroups.includes(row.distribution)).map(row=>[row.distribution,...Object.values(row.assignment),row.exposure.dominant,row.recovery.recoilRemoved])}));

