import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readdirSync, statSync } from "node:fs";

const ROOT = new URL("../src", import.meta.url).pathname;
const ALLOWED_EXTERNAL_THIS_CALLS = new Set([
  "loadRecipeData"
]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...walk(path));
    else if (path.endsWith(".js")) out.push(path);
  }
  return out;
}

let failures = 0;
for (const path of walk(ROOT)) {
  const source = readFileSync(path, "utf8");
  const methods = new Set();
  const methodRegex = /^\s{2}(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(/gm;
  for (const match of source.matchAll(methodRegex)) methods.add(match[1]);

  const calls = new Set();
  const callRegex = /this\.([A-Za-z_$][\w$]*)\s*\(/g;
  for (const match of source.matchAll(callRegex)) calls.add(match[1]);

  const missing = [...calls]
    .filter((name) => !methods.has(name))
    .filter((name) => !ALLOWED_EXTERNAL_THIS_CALLS.has(name))
    .sort();

  if (missing.length > 0) {
    failures += 1;
    console.error(`Undefined this.method() calls in ${path.replace(`${ROOT}/`, "src/")}:`);
    for (const name of missing) console.error(`  - this.${name}()`);
  }
}

if (failures > 0) process.exit(1);
console.log("Undefined this.method() audit passed.");
