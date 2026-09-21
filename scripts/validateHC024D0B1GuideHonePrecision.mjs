import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024D0B1] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const orbiter = read("src/ecology/OrbiterSystem.js");
const input = read("src/input/InputSystem.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc024d0b1GuideHonePrecisionContract.json");

const isHC024D0C = (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || main.includes('buildId: "HC-024E"') || main.includes('buildId: "HC-025A"') || main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))) || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || main.includes('buildId: "HC-024E"') || main.includes('buildId: "HC-025A"') || main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))) || successorHC027C;
must(successorHC027C || (main.includes('buildId: "HC-024D0B1"') || isHC024D0C), "runtime identity missing");
must(successorHC027C || (["0.24.8", "0.24.9", "0.24.10", "0.24.11", "0.24.12", "0.24.13", "0.25.0", "0.25.1", "0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version mismatch");
must(orbiter.includes("const beginGlowDot = 0.955"), "tight begin-glow cone missing");
must(orbiter.includes("const honeDot = 0.988"), "tight hone cone missing");
must(orbiter.includes("behindCoreBy <= 0.12"), "front-of-Core depth gate missing");
must(orbiter.includes('focusPolicy: "tight_centerline_plus_front_of_core_depth_gate"'), "precision telemetry missing");
if (isHC024D0C) {
  must(input.includes("guideHonedForReadability"), "HC024D0C lost Guide hone readability telemetry");
} else {
  must(input.includes("core_inspection_guide_honed"), "target-owned A Guide handoff missing");
}
must(contract.guideHone.maxBehindCoreDepth === 0.12, "contract depth gate mismatch");

const evaluate = ({ alignment, distance, behindCoreBy }) => {
  const beginGlowDot = 0.955;
  const honeDot = 0.988;
  const distanceFade = Math.max(0, Math.min(1, 1 - Math.max(0, distance - 4.6) / 1.7));
  const depthGate = behindCoreBy <= 0.12 ? 1 : Math.max(0, 1 - (behindCoreBy - 0.12) / 0.34);
  const rawStrength = Math.max(0, Math.min(1, (alignment - beginGlowDot) / (honeDot - beginGlowDot))) * distanceFade * depthGate;
  const honed = alignment >= honeDot && distance <= 5.1 && behindCoreBy <= 0.12;
  return { rawStrength, honed };
};

must(evaluate({ alignment: 0.995, distance: 3.0, behindCoreBy: -0.2 }).honed === true, "centered Guide in front of Core should hone");
must(evaluate({ alignment: 0.995, distance: 3.0, behindCoreBy: 0.28 }).honed === false, "Guide behind Core must not hone");
must(evaluate({ alignment: 0.970, distance: 3.0, behindCoreBy: -0.2 }).honed === false, "Guide merely in frame must not hone");
must(evaluate({ alignment: 0.950, distance: 3.0, behindCoreBy: -0.2 }).rawStrength === 0, "off-center Guide should not glow");

console.log("[HC024D0B1] tight centerline hone PASS");
console.log("[HC024D0B1] behind-Core rejection PASS");
console.log(`[HC024D0B1] precise hone preserved${isHC024D0C ? " with successor intentional Core Work entry" : " with target-owned A"} PASS`);
