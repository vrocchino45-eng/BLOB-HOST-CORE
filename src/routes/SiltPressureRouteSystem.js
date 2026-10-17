import * as THREE from "three";
import { SiltLivingMaterialCycle } from "./SiltLivingMaterialCycle.js";
import { SiltGripAuthority } from "../contact/SiltGripAuthority.js";
import { MaterialIdentityLedger } from "../ecology/MaterialIdentityLedger.js";
import { SiltCompressionContact } from "../contact/SiltCompressionContact.js";

const ROUTE_CELL_ID = "CELL_SILT_PRESSURE_ROUTE_001";
const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const RECIPE_ID = "SILT_PRESSURE_PLAYABLE_CIRCUIT_HC012A";

/**
 * HC-012A owns Silt Pressure gameplay and presentation while the route is
 * mounted. The route asks the existing verbs to do distinct work: Pulse reads
 * density, Stabilize braces/reopens compressed anatomy, and Absorb must select
 * porous nourishment rather than packed residue. It never translates the
 * player or mutates objective, gate, active-cell, or route-history truth.
 */
export class SiltPressureRouteSystem {
  constructor({ recipeDataSystem, scene, playerRoot, frameState, camera }) {
    if (!recipeDataSystem) throw new Error("[SiltPressureRouteSystem] recipeDataSystem is required.");
    if (!scene) throw new Error("[SiltPressureRouteSystem] scene is required.");
    if (!playerRoot) throw new Error("[SiltPressureRouteSystem] playerRoot is required.");
    if (!frameState) throw new Error("[SiltPressureRouteSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.camera = camera;
    this.siltAimCandidateId = null;
    this.siltAimLockedId = null;
    this.siltAimCameraPosition = new THREE.Vector3();
    this.siltAimCameraDirection = new THREE.Vector3();
    this.siltAimWorldPosition = new THREE.Vector3();
    this.siltAimDirection = new THREE.Vector3();
    this.siltAimMarker = null;
    this.siltGripTether = null;
    this.siltContact = null;
    this.siltContactMesh = null;
    this.siltContactEcho = null;
    this.siltContactIndent = null;
    this.heldContactPulseApproachFrame = 0;
    this.heldContactPulseResistedFrame = 0;
    this.heldContactPulseAttemptedFrame = false;
    this.heldContactBracedPulseFrame = false;

    this.recipe = null;
    this.root = null;
    this.pathCurve = null;
    this.pathPoints = [];
    this.pathSegmentLengths = [];
    this.pathCumulativeLengths = [0];
    this.pathLength = 0;
    this.envelope = null;
    this.ribGroups = [];
    this.passageBanks = [];
    this.habitatLobes = [];
    this.habitatVeins = [];
    this.habitatAnatomy = null;
    this.habitatDrift = null;
    this.habitatDriftPositions = null;
    this.habitatDriftSeeds = [];
    this.livingCycle = null;
    this.siltGrip = new SiltGripAuthority();
    this.materialIdentity = null;
    this.siltGripLocalOffset = new THREE.Vector3(0, 0.1, -0.9);
    // D2H: movement of committed matter only, with no changes to Silt
    // material ownership, global verbs, environmental appetite, or progression.
    this.heldPulsePending = false;
    this.heldAbsorbId = null;
    this.heldAbsorbReportSeconds = 0;
    this.heldAbsorbReportDistance = 0;
    this.heldMotionLast = null;
    this.heldMotionPulseCount = 0;
    this.heldMotionPullDistance = 0;
    this.heldMotionFeedbackKind = 'none';
    this.heldMotionFeedbackAt = -99;
    this.heldGripInitialRadius = null;
    this.livingMatterGroup = null;
    this.livingMatterMeshes = [];
    this.livingReservoirBody = null;
    this.livingMatterPaths = null;
    this.livingMatterV = new THREE.Vector3();
    this.habitatSample = { id: "throat", relief: 0, distance: 99 };
    this.siltMotes = [];
    this.safePacket = null;
    this.safePacketCore = null;
    this.safeAbsorbStream = null;
    this.safeAbsorbStreamPositions = new Float32Array(6);
    this.densePackets = [];
    this.deepOrgan = null;
    this.returnFold = null;
    this.returnFoldLobes = [];
    this.materials = [];

    this.entryAnchor = new THREE.Vector3();
    this.returnPosition = new THREE.Vector3();
    this.localPlayer = new THREE.Vector3();
    this.closestPoint = new THREE.Vector3();
    this.closestTangent = new THREE.Vector3(0, 0, -1);
    this.segmentVector = new THREE.Vector3();
    this.segmentStartToPlayer = new THREE.Vector3();
    this.tempPoint = new THREE.Vector3();
    this.tempPointB = new THREE.Vector3();
    this.safePacketWorld = new THREE.Vector3();
    this.densePacketWorld = new THREE.Vector3();

    this.active = false;
    this.prepared = false;
    this.mountCount = 0;
    this.elapsed = 0;
    this.pathProgress = 0;
    this.maxDepthProgress = 0;
    this.pathDistance = 0;
    this.pressureRead = false;
    this.pressureReadCount = 0;

    // HC031S — Silt currentization. The compressed passage is treated as an
    // environmental pressure relationship rather than a route-local Pulse flag.
    // Stabilize establishes/holds that relationship; Pulse projects through it
    // to read compression. The retained pressure read then supports the existing
    // rib brace, selective appetite choice, recoverable failure and return breath.
    this.pressureRelationshipHeld = false;
    this.pressureRelationshipReady = false;
    this.pressureRelationshipSeconds = 0;
    this.pressureReadSequence = 0;
    this.lastPressureReadChord = "idle";
    this.unboundPulseCount = 0;
    this.appetiteDrawSequence = 0;
    this.lastAppetiteDrawKind = "none";

    // LS1D1D2G: bounded, read-only receipts from the route's actual verb
    // decision points. No force, selection, ownership, or progression changes.
    this.transactionSequence = 0;
    this.transactionTrace = [];
    this.lastAbsorbDecision = null;

    this.braceSeconds = 0;
    this.ribsReleased = false;
    this.safeAbsorbSeconds = 0;
    this.safeMatterAbsorbed = false;
    this.previousAbsorbHeld = false;
    this.greedyAbsorbSeconds = 0;
    this.compression = 0.62;
    this.compressionFailure = false;
    this.failureCount = 0;
    this.failureRecovered = false;
    this.recoverySeconds = 0;
    this.stabilizing = false;
    this.stabilizationInRange = false;
    this.absorbHeld = false;
    this.safePacketDistance = Number.POSITIVE_INFINITY;
    this.nearestDenseDistance = Number.POSITIVE_INFINITY;
    this.completed = false;
    this.returnFoldReady = false;
    this.lastPulseEventId = -1;
    this.lastInteraction = "none";
    this.warning = "none";
    this.pulseFlashAge = 99;
    this.failureFlashAge = 99;

    // HC018D: retained consequence presentation only.
    this.retainedDepletionStrength = 0;
  }

  init() {
    this.recipe = this.recipeDataSystem.data.siltPressureRouteCircuit;
    if (this.recipe?.id !== RECIPE_ID) {
      throw new Error(`[SiltPressureRouteSystem] Missing ${RECIPE_ID}.`);
    }
    this.pathPoints = (this.recipe.anatomy?.pathPoints ?? [])
      .map((point) => new THREE.Vector3().fromArray(point));
    if (this.pathPoints.length < 5) {
      throw new Error("[SiltPressureRouteSystem] Silt path requires at least five authored points.");
    }
    this.buildPathMetrics();
    this.pathCurve = new THREE.CatmullRomCurve3(this.pathPoints, false, "centripetal", 0.42);
    this.createAnatomy();
    this.setVisible(false);
    this.prepared = true;
    this.publish(this.frameState, false);
  }

  onRuntimePrepare(frameState) {
    this.setVisible(false);
    this.publish(frameState, false);
    return {
      status: "silt_pressure_route_prepared_hidden",
      rootCount: 1,
      ribCount: this.ribGroups.length,
      appetitePacketCount: 1 + this.densePackets.length,
      activeCellId: frameState.activeCellId,
      mutatesProgression: false
    };
  }

  onRuntimeMount(frameState) {
    this.active = true;
    this.mountCount += 1;
    this.entryAnchor.copy(this.playerRoot.position);
    this.root.position.copy(this.entryAnchor);
    const returnOffset = this.recipe.returnFold?.position ?? [0, -0.04, 0.58];
    this.returnPosition.copy(this.entryAnchor).add(this.tempPoint.fromArray(returnOffset));
    this.setVisible(true);
    this.lastInteraction = this.completed
      ? "returned_to_released_silt_passage"
      : "entered_compressed_silt_without_forced_relocation";
    this.warning = "none";
    this.publish(frameState, true);
  }

  onRuntimeUnmount(frameState) {
    // LS1D1D2K: region exit is a real release transaction. There may not be
    // another Silt update after unmount to reconcile the grip with the ledger.
    // Flush the pending pull and restore any stranded grip owner first.
    this.flushHeldAbsorbMotion(frameState, 'silt-unmounted');
    const departingUnitId = this.siltGrip.heldId;
    if (departingUnitId) this.materialIdentity?.transfer(departingUnitId, 'environment', 'individual');
    // Defensive repair is scoped to this Silt ledger only, never external
    // material. No new owners, mass, chemistry or progression are created.
    for (const record of this.materialIdentity?.records?.values() ?? []) {
      if (record.owner === 'grip') this.materialIdentity.transfer(record.id, 'environment', 'individual');
    }
    this.active = false;
    this.siltGrip.release();
    this.heldPulsePending = false;
    this.heldAbsorbId = null;
    this.heldAbsorbReportSeconds = 0;
    this.heldAbsorbReportDistance = 0;
    this.heldMotionFeedbackKind = 'none';
    this.heldGripInitialRadius = null;
    this.siltAimCandidateId = null;
    this.siltAimLockedId = null;
    this.siltContact?.update({ dt: 0, heldId: null });
    this.heldContactPulseApproachFrame = 0;
    this.heldContactPulseResistedFrame = 0;
    this.heldContactPulseAttemptedFrame = false;
    this.heldContactBracedPulseFrame = false;
    frameState.siltMaterialAim = {
      pass: 'LS1D1D2M', aiming: false, candidateId: null,
      lockedId: null, heldId: null, state: 'hidden'
    };
    this.setVisible(false);
    this.lastInteraction = frameState.activeCellId === HUB_CELL_ID
      ? "returned_to_hub_through_silt_fold"
      : "silt_pressure_route_unmounted";
    this.publish(frameState, false);
  }

  update(dt, frameState) {
    if (frameState.activeCellId !== ROUTE_CELL_ID) {
      if (this.active) this.onRuntimeUnmount(frameState);
      return;
    }
    if (!this.active) this.onRuntimeMount(frameState);

    this.elapsed += dt;
    this.pulseFlashAge += dt;
    this.failureFlashAge += dt;
    const sample = this.samplePlayerPath();
    this.updateDistances();
    this.sampleHabitat();
    this.updatePlay(dt, frameState, sample);
    // Existing safePacket absorption remains the one-time route reward; it
    // wakes a separate, finite reservoir stock, not a respawned safePacket.
    if (this.safeMatterAbsorbed) this.livingCycle?.awakenFromCanonicalAbsorb();
    this.updateSiltGrip(frameState, dt);
    if (this.materialIdentity) {
      for (const unit of this.livingCycle.units) {
        this.materialIdentity.transfer(unit.id, unit.id === this.siltGrip.heldId ? "grip" : "environment", "individual");
      }
    }
    this.livingCycle?.update(dt, {
      heldUnitId: this.siltGrip.heldId,
      habitatId: this.habitatSample.id,
      pulsePressed: Boolean(frameState.input?.pulsePressed),
      pulseEventId: frameState.input?.pulseEventId ?? frameState.frame,
      stabilizeHeld: Boolean(frameState.input?.stabilizeHeld)
    });
    this.animateLivingMatter();
    this.updateSiltContact(dt, frameState);
    this.updateSiltAimMarker();
    this.applyDynamicPressure(frameState, sample);
    this.animate(frameState, sample);
    this.animateHabitatFoundation(frameState);
    this.applyHostRhythmVisual(frameState);
    this.publish(frameState, true);
  }



  applyHostRhythmVisual(frameState) {
    const host = frameState.hostRhythm ?? {};
    if (!host.active) return;

    const composition = host.composition ?? {};
    const composed = Boolean(
      composition.active
      && composition.profileId === "silt_asp_34_micro"
    );

    if (!composed) {
      // Retained HC022G fallback for non-authored/legacy Host rhythm states.
      const phase = ((host.normalizedPhase ?? 0) - 0.09 + 1) % 1;
      const wave = Math.sin(phase * Math.PI * 2 - Math.PI * 0.5);
      const pressure = 0.5 + 0.5 * wave;

      if (this.envelope?.material) {
        this.envelope.material.opacity = Math.min(
          0.34,
          this.envelope.material.opacity + pressure * 0.045
        );
        this.envelope.material.emissiveIntensity += pressure * 0.10;
      }

      for (const group of this.ribGroups) {
        for (const mesh of group.children) {
          if (!mesh.isMesh) continue;
          mesh.scale.x *= 1 - pressure * 0.028;
          mesh.scale.y *= 1 + pressure * 0.042;
          if (mesh.material) mesh.material.emissiveIntensity += pressure * 0.085;
        }
      }

      if (this.deepOrgan) {
        const organBreath = 1 + wave * 0.035;
        this.deepOrgan.scale.x *= organBreath;
        this.deepOrgan.scale.z *= organBreath;
      }

      this.root.userData.hostRhythmInterpretation = {
        pass: "HC-022G",
        region: "silt",
        mode: "lagged_compression_and_settling",
        phaseLag: 0.09,
        visible: true,
        gameplayAuthority: false
      };
      return;
    }

    // HC028E: Silt interprets the same Host breath as two slow 3/4 bars.
    // Absorb gathers/weights, Stabilize braces, Pulse releases/reads pressure.
    const accent = THREE.MathUtils.clamp(composition.accentStrength ?? 0, 0, 1);
    const beatPulse = THREE.MathUtils.clamp(composition.beatPulse ?? 0, 0, 1);
    const currentFunction = composition.currentFunction ?? "absorb";
    const absorbAccent = currentFunction === "absorb" ? accent : 0;
    const stabilizeAccent = currentFunction === "stabilize" ? accent : 0;
    const pulseAccent = currentFunction === "pulse" ? accent : 0;
    const resonance = frameState.coreWorldResonance ?? {};
    const worldReply = resonance.active
      ? THREE.MathUtils.clamp(resonance.presentation?.worldReplyStrength ?? 0, 0, 1)
      : 0;

    if (this.envelope?.material) {
      this.envelope.material.opacity = Math.min(
        0.36,
        this.envelope.material.opacity + beatPulse * 0.012 + absorbAccent * 0.038
      );
      this.envelope.material.emissiveIntensity +=
        absorbAccent * 0.12 + stabilizeAccent * 0.07 + pulseAccent * 0.10 + worldReply * 0.14;
    }

    for (const [index, group] of this.ribGroups.entries()) {
      const local = 0.78 + 0.22 * Math.sin(index * 1.31 + (composition.beatInBar ?? 0) * 0.9);
      for (const mesh of group.children) {
        if (!mesh.isMesh) continue;
        // Visual-only phrase: gather narrows the passage, brace catches the
        // deformation, and Pulse gives a brief outward/read release.
        mesh.scale.x *= 1 - absorbAccent * 0.040 * local + pulseAccent * 0.018 * local;
        mesh.scale.y *= 1 + absorbAccent * 0.052 * local - stabilizeAccent * 0.018 * local;
        if (mesh.material) {
          mesh.material.emissiveIntensity +=
            absorbAccent * 0.11 + stabilizeAccent * 0.13 + pulseAccent * 0.16 + worldReply * 0.10;
        }
      }
    }

    for (const mote of this.siltMotes) {
      if (!mote.material) continue;
      mote.material.opacity = Math.min(
        0.92,
        mote.material.opacity + absorbAccent * 0.08 + pulseAccent * 0.05 + worldReply * 0.04
      );
    }

    if (this.deepOrgan) {
      const gather = 1 - absorbAccent * 0.025;
      const release = 1 + pulseAccent * 0.048;
      const brace = 1 - stabilizeAccent * 0.012;
      this.deepOrgan.scale.x *= gather * release;
      this.deepOrgan.scale.z *= gather * release;
      this.deepOrgan.scale.y *= brace;
      if (this.deepOrgan.material) this.deepOrgan.material.emissiveIntensity += worldReply * 0.16;
    }

    this.root.userData.hostRhythmInterpretation = {
      pass: "HC-028E",
      region: "silt",
      profileId: composition.profileId,
      keyId: composition.keyId,
      meter: composition.meterLabel,
      grouping: composition.groupingLabel,
      tempoBpm: composition.tempoBpm,
      beatNumber: composition.beatNumber,
      currentFunction,
      accentRole: composition.accentRole,
      mode: "asp_key_34_pressure_appetite_phrase",
      accentLaw: "1_gather_2_brace_3_read_release",
      resonanceReply: worldReply,
      visible: true,
      gameplayAuthority: false,
      movementAuthority: false,
      inputTimingGate: false
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
    this.root.name = "silt_pressure_route_authority_HC012A";
    Object.assign(this.root.userData, {
      regionId: "silt_burrow_route",
      gameplayOwner: "SiltPressureRouteSystem",
      presentationOwner: "SiltPressureRouteSystem",
      transitionPrepared: true,
      targetingSuppressed: true,
      genericRings: 0,
      triggerMarkers: 0
    });

    const visual = this.recipe.visual ?? {};
    const envelopeMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: visual.siltColor ?? 0x57442f,
      emissive: visual.deepColor ?? 0x251d1b,
      emissiveIntensity: 0.16,
      roughness: 0.94,
      metalness: 0.02,
      transparent: true,
      opacity: 0.17,
      depthWrite: false,
      side: THREE.DoubleSide
    }));
    this.envelope = new THREE.Mesh(
      new THREE.TubeGeometry(
        this.pathCurve,
        156,
        this.recipe.anatomy?.passageRadius ?? 1.22,
        12,
        false
      ),
      envelopeMaterial
    );
    this.envelope.name = "silt_compressed_residue_passage";
    this.envelope.userData.targetingSuppressed = true;
    this.root.add(this.envelope);

    // HC-016Z: irregular residue banks occupy the passage edges so the
    // tight/open/tight pressure grammar is visible continuously, not only at ribs.
    for (let index = 0; index < 11; index += 1) {
      const progress = 0.035 + index * 0.088;
      const point = this.pathCurve.getPointAt(Math.min(0.965, progress));
      const tangent = this.pathCurve.getTangentAt(Math.min(0.965, progress)).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const porousRelief = progress > 0.49 && progress < 0.69;
      const bankMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: porousRelief ? 0x725c42 : (index % 2 === 0 ? 0x493729 : 0x5b412d),
        emissive: porousRelief ? 0x3f3425 : 0x2d2019,
        emissiveIntensity: 0.1,
        roughness: 0.96,
        transparent: true,
        opacity: porousRelief ? 0.3 : 0.48,
        depthWrite: false
      }));
      const bank = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 1), bankMaterial);
      bank.name = `silt_residue_bank_${index + 1}`;
      bank.position.copy(point).addScaledVector(side, (index % 2 ? 1 : -1) * (porousRelief ? 1.18 : 0.88));
      bank.position.y += -0.15 + (index % 3) * 0.18;
      bank.scale.set(porousRelief ? 0.62 : 0.9, porousRelief ? 0.55 : 1.05, 1.35 + (index % 3) * 0.18);
      bank.rotation.set(index * 0.13, index * 0.27, index * 0.09);
      bank.userData.targetingSuppressed = true;
      this.root.add(bank);
      this.passageBanks.push(bank);
    }

    for (const [index, progress] of (this.recipe.anatomy?.ribProgress ?? []).entries()) {
      this.createRib(index, progress);
    }
    this.createSiltMotes();
    this.createAppetitePackets();
    this.createHabitatFoundation();
    this.createLivingMaterialCycle();
    this.createSiltContactPatch();
    this.createDeepOrgan();
    this.createReturnFold();
    this.scene.add(this.root);
  }

  createRib(index, progress) {
    const group = new THREE.Group();
    group.name = `silt_asymmetric_compression_rib_${index + 1}`;
    group.position.copy(this.pathCurve.getPointAt(progress));
    const tangent = this.pathCurve.getTangentAt(progress).normalize();
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    Object.assign(group.userData, { progress, phase: index * 1.31, targetingSuppressed: true });

    const material = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: index % 2 === 0 ? 0x705034 : 0x60412f,
      emissive: 0x36231c,
      emissiveIntensity: 0.2,
      roughness: 0.88,
      transparent: true,
      opacity: 0.9
    }));
    const pieces = [
      { name: "left", position: [-0.72, 0, 0], rotationZ: -0.12, scale: [0.72, 1, 0.7] },
      { name: "right", position: [0.72, -0.08, 0], rotationZ: 0.18, scale: [0.68, 0.9, 0.72] },
      { name: "crown", position: [0.1, 0.72, -0.04], rotationZ: Math.PI / 2 + 0.12, scale: [0.58, 0.92, 0.62] }
    ];
    for (const piece of pieces) {
      const mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 1.08, 7, 10),
        material.clone()
      );
      this.materials.push(mesh.material);
      mesh.name = `silt_rib_${index + 1}_${piece.name}`;
      mesh.position.fromArray(piece.position);
      mesh.rotation.z = piece.rotationZ;
      mesh.scale.fromArray(piece.scale);
      Object.assign(mesh.userData, {
        role: piece.name,
        basePosition: mesh.position.clone(),
        baseScale: mesh.scale.clone(),
        targetingSuppressed: true
      });
      group.add(mesh);
    }
    this.root.add(group);
    this.ribGroups.push(group);
  }

  createSiltMotes() {
    const count = this.recipe.anatomy?.siltMoteCount ?? 34;
    const geometry = new THREE.IcosahedronGeometry(0.035, 0);
    for (let index = 0; index < count; index += 1) {
      const progress = (index + 0.5) / count;
      const material = this.trackMaterial(new THREE.MeshBasicMaterial({
        color: index % 5 === 0 ? 0xc29150 : 0x71553c,
        transparent: true,
        opacity: 0.38,
        depthWrite: false
      }));
      const mote = new THREE.Mesh(geometry, material);
      mote.name = `silt_shift_mote_${index + 1}`;
      mote.userData.baseProgress = progress;
      mote.userData.phase = index * 0.83;
      mote.userData.radius = 0.18 + (index % 4) * 0.13;
      mote.userData.targetingSuppressed = true;
      this.root.add(mote);
      this.siltMotes.push(mote);
    }
  }

  createAppetitePackets() {
    const appetite = this.recipe.appetite ?? {};
    const progress = appetite.chamberProgress ?? 0.56;
    const base = this.pathCurve.getPointAt(progress);

    this.safePacket = new THREE.Group();
    this.safePacket.name = "silt_porous_nutrient_packet";
    this.safePacket.position.copy(base).add(new THREE.Vector3().fromArray(appetite.safeOffset ?? [0.62, 0.2, 0]));
    this.safePacket.userData.targetingSuppressed = true;
    const safeMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xd29a4b,
      emissive: 0x8a5728,
      emissiveIntensity: 0.6,
      roughness: 0.48,
      transparent: true,
      opacity: 0.96
    }));
    this.safePacketCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), safeMaterial);
    this.safePacketCore.name = "silt_porous_nutrient_core";
    this.safePacket.add(this.safePacketCore);
    for (let index = 0; index < 5; index += 1) {
      const filament = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.026, 0.24 + index * 0.018, 5, 7),
        safeMaterial.clone()
      );
      this.materials.push(filament.material);
      filament.name = `silt_porous_nutrient_filament_${index + 1}`;
      const angle = index * (Math.PI * 2 / 5);
      filament.position.set(Math.cos(angle) * 0.23, Math.sin(angle) * 0.19, 0);
      filament.rotation.z = -angle;
      filament.scale.set(0.72, 1, 0.72);
      this.safePacket.add(filament);
    }
    this.root.add(this.safePacket);

    const streamGeometry = new THREE.BufferGeometry();
    streamGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.safeAbsorbStreamPositions, 3)
    );
    const streamMaterial = this.trackMaterial(new THREE.LineBasicMaterial({
      color: 0xf0b765,
      transparent: true,
      opacity: 0,
      depthWrite: false
    }));
    this.safeAbsorbStream = new THREE.Line(streamGeometry, streamMaterial);
    this.safeAbsorbStream.name = "silt_safe_matter_absorb_stream";
    this.safeAbsorbStream.visible = false;
    this.safeAbsorbStream.userData.targetingSuppressed = true;
    this.root.add(this.safeAbsorbStream);

    const denseOffsets = appetite.denseOffsets ?? [[-0.62, -0.08, 0.04], [0.04, 0.7, -0.14]];
    for (const [index, offset] of denseOffsets.entries()) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: index === 0 ? 0x3b3430 : 0x45332f,
        emissive: 0x241418,
        emissiveIntensity: 0.24,
        roughness: 0.98,
        transparent: true,
        opacity: 0.96
      }));
      const packet = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42 + index * 0.07, 0), material);
      packet.name = `silt_packed_residue_decoy_${index + 1}`;
      packet.position.copy(base).add(new THREE.Vector3().fromArray(offset));
      packet.scale.set(1.2, 0.8, 0.92);
      packet.userData.phase = index * 1.7;
      packet.userData.targetingSuppressed = true;
      this.root.add(packet);
      this.densePackets.push(packet);
    }
  }

  // LS1A2: preserve LS1A's three reachable anchors and movement owner, but
  // express them as connected voids inside ONE porous stone-and-silt body.
  // All geology is non-targetable visual anatomy, not invented collision or
  // conserved matter. PlayerMovementController remains the sole boundary owner.
  createHabitatFoundation() {
    const foundation = this.recipe.habitatFoundation;
    if (foundation?.pass !== "LS1A") return;
    const geology = this.recipe.geologicMedium;
    if (geology?.pass !== "LS1A2") return;

    const group = new THREE.Group();
    group.name = "silt_contained_geologic_medium_LS1A2";
    group.userData.targetingSuppressed = true;
    const strataGeometry = new THREE.SphereGeometry(1, 18, 12);
    const massGeometry = new THREE.DodecahedronGeometry(1, 1);
    const bedGeometry = new THREE.SphereGeometry(1, 14, 8);

    // Displace the *shared unit surface* deterministically. Avoid arbitrary
    // randomization or regenerated geometry on re-entry / on every frame.
    const vertex = new THREE.Vector3();
    const position = strataGeometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      vertex.fromBufferAttribute(position, i);
      const wobble = 1 + 0.062 * Math.sin(vertex.x * 8.7 + vertex.z * 4.9)
        + 0.038 * Math.cos(vertex.y * 11.2 - vertex.x * 5.3);
      position.setXYZ(i, vertex.x * wobble, vertex.y * wobble, vertex.z * wobble);
    }
    strataGeometry.computeVertexNormals();

    const wallMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: geology.stoneColor,
      emissive: geology.stoneEmissive,
      emissiveIntensity: 0.14,
      roughness: 0.99,
      metalness: 0,
      side: THREE.BackSide,
      transparent: true,
      opacity: geology.wallOpacity,
      depthWrite: false
    }));
    const massMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: geology.sedimentColor,
      emissive: geology.sedimentEmissive,
      emissiveIntensity: 0.1,
      roughness: 1,
      transparent: true,
      opacity: 0.68,
      depthWrite: false
    }));
    const bedMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: geology.bedColor,
      emissive: geology.sedimentEmissive,
      emissiveIntensity: 0.07,
      roughness: 1,
      transparent: true,
      opacity: 0.44,
      depthWrite: false
    }));

    for (const [index, habitat] of foundation.habitats.entries()) {
      const body = new THREE.Group();
      body.name = `silt_contiguous_pore_${habitat.id}`;
      body.position.fromArray(habitat.center);
      body.userData.targetingSuppressed = true;
      body.userData.ls1a = { habitatId: habitat.id, role: habitat.role, contactable: false };

      // Remove geologic shell facets at authored seep openings. A translucent
      // sphere with intact faces across these routes reads like a false wall.
      // Cut stable apertures instead of suggesting passages through solid rock.
      const shellGeometry = strataGeometry.clone();
      const openings = [];
      for (const connection of foundation.connections) {
        const start = new THREE.Vector3().fromArray(connection.from);
        const finish = new THREE.Vector3().fromArray(connection.to);
        const center = new THREE.Vector3().fromArray(habitat.center);
        const nearStart = start.distanceToSquared(center) < 0.6;
        const nearFinish = finish.distanceToSquared(center) < 0.6;
        if (!nearStart && !nearFinish) continue;
        const outward = (nearStart ? finish : start).sub(center);
        outward.set(outward.x / habitat.radii[0], outward.y / habitat.radii[1],
          outward.z / habitat.radii[2]).normalize();
        openings.push(outward);
      }
      if (openings.length) {
        const originalIndices = shellGeometry.index.array;
        const vertices = shellGeometry.attributes.position;
        const retainedIndices = [];
        const centerDirection = new THREE.Vector3();
        const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
        for (let i = 0; i < originalIndices.length; i += 3) {
          a.fromBufferAttribute(vertices, originalIndices[i]);
          b.fromBufferAttribute(vertices, originalIndices[i + 1]);
          c.fromBufferAttribute(vertices, originalIndices[i + 2]);
          centerDirection.copy(a).add(b).add(c).normalize();
          if (openings.some((direction) => centerDirection.dot(direction) > 0.73)) continue;
          retainedIndices.push(originalIndices[i], originalIndices[i + 1], originalIndices[i + 2]);
        }
        shellGeometry.setIndex(retainedIndices);
      }
      const shell = new THREE.Mesh(shellGeometry, wallMaterial.clone());
      this.materials.push(shell.material);
      shell.name = `silt_${habitat.id}_irregular_inward_stone_stratum`;
      shell.scale.set(...habitat.radii.map((r) => r * geology.cavityWallScale));
      shell.userData.targetingSuppressed = true;
      body.add(shell);

      // Deposited stone/silt sits low and outboard. The center stays open;
      // a viewer can recognize a cavern rather than a spherical membrane.
      const bed = new THREE.Mesh(bedGeometry, bedMaterial);
      bed.name = `silt_${habitat.id}_sediment_catchment_bed`;
      bed.position.set(0, -habitat.radii[1] * 0.96, 0);
      bed.scale.set(habitat.radii[0] * 0.83, 0.24, habitat.radii[2] * 0.81);
      bed.userData.targetingSuppressed = true;
      body.add(bed);

      // Big displaced inclusions: an overhead rock mass, two opposing
      // shoulders, and lateral accumulated silt. Never place across a
      // connection centerline; no false 'sealed door' to the other habitat.
      const placements = [
        [-0.76, 0.74, 0.24, 0.74, 0.33, 0.9],
        [0.81, 0.63, -0.25, 0.58, 0.51, 0.74],
        [-0.73, -0.7, -0.42, 0.88, 0.28, 0.78],
        [0.75, -0.72, 0.44, 0.72, 0.25, 0.8]
      ];
      for (const [j, item] of placements.entries()) {
        const rock = new THREE.Mesh(massGeometry, massMaterial);
        rock.name = `silt_${habitat.id}_stone_inclusion_${j + 1}`;
        rock.position.set(
          habitat.radii[0] * item[0],
          habitat.radii[1] * item[1],
          habitat.radii[2] * item[2]
        );
        rock.scale.set(item[3] * 1.25, item[4] * 1.25, item[5] * 1.25);
        rock.rotation.set(0.17 * j + index * 0.3, 0.63 * j, 0.21 * (j + index));
        rock.userData.targetingSuppressed = true;
        body.add(rock);
      }

      group.add(body);
      this.habitatLobes.push({ group: body, shell, phase: habitat.phase, recipe: habitat,
        wallScale: geology.cavityWallScale, wallOpacity: geology.wallOpacity });
    }

    // These are hollow seep *throats* rather than thin lines drawn between
    // otherwise separate rooms. The inward-facing surfaces overlap the cavities
    // to visually weld the topology while keeping the middle unobstructed.
    const channelMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: geology.channelColor,
      emissive: geology.stoneEmissive,
      emissiveIntensity: 0.12,
      side: THREE.BackSide,
      transparent: true,
      opacity: geology.channelOpacity,
      roughness: 0.98,
      depthWrite: false
    }));
    for (const [index, connection] of foundation.connections.entries()) {
      const points = [connection.from, connection.bend, connection.to]
        .map((coords) => new THREE.Vector3().fromArray(coords));
      const width = geology.channelRadii[index] ?? 1.4;
      const wall = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, false, "centripetal", 0.42),
          32, width, 8, false),
        channelMaterial
      );
      wall.name = `silt_seep_cavern_${connection.id}`;
      wall.userData.targetingSuppressed = true;
      group.add(wall);
      this.habitatVeins.push(wall);
    }

    // One continuous stone-lined spinal channel connects the entrance,
    // pressure ribs and deep release. This is the heavier host-body mark that
    // makes the lateral pockets feel carved from the same formation.
    const spine = new THREE.Mesh(
      new THREE.TubeGeometry(this.pathCurve, 88, geology.spinalWallRadius, 9, false),
      channelMaterial.clone()
    );
    this.materials.push(spine.material);
    spine.material.opacity = geology.spinalWallOpacity;
    spine.name = "silt_spinal_host_stone_tunnel_LS1A2";
    spine.userData.targetingSuppressed = true;
    group.add(spine);

    // A single bounded batch of slow visual grains. This is ambient medium,
    // *not* LS1B matter, resource, pickup, entity, or a time-based respawner.
    const count = geology.driftGrainCount;
    const driftPositions = new Float32Array(count * 3);
    const driftGeometry = new THREE.BufferGeometry();
    driftGeometry.setAttribute("position", new THREE.BufferAttribute(driftPositions, 3));
    const driftMaterial = this.trackMaterial(new THREE.PointsMaterial({
      color: geology.driftColor,
      size: 0.047,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    }));
    this.habitatDriftSeeds = [];
    for (let i = 0; i < count; i += 1) {
      const habitat = foundation.habitats[i % foundation.habitats.length];
      const theta = (i * 2.399963 + (i % 4)) % (Math.PI * 2);
      const radial = 0.3 + (i % 7) * 0.075;
      this.habitatDriftSeeds.push({
        x: habitat.center[0] + Math.cos(theta) * habitat.radii[0] * radial,
        y: habitat.center[1] + ((i % 9) / 9 - 0.46) * habitat.radii[1] * 1.25,
        z: habitat.center[2] + Math.sin(theta) * habitat.radii[2] * radial,
        phase: i * 1.73
      });
    }
    this.habitatDriftPositions = driftPositions;
    this.habitatDrift = new THREE.Points(driftGeometry, driftMaterial);
    this.habitatDrift.name = "silt_visual_seep_grains_fixed_pool_LS1A2";
    this.habitatDrift.userData.targetingSuppressed = true;
    group.add(this.habitatDrift);
    this.root.add(group);
    this.habitatAnatomy = group;
    this.animateHabitatFoundation(this.frameState);
  }

  // LS1B — the material-cycle owner is a finite logic ledger, not a second
  // route-progress, target, or chemistry owner. Every logical unit has exactly
  // one reused mesh and a stable identity through repeated regenerations.
  createLivingMaterialCycle() {
    const recipe = this.recipe?.livingMaterialCycle;
    if (recipe?.pass !== "LS1B") return;
    this.livingCycle = new SiltLivingMaterialCycle(recipe);
    this.materialIdentity = new MaterialIdentityLedger({ originRegion: 'silt', originSignature: 'silt_accumulation_connection' });
    for (const unit of this.livingCycle.units) this.materialIdentity.register({ id: unit.id, mass: unit.mass });
    const habitat = this.recipe.habitatFoundation;
    const byId = Object.fromEntries(habitat.habitats.map((h) => [h.id, h.center]));
    const between = (fromId, toId) => habitat.connections.find((c) =>
      c.id === `${fromId}_to_${toId}`);
    const reservoirToVeins = between("reservoir", "veins");
    const reservoirToGarden = between("reservoir", "garden");
    if (!reservoirToVeins || !reservoirToGarden) {
      throw new Error("[Silt] missing authored vein and garden material connection");
    }
    const v = coords => new THREE.Vector3().fromArray(coords);
    const makeCurve = points => new THREE.CatmullRomCurve3(points.map(v), false, "centripetal", 0.42);
    this.livingMatterPaths = {
      veins: makeCurve([reservoirToVeins.from, reservoirToVeins.bend, reservoirToVeins.to]),
      garden_transit: makeCurve([reservoirToVeins.to, reservoirToVeins.bend,
        reservoirToGarden.from, reservoirToGarden.bend, reservoirToGarden.to]),
      returning: makeCurve([reservoirToGarden.to, reservoirToGarden.bend, reservoirToGarden.from])
    };
    this.livingMatterLocations = { reservoir: v(byId.reservoir), garden: v(byId.garden) };
    const fragmentMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xcaa36c, emissive: 0x725038, emissiveIntensity: 0.22,
      roughness: 0.91, transparent: true, opacity: 0.86, depthWrite: false
    }));
    const budMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x84a68a, emissive: 0x36563e, emissiveIntensity: 0.26,
      roughness: 0.81, transparent: true, opacity: 0.87, depthWrite: false
    }));
    const fragmentGeometry = new THREE.IcosahedronGeometry(0.17, 1);
    const budGeometry = new THREE.ConeGeometry(0.13, 0.36, 5);
    this.livingMatterGroup = new THREE.Group();
    this.livingMatterGroup.name = "silt_LS1B_authoritative_closed_matter_cycle";
    this.livingMatterGroup.userData.targetingSuppressed = true;
    const stockMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x967045, emissive: 0x574028, emissiveIntensity: 0.11,
      roughness: 0.94, transparent: true, opacity: 0.35, depthWrite: false
    }));
    this.livingReservoirBody = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), stockMaterial);
    this.livingReservoirBody.name = "silt_LS1B_replenishing_reservoir_stock_not_quest_packet";
    this.livingReservoirBody.position.copy(this.livingMatterLocations.reservoir);
    this.livingReservoirBody.position.y -= 0.18;
    this.livingReservoirBody.userData.targetingSuppressed = true;
    this.livingMatterGroup.add(this.livingReservoirBody);
    for (const unit of this.livingCycle.units) {
      const body = new THREE.Group();
      body.name = `silt_LS1B_${unit.id}`;
      body.userData.targetingSuppressed = true;
      const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
      fragment.name = "retained_matter_fragment";
      fragment.userData.targetingSuppressed = true;
      const bud = new THREE.Mesh(budGeometry, budMaterial);
      bud.name = "regrown_sediment_body";
      bud.position.y = 0.14;
      bud.userData.targetingSuppressed = true;
      body.add(fragment, bud);
      this.livingMatterGroup.add(body);
      this.livingMatterMeshes.push({ body, fragment, bud });
    }
    this.livingMatterGroup.visible = false;
    this.root.add(this.livingMatterGroup);
    // One reusable candidate/lock marker, not one mesh per material unit.
    const markerPoints = [];
    for (const [x, y] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      markerPoints.push(x*.29,y*.29,0, x*.15,y*.29,0);
      markerPoints.push(x*.29,y*.29,0, x*.29,y*.15,0);
    }
    const markerGeometry = new THREE.BufferGeometry();
    markerGeometry.setAttribute("position", new THREE.Float32BufferAttribute(markerPoints, 3));
    this.siltAimMarker = new THREE.LineSegments(markerGeometry,
      new THREE.LineBasicMaterial({ color: 0x9fffd8, transparent: true, opacity: 0.92, depthWrite: false }));
    this.siltAimMarker.name = "LS1D1D1_silt_material_candidate_lock_marker";
    this.siltAimMarker.visible = false;
    this.siltAimMarker.renderOrder = 20;
    this.root.add(this.siltAimMarker);
    // A single low-opacity connection makes the held distance readable.
    // It is strictly visual: never used for targeting, collision, or movement.
    const tetherGeometry = new THREE.BufferGeometry();
    tetherGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3));
    this.siltGripTether = new THREE.Line(tetherGeometry,
      new THREE.LineBasicMaterial({ color: 0xffd08b, transparent: true,
        opacity: 0.30, depthWrite: false }));
    this.siltGripTether.name = 'LS1D1D2I_silt_committed_grip_tether';
    this.siltGripTether.visible = false;
    this.siltGripTether.renderOrder = 19;
    this.root.add(this.siltGripTether);
  }

  // D2J: the one deliberately contactable *Silt sediment* patch, located
  // on the existing garden catchment. Every other LS1A2 geologic surface
  // remains visual-only. This is a proximity relationship, not a collider.
  createSiltContactPatch() {
    const garden = this.recipe?.habitatFoundation?.habitats?.find(h => h.id === 'garden');
    if (!garden) return;
    const position = [garden.center[0],
      garden.center[1] - garden.radii[1] * 0.83, garden.center[2]];
    this.siltContact = new SiltCompressionContact({ position });
    const material = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x8a6e4a, emissive: 0x3c2f21, emissiveIntensity: 0.18,
      roughness: 0.94, transparent: true, opacity: 0.78,
      depthWrite: false, side: THREE.DoubleSide
    }));
    const patch = new THREE.Mesh(new THREE.CylinderGeometry(0.73, 0.77, 0.06, 20), material);
    patch.name = 'silt_LS1D1D2J_garden_catchment_pressure_patch';
    patch.position.fromArray(position);
    patch.userData.targetingSuppressed = true;
    patch.userData.siltContact = { id: 'silt-garden-catchment-contact',
      accepts: 'committed_grain_approaching_on_pulse', collision: false };
    this.siltContactMesh = patch;
    this.root.add(patch);
    const echoMaterial = this.trackMaterial(new THREE.MeshBasicMaterial({
      color: 0xd4ac79, transparent: true, opacity: 0.24, depthWrite: false,
      side: THREE.DoubleSide
    }));
    const echo = new THREE.Mesh(new THREE.RingGeometry(0.77, 0.83, 28), echoMaterial);
    echo.name = 'silt_LS1D1D2J_reversible_contact_echo';
    echo.rotation.x = -Math.PI / 2;
    echo.position.fromArray(position);
    echo.position.y += 0.05;
    echo.userData.targetingSuppressed = true;
    this.siltContactEcho = echo;
    this.root.add(echo);
    // Contact authority remains one authored surface. This inner depression
    // contour is visual only; it never participates in collision or targeting.
    const indentMaterial = this.trackMaterial(new THREE.MeshBasicMaterial({
      color: 0xe2b765, transparent: true, opacity: 0, depthWrite: false,
      side: THREE.DoubleSide
    }));
    const indent = new THREE.Mesh(new THREE.RingGeometry(0.27, 0.43, 32), indentMaterial);
    indent.name = 'silt_LS1D1D2M_contact_depression_contour';
    indent.rotation.x = -Math.PI / 2;
    indent.position.fromArray(position);
    indent.position.y += 0.085;
    indent.visible = false;
    indent.renderOrder = 18;
    indent.userData.targetingSuppressed = true;
    this.siltContactIndent = indent;
    this.root.add(indent);
  }

  updateSiltContact(dt, frameState) {
    if (!this.siltContact) return;
    const events = this.siltContact.update({ dt,
      heldId: this.siltGrip.heldId,
      heldPosition: this.siltGrip.position,
      pulseApproach: this.heldContactPulseApproachFrame,
      resistedPulseApproach: this.heldContactPulseResistedFrame,
      pulseAttempted: this.heldContactPulseAttemptedFrame,
      bracedPulse: this.heldContactBracedPulseFrame,
      braceHeld: Boolean(frameState.input?.stabilizeHeld),
      corePosition: this.localPlayer?.toArray?.() ?? null,
      absorbHeld: Boolean(frameState.input?.absorbHeld)
    });
    this.heldContactPulseApproachFrame = 0;
    this.heldContactPulseResistedFrame = 0;
    this.heldContactPulseAttemptedFrame = false;
    this.heldContactBracedPulseFrame = false;
    for (const event of events) {
      this.recordSiltDecision('silt-contact', {
        ...event, contactPatchId: 'silt-garden-catchment-contact',
        heldGrainId: event.unitId,
        semantic: 'held_silt_grain_against_garden_sediment'
      }, frameState);
    }
    const state = this.siltContact.snapshot();
    if (this.siltContactMesh) {
      // The patch itself gently yields and visibly sinks under held pressure.
      // Cosmetic movement only; collision/geometry authority is unchanged.
      this.siltContactMesh.scale.y = 1 - state.pressure * 0.55;
      this.siltContactMesh.scale.x = 1 - state.pressure * 0.07;
      this.siltContactMesh.scale.z = 1 - state.pressure * 0.07;
      this.siltContactMesh.position.y = this.siltContact.position[1] - state.pressure * 0.13;
      this.siltContactMesh.material.color.setHex(state.imprinted ? 0xe8d4b0
        : state.pressFeedbackSeconds > 0 ? 0xe2b765
        : state.missedFeedbackSeconds > 0 ? 0xc6887c
        : state.braced && state.braceDriftWarning ? 0xf3a65e
        : state.braced ? 0x56dfb6
        : state.inContact ? 0x89b9ac : 0x8a6e4a);
      this.siltContactMesh.material.emissiveIntensity = 0.18 + state.pressure * 0.65
        + (state.inContact ? 0.1 : 0) + (state.imprinted ? 0.22 : 0);
    }
    if (this.siltContactEcho) {
      this.siltContactEcho.visible = state.braced || state.inContact || state.echoSeconds > 0;
      this.siltContactEcho.scale.setScalar((state.braced ? 1.13 : 1) + state.pressure * 0.2
        + Math.max(0, state.echoSeconds) * 0.12);
      this.siltContactEcho.material.opacity = (state.braced ? 0.34 : 0.12) + state.pressure * 0.47
        + Math.min(0.2, state.echoSeconds * 0.09);
      this.siltContactEcho.material.color.setHex(state.imprinted ? 0xf4d3a3
        : state.pressFeedbackSeconds > 0 ? 0xffd084
        : state.missedFeedbackSeconds > 0 ? 0xd59892
        : state.braced && state.braceDriftWarning ? 0xffad78
        : state.braced ? 0x72ffce
        : state.inContact ? 0x9ce1d4 : 0xd4ac79);
    }
    if (this.siltContactIndent) {
      this.siltContactIndent.visible = state.pressure > 0.005 || state.imprinted;
      this.siltContactIndent.position.y = this.siltContact.position[1]
        + 0.085 - state.pressure * 0.11;
      this.siltContactIndent.scale.setScalar(1 - state.pressure * 0.13);
      this.siltContactIndent.material.opacity = state.imprinted ? 0.91
        : Math.min(0.78, 0.18 + state.pressure * 0.64);
      this.siltContactIndent.material.color.setHex(
        state.imprinted ? 0xffefc6 : 0xf7ba6e);
    }
  }

  // LS1D1D1: Silt candidates are chosen by camera direction, never nearest-first.
  // The world/region targeting authority remains unchanged; Silt publishes its own
  // explicit material target ID until shared Host target registration is ready.
  updateSiltGrip(frameState, dt = 0) {
    const input = frameState.input ?? {};
    this.heldContactPulseApproachFrame = 0;
    this.heldContactPulseResistedFrame = 0;
    this.heldContactPulseAttemptedFrame = false;
    this.heldContactBracedPulseFrame = false;
    const aiming = Boolean(input.stabilizeHeld);
    const units = this.livingCycle?.units ?? [];
    const eligible = new Set(["veins", "garden_transit", "settled"]);
    if (!this.livingCycle?.active) {
      this.siltGrip.release();
      this.heldPulsePending = false;
      this.heldAbsorbId = null;
      this.heldMotionFeedbackKind = 'none';
      this.heldGripInitialRadius = null;
      this.siltAimCandidateId = null;
      this.siltAimLockedId = null;
      frameState.siltMaterialAim = { aiming: false, candidateId: null, lockedId: null, heldId: null };
      return;
    }

    let best = null;
    if (aiming && this.camera) {
      this.camera.updateMatrixWorld();
      this.root.updateMatrixWorld();
      this.camera.getWorldPosition(this.siltAimCameraPosition);
      this.camera.getWorldDirection(this.siltAimCameraDirection);
      for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        const mesh = this.livingMatterMeshes[i];
        if (!eligible.has(unit.phase) || !mesh?.body?.visible) continue;
        const localPosition = mesh.body.position;
        if (localPosition.distanceTo(this.localPlayer) > this.siltGrip.range) continue;
        this.siltAimWorldPosition.copy(localPosition);
        this.root.localToWorld(this.siltAimWorldPosition);
        this.siltAimDirection.copy(this.siltAimWorldPosition).sub(this.siltAimCameraPosition);
        const length = this.siltAimDirection.length();
        if (length < 0.001) continue;
        const dot = this.siltAimDirection.multiplyScalar(1 / length).dot(this.siltAimCameraDirection);
        if (dot < 0.90) continue;
        if (!best || dot > best.dot) best = { unit, position: localPosition.toArray(), dot };
      }
    }
    this.siltAimCandidateId = best?.unit.id ?? null;
    const held = units.find(unit => unit.id === this.siltGrip.heldId);
    if (held) {
      if (input.interactPressed || !aiming) {
        this.flushHeldAbsorbMotion(frameState, 'grip-released');
        this.siltGrip.release();
        this.siltAimLockedId = null;
        this.heldAbsorbId = null;
        this.heldAbsorbReportSeconds = 0;
        this.heldAbsorbReportDistance = 0;
        this.heldMotionFeedbackKind = 'none';
        this.heldGripInitialRadius = null;
      } else {
        this.updateHeldMaterialMotion(dt, frameState);
      }
    } else if (this.siltGrip.heldId) {
      this.siltGrip.release();
      this.heldMotionFeedbackKind = 'none';
      this.heldGripInitialRadius = null;
      this.siltAimLockedId = null;
    } else if (aiming && input.interactPressed && best) {
      const coreLocal = this.localPlayer.toArray();
      if (this.siltGrip.tryGrip({ unit: best.unit, unitPosition: best.position,
        corePosition: coreLocal, stabilizeHeld: true, aPressed: true })) {
        // D2I: seat newly acquired matter inside the outer boundary so the
        // first Pulse can move it. Maintain its original direction and never
        // push a naturally close grain farther out just to reach a preset.
        this.siltGripLocalOffset.fromArray(best.position).sub(this.localPlayer);
        const acquiredRadius = this.siltGripLocalOffset.length();
        const preferredRadius = Math.max(0.5, this.siltGrip.maxOffset - 0.45);
        if (acquiredRadius > preferredRadius) {
          const seatedOffset = this.siltGripLocalOffset.clone().multiplyScalar(preferredRadius / acquiredRadius);
          const seatedPosition = this.localPlayer.clone().add(seatedOffset).toArray();
          if (this.siltGrip.moveTo(seatedPosition, coreLocal)) {
            this.siltGripLocalOffset.copy(seatedOffset);
          }
        }
        this.heldGripInitialRadius = Number(this.siltGripLocalOffset.length().toFixed(4));
        this.recordSiltDecision('held-material-motion', {
          verb: 'grip', heldGrainId: best.unit.id,
          outcome: 'acquired-with-outward-headroom',
          originalRadius: Number(acquiredRadius.toFixed(4)),
          resultingRadius: this.heldGripInitialRadius,
          outwardHeadroom: Number(Math.max(0, this.siltGrip.maxOffset - this.heldGripInitialRadius).toFixed(4)),
          noMaterialTransfer: true
        }, frameState);
        this.siltAimLockedId = best.unit.id;
        this.heldAbsorbId = null;
        this.heldAbsorbReportSeconds = 0;
        this.heldAbsorbReportDistance = 0;
      }
    }
    this.heldPulsePending = false;
    frameState.siltMaterialAim = {
      pass: "LS1D1D1", aiming,
      candidateId: this.siltAimCandidateId,
      lockedId: this.siltAimLockedId,
      heldId: this.siltGrip.heldId,
      candidateAimDot: best ? Number(best.dot.toFixed(3)) : null,
      state: this.siltGrip.heldId ? "locked" : best ? "candidate" : aiming ? "open" : "hidden"
    };
  }

  // Flush sub-0.25s pull remainders on release or when RT ends. This
  // reconciles event-receipt totals with the continuous authoritative counter
  // when all receipts are retained by the recorder.
  flushHeldAbsorbMotion(frameState, reason = 'absorb-ended') {
    const id = this.siltGrip.heldId;
    const amount = this.heldAbsorbReportDistance;
    if (id && amount > 0.0001) {
      const receipt = {
        verb: 'absorb', heldGrainId: id, outcome: 'inward-displacement',
        resultingRadius: Number(this.siltGripLocalOffset.length().toFixed(4)),
        appliedDisplacement: Number(amount.toFixed(4)),
        receiptReason: reason, motionModel: 'bounded-kinematic-offset',
        noMaterialTransfer: true
      };
      this.heldMotionLast = receipt;
      this.recordSiltDecision('held-material-motion', receipt, frameState);
    }
    this.heldAbsorbReportDistance = 0;
    this.heldAbsorbReportSeconds = 0;
    this.heldAbsorbId = null;
  }

  // D2H: the lock, not the camera candidate, owns local kinematic movement.
  // Positional response is deliberately not a force/impulse or Core intake.
  updateHeldMaterialMotion(dt, frameState) {
    const id = this.siltGrip.heldId;
    if (!id) return;
    const input = frameState.input ?? {};
    const coreLocal = this.localPlayer.toArray();
    const minRadius = 0.38;
    // Leave a tiny margin for floating-point comparison in grip.moveTo().
    const maxRadius = Math.max(minRadius, this.siltGrip.maxOffset - 0.0001);
    const offset = this.siltGripLocalOffset;
    if (offset.lengthSq() < 0.000001) offset.set(0, 0.1, -0.9);
    const originalRadius = offset.length();
    const startingRadius = Math.min(maxRadius, originalRadius);
    const push = Boolean(this.heldPulsePending);
    const absorbing = Boolean(input.absorbHeld);
    const pushRadius = push ? Math.min(maxRadius, startingRadius + 0.28) : startingRadius;
    const pullRadius = absorbing
      ? Math.max(minRadius, pushRadius - Math.max(0, Math.min(dt, 0.1)) * 0.72)
      : pushRadius;
    let proposedOffset = offset.clone().multiplyScalar(pullRadius / originalRadius);
    let desired = this.localPlayer.clone().add(proposedOffset).toArray();
    const brace = this.siltContact;
    // D2M: input is processed before the normal end-of-frame contact tick.
    // If the committed grain ALREADY touches sediment when X is pressed,
    // establish its real-position brace first. Otherwise this same Pulse
    // would displace the grain out of the patch before contact can react.
    if (push && brace && input.stabilizeHeld && !absorbing && !brace.braced
        && brace.near(this.siltGrip.position)) {
      const prePulseEvents = brace.update({ dt: 0, heldId: id,
        heldPosition: this.siltGrip.position, corePosition: coreLocal,
        braceHeld: true, absorbHeld: false });
      for (const event of prePulseEvents) {
        this.recordSiltDecision('silt-contact', {
          ...event, contactPatchId: 'silt-garden-catchment-contact',
          heldGrainId: event.unitId,
          semantic: 'held_silt_grain_against_garden_sediment'
        }, frameState);
      }
    }
    const anchor = brace?.braced && brace.heldId === id && !absorbing
      ? brace.braceAnchor : null;
    let bracedPressurePulse = false;
    if (anchor) {
      const anchorVector = new THREE.Vector3().fromArray(anchor);
      const coreToAnchor = anchorVector.clone().sub(this.localPlayer);
      if (coreToAnchor.length() <= brace.braceMaxTether) {
        // Core motion within the unchanged tether range leaves the same
        // material at its actual contact point. Extra drift now warns visually
        // instead of breaking an otherwise valid physical relationship.
        desired = [...anchor];
        proposedOffset = coreToAnchor;
        bracedPressurePulse = push;
      }
      // Beyond the unchanged tether range, resume normal D2I motion;
      // contact.update publishes the hard tether release.
    }
    // Only commit movement after the grip accepts the new position.
    const accepted = this.siltGrip.moveTo(desired, coreLocal);
    if (!accepted) {
      this.recordSiltDecision('held-material-motion', {
        verb: push ? 'pulse' : absorbing ? 'absorb' : 'follow', heldGrainId: id,
        outcome: 'grip-rejected-position', appliedDisplacement: 0,
        noMaterialTransfer: true
      }, frameState);
      return;
    }
    // D2M preserves D2K: accepted movement toward the patch, OR an aimed Pulse
    // against the *existing* outer tether stop, can load reversible contact.
    // The virtual beyond-bound displacement is intent geometry only. The grain
    // never moves past D2I limits, and away/tangential *unbraced* Pulse
    // cannot press. A deliberate LT brace channels later Pulses into pressure.
    if (push && this.siltContact) {
      this.heldContactPulseAttemptedFrame = true;
      this.heldContactBracedPulseFrame = bracedPressurePulse;
      const patch = this.siltContact.position;
      const near = radius => {
        const scale = radius / originalRadius;
        return Math.hypot(
          this.localPlayer.x + offset.x * scale - patch[0],
          (this.localPlayer.y + offset.y * scale - patch[1]) * 1.15,
          this.localPlayer.z + offset.z * scale - patch[2]
        );
      };
      const acceptedApproach = near(startingRadius) - near(pushRadius);
      this.heldContactPulseApproachFrame = bracedPressurePulse ? 0 : Math.max(0, acceptedApproach);
      if (!bracedPressurePulse && pushRadius <= startingRadius + 0.0001) {
        this.heldContactPulseResistedFrame = Math.max(0,
          near(startingRadius) - near(startingRadius + 0.28));
      }
    }
    offset.copy(proposedOffset);
    this.siltGrip.update({ corePosition: coreLocal, stabilizeHeld: true, unitExists: true });
    if (push) {
      const displacement = bracedPressurePulse ? 0 : Math.max(0, pushRadius - startingRadius);
      this.heldMotionFeedbackKind = bracedPressurePulse ? 'brace-pressure'
        : displacement > 0.0001 ? 'pulse-outward' : 'outer-bound';
      this.heldMotionFeedbackAt = this.elapsed;
      this.heldMotionPulseCount++;
      const receipt = {
        verb: 'pulse', pulseEventId: input.pulseEventId ?? null,
        heldGrainId: id, outcome: bracedPressurePulse ? 'stabilized-contact-resistance'
          : displacement > 0.0001 ? 'outward-displacement' : 'outer-bound-reached',
        previousRadius: Number(startingRadius.toFixed(4)),
        resultingRadius: Number((bracedPressurePulse ? proposedOffset.length() : pushRadius).toFixed(4)),
        appliedDisplacement: Number(displacement.toFixed(4)),
        motionModel: bracedPressurePulse ? 'stabilized-contact-brace' : 'bounded-kinematic-offset',
        noMaterialTransfer: true
      };
      this.heldMotionLast = receipt;
      this.recordSiltDecision('held-material-motion', receipt, frameState);
    }
    if (absorbing) {
      const displacement = Math.max(0, pushRadius - pullRadius);
      this.heldMotionFeedbackKind = displacement > 0.0001 ? 'absorb-inward' : 'inner-bound';
      this.heldMotionFeedbackAt = this.elapsed;
      this.heldMotionPullDistance += displacement;
      this.heldAbsorbReportDistance += displacement;
      this.heldAbsorbReportSeconds += Math.max(0, Math.min(dt, 0.1));
      const started = this.heldAbsorbId !== id;
      if (started || this.heldAbsorbReportSeconds >= 0.25) {
        const receipt = {
          verb: 'absorb', heldGrainId: id,
          outcome: this.heldAbsorbReportDistance > 0.0001 ? 'inward-displacement' : 'inner-bound-reached',
          resultingRadius: Number(pullRadius.toFixed(4)),
          appliedDisplacement: Number(this.heldAbsorbReportDistance.toFixed(4)),
          motionModel: 'bounded-kinematic-offset', noMaterialTransfer: true
        };
        this.heldMotionLast = receipt;
        this.recordSiltDecision('held-material-motion', receipt, frameState);
        this.heldAbsorbReportDistance = 0;
        this.heldAbsorbReportSeconds = 0;
      }
      this.heldAbsorbId = id;
    } else {
      this.flushHeldAbsorbMotion(frameState);
    }
  }

  updateSiltAimMarker() {
    if (!this.siltAimMarker) return;
    const targetId = this.siltGrip.heldId ?? this.siltAimCandidateId;
    const index = this.livingCycle?.units.findIndex(unit => unit.id === targetId) ?? -1;
    const mesh = index >= 0 ? this.livingMatterMeshes[index] : null;
    const visible = Boolean(targetId && mesh?.body?.visible && this.camera);
    this.siltAimMarker.visible = visible;
    const locked = Boolean(this.siltGrip.heldId);
    if (this.siltGripTether) this.siltGripTether.visible = visible && locked;
    if (!visible) return;
    this.siltAimMarker.position.copy(mesh.body.position);
    this.siltAimMarker.quaternion.copy(this.camera.quaternion);
    // Keep the familiar brackets; briefly change hue and spacing to make
    // motion/limits distinct without adding an intrusive debug HUD.
    const feedbackAge = this.elapsed - this.heldMotionFeedbackAt;
    const showFeedback = locked && feedbackAge >= 0 && feedbackAge < 0.48;
    const kind = showFeedback ? this.heldMotionFeedbackKind : 'none';
    const color = kind === 'brace-pressure' ? 0xffd684
      : this.siltContact?.braced && this.siltContact?.braceDriftWarning && locked ? 0xffad78
      : this.siltContact?.braced && locked ? 0x72ffce
      : kind === 'pulse-outward' ? 0x84cfff
      : kind === 'absorb-inward' ? 0x89edc1
      : kind === 'outer-bound' ? 0xff917b
      : kind === 'inner-bound' ? 0xbda1ff
      : locked ? 0xffd08b : 0x9fffd8;
    const wave = showFeedback ? Math.max(0, 1 - feedbackAge / 0.48) : 0;
    const bracketScale = !locked ? 1
      : kind === 'brace-pressure' ? 0.85 + 0.15 * wave
      : kind === 'pulse-outward' ? 0.75 + 0.20 * wave
      : kind === 'absorb-inward' ? 0.75 - 0.12 * wave
      : kind === 'outer-bound' || kind === 'inner-bound' ? 0.75 + 0.16 * wave
      : 0.75;
    this.siltAimMarker.scale.setScalar(bracketScale);
    this.siltAimMarker.material.color.setHex(color);
    this.siltAimMarker.material.opacity = locked && showFeedback ? 1 : 0.92;
    if (this.siltGripTether) {
      const line = this.siltGripTether.geometry.getAttribute('position');
      line.setXYZ(0, this.localPlayer.x, this.localPlayer.y, this.localPlayer.z);
      line.setXYZ(1, mesh.body.position.x, mesh.body.position.y, mesh.body.position.z);
      line.needsUpdate = true;
      this.siltGripTether.material.color.setHex(color);
      this.siltGripTether.material.opacity = (this.siltContact?.braced ? 0.59 : 0.30) + 0.22 * wave;
    }
  }

  animateLivingMatter() {
    const cycle = this.livingCycle;
    if (!cycle || !this.livingMatterGroup) return;
    this.livingMatterGroup.visible = cycle.active;
    if (!cycle.active) return;
    const stored = cycle.units.filter(u => u.phase === "reservoir").length;
    const fractionStored = stored / cycle.unitCount;
    this.livingReservoirBody.scale.setScalar(0.34 + fractionStored * 0.66);
    this.livingReservoirBody.material.opacity = 0.19 + fractionStored * 0.27;
    for (let index = 0; index < cycle.units.length; index++) {
      const unit = cycle.units[index];
      const mesh = this.livingMatterMeshes[index];
      const fraction = (index * 2.399963) % (2 * Math.PI);
      const small = 0.24 + (index % 3) * 0.15;
      const p = mesh.body.position;
      if (unit.id === this.siltGrip.heldId && this.siltGrip.position) {
        p.fromArray(this.siltGrip.position);
        mesh.body.visible = true;
        continue;
      }
      if (unit.phase === "reservoir") {
        p.copy(this.livingMatterLocations.reservoir);
        p.x += Math.cos(fraction) * small;
        p.y -= 0.2 + 0.12 * (index % 2);
        p.z += Math.sin(fraction) * small;
      } else if (unit.phase === "settled" || unit.phase === "growing" || unit.phase === "mature") {
        p.copy(this.livingMatterLocations.garden);
        p.x += Math.cos(fraction) * (0.65 + small);
        p.z += Math.sin(fraction) * (0.65 + small);
        p.y -= 1.14;
      } else {
        const path = this.livingMatterPaths[unit.phase];
        const duration = unit.phase === "veins" ? 6 : unit.phase === "garden_transit" ? 8 : 10;
        const alpha = THREE.MathUtils.clamp(unit.age / duration, 0, 1);
        path.getPointAt(alpha, this.livingMatterV);
        p.copy(this.livingMatterV);
        p.y += 0.18 * Math.sin(alpha * Math.PI * 3 + fraction);
        p.x += 0.12 * Math.sin(alpha * 8 + fraction);
      }
      const growing = unit.phase === "growing" || unit.phase === "mature";
      const growth = unit.phase === "growing" ? Math.min(1, unit.age / 9) : 1;
      mesh.fragment.visible = !growing;
      mesh.bud.visible = growing;
      mesh.bud.scale.setScalar(Math.max(0.06, growth) * (0.76 + 0.12 * (index % 3)));
      mesh.body.rotation.y = fraction + 0.13 * Math.sin(cycle.elapsed + fraction);
      mesh.body.visible = true;
    }
  }

  sampleHabitat() {
    const habitats = this.recipe?.habitatFoundation?.habitats ?? [];
    let closest = { id: "throat", relief: 0, distance: 99 };
    for (const habitat of habitats) {
      const center = habitat.center;
      const radii = habitat.radii;
      const dx = (this.localPlayer.x - center[0]) / radii[0];
      const dy = (this.localPlayer.y - center[1]) / radii[1];
      const dz = (this.localPlayer.z - center[2]) / radii[2];
      const normalizedDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const relief = THREE.MathUtils.clamp((1.27 - normalizedDistance) / 0.66, 0, 1);
      if (relief > closest.relief) closest = { id: habitat.id, relief, distance: normalizedDistance };
    }
    this.habitatSample = closest;
    return closest;
  }

  animateHabitatFoundation(frameState) {
    const t = frameState.runtimeSeconds ?? this.elapsed;
    const p = this.localPlayer;
    for (const lobe of this.habitatLobes) {
      // Low-amplitude seep/pressure breathing, always set from authored scale.
      const breath = Math.sin(t * 0.36 + lobe.phase);
      lobe.shell.scale.set(
        lobe.recipe.radii[0] * lobe.wallScale * (1 + breath * 0.006),
        lobe.recipe.radii[1] * lobe.wallScale * (1 - breath * 0.005),
        lobe.recipe.radii[2] * lobe.wallScale * (1 + breath * 0.005)
      );
      // Locally recede thick cave walls when the Core gets close. Prevent a
      // translucent foreground veil; avoid accumulating opacity every frame.
      const c = lobe.recipe.center, r = lobe.recipe.radii;
      const near = Math.hypot((p.x - c[0]) / r[0], (p.y - c[1]) / r[1], (p.z - c[2]) / r[2]);
      lobe.shell.material.opacity = lobe.wallOpacity *
        (1 - 0.62 * THREE.MathUtils.smoothstep(near, 0.76, 1.25));
    }
    if (this.habitatDrift && this.habitatDriftPositions) {
      const out = this.habitatDriftPositions;
      for (let i = 0; i < this.habitatDriftSeeds.length; i += 1) {
        const grain = this.habitatDriftSeeds[i];
        const phase = t * 0.28 + grain.phase;
        out[i * 3] = grain.x + Math.sin(phase) * 0.16;
        out[i * 3 + 1] = grain.y - Math.sin(t * 0.21 + grain.phase * 0.4) * 0.09;
        out[i * 3 + 2] = grain.z + Math.cos(phase * 0.81) * 0.23;
      }
      this.habitatDrift.geometry.attributes.position.needsUpdate = true;
    }
  }

  createDeepOrgan() {
    const progress = this.recipe.anatomy?.deepOrganProgress ?? 0.88;
    const material = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x6f4c35,
      emissive: 0x3d241d,
      emissiveIntensity: 0.32,
      roughness: 0.82,
      transparent: true,
      opacity: 0.88
    }));
    this.deepOrgan = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), material);
    this.deepOrgan.name = "silt_deep_pressure_release_organ";
    this.deepOrgan.position.copy(this.pathCurve.getPointAt(progress));
    this.deepOrgan.scale.set(1.35, 0.78, 1.02);
    this.deepOrgan.userData.targetingSuppressed = true;
    this.root.add(this.deepOrgan);
  }

  createReturnFold() {
    this.returnFold = new THREE.Group();
    this.returnFold.name = "silt_pressure_return_fold";
    this.returnFold.position.fromArray(this.recipe.returnFold?.position ?? [0, -0.04, 0.58]);
    this.returnFold.userData.targetingSuppressed = true;
    const colors = [0xc99555, 0x8a6240, 0x584038];
    for (let index = 0; index < 3; index += 1) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: colors[index],
        emissive: colors[index],
        emissiveIntensity: 0.22,
        roughness: 0.6,
        transparent: true,
        opacity: 0.78
      }));
      const lobe = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.76 - index * 0.08, 7, 10), material);
      lobe.name = `silt_return_fold_lobe_${index + 1}`;
      const side = index === 0 ? -1 : index === 1 ? 1 : 0;
      lobe.position.set(side * 0.34, index === 2 ? -0.28 : 0, index === 2 ? -0.12 : 0);
      lobe.rotation.z = side * 0.62 + (index === 2 ? Math.PI / 2 : 0);
      lobe.userData.side = side;
      lobe.userData.basePosition = lobe.position.clone();
      lobe.userData.targetingSuppressed = true;
      this.returnFold.add(lobe);
      this.returnFoldLobes.push(lobe);
    }
    this.returnFold.visible = false;
    this.root.add(this.returnFold);
  }

  samplePlayerPath() {
    this.localPlayer.copy(this.playerRoot.position).sub(this.entryAnchor);
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    let bestProgressDistance = 0;

    for (let index = 0; index < this.pathPoints.length - 1; index += 1) {
      const start = this.pathPoints[index];
      const end = this.pathPoints[index + 1];
      this.segmentVector.copy(end).sub(start);
      const lengthSq = Math.max(0.0001, this.segmentVector.lengthSq());
      this.segmentStartToPlayer.copy(this.localPlayer).sub(start);
      const alpha = THREE.MathUtils.clamp(this.segmentStartToPlayer.dot(this.segmentVector) / lengthSq, 0, 1);
      this.tempPoint.copy(start).addScaledVector(this.segmentVector, alpha);
      const distanceSq = this.tempPoint.distanceToSquared(this.localPlayer);
      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        this.closestPoint.copy(this.tempPoint);
        this.closestTangent.copy(this.segmentVector).normalize();
        bestProgressDistance = this.pathCumulativeLengths[index] + this.pathSegmentLengths[index] * alpha;
      }
    }

    this.pathDistance = Math.sqrt(bestDistanceSq);
    this.pathProgress = THREE.MathUtils.clamp(bestProgressDistance / Math.max(0.001, this.pathLength), 0, 1);
    this.maxDepthProgress = Math.max(this.maxDepthProgress, this.pathProgress);
    return {
      progress: this.pathProgress,
      distance: this.pathDistance,
      tangent: this.closestTangent
    };
  }

  updateDistances() {
    this.safePacketDistance = Number.POSITIVE_INFINITY;
    if (this.safePacket?.visible) {
      this.safePacket.getWorldPosition(this.safePacketWorld);
      this.safePacketDistance = this.playerRoot.position.distanceTo(this.safePacketWorld);
    }
    this.nearestDenseDistance = Number.POSITIVE_INFINITY;
    for (const packet of this.densePackets) {
      packet.getWorldPosition(this.densePacketWorld);
      this.nearestDenseDistance = Math.min(
        this.nearestDenseDistance,
        this.playerRoot.position.distanceTo(this.densePacketWorld)
      );
    }
  }

  recordSiltDecision(kind, details = {}, frameState = this.frameState) {
    const entry = {
      sequence: ++this.transactionSequence,
      kind,
      frame: frameState?.frame ?? null,
      siltElapsedSeconds: Number(this.elapsed.toFixed(3)),
      heldGrainId: this.siltGrip.heldId,
      candidateAtFrameStart: frameState?.siltMaterialAim?.candidateId ?? null,
      ...details
    };
    this.transactionTrace.push(entry);
    if (this.transactionTrace.length > 64) this.transactionTrace.shift();
  }

  updatePlay(dt, frameState, sample) {
    const input = frameState.input ?? {};
    const composition = frameState.verbComposition ?? {};
    const pressure = this.recipe.pressure ?? {};
    const appetite = this.recipe.appetite ?? {};
    const recovery = this.recipe.recovery ?? {};
    const completion = this.recipe.completion ?? {};
    const currentization = this.recipe.currentization ?? {};

    this.stabilizationInRange = sample.distance <= (recovery.stabilizeRangeFromPassage ?? 1.9);
    this.stabilizing = Boolean(input.stabilizeHeld && this.stabilizationInRange);
    this.absorbHeld = Boolean(input.absorbHeld);

    // HC031S: pressure is an environmental relationship. The Core must first
    // occupy the authored rib-reading band and hold Stabilize long enough to
    // establish that relation. Pulse then projects through it. There is no new
    // noun target and no TargetingSystem exception.
    const pressureSpatiallyReady = Boolean(
      sample.progress >= (pressure.readProgressMin ?? 0.08)
      && sample.progress <= (pressure.readProgressMax ?? 0.46)
      && sample.distance <= (pressure.pulseReadRangeFromPassage ?? 1.55)
    );
    this.pressureRelationshipHeld = Boolean(
      !this.completed
      && !this.compressionFailure
      && this.stabilizing
      && pressureSpatiallyReady
    );
    if (this.pressureRelationshipHeld) {
      this.pressureRelationshipSeconds += dt;
    } else {
      const releaseRate = currentization.relationshipReleaseRate ?? 3.6;
      this.pressureRelationshipSeconds = Math.max(
        0,
        this.pressureRelationshipSeconds - dt * releaseRate
      );
    }
    const minimumRelationshipHoldSeconds = currentization.minimumRelationshipHoldSeconds ?? 0.18;
    this.pressureRelationshipReady = Boolean(
      this.pressureRelationshipHeld
      && this.pressureRelationshipSeconds >= minimumRelationshipHoldSeconds
    );

    const pulseEventId = input.pulseEventId ?? (frameState.frame ?? 0);
    const freshPulse = Boolean(input.pulsePressed && pulseEventId !== this.lastPulseEventId);
    this.heldPulsePending = Boolean(freshPulse && this.siltGrip.heldId);
    if (freshPulse) {
      this.lastPulseEventId = pulseEventId;
      this.pulseFlashAge = 0;
      if (!this.pressureRead && this.pressureRelationshipReady) {
        this.pressureRead = true;
        this.pressureReadCount += 1;
        this.pressureReadSequence += 1;
        this.lastPressureReadChord = composition.chord ?? "cohere_project";
        this.lastInteraction = "stabilized_pressure_relationship_read_by_pulse";
        this.warning = "keep_stabilize_held_to_brace_living_ribs";
      } else if (this.pressureRead) {
        this.lastPressureReadChord = composition.chord ?? "project";
        this.lastInteraction = "pulse_echoes_through_retained_pressure_relationship";
      } else {
        this.unboundPulseCount += 1;
        this.lastPressureReadChord = composition.chord ?? "project";
        this.lastInteraction = !pressureSpatiallyReady
          ? "pulse_scattered_outside_compressed_rib_relationship"
          : !this.stabilizing
            ? "pulse_without_stabilized_pressure_relationship"
            : "pressure_relationship_not_yet_settled";
        this.warning = "hold_stabilize_then_pulse_to_read_pressure";
      }
      this.recordSiltDecision("pulse-route", {
        pulseEventId,
        route: this.lastInteraction === "stabilized_pressure_relationship_read_by_pulse"
          ? "pressure-read-committed"
          : this.lastInteraction === "pulse_echoes_through_retained_pressure_relationship"
            ? "retained-pressure-echo" : "unbound-pressure-pulse",
        interaction: this.lastInteraction,
        heldGrainForceAppliedByThisRoute: false,
        note: "This Silt handler changes pressure/read state, not held-grain velocity. Other systems are not assessed."
      }, frameState);
    }

    if (this.stabilizing) {
      if (this.compressionFailure) {
        this.compression = Math.max(0, this.compression - dt * (recovery.compressionRecoveryPerSecond ?? 0.5));
        this.recoverySeconds += dt;
        this.lastInteraction = "stabilize_reopening_compressed_passage";
        this.warning = "recoverable_compression_releasing";
        if (this.compression <= (recovery.recoveredCompressionThreshold ?? 0.22)) {
          this.compressionFailure = false;
          this.failureRecovered = true;
          this.greedyAbsorbSeconds = 0;
          this.lastInteraction = "compressed_passage_reopened_without_lost_progress";
          this.warning = "none";
        }
      } else if (!this.pressureRead && this.pressureRelationshipReady) {
        this.lastInteraction = "stabilize_established_compressed_pressure_relationship";
        this.warning = "pulse_through_held_pressure_relationship";
      } else if (this.pressureRead && !this.ribsReleased) {
        this.braceSeconds += dt;
        this.compression = Math.max(0.26, this.compression - dt * (pressure.braceReleasePerSecond ?? 0.28));
        this.lastInteraction = "stabilize_bracing_living_ribs";
        if (this.braceSeconds >= (pressure.requiredBraceSeconds ?? 1.05)) {
          this.ribsReleased = true;
          this.lastInteraction = "living_ribs_held_open_by_stabilized_pressure";
          this.warning = "none";
        }
      }
    }

    const safeRange = appetite.safeAbsorbRange ?? 0.92;
    const denseRange = appetite.denseRiskRange ?? 0.9;
    if (this.absorbHeld && !this.completed) {
      if (this.compressionFailure) {
        this.lastInteraction = "absorb_cannot_pull_through_closed_compression";
      } else if (
        this.pressureRead
        && this.ribsReleased
        && !this.safeMatterAbsorbed
        && this.safePacketDistance <= safeRange
        && this.safePacketDistance + (appetite.selectionDistanceAdvantage ?? 0.08) < this.nearestDenseDistance
      ) {
        this.safeAbsorbSeconds += dt;
        this.lastInteraction = "selective_absorb_drawing_porous_nutrient";
        this.warning = "none";
        if (this.safeAbsorbSeconds >= (appetite.requiredSafeAbsorbSeconds ?? 0.68)) {
          this.safeMatterAbsorbed = true;
          this.appetiteDrawSequence += 1;
          this.lastAppetiteDrawKind = "porous_nutrient";
          this.lastInteraction = "porous_nutrient_accepted_dense_residue_left_intact";
        }
      } else if (this.nearestDenseDistance <= denseRange) {
        this.greedyAbsorbSeconds += dt;
        this.lastInteraction = "greedy_absorb_loading_packed_residue";
        if (this.greedyAbsorbSeconds >= (appetite.greedyFailureSeconds ?? 0.38)) {
          this.lastAppetiteDrawKind = "packed_residue_risk";
          this.registerCompressionFailure();
        }
      } else {
        this.greedyAbsorbSeconds = Math.max(0, this.greedyAbsorbSeconds - dt * 1.5);
        this.lastInteraction = this.ribsReleased
          ? "absorb_reaches_no_selected_spatial_matter"
          : "appetite_waits_for_pressure_relationship_and_brace";
      }
    } else if (!this.absorbHeld) {
      this.greedyAbsorbSeconds = Math.max(0, this.greedyAbsorbSeconds - dt * 2.5);
    }
    // Capture the route's actual spatial appetite decision without treating
    // the locked grain as the porous packet or packed residue.
    const absorbDecision = !this.absorbHeld ? "inactive"
      : this.completed ? "route-already-completed"
      : this.compressionFailure ? "blocked-by-compression"
      : this.lastInteraction === "porous_nutrient_accepted_dense_residue_left_intact" ? "porous-packet-committed"
      : this.lastInteraction === "selective_absorb_drawing_porous_nutrient" ? "porous-packet-drawing"
      : this.lastInteraction === "greedy_absorb_loading_packed_residue" ? "packed-residue-risk"
      : this.lastInteraction === "absorb_reaches_no_selected_spatial_matter" ? "no-spatial-packet-selected"
      : this.lastInteraction === "appetite_waits_for_pressure_relationship_and_brace" ? "waiting-for-brace"
      : "no-spatial-absorb-transaction";
    if (absorbDecision !== this.lastAbsorbDecision) {
      if (this.absorbHeld || this.previousAbsorbHeld) {
        this.recordSiltDecision("absorb-route", {
          decision: absorbDecision,
          appetiteObject: absorbDecision.startsWith("porous-packet") ? "canonical-porous-packet"
            : absorbDecision === "packed-residue-risk" ? "canonical-packed-residue" : null,
          safePacketDistance: Number.isFinite(this.safePacketDistance) ? Number(this.safePacketDistance.toFixed(3)) : null,
          nearestDenseDistance: Number.isFinite(this.nearestDenseDistance) ? Number(this.nearestDenseDistance.toFixed(3)) : null,
          safePacketDrawSeconds: Number(this.safeAbsorbSeconds.toFixed(3)),
          heldGrainTransferAppliedByThisRoute: false,
          note: "Silt appetite selection operates on spatial packets; grip ledger is separate."
        }, frameState);
      }
      this.lastAbsorbDecision = absorbDecision;
    }
    this.previousAbsorbHeld = this.absorbHeld;

    const targetCompression = this.completed ? 0.1 : this.ribsReleased ? 0.28 : 0.62;
    if (!this.compressionFailure && !this.stabilizing) {
      const settleRate = 1 - Math.exp(-dt * 1.7);
      this.compression += (targetCompression - this.compression) * settleRate;
    }

    if (
      !this.completed
      && this.pressureRead
      && this.ribsReleased
      && this.safeMatterAbsorbed
      && this.maxDepthProgress >= (completion.minimumDeepProgress ?? 0.82)
      && !this.compressionFailure
      && this.compression <= (completion.maximumSettledCompression ?? 0.34)
    ) {
      this.completed = true;
      this.returnFoldReady = true;
      this.pressureRelationshipHeld = false;
      this.pressureRelationshipReady = false;
      this.lastInteraction = "deep_pressure_relationship_released_silt_route_breathes_toward_hub";
      this.warning = "none";
    }

    this.compression = THREE.MathUtils.clamp(this.compression, 0, 1);
  }

  registerCompressionFailure() {
    if (this.compressionFailure) return;
    this.compressionFailure = true;
    this.failureCount += 1;
    this.failureRecovered = false;
    this.compression = 1;
    this.failureFlashAge = 0;
    this.greedyAbsorbSeconds = 0;
    this.lastInteraction = "packed_residue_triggered_recoverable_compression_failure";
    this.warning = "hold_stabilize_inside_passage_to_reopen_it";
  }

  applyDynamicPressure(frameState, sample) {
    const contractFeel = frameState.physicalFeel ?? {};
    const direction = this.completed ? -1 : 1;
    const tangent = sample.tangent ?? this.closestTangent;
    const progress = sample.progress ?? this.pathProgress;

    // HC-016Y: the expanded route now has enough distance for spatial pressure
    // to be gameplay. The appetite pocket around 60% is deliberately freer;
    // entry/deep sections remain resistant. Completion becomes a clear release.
    const pocketDistance = Math.abs(progress - 0.60);
    const openPocket = THREE.MathUtils.clamp(1 - pocketDistance / 0.16, 0, 1);
    const released = this.completed ? 1 : 0;
    const habitatRelief = this.habitatSample?.relief ?? 0;
    const failureWeight = this.compressionFailure ? 1 : 0;
    const effectiveCompression = THREE.MathUtils.clamp(
      this.compression + failureWeight * 0.18 - openPocket * 0.18 - released * 0.28,
      0,
      1
    );
    const drift = this.completed
      ? 0.22
      : this.compressionFailure
        ? 0.025
        : this.ribsReleased
          ? 0.12 + openPocket * 0.055
          : 0.06 + openPocket * 0.035;
    frameState.physicalFeel = {
      ...contractFeel,
      viscosity: 0.54 + effectiveCompression * 0.34 - habitatRelief * 0.18,
      pressure: 0.60 + effectiveCompression * 0.36 - habitatRelief * 0.12,
      flowVector: {
        x: tangent.x * drift * direction,
        y: tangent.y * drift * direction - effectiveCompression * 0.035,
        z: tangent.z * drift * direction
      },
      routeFeelProfile: "silt_compression_release_gradient",
      accelerationScale: this.completed
        ? 1.08
        : 0.78 + Math.max(openPocket * 0.18, habitatRelief * 0.23) + (this.ribsReleased ? 0.06 : 0) - failureWeight * 0.08,
      speedScale: this.completed
        ? 1.10
        : 0.76 + Math.max(openPocket * 0.18, habitatRelief * 0.25) + (this.ribsReleased ? 0.06 : 0) - failureWeight * 0.07,
      boostScale: this.completed
        ? 1.0
        : 0.60 + Math.max(openPocket * 0.24, habitatRelief * 0.3) + (this.ribsReleased ? 0.08 : 0) - failureWeight * 0.10,
      flowCouplingScale: this.completed ? 1.24 : 0.82 + openPocket * 0.18,
      withFlowSpeedBonus: this.completed ? 0.18 : 0.04,
      againstFlowSpeedPenalty: this.completed ? 0.08 : 0.10,
      spatialFeel: {
        progress,
        openPocket,
        habitatId: this.habitatSample?.id ?? "throat",
        habitatRelief,
        effectiveCompression,
        condition: this.completed
          ? "released_silt_breath_accelerates_return"
          : this.compressionFailure
            ? "packed_residue_closes_motion"
            : openPocket > 0.55
              ? "porous_choice_pocket_releases_pressure"
              : this.ribsReleased
                ? "braced_passage_allows_controlled_motion"
                : "compressed_ribs_resist_motion"
      },
      boundaryBehavior: this.completed
        ? "silt_released_return_breath"
        : this.compressionFailure
          ? "silt_recoverable_compression_lock"
          : this.ribsReleased
            ? "silt_braced_selective_appetite_passage"
            : "silt_living_rib_pressure",
      movementBounds: contractFeel.movementBounds
    };
  }

  animate(frameState, sample) {
    const t = frameState.runtimeSeconds ?? this.elapsed;
    const release = this.ribsReleased ? 1 : 0;
    const failure = this.compressionFailure ? 1 : 0;
    const pulseReadResponse = this.pulseFlashAge < 0.72
      ? 1 - this.pulseFlashAge / 0.72
      : 0;
    const materialState = this.completed
      ? "released"
      : this.safeMatterAbsorbed
        ? "porous_matter_received"
        : this.ribsReleased
          ? "braced_and_open"
          : this.pressureRead
            ? "density_revealed"
            : "compressed_unread";
    const close = THREE.MathUtils.clamp(this.compression * 0.74 + failure * 0.24 - release * 0.18, 0.08, 0.92);

    if (this.envelope?.material) {
      this.envelope.material.opacity = 0.12 + this.compression * 0.13;
      this.envelope.material.emissiveIntensity = 0.12 + this.compression * 0.2 + (this.stabilizing ? 0.12 : 0);
    }
    for (const [index, group] of this.ribGroups.entries()) {
      const pulse = (Math.sin(t * 2.2 + index * 1.1) + 1) * 0.5;
      for (const mesh of group.children) {
        const role = mesh.userData.role;
        mesh.position.copy(mesh.userData.basePosition);
        mesh.scale.copy(mesh.userData.baseScale);
        if (role === "left") mesh.position.x += close * 0.34;
        if (role === "right") mesh.position.x -= close * 0.34;
        if (role === "crown") mesh.position.y -= close * 0.3;
        if (this.compressionFailure) {
          mesh.position.x += Math.sin(t * 16 + index) * 0.025;
          mesh.scale.y *= 1 + pulse * 0.08;
        }
        mesh.material.emissiveIntensity = this.stabilizing
          ? 0.38 + pulse * 0.12
          : this.compressionFailure ? 0.42 + pulse * 0.22 : 0.16 + pulse * 0.08;
      }
    }

    const moteDirection = this.completed ? -1 : 1;
    for (const mote of this.siltMotes) {
      let progress = (mote.userData.baseProgress + moteDirection * t * (0.012 + (1 - this.compression) * 0.024)) % 1;
      if (progress < 0) progress += 1;
      mote.position.copy(this.pathCurve.getPointAt(progress));
      const phase = mote.userData.phase;
      const radius = mote.userData.radius;
      const pulseScatter = pulseReadResponse * (0.10 + (mote.userData.baseProgress % 0.18) * 0.42);
      mote.position.x += Math.sin(t * 0.8 + phase) * radius
        + Math.sin(phase * 1.7) * pulseScatter;
      mote.position.y += Math.cos(t * 0.65 + phase) * radius * 0.55
        + Math.cos(phase * 1.3) * pulseScatter * 0.55;
      mote.material.opacity = 0.2 + this.compression * 0.32
        + pulseReadResponse * 0.20
        + (this.failureFlashAge < 0.4 ? 0.18 : 0);
    }

    if (this.safePacket) {
      const absorbed = this.safeMatterAbsorbed ? 1 : THREE.MathUtils.clamp(
        this.safeAbsorbSeconds / Math.max(0.01, this.recipe.appetite?.requiredSafeAbsorbSeconds ?? 0.68),
        0,
        1
      );
      const revealed = this.pressureRead;
      const readable = revealed && this.ribsReleased;
      const revealScale = revealed ? 1 : 0.58;
      const pulse = 1 + Math.sin(t * 4.1) * 0.08 + (readable ? 0.12 : 0);
      this.safePacket.scale.setScalar(
        Math.max(0.08, revealScale * pulse * (1 - absorbed * 0.86))
      );
      this.safePacket.visible = !this.safeMatterAbsorbed || absorbed < 0.98;
      if (this.safePacketCore?.material) {
        this.safePacketCore.material.emissiveIntensity = readable
          ? 0.85 + Math.sin(t * 5.2) * 0.10
          : revealed ? 0.48 : 0.16;
        this.safePacketCore.material.opacity = revealed ? 0.96 : 0.48;
      }

      const safeRange = this.recipe.appetite?.safeAbsorbRange ?? 0.92;
      const safeAbsorbActive = Boolean(
        this.absorbHeld
        && readable
        && !this.safeMatterAbsorbed
        && this.safePacketDistance <= safeRange
      );
      if (this.safeAbsorbStream) {
        this.safeAbsorbStream.visible = safeAbsorbActive;
        this.safeAbsorbStream.material.opacity = safeAbsorbActive
          ? 0.24 + absorbed * 0.48
          : 0;
        if (safeAbsorbActive) {
          this.safePacket.getWorldPosition(this.safePacketWorld);
          this.safeAbsorbStreamPositions[0] = this.safePacketWorld.x;
          this.safeAbsorbStreamPositions[1] = this.safePacketWorld.y;
          this.safeAbsorbStreamPositions[2] = this.safePacketWorld.z;
          this.safeAbsorbStreamPositions[3] = this.playerRoot.position.x;
          this.safeAbsorbStreamPositions[4] = this.playerRoot.position.y;
          this.safeAbsorbStreamPositions[5] = this.playerRoot.position.z;
          this.safeAbsorbStream.geometry.attributes.position.needsUpdate = true;
        }
      }
    }
    for (const packet of this.densePackets) {
      const pulse = 1 + Math.sin(t * 2.7 + packet.userData.phase) * 0.045;
      const denseRiskActive = this.absorbHeld
        && this.nearestDenseDistance <= (this.recipe.appetite?.denseRiskRange ?? 0.9);
      const harden = denseRiskActive ? 1 : 0;
      packet.scale.set(
        1.2 * pulse * (1 + harden * 0.10),
        (0.8 / pulse) * (1 - harden * 0.12),
        0.92 * pulse * (1 + harden * 0.08)
      );
      packet.material.emissiveIntensity = denseRiskActive
        ? 0.58
        : this.pressureRead ? 0.12 + this.compression * 0.08 : 0.18 + this.compression * 0.12;
      packet.material.opacity = this.pressureRead ? 0.78 : 0.96;
    }

    const depletionTarget = this.safeMatterAbsorbed ? 1 : 0;
    this.retainedDepletionStrength += (depletionTarget - this.retainedDepletionStrength)
      * (1 - Math.exp(-0.08 * 5.5));

    if (this.safeMatterAbsorbed) {
      for (const [index, bank] of this.passageBanks.entries()) {
        const nearAppetitePocket = index >= 5 && index <= 7;
        if (!nearAppetitePocket) continue;
        const retained = this.retainedDepletionStrength;
        bank.scale.x *= 1 - retained * 0.12;
        bank.scale.y *= 1 - retained * 0.08;
        bank.position.y -= retained * 0.08;
        if (bank.material) {
          bank.material.opacity = Math.max(0.18, bank.material.opacity - retained * 0.06);
          bank.material.emissiveIntensity = 0.10 + retained * 0.08;
        }
        bank.userData.retainedConsequence = "porous_matter_removed_here";
      }
      this.root.userData.retainedConsequence = "appetite_pocket_remains_depleted";
    }

    if (this.deepOrgan) {
      const ready = this.pressureRead && this.ribsReleased && this.safeMatterAbsorbed;
      const pulse = 1 + Math.sin(t * (ready ? 3.4 : 1.7)) * (ready ? 0.12 : 0.05);
      this.deepOrgan.scale.set(1.35 * pulse, 0.78 / pulse, 1.02 * pulse);
      this.deepOrgan.material.emissiveIntensity = this.completed ? 0.84 : ready ? 0.52 : 0.22;
    }

    if (this.returnFold) {
      this.returnFold.visible = this.returnFoldReady;
      if (this.returnFoldReady) {
        const foldPulse = (Math.sin(t * 2.5) + 1) * 0.5;
        for (const lobe of this.returnFoldLobes) {
          lobe.position.copy(lobe.userData.basePosition);
          lobe.position.x += (lobe.userData.side ?? 0) * foldPulse * 0.07;
          lobe.material.emissiveIntensity = 0.34 + foldPulse * 0.38;
        }
      }
    }

    this.root.userData.activePathProgress = sample.progress;
    this.root.userData.compression = this.compression;
    this.root.userData.compressionFailure = this.compressionFailure;
  }

  completionProgress() {
    const readPart = Number(this.pressureRead) * 0.18;
    const bracePart = Number(this.ribsReleased) * 0.22;
    const appetitePart = Number(this.safeMatterAbsorbed) * 0.3;
    const depthPart = Math.min(1, this.maxDepthProgress / Math.max(0.01, this.recipe.completion?.minimumDeepProgress ?? 0.82)) * 0.22;
    const settlePart = this.compressionFailure ? 0 : Math.max(0, 0.08 - this.compression * 0.04);
    return this.completed ? 1 : THREE.MathUtils.clamp(readPart + bracePart + appetitePart + depthPart + settlePart, 0, 0.99);
  }

  stage() {
    if (this.completed) return "return_breath";
    if (this.compressionFailure) return "recover_compression_failure";
    if (!this.pressureRead) return "read_compression";
    if (!this.ribsReleased) return "brace_living_ribs";
    if (!this.safeMatterAbsorbed) return "select_porous_nutrient";
    if (this.maxDepthProgress < (this.recipe.completion?.minimumDeepProgress ?? 0.82)) return "follow_released_passage_deeper";
    return "settle_deep_pressure";
  }

  guideLine() {
    if (this.completed) return "The silt has stopped closing around appetite. Its released breath now returns to the Hub.";
    if (this.compressionFailure) return "Packed residue compressed the route. Nothing is lost—hold Stabilize until the ribs reopen.";
    if (!this.pressureRead) return "The low ribs close in sequence. Move inside them, hold Stabilize to catch the pressure, then Pulse through that relationship.";
    if (!this.ribsReleased) return "The pressure relationship is retained. Keep Stabilize held and let the ribs move around your brace.";
    if (!this.safeMatterAbsorbed) return "Only the warm porous packet yields. The dark packed clumps will close the passage if you pull them.";
    return "The route has accepted enough. Move through the opened ribs toward the deep pressure organ.";
  }

  nextAction() {
    if (this.completed) return "Follow the amber silt breath into the open entry fold.";
    if (this.compressionFailure) return this.stabilizationInRange
      ? "Hold LT until the compressed ribs reopen. Your earlier progress is safe."
      : "Move back inside the silt passage, then hold LT to reopen it.";
    if (!this.pressureRead) {
      if (this.pressureRelationshipReady) return "Pulse while Stabilize is held to read the compression direction.";
      if (this.pressureRelationshipHeld) return "Keep Stabilize held briefly, then Pulse through the compressed passage.";
      return "Move between the first low ribs and hold Stabilize to establish the pressure relationship.";
    }
    if (!this.ribsReleased) return "Keep LT held inside the passage until the living ribs open and stay open.";
    if (!this.safeMatterAbsorbed) {
      if (this.safePacketDistance <= (this.recipe.appetite?.safeAbsorbRange ?? 0.92)) {
        return "Hold RT on the warm porous packet; leave the dark packed clumps intact.";
      }
      return "Approach the warm porous packet in the appetite pocket, then hold RT.";
    }
    return "Move deeper through the released ribs until the deep organ exhales.";
  }

  publish(frameState, active) {
    const returnDistance = this.playerRoot.position.distanceTo(this.returnPosition);
    frameState.siltPressureRoute = {
      pass: "HC-031S",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      regionId: "silt_burrow_route",
      runtimeCellId: ROUTE_CELL_ID,
      status: this.completed
        ? active ? "silt_pressure_released_return_ready" : "silt_pressure_completion_retained"
        : active
          ? this.compressionFailure ? "recoverable_compression_failure_active" : "silt_pressure_playable"
          : "prepared_inactive",
      stage: this.stage(),
      materialState: this.completed
        ? "released"
        : this.safeMatterAbsorbed
          ? "porous_matter_received"
          : this.ribsReleased
            ? "braced_and_open"
            : this.pressureRead
              ? "density_revealed"
              : "compressed_unread",
      materialStateSequence: [
        "compressed_unread",
        "density_revealed",
        "braced_and_open",
        "porous_matter_received",
        "released"
      ],
      materialStateAuthority: "existing_silt_route_truth",
      retainedConsequence: {
        pass: "HC-018D",
        active: this.safeMatterAbsorbed,
        kind: this.safeMatterAbsorbed ? "appetite_pocket_depleted" : "none",
        survivesUnmountRemount: true,
        progressionAuthority: false
      },
      progress: this.completionProgress(),
      completed: this.completed,
      pressureRead: this.pressureRead,
      pressureReadCount: this.pressureReadCount,
      pressureReadSequence: this.pressureReadSequence,
      pressureRelationshipHeld: Boolean(active && this.pressureRelationshipHeld),
      pressureRelationshipReady: Boolean(active && this.pressureRelationshipReady),
      pressureRelationshipSeconds: active ? this.pressureRelationshipSeconds : 0,
      minimumPressureRelationshipHoldSeconds: this.recipe?.currentization?.minimumRelationshipHoldSeconds ?? 0.18,
      lastPressureReadChord: this.lastPressureReadChord,
      unboundPulseCount: this.unboundPulseCount,
      braceSeconds: this.braceSeconds,
      ribsReleased: this.ribsReleased,
      safeMatterAbsorbed: this.safeMatterAbsorbed,
      appetiteDrawSequence: this.appetiteDrawSequence,
      lastAppetiteDrawKind: this.lastAppetiteDrawKind,
      appetiteSelectionMode: "spatial_body_choice",
      safeAbsorbSeconds: this.safeAbsorbSeconds,
      safeAbsorbRequiredSeconds: this.recipe?.appetite?.requiredSafeAbsorbSeconds ?? 0.68,
      safePacketDistance: active && Number.isFinite(this.safePacketDistance) ? this.safePacketDistance : 0,
      nearestDenseDistance: active && Number.isFinite(this.nearestDenseDistance) ? this.nearestDenseDistance : 0,
      denseMatterLeftIntact: true,
      pathProgress: active ? this.pathProgress : 0,
      maxDepthProgress: this.maxDepthProgress,
      pathDistance: active ? this.pathDistance : 0,
      compression: this.compression,
      compressionFailure: this.compressionFailure,
      failureCount: this.failureCount,
      failureRecovered: this.failureRecovered,
      recoverySeconds: this.recoverySeconds,
      failureRecoverable: true,
      stabilizing: this.stabilizing,
      stabilizationInRange: this.stabilizationInRange,
      stabilizationRange: this.recipe?.recovery?.stabilizeRangeFromPassage ?? 1.9,
      absorbHeld: this.absorbHeld,
      returnFoldReady: this.returnFoldReady,
      returnFoldDistance: active ? returnDistance : 0,
      returnFoldInteractionRange: this.recipe?.returnFold?.interactionRange ?? 1.35,
      returnFoldPosition: active ? {
        x: this.returnPosition.x,
        y: this.returnPosition.y,
        z: this.returnPosition.z
      } : null,
      ribSilhouetteCount: this.ribGroups.length,
      porousNutrientCount: Number(!this.safeMatterAbsorbed),
      packedResidueCount: this.densePackets.length,
      visualMotionLanguages: [...(this.recipe?.visual?.motionLanguages ?? [])],
      habitatFoundation: {
        pass: this.recipe?.habitatFoundation?.pass ?? "none",
        active: Boolean(active && this.habitatAnatomy),
        topology: this.recipe?.geologicMedium?.topology ?? this.recipe?.habitatFoundation?.topology ?? "unexpanded",
        geologyPass: this.recipe?.geologicMedium?.pass ?? "none",
        driftGrainsVisualOnly: this.habitatDriftSeeds.length,
        habitatCount: this.habitatLobes.length,
        connectionCount: this.habitatVeins.length,
        currentHabitatId: active ? this.habitatSample.id : "none",
        habitatRelief: active ? this.habitatSample.relief : 0,
        addsContactSurfaces: false,
        newMaterialInstances: this.livingCycle?.units.length ?? 0,
        renewsMatter: Boolean(this.livingCycle),
        newProgression: false
      },
      livingMaterialCycle: this.livingCycle?.snapshot() ?? null,
      siltContact: this.siltContact?.snapshot() ?? null,
      heldMaterialMotion: {
        pass: "LS1D1D2J", heldId: this.siltGrip.heldId,
        initialGripRadius: this.heldGripInitialRadius,
        feedbackKind: this.heldMotionFeedbackKind,
        feedbackAge: Number(Math.max(0, this.elapsed - this.heldMotionFeedbackAt).toFixed(3)),
        radius: this.siltGrip.heldId && this.siltGrip.position
          ? Number(this.siltGripLocalOffset.length().toFixed(4)) : null,
        minRadius: 0.38, maxRadius: this.siltGrip.maxOffset,
        pulseCount: this.heldMotionPulseCount,
        cumulativePullDistance: Number(this.heldMotionPullDistance.toFixed(4)),
        lastReceipt: this.heldMotionLast,
        transferPerformed: false,
        contract: "Pulse pushes, Absorb pulls, neither consumes the held grain"
      },
      transactionTrace: {
        pass: "LS1D1D2M",
        lastSequence: this.transactionSequence,
        events: this.transactionTrace.slice(),
        scope: "SiltPressureRouteSystem decisions only; no global verb-route inference"
      },
      siltGrip: this.siltGrip.snapshot(),
      materialIdentity: this.materialIdentity?.snapshot() ?? null,
      genericRingCount: 0,
      triggerMarkerCount: 0,
      lastInteraction: this.lastInteraction,
      warning: this.warning,
      currentization: {
        pass: "HC-031S",
        canonicalPressureRead: "stabilize_establishes_environmental_pressure_relationship_then_pulse_projects_through_it",
        relationshipSource: "environmental_pressure",
        stabilizeEstablishesRelationship: true,
        pulseProjectsThroughRelationship: true,
        pulseAloneCanReadPressure: false,
        appetiteSelectionMode: "spatial_body_choice",
        appetiteSelectionAuthority: "player_spatial_approach",
        absorbDrawsMatterFromChosenSpatialBody: true,
        nounTargetingAuthorityChanged: false,
        aimChoosesTargetForTargetableNouns: true,
        environmentalPressureMayBeRelatedWithoutNounTarget: true,
        packedResidueFailureRecoverable: true,
        progressionAuthority: true,
        crossingAuthority: false
      },
      guideLine: this.guideLine(),
      objectiveLine: this.nextAction(),
      nextAction: this.nextAction(),
      gameplayOwner: "SiltPressureRouteSystem",
      presentationOwner: "SiltPressureRouteSystem",
      movementOwner: "PlayerMovementController",
      objectiveOwner: "ObjectiveSystem",
      crossingOwner: "LocalCellBoundaryMorphSystem",
      playerPositionPreserved: true,
      forcedRelocation: false,
      directObjectiveMutation: false,
      directGateMutation: false,
      directActiveCellMutation: false,
      directRouteHistoryMutation: false,
      newAbilityUnlocks: 0,
      newEntities: 0,
      combat: false,
      death: false,
      forcedRestart: false,
      permanentClass: false,
      archivedCompatibilitySystemsActivated: 0,
      mountCount: this.mountCount
    };
  }

  setVisible(visible) {
    if (this.root) this.root.visible = visible;
    if (this.returnFold) this.returnFold.visible = Boolean(visible && this.returnFoldReady);
    if (this.safeAbsorbStream && !visible) this.safeAbsorbStream.visible = false;
  }

  trackMaterial(material) {
    this.materials.push(material);
    return material;
  }
}
