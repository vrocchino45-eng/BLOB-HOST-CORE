import fs from "node:fs";
const gate=fs.readFileSync(new URL("../src/systems/GateSystem.js",import.meta.url),"utf8");
const ledger=fs.readFileSync(new URL("../src/core/RuntimeStateLedgerSystem.js",import.meta.url),"utf8");
const recipes=fs.readFileSync(new URL("../src/morph/LocalCellBoundaryRecipeRegistry.js",import.meta.url),"utf8");

for(const forbidden of [
  "tryCross(",
  "completeCrossing(",
  "frameState.activeCellId = destinationCellId",
  "lastPulseEventId",
  "lastInteractEventId"
]) if(gate.includes(forbidden)) throw new Error(`Legacy crossing authority remains: ${forbidden}`);

for(const id of [
 "hub_to_grave","grave_to_hub","hub_to_vascular","vascular_to_hub",
 "hub_to_silt","silt_to_hub","hub_to_comb","comb_to_hub",
 "comb_to_aperture","aperture_to_comb"
]) if(!recipes.includes(`id: "${id}"`)) throw new Error(`Missing morph recipe ${id}`);

if(!ledger.includes('gateSystem: "read_only_compatibility_observer"') ||
   !ledger.includes("gateMutationAuthority: false"))
  throw new Error("Ledger still grants GateSystem mutation authority.");

console.log("[HC016J] GateSystem crossing/input/activeCell authority removed PASS");
