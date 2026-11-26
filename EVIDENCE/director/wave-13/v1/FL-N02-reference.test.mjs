import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exchange, equivalentResistance, junctionResidual, linearStorage, dimensions } from './FL-N01-reference.mjs';

function bulk({length, area, conductivity}) {
  if (![length,area,conductivity].every(v=>Number.isFinite(v)&&v>0)) throw new RangeError('Positive finite bulk inputs required');
  const resistance=length/(area*conductivity);
  if (!(resistance>0&&Number.isFinite(resistance))) throw new RangeError('Invalid bulk resistance');
  return resistance;
}
const pin={sourcePotential:7,receiverPotential:1,dt:.4,currentLimit:2};
const one={length:2,area:1,conductivity:1};
const two={length:1,area:2,conductivity:.25};
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)));
function series(materials, interfaces, values=pin) {
  if (interfaces.some(v=>!Number.isFinite(v)||v<0)) throw new RangeError('Invalid contact loss');
  const individual=[...materials.map(bulk),...interfaces];
  const total=equivalentResistance(individual.filter(v=>v>0),'series');
  const transfer=exchange({...values,resistance:total});
  const losses=individual.map(r=>r*transfer.current**2*values.dt);
  return {individual,total,transfer,losses};
}

test('bulk conductivity and resistivity close dimensionally with L over A',()=>{
  const length=[0,1,0,0,0];
  const sigma=dimensions.conductance.map((v,i)=>v-length[i]);
  const rho=sigma.map(v=>-v);
  assert.deepEqual(rho.map((v,i)=>(v-length[i])||0),dimensions.resistance);
});
test('fixed homogeneous material scales through length, area and conductivity independently',()=>{
  assert.equal(bulk(one),2);
  assert.equal(bulk({...one,length:4}),4);
  assert.equal(bulk({...one,area:2}),1);
  assert.equal(bulk({...one,conductivity:.5}),4);
});
test('two distinct bulk resistances and interface close the passive power budget',()=>{
  const r=series([one,two],[.5]);
  assert.deepEqual(r.individual,[2,2,.5]);
  close(r.transfer.current,6/4.5);
  close(r.transfer.sourceWork,r.transfer.receiverWork+r.losses.reduce((s,v)=>s+v,0));
  assert.ok(r.losses.every(v=>v>=0));
});
test('a zero contact term can exist within a strictly finite bulk path',()=>{
  const r=series([one,two],[0]);
  assert.equal(r.losses[2],0);
  assert.equal(r.total,4);
  assert.ok(r.transfer.current>0);
  assert.throws(()=>series([],[0]),RangeError);
});
test('reversed passive homogeneous path reverses transfer direction with the same losses',()=>{
  const forward=series([one,two],[.5]);
  const reverse=series([two,one],[.5],{...pin,sourcePotential:1,receiverPotential:7});
  close(forward.transfer.signedQuantity,-reverse.transfer.signedQuantity);
  close(forward.transfer.dissipation,reverse.transfer.dissipation);
});
test('equal port potential or a genuine open seam has no credited throughput',()=>{
  assert.equal(series([one,two],[.5],{...pin,receiverPotential:7}).transfer.throughput,0);
  assert.equal(exchange({...pin,resistance:null}).receiverWork,0);
  assert.equal(exchange({...pin,resistance:null}).dissipation,0);
});
test('a separate finite leakage branch requires its own accounted current and loss',()=>{
  const main=series([one,two],[.5]);
  const leak=exchange({...pin,resistance:30});
  const parallel=equivalentResistance([main.total,30],'parallel');
  const whole=exchange({...pin,resistance:parallel});
  close(junctionResidual([whole.current,-main.transfer.current,-leak.current]),0);
  close(whole.dissipation,main.transfer.dissipation+leak.dissipation);
  assert.ok(leak.current>0&&leak.current<main.transfer.current);
});
test('directional projection of a positive diagonal conductivity stays passive across sample axes',()=>{
  const principal=[1,.2,.5];
  for(const normal of [[1,0,0],[0,1,0],[Math.SQRT1_2,Math.SQRT1_2,0],[-1,0,0]]){
    const sigma=normal.reduce((v,n,i)=>v+n*n*principal[i],0);
    const r=bulk({...one,conductivity:sigma});
    const f=exchange({...pin,currentLimit:5,resistance:r});
    assert.ok(f.current>=0&&f.dissipation>=0);
  }
});
test('storage allocation is capacity-limited and independently budgeted',()=>{
  const register=linearStorage({previous:.2,delta:.4,maximum:1,capacitance:2});
  assert.ok(register.energyChange>0);
  close(junctionResidual([1,-.6],.4),0);
  assert.throws(()=>linearStorage({previous:.8,delta:.4,maximum:1,capacitance:2}),RangeError);
});
test('invalid interface, nonfinite or unsupported source cap fails closed',()=>{
  for(const bad of [{length:0},{area:NaN},{conductivity:Infinity},{conductivity:-1}]){
    assert.throws(()=>bulk({...one,...bad}),RangeError);
  }
  assert.throws(()=>series([one,two],[-1]),RangeError);
  assert.throws(()=>series([one,two],[Infinity]),RangeError);
  assert.throws(()=>series([one,two],[.5],{...pin,currentLimit:.5}),RangeError);
});
