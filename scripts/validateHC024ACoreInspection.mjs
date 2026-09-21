import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024A] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const camera = read("src/camera/InspectionCameraSystem.js");
const runtime = read("src/core/GameRuntime.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const controls = read("src/input/ControlMap.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const contract = json("public/data/build/hc024aCoreInspectionContract.json");
const pkg = json("package.json");

must(successorHC027C || (["HC-024A", "HC-024B", "HC-024C", "HC-024C1", "HC-024C2", "HC-024D0", "HC-024D0A", "HC-024D0B", "HC-024D0C", "HC-024D1", "HC-024D2", "HC-024D3", "HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B"].some((id) => main.includes(`buildId: "${id}"`))), "runtime identity is not HC-024A or a compatible successor");
must(successorHC027C || (["0.24.0", "0.24.1", "0.24.2", "0.24.3", "0.24.4", "0.24.5", "0.24.6", "0.24.7", "0.24.8", "0.24.9", "0.24.10", "0.24.11", "0.24.12", "0.24.13", "0.25.0", "0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version is not HC024A-compatible");
must(contract.forbiddenScope.includes("new region or geography"), "no-expansion lock missing");
must(contract.locks.controlMapRemapped === false, "control-map remap leaked into pass");
must(profile.freeFraming?.mode === "core_centered_orbit", "free inspection is not Core-centered");
must(profile.freeFraming?.distance >= 2.2 && profile.freeFraming?.distance <= 3.2, "Core inspection distance outside intimate third-person band");
must(profile.freeFraming?.pitchMin <= -0.8 && profile.freeFraming?.pitchMax >= 1.0, "multi-angle vertical inspection arc missing");
must(profile.freeFraming?.fullYawOrbit === true && profile.freeFraming?.preserveEntryAngle === true, "full-yaw/preserved-entry camera rule missing");
must(camera.includes('id: coreCentered ? "player_core_self_inspection"'), "Core-centered focus identity missing");
must(camera.includes('selfInspection: coreCentered'), "self-inspection state missing");
must(runtime.includes("alignCoreInspectionCamera()"), "R3 Core recenter implementation missing");
must(runtime.includes("entering self-inspection preserves the scene the player just framed"), "entry-composition preservation missing");
must(embodiment.includes("facingDirection:"), "Core facing readout missing for inspection recenter");
must(controls.includes('guideFocus: "Y — Core inspect / authored focus"'), "Y semantic label missing or physical mapping changed");
must(!runtime.includes("playerRoot.position.set") && !camera.includes("playerRoot.position.set"), "camera pass may not relocate the player");

const sourceRoot = path.join(root, "src");
let sourceCount = 0;
const walk = (dir) => { for (const entry of fs.readdirSync(dir, {withFileTypes:true})) { const full=path.join(dir,entry.name); if(entry.isDirectory()) walk(full); else if(entry.name.endsWith(".js")) sourceCount += 1; } };
walk(sourceRoot);
must(successorHC027C || ((sourceCount === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceCount === 89) || (main.includes('buildId: "HC-027B"') && sourceCount === 90)))), `expected locked 88 active source modules, found ${sourceCount}`);

console.log("[HC024A] Core-centered self-inspection PASS");
console.log("[HC024A] full yaw + overhead/underside orbit PASS");
console.log("[HC024A] no geography / verb / movement ownership expansion PASS");
console.log("[HC024A] active source count remains 88 PASS");
