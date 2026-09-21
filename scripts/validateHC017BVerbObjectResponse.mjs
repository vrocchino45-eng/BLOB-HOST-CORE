import fs from "node:fs";
const chem = fs.readFileSync(new URL("../src/chemistry/ChemObjectSystem.js", import.meta.url), "utf8");
const verb = fs.readFileSync(new URL("../src/player/CoreVerbPhysicalizationSystem.js", import.meta.url), "utf8");
const audit = JSON.parse(fs.readFileSync(new URL("../public/data/build/hc017bVerbObjectResponseAudit.json", import.meta.url), "utf8"));
const must = (ok, message) => { if (!ok) throw new Error(message); };

must(chem.includes("chem_response_pivot_"), "presentation pivot missing");
must(chem.includes("registerPulseResponse(item)"), "Pulse object recoil missing");
must(chem.includes("state.absorbYield"), "Absorb yield response missing");
must(chem.includes("state.stabilizeOrder"), "Stabilize ordering response missing");
must(!chem.includes('ring.name = "player_pulse_wave_ring"'), "legacy duplicate Pulse renderer remains");
must(verb.includes("stabilize_target_lattice"), "target-local Stabilize lattice missing");
must(!verb.includes("new THREE.IcosahedronGeometry(0.22, 1)"), "old Stabilize sphere remains");
must(verb.includes("this.stabilizeField.position.copy(target.position)"), "Stabilize not target-local");
must(verb.includes('pass: "HC-017B"'), "HC017B telemetry missing");

for (const key of [
  "gameplayOwnershipChanged","routeTruthChanged","gateTruthChanged","chemistryTruthChanged",
  "pulseRangeChanged","absorbRangeChanged","stabilizeRulesChanged","movementChanged",
  "cameraChanged","coreScaleChanged"
]) must(audit[key] === false, `locked scope violated: ${key}`);

console.log("[HC017B] Pulse object recoil + single visual authority PASS");
console.log("[HC017B] Absorb target yielding PASS");
console.log("[HC017B] Stabilize target-local lattice/ordering PASS");
console.log("[HC017B] gameplay/range/route/camera/Core-scale locks PASS");
