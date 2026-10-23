#!/usr/bin/env node
// Real Three.js Mesh / Material smoke test; no DOM/WebGL required.
import * as THREE from 'three';
import { VascularRhythmRouteSystem } from '../src/routes/VascularRhythmRouteSystem.js';
const make = (load) => {
  const owner = Object.create(VascularRhythmRouteSystem.prototype);
  owner.elapsed = 4;
  owner.vis1WaveAge = 30;
  owner.siltSignalReceiver = {membraneLoad:load};
  owner.wallFolds = Array.from({length:9},(_,index)=>{
    const fold = new THREE.Mesh(new THREE.TorusGeometry(.6,.05,4,12),new THREE.MeshStandardMaterial({transparent:true,opacity:.22,emissiveIntensity:.18}));
    fold.name = `vascular_membrane_fold_${index+1}`;
    fold.userData.baseScale = fold.scale.clone();
    return fold;
  });
  owner.braidTubes = Array.from({length:3},()=>new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0)),4,.05,4),new THREE.MeshStandardMaterial({emissiveIntensity:.15})));
  owner.vesselEnvelope = new THREE.Mesh(new THREE.TorusGeometry(.9,.2,4,12),new THREE.MeshStandardMaterial({transparent:true,opacity:.12,emissiveIntensity:.13}));
  return owner;
};
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const zero=make(0);
zero.applySiltPressureAnatomy();
assert(zero.wallFolds.every(f=>f.scale.x===1&&f.scale.y===1&&f.scale.z===1),'Zero-load real meshes moved');
const loaded=make(.5252);
loaded.applySiltPressureAnatomy();
assert(loaded.wallFolds.every(f=>f.scale.x<1&&f.scale.y>1),'Loaded real meshes did not deform');
assert(loaded.wallFolds.every(f=>f.material.emissiveIntensity>.18),'Loaded real mesh materials did not respond');
assert(loaded.vesselEnvelope.material.opacity>.12,'Real vessel material unchanged');
assert(loaded.vis1Applied.meanRadialCompression>.07,'Weak mean compression at reference load');
console.log(JSON.stringify({pass:'C0C-VIS1-A',result:'REAL_THREEJS_MESH_PRESENTATION_SMOKE_PASS',folds:9,braids:3,load:.5252,meanCompression:loaded.vis1Applied.meanRadialCompression},null,2));
for(const owner of [zero,loaded]){
  for(const mesh of [...owner.wallFolds,...owner.braidTubes,owner.vesselEnvelope]){
    mesh.geometry.dispose();mesh.material.dispose();
  }
}
