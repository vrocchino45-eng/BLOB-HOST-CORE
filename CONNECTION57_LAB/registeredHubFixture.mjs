import * as THREE from "three";
import {SystemRegistry} from "../src/core/SystemRegistry.js";
import {DeliberateCommitmentSystem as Commitment} from "../src/input/DeliberateCommitmentSystem.js";
import {HubInvestigationGameplaySystem as Hub} from "../src/hub/HubInvestigationGameplaySystem.js";
import {LocalCellBoundaryMorphSystem as Boundary} from "../src/morph/LocalCellBoundaryMorphSystem.js";
import {LOCAL_CELL_BOUNDARY_RECIPES_HC016G as recipes} from "../src/morph/LocalCellBoundaryRecipeRegistry.js";
const HUB="CELL_SIGNAL_CHORUS_NERVE_001";
export function fixture({Class=Boundary,HubClass=Hub,route='grave_memory_route',prepared=true,earned=false,screenComplete=false}={}){
 const recipe=recipes.find(r=>r.sourceCellId===HUB&&r.routeId===route),flag=recipe.preparationFlag??'hubToGraveReady';
 const scene=new THREE.Scene(),player=new THREE.Group();player.position.set(0,0,1);scene.add(player);
 const body={id:route,gateId:recipe.gateId,displayName:route,position:[0,0,0],activeRoute:route==='grave_memory_route'||earned,destinationMounted:prepared,playableReady:prepared,gameplayPending:!prepared,distanceToPlayer:1};
 const history=earned?{graveEntered:true,graveReturned:true,graveMemoryImprintCommitted:true,vascularReturned:true,vascularCompleted:true,vascularCadenceReads:3,siltReturned:true,siltCompleted:true,siltPressureRead:true,siltRibsReleased:true,siltSafeMatterAbsorbed:true,siltDenseMatterLeftIntact:true,hubThreeRouteConvergenceCompleted:route==='comb_threshold'}:{};
 const f={frame:0,runtimeSeconds:0,activeCellId:HUB,input:{},act1RouteHistory:history,hubChamberFoundation:{active:true,completed:screenComplete,routes:route==='comb_threshold'?[]:[body],thresholds:route==='comb_threshold'?[body]:[],firstDestinationInvitation:{active:false}},firstSliceObjectives:{hub_read_route_gates:{complete:false},grave_memory_read_and_stabilize:{complete:earned}},transitionContinuity:{[flag]:prepared},returnRegionEngine:{creditCount:0},massWitness:{total:8}};
 const hub=new HubClass({recipeDataSystem:{get:()=>({sourceCellId:HUB,routes:[body],center:{position:[0,0,0]},memoryFragment:{position:[100,100,100]},requirements:{routePulseReads:3}})},scene,playerRoot:player,frameState:f});
 const boundary=new Class({frameState:f,scene,playerRoot:player});const commit=new Commitment({frameState:f}),registry=new SystemRegistry();let fault=null;
 // Matches these owners' relative order in GameRuntime. Published Hub body,
 // preparation/history and logical input are declared fixtures, not a full app.
 registry.register('deliberateCommitmentSystem',commit);registry.register('hubInvestigationGameplaySystem',hub);
 registry.register('declared_readiness_race',{update(){fault?.();}});registry.register('localCellBoundaryMorphSystem',boundary);
 function step(input={}){f.frame++;f.runtimeSeconds+=1/60;f.input={interactPressed:false,interactEventId:f.frame,primaryActionContext:'world',...input};body.distanceToPlayer=player.position.distanceTo(new THREE.Vector3());body.destinationMounted=f.transitionContinuity[flag];body.playableReady=body.destinationMounted;body.gameplayPending=!body.destinationMounted;registry.update(1/60,f);}
 function settle(n=90){for(let i=0;i<n;i++)step();}
 function choose(){step();step({interactPressed:true});}
 return {f,hub,boundary,registry,player,body,recipe,flag,step,settle,choose,setFault:fn=>fault=fn};
}
