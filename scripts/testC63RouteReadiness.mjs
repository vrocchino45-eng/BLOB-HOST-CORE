import assert from 'node:assert/strict';
import { LocalCellBoundaryMorphSystem } from '../src/morph/LocalCellBoundaryMorphSystem.js';

const proto = LocalCellBoundaryMorphSystem.prototype;
const destinations = [
  ['hub_to_grave','hub_grave_entry','hubToGraveReady'],
  ['hub_to_vascular','hub_post_grave_route_entry','hubToVascularReady'],
  ['hub_to_silt','hub_post_grave_route_entry','hubToSiltReady'],
];
let passed = 0;
function check(label, condition) { assert.ok(condition,label); passed++; console.log(`PASS ${label}`); }
function state(id,flag,{prepared=true,near=true,hub=true,graveComplete=false}={}) {
 return {activeCellId:'CELL_SIGNAL_CHORUS_NERVE_001', hubChamberFoundation:{active:hub,routes:[{gateId:`gate_${id}`,distanceToPlayer:near?1:100,position:[0,0,0]}]}, transitionContinuity:{[flag]:prepared},act1RouteHistory:{graveEntered:false,graveReturned:false},firstSliceObjectives:{grave_memory_read_and_stabilize:{complete:graveComplete},hub_read_route_gates:{complete:false}}};
}
for (const [id,readiness,flag] of destinations) {
 const recipe={id,readiness,gateId:`gate_${id}`,interactionRange:3,preparationFlag:flag,sourceCellId:'CELL_SIGNAL_CHORUS_NERVE_001'};
 const fresh=state(id,flag);
 const r=proto.evaluateReadiness.call({hubEntryReadiness:proto.hubEntryReadiness},recipe,fresh);
 check(`${id} direct entry without Grave`,r.ready===true);
 check(`${id} compatibility awake`,proto.compatibilityAwake.call({},recipe,fresh,r)===true);
 check(`${id} rejects unprepared destination`,proto.evaluateReadiness.call({hubEntryReadiness:proto.hubEntryReadiness},recipe,state(id,flag,{prepared:false})).ready===false);
 check(`${id} rejects distant interaction`,proto.evaluateReadiness.call({hubEntryReadiness:proto.hubEntryReadiness},recipe,state(id,flag,{near:false})).ready===false);
 check(`${id} rejects inactive Hub`,proto.evaluateReadiness.call({hubEntryReadiness:proto.hubEntryReadiness},recipe,state(id,flag,{hub:false})).ready===false);
}
for(const [readiness,method] of [['grave_return','graveReturnReadiness'],['vascular_return','routeReturnReadiness'],['silt_return','routeReturnReadiness'],['hub_comb_entry','hubCombEntryReadiness']]) {
 const sentinel={ready:false,reason:'delegated'};
 const owner={ [method]:()=>sentinel };
 check(`${readiness} retains owner`,proto.evaluateReadiness.call(owner,{readiness}, {})===sentinel);
}
console.log(`C63 readiness integration: PASS (${passed} assertions). This is a logic-level test, not a browser traversal test.`);
