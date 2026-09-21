import fs from "node:fs";
const morph=fs.readFileSync(new URL("../src/morph/HubVascularMorphTransitionSystem.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");
const ledger=fs.readFileSync(new URL("../src/core/RuntimeStateLedgerSystem.js",import.meta.url),"utf8");
const gate=fs.readFileSync(new URL("../src/systems/GateSystem.js",import.meta.url),"utf8");

for(const proof of [
  "morphing_hub_signal_into_vascular_flow",
  "frameState.activeCellId = VASCULAR_CELL_ID",
  "transitionOwner: \"HubVascularMorphTransitionSystem\"",
  "samePlayerPositionRetained: true"
]) if(!morph.includes(proof)) throw new Error(`Missing morph-owner proof: ${proof}`);

if(!runtime.includes('register("hubVascularMorphTransitionSystem"'))
  throw new Error("Hub/Vascular morph owner not registered.");
if(!ledger.includes("hubVascularMorph.active"))
  throw new Error("Runtime ledger does not firewall the migrated boundary.");
if(!gate.includes('gate.id === "hub_to_vascular_route"') || !gate.includes("gateMutationDisabledForMigratedBoundary: true"))
  throw new Error("GateSystem can still own the migrated boundary.");

console.log("[HC016C] Hub -> Vascular hard-boundary ownership migration PASS");
