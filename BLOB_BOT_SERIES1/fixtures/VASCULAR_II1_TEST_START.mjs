// Optional browser-console checkpoint staging. Not imported by the game.
import * as THREE from 'three';
import {VascularRhythmRouteSystem} from '../../src/routes/VascularRhythmRouteSystem.js';
export async function stage() {
  const proto=VascularRhythmRouteSystem.prototype,original=proto.update;
  let seen=null;
  function capture(...args){seen=this;return Reflect.apply(original,this,args);}
  proto.update=capture;
  try {
    const deadline=performance.now()+10000;
    while((!seen?.active || seen.frameState?.activeCellId!=='CELL_VASCULAR_RHYTHM_ROUTE_001') && performance.now()<deadline) {
      await new Promise(resolve=>setTimeout(resolve,50));
    }
    if(!seen?.active || seen.frameState?.activeCellId!=='CELL_VASCULAR_RHYTHM_ROUTE_001') throw Error('Open the game, press Shift+5, then run stage() again.');
    const route=seen,f=route.frameState,goal=route.returnHandoff;
    if(!goal)throw Error('Install VASCULAR-II1 first.');
    if(goal.completed || goal.handoffId || f.returnRegionEngine?.phase2?.vascular) throw Error('This runtime already has a pending/completed Vascular II handoff. Continue it, or reload for a fresh test.');
    // Explicitly staged *past* first-route progress. New goal proof is never set.
    route.completed=true;route.returnFoldReady=true;route.lockedCadenceReads=3;
    route.synchronization=1;route.circulationIntegrity=1;route.turbulence=0;
    const history=f.act1RouteHistory??{},previous=history.routeStates?.vascular_route??{};
    f.act1RouteHistory={...history,vascularReturned:true,vascularCompleted:true,
      routeStates:{...(history.routeStates??{}),vascular_route:{...previous,entered:true,
        returned:true,completed:true,entryCount:Math.max(2,previous.entryCount??0),
        returnCount:Math.max(1,previous.returnCount??0)}}};
    route.root.updateWorldMatrix(true,true);
    const world=route.valves[1].getWorldPosition(new THREE.Vector3());
    route.playerRoot.position.copy(route.playerRoot.parent
      ? route.playerRoot.parent.worldToLocal(world.clone()) : world);
    return {pass:'VASCULAR-II1-TEST-START',testOnly:true,earnedProgression:false,
      scope:'Staged prior first-route return, qualified revisit and source pose only; no phase-two handoff or completion credit written.',
      next:'Return focus to the game. Hold LT/Q, then tap Pulse/X while holding. Follow gold to green intake; hold LT/Q there.',
      position:world.toArray()};
  } finally { if(proto.update===capture)proto.update=original; }
}
