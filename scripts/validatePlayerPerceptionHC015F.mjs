import fs from "node:fs";
const ecology = fs.readFileSync(new URL("../src/fields/SignalPlainEcologySystem.js", import.meta.url), "utf8");
const arrival = fs.readFileSync(new URL("../src/fields/ApertureFieldsArrivalSystem.js", import.meta.url), "utf8");
const prompt = fs.readFileSync(new URL("../src/guide/GuidePromptSystem.js", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
const manifest = JSON.parse(fs.readFileSync(new URL("../public/data/build/buildManifest.json", import.meta.url), "utf8"));
const checks = [
  ["HC015F identity", main.includes('buildId: "HC-015F"') && manifest.id === "HC-015F"],
  ["explicit perception hierarchy", ecology.includes("perceptionHierarchy") && ecology.includes("world_first_text_secondary")],
  ["active receptor dominates", ecology.includes("1.22 + actionProximity * 0.34") && ecology.includes("nearestUnread ? 0.98")],
  ["passive receptors suppressed", ecology.includes("nearestUnread ? 0.98 : 0.40")],
  ["route graphics subordinate", ecology.includes("activeUnread ? 0.28")],
  ["presentation tissue suppressed in pocket", arrival.includes("ambientOnly ? 0.025 : 0.075")],
  ["guide sightline subordinate", arrival.includes("? 0.055 : 0.008")],
  ["guide text reduced", prompt.includes('"Signal Plain is listening."') && prompt.includes('"Read the active receptor."')],
  ["state machine retained", ecology.includes("const ready = allObserved && insideCenter && this.stabilizeCharge >= 1") && ecology.includes("this.completed = true")]
];
for (const [name, ok] of checks) { if (!ok) throw new Error(`FAIL: ${name}`); console.log(`PASS: ${name}`); }
console.log("HC-015F player perception validation PASS");
