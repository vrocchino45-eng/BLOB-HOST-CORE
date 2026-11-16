import * as THREE from "three";
import { CoreWorkReadability } from "../visual/CoreWorkReadability.js";
import { canBeginAuthoredSurfaceBrush } from "./CoreAuthoredContactBootstrap.js";

const FORWARD_AXIS = new THREE.Vector3(0, 0, -1);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const CORE_VISUAL_SCALE = 0.52; // HC016X: micro-scale normalization; interaction reach remains world-space.

/**
 * Owns the Seed Core's body language.
 *
 * PlayerMovementController owns translation and collision. This system reads
 * those kinematics and turns them into one coherent physical body: orientation,
 * fluid deformation, fin response, pressure compression, and a short wake.
 * It never changes player position, progression, chemistry, targeting, or gates.
 */
export class CoreEmbodimentSystem {
  constructor({ scene, playerRoot, frameState }) {
    if (!scene) throw new Error("[CoreEmbodimentSystem] scene is required.");
    if (!playerRoot) throw new Error("[CoreEmbodimentSystem] playerRoot is required.");
    if (!frameState) throw new Error("[CoreEmbodimentSystem] frameState is required.");

    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.bodyFrame = null;
    this.outerShell = null;
    this.innerMantle = null;
    this.nucleus = null;
    this.directionalProw = null;
    this.rearLobe = null;
    this.pulseWave = null;
    this.fins = [];
    this.veils = [];
    this.travelTendrils = [];
    this.growthPetals = [];
    this.growthPlates = [];
    this.growthNodes = [];
    this.memoryPearls = [];
    this.memoryLigament = null;
    this.memoryImprintRoot = null;
    this.vascularFilamentRoot = null;
    this.vascularFilaments = [];
    this.vascularFilamentCurves = [];
    this.vascularCadenceNodes = [];
    this.vascularReturnCharge = null;
    this.siltAdaptationRoot = null;
    this.siltBracePlates = [];
    this.siltPorousNode = null;
    this.siltResidueNodes = [];
    this.wakeRoot = null;
    this.wakeMotes = [];

    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.previousVelocity = new THREE.Vector3();
    this.direction = new THREE.Vector3(0, 0, -1);
    this.targetDirection = new THREE.Vector3(0, 0, -1);
    this.flow = new THREE.Vector3();
    this.slip = new THREE.Vector3();
    this.side = new THREE.Vector3(1, 0, 0);
    this.up = new THREE.Vector3(0, 1, 0);
    this.targetQuaternion = new THREE.Quaternion();
    this.bankQuaternion = new THREE.Quaternion();
    this.worldPosition = new THREE.Vector3();
    this.wakeTarget = new THREE.Vector3();
    this.seedShellColor = new THREE.Color(0xa9efff);
    this.balancedGrowthColor = new THREE.Color(0xb8e9e2);
    this.careGrowthColor = new THREE.Color(0x8ff0c5);
    this.scarGrowthColor = new THREE.Color(0xe89268);
    this.growthNucleusColor = new THREE.Color(0xffe2a4);
    this.memoryPearlColor = new THREE.Color(0xb9a0bd);
    this.memoryPearlEmissive = new THREE.Color(0x795970);
    this.vascularSignalColor = new THREE.Color(0x78e3ff);
    this.vascularReturnColor = new THREE.Color(0xffc96d);
    this.vascularDeepColor = new THREE.Color(0x466ff6);
    this.siltColor = new THREE.Color(0x57442f);
    this.siltDeepColor = new THREE.Color(0x251d1b);
    this.siltPorousColor = new THREE.Color(0xd29b6b);
    this.siltReturnColor = new THREE.Color(0xc99d55);
    this.growthColor = new THREE.Color();
    this.tendrilP0 = new THREE.Vector3();
    this.tendrilP1 = new THREE.Vector3();
    this.tendrilP2 = new THREE.Vector3();
    this.tendrilP3 = new THREE.Vector3();
    this.tendrilDelta = new THREE.Vector3();
    this.tendrilDirection = new THREE.Vector3();

    this.bank = 0;
    this.pulseAge = 1;
    this.pulseWasActive = false;
    this.pulseReleaseAge = 99;
    this.lastPulseVisualReleaseKind = "quick";
    this.lastPulseVisualReleaseCharge01 = 0;
    this.absorbVisualCommitment = 0;
    this.stabilizeVisualCommitment = 0;
    this.memoryImprintReveal = 0;
    this.vascularFilamentReveal = 0;
    this.siltAdaptationReveal = 0;
    this.mantleReveal = 0;
    this.locomotorReveal = 0;
    this.hubOrganizationReveal = 0;
    this.coreWorkReveal = 0;

    // HC024C physical manipulation foundation. These values describe only the
    // placement of existing visible connection nodes. They do not mutate
    // chemistry, progression, collision, or authored growth ownership.
    this.coreWorkSelectedPieceId = "none";
    this.coreWorkSelectedIndex = 0;
    this.coreWorkPieceHeld = false;
    this.coreWorkGrabCount = 0;
    this.coreWorkPlacementCount = 0;
    this.coreWorkLastEvent = "core_work_piece_manipulation_waiting";
    this.coreWorkLastHandledEventId = -1;
    this.coreWorkTemp = new THREE.Vector3();
    this.coreWorkDelta = new THREE.Vector3();
    this.coreWorkRight = new THREE.Vector3();
    this.coreWorkUp = new THREE.Vector3();
    this.coreWorkForward = new THREE.Vector3();
    this.coreWorkWorldPosition = new THREE.Vector3();
    this.coreWorkBodyQuaternion = new THREE.Quaternion();
    this.coreWorkInverseQuaternion = new THREE.Quaternion();
    this.coreWorkHighlightColor = new THREE.Color(0xfff1aa);
    this.coreWorkMinimumRadius = 0.22;
    this.coreWorkMaximumRadius = 1.22;
    this.coreWorkDepthSpeed = 0.8;

    // HC024D1 spatial chemistry. Chemistry is authored by where recognizable
    // retained anatomy lives in the Core body, not by a recipe/inventory UI.
    // Deep Core, Inner Body, and Membrane are the only placement zones.
    this.coreChemistryDeepTint = new THREE.Color(0x8d91bd);
    this.coreChemistryInnerTint = new THREE.Color(0xa7e9e0);
    this.coreChemistryMembraneTint = new THREE.Color(0xf2d49a);
    this.coreChemistryLastTopologyId = "forming";
    this.coreChemistryTopologyChangeCount = 0;

    // HC024D2 whole-Core topology readability. The chemistry rules already
    // resolve in HC024D1; these smoothed weights let the existing body layers
    // visibly settle into Deep / Inner / Membrane emphasis without snapping.
    this.coreChemistryVisualDeepWeight = 0;
    this.coreChemistryVisualInnerWeight = 0;
    this.coreChemistryVisualMembraneWeight = 0;
    this.coreChemistryVisualBalanceWeight = 0;

    // HC024D3 continuous 3D chemistry-cloud telemetry + recognition pops.
    // The three retained anatomies remain freely positioned; these values only
    // recognize meaningful geometric relationships and confirm them visually.
    this.coreChemistryTelemetryPoints = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    this.coreChemistryTelemetryCentroid = new THREE.Vector3();
    this.coreChemistryTelemetryEdgeA = new THREE.Vector3();
    this.coreChemistryTelemetryEdgeB = new THREE.Vector3();
    this.coreChemistryTelemetryCross = new THREE.Vector3();
    this.coreChemistryPatternCandidateId = "none";
    this.coreChemistryPatternCandidateAge = 0;
    this.coreChemistryActivePatternId = "none";
    this.coreChemistryPatternPopId = "none";
    this.coreChemistryPatternPopAge = 99;
    this.coreChemistryPatternPopDuration = 0.72;
    this.coreChemistryPatternPopCount = 0;
    this.coreChemistryPatternTint = new THREE.Color(0xffe7a6);

    // HC024E generic chemistry-output bridge. The Core publishes continuous,
    // region-agnostic output; world systems may read it without owning Core chemistry.
    this.coreChemistryOutputLocalDirection = new THREE.Vector3(0, 0, -1);
    this.coreChemistryOutputWorldDirection = new THREE.Vector3(0, 0, -1);
    this.coreChemistryOutputWorldQuaternion = new THREE.Quaternion();
    // HC025B keeps the exact Silt-bearing side available to movement without
    // making PlayerMovementController own Core anatomy or chemistry placement.
    this.coreChemistrySiltLocalDirection = new THREE.Vector3(0, 0, -1);
    this.coreChemistrySiltWorldDirection = new THREE.Vector3(0, 0, -1);

    // HC025B preserves HC025A contact language, while PlayerMovementController now
    // owns the contained Silt-membrane attachment proof on the same trusted boundary.
    // This state machine remains the presentation/readability owner.
    this.coreContactState = "suspended";
    this.coreContactPreviousState = "suspended";
    this.coreContactStateAge = 0;
    this.coreContactReleaseAge = 99;
    this.coreContactSuspendedWeight = 1;
    this.coreContactBrushWeight = 0;
    this.coreContactAttachWeight = 0;
    this.coreContactReleaseWeight = 0;
    this.coreContactWorldNormal = new THREE.Vector3(0, 1, 0);
    this.coreTendrilPullWorld = new THREE.Vector3();
    this.coreTendrilPullLocal = new THREE.Vector3();
    this.coreContactLocalNormal = new THREE.Vector3(0, 1, 0);
    this.coreContactNormalAbs = new THREE.Vector3(0, 1, 0);
    this.coreContactWorldQuaternion = new THREE.Quaternion();
    this.coreContactInverseQuaternion = new THREE.Quaternion();
    this.coreContactTint = new THREE.Color(0xc9f2dc);
    this.coreContactReleaseTint = new THREE.Color(0xb5d8ff);

    // HC027B: visualization only. CoreEngineSystem owns phase sequencing/RPM;
    // embodiment renders that physiology inside the already-authored Core body.
    this.coreEnginePhaseRoot = null;
    this.coreEnginePhaseNodes = [];
    this.coreEngineGyroRings = [];
    this.coreEngineVerbConduits = [];
    this.coreEngineVerbTransitNodes = [];
    this.coreEnginePreviousVisualPhaseCount = 0;
    this.coreEngineArchitectureChangeAge = 99;
    this.coreEnginePulseColor = new THREE.Color(0x86e8ff);
    this.coreEngineAbsorbColor = new THREE.Color(0xc8a7d9);
    this.coreEngineStabilizeColor = new THREE.Color(0xe5c579);
  }

  init() {
    this.bodyFrame = this.playerRoot.getObjectByName("player_seed_body_frame");
    this.outerShell = this.playerRoot.getObjectByName("soft_membrane_shell");
    this.innerMantle = this.playerRoot.getObjectByName("seed_core_inner_mantle");
    this.nucleus = this.playerRoot.getObjectByName("inner_seed_light");
    this.directionalProw = this.playerRoot.getObjectByName("player_seed_directional_prow");
    this.rearLobe = this.playerRoot.getObjectByName("player_seed_rear_lobe");
    this.pulseWave = this.playerRoot.getObjectByName("core_pulse_wave");
    this.collectParts();
    this.createWake();
    this.createMemoryImprint();
    this.createVascularReturnFilament();
    this.createSiltPressureAdaptation();
    this.createCoreEngineVisual();

    if (!this.bodyFrame || !this.outerShell || !this.nucleus) {
      throw new Error("[CoreEmbodimentSystem] authored Seed Core proxy body is incomplete.");
    }

    this.workReadability = new CoreWorkReadability(this);
    this.frameState.coreEmbodiment = this.createState(false);
  }

  update(dt, frameState = this.frameState) {
    this.workReadability?.restore();
    if (!this.bodyFrame) return;

    const kinematics = frameState.playerKinematics ?? {};
    const velocity = kinematics.velocity ?? {};
    const flowVector = kinematics.flowVector ?? {};
    this.velocity.set(velocity.x ?? 0, velocity.y ?? 0, velocity.z ?? 0);
    this.flow.set(flowVector.x ?? 0, flowVector.y ?? 0, flowVector.z ?? 0);

    const safeDt = Math.max(dt, 1 / 240);
    this.acceleration.copy(this.velocity).sub(this.previousVelocity).multiplyScalar(1 / safeDt);
    this.previousVelocity.copy(this.velocity);

    const speed = this.velocity.length();
    const pressure = THREE.MathUtils.clamp(kinematics.pressure ?? 0, 0, 1);
    const viscosity = THREE.MathUtils.clamp(kinematics.viscosity ?? 0, 0, 1);
    const boundaryPressure = THREE.MathUtils.clamp(kinematics.boundaryPressure ?? 0, 0, 1);
    const boost = Boolean(frameState.input?.boostHeld);
    const quickTestRetention = Boolean(frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded);
    const memoryImprintTarget = (frameState.coreGrowth?.graveMemoryImprintCommitted || quickTestRetention) ? 1 : 0;
    this.memoryImprintReveal += (
      memoryImprintTarget - this.memoryImprintReveal
    ) * (1 - Math.exp(-dt * 3.6));
    const vascularFilamentTarget = (frameState.coreGrowth?.vascularRhythmRetained || quickTestRetention) ? 1 : 0;
    this.vascularFilamentReveal += (
      vascularFilamentTarget - this.vascularFilamentReveal
    ) * (1 - Math.exp(-dt * 3.2));
    const siltAdaptationTarget = (frameState.coreGrowth?.siltPressureRetained || quickTestRetention) ? 1 : 0;
    this.siltAdaptationReveal += (
      siltAdaptationTarget - this.siltAdaptationReveal
    ) * (1 - Math.exp(-dt * 3.0));

    // HC021C anatomical chronology. Gameplay radius/collision are untouched:
    // the Core begins as membrane + nucleus, then earns visible organization.
    const mantleTarget = frameState.coreGrowth?.nurseryAgencyProven ? 1 : 0;
    const locomotorTarget = frameState.coreGrowth?.guidePressureTested ? 1 : 0;
    const hubTarget = frameState.coreGrowth?.hubReflectionObserved ? 1 : 0;
    this.mantleReveal += (mantleTarget - this.mantleReveal) * (1 - Math.exp(-dt * 2.2));
    this.locomotorReveal += (locomotorTarget - this.locomotorReveal) * (1 - Math.exp(-dt * 1.8));
    this.hubOrganizationReveal += (hubTarget - this.hubOrganizationReveal) * (1 - Math.exp(-dt * 1.55));

    // HC024B visual-only cutaway cue. Core Work does not mutate chemistry or
    // body ownership; it simply makes existing internal anatomy more readable.
    const coreWorkTarget = frameState.inspectionCamera?.coreWorkActive ? 1 : 0;
    this.coreWorkReveal += (coreWorkTarget - this.coreWorkReveal) * (1 - Math.exp(-dt * 5.4));

    if (speed > 0.055) {
      this.targetDirection.copy(this.velocity).normalize();
      const directionBlend = 1 - Math.exp(-dt * (3.4 + Math.min(speed, 3.5) * 1.4));
      this.direction.lerp(this.targetDirection, directionBlend).normalize();
    }

    this.orientBody(dt, speed);
    const slipStrength = this.deformBody(
      frameState.runtimeSeconds ?? 0,
      dt,
      speed,
      pressure,
      viscosity,
      boundaryPressure,
      boost
    );
    this.animateWake(frameState.runtimeSeconds ?? 0, dt, speed, slipStrength, boost);
    this.updateCoreEngineVisual(dt, frameState);
    this.animateVerbCommitment(dt, frameState);

    const growthStage = frameState.coreGrowth?.stageId ?? "seed_core";
    this.playerRoot.userData.playerIdentityMode = growthStage === "seed_core"
      ? "authored_seed_body"
      : "authored_binding_core_body";
    this.playerRoot.userData.bodyLanguageOwner = "CoreEmbodimentSystem";
    this.playerRoot.userData.objectDefiningRings = false;
    this.playerRoot.userData.transientAbilityEffectsOnly = true;

    frameState.coreEmbodiment = this.createState(true, {
      speed,
      pressure,
      viscosity,
      boundaryPressure,
      slipStrength,
      boost
    });
  }

  createCoreEngineVisual() {
    if (!this.bodyFrame || this.coreEnginePhaseRoot) return;

    this.coreEnginePhaseRoot = new THREE.Group();
    this.coreEnginePhaseRoot.name = "core_engine_triadic_phase_root";
    this.coreEnginePhaseRoot.userData.owner = "CoreEmbodimentSystem";
    this.coreEnginePhaseRoot.userData.sequenceOwner = "CoreEngineSystem";
    this.coreEnginePhaseRoot.userData.visualGrammar = "spherical_triadic_gyroscope_3_6_12";
    this.coreEnginePhaseRoot.userData.hasFixedTopBottom = false;
    this.bodyFrame.add(this.coreEnginePhaseRoot);

    // HC028C2: three orthogonal great-circle planes are the Core's internal
    // gyroscopic frame. They are not object-defining UI rings: the firing nodes
    // move on them and the whole assembly precesses in 3D, so no plane owns a
    // permanent top/bottom. Pulse / Absorb / Stabilize each own one plane.
    const colors = [this.coreEnginePulseColor, this.coreEngineAbsorbColor, this.coreEngineStabilizeColor];
    const gyroRadius = 0.37;
    const segments = 72;
    for (let functionIndex = 0; functionIndex < 3; functionIndex += 1) {
      const positions = new Float32Array(segments * 3);
      for (let index = 0; index < segments; index += 1) {
        const angle = index * Math.PI * 2 / segments;
        const c = Math.cos(angle) * gyroRadius;
        const q = Math.sin(angle) * gyroRadius;
        const offset = index * 3;
        if (functionIndex === 0) {
          positions[offset] = c;
          positions[offset + 1] = q;
          positions[offset + 2] = 0;
        } else if (functionIndex === 1) {
          positions[offset] = 0;
          positions[offset + 1] = c;
          positions[offset + 2] = q;
        } else {
          positions[offset] = c;
          positions[offset + 1] = 0;
          positions[offset + 2] = q;
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({
        color: colors[functionIndex],
        transparent: true,
        opacity: 0.22,
        depthWrite: false
      });
      const ring = new THREE.LineLoop(geometry, material);
      ring.name = `core_engine_gyro_plane_${["pulse", "absorb", "stabilize"][functionIndex]}`;
      ring.userData.owner = "CoreEmbodimentSystem";
      ring.userData.function = ["pulse", "absorb", "stabilize"][functionIndex];
      ring.userData.gyroscopicPlane = true;
      this.coreEnginePhaseRoot.add(ring);
      this.coreEngineGyroRings.push(ring);
    }

    // Capacity remains twelve because CoreEngineSystem still owns exactly the
    // 3 -> 6 -> 12 law. Spatial meaning changes: 3 = one firing marker per
    // function plane; 6 = opposed pairs; 12 = four positions per plane.
    const geometry = new THREE.SphereGeometry(0.062, 10, 8);
    for (let phaseIndex = 0; phaseIndex < 12; phaseIndex += 1) {
      const functionIndex = phaseIndex % 3;
      const subPhase = Math.floor(phaseIndex / 3);
      const material = new THREE.MeshBasicMaterial({
        color: colors[functionIndex],
        transparent: true,
        opacity: 0.16,
        depthWrite: false
      });
      const node = new THREE.Mesh(geometry, material);
      node.name = `core_engine_phase_${phaseIndex + 1}`;
      node.position.set(0, 0, 0);
      node.userData.phaseIndex = phaseIndex;
      node.userData.functionIndex = functionIndex;
      node.userData.function = ["pulse", "absorb", "stabilize"][functionIndex];
      node.userData.ordinal = subPhase + 1;
      this.coreEnginePhaseRoot.add(node);
      this.coreEnginePhaseNodes.push(node);
    }

    // HC028D1: transient internal conduits make verb intent travel through the
    // same three gyroscopic function planes instead of appearing as unrelated
    // external effects. They are invisible at idle and carry no gameplay state.
    const transitGeometry = new THREE.SphereGeometry(0.034, 8, 6);
    for (let functionIndex = 0; functionIndex < 3; functionIndex += 1) {
      const conduitGeometry = new THREE.BufferGeometry();
      conduitGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const conduitMaterial = new THREE.LineBasicMaterial({
        color: colors[functionIndex],
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const conduit = new THREE.Line(conduitGeometry, conduitMaterial);
      conduit.name = `core_engine_verb_conduit_${["pulse", "absorb", "stabilize"][functionIndex]}`;
      conduit.userData.owner = "CoreEmbodimentSystem";
      conduit.userData.function = ["pulse", "absorb", "stabilize"][functionIndex];
      conduit.userData.presentationOnly = true;
      conduit.visible = false;
      this.coreEnginePhaseRoot.add(conduit);
      this.coreEngineVerbConduits.push(conduit);

      const transitMaterial = new THREE.MeshBasicMaterial({
        color: colors[functionIndex],
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const transitNode = new THREE.Mesh(transitGeometry, transitMaterial);
      transitNode.name = `core_engine_verb_transit_${["pulse", "absorb", "stabilize"][functionIndex]}`;
      transitNode.userData.owner = "CoreEmbodimentSystem";
      transitNode.userData.function = ["pulse", "absorb", "stabilize"][functionIndex];
      transitNode.userData.presentationOnly = true;
      transitNode.visible = false;
      this.coreEnginePhaseRoot.add(transitNode);
      this.coreEngineVerbTransitNodes.push(transitNode);
    }
  }

  updateCoreEngineVisual(dt, frameState) {
    const engine = frameState.coreEngine ?? {};
    if (!this.coreEnginePhaseRoot || !engine.active) {
      if (this.coreEnginePhaseRoot) this.coreEnginePhaseRoot.visible = false;
      return;
    }

    this.coreEnginePhaseRoot.visible = true;
    const phaseCount = Math.max(3, Math.min(12, engine.phaseCount ?? 3));
    const phasesPerFunction = Math.max(1, Math.round(phaseCount / 3));
    const currentPhaseIndex = engine.currentPhaseIndex ?? 0;
    const currentFunction = engine.currentPhaseFunction ?? "pulse";
    const inspection = Boolean(frameState.inspectionCamera?.active || frameState.tightInspectionCamera?.active);
    const work = Boolean(frameState.inspectionCamera?.coreWorkActive || frameState.tightInspectionCamera?.coreWorkActive);
    const load = THREE.MathUtils.clamp(engine.load01 ?? 0, 0, 1);
    const cycle = ((engine.cycleProgress01 ?? 0) % 1 + 1) % 1;
    const safeDt = Math.max(0, dt ?? 0);
    const settle = 1 - Math.exp(-safeDt * 16);
    const verbCoupling = frameState.coreVerbEngineCoupling ?? {};
    const verbCouplingActive = Boolean(verbCoupling.active);
    const verbDrive = verbCoupling.functionDrive ?? {};
    const pulseEngineDrive = verbCouplingActive ? THREE.MathUtils.clamp(verbDrive.pulse ?? 0, 0, 1) : 0;
    const absorbEngineDrive = verbCouplingActive ? THREE.MathUtils.clamp(verbDrive.absorb ?? 0, 0, 1) : 0;
    const stabilizeEngineDrive = verbCouplingActive ? THREE.MathUtils.clamp(verbDrive.stabilize ?? 0, 0, 1) : 0;
    const verbPrecessionDamping = verbCouplingActive
      ? THREE.MathUtils.clamp(verbCoupling.presentation?.precessionDamping01 ?? 0, 0, 1)
      : 0;
    const fullSystemLoad = verbCouplingActive
      ? THREE.MathUtils.clamp(verbCoupling.presentation?.fullSystemLoad01 ?? 0, 0, 1)
      : 0;
    const stabilizeCoherence = Math.max(
      THREE.MathUtils.clamp(this.stabilizeVisualCommitment ?? 0, 0, 1),
      stabilizeEngineDrive
    );
    const worldResonance = frameState.coreWorldResonance ?? {};
    const worldResonanceActive = Boolean(worldResonance.active);
    const worldCoherence = worldResonanceActive
      ? THREE.MathUtils.clamp(worldResonance.coherence01 ?? 0.5, 0, 1)
      : 0.5;
    const resonancePulse = worldResonanceActive
      ? THREE.MathUtils.clamp(worldResonance.presentation?.resonancePulse ?? 0, 0, 1)
      : 0;
    const resonancePrecessionScale = worldResonanceActive
      ? THREE.MathUtils.clamp(worldResonance.presentation?.precessionScale ?? 1, 0.78, 1.14)
      : 1;
    const resonanceFunction = worldResonanceActive
      ? worldResonance.presentation?.emphasizedFunction ?? "none"
      : "none";
    const resonancePlaneEmphasis = worldResonanceActive
      ? THREE.MathUtils.clamp(worldResonance.presentation?.planeEmphasis ?? 0, 0, 1)
      : 0;
    const topologyResonance = frameState.coreTopologyResonance ?? {};
    const topologyResonanceActive = Boolean(topologyResonance.active);
    const topologyPresentation = topologyResonance.presentation ?? {};
    const topologyProperties = topologyResonance.properties ?? {};
    const topologyFiringSharpness = topologyResonanceActive
      ? THREE.MathUtils.clamp(topologyPresentation.firingSharpness01 ?? 0.5, 0, 1)
      : 0.5;
    const topologyWorldVisibility = topologyResonanceActive
      ? THREE.MathUtils.clamp(topologyPresentation.worldCouplingVisibility01 ?? 0, 0, 1)
      : 0;
    const topologyMemoryTrail = topologyResonanceActive
      ? THREE.MathUtils.clamp(topologyPresentation.memoryTrail01 ?? 0, 0, 1)
      : 0;
    const topologyCoherenceHold = topologyResonanceActive
      ? THREE.MathUtils.clamp(topologyPresentation.coherenceHold01 ?? topologyProperties.coherence01 ?? 0.5, 0, 1)
      : 0.5;
    const topologyWorldPulse = topologyResonanceActive
      ? THREE.MathUtils.clamp(topologyPresentation.embodiedWorldPulse01 ?? 0, 0, 1)
      : 0;

    if (phaseCount !== this.coreEnginePreviousVisualPhaseCount) {
      this.coreEnginePreviousVisualPhaseCount = phaseCount;
      this.coreEngineArchitectureChangeAge = 0;
    } else {
      this.coreEngineArchitectureChangeAge += safeDt;
    }

    const architecturePop = Math.max(0, 1 - this.coreEngineArchitectureChangeAge / 0.72);
    const gyroRadius = 0.37;
    const architectureImpulse = phaseCount === 3 ? 1 : phaseCount === 6 ? 0.62 : 0.34;
    const architectureWobble = phaseCount === 3 ? 0.15 : phaseCount === 6 ? 0.075 : 0.028;
    const wobble = architectureWobble
      * (1 - Math.max(stabilizeCoherence * 0.78, verbPrecessionDamping * 0.72))
      * resonancePrecessionScale;
    const cyclePosition = Math.max(0, engine.cycleCount ?? 0) + cycle;
    const spin = cyclePosition * Math.PI * 2;

    // The assembly precesses around all three body axes. Stabilize visually
    // reduces precession, expressing coherence without freezing orientation.
    const targetRotX = spin * 0.17 + Math.sin(spin * 0.73) * wobble;
    const targetRotY = -spin * 0.13 + Math.cos(spin * 0.59 + 0.8) * wobble;
    const targetRotZ = spin * 0.11 + Math.sin(spin * 0.91 + 1.6) * wobble;
    this.coreEnginePhaseRoot.rotation.x = THREE.MathUtils.lerp(this.coreEnginePhaseRoot.rotation.x, targetRotX, settle);
    this.coreEnginePhaseRoot.rotation.y = THREE.MathUtils.lerp(this.coreEnginePhaseRoot.rotation.y, targetRotY, settle);
    this.coreEnginePhaseRoot.rotation.z = THREE.MathUtils.lerp(this.coreEnginePhaseRoot.rotation.z, targetRotZ, settle);

    const phaseFloat = cycle * phaseCount;
    const localPhaseProgress = phaseFloat - Math.floor(phaseFloat);
    const firingEnvelope = Math.exp(-localPhaseProgress * (4.2 + topologyFiringSharpness * 2.4));
    const functionNames = ["pulse", "absorb", "stabilize"];
    const functionSpinDirections = [1, -1, 1];
    const functionSpinRates = [1.0, 0.86, 0.72];

    this.coreEnginePhaseNodes.forEach((node, index) => {
      const enabled = index < phaseCount;
      node.visible = enabled;
      if (!enabled || !node.material) return;

      const functionIndex = index % 3;
      const ordinal = Math.floor(index / 3);
      const orbitalSpacing = Math.PI * 2 / phasesPerFunction;
      const angle = (
        spin * functionSpinDirections[functionIndex] * functionSpinRates[functionIndex]
        + ordinal * orbitalSpacing
        + functionIndex * Math.PI * 2 / 3
      );
      const active = index === currentPhaseIndex;
      const fire = active ? firingEnvelope * architectureImpulse : 0;
      const planeDrive = functionIndex === 0 ? pulseEngineDrive : functionIndex === 1 ? absorbEngineDrive : stabilizeEngineDrive;
      const verbRadiusScale = functionIndex === 0
        ? 1 + planeDrive * 0.10
        : functionIndex === 1
          ? 1 - planeDrive * 0.08
          : 1 + planeDrive * 0.018;
      const radius = gyroRadius * verbRadiusScale * (1 + fire * 0.10 + architecturePop * 0.025);
      const c = Math.cos(angle) * radius;
      const q = Math.sin(angle) * radius;
      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;
      if (functionIndex === 0) {
        targetX = c;
        targetY = q;
      } else if (functionIndex === 1) {
        targetY = c;
        targetZ = q;
      } else {
        targetX = c;
        targetZ = q;
      }
      node.position.x = THREE.MathUtils.lerp(node.position.x, targetX, settle);
      node.position.y = THREE.MathUtils.lerp(node.position.y, targetY, settle);
      node.position.z = THREE.MathUtils.lerp(node.position.z, targetZ, settle);

      const baseOpacity = work ? 0.60 : inspection ? 0.46 : phaseCount === 12 ? 0.22 : 0.28;
      const resonanceNodeLift = worldResonanceActive && node.userData.function === resonanceFunction
        ? resonancePlaneEmphasis * (0.06 + resonancePulse * 0.10)
          + topologyWorldVisibility * (0.018 + topologyMemoryTrail * 0.032)
        : 0;
      const verbNodeLift = planeDrive * 0.26;
      const targetOpacity = active
        ? Math.min(1, 0.90 + fire * 0.10 + load * 0.05 + resonanceNodeLift + verbNodeLift)
        : Math.min(0.92, baseOpacity + architecturePop * 0.14 + stabilizeCoherence * 0.06 + resonanceNodeLift + verbNodeLift);
      node.material.opacity = THREE.MathUtils.lerp(node.material.opacity ?? baseOpacity, targetOpacity, settle);
      const inactiveScale = phaseCount === 3 ? 1.34 : phaseCount === 6 ? 1.12 : 0.94;
      const targetScale = active
        ? inactiveScale * (1.45 + fire * 0.46 + load * 0.10 + planeDrive * 0.28)
        : inactiveScale * (1 + architecturePop * 0.06 + planeDrive * 0.18);
      const scale = THREE.MathUtils.lerp(node.scale.x, targetScale, settle);
      node.scale.setScalar(scale);
    });

    for (const [functionIndex, ring] of this.coreEngineGyroRings.entries()) {
      if (!ring?.material) continue;
      const ringFunction = functionNames[functionIndex];
      const firingThisPlane = ringFunction === currentFunction;
      const normalOpacity = phaseCount === 12 ? 0.30 : phaseCount === 6 ? 0.27 : 0.24;
      const focus = firingThisPlane ? firingEnvelope * (0.32 + architectureImpulse * 0.16) : 0;
      const worldFocus = worldResonanceActive && ringFunction === resonanceFunction
        ? resonancePlaneEmphasis * (0.20 + resonancePulse * 0.24)
          + topologyWorldVisibility * (0.05 + topologyMemoryTrail * 0.08)
        : 0;
      const planeDrive = ringFunction === "pulse" ? pulseEngineDrive : ringFunction === "absorb" ? absorbEngineDrive : stabilizeEngineDrive;
      const verbFocus = planeDrive * 0.34;
      const targetOpacity = Math.min(
        0.94,
        normalOpacity
          + (inspection ? 0.10 : 0)
          + (work ? 0.10 : 0)
          + stabilizeCoherence * 0.12
          + topologyCoherenceHold * 0.035
          + architecturePop * 0.18
          + focus
          + worldFocus
          + verbFocus
      );
      ring.material.opacity = THREE.MathUtils.lerp(ring.material.opacity ?? normalOpacity, targetOpacity, settle);
      const targetRingScale = ringFunction === "pulse"
        ? 1 + pulseEngineDrive * 0.10
        : ringFunction === "absorb"
          ? 1 - absorbEngineDrive * 0.08
          : 1 + stabilizeEngineDrive * 0.018;
      const ringScale = THREE.MathUtils.lerp(ring.scale.x, targetRingScale, settle);
      ring.scale.setScalar(ringScale);
    }

    // HC028D1 verb routing: a transient conduit runs from the nucleus to one
    // moving firing position on each active function plane. Pulse travels
    // outward, Absorb travels inward, and Stabilize holds near the midpoint
    // while damping the whole gyroscope. Multiple conduits can coexist as chords.
    const runtimeSeconds = frameState.runtimeSeconds ?? 0;
    const functionDrives = [pulseEngineDrive, absorbEngineDrive, stabilizeEngineDrive];
    for (let functionIndex = 0; functionIndex < 3; functionIndex += 1) {
      const conduit = this.coreEngineVerbConduits[functionIndex];
      const transit = this.coreEngineVerbTransitNodes[functionIndex];
      if (!conduit || !transit?.material || !conduit.material) continue;
      const drive = functionDrives[functionIndex];
      const targetNode = this.coreEnginePhaseNodes.find((node, index) => index < phaseCount && node.userData.functionIndex === functionIndex);
      const visible = Boolean(targetNode && drive > 0.055);
      conduit.visible = visible;
      transit.visible = visible;
      if (!visible) {
        conduit.material.opacity = 0;
        transit.material.opacity = 0;
        continue;
      }
      const positions = conduit.geometry.attributes.position.array;
      positions[0] = 0; positions[1] = 0; positions[2] = 0;
      positions[3] = targetNode.position.x; positions[4] = targetNode.position.y; positions[5] = targetNode.position.z;
      conduit.geometry.attributes.position.needsUpdate = true;
      conduit.material.opacity = 0.10 + drive * 0.52;

      const travelPhase = (runtimeSeconds * (2.0 + drive * 1.4) + functionIndex * 0.21) % 1;
      const travel01 = functionIndex === 0
        ? travelPhase
        : functionIndex === 1
          ? 1 - travelPhase
          : 0.48 + Math.sin(runtimeSeconds * 4.4) * 0.08;
      transit.position.copy(targetNode.position).multiplyScalar(travel01);
      transit.material.opacity = 0.20 + drive * 0.68;
      transit.scale.setScalar(0.74 + drive * 0.82);
    }

    // Architecture resolution is now read through firing density and stability:
    // 3 = three chunky single impulses, 6 = three opposed pairs, 12 = four
    // positions per function approaching turbine-like continuity.
    this.coreEnginePhaseRoot.scale.setScalar(
      1 + load * 0.04 + architecturePop * 0.12 + resonancePulse * 0.026 + fullSystemLoad * 0.018 + topologyWorldPulse * 0.018
    );
    this.playerRoot.userData.coreEngineVisualPhaseCount = phaseCount;
    this.playerRoot.userData.coreEngineVisualCurrentPhase = currentPhaseIndex;
    this.playerRoot.userData.coreEngineVisualArchitecture = phaseCount === 3
      ? "tri_axial_single_fire"
      : phaseCount === 6
        ? "tri_axial_opposed_pairs"
        : "tri_axial_four_phase_resolution";
    this.playerRoot.userData.coreEngineVisualHasFixedTopBottom = false;
    this.playerRoot.userData.coreWorldResonance = worldResonanceActive
      ? worldResonance.relationshipState ?? "oscillating"
      : "inactive";
    this.playerRoot.userData.coreWorldResonanceCoherence = worldResonanceActive
      ? Number(worldCoherence.toFixed(3))
      : 0;
    this.playerRoot.userData.coreVerbEngineChord = verbCouplingActive ? verbCoupling.chord ?? "idle" : "idle";
    this.playerRoot.userData.coreVerbEngineDominantFunction = verbCouplingActive ? verbCoupling.dominantFunction ?? "none" : "none";
    this.playerRoot.userData.coreTopologyResonanceMode = topologyResonanceActive ? topologyResonance.mode ?? "forming" : "forming";
    this.playerRoot.userData.coreTopologyWorldImprint = topologyResonanceActive
      ? Number((topologyPresentation.worldImprint01 ?? 0).toFixed(3))
      : 0;
  }

  collectParts() {
    this.fins.length = 0;
    this.veils.length = 0;
    this.travelTendrils.length = 0;
    this.growthPetals.length = 0;
    this.growthPlates.length = 0;
    this.growthNodes.length = 0;
    this.playerRoot.traverse((child) => {
      if (child.name?.startsWith("player_seed_propulsion_fin_")) this.fins.push(child);
      if (/^player_seed_travel_tendril_\d+$/.test(child.name ?? "")) {
        const segments = child.children
          .filter((part) => part.name?.includes("_segment_"))
          .sort((a, b) => a.name.localeCompare(b.name));
        const rootBulb = child.children.find((part) => part.name?.endsWith("_core_root")) ?? null;
        const closedSucker = child.children.find((part) => part.name?.endsWith("_closed_sucker")) ?? null;
        this.travelTendrils.push({ group: child, segments, rootBulb, closedSucker });
        this.veils.push(child); // compatibility telemetry: old veil count now means free tendril count.
      } else if (child.name?.startsWith("player_seed_trailing_veil_")) {
        this.veils.push(child); // compatibility fallback for older authored proxies.
      }
      if (child.name?.startsWith("player_growth_binding_petal_")) this.growthPetals.push(child);
      if (child.name?.startsWith("player_growth_scar_plate_")) this.growthPlates.push(child);
      if (child.name?.startsWith("player_growth_connection_node_")) {
        if (!child.userData.growthBasePosition) child.userData.growthBasePosition = child.position.clone();
        // HC024C2: connection nodes remain authored growth anatomy, but are no
        // longer the Core Work manipulation target. Retained route anatomy owns
        // the recognizable pieces the Guide can physically reposition.
        child.userData.coreWorkManipulable = false;
        this.growthNodes.push(child);
      }
    });
  }

  orientBody(dt, speed) {
    this.targetQuaternion.setFromUnitVectors(FORWARD_AXIS, this.direction);

    this.side.crossVectors(this.direction, this.up);
    if (this.side.lengthSq() <= 0.0001) {
      this.side.set(1, 0, 0);
    } else {
      this.side.normalize();
    }

    const lateralAcceleration = this.acceleration.dot(this.side);
    const targetBank = THREE.MathUtils.clamp(-lateralAcceleration * 0.018, -0.34, 0.34);
    this.bank += (targetBank - this.bank) * (1 - Math.exp(-dt * 4.8));
    this.bankQuaternion.setFromAxisAngle(this.direction, this.bank);
    this.targetQuaternion.premultiply(this.bankQuaternion);

    const turnRate = 2.8 + Math.min(speed, 3.8) * 1.2;
    this.bodyFrame.quaternion.slerp(this.targetQuaternion, 1 - Math.exp(-dt * turnRate));
  }

  deformBody(t, dt, speed, pressure, viscosity, boundaryPressure, boost) {
    this.slip.copy(this.velocity).sub(this.flow);
    const slipStrength = Math.min(1, this.slip.length() / 2.8);
    const speedWeight = Math.min(1, speed / 3.2);
    const breath = 1 + Math.sin(t * 2.05) * (0.018 + viscosity * 0.012);
    const growth = this.frameState.coreGrowth ?? {};
    const growthProgress = THREE.MathUtils.clamp(growth.growthProgress ?? 0, 0, 1);
    const growthBias = THREE.MathUtils.clamp(growth.chemistryBias ?? 0, -1, 1);
    const careWeight = Math.max(0, growthBias);
    const scarWeight = Math.max(0, -growthBias);
    const growthWidth = 1 + growthProgress * (0.14 + careWeight * 0.035 + scarWeight * 0.065);
    const growthLength = 1 + growthProgress * (0.18 + careWeight * 0.045);
    const axialStretch = 1 + speedWeight * 0.12 + (boost ? 0.055 : 0);
    const lateralCompression = 1 - speedWeight * 0.055 - pressure * 0.025 - boundaryPressure * 0.08;
    const verticalCompression = 1 - pressure * 0.045 - boundaryPressure * 0.1;

    this.bodyFrame.scale.set(
      Math.max(0.78, lateralCompression * breath) * growthWidth * CORE_VISUAL_SCALE,
      Math.max(0.75, verticalCompression * breath) * growthWidth * CORE_VISUAL_SCALE,
      axialStretch * growthLength * CORE_VISUAL_SCALE
    );

    const surfaceTrace = growth.surfaceMemoryMode ?? "unwritten";
    const surfaceTraceStrength = growth.surfaceMemoryCommitted ? 1 : 0;
    const filteringTrace = surfaceTrace === "filtering_care_trace" ? surfaceTraceStrength : 0;
    const scarTrace = surfaceTrace === "scar_tolerance_trace" ? surfaceTraceStrength : 0;
    const bindingTrace = surfaceTrace === "nutrient_binding_trace" ? surfaceTraceStrength : 0;

    if (this.outerShell?.material) {
      const primitiveQuiet = 1 - this.hubOrganizationReveal;
      const normalShellOpacity = 0.48 + this.mantleReveal * 0.12 + this.hubOrganizationReveal * 0.12
        + speedWeight * 0.05 + boundaryPressure * 0.06;
      const coreWorkShellOpacity = Math.max(
        this.coreWorkPieceHeld ? 0.17 : 0.22,
        normalShellOpacity * (this.coreWorkPieceHeld ? 0.42 : 0.52)
      );
      this.outerShell.material.opacity = THREE.MathUtils.lerp(
        normalShellOpacity,
        coreWorkShellOpacity,
        this.coreWorkReveal
      );
      this.outerShell.material.emissiveIntensity = 0.035 + this.mantleReveal * 0.035
        + this.hubOrganizationReveal * 0.08 + speedWeight * 0.08 + boundaryPressure * 0.14;
      this.growthColor.copy(this.balancedGrowthColor)
        .lerp(this.careGrowthColor, careWeight)
        .lerp(this.scarGrowthColor, scarWeight);
      this.outerShell.material.color.copy(this.seedShellColor).lerp(this.growthColor, growthProgress * 0.78);
      this.outerShell.material.emissive.copy(this.growthColor).multiplyScalar(
        0.36 + growthProgress * 0.18 + filteringTrace * 0.04 + scarTrace * 0.025
      );
      const tracePulse = 1 + Math.sin(t * 1.7) * 0.012;
      this.outerShell.scale.set(
        tracePulse * (1 + bindingTrace * 0.035 + scarTrace * 0.025),
        tracePulse * (1 + filteringTrace * 0.028 - scarTrace * 0.018),
        tracePulse * (1 + filteringTrace * 0.035 + bindingTrace * 0.018)
      );
      this.outerShell.rotation.z += scarTrace * dt * 0.035;
    }
    if (this.innerMantle?.material) {
      this.innerMantle.visible = this.mantleReveal > 0.015;
      this.innerMantle.scale.setScalar(Math.max(0.001, 0.72 + this.mantleReveal * 0.28));
      this.innerMantle.material.opacity = this.mantleReveal * (0.18 + this.hubOrganizationReveal * 0.22 + speedWeight * 0.06);
      this.innerMantle.material.color.copy(this.seedShellColor).lerp(this.growthColor, growthProgress * 0.58);
      this.innerMantle.material.opacity += filteringTrace * 0.05 + bindingTrace * 0.025 + this.coreWorkReveal * 0.26;
      this.innerMantle.scale.multiplyScalar(1 + filteringTrace * 0.028);
    }
    if (this.directionalProw?.material) {
      this.directionalProw.visible = this.locomotorReveal > 0.02;
      this.directionalProw.material.opacity = this.locomotorReveal * (0.24 + this.hubOrganizationReveal * 0.34);
      this.directionalProw.scale.set(0.72, 0.64, 1.18).multiplyScalar(Math.max(0.001, this.locomotorReveal));
    }
    if (this.rearLobe?.material) {
      this.rearLobe.visible = this.locomotorReveal > 0.02;
      this.rearLobe.material.opacity = this.locomotorReveal * (0.16 + this.hubOrganizationReveal * 0.26);
      this.rearLobe.scale.set(0.82, 0.72, 0.92).multiplyScalar(Math.max(0.001, this.locomotorReveal));
    }
    if (this.nucleus?.material) {
      this.nucleus.material.emissiveIntensity = 1.05
        + speedWeight * 0.58
        + (boost ? 0.26 : 0)
        + growthProgress * 0.34
        + this.coreWorkReveal * 0.42;
      const nucleusPulse = 1 + Math.sin(t * (3.4 + bindingTrace * 0.55)) * (0.055 + bindingTrace * 0.018)
        + speedWeight * 0.07;
      this.nucleus.scale.setScalar(nucleusPulse * (1 + growthProgress * 0.2 + bindingTrace * 0.035));
    }

    this.fins.forEach((fin, index) => {
      const sideSign = index % 2 === 0 ? 1 : -1;
      const anatomicalReveal = THREE.MathUtils.clamp(this.locomotorReveal * 0.62 + this.hubOrganizationReveal * 0.38, 0, 1);
      fin.visible = anatomicalReveal > 0.025;
      const flex = speedWeight * (0.16 + index * 0.018) + slipStrength * 0.12;
      fin.rotation.x = (fin.userData.baseRotationX ?? fin.rotation.x) + flex * sideSign;
      fin.rotation.z = (fin.userData.baseRotationZ ?? fin.rotation.z) + this.bank * 0.7 + Math.sin(t * 2.2 + index) * 0.035;
      if (fin.material) {
        fin.material.opacity = anatomicalReveal * (0.22 + speedWeight * 0.28 + (boost ? 0.08 : 0));
        fin.material.emissiveIntensity = 0.08 + slipStrength * 0.18;
      }
    });

    this.animateTravelTendrils(t, speedWeight, slipStrength);

    this.animateGrowthAnatomy(t, growthProgress, growthBias);
    this.animateMemoryImprint(t, growth);
    this.animateVascularReturnFilament(t, growth);
    this.animateSiltPressureAdaptation(t, growth);
    this.animateIntegratedAnatomy(t, growth);
    this.updateCoreWorkManipulation(t, dt, this.frameState);
    this.updateSpatialCoreChemistry(t, dt, this.frameState);
    this.updateCoreContactLanguage(t, dt, this.frameState);

    return slipStrength;
  }

  animateTravelTendrils(t, speedWeight, slipStrength) {
    const anatomicalReveal = THREE.MathUtils.clamp(this.locomotorReveal * 0.35 + this.hubOrganizationReveal * 0.65, 0, 1);
    const contact = this.frameState.coreTendrilContact ?? {};
    const contactState = contact.contactState ?? "suspended";
    const occupiedIndices = Array.isArray(contact.occupiedIndices) ? contact.occupiedIndices : [];
    const occupiedCount = Math.min(3, Math.max(
      occupiedIndices.length,
      (contact.sealedCount ?? 0) + (contact.reachingCount ?? 0) + (contact.peelingCount ?? 0)
    ));
    const freeReveal = anatomicalReveal;
    const projection = this.frameState.stabilizedProjection ?? {};
    const selfBracedProjection = Boolean(projection.active && projection.selfBracedWithoutSurface);
    const projectionBrace01 = selfBracedProjection
      ? THREE.MathUtils.clamp(projection.braceQuality01 ?? 0.62, 0, 1)
      : 0;

    // Legacy authored proxies are tolerated, but HC031E2's unified segmented
    // tendrils are the active path. This keeps old checkpoints inspectable.
    if (this.travelTendrils.length === 0) {
      this.veils.forEach((veil, index) => {
        veil.visible = freeReveal > 0.025;
        const flutter = Math.sin(t * (2.1 + index * 0.22) + index * 1.7);
        veil.scale.y = 0.9 + speedWeight * (0.62 + index * 0.08) + flutter * 0.06;
        veil.rotation.y = (index - 1) * 0.24 + this.bank * 0.35 + flutter * 0.08;
        if (veil.material) veil.material.opacity = freeReveal * (0.08 + speedWeight * 0.18);
      });
      return;
    }

    this.travelTendrils.forEach((tendril, index) => {
      const { group, segments, rootBulb, closedSucker } = tendril;
      const flutter = Math.sin(t * (2.0 + index * 0.18) + index * 1.73);
      const counterFlutter = Math.cos(t * (1.43 + index * 0.11) + index * 0.83);
      const lateralSign = index === 0 ? -1 : index === 2 ? 1 : 0;
      const extension = selfBracedProjection
        ? 0.54 + projectionBrace01 * 0.15 + speedWeight * 0.08
        : 0.62 + speedWeight * (0.48 + index * 0.055) + slipStrength * 0.12;
      const lateral = selfBracedProjection
        ? lateralSign * (0.12 + projectionBrace01 * 0.07) + flutter * 0.012
        : lateralSign * (0.045 + speedWeight * 0.055) + flutter * 0.026;
      const vertical = selfBracedProjection
        ? (index === 1 ? 0.13 + projectionBrace01 * 0.035 : -0.055) + counterFlutter * 0.010
        : (index === 1 ? -0.028 : 0.018) + counterFlutter * 0.026;

      const occupied = occupiedIndices.length > 0 ? occupiedIndices.includes(index) : index < occupiedCount;
      const limbReveal = freeReveal * (occupied ? 0.035 : 1);
      group.visible = limbReveal > 0.02;
      group.userData.tendrilState = occupied ? "handoff_to_contact" : selfBracedProjection ? "self_brace" : "drift";
      group.userData.tendrilVisualFamily = "core_suction_tendril_v1";
      group.rotation.y = (group.userData.baseYaw ?? 0) + this.bank * 0.18 + flutter * 0.035;
      if (!group.visible) return;

      this.tendrilP0.set(0, 0, 0);
      if (selfBracedProjection) {
        this.tendrilP1.set(lateral * 0.42, vertical * 0.46, extension * 0.26);
        this.tendrilP2.set(lateral * 0.86, vertical * 0.88, extension * 0.62);
        this.tendrilP3.set(lateral, vertical, extension);
      } else {
        this.tendrilP1.set(lateral * 0.28, vertical * 0.26, extension * 0.28);
        this.tendrilP2.set(lateral * 0.72, vertical * 0.72, extension * 0.64);
        this.tendrilP3.set(lateral, vertical, extension);
      }
      const points = [this.tendrilP0, this.tendrilP1, this.tendrilP2, this.tendrilP3];
      for (let segmentIndex = 0; segmentIndex < Math.min(3, segments.length); segmentIndex += 1) {
        this.placeTravelTendrilSegment(
          segments[segmentIndex],
          points[segmentIndex],
          points[segmentIndex + 1],
          limbReveal,
          segmentIndex,
          speedWeight
        );
      }

      if (rootBulb?.material) {
        rootBulb.visible = limbReveal > 0.03;
        this.tendrilDirection.copy(this.tendrilP1).sub(this.tendrilP0);
        if (this.tendrilDirection.lengthSq() < 0.0001) this.tendrilDirection.set(0, 0, 1);
        else this.tendrilDirection.normalize();
        rootBulb.position.copy(this.tendrilP0).addScaledVector(this.tendrilDirection, 0.018);
        rootBulb.quaternion.setFromUnitVectors(Y_AXIS, this.tendrilDirection);
        rootBulb.scale.set(
          0.80 - projectionBrace01 * 0.06,
          1.02 + speedWeight * 0.38 + projectionBrace01 * 0.42,
          0.80 - projectionBrace01 * 0.06
        );
        rootBulb.material.opacity = limbReveal * (0.36 + speedWeight * 0.18 + projectionBrace01 * 0.12);
        rootBulb.material.emissiveIntensity = 0.12 + speedWeight * 0.12 + projectionBrace01 * 0.28;
      }

      if (closedSucker?.material) {
        closedSucker.visible = limbReveal > 0.035;
        this.tendrilDirection.copy(this.tendrilP3).sub(this.tendrilP2);
        if (this.tendrilDirection.lengthSq() < 0.0001) this.tendrilDirection.set(0, 0, 1);
        else this.tendrilDirection.normalize();
        closedSucker.position.copy(this.tendrilP3).addScaledVector(this.tendrilDirection, 0.025);
        closedSucker.quaternion.setFromUnitVectors(Y_AXIS, this.tendrilDirection);
        const closedPulse = 1 + flutter * (selfBracedProjection ? 0.018 : 0.055);
        closedSucker.scale.set(
          (0.86 - projectionBrace01 * 0.10) * closedPulse,
          1.0 + speedWeight * 0.12 + projectionBrace01 * 0.18,
          (0.86 - projectionBrace01 * 0.10) / closedPulse
        );
        closedSucker.material.opacity = limbReveal * (0.34 + speedWeight * 0.20 + projectionBrace01 * 0.10);
        closedSucker.material.emissiveIntensity = 0.12 + speedWeight * 0.10 + projectionBrace01 * 0.22;
      }
    });

    this.frameState.coreTendrilVisualLanguage = {
      pass: "HC-031G",
      family: "core_suction_tendril_v1",
      tendrilCount: 3,
      freeState: occupiedCount > 0 ? "mixed_drift_contact_handoff" : selfBracedProjection ? "self_braced_projection" : "drift",
      contactState,
      occupiedContactTendrilCount: occupiedCount,
      freeReveal: Number(freeReveal.toFixed(3)),
      sameAnatomyAcrossFreeAndContact: true,
      legacyTrailingVeilGeometryRetired: true,
      locomotionDrivenByTendrils: Boolean(contact.surfaceLocomotion?.active),
      stabilizedProjectionSelfBrace: selfBracedProjection,
      stabilizedProjectionBrace01: Number(projectionBrace01.toFixed(3))
    };
  }

  placeTravelTendrilSegment(mesh, a, b, reveal, segmentIndex, speedWeight) {
    this.tendrilDelta.copy(b).sub(a);
    const length = this.tendrilDelta.length();
    mesh.visible = reveal > 0.02 && length > 0.002;
    if (!mesh.visible) return;

    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Y_AXIS, this.tendrilDelta.normalize());
    const taper = [1.0, 0.80, 0.60][segmentIndex] ?? 0.60;
    const tensionThin = THREE.MathUtils.lerp(1.0, 0.86, speedWeight);
    mesh.scale.set(taper * tensionThin, length, taper * tensionThin);
    if (mesh.material) {
      mesh.material.opacity = reveal * (0.34 + speedWeight * 0.22);
      mesh.material.emissiveIntensity = 0.12 + reveal * 0.10 + speedWeight * 0.08;
    }
  }

  animateGrowthAnatomy(t, progress, bias) {
    const rawEmergence = THREE.MathUtils.smoothstep(progress, 0.04, 0.94);
    const emergence = rawEmergence * this.hubOrganizationReveal;
    const careWeight = Math.max(0, bias);
    const scarWeight = Math.max(0, -bias);
    const petalWeight = emergence * (0.7 + careWeight * 0.3 - scarWeight * 0.2);
    const plateWeight = emergence * (0.16 + scarWeight * 0.84);
    const nodeWeight = emergence * (0.46 + careWeight * 0.54);

    this.growthColor.copy(this.balancedGrowthColor)
      .lerp(this.careGrowthColor, careWeight)
      .lerp(this.scarGrowthColor, scarWeight);

    this.growthPetals.forEach((petal, index) => {
      const baseScale = petal.userData.growthBaseScale ?? new THREE.Vector3(1, 1, 1);
      const basePosition = petal.userData.growthBasePosition ?? petal.position;
      const baseRotation = petal.userData.growthBaseRotation ?? {};
      const unfold = Math.max(0.001, petalWeight * (0.92 + (index % 3) * 0.05));
      const breathe = 1 + Math.sin(t * 1.7 + index * 0.9) * 0.035 * emergence;
      petal.visible = emergence > 0.015;
      petal.scale.set(
        baseScale.x * unfold * breathe,
        baseScale.y * Math.max(0.14, unfold) * (1 + careWeight * 0.24),
        baseScale.z * unfold * (1 + careWeight * 0.18)
      );
      petal.position.copy(basePosition).multiplyScalar(1 + emergence * (0.08 + careWeight * 0.12));
      petal.rotation.set(
        (baseRotation.x ?? petal.rotation.x) + Math.sin(t * 1.1 + index) * 0.018 * emergence,
        baseRotation.y ?? petal.rotation.y,
        (baseRotation.z ?? petal.rotation.z) + careWeight * (index % 2 === 0 ? -0.12 : 0.12) * emergence
      );
      if (petal.material) {
        petal.material.opacity = 0.68 * petalWeight;
        petal.material.color.copy(this.growthColor);
        petal.material.emissive.copy(this.growthColor).multiplyScalar(0.42);
        petal.material.emissiveIntensity = 0.08 + emergence * 0.18 + careWeight * 0.1;
      }
    });

    this.growthPlates.forEach((plate, index) => {
      const baseScale = plate.userData.growthBaseScale ?? new THREE.Vector3(1, 1, 1);
      const basePosition = plate.userData.growthBasePosition ?? plate.position;
      const reveal = Math.max(0.001, plateWeight * (0.9 + (index % 2) * 0.08));
      plate.visible = plateWeight > 0.025;
      plate.scale.copy(baseScale).multiplyScalar(reveal);
      plate.position.copy(basePosition).multiplyScalar(1 + emergence * (0.04 + scarWeight * 0.14));
      plate.rotation.y += 0.0015 * emergence * (index % 2 === 0 ? 1 : -1);
      if (plate.material) {
        plate.material.opacity = 0.62 * plateWeight;
        plate.material.emissiveIntensity = 0.08 + scarWeight * 0.28;
      }
    });

    this.growthNodes.forEach((node, index) => {
      const baseScale = node.userData.growthBaseScale ?? new THREE.Vector3(1, 1, 1);
      const basePosition = node.userData.growthBasePosition ?? node.position;
      const workOffset = node.userData.coreWorkOffset ?? this.coreWorkTemp.set(0, 0, 0);
      const pulse = 0.88 + Math.sin(t * 2.6 + index * 1.2) * 0.12;
      node.visible = nodeWeight > 0.025;
      node.position.copy(basePosition).add(workOffset);
      node.scale.copy(baseScale).multiplyScalar(Math.max(0.001, nodeWeight * pulse));
      if (node.material) {
        node.material.opacity = 0.76 * nodeWeight;
        node.material.emissiveIntensity = 0.16 + nodeWeight * 0.44;
        node.material.color.copy(this.growthColor).lerp(this.growthNucleusColor, 0.42);
      }
    });
  }

  createMemoryImprint() {
    if (!this.bodyFrame) return;
    this.memoryImprintRoot = new THREE.Group();
    this.memoryImprintRoot.name = "player_grave_memory_retention_root_HC024C2";
    Object.assign(this.memoryImprintRoot.userData, {
      presentationOwner: "CoreEmbodimentSystem",
      retainedStateOwner: "CoreGrowthSystem",
      routeId: "grave_route",
      attachedGrowthAnatomy: true,
      targetingSuppressed: true,
      objectDefiningRing: false,
      coreWorkManipulable: true,
      coreWorkLabel: "Grave Memory",
      coreWorkFamily: "grave_memory_retention",
      coreWorkAnchorLocal: new THREE.Vector3(-0.58, 0.17, 0.28),
      coreWorkBasePosition: new THREE.Vector3(),
      coreWorkOffset: new THREE.Vector3()
    });
    this.memoryImprintRoot.visible = false;
    this.bodyFrame.add(this.memoryImprintRoot);

    const layouts = [
      { position: [-0.7, 0.17, 0.2], scale: 1.0, radius: 0.17 },
      { position: [-0.57, 0.39, 0.29], scale: 0.72, radius: 0.12 },
      { position: [-0.53, -0.04, 0.35], scale: 0.58, radius: 0.1 }
    ];

    const ligamentMaterial = new THREE.MeshStandardMaterial({
      color: this.memoryPearlColor,
      emissive: this.memoryPearlEmissive,
      emissiveIntensity: 0.14,
      roughness: 0.52,
      transparent: true,
      opacity: 0,
      depthWrite: true
    });
    this.memoryLigament = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.035, 0.34, 6, 10),
      ligamentMaterial
    );
    this.memoryLigament.name = "player_grave_memory_attachment_ligament";
    this.memoryLigament.position.set(-0.48, 0.17, 0.2);
    this.memoryLigament.rotation.z = Math.PI / 2;
    this.memoryLigament.scale.set(0.001, 0.001, 0.001);
    this.memoryLigament.visible = false;
    this.memoryLigament.userData.attachedGrowthAnatomy = true;
    this.memoryLigament.userData.objectDefiningRing = false;
    this.memoryLigament.userData.targetingSuppressed = true;
    this.memoryImprintRoot.add(this.memoryLigament);

    layouts.forEach((layout, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: this.memoryPearlColor,
        emissive: this.memoryPearlEmissive,
        emissiveIntensity: 0.16,
        roughness: 0.36,
        metalness: 0.08,
        transparent: true,
        opacity: 0
      });
      const pearl = new THREE.Mesh(
        new THREE.DodecahedronGeometry(layout.radius, 0),
        material
      );
      pearl.name = `player_grave_memory_pearl_${index + 1}`;
      pearl.position.set(...layout.position);
      pearl.userData.memoryBasePosition = pearl.position.clone();
      pearl.userData.memoryBaseScale = layout.scale;
      pearl.userData.attachedGrowthAnatomy = true;
      pearl.userData.objectDefiningRing = false;
      pearl.userData.targetingSuppressed = true;
      pearl.visible = false;
      pearl.scale.setScalar(0.001);
      this.memoryImprintRoot.add(pearl);
      this.memoryPearls.push(pearl);
    });
  }

  animateMemoryImprint(t, growth) {
    const reveal = THREE.MathUtils.smoothstep(this.memoryImprintReveal, 0.02, 0.96);
    if (this.memoryImprintRoot) {
      const base = this.memoryImprintRoot.userData.coreWorkBasePosition ?? this.coreWorkTemp.set(0, 0, 0);
      const offset = this.memoryImprintRoot.userData.coreWorkOffset ?? this.coreWorkDelta.set(0, 0, 0);
      this.memoryImprintRoot.position.copy(base).add(offset);
      this.memoryImprintRoot.scale.setScalar(1);
      this.memoryImprintRoot.visible = Boolean(growth.graveMemoryImprintCommitted || growth.debugCoreWorkRetainedAnatomySeeded) && reveal > 0.015;
    }
    const integrity = THREE.MathUtils.clamp(growth.graveMemoryTraceIntegrity ?? 1, 0, 1);
    const recovered = Boolean(growth.graveResidueRecoilRecovered);
    this.memoryPearls.forEach((pearl, index) => {
      const basePosition = pearl.userData.memoryBasePosition ?? pearl.position;
      const baseScale = pearl.userData.memoryBaseScale ?? 1;
      const rhythm = 0.9 + Math.sin(t * (recovered ? 2.25 : 1.55) + index * 1.4) * 0.1;
      pearl.visible = reveal > 0.015;
      pearl.position.copy(basePosition);
      pearl.position.y += Math.sin(t * 1.25 + index) * 0.012 * reveal;
      pearl.scale.setScalar(Math.max(0.001, reveal * baseScale * rhythm));
      pearl.rotation.y += 0.003 * reveal * (index % 2 === 0 ? 1 : -1);
      pearl.material.opacity = reveal * (0.72 + integrity * 0.22);
      pearl.material.emissiveIntensity = 0.16 + reveal * (0.34 + integrity * 0.34);
      pearl.material.color.copy(this.memoryPearlColor).lerp(
        this.growthNucleusColor,
        integrity * 0.1
      );
    });
    if (this.memoryLigament?.material) {
      const pulse = 0.92 + Math.sin(t * (recovered ? 2.25 : 1.55)) * 0.08;
      this.memoryLigament.visible = reveal > 0.015;
      this.memoryLigament.scale.set(
        Math.max(0.001, reveal * 0.82),
        Math.max(0.001, reveal * pulse),
        Math.max(0.001, reveal * 0.82)
      );
      this.memoryLigament.material.opacity = reveal * (0.46 + integrity * 0.24);
      this.memoryLigament.material.emissiveIntensity = 0.12 + reveal * (0.22 + integrity * 0.22);
    }
  }

  createVascularReturnFilament() {
    if (!this.bodyFrame) return;
    this.vascularFilamentRoot = new THREE.Group();
    this.vascularFilamentRoot.name = "player_vascular_return_filament_root_HC011B";
    Object.assign(this.vascularFilamentRoot.userData, {
      presentationOwner: "CoreEmbodimentSystem",
      retainedStateOwner: "CoreGrowthSystem",
      routeId: "vascular_route",
      attachedGrowthAnatomy: true,
      targetingSuppressed: true,
      objectDefiningRing: false,
      permanentHalo: false,
      coreWorkManipulable: true,
      coreWorkLabel: "Vascular Rhythm",
      coreWorkFamily: "vascular_rhythm_retention",
      coreWorkAnchorLocal: new THREE.Vector3(0.46, 0.2, -0.18),
      coreWorkBasePosition: new THREE.Vector3(),
      coreWorkOffset: new THREE.Vector3()
    });
    this.vascularFilamentRoot.visible = false;
    this.bodyFrame.add(this.vascularFilamentRoot);

    const paths = [
      [[0.12, -0.08, 0.38], [0.34, 0.18, 0.28], [0.57, 0.12, -0.08], [0.68, 0.34, -0.42]],
      [[0.06, 0.02, 0.34], [0.28, 0.35, 0.18], [0.52, 0.44, -0.18], [0.62, 0.18, -0.54]],
      [[0.08, -0.18, 0.3], [0.3, -0.32, 0.08], [0.5, -0.2, -0.3], [0.56, 0.02, -0.62]]
    ];
    paths.forEach((points, index) => {
      const curve = new THREE.CatmullRomCurve3(
        points.map((point) => new THREE.Vector3().fromArray(point)),
        false,
        "centripetal",
        0.42
      );
      const material = new THREE.MeshStandardMaterial({
        color: this.vascularDeepColor,
        emissive: index === 1 ? this.vascularReturnColor : this.vascularSignalColor,
        emissiveIntensity: 0,
        roughness: 0.38,
        transparent: true,
        opacity: 0,
        depthWrite: true
      });
      const filament = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, 0.022 + index * 0.004, 7, false),
        material
      );
      filament.name = `player_vascular_return_filament_${index + 1}`;
      filament.userData.phase = index * 0.31;
      filament.userData.targetingSuppressed = true;
      filament.userData.objectDefiningRing = false;
      this.vascularFilamentRoot.add(filament);
      this.vascularFilamentCurves.push(curve);
      this.vascularFilaments.push(filament);

      const nodeMaterial = material.clone();
      const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 0), nodeMaterial);
      node.name = `player_vascular_cadence_node_${index + 1}`;
      node.position.copy(curve.getPointAt(0.3 + index * 0.2));
      node.userData.phase = index / 3;
      node.userData.targetingSuppressed = true;
      node.userData.objectDefiningRing = false;
      this.vascularFilamentRoot.add(node);
      this.vascularCadenceNodes.push(node);
    });

    const chargeMaterial = new THREE.MeshStandardMaterial({
      color: this.vascularReturnColor,
      emissive: this.vascularReturnColor,
      emissiveIntensity: 0,
      roughness: 0.24,
      transparent: true,
      opacity: 0
    });
    this.vascularReturnCharge = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.065, 0),
      chargeMaterial
    );
    this.vascularReturnCharge.name = "player_vascular_retained_cadence_charge";
    this.vascularReturnCharge.userData.targetingSuppressed = true;
    this.vascularReturnCharge.userData.objectDefiningRing = false;
    this.vascularFilamentRoot.add(this.vascularReturnCharge);
  }

  animateVascularReturnFilament(t, growth) {
    if (!this.vascularFilamentRoot) return;
    const reveal = THREE.MathUtils.smoothstep(this.vascularFilamentReveal, 0.02, 0.96);
    const retained = Boolean(growth.vascularRhythmRetained || growth.debugCoreWorkRetainedAnatomySeeded);
    const beatSeconds = 2.35;
    const phase = (t / beatSeconds) % 1;
    this.vascularFilamentRoot.visible = retained && reveal > 0.015;
    const vascularBase = this.vascularFilamentRoot.userData.coreWorkBasePosition ?? this.coreWorkTemp.set(0, 0, 0);
    const vascularOffset = this.vascularFilamentRoot.userData.coreWorkOffset ?? this.coreWorkDelta.set(0, 0, 0);
    this.vascularFilamentRoot.position.copy(vascularBase).add(vascularOffset);
    this.vascularFilamentRoot.scale.setScalar(Math.max(0.001, reveal));

    this.vascularFilaments.forEach((filament, index) => {
      const localBeat = (phase - index / 3 + 1) % 1;
      const beat = Math.exp(-Math.pow((localBeat - 0.16) / 0.12, 2));
      filament.material.opacity = reveal * (0.42 + beat * 0.28);
      filament.material.emissiveIntensity = reveal * (0.24 + beat * 0.7);
    });
    this.vascularCadenceNodes.forEach((node, index) => {
      const localBeat = (phase - index / 3 + 1) % 1;
      const beat = Math.exp(-Math.pow((localBeat - 0.16) / 0.11, 2));
      const scale = reveal * (0.72 + beat * 0.58);
      node.scale.setScalar(Math.max(0.001, scale));
      node.material.opacity = reveal * (0.58 + beat * 0.32);
      node.material.emissiveIntensity = reveal * (0.34 + beat * 0.92);
      node.material.color.copy(this.vascularSignalColor).lerp(this.vascularReturnColor, beat);
      node.material.emissive.copy(this.vascularReturnColor);
    });
    if (this.vascularReturnCharge && this.vascularFilamentCurves[1]) {
      this.vascularReturnCharge.position.copy(this.vascularFilamentCurves[1].getPointAt(phase));
      const chargePulse = reveal * (0.82 + Math.sin(phase * Math.PI * 6) * 0.12);
      this.vascularReturnCharge.scale.setScalar(Math.max(0.001, chargePulse));
      this.vascularReturnCharge.material.opacity = reveal * 0.92;
      this.vascularReturnCharge.material.emissiveIntensity = reveal * 1.15;
    }
  }

  createSiltPressureAdaptation() {
    if (!this.bodyFrame) return;
    const consequence = this.frameState.recipeDataSystem?.data?.siltPressureReturnConsequence ?? null;
    this.siltAdaptationRoot = new THREE.Group();
    this.siltAdaptationRoot.name = consequence?.coreAdaptation?.rootName ?? "player_silt_pressure_adaptation_root_HC012B";
    Object.assign(this.siltAdaptationRoot.userData, {
      presentationOwner: "CoreEmbodimentSystem",
      retainedStateOwner: "CoreGrowthSystem",
      routeId: "silt_burrow_route",
      attachedGrowthAnatomy: true,
      targetingSuppressed: true,
      objectDefiningRing: false,
      permanentHalo: false,
      coreWorkManipulable: true,
      coreWorkLabel: "Silt Pressure",
      coreWorkFamily: "silt_pressure_retention",
      coreWorkAnchorLocal: new THREE.Vector3(0.08, -0.59, -0.1),
      coreWorkBasePosition: new THREE.Vector3(),
      coreWorkOffset: new THREE.Vector3()
    });
    this.siltAdaptationRoot.visible = false;
    this.bodyFrame.add(this.siltAdaptationRoot);

    const plateLayouts = [
      { position: [-0.18, -0.58, 0.16], rotation: [0.22, -0.1, -0.42], scale: [0.78, 0.34, 1.0] },
      { position: [0.08, -0.67, -0.08], rotation: [-0.12, 0.2, 0.08], scale: [0.96, 0.38, 1.16] },
      { position: [0.34, -0.54, -0.3], rotation: [0.18, 0.34, 0.46], scale: [0.72, 0.32, 0.94] }
    ];
    plateLayouts.forEach((layout, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: this.siltColor,
        emissive: index === 1 ? this.siltReturnColor : this.siltDeepColor,
        emissiveIntensity: 0,
        roughness: 0.84,
        transparent: true,
        opacity: 0
      });
      const plate = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.46, 6, 10), material);
      plate.name = `player_silt_brace_plate_${index + 1}`;
      plate.position.set(...layout.position);
      plate.rotation.set(...layout.rotation);
      plate.scale.set(...layout.scale);
      plate.userData.basePosition = plate.position.clone();
      plate.userData.baseScale = plate.scale.clone();
      plate.userData.phase = index * 0.82;
      plate.userData.targetingSuppressed = true;
      plate.userData.objectDefiningRing = false;
      this.siltAdaptationRoot.add(plate);
      this.siltBracePlates.push(plate);
    });

    const porousMaterial = new THREE.MeshStandardMaterial({
      color: this.siltPorousColor,
      emissive: this.siltReturnColor,
      emissiveIntensity: 0,
      roughness: 0.42,
      transparent: true,
      opacity: 0
    });
    this.siltPorousNode = new THREE.Mesh(new THREE.DodecahedronGeometry(0.105, 0), porousMaterial);
    this.siltPorousNode.name = "player_silt_selective_porous_node";
    this.siltPorousNode.position.set(0.08, -0.55, 0.12);
    this.siltPorousNode.userData.targetingSuppressed = true;
    this.siltPorousNode.userData.objectDefiningRing = false;
    this.siltAdaptationRoot.add(this.siltPorousNode);

    [[-0.34, -0.64, -0.05], [0.42, -0.62, -0.18]].forEach((position, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: this.siltDeepColor,
        emissive: this.siltDeepColor,
        emissiveIntensity: 0,
        roughness: 0.96,
        transparent: true,
        opacity: 0
      });
      const knot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), material);
      knot.name = `player_silt_retained_residue_knot_${index + 1}`;
      knot.position.set(...position);
      knot.scale.set(1.2, 0.72, 0.94);
      knot.userData.targetingSuppressed = true;
      knot.userData.objectDefiningRing = false;
      this.siltAdaptationRoot.add(knot);
      this.siltResidueNodes.push(knot);
    });
  }

  animateSiltPressureAdaptation(t, growth) {
    if (!this.siltAdaptationRoot) return;
    const reveal = THREE.MathUtils.smoothstep(this.siltAdaptationReveal, 0.02, 0.96);
    const retained = Boolean(growth.siltPressureRetained || growth.debugCoreWorkRetainedAnatomySeeded);
    const compression = THREE.MathUtils.clamp(growth.siltSettledCompression ?? 0.2, 0, 1);
    const breath = (Math.sin(t * (Math.PI * 2 / 2.8)) + 1) * 0.5;
    this.siltAdaptationRoot.visible = retained && reveal > 0.015;
    const siltBase = this.siltAdaptationRoot.userData.coreWorkBasePosition ?? this.coreWorkTemp.set(0, 0, 0);
    const siltOffset = this.siltAdaptationRoot.userData.coreWorkOffset ?? this.coreWorkDelta.set(0, 0, 0);
    this.siltAdaptationRoot.position.copy(siltBase).add(siltOffset);
    this.siltAdaptationRoot.scale.setScalar(Math.max(0.001, reveal));

    this.siltBracePlates.forEach((plate, index) => {
      const basePosition = plate.userData.basePosition;
      const baseScale = plate.userData.baseScale;
      const open = (0.02 + breath * 0.045) * (index - 1);
      plate.position.copy(basePosition);
      plate.position.x += open;
      plate.scale.copy(baseScale).multiplyScalar(0.94 + breath * 0.08 - compression * 0.025);
      plate.material.opacity = reveal * (0.62 + breath * 0.12);
      plate.material.emissiveIntensity = reveal * (0.16 + breath * 0.34);
    });
    if (this.siltPorousNode) {
      const pulse = reveal * (0.82 + breath * 0.34);
      this.siltPorousNode.scale.setScalar(Math.max(0.001, pulse));
      this.siltPorousNode.material.opacity = reveal * 0.92;
      this.siltPorousNode.material.emissiveIntensity = reveal * (0.48 + breath * 0.68);
    }
    this.siltResidueNodes.forEach((knot, index) => {
      const pulse = 0.96 + Math.sin(t * 1.25 + index * 1.8) * 0.025;
      knot.scale.set(1.2 * pulse, 0.72 / pulse, 0.94 * pulse);
      knot.material.opacity = reveal * 0.76;
      knot.material.emissiveIntensity = reveal * 0.08;
    });
  }

  animateIntegratedAnatomy(t, growth) {
    const debugRetention = Boolean(growth.debugCoreWorkRetainedAnatomySeeded);
    const grave = Boolean(growth.graveMemoryImprintCommitted || debugRetention);
    const vascular = Boolean(growth.vascularRhythmRetained || debugRetention);
    const silt = Boolean(growth.siltPressureRetained || debugRetention);
    const pairCount = Number(grave && vascular) + Number(vascular && silt) + Number(silt && grave);
    const integrated = grave && vascular && silt;
    const circulationPhase = (t / 2.35) % 1;
    const organismBreath = (Math.sin(t * (Math.PI * 2 / 3.6)) + 1) * 0.5;

    // Existing Grave retention anatomy begins answering the circulation cadence.
    if (grave && vascular) {
      this.memoryPearls.forEach((pearl, index) => {
        const local = (circulationPhase - index / Math.max(1, this.memoryPearls.length) + 1) % 1;
        const feed = Math.exp(-Math.pow((local - 0.2) / 0.15, 2));
        pearl.material.emissiveIntensity += feed * 0.24;
      });
      if (this.memoryLigament?.material) {
        this.memoryLigament.material.emissiveIntensity += 0.08 + organismBreath * 0.08;
      }
    }

    // Existing Vascular transport visibly terminates into the Silt filter rhythm.
    if (vascular && silt) {
      this.vascularFilaments.forEach((filament, index) => {
        filament.material.emissiveIntensity += (0.06 + organismBreath * 0.08) * (1 - index * 0.12);
      });
      if (this.siltPorousNode?.material) {
        this.siltPorousNode.material.emissiveIntensity += 0.12 + Math.sin(circulationPhase * Math.PI * 2) * 0.06;
      }
    }

    // Filtration stabilizes what the retention anatomy is allowed to keep.
    if (silt && grave) {
      this.siltResidueNodes.forEach((knot, index) => {
        knot.material.opacity *= 0.92 + organismBreath * 0.06;
        knot.rotation.y += 0.0012 * (index % 2 === 0 ? 1 : -1);
      });
      this.memoryPearls.forEach((pearl) => {
        pearl.material.opacity = Math.min(1, pearl.material.opacity + 0.04 * organismBreath);
      });
    }

    // When all three systems exist, the base body shares one quiet physiological rhythm.
    if (integrated) {
      const integratedPulse = 1 + Math.sin(t * (Math.PI * 2 / 3.6)) * 0.012;
      if (this.innerMantle) this.innerMantle.scale.multiplyScalar(integratedPulse);
      if (this.nucleus?.material) this.nucleus.material.emissiveIntensity += 0.08 + organismBreath * 0.1;
      this.growthNodes.forEach((node, index) => {
        if (node.material) node.material.emissiveIntensity += 0.05 + organismBreath * 0.06;
        node.rotation.y += 0.001 * (index % 2 === 0 ? 1 : -1);
      });
    }

    this.playerRoot.userData.anatomicalIntegration = {
      pass: "HC-021F",
      pairCount,
      retentionFeedsFromCirculation: grave && vascular,
      circulationFeedsFiltration: vascular && silt,
      filtrationProtectsRetention: silt && grave,
      organismIntegrated: integrated,
      newGeometryAdded: false
    };
  }

  resetCoreWorkRetainedPlacements() {
    [this.memoryImprintRoot, this.vascularFilamentRoot, this.siltAdaptationRoot]
      .filter(Boolean)
      .forEach((piece) => {
        piece.userData.coreWorkOffset?.set?.(0, 0, 0);
        const base = piece.userData.coreWorkBasePosition;
        if (base) piece.position.copy(base);
      });
    this.coreWorkSelectedPieceId = "none";
    this.coreWorkSelectedIndex = 0;
    this.coreWorkPieceHeld = false;
    this.coreWorkLastEvent = "debug_quick_test_retained_anatomy_reset";
  }

  updateCoreWorkManipulation(t, dt, frameState) {
    const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
    const workActive = Boolean(inspection.active && inspection.coreWorkActive);
    const candidates = [
      this.memoryImprintRoot,
      this.vascularFilamentRoot,
      this.siltAdaptationRoot
    ].filter((piece) => piece?.visible && piece.userData.coreWorkManipulable === true);

    if (candidates.length <= 0) {
      this.coreWorkSelectedPieceId = "none";
      this.coreWorkSelectedIndex = 0;
      this.coreWorkPieceHeld = false;
      frameState.coreWorkManipulation = this.createCoreWorkManipulationState({
        active: workActive,
        candidateCount: 0,
        status: workActive ? "no_retained_route_anatomy_yet" : "inactive"
      });
      return;
    }

    let selectedIndex = candidates.findIndex((piece) => piece.name === this.coreWorkSelectedPieceId);
    if (selectedIndex < 0) selectedIndex = THREE.MathUtils.clamp(this.coreWorkSelectedIndex, 0, candidates.length - 1);

    if (workActive && !this.coreWorkPieceHeld) {
      if (frameState.input?.coreWorkSelectPrevPressed) {
        selectedIndex = (selectedIndex - 1 + candidates.length) % candidates.length;
        this.coreWorkLastEvent = "guide_selected_previous_retained_anatomy";
      }
      if (frameState.input?.coreWorkSelectNextPressed) {
        selectedIndex = (selectedIndex + 1) % candidates.length;
        this.coreWorkLastEvent = "guide_selected_next_retained_anatomy";
      }
    }

    this.coreWorkSelectedIndex = selectedIndex;
    const selected = candidates[selectedIndex];
    this.coreWorkSelectedPieceId = selected?.name ?? "none";

    const inputEventId = frameState.input?.coreWorkEventId ?? 0;
    if (
      workActive
      && !inspection.justWorkActivated
      && frameState.input?.coreWorkPressed
      && inputEventId !== this.coreWorkLastHandledEventId
    ) {
      this.coreWorkLastHandledEventId = inputEventId;
      this.coreWorkPieceHeld = !this.coreWorkPieceHeld;
      if (this.coreWorkPieceHeld) {
        this.coreWorkGrabCount += 1;
        this.coreWorkLastEvent = `guide_grabbed_${this.coreWorkSelectedPieceId}`;
      } else {
        this.coreWorkPlacementCount += 1;
        this.coreWorkLastEvent = `guide_placed_${this.coreWorkSelectedPieceId}`;
      }
    }

    if (!workActive && this.coreWorkPieceHeld) {
      this.coreWorkPieceHeld = false;
      this.coreWorkPlacementCount += 1;
      this.coreWorkLastEvent = "guide_released_piece_when_core_work_closed";
    }

    let movedThisFrame = false;
    if (workActive && this.coreWorkPieceHeld && selected) {
      const moveX = frameState.input?.coreWorkManipX ?? 0;
      const moveY = frameState.input?.coreWorkManipY ?? 0;
      const depth = frameState.input?.coreWorkManipDepth ?? 0;
      const movementMagnitude = Math.hypot(moveX, moveY, depth);

      if (movementMagnitude > 0.015) {
        const yaw = frameState.cameraControl?.yaw ?? 0;
        const pitch = frameState.cameraControl?.pitch ?? 0;
        const cosPitch = Math.cos(pitch);
        this.coreWorkForward.set(
          -Math.sin(yaw) * cosPitch,
          -Math.sin(pitch),
          -Math.cos(yaw) * cosPitch
        ).normalize();
        this.coreWorkRight.set(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();
        this.coreWorkUp.crossVectors(this.coreWorkRight, this.coreWorkForward).normalize();

        this.bodyFrame.getWorldQuaternion(this.coreWorkBodyQuaternion);
        this.coreWorkInverseQuaternion.copy(this.coreWorkBodyQuaternion).invert();
        this.coreWorkRight.applyQuaternion(this.coreWorkInverseQuaternion).normalize();
        this.coreWorkUp.applyQuaternion(this.coreWorkInverseQuaternion).normalize();

        const offset = selected.userData.coreWorkOffset ?? new THREE.Vector3();
        selected.userData.coreWorkOffset = offset;
        const basePosition = selected.userData.coreWorkBasePosition ?? new THREE.Vector3();
        selected.userData.coreWorkBasePosition = basePosition;

        this.coreWorkDelta.set(0, 0, 0)
          .addScaledVector(this.coreWorkRight, moveX * dt * 0.46)
          .addScaledVector(this.coreWorkUp, moveY * dt * 0.46);
        offset.add(this.coreWorkDelta);
        selected.position.copy(basePosition).add(offset);

        // Depth is measured from the recognizable anatomy's authored visual
        // center, not from an invisible Group origin. This makes RT/LT move the
        // actual Grave/Vascular/Silt body the player is looking at.
        this.getCoreWorkAnchorLocal(selected, this.coreWorkTemp);
        if (this.coreWorkTemp.lengthSq() > 0.0001) {
          const currentRadius = this.coreWorkTemp.length();
          const desiredRadius = THREE.MathUtils.clamp(
            currentRadius + depth * dt * this.coreWorkDepthSpeed,
            this.coreWorkMinimumRadius,
            this.coreWorkMaximumRadius
          );
          if (Math.abs(desiredRadius - currentRadius) > 0.0001) {
            this.coreWorkDelta.copy(this.coreWorkTemp).setLength(desiredRadius).sub(this.coreWorkTemp);
            offset.add(this.coreWorkDelta);
            selected.position.copy(basePosition).add(offset);
          }
        }

        this.coreWorkLastEvent = `guide_repositioning_${this.coreWorkSelectedPieceId}`;
        movedThisFrame = true;
      }
    }

    this.getCoreWorkAnchorLocal(selected, this.coreWorkTemp);
    const selectedRadius = this.coreWorkTemp.length();
    const depthInput = workActive && this.coreWorkPieceHeld
      ? (frameState.input?.coreWorkManipDepth ?? 0)
      : 0;
    const selectedDepth01 = THREE.MathUtils.clamp(
      (selectedRadius - this.coreWorkMinimumRadius) / Math.max(0.0001, this.coreWorkMaximumRadius - this.coreWorkMinimumRadius),
      0,
      1
    );
    const selectedDepthBand = selectedDepth01 < 0.28
      ? "deep_core"
      : selectedDepth01 < 0.58
        ? "inner_ring"
        : selectedDepth01 < 0.84
          ? "membrane"
          : "outer_edge";
    const depthDirection = depthInput > 0.08
      ? "outward"
      : depthInput < -0.08
        ? "inward"
        : "steady";

    if (workActive) {
      const contextDim = this.coreWorkPieceHeld ? 0.5 : 0.68;
      this.growthPetals.forEach((petal) => {
        if (petal.material) petal.material.opacity *= contextDim;
      });
      this.growthPlates.forEach((plate) => {
        if (plate.material) plate.material.opacity *= contextDim;
      });
      this.growthNodes.forEach((node) => {
        if (node.material) {
          node.material.opacity *= contextDim;
          node.material.emissiveIntensity *= 0.72;
        }
      });
    }

    this.getCoreWorkAnchorWorld(selected, this.coreWorkWorldPosition);

    candidates.forEach((piece) => {
      const selectedPiece = piece === selected;
      if (selectedPiece && workActive) {
        const selectionPulse = 1 + Math.sin(t * (this.coreWorkPieceHeld ? 5.6 : 3.8)) * (this.coreWorkPieceHeld ? 0.035 : 0.022);
        piece.scale.multiplyScalar((this.coreWorkPieceHeld ? 1.09 : 1.045) * selectionPulse);
        this.forEachCoreWorkMaterial(piece, (material) => {
          material.emissiveIntensity = (material.emissiveIntensity ?? 0) + (this.coreWorkPieceHeld ? 0.62 : 0.34);
          if (Number.isFinite(material.opacity)) material.opacity = Math.min(1, material.opacity + (this.coreWorkPieceHeld ? 0.16 : 0.1));
          if (material.color?.lerp) material.color.lerp(this.coreWorkHighlightColor, this.coreWorkPieceHeld ? 0.22 : 0.12);
          if (material.emissive?.lerp) material.emissive.lerp(this.coreWorkHighlightColor, this.coreWorkPieceHeld ? 0.2 : 0.1);
        });
      } else if (workActive) {
        this.forEachCoreWorkMaterial(piece, (material) => {
          if (Number.isFinite(material.opacity)) material.opacity *= this.coreWorkPieceHeld ? 0.42 : 0.62;
          material.emissiveIntensity = (material.emissiveIntensity ?? 0) * (this.coreWorkPieceHeld ? 0.48 : 0.68);
        });
      }
      piece.userData.coreWorkSelected = Boolean(selectedPiece && workActive);
      piece.userData.coreWorkHeld = Boolean(selectedPiece && workActive && this.coreWorkPieceHeld);
    });

    frameState.coreWorkManipulation = this.createCoreWorkManipulationState({
      active: workActive,
      candidateCount: candidates.length,
      selected,
      movedThisFrame,
      selectedWorldPosition: this.coreWorkWorldPosition,
      selectedRadius,
      selectedDepth01,
      selectedDepthBand,
      depthInput,
      depthDirection
    });
  }

  getSpatialChemistryZone(piece) {
    const anchor = piece?.userData?.coreWorkAnchorLocal;
    if (!piece || !anchor) {
      return { zoneId: "none", zoneLabel: "None", depth01: 0, radius: 0 };
    }

    // Use the authored visible-center anchor + persistent placement offset, but
    // intentionally ignore temporary selection/reveal scale. The chemistry zone
    // must not change because a selected piece visually pulses in Core Work.
    const radius = this.coreWorkTemp.copy(anchor).add(piece.position).length();
    const depth01 = THREE.MathUtils.clamp(
      (radius - this.coreWorkMinimumRadius) / Math.max(0.0001, this.coreWorkMaximumRadius - this.coreWorkMinimumRadius),
      0,
      1
    );
    if (depth01 < 0.28) return { zoneId: "deep_core", zoneLabel: "Deep Core", depth01, radius };
    if (depth01 < 0.58) return { zoneId: "inner_body", zoneLabel: "Inner Body", depth01, radius };
    return { zoneId: "membrane", zoneLabel: "Membrane", depth01, radius };
  }

  getSpatialChemistryInteraction(piece, zoneId) {
    const family = piece?.userData?.coreWorkFamily ?? "unknown";
    const interactions = {
      grave_memory_retention: {
        deep_core: { id: "grave_memory_knot", label: "Memory Knot", intent: "memory folds inward and consolidates around the nucleus" },
        inner_body: { id: "grave_memory_echo", label: "Memory Echo", intent: "memory recurs through the active inner body" },
        membrane: { id: "grave_residue_sense", label: "Residue Sense", intent: "memory is exposed at the boundary as a sensing trace" }
      },
      vascular_rhythm_retention: {
        deep_core: { id: "vascular_cadence_anchor", label: "Cadence Anchor", intent: "rhythm is concentrated as a stable internal beat" },
        inner_body: { id: "vascular_circulation_drive", label: "Circulation Drive", intent: "rhythm circulates through the body" },
        membrane: { id: "vascular_signal_skin", label: "Signal Skin", intent: "rhythm reaches the boundary as an outward conducting pulse" }
      },
      silt_pressure_retention: {
        deep_core: { id: "silt_ballast", label: "Ballast", intent: "pressure compacts inward as a dense stabilizing mass" },
        inner_body: { id: "silt_body_brace", label: "Body Brace", intent: "pressure braces the active internal structure" },
        membrane: { id: "silt_adhesion_skin", label: "Adhesion Skin", intent: "pressure spreads across the boundary as a gripping layer" }
      }
    };
    return interactions[family]?.[zoneId] ?? { id: "unknown", label: "Unresolved", intent: "placement has no authored chemistry reading" };
  }

  getWholeCoreTopology(counts, pieceCount) {
    const deep = counts.deep_core ?? 0;
    const inner = counts.inner_body ?? 0;
    const membrane = counts.membrane ?? 0;
    const distribution = `${deep}:${inner}:${membrane}`;
    if (pieceCount < 3) {
      return {
        id: "forming_topology",
        label: "Forming Topology",
        distribution,
        complete: false,
        dominantZone: deep > inner && deep > membrane ? "deep_core" : membrane > inner && membrane > deep ? "membrane" : "inner_body"
      };
    }

    const map = {
      "3:0:0": ["deep_concentration", "Deep Concentration", "deep_core"],
      "0:3:0": ["inner_saturation", "Inner Saturation", "inner_body"],
      "0:0:3": ["membrane_saturation", "Membrane Saturation", "membrane"],
      "2:1:0": ["deep_dominant_inner", "Deep-Dominant / Inner", "deep_core"],
      "2:0:1": ["deep_dominant_membrane", "Deep-Dominant / Membrane", "deep_core"],
      "1:2:0": ["inner_dominant_deep", "Inner-Dominant / Deep", "inner_body"],
      "0:2:1": ["inner_dominant_membrane", "Inner-Dominant / Membrane", "inner_body"],
      "1:0:2": ["membrane_dominant_deep", "Membrane-Dominant / Deep", "membrane"],
      "0:1:2": ["membrane_dominant_inner", "Membrane-Dominant / Inner", "membrane"],
      "1:1:1": ["three_way_balance", "Three-Way Balance", "balanced"]
    };
    const [id, label, dominantZone] = map[distribution] ?? ["forming_topology", "Forming Topology", "balanced"];
    return { id, label, distribution, complete: id !== "forming_topology", dominantZone };
  }

  applySpatialChemistryPieceVisual(piece, zoneId, interaction, t) {
    if (!piece) return;
    const family = piece.userData.coreWorkFamily ?? "unknown";
    const pulse = (Math.sin(t * (zoneId === "deep_core" ? 1.35 : zoneId === "inner_body" ? 2.15 : 3.0)) + 1) * 0.5;
    const zoneScale = zoneId === "deep_core"
      ? 0.86 + pulse * 0.025
      : zoneId === "inner_body"
        ? 0.99 + pulse * 0.055
        : 1.10 + pulse * 0.07;
    piece.scale.multiplyScalar(zoneScale);

    const tint = zoneId === "deep_core"
      ? this.coreChemistryDeepTint
      : zoneId === "inner_body"
        ? this.coreChemistryInnerTint
        : this.coreChemistryMembraneTint;
    const emissiveAdd = zoneId === "deep_core" ? 0.18 + pulse * 0.16 : zoneId === "inner_body" ? 0.20 + pulse * 0.22 : 0.34 + pulse * 0.34;
    const colorBlend = zoneId === "deep_core" ? 0.055 : zoneId === "inner_body" ? 0.065 : 0.12;
    this.forEachCoreWorkMaterial(piece, (material) => {
      material.emissiveIntensity = (material.emissiveIntensity ?? 0) + emissiveAdd;
      if (material.color?.lerp) material.color.lerp(tint, colorBlend);
      if (material.emissive?.lerp) material.emissive.lerp(tint, colorBlend * 0.9);
      if (Number.isFinite(material.opacity)) {
        material.opacity = THREE.MathUtils.clamp(
          material.opacity * (zoneId === "deep_core" ? 0.94 : zoneId === "inner_body" ? 1.0 : 1.08) + (zoneId === "membrane" ? 0.035 : 0),
          0,
          1
        );
      }
    });

    // Family-specific body language makes the nine fundamental interactions
    // readable without recoloring all retained anatomy into generic zone tokens.
    if (family === "grave_memory_retention") {
      const spread = zoneId === "deep_core" ? 0.84 : zoneId === "inner_body" ? 1.0 : 1.14;
      this.memoryPearls.forEach((pearl) => pearl.position.multiplyScalar(spread));
      if (this.memoryLigament) {
        if (zoneId === "deep_core") this.memoryLigament.scale.multiplyScalar(0.9);
        if (zoneId === "membrane") this.memoryLigament.scale.multiplyScalar(1.1 + pulse * 0.04);
      }
    } else if (family === "vascular_rhythm_retention") {
      if (zoneId === "deep_core" && this.vascularReturnCharge) {
        this.vascularReturnCharge.scale.multiplyScalar(1.2 + pulse * 0.12);
        if (this.vascularReturnCharge.material) this.vascularReturnCharge.material.emissiveIntensity += 0.42;
      } else if (zoneId === "inner_body") {
        this.vascularFilaments.forEach((filament, index) => {
          if (filament.material) filament.material.emissiveIntensity += 0.12 + index * 0.035;
        });
      } else if (zoneId === "membrane") {
        this.vascularCadenceNodes.forEach((node) => node.scale.multiplyScalar(1.14 + pulse * 0.08));
      }
    } else if (family === "silt_pressure_retention") {
      const spread = zoneId === "deep_core" ? 0.88 : zoneId === "inner_body" ? 1.0 : 1.12;
      this.siltBracePlates.forEach((plate) => {
        plate.position.multiplyScalar(spread);
        plate.scale.multiplyScalar(zoneId === "deep_core" ? 0.94 : zoneId === "inner_body" ? 1.06 : 1.13);
      });
      if (this.siltPorousNode) {
        this.siltPorousNode.scale.multiplyScalar(zoneId === "deep_core" ? 0.88 : zoneId === "inner_body" ? 1.06 : 1.24 + pulse * 0.08);
      }
    }

    piece.userData.spatialChemistryZone = zoneId;
    piece.userData.spatialChemistryInteractionId = interaction.id;
    piece.userData.spatialChemistryInteractionLabel = interaction.label;
  }

  applyWholeCoreTopologyVisual(topology, counts, pieceCount, t, dt) {
    if (pieceCount <= 0) return;
    const denom = Math.max(1, pieceCount);
    const targetDeep = (counts.deep_core ?? 0) / denom;
    const targetInner = (counts.inner_body ?? 0) / denom;
    const targetMembrane = (counts.membrane ?? 0) / denom;
    const targetBalance = topology.id === "three_way_balance" ? 1 : 0;
    const settle = 1 - Math.exp(-Math.max(0, dt) * 5.8);

    this.coreChemistryVisualDeepWeight = THREE.MathUtils.lerp(this.coreChemistryVisualDeepWeight, targetDeep, settle);
    this.coreChemistryVisualInnerWeight = THREE.MathUtils.lerp(this.coreChemistryVisualInnerWeight, targetInner, settle);
    this.coreChemistryVisualMembraneWeight = THREE.MathUtils.lerp(this.coreChemistryVisualMembraneWeight, targetMembrane, settle);
    this.coreChemistryVisualBalanceWeight = THREE.MathUtils.lerp(this.coreChemistryVisualBalanceWeight, targetBalance, settle);

    const deepWeight = this.coreChemistryVisualDeepWeight;
    const innerWeight = this.coreChemistryVisualInnerWeight;
    const membraneWeight = this.coreChemistryVisualMembraneWeight;
    const balanceWeight = this.coreChemistryVisualBalanceWeight;
    const deepPulse = (Math.sin(t * 1.18) + 1) * 0.5;
    const innerPulse = (Math.sin(t * 2.08 + 0.7) + 1) * 0.5;
    const membranePulse = (Math.sin(t * 2.82 + 1.35) + 1) * 0.5;
    const coordinatedPulse = (Math.sin(t * 2.02) + 1) * 0.5;

    // Deep-heavy bodies visibly contract around a brighter/larger nucleus.
    // Membrane-heavy bodies visibly widen and energize at the boundary.
    // Inner-heavy bodies keep the exterior quieter while the mantle becomes
    // fuller and more active. All of this is presentation-only.
    if (this.outerShell?.material) {
      const shellRadial = 1 - deepWeight * 0.105 + innerWeight * 0.025 + membraneWeight * (0.155 + membranePulse * 0.025);
      const shellAxial = 1 - deepWeight * 0.075 + innerWeight * 0.035 + membraneWeight * 0.105;
      this.outerShell.scale.x *= shellRadial;
      this.outerShell.scale.y *= shellRadial * (1 + membraneWeight * 0.035);
      this.outerShell.scale.z *= shellAxial;
      this.outerShell.material.opacity = THREE.MathUtils.clamp(
        this.outerShell.material.opacity * (1 - deepWeight * 0.28) + innerWeight * 0.035 + membraneWeight * 0.22,
        0.07,
        0.94
      );
      this.outerShell.material.emissiveIntensity += membraneWeight * (0.28 + membranePulse * 0.28)
        + innerWeight * 0.035
        + balanceWeight * (0.08 + coordinatedPulse * 0.08);
      if (this.outerShell.material.color?.lerp) this.outerShell.material.color.lerp(this.coreChemistryMembraneTint, membraneWeight * 0.16);
      if (this.outerShell.material.emissive?.lerp) this.outerShell.material.emissive.lerp(this.coreChemistryMembraneTint, membraneWeight * 0.2);
    }

    if (this.innerMantle?.material) {
      this.innerMantle.visible = this.innerMantle.visible || innerWeight > 0.02 || balanceWeight > 0.02;
      const mantlePulse = 1 + innerWeight * (0.055 + innerPulse * 0.055) + balanceWeight * coordinatedPulse * 0.025;
      this.innerMantle.scale.multiplyScalar((1 - deepWeight * 0.075 + innerWeight * 0.155 + membraneWeight * 0.025) * mantlePulse);
      this.innerMantle.material.opacity = THREE.MathUtils.clamp(
        this.innerMantle.material.opacity + innerWeight * (0.24 + innerPulse * 0.09) - deepWeight * 0.05 + balanceWeight * 0.08,
        0,
        0.95
      );
      this.innerMantle.material.emissiveIntensity = (this.innerMantle.material.emissiveIntensity ?? 0)
        + innerWeight * (0.24 + innerPulse * 0.24)
        + balanceWeight * (0.08 + coordinatedPulse * 0.08);
      if (this.innerMantle.material.color?.lerp) this.innerMantle.material.color.lerp(this.coreChemistryInnerTint, innerWeight * 0.18);
      if (this.innerMantle.material.emissive?.lerp) this.innerMantle.material.emissive.lerp(this.coreChemistryInnerTint, innerWeight * 0.22);
    }

    if (this.nucleus?.material) {
      const nucleusScale = 1 + deepWeight * (0.24 + deepPulse * 0.055) - membraneWeight * 0.055 + balanceWeight * coordinatedPulse * 0.025;
      this.nucleus.scale.multiplyScalar(nucleusScale);
      this.nucleus.material.emissiveIntensity += deepWeight * (0.62 + deepPulse * 0.42)
        + innerWeight * 0.055
        + balanceWeight * (0.16 + coordinatedPulse * 0.12);
      if (this.nucleus.material.color?.lerp) this.nucleus.material.color.lerp(this.coreChemistryDeepTint, deepWeight * 0.1);
      if (this.nucleus.material.emissive?.lerp) this.nucleus.material.emissive.lerp(this.coreChemistryDeepTint, deepWeight * 0.14);
    }

    // Existing authored surface anatomy carries the macro silhouette. Deep
    // concentration folds it inward; membrane saturation fans it outward.
    // 2:1 states naturally show the dominant layer with a secondary cue, and
    // 1:1:1 keeps all three layers comparably legible.
    const surfaceSpread = 1 - deepWeight * 0.105 + innerWeight * 0.035 + membraneWeight * (0.19 + membranePulse * 0.025);
    const surfaceScale = 1 - deepWeight * 0.08 + innerWeight * 0.055 + membraneWeight * (0.17 + membranePulse * 0.035);
    this.growthPetals.forEach((petal) => {
      petal.position.multiplyScalar(surfaceSpread);
      petal.scale.multiplyScalar(surfaceScale);
      if (petal.material) petal.material.emissiveIntensity += membraneWeight * 0.11 + innerWeight * 0.04;
    });
    this.growthPlates.forEach((plate) => {
      plate.position.multiplyScalar(1 - deepWeight * 0.075 + membraneWeight * 0.145);
      plate.scale.multiplyScalar(1 - deepWeight * 0.055 + innerWeight * 0.035 + membraneWeight * 0.13);
      if (plate.material) plate.material.emissiveIntensity += membraneWeight * 0.13;
    });
    this.growthNodes.forEach((node) => {
      node.position.multiplyScalar(1 - deepWeight * 0.065 + innerWeight * 0.035 + membraneWeight * 0.115);
      node.scale.multiplyScalar(1 + innerWeight * (0.05 + innerPulse * 0.04) + membraneWeight * 0.055);
      if (node.material) node.material.emissiveIntensity += innerWeight * 0.12 + membraneWeight * 0.08;
    });

    if (this.directionalProw?.material) {
      this.directionalProw.scale.multiplyScalar(1 - deepWeight * 0.055 + membraneWeight * 0.095);
      this.directionalProw.material.emissiveIntensity += membraneWeight * 0.08;
    }
    if (this.rearLobe?.material) {
      this.rearLobe.scale.multiplyScalar(1 - deepWeight * 0.045 + membraneWeight * 0.085);
    }

    // Publish the visual read separately from chemistry effects so later world
    // consequences can consume chemistry without owning presentation.
    this.playerRoot.userData.coreTopologyVisualRead = {
      pass: "HC-024D3",
      topologyId: topology.id,
      distribution: topology.distribution,
      deepWeight,
      innerWeight,
      membraneWeight,
      balanceWeight,
      nucleusDominance: deepWeight,
      mantleDominance: innerWeight,
      boundaryDominance: membraneWeight,
      gameplayEnvelopeChanged: false
    };
  }

  getCoreChemistryTelemetry(candidates) {
    if ((candidates?.length ?? 0) < 3) {
      return {
        complete: false,
        pieceCount: candidates?.length ?? 0,
        pairDistances: {},
        meanPairDistance: 0,
        minPairDistance: 0,
        maxPairDistance: 0,
        triangleArea: 0,
        normalizedArea: 0,
        uniformity: 0,
        radialSpan: 0,
        centroidRadius: 0,
        meanRadius: 0,
        polarization: 0,
        nearestPairPieceIds: [],
        isolatedPieceId: "none",
        radialOrderPieceIds: []
      };
    }

    const pieces = candidates.slice(0, 3);
    pieces.forEach((piece, index) => {
      const anchorLocal = piece.userData.coreWorkAnchorLocal;
      this.coreChemistryTelemetryPoints[index]
        .copy(anchorLocal ?? this.coreWorkTemp.set(0, 0, 0))
        .add(piece.position);
    });
    const [a, b, c] = this.coreChemistryTelemetryPoints;
    const dAB = a.distanceTo(b);
    const dAC = a.distanceTo(c);
    const dBC = b.distanceTo(c);
    const pairEntries = [
      { key: "grave_vascular", distance: dAB, indices: [0, 1] },
      { key: "grave_silt", distance: dAC, indices: [0, 2] },
      { key: "vascular_silt", distance: dBC, indices: [1, 2] }
    ].sort((left, right) => left.distance - right.distance);
    const distances = [dAB, dAC, dBC];
    const minPairDistance = pairEntries[0].distance;
    const maxPairDistance = pairEntries[2].distance;
    const meanPairDistance = distances.reduce((sum, value) => sum + value, 0) / 3;

    this.coreChemistryTelemetryEdgeA.copy(b).sub(a);
    this.coreChemistryTelemetryEdgeB.copy(c).sub(a);
    const triangleArea = this.coreChemistryTelemetryCross
      .crossVectors(this.coreChemistryTelemetryEdgeA, this.coreChemistryTelemetryEdgeB)
      .length() * 0.5;
    const normalizedArea = triangleArea / Math.max(0.0001, meanPairDistance * meanPairDistance);
    const uniformity = THREE.MathUtils.clamp(1 - (maxPairDistance - minPairDistance) / Math.max(0.0001, maxPairDistance), 0, 1);

    const radii = [a.length(), b.length(), c.length()];
    const minRadius = Math.min(...radii);
    const maxRadius = Math.max(...radii);
    const meanRadius = radii.reduce((sum, value) => sum + value, 0) / 3;
    const radialSpan = maxRadius - minRadius;
    this.coreChemistryTelemetryCentroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    const centroidRadius = this.coreChemistryTelemetryCentroid.length();
    const polarization = THREE.MathUtils.clamp(centroidRadius / Math.max(0.0001, meanRadius), 0, 1);

    const nearestPairIndices = pairEntries[0].indices;
    const isolatedIndex = [0, 1, 2].find((index) => !nearestPairIndices.includes(index)) ?? 2;
    const radialOrder = [0, 1, 2].sort((left, right) => radii[left] - radii[right]);
    const pieceId = (index) => pieces[index]?.name ?? `piece_${index}`;

    return {
      complete: true,
      pieceCount: 3,
      localPositions: pieces.map((piece, index) => ({
        pieceId: piece.name,
        x: this.coreChemistryTelemetryPoints[index].x,
        y: this.coreChemistryTelemetryPoints[index].y,
        z: this.coreChemistryTelemetryPoints[index].z,
        radius: radii[index]
      })),
      pairDistances: {
        grave_vascular: dAB,
        grave_silt: dAC,
        vascular_silt: dBC
      },
      meanPairDistance,
      minPairDistance,
      maxPairDistance,
      triangleArea,
      normalizedArea,
      uniformity,
      radialSpan,
      centroid: {
        x: this.coreChemistryTelemetryCentroid.x,
        y: this.coreChemistryTelemetryCentroid.y,
        z: this.coreChemistryTelemetryCentroid.z
      },
      centroidRadius,
      meanRadius,
      polarization,
      pairSeparationRatio: maxPairDistance / Math.max(0.0001, minPairDistance),
      nearestPairPieceIds: nearestPairIndices.map(pieceId),
      isolatedPieceId: pieceId(isolatedIndex),
      radialOrderPieceIds: radialOrder.map(pieceId)
    };
  }

  getCoreChemistryPatternDefinition(patternId) {
    const patterns = {
      tight_convergence: {
        id: "tight_convergence",
        label: "Tight Convergence",
        popStyle: "compress_rebound",
        intent: "all three retained anatomies enter one compact chemistry knot"
      },
      paired_counterpoint: {
        id: "paired_counterpoint",
        label: "Pair + Counterpoint",
        popStyle: "paired_counterpulse",
        intent: "two retained anatomies bind closely while the third remains a counterweight"
      },
      radial_ladder: {
        id: "radial_ladder",
        label: "Radial Ladder",
        popStyle: "deep_to_surface_wave",
        intent: "the three retained anatomies align across Core depth from center toward boundary"
      },
      linear_channel: {
        id: "linear_channel",
        label: "Linear Channel",
        popStyle: "sequential_channel_wave",
        intent: "the retained anatomies resolve into a narrow three-point channel"
      },
      balanced_triad: {
        id: "balanced_triad",
        label: "Balanced Triad",
        popStyle: "three_point_sync",
        intent: "the retained anatomies form a broad balanced triangle around the Core"
      },
      none: {
        id: "none",
        label: "Free Cloud",
        popStyle: "none",
        intent: "continuous chemistry cloud without a recognized telemetry lock"
      }
    };
    return patterns[patternId] ?? patterns.none;
  }

  classifyCoreChemistryPattern(telemetry) {
    if (!telemetry?.complete) return this.getCoreChemistryPatternDefinition("none");
    const {
      minPairDistance,
      maxPairDistance,
      normalizedArea,
      uniformity,
      radialSpan,
      polarization,
      pairSeparationRatio
    } = telemetry;

    // Priority matters: very compact or strongly paired arrangements should not
    // be mislabeled as generic lines/triangles simply because area also falls.
    if (maxPairDistance <= 0.56) return this.getCoreChemistryPatternDefinition("tight_convergence");
    if (minPairDistance <= 0.46 && maxPairDistance >= 0.78 && pairSeparationRatio >= 1.7) {
      return this.getCoreChemistryPatternDefinition("paired_counterpoint");
    }
    if (radialSpan >= 0.54 && normalizedArea <= 0.24 && maxPairDistance >= 0.72) {
      return this.getCoreChemistryPatternDefinition("radial_ladder");
    }
    if (normalizedArea <= 0.16 && maxPairDistance >= 0.78) {
      return this.getCoreChemistryPatternDefinition("linear_channel");
    }
    if (uniformity >= 0.73 && normalizedArea >= 0.30 && polarization <= 0.45) {
      return this.getCoreChemistryPatternDefinition("balanced_triad");
    }
    return this.getCoreChemistryPatternDefinition("none");
  }

  updateCoreChemistryPatternRecognition(t, dt, frameState, candidates, telemetry) {
    const rawPattern = this.classifyCoreChemistryPattern(telemetry);
    if (rawPattern.id !== this.coreChemistryPatternCandidateId) {
      this.coreChemistryPatternCandidateId = rawPattern.id;
      this.coreChemistryPatternCandidateAge = 0;
    } else {
      this.coreChemistryPatternCandidateAge += Math.max(0, dt);
    }

    const held = Boolean(frameState.coreWorkManipulation?.held);
    const dwell = rawPattern.id === "none" ? 0.34 : 0.18;
    if (!held && this.coreChemistryPatternCandidateAge >= dwell && rawPattern.id !== this.coreChemistryActivePatternId) {
      this.coreChemistryActivePatternId = rawPattern.id;
      if (rawPattern.id !== "none") {
        this.coreChemistryPatternPopId = rawPattern.id;
        this.coreChemistryPatternPopAge = 0;
        this.coreChemistryPatternPopCount += 1;
      }
    }

    this.coreChemistryPatternPopAge += Math.max(0, dt);
    const popActive = this.coreChemistryPatternPopId !== "none"
      && this.coreChemistryPatternPopAge < this.coreChemistryPatternPopDuration;
    const popPattern = this.getCoreChemistryPatternDefinition(this.coreChemistryPatternPopId);
    if (popActive) {
      this.applyCoreChemistryPatternPop(candidates, telemetry, popPattern, t);
    } else {
      if (this.coreChemistryPatternPopId !== "none") this.coreChemistryPatternPopId = "none";
      this.playerRoot.userData.coreChemistryPatternPop = {
        pass: "HC-024D3",
        patternId: "none",
        label: "none",
        progress: 1,
        popCount: this.coreChemistryPatternPopCount,
        animationOnly: true
      };
    }

    return {
      enabled: true,
      classifierVersion: "HC-024D3-cloud-v1",
      recognizedPatternCount: 5,
      rawPatternId: rawPattern.id,
      rawPatternLabel: rawPattern.label,
      candidatePatternId: this.coreChemistryPatternCandidateId,
      candidateAge: this.coreChemistryPatternCandidateAge,
      stablePatternId: this.coreChemistryActivePatternId,
      stablePatternLabel: this.getCoreChemistryPatternDefinition(this.coreChemistryActivePatternId).label,
      stablePatternIntent: this.getCoreChemistryPatternDefinition(this.coreChemistryActivePatternId).intent,
      heldBlocksCommit: held,
      activationDwellSeconds: 0.18,
      releaseDwellSeconds: 0.34,
      popActive,
      popPatternId: popActive ? popPattern.id : "none",
      popPatternLabel: popActive ? popPattern.label : "none",
      popAge01: popActive ? THREE.MathUtils.clamp(this.coreChemistryPatternPopAge / this.coreChemistryPatternPopDuration, 0, 1) : 1,
      popCount: this.coreChemistryPatternPopCount,
      oneShotOnRecognizedStateEntry: true,
      repeatWhileStable: false,
      worldConsequencesEnabled: false
    };
  }

  applyCoreChemistryPatternPop(candidates, telemetry, pattern, t) {
    if (!pattern || pattern.id === "none") return;
    const progress = THREE.MathUtils.clamp(this.coreChemistryPatternPopAge / this.coreChemistryPatternPopDuration, 0, 1);
    const envelope = Math.sin(progress * Math.PI);
    const sharp = Math.pow(envelope, 0.72);
    const pieceById = new Map(candidates.map((piece) => [piece.name, piece]));
    const emphasize = (piece, amount, tintAmount = 0.16) => {
      if (!piece || amount <= 0) return;
      piece.scale.multiplyScalar(1 + amount);
      this.forEachCoreWorkMaterial(piece, (material) => {
        material.emissiveIntensity = (material.emissiveIntensity ?? 0) + amount * 3.4;
        if (material.emissive?.lerp) material.emissive.lerp(this.coreChemistryPatternTint, tintAmount * envelope);
      });
    };

    if (pattern.id === "tight_convergence") {
      candidates.forEach((piece) => emphasize(piece, sharp * 0.13));
      if (this.nucleus?.material) {
        this.nucleus.scale.multiplyScalar(1 + sharp * 0.22);
        this.nucleus.material.emissiveIntensity += sharp * 1.15;
      }
      if (this.outerShell) this.outerShell.scale.multiplyScalar(1 - sharp * 0.045);
    } else if (pattern.id === "balanced_triad") {
      candidates.forEach((piece) => emphasize(piece, sharp * 0.115, 0.2));
      if (this.nucleus?.material) this.nucleus.material.emissiveIntensity += sharp * 0.72;
      if (this.innerMantle?.material) this.innerMantle.material.emissiveIntensity += sharp * 0.68;
      if (this.outerShell?.material) this.outerShell.material.emissiveIntensity += sharp * 0.62;
    } else if (pattern.id === "paired_counterpoint") {
      telemetry.nearestPairPieceIds.forEach((id) => emphasize(pieceById.get(id), sharp * 0.16, 0.22));
      const isolated = pieceById.get(telemetry.isolatedPieceId);
      const counter = Math.pow(Math.sin(THREE.MathUtils.clamp(progress * 1.18 - 0.18, 0, 1) * Math.PI), 0.8);
      emphasize(isolated, counter * 0.105, 0.12);
    } else if (pattern.id === "radial_ladder") {
      telemetry.radialOrderPieceIds.forEach((id, index) => {
        const center = 0.2 + index * 0.25;
        const wave = Math.exp(-Math.pow((progress - center) / 0.14, 2));
        emphasize(pieceById.get(id), wave * 0.17, 0.18);
      });
      if (this.outerShell?.material) this.outerShell.material.emissiveIntensity += envelope * 0.28;
    } else if (pattern.id === "linear_channel") {
      const positions = telemetry.localPositions ?? [];
      if (positions.length === 3) {
        let farA = 0;
        let farB = 1;
        let best = -1;
        for (let i = 0; i < positions.length; i += 1) {
          for (let j = i + 1; j < positions.length; j += 1) {
            const dx = positions[i].x - positions[j].x;
            const dy = positions[i].y - positions[j].y;
            const dz = positions[i].z - positions[j].z;
            const d = dx * dx + dy * dy + dz * dz;
            if (d > best) { best = d; farA = i; farB = j; }
          }
        }
        const start = positions[farA];
        const end = positions[farB];
        const ax = end.x - start.x;
        const ay = end.y - start.y;
        const az = end.z - start.z;
        const denom = Math.max(0.0001, ax * ax + ay * ay + az * az);
        const ordered = positions.map((position) => ({
          pieceId: position.pieceId,
          projection: ((position.x - start.x) * ax + (position.y - start.y) * ay + (position.z - start.z) * az) / denom
        })).sort((left, right) => left.projection - right.projection);
        ordered.forEach((entry, index) => {
          const center = 0.18 + index * 0.27;
          const wave = Math.exp(-Math.pow((progress - center) / 0.13, 2));
          emphasize(pieceById.get(entry.pieceId), wave * 0.18, 0.2);
        });
      }
    }

    this.playerRoot.userData.coreChemistryPatternPop = {
      pass: "HC-024D3",
      patternId: pattern.id,
      label: pattern.label,
      progress,
      popCount: this.coreChemistryPatternPopCount,
      animationOnly: true
    };
  }

  buildCoreChemistryWorldOutput(placements, topology, telemetry, cloudPattern) {
    const zoneExposure = { deep_core: 0.06, inner_body: 0.28, membrane: 1.0 };
    const familyStrength = { grave_memory: 0, vascular_rhythm: 0, silt_pressure: 0 };
    const outputFamilyByRetentionFamily = {
      grave_memory_retention: "grave_memory",
      vascular_rhythm_retention: "vascular_rhythm",
      silt_pressure_retention: "silt_pressure"
    };
    for (const placement of placements ?? []) {
      const exposure = zoneExposure[placement.zoneId] ?? 0;
      const outputFamily = outputFamilyByRetentionFamily[placement.family] ?? placement.family;
      if (familyStrength[outputFamily] !== undefined) {
        familyStrength[outputFamily] = Math.max(familyStrength[outputFamily], exposure);
      }
    }

    const deepCount = (placements ?? []).filter((entry) => entry.zoneId === "deep_core").length;
    const innerCount = (placements ?? []).filter((entry) => entry.zoneId === "inner_body").length;
    const membraneCount = (placements ?? []).filter((entry) => entry.zoneId === "membrane").length;
    const surfaceExpression = THREE.MathUtils.clamp(membraneCount / 3, 0, 1);
    const patternId = cloudPattern?.stablePatternId ?? "none";
    const patternProfile = {
      balanced_triad: { strength: 1.0, radius: 4.5, directionality: 0.04, spread: "distributed" },
      tight_convergence: { strength: 1.28, radius: 2.8, directionality: 0.08, spread: "concentrated" },
      paired_counterpoint: { strength: 1.12, radius: 3.7, directionality: 0.56, spread: "paired" },
      radial_ladder: { strength: 1.16, radius: 4.15, directionality: 0.76, spread: "radial" },
      linear_channel: { strength: 1.20, radius: 4.65, directionality: 0.92, spread: "channeled" },
      none: { strength: 0.86, radius: 3.45, directionality: THREE.MathUtils.clamp(telemetry?.polarization ?? 0, 0, 0.72), spread: "free" }
    }[patternId] ?? { strength: 0.86, radius: 3.45, directionality: 0, spread: "free" };

    const positions = telemetry?.localPositions ?? [];
    const siltPlacement = (placements ?? []).find((entry) => entry.family === "silt_pressure_retention") ?? null;
    const siltPosition = siltPlacement
      ? positions.find((entry) => entry.pieceId === siltPlacement.pieceId) ?? null
      : null;
    this.coreChemistrySiltLocalDirection.set(0, 0, -1);
    if (siltPosition) {
      this.coreChemistrySiltLocalDirection.set(siltPosition.x ?? 0, siltPosition.y ?? 0, siltPosition.z ?? -1);
      if (this.coreChemistrySiltLocalDirection.lengthSq() > 0.0001) this.coreChemistrySiltLocalDirection.normalize();
    }

    this.coreChemistryOutputLocalDirection.set(0, 0, -1);
    if (positions.length === 3) {
      let directionSource = null;
      if (patternId === "radial_ladder") {
        directionSource = positions.reduce((outer, entry) => !outer || entry.radius > outer.radius ? entry : outer, null);
      } else if (patternId === "linear_channel") {
        directionSource = positions.reduce((outer, entry) => !outer || entry.radius > outer.radius ? entry : outer, null);
      } else if ((telemetry?.centroidRadius ?? 0) > 0.08) {
        directionSource = telemetry.centroid;
      }
      if (directionSource) {
        this.coreChemistryOutputLocalDirection.set(directionSource.x ?? 0, directionSource.y ?? 0, directionSource.z ?? -1);
        if (this.coreChemistryOutputLocalDirection.lengthSq() > 0.0001) this.coreChemistryOutputLocalDirection.normalize();
      }
    }
    this.bodyFrame?.getWorldQuaternion(this.coreChemistryOutputWorldQuaternion);
    this.coreChemistryOutputWorldDirection.copy(this.coreChemistryOutputLocalDirection).applyQuaternion(this.coreChemistryOutputWorldQuaternion).normalize();
    this.coreChemistrySiltWorldDirection.copy(this.coreChemistrySiltLocalDirection).applyQuaternion(this.coreChemistryOutputWorldQuaternion).normalize();

    const memory = familyStrength.grave_memory;
    const rhythm = familyStrength.vascular_rhythm;
    const pressure = familyStrength.silt_pressure;
    const strongest = Math.max(memory, rhythm, pressure);
    const strongFamilies = [
      ["grave_memory", memory],
      ["vascular_rhythm", rhythm],
      ["silt_pressure", pressure]
    ].filter(([, value]) => strongest > 0.08 && Math.abs(value - strongest) < 0.08);
    const dominantFamily = strongest <= 0.08 ? "none"
      : strongFamilies.length > 1 ? "mixed_membrane"
      : strongFamilies[0]?.[0] ?? "none";
    const dominantMode = dominantFamily === "grave_memory" ? "residue_sense"
      : dominantFamily === "vascular_rhythm" ? "signal_skin"
      : dominantFamily === "silt_pressure" ? "adhesion_skin"
      : dominantFamily === "mixed_membrane" ? "mixed_membrane_expression"
      : "quiet_core";

    return {
      pass: "HC-024E",
      active: surfaceExpression > 0.001,
      source: "spatial_core_chemistry",
      memory: Number(memory.toFixed(3)),
      rhythm: Number(rhythm.toFixed(3)),
      pressure: Number(pressure.toFixed(3)),
      surfaceExpression: Number(surfaceExpression.toFixed(3)),
      deepConcentration: Number((deepCount / 3).toFixed(3)),
      innerCirculation: Number((innerCount / 3).toFixed(3)),
      dominantFamily,
      dominantMode,
      topologyId: topology?.id ?? "forming",
      topologyDistribution: topology?.distribution ?? "0:0:0",
      cloudPatternId: patternId,
      cloudPatternLabel: cloudPattern?.stablePatternLabel ?? "Free Cloud",
      patternStrength: patternProfile.strength,
      responseRadius: patternProfile.radius,
      directionality: patternProfile.directionality,
      spreadMode: patternProfile.spread,
      localDirection: { x: this.coreChemistryOutputLocalDirection.x, y: this.coreChemistryOutputLocalDirection.y, z: this.coreChemistryOutputLocalDirection.z },
      worldDirection: { x: this.coreChemistryOutputWorldDirection.x, y: this.coreChemistryOutputWorldDirection.y, z: this.coreChemistryOutputWorldDirection.z },
      siltZoneId: siltPlacement?.zoneId ?? "none",
      siltDepth01: Number((siltPlacement?.depth01 ?? 0).toFixed(3)),
      siltMembraneExposure: siltPlacement?.zoneId === "membrane" ? 1 : 0,
      siltLocalDirection: { x: this.coreChemistrySiltLocalDirection.x, y: this.coreChemistrySiltLocalDirection.y, z: this.coreChemistrySiltLocalDirection.z },
      siltWorldDirection: { x: this.coreChemistrySiltWorldDirection.x, y: this.coreChemistrySiltWorldDirection.y, z: this.coreChemistrySiltWorldDirection.z },
      visualHostResponseEnabled: true,
      movementConsequencesEnabled: true,
      movementConsequenceOwner: "PlayerMovementController",
      movementConsequenceScope: "silt_membrane_attachment_on_existing_boundary_only",
      collisionConsequencesEnabled: false,
      progressionAuthority: false,
      geometryAuthority: false
    };
  }

  updateSpatialCoreChemistry(t, dt, frameState) {
    const candidates = [this.memoryImprintRoot, this.vascularFilamentRoot, this.siltAdaptationRoot]
      .filter((piece) => piece?.visible && piece.userData.coreWorkManipulable === true);
    const counts = { deep_core: 0, inner_body: 0, membrane: 0 };
    const placements = [];

    candidates.forEach((piece) => {
      const zone = this.getSpatialChemistryZone(piece);
      const interaction = this.getSpatialChemistryInteraction(piece, zone.zoneId);
      if (counts[zone.zoneId] !== undefined) counts[zone.zoneId] += 1;
      placements.push({
        pieceId: piece.name,
        label: piece.userData.coreWorkLabel ?? piece.name,
        family: piece.userData.coreWorkFamily ?? "unknown",
        zoneId: zone.zoneId,
        zoneLabel: zone.zoneLabel,
        depth01: zone.depth01,
        depthPercent: Math.round(zone.depth01 * 100),
        interactionId: interaction.id,
        interactionLabel: interaction.label,
        interactionIntent: interaction.intent
      });
      this.applySpatialChemistryPieceVisual(piece, zone.zoneId, interaction, t);
    });

    const topology = this.getWholeCoreTopology(counts, candidates.length);
    if (topology.id !== this.coreChemistryLastTopologyId) {
      this.coreChemistryLastTopologyId = topology.id;
      this.coreChemistryTopologyChangeCount += 1;
    }
    this.applyWholeCoreTopologyVisual(topology, counts, candidates.length, t, dt);

    const telemetry = this.getCoreChemistryTelemetry(candidates);
    const cloudPattern = this.updateCoreChemistryPatternRecognition(t, dt, frameState, candidates, telemetry);
    const worldOutput = this.buildCoreChemistryWorldOutput(placements, topology, telemetry, cloudPattern);
    frameState.coreChemistryOutput = worldOutput;
    const selectedId = frameState.coreWorkManipulation?.selectedPieceId ?? "none";
    const selectedPlacement = placements.find((entry) => entry.pieceId === selectedId) ?? null;
    const chemistryState = {
      pass: "HC-024E",
      active: candidates.length > 0,
      visualChemistryEnabled: true,
      gameplayConsequencesEnabled: true,
      gameplayConsequenceScope: "Silt membrane attachment proof only",
      worldResponseEnabled: true,
      worldOutput,
      recipeMenuUsed: false,
      inventorySlotsUsed: false,
      bodyZones: ["deep_core", "inner_body", "membrane"],
      bodyZoneLabels: ["Deep Core", "Inner Body", "Membrane"],
      fundamentalInteractionCount: 9,
      topologyStateCount: 10,
      retainedPieceCount: candidates.length,
      counts: { ...counts },
      topology,
      placements,
      selectedPlacement,
      topologyChangeCount: this.coreChemistryTopologyChangeCount,
      cloudTelemetry: telemetry,
      cloudPattern,
      cloudPatternRecognitionEnabled: true,
      cloudPatternPopEnabled: true,
      recognizedCloudPatternCount: 5,
      scenarioRule: "component identity defines contribution; three-piece zone distribution defines whole-Core topology; exact 3D telemetry can additionally resolve chemistry-cloud patterns",
      topologyRule: "3 all-in-one + 6 two-to-one + 1 one-each = 10 whole-Core states",
      cloudRule: "pair distances + triangle area + centroid polarization + radial span classify stable three-piece geometry",
      nextLayerLocked: "additional contact surfaces, collision coverage, non-Silt locomotion consequences, progression, and return traversal remain deferred"
    };
    frameState.spatialCoreChemistry = chemistryState;
    this.playerRoot.userData.spatialCoreChemistry = {
      topologyId: topology.id,
      distribution: topology.distribution,
      retainedPieceCount: candidates.length,
      cloudPatternId: cloudPattern.stablePatternId,
      cloudPatternPopCount: cloudPattern.popCount,
      worldResponseMode: worldOutput.dominantMode
    };

    if (frameState.coreWorkManipulation) {
      frameState.coreWorkManipulation.chemistryEnabled = true;
      frameState.coreWorkManipulation.chemistryMutation = true;
      frameState.coreWorkManipulation.selectedChemistry = selectedPlacement;
      frameState.coreWorkManipulation.topology = topology;
      frameState.coreWorkManipulation.zoneCounts = { ...counts };
      frameState.coreWorkManipulation.cloudTelemetry = telemetry;
      frameState.coreWorkManipulation.cloudPattern = cloudPattern;
      frameState.coreWorkManipulation.worldOutput = worldOutput;
      frameState.coreWorkManipulation.pass = "HC-024E";
    }
  }

  getCoreWorkAnchorLocal(piece, target) {
    const anchor = piece?.userData?.coreWorkAnchorLocal;
    if (!piece || !anchor) return target.set(0, 0, 0);
    piece.updateMatrix();
    return target.copy(anchor).applyMatrix4(piece.matrix);
  }

  getCoreWorkAnchorWorld(piece, target) {
    const anchor = piece?.userData?.coreWorkAnchorLocal;
    if (!piece || !anchor) return target.copy(this.playerRoot.position);
    piece.updateWorldMatrix(true, false);
    return target.copy(anchor).applyMatrix4(piece.matrixWorld);
  }

  forEachCoreWorkMaterial(piece, callback) {
    piece?.traverse((child) => {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.filter(Boolean).forEach(callback);
    });
  }

  createCoreWorkManipulationState({
    active = false,
    candidateCount = 0,
    selected = null,
    movedThisFrame = false,
    selectedWorldPosition = null,
    selectedRadius = 0,
    selectedDepth01 = 0,
    selectedDepthBand = "none",
    depthInput = 0,
    depthDirection = "steady",
    status = null
  } = {}) {
    return {
      pass: "HC-024D3",
      active: Boolean(active),
      enabled: true,
      chemistryEnabled: true,
      candidateFamily: "recognizable_retained_route_anatomy_groups",
      candidateCount,
      maximumPrototypeCandidates: 3,
      selectedPieceId: selected?.name ?? this.coreWorkSelectedPieceId ?? "none",
      selectedPieceLabel: selected?.userData?.coreWorkLabel ?? "none",
      selectedIndex: candidateCount > 0 ? this.coreWorkSelectedIndex : -1,
      held: Boolean(active && this.coreWorkPieceHeld),
      movedThisFrame: Boolean(movedThisFrame),
      selectedRadius,
      selectedDepth01,
      selectedDepthPercent: Math.round(selectedDepth01 * 100),
      selectedDepthBand,
      depthInput,
      depthDirection,
      depthRange: {
        minimumRadius: this.coreWorkMinimumRadius,
        maximumRadius: this.coreWorkMaximumRadius,
        speed: this.coreWorkDepthSpeed
      },
      grabCount: this.coreWorkGrabCount,
      placementCount: this.coreWorkPlacementCount,
      lastEvent: this.coreWorkLastEvent,
      status: status ?? (active
        ? (this.coreWorkPieceHeld ? "guide_holding_selected_piece" : "guide_attending_selected_piece")
        : "inactive_persistent_arrangement"),
      selectedWorldPosition: selectedWorldPosition
        ? { x: selectedWorldPosition.x, y: selectedWorldPosition.y, z: selectedWorldPosition.z }
        : null,
      controls: {
        select: "D-Pad Left/Right",
        grabPlace: "A controller / E keyboard",
        moveHeldPiece: "Left Stick / WASD",
        depth: "RT outward / LT inward",
        orbitView: "Right Stick",
        back: "B / Escape",
        world: "Y / F"
      },
      worldTraversalSuppressed: Boolean(active),
      worldVerbsSuppressed: Boolean(active),
      newPieceSpawned: false,
      progressionMutation: false,
      chemistryMutation: true
    };
  }

  createWake() {
    this.wakeRoot = new THREE.Group();
    this.wakeRoot.name = "player_seed_fluid_wake";
    this.wakeRoot.userData.targetingSuppressed = true;
    this.wakeRoot.userData.presentationOwner = "CoreEmbodimentSystem";
    this.scene.add(this.wakeRoot);

    const colors = [0xffd99b, 0x9fe8ff, 0xc8f6ff];
    for (let index = 0; index < 12; index += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const mote = new THREE.Mesh(
        new THREE.SphereGeometry(0.025 + (index % 3) * 0.009, 7, 5),
        material
      );
      mote.name = `player_seed_wake_mote_${index + 1}`;
      mote.userData.phase = index * 1.73;
      mote.userData.targetingSuppressed = true;
      this.playerRoot.getWorldPosition(mote.position);
      this.wakeRoot.add(mote);
      this.wakeMotes.push(mote);
    }
  }

  animateWake(t, dt, speed, slipStrength, boost) {
    if (!this.wakeRoot) return;
    this.playerRoot.getWorldPosition(this.worldPosition);
    const speedWeight = Math.min(1, speed / 2.8);
    const visibleWeight = Math.max(speedWeight * 0.9, slipStrength * 0.55);

    this.wakeMotes.forEach((mote, index) => {
      const distance = 0.24 + index * (0.095 + speedWeight * 0.03);
      const sideWave = Math.sin(t * 2.2 - index * 0.74 + mote.userData.phase) * (0.035 + index * 0.006);
      const liftWave = Math.cos(t * 1.7 - index * 0.52) * (0.025 + index * 0.003);
      this.wakeTarget.copy(this.worldPosition)
        .addScaledVector(this.direction, -distance)
        .addScaledVector(this.side, sideWave)
        .addScaledVector(this.up, liftWave);

      const follow = 1 - Math.exp(-dt * Math.max(2.2, 8.5 - index * 0.38));
      mote.position.lerp(this.wakeTarget, follow);
      mote.material.opacity = visibleWeight * Math.max(0, 0.22 - index * 0.014) * (boost ? 1.25 : 1);
      mote.scale.setScalar(0.52 + speedWeight * 0.54 + (index % 3) * 0.05);
    });
  }

  updateCoreContactLanguage(t, dt, frameState) {
    const kinematics = frameState.playerKinematics ?? {};
    const boundary = kinematics.movementBoundary ?? {};
    const chemistry = frameState.coreChemistryOutput ?? {};
    const inspection = frameState.tightInspectionCamera ?? {};
    const coreWorkActive = Boolean(inspection.coreWorkActive);
    const proximity = THREE.MathUtils.clamp(boundary.proximity ?? 0, 0, 1);
    const radialSpeed = Number.isFinite(boundary.radialSpeed) ? boundary.radialSpeed : 0;
    const tangentialSpeed = Math.max(0, boundary.tangentialSpeed ?? 0);
    const boundaryPressure = THREE.MathUtils.clamp(boundary.pressure ?? kinematics.boundaryPressure ?? 0, 0, 1);
    const adhesionVisualBias = THREE.MathUtils.clamp(
      (chemistry.pressure ?? 0) * (chemistry.surfaceExpression ?? 0),
      0,
      1
    );

    const surfaceTruth = frameState.coreSurfaceTruth ?? {};
    const supportPlane = frameState.coreTendrilSupportPlane ?? {};
    const normal = supportPlane.active
      ? (supportPlane.supportNormal ?? {})
      : (surfaceTruth.valid && surfaceTruth.mechanicalEligible !== false)
        ? (surfaceTruth.normal ?? {})
        : (boundary.surfaceNormal ?? {});
    this.coreContactWorldNormal.set(normal.x ?? 0, normal.y ?? 1, normal.z ?? 0);
    if (this.coreContactWorldNormal.lengthSq() < 0.0001) this.coreContactWorldNormal.set(0, 1, 0);
    else this.coreContactWorldNormal.normalize();

    const physicalAttachment = frameState.playerAttachment ?? {};
    const physicalAttachmentActive = physicalAttachment.active === true;
    // BOT1-D11D: this is only first-touch brushing, not a mechanical latch.
    // A registered surface must be close and the Core must not be peeling away.
    // Tendril sealing -> support plane -> movement attachment keep their owners.
    const authoredSurfaceBrushReady = canBeginAuthoredSurfaceBrush({
      surfaceTruth,
      kinematics,
      physicalAttachment,
      coreWorkActive
    });
    const physicalAttachmentReleasing = physicalAttachment.state === "releasing";

    let nextState = this.coreContactState;
    if (coreWorkActive) {
      nextState = "suspended";
    } else if (physicalAttachmentActive) {
      nextState = "attached";
    } else if (physicalAttachmentReleasing) {
      nextState = "releasing";
      if (this.coreContactState !== "releasing") this.coreContactReleaseAge = 0;
    } else {
      const wasContacting = this.coreContactState === "attached" || this.coreContactState === "brushing";
      const movingAway = radialSpeed < -0.12;
      const settledAtBoundary = proximity >= 0.88
        && Math.abs(radialSpeed) < (0.42 + adhesionVisualBias * 0.18)
        && (boundaryPressure > 0.01 || tangentialSpeed < 0.82 || adhesionVisualBias > 0.22);
      const grazingBoundary = proximity >= 0.56
        && (tangentialSpeed > 0.18 || radialSpeed > 0.04 || boundaryPressure > 0.005);

      if (wasContacting && movingAway && proximity < 0.84) {
        nextState = "releasing";
        this.coreContactReleaseAge = 0;
      } else if (settledAtBoundary) {
        nextState = "attached";
      } else if (grazingBoundary) {
        nextState = "brushing";
      } else if (authoredSurfaceBrushReady) {
        // Registered, near contact can initiate the first reaching tendril.
        // The visual "attached" state remains reserved for physicalAttachment.
        nextState = "brushing";
      } else if (this.coreContactState === "releasing" && this.coreContactReleaseAge < 0.46) {
        nextState = "releasing";
      } else {
        nextState = "suspended";
      }
    }

    if (nextState !== this.coreContactState) {
      this.coreContactPreviousState = this.coreContactState;
      this.coreContactState = nextState;
      this.coreContactStateAge = 0;
      if (nextState === "releasing") this.coreContactReleaseAge = 0;
    } else {
      this.coreContactStateAge += Math.max(0, dt);
    }
    this.coreContactReleaseAge += Math.max(0, dt);

    const targets = {
      suspended: [1, 0, 0, 0],
      brushing: [0.18, 1, 0.08, 0],
      attached: [0.04, 0.18, 1, 0],
      releasing: [0.32, 0, 0.08, 1]
    }[this.coreContactState] ?? [1, 0, 0, 0];
    const settle = 1 - Math.exp(-Math.max(0, dt) * (this.coreContactState === "releasing" ? 9.5 : 7.2));
    this.coreContactSuspendedWeight = THREE.MathUtils.lerp(this.coreContactSuspendedWeight, targets[0], settle);
    this.coreContactBrushWeight = THREE.MathUtils.lerp(this.coreContactBrushWeight, targets[1], settle);
    this.coreContactAttachWeight = THREE.MathUtils.lerp(this.coreContactAttachWeight, targets[2], settle);
    this.coreContactReleaseWeight = THREE.MathUtils.lerp(this.coreContactReleaseWeight, targets[3], settle);

    this.bodyFrame?.getWorldQuaternion(this.coreContactWorldQuaternion);
    this.coreContactInverseQuaternion.copy(this.coreContactWorldQuaternion).invert();
    this.coreContactLocalNormal.copy(this.coreContactWorldNormal).applyQuaternion(this.coreContactInverseQuaternion).normalize();
    this.coreContactNormalAbs.set(
      Math.abs(this.coreContactLocalNormal.x),
      Math.abs(this.coreContactLocalNormal.y),
      Math.abs(this.coreContactLocalNormal.z)
    );

    const brush = this.coreContactBrushWeight * proximity;
    const attach = this.coreContactAttachWeight * proximity * (0.82 + adhesionVisualBias * 0.28);
    const releaseEnvelope = this.coreContactReleaseWeight
      * Math.max(0, 1 - this.coreContactReleaseAge / 0.52);
    const releasePulse = releaseEnvelope * Math.sin(Math.min(1, this.coreContactReleaseAge / 0.46) * Math.PI);

    // Directional body deformation reuses the authored Core. It never moves the
    // playerRoot: contact is visible in silhouette rather than simulated by a
    // second collision/attachment system.
    if (this.bodyFrame) {
      const normalCompression = attach * 0.15 + brush * 0.055;
      const tangentSpread = attach * 0.065 + brush * 0.025;
      this.bodyFrame.scale.x *= 1 - this.coreContactNormalAbs.x * normalCompression + (1 - this.coreContactNormalAbs.x) * tangentSpread;
      this.bodyFrame.scale.y *= 1 - this.coreContactNormalAbs.y * normalCompression + (1 - this.coreContactNormalAbs.y) * tangentSpread;
      this.bodyFrame.scale.z *= 1 - this.coreContactNormalAbs.z * normalCompression + (1 - this.coreContactNormalAbs.z) * tangentSpread + releasePulse * 0.045;

      // HC031F1A: a newly loaded tendril briefly stretches the authored Core
      // toward the planted anchor. This is presentation-only; playerRoot remains
      // exclusively owned by PlayerMovementController.
      const leadingAnchor = physicalAttachment.tendrilLeadingAnchorWorld;
      const loadPulse = THREE.MathUtils.clamp(physicalAttachment.tendrilLoadPulse01 ?? 0, 0, 1);
      if (leadingAnchor && loadPulse > 0.01) {
        this.coreTendrilPullWorld.set(
          (leadingAnchor.x ?? 0) - (kinematics.position?.x ?? 0),
          (leadingAnchor.y ?? 0) - (kinematics.position?.y ?? 0),
          (leadingAnchor.z ?? 0) - (kinematics.position?.z ?? 0)
        );
        if (this.coreTendrilPullWorld.lengthSq() > 0.0001) {
          this.coreTendrilPullLocal.copy(this.coreTendrilPullWorld).normalize()
            .applyQuaternion(this.coreContactInverseQuaternion);
          const ax = Math.abs(this.coreTendrilPullLocal.x);
          const ay = Math.abs(this.coreTendrilPullLocal.y);
          const az = Math.abs(this.coreTendrilPullLocal.z);
          const stretch = loadPulse * 0.065;
          this.bodyFrame.scale.x *= 1 + ax * stretch - (1 - ax) * stretch * 0.22;
          this.bodyFrame.scale.y *= 1 + ay * stretch - (1 - ay) * stretch * 0.22;
          this.bodyFrame.scale.z *= 1 + az * stretch - (1 - az) * stretch * 0.22;
        }
      }
    }

    if (this.outerShell?.material) {
      const shellPulse = (Math.sin(t * (this.coreContactState === "brushing" ? 7.4 : 3.1)) + 1) * 0.5;
      this.outerShell.material.emissiveIntensity += brush * (0.10 + shellPulse * 0.08) + attach * 0.24 + releasePulse * 0.18;
      if (this.outerShell.material.emissive?.lerp) {
        this.outerShell.material.emissive.lerp(
          this.coreContactState === "releasing" ? this.coreContactReleaseTint : this.coreContactTint,
          THREE.MathUtils.clamp(brush * 0.12 + attach * 0.18 + releasePulse * 0.16, 0, 0.28)
        );
      }
      const shellCompression = attach * 0.095 + brush * 0.035;
      const shellSpread = attach * 0.055 + brush * 0.018;
      this.outerShell.scale.x *= 1 - this.coreContactNormalAbs.x * shellCompression + (1 - this.coreContactNormalAbs.x) * shellSpread;
      this.outerShell.scale.y *= 1 - this.coreContactNormalAbs.y * shellCompression + (1 - this.coreContactNormalAbs.y) * shellSpread;
      this.outerShell.scale.z *= 1 - this.coreContactNormalAbs.z * shellCompression + (1 - this.coreContactNormalAbs.z) * shellSpread;
    }

    const emphasizeSurfacePart = (part, amount, maxSpread = 0.16, allowPositionShift = true) => {
      if (!part?.visible || amount <= 0.001) return;
      this.coreWorkTemp.copy(part.position);
      if (this.coreWorkTemp.lengthSq() < 0.0001) return;
      const sideWeight = Math.max(0, this.coreWorkTemp.normalize().dot(this.coreContactLocalNormal));
      if (sideWeight <= 0.02) return;
      const response = sideWeight * amount;
      part.scale.multiplyScalar(1 + response * maxSpread);
      if (allowPositionShift) part.position.addScaledVector(this.coreContactLocalNormal, response * 0.035);
      if (part.material) part.material.emissiveIntensity = (part.material.emissiveIntensity ?? 0) + response * 0.18;
    };
    this.growthPetals.forEach((part) => emphasizeSurfacePart(part, attach + brush * 0.62, 0.18));
    this.growthPlates.forEach((part) => emphasizeSurfacePart(part, attach + brush * 0.48, 0.12));
    this.fins.forEach((part) => emphasizeSurfacePart(part, brush * 0.68 + releasePulse * 0.35, 0.1, false));

    frameState.coreContactLanguage = {
      pass: "HC-025B",
      active: true,
      state: this.coreContactState,
      previousState: this.coreContactPreviousState,
      stateAge: Number(this.coreContactStateAge.toFixed(2)),
      suspendedWeight: Number(this.coreContactSuspendedWeight.toFixed(2)),
      brushingWeight: Number(this.coreContactBrushWeight.toFixed(2)),
      attachedWeight: Number(this.coreContactAttachWeight.toFixed(2)),
      releasingWeight: Number(this.coreContactReleaseWeight.toFixed(2)),
      boundaryProximity: Number(proximity.toFixed(3)),
      radialSpeed: Number(radialSpeed.toFixed(3)),
      tangentialSpeed: Number(tangentialSpeed.toFixed(3)),
      adhesionVisualBias: Number(adhesionVisualBias.toFixed(3)),
      surfaceNormal: {
        x: Number(this.coreContactWorldNormal.x.toFixed(3)),
        y: Number(this.coreContactWorldNormal.y.toFixed(3)),
        z: Number(this.coreContactWorldNormal.z.toFixed(3))
      },
      visualOnly: false,
      usesExistingMovementBoundaryTelemetry: true,
      chemistryCanAmplifyVisualAttachment: true,
      movementConsequencesEnabled: true,
      movementConsequenceOwner: "PlayerMovementController",
      attachmentState: physicalAttachment.state ?? "free",
      supportPlaneConformActive: Boolean(supportPlane.active),
      supportPlaneQuality01: Number((supportPlane.supportQuality01 ?? 0).toFixed?.(3) ?? supportPlane.supportQuality01 ?? 0),
      adhesionStrength: Number((physicalAttachment.adhesionStrength ?? 0).toFixed(3)),
      siltSurfaceAlignment: Number((physicalAttachment.siltSurfaceAlignment ?? 0).toFixed(3)),
      collisionConsequencesEnabled: false,
      adhesionPhysicsEnabled: true,
      trustedBoundaryOnly: true,
      progressionAuthority: false,
      geometryAuthority: false,
      language: ["suspended", "brushing", "attached", "releasing"]
    };
    this.playerRoot.userData.coreContactState = this.coreContactState;
  }

  animateVerbCommitment(dt, frameState) {
    const input = frameState.input ?? {};
    const sensory = frameState.coreSensoryResponse ?? {};
    const pulseHeld = Boolean(input.pulseHeld);
    const pulseCharge01 = THREE.MathUtils.clamp(input.pulseCharge01 ?? 0, 0, 1);
    const pulseReleased = Boolean(input.pulsePressed);
    const chargedRelease = pulseReleased && input.pulseReleaseKind === "charged";
    const absorbHeld = Boolean(input.absorbHeld);
    const stabilizeHeld = Boolean(input.stabilizeHeld || input.resonanceHeld);
    const verbPhysiology = frameState.corePerformance?.verbModifiers ?? {};
    const enduranceReserve01 = THREE.MathUtils.clamp(frameState.corePerformance?.endurance?.reserve01 ?? 1, 0, 1);
    const exertion01 = THREE.MathUtils.clamp((1 - enduranceReserve01) * 1.15, 0, 1);

    this.absorbVisualCommitment += (Number(absorbHeld) - this.absorbVisualCommitment) * (1 - Math.exp(-dt * (absorbHeld ? 2.4 : 5.0)));
    this.stabilizeVisualCommitment += (Number(stabilizeHeld) - this.stabilizeVisualCommitment) * (1 - Math.exp(-dt * (stabilizeHeld ? 2.0 : 4.2)));

    if (pulseReleased) {
      this.pulseReleaseAge = 0;
      this.lastPulseVisualReleaseKind = input.pulseReleaseKind === "charged" ? "charged" : "quick";
      this.lastPulseVisualReleaseCharge01 = THREE.MathUtils.clamp(input.pulseReleaseCharge01 ?? 0, 0, 1);
    } else {
      this.pulseReleaseAge += dt;
    }

    // PULSE: visual energy moves inward while charging, then snaps outward.
    if (pulseHeld) {
      const compression = 1 - pulseCharge01 * 0.105;
      this.bodyFrame?.scale.multiplyScalar(compression);
      if (this.outerShell) {
        this.outerShell.scale.multiplyScalar(1 - pulseCharge01 * 0.08);
        if (this.outerShell.material) this.outerShell.material.opacity = Math.min(0.92, this.outerShell.material.opacity + pulseCharge01 * 0.16);
      }
      if (this.innerMantle) this.innerMantle.scale.multiplyScalar(1 - pulseCharge01 * 0.04);
      if (this.nucleus) {
        this.nucleus.scale.multiplyScalar(1 + pulseCharge01 * 0.34);
        if (this.nucleus.material) this.nucleus.material.emissiveIntensity += pulseCharge01 * 1.15;
      }
      if (this.coreEnginePhaseRoot) this.coreEnginePhaseRoot.scale.multiplyScalar(1 - pulseCharge01 * 0.11);
    }

    // ABSORB: the Core becomes intake-biased rather than merely drawing a line.
    if (this.absorbVisualCommitment > 0.01) {
      const a = this.absorbVisualCommitment;
      this.bodyFrame.scale.x *= 1 + a * 0.055;
      this.bodyFrame.scale.y *= 1 + a * 0.035;
      this.bodyFrame.scale.z *= 1 - a * 0.075;
      if (this.outerShell) this.outerShell.scale.z *= 1 - a * 0.08;
      const absorbPower = THREE.MathUtils.clamp(verbPhysiology.absorb?.powerMultiplier ?? 1, 0.72, 1.42);
      if (this.nucleus?.material) this.nucleus.material.emissiveIntensity += a * (0.34 + absorbPower * 0.12);
      if (this.outerShell) this.outerShell.scale.multiplyScalar(1 + a * Math.max(0, absorbPower - 1) * 0.045);
    }

    // STABILIZE: remove asymmetry from the Core silhouette as commitment rises.
    if (this.stabilizeVisualCommitment > 0.01) {
      const c = this.stabilizeVisualCommitment;
      const avg = (this.bodyFrame.scale.x + this.bodyFrame.scale.y + this.bodyFrame.scale.z) / 3;
      this.bodyFrame.scale.x = THREE.MathUtils.lerp(this.bodyFrame.scale.x, avg, c * 0.72);
      this.bodyFrame.scale.y = THREE.MathUtils.lerp(this.bodyFrame.scale.y, avg, c * 0.72);
      this.bodyFrame.scale.z = THREE.MathUtils.lerp(this.bodyFrame.scale.z, avg, c * 0.72);
      if (this.outerShell) {
        const shellAvg = (this.outerShell.scale.x + this.outerShell.scale.y + this.outerShell.scale.z) / 3;
        this.outerShell.scale.x = THREE.MathUtils.lerp(this.outerShell.scale.x, shellAvg, c * 0.82);
        this.outerShell.scale.y = THREE.MathUtils.lerp(this.outerShell.scale.y, shellAvg, c * 0.82);
        this.outerShell.scale.z = THREE.MathUtils.lerp(this.outerShell.scale.z, shellAvg, c * 0.82);
      }
      if (this.coreEnginePhaseRoot) this.coreEnginePhaseRoot.scale.multiplyScalar(1 + c * 0.12);
      const coherence = THREE.MathUtils.clamp(verbPhysiology.stabilize?.coherenceMultiplier ?? 1, 0.66, 1.48);
      if (this.nucleus?.material) this.nucleus.material.emissiveIntensity += c * coherence * 0.20;
    }

    // Existing authored Core pulse wave now communicates tap versus committed release.
    if (this.pulseWave?.material) {
      if (pulseHeld) {
        this.pulseWave.visible = true;
        this.pulseWave.scale.setScalar(0.88 - pulseCharge01 * 0.24);
        this.pulseWave.material.opacity = 0.055 + pulseCharge01 * 0.31;
      } else {
        const visualReleaseKind = this.lastPulseVisualReleaseKind;
        const visualReleaseCharge = this.lastPulseVisualReleaseCharge01;
        const duration = visualReleaseKind === "charged" ? 0.68 + visualReleaseCharge * 0.14 : 0.44;
        const visible = this.pulseReleaseAge < duration;
        const progress = THREE.MathUtils.clamp(this.pulseReleaseAge / duration, 0, 1);
        const releaseScale = visualReleaseKind === "charged" ? 4.8 + visualReleaseCharge * 1.35 : 2.6;
        this.pulseWave.visible = visible;
        this.pulseWave.scale.setScalar(0.82 + progress * releaseScale);
        this.pulseWave.material.opacity = visible
          ? (1 - progress) * (visualReleaseKind === "charged" ? 0.52 + visualReleaseCharge * 0.10 : 0.28)
          : 0;
      }
    }

    // Charged Pulse drawback is readable on the Core as a brief post-release ring/wobble.
    const saturation = THREE.MathUtils.clamp(sensory.sensorySaturation01 ?? 0, 0, 1);
    if (exertion01 > 0.01 && this.outerShell?.material) {
      this.outerShell.material.opacity = Math.max(0.14, this.outerShell.material.opacity * (1 - exertion01 * 0.10));
      if (this.nucleus?.material) this.nucleus.material.emissiveIntensity += exertion01 * 0.18;
    }

    if (saturation > 0.01) {
      const wobble = Math.sin((frameState.runtimeSeconds ?? 0) * 12.5) * 0.026 * saturation;
      this.bodyFrame.scale.x *= 1 + wobble;
      this.bodyFrame.scale.y *= 1 - wobble * 0.7;
      if (this.nucleus?.material) this.nucleus.material.emissiveIntensity += saturation * 0.32;
    }

    frameState.coreVerbCommitmentVisual = {
      pass: "HC-027J1",
      physiologyIntegrationPass: "HC-027J2",
      primaryVerb: pulseHeld || pulseReleased ? "pulse" : absorbHeld ? "absorb" : stabilizeHeld ? "stabilize" : "none",
      pulseHeld,
      pulseCharge01: Number(pulseCharge01.toFixed(3)),
      pulseReleaseKind: pulseReleased ? (input.pulseReleaseKind ?? "quick") : (this.pulseReleaseAge < 0.9 ? this.lastPulseVisualReleaseKind : "none"),
      absorbCommitment: Number(this.absorbVisualCommitment.toFixed(3)),
      stabilizeCommitment: Number(this.stabilizeVisualCommitment.toFixed(3)),
      sensoryRecovery01: Number(saturation.toFixed(3)),
      enduranceExertion01: Number(exertion01.toFixed(3)),
      radialDrive: frameState.corePerformance?.personality ?? "forming / neutral",
      hierarchyLaw: "prepare_action_host_answer_recovery_one_primary_read_at_a_time"
    };
  }

  createState(active, extra = {}) {
    const growth = this.frameState.coreGrowth ?? {};
    const surfaceTrace = growth.surfaceMemoryMode ?? "unwritten";
    return {
      pass: "HC-022A1",
      active: Boolean(active),
      coreVisualScale: CORE_VISUAL_SCALE,
      scalePolicy: "visual_body_normalized_interaction_ranges_preserved",
      owner: "CoreEmbodimentSystem",
      growthAuthority: "CoreGrowthSystem",
      bodyRecipe: (growth.growthProgress ?? 0) > 0.17
        ? "authored_binding_core_proxy_v1"
        : "authored_seed_core_proxy_v2",
      movementReference: "camera_relative_embodied_free_3d",
      trueCameraPitchForward: true,
      explicitVerticalControls: "RB/LB or D-Pad Up/Down · C/Z · PageUp/PageDown",
      translationOwner: "PlayerMovementController",
      bodyOrientationOwner: "CoreEmbodimentSystem",
      facingDirection: { x: this.direction.x, y: this.direction.y, z: this.direction.z },
      ringPolicy: "transient_pulse_wave_only",
      objectDefiningRings: false,
      idleHalo: false,
      idleVerticalGlint: false,
      authoredProxyParts: {
        outerShell: Boolean(this.outerShell),
        innerMantle: Boolean(this.innerMantle),
        nucleus: Boolean(this.nucleus),
        fins: this.fins.length,
        trailingVeils: this.veils.length,
        unifiedTravelTendrils: this.travelTendrils.length,
        wakeMotes: this.wakeMotes.length,
        growthPetals: this.growthPetals.length,
        scarPlates: this.growthPlates.length,
        connectionNodes: this.growthNodes.length,
        graveMemoryPearls: this.memoryPearls.length,
        graveMemoryAttachmentLigaments: this.memoryLigament ? 1 : 0
        ,vascularReturnFilaments: this.vascularFilaments.length
        ,vascularCadenceNodes: this.vascularCadenceNodes.length
        ,vascularReturnCharges: this.vascularReturnCharge ? 1 : 0
        ,siltBracePlates: this.siltBracePlates.length
        ,siltPorousNodes: this.siltPorousNode ? 1 : 0
        ,siltResidueNodes: this.siltResidueNodes.length
        ,triadicEnginePhaseNodes: this.coreEnginePhaseNodes.length
        ,verbEngineConduits: this.coreEngineVerbConduits.length
        ,verbEngineTransitNodes: this.coreEngineVerbTransitNodes.length
      },
      coreEngineVisual: {
        pass: "HC-028D1",
        sequencingOwner: "CoreEngineSystem",
        visualOwner: "CoreEmbodimentSystem",
        phaseNodeCapacity: this.coreEnginePhaseNodes.length,
        activePhaseCount: this.frameState.coreEngine?.phaseCount ?? 3,
        phasesPerFunction: this.frameState.coreEngine?.phasesPerFunction ?? 1,
        currentPhaseIndex: this.frameState.coreEngine?.currentPhaseIndex ?? 0,
        currentPhaseFunction: this.frameState.coreEngine?.currentPhaseFunction ?? "pulse",
        triadicGeometryLaw: true,
        gyroscopePlanes: this.coreEngineGyroRings.length,
        architectureSilhouette: (this.frameState.coreEngine?.phaseCount ?? 3) === 3
          ? "three_single_firing_positions_on_orthogonal_planes"
          : (this.frameState.coreEngine?.phaseCount ?? 3) === 6
            ? "three_opposed_firing_pairs_on_orthogonal_planes"
            : "three_four_position_firing_cycles_on_orthogonal_planes",
        stabilityRead: (this.frameState.coreEngine?.phaseCount ?? 3) === 3
          ? "chunky_precession"
          : (this.frameState.coreEngine?.phaseCount ?? 3) === 6
            ? "counterbalanced_precession"
            : "high_resolution_near_continuous_precession",
        stabilizeVisualRole: "reduces_gyroscopic_precession_without_freezing_orientation",
        hasFixedTopBottom: false,
        architectureChangeBloom: this.coreEngineArchitectureChangeAge < 0.72,
        worldScaleReadable: true,
        gameplayMutation: false,
        worldResonance: {
          pass: "HC-028D",
          active: Boolean(this.frameState.coreWorldResonance?.active),
          relation: this.frameState.coreWorldResonance?.relationshipState ?? "inactive",
          coherence01: this.frameState.coreWorldResonance?.coherence01 ?? 0,
          emphasizedFunction: this.frameState.coreWorldResonance?.presentation?.emphasizedFunction ?? "none",
          rule: "world_relationship_modulates_gyro_readability_not_engine_truth"
        },
        verbEngineCoupling: {
          pass: "HC-028D1",
          active: Boolean(this.frameState.coreVerbEngineCoupling?.active),
          chord: this.frameState.coreVerbEngineCoupling?.chord ?? "idle",
          dominantFunction: this.frameState.coreVerbEngineCoupling?.dominantFunction ?? "none",
          functionDrive: this.frameState.coreVerbEngineCoupling?.functionDrive ?? { pulse: 0, absorb: 0, stabilize: 0 },
          conduits: this.coreEngineVerbConduits.length,
          routingRule: "pulse_outward_absorb_inward_stabilize_coheres_same_gyroscopic_engine",
          gameplayMutation: false
        }
      },
      anatomicalGrowthFoundation: {
        startState: "primitive_membrane_and_nucleus",
        surfaceContribution: "membrane_differentiation",
        guideContribution: "internal_axis_and_locomotor_organization",
        hubArrivalState: "young_organized_core",
        graveContribution: "retention_memory_anatomy",
        vascularContribution: "circulation_transport_anatomy",
        siltContribution: "filtration_boundary_anatomy",
        integrationRule: "route anatomy becomes interconnected organism structure rather than badges",
        futureRule: "new evolution modifies existing anatomy before adding decorative layers",
        gameplayBodyUnchanged: true
      },
      primitiveCore: this.mantleReveal < 0.08,
      surfaceMemoryTrace: surfaceTrace,
      surfaceMemoryVisible: Boolean(growth.surfaceMemoryCommitted),
      surfaceMemoryVisualRule: surfaceTrace === "filtering_care_trace"
        ? "smoother differentiated mantle"
        : surfaceTrace === "scar_tolerance_trace"
          ? "slight asymmetric shell tension"
          : surfaceTrace === "nutrient_binding_trace"
            ? "stronger nucleus binding pulse"
            : "unwritten",
      mantleReveal: this.mantleReveal,
      locomotorReveal: this.locomotorReveal,
      hubOrganizationReveal: this.hubOrganizationReveal,
      coreWorkViewActive: this.coreWorkReveal > 0.08,
      coreWorkReveal: this.coreWorkReveal,
      coreWorkVisualPolicy: "existing_outer_membrane_softens_while_existing_internal_anatomy_brightens",
      coreWorkChemistryMutation: true,
      coreWorkPhysicalManipulationPass: "HC-024C2",
      coreWorkQuickTestPass: "HC-024D0",
      coreWorkQuickTestRetainedAnatomySeeded: Boolean(growth.debugCoreWorkRetainedAnatomySeeded),
      coreWorkQuickTestProgressionMutation: false,
      coreWorkManipulableConnectionNodes: 0,
      coreWorkManipulableRetainedAnatomy: [this.memoryImprintRoot, this.vascularFilamentRoot, this.siltAdaptationRoot].filter(Boolean).length,
      coreWorkArrangementPersistsAfterViewExit: true,
      retainedAnatomyCount: [growth.graveMemoryImprintCommitted, growth.vascularRhythmRetained, growth.siltPressureRetained].filter(Boolean).length,
      anatomicalIntegration: growth.anatomicalIntegration ?? {
        organismIntegrated: false,
        integrationRule: "awaiting retained Grave/Vascular/Silt anatomy"
      },
      regionalRhythm: growth.regionalRhythm ?? {},
      growthStage: growth.stageId ?? "seed_core",
      growthProgress: growth.growthProgress ?? 0,
      chemistryBias: growth.chemistryBias ?? 0,
      biasLabel: growth.biasLabel ?? "balanced_first_binding",
      visibleShellRestructuring: Boolean(growth.visibleShellRestructuring),
      graveMemoryImprintCommitted: Boolean(growth.graveMemoryImprintCommitted),
      graveMemoryTraceIntegrity: growth.graveMemoryTraceIntegrity ?? 0,
      visibleGraveMemoryPearl: this.memoryImprintReveal > 0.08,
      memoryImprintReveal: this.memoryImprintReveal,
      memoryImprintVisualPass: "HC-010E",
      memoryImprintOrganCount: 1,
      memoryImprintNodeCount: this.memoryPearls.length,
      memoryImprintLigamentVisible: Boolean(this.memoryLigament?.visible),
      memoryImprintSilhouetteSpan: 0.62,
      memoryImprintContrastRole: "pearl_dark_left_flank_against_cyan_binding_core",
      memoryImprintUsesExistingBody: true,
      memoryImprintObjectDefiningRing: false,
      vascularRhythmRetained: Boolean(growth.vascularRhythmRetained),
      visibleVascularReturnFilament: Boolean(this.vascularFilamentRoot?.visible),
      vascularFilamentReveal: this.vascularFilamentReveal,
      vascularReturnConsequencePass: "HC-011B",
      vascularReturnFilamentCount: this.vascularFilaments.length,
      vascularCadenceNodeCount: this.vascularCadenceNodes.length,
      vascularReturnChargeCount: this.vascularReturnCharge ? 1 : 0,
      vascularReturnMotionLanguage: "three_open_right_flank_tendons_with_one_sequential_return_charge",
      vascularReturnObjectDefiningRings: 0,
      vascularReturnPermanentHalos: 0,
      siltPressureRetained: Boolean(growth.siltPressureRetained),
      visibleSiltPressureAdaptation: Boolean(this.siltAdaptationRoot?.visible),
      siltAdaptationReveal: this.siltAdaptationReveal,
      siltReturnConsequencePass: "HC-012B",
      siltBracePlateCount: this.siltBracePlates.length,
      siltPorousNodeCount: this.siltPorousNode ? 1 : 0,
      siltResidueNodeCount: this.siltResidueNodes.length,
      siltPressureMotionLanguage: "three_low_ventral_brace_plates_one_porous_node_two_closed_residue_knots",
      siltPressureObjectDefiningRings: 0,
      siltPressurePermanentHalos: 0,
      speed: extra.speed ?? 0,
      pressure: extra.pressure ?? 0,
      viscosity: extra.viscosity ?? 0,
      boundaryPressure: extra.boundaryPressure ?? 0,
      fluidSlip: extra.slipStrength ?? 0,
      boost: Boolean(extra.boost),
      bank: this.bank,
      direction: {
        x: this.direction.x,
        y: this.direction.y,
        z: this.direction.z
      },
      progressionMutation: false,
      growthTruthMutation: false,
      chemistryMutation: false,
      targetMutation: false,
      gateMutation: false
    };
  }
}
