import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/fields/SignalPlainEcologySystem.js", import.meta.url), "utf8");

const must = [
  'signal_plain_response_bloom_HC015J',
  'signal_plain_response_spokes_HC015J',
  'responsePresentation',
  'field_bloom',
  'retained_open_state',
  'receptorsSettling: true'
];

for (const token of must) {
  if (!source.includes(token)) throw new Error(`[HC015J] Missing response-feel token: ${token}`);
}

if (!source.includes('if (ready) {') || !source.includes('this.completed = true;')) {
  throw new Error("[HC015J] Existing READY -> completion state machine was not preserved.");
}

if (!source.includes('this.response = Math.min(1, this.response + dt * 0.34)')) {
  throw new Error("[HC015J] Existing response timing changed unexpectedly.");
}

console.log("[HC015J] Signal Plain completed-response presentation proof PASS");
