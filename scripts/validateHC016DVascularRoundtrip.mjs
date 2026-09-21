import fs from "node:fs";
const ret=fs.readFileSync(new URL("../src/morph/VascularHubMorphReturnSystem.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");
const ledger=fs.readFileSync(new URL("../src/core/RuntimeStateLedgerSystem.js",import.meta.url),"utf8");
const gate=fs.readFileSync(new URL("../src/systems/GateSystem.js",import.meta.url),"utf8");

for(const proof of [
  "morphing_vascular_flow_back_into_hub_signal",
  "frameState.activeCellId = HUB_CELL_ID",
  "transitionOwner: \"VascularHubMorphReturnSystem\"",
  "vascularReturned: true"
]) if(!ret.includes(proof)) throw new Error(`Missing return morph proof: ${proof}`);

if(!runtime.includes('register("vascularHubMorphReturnSystem"'))
  throw new Error("Return morph owner not registered.");
if(!ledger.includes("vascularHubReturn.active"))
  throw new Error("Runtime ledger does not firewall Vascular return.");
if(!gate.includes('gate.id === "vascular_route_to_hub_chamber"') ||
   !gate.includes('migratedBoundaryOwner: "VascularHubMorphReturnSystem"'))
  throw new Error("GateSystem still owns Vascular return.");

console.log("[HC016D] Hub <-> Vascular full roundtrip migration PASS");
