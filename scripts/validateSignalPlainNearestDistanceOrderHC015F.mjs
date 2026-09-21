import fs from "node:fs";
const source = fs.readFileSync(new URL("../src/fields/SignalPlainEcologySystem.js", import.meta.url), "utf8");
const declaration = source.indexOf("const nearestDistance = nodeDistances[nearestIndex] ?? Infinity;");
const use = source.indexOf("Math.min(nearestDistance, 9.0)");
if (declaration < 0 || use < 0) throw new Error("FAIL: nearestDistance declaration/use missing");
if (declaration > use) throw new Error("FAIL: nearestDistance used before initialization");
console.log("PASS: nearestDistance declared before HC015F perception use");
