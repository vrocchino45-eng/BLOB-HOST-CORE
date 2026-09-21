import fs from "node:fs";
const authority=fs.readFileSync(new URL("../src/core/HostCoreSourceAuthority.js",import.meta.url),"utf8");
const report=fs.readFileSync(new URL("../HC016A_REBUILD_ARCHITECTURE_REBASELINE.md",import.meta.url),"utf8");
const ledger=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc016aMigrationLedger.json",import.meta.url),"utf8"));
for(const proof of [
 "BLOB_HOST_CORE_REBUILD_BLUEPRINT_v0_1",
 "no_gates_or_hard_region_transitions",
 "R0_REBUILD_ARCHITECTURE_REBASELINE"
]) if(!authority.includes(proof)) throw new Error(`Missing locked authority proof: ${proof}`);
if(ledger.gameplayChanges !== false) throw new Error("HC016A must remain audit-only.");
for(const section of ["## KEEP","## MIGRATE","## RETIRE / DISABLE TARGETS","## UNKNOWN / REQUIRES R1 TRACE","## R1 dependency order"])
 if(!report.includes(section)) throw new Error(`Missing audit section ${section}`);
console.log("[HC016A] R0 rebuild architecture rebaseline PASS");
