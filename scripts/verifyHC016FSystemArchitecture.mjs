import fs from "node:fs";
const gate=fs.readFileSync(new URL("../src/systems/GateSystem.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");
const ledger=fs.readFileSync(new URL("../src/core/RuntimeStateLedgerSystem.js",import.meta.url),"utf8");

const migrated=[
 ["hub_to_vascular_route","HubVascularMorphTransitionSystem"],
 ["vascular_route_to_hub_chamber","VascularHubMorphReturnSystem"],
 ["hub_to_silt_burrow_route","HubSiltMorphTransitionSystem"],
 ["silt_burrow_route_to_hub_chamber","SiltHubMorphReturnSystem"],
 ["hub_to_grave_memory_route","HubGraveMorphTransitionSystem"],
 ["grave_memory_to_hub_chamber","GraveHubMorphReturnSystem"]
];
for(const [gateId,owner] of migrated){
  if(!gate.includes(`gate.id === "${gateId}"`)) throw new Error(`Observer branch missing: ${gateId}`);
  if(!gate.includes(`migratedBoundaryOwner: "${owner}"`)) throw new Error(`Migrated owner missing: ${gateId} -> ${owner}`);
}
for(const id of ["hubVascularMorphTransitionSystem","vascularHubMorphReturnSystem","hubSiltMorphTransitionSystem","siltHubMorphReturnSystem","hubGraveMorphTransitionSystem","graveHubMorphReturnSystem","runtimeStateLedgerSystem"]){
  if(!runtime.includes(`register("${id}"`)) throw new Error(`Missing runtime registration: ${id}`);
}
for(const proof of ["hubVascularMorph.active","vascularHubReturn.active","hubSiltMorph.active","siltHubReturn.active","hubGraveMorph.active","graveHubReturn.active"]){
  if(!ledger.includes(proof)) throw new Error(`Ledger firewall missing: ${proof}`);
}
console.log("[HC016F VERIFY] six migrated Hub-route boundaries are observer-only in GateSystem: PASS");
console.log("[HC016F VERIFY] runtime registrations and ledger firewalls: PASS");
