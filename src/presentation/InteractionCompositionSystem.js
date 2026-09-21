/**
 * HC027E / HC027F — Consequence Rhythm + Traversal Inquiry
 *
 * Presentation coordinator only. It reads existing interaction, route, sensory,
 * Core Work and verb truth and decides which already-existing layer should be
 * visually dominant for the current beat.
 *
 * It owns no target, range, verb, route, chemistry, progression, completion,
 * movement or collision rules.
 */
export class InteractionCompositionSystem {
  constructor({ frameState }) {
    this.frameState = frameState;
    this.strength = 0;
    this.releaseAge = 999;
    this.lastTargetId = "none";
    this.lastVerb = "none";

    this.lastRouteSignature = "none";
    this.routeChangeAge = 999;
    this.consequenceAge = 999;
    this.consequenceHoldSeconds = 0.92;
    this.consequenceKind = "none";
    this.consequenceSource = "none";
    this.consequenceEventCount = 0;
    this.consequenceEventId = "none";
    this.quietAge = 0;
    this.quietTravelAge = 0;
    this.lastRhythmBeat = "observe";

    this.lastSensoryReturnCount = 0;
    this.lastAbsorbedObjects = 0;
    this.stabilizeLockLatched = false;
    this.lastCoreWorkEvent = "none";

    // HC027L — convergence telemetry lives inside the existing presentation owner.
    // It measures the age of the last meaningful change and creates only presentation
    // support (world re-emergence / quiet spatial breathing), never objectives or mechanics.
    this.meaningfulChangeAge = 0;
    this.meaningfulEventCount = 0;
    this.lastMeaningfulKind = "boot";
    this.reorientationAge = 999;
    this.wasConsequenceHold = false;
    this.lastInteractionActive = false;
    this.lastNextQuestionId = "none";

    // HC027L1 — rhythm compression distinguishes visual activity from semantic
    // change. A burst of returns from one Pulse gets one presentation turn, and
    // repeat sensing only resets semantic stagnation when it resolves new structure.
    this.lastPulseConsequenceEventId = -1;
    this.reorientationDurationSeconds = 2.8;
    this.semanticChangeAge = 0;
    this.lastSemanticSignature = "none";
    this.semanticRepeatCount = 0;
  }

  recordMeaningful(kind) {
    this.meaningfulChangeAge = 0;
    this.meaningfulEventCount += 1;
    this.lastMeaningfulKind = kind;
  }

  triggerConsequence(kind, source, holdSeconds, eventId = "none", reorientationSeconds = 2.8) {
    this.consequenceAge = 0;
    this.consequenceHoldSeconds = holdSeconds;
    this.consequenceKind = kind;
    this.consequenceSource = source;
    this.consequenceEventCount += 1;
    this.consequenceEventId = `${this.consequenceEventCount}:${eventId}`;
    this.reorientationDurationSeconds = Math.max(2.4, Math.min(5.2, reorientationSeconds));
    this.recordMeaningful(`consequence:${kind}`);
  }

  recordSemanticChange(signature) {
    if (!signature || signature === "none") return;
    if (signature === this.lastSemanticSignature) {
      this.semanticRepeatCount += 1;
      return;
    }
    this.lastSemanticSignature = signature;
    this.semanticRepeatCount = 0;
    this.semanticChangeAge = 0;
  }

  update(dt, frameState) {
    const assist = frameState.interactionAssist ?? {};
    const bond = frameState.bondState ?? {};
    const input = frameState.input ?? {};
    const kinematics = frameState.playerKinematics ?? {};
    const sensory = frameState.coreSensoryResponse ?? {};
    const ambientMaterial = frameState.ambientMaterial ?? {};
    const inquiry = ambientMaterial.sonarInquiry ?? {};
    const signalPlainNextQuestion = frameState.signalPlainEcology?.consequenceNextQuestion ?? {};
    const nextQuestionPrimary = signalPlainNextQuestion.primary ?? null;
    const nextQuestionActive = Boolean(signalPlainNextQuestion.active && nextQuestionPrimary?.active);
    const nextQuestionStrength = Math.max(0, Math.min(1, nextQuestionPrimary?.strength ?? 0));
    const nearestAnswerMemory = sensory.nearestAnswerMemory ?? {};
    const chemState = frameState.chemObjectState ?? {};
    const verbPhysicalization = frameState.verbPhysicalization ?? {};
    const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
    const coreWork = frameState.coreWorkManipulation ?? {};
    const coreWorkActive = Boolean(inspection.active && inspection.coreWorkActive);
    const coreWorkHeld = Boolean(coreWorkActive && coreWork.held);

    const targetId = assist.active && assist.objectId && assist.objectId !== "none"
      ? assist.objectId
      : bond.objectId && bond.objectId !== "none"
        ? bond.objectId
        : "none";

    const pulseTraveling = Boolean(sensory.active && !input.pulseHeld);
    const pulseActive = Boolean(input.pulsePressed || input.pulseHeld || pulseTraveling);
    const pulseCharging = Boolean(input.pulseHeld);
    const pulseCharge01 = Math.max(0, Math.min(1, input.pulseCharge01 ?? 0));
    const sensoryRecovery = Math.max(0, Math.min(1, sensory.sensorySaturation01 ?? 0));
    const absorbActive = Boolean(input.absorbHeld && bond.objectId && bond.objectId !== "none");
    const stabilizeActive = Boolean(input.stabilizeHeld || input.resonanceHeld);
    const verb = absorbActive ? "absorb" : stabilizeActive ? "stabilize" : pulseActive ? "pulse" : "none";
    const targetActive = targetId !== "none";
    const interactionActive = targetActive || verb !== "none" || coreWorkActive;

    const grave = frameState.graveMemoryRoute ?? {};
    const vascular = frameState.vascularRhythmRoute ?? {};
    const silt = frameState.siltPressureRoute ?? {};
    const route = grave.active ? grave : vascular.active ? vascular : silt.active ? silt : null;
    const routeName = grave.active ? "grave" : vascular.active ? "vascular" : silt.active ? "silt" : "host";
    const routeStage = route?.stage ?? route?.status ?? "none";
    const routeLastInteraction = route?.lastInteraction ?? "none";
    const routeSignature = `${routeName}|${routeStage}|${routeLastInteraction}|${Boolean(route?.completed)}|${Boolean(route?.returnFoldReady)}`;

    this.routeChangeAge += dt;
    this.consequenceAge += dt;
    this.meaningfulChangeAge += dt;
    this.semanticChangeAge += dt;
    this.reorientationAge += dt;

    if (routeSignature !== this.lastRouteSignature) {
      if (this.lastRouteSignature !== "none") {
        this.triggerConsequence("route_state_change", routeName, 0.92, routeSignature, 3.2);
        this.recordSemanticChange(`route:${routeSignature}`);
      }
      this.lastRouteSignature = routeSignature;
      this.routeChangeAge = 0;
    }

    // Consequences include the three physical verb resolutions, not only route-state mutation.
    // These are read-only edges from existing owners.
    const sensoryReturnCount = Number.isFinite(sensory.returnCount) ? sensory.returnCount : 0;
    const freshReturns = sensory.newReturns ?? [];
    if (freshReturns.length > 0 || sensoryReturnCount > this.lastSensoryReturnCount) {
      const pulseEventId = Number.isFinite(sensory.pulseEventId) ? sensory.pulseEventId : 0;
      const strongestReturn = freshReturns.find((item) => item.reachClass === "deep_structural") ?? freshReturns[0];
      const semanticSignature = strongestReturn
        ? `${strongestReturn.id}:${strongestReturn.reachClass}:${strongestReturn.resolutionStage ?? 1}:${strongestReturn.structuralInterpretation ?? "presence"}`
        : `pulse:${pulseEventId}:returns:${sensoryReturnCount}`;
      this.recordSemanticChange(semanticSignature);

      // One Pulse can return several echoes a few frames apart. They still render and
      // sound individually, but HC027L1 gives the burst one consequence/reorientation
      // turn instead of repeatedly restarting the presentation hold.
      if (pulseEventId !== this.lastPulseConsequenceEventId) {
        this.lastPulseConsequenceEventId = pulseEventId;
        const deepOrCommitted = strongestReturn?.reachClass === "deep_structural" || strongestReturn?.pulseMode === "charged";
        const resolutionStage = Math.max(1, strongestReturn?.resolutionStage ?? 1);
        const reorientationSeconds = deepOrCommitted
          ? 4.0 + Math.max(0, resolutionStage - 1) * 0.35
          : 3.15;
        this.triggerConsequence(
          "pulse_return",
          strongestReturn?.responseClass ?? "sonar_answer",
          deepOrCommitted ? 1.22 : 1.08,
          `${pulseEventId}:${sensoryReturnCount}`,
          reorientationSeconds
        );
      }
    }
    this.lastSensoryReturnCount = Math.max(this.lastSensoryReturnCount, sensoryReturnCount);

    const absorbedObjects = Number.isFinite(chemState.absorbedObjects) ? chemState.absorbedObjects : 0;
    if (absorbedObjects > this.lastAbsorbedObjects) {
      this.triggerConsequence("absorb_capture", "metabolic_capture", 1.24, absorbedObjects, 3.55);
      this.recordSemanticChange(`absorb_capture:${absorbedObjects}`);
    }
    this.lastAbsorbedObjects = Math.max(this.lastAbsorbedObjects, absorbedObjects);

    const stabilizeProgress = Number.isFinite(verbPhysicalization.stabilizeProgress)
      ? verbPhysicalization.stabilizeProgress
      : 0;
    if (stabilizeActive && stabilizeProgress >= 0.82 && !this.stabilizeLockLatched) {
      this.stabilizeLockLatched = true;
      this.triggerConsequence("stabilize_lock", "coherence_lock", 1.34, Math.round(stabilizeProgress * 100), 4.05);
      this.recordSemanticChange(`stabilize_lock:${Math.round(stabilizeProgress * 10)}`);
    }
    if (!stabilizeActive || stabilizeProgress < 0.35) this.stabilizeLockLatched = false;

    const coreWorkEvent = coreWork.lastEvent ?? "none";
    if (
      coreWorkActive
      && coreWorkEvent !== this.lastCoreWorkEvent
      && /(grabbed|placed|released_piece)/.test(coreWorkEvent)
    ) {
      this.triggerConsequence("core_work_commit", "retained_anatomy", 0.74, coreWorkEvent, 3.0);
      this.recordSemanticChange(`core_work:${coreWorkEvent}`);
    }
    this.lastCoreWorkEvent = coreWorkEvent;

    const consequenceHold = this.consequenceAge < this.consequenceHoldSeconds;

    if (interactionActive && !this.lastInteractionActive) {
      this.recordMeaningful(verb !== "none" ? `verb:${verb}` : "local_focus");
    }
    this.lastInteractionActive = interactionActive;

    if (this.wasConsequenceHold && !consequenceHold) {
      this.reorientationAge = 0;
      this.recordMeaningful("consequence_settled");
    }
    this.wasConsequenceHold = consequenceHold;

    const nextQuestionId = nextQuestionActive ? (nextQuestionPrimary?.id ?? "none") : "none";
    if (nextQuestionId !== "none" && nextQuestionId !== this.lastNextQuestionId) {
      this.reorientationAge = 0;
      this.recordMeaningful("linked_condition_revealed");
      this.recordSemanticChange(`linked_condition:${nextQuestionId}`);
    }
    this.lastNextQuestionId = nextQuestionId;

    if (interactionActive) {
      this.releaseAge = 0;
      this.quietAge = 0;
      this.quietTravelAge = 0;
      this.lastTargetId = targetId;
      if (verb !== "none") this.lastVerb = verb;
    } else {
      this.releaseAge += dt;
      if (consequenceHold) {
        this.quietAge = 0;
        this.quietTravelAge = 0;
      } else {
        this.quietAge += dt;
      }
    }

    const targetStrength = interactionActive
      ? 1
      : consequenceHold
        ? Math.max(0.26, 1 - this.consequenceAge / Math.max(0.35, this.consequenceHoldSeconds + 0.28))
        : Math.max(0, 1 - this.releaseAge / 0.58);

    const rate = targetStrength > this.strength ? 9.0 : 4.8;
    this.strength += (targetStrength - this.strength) * (1 - Math.exp(-dt * rate));

    const speed = Number.isFinite(kinematics.speed) ? kinematics.speed : 0;
    const moving = speed > 0.16;
    if (moving && !interactionActive && !consequenceHold) {
      this.quietTravelAge += dt;
    } else if (!moving) {
      this.quietTravelAge = Math.max(0, this.quietTravelAge - dt * 1.8);
    }

    // HC027L — quiet traversal reveals existing ecology in gentle spatial breaths
    // instead of sitting at one flat ambience level. Extended low-change travel can
    // strengthen this existing-world read, but it never spawns content or points a route.
    const quietBaseLift = Math.max(0, Math.min(0.20, (this.quietTravelAge - 0.90) / 2.50 * 0.20));
    const quietBreath = this.quietTravelAge > 3.2
      ? (0.5 + Math.sin((this.quietTravelAge - 3.2) * 1.18) * 0.5) * 0.04
      : 0;
    const quietWorldNoticeLift = Math.min(0.24, quietBaseLift + quietBreath);
    const linkedQuestionWorldNoticeLift = nextQuestionActive ? 0.14 + nextQuestionStrength * 0.10 : 0;
    const reorientationStrength = Math.max(0, Math.min(1, 1 - this.reorientationAge / this.reorientationDurationSeconds));
    const reorientationWorldNoticeLift = reorientationStrength * 0.18;
    const extendedQuietSupport = moving && !interactionActive && !consequenceHold
      ? Math.max(0, Math.min(0.24, (this.meaningfulChangeAge - 7.5) / 12.5 * 0.24))
      : 0;
    const worldNoticeLift = coreWorkActive
      ? 0
      : Math.max(quietWorldNoticeLift, linkedQuestionWorldNoticeLift, reorientationWorldNoticeLift, extendedQuietSupport);
    const deadTimeRisk = Boolean(moving && !interactionActive && !consequenceHold && this.meaningfulChangeAge >= 18);
    const semanticStagnationRisk = Boolean(moving && !interactionActive && this.semanticChangeAge >= 24);

    const transitionReady = Boolean(route?.returnFoldReady || route?.completed);
    const answerMemoryActive = Boolean((sensory.answerMemoryCount ?? 0) > 0 && nearestAnswerMemory?.id);
    const answerApproach = Math.max(0, Math.min(1, nearestAnswerMemory?.approachIntensity ?? 0));
    const answerReadReady = Boolean(nearestAnswerMemory?.readReady);
    const answerReadActive = Boolean(inquiry.readTriggered || (inquiry.readReady && inquiry.approachIntensity > 0.7));
    const discovery = Boolean(
      !interactionActive
      && !consequenceHold
      && !transitionReady
      && (this.routeChangeAge < 1.05 || worldNoticeLift > 0.16 || answerReadReady || nextQuestionActive)
    );

    let rhythmBeat = "observe";
    if (coreWorkActive) rhythmBeat = "manipulate";
    else if (interactionActive && verb !== "none") rhythmBeat = "manipulate";
    else if (interactionActive && targetActive) rhythmBeat = "observe";
    else if (consequenceHold) rhythmBeat = "consequence";
    else if (transitionReady) rhythmBeat = "transition";
    else if (nextQuestionActive) rhythmBeat = "discover";
    else if (answerReadActive) rhythmBeat = "discover";
    else if (reorientationStrength > 0.10) rhythmBeat = "reorient";
    else if (moving && answerMemoryActive && answerApproach > 0.12) rhythmBeat = "follow_answer";
    else if (discovery) rhythmBeat = "discover";
    else if (moving) rhythmBeat = "move";
    else if (this.quietAge > 1.05) rhythmBeat = "quiet";

    this.lastRhythmBeat = rhythmBeat;

    const phase = coreWorkActive
      ? "core_work"
      : this.strength < 0.035
        ? "anatomy"
        : verb !== "none"
          ? "verb"
          : targetActive
            ? "target"
            : consequenceHold
              ? "consequence_release"
              : "anatomy";

    const quietFactor = rhythmBeat === "quiet" ? 1 : 0;
    const consequenceFactor = rhythmBeat === "consequence" ? 1 : 0;
    const transitionFactor = rhythmBeat === "transition" ? 1 : 0;

    const verbHierarchySuppression = pulseCharging
      ? 0.18 + pulseCharge01 * 0.34
      : absorbActive
        ? Math.min(0.24, (verbPhysicalization.absorbCommitment ?? 0) * 0.24)
        : stabilizeActive
          ? Math.min(0.28, stabilizeProgress * 0.28)
          : sensoryRecovery * 0.12;
    const ambientSuppression = coreWorkActive
      ? (coreWorkHeld ? 0.84 : 0.76)
      : Math.min(
        pulseCharging ? 0.82 : 0.70,
        Math.max(0,
          0.58 * this.strength
            + consequenceFactor * 0.08
            + verbHierarchySuppression
            - quietFactor * 0.18
            - worldNoticeLift * 0.62
            - reorientationStrength * 0.12
        )
      );

    frameState.interactionComposition = {
      pass: "HC-027K",
      rhythmLockPass: "HC-027L",
      inquiryPass: "HC-027F", // inherited contract token: pass: "HC-027F"
      active: this.strength > 0.035 || coreWorkActive,
      phase,
      strength: this.strength,
      targetId: targetActive ? targetId : this.lastTargetId,
      activeVerb: verb !== "none" ? verb : this.lastVerb,
      verbHierarchy: {
        law: "one_primary_one_or_two_secondary_everything_else_yields",
        primary: pulseCharging
          ? "core_charge"
          : input.pulsePressed
            ? "pulse_release"
            : pulseTraveling
              ? "pulse_wave"
              : absorbActive
              ? "absorb_intake"
              : stabilizeActive
                ? "stabilize_coherence"
                : consequenceHold
                  ? "host_consequence"
                  : nextQuestionActive
                    ? "linked_host_condition"
                    : answerMemoryActive
                      ? "host_answer"
                      : "world",
        secondary: pulseCharging || pulseTraveling
          ? "intended_host_volume"
          : nextQuestionActive
            ? "source_consequence_relationship"
            : answerMemoryActive
              ? "anchored_answer_surface"
              : targetActive
                ? "interaction_material"
                : "local_host",
        pulseCharge01,
        sensoryRecovery,
        guideMustYield: pulseCharging || pulseTraveling || absorbActive || stabilizeActive || nextQuestionActive,
        unrelatedEffectsMustYield: pulseCharging || pulseTraveling || sensoryRecovery > 0.15 || nextQuestionActive,
        consequenceNextQuestionActive: nextQuestionActive,
        consequenceNextQuestionStrength: nextQuestionStrength,
        consequenceNextQuestionRelation: nextQuestionPrimary?.relation ?? "none"
      },
      coreWorkFocus: {
        active: coreWorkActive,
        held: coreWorkHeld,
        selectedPieceId: coreWork.selectedPieceId ?? "none",
        selectedPieceLabel: coreWork.selectedPieceLabel ?? "none",
        hierarchyRule: "selected_anatomy_first_surrounding_systems_yield"
      },
      cameraBreathingRoom: coreWorkActive
        ? 0.62
        : pulseCharging
          ? 0.62 + pulseCharge01 * 0.16
          : pulseTraveling
            ? 0.58
            : nextQuestionActive
              ? 0.56
              : reorientationStrength > 0.10
                ? 0.50
                : 0.44 * this.strength,
      companionYield: coreWorkActive
        ? 0.86
        : Math.min(pulseCharging ? 0.90 : pulseTraveling ? 0.84 : 0.78,
          0.62 * this.strength + consequenceFactor * 0.12 + verbHierarchySuppression * 0.65 + (pulseTraveling ? 0.10 : 0) + (nextQuestionActive ? 0.18 * nextQuestionStrength : 0)),
      ambientSuppression,
      ambientRhythmScale: coreWorkActive
        ? 0.72
        : pulseCharging
          ? 0.70 - pulseCharge01 * 0.06
        : rhythmBeat === "quiet"
          ? 0.80 + quietBreath * 0.65
          : rhythmBeat === "reorient"
            ? 1.04 + reorientationStrength * 0.10
          : rhythmBeat === "move"
            ? 1.0 + worldNoticeLift * 0.35
            : rhythmBeat === "follow_answer"
              ? 1.08 + answerApproach * 0.12
            : rhythmBeat === "discover"
              ? 1.08 + worldNoticeLift * 0.25
              : rhythmBeat === "transition"
                ? 0.84
                : 0.92,
      worldNoticeLift,
      effectSuppression: coreWorkActive
        ? (coreWorkHeld ? 0.38 : 0.30)
        : phase === "verb" ? 0 : 0.22 * this.strength,
      releaseProgress: Math.min(1, this.releaseAge / 0.58),
      consequence: {
        active: consequenceHold,
        kind: this.consequenceKind,
        source: this.consequenceSource,
        age: Number(this.consequenceAge.toFixed(3)),
        holdSeconds: this.consequenceHoldSeconds,
        eventCount: this.consequenceEventCount,
        eventId: this.consequenceEventId,
        rule: "existing_action_resolves_then_world_answer_gets_readable_time"
      },
      consequenceNextQuestion: {
        pass: "HC-027K",
        active: nextQuestionActive,
        relationId: nextQuestionPrimary?.id ?? "none",
        relation: nextQuestionPrimary?.relation ?? "none",
        sourceNodeNumber: nextQuestionPrimary?.sourceNodeNumber ?? 0,
        targetNodeNumber: nextQuestionPrimary?.targetNodeNumber ?? 0,
        strength: Number(nextQuestionStrength.toFixed(3)),
        hierarchyRule: "changed_host_condition_yields_attention_to_related_existing_condition",
        createsWaypoint: false,
        createsObjective: false,
        routeAuthority: false,
        progressionAuthority: false
      },
      rhythm: {
        beat: rhythmBeat,
        route: routeName,
        routeStage,
        consequenceHold,
        consequenceAge: this.consequenceAge,
        quietAge: this.quietAge,
        quietTravelAge: this.quietTravelAge,
        worldNoticeLift,
        sequence: [
          "observe",
          "move",
          "manipulate",
          "consequence",
          "quiet",
          "reorient",
          "follow_answer",
          "discover",
          "transition"
        ],
        progressionAuthority: false,
        objectiveAuthority: false,
        routeAuthority: false
      },
      rhythmLock: {
        pass: "HC-027L",
        targetSessionSeconds: 480,
        meaningfulChangeAge: Number(this.meaningfulChangeAge.toFixed(2)),
        meaningfulEventCount: this.meaningfulEventCount,
        lastMeaningfulKind: this.lastMeaningfulKind,
        reorientationActive: reorientationStrength > 0.10,
        reorientationStrength: Number(reorientationStrength.toFixed(3)),
        reorientationDurationSeconds: Number(this.reorientationDurationSeconds.toFixed(2)),
        pulseReturnBurstCompressed: true,
        semanticChangeAge: Number(this.semanticChangeAge.toFixed(2)),
        semanticRepeatCount: this.semanticRepeatCount,
        semanticStagnationRisk,
        semanticStagnationMeansMovementWithoutNewInterpretation: true,
        deadTimeRisk,
        softSpatialSupportActive: extendedQuietSupport > 0.01,
        softSpatialSupportBeginsAfterSeconds: 7.5,
        deadTimeReviewBeginsAfterSeconds: 18,
        desiredMaximumUnchangedWindowSeconds: 60,
        hardReviewWindowSeconds: 90,
        quietObservationCountsAsMeaningfulWhenSpatialUnderstandingChanges: true,
        repeatedObservationResolutionOwner: "CoreSensoryResponseSystem",
        repeatedObservationEscalatesInformationNotReward: true,
        addsMechanics: false,
        createsObjective: false,
        createsWaypoint: false,
        changesProgression: false
      },
      inquiry: {
        active: answerMemoryActive,
        memoryId: nearestAnswerMemory?.id ?? "none",
        responseClass: nearestAnswerMemory?.responseClass ?? "none",
        distance: nearestAnswerMemory?.currentDistance ?? 0,
        approachIntensity: answerApproach,
        readReady: answerReadReady,
        readTriggered: Boolean(inquiry.readTriggered),
        rule: "probe_answer_approach_read_without_route_authority",
        createsWaypoint: false,
        createsTarget: false,
        objectiveAuthority: false,
        routeAuthority: false,
        progressionAuthority: false
      },
      authority: "presentation_only",
      hierarchy: phase === "core_work"
        ? "core_work_selected_anatomy_dominant"
        : phase === "anatomy"
          ? "anatomy_dominant"
          : phase === "target"
            ? "target_dominant"
            : phase === "verb"
              ? "verb_response_dominant"
              : "environmental_consequence_then_anatomy",
      transitionPresentation: transitionFactor > 0
        ? "route_consequence_visible_before_return"
        : "none"
    };
  }
}
