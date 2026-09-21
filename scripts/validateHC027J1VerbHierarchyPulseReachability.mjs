import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027J1] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const input = read("src/input/InputSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const physical = read("src/player/CoreVerbPhysicalizationSystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const composition = read("src/presentation/InteractionCompositionSystem.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const radial = read("src/player/CoreRadialPerformanceSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027J1.json");
const contract = json("public/data/build/hc027j1VerbHierarchyPulseReachabilityContract.json");

must(main.includes('buildId: "HC-027J1"'), "runtime identity missing");
must(main.includes('buildLabel: "Verb Hierarchy / Pulse Reachability"'), "runtime label missing");
must(pkg.version === "0.27.13", "package version mismatch");
must(identity.id === "HC-027J1" && identity.parent === "HC-027J", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.law === "verb_commitment_must_read_through_core_world_and_recovery_while_sonar_distinguishes_actionable_local_from_deep_structural_information", "J1 law mismatch");

for (const token of [
  'this.pulseChargeThresholdSeconds = 0.34',
  'this.pulseFullChargeSeconds = 1.28',
  'pulseHeld: false',
  'pulseCharge01: 0',
  'pulseReleaseCharge01: 0',
  'pulseReleaseKind: "none"',
  'const rawPulsePressed = pulseReleased',
  'const pulseReleaseKind = pulseReleased',
  '? (releasedHoldSeconds >= this.pulseChargeThresholdSeconds ? "charged" : "quick")',
  'pulseEventId: this.pulseSequence'
]) must(input.includes(token), `Pulse hold/release input contract missing: ${token}`);

for (const token of [
  'const localActionableRange = 4.25',
  '? localActionableRange + 2.35 + charge01 * 3.15',
  'reachClass: distance <= localActionableRange + 0.01 ? "local_actionable" : "deep_structural"',
  'chargedStructuralReachIsPresentationOnly: true',
  'this.sensorySaturationSeconds = Math.max(this.sensorySaturationSeconds, 0.72 + charge01 * 0.88)',
  'deepAnswersCreateWaypoint: false',
  'expressionPass: "HC-027J1"'
]) must(sensory.includes(token), `local/deep sonar contract missing: ${token}`);

for (const token of [
  'this.pulseChargeShell = this.makePulseChargeShell()',
  'this.pulseChargeShell.scale.setScalar(1.08 - charge01 * 0.28)',
  'const deep = contact.reachClass === "deep_structural"',
  'this.absorbCommitment',
  'stabilize_target_lattice'
]) must(physical.includes(token), `verb physicalization exaggeration missing: ${token}`);

for (const token of [
  'animateVerbCommitment(dt, frameState)',
  'this.lastPulseVisualReleaseKind = "quick"',
  'this.bodyFrame?.scale.multiplyScalar(compression)',
  'this.nucleus.scale.multiplyScalar(1 + pulseCharge01 * 0.34)',
  'const visualReleaseKind = this.lastPulseVisualReleaseKind',
  'visualReleaseKind === "charged" ? 4.8 + visualReleaseCharge * 1.35 : 2.6',
  'this.absorbVisualCommitment',
  'this.stabilizeVisualCommitment',
  'hierarchyLaw: "prepare_action_host_answer_recovery_one_primary_read_at_a_time"'
]) must(embodiment.includes(token), `Core commitment silhouette missing: ${token}`);

for (const token of [
  'pass: "HC-027J1"',
  'const pulseTraveling = Boolean(sensory.active && !input.pulseHeld)',
  'law: "one_primary_one_or_two_secondary_everything_else_yields"',
  '? "core_charge"',
  '? "pulse_release"',
  '? "pulse_wave"',
  'guideMustYield: pulseCharging || pulseTraveling || absorbActive || stabilizeActive',
  'unrelatedEffectsMustYield: pulseCharging || pulseTraveling || sensoryRecovery > 0.15'
]) must(composition.includes(token), `visual hierarchy handoff missing: ${token}`);

for (const token of [
  'answerReachClass',
  'structuralOnly: Boolean(nearestAnswerMemory?.structuralOnly)',
  'structuralPresence: Number(answerStructuralPresence.toFixed(2))'
]) must(ambient.includes(token), `Host reachability response missing: ${token}`);

for (const token of [
  'playPulseCharge(frameState, pulseCharge01)',
  'const charged = frameState.input?.pulseReleaseKind === "charged"',
  'const deep = echo?.reachClass === "deep_structural"',
  'masterGain: 0.82', 'core: 1.85', 'verbs: 2.15', 'world: 1.95',
  'ambience: 1.35', 'event: 1.40', 'pannerRefDistance: 4.2', 'pannerRolloff: 0.42',
  'compressorThresholdDb: -4', 'compressorKneeDb: 3', 'compressorRatio: 8',
  'compressorAttackSeconds: 0.003', 'compressorReleaseSeconds: 0.16'
]) must(audio.includes(token), `audio expression/reference lock missing: ${token}`);

// J1 does not rebalance the locked HC027C radial law or 3→6→12 engine architecture.
must(radial.includes('pass: "HC-027C"'), "radial performance lineage drifted");
must(radial.includes('normalMovementMultiplier: 1'), "normal movement physiology lock drifted");
must(engine.includes('const ARCHITECTURE_ORDER = [3, 6, 12]'), "triadic engine grammar drifted");
must(engine.includes('nonTriadicArchitectureEnabled: false'), "non-triadic geometry accidentally enabled");

must(profile.build === "HC-027J1", "inspection profile build mismatch");
must(profile.status === "runtime_active_core_inspection_plus_verb_hierarchy_pulse_reachability", "inspection profile status mismatch");
must(profile.framing?.verbHierarchyPass === "HC-027J1", "profile hierarchy pass missing");
must(profile.framing?.pulseQuickLocalActionableRange === 4.25, "profile local Pulse range mismatch");
must(profile.framing?.pulseChargedStructuralPresentationRangeMax === 9.75, "profile structural Pulse max mismatch");
must(profile.framing?.pulseChargedStructuralReachChangesGameplayRange === false, "profile incorrectly changes gameplay range");
must(profile.behavior?.chargedPulseCreatesWaypoint === false, "charged Pulse incorrectly creates waypoint");
must(profile.behavior?.hc027j1ChangesRadialPerformanceLaw === false, "J1 incorrectly rebalances radial physiology");
must(profile.behavior?.hc027j1CreatesNextQuestion === false, "J1 incorrectly owns HC027K next-question chaining");

must(contract.pulse.quick.localActionableRange === 4.25, "contract quick range mismatch");
must(contract.pulse.charged.maxPresentationStructuralRange === 9.75, "contract charged structural max mismatch");
must(contract.pulse.authority.chemistryRangeChanged === false, "contract changes chemistry range");
must(contract.pulse.authority.createsWaypoint === false, "contract creates waypoint");

const forbiddenWaypointTokens = ["sonarWaypoint", "pulseWaypoint", "chargedPulseRouteLine", "deepReturnArrow"];
for (const token of forbiddenWaypointTokens) {
  must(!sensory.includes(token) && !ambient.includes(token) && !composition.includes(token), `waypoint/route shortcut leaked: ${token}`);
}

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

console.log("PASS HC027J1 Verb Hierarchy / Pulse Reachability");
console.log("  quick Pulse: 4.25 local/actionable range");
console.log("  charged Pulse: hold/release + presentation-only structural reach up to 9.75");
console.log("  local returns tight/attached; deep returns broad/ghosted; no waypoint");
console.log("  Core -> action/travel -> Host answer -> recovery hierarchy");
console.log("  Absorb intake + Stabilize coherence visually exaggerated");
console.log("  HC027D1 mix + HC027C radial law + 3→6→12 remain locked");
