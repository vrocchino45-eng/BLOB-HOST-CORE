import fs from "node:fs";
const entry=fs.readFileSync(new URL("../src/morph/HubGraveMorphTransitionSystem.js",import.meta.url),"utf8");
const ret=fs.readFileSync(new URL("../src/morph/GraveHubMorphReturnSystem.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");
const ledger=fs.readFileSync(new URL("../src/core/RuntimeStateLedgerSystem.js",import.meta.url),"utf8");
const gate=fs.readFileSync(new URL("../src/systems/GateSystem.js",import.meta.url),"utf8");
for(const proof of ["morphing_hub_signal_into_grave_memory","frameState.activeCellId = GRAVE_CELL_ID","transitionOwner: \"HubGraveMorphTransitionSystem\""])
  if(!entry.includes(proof)) throw new Error(`Missing Grave entry proof: ${proof}`);
for(const proof of ["morphing_grave_memory_back_into_hub_signal","frameState.activeCellId = HUB_CELL_ID","memoryThreadRetained:","safeMemoryTransferComplete:","graveMemoryImprintCommitted:","graveTraceIntegrity:","graveRiskEventCount:","graveResidueRecoilRecovered:","transitionOwner: \"GraveHubMorphReturnSystem\""])
  if(!ret.includes(proof)) throw new Error(`Missing Grave return proof: ${proof}`);
if(!runtime.includes('register("hubGraveMorphTransitionSystem"') || !runtime.includes('register("graveHubMorphReturnSystem"'))
  throw new Error("Grave morph owners are not registered.");
if(!ledger.includes("hubGraveMorph.active") || !ledger.includes("graveHubReturn.active"))
  throw new Error("Runtime ledger does not firewall Grave morphs.");
for(const proof of ['gate.id === "hub_to_grave_memory_route"','migratedBoundaryOwner: "HubGraveMorphTransitionSystem"','gate.id === "grave_memory_to_hub_chamber"','migratedBoundaryOwner: "GraveHubMorphReturnSystem"'])
  if(!gate.includes(proof)) throw new Error(`GateSystem still owns Grave boundary: ${proof}`);
console.log("[HC016F] Hub <-> Grave roundtrip migration PASS");
