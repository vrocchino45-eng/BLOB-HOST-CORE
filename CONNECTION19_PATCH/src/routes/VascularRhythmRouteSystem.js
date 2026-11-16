import * as THREE from "three";
import { readVascularHostPressure } from "../world/HostConditionSystem.js";
import { VascularReturnHandoff } from "./VascularReturnHandoff.js";
import { RegionalTerritoryExpansion, territorySignal } from "../world/RegionalTerritoryExpansion.js";
import { VascularSiltSignalReceiver } from "./VascularSiltSignalReceiver.js";

const ROUTE_CELL_ID = "CELL_VASCULAR_RHYTHM_ROUTE_001";
const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const RECIPE_ID = "VASCULAR_RHYTHM_PLAYABLE_CIRCUIT_HC011A1";

/**
 * HC-011A1 retains the HC-011A Vascular circuit and repairs its post-read
 * recovery contract. Locked cadence reads cannot be erased, extra Pulse input
 * after 3/3 is harmless, and one bounded Stabilize hold can always settle the
 * route. The system still never moves the player, changes activeCellId,
 * completes an objective, or crosses a gate directly.
 */
// CONNECTION3: the existing physiology publication shapes only local directional
// calming. Movement reception, reserve, goals and the 0..1 calm envelope retain
// their existing owners. Invalid/ineligible context preserves the original law.
export function readVascularCoherenceResponse(frameState, sample, route, enabled = true) {
  const profile = frameState.corePerformance;
  const coherence = profile?.verbModifiers?.stabilize?.coherenceMultiplier;
  const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
  const reason = !enabled ? 'disabled'
    : !route.active || frameState.activeCellId !== 'CELL_VASCULAR_RHYTHM_ROUTE_001' ? 'not_mounted'
    : inspection.coreWorkActive ? 'core_work'
    : frameState.input?.stabilizeHeld !== true || route.stabilizing !== true ? 'not_stabilizing'
    : !Number.isFinite(sample.distance) || sample.distance > (route.recipe.anatomy?.corridorRadius ?? 1.18) * 1.08 ? 'outside_current'
    : profile?.active !== true || profile.owner !== 'CoreRadialPerformanceSystem' ? 'inactive_physiology'
    : !Number.isFinite(coherence) || coherence < 0.66 || coherence > 1.48 ? 'invalid_coherence'
    : 'coherence_applied';
  const eligible = reason === 'coherence_applied';
  return { pass: 'CONNECTION3', owner: 'VascularRhythmRouteSystem',
    sourceOwner: 'CoreRadialPerformanceSystem', eligible, reason,
    sampledAtSeconds: frameState.runtimeSeconds,
    coherence: Number.isFinite(coherence) ? coherence : null,
    factor: eligible ? Math.max(0.85, Math.min(1.15, coherence)) : 1,
    affects: 'directional_stabilize_calming_only', progressionAuthority: false };
}

// Presentation consumes the already-applied current terms, never Core placement.
export function readCurrentMoteCoherenceRatio(frameState, response) {
  const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
  if (frameState.activeCellId !== 'CELL_VASCULAR_RHYTHM_ROUTE_001' || inspection.coreWorkActive
    || response?.pass !== 'CONNECTION3' || response.owner !== 'VascularRhythmRouteSystem'
    || !response.eligible || !Number.isFinite(frameState.runtimeSeconds)
    || response.sampledAtSeconds !== frameState.runtimeSeconds
    || !Number.isFinite(response.directionalCalm) || response.directionalCalm < 0.609 - 1e-9 || response.directionalCalm > 1
    || !Number.isFinite(response.neutralDirectionalCalm) || response.neutralDirectionalCalm < 0.66 - 1e-9 || response.neutralDirectionalCalm > 1) return 1;
  const ratio = response.directionalCalm / response.neutralDirectionalCalm;
  return Number.isFinite(ratio) && ratio >= 0.92 && ratio <= 1.08 ? ratio : 1;
}

export class VascularRhythmRouteSystem {
  constructor({ recipeDataSystem, scene, playerRoot, frameState, hostConnectionReceiptLedger = null }) {
    if (!recipeDataSystem) throw new Error("[VascularRhythmRouteSystem] recipeDataSystem is required.");
    if (!scene) throw new Error("[VascularRhythmRouteSystem] scene is required.");
    if (!playerRoot) throw new Error("[VascularRhythmRouteSystem] playerRoot is required.");
    if (!frameState) throw new Error("[VascularRhythmRouteSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.hostConnectionReceiptLedger = hostConnectionReceiptLedger;
    this.siltSignalReceiver = new VascularSiltSignalReceiver();
    // VASCULAR-II1: fresh, paired return flow; first-visit state stays retained.
    this.returnHandoff = new VascularReturnHandoff();
    this.returnHandoffVisuals = null;
    this.returnHandoffPlayer = new THREE.Vector3();
    this.returnHandoffSource = new THREE.Vector3();
    this.returnHandoffReceiver = new THREE.Vector3();
    this.returnHandoffSourceDistance = Infinity;
    this.returnHandoffReceiverDistance = Infinity;
    this.hostCauseNotice = null;
    this.hostCauseNoticeText = '';

    this.recipe = null;
    this.root = null;
    this.pathCurve = null;
    this.pathPoints = [];
    this.pathSegmentLengths = [];
    this.pathCumulativeLengths = [0];
    this.pathLength = 0;
    this.vesselEnvelope = null;
    this.braidTubes = [];
    this.wallFolds = [];
    this.valves = [];
    this.currentMotes = [];
    // CONNECTION5: same-runtime phase survives hiding/remount; new instances seed zero.
    this.currentMoteTravelPhase = 0;
    this.currentMoteVisualRate = 0;
    this.currentMoteCoherenceRatio = 1;
    this.chargeRoot = null;
    this.chargeCore = null;
    this.chargeLight = null;
    this.chargeTrail = [];
    this.returnFold = null;
    this.returnFoldLobes = [];
    this.materials = [];

    this.entryAnchor = new THREE.Vector3();
    this.returnPosition = new THREE.Vector3();
    this.localPlayer = new THREE.Vector3();
    this.previousPlayerPosition = new THREE.Vector3();
    this.derivedVelocity = new THREE.Vector3();
    this.closestPoint = new THREE.Vector3();
    this.closestTangent = new THREE.Vector3(0, 0, -1);
    this.segmentVector = new THREE.Vector3();
    this.segmentStartToPlayer = new THREE.Vector3();
    this.tempPoint = new THREE.Vector3();
    this.tempPointB = new THREE.Vector3();
    this.tempColor = new THREE.Color();
    this.chargeWorldPosition = new THREE.Vector3();

    this.active = false;
    this.prepared = false;
    this.mountCount = 0;
    this.elapsed = 0;
    this.beatElapsed = 0;
    this.returnElapsed = 0;
    this.cadencePhase = 0;
    this.chargeProgress = 0.04;
    this.pathProgress = 0;
    this.maxDepthProgress = 0;
    this.pathDistance = 0;
    this.chargeDistance = Number.POSITIVE_INFINITY;
    this.flowAlignment = 0;
    this.contractionIntensity = 0;
    this.synchronization = 0.12;
    this.circulationIntegrity = 1;
    this.turbulence = 0;
    this.stabilizeSeconds = 0;
    this.matchedFlowSeconds = 0;
    this.lockedCadenceReads = 0;
    this.riskEventCount = 0;
    this.offBeatPulseCount = 0;
    this.recoverySeconds = 0;
    this.desynchronizationRecovered = false;
    this.desynchronized = false;
    this.stabilizing = false;
    this.stabilizationInRange = false;
    this.stabilizationRange = 0;
    this.postReadPulseIgnoredCount = 0;

    // HC031R — Vascular Currentization. Cadence remains visible rhythm, but it no
    // longer acts as a hidden input-timing gate. Stabilize establishes a temporary
    // relationship with the living current at the next authored valve; Pulse then
    // projects through that held relationship. Beat alignment changes read quality
    // and synchronization gain only. The legacy lockedCadenceReads field is kept as
    // a compatibility alias for existing objective/save/history consumers.
    this.currentRelationshipHeld = false;
    this.currentRelationshipReady = false;
    this.currentRelationshipSeconds = 0;
    this.activeValveDistance = Number.POSITIVE_INFINITY;
    this.relationshipReadSequence = 0;
    this.lastRelationshipReadBeatAligned = false;
    this.lastRelationshipReadQuality = 0;
    this.lastRelationshipReadChord = "idle";
    this.unboundPulseCount = 0;

    this.completed = false;
    this.returnFoldReady = false;
    this.lastPulseEventId = 0;
    this.lastInteraction = "none";
    this.warning = "none";
    this.pulseFlashAge = 99;

    // HC018C: traversal-material response. These values never own cadence,
    // completion, targeting, chemistry or route crossing truth.
    this.traversalPulseWake = 0;
    this.traversalAbsorbShear = 0;
    this.traversalStabilizeCalm = 0;
    this.traversalMaterialMode = "ride_current";

    // HC027L1 — three presentation-only reinforcement windows reuse the current,
    // wall folds and contraction field so the long vascular middle repeats the
    // Pulse / Absorb / Stabilize grammar without adding prompts, targets or gates.
    this.grammarReinforcementMode = "none";
    this.grammarReinforcementStrength = 0;
    this.grammarReinforcementMatched = false;
    this.grammarReinforcementWindow = 0;

    // HC018D: retained anatomical consequence presentation only.
    this.retainedSynchronizationStrength = 0;

    // C0C-VIS1-A: Vascular owns a visual response, never remote material.
    // Age belongs to the local receiving animation, not the Host ledger.
    this.vis1LastReceiptTotal = 0;
    this.vis1WaveAge = 30;
    this.siltArrivalPresentationEvent = null;
    this.siltArrivalPresentationAt = -999;
    this.vis1Applied = null;
  }

  init() {
    this.recipe = this.recipeDataSystem.data.vascularRhythmRouteCircuit;
    if (this.recipe?.id !== RECIPE_ID) {
      throw new Error(`[VascularRhythmRouteSystem] Missing ${RECIPE_ID}.`);
    }
    this.pathPoints = (this.recipe.anatomy?.pathPoints ?? [])
      .map((point) => new THREE.Vector3().fromArray(point));
    if (this.pathPoints.length < 5) {
      throw new Error("[VascularRhythmRouteSystem] Vascular path requires at least five authored points.");
    }
    this.buildPathMetrics();
    this.pathCurve = new THREE.CatmullRomCurve3(this.pathPoints, false, "centripetal", 0.42);
    this.createAnatomy();
    this.createReturnHandoffVisuals();
    this.setVisible(false);
    this.prepared = true;
    this.publish(this.frameState, false);
  }

  onRuntimePrepare(frameState) {
    this.setVisible(false);
    this.publish(frameState, false);
    return {
      status: "vascular_rhythm_route_prepared_hidden",
      rootCount: 1,
      valveCount: this.valves.length,
      activeCellId: frameState.activeCellId,
      mutatesProgression: false
    };
  }

  onRuntimeMount(frameState) {
    this.active = true;
    this.mountCount += 1;
    this.entryAnchor.copy(this.playerRoot.position);
    this.previousPlayerPosition.copy(this.playerRoot.position);
    this.root.position.copy(this.entryAnchor);
    const returnOffset = this.recipe.returnFold?.position ?? [0, 0.05, 0.62];
    this.returnPosition.copy(this.entryAnchor).add(this.tempPoint.fromArray(returnOffset));
    this.setVisible(true);
    this.lastInteraction = this.completed
      ? "returned_to_synchronized_circulation"
      : "entered_vascular_current_without_forced_relocation";
    this.warning = "none";
    this.publish(frameState, true);
  }

  onRuntimeUnmount(frameState) {
    this.returnHandoff.suspend();
    this.currentMoteVisualRate = 0;
    this.currentMoteCoherenceRatio = 1;
    this.active = false;
    this.setVisible(false);
    this.lastInteraction = frameState.activeCellId === HUB_CELL_ID
      ? "returned_to_hub_through_vascular_fold"
      : "vascular_rhythm_route_unmounted";
    this.publish(frameState, false);
  }

  update(dt, frameState) {
    if (frameState.activeCellId !== ROUTE_CELL_ID) {
      if (this.active) this.onRuntimeUnmount(frameState);
      return;
    }
    if (!this.active) this.onRuntimeMount(frameState);

    // LS1E2: Only the mounted Vascular system can accept a verified remote cause.
    this.siltSignalReceiver.receive(this.hostConnectionReceiptLedger?.snapshot() ?? null);
    // C0D1-B: relay only the local positive effects Vascular has already
    // applied. Host authenticates parent lineage; this does not tick Grave.
    if (this.hostConnectionReceiptLedger) {
      const cursor = this.hostConnectionReceiptLedger.vascularEffectSnapshot({withRecords: false}).lastSourceEventSequence;
      const applied = this.siltSignalReceiver.appliedEffectSnapshot({afterSequence: cursor});
      for (const effect of applied.records) {
        const confirmed = this.hostConnectionReceiptLedger.observeVascularAppliedEffect(effect);
        if (confirmed) {
          // CONNECTION19: read-only presentation witness of the existing Host
          // confirmation. No extra receipt, current change or credit is created.
          this.siltArrivalPresentationEvent = confirmed;
          this.siltArrivalPresentationAt = this.elapsed;
        }
      }
    }
    this.siltSignalReceiver.update(dt);
    // Record the newly received *signal*, not a material transfer or new route event.
    const visualReceiptTotal = this.siltSignalReceiver.receivedTotal;
    if (visualReceiptTotal > this.vis1LastReceiptTotal) this.vis1WaveAge = 0;
    this.vis1LastReceiptTotal = visualReceiptTotal;
    this.vis1WaveAge = Math.min(30, this.vis1WaveAge + Math.max(0, Math.min(dt, 0.25)));


    this.elapsed += dt;
    this.pulseFlashAge += dt;
    if (this.completed) this.returnElapsed += dt;
    else this.beatElapsed += dt;

    const sample = this.samplePlayerPath(dt, frameState);
    this.updateCadence(dt, frameState, sample);
    this.updateReturnHandoff(dt, frameState);
    this.updateTraversalMaterialResponse(dt, frameState, sample);
    this.updateGrammarReinforcement(frameState, sample);
    this.applyDynamicCurrent(frameState, sample);
    this.updateCurrentMoteTravel(dt, frameState);
    this.animate(dt, frameState, sample);
    this.applyHostRhythmVisual(frameState);
    // Post-composition, bounded anatomical expression: never a gameplay input.
    this.applySiltPressureAnatomy();
    this.applyHostPressureAnatomy();
    this.territoryExpansion?.update({dt, time: this.elapsed, playerPosition: this.playerRoot.position,
      input: frameState.input, signal01: territorySignal("vascular", {membraneLoad: this.siltSignalReceiver.membraneLoad}),
      circuitStatus: this.siltSignalReceiver.receivedTotal > 0 ? "silt_cause_received" : "awaiting_silt_cause", frameState});
    this.updateReturnHandoffVisuals(frameState);
    this.publish(frameState, true);
  }



  returnHandoffEligible(frameState = this.frameState) {
    const history = frameState.act1RouteHistory ?? {};
    const route = history.routeStates?.vascular_route ?? {};
    const returned = route.returned === true || history.vascularReturned === true;
    return Boolean(this.active && frameState.activeCellId === ROUTE_CELL_ID
      && this.completed && returned && (route.entryCount ?? 0) >= 2
      && (!frameState.returnRegionEngine?.phase2?.vascular || this.returnHandoff.completed));
  }

  updateReturnHandoff(dt, frameState) {
    const eligible = this.returnHandoffEligible(frameState);
    if (!eligible) { this.returnHandoff.suspend(); return; }
    this.root.updateWorldMatrix(true, true);
    this.playerRoot.getWorldPosition(this.returnHandoffPlayer);
    this.valves[1].getWorldPosition(this.returnHandoffSource);
    this.valves[0].getWorldPosition(this.returnHandoffReceiver);
    this.returnHandoffSourceDistance = this.returnHandoffPlayer.distanceTo(this.returnHandoffSource);
    this.returnHandoffReceiverDistance = this.returnHandoffPlayer.distanceTo(this.returnHandoffReceiver);
    const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
    const suspended = Boolean(inspection.coreWorkActive);
    this.returnHandoff.update(dt, {
      eligible, suspended,
      sourceNear: this.returnHandoffSourceDistance <= 1.9,
      receiverNear: this.returnHandoffReceiverDistance <= 1.9,
      stabilizeHeld: Boolean(frameState.input?.stabilizeHeld),
      pulsePressed: Boolean(frameState.input?.pulsePressed),
      pulseEventId: frameState.input?.pulseEventId ?? 0
    });
    // The shared credit owner runs before regional completion publishers.
    // Keep a pending completion if another owner published in this same frame.
    const pending = frameState.returnRegionCompletionEvent;
    if (eligible && !suspended && this.returnHandoff.completed && !this.returnHandoff.published
        && !(pending && pending.frame === (frameState.frame ?? 0)
          && pending.key !== 'vascular:phase_2')) {
      frameState.returnRegionCompletionEvent = {
        pass: 'EARNED-REGION-PHASE2-1', schemaVersion: 1,
        key: 'vascular:phase_2', routeKey: 'vascular', phase: 2,
        sequence: this.returnHandoff.completionSequence,
        source: 'VascularRhythmRouteSystem', frame: frameState.frame ?? 0,
        evidenceId: this.returnHandoff.handoffId,
        sourcePulseId: this.returnHandoff.sourcePulseId,
        receiverSettleSeconds: this.returnHandoff.settleSeconds,
        materialTransfer: false
      };
      this.returnHandoff.published = true;
    }
  }

  createReturnHandoffVisuals() {
    const root = new THREE.Group();
    root.name = 'vascular_ii_paired_return_handoff';
    root.userData.targetingSuppressed = true;
    const marker = (valve, color) => {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: 0.7,
        transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide
      }));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.026, 6, 32), material);
      ring.position.copy(valve.position);
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1),
        this.pathCurve.getTangentAt(valve.userData.progress).normalize());
      ring.userData.targetingSuppressed = true;
      root.add(ring);
      return ring;
    };
    const source = marker(this.valves[1], 0xffc66b);
    const receiver = marker(this.valves[0], 0x76ffca);
    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 7),
      this.trackMaterial(new THREE.MeshStandardMaterial({
        color: 0xffd489, emissive: 0xffbe57, emissiveIntensity: 1,
        transparent: true, opacity: 0.92, depthWrite: false
      })));
    packet.name = 'vascular_ii_projected_current_response';
    packet.userData.targetingSuppressed = true;
    root.add(packet);
    root.visible = false;
    this.root.add(root);
    this.returnHandoffVisuals = { root, source, receiver, packet };
  }

  updateReturnHandoffVisuals(frameState) {
    const visual = this.returnHandoffVisuals;
    const goal = this.returnHandoff;
    const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
    visual.root.visible = this.returnHandoffEligible(frameState) && !goal.completed
      && !inspection.coreWorkActive;
    if (!visual.root.visible) return;
    const wave = (Math.sin(this.elapsed * 3.2) + 1) * 0.5;
    visual.source.material.opacity = goal.handoffId ? 0.2 : 0.6 + wave * 0.3;
    visual.receiver.material.opacity = goal.travelSeconds >= 2 ? 0.65 + wave * 0.3 : 0.32;
    visual.receiver.scale.setScalar(1 + goal.settleSeconds / 0.75 * 0.12);
    visual.packet.visible = Boolean(goal.handoffId);
    if (goal.handoffId) {
      visual.packet.position.copy(this.pathCurve.getPointAt(
        THREE.MathUtils.lerp(0.55, 0.28, goal.travelSeconds / 2)));
      visual.packet.scale.setScalar(1 + wave * 0.18);
    }
  }

  returnHandoffAction() {
    if (!this.returnHandoffEligible()) return null;
    if (this.returnHandoff.completed) return 'Paired return current settled. Follow the gold current into the open entry fold.';
    const goal = this.returnHandoff;
    if (!goal.handoffId) {
      return this.returnHandoffSourceDistance <= 1.9
        ? goal.sourceHold >= 0.18
          ? 'Pulse while holding LT to send the return current toward the green intake valve.'
          : 'Hold LT at the amber branch valve to establish the return current.'
        : 'Approach the amber branch valve to send a paired return current.';
    }
    if (goal.travelSeconds < 2) return 'Follow the gold current response toward the green intake valve.';
    return this.returnHandoffReceiverDistance <= 1.9
      ? 'Hold LT at the green intake valve to receive and settle the return current.'
      : 'Approach the green intake valve and hold LT to receive the waiting current.';
  }

  applyHostRhythmVisual(frameState) {
    const host = frameState.hostRhythm ?? {};
    if (!host.active) return;

    const composition = host.composition ?? {};
    const composed = composition.active && composition.profileId === "vascular_psa_44_micro";

    // HC028C2 keeps HC028C's single Host clock and restrained movement force,
    // but makes the meter perceptually legible. 1 transmits, 2 catches/holds,
    // 3 draws inward, 4 settles/prepares. The player never has to hit a beat.
    const phase = composed
      ? ((composition.barPhase ?? 0) + 0.03) % 1
      : ((host.normalizedPhase ?? 0) + 0.03) % 1;
    const wave = Math.sin(phase * Math.PI * 2 - Math.PI * 0.5);
    const surge = 0.5 + 0.5 * wave;
    const beatPulse = composed ? (composition.beatPulse ?? 0) : surge;
    const accent = composed ? (composition.accentStrength ?? 0) : surge;
    const beatNumber = composed ? (composition.beatNumber ?? 1) : 1;
    const currentFunction = composed ? (composition.currentFunction ?? "pulse") : "pulse";
    const pulseAccent = currentFunction === "pulse" ? accent : 0;
    const absorbAccent = currentFunction === "absorb" ? accent : 0;
    const stabilizeAccent = currentFunction === "stabilize" ? accent : 0;
    const catchAccent = beatNumber === 2 ? stabilizeAccent : 0;
    const settleAccent = beatNumber === 4 ? stabilizeAccent : 0;
    const coreWorldResonance = frameState.coreWorldResonance ?? {};
    const resonanceActive = Boolean(coreWorldResonance.active);
    const resonanceReply = resonanceActive
      ? THREE.MathUtils.clamp(coreWorldResonance.presentation?.worldReplyStrength ?? 0, 0, 1)
      : 0;

    if (this.vesselEnvelope?.material) {
      this.vesselEnvelope.material.emissiveIntensity += surge * 0.07
        + pulseAccent * 0.24
        + absorbAccent * 0.11
        + catchAccent * 0.08
        + settleAccent * 0.035
        + resonanceReply * 0.12;
      this.vesselEnvelope.material.opacity = Math.min(
        0.31,
        this.vesselEnvelope.material.opacity
          + surge * 0.022
          + pulseAccent * 0.034
          + absorbAccent * 0.020
          + catchAccent * 0.012
          + resonanceReply * 0.018
      );
    }

    for (const [index, fold] of this.wallFolds.entries()) {
      if (!fold) continue;
      const travel = 0.5 + 0.5 * Math.sin(
        phase * Math.PI * 2 - index * 0.42
      );
      const localBeat = beatPulse * (0.55 + 0.45 * Math.sin(index * 1.27 + (composition.beatInBar ?? 0) * 0.8));
      // Beat 1 sends tissue outward; beat 3 visibly gathers it back inward.
      // Stabilize beats reduce deformation and momentarily read as a held frame.
      const holdReduction = Math.max(0.68, 1 - stabilizeAccent * 0.24);
      fold.scale.x *= (1 + travel * 0.012 + localBeat * 0.010 + pulseAccent * 0.038 - absorbAccent * 0.026) * holdReduction;
      fold.scale.z *= (1 + travel * 0.009 + localBeat * 0.008 + pulseAccent * 0.026 - absorbAccent * 0.018) * holdReduction;
      if (fold.material) {
        fold.material.emissiveIntensity += travel * 0.05
          + localBeat * 0.04
          + pulseAccent * 0.14
          + absorbAccent * 0.08
          + catchAccent * 0.06
          + settleAccent * 0.025
          + resonanceReply * 0.06;
      }
    }

    this.root.userData.hostRhythmInterpretation = {
      pass: composed ? "HC-028C2" : "HC-022G",
      region: "vascular",
      mode: composed ? "psa_key_44_accented_world_phrase" : "directional_traveling_surge",
      phaseLead: 0.03,
      keyId: composed ? composition.keyId : "unassigned",
      meter: composed ? composition.meterLabel : "unassigned",
      tempoBpm: composed ? composition.tempoBpm : 0,
      octave: composed ? composition.octaveLabel : "unassigned",
      beatNumber,
      currentFunction: composed ? composition.currentFunction : "none",
      accentRole: composed ? composition.accentRole : "none",
      accentLaw: composed ? "1_transmit_2_catch_3_receive_4_settle" : "legacy_host_breath",
      movementAuthorityChanged: false,
      visible: true,
      gameplayAuthority: false,
      sharedHostClock: true,
      coreWorldResonance: {
        pass: "HC-028D",
        active: resonanceActive,
        relation: resonanceActive ? coreWorldResonance.relationshipState ?? "oscillating" : "inactive",
        coherence01: resonanceActive ? coreWorldResonance.coherence01 ?? 0 : 0,
        worldReplyStrength: resonanceReply,
        presentationOnly: true
      }
    };
  }

  buildPathMetrics() {
    this.pathSegmentLengths = [];
    this.pathCumulativeLengths = [0];
    this.pathLength = 0;
    for (let index = 0; index < this.pathPoints.length - 1; index += 1) {
      const length = this.pathPoints[index].distanceTo(this.pathPoints[index + 1]);
      this.pathSegmentLengths.push(length);
      this.pathLength += length;
      this.pathCumulativeLengths.push(this.pathLength);
    }
  }

  createAnatomy() {
    this.root = new THREE.Group();
    this.root.name = "vascular_rhythm_route_authority_HC011A1";
    Object.assign(this.root.userData, {
      regionId: "vascular_route",
      gameplayOwner: "VascularRhythmRouteSystem",
      presentationOwner: "VascularRhythmRouteSystem",
      transitionPrepared: true,
      targetingSuppressed: true,
      genericRings: 0,
      triggerMarkers: 0
    });

    const visual = this.recipe.visual ?? {};
    const vesselMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: visual.vesselColor ?? 0x466ff6,
      emissive: visual.deepVesselColor ?? 0x1c2f46,
      emissiveIntensity: 0.18,
      roughness: 0.72,
      metalness: 0.04,
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
      side: THREE.DoubleSide
    }));
    this.vesselEnvelope = new THREE.Mesh(
      new THREE.TubeGeometry(
        this.pathCurve,
        96,
        this.recipe.anatomy?.vesselRadius ?? 0.92,
        12,
        false
      ),
      vesselMaterial
    );
    this.vesselEnvelope.name = "vascular_living_vessel_membrane";
    this.vesselEnvelope.userData.targetingSuppressed = true;
    this.root.add(this.vesselEnvelope);

    const braidColors = [0x7c56e8, 0x3cb8d6, 0xa566cf];
    for (let braidIndex = 0; braidIndex < 3; braidIndex += 1) {
      const offsetPoints = this.pathPoints.map((point, pointIndex) => {
        const angle = pointIndex * 1.28 + braidIndex * (Math.PI * 2 / 3);
        const offset = this.recipe.anatomy?.braidOffset ?? 0.58;
        return point.clone().add(new THREE.Vector3(
          Math.cos(angle) * offset,
          Math.sin(angle) * offset * 0.62,
          Math.sin(angle * 0.7) * 0.08
        ));
      });
      const curve = new THREE.CatmullRomCurve3(offsetPoints, false, "centripetal", 0.42);
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: braidColors[braidIndex],
        emissive: braidColors[braidIndex],
        emissiveIntensity: 0.2,
        roughness: 0.46,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
      }));
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 72, this.recipe.anatomy?.braidRadius ?? 0.105, 8, false),
        material
      );
      tube.name = `vascular_braided_wall_tendon_${braidIndex + 1}`;
      tube.userData.phase = braidIndex * 1.9;
      tube.userData.targetingSuppressed = true;
      this.root.add(tube);
      this.braidTubes.push(tube);
    }

    // HC-016Z: repeated membrane folds make the vessel itself organize the
    // journey. These are presentation-only anatomy; valves retain gameplay.
    for (let index = 0; index < 9; index += 1) {
      const progress = 0.08 + index * 0.095;
      const point = this.pathCurve.getPointAt(progress);
      const tangent = this.pathCurve.getTangentAt(progress).normalize();
      const foldMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0x315a72 : 0x433b79,
        emissive: 0x203b55,
        emissiveIntensity: 0.11,
        roughness: 0.68,
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
        side: THREE.DoubleSide
      }));
      const fold = new THREE.Mesh(new THREE.TorusGeometry(0.78 + (index % 3) * 0.08, 0.055, 6, 28, Math.PI * 1.55), foldMaterial);
      fold.name = `vascular_membrane_fold_${index + 1}`;
      fold.position.copy(point);
      fold.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      fold.rotation.z += index * 0.63;
      fold.scale.y = 0.78 + (index % 2) * 0.14;
      fold.userData.baseScale = fold.scale.clone();
      fold.userData.targetingSuppressed = true;
      this.root.add(fold);
      this.wallFolds.push(fold);
    }

    for (const [index, progress] of (this.recipe.anatomy?.valveProgress ?? []).entries()) {
      this.createValve(index, progress);
    }
    this.createCurrentMotes();
    this.createCharge();
    this.createReturnFold();
    this.territoryExpansion = new RegionalTerritoryExpansion({kind: "vascular", parent: this.root});
    this.scene.add(this.root);
  }

  createValve(index, progress) {
    const group = new THREE.Group();
    group.name = `vascular_asymmetric_valve_${index + 1}`;
    group.position.copy(this.pathCurve.getPointAt(progress));
    const tangent = this.pathCurve.getTangentAt(progress).normalize();
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    Object.assign(group.userData, {
      progress,
      phase: index * 1.17,
      targetingSuppressed: true,
      valveRole: index === 0 ? "intake" : index === 1 ? "branch" : "deep_return"
    });

    const colors = [0x6b53ca, 0x4f7bd9, 0x8752b7];
    for (let lobeIndex = 0; lobeIndex < 3; lobeIndex += 1) {
      const side = lobeIndex === 2 ? 0 : lobeIndex === 0 ? -1 : 1;
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: colors[index % colors.length],
        emissive: colors[index % colors.length],
        emissiveIntensity: 0.22,
        roughness: 0.5,
        transparent: true,
        opacity: 0.72,
        depthWrite: false
      }));
      const lobe = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18 + lobeIndex * 0.018, 0.82 - lobeIndex * 0.08, 8, 12),
        material
      );
      lobe.name = `vascular_valve_${index + 1}_lobe_${lobeIndex + 1}`;
      lobe.position.set(side * 0.43, lobeIndex === 2 ? 0.08 : -0.04, lobeIndex === 2 ? -0.26 : 0.02);
      lobe.rotation.z = side * (0.48 + index * 0.05);
      lobe.scale.set(lobeIndex === 2 ? 0.72 : 0.82, 1, lobeIndex === 2 ? 0.58 : 0.74);
      Object.assign(lobe.userData, {
        side,
        basePosition: lobe.position.clone(),
        baseScale: lobe.scale.clone(),
        targetingSuppressed: true
      });
      group.add(lobe);
    }
    this.root.add(group);
    this.valves.push(group);
  }

  createCurrentMotes() {
    const count = this.recipe.anatomy?.currentMoteCount ?? 24;
    for (let index = 0; index < count; index += 1) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: index % 4 === 0 ? 0xb8f3ff : 0x6ca8e8,
        emissive: index % 4 === 0 ? 0x75dfff : 0x355caa,
        emissiveIntensity: 0.34,
        roughness: 0.3,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      }));
      const mote = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.035 + (index % 3) * 0.012, 0),
        material
      );
      mote.name = `vascular_current_cell_${index + 1}`;
      Object.assign(mote.userData, {
        baseProgress: index / count,
        lateralPhase: index * 1.73,
        targetingSuppressed: true
      });
      this.root.add(mote);
      this.currentMotes.push(mote);
    }
  }

  createCharge() {
    const visual = this.recipe.visual ?? {};
    this.chargeRoot = new THREE.Group();
    this.chargeRoot.name = "vascular_migrating_charge_body";
    this.chargeRoot.userData.targetingSuppressed = true;

    const coreMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: visual.signalColor ?? 0x78e3ff,
      emissive: visual.signalColor ?? 0x78e3ff,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    }));
    this.chargeCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 2), coreMaterial);
    this.chargeCore.name = "vascular_charge_nucleus";
    this.chargeRoot.add(this.chargeCore);
    this.chargeLight = new THREE.PointLight(visual.signalColor ?? 0x78e3ff, 0.9, 3.4);
    this.chargeLight.name = "vascular_charge_witness_light";
    this.chargeRoot.add(this.chargeLight);
    this.root.add(this.chargeRoot);

    const trailCount = this.recipe.anatomy?.chargeTrailCount ?? 9;
    for (let index = 0; index < trailCount; index += 1) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: 0x78d8ff,
        emissive: 0x4389d8,
        emissiveIntensity: 0.34,
        roughness: 0.28,
        transparent: true,
        opacity: Math.max(0.08, 0.48 - index * 0.045),
        depthWrite: false
      }));
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.07 - index * 0.004, 10, 8), material);
      mote.name = `vascular_charge_tail_${index + 1}`;
      mote.userData.lag = (index + 1) * 0.012;
      mote.userData.targetingSuppressed = true;
      this.root.add(mote);
      this.chargeTrail.push(mote);
    }
  }

  createReturnFold() {
    const returnOffset = this.recipe.returnFold?.position ?? [0, 0.05, 0.62];
    this.returnFold = new THREE.Group();
    this.returnFold.name = "vascular_hub_return_fold_body";
    this.returnFold.position.fromArray(returnOffset);
    Object.assign(this.returnFold.userData, {
      targetingSuppressed: true,
      crossingOwner: "LocalCellBoundaryMorphSystem",
      formsAfterSynchronization: true
    });

    for (const side of [-1, 1]) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: 0xd8a66f,
        emissive: 0xffc76d,
        emissiveIntensity: 0.38,
        roughness: 0.42,
        transparent: true,
        opacity: 0.76,
        depthWrite: false
      }));
      const lobe = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.86, 8, 12), material);
      lobe.name = side < 0 ? "vascular_return_fold_left_lobe" : "vascular_return_fold_right_lobe";
      lobe.position.set(side * 0.32, 0, 0);
      lobe.rotation.z = side * 0.56;
      lobe.scale.set(0.78, 1, 0.64);
      lobe.userData.side = side;
      lobe.userData.basePosition = lobe.position.clone();
      lobe.userData.targetingSuppressed = true;
      this.returnFold.add(lobe);
      this.returnFoldLobes.push(lobe);
    }
    const seamMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xffda8a,
      emissive: 0xffb84f,
      emissiveIntensity: 0.72,
      roughness: 0.2,
      transparent: true,
      opacity: 0.82,
      depthWrite: false
    }));
    const seam = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.62, 6, 8), seamMaterial);
    seam.name = "vascular_return_fold_living_seam";
    seam.rotation.z = Math.PI / 2;
    seam.userData.targetingSuppressed = true;
    this.returnFold.add(seam);
    this.returnFold.visible = false;
    this.root.add(this.returnFold);
  }

  samplePlayerPath(dt, frameState) {
    this.localPlayer.copy(this.playerRoot.position).sub(this.entryAnchor);
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    let bestProgress = 0;
    let bestT = 0;
    let bestIndex = 0;

    for (let index = 0; index < this.pathPoints.length - 1; index += 1) {
      const start = this.pathPoints[index];
      const end = this.pathPoints[index + 1];
      this.segmentVector.copy(end).sub(start);
      const lengthSq = Math.max(0.000001, this.segmentVector.lengthSq());
      this.segmentStartToPlayer.copy(this.localPlayer).sub(start);
      const t = THREE.MathUtils.clamp(
        this.segmentStartToPlayer.dot(this.segmentVector) / lengthSq,
        0,
        1
      );
      this.tempPoint.copy(start).addScaledVector(this.segmentVector, t);
      const distanceSq = this.tempPoint.distanceToSquared(this.localPlayer);
      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        bestT = t;
        bestIndex = index;
        bestProgress = (this.pathCumulativeLengths[index] + this.pathSegmentLengths[index] * t)
          / Math.max(0.0001, this.pathLength);
        this.closestPoint.copy(this.tempPoint);
        this.closestTangent.copy(this.segmentVector).normalize();
      }
    }

    this.pathProgress = THREE.MathUtils.clamp(bestProgress, 0, 1);
    this.maxDepthProgress = Math.max(this.maxDepthProgress, this.pathProgress);
    this.pathDistance = Math.sqrt(bestDistanceSq);

    const publishedVelocity = frameState.playerKinematics?.velocity;
    if (publishedVelocity) {
      this.derivedVelocity.set(
        publishedVelocity.x ?? 0,
        publishedVelocity.y ?? 0,
        publishedVelocity.z ?? 0
      );
    } else if (dt > 0) {
      this.derivedVelocity.copy(this.playerRoot.position)
        .sub(this.previousPlayerPosition)
        .multiplyScalar(1 / dt);
    } else {
      this.derivedVelocity.set(0, 0, 0);
    }
    this.previousPlayerPosition.copy(this.playerRoot.position);

    const speed = this.derivedVelocity.length();
    this.flowAlignment = speed > 0.045
      ? this.derivedVelocity.normalize().dot(this.closestTangent)
      : 0;

    return {
      progress: this.pathProgress,
      distance: this.pathDistance,
      tangent: this.closestTangent,
      closestPoint: this.closestPoint,
      segmentIndex: bestIndex,
      segmentT: bestT,
      speed,
      flowAlignment: this.flowAlignment
    };
  }

  updateCadence(dt, frameState, sample) {
    const cadence = this.recipe.cadence ?? {};
    const stabilization = this.recipe.stabilization ?? {};
    const currentization = this.recipe.currentization ?? {};
    const input = frameState.input ?? {};
    const composition = frameState.verbComposition ?? {};
    const requiredReads = cadence.requiredReads ?? 3;
    const readsComplete = this.lockedCadenceReads >= requiredReads;
    const valveProgress = this.recipe.anatomy?.valveProgress ?? [0.28, 0.55, 0.82];
    const corridorRadius = this.recipe.anatomy?.corridorRadius ?? 1.18;

    // Cadence is still a world rhythm and visual language. HC031R removes its
    // authority as a pass/fail input window: alignment may strengthen a valid
    // relationship read, but never decides whether that read is accepted.
    const previousPulseWindowOpen = this.pulseWindowOpen();

    if (this.completed) {
      this.cadencePhase = (this.returnElapsed / Math.max(0.2, cadence.secondsPerBeat ?? 2.35)) % 1;
      this.chargeProgress = 1 - this.cadencePhase;
    } else if (this.lockedCadenceReads < requiredReads) {
      const secondsPerBeat = Math.max(0.4, cadence.secondsPerBeat ?? 2.35);
      this.cadencePhase = (this.beatElapsed / secondsPerBeat) % 1;
      const segmentStart = this.lockedCadenceReads === 0
        ? 0.035
        : valveProgress[this.lockedCadenceReads - 1];
      const segmentEnd = valveProgress[this.lockedCadenceReads] ?? 0.84;
      const easedPhase = this.cadencePhase * this.cadencePhase * (3 - 2 * this.cadencePhase);
      this.chargeProgress = THREE.MathUtils.lerp(segmentStart, segmentEnd, easedPhase);
    } else {
      this.cadencePhase = 1;
      this.chargeProgress = valveProgress[valveProgress.length - 1] ?? 0.82;
    }

    this.tempPoint.copy(this.pathCurve.getPointAt(THREE.MathUtils.clamp(this.chargeProgress, 0, 1)));
    this.chargeWorldPosition.copy(this.entryAnchor).add(this.tempPoint);
    this.chargeDistance = this.playerRoot.position.distanceTo(this.chargeWorldPosition);

    const activeValveProgress = valveProgress[Math.min(this.lockedCadenceReads, valveProgress.length - 1)] ?? 0.82;
    this.tempPointB.copy(this.pathCurve.getPointAt(THREE.MathUtils.clamp(activeValveProgress, 0, 1)));
    this.tempPointB.add(this.entryAnchor);
    this.activeValveDistance = this.playerRoot.position.distanceTo(this.tempPointB);

    const contractionWave = (Math.sin(
      (this.elapsed * (cadence.contractionFrequency ?? 1.45) + this.pathProgress * 1.4) * Math.PI * 2
    ) + 1) * 0.5;
    this.contractionIntensity = THREE.MathUtils.smoothstep(contractionWave, 0.38, 0.92);

    const withinCurrent = sample.distance <= corridorRadius;
    const followingCharge = this.chargeDistance <= (cadence.followRange ?? 1.78);
    const movingWithFlow = sample.flowAlignment > -0.16 || sample.speed < 0.08;
    if (withinCurrent && followingCharge && movingWithFlow && !this.completed) {
      this.matchedFlowSeconds += dt;
      this.synchronization += dt * (cadence.matchedFlowSynchronizationPerSecond ?? 0.035);
    }

    if (!this.completed && sample.distance > corridorRadius * 1.22) {
      this.turbulence += dt * (cadence.driftTurbulencePerSecond ?? 0.07);
    }
    if (
      !this.completed
      && this.contractionIntensity > 0.54
      && sample.speed > 0.14
      && sample.flowAlignment < -0.2
    ) {
      this.turbulence += dt * (cadence.againstFlowTurbulencePerSecond ?? 0.1);
    }

    const normalStabilizationRange = stabilization.rangeFromCenterline ?? 1.36;
    const postReadStabilizationRange = Math.max(
      normalStabilizationRange,
      stabilization.postReadRangeFromCenterline ?? corridorRadius * 1.75
    );
    this.stabilizationRange = readsComplete
      ? postReadStabilizationRange
      : normalStabilizationRange;
    this.stabilizationInRange = sample.distance <= this.stabilizationRange;
    const stabilizing = Boolean(input.stabilizeHeld && this.stabilizationInRange);
    this.stabilizing = stabilizing;

    const approachReady = this.pathProgress >= activeValveProgress
      - (cadence.minimumValveApproachSlack ?? 0.19);
    const valveRelationshipRange = currentization.valveRelationshipRange ?? 1.9;
    const valveSpatiallyReady = Boolean(
      !readsComplete
      && withinCurrent
      && approachReady
      && this.activeValveDistance <= valveRelationshipRange
    );
    this.currentRelationshipHeld = Boolean(stabilizing && valveSpatiallyReady && !this.completed);
    if (this.currentRelationshipHeld) {
      this.currentRelationshipSeconds += dt;
    } else {
      const releaseRate = currentization.relationshipReleaseRate ?? 3.6;
      this.currentRelationshipSeconds = Math.max(0, this.currentRelationshipSeconds - dt * releaseRate);
    }
    const minimumRelationshipHoldSeconds = currentization.minimumRelationshipHoldSeconds ?? 0.18;
    this.currentRelationshipReady = Boolean(
      this.currentRelationshipHeld
      && this.currentRelationshipSeconds >= minimumRelationshipHoldSeconds
    );

    if (stabilizing && !this.completed) {
      this.stabilizeSeconds += dt;
      if (readsComplete) {
        this.synchronization += dt
          * (stabilization.postReadSynchronizationPerSecond ?? 0.34);
      }
      if (this.turbulence > 0 || this.circulationIntegrity < 1) {
        const recoveryMultiplier = readsComplete
          ? (stabilization.postReadRecoveryMultiplier ?? 2.4)
          : 1;
        this.turbulence = Math.max(
          0,
          this.turbulence
            - dt
            * (stabilization.turbulenceRecoveryPerSecond ?? 0.46)
            * recoveryMultiplier
        );
        this.circulationIntegrity = Math.min(
          1,
          this.circulationIntegrity
            + dt
            * (stabilization.integrityRecoveryPerSecond ?? 0.34)
            * recoveryMultiplier
        );
        this.recoverySeconds += dt;
        this.lastInteraction = "stabilize_reweaving_scattered_circulation";
        this.warning = "recoverable_desynchronization_settling";
      } else if (this.currentRelationshipReady && !readsComplete) {
        this.lastInteraction = "stabilize_established_living_current_relationship";
        this.warning = "pulse_through_held_current_relationship";
      } else if (this.contractionIntensity > 0.38) {
        this.synchronization += dt
          * (stabilization.synchronizationPerSecondDuringContraction ?? 0.055)
          * this.contractionIntensity;
        this.lastInteraction = "stabilize_holding_contraction_cadence";
        this.warning = "none";
      }
    }

    const pulseEventId = input.pulseEventId ?? (frameState.frame ?? 0);
    const freshPulse = Boolean(input.pulsePressed && pulseEventId !== this.lastPulseEventId);
    if (freshPulse) {
      this.lastPulseEventId = pulseEventId;
      this.pulseFlashAge = 0;
      if (!this.completed && this.lockedCadenceReads < requiredReads && this.currentRelationshipReady) {
        const beatAligned = Boolean(this.pulseWindowOpen() || previousPulseWindowOpen);
        const readQuality = beatAligned
          ? 1
          : (currentization.unalignedReadQuality ?? 0.72);
        this.lockedCadenceReads += 1;
        this.relationshipReadSequence += 1;
        this.lastRelationshipReadBeatAligned = beatAligned;
        this.lastRelationshipReadQuality = THREE.MathUtils.clamp(readQuality, 0, 1);
        this.lastRelationshipReadChord = composition.chord ?? "cohere_project";
        this.maxDepthProgress = Math.max(this.maxDepthProgress, activeValveProgress);
        const gainScale = 0.78 + this.lastRelationshipReadQuality * 0.22;
        this.synchronization += (cadence.onBeatSynchronizationGain ?? 0.22) * gainScale;
        this.circulationIntegrity += (cadence.onBeatIntegrityGain ?? 0.08) * gainScale;
        this.turbulence = Math.max(0, this.turbulence - (0.06 + 0.02 * this.lastRelationshipReadQuality));
        this.beatElapsed = 0;
        this.currentRelationshipSeconds = 0;
        this.currentRelationshipReady = false;
        this.lastInteraction = `current_relationship_${this.lockedCadenceReads}_projected_through_valve`;
        this.warning = "none";
      } else if (!this.completed && this.lockedCadenceReads < requiredReads) {
        this.unboundPulseCount += 1;
        this.lastRelationshipReadChord = composition.chord ?? "project";
        this.lastInteraction = !withinCurrent
          ? "pulse_dispersed_outside_living_current"
          : !approachReady || this.activeValveDistance > valveRelationshipRange
            ? "pulse_answered_before_next_valve_relationship"
            : !stabilizing
              ? "pulse_without_stabilized_current_relationship"
              : "current_relationship_not_yet_settled";
        this.warning = "stabilize_current_then_pulse_through_next_valve";
      } else if (!this.completed) {
        this.postReadPulseIgnoredCount += 1;
        this.lastInteraction = "three_relationship_reads_retained_extra_pulse_harmless";
        if (!this.desynchronized) this.warning = "three_current_reads_locked_hold_stabilize_to_settle";
      } else {
        this.lastInteraction = "pulse_echoed_through_synchronized_return_current";
      }
    }

    this.synchronization = THREE.MathUtils.clamp(this.synchronization, 0, 1);
    this.circulationIntegrity = THREE.MathUtils.clamp(this.circulationIntegrity, 0, 1);
    this.turbulence = THREE.MathUtils.clamp(this.turbulence, 0, 1);

    const wasDesynchronized = this.desynchronized;
    const nextDesynchronized = Boolean(
      this.turbulence >= (stabilization.desynchronizationTurbulenceThreshold ?? 0.34)
      || this.circulationIntegrity <= (stabilization.desynchronizationIntegrityThreshold ?? 0.8)
    );
    if (nextDesynchronized && !wasDesynchronized) {
      this.riskEventCount += 1;
      this.desynchronizationRecovered = false;
      if (!freshPulse || this.currentRelationshipReady) {
        this.lastInteraction = "living_current_relationship_scattered_by_flow";
      }
      this.warning = "recoverable_desynchronization_hold_stabilize_in_current";
    }
    this.desynchronized = nextDesynchronized;

    if (
      this.riskEventCount > 0
      && this.turbulence <= (stabilization.recoveryTurbulenceThreshold ?? 0.13)
      && this.circulationIntegrity >= (stabilization.recoveryIntegrityThreshold ?? 0.92)
    ) {
      this.desynchronizationRecovered = true;
      this.desynchronized = false;
      this.warning = "none";
    }

    const completion = this.recipe.completion ?? {};
    if (
      !this.completed
      && this.lockedCadenceReads >= requiredReads
      && this.maxDepthProgress >= (completion.minimumDeepProgress ?? 0.78)
      && this.synchronization >= (completion.minimumSynchronization ?? 0.74)
      && this.turbulence <= (completion.maximumTurbulence ?? 0.2)
      && this.circulationIntegrity >= (completion.minimumIntegrity ?? 0.82)
      && this.stabilizeSeconds >= (completion.minimumStabilizeSeconds ?? 0.8)
    ) {
      this.completed = true;
      this.returnFoldReady = true;
      this.returnElapsed = 0;
      this.currentRelationshipHeld = false;
      this.currentRelationshipReady = false;
      this.lastInteraction = "circulation_synchronized_relationship_reversed_toward_hub";
      this.warning = "none";
    }
  }

  registerDesynchronization(cadence, source) {
    this.riskEventCount += 1;
    this.offBeatPulseCount += 1;
    this.turbulence += cadence.offBeatTurbulence ?? 0.27;
    this.circulationIntegrity -= cadence.offBeatIntegrityLoss ?? 0.17;
    const earnedSynchronizationFloor = Math.min(
      cadence.maximumLockedReadSynchronizationFloor ?? 0.54,
      this.lockedCadenceReads * (cadence.lockedReadSynchronizationFloorPerRead ?? 0.18)
    );
    this.synchronization = Math.max(
      earnedSynchronizationFloor,
      this.synchronization - (cadence.offBeatSynchronizationLoss ?? 0.08)
    );
    this.desynchronizationRecovered = false;
    this.lastInteraction = source;
    this.warning = "recoverable_desynchronization_hold_stabilize_in_current";
  }

  updateTraversalMaterialResponse(dt, frameState, sample) {
    const input = frameState.input ?? {};
    const corridorRadius = this.recipe.anatomy?.corridorRadius ?? 1.18;
    const inLivingCurrent = sample.distance <= corridorRadius * 1.08;

    const pulseTarget = this.pulseFlashAge < 0.68
      ? 1 - this.pulseFlashAge / 0.68
      : 0;
    const absorbTarget = Boolean(input.absorbHeld && inLivingCurrent) ? 1 : 0;
    const stabilizeTarget = Boolean(this.stabilizing && inLivingCurrent) ? 1 : 0;

    const blend = (current, target, upRate, downRate) => {
      const rate = target > current ? upRate : downRate;
      return current + (target - current) * (1 - Math.exp(-dt * rate));
    };

    this.traversalPulseWake = blend(this.traversalPulseWake, pulseTarget, 11.0, 5.8);
    this.traversalAbsorbShear = blend(this.traversalAbsorbShear, absorbTarget, 7.4, 5.2);
    this.traversalStabilizeCalm = blend(this.traversalStabilizeCalm, stabilizeTarget, 8.2, 4.8);

    this.traversalMaterialMode = this.traversalStabilizeCalm > 0.12
      ? "stabilized_calm_lane"
      : this.traversalAbsorbShear > 0.12
        ? "absorb_draw_wake"
        : this.traversalPulseWake > 0.12
          ? "pulse_pressure_surge"
          : this.desynchronized
            ? "turbulent_current"
            : "ride_current";
  }


  updateGrammarReinforcement(frameState, sample) {
    if (this.completed || !this.active) {
      this.grammarReinforcementMode = "none";
      this.grammarReinforcementStrength = 0;
      this.grammarReinforcementMatched = false;
      this.grammarReinforcementWindow = 0;
      return;
    }

    const progress = THREE.MathUtils.clamp(sample.progress ?? this.pathProgress, 0, 1);
    const windows = [
      { start: 0.17, end: 0.33, mode: "uncertain_current_probe", impliedVerb: "pulse" },
      { start: 0.42, end: 0.59, mode: "loose_draw_release", impliedVerb: "absorb" },
      { start: 0.67, end: 0.84, mode: "phase_strain_contraction", impliedVerb: "stabilize" }
    ];
    const match = windows.find((window) => progress >= window.start && progress <= window.end);
    if (!match) {
      this.grammarReinforcementMode = "none";
      this.grammarReinforcementStrength = 0;
      this.grammarReinforcementMatched = false;
      this.grammarReinforcementWindow = 0;
      return;
    }

    const center = (match.start + match.end) * 0.5;
    const half = Math.max(0.001, (match.end - match.start) * 0.5);
    const linear = THREE.MathUtils.clamp(1 - Math.abs(progress - center) / half, 0, 1);
    const strength = linear * linear * (3 - 2 * linear);
    const input = frameState.input ?? {};
    const matched = match.impliedVerb === "pulse"
      ? this.pulseFlashAge < 0.68
      : match.impliedVerb === "absorb"
        ? Boolean(input.absorbHeld)
        : Boolean(input.stabilizeHeld || input.resonanceHeld);

    this.grammarReinforcementMode = match.mode;
    this.grammarReinforcementStrength = strength;
    this.grammarReinforcementMatched = matched;
    this.grammarReinforcementWindow = windows.indexOf(match) + 1;
  }

  applyDynamicCurrent(frameState, sample) {
    this.coreCoherenceResponse = readVascularCoherenceResponse(frameState, sample, this);
    const contractFeel = frameState.physicalFeel ?? {};
    this.hostPressureResponse = readVascularHostPressure(frameState);
    const direction = this.completed ? -1 : 1;
    // HC-016Y: circulation must matter between valves. The current is stronger
    // than the old presentation-biased drift, while turbulence remains recoverable.
    const baseFlowStrength = 0.56 + this.contractionIntensity * 0.30;
    // Pulse briefly sends a pressure surge down the existing current.
    // Absorb carves a small local draw-wake. Stabilize calms the current while held.
    // None of these modifiers alter cadence windows, completion thresholds or route truth.
    const worldComposition = frameState.hostRhythm?.composition ?? {};
    const worldRhythmFlowScale = worldComposition.active
      && worldComposition.profileId === "vascular_psa_44_micro"
      ? THREE.MathUtils.clamp(worldComposition.flowScale ?? 1, 0.96, 1.06)
      : 1;
    // Name the exact existing terms without changing arithmetic or physics.
    this.coreCoherenceResponse.directionalCalm = 1 - this.traversalStabilizeCalm * 0.34 * this.coreCoherenceResponse.factor;
    this.coreCoherenceResponse.neutralDirectionalCalm = 1 - this.traversalStabilizeCalm * 0.34;
    const flowStrength = baseFlowStrength
      * (1 + this.traversalPulseWake * 0.22)
      * (1 - this.traversalAbsorbShear * 0.16)
      * this.coreCoherenceResponse.directionalCalm
      * worldRhythmFlowScale
      * this.siltSignalReceiver.flowScale
      * this.hostPressureResponse.flowScale;
    const swirl = this.turbulence * 0.20
      * (1 + this.traversalPulseWake * 0.28)
      * (1 - this.traversalAbsorbShear * 0.18)
      * (1 - this.traversalStabilizeCalm * 0.68);
    const tangent = sample.tangent ?? this.closestTangent;
    const flowVector = {
      x: tangent.x * flowStrength * direction + Math.sin(this.elapsed * 4.1) * swirl,
      y: tangent.y * flowStrength * direction + Math.cos(this.elapsed * 3.4) * swirl * 0.55,
      z: tangent.z * flowStrength * direction
    };
    const authoredBounds = this.recipe?.movementBounds ?? {};
    const boundaryRadii = authoredBounds.radii ?? [4.5, 3.2, 22.5];
    frameState.physicalFeel = {
      ...contractFeel,
      viscosity: 0.31
        + this.turbulence * 0.24
        + this.traversalAbsorbShear * 0.05
        - this.traversalStabilizeCalm * 0.08,
      pressure: 0.60
        + this.contractionIntensity * 0.24
        + this.turbulence * 0.16
        + this.traversalPulseWake * 0.10
        - this.traversalStabilizeCalm * 0.12,
      flowVector,
      routeFeelProfile: "vascular_directional_circulation_hc018c",
      accelerationScale: 1.04 - this.turbulence * 0.12,
      speedScale: 1.02,
      boostScale: 1.0,
      flowCouplingScale: 1.34,
      withFlowSpeedBonus: 0.24,
      againstFlowSpeedPenalty: 0.20,
      spatialFeel: {
        progress: sample.progress ?? this.pathProgress,
        centerlineDistance: sample.distance ?? this.pathDistance,
        flowStrength,
        baseFlowStrength,
        turbulence: this.turbulence,
        traversalMaterialMode: this.traversalMaterialMode,
        pulseWake: this.traversalPulseWake,
        absorbShear: this.traversalAbsorbShear,
        stabilizeCalm: this.traversalStabilizeCalm,
        worldRhythmFlowScale,
        hostPressure: this.hostPressureResponse,
        remoteSiltMembraneLoad: this.siltSignalReceiver.membraneLoad,
        remoteSiltDirectionalFlowScale: this.siltSignalReceiver.flowScale,
        worldRhythmBeat: worldComposition.active ? worldComposition.beatNumber ?? 0 : 0,
        worldRhythmFunction: worldComposition.active ? worldComposition.currentFunction ?? "none" : "none",
        condition: this.completed
          ? "return_current_carries_core_toward_hub"
          : this.desynchronized
            ? "turbulent_current_fights_clean_alignment"
            : "matched_current_rewards_directional_flow"
      },
      boundaryBehavior: this.completed
        ? "vascular_synchronized_return_current"
        : this.desynchronized
          ? "vascular_recoverable_desynchronization_recoil"
          : "vascular_living_contraction_current",
      movementBounds: {
        active: Boolean(this.active),
        mode: authoredBounds.mode ?? "entry_anchored_ellipsoid",
        center: {
          x: this.entryAnchor.x,
          y: this.entryAnchor.y,
          z: this.entryAnchor.z
        },
        radii: {
          x: boundaryRadii[0] ?? boundaryRadii.x ?? 4.5,
          y: boundaryRadii[1] ?? boundaryRadii.y ?? 3.2,
          z: boundaryRadii[2] ?? boundaryRadii.z ?? 22.5
        },
        owner: authoredBounds.collisionOwner ?? "PlayerMovementController",
        tuningOwner: authoredBounds.tuningOwner ?? "VascularRhythmRouteSystem",
        regionId: "vascular_route",
        centerSource: authoredBounds.centerSource ?? "preserved_gate_entry_position",
        restoresPriorBoundaryOnExit: authoredBounds.restoresPriorBoundaryOnExit !== false
      }
    };
  }

  updateCurrentMoteTravel(dt, frameState) {
    if (!this.active || frameState.activeCellId !== ROUTE_CELL_ID) return;
    this.currentMoteCoherenceRatio = readCurrentMoteCoherenceRatio(frameState, this.coreCoherenceResponse);
    const composition = frameState.hostRhythm?.composition;
    const worldScale = composition?.active && composition.profileId === 'vascular_psa_44_micro'
      ? THREE.MathUtils.clamp(composition.moteSpeedScale ?? 1, 0.92, 1.10) : 1;
    const speed = (0.055 + this.synchronization * 0.025)
      * (1 + this.traversalPulseWake * 0.42)
      * (1 - this.traversalStabilizeCalm * 0.38)
      * worldScale * this.siltSignalReceiver.flowScale * this.currentMoteCoherenceRatio;
    this.currentMoteVisualRate = Number.isFinite(speed) ? (this.completed ? -1 : 1) * speed : 0;
    // GameRuntime supplies <=50ms substeps. Never use wall-clock backlog here.
    const seconds = Number.isFinite(dt) && dt > 0 ? Math.min(dt, 0.05) : 0;
    const phase = Number.isFinite(this.currentMoteTravelPhase) ? this.currentMoteTravelPhase : 0;
    this.currentMoteTravelPhase = seconds > 0 && this.currentMoteVisualRate !== 0
      ? ((phase + this.currentMoteVisualRate * seconds) % 1 + 1) % 1 : phase;
  }

  animate(dt, frameState, sample) {
    const t = frameState.runtimeSeconds ?? this.elapsed;
    const requiredReadsForMemory = Math.max(1, this.recipe.cadence?.requiredReads ?? 3);
    const retainedTarget = this.completed
      ? 1
      : THREE.MathUtils.clamp(this.lockedCadenceReads / requiredReadsForMemory, 0, 1);
    this.retainedSynchronizationStrength += (retainedTarget - this.retainedSynchronizationStrength)
      * (1 - Math.exp(-dt * 4.2));
    const visual = this.recipe.visual ?? {};
    const ready = this.pulseWindowOpen() && this.chargeDistance <= (this.recipe.cadence?.pulseRange ?? 1.3) * 1.35;
    const chargeColor = this.desynchronized
      ? this.stabilizing
        ? visual.recoveryColor ?? 0x82ffcf
        : visual.desyncColor ?? 0xf95b61
      : this.completed
        ? visual.returnColor ?? 0xffc96d
        : ready
          ? visual.readyColor ?? 0xffd9b8
          : visual.signalColor ?? 0x78e3ff;

    const remoteSiltLoad = this.siltSignalReceiver.membraneLoad;
    if (this.vesselEnvelope?.material) {
      this.vesselEnvelope.material.emissiveIntensity = 0.12
        + this.contractionIntensity * 0.16
        + this.synchronization * 0.08
        + remoteSiltLoad * (0.17 + 0.075 * Math.sin(t * 2.1));
      this.vesselEnvelope.material.opacity = 0.1 + this.synchronization * 0.07
        + remoteSiltLoad * 0.048;
      if (this.grammarReinforcementStrength > 0.01) {
        this.vesselEnvelope.material.emissiveIntensity += this.grammarReinforcementStrength * 0.08;
        this.vesselEnvelope.material.opacity += this.grammarReinforcementStrength * 0.025;
      }
    }
    for (const [index, tube] of this.braidTubes.entries()) {
      tube.material.emissiveIntensity = 0.16
        + this.contractionIntensity * (0.08 + index * 0.015)
        + this.turbulence * 0.18
        + remoteSiltLoad * (0.12 + 0.035 * Math.sin(t * 2.1 + index * 0.9));
      tube.material.opacity = 0.38 + this.synchronization * 0.2;
    }

    for (const [index, fold] of this.wallFolds.entries()) {
      const baseScale = fold.userData.baseScale;
      if (baseScale) {
        fold.scale.x = baseScale.x;
        fold.scale.y = baseScale.y;
        fold.scale.z = baseScale.z;
      }
      const retained = this.retainedSynchronizationStrength;
      const readCoverage = THREE.MathUtils.clamp(
        (this.lockedCadenceReads - index / 3) / Math.max(1, requiredReadsForMemory),
        0,
        1
      );
      const memory = Math.max(retained * 0.45, readCoverage * 0.65);
      // Authored Vascular tissue translates its local receiver state into a
      // subtle swelling/relaxing wave, not a diagnostic overlay or new mesh.
      const siltWave = remoteSiltLoad * (0.07 + 0.045 * Math.sin(t * 2.1 - index * 0.42));
      fold.scale.y = (baseScale?.y ?? (0.78 + (index % 2) * 0.14))
        * (1 + memory * 0.08 + siltWave);
      fold.rotation.z += Math.sin(index * 1.17) * memory * 0.002;
      if (fold.material) {
        fold.material.opacity = 0.24 + memory * 0.10 + remoteSiltLoad * 0.09;
        fold.material.emissiveIntensity = 0.11 + memory * (this.completed ? 0.20 : 0.11)
          + remoteSiltLoad * 0.22;
      }
      if (this.grammarReinforcementMode === "phase_strain_contraction") {
        const unsettled = this.grammarReinforcementStrength * (1 - this.traversalStabilizeCalm * 0.88);
        fold.rotation.z += Math.sin(t * (2.4 + index * 0.17) + index * 1.31) * unsettled * 0.052;
        fold.scale.x *= 1 + Math.sin(t * 3.1 + index * 0.77) * unsettled * 0.055;
        if (fold.material) fold.material.emissiveIntensity += unsettled * 0.11;
      }
      fold.userData.retainedConsequence = memory > 0.08
        ? "cadence_passed_through_this_tissue"
        : "none";
    }

    for (const [index, valve] of this.valves.entries()) {
      const locked = index < this.lockedCadenceReads;
      const activeValve = index === this.lockedCadenceReads && !this.completed;
      const worldComposition = frameState.hostRhythm?.composition ?? {};
      const worldBarPhase = worldComposition.active
        && worldComposition.profileId === "vascular_psa_44_micro"
        ? worldComposition.barPhase ?? 0
        : null;
      const valveBeat = activeValve
        ? this.cadencePhase
        : worldBarPhase === null
          ? (t * 0.17 + index * 0.31) % 1
          : (worldBarPhase + index * 0.19) % 1;
      const opening = this.completed
        ? 0.86
        : activeValve && this.pulseWindowOpen()
          ? 1
          : locked ? 0.72 : 0.18 + (Math.sin(valveBeat * Math.PI * 2) + 1) * 0.12;
      for (const lobe of valve.children) {
        if (!lobe.isMesh) continue;
        const basePosition = lobe.userData.basePosition;
        const baseScale = lobe.userData.baseScale;
        const side = lobe.userData.side ?? 0;
        if (basePosition) {
          lobe.position.copy(basePosition);
          lobe.position.x += side * opening * 0.18;
        }
        if (baseScale) {
          lobe.scale.copy(baseScale);
          lobe.scale.y *= 1 - this.contractionIntensity * (activeValve ? 0.16 : 0.08);
        }
        if (lobe.material) {
          lobe.material.emissiveIntensity = locked ? 0.42 : activeValve ? 0.28 + opening * 0.46 : 0.16;
          lobe.material.opacity = locked ? 0.86 : activeValve ? 0.78 : 0.5;
        }
      }
    }

    if (this.chargeRoot) {
      this.chargeRoot.position.copy(this.pathCurve.getPointAt(THREE.MathUtils.clamp(this.chargeProgress, 0, 1)));
      const jitter = this.desynchronized ? 0.055 + this.turbulence * 0.08 : 0;
      this.chargeRoot.position.x += Math.sin(t * 19.2) * jitter;
      this.chargeRoot.position.y += Math.cos(t * 16.7) * jitter * 0.72;
      const worldBeatPulse = frameState.hostRhythm?.composition?.active
        && frameState.hostRhythm.composition.profileId === "vascular_psa_44_micro"
        ? frameState.hostRhythm.composition.beatPulse ?? 0
        : 0;
      const chargePulse = 1
        + Math.sin(t * 7.2) * 0.055
        + worldBeatPulse * 0.07
        + (ready ? 0.22 : 0)
        + (this.pulseFlashAge < 0.25 ? 0.25 : 0);
      this.chargeCore.scale.setScalar(chargePulse);
      this.chargeCore.material.color.setHex(chargeColor);
      this.chargeCore.material.emissive.setHex(chargeColor);
      this.chargeCore.material.emissiveIntensity = ready ? 1.35 : this.desynchronized ? 1.1 : 0.76;
      this.chargeLight.color.setHex(chargeColor);
      this.chargeLight.intensity = ready ? 1.85 : this.desynchronized ? 1.28 : 0.84;
    }

    for (const trail of this.chargeTrail) {
      let progress = this.chargeProgress + (this.completed ? 1 : -1) * (trail.userData.lag ?? 0.01);
      progress = THREE.MathUtils.clamp(progress, 0, 1);
      trail.position.copy(this.pathCurve.getPointAt(progress));
      trail.material.color.setHex(chargeColor);
      trail.material.emissive.setHex(chargeColor);
    }

    for (const mote of this.currentMotes) {
      let progress = (mote.userData.baseProgress + this.currentMoteTravelPhase) % 1;
      if (progress < 0) progress += 1;
      mote.userData.renderedTravelProgress = progress;
      mote.position.copy(this.pathCurve.getPointAt(progress));
      const tangent = this.pathCurve.getTangentAt(progress).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      let lateral = Math.sin(t * 1.8 + mote.userData.lateralPhase)
        * 0.13
        * (1 + this.traversalPulseWake * 0.55)
        * (1 - this.traversalStabilizeCalm * 0.72);
      const worldRhythmFunction = frameState.hostRhythm?.composition?.active
        && frameState.hostRhythm.composition.profileId === "vascular_psa_44_micro"
        ? frameState.hostRhythm.composition.currentFunction ?? "none"
        : "none";
      const worldRhythmAccent = frameState.hostRhythm?.composition?.active
        && frameState.hostRhythm.composition.profileId === "vascular_psa_44_micro"
        ? frameState.hostRhythm.composition.accentStrength ?? 0
        : 0;
      // Perceptual accent only: receive/hold beats tighten the visible stream
      // around the authored path but do not add force or timing authority.
      if (worldRhythmFunction === "absorb") lateral *= 1 - worldRhythmAccent * 0.26;
      else if (worldRhythmFunction === "stabilize") lateral *= 1 - worldRhythmAccent * 0.14;
      if (this.grammarReinforcementMode === "uncertain_current_probe") {
        lateral += Math.sin(t * 4.1 + mote.userData.lateralPhase * 1.6)
          * 0.085 * this.grammarReinforcementStrength;
      } else if (this.grammarReinforcementMode === "phase_strain_contraction") {
        const strain = this.grammarReinforcementStrength * (1 - this.traversalStabilizeCalm * 0.9);
        lateral += Math.sin(t * 3.8 + mote.userData.lateralPhase * 2.3)
          * 0.13 * strain;
      }
      mote.position.addScaledVector(side, lateral);

      if (this.grammarReinforcementMode === "loose_draw_release" && this.grammarReinforcementStrength > 0.01) {
        this.tempPointB.copy(this.localPlayer).sub(mote.position);
        const inviteDistance = this.tempPointB.length();
        if (inviteDistance < 3.3 && inviteDistance > 0.001) {
          const drawRelease = 0.5 + 0.5 * Math.sin(t * 1.35 + mote.userData.lateralPhase * 0.35);
          mote.position.addScaledVector(
            this.tempPointB.normalize(),
            this.grammarReinforcementStrength * drawRelease * (1 - inviteDistance / 3.3) * 0.07
          );
        }
      }

      if (this.traversalAbsorbShear > 0.02) {
        this.tempPointB.copy(this.localPlayer).sub(mote.position);
        const localDistance = this.tempPointB.length();
        if (localDistance < 2.45 && localDistance > 0.001) {
          mote.position.addScaledVector(
            this.tempPointB.normalize(),
            this.traversalAbsorbShear * (1 - localDistance / 2.45) * 0.22
          );
        }
      }

      mote.material.opacity = 0.26
        + this.synchronization * 0.3
        + this.traversalPulseWake * 0.14
        - this.traversalStabilizeCalm * 0.08;
      mote.material.emissiveIntensity = 0.22
        + this.contractionIntensity * 0.18
        + this.traversalPulseWake * 0.18
        + this.traversalStabilizeCalm * 0.08
        + this.grammarReinforcementStrength * 0.09
        + remoteSiltLoad * 0.18;
    }

    if (this.returnFold) {
      this.returnFold.visible = this.returnFoldReady;
      if (this.returnFoldReady) {
        const foldPulse = (Math.sin(t * 2.9) + 1) * 0.5;
        for (const lobe of this.returnFoldLobes) {
          const side = lobe.userData.side ?? 0;
          lobe.position.copy(lobe.userData.basePosition);
          lobe.position.x += side * foldPulse * 0.08;
          lobe.material.emissiveIntensity = 0.32 + foldPulse * 0.42;
        }
      }
    }

    this.root.userData.activePathProgress = sample.progress;
    this.root.userData.circulationDirection = this.completed ? "outward_to_hub" : "inward_to_deep_valve";
    this.root.userData.desynchronized = this.desynchronized;
  }

  pulseWindowOpen() {
    if (this.completed) return false;
    const cadence = this.recipe.cadence ?? {};
    if (this.lockedCadenceReads >= (cadence.requiredReads ?? 3)) return false;
    return this.cadencePhase >= (cadence.pulseWindowStart ?? 0.68)
      && this.cadencePhase <= (cadence.pulseWindowEnd ?? 0.93);
  }

  completionProgress() {
    const requiredReads = Math.max(1, this.recipe.cadence?.requiredReads ?? 3);
    const readPart = Math.min(1, this.lockedCadenceReads / requiredReads) * 0.52;
    const depthPart = Math.min(1, this.maxDepthProgress / Math.max(0.01, this.recipe.completion?.minimumDeepProgress ?? 0.78)) * 0.18;
    const stabilizePart = Math.min(1, this.stabilizeSeconds / Math.max(0.01, this.recipe.completion?.minimumStabilizeSeconds ?? 0.8)) * 0.12;
    const syncPart = Math.min(1, this.synchronization / Math.max(0.01, this.recipe.completion?.minimumSynchronization ?? 0.74)) * 0.18;
    return this.completed ? 1 : THREE.MathUtils.clamp(readPart + depthPart + stabilizePart + syncPart - this.turbulence * 0.12, 0, 0.99);
  }

  stage() {
    if (this.completed) return "return_current";
    const requiredReads = this.recipe.cadence?.requiredReads ?? 3;
    const readsComplete = this.lockedCadenceReads >= requiredReads;
    if (readsComplete && (this.desynchronized || this.warning.includes("desynchronization"))) {
      return "recover_retained_current_relationships";
    }
    if (readsComplete) return "settle_retained_current_relationships";
    if (this.desynchronized || this.warning.includes("desynchronization")) return "recover_desynchronization";
    if (this.currentRelationshipReady) return "project_through_stabilized_current";
    if (this.currentRelationshipHeld) return "establish_current_relationship";
    return [
      "ride_intake_current",
      "ride_branch_current",
      "ride_deep_current",
      "settle_deep_circulation"
    ][Math.min(this.lockedCadenceReads, 3)];
  }

  guideLine() {
    const handoff = this.returnHandoffAction();
    if (handoff) return handoff;
    if (this.completed) return "The vessel retained the relationship. Its current now carries you back toward the Hub.";
    const requiredReads = this.recipe.cadence?.requiredReads ?? 3;
    const readsComplete = this.lockedCadenceReads >= requiredReads;
    if (readsComplete && (this.desynchronized || this.warning.includes("desynchronization"))) {
      return "All three current reads are retained. Hold Stabilize while the scattered flow reweaves.";
    }
    if (readsComplete) {
      return "All three current reads are retained. Hold Stabilize long enough for the circulation to settle and reverse.";
    }
    if (this.desynchronized || this.warning.includes("desynchronization")) {
      return "The current scattered, but the relationship is recoverable. Hold Stabilize inside the living flow.";
    }
    if (this.currentRelationshipReady) {
      return "The current is held against the next valve. Pulse through that relationship; the beat changes strength, not permission.";
    }
    if (this.currentRelationshipHeld) {
      return "Keep Stabilize held for a moment so the next valve and Core settle into one current.";
    }
    return "Move with the bright charge to the next valve, then Stabilize to establish the current relationship.";
  }

  nextAction() {
    const handoff = this.returnHandoffAction();
    if (handoff) return handoff;
    if (this.completed) return "Follow the gold return current into the open entry fold.";
    const requiredReads = this.recipe.cadence?.requiredReads ?? 3;
    const readsComplete = this.lockedCadenceReads >= requiredReads;
    if (readsComplete) {
      return this.stabilizationInRange
        ? "Hold Stabilize until the retained current settles and reverses toward the Hub."
        : "Move back inside the braided current, then hold Stabilize to settle it.";
    }
    if (this.desynchronized || this.warning.includes("desynchronization")) {
      return "Hold Stabilize near the center current until the scattered flow reweaves.";
    }
    if (this.currentRelationshipReady) {
      return "Pulse while Stabilize is held. Rhythm alignment strengthens the read but is not a timing gate.";
    }
    if (this.currentRelationshipHeld) {
      return "Keep Stabilize held briefly; then Pulse through the next valve.";
    }
    return "Ride to the next valve and hold Stabilize to establish a relationship with the current.";
  }

  // C0C-VIS1-B: a *visible* pressure band through the existing nine folds.
  // Changes only Vascular presentation. The received Silt load is read-only;
  // this method never changes the receiver, transport, current or progression.
  // The narrow sweeping band is a LOCAL circulation cue, not fresh receipts.
  applySiltPressureAnatomy() {
    const load = THREE.MathUtils.clamp(this.siltSignalReceiver.membraneLoad, 0, 0.85);
    const age = this.vis1WaveAge;
    const justRecovered = load === 0 && (this.vis1Applied?.membraneLoad ?? 0) > 0;
    let peakCompression = 0;
    let sumCompression = 0;
    let sumExpansion = 0;
    let strongestArrival = 0;
    let strongestBand = 0;
    let modified = 0;
    if (load > 0) {
      // The old broad sine wave hit the 26% compression limit on several folds
      // at once; this bounded, narrow traveling band makes direction legible.
      for (const [index, fold] of this.wallFolds.entries()) {
        if (!fold) continue;
        const band = Math.pow(0.5 + 0.5 * Math.cos(this.elapsed * 2.05 - index * 0.62), 3);
        const arrival = age < 5
          ? Math.max(0, 1 - Math.abs(index - age * 2.15) / 1.35) * (1 - age / 5)
          : 0;
        const compression = Math.min(0.26, load * (0.07 + 0.23 * band) + arrival * load * 0.20);
        const expansion = Math.min(0.33, load * (0.11 + 0.23 * band) + arrival * load * 0.15);
        fold.scale.x *= 1 - compression;
        fold.scale.z *= 1 - compression * 0.74;
        fold.scale.y *= 1 + expansion;
        if (fold.material) {
          // Loaded folds lead with pale living cyan, separate from the gold
          // route marker. Unloaded/restored folds keep their authored palette.
          const colorPressure = load / 0.85 * (0.38 + 0.62 * band);
          fold.material.emissive?.setRGB?.(
            0.1255 + colorPressure * 0.16,
            0.2314 + colorPressure * 0.49,
            0.3333 + colorPressure * 0.42
          );
          fold.material.emissiveIntensity = Math.min(1.15,
            fold.material.emissiveIntensity + load * (0.36 + 0.49 * band) + arrival * load * 0.17);
          fold.material.opacity = Math.min(0.83,
            fold.material.opacity + load * (0.16 + 0.32 * band) + arrival * load * 0.07);
        }
        peakCompression = Math.max(peakCompression, compression);
        strongestArrival = Math.max(strongestArrival, arrival);
        strongestBand = Math.max(strongestBand, band);
        sumCompression += compression;
        sumExpansion += expansion;
        modified += 1;
      }
      // Braids support the same local pressure wave rather than flashing on
      // receipt count. They remain the original authored meshes/materials.
      for (const [index, braid] of this.braidTubes.entries()) {
        if (!braid?.material) continue;
        const band = Math.pow(0.5 + 0.5 * Math.cos(this.elapsed * 2.05 - index * 1.86), 3);
        braid.material.emissiveIntensity += load * (0.09 + 0.13 * band);
      }
      if (this.vesselEnvelope?.material) {
        // Loaded tissue must be REVEALED, not hidden by a thickening shell.
        // Retain a minimum silhouette and preserve normal zero-load opacity.
        this.vesselEnvelope.material.emissiveIntensity += load * 0.035;
        this.vesselEnvelope.material.opacity = Math.max(0.065,
          this.vesselEnvelope.material.opacity - load * 0.15);
      }
    } else if (justRecovered) {
      // Reset the presentation-only hue after the last load dissipates.
      // At a never-loaded zero state this remains a strict mesh no-op.
      for (const fold of this.wallFolds) fold?.material?.emissive?.setHex?.(0x203b55);
    }
    // The three states are observational labels for existing load and receipt
    // age; they are never read back by gameplay or a progress/route gate.
    const tissueState = load === 0 ? 'resting'
      : age < 5 ? 'receipt_onset'
      : load >= 0.65 ? 'loaded_pressure' : 'recovering_pressure';
    this.vis1Applied = {
      revision: 'C0C-VIS1-B',
      mode: load > 0 ? 'local_pressure_band_and_envelope_reveal' : 'unloaded_no_op',
      tissueState,
      membraneLoad: Number(load.toFixed(5)),
      receiptWaveAgeSeconds: Number(age.toFixed(3)),
      foldCount: modified,
      peakRadialCompression: Number(peakCompression.toFixed(5)),
      meanRadialCompression: Number((modified ? sumCompression / modified : 0).toFixed(5)),
      meanYExpansion: Number((modified ? sumExpansion / modified : 0).toFixed(5)),
      receiptArrivalStrength: Number(strongestArrival.toFixed(5)),
      circulatingBandPeak: Number(strongestBand.toFixed(5)),
      envelopeOpacityApplied: Number((this.vesselEnvelope?.material?.opacity ?? 0).toFixed(5)),
      presentationOnly: true,
      altersCurrentOrProgress: false
    };
  }

  // C0C-TRACE1-B: passive readings of already-applied presentation parameters.
  // Called only after animate() and applyHostRhythmVisual() finish. No controls,
  // material ownership, movement, route progression, or scene graph changes.
  readSiltArrivalPresentation(active) {
    const event = this.siltArrivalPresentationEvent;
    const fold = this.wallFolds?.[0];
    if (!active || !event || !fold) return null;
    const position = fold.getWorldPosition(new THREE.Vector3());
    return {
      pass: "CONNECTION19", owner: "VascularRhythmRouteSystem",
      authority: "HostConnectionReceiptLedger", kind: event.kind,
      receiptId: event.id, sequence: event.sequence,
      parentSiltReceiptId: event.parentSiltReceiptId,
      appliedDelta: event.appliedDelta,
      ageSeconds: Math.max(0, this.elapsed - this.siltArrivalPresentationAt),
      position: { x: position.x, y: position.y, z: position.z },
      source: "first_existing_vascular_wall_fold",
      materialTransfer: false, routeCredit: false
    };
  }

  readPresentationTelemetry(frameState, active) {
    if (!active) return null;
    const finite = value => Number.isFinite(value) ? Number(value.toFixed(5)) : null;
    const mean = (items, read) => {
      const values = items.map(read).filter(Number.isFinite);
      return values.length ? finite(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
    };
    const mat = (mesh, name) => finite(mesh?.material?.[name]);
    const receiver = this.siltSignalReceiver.snapshot();
    const remoteLoad = receiver.membraneLoad;
    const spatial = frameState.physicalFeel?.spatialFeel ?? {};
    const vector = frameState.physicalFeel?.flowVector ?? {};
    const currentMagnitude = [vector.x, vector.y, vector.z].every(Number.isFinite)
      ? Math.hypot(vector.x, vector.y, vector.z) : null;
    const folds = this.wallFolds.filter(Boolean);
    const braids = this.braidTubes.filter(Boolean);
    const motes = this.currentMotes.filter(Boolean);
    const firstMote = motes[0]?.position;
    return {
      revision: 'C0C-TRACE1-B',
      measurement: 'applied_object_values_after_visual_updates',
      localSeconds: finite(this.elapsed),
      receiptCount: receiver.receivedTotal,
      membraneLoad: finite(remoteLoad),
      directionalFlowScale: finite(receiver.directionalFlowScale),
      actualFlowStrength: finite(spatial.flowStrength),
      actualFlowMagnitude: finite(currentMagnitude),
      sourceContribution: {
        vesselOpacity: finite(remoteLoad * 0.048),
        foldScaleYFractionMin: finite(remoteLoad * 0.025),
        foldScaleYFractionMax: finite(remoteLoad * 0.115),
        foldOpacity: finite(remoteLoad * 0.09),
        foldEmissive: finite(remoteLoad * 0.22),
        moteEmissive: finite(remoteLoad * 0.18)
      },
      applied: {
        vesselEmissive: mat(this.vesselEnvelope, 'emissiveIntensity'),
        vesselOpacity: mat(this.vesselEnvelope, 'opacity'),
        braidCount: braids.length,
        braidMeanEmissive: mean(braids, x => x.material?.emissiveIntensity),
        foldCount: folds.length,
        foldMeanYScaleRatio: mean(folds, x => x.userData?.baseScale?.y
          ? x.scale.y / x.userData.baseScale.y : Number.NaN),
        foldMeanXScaleRatio: mean(folds, x => x.userData?.baseScale?.x
          ? x.scale.x / x.userData.baseScale.x : Number.NaN),
        foldMeanZScaleRatio: mean(folds, x => x.userData?.baseScale?.z
          ? x.scale.z / x.userData.baseScale.z : Number.NaN),
        foldMeanEmissive: mean(folds, x => x.material?.emissiveIntensity),
        foldMeanOpacity: mean(folds, x => x.material?.opacity),
        moteCount: motes.length,
        moteMeanEmissive: mean(motes, x => x.material?.emissiveIntensity),
        moteMeanOpacity: mean(motes, x => x.material?.opacity),
        firstMotePosition: firstMote ? {
          x: finite(firstMote.x), y: finite(firstMote.y), z: finite(firstMote.z)
        } : null
      },
      vis1: this.vis1Applied ? { ...this.vis1Applied } : null,
      otherDrivers: {
        contraction: finite(this.contractionIntensity),
        synchronization: finite(this.synchronization),
        turbulence: finite(this.turbulence),
        pulseWake: finite(this.traversalPulseWake),
        absorbShear: finite(this.traversalAbsorbShear),
        stabilizeCalm: finite(this.traversalStabilizeCalm),
        grammarStrength: finite(this.grammarReinforcementStrength),
        hostRhythmActive: Boolean(frameState.hostRhythm?.active)
      },
      caveat: 'Measured object values have multiple drivers; not proof of visible pixel change, player perception, or physical matter transfer.'
    };
  }

  // HOST-CAUSE1: coherent protective tone, distinct from Silt's traveling band.
  // animate() resets fold scale/material strengths before this post-composition step.
  // These non-targetable wall folds are presentation, never collision/anchor truth.
  applyHostPressureAnatomy() {
    const response = this.hostPressureResponse;
    let modified = 0;
    if (response?.active) {
      for (const fold of this.wallFolds) {
        fold.scale.x *= 1 - response.visualCompression;
        fold.scale.z *= 1 - response.visualCompression * 0.625;
        if (fold.material) {
          fold.material.emissiveIntensity += response.amplitude * 0.28;
          fold.material.opacity = Math.min(0.95, fold.material.opacity + response.amplitude * 0.12);
        }
        modified++;
      }
    }
    this.hostPressureVisual = {
      active: Boolean(response?.active), foldCount: modified,
      radialCompression: response?.visualCompression ?? 0,
      episodeId: response?.episodeId ?? null, presentationOnly: true,
      collisionMutation: false, receiverMutation: false
    };
  }

  publish(frameState, active) {
    const returnDistance = this.playerRoot.position.distanceTo(this.returnPosition);
    const requiredReads = this.recipe?.cadence?.requiredReads ?? 3;
    const stage = this.stage();
    // The Host may carry a prior Silt *cause*, not the grain itself.
    // No Vascular route logic reads this to progress or change circulation.
    const hostCause = this.hostConnectionReceiptLedger?.forVascular() ?? null;
    frameState.vascularRhythmRoute = {
      returnHandoff: this.returnHandoff.snapshot({
        eligible: this.returnHandoffEligible(frameState),
        active: Boolean(active && this.returnHandoffEligible(frameState)
          && !(frameState.inspectionCamera ?? frameState.tightInspectionCamera)?.coreWorkActive)
      }),
      currentMoteTravel: { pass: 'CONNECTION5', presentationOnly: true,
        phase: this.currentMoteTravelPhase, rate: active ? this.currentMoteVisualRate : 0,
        coherenceRatio: active ? this.currentMoteCoherenceRatio : 1 },
      coreCoherenceResponse: active ? (this.coreCoherenceResponse ?? null)
        : { pass: 'CONNECTION3', eligible: false, reason: 'not_mounted', factor: 1 },
      hostPressureResponse: active ? (this.hostPressureResponse ?? null) : null,
      hostPressureVisual: active ? (this.hostPressureVisual ?? null) : null,
      hostConnectionObservation: hostCause,
      // LS1E2: receiver state belongs to Vascular; Silt receipts stay immutable.
      siltSignalResponse: this.siltSignalReceiver.snapshot(),
      siltArrivalPresentation: this.readSiltArrivalPresentation(active),
      presentationTrace: this.readPresentationTelemetry(frameState, active),
      pass: "HC-031R",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      regionId: "vascular_route",
      runtimeCellId: ROUTE_CELL_ID,
      status: this.completed
        ? active ? "circulation_synchronized_return_current_active" : "circulation_synchronized_retained"
        : active
          ? this.desynchronized ? "recoverable_desynchronization_active" : "vascular_rhythm_playable"
          : "prepared_inactive",
      stage,
      progress: this.completionProgress(),
      completed: this.completed,
      synchronizationComplete: this.completed,
      pathProgress: active ? this.pathProgress : 0,
      maxDepthProgress: this.maxDepthProgress,
      pathDistance: active ? this.pathDistance : 0,
      flowAlignment: active ? this.flowAlignment : 0,
      cadencePhase: active ? this.cadencePhase : 0,
      pulseWindowOpen: Boolean(active && this.pulseWindowOpen()),
      chargeDistance: active && Number.isFinite(this.chargeDistance) ? this.chargeDistance : 0,
      chargePosition: active ? {
        x: this.chargeWorldPosition.x,
        y: this.chargeWorldPosition.y,
        z: this.chargeWorldPosition.z
      } : null,
      // Compatibility fields remain for old objective/save consumers. HC031R's
      // canonical progression language is relationshipReads below.
      lockedCadenceReads: this.lockedCadenceReads,
      requiredCadenceReads: requiredReads,
      relationshipReads: this.lockedCadenceReads,
      requiredRelationshipReads: requiredReads,
      relationshipReadSequence: this.relationshipReadSequence,
      currentRelationshipHeld: Boolean(active && this.currentRelationshipHeld),
      currentRelationshipReady: Boolean(active && this.currentRelationshipReady),
      currentRelationshipSeconds: active ? this.currentRelationshipSeconds : 0,
      activeValveDistance: active && Number.isFinite(this.activeValveDistance) ? this.activeValveDistance : 0,
      lastRelationshipReadBeatAligned: this.lastRelationshipReadBeatAligned,
      lastRelationshipReadQuality: this.lastRelationshipReadQuality,
      lastRelationshipReadChord: this.lastRelationshipReadChord,
      unboundPulseCount: this.unboundPulseCount,
      currentization: {
        pass: "HC-031R",
        canonicalRead: "stabilize_establishes_environmental_current_relationship_then_pulse_projects_through_it",
        relationshipSource: "environmental_current",
        nounTargetingAuthorityChanged: false,
        aimChoosesTargetForTargetableNouns: true,
        environmentalCurrentMayBeRelatedWithoutNounTarget: true,
        beatAlignmentAffectsQualityOnly: true,
        inputTimingGate: false,
        legacyCadenceWindowProgressionAuthority: false,
        legacyLockedCadenceReadsCompatibilityAlias: true,
        progressionAuthority: true,
        crossingAuthority: false
      },
      synchronization: this.synchronization,
      circulationIntegrity: this.circulationIntegrity,
      turbulence: this.turbulence,
      contractionIntensity: active ? this.contractionIntensity : 0,
      retainedConsequence: {
        pass: "HC-018D",
        active: this.lockedCadenceReads > 0 || this.completed,
        kind: this.completed
          ? "synchronized_return_current_retained"
          : this.lockedCadenceReads > 0
            ? "cadence_reads_retained_in_vessel"
            : "none",
        strength: this.retainedSynchronizationStrength,
        survivesUnmountRemount: true,
        progressionAuthority: false
      },
      traversalMaterial: {
        pass: "HC-018D",
        mode: active ? this.traversalMaterialMode : "inactive",
        pulsePressureSurge: active ? this.traversalPulseWake : 0,
        absorbDrawWake: active ? this.traversalAbsorbShear : 0,
        stabilizeCalmLane: active ? this.traversalStabilizeCalm : 0,
        progressionAuthority: false,
        chemistryAuthority: false,
        routeCrossingAuthority: false
      },
      coreWorldResonance: {
        pass: "HC-028D",
        active: Boolean(frameState.coreWorldResonance?.active),
        relation: frameState.coreWorldResonance?.relationshipState ?? "inactive",
        coherence01: frameState.coreWorldResonance?.coherence01 ?? 0,
        phaseAlignment01: frameState.coreWorldResonance?.phaseAlignment01 ?? 0,
        coreFunction: frameState.coreWorldResonance?.coreFunction ?? "none",
        worldFunction: frameState.coreWorldResonance?.worldFunction ?? "none",
        presentationOnly: true,
        progressionAuthority: false,
        routeCompletionAuthority: false,
        movementAuthority: false
      },
      worldComposition: {
        pass: "HC-028C",
        active: Boolean(frameState.hostRhythm?.composition?.active),
        profileId: frameState.hostRhythm?.composition?.profileId ?? "legacy_host_breath",
        keyId: frameState.hostRhythm?.composition?.keyId ?? "unassigned",
        meter: frameState.hostRhythm?.composition?.meterLabel ?? "unassigned",
        tempoBpm: frameState.hostRhythm?.composition?.tempoBpm ?? 0,
        octave: frameState.hostRhythm?.composition?.octaveLabel ?? "unassigned",
        beatNumber: frameState.hostRhythm?.composition?.beatNumber ?? 0,
        currentFunction: frameState.hostRhythm?.composition?.currentFunction ?? "none",
        accentRole: frameState.hostRhythm?.composition?.accentRole ?? "none",
        accentStrength: frameState.hostRhythm?.composition?.accentStrength ?? 0,
        flowScale: frameState.hostRhythm?.composition?.flowScale ?? 1,
        movementModulationDepth: frameState.hostRhythm?.composition?.flowModulationDepth ?? 0,
        sharedHostClock: true,
        inputTimingGate: false,
        progressionAuthority: false,
        routeCompletionAuthority: false
      },
      grammarReinforcement: {
        pass: "HC-027L1",
        active: Boolean(active && this.grammarReinforcementStrength > 0.01),
        window: active ? this.grammarReinforcementWindow : 0,
        mode: active ? this.grammarReinforcementMode : "none",
        strength: active ? Number(this.grammarReinforcementStrength.toFixed(3)) : 0,
        matchingActionObserved: Boolean(active && this.grammarReinforcementMatched),
        windows: ["uncertain_current_probe", "loose_draw_release", "phase_strain_contraction"],
        impliedVerbDebugOnly: this.grammarReinforcementMode === "uncertain_current_probe"
          ? "pulse"
          : this.grammarReinforcementMode === "loose_draw_release"
            ? "absorb"
            : this.grammarReinforcementMode === "phase_strain_contraction"
              ? "stabilize"
              : "none",
        usesExistingVesselAndMotesOnly: true,
        createsObjective: false,
        createsWaypoint: false,
        changesCompletion: false,
        changesMovement: false
      },
      stabilizeSeconds: this.stabilizeSeconds,
      matchedFlowSeconds: this.matchedFlowSeconds,
      desynchronized: this.desynchronized,
      stabilizing: this.stabilizing,
      stabilizationInRange: this.stabilizationInRange,
      stabilizationRange: this.stabilizationRange,
      riskEventCount: this.riskEventCount,
      desynchronizationCount: this.riskEventCount,
      offBeatPulseCount: this.offBeatPulseCount,
      postReadPulseIgnoredCount: this.postReadPulseIgnoredCount,
      recoverySeconds: this.recoverySeconds,
      recoveryCount: Number(this.desynchronizationRecovered),
      desynchronizationRecovered: this.desynchronizationRecovered,
      failureRecoverable: true,
      returnFoldReady: this.returnFoldReady,
      returnFoldDistance: active ? returnDistance : 0,
      returnFoldInteractionRange: this.recipe?.returnFold?.interactionRange ?? 1.35,
      returnFoldPosition: active ? {
        x: this.returnPosition.x,
        y: this.returnPosition.y,
        z: this.returnPosition.z
      } : null,
      circulationDirection: this.completed ? "outward_to_hub" : "inward_to_deep_valve",
      currentDirection: this.completed ? "outward" : "inward",
      currentReversedTowardHub: this.completed,
      valveSilhouetteCount: this.valves.length,
      movingChargeVisible: Boolean(active && this.chargeRoot?.visible !== false),
      visualMotionLanguages: [...(this.recipe?.visual?.motionLanguages ?? [])],
      genericRingCount: 0,
      triggerMarkerCount: 0,
      lastInteraction: this.lastInteraction,
      warning: this.warning,
      guideLine: this.guideLine(),
      objectiveLine: this.nextAction(),
      nextAction: this.nextAction(),
      gameplayOwner: "VascularRhythmRouteSystem",
      presentationOwner: "VascularRhythmRouteSystem",
      movementOwner: "PlayerMovementController",
      objectiveOwner: "ObjectiveSystem",
      crossingOwner: "LocalCellBoundaryMorphSystem",
      playerPositionPreserved: true,
      forcedRelocation: false,
      directObjectiveMutation: false,
      directGateMutation: false,
      directActiveCellMutation: false,
      newAbilityUnlocks: 0,
      newEntities: 0,
      combat: false,
      permanentClass: false,
      archivedCompatibilitySystemsActivated: 0,
      mountCount: this.mountCount
    };
    this.updateHostCauseNotice(Boolean(active), hostCause);
  }

  // Diagnostic reflects verified Vascular-local response, not transported matter.
  updateHostCauseNotice(active, cause) {
    const receiver = this.siltSignalReceiver.snapshot();
    const shouldShow = active && cause?.observedCount > 0;
    if (!shouldShow) {
      if (this.hostCauseNotice) this.hostCauseNotice.style.display = 'none';
      return;
    }
    if (typeof document === 'undefined' || !document.body) return;
    if (!this.hostCauseNotice) {
      const notice = document.createElement('div');
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-label', 'Vascular remote cause diagnostic');
      notice.style.cssText = 'position:fixed;right:12px;bottom:16px;z-index:99980;pointer-events:none;max-width:min(370px,85vw);padding:8px 10px;background:rgba(8,16,22,.88);border:1px solid rgba(124,181,177,.56);border-radius:7px;color:#bde6da;font:11px/1.45 monospace;white-space:pre-wrap';
      document.body.appendChild(notice);
      this.hostCauseNotice = notice;
    }
    const label = receiver?.receivedTotal > 0
      ? `VASCULAR / SILT SIGNAL RECEIVED · LOCAL RESPONSE\nSILT: ${receiver.lastSubjectId} · ${receiver.receivedTotal} receipt(s)\nMembrane load: ${receiver.membraneLoad.toFixed(3)} · current ×${receiver.directionalFlowScale.toFixed(3)}\nNo grain arrival / no progression credit`
      : `VASCULAR / REMOTE CAUSE · SIGNAL ONLY\nSILT: ${cause.mostRecentGrainId}  ·  ${cause.observedCount} event(s)\n${cause.mostRecentCauseId}\nNo grain arrival / no current change`;
    if (this.hostCauseNoticeText !== label) {
      this.hostCauseNoticeText = label;
      this.hostCauseNotice.textContent = label;
    }
    this.hostCauseNotice.style.display = 'block';
  }

  setVisible(visible) {
    if (this.root) this.root.visible = visible;
    if (this.returnFold) this.returnFold.visible = Boolean(visible && this.returnFoldReady);
  }

  trackMaterial(material) {
    this.materials.push(material);
    return material;
  }
}
