// Optional browser-console checkpoint staging. Never imported by normal boot.
import * as THREE from 'three';
import {SiltPressureRouteSystem} from '../../src/routes/SiltPressureRouteSystem.js';
export async function stage(){
  const proto=SiltPressureRouteSystem.prototype,original=proto.update;let seen=null;
  function capture(...args){seen=this;return Reflect.apply(original,this,args);}
  proto.update=capture;
  try{
    let deadline=performance.now()+10000;
    while((!seen?.active||seen.frameState?.activeCellId!=='CELL_SILT_PRESSURE_ROUTE_001')&&performance.now()<deadline)await new Promise(resolve=>setTimeout(resolve,50));
    if(!seen?.active||seen.frameState?.activeCellId!=='CELL_SILT_PRESSURE_ROUTE_001')throw Error('Open the game, press Shift+6, then run stage() again.');
    const route=seen,f=route.frameState,goal=route.returnRoundTrip;
    if(!goal)throw Error('Install SILT-II1 first.');
    if(goal.completed||goal.grainId||f.returnRegionEngine?.phase2?.silt)throw Error('This runtime already has a pending/completed Silt II attempt. Continue it or reload for a fresh test.');
    route.completed=true;route.returnFoldReady=true;route.pressureRead=true;route.ribsReleased=true;route.safeMatterAbsorbed=true;route.maxDepthProgress=1;route.compression=.1;
    const history=f.act1RouteHistory??{},previous=history.routeStates?.silt_burrow_route??{};
    f.act1RouteHistory={...history,siltReturned:true,siltCompleted:true,siltPressureRead:true,siltRibsReleased:true,siltSafeMatterAbsorbed:true,siltDenseMatterLeftIntact:true,
      routeStates:{...(history.routeStates??{}),silt_burrow_route:{...previous,entered:true,returned:true,completed:true,entryCount:Math.max(2,previous.entryCount??0),returnCount:Math.max(1,previous.returnCount??0)}}};
    deadline=performance.now()+10000;let index=-1;
    while(index<0&&performance.now()<deadline){index=route.livingCycle.units.findIndex((u,i)=>['veins','garden_transit','settled'].includes(u.phase)&&route.livingMatterMeshes[i].body.visible);if(index<0)await new Promise(resolve=>setTimeout(resolve,50));}
    if(index<0)throw Error('No currently visible circulating grain. Continue normal play and try later.');
    route.root.updateWorldMatrix(true,true);
    const body=route.livingMatterMeshes[index].body,local=body.position.clone().add(new THREE.Vector3(0,.1,1)),world=route.root.localToWorld(local);
    route.playerRoot.position.copy(route.playerRoot.parent?route.playerRoot.parent.worldToLocal(world.clone()):world);
    return {pass:'SILT-II1-TEST-START',testOnly:true,earnedProgression:false,
      scope:'Staged previous first-route completion, qualified revisit and near-grain pose. No new goal proof, ecology time skip, material creation or phase-two credit written.',
      grainId:route.livingCycle.units[index].id,
      next:'Return focus to game. Aim at the nearby grain, hold LT/Q and press A/E; continue imprint, seat, extract, deliberate release and native return.'};
  }finally{if(proto.update===capture)proto.update=original;}
}
