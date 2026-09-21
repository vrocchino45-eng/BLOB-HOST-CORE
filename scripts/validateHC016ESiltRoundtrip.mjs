import fs from "node:fs";
const entry=fs.readFileSync(new URL("../src/morph/HubSiltMorphTransitionSystem.js",import.meta.url),"utf8");
const ret=fs.readFileSync(new URL("../src/morph/SiltHubMorphReturnSystem.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");
const ledger=fs.readFileSync(new URL("../src/core/RuntimeStateLedgerSystem.js",import.meta.url),"utf8");
const gate=fs.readFileSync(new URL("../src/systems/GateSystem.js",import.meta.url),"utf8");

for(const proof of [
  "morphing_hub_signal_into_silt_pressure",
  "frameState.activeCellId = SILT_CELL_ID",
  "transitionOwner: \"HubSiltMorphTransitionSystem\""
]) if(!entry.includes(proof)) throw new Error(`Missing Silt entry proof: ${proof}`);

for(const proof of [
  "morphing_silt_pressure_back_into_hub_signal",
  "frameState.activeCellId = HUB_CELL_ID",
  "siltPressureRead:",
  "siltDenseMatterLeftIntact:",
  "transitionOwner: \"SiltHubMorphReturnSystem\""
]) if(!ret.includes(proof)) throw new Error(`Missing Silt return proof: ${proof}`);

if(!runtime.includes('register("hubSiltMorphTransitionSystem"') ||
   !runtime.includes('register("siltHubMorphReturnSystem"'))
  throw new Error("Silt morph owners are not registered.");

if(!ledger.includes("hubSiltMorph.active") || !ledger.includes("siltHubReturn.active"))
  throw new Error("Runtime ledger does not firewall Silt morphs.");

for(const proof of [
  'gate.id === "hub_to_silt_burrow_route"',
  'migratedBoundaryOwner: "HubSiltMorphTransitionSystem"',
  'gate.id === "silt_burrow_route_to_hub_chamber"',
  'migratedBoundaryOwner: "SiltHubMorphReturnSystem"'
]) if(!gate.includes(proof)) throw new Error(`GateSystem still owns Silt boundary: ${proof}`);

console.log("[HC016E] Hub <-> Silt full roundtrip migration PASS");
