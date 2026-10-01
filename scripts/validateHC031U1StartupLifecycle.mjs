import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const json = (p) => JSON.parse(read(p));
const assert = (condition, message) => { if (!condition) throw new Error(`[HC031U1] ${message}`); };

const pkg = json("package.json");
const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const alive = read("src/fields/GatheringGroundAliveSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");

assert(/^0\.31\.(49|50|51|52)$/.test(pkg.version), `U1 lifecycle contract expected U1/U2/U2.1/V lineage, got ${pkg.version}`);
assert(main.includes('buildId: "HC-031U') || main.includes('buildId: "HC-031V"'), "main buildId must remain in the HC031U/V lineage");
assert(telemetry.includes('blob.session.telemetry.v1.'), "telemetry schema declaration missing");

const entityStart = runtime.indexOf("  createEntitySystems() {");
const entityEnd = runtime.indexOf("\n  createOrbiterSystems() {", entityStart);
const archStart = runtime.indexOf("  createFirstSliceArchitecture() {");
const archEnd = runtime.indexOf("\n  createOpeningPacingSystems() {", archStart);
assert(entityStart >= 0 && entityEnd > entityStart, "createEntitySystems block not found");
assert(archStart >= 0 && archEnd > archStart, "createFirstSliceArchitecture block not found");
const entityBlock = runtime.slice(entityStart, entityEnd);
const archBlock = runtime.slice(archStart, archEnd);

assert(!entityBlock.includes("new GatheringGroundAliveSystem"), "GatheringGroundAliveSystem must not construct before Aperture architecture exists");
const apertureIndex = archBlock.indexOf("this.apertureFieldsArrivalSystem = new ApertureFieldsArrivalSystem");
const adjacentIndex = archBlock.indexOf("this.apertureAdjacentTerritorySystem = new ApertureAdjacentTerritorySystem");
const aliveIndex = archBlock.indexOf("this.gatheringGroundAliveSystem = new GatheringGroundAliveSystem");
assert(apertureIndex >= 0, "ApertureFieldsArrivalSystem construction missing");
assert(adjacentIndex > apertureIndex, "Adjacent territory owner must follow ApertureFieldsArrivalSystem");
assert(aliveIndex > adjacentIndex, "GatheringGroundAliveSystem must construct after both Aperture owners");
assert(archBlock.includes("entitySystem: this.entitySystem"), "GatheringGroundAliveSystem must still receive EntitySystem");
assert(archBlock.includes("apertureFieldsArrivalSystem: this.apertureFieldsArrivalSystem"), "GatheringGroundAliveSystem must still receive ApertureFieldsArrivalSystem");

// Constructor stays strict so future lifecycle regressions fail loudly instead of silently degrading ecology.
assert(alive.includes("scene, playerRoot, frameState, entitySystem and apertureFieldsArrivalSystem are required"), "strict dependency assertion was weakened");

// Start order is intentional: entities exist before first-slice architecture; U1 constructs inside the latter.
const startBlockStart = runtime.indexOf("  async start() {");
const startBlockEnd = runtime.indexOf("\n  scheduleDeferredDebugPanels() {", startBlockStart);
const startBlock = runtime.slice(startBlockStart, startBlockEnd);
const createEntitiesCall = startBlock.indexOf("this.createEntitySystems();");
const createArchitectureCall = startBlock.indexOf("this.createFirstSliceArchitecture();");
assert(createEntitiesCall >= 0 && createArchitectureCall > createEntitiesCall, "runtime start order must create EntitySystem before first-slice architecture");

console.log("HC031U1 startup lifecycle validation PASS");
console.log("- EntitySystem exists before first-slice architecture");
console.log("- ApertureFieldsArrivalSystem exists before GatheringGroundAliveSystem construction");
console.log("- strict dependency contract retained; telemetry schema unchanged");
