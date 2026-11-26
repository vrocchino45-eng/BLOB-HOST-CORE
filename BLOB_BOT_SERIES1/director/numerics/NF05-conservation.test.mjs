import assert from 'node:assert/strict';
import fs from 'node:fs';
import {test} from 'node:test';
const records=JSON.parse(fs.readFileSync(process.env.BLOB_NF05_MOUNTED,'utf8'));
const events=records.mounted.flatMap(run=>run.events);
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const diff=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,b)=>a.map(v=>v*b);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const norm2=a=>dot(a,a);
const vecSum=v=>v.reduce(add,[0,0,0]);
const energy=(u,k)=>u.reduce((s,x)=>s+0.5*x.mass*norm2(x[k]),0);
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-12,String(a)+' vs '+b);
const vclose=(a,b)=>a.forEach((v,i)=>close(v,b[i]));

test('same-frame contact preserves vector momentum and tangent velocity',()=>{
  assert.equal(events.length,4);
  for(const e of events){
    const u=e.units;
    const p=k=>vecSum(u.map(x=>mul(x[k],x.mass)));
    vclose(p('incomingVelocity'),e.momentumBefore);vclose(p('outgoingVelocity'),e.momentumAfter);
    vclose(e.momentumBefore,e.momentumAfter);
    for(const x of u){
      const dv=diff(x.outgoingVelocity,x.incomingVelocity);
      vclose(dv,mul(e.normal,dot(dv,e.normal)));
    }
  }
});
test('reported loss equals the mechanical restitution loss and finite kinetic difference',()=>{
  for(const e of events){
    const [a,b]=e.units;const vn=dot(diff(b.incomingVelocity,a.incomingVelocity),e.normal);
    assert.ok(vn<0);
    const reducedMass=1/(1/a.mass+1/b.mass);
    close(e.impulse,-reducedMass*vn);
    close(e.kineticEnergyLost,.5*reducedMass*vn*vn);
    close(e.kineticEnergyBefore,energy(e.units,'incomingVelocity'));
    close(e.kineticEnergyAfter,energy(e.units,'outgoingVelocity'));
    close(e.kineticEnergyLost,e.kineticEnergyBefore-e.kineticEnergyAfter);
  }
});
test('native-stage change is measured separately from contact conservation',()=>{
  let different=0;
  for(const e of events){
    const nativeDelta=vecSum(e.units.map(x=>mul(diff(x.incomingVelocity,x.beforeNativeVelocity),x.mass)));
    const pre=vecSum(e.units.map(x=>mul(x.beforeNativeVelocity,x.mass)));
    vclose(add(pre,nativeDelta),e.momentumBefore);
    const nativeWork=energy(e.units,'incomingVelocity')-energy(e.units,'beforeNativeVelocity');
    close(energy(e.units,'beforeNativeVelocity')+nativeWork-e.kineticEnergyLost,e.kineticEnergyAfter);
    if(norm2(nativeDelta)>0)different++;
  }
  assert.ok(different>0);
});
test('mechanical observations create no inventory transfer, route credit or Host receipt',()=>{
  for(const e of events){assert.equal(e.inventoryTransferred,false);assert.equal(e.progressionCredit,false);assert.equal(e.hostReceipt,false);}
  assert.equal(records.mounted[2].events.length,0);
});
