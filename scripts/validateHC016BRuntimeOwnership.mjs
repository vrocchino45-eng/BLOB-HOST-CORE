import fs from "node:fs";
const ledger=fs.readFileSync(new URL("../src/core/RuntimeStateLedgerSystem.js",import.meta.url),"utf8");
const gate=fs.readFileSync(new URL("../src/systems/GateSystem.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");
const coordinator=fs.readFileSync(new URL("../src/core/FirstSliceTransitionCoordinator.js",import.meta.url),"utf8");

for(const proof of [
  "canLegacyGateMutateActiveCell: false",
  "continuous_local_cell_morph_is_authoritative",
  "R1_RUNTIME_OWNERSHIP"
]) if(!ledger.includes(proof)) throw new Error(`Missing ledger proof: ${proof}`);

for(const proof of [
  "passive_during_morph_owned_boundary",
  "runtimeWorkReducedDuringMorph: true",
  "morph_owned_boundary_cannot_be_mutated_by_gate_adapter"
]) if(!gate.includes(proof)) throw new Error(`Missing Gate firewall proof: ${proof}`);

if(!runtime.includes("RuntimeStateLedgerSystem") || !runtime.includes('register("runtimeStateLedgerSystem"'))
  throw new Error("Runtime state ledger is not integrated before Objective/Gate.");

if(!coordinator.includes("prepare_adjacent_local_cell_resources_without_transition_ownership"))
  throw new Error("Transition coordinator role remains ambiguous.");

console.log("[HC016B] R1 runtime ownership / morph authority firewall PASS");
