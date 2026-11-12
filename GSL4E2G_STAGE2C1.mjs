import assert from 'node:assert/strict';
import {GSL4E2BReadOnlyAdapter} from './GSL4E2B_ReadOnlyAdapter.mjs';
const checks=[];
function check(name,fn){try{fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',error:String(e.stack||e)});}}
const a=(active,detachReason='none')=>({playerAttachment:{active,detachReason}});
function sample(adapter,active,reason,t){const f=a(active,reason),before=JSON.stringify(f);const r=adapter.sample(f,t);assert.equal(JSON.stringify(f),before,'adapter mutated input');return r;}
check('B05 unexpected loss holds concern 1.8s then companion',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,true,'none',10);assert.equal(sample(x,false,'surface_lost',10.1).mode,'concern');assert.equal(sample(x,false,'surface_lost',11.89).mode,'concern');assert.equal(sample(x,false,'surface_lost',11.9).mode,'companion');});
check('B05 recovery holds support 1.3s then companion',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,false,'surface_lost',10);assert.equal(sample(x,true,'none',10.1).mode,'support');assert.equal(sample(x,true,'none',11.39).mode,'support');assert.equal(sample(x,true,'none',11.4).mode,'companion');});
check('B02 deliberate_away_input suppresses concern',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,true,'none',10);const r=sample(x,false,'deliberate_away_input',10.1);assert.equal(r.event,'deliberate_release');assert.equal(r.mode,'companion');});
check('B09 rapid loss -> recovery -> loss transitions deterministically',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,true,'none',1);assert.equal(sample(x,false,'surface_lost',1.1).mode,'concern');assert.equal(sample(x,true,'none',1.2).mode,'support');assert.equal(sample(x,false,'surface_lost',1.3).mode,'concern');assert.equal(sample(x,false,'none',1.4).mode,'concern');});
check('B09 stable attachment does not re-trigger event',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,false,'none',1);assert.equal(sample(x,true,'none',1.1).event,'attachment_recovered');const until=x.supportUntil;for(let i=0;i<20;i++)sample(x,true,'none',1.2+i*.05);assert.equal(x.supportUntil,until);});
check('B09 missing reason never fabricates concern',()=>{const x=new GSL4E2BReadOnlyAdapter();sample(x,true,'none',1);const r=sample(x,false,'none',1.1);assert.equal(r.event,'unknown_release');assert.equal(r.mode,'companion');});
check('Adapter never mutates LS1 playerAttachment',()=>{const x=new GSL4E2BReadOnlyAdapter();for(const [v,r,t] of [[true,'none',1],[false,'surface_lost',2],[true,'none',3],[false,'deliberate_away_input',4]])sample(x,v,r,t);});

for(const delay of [0.448216666539516,0.497,0.474199999809254,0.30880000019074]){
 check(`Recovery -> deliberate release after ${delay.toFixed(3)}s cancels support`,()=>{
  const x=new GSL4E2BReadOnlyAdapter();sample(x,false,'none',10);sample(x,true,'none',11);
  const r=sample(x,false,'deliberate_away_input',11+delay);
  assert.equal(r.event,'deliberate_release');assert.equal(r.mode,'companion');
  assert.equal(x.supportUntil,0);assert.equal(x.concernUntil,0);
  assert.equal(sample(x,false,'deliberate_away_input',11+delay+.01).mode,'companion');
  assert.equal(sample(x,false,'deliberate_away_input',13).mode,'companion');
 });
}
check('Deliberate release -> fresh recovery starts full support window',()=>{
 const x=new GSL4E2BReadOnlyAdapter();sample(x,false,'none',10);sample(x,true,'none',11);
 sample(x,false,'deliberate_away_input',11.4);
 assert.equal(sample(x,true,'none',11.6).mode,'support');assert.equal(x.supportUntil,12.9);
 assert.equal(sample(x,true,'none',12.89).mode,'support');
 assert.equal(sample(x,true,'none',12.91).mode,'companion');
});
check('Unexpected loss concern is canceled by subsequent deliberate release',()=>{
 const x=new GSL4E2BReadOnlyAdapter();sample(x,true,'none',10);
 sample(x,false,'sustained_contact_loss',10.1);sample(x,true,'none',10.2);
 assert.equal(sample(x,false,'deliberate_away_input',10.3).mode,'companion');
});
const report={pass:'GSL-4E2G-STAGE2C1',scope:'production adapter only; seven existing Stage 2B adapter checks plus six regression checks',checks,
 summary:{passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length},
 notVerified:['installed Guide integration rerun','live Stage 2C rerun','LS1 Silt area coverage','visual quality and human feel']};
console.log(JSON.stringify(report,null,2));if(report.summary.failed)process.exitCode=1;
