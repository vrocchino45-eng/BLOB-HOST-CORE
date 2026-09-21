import * as THREE from "three";
import { ApertureFieldsArrivalSystem } from "../src/fields/ApertureFieldsArrivalSystem.js";
const scene=new THREE.Scene(); const playerRoot=new THREE.Group(); const frameState={activeCellId:"CELL_APERTURE_FIELDS_ARRIVAL_001"};
const system=new ApertureFieldsArrivalSystem({scene,playerRoot,frameState}); system.onRuntimeMount(frameState); for(let i=0;i<150;i++) system.update(1/60,frameState);
const a=frameState.apertureFieldsArrival;
if(a.pass!=="HC-014J") throw new Error("identity"); if(a.primaryLandmarkId!=="signal_plain_beacon") throw new Error("primary"); if(a.landmarkCount!==3) throw new Error("landmarks"); if(a.fullEcologyMounted||a.ecologyGameplayReady) throw new Error("ecology"); if(a.sceneRings?.objective!=="signal_plain_beacon") throw new Error("rings"); if(!a.guideSightlineActive) throw new Error("guide"); if(!(a.cameraDistanceIntent>11.8)) throw new Error("camera");
const s=a.landmarks.find(x=>x.id==="signal_plain_beacon"),m=a.landmarks.find(x=>x.id==="membrane_ridge_arc"),g=a.landmarks.find(x=>x.id==="gathering_ground_cluster"); if(!(s.distance<m.distance&&m.distance<g.distance)) throw new Error("depth hierarchy"); console.log("PASS HC-014J Aperture arrival orientation / field readability lock");
