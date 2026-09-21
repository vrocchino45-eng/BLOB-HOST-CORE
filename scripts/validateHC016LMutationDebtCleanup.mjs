import fs from "node:fs";
import path from "node:path";
const root=path.resolve(new URL("..",import.meta.url).pathname);

const dead=[
 "src/morph/ThirdLocalCellMorphSystem.js",
 "src/morph/GraveRouteMorphSystem.js",
 "src/morph/SignalChorusReturnStateSystem.js",
 "src/morph/GraveSeamContinuityMicroExitSystem.js",
 "src/morph/BloomResidueArrivalSystem.js",
 "src/morph/SignalChorusArrivalSystem.js",
 "src/morph/GraveScarMemorySeamArrivalSystem.js",
 "src/morph/GraveReturnContinuitySystem.js"
];
for(const rel of dead) if(fs.existsSync(path.join(root,rel))) throw new Error(`Dead source still exists: ${rel}`);

const focus=fs.readFileSync(path.join(root,"src/targeting/TargetFocusRegistry.js"),"utf8");
for(const stale of ["SignalChorusReturnStateSystem","graveReturnContinuity","signalChorusReturnState"])
  if(focus.includes(stale)) throw new Error(`Dead return-state target branch remains: ${stale}`);

const scar=fs.readFileSync(path.join(root,"src/morph/ScarFlowArrivalSystem.js"),"utf8");
if(scar.includes("frameState.activeCellId = this.cellId"))
  throw new Error("ScarFlowArrivalSystem still owns activeCellId.");

const audit=JSON.parse(fs.readFileSync(path.join(root,"public/data/build/hc016lMutationDebtAudit.json"),"utf8"));
if(audit.referenceFailures.length) throw new Error(`Deleted source references remain: ${audit.referenceFailures.length}`);
if(audit.unclassifiedMutationSites.length) throw new Error(`Unclassified active-cell writers remain: ${audit.unclassifiedMutationSites.length}`);

console.log(`[HC016L] dead legacy mutation files deleted: ${audit.deletedTotals.files}`);
console.log(`[HC016L] dead legacy source bytes deleted: ${audit.deletedTotals.bytes}`);
console.log(`[HC016L] remaining activeCell writers: ${audit.remainingMutationSites.length}`);
console.log("[HC016L] unclassified activeCell writers: 0 PASS");
