import * as THREE from "three";

const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const COHERENCE_SEGMENTS = 40;

const clamp01 = (value) => Math.max(0, Math.min(1, value));

export class TargetingSystem {
  constructor({ scene, camera, playerRoot, chemObjectSystem, frameState }) {
    if (!scene) throw new Error("[TargetingSystem] scene is required.");
    if (!camera) throw new Error("[TargetingSystem] camera is required.");
    if (!playerRoot) throw new Error("[TargetingSystem] playerRoot is required.");
    if (!chemObjectSystem) throw new Error("[TargetingSystem] chemObjectSystem is required.");

    this.scene = scene;
    this.camera = camera;
    this.playerRoot = playerRoot;
    this.chemObjectSystem = chemObjectSystem;
    this.frameState = frameState;

    // HC031M: attention owns the noun; verbs only modify the held relationship.
    // AVAILABLE -> CANDIDATE -> ENGAGED -> HELD -> RELEASED is aim-driven.
    this.candidate = null;
    this.target = null;
    this.availableBest = null;
    this.availableTargetCount = 0;
    this.candidateAimThreshold = 0.42;
    this.attentionEngageAimThreshold = 0.68;
    this.attentionHoldAimThreshold = 0.24;
    this.attentionEngageDwellSeconds = 0.10;
    this.attentionHoldPromoteSeconds = 0.12;
    this.attentionReleaseGraceSeconds = 0.30;
    this.attentionReleasePhaseSeconds = 0.12;
    this.attentionTarget = null;
    this.attentionTargetId = "none";
    this.attentionSequence = 0;
    this.attentionAge = 0;
    this.attentionPhase = "none";
    this.attentionReason = "not_initialized";
    this.attentionLossGraceRemaining = 0;
    this.attentionReleaseAge = 0;
    this.attentionCandidateDwellId = "none";
    this.attentionCandidateDwellAge = 0;

    // Relationship state remains verb-scoped for downstream chemistry/effect owners.
    this.relationshipTarget = null;
    this.relationshipTargetId = "none";
    this.relationshipSequence = 0;
    this.relationshipAge = 0;
    this.relationshipReleaseGraceRemaining = 0;
    this.relationshipReleaseGraceSeconds = 0.28;
    this.candidateSwitchMargin = 0.62;
    this.candidateSnapshotsById = new Map();

    // HC031W1: Stabilize becomes an explicit relationship modifier instead of a
    // sticky auto-target. Deliberate right-stick motion may redirect a held
    // relationship toward a centered local noun after a short dwell.
    this.stabilizeSteerStickThreshold = 0.18;
    this.stabilizeSteerAimThreshold = 0.70;
    this.stabilizeSteerAimAdvantage = 0.10;
    this.stabilizeSteerDwellSeconds = 0.09;
    this.stabilizeSteerDwellId = "none";
    this.stabilizeSteerDwellAge = 0;
    this.stabilizeRedirectSequence = 0;
    this.stabilizeMacroSuppressionSequence = 0;

    this.reticle = null;
    this.pointerLine = null;
    this.selectedHalo = null;
    this.relationshipGlyphRoot = null;
    this.pulseTriangle = null;
    this.absorbTriangle = null;
    this.coherenceBoundary = null;
    this.coherencePositions = new Float32Array(COHERENCE_SEGMENTS * 3);
    this.linePositions = new Float32Array(6);

    this.tmpTargetPosition = new THREE.Vector3();
    this.tmpPlayerPosition = new THREE.Vector3();
    this.tmpCameraPosition = new THREE.Vector3();
    this.tmpCameraDirection = new THREE.Vector3();
    this.tmpToTarget = new THREE.Vector3();
    this.tmpRelationshipDirection = new THREE.Vector3();
    this.tmpRight = new THREE.Vector3();
    this.tmpNormal = new THREE.Vector3();
    this.tmpMatrix = new THREE.Matrix4();

    this.lastActiveCellId = "none";
    this.lastMountSequence = -1;
    this.regionClearSequence = 0;
    this.lastRegionClearReason = "not_initialized";
  }

  init() {
    this.createReticle();
    this.createSelectedHalo();
    this.createPointerLine();
    this.createRelationshipGlyphs();
    this.lastActiveCellId = this.frameState?.activeCellId ?? "none";
    this.lastMountSequence = this.frameState?.firstSliceRuntimeMount?.mountSequence ?? -1;
  }

  update(dt, frameState) {
    const ownershipChanged = this.clearForOwnershipChange(frameState);
    if (ownershipChanged) {
      this.updateFrameState(frameState, this.resolveRelationshipIntent(frameState.input));
      return;
    }

    const intent = this.resolveRelationshipIntent(frameState.input);
    const safeDt = Math.max(0, dt ?? 0);
    this.candidate = this.pickTarget(this.candidate);
    this.updateAttention(safeDt, frameState, intent);
    this.updateRelationship(safeDt, frameState, intent);
    this.target = this.relationshipTarget ?? this.attentionTarget ?? this.candidate;

    this.updateFrameState(frameState, intent);
    this.updateReticle(frameState);
    this.updatePointerLine(frameState);
    this.updateRelationshipGlyphs(frameState);
  }

  onRuntimeUnmount(frameState) {
    this.clearTargetState(frameState, "targeting_runtime_unmounted");
  }

  clearForOwnershipChange(frameState) {
    const activeCellId = frameState.activeCellId ?? "none";
    const mountSequence = frameState.firstSliceRuntimeMount?.mountSequence ?? -1;
    const cellChanged = this.lastActiveCellId !== "none" && activeCellId !== this.lastActiveCellId;
    const mountChanged = this.lastMountSequence >= 0 && mountSequence !== this.lastMountSequence;

    if (cellChanged || mountChanged) {
      const fromCell = this.lastActiveCellId;
      const reason = `region_ownership_changed:${fromCell}->${activeCellId}`;
      this.clearTargetState(frameState, reason);
    }

    this.lastActiveCellId = activeCellId;
    this.lastMountSequence = mountSequence;
    return cellChanged || mountChanged;
  }

  clearTargetState(frameState, reason = "explicit_target_clear") {
    this.candidate = null;
    this.target = null;
    this.availableBest = null;
    this.availableTargetCount = 0;
    this.attentionTarget = null;
    this.attentionTargetId = "none";
    this.attentionAge = 0;
    this.attentionPhase = "none";
    this.attentionReason = reason;
    this.attentionLossGraceRemaining = 0;
    this.attentionReleaseAge = 0;
    this.attentionCandidateDwellId = "none";
    this.attentionCandidateDwellAge = 0;
    this.relationshipTarget = null;
    this.relationshipTargetId = "none";
    this.relationshipAge = 0;
    this.relationshipReleaseGraceRemaining = 0;
    this.stabilizeSteerDwellId = "none";
    this.stabilizeSteerDwellAge = 0;
    this.candidateSnapshotsById.clear();
    this.clearVisualArtifacts();
    this.regionClearSequence += 1;
    this.lastRegionClearReason = reason;

    if (this.playerRoot?.userData) {
      frameState.selectedObject = this.playerRoot.userData;
    }

    frameState.targeting = this.createEmptyTargetingState(frameState, "target_cleared_for_region_ownership");
  }

  createEmptyTargetingState(frameState, message = "no_target") {
    return {
      pass: "HC-031M",
      active: false,
      targetId: "none",
      targetKind: "none",
      targetCellId: "none",
      distance: 0,
      lockStrength: 0,
      reticleState: "idle",
      message,
      absorbHint: "no_target",
      focusProvider: frameState.targetFocus?.provider ?? "none",
      candidateId: "none",
      candidateKind: "none",
      candidateDistance: 0,
      candidateAimDot: -1,
      candidateScore: 0,
      candidateContextScore: 0,
      availableTargetCount: this.availableTargetCount,
      attentionActive: false,
      attentionPhase: this.attentionPhase === "released"
        ? "released"
        : (this.availableTargetCount > 0 ? "available" : "none"),
      attentionTargetId: "none",
      attentionSequence: this.attentionSequence,
      attentionAge: 0,
      attentionReason: this.attentionReason,
      attentionAimDot: -1,
      attentionLossGraceRemaining: 0,
      aimOwnershipPolicy: "aim_selects_attention_stabilize_rs_can_redirect_local_relationship",
      verbRetargetingAllowed: Boolean(intent.verbs.includes("stabilize")),
      relationshipActive: false,
      relationshipPhase: "none",
      relationshipTargetId: "none",
      relationshipVerb: "none",
      relationshipVerbs: [],
      relationshipSequence: this.relationshipSequence,
      relationshipAge: 0,
      handoffPolicy: "stabilize_rs_redirect_or_release_then_reacquire",
      regionClearSequence: this.regionClearSequence,
      lastRegionClearReason: this.lastRegionClearReason,
      visualArtifactsCleared: true
    };
  }

  clearVisualArtifacts() {
    if (this.reticle) this.reticle.visible = false;
    if (this.pointerLine) this.pointerLine.visible = false;
    if (this.selectedHalo) this.selectedHalo.visible = false;
    if (this.relationshipGlyphRoot) this.relationshipGlyphRoot.visible = false;
    if (this.coherenceBoundary) this.coherenceBoundary.visible = false;
  }

  resolveRelationshipIntent(input = {}) {
    const verbs = [];
    if (input.pulseHeld || input.pulsePressed) verbs.push("pulse");
    if (input.absorbHeld) verbs.push("absorb");
    if (input.stabilizeHeld || input.resonanceHeld) verbs.push("stabilize");
    return {
      active: verbs.length > 0,
      verbs,
      primary: verbs[0] ?? "none",
      chord: verbs.length > 1 ? verbs.join("+") : (verbs[0] ?? "none")
    };
  }

  updateAttention(dt, frameState, intent) {
    const currentSnapshot = this.attentionTargetId !== "none"
      ? this.candidateSnapshotsById.get(this.attentionTargetId) ?? null
      : null;

    if (this.attentionTarget && !currentSnapshot) {
      this.releaseAttention("attention_target_invalid");
    } else if (currentSnapshot) {
      this.attentionTarget = currentSnapshot;
    }

    if (this.attentionTarget?.root?.userData) {
      frameState.selectedObject = this.attentionTarget.root.userData;
    }

    if (!this.attentionTarget) {
      if (this.attentionPhase === "released") {
        this.attentionReleaseAge += dt;
        if (this.attentionReleaseAge < this.attentionReleasePhaseSeconds) return;
        this.attentionPhase = this.candidate
          ? "candidate"
          : (this.availableTargetCount > 0 ? "available" : "none");
        this.attentionReason = "release_settled";
      }

      const candidateEligible = Boolean(
        this.candidate
        && (this.candidate.aimDot ?? -1) >= this.attentionEngageAimThreshold
      );

      if (!candidateEligible) {
        this.attentionCandidateDwellId = "none";
        this.attentionCandidateDwellAge = 0;
        this.attentionPhase = this.candidate
          ? "candidate"
          : (this.availableTargetCount > 0 ? "available" : "none");
        return;
      }

      const candidateId = this.candidate.recipe?.id ?? "none";
      if (candidateId !== this.attentionCandidateDwellId) {
        this.attentionCandidateDwellId = candidateId;
        this.attentionCandidateDwellAge = 0;
      } else {
        this.attentionCandidateDwellAge += dt;
      }

      this.attentionPhase = "candidate";
      this.attentionReason = "aim_candidate_centered";

      if (this.attentionCandidateDwellAge >= this.attentionEngageDwellSeconds) {
        this.setAttentionTarget(this.candidate, "aim_engaged");
      }
      return;
    }

    this.attentionAge += dt;
    if (
      this.attentionPhase === "engaged"
      && this.attentionAge >= this.attentionHoldPromoteSeconds
    ) {
      this.attentionPhase = "held";
      this.attentionReason = "aim_hold_confirmed";
    }

    // HC031W1: ordinary verb activity still protects the aim-owned noun, but
    // Stabilize + deliberate right-stick steering is allowed to redirect that
    // relationship toward a clearly centered LOCAL noun. Macro Host bodies stay
    // observable but no longer steal working intent once the territory is local.
    if (intent.active) {
      if (this.handleStabilizeSteeringRedirect(dt, frameState, intent)) {
        this.attentionLossGraceRemaining = this.attentionReleaseGraceSeconds;
        return;
      }
      this.attentionLossGraceRemaining = this.attentionReleaseGraceSeconds;
      return;
    }

    const currentAim = Number.isFinite(this.attentionTarget?.aimDot)
      ? this.attentionTarget.aimDot
      : -1;
    const candidateId = this.candidate?.recipe?.id ?? "none";
    const candidateAim = Number.isFinite(this.candidate?.aimDot) ? this.candidate.aimDot : -1;
    const deliberatelyRedirected = Boolean(
      candidateId !== "none"
      && candidateId !== this.attentionTargetId
      && candidateAim >= this.attentionEngageAimThreshold
      && candidateAim - currentAim >= 0.22
    );

    if (deliberatelyRedirected) {
      this.releaseAttention("aim_redirected");
      return;
    }

    if (currentAim >= this.attentionHoldAimThreshold) {
      this.attentionLossGraceRemaining = this.attentionReleaseGraceSeconds;
      return;
    }

    this.attentionLossGraceRemaining = Math.max(0, this.attentionLossGraceRemaining - dt);
    if (this.attentionLossGraceRemaining <= 0) {
      this.releaseAttention("aim_left_hold_cone");
    }

    if (this.attentionTarget?.root?.userData) {
      frameState.selectedObject = this.attentionTarget.root.userData;
    }
  }

  getTargetScope(target) {
    if (!target) return "none";
    if (target.attentionScope) return target.attentionScope;
    if (target.localEntityAttention) return "local_entity";
    if (target.externalAttention) return "macro_world";
    return "local_object";
  }

  getControllerSteeringIntent(frameState) {
    const input = frameState.input ?? {};
    const source = frameState.inputSource ?? {};
    const magnitude = Number.isFinite(source.rightStickMagnitude)
      ? source.rightStickMagnitude
      : Math.hypot(input.cameraLookX ?? 0, input.cameraLookY ?? 0);
    return {
      magnitude,
      active: magnitude >= this.stabilizeSteerStickThreshold
    };
  }

  isLocalRelationshipContext(frameState) {
    return Boolean(
      frameState.activeCellId === "CELL_APERTURE_FIELDS_ARRIVAL_001"
      && frameState.adjacentHostTerritory?.enteredTerritory
    );
  }

  isRelationshipEligibleForStabilize(target, frameState) {
    if (!target) return false;
    if (!this.isLocalRelationshipContext(frameState)) return true;

    const scope = this.getTargetScope(target);
    const targetingTuning = frameState.controllerOnboarding?.tuning?.targeting ?? {};
    const fallbackRange = Number(targetingTuning.assistStateDistance ?? 5.2);
    const authoredRangeValue = target.relationshipRange ?? target.maxRelationshipDistance;
    const authoredRange = Number.isFinite(authoredRangeValue) ? Number(authoredRangeValue) : NaN;
    const workingRange = Number.isFinite(authoredRange) ? Math.max(2.4, authoredRange) : Math.max(5.2, fallbackRange);
    const distance = Number(target.distance ?? Infinity);

    if (scope === "macro_world") return distance <= workingRange;
    if (scope === "local_entity" || scope === "local_object") return distance <= workingRange;
    return false;
  }

  handleStabilizeSteeringRedirect(dt, frameState, intent) {
    const stabilizeHeld = intent.verbs.includes("stabilize");
    const steering = this.getControllerSteeringIntent(frameState);
    const candidate = this.candidate;
    const candidateId = candidate?.recipe?.id ?? "none";
    const attentionId = this.attentionTargetId ?? "none";

    if (!stabilizeHeld || !steering.active || !candidate || candidateId === "none" || candidateId === attentionId) {
      this.stabilizeSteerDwellId = "none";
      this.stabilizeSteerDwellAge = 0;
      return false;
    }

    const candidateScope = this.getTargetScope(candidate);
    // Once Gathering Ground is local, LT+RS is a working-noun steering gesture.
    // Do not redirect from a local organism back onto the whole macro territory.
    if (this.isLocalRelationshipContext(frameState) && candidateScope === "macro_world") {
      this.stabilizeSteerDwellId = "none";
      this.stabilizeSteerDwellAge = 0;
      return false;
    }

    const candidateAim = Number.isFinite(candidate.aimDot) ? candidate.aimDot : -1;
    const currentAim = Number.isFinite(this.attentionTarget?.aimDot) ? this.attentionTarget.aimDot : -1;
    const locallyEligible = this.isRelationshipEligibleForStabilize(candidate, frameState);
    const deliberate = locallyEligible
      && candidateAim >= this.stabilizeSteerAimThreshold
      && (candidateScope === "local_entity" || candidateAim - currentAim >= this.stabilizeSteerAimAdvantage);

    if (!deliberate) {
      this.stabilizeSteerDwellId = "none";
      this.stabilizeSteerDwellAge = 0;
      return false;
    }

    if (this.stabilizeSteerDwellId !== candidateId) {
      this.stabilizeSteerDwellId = candidateId;
      this.stabilizeSteerDwellAge = 0;
      return true;
    }

    this.stabilizeSteerDwellAge += Math.max(0, dt ?? 0);
    if (this.stabilizeSteerDwellAge < this.stabilizeSteerDwellSeconds) return true;

    this.setAttentionTarget(candidate, "stabilize_rs_redirect");
    this.stabilizeRedirectSequence += 1;
    this.stabilizeSteerDwellId = "none";
    this.stabilizeSteerDwellAge = 0;
    return true;
  }

  setAttentionTarget(target, reason) {
    if (!target) return;
    const nextId = target.recipe?.id ?? "none";
    if (nextId === "none") return;
    const changed = this.attentionTargetId !== nextId;
    this.attentionTarget = target;
    this.attentionTargetId = nextId;
    this.attentionAge = 0;
    this.attentionPhase = "engaged";
    this.attentionReason = reason;
    this.attentionLossGraceRemaining = this.attentionReleaseGraceSeconds;
    this.attentionReleaseAge = 0;
    this.attentionCandidateDwellId = nextId;
    this.attentionCandidateDwellAge = 0;
    if (changed) this.attentionSequence += 1;
  }

  releaseAttention(reason) {
    this.attentionTarget = null;
    this.attentionTargetId = "none";
    this.attentionAge = 0;
    this.attentionPhase = "released";
    this.attentionReason = reason;
    this.attentionLossGraceRemaining = 0;
    this.attentionReleaseAge = 0;
    this.attentionCandidateDwellId = "none";
    this.attentionCandidateDwellAge = 0;
  }

  updateRelationship(dt, frameState, intent) {
    if (
      this.relationshipTarget
      && (
        !this.attentionTarget
        || this.relationshipTargetId !== this.attentionTargetId
      )
    ) {
      this.releaseRelationship("attention_owner_released");
    }

    if (intent.active && this.attentionTarget) {
      this.relationshipReleaseGraceRemaining = this.relationshipReleaseGraceSeconds;
      const stabilizeHeld = intent.verbs.includes("stabilize");
      const stabilizeEligible = !stabilizeHeld || this.isRelationshipEligibleForStabilize(this.attentionTarget, frameState);

      if (!stabilizeEligible) {
        if (this.relationshipTarget) {
          this.releaseRelationship("stabilize_macro_relationship_suppressed_local_context");
          this.stabilizeMacroSuppressionSequence += 1;
        }
      } else {
        if (!this.relationshipTarget || this.relationshipTargetId !== this.attentionTargetId) {
          const reason = this.attentionReason === "stabilize_rs_redirect"
            ? "stabilize_rs_redirected_aim_owned_target"
            : "verb_modified_aim_owned_target";
          this.setRelationshipTarget(this.attentionTarget, reason);
        } else {
          this.relationshipTarget = this.attentionTarget;
        }
        this.relationshipAge += dt;
      }
    } else if (this.relationshipTarget) {
      this.relationshipReleaseGraceRemaining = Math.max(0, this.relationshipReleaseGraceRemaining - dt);
      this.relationshipAge += dt;
      if (this.relationshipReleaseGraceRemaining <= 0) {
        this.releaseRelationship("verb_released");
      }
    }

    if (this.relationshipTarget?.root?.userData) {
      frameState.selectedObject = this.relationshipTarget.root.userData;
    } else if (this.attentionTarget?.root?.userData) {
      frameState.selectedObject = this.attentionTarget.root.userData;
    }
  }

  setRelationshipTarget(target, reason) {
    if (!target) return;
    const nextId = target.recipe?.id ?? "none";
    if (nextId === "none") return;
    const changed = this.relationshipTargetId !== nextId;
    this.relationshipTarget = target;
    this.relationshipTargetId = nextId;
    this.relationshipAge = 0;
    if (changed) this.relationshipSequence += 1;
    this.lastRelationshipReason = reason;
  }

  releaseRelationship(reason) {
    this.relationshipTarget = null;
    this.relationshipTargetId = "none";
    this.relationshipAge = 0;
    this.relationshipReleaseGraceRemaining = 0;
    this.lastRelationshipReason = reason;
  }

  pickTarget(incumbent = null) {
    let best = null;
    let incumbentSnapshot = null;
    const focus = this.frameState.targetFocus ?? {};
    this.candidateSnapshotsById.clear();
    this.availableBest = null;
    this.availableTargetCount = 0;
    if (this.frameState.activeCellId === HUB_CELL_ID) return null;
    if (focus.suppressTargeting) return null;
    const allowedCells = new Set(focus.allowedCells ?? []);
    const excludedObjectIds = new Set(focus.excludedObjectIds ?? []);
    const incumbentId = incumbent?.recipe?.id ?? "none";

    this.camera.getWorldPosition(this.tmpCameraPosition);
    this.camera.getWorldDirection(this.tmpCameraDirection).normalize();
    this.getWorldPosition(this.playerRoot, this.tmpPlayerPosition);

    for (const item of this.chemObjectSystem.objects) {
      if (excludedObjectIds.has(item.recipe.id)) continue;
      if (item.absorbed || item.root.userData.absorbed || !item.root.visible) continue;
      if (allowedCells.size > 0 && item.cellId && !allowedCells.has(item.cellId)) continue;

      const snapshot = this.scoreCandidate(item, focus);
      this.candidateSnapshotsById.set(item.recipe.id, snapshot);
      this.availableTargetCount += 1;
      if (!this.availableBest || snapshot.score > this.availableBest.score) {
        this.availableBest = snapshot;
      }

      // HC031M: verbs cannot expand or bias the target cone. Candidate ownership
      // begins only when the camera/aim actually places an available noun in view.
      if ((snapshot.aimDot ?? -1) < this.candidateAimThreshold) continue;
      if (item.recipe.id === incumbentId) incumbentSnapshot = snapshot;
      if (!best || snapshot.aimOwnershipScore > best.aimOwnershipScore) best = snapshot;
    }

    // HC031T4: world-scale Host bodies can participate in the same aim-owned
    // attention grammar without pretending to be ChemObjects. Providers publish
    // read-only candidates with one semantic ID and multiple visible focus roots.
    for (const external of this.getExternalAttentionCandidates()) {
      const externalId = external?.id ?? "none";
      if (externalId === "none" || excludedObjectIds.has(externalId)) continue;
      if (allowedCells.size > 0 && external.cellId && !allowedCells.has(external.cellId)) continue;

      const candidate = this.normalizeWorldAttentionCandidate(external);
      if (!candidate) continue;
      const snapshot = this.scoreCandidate(candidate, focus);
      this.candidateSnapshotsById.set(externalId, snapshot);
      this.availableTargetCount += 1;
      if (!this.availableBest || snapshot.score > this.availableBest.score) {
        this.availableBest = snapshot;
      }

      if ((snapshot.aimDot ?? -1) < this.candidateAimThreshold) continue;
      if (externalId === incumbentId) incumbentSnapshot = snapshot;
      if (!best || snapshot.aimOwnershipScore > best.aimOwnershipScore) best = snapshot;
    }

    if (
      best
      && incumbentSnapshot
      && best.recipe.id !== incumbentSnapshot.recipe.id
      && best.aimOwnershipScore < incumbentSnapshot.aimOwnershipScore + this.candidateSwitchMargin
    ) {
      return incumbentSnapshot;
    }

    return best;
  }

  getExternalAttentionCandidates() {
    const worldProvider = this.frameState.worldAttentionCandidates ?? {};
    const entityProvider = this.frameState.entityAttentionCandidates ?? {};
    const world = worldProvider.active && Array.isArray(worldProvider.items) ? worldProvider.items : [];
    const entities = entityProvider.active && Array.isArray(entityProvider.items) ? entityProvider.items : [];
    return [...world, ...entities];
  }

  getWorldAttentionCandidates() {
    // Compatibility alias retained for older validators/tools.
    return this.getExternalAttentionCandidates();
  }

  normalizeWorldAttentionCandidate(external) {
    const id = external?.id ?? "none";
    if (id === "none") return null;

    const roots = Array.isArray(external.focusRoots) && external.focusRoots.length > 0
      ? external.focusRoots.filter((root) => root?.visible !== false)
      : [external.root].filter(Boolean);
    if (roots.length === 0) return null;

    let bestRoot = roots[0];
    let bestAimDot = -Infinity;
    for (const root of roots) {
      this.getWorldPosition(root, this.tmpTargetPosition);
      this.tmpToTarget.copy(this.tmpTargetPosition).sub(this.tmpCameraPosition);
      const distance = this.tmpToTarget.length();
      const dot = distance > 0.0001
        ? this.tmpToTarget.multiplyScalar(1 / distance).dot(this.tmpCameraDirection)
        : 1;
      if (dot > bestAimDot) {
        bestAimDot = dot;
        bestRoot = root;
      }
    }

    return {
      root: bestRoot,
      cellId: external.cellId ?? "none",
      externalAttention: true,
      localEntityAttention: external.attentionScope === "local_entity",
      attentionScope: external.attentionScope ?? "macro_world",
      maxRelationshipDistance: Number.isFinite(external.maxRelationshipDistance) ? external.maxRelationshipDistance : null,
      relationshipRange: Number.isFinite(external.relationshipRange) ? external.relationshipRange : null,
      targetKind: external.targetKind ?? (external.attentionScope === "local_entity" ? "living_entity" : "host_territory"),
      externalPriority: Number.isFinite(external.externalPriority) ? external.externalPriority : 0,
      worldAttentionSource: external.source ?? "world_attention_provider",
      recipe: {
        id,
        label: external.label ?? id,
        chemistry: {
          domains: Array.isArray(external.domains) ? external.domains : ["host", "territory"],
          bondTypes: [],
          instabilityRisk: 0.12
        },
        behavior: {}
      }
    };
  }

  scoreCandidate(item, focus) {
    this.getWorldPosition(item.root, this.tmpTargetPosition);
    const distance = this.tmpPlayerPosition.distanceTo(this.tmpTargetPosition);
    const domains = item.recipe.chemistry?.domains ?? [];
    const bondTypes = item.recipe.chemistry?.bondTypes ?? [];
    const isAbsorbable = Boolean(item.recipe.behavior?.onAbsorb);
    const isSignal = domains.includes("signal");
    const isScar = domains.includes("scar");

    let priority = 0;
    if (isAbsorbable) priority += 4;
    const targetingTuning = this.frameState.controllerOnboarding?.tuning?.targeting ?? {};
    if (bondTypes.includes("soft_bond")) priority += targetingTuning.softBondBoost ?? 2.5;
    if (isSignal) priority += 1.2;
    if (isScar) priority -= 0.4;
    if (Number.isFinite(item.externalPriority)) priority += item.externalPriority;
    if (item.cellId && focus.cellBoosts?.[item.cellId]) priority += focus.cellBoosts[item.cellId];
    if (focus.objectBoosts?.[item.recipe.id]) priority += focus.objectBoosts[item.recipe.id];
    if (focus.preferredTargetId === item.recipe.id) priority += targetingTuning.preferredTargetBoost ?? 3.5;

    const distanceScore = Math.max(0, (targetingTuning.scoreDistanceRange ?? 6.0) - distance);
    this.tmpToTarget.copy(this.tmpTargetPosition).sub(this.tmpCameraPosition);
    const aimDistance = this.tmpToTarget.length();
    const aimDot = aimDistance > 0.0001
      ? this.tmpToTarget.multiplyScalar(1 / aimDistance).dot(this.tmpCameraDirection)
      : 1;
    const aimScore = aimDot >= 0
      ? aimDot * 4.0
      : aimDot * 2.6;
    const score = priority + distanceScore + aimScore;

    // HC031M: authored/context priority can suggest a noun, but it cannot overpower
    // a materially better camera alignment. This is the canonical aim-ownership score.
    const boundedPriorityInfluence = Math.max(-2, Math.min(6, priority)) * 0.35;
    const boundedDistanceInfluence = Math.max(0, Math.min(6.8, distanceScore)) * 0.18;
    const aimOwnershipScore = aimDot * 12 + boundedPriorityInfluence + boundedDistanceInfluence;

    return {
      ...item,
      distance,
      score,
      priority,
      aimDot,
      aimScore,
      aimOwnershipScore,
      isAbsorbable,
      isSignal,
      isScar
    };
  }

  getWorldPosition(root, target) {
    if (root?.getWorldPosition) return root.getWorldPosition(target);
    if (root?.position) return target.copy(root.position);
    return target.set(0, 0, 0);
  }

  buildControllerTargetingAudit(frameState, intent, {
    candidate = this.candidate,
    attentionTarget = this.attentionTarget,
    relationshipTarget = this.relationshipTarget
  } = {}) {
    const input = frameState.input ?? {};
    const source = frameState.inputSource ?? {};
    const targetingTuning = frameState.controllerOnboarding?.tuning?.targeting ?? {};
    const rightStickMagnitude = Number.isFinite(source.rightStickMagnitude)
      ? source.rightStickMagnitude
      : Math.hypot(input.cameraLookX ?? 0, input.cameraLookY ?? 0);
    const stabilizeHeld = Boolean(input.stabilizeHeld || input.resonanceHeld);
    const stabilizeTriggerValue = Number.isFinite(source.stabilizeTriggerValue)
      ? source.stabilizeTriggerValue
      : (stabilizeHeld ? 1 : 0);
    const steeringIntentThreshold = 0.18;
    const steeringIntentActive = rightStickMagnitude >= steeringIntentThreshold;

    const candidateId = candidate?.recipe?.id ?? "none";
    const attentionId = attentionTarget?.recipe?.id ?? "none";
    const relationshipId = relationshipTarget?.recipe?.id ?? "none";
    const candidateAim = Number.isFinite(candidate?.aimDot) ? candidate.aimDot : -1;
    const attentionAim = Number.isFinite(attentionTarget?.aimDot) ? attentionTarget.aimDot : -1;
    const candidateDistance = Number.isFinite(candidate?.distance) ? candidate.distance : 0;
    const attentionDistance = Number.isFinite(attentionTarget?.distance) ? attentionTarget.distance : 0;
    const relationshipDistance = Number.isFinite(relationshipTarget?.distance) ? relationshipTarget.distance : 0;
    const candidateDiffersFromAttention = candidateId !== "none" && attentionId !== "none" && candidateId !== attentionId;
    const candidateDiffersFromRelationship = candidateId !== "none" && relationshipId !== "none" && candidateId !== relationshipId;
    const redirectEvidencePresent = Boolean(
      candidateDiffersFromAttention
      && candidateAim >= this.attentionEngageAimThreshold
      && candidateAim - attentionAim >= 0.22
    );
    const assistRange = targetingTuning.assistStateDistance ?? 5.2;
    const relationshipBeyondAssistRange = Boolean(relationshipTarget && relationshipDistance > assistRange);
    const stabilizeProtectsAttention = Boolean(stabilizeHeld && attentionTarget);
    const stabilizeBlocksRedirectEvidence = Boolean(stabilizeProtectsAttention && steeringIntentActive && redirectEvidencePresent);

    let findingCode = "observe_only";
    if (this.attentionReason === "stabilize_rs_redirect") findingCode = "stabilize_rs_redirected_local_relationship";
    else if (stabilizeHeld && this.isLocalRelationshipContext(frameState) && attentionTarget && !this.isRelationshipEligibleForStabilize(attentionTarget, frameState)) findingCode = "stabilize_macro_relationship_suppressed_local_context";
    else if (stabilizeBlocksRedirectEvidence) findingCode = "stabilize_redirect_pending_dwell";
    else if (stabilizeHeld && relationshipBeyondAssistRange) findingCode = "stabilize_relationship_beyond_assist_range";
    else if (stabilizeHeld && relationshipTarget) findingCode = "stabilize_relationship_held";
    else if (steeringIntentActive && candidateDiffersFromAttention) findingCode = "rs_redirect_candidate_visible";

    return {
      pass: "HC-031W1",
      authority: "controller_targeting_relationship_truth",
      behaviorChanged: true,
      stabilizeHeld,
      stabilizeTriggerValue: Number(stabilizeTriggerValue.toFixed(3)),
      rightStickMagnitude: Number(rightStickMagnitude.toFixed(3)),
      cameraLookX: Number((input.cameraLookX ?? 0).toFixed?.(3) ?? (input.cameraLookX ?? 0)),
      cameraLookY: Number((input.cameraLookY ?? 0).toFixed?.(3) ?? (input.cameraLookY ?? 0)),
      steeringIntentThreshold,
      steeringIntentActive,
      verbIntentActive: Boolean(intent.active),
      candidateId,
      candidateScope: this.getTargetScope(candidate),
      candidateDistance: Number(candidateDistance.toFixed(3)),
      candidateAimDot: Number(candidateAim.toFixed(3)),
      attentionTargetId: attentionId,
      attentionScope: this.getTargetScope(attentionTarget),
      attentionDistance: Number(attentionDistance.toFixed(3)),
      attentionAimDot: Number(attentionAim.toFixed(3)),
      attentionPhase: this.attentionPhase,
      relationshipTargetId: relationshipId,
      relationshipScope: this.getTargetScope(relationshipTarget),
      relationshipDistance: Number(relationshipDistance.toFixed(3)),
      relationshipPhase: relationshipTarget ? (intent.active ? "engaged" : "releasing") : "none",
      candidateDiffersFromAttention,
      candidateDiffersFromRelationship,
      redirectEvidencePresent,
      stabilizeProtectsAttention,
      stabilizeBlocksRedirectEvidence,
      relationshipBeyondAssistRange,
      assistRange,
      candidateRelationshipDistanceDelta: relationshipTarget && candidate
        ? Number((relationshipDistance - candidateDistance).toFixed(3))
        : 0,
      currentPolicy: "aim_selects_attention_stabilize_plus_rs_redirects_local_relationship",
      stabilizeRedirectSequence: this.stabilizeRedirectSequence,
      stabilizeMacroSuppressionSequence: this.stabilizeMacroSuppressionSequence,
      stabilizeSteerDwellId: this.stabilizeSteerDwellId,
      stabilizeSteerDwellAge: Number(this.stabilizeSteerDwellAge.toFixed(3)),
      proposedAuditQuestion: "does_stabilize_plus_rs_now_follow_deliberate_local_aim_without_macro_target_theft",
      findingCode
    };
  }

  updateFrameState(frameState, intent = this.resolveRelationshipIntent(frameState.input)) {
    const candidate = this.candidate;
    const attentionTarget = this.attentionTarget;
    const effective = this.relationshipTarget ?? attentionTarget ?? candidate;
    if (!effective) {
      frameState.targeting = this.createEmptyTargetingState(frameState);
      frameState.controllerTargetingAudit = this.buildControllerTargetingAudit(frameState, intent, { candidate, attentionTarget, relationshipTarget: this.relationshipTarget });
      return;
    }

    const recipe = effective.recipe;
    const domains = recipe.chemistry?.domains ?? [];
    const targetKind = this.getTargetKind(recipe.id, effective, frameState);
    const targetingTuning = frameState.controllerOnboarding?.tuning?.targeting ?? {};
    const lockStrength = Math.max(0, Math.min(1, 1 - effective.distance / (targetingTuning.lockDistance ?? 5.0)));
    const reticleState = effective.distance <= (targetingTuning.absorbStateDistance ?? 2.65)
      ? "absorb_range"
      : effective.distance <= (targetingTuning.assistStateDistance ?? 5.2)
        ? "assist_range"
        : "far";

    const absorbHint = targetKind === "absorbable"
      ? reticleState === "absorb_range"
        ? "hold_absorb_to_receive"
        : "hold_absorb_to_draw_closer"
      : targetKind === "scar_resists" || targetKind.includes("warning")
        ? "unsafe_absorb_resists"
        : "relationship_available";

    const relationshipActive = Boolean(this.relationshipTarget);
    const relationshipPhase = relationshipActive
      ? intent.active ? "engaged" : "releasing"
      : "none";
    const attentionActive = Boolean(attentionTarget);
    const candidateKind = candidate ? this.getTargetKind(candidate.recipe.id, candidate, frameState) : "none";
    const attentionAimDot = Number.isFinite(attentionTarget?.aimDot) ? attentionTarget.aimDot : -1;

    frameState.targeting = {
      pass: "HC-031M",
      active: true,
      targetId: recipe.id,
      targetKind,
      targetCellId: effective.cellId ?? effective.root?.userData?.cellId ?? "none",
      targetLabel: recipe.label ?? recipe.id,
      targetScope: this.getTargetScope(effective),
      worldAttentionSource: effective.worldAttentionSource ?? "none",
      domains,
      distance: effective.distance,
      lockStrength,
      reticleState,
      message: relationshipActive
        ? `${intent.chord}:relationship`
        : attentionActive
          ? `${this.attentionPhase}:attention`
          : `${targetKind}:candidate`,
      absorbHint,
      focusProvider: frameState.targetFocus?.provider ?? "none",
      focusRuleId: frameState.targetFocus?.ruleId ?? "none",
      focusPreferred: frameState.targetFocus?.preferredTargetId ?? "none",
      focusScore: effective.score ?? 0,
      candidateId: candidate?.recipe?.id ?? "none",
      candidateKind,
      candidateScope: this.getTargetScope(candidate),
      candidateDistance: candidate?.distance ?? 0,
      candidateAimDot: candidate?.aimDot ?? -1,
      candidateScore: candidate?.aimOwnershipScore ?? 0,
      candidateContextScore: candidate?.score ?? 0,
      availableTargetCount: this.availableTargetCount,
      attentionActive,
      attentionPhase: this.attentionPhase,
      attentionTargetId: this.attentionTargetId,
      attentionSequence: this.attentionSequence,
      attentionAge: this.attentionAge,
      attentionReason: this.attentionReason,
      attentionAimDot,
      attentionLossGraceRemaining: this.attentionLossGraceRemaining,
      aimOwnershipPolicy: "aim_selects_attention_stabilize_rs_can_redirect_local_relationship",
      verbRetargetingAllowed: false,
      relationshipActive,
      relationshipPhase,
      relationshipTargetId: this.relationshipTargetId,
      relationshipVerb: intent.chord,
      relationshipVerbs: [...intent.verbs],
      relationshipSequence: this.relationshipSequence,
      relationshipAge: this.relationshipAge,
      relationshipReason: this.lastRelationshipReason ?? "none",
      releaseGraceRemaining: this.relationshipReleaseGraceRemaining,
      handoffPolicy: "stabilize_rs_redirect_or_release_then_reacquire",
      visualPolicy: relationshipActive
        ? "diegetic_relationship_glyph"
        : this.attentionPhase === "engaged"
          ? "brief_attention_confirmation"
          : attentionActive
            ? "attention_body_hold"
            : "candidate_body_only",
      idlePointerSuppressed: !relationshipActive,
      regionClearSequence: this.regionClearSequence,
      lastRegionClearReason: this.lastRegionClearReason,
      visualArtifactsCleared: !relationshipActive,
      attentionDistance: attentionTarget?.distance ?? 0,
      attentionScope: this.getTargetScope(attentionTarget),
      relationshipDistance: this.relationshipTarget?.distance ?? 0,
      relationshipScope: this.getTargetScope(this.relationshipTarget)
    };
    frameState.controllerTargetingAudit = this.buildControllerTargetingAudit(frameState, intent, { candidate, attentionTarget, relationshipTarget: this.relationshipTarget });
  }

  getTargetKind(id, target, frameState) {
    const mappedKind = frameState.targetFocus?.targetKinds?.[id];
    if (mappedKind) return mappedKind;

    if (target.localEntityAttention || target.attentionScope === "local_entity") return target.targetKind ?? "living_entity";
    if (target.externalAttention) return target.targetKind ?? "host_territory";
    if (target.isAbsorbable) return "absorbable";
    if (target.isScar) return "scar_resists";
    if (target.isSignal) return "signal_listen";
    return "chem_object";
  }

  createReticle() {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.018, 8, 64), material);
    ring.name = "legacy_target_lock_reticle_hc029a_disabled";
    ring.visible = false;
    this.scene.add(ring);
    this.reticle = ring;
  }

  createSelectedHalo() {
    const material = new THREE.MeshBasicMaterial({
      color: 0xfff0a8,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.01, 8, 64), material);
    halo.name = "attention_engagement_confirmation_hc031m";
    halo.rotation.x = Math.PI / 2;
    halo.visible = false;
    this.scene.add(halo);
    this.selectedHalo = halo;
  }

  createPointerLine() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.linePositions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false
    });

    const line = new THREE.Line(geometry, material);
    line.name = "relationship_axis_line";
    line.visible = false;
    this.scene.add(line);
    this.pointerLine = line;
  }

  createRelationshipGlyphs() {
    const triangleGeometry = new THREE.BufferGeometry();
    triangleGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      -0.22, -0.16, 0,
       0.00,  0.26, 0,
       0.22, -0.16, 0
    ], 3));

    const triangleMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    });

    const root = new THREE.Group();
    root.name = "relationship_direction_glyph_root";
    root.visible = false;
    this.scene.add(root);
    this.relationshipGlyphRoot = root;

    this.pulseTriangle = new THREE.LineLoop(triangleGeometry.clone(), triangleMaterial.clone());
    this.pulseTriangle.name = "relationship_glyph_pulse_outward_triangle";
    root.add(this.pulseTriangle);

    this.absorbTriangle = new THREE.LineLoop(triangleGeometry.clone(), triangleMaterial.clone());
    this.absorbTriangle.name = "relationship_glyph_absorb_inward_triangle";
    this.absorbTriangle.rotation.z = Math.PI;
    root.add(this.absorbTriangle);

    const coherenceGeometry = new THREE.BufferGeometry();
    coherenceGeometry.setAttribute("position", new THREE.BufferAttribute(this.coherencePositions, 3));
    const coherenceMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    this.coherenceBoundary = new THREE.LineLoop(coherenceGeometry, coherenceMaterial);
    this.coherenceBoundary.name = "relationship_glyph_stabilize_coherence_boundary";
    this.coherenceBoundary.visible = false;
    this.scene.add(this.coherenceBoundary);
  }

  updateReticle(frameState) {
    // HC031M keeps the persistent generic lock ring retired. Aim ownership gets only
    // a brief, low-opacity confirmation during ENGAGED; HELD returns to body-only
    // readability until a verb supplies the existing relationship glyphs.
    if (this.reticle) this.reticle.visible = false;
    if (!this.selectedHalo) return;

    const showAttentionConfirm = Boolean(
      this.attentionTarget
      && frameState.targeting?.attentionPhase === "engaged"
      && !frameState.targeting?.relationshipActive
    );
    this.selectedHalo.visible = showAttentionConfirm;
    if (!showAttentionConfirm) return;

    this.getWorldPosition(this.attentionTarget.root, this.tmpTargetPosition);
    this.selectedHalo.position.copy(this.tmpTargetPosition);
    this.selectedHalo.quaternion.copy(this.camera.quaternion);
    const engage01 = clamp01(this.attentionAge / Math.max(0.001, this.attentionHoldPromoteSeconds));
    const scale = 0.82 + engage01 * 0.24;
    this.selectedHalo.scale.setScalar(scale);
    this.selectedHalo.material.color.set(
      this.getTargetColor(frameState.targeting?.targetKind, frameState.targeting?.reticleState)
    );
    this.selectedHalo.material.opacity = 0.14 * (1 - engage01 * 0.45);
  }

  updatePointerLine(frameState) {
    if (!this.pointerLine) return;
    const relationshipActive = Boolean(frameState.targeting?.relationshipActive && this.relationshipTarget);
    this.pointerLine.visible = relationshipActive;
    if (!relationshipActive) return;

    this.getWorldPosition(this.playerRoot, this.tmpPlayerPosition);
    this.getWorldPosition(this.relationshipTarget.root, this.tmpTargetPosition);

    this.linePositions[0] = this.tmpPlayerPosition.x;
    this.linePositions[1] = this.tmpPlayerPosition.y;
    this.linePositions[2] = this.tmpPlayerPosition.z;
    this.linePositions[3] = this.tmpTargetPosition.x;
    this.linePositions[4] = this.tmpTargetPosition.y;
    this.linePositions[5] = this.tmpTargetPosition.z;
    this.pointerLine.geometry.attributes.position.needsUpdate = true;

    const color = this.getTargetColor(frameState.targeting?.targetKind, frameState.targeting?.reticleState);
    this.pointerLine.material.color.set(color);
    this.pointerLine.material.opacity = 0.035 + (frameState.targeting?.lockStrength ?? 0) * 0.085;
  }

  updateRelationshipGlyphs(frameState) {
    const relationshipActive = Boolean(frameState.targeting?.relationshipActive && this.relationshipTarget);
    if (!relationshipActive) {
      if (this.relationshipGlyphRoot) this.relationshipGlyphRoot.visible = false;
      if (this.coherenceBoundary) this.coherenceBoundary.visible = false;
      return;
    }

    const verbs = new Set(frameState.targeting?.relationshipVerbs ?? []);
    const pulseActive = verbs.has("pulse");
    const absorbActive = verbs.has("absorb");
    const stabilizeActive = verbs.has("stabilize");
    const t = frameState.runtimeSeconds ?? 0;
    const color = this.getTargetColor(frameState.targeting?.targetKind, frameState.targeting?.reticleState);

    this.getWorldPosition(this.playerRoot, this.tmpPlayerPosition);
    this.getWorldPosition(this.relationshipTarget.root, this.tmpTargetPosition);
    this.tmpRelationshipDirection.copy(this.tmpTargetPosition).sub(this.tmpPlayerPosition);
    const distance = Math.max(0.001, this.tmpRelationshipDirection.length());
    this.tmpRelationshipDirection.multiplyScalar(1 / distance);
    this.camera.getWorldDirection(this.tmpCameraDirection).normalize();

    this.tmpRight.crossVectors(this.tmpRelationshipDirection, this.tmpCameraDirection);
    if (this.tmpRight.lengthSq() < 0.0001) {
      this.tmpRight.crossVectors(this.camera.up, this.tmpRelationshipDirection);
    }
    this.tmpRight.normalize();
    this.tmpNormal.crossVectors(this.tmpRight, this.tmpRelationshipDirection).normalize();
    this.tmpMatrix.makeBasis(this.tmpRight, this.tmpRelationshipDirection, this.tmpNormal);

    this.relationshipGlyphRoot.visible = pulseActive || absorbActive;
    if (this.relationshipGlyphRoot.visible) {
      this.relationshipGlyphRoot.position.copy(this.tmpPlayerPosition).lerp(this.tmpTargetPosition, 0.58);
      this.relationshipGlyphRoot.quaternion.setFromRotationMatrix(this.tmpMatrix);
      const scale = Math.max(0.68, Math.min(1.28, 0.72 + distance * 0.065));
      this.relationshipGlyphRoot.scale.setScalar(scale);
      this.pulseTriangle.visible = pulseActive;
      this.absorbTriangle.visible = absorbActive;
      const paired = pulseActive && absorbActive;
      this.pulseTriangle.position.x = paired ? -0.11 : 0;
      this.absorbTriangle.position.x = paired ? 0.11 : 0;
      this.pulseTriangle.material.color.set(color);
      this.absorbTriangle.material.color.set(color);
      this.pulseTriangle.material.opacity = 0.20 + clamp01(frameState.targeting?.lockStrength ?? 0) * 0.20;
      this.absorbTriangle.material.opacity = 0.20 + clamp01(frameState.targeting?.lockStrength ?? 0) * 0.20;
    }

    this.coherenceBoundary.visible = stabilizeActive;
    if (stabilizeActive) {
      const instability = clamp01(this.relationshipTarget.recipe?.chemistry?.instabilityRisk ?? 0.18);
      const radius = Math.max(0.42, Math.min(0.92, 0.48 + (this.relationshipTarget.root?.scale?.x ?? 1) * 0.18));
      const positions = this.coherenceBoundary.geometry.attributes.position.array;
      for (let i = 0; i < COHERENCE_SEGMENTS; i += 1) {
        const angle = (i / COHERENCE_SEGMENTS) * Math.PI * 2;
        const distortion = instability * (
          Math.sin(angle * 3 + t * 2.3) * 0.10
          + Math.sin(angle * 5 - t * 1.7) * 0.045
        );
        const r = radius * (1 + distortion);
        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 1] = Math.sin(angle) * r;
        positions[i * 3 + 2] = 0;
      }
      this.coherenceBoundary.geometry.attributes.position.needsUpdate = true;
      this.coherenceBoundary.position.copy(this.tmpTargetPosition);
      this.coherenceBoundary.position.x += Math.sin(t * 2.1) * instability * 0.045;
      this.coherenceBoundary.position.y += Math.cos(t * 1.8) * instability * 0.035;
      this.coherenceBoundary.quaternion.copy(this.camera.quaternion);
      this.coherenceBoundary.material.color.set(color);
      this.coherenceBoundary.material.opacity = 0.12 + (1 - instability * 0.45) * 0.16;
    }
  }

  getTargetColor(kind, state) {
    if (kind === "scar_resists" || kind === "scar_flow_warning") return 0xff728a;
    if (kind === "pressure_current") return 0x7fe8ff;
    if (kind === "path_thread") return 0xffd48a;
    if (kind === "memory_echo") return 0xff9eb0;
    if (kind === "signal_listen") return 0xa8ecff;
    if (kind === "choir_resonance") return 0xaeefff;
    if (kind === "listening_pore") return 0x9dffd9;
    if (kind === "harmonic_wave") return 0xc9b8ff;
    if (kind === "seed_signal_bridge") return 0xffe3a3;
    if (kind === "signal_chorus_hook") return 0xaeefff;
    if (kind === "host_territory") return 0xb9e7d2;
    if (kind === "bloom_growth_path") return 0xff9bd4;
    if (kind === "residue_memory_path") return 0xd2b08a;
    if (kind === "seed_choice_braid") return 0xffe7a8;
    if (kind === "overgrowth_warning") return 0xff758f;
    if (kind === "grave_memory_husk") return 0xd8b6aa;
    if (kind === "grave_silt_trace") return 0xc8b58f;
    if (kind === "grave_scar_lock") return 0xff7b8e;
    if (kind === "grave_inheritance_seed") return 0xffd6a1;
    if (kind === "seam_scar_thread") return 0xffb8a8;
    if (kind === "seam_residue_lattice") return 0xd6bf91;
    if (kind === "seam_echo_imprint") return 0xd8c5ff;
    if (kind === "seam_closed_suture") return 0xffe1ae;
    if (kind === "absorbable" && state === "absorb_range") return 0xfff0a8;
    if (kind === "absorbable") return 0xffd494;
    return 0xffffff;
  }
}
