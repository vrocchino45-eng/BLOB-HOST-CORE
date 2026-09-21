import fs from "node:fs";
import path from "node:path";
const root=path.resolve(new URL("..",import.meta.url).pathname);
const runtime=fs.readFileSync(path.join(root,"src/core/GameRuntime.js"),"utf8");
const generic=fs.readFileSync(path.join(root,"src/morph/LocalCellBoundaryMorphSystem.js"),"utf8");
const ledger=fs.readFileSync(path.join(root,"src/core/RuntimeStateLedgerSystem.js"),"utf8");

if(fs.existsSync(path.join(root,"src/systems/GateSystem.js")))
  throw new Error("GateSystem.js still exists.");

for(const forbidden of ["import { GateSystem }","new GateSystem(","register(\"gateSystem\""])
  if(runtime.includes(forbidden)) throw new Error(`Gate runtime reference remains: ${forbidden}`);

for(const proof of [
 "publishCompatibilityReadModel(frameState)",
 "frameState.firstSliceGates = gates",
 "frameState.gateState = activeGate",
 "frameState.act1RouteRuntimeContract",
 "mutationAuthority: false"
]) if(!generic.includes(proof)) throw new Error(`Read-model proof missing: ${proof}`);

if(!ledger.includes("gateSystemRegistered: false"))
  throw new Error("Ledger does not mark Gate runtime retired.");

console.log("[HC016K] Gate runtime retired; read model moved to LocalCellBoundaryMorphSystem PASS");
