import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027D] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const sensorySource = read("src/player/CoreSensoryResponseSystem.js");
const verbVisual = read("src/player/CoreVerbPhysicalizationSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027D.json");
const contract = json("public/data/build/hc027dCoreSensoryPhysiologyContract.json");
const successorHC027D1 = main.includes('buildId: "HC-027D1"');
const successorHC027E = (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));

must(main.includes('buildId: "HC-027D"') || successorHC027D1 || successorHC027E, "runtime identity missing");
must(pkg.version === "0.27.4" || (successorHC027D1 && pkg.version === "0.27.5") || (successorHC027E && ["0.27.6", "0.27.7", "0.27.8", "0.27.9", "0.27.10", "0.27.11", "0.27.12", "0.27.13"].includes(pkg.version)), "package version mismatch");
must(identity.sourceJsCount === 92, "identity source count mismatch");
must(profile.build === "HC-027D" || (successorHC027D1 && profile.build === "HC-027D1") || (successorHC027E && ["HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build mismatch");
must(contract.pulse.gameplayRange === 4.25 && contract.pulse.gameplayRangeChanged === false, "pulse gameplay range lock missing");
must(contract.pulse.hiddenStateRevealEnabled === false && contract.pulse.targetingAuthority === false, "pulse sensory layer gained hidden-state/targeting authority");
must(contract.radialExpression.engineResolutionIndependent === true, "radial sensory expression must remain independent of 3/6/12 engine resolution");
must(contract.locked.movementAuthorityChanged === false && contract.locked.chemistryAuthorityChanged === false && contract.locked.progressionAuthorityChanged === false, "authority lock mismatch");

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".js")) sourceFiles.push(full);
  }
};
walk(path.join(root, "src"));
must(sourceFiles.length === 92, `expected 92 source modules, found ${sourceFiles.length}`);

must(runtime.includes('new CoreSensoryResponseSystem({'), "sensory system not instantiated");
must(runtime.includes("this.coreVerbPhysicalizationSystem.chemObjectSystem = this.chemObjectSystem"), "existing CoreVerbPhysicalization chemistry dependency is not rebound after chemistry construction");
must(runtime.includes('register("coreSensoryResponseSystem"'), "sensory system not registered");
must(runtime.indexOf('register("coreSensoryResponseSystem"') < runtime.indexOf('register("eventAnchoredHostAudioSystem"'), "sensory system must update before audio consumes return events");
must(sensorySource.includes('law: "pulse_is_embodied_sonar_emit_contact_return"'), "sonar law telemetry missing");
must(sensorySource.includes('const maxRange = 4.25'), "existing pulse range not explicitly locked in sensory owner");
must(sensorySource.includes('hiddenStateRevealEnabled: false'), "hidden-state reveal lock missing");
must(verbVisual.includes('pulse_sonar_outgoing_front'), "outgoing sonar front missing");
must(verbVisual.includes("front.root.position.copy(front.origin)"), "outgoing sonar wave must remain centered on its emission origin");
must(verbVisual.includes('pulse_sonar_return_'), "visible return response missing");
must(audio.includes('playPulseEmission'), "pulse emission sound missing");
must(audio.includes('playPulseReturn'), "pulse return sound missing");
must(audio.includes('playAbsorbStart') && audio.includes('playAbsorbFlow') && audio.includes('playAbsorbCapture'), "Absorb process audio incomplete");
must(audio.includes('playStabilizeStart') && audio.includes('playStabilizeConvergence'), "Stabilize convergence audio incomplete");
must(audio.includes('masterGain: 0.68') || ((successorHC027D1 || successorHC027E) && audio.includes('masterGain: 0.82')), "HC027D practical mix lift/successor calibration missing");

const { CoreSensoryResponseSystem } = await import(pathToFileURL(path.join(root, "src/player/CoreSensoryResponseSystem.js")).href);
const distancePosition = (x, y, z) => ({
  x, y, z,
  distanceTo(other) {
    return Math.hypot(this.x - other.x, this.y - other.y, this.z - other.z);
  }
});

function makeFrame(weights) {
  return {
    input: { pulsePressed: true, pulseEventId: 1 },
    pulse: { affectedObjects: ["probe"] },
    corePerformance: { weights, personality: "test", dominantZone: "test" },
    playerKinematics: {
      movementBoundary: {
        normalizedDistance: 0.1,
        radii: { x: 20, y: 20, z: 20 },
        surfaceNormal: { x: 1, y: 0, z: 0 },
        regionId: "test"
      }
    }
  };
}
const playerRoot = { position: distancePosition(0, 0, 0), userData: {} };
const chemObjectSystem = {
  objects: [{
    root: { position: distancePosition(2, 0, 0), visible: true, userData: { absorbed: false } },
    absorbed: false,
    recipe: {
      id: "probe",
      chemistry: { domains: ["signal"], matterState: "resonant" },
      behavior: { onPulse: "answer_with_tuned_wave" }
    }
  }]
};

const deepFrame = makeFrame({ deep: 1, inner: 0, membrane: 0 });
const deep = new CoreSensoryResponseSystem({ frameState: deepFrame, playerRoot, chemObjectSystem });
deep.update(0.016, deepFrame);
const deepEcho = deep.echoes.find((echo) => echo.id === "probe");
must(Math.abs(deepFrame.coreSensoryResponse.waveSpeed - 5.2) < 0.01, "Deep pulse wave speed mismatch");
must(deepEcho && Math.abs(deepEcho.returnAt - (4 / 5.2)) < 0.01, "Deep distance return timing mismatch");

const membraneFrame = makeFrame({ deep: 0, inner: 0, membrane: 1 });
const membrane = new CoreSensoryResponseSystem({ frameState: membraneFrame, playerRoot, chemObjectSystem });
membrane.update(0.016, membraneFrame);
const membraneEcho = membrane.echoes.find((echo) => echo.id === "probe");
must(Math.abs(membraneFrame.coreSensoryResponse.waveSpeed - 8.2) < 0.01, "Membrane pulse wave speed mismatch");
must(membraneEcho.returnAt < deepEcho.returnAt, "Membrane return should arrive sooner than Deep at equal distance");
must(deepFrame.coreSensoryResponse.maxRange === membraneFrame.coreSensoryResponse.maxRange && deepFrame.coreSensoryResponse.maxRange === 4.25, "radial expression changed pulse range");

// Event-cycle proof: contact occurs before return and both are published as transient same-frame events.
const eventFrame = makeFrame({ deep: 0, inner: 1, membrane: 0 });
const eventSystem = new CoreSensoryResponseSystem({ frameState: eventFrame, playerRoot, chemObjectSystem });
eventSystem.update(0.016, eventFrame);
eventFrame.input.pulsePressed = false;
let contactSeen = false;
let returnSeen = false;
for (let i = 0; i < 24; i += 1) {
  eventSystem.update(0.08, eventFrame);
  if ((eventFrame.coreSensoryResponse.newContacts ?? []).some((entry) => entry.id === "probe")) contactSeen = true;
  if ((eventFrame.coreSensoryResponse.newReturns ?? []).some((entry) => entry.id === "probe")) {
    must(contactSeen, "Pulse return published before contact");
    returnSeen = true;
    break;
  }
}
must(contactSeen && returnSeen, "emit/contact/return event cycle did not complete");

console.log("PASS HC027D Core Sensory / Physiological Expression");
console.log(`  modules: ${sourceFiles.length}`);
console.log(`  pulse range: ${deepFrame.coreSensoryResponse.maxRange}`);
console.log(`  deep wave speed: ${deepFrame.coreSensoryResponse.waveSpeed}`);
console.log(`  membrane wave speed: ${membraneFrame.coreSensoryResponse.waveSpeed}`);
console.log(`  deep 2u return: ${deepEcho.returnAt.toFixed(3)}s`);
console.log(`  membrane 2u return: ${membraneEcho.returnAt.toFixed(3)}s`);
