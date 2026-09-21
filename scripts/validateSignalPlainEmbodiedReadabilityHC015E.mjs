import fs from "node:fs";
const source = fs.readFileSync(new URL("../src/fields/SignalPlainEcologySystem.js", import.meta.url), "utf8");
const checks = [["route guide",source.includes("signal_plain_world_route_guide_HC015E")],["center beacon",source.includes("signal_plain_receptive_center_beacon_HC015E")],["nearest unread",source.includes("activeUnread")],["3/3 center invite",source.includes("encounterAwake && allObserved && !this.completed")],["node range",source.includes("const nodeRange = 2.75")],["center range",source.includes("const centerRange = 4.8")],["sequence retained",source.includes("const ready = allObserved && insideCenter && this.stabilizeCharge >= 1")]];
for (const [n,ok] of checks){if(!ok)throw new Error(`FAIL: ${n}`); console.log(`PASS: ${n}`)}
console.log("HC-015E Signal Plain embodied readability validation PASS");
