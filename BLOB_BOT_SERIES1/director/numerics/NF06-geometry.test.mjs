import assert from 'node:assert/strict';
import { test } from 'node:test';
export const CASES = Object.freeze([
 [1,0,[.5,.5],.25], [1,.5,[.25,.75],.3125], [1,1,[0,1],.5],
 [3,0,[.25,.25],.125], [3,.5,[-.125,.375],.21875], [3,1,[-.5,.5],.5]
].map(row=>Object.freeze(row)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-12*(1+Math.max(Math.abs(a),Math.abs(b))),a+' vs '+b);
for(const [m,e,after,energy] of CASES) test('analytical 1:'+m+' e='+e,()=>{
 const j=(1+e)/(1+1/m);
 const values=[1-j,j/m];
 values.forEach((a,i)=>close(a,after[i]));
 close(values[0]+m*values[1],1);close(values[1]-values[0],e);
 close(.5*(values[0]**2+m*values[1]**2),energy);
 close(.5-energy,.5*m/(1+m)*(1-e**2));
 assert.ok(energy<=.5);
});
test('rigid placement distinguishes positions, directions, normals and projection',()=>{
 const R=([x,y,z])=>[-y,x,z], t=[4,2,1];
 const P=v=>R(v).map((value,i)=>value+t[i]);
 assert.deepEqual(P([2,0,1]),[4,4,2]);
 R([2,0,1]).forEach((value,i)=>close(value,[0,2,1][i]));
 R([1,0,0]).forEach((value,i)=>close(value,[0,1,0][i]));
 P([2,0,1]).forEach((v,i)=>close(v-P([0,0,0])[i],R([2,0,1])[i]));
 const ndc=[1,-2,1].map(v=>v/4);
 assert.deepEqual([960*(ndc[0]+1)/2,540*(1-ndc[1])/2],[600,405]);
});
test('scoped dimensions close without equating inventory to inertial mass',()=>{
 const add=(a,b)=>a.map((v,i)=>v+b[i]);
 const L=[1,0,0,0], V=[1,-1,0,0], M=[0,0,1,0], Q=[0,0,0,1];
 assert.deepEqual(add(L,L),[2,0,0,0]);
 assert.deepEqual(add(L,add(L,L)),[3,0,0,0]);
 assert.deepEqual(add(M,V),[1,-1,1,0]);
 assert.deepEqual(add(M,add(V,V)),[2,-2,1,0]);
 assert.deepEqual(add(V,V.map(x=>-x)),[0,0,0,0]);
 assert.notDeepEqual(Q,M);
});
