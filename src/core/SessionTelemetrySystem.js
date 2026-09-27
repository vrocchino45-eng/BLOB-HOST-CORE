const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, digits = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(digits));

/**
 * HC028B1 — Transition Resolution + Convergence Reachability telemetry extension.
 *
 * Read-only observer. It records player-observable events, sparse movement samples,
 * and periodic Core snapshots. It owns no gameplay state and never feeds telemetry
 * back into simulation, progression, targeting, movement, chemistry, or presentation.
 *
 * The schema deliberately separates perceptual payload from developer truth so the
 * later AI perceptual-firewall milestone can consume the former without semantic IDs.
 */
export class SessionTelemetrySystem {
  constructor({ frameState, baselineId = "HC027L1_GOLDEN_INQUIRY_BASELINE_01", monotonicNowMs = null } = {}) {
    if (!frameState) throw new Error("[SessionTelemetrySystem] frameState is required.");
    this.frameState = frameState;
    this.baselineId = baselineId;
    this.schemaVersion = "blob.session.telemetry.v1.35";
    this.sessionId = this.makeSessionId();
    this.startedAtEpochMs = Date.now();
    this.startedAtIso = new Date(this.startedAtEpochMs).toISOString();
    this._monotonicNowMs = monotonicNowMs ?? (() => {
      if (typeof performance !== "undefined" && typeof performance.now === "function") return performance.now();
      return Date.now();
    });
    this.startedAtWallMs = this.nowMs();
    this.startedAtRuntime = frameState.runtimeSeconds ?? 0;
    this.events = [];
    this.movementSamples = [];
    this.coreSnapshots = [];
    this.sourceAliasByInternalId = new Map();
    this.sourceInternalByAlias = new Map();
    this.semanticAliasByInternalId = new Map();
    this.semanticInternalByAlias = new Map();
    this.sequence = 0;
    this.lastMovementSampleAt = -999;
    this.lastCoreSnapshotAt = -999;
    this.lastPersistAtWall = -999;
    this.lastCellId = frameState.activeCellId ?? "none";
    this.lastCandidateId = frameState.targeting?.candidateId ?? "none";
    this.lastAttentionTargetId = frameState.targeting?.attentionTargetId ?? "none";
    this.lastAttentionPhase = frameState.targeting?.attentionPhase ?? "none";
    this.lastRelationshipTargetId = frameState.targeting?.relationshipTargetId ?? "none";
    // Compatibility alias: attention.target.changed remains verb-relationship scoped.
    // HC031M adds aim-owned attention.owner/phase events alongside it.
    this.lastTargetId = this.lastRelationshipTargetId;
    this.lastTopologyId = frameState.corePerformance?.topologyId ?? "forming_topology";
    this.lastRelationshipEventId = "none";
    this.lastSemanticStagnationRisk = false;
    this.lastCoreWorldResonanceState = "inactive";
    this.lastCoreTopologyResonanceMode = frameState.coreTopologyResonance?.mode ?? "forming";
    this.lastCoreTopologyHandlingMode = frameState.coreTopologyEnvironmentalHandling?.handling?.mode ?? "neutral";
    this.lastCoreTopologyVerbCharacterMode = frameState.coreTopologyVerbCharacter?.mode ?? "forming";
    this.lastEntityEcologyResonanceMode = frameState.entityEcologyResonance?.mode ?? "inactive";
    this.lastEntityRelationshipGrammarKey = "inactive";
    this.lastEntityReciprocalMemoryCommitCount = frameState.entityReciprocalMemory?.commitCount ?? 0;
    this.lastEntityReciprocalBehaviorKey = "inactive";
    this.lastEntityLocalMatterCouplingKey = "inactive";
    this.lastEntityEcologicalResidueKey = "inactive";
    this.lastEntityResidueRecognitionKey = "inactive";
    this.lastEntityEcologicalCrossInfluenceKey = "inactive";
    this.lastCoreVerbEngineChord = "idle";
    this.lastVerbPhysicalGrammarMode = frameState.verbPhysicalGrammar?.mode ?? "idle";
    this.lastReactiveStateEventId = 0;
    this.lastReturnRegionKey = "inactive";
    this.lastRuptureHarvestEventId = 0;
    this.lastRuptureConsequenceEventId = 0;
    this.lastDeliberateCommitmentEventId = "none";
    this.lastDebugPlatformSlot = 0;
    this.lastAttachmentActive = Boolean(frameState.playerAttachment?.active);
    this.lastAttachmentState = frameState.playerAttachment?.state ?? "free";
    this.lastAttachmentReacquireBlocked = Boolean(frameState.playerAttachment?.reacquireBlocked);
    this.lastAttachmentContactGapActive = Boolean(frameState.playerAttachment?.contactGapActive);
    this.lastAttachmentOwnerSurfaceId = frameState.playerAttachment?.ownerSurfaceId ?? "none";
    this.lastAttachmentSupportIdentityTransferCount = frameState.playerAttachment?.supportIdentityTransferCount ?? 0;
    this.lastPulseEventId = 0;
    this.prevHeld = { absorb: false, stabilize: false, boost: false };
    this.holdStartedAt = { absorb: null, stabilize: null, boost: null };
    this.lastResolutionByAlias = new Map();
    this.seenSourceAliases = new Set();
    this.informationGainCount = 0;
    this.informationGainScore = 0;
    this.lastInformationGainWallT = 0;
    this.lastInformationGainSimT = 0;
    this.recentEffort = [];
    this.semanticChurnActive = false;
    this.semanticChurnEntryCount = 0;
    this.lastSemanticChurnScore = 0;
    this.lastSemanticChurnContext = null;
    this.redundantMaxResolutionReturns = 0;
    this.pendingAttempts = [];
    this.attemptSequence = 0;
    this.noGainAttempts = 0;
    this.lastInfoGainEventSeq = 0;
    this.lastPersistStatus = "not_attempted";
    this.manualMarkerCount = 0;
    this.lastRouteResolved = { vascular: false, silt: false };
    this.lastTransitionAvailable = { vascular: false, silt: false };
    this.progressBlockCandidateSince = null;
    this.progressBlockLastDistance = null;
    this.progressBlockEventActive = false;
    this.summaryCache = null;
    this.summaryDirty = true;
    // HC030A: 15–20 minute interaction tests were overflowing the old 5k ring
    // and silently dropping the opening minutes. Keep a bounded buffer, but large
    // enough to retain one focused controller session at current event density.
    this.maxEvents = 16000;
    this.maxMovementSamples = 7200;
    this.maxCoreSnapshots = 720;

    // HC031N1 — read-only physical-language causal continuity repair. This does not
    // feed back into gameplay. It keeps the HC031N chain observer alive through
    // natural attention release after a verb/world answer, arms chains at meaningful
    // Host contact, requires post-verb evidence before declaring a world answer,
    // and resolves stable Host-anatomy identity above micro support IDs.
    this.physicalLanguageValidation = {
      pass: "HC-031N1",
      sequence: 0,
      activeChain: null,
      completedCount: 0,
      abandonedCount: 0,
      bestStageIndex: 0,
      lastWallT: 0,
      travelHoldSeconds: 0,
      lastAttachmentActive: Boolean(frameState.playerAttachment?.active),
      lastOwnerId: frameState.targeting?.attentionTargetId ?? "none",
      lastObservedSurfaceId: frameState.playerAttachment?.ownerSurfaceId ?? "none",
      lastObservedSurfaceIdentity: null,
      previousEvidenceSnapshot: null,
      timeoutSeconds: 45,
      travelConfirmSeconds: 0.18,
      travelSpeedThreshold: 0.12
    };
    this.movementSampleIntervalSeconds = 0.5;
    this.coreSnapshotIntervalSeconds = 10;
    this.persistIntervalSeconds = 8;
    this.boundPageHide = () => this.persist(true);
    this.boundKeyDown = (event) => this.onKeyDown(event);
  }

  init() {
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("keydown", this.boundKeyDown);
      window.addEventListener("pagehide", this.boundPageHide);
      this.installBrowserApi();
    }
    this.record("session.started", "internal", {
      percept: {
        baselineId: this.baselineId,
        buildId: this.frameState.buildId ?? "unknown",
        buildLabel: this.frameState.buildLabel ?? "unknown"
      },
      developer: {
        schemaVersion: this.schemaVersion,
        sourceAuthority: "HC027L1 Golden Inquiry Baseline 01"
      }
    });
    this.captureCoreSnapshot("session_start");
    this.publish(this.frameState);
    this.persist(true);
  }

  update(_dt, frameState = this.frameState) {
    const wallNow = this.wallTime();
    this.observeCell(frameState);
    this.observeRouteResolution(frameState);
    this.observeTarget(frameState);
    this.observeInput(frameState, wallNow);
    this.observeSonar(frameState);
    this.observeConsequence(frameState);
    this.observeRelationship(frameState);
    this.observeRhythm(frameState);
    this.observeCoreWorldResonance(frameState);
    this.observeCoreTopologyResonance(frameState);
    this.observeCoreTopologyEnvironmentalHandling(frameState);
    this.observeCoreTopologyVerbCharacter(frameState);
    this.observeEntityEcologyResonance(frameState);
    this.observeEntityRelationshipGrammar(frameState);
    this.observeEntityReciprocalMemory(frameState);
    this.observeEntityReciprocalBehavior(frameState);
    this.observeEntityLocalMatterCoupling(frameState);
    this.observeEntityEcologicalResidue(frameState);
    this.observeEntityResidueRecognition(frameState);
    this.observeEntityEcologicalCrossInfluence(frameState);
    this.observeCoreVerbEngineCoupling(frameState);
    this.observeVerbPhysicalGrammar(frameState);
    this.observeReactiveStateGrammar(frameState);
    this.observeReturnRegion(frameState);
    this.observeRuptureHarvest(frameState);
    this.observeRuptureConsequence(frameState);
    this.observeDeliberateCommitment(frameState);
    this.observeCoreTopology(frameState);
    this.observeDebugPlatform(frameState);
    this.observeSurfaceDetachment(frameState);
    this.resolvePendingAttempts(wallNow);
    this.observeSemanticChurn(frameState, wallNow);
    this.observePhysicalLanguageValidation(frameState, wallNow);

    if (wallNow - this.lastMovementSampleAt >= this.movementSampleIntervalSeconds) {
      this.lastMovementSampleAt = wallNow;
      this.captureMovementSample(frameState);
    }
    if (wallNow - this.lastCoreSnapshotAt >= this.coreSnapshotIntervalSeconds) {
      this.captureCoreSnapshot("interval");
    }
    if (wallNow - this.lastPersistAtWall >= this.persistIntervalSeconds) {
      this.persist(false);
    }
    this.publish(frameState);
  }

  observeCell(frameState) {
    const cellId = frameState.activeCellId ?? "none";
    if (cellId === this.lastCellId) return;
    const returnedRoute = this.lastCellId === "CELL_VASCULAR_RHYTHM_ROUTE_001"
      ? "vascular_route"
      : this.lastCellId === "CELL_SILT_PRESSURE_ROUTE_001"
        ? "silt_burrow_route"
        : null;
    if (returnedRoute && cellId === "CELL_SIGNAL_CHORUS_NERVE_001") {
      this.record("transition.entered", "perceptual", {
        percept: { route: returnedRoute, destination: this.aliasCell(cellId), activation: "proximity" },
        developer: { fromCellId: this.lastCellId, toCellId: cellId }
      });
    }
    this.record("world.cell.changed", "perceptual", {
      percept: { from: this.aliasCell(this.lastCellId), to: this.aliasCell(cellId) },
      developer: { fromCellId: this.lastCellId, toCellId: cellId }
    });
    this.noteInformationGain("cell_changed", 2.0, { from: this.aliasCell(this.lastCellId), to: this.aliasCell(cellId) });
    this.lastCellId = cellId;
  }

  observeRouteResolution(frameState) {
    const routes = [
      ["vascular", frameState.vascularRhythmRoute ?? {}, "vascular_route"],
      ["silt", frameState.siltPressureRoute ?? {}, "silt_burrow_route"]
    ];
    for (const [key, route, routeId] of routes) {
      const resolved = Boolean(route.completed);
      const available = Boolean(route.returnFoldReady);
      if (resolved && !this.lastRouteResolved[key]) {
        this.record("route.resolved", "perceptual", {
          percept: { route: routeId, releaseState: route.stage ?? "resolved" },
          developer: { routeId, runtimeCellId: route.runtimeCellId ?? "none" }
        });
        this.record("route.release.started", "perceptual", {
          percept: { route: routeId, returnReadable: available },
          developer: { routeId, boundaryBehavior: this.frameState.physicalFeel?.boundaryBehavior ?? "unknown" }
        });
      }
      if (available && !this.lastTransitionAvailable[key]) {
        this.record("transition.available", "perceptual", {
          percept: { route: routeId, activation: "enter_return_fold" },
          developer: { routeId, returnFoldDistance: round(route.returnFoldDistance ?? 0), interactionRange: round(route.returnFoldInteractionRange ?? 0) }
        });
      }
      this.lastRouteResolved[key] = resolved;
      this.lastTransitionAvailable[key] = available;
    }
  }

  observeTarget(frameState) {
    const targeting = frameState.targeting ?? {};
    const candidateId = targeting.candidateId ?? "none";
    if (candidateId !== this.lastCandidateId) {
      this.record("attention.candidate.changed", "analysis", {
        percept: {
          from: this.aliasSource(this.lastCandidateId),
          to: this.aliasSource(candidateId),
          candidateActive: candidateId !== "none"
        },
        developer: {
          fromCandidateId: this.lastCandidateId,
          toCandidateId: candidateId,
          aimDot: round(targeting.candidateAimDot ?? -1),
          score: round(targeting.candidateScore ?? 0)
        }
      });
      this.lastCandidateId = candidateId;
    }

    const attentionTargetId = targeting.attentionTargetId ?? "none";
    const attentionPhase = targeting.attentionPhase ?? "none";
    if (attentionTargetId !== this.lastAttentionTargetId) {
      this.record("attention.owner.changed", "perceptual", {
        percept: {
          from: this.aliasSource(this.lastAttentionTargetId),
          to: this.aliasSource(attentionTargetId),
          active: attentionTargetId !== "none",
          phase: attentionPhase
        },
        developer: {
          fromAttentionTargetId: this.lastAttentionTargetId,
          toAttentionTargetId: attentionTargetId,
          attentionSequence: targeting.attentionSequence ?? 0,
          attentionReason: targeting.attentionReason ?? "none",
          attentionAimDot: round(targeting.attentionAimDot ?? -1),
          candidateId,
          aimOwnershipPolicy: targeting.aimOwnershipPolicy ?? "unknown",
          verbRetargetingAllowed: Boolean(targeting.verbRetargetingAllowed)
        }
      });
      this.lastAttentionTargetId = attentionTargetId;
    }

    if (attentionPhase !== this.lastAttentionPhase) {
      this.record("attention.phase.changed", "analysis", {
        percept: {
          from: this.lastAttentionPhase,
          to: attentionPhase,
          target: this.aliasSource(attentionTargetId)
        },
        developer: {
          attentionTargetId,
          attentionReason: targeting.attentionReason ?? "none",
          attentionAge: round(targeting.attentionAge ?? 0),
          lossGraceRemaining: round(targeting.attentionLossGraceRemaining ?? 0),
          candidateId,
          availableTargetCount: targeting.availableTargetCount ?? 0
        }
      });
      this.lastAttentionPhase = attentionPhase;
    }

    const targetId = targeting.relationshipTargetId ?? "none";
    if (targetId === this.lastRelationshipTargetId) return;
    this.record("attention.target.changed", "perceptual", {
      percept: {
        from: this.aliasSource(this.lastRelationshipTargetId),
        to: this.aliasSource(targetId),
        targetActive: targetId !== "none",
        phase: targeting.relationshipPhase ?? "none",
        verb: targeting.relationshipVerb ?? "none"
      },
      developer: {
        fromTargetId: this.lastRelationshipTargetId,
        toTargetId: targetId,
        relationshipSequence: targeting.relationshipSequence ?? 0,
        relationshipReason: targeting.relationshipReason ?? "none",
        candidateId
      }
    });
    if (this.lastRelationshipTargetId !== "none" && targetId !== "none") {
      this.noteEffort("target_switch", 0.5, { target: this.aliasSource(targetId) });
    }
    this.lastRelationshipTargetId = targetId;
    this.lastTargetId = targetId;
  }

  observeInput(frameState, now) {
    const input = frameState.input ?? {};
    const source = frameState.inputSource ?? {};
    const pulseEventId = input.pulseEventId ?? 0;
    if (input.pulsePressed && pulseEventId > 0 && pulseEventId !== this.lastPulseEventId) {
      this.lastPulseEventId = pulseEventId;
      const releaseKind = input.pulseReleaseKind ?? "quick";
      const holdSeconds = round(input.pulseHoldSeconds ?? 0);
      this.record("verb.pulse.released", "input", {
        percept: {
          releaseKind,
          charge01: round(input.pulseReleaseCharge01 ?? 0),
          holdSeconds,
          physicalSource: input.pulseSource ?? "unknown"
        },
        developer: {
          pulseEventId,
          chargeRateMultiplier: round(input.pulseChargeRateMultiplier ?? 1),
          expectedAction: source.expectedAction ?? "none"
        }
      });
      this.noteEffort("pulse", releaseKind === "charged" ? 1.8 : 1.5, { target: this.aliasSource(frameState.targeting?.targetId ?? "none"), releaseKind });
      this.queueAttempt("pulse", { releaseKind, holdSeconds, pulseEventId });
    }

    this.observeHeldVerb("absorb", Boolean(input.absorbHeld), now, frameState);
    this.observeHeldVerb("stabilize", Boolean(input.stabilizeHeld), now, frameState);
    this.observeHeldVerb("boost", Boolean(input.boostHeld), now, frameState);

    if (input.interactPressed) {
      this.record("action.commit_pressed", "input", {
        percept: { context: input.primaryActionContext ?? "world" },
        developer: { eventId: input.interactEventId ?? 0, role: input.primaryActionRole ?? "commit_reserved" }
      });
    }
    if (input.coreWorkViewPressed) {
      this.record("action.core_work.enter_requested", "input", {
        percept: { source: input.coreWorkViewSource ?? "unknown" },
        developer: { eventId: input.coreWorkEventId ?? 0 }
      });
    }
  }

  observeHeldVerb(kind, held, now, frameState) {
    const previous = this.prevHeld[kind];
    if (held && !previous) {
      this.holdStartedAt[kind] = now;
      this.record(`verb.${kind}.started`, "input", {
        percept: { reserve01: round(frameState.corePerformance?.endurance?.reserve01 ?? 1) },
        developer: { physiology: this.verbModifierSnapshot(frameState, kind) }
      });
    } else if (!held && previous) {
      const startedAt = this.holdStartedAt[kind];
      const durationSeconds = startedAt == null ? 0 : Math.max(0, now - startedAt);
      this.record(`verb.${kind}.ended`, "input", {
        percept: {
          durationSeconds: round(durationSeconds),
          reserve01: round(frameState.corePerformance?.endurance?.reserve01 ?? 1)
        },
        developer: { physiology: this.verbModifierSnapshot(frameState, kind) }
      });
      if (kind === "absorb" || kind === "stabilize") {
        this.noteEffort(kind, durationSeconds >= 0.7 ? 1.4 : 1.0, { target: this.aliasSource(frameState.targeting?.targetId ?? "none"), durationSeconds: round(durationSeconds) });
        this.queueAttempt(kind, { durationSeconds: round(durationSeconds) });
      }
      this.holdStartedAt[kind] = null;
    }
    this.prevHeld[kind] = held;
  }

  observeSonar(frameState) {
    const sensory = frameState.coreSensoryResponse ?? {};
    for (const answer of sensory.newReturns ?? []) {
      const alias = this.aliasSource(answer.id);
      const resolutionStage = answer.resolutionStage ?? 1;
      const prior = this.lastResolutionByAlias.get(alias) ?? 0;
      const firstObserved = !this.seenSourceAliases.has(alias);
      this.seenSourceAliases.add(alias);

      this.record("sonar.return", "perceptual", {
        percept: {
          source: alias,
          returnCharacter: (answer.reachClass ?? "local_actionable") === "deep_structural" ? "broad_diffuse" : "tight_attached",
          distance: round(answer.distance ?? 0),
          pulseMode: answer.pulseMode ?? "quick",
          observationCount: answer.observationCount ?? 1,
          resolutionStage,
          presentationStage: resolutionStage <= 1 ? "presence" : resolutionStage === 2 ? "layering" : "volumetric_relation"
        },
        developer: {
          sourceId: answer.id ?? "none",
          reachClass: answer.reachClass ?? "local_actionable",
          structuralInterpretation: answer.structuralInterpretation ?? "presence_only",
          responseClass: answer.responseClass ?? "unknown",
          responseLabel: answer.responseLabel ?? "unknown",
          position: this.roundVector(answer.position),
          pulseEventId: answer.pulseEventId ?? 0
        }
      });

      if (resolutionStage > prior) {
        this.record("sonar.resolution.increased", "perceptual", {
          percept: {
            source: alias,
            fromStage: prior,
            toStage: resolutionStage,
            presentationStage: resolutionStage <= 1 ? "presence" : resolutionStage === 2 ? "layering" : "volumetric_relation"
          },
          developer: { sourceId: answer.id ?? "none" }
        });
        this.lastResolutionByAlias.set(alias, resolutionStage);
        this.noteInformationGain(firstObserved ? "new_source_resolved" : "sonar_resolution_increased", firstObserved ? 1.0 : 0.8, {
          source: alias,
          fromStage: prior,
          toStage: resolutionStage,
          reach: (answer.reachClass ?? "local_actionable") === "deep_structural" ? "deep" : "local"
        });
      } else if (resolutionStage >= 3 && prior >= 3) {
        this.redundantMaxResolutionReturns += 1;
        this.record("sonar.redundant_max_resolution", "analysis", {
          percept: {
            source: alias,
            distance: round(answer.distance ?? 0),
            pulseMode: answer.pulseMode ?? "quick",
            resolutionStage,
            informationGainAge: round(this.informationGainAge())
          },
          developer: { sourceId: answer.id ?? "none", observationCount: answer.observationCount ?? 1 }
        });
        this.noteEffort("redundant_max_sonar", 0.35, { source: alias });
      }
    }
  }

  observeConsequence(frameState) {
    const event = frameState.signalPlainLocalConsequenceEvent;
    if (!event?.eventId || event.eventId === this._lastConsequenceEventId) return;
    this._lastConsequenceEventId = event.eventId;
    this.record("host.consequence.started", "perceptual", {
      percept: {
        condition: this.aliasSemantic(event.conditionId, "condition"),
        durationSeconds: round(event.durationSeconds ?? 0)
      },
      developer: {
        eventId: event.eventId,
        consequenceId: event.consequenceId ?? "none",
        conditionId: event.conditionId ?? "none",
        sourceVerb: event.sourceVerbDebugOnly ?? "none",
        nodeNumber: event.nodeNumber ?? 0
      }
    });
    this.noteInformationGain("persistent_consequence", 2.0, { condition: this.aliasSemantic(event.conditionId, "condition") });
  }

  observeRelationship(frameState) {
    const primary = frameState.signalPlainEcology?.consequenceNextQuestion?.primary ?? null;
    const eventId = primary?.active ? (primary.eventId ?? primary.id ?? "none") : "none";
    if (eventId === this.lastRelationshipEventId) return;
    if (eventId !== "none") {
      this.record("host.relationship.emerged", "perceptual", {
        percept: {
          relation: this.aliasSemantic(primary.relation, "relation"),
          strength: round(primary.strength ?? 0),
          source: this.aliasSource(`signal_node_${primary.sourceNodeNumber ?? 0}`),
          affected: this.aliasSource(`signal_node_${primary.targetNodeNumber ?? 0}`)
        },
        developer: {
          eventId,
          id: primary.id ?? "none",
          relation: primary.relation ?? "none",
          sourceNodeNumber: primary.sourceNodeNumber ?? 0,
          targetNodeNumber: primary.targetNodeNumber ?? 0
        }
      });
      this.noteInformationGain("host_relationship", 2.0, { relation: this.aliasSemantic(primary.relation, "relation") });
    } else if (this.lastRelationshipEventId !== "none") {
      this.record("host.relationship.faded", "perceptual", {
        percept: { previousRelationship: "recent_host_coupling" },
        developer: { previousEventId: this.lastRelationshipEventId }
      });
    }
    this.lastRelationshipEventId = eventId;
  }

  observeRhythm(frameState) {
    const risk = Boolean(frameState.interactionComposition?.rhythmLock?.semanticStagnationRisk);
    if (risk === this.lastSemanticStagnationRisk) return;
    this.record(risk ? "rhythm.semantic_stagnation.entered" : "rhythm.semantic_stagnation.cleared", "internal", {
      percept: {
        beat: frameState.interactionComposition?.rhythm?.beat ?? "observe",
        semanticChangeAge: round(frameState.interactionComposition?.rhythmLock?.semanticChangeAge ?? 0),
        meaningfulChangeAge: round(frameState.interactionComposition?.rhythmLock?.meaningfulChangeAge ?? 0)
      },
      developer: {
        repeatCount: frameState.interactionComposition?.rhythmLock?.semanticRepeatCount ?? 0,
        deadTimeRisk: Boolean(frameState.interactionComposition?.rhythmLock?.deadTimeRisk)
      }
    });
    this.lastSemanticStagnationRisk = risk;
  }


  observeCoreWorldResonance(frameState) {
    const resonance = frameState.coreWorldResonance ?? {};
    const state = resonance.active ? resonance.relationshipState ?? "oscillating" : "inactive";
    if (state === this.lastCoreWorldResonanceState) return;
    this.record("core.world_resonance.changed", "perceptual", {
      percept: {
        from: this.lastCoreWorldResonanceState,
        to: state,
        coherence01: round(resonance.coherence01 ?? 0),
        coreFunction: resonance.coreFunction ?? "none",
        worldFunction: resonance.worldFunction ?? "none"
      },
      developer: {
        profileId: frameState.hostRhythm?.composition?.profileId ?? "legacy_host_breath",
        phaseAlignment01: round(resonance.phaseAlignment01 ?? 0),
        phaseCount: resonance.phaseCount ?? frameState.coreEngine?.phaseCount ?? 3,
        beatNumber: resonance.beatNumber ?? 0,
        accentRole: resonance.accentRole ?? "none",
        gameplayAuthority: false
      }
    });
    this.lastCoreWorldResonanceState = state;
  }

  observeCoreTopologyResonance(frameState) {
    const topologyResonance = frameState.coreTopologyResonance ?? {};
    const mode = topologyResonance.active ? topologyResonance.mode ?? "forming" : "forming";
    if (mode === this.lastCoreTopologyResonanceMode) return;
    const properties = topologyResonance.properties ?? {};
    const presentation = topologyResonance.presentation ?? {};
    this.record("core.topology_resonance.mode_changed", "internal", {
      percept: {
        from: this.lastCoreTopologyResonanceMode,
        to: mode,
        personality: topologyResonance.personality ?? "forming / neutral"
      },
      developer: {
        topologyId: topologyResonance.topologyId ?? "forming_topology",
        distribution: topologyResonance.distribution ?? "0:0:0",
        response01: round(properties.response01 ?? 0.5),
        inertia01: round(properties.inertia01 ?? 0.5),
        coherence01: round(properties.coherence01 ?? 0.5),
        exposure01: round(properties.exposure01 ?? 0.447),
        worldImprint01: round(presentation.worldImprint01 ?? 0),
        gameplayAuthority: false
      }
    });
    this.lastCoreTopologyResonanceMode = mode;
    this.captureCoreSnapshot("topology_resonance_mode_change");
  }

  observeCoreTopologyEnvironmentalHandling(frameState) {
    const handlingState = frameState.coreTopologyEnvironmentalHandling ?? {};
    const handling = handlingState.handling ?? {};
    const mode = handlingState.active ? handling.mode ?? "neutral" : "neutral";
    if (mode === this.lastCoreTopologyHandlingMode) return;
    const movementHandling = frameState.playerKinematics?.topologyEnvironmentalHandling ?? {};
    this.record("core.topology_environmental_handling.mode_changed", "internal", {
      percept: {
        from: this.lastCoreTopologyHandlingMode,
        to: mode,
        personality: handlingState.personality ?? "forming / neutral"
      },
      developer: {
        topologyId: handlingState.topologyId ?? "forming_topology",
        topologyMode: handlingState.topologyMode ?? "forming",
        environmentalCouplingMultiplier: round(handling.environmentalCouplingMultiplier ?? 1),
        fluidSlipDampingMultiplier: round(handling.fluidSlipDampingMultiplier ?? 1),
        movementAppliedCouplingMultiplier: round(movementHandling.environmentalCouplingMultiplier ?? 1),
        movementAppliedSlipDampingMultiplier: round(movementHandling.fluidSlipDampingMultiplier ?? 1),
        suppressed: Boolean(movementHandling.suppressed),
        suppressionReason: movementHandling.suppressionReason ?? "none",
        movementAuthority: false
      }
    });
    this.lastCoreTopologyHandlingMode = mode;
    this.captureCoreSnapshot("topology_environmental_handling_mode_change");
  }

  observeCoreTopologyVerbCharacter(frameState) {
    const character = frameState.coreTopologyVerbCharacter ?? {};
    const mode = character.active ? character.mode ?? "forming" : "forming";
    if (mode === this.lastCoreTopologyVerbCharacterMode) return;
    this.record("core.topology_verb_character.mode_changed", "internal", {
      percept: {
        from: this.lastCoreTopologyVerbCharacterMode,
        to: mode,
        personality: character.personality ?? "forming / neutral"
      },
      developer: {
        topologyId: character.topologyId ?? "forming_topology",
        pulse: character.pulse ?? {},
        absorb: character.absorb ?? {},
        stabilize: character.stabilize ?? {},
        audio: character.audio ?? {},
        gameplayAuthority: false,
        verbPowerAuthority: false
      }
    });
    this.lastCoreTopologyVerbCharacterMode = mode;
    this.captureCoreSnapshot("topology_verb_character_mode_change");
  }

  observeEntityEcologyResonance(frameState) {
    const ecology = frameState.entityEcologyResonance ?? {};
    const mode = ecology.active ? ecology.mode ?? "ambient_listening" : "inactive";
    if (mode === this.lastEntityEcologyResonanceMode) return;
    this.record("ecology.entity_resonance.mode_changed", "perceptual", {
      percept: {
        from: this.lastEntityEcologyResonanceMode,
        to: mode,
        worldFunction: ecology.world?.currentFunction ?? "none",
        visibleEntityCount: ecology.visibleEntityCount ?? 0,
        bondedTenderPresent: Boolean(ecology.bondedTenderPresent)
      },
      developer: {
        profileId: ecology.world?.profileId ?? "none",
        region: ecology.world?.region ?? "unassigned",
        coreRelationship: ecology.coreRelationship?.state ?? "inactive",
        coreCoherence01: round(ecology.coreRelationship?.coherence01 ?? 0),
        entrainment01: round(ecology.expression?.entrainment01 ?? 0),
        behaviorAuthority: false,
        combatAuthority: false,
        progressionAuthority: false
      }
    });
    this.lastEntityEcologyResonanceMode = mode;
  }

  observeEntityRelationshipGrammar(frameState) {
    const relationship = frameState.entityRelationshipGrammar ?? {};
    const primary = relationship.primary ?? {};
    const key = relationship.active
      ? `${primary.entityId ?? "none"}:${primary.interpretation ?? "ambient_listening"}:${relationship.chord ?? "idle"}`
      : "inactive";
    if (key === this.lastEntityRelationshipGrammarKey) return;
    this.record("ecology.entity_relationship.changed", "perceptual", {
      percept: {
        from: this.lastEntityRelationshipGrammarKey,
        to: key,
        role: primary.role ?? "none",
        interpretation: primary.interpretation ?? "ambient_listening",
        engagement01: round(primary.engagement01 ?? 0)
      },
      developer: {
        entityId: primary.entityId ?? "none",
        chord: relationship.chord ?? "idle",
        bonded: Boolean(primary.bonded),
        responsePersonality: frameState.responsePersonality?.entities?.[primary.entityId ?? "none"]?.family ?? "living_responder",
        responseBodySignature: frameState.responsePersonality?.entities?.[primary.entityId ?? "none"]?.bodySignature ?? "adaptive_living_reply",
        behaviorAuthority: false,
        bondAuthority: false,
        combatAuthority: false,
        progressionAuthority: false,
        verbPowerAuthority: false
      }
    });
    this.lastEntityRelationshipGrammarKey = key;
  }

  observeEntityReciprocalMemory(frameState) {
    const memory = frameState.entityReciprocalMemory ?? {};
    const commitCount = Number(memory.commitCount ?? 0);
    if (commitCount <= this.lastEntityReciprocalMemoryCommitCount) return;
    const primary = memory.primary ?? {};
    this.record("ecology.entity_reciprocal_memory.committed", "perceptual", {
      percept: {
        entityId: primary.entityId ?? "none",
        mode: primary.mode ?? "ambient_memory",
        interpretation: primary.interpretation ?? "ambient_listening",
        strength01: round(primary.strength01 ?? 0),
        responsePulse01: round(primary.responsePulse01 ?? 0)
      },
      developer: {
        commitCount,
        hiddenAffinityScore: false,
        inputTimingGate: false,
        behaviorAuthority: false,
        bondAuthority: false,
        repairAuthority: false,
        combatAuthority: false,
        progressionAuthority: false
      }
    });
    this.lastEntityReciprocalMemoryCommitCount = commitCount;
  }


  observeEntityReciprocalBehavior(frameState) {
    const behavior = frameState.entityReciprocalBehavior ?? {};
    const primary = behavior.primary ?? {};
    const key = behavior.active
      ? `${primary.entityId ?? "none"}:${primary.mode ?? "baseline"}`
      : "inactive";
    if (key === this.lastEntityReciprocalBehaviorKey) return;
    this.record("ecology.entity_reciprocal_behavior.changed", "perceptual", {
      percept: {
        from: this.lastEntityReciprocalBehaviorKey,
        to: key,
        mode: primary.mode ?? "baseline",
        strength01: round(primary.strength01 ?? 0)
      },
      developer: {
        entityId: primary.entityId ?? "none",
        entityBehaviorDirectiveAuthority: Boolean(behavior.entityBehaviorDirectiveAuthority),
        entityMovementAuthority: false,
        playerMovementAuthority: false,
        hiddenAffinityScore: false,
        bondAuthority: false,
        repairAuthority: false,
        combatAuthority: false,
        progressionAuthority: false,
        routeAuthority: false
      }
    });
    this.lastEntityReciprocalBehaviorKey = key;
  }

  observeEntityLocalMatterCoupling(frameState) {
    const coupling = frameState.entityLocalMatterCoupling ?? {};
    const primary = coupling.primary ?? {};
    const key = coupling.active
      ? `${primary.entityId ?? "none"}:${primary.mode ?? "ambient"}:${primary.causalStage ?? "inactive"}`
      : "inactive";
    if (key === this.lastEntityLocalMatterCouplingKey) return;
    this.record("ecology.entity_local_matter_coupling.changed", "perceptual", {
      percept: {
        from: this.lastEntityLocalMatterCouplingKey,
        to: key,
        mode: primary.mode ?? "ambient",
        causalStage: primary.causalStage ?? "inactive",
        causalEnvelope01: round(primary.causalEnvelope01 ?? 0),
        liveRelationshipActive: Boolean(primary.liveRelationshipActive),
        strength01: round(primary.strength01 ?? 0),
        radius: round(primary.radius ?? 0)
      },
      developer: {
        entityId: primary.entityId ?? "none",
        region: coupling.region ?? "unassigned",
        regionalMatter: coupling.regionalMatter ?? "unassigned",
        causalSequence: coupling.causalSequence ?? [],
        localMatterAnswersAfterOrganism: Boolean(coupling.localMatterAnswersAfterOrganism),
        matterPersistsAfterVerbRelease: Boolean(coupling.matterPersistsAfterVerbRelease),
        usesExistingHostMotes: true,
        addsParticles: false,
        addsGeometry: false,
        addsDrawCalls: false,
        hiddenAffinityScore: false,
        playerMovementAuthority: false,
        entityMovementAuthority: false,
        collisionAuthority: false,
        chemistryAuthority: false,
        bondAuthority: false,
        repairAuthority: false,
        combatAuthority: false,
        progressionAuthority: false,
        routeAuthority: false
      }
    });
    this.lastEntityLocalMatterCouplingKey = key;
  }


  observeEntityEcologicalResidue(frameState) {
    const residue = frameState.entityEcologicalResidue ?? {};
    const primary = residue.primary ?? {};
    const key = residue.active
      ? `${primary.entityId ?? "none"}:${primary.mode ?? "ambient_trace"}:${primary.residueStage ?? "inactive"}`
      : residue.stored
        ? `stored:${residue.residues?.[0]?.entityId ?? "none"}:${residue.residues?.[0]?.mode ?? "ambient_trace"}`
        : "inactive";
    if (key === this.lastEntityEcologicalResidueKey) return;
    this.record("ecology.entity_ecological_residue.changed", "perceptual", {
      percept: {
        from: this.lastEntityEcologicalResidueKey,
        to: key,
        mode: primary.mode ?? "ambient_trace",
        residueStage: primary.residueStage ?? "inactive",
        strength01: round(primary.strength01 ?? 0),
        remainingSeconds: round(primary.remainingSeconds ?? 0),
        residueCount: Array.isArray(residue.residues) ? residue.residues.length : 0
      },
      developer: {
        entityId: primary.entityId ?? "none",
        worldSpaceFrozen: Boolean(residue.worldSpaceFrozen),
        cellScoped: Boolean(residue.cellScoped),
        decaysWhileAway: Boolean(residue.decaysWhileAway),
        durationRangeSeconds: residue.durationRangeSeconds ?? [20, 45],
        usesExistingHostMotes: true,
        addsParticles: false,
        addsGeometry: false,
        addsDrawCalls: false,
        saveStateAuthority: false,
        hiddenAffinityScore: false,
        playerMovementAuthority: false,
        entityMovementAuthority: false,
        collisionAuthority: false,
        chemistryAuthority: false,
        bondAuthority: false,
        repairAuthority: false,
        combatAuthority: false,
        progressionAuthority: false,
        routeAuthority: false
      }
    });
    this.lastEntityEcologicalResidueKey = key;
  }

  observeEntityResidueRecognition(frameState) {
    const recognition = frameState.entityResidueRecognition ?? {};
    const primary = recognition.primary ?? {};
    const key = recognition.active
      ? `${primary.entityId ?? "none"}:${primary.interpretation ?? "ambient_trace_unread"}:${primary.sourceMode ?? "none"}:${primary.relation ?? "none"}`
      : "inactive";
    if (key === this.lastEntityResidueRecognitionKey) return;
    this.record("ecology.entity_residue_recognition.changed", "perceptual", {
      percept: {
        from: this.lastEntityResidueRecognitionKey,
        to: key,
        entityId: primary.entityId ?? "none",
        interpretation: primary.interpretation ?? "ambient_trace_unread",
        sourceMode: primary.sourceMode ?? "none",
        relation: primary.relation ?? "none",
        strength01: round(primary.strength01 ?? 0),
        distance: round(primary.distance ?? 0)
      },
      developer: {
        sourceEntityId: primary.sourceEntityId ?? "none",
        sourceStage: primary.sourceStage ?? "inactive",
        readsWorldMemory: Boolean(recognition.readsWorldMemory),
        consumesResidue: false,
        refreshesResidue: false,
        writesReciprocalMemory: false,
        newEntityBehaviorAdded: false,
        entityBehaviorAuthority: false,
        entityMovementAuthority: false,
        playerMovementAuthority: false,
        collisionAuthority: false,
        chemistryAuthority: false,
        bondAuthority: false,
        repairAuthority: false,
        combatAuthority: false,
        targetingAuthority: false,
        progressionAuthority: false,
        routeAuthority: false,
        saveStateAuthority: false,
        hiddenAffinityScore: false
      }
    });
    this.lastEntityResidueRecognitionKey = key;
  }

  observeEntityEcologicalCrossInfluence(frameState) {
    const cross = frameState.entityEcologicalCrossInfluence ?? {};
    const primary = cross.primary ?? {};
    const key = cross.active
      ? `${primary.entityId ?? "none"}:${primary.mode ?? "ambient_cross_notice"}:${primary.causalStage ?? "inactive"}:${primary.sourceEntityId ?? "none"}`
      : "inactive";
    if (key === this.lastEntityEcologicalCrossInfluenceKey) return;
    this.record("ecology.entity_cross_influence.changed", "perceptual", {
      percept: {
        from: this.lastEntityEcologicalCrossInfluenceKey,
        to: key,
        entityId: primary.entityId ?? "none",
        mode: primary.mode ?? "ambient_cross_notice",
        causalStage: primary.causalStage ?? "inactive",
        strength01: round(primary.strength01 ?? 0),
        sourceEntityId: primary.sourceEntityId ?? "none",
        sourceMode: primary.sourceMode ?? "none"
      },
      developer: {
        sourceInterpretation: primary.sourceInterpretation ?? "ambient_trace_unread",
        readsOtherOrganismResidueOnly: Boolean(cross.readsOtherOrganismResidueOnly),
        oneShotPerContinuousRecognition: Boolean(cross.oneShotPerContinuousRecognition),
        recursivePropagation: false,
        createsResidue: false,
        refreshesResidue: false,
        consumesResidue: false,
        writesReciprocalMemory: false,
        usesExistingHostMotes: true,
        addsParticles: false,
        addsGeometry: false,
        addsDrawCalls: false,
        hiddenAffinityScore: false,
        entityBehaviorAuthority: false,
        entityMovementAuthority: false,
        playerMovementAuthority: false,
        collisionAuthority: false,
        chemistryAuthority: false,
        bondAuthority: false,
        repairAuthority: false,
        combatAuthority: false,
        targetingAuthority: false,
        progressionAuthority: false,
        routeAuthority: false,
        saveStateAuthority: false
      }
    });
    this.lastEntityEcologicalCrossInfluenceKey = key;
  }

  observeCoreVerbEngineCoupling(frameState) {
    const coupling = frameState.coreVerbEngineCoupling ?? {};
    const chord = coupling.active ? coupling.chord ?? "idle" : "idle";
    if (chord === this.lastCoreVerbEngineChord) return;
    this.record("core.verb_engine.chord_changed", "input", {
      percept: {
        from: this.lastCoreVerbEngineChord,
        to: chord,
        dominantFunction: coupling.dominantFunction ?? "none",
        functionDrive: coupling.functionDrive ?? { pulse: 0, absorb: 0, stabilize: 0 }
      },
      developer: {
        architectureId: coupling.engine?.architectureId ?? frameState.coreEngine?.architectureId ?? "triadic_3",
        phaseCount: coupling.engine?.phaseCount ?? frameState.coreEngine?.phaseCount ?? 3,
        readOnlyBridge: true,
        verbPowerAuthority: false,
        controllerMappingAuthority: false,
        aButtonAuthority: false
      }
    });
    this.lastCoreVerbEngineChord = chord;
  }

  observeVerbPhysicalGrammar(frameState) {
    const grammar = frameState.verbPhysicalGrammar ?? {};
    const mode = grammar.mode ?? "idle";
    if (mode === this.lastVerbPhysicalGrammarMode) return;

    this.record("movement.verb_physical_grammar.changed", "analysis", {
      percept: {
        from: this.lastVerbPhysicalGrammarMode,
        to: mode,
        chord: grammar.chord ?? "idle",
        relationshipSource: grammar.relationshipSource ?? "none",
        surfaceBound: Boolean(grammar.surfaceBound)
      },
      developer: {
        environmentalFlowMultiplier: round(grammar.effects?.environmentalFlowMultiplier ?? 1),
        surfaceTractionMultiplier: round(grammar.effects?.surfaceTractionMultiplier ?? 1),
        pulsePeelAssistEligible: Boolean(grammar.effects?.pulsePeelAssistEligible),
        absorbAttachmentAuthority: false,
        freeInputAccelerationMultiplier: 1,
        speedLimitMultiplier: 1,
        attachmentAcquireMultiplier: 1,
        attachmentReleaseThresholdMultiplier: 1,
        targetingAuthority: false,
        movementAuthority: "PlayerMovementController"
      }
    });
    this.lastVerbPhysicalGrammarMode = mode;
  }

  observeReactiveStateGrammar(frameState) {
    const event = frameState.reactiveStateGrammarLastEvent ?? null;
    if (!event?.eventId || event.eventId === this.lastReactiveStateEventId) return;
    this.lastReactiveStateEventId = event.eventId;
    this.record("chem.reactive_state.changed", "perceptual", {
      percept: {
        object: this.aliasSemantic(event.objectId ?? "none", "reactive_object"),
        from: event.from ?? "coherent",
        to: event.to ?? "coherent",
        condition01: round(event.condition01 ?? 0),
        presentedCondition01: round(event.presentedCondition01 ?? event.condition01 ?? 0),
        cause: event.cause ?? "unknown"
      },
      developer: {
        objectId: event.objectId ?? "none",
        authoredInstabilityRisk: round(event.authoredInstabilityRisk ?? 0),
        chord: event.chord ?? "idle",
        responsePersonality: frameState.responsePersonality?.objects?.[event.objectId ?? "none"]?.family ?? "adaptive_matter",
        responseExpression: frameState.responsePersonality?.objects?.[event.objectId ?? "none"]?.stageExpression ?? "settled_form",
        targetingAuthority: false,
        progressionAuthority: false,
        routeAuthority: false
      }
    });
    this.noteInformationGain("reactive_state_change", 0.7, {
      object: this.aliasSemantic(event.objectId ?? "none", "reactive_object"),
      to: event.to ?? "coherent"
    });
  }

  observeReturnRegion(frameState) {
    const grave = frameState.graveReturnRegion ?? {};
    const engine = frameState.returnRegionEngine ?? {};
    const resonance = frameState.graveResonanceGameplay ?? {};
    const progress = grave.progress ?? {};
    const regional = resonance.regional ?? {};
    const bucket = (value) => Math.max(0, Math.min(5, Math.floor((value ?? 0) * 5 + 0.0001)));
    const key = grave.active
      ? [
          "grave",
          grave.phase ?? 0,
          bucket(regional.mean01),
          bucket(regional.spread01),
          regional.candidateResolution ?? "none",
          resonance.completed ? 1 : 0,
          resonance.lastPropagationEvent?.eventId ?? 0,
          engine.creditCount ?? 0,
          engine.unlockedPhaseCount ?? 3
        ].join(":")
      : "inactive";
    if (key === this.lastReturnRegionKey) return;
    if (key === "inactive" && this.lastReturnRegionKey === "inactive") return;
    this.lastReturnRegionKey = key;
    this.record("return_region.state_changed", "perceptual", {
      percept: {
        region: "grave",
        phase: grave.phase ?? 0,
        active: Boolean(grave.active),
        completed: Boolean(resonance.completed ?? grave.completed),
        regionalMean01: round(regional.mean01 ?? 0),
        regionalSpread01: round(regional.spread01 ?? 0),
        candidateResolution: regional.candidateResolution ?? "none",
        resolutionHold01: round(regional.resolutionHold01 ?? 0),
        resolutionId: resonance.resolutionId ?? "none",
        touchedNodeCount: resonance.touchedNodeCount ?? 0,
        interactionCount: resonance.interactionCount ?? 0,
        retainedDraw: round(progress.retainedDraw ?? 0),
        coherentPush: round(progress.coherentPush ?? 0),
        heldEquilibrium: round(progress.heldEquilibrium ?? 0),
        engineCredits: engine.creditCount ?? 0,
        enginePhaseCount: engine.unlockedPhaseCount ?? 3,
        octavePhaseCount: grave.octave?.octavePhaseCount ?? 3,
        resonance01: round(grave.octave?.resonance01 ?? 0)
      },
      developer: {
        layoutEquationId: grave.layoutEquationId ?? "none",
        layoutInputs: grave.layoutInputs ?? null,
        layoutOutputs: grave.layoutOutputs ?? null,
        lastPropagationEvent: resonance.lastPropagationEvent ?? null,
        exactComboGate: Boolean(resonance.rules?.exactComboGate),
        regionalConditionResolution: Boolean(resonance.rules?.regionalConditionResolution),
        returnBlockedUntilResolved: Boolean(grave.returnBlockedUntilResolved),
        exitSafety: grave.exitSafety ?? "none",
        progressionOwner: engine.owner ?? "none"
      }
    });
  }

  observeRuptureHarvest(frameState) {
    const combat = frameState.graveRuptureHarvest ?? {};
    const event = combat.lastEvent ?? null;
    if (!event?.eventId || event.eventId === this.lastRuptureHarvestEventId) return;
    this.lastRuptureHarvestEventId = event.eventId;
    this.record(`combat.rupture_harvest.${event.type ?? "event"}`, "perceptual", {
      percept: {
        active: Boolean(combat.active),
        object: this.aliasSemantic(event.objectId ?? event.fragmentId ?? "none", "rupture_matter"),
        role: event.role ?? "none",
        style: event.style ?? "none",
        ruptureCount: combat.ruptureCount ?? 0,
        collectedFragmentCount: combat.collectedFragmentCount ?? 0,
        liveFragmentCount: combat.liveFragmentCount ?? 0,
        missedResidueCount: combat.missedResidueCount ?? 0
      },
      developer: {
        event,
        owner: combat.owner ?? "none",
        combatLanguage: combat.combatLanguage ?? "none",
        healthBars: Boolean(combat.rules?.healthBars),
        hackAndSlashAttack: Boolean(combat.rules?.hackAndSlashAttack),
        exitBlockedByCombat: Boolean(combat.rules?.exitBlockedByCombat),
        routeProgressionOwnedByCombat: Boolean(combat.rules?.routeProgressionOwnedByCombat),
        targetingAuthority: Boolean(combat.rules?.targetingAuthority),
        fragmentFieldCaptureActive: Boolean(combat.fragmentFieldCaptureActive),
        fragmentFieldPulledIds: combat.fragmentFieldPulledIds ?? [],
        fragmentFieldCandidateCount: combat.fragmentFieldCandidateCount ?? 0,
        fragmentFieldMaxConcurrentPulls: combat.fragmentFieldMaxConcurrentPulls ?? 0
      }
    });
    if (event.type === "object_ruptured") this.noteInformationGain("rupture_event", 0.9, { style: event.style ?? "none" });
    if (event.type === "fragment_absorbed") this.noteInformationGain("rupture_fragment_absorbed", 0.45, { style: event.style ?? "none" });
  }

  observeRuptureConsequence(frameState) {
    const consequence = frameState.graveRuptureConsequence ?? {};
    const event = consequence.lastEvent ?? null;
    if (!event?.eventId || event.eventId === this.lastRuptureConsequenceEventId) return;
    this.lastRuptureConsequenceEventId = event.eventId;
    this.record(`combat.rupture_consequence.${event.type ?? "event"}`, "perceptual", {
      percept: {
        ruptureCount: consequence.ruptureCount ?? 0,
        residueLoad01: round(consequence.residueLoad01 ?? 0),
        harvestRatio01: round(consequence.harvestRatio01 ?? 0),
        collectedFragmentCount: consequence.collectedFragmentCount ?? 0,
        cooledFragmentCount: consequence.cooledFragmentCount ?? 0
      },
      developer: {
        event,
        owner: consequence.owner ?? "none",
        activeConsequence01: round(consequence.activeConsequence01 ?? 0),
        residueStyleWeight: consequence.residueStyleWeight ?? {},
        nodeBias: consequence.nodeBias ?? {},
        cleanupRequired: Boolean(consequence.rules?.cleanupRequired),
        progressionAuthority: Boolean(consequence.rules?.progressionAuthority),
        exitAuthority: Boolean(consequence.rules?.exitAuthority)
      }
    });
  }

  observeDeliberateCommitment(frameState) {
    const state = frameState.deliberateCommitment ?? {};
    const event = frameState.deliberateCommitmentEvent ?? null;
    if (event?.eventId && event.eventId !== this.lastDeliberateCommitmentEventId) {
      this.lastDeliberateCommitmentEventId = event.eventId;
      this.record("action.deliberate_commitment", "input", {
        percept: { kind: state.kind ?? event.kind ?? "authored_commitment" },
        developer: {
          eventId: event.eventId,
          targetId: event.targetId ?? "none",
          consequenceAuthority: Boolean(event.consequenceAuthority)
        }
      });
    }
  }

  observeCoreTopology(frameState) {
    const topologyId = frameState.corePerformance?.topologyId ?? "forming_topology";
    if (topologyId === this.lastTopologyId) return;
    this.record("core.topology.changed", "internal", {
      percept: {
        personality: frameState.corePerformance?.personality ?? "forming / neutral",
        weights: this.coreWeights(frameState)
      },
      developer: {
        fromTopologyId: this.lastTopologyId,
        toTopologyId: topologyId,
        distribution: frameState.corePerformance?.distribution ?? "unknown"
      }
    });
    this.noteInformationGain("core_topology_changed", 1.5, { personality: frameState.corePerformance?.personality ?? "forming / neutral" });
    this.lastTopologyId = topologyId;
    this.captureCoreSnapshot("topology_change");
  }

  observeDebugPlatform(frameState) {
    const slot = frameState.input?.debugTestPlatformSlot ?? 0;
    if (!slot || slot === this.lastDebugPlatformSlot) {
      if (!slot) this.lastDebugPlatformSlot = 0;
      return;
    }
    this.lastDebugPlatformSlot = slot;
    this.record("debug.test_platform.jump", "internal", {
      percept: { slot },
      developer: { platform: frameState.debugTestPlatform?.label ?? `slot_${slot}` }
    });
  }

  observeSurfaceDetachment(frameState) {
    const attachment = frameState.playerAttachment ?? {};
    const active = Boolean(attachment.active);
    const state = attachment.state ?? "free";
    const reacquireBlocked = Boolean(attachment.reacquireBlocked);
    const contactGapActive = Boolean(attachment.contactGapActive);
    const ownerSurfaceId = attachment.ownerSurfaceId ?? "none";
    const transferCount = attachment.supportIdentityTransferCount ?? 0;

    if (!active && state === "brushing" && this.lastAttachmentState !== "brushing") {
      this.record("movement.surface_brush", "perceptual", {
        percept: {
          surface: this.aliasSource(
            attachment.surfaceTruthSurfaceId && attachment.surfaceTruthSurfaceId !== "none"
              ? attachment.surfaceTruthSurfaceId
              : attachment.authoredSuctionSupportSurfaceId ?? "none"
          ),
          outcome: "brush_only"
        },
        developer: {
          attachmentAuthority: attachment.authority ?? "none",
          acquireAge: round(attachment.acquireAge ?? 0)
        }
      });
    }

    if (!this.lastAttachmentContactGapActive && contactGapActive && active) {
      this.record("movement.surface_contact_gap_tolerated", "analysis", {
        percept: {
          surface: this.aliasSource(ownerSurfaceId),
          relationshipHeld: true
        },
        developer: {
          contactGapAge: round(attachment.contactGapAge ?? 0),
          contactGapTolerance: round(attachment.contactGapTolerance ?? 0),
          continuityMode: attachment.continuityMode ?? "contact_gap_tolerated"
        }
      });
    }

    if (transferCount > this.lastAttachmentSupportIdentityTransferCount) {
      this.record("movement.surface_support_identity_transferred", "analysis", {
        percept: {
          from: this.aliasSource(this.lastAttachmentOwnerSurfaceId),
          to: this.aliasSource(ownerSurfaceId),
          attachmentPreserved: active
        },
        developer: {
          transferCount,
          continuityMode: attachment.continuityMode ?? "support_identity_transferred"
        }
      });
    }

    if (this.lastAttachmentActive && !active && state === "releasing") {
      this.record("movement.surface_detached", "perceptual", {
        percept: {
          reason: attachment.detachReason ?? "unknown",
          deliberate: attachment.detachReason === "deliberate_away_input",
          surface: this.aliasSource(attachment.releaseSurfaceId ?? "none")
        },
        developer: {
          releaseTension: round(attachment.releaseTension ?? 0),
          releaseClearance: round(attachment.releaseClearance ?? 0),
          cooldownSeconds: round(attachment.releaseCooldown ?? 0),
          attachmentAuthority: attachment.authority ?? "none",
          contactGapAge: round(attachment.contactGapAge ?? 0),
          contactGapTolerance: round(attachment.contactGapTolerance ?? 0),
          continuityMode: attachment.continuityMode ?? "none",
          momentumHandoffMode: attachment.momentumHandoffMode ?? "none",
          inheritedTangentialSpeed: round(attachment.releaseInheritedTangentialSpeed ?? 0),
          releaseNormalImpulse: round(attachment.releaseNormalImpulse ?? 0),
          pulsePeelAssist: round(attachment.pulsePeelAssist ?? 0),
          verbPhysicalGrammarMode: attachment.verbPhysicalGrammarMode ?? frameState.verbPhysicalGrammar?.mode ?? "idle"
        }
      });
    } else if (!this.lastAttachmentActive && active) {
      this.record("movement.surface_attached", "perceptual", {
        percept: {
          surface: this.aliasSource(ownerSurfaceId !== "none"
            ? ownerSurfaceId
            : attachment.surfaceTruthSurfaceId ?? attachment.authoredSuctionSupportSurfaceId ?? "none"),
          authority: attachment.authority ?? "none"
        },
        developer: {
          supportCount: attachment.authoredSuctionSupportCount ?? 0,
          releaseClearanceBeforeAttach: round(attachment.releaseClearance ?? 0),
          continuityMode: attachment.continuityMode ?? "attachment_acquired",
          momentumHandoffMode: attachment.momentumHandoffMode ?? "landing_capture",
          entrySpeed: round(attachment.landingEntrySpeed ?? 0),
          entryTangentialSpeed: round(attachment.landingEntryTangentialSpeed ?? 0),
          landingCarryDuration: round(attachment.landingHandoffDuration ?? 0)
        }
      });
    }

    if (this.lastAttachmentReacquireBlocked && !reacquireBlocked) {
      this.record("movement.surface_reacquire_unblocked", "analysis", {
        percept: {
          clearanceReached: true
        },
        developer: {
          releaseClearance: round(attachment.releaseClearance ?? 0),
          releaseSurfaceId: attachment.releaseSurfaceId ?? "none"
        }
      });
    }

    this.lastAttachmentActive = active;
    this.lastAttachmentState = state;
    this.lastAttachmentReacquireBlocked = reacquireBlocked;
    this.lastAttachmentContactGapActive = contactGapActive;
    this.lastAttachmentOwnerSurfaceId = ownerSurfaceId;
    this.lastAttachmentSupportIdentityTransferCount = transferCount;
  }

  noteInformationGain(reason, score = 1, detail = {}) {
    const wallT = this.wallTime();
    const simT = this.simTime();
    this.informationGainCount += 1;
    this.informationGainScore += score;
    this.lastInformationGainWallT = wallT;
    this.lastInformationGainSimT = simT;
    const event = this.record("semantic.information_gain", "analysis", {
      percept: {
        reason,
        score: round(score),
        cumulativeScore: round(this.informationGainScore),
        detail
      },
      developer: { informationGainIndex: this.informationGainCount }
    });
    this.lastInfoGainEventSeq = event.seq;
    return event;
  }

  noteEffort(kind, weight = 1, detail = {}) {
    const item = { wallT: this.wallTime(), kind, weight, detail };
    this.recentEffort.push(item);
    this.pruneRecentEffort(item.wallT);
    return item;
  }

  pruneRecentEffort(wallNow = this.wallTime(), windowSeconds = 12) {
    const cutoff = wallNow - windowSeconds;
    while (this.recentEffort.length && this.recentEffort[0].wallT < cutoff) this.recentEffort.shift();
  }

  queueAttempt(kind, detail = {}) {
    const attempt = {
      id: `attempt_${++this.attemptSequence}`,
      kind,
      target: this.aliasSource(this.frameState.targeting?.targetId ?? "none"),
      wallStarted: this.wallTime(),
      simStarted: this.simTime(),
      resolveAtWall: this.wallTime() + 1.8,
      gainCountAtStart: this.informationGainCount,
      gainScoreAtStart: this.informationGainScore,
      detail
    };
    this.pendingAttempts.push(attempt);
    return attempt;
  }

  resolvePendingAttempts(wallNow = this.wallTime()) {
    if (!this.pendingAttempts.length) return;
    const remaining = [];
    for (const attempt of this.pendingAttempts) {
      if (wallNow < attempt.resolveAtWall) {
        remaining.push(attempt);
        continue;
      }
      const gainDelta = this.informationGainCount - attempt.gainCountAtStart;
      const gainScoreDelta = this.informationGainScore - attempt.gainScoreAtStart;
      const outcome = gainDelta > 0 ? "information_gain" : "no_gain";
      if (outcome === "no_gain") this.noGainAttempts += 1;
      this.record("analysis.attempt.outcome", "analysis", {
        percept: {
          attemptId: attempt.id,
          action: attempt.kind,
          target: attempt.target,
          outcome,
          elapsedSeconds: round(wallNow - attempt.wallStarted),
          informationGainDelta: gainDelta,
          informationGainScoreDelta: round(gainScoreDelta)
        },
        developer: { detail: attempt.detail, simStarted: round(attempt.simStarted) }
      });
    }
    this.pendingAttempts = remaining;
  }

  observeSemanticChurn(frameState, wallNow = this.wallTime()) {
    this.pruneRecentEffort(wallNow);
    const counts = {};
    let score = 0;
    for (const item of this.recentEffort) {
      score += item.weight;
      counts[item.kind] = (counts[item.kind] ?? 0) + 1;
    }
    const informationGainAge = Math.max(0, wallNow - this.lastInformationGainWallT);
    const attemptCount = (counts.pulse ?? 0) + (counts.absorb ?? 0) + (counts.stabilize ?? 0);
    const distinctVerbCount = [counts.pulse, counts.absorb, counts.stabilize].filter((value) => (value ?? 0) > 0).length;
    const redundantCount = counts.redundant_max_sonar ?? 0;
    const targetSwitches = counts.target_switch ?? 0;
    const evidencePattern = redundantCount >= 3 || attemptCount >= 6 || (attemptCount >= 3 && targetSwitches >= 3 && distinctVerbCount >= 2);
    const active = informationGainAge >= 6 && score >= 6.5 && evidencePattern;

    this.lastSemanticChurnScore = score;
    this.lastSemanticChurnContext = {
      windowSeconds: 12,
      informationGainAge: round(informationGainAge),
      effortScore: round(score),
      attempts: attemptCount,
      pulseAttempts: counts.pulse ?? 0,
      absorbAttempts: counts.absorb ?? 0,
      stabilizeAttempts: counts.stabilize ?? 0,
      targetSwitches,
      redundantMaxResolutionReturns: redundantCount,
      distinctVerbCount
    };

    if (active === this.semanticChurnActive) return;
    this.semanticChurnActive = active;
    if (active) this.semanticChurnEntryCount += 1;
    this.record(active ? "rhythm.semantic_churn.entered" : "rhythm.semantic_churn.cleared", "analysis", {
      percept: { ...this.lastSemanticChurnContext, active },
      developer: {
        cellId: frameState.activeCellId ?? "none",
        targetId: frameState.targeting?.targetId ?? "none",
        calibratedFrom: "HC028A_human_marker_001"
      }
    });
  }

  informationGainAge() {
    return Math.max(0, this.wallTime() - this.lastInformationGainWallT);
  }

  recentContext(windowSeconds = 12) {
    const now = this.wallTime();
    const recentEvents = this.events.filter((event) => (event.wallT ?? event.t ?? 0) >= now - windowSeconds);
    const counts = {};
    for (const event of recentEvents) counts[event.type] = (counts[event.type] ?? 0) + 1;
    const topSources = new Map();
    for (const event of recentEvents) {
      const source = event.percept?.source;
      if (source && source !== "none") topSources.set(source, (topSources.get(source) ?? 0) + 1);
    }
    return {
      windowSeconds,
      informationGainAge: round(this.informationGainAge()),
      semanticChurnActive: this.semanticChurnActive,
      semanticChurnScore: round(this.lastSemanticChurnScore),
      churn: this.lastSemanticChurnContext,
      eventCounts: counts,
      topSources: [...topSources.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([source, count]) => ({ source, count })),
      currentCell: this.aliasCell(this.frameState.activeCellId ?? "none"),
      currentTarget: this.aliasSource(this.frameState.targeting?.targetId ?? "none"),
      reserve01: round(this.frameState.corePerformance?.endurance?.reserve01 ?? 1),
      coreWeights: this.coreWeights(this.frameState)
    };
  }

  observePhysicalLanguageValidation(frameState, wallNow) {
    const probe = this.physicalLanguageValidation;
    if (!probe) return;

    const safeDt = probe.lastWallT > 0 ? clamp(wallNow - probe.lastWallT, 0, 0.1) : 0;
    probe.lastWallT = wallNow;

    const targeting = frameState.targeting ?? {};
    const attachment = frameState.playerAttachment ?? {};
    const ownerId = targeting.attentionTargetId ?? "none";
    const candidateId = targeting.candidateId ?? "none";
    const relationshipTargetId = targeting.relationshipTargetId ?? "none";
    const attentionPhase = targeting.attentionPhase ?? "none";
    const chord = frameState.verbComposition?.chord ?? "idle";
    const attachmentActive = Boolean(attachment.active);
    const activeSurfaceId = attachment.ownerSurfaceId ?? attachment.authoredSuctionSupportSurfaceId ?? "none";
    const activeAnatomy = this.resolveHostAnatomyIdentity(activeSurfaceId);
    const evidenceTargetId = probe.activeChain?.targetId ?? ownerId ?? relationshipTargetId ?? "none";
    const currentEvidence = this.capturePhysicalLanguageEvidence(frameState, evidenceTargetId);
    const previousEvidence = probe.previousEvidenceSnapshot;

    try {
      // HC031N1: a physical-language chain is armed at meaningful Host contact,
      // not merely because an aim owner happens to persist in free space. This
      // avoids long-lived "owned" chains that never enter the physical grammar.
      if (
        !probe.activeChain
        && attachmentActive
        && ownerId !== "none"
        && (attentionPhase === "engaged" || attentionPhase === "held")
      ) {
        this.startPhysicalLanguageValidationChain(frameState, wallNow, ownerId, candidateId, activeAnatomy);
      }

      const chain = probe.activeChain;
      if (!chain) return;

      if (wallNow - chain.startedWallT >= probe.timeoutSeconds) {
        this.abandonPhysicalLanguageValidationChain(frameState, "chain_timeout");
        return;
      }

      // The aim-owned noun must stay coherent until a verb has actually been
      // applied. After stage 5, the chain pins causal history to the committed
      // noun so looking away does not erase a valid Host/community response or
      // prevent the later deliberate peel from completing the physical sequence.
      if (chain.stageIndex < 5 && ownerId !== chain.targetId) {
        this.abandonPhysicalLanguageValidationChain(
          frameState,
          ownerId === "none" ? "attention_owner_lost_before_verb" : "attention_owner_changed_before_verb"
        );
        return;
      }

      if (chain.stageIndex < 3 && attachmentActive) {
        chain.surfaceId = activeSurfaceId;
        chain.hostInstrumentId = activeAnatomy.hostInstrumentId;
        chain.anatomyUnitId = activeAnatomy.anatomyUnitId;
        this.reachPhysicalLanguageValidationStage(frameState, "contact", 3, {
          surfaceId: chain.surfaceId,
          attachmentAuthority: attachment.authority ?? "none",
          hostInstrumentId: chain.hostInstrumentId,
          anatomyUnitId: chain.anatomyUnitId
        });
      }

      if (chain.stageIndex >= 3 && chain.stageIndex < 4) {
        const movingOnSurface = attachmentActive && (
          (attachment.surfaceTangentSpeed ?? 0) >= probe.travelSpeedThreshold
          || Boolean(attachment.tendrilLocomotionActive)
        );
        probe.travelHoldSeconds = movingOnSurface ? probe.travelHoldSeconds + safeDt : 0;
        if (probe.travelHoldSeconds >= probe.travelConfirmSeconds) {
          const anatomy = this.resolveHostAnatomyIdentity(activeSurfaceId !== "none" ? activeSurfaceId : chain.surfaceId);
          this.reachPhysicalLanguageValidationStage(frameState, "surface_travel", 4, {
            surfaceId: activeSurfaceId !== "none" ? activeSurfaceId : (chain.surfaceId ?? "none"),
            hostInstrumentId: anatomy.hostInstrumentId,
            anatomyUnitId: anatomy.anatomyUnitId,
            surfaceTangentSpeed: round(attachment.surfaceTangentSpeed ?? 0),
            tendrilLocomotionActive: Boolean(attachment.tendrilLocomotionActive),
            travelConfirmSeconds: round(probe.travelHoldSeconds)
          });
        }
      }

      if (
        chain.stageIndex >= 4
        && chain.stageIndex < 5
        && relationshipTargetId === chain.targetId
        && chord !== "idle"
      ) {
        chain.primaryChord = chord;
        chain.verbAppliedAtWallT = wallNow;
        chain.verbAppliedFrame = frameState.frame ?? 0;
        // Use the previous frame as the causal baseline. This lets an immediate
        // same-frame answer count only when something actually changed after the
        // gesture, rather than treating pre-existing surface state as proof.
        chain.answerBaseline = previousEvidence ?? this.capturePhysicalLanguageEvidence(frameState, chain.targetId);
        this.reachPhysicalLanguageValidationStage(frameState, "verb_applied", 5, {
          chord,
          physicalMode: frameState.verbPhysicalGrammar?.mode ?? "idle",
          relationshipSource: frameState.verbPhysicalGrammar?.relationshipSource ?? "none",
          evidenceBaselineFrame: chain.answerBaseline?.frame ?? -1
        });
      }

      if (chain.stageIndex >= 5 && chain.stageIndex < 6) {
        const answer = this.collectPhysicalLanguageAnswer(frameState, chain.targetId, chain.answerBaseline);
        if (answer.kinds.length > 0) {
          chain.answerKinds = answer.kinds;
          chain.answerCategories = answer.categories;
          chain.answerEvidence = answer.evidence;
          this.record("validation.physical_language.world_answer", "analysis", {
            percept: {
              chainId: chain.id,
              target: this.aliasSource(chain.targetId),
              chord: chord !== "idle" ? chord : chain.primaryChord,
              answerCategories: answer.categories
            },
            developer: {
              answerKinds: answer.kinds,
              evidence: answer.evidence,
              targetId: chain.targetId,
              surfaceId: activeSurfaceId !== "none" ? activeSurfaceId : (chain.surfaceId ?? "none"),
              hostInstrumentId: activeAnatomy.hostInstrumentId,
              anatomyUnitId: activeAnatomy.anatomyUnitId,
              verbAppliedFrame: chain.verbAppliedFrame ?? -1,
              answerFrame: frameState.frame ?? -1,
              causalRule: "post_verb_state_change_required",
              hostCoreInterpretation: "small_core_operating_through_existing_host_anatomy_or_community"
            }
          });
          this.reachPhysicalLanguageValidationStage(frameState, "world_answer", 6, {
            answerKinds: answer.kinds,
            answerCategories: answer.categories,
            causalRule: "post_verb_state_change_required"
          });
        }
      }

      const justDetached = probe.lastAttachmentActive && !attachmentActive;
      if (chain.stageIndex >= 3 && chain.stageIndex < 7 && justDetached) {
        const reason = attachment.detachReason ?? "none";
        if (chain.stageIndex >= 6 && reason === "deliberate_away_input") {
          chain.releaseSurfaceId = attachment.releaseSurfaceId ?? chain.surfaceId ?? "none";
          const releaseAnatomy = this.resolveHostAnatomyIdentity(chain.releaseSurfaceId);
          this.reachPhysicalLanguageValidationStage(frameState, "deliberate_release", 7, {
            reason,
            surfaceId: chain.releaseSurfaceId,
            hostInstrumentId: releaseAnatomy.hostInstrumentId,
            anatomyUnitId: releaseAnatomy.anatomyUnitId,
            inheritedTangentialSpeed: round(attachment.releaseInheritedTangentialSpeed ?? 0)
          });
        } else {
          this.abandonPhysicalLanguageValidationChain(frameState, `surface_release_${reason || "unknown"}`);
          return;
        }
      }

      const justReattached = !probe.lastAttachmentActive && attachmentActive;
      if (chain.stageIndex >= 7 && chain.stageIndex < 8 && justReattached) {
        chain.reacquiredSurfaceId = activeSurfaceId;
        const reacquiredAnatomy = this.resolveHostAnatomyIdentity(chain.reacquiredSurfaceId);
        this.reachPhysicalLanguageValidationStage(frameState, "reacquired_contact", 8, {
          surfaceId: chain.reacquiredSurfaceId,
          hostInstrumentId: reacquiredAnatomy.hostInstrumentId,
          anatomyUnitId: reacquiredAnatomy.anatomyUnitId,
          sameHostInstrumentAsInitial: reacquiredAnatomy.hostInstrumentId !== "none"
            && reacquiredAnatomy.hostInstrumentId === chain.hostInstrumentId,
          momentumHandoffMode: attachment.momentumHandoffMode ?? "none"
        });
      }

      if (
        chain.stageIndex >= 8
        && relationshipTargetId !== "none"
        && chord !== "idle"
      ) {
        chain.reinteractionTargetId = relationshipTargetId;
        chain.reinteractionChord = chord;
        this.reachPhysicalLanguageValidationStage(frameState, "reinteracted", 9, {
          targetId: relationshipTargetId,
          chord,
          physicalMode: frameState.verbPhysicalGrammar?.mode ?? "idle"
        });
        this.completePhysicalLanguageValidationChain(frameState);
      }
    } finally {
      // Read-only continuity identity sits above the collision/support solver.
      // Micro support transfers may change surface IDs while the player is still
      // operating within one Host instrument or one authored anatomy unit.
      if (
        probe.lastAttachmentActive
        && attachmentActive
        && probe.lastObservedSurfaceId !== "none"
        && activeSurfaceId !== "none"
        && activeSurfaceId !== probe.lastObservedSurfaceId
      ) {
        const fromAnatomy = probe.lastObservedSurfaceIdentity ?? this.resolveHostAnatomyIdentity(probe.lastObservedSurfaceId);
        this.record("validation.host_anatomy.identity_changed", "analysis", {
          percept: {
            from: this.aliasSource(probe.lastObservedSurfaceId),
            to: this.aliasSource(activeSurfaceId),
            sameAnatomyUnit: fromAnatomy.anatomyUnitId === activeAnatomy.anatomyUnitId,
            sameHostInstrument: fromAnatomy.hostInstrumentId === activeAnatomy.hostInstrumentId
          },
          developer: {
            fromSurfaceId: probe.lastObservedSurfaceId,
            toSurfaceId: activeSurfaceId,
            fromAnatomyUnitId: fromAnatomy.anatomyUnitId,
            toAnatomyUnitId: activeAnatomy.anatomyUnitId,
            fromHostInstrumentId: fromAnatomy.hostInstrumentId,
            toHostInstrumentId: activeAnatomy.hostInstrumentId,
            semanticAuthority: false,
            gameplayAuthority: false
          }
        });
      }
      probe.lastObservedSurfaceId = attachmentActive ? activeSurfaceId : "none";
      probe.lastObservedSurfaceIdentity = attachmentActive ? activeAnatomy : null;
      probe.previousEvidenceSnapshot = this.capturePhysicalLanguageEvidence(
        frameState,
        probe.activeChain?.targetId ?? ownerId ?? relationshipTargetId ?? "none"
      );
      probe.lastAttachmentActive = attachmentActive;
      probe.lastOwnerId = ownerId;
    }
  }

  startPhysicalLanguageValidationChain(frameState, wallNow, ownerId, candidateId, anatomyIdentity = null) {
    const probe = this.physicalLanguageValidation;
    const id = `physical_chain_${String(++probe.sequence).padStart(3, "0")}`;
    const noticed = candidateId === ownerId || ["engaged", "held"].includes(frameState.targeting?.attentionPhase ?? "none");
    const attachment = frameState.playerAttachment ?? {};
    const surfaceId = attachment.ownerSurfaceId ?? attachment.authoredSuctionSupportSurfaceId ?? "none";
    const anatomy = anatomyIdentity ?? this.resolveHostAnatomyIdentity(surfaceId);
    probe.travelHoldSeconds = 0;
    probe.activeChain = {
      id,
      targetId: ownerId,
      startedWallT: wallNow,
      startedSimT: this.simTime(),
      stage: "owned",
      stageIndex: 2,
      surfaceId,
      hostInstrumentId: anatomy.hostInstrumentId,
      anatomyUnitId: anatomy.anatomyUnitId,
      primaryChord: "idle",
      answerKinds: [],
      answerCategories: [],
      noticed
    };
    probe.bestStageIndex = Math.max(probe.bestStageIndex, 2);
    this.record("validation.physical_language.chain_started", "analysis", {
      percept: {
        chainId: id,
        target: this.aliasSource(ownerId),
        noticed,
        stage: "owned"
      },
      developer: {
        targetId: ownerId,
        candidateId,
        attentionPhase: frameState.targeting?.attentionPhase ?? "none",
        surfaceId,
        hostInstrumentId: anatomy.hostInstrumentId,
        anatomyUnitId: anatomy.anatomyUnitId,
        armRule: "aim_owned_noun_plus_live_host_contact",
        aimOwnershipPolicy: frameState.targeting?.aimOwnershipPolicy ?? "unknown",
        gameplayAuthority: false
      }
    });
    this.record("validation.physical_language.stage_reached", "analysis", {
      percept: { chainId: id, stage: "noticed", stageIndex: 1, target: this.aliasSource(ownerId) },
      developer: { observedThroughAimOwnership: noticed, gameplayAuthority: false }
    });
    this.record("validation.physical_language.stage_reached", "analysis", {
      percept: { chainId: id, stage: "owned", stageIndex: 2, target: this.aliasSource(ownerId) },
      developer: { attentionPhase: frameState.targeting?.attentionPhase ?? "none", gameplayAuthority: false }
    });
  }

  reachPhysicalLanguageValidationStage(frameState, stage, stageIndex, developer = {}) {
    const probe = this.physicalLanguageValidation;
    const chain = probe?.activeChain;
    if (!chain || stageIndex <= chain.stageIndex) return;
    chain.stage = stage;
    chain.stageIndex = stageIndex;
    probe.bestStageIndex = Math.max(probe.bestStageIndex, stageIndex);
    this.record("validation.physical_language.stage_reached", "analysis", {
      percept: {
        chainId: chain.id,
        stage,
        stageIndex,
        target: this.aliasSource(chain.targetId)
      },
      developer: {
        ...developer,
        targetId: chain.targetId,
        elapsedSeconds: round(this.wallTime() - chain.startedWallT),
        gameplayAuthority: false
      }
    });
  }

  resolveHostAnatomyIdentity(surfaceId = "none") {
    const id = String(surfaceId ?? "none");
    if (!id || id === "none") {
      return { hostInstrumentId: "none", anatomyUnitId: "none", microSurfaceId: "none" };
    }

    let hostInstrumentId = "unclassified_host_surface";
    let anatomyUnitId = id;
    if (id.startsWith("HOST_CONTACT_")) hostInstrumentId = "host_contact_shared_first_slice";

    if (id.includes("CONTINUATION_MEMBRANE")) anatomyUnitId = "membrane_causeway";
    else if (id.includes("CONTINUATION_SCAR_BRACE")) anatomyUnitId = "scar_buttress";
    else if (id.includes("CONTINUATION_RESIDUE")) anatomyUnitId = "residue_wash";
    else if (id.includes("SHELF_MEMBRANE") || id.includes("SHELF_SOFT_SLOPE")) anatomyUnitId = "entry_contact_shelf_living_tissue";
    else if (id.includes("SHELF_SCAR_BRACE")) anatomyUnitId = "entry_contact_shelf_scar_brace";
    else if (id.includes("SHELF_RESIDUE")) anatomyUnitId = "entry_contact_shelf_residue";

    return { hostInstrumentId, anatomyUnitId, microSurfaceId: id };
  }

  capturePhysicalLanguageEvidence(frameState, targetId = "none") {
    const reactive = frameState.reactiveStateGrammar ?? {};
    const focus = reactive.targetId === targetId ? reactive.focus ?? {} : {};
    const pulse = frameState.pulse ?? {};
    const bond = frameState.bondState ?? {};
    const physicalization = frameState.verbPhysicalization ?? {};
    const hostContact = frameState.hostContactEcologyContinuation ?? {};
    const projection = frameState.stabilizedProjection ?? {};
    const relationship = frameState.entityRelationshipGrammar ?? {};
    const memory = frameState.entityReciprocalMemory ?? {};
    const behavior = frameState.entityReciprocalBehavior ?? {};
    const matter = frameState.entityLocalMatterCoupling ?? {};
    const imprint = hostContact.localImprint ?? {};

    return {
      frame: frameState.frame ?? 0,
      pulseEventId: frameState.input?.pulseEventId ?? 0,
      target: {
        reactiveStateChangeCount: reactive.stateChangeCount ?? 0,
        reactiveTargetId: reactive.targetId ?? "none",
        reactiveStage: focus.stage ?? "none",
        reactiveCause: focus.lastCause ?? "none",
        pulseFocusedObject: pulse.focusedObject ?? "none",
        pulseAffectedTarget: Boolean((pulse.affectedObjects ?? []).includes(targetId)),
        bondObjectId: bond.objectId ?? "none",
        bondActive: Boolean(bond.active),
        absorbProgress: Number(bond.absorbProgress ?? 0),
        stabilizeTargetId: physicalization.stabilizeTargetId ?? "none",
        stabilizeProgress: Number(physicalization.stabilizeProgress ?? 0)
      },
      host: {
        active: Boolean(hostContact.active),
        surfaceId: hostContact.activeSurfaceId ?? hostContact.attachmentSurfaceId ?? "none",
        responseMode: hostContact.responseMode ?? "inactive",
        visualGrammar: hostContact.visualGrammar ?? "inactive",
        contactVerbSymbol: hostContact.contactVerbSymbol ?? "inactive",
        contactVerbSymbolIntensity01: Number(hostContact.contactVerbSymbolIntensity01 ?? 0),
        residueInteractionStage: hostContact.residueInteractionStage ?? "none",
        residueCohereTriggerCount: Number(hostContact.residueCohereTriggerCount ?? 0),
        projectionActive: Boolean(projection.active),
        projectionMode: projection.mode ?? "inactive",
        projectionModeChangeCount: Number(projection.modeChangeCount ?? 0),
        projectionSurfaceBraced: Boolean(projection.surfaceBraced),
        projectionBraceQuality01: Number(projection.braceQuality01 ?? 0),
        membraneCarry01: Number(imprint.membraneCarry01 ?? 0),
        scarBrace01: Number(imprint.scarBrace01 ?? 0),
        residueYield01: Number(imprint.residueYield01 ?? 0),
        residueCohesion01: Number(imprint.residueCohesion01 ?? 0)
      },
      community: {
        relationshipActive: Boolean(relationship.active),
        relationshipChangeCount: Number(relationship.changeCount ?? 0),
        relationshipChord: relationship.chord ?? "idle",
        relationshipPrimaryKey: relationship.primary?.entityId && relationship.primary.entityId !== "none"
          ? `${relationship.primary.entityId}:${relationship.primary.interpretation ?? "none"}`
          : "none",
        memoryCommitCount: Number(memory.commitCount ?? 0),
        memoryPrimaryKey: memory.primary?.entityId && memory.primary.entityId !== "none"
          ? `${memory.primary.entityId}:${memory.primary.mode ?? "none"}`
          : "none",
        behaviorChangeCount: Number(behavior.changeCount ?? 0),
        behaviorPrimaryKey: behavior.primary?.entityId && behavior.primary.entityId !== "none"
          ? `${behavior.primary.entityId}:${behavior.primary.mode ?? "none"}`
          : "none",
        matterActive: Boolean(matter.active),
        matterChangeCount: Number(matter.changeCount ?? 0),
        matterPrimaryKey: matter.primary?.entityId && matter.primary.entityId !== "none"
          ? `${matter.primary.entityId}:${matter.primary.mode ?? "none"}:${matter.primary.causalStage ?? "none"}`
          : "none"
      }
    };
  }

  collectPhysicalLanguageAnswer(frameState, targetId, baseline = null) {
    const kinds = [];
    const categories = new Set();
    const evidence = [];
    const current = this.capturePhysicalLanguageEvidence(frameState, targetId);
    const before = baseline ?? current;

    if (
      current.target.reactiveTargetId === targetId
      && current.target.reactiveCause !== "none"
      && (
        current.target.reactiveStateChangeCount > before.target.reactiveStateChangeCount
        || current.target.reactiveStage !== before.target.reactiveStage
        || current.target.reactiveCause !== before.target.reactiveCause
      )
    ) {
      kinds.push("target_reactive_condition");
      categories.add("chosen_target");
      evidence.push("target_reactive_state_changed");
    }
    if (
      current.pulseEventId > before.pulseEventId
      && current.target.pulseFocusedObject === targetId
      && current.target.pulseAffectedTarget
    ) {
      kinds.push("target_focused_pulse");
      categories.add("chosen_target");
      evidence.push("focused_pulse_event_changed_target");
    }
    if (
      current.target.bondObjectId === targetId
      && (
        (!before.target.bondActive && current.target.bondActive)
        || current.target.absorbProgress > before.target.absorbProgress + 0.01
      )
    ) {
      kinds.push("target_bond_draw");
      categories.add("chosen_target");
      evidence.push("target_absorb_progress_changed");
    }
    if (
      current.target.stabilizeTargetId === targetId
      && current.target.stabilizeProgress > before.target.stabilizeProgress + 0.02
    ) {
      kinds.push("target_stabilize_hold");
      categories.add("chosen_target");
      evidence.push("target_stabilize_progress_changed");
    }

    const hostImprintChanged = ["membraneCarry01", "scarBrace01", "residueYield01", "residueCohesion01"]
      .some((key) => Math.abs((current.host[key] ?? 0) - (before.host[key] ?? 0)) > 0.025);
    const hostExpressionChanged = current.host.active && (
      current.host.responseMode !== before.host.responseMode
      || current.host.visualGrammar !== before.host.visualGrammar
      || current.host.contactVerbSymbol !== before.host.contactVerbSymbol
      || Math.abs(current.host.contactVerbSymbolIntensity01 - before.host.contactVerbSymbolIntensity01) > 0.04
      || current.host.residueInteractionStage !== before.host.residueInteractionStage
      || current.host.residueCohereTriggerCount > before.host.residueCohereTriggerCount
      || hostImprintChanged
    );
    if (hostExpressionChanged) {
      kinds.push("host_anatomy_response");
      categories.add("host_anatomy");
      evidence.push("host_expression_changed_after_verb");
    }

    const projectionChanged = current.host.projectionActive && current.host.projectionSurfaceBraced && (
      current.host.projectionModeChangeCount > before.host.projectionModeChangeCount
      || current.host.projectionMode !== before.host.projectionMode
      || Math.abs(current.host.projectionBraceQuality01 - before.host.projectionBraceQuality01) > 0.02
    );
    if (projectionChanged) {
      kinds.push("surface_amplified_projection");
      categories.add("host_anatomy");
      evidence.push("surface_projection_state_changed_after_verb");
    }

    const relationshipChanged = current.community.relationshipActive && (
      current.community.relationshipChangeCount > before.community.relationshipChangeCount
      || current.community.relationshipPrimaryKey !== before.community.relationshipPrimaryKey
    );
    if (relationshipChanged && current.community.relationshipChord !== "idle") {
      kinds.push("community_interpretation");
      categories.add("community_ecology");
      evidence.push("community_relationship_changed_after_verb");
    }
    if (current.community.memoryCommitCount > before.community.memoryCommitCount) {
      kinds.push("community_retained_memory");
      categories.add("community_ecology");
      evidence.push("community_memory_committed_after_verb");
    }
    if (
      current.community.behaviorChangeCount > before.community.behaviorChangeCount
      && current.community.behaviorPrimaryKey !== "none"
    ) {
      kinds.push("community_reciprocal_behavior");
      categories.add("community_ecology");
      evidence.push("community_behavior_changed_after_verb");
    }
    if (
      current.community.matterActive
      && current.community.matterChangeCount > before.community.matterChangeCount
      && current.community.matterPrimaryKey !== before.community.matterPrimaryKey
    ) {
      kinds.push("community_local_matter_reply");
      categories.add("community_ecology");
      evidence.push("community_matter_changed_after_verb");
    }

    return {
      kinds: [...new Set(kinds)],
      categories: [...categories],
      evidence: [...new Set(evidence)],
      baselineFrame: before.frame ?? -1,
      answerFrame: current.frame ?? -1
    };
  }

  abandonPhysicalLanguageValidationChain(frameState, reason) {
    const probe = this.physicalLanguageValidation;
    const chain = probe?.activeChain;
    if (!chain) return;
    probe.abandonedCount += 1;
    this.record("validation.physical_language.chain_abandoned", "analysis", {
      percept: {
        chainId: chain.id,
        stage: chain.stage,
        stageIndex: chain.stageIndex,
        reason
      },
      developer: {
        targetId: chain.targetId,
        surfaceId: chain.surfaceId,
        hostInstrumentId: chain.hostInstrumentId ?? "none",
        anatomyUnitId: chain.anatomyUnitId ?? "none",
        primaryChord: chain.primaryChord,
        answerKinds: chain.answerKinds,
        elapsedSeconds: round(this.wallTime() - chain.startedWallT),
        gameplayAuthority: false
      }
    });
    probe.activeChain = null;
    probe.travelHoldSeconds = 0;
  }

  completePhysicalLanguageValidationChain(frameState) {
    const probe = this.physicalLanguageValidation;
    const chain = probe?.activeChain;
    if (!chain) return;
    probe.completedCount += 1;
    probe.bestStageIndex = Math.max(probe.bestStageIndex, 9);
    this.record("validation.physical_language.chain_completed", "analysis", {
      percept: {
        chainId: chain.id,
        target: this.aliasSource(chain.targetId),
        initialChord: chain.primaryChord,
        reinteractionChord: chain.reinteractionChord ?? "idle",
        answerCategories: chain.answerCategories
      },
      developer: {
        targetId: chain.targetId,
        initialSurfaceId: chain.surfaceId,
        initialHostInstrumentId: chain.hostInstrumentId ?? "none",
        initialAnatomyUnitId: chain.anatomyUnitId ?? "none",
        reacquiredSurfaceId: chain.reacquiredSurfaceId ?? "none",
        reinteractionTargetId: chain.reinteractionTargetId ?? "none",
        answerKinds: chain.answerKinds,
        answerEvidence: chain.answerEvidence ?? [],
        elapsedSeconds: round(this.wallTime() - chain.startedWallT),
        interpretation: "core_operated_through_host_contact_then_reentered_and_interacted_again",
        gameplayAuthority: false
      }
    });
    probe.activeChain = null;
    probe.travelHoldSeconds = 0;
  }

  captureMovementSample(frameState = this.frameState) {
    const k = frameState.playerKinematics ?? {};
    const sample = {
      t: this.wallTime(),
      wallT: this.wallTime(),
      simT: this.simTime(),
      frame: frameState.frame ?? 0,
      cell: this.aliasCell(frameState.activeCellId ?? "none"),
      position: this.roundVector(k.position),
      velocity: this.roundVector(k.velocity),
      speed: round(k.speed ?? 0),
      target: this.aliasSource(frameState.targeting?.targetId ?? "none"),
      attentionTarget: this.aliasSource(frameState.targeting?.attentionTargetId ?? "none"),
      attentionPhase: frameState.targeting?.attentionPhase ?? "none",
      attentionAimDot: round(frameState.targeting?.attentionAimDot ?? -1),
      attentionLossGraceRemaining: round(frameState.targeting?.attentionLossGraceRemaining ?? 0),
      relationshipTarget: this.aliasSource(frameState.targeting?.relationshipTargetId ?? "none"),
      physicalLanguageValidationStage: this.physicalLanguageValidation?.activeChain?.stage ?? "idle",
      physicalLanguageValidationStageIndex: this.physicalLanguageValidation?.activeChain?.stageIndex ?? 0,
      physicalLanguageValidationChain: this.physicalLanguageValidation?.activeChain?.id ?? "none",
      responsePersonality: frameState.responsePersonality?.activeChemPersonality?.family ?? "none",
      reactiveStage: frameState.reactiveStateGrammar?.focus?.stage ?? "none",
      beat: frameState.interactionComposition?.rhythm?.beat ?? "observe",
      semanticChangeAge: round(frameState.interactionComposition?.rhythmLock?.semanticChangeAge ?? 0),
      semanticStagnationRisk: Boolean(frameState.interactionComposition?.rhythmLock?.semanticStagnationRisk),
      informationGainAge: round(this.informationGainAge()),
      semanticChurnRisk: this.semanticChurnActive,
      semanticChurnScore: round(this.lastSemanticChurnScore),
      reserve01: round(frameState.corePerformance?.endurance?.reserve01 ?? 1),
      movementForces: {
        desiredMoveVector: this.roundVector(k.desiredMoveVector),
        environmentalForceVector: this.roundVector(k.environmentalForceVector),
        finalMoveVector: this.roundVector(k.finalMoveVector ?? k.velocity),
        convergenceEnvelope01: round(k.convergenceEnvelope01 ?? 0),
        convergenceEnvironmentScale: round(k.convergenceEnvironmentScale ?? 1),
        convergenceReachabilityActive: Boolean(k.convergenceReachabilityActive),
        topologyHandlingMode: k.topologyEnvironmentalHandling?.mode ?? "neutral",
        topologyEnvironmentalCouplingMultiplier: round(k.topologyEnvironmentalHandling?.environmentalCouplingMultiplier ?? 1),
        topologyFluidSlipDampingMultiplier: round(k.topologyEnvironmentalHandling?.fluidSlipDampingMultiplier ?? 1),
        topologyHandlingSuppressed: Boolean(k.topologyEnvironmentalHandling?.suppressed),
        attachmentActive: Boolean(frameState.playerAttachment?.active),
        attachmentState: frameState.playerAttachment?.state ?? "free",
        attachmentAuthority: frameState.playerAttachment?.authority ?? "none",
        attachmentSurfaceId: frameState.playerAttachment?.surfaceTruthSurfaceId ?? "none",
        attachmentReleaseTension: round(frameState.playerAttachment?.releaseTension ?? 0),
        attachmentPeelIntent01: round(frameState.playerAttachment?.peelIntent01 ?? 0),
        attachmentPeelHoldAge: round(frameState.playerAttachment?.peelHoldAge ?? 0),
        attachmentReleaseArmed: Boolean(frameState.playerAttachment?.releaseArmed),
        attachmentDetachReason: frameState.playerAttachment?.detachReason ?? "none",
        attachmentReacquireBlocked: Boolean(frameState.playerAttachment?.reacquireBlocked),
        attachmentReleaseSurfaceId: frameState.playerAttachment?.releaseSurfaceId ?? "none",
        attachmentReleaseClearance: round(frameState.playerAttachment?.releaseClearance ?? 0),
        attachmentOwnerSurfaceId: frameState.playerAttachment?.ownerSurfaceId ?? "none",
        attachmentOwnerAuthority: frameState.playerAttachment?.ownerAuthority ?? "none",
        attachmentContactGapActive: Boolean(frameState.playerAttachment?.contactGapActive),
        attachmentContactGapAge: round(frameState.playerAttachment?.contactGapAge ?? 0),
        attachmentContactGapTolerance: round(frameState.playerAttachment?.contactGapTolerance ?? 0),
        attachmentContinuityMode: frameState.playerAttachment?.continuityMode ?? "none",
        attachmentSupportIdentityTransferCount: frameState.playerAttachment?.supportIdentityTransferCount ?? 0,
        attachmentMomentumHandoffMode: frameState.playerAttachment?.momentumHandoffMode ?? "none",
        attachmentLandingHandoffAge: round(frameState.playerAttachment?.landingHandoffAge ?? 0),
        attachmentLandingHandoffDuration: round(frameState.playerAttachment?.landingHandoffDuration ?? 0),
        attachmentLandingCarry01: round(frameState.playerAttachment?.landingCarry01 ?? 0),
        attachmentLandingEntrySpeed: round(frameState.playerAttachment?.landingEntrySpeed ?? 0),
        attachmentLandingEntryTangentialSpeed: round(frameState.playerAttachment?.landingEntryTangentialSpeed ?? 0),
        attachmentLandingRetainedTangentialSpeed: round(frameState.playerAttachment?.landingRetainedTangentialSpeed ?? 0),
        attachmentReleaseInheritedTangentialSpeed: round(frameState.playerAttachment?.releaseInheritedTangentialSpeed ?? 0),
        attachmentReleaseNormalImpulse: round(frameState.playerAttachment?.releaseNormalImpulse ?? 0),
        attachmentPulsePeelAssist: round(frameState.playerAttachment?.pulsePeelAssist ?? 0),
        verbPhysicalGrammarMode: frameState.verbPhysicalGrammar?.mode ?? "idle",
        verbPhysicalRelationshipSource: frameState.verbPhysicalGrammar?.relationshipSource ?? "none",
        verbPhysicalEnvironmentalFlowMultiplier: round(frameState.verbPhysicalGrammar?.effects?.environmentalFlowMultiplier ?? 1),
        verbPhysicalSurfaceTractionMultiplier: round(frameState.verbPhysicalGrammar?.effects?.surfaceTractionMultiplier ?? 1),
        authoredSuctionSupportActive: Boolean(frameState.playerAttachment?.authoredSuctionSupportActive),
        authoredSuctionSupportCount: frameState.playerAttachment?.authoredSuctionSupportCount ?? 0,
        authoredSuctionSupportSurfaceId: frameState.playerAttachment?.authoredSuctionSupportSurfaceId ?? "none",
        anchorCarriedSurfaceIdentityActive: Boolean(frameState.playerAttachment?.anchorCarriedSurfaceIdentityActive),
        anchorCarriedSurfaceId: frameState.playerAttachment?.anchorCarriedSurfaceId ?? "none",
        anchorCarriedSurfaceMaterialFamily: frameState.playerAttachment?.anchorCarriedSurfaceMaterialFamily ?? "none",
        supportPlaneSource: frameState.coreTendrilSupportPlane?.source ?? "none",
        supportPlaneCurrentSurfaceTruthRequiredAfterSeal: Boolean(frameState.coreTendrilSupportPlane?.currentSurfaceTruthRequiredAfterSeal),
        tendrilLocomotionActive: Boolean(frameState.playerAttachment?.tendrilLocomotionActive),
        tendrilSupportCount: frameState.playerAttachment?.tendrilSupportCount ?? 0,
        tendrilSupportPlaneActive: Boolean(frameState.playerAttachment?.tendrilSupportPlaneActive),
        tendrilSupportPlaneQuality01: round(frameState.playerAttachment?.tendrilSupportPlaneQuality01 ?? 0),
        stabilizedProjectionActive: Boolean(frameState.stabilizedProjection?.active),
        stabilizedProjectionMode: frameState.stabilizedProjection?.mode ?? "inactive",
        stabilizedProjectionSurfaceBraced: Boolean(frameState.stabilizedProjection?.surfaceBraced),
        stabilizedProjectionBraceQuality01: round(frameState.stabilizedProjection?.braceQuality01 ?? 0),
        stabilizedProjectionLiveAnchorBraceActive: Boolean(frameState.stabilizedProjection?.liveAnchorBraceActive),
        stabilizedProjectionAttachmentContinuityBraceActive: Boolean(frameState.stabilizedProjection?.authoredAttachmentContinuityBraceActive),
        stabilizedProjectionContinuityStrength01: round(frameState.stabilizedProjection?.continuityStrength01 ?? 0),
        stabilizedProjectionExternalBraceSource: frameState.stabilizedProjection?.externalBraceSource ?? "none",
        stabilizedProjectionSurfaceId: frameState.stabilizedProjection?.surface?.id ?? "none",
        hostContactEcologyActive: Boolean(frameState.hostContactEcologyContinuation?.active),
        hostContactEcologySurfaceId: frameState.hostContactEcologyContinuation?.activeSurfaceId ?? "none",
        hostContactEcologyRole: frameState.hostContactEcologyContinuation?.activeRole ?? "none",
        hostContactEcologyResponseMode: frameState.hostContactEcologyContinuation?.responseMode ?? "inactive",
        hostContactVisualCue01: round(frameState.hostContactEcologyContinuation?.visualCue01 ?? 0),
        hostContactVisualGrammar: frameState.hostContactEcologyContinuation?.visualGrammar ?? "inactive",
        hostContactVisualCueSurfaceId: frameState.hostContactEcologyContinuation?.visualCueSurfaceId ?? "none",
        hostContactVerbSymbol: frameState.hostContactEcologyContinuation?.contactVerbSymbol ?? "inactive",
        hostContactVerbSymbolIntensity01: round(frameState.hostContactEcologyContinuation?.contactVerbSymbolIntensity01 ?? 0),
        hostContactVerbSymbolSurfaceId: frameState.hostContactEcologyContinuation?.contactVerbSymbolSurfaceId ?? "none",
        hostContactAttachmentSurfaceId: frameState.hostContactEcologyContinuation?.attachmentSurfaceId ?? "none",
        hostContactResidueInteractionStage: frameState.hostContactEcologyContinuation?.residueInteractionStage ?? "none",
        hostContactResidueCohereAttemptActive: Boolean(frameState.hostContactEcologyContinuation?.residueCohereAttemptActive),
        hostContactResidueCohereAttemptCount: frameState.hostContactEcologyContinuation?.residueCohereAttemptCount ?? 0,
        hostContactResidueCohereVisualHold01: round(frameState.hostContactEcologyContinuation?.residueCohereVisualHold01 ?? 0),
        hostContactResidueCohereTriggerCount: frameState.hostContactEcologyContinuation?.residueCohereTriggerCount ?? 0,
        hostContactMembraneCarry01: round(frameState.hostContactEcologyContinuation?.localImprint?.membraneCarry01 ?? 0),
        hostContactScarBrace01: round(frameState.hostContactEcologyContinuation?.localImprint?.scarBrace01 ?? 0),
        hostContactResidueYield01: round(frameState.hostContactEcologyContinuation?.localImprint?.residueYield01 ?? 0),
        hostContactResidueCohesion01: round(frameState.hostContactEcologyContinuation?.localImprint?.residueCohesion01 ?? 0)
      },
      routeState: {
        vascularResolved: Boolean(frameState.vascularRhythmRoute?.completed),
        siltResolved: Boolean(frameState.siltPressureRoute?.completed),
        convergenceAvailable: Boolean(frameState.hubInvestigationGameplay?.threeRouteConvergence?.available),
        convergenceCompleted: Boolean(frameState.hubInvestigationGameplay?.threeRouteConvergence?.completed),
        distanceToRequiredTransition: round(frameState.hubInvestigationGameplay?.threeRouteConvergence?.centerDistance ?? 0)
      },
      input: {
        move: {
          x: round(frameState.input?.moveX ?? 0),
          y: round(frameState.input?.moveY ?? 0),
          z: round(frameState.input?.moveZ ?? 0)
        },
        look: {
          x: round(frameState.input?.cameraLookX ?? 0),
          y: round(frameState.input?.cameraLookY ?? 0)
        },
        pulseHeld: Boolean(frameState.input?.pulseHeld),
        pulseCharge01: round(frameState.input?.pulseCharge01 ?? 0),
        absorbHeld: Boolean(frameState.input?.absorbHeld),
        stabilizeHeld: Boolean(frameState.input?.stabilizeHeld),
        boostHeld: Boolean(frameState.input?.boostHeld)
      }
    };
    this.movementSamples.push(sample);
    if (this.movementSamples.length > this.maxMovementSamples) this.movementSamples.shift();
    this.observeMovementProgressBlock(frameState, sample);
    this.summaryDirty = true;
  }

  observeMovementProgressBlock(frameState, sample) {
    const convergence = frameState.hubInvestigationGameplay?.threeRouteConvergence ?? {};
    const distance = convergence.centerDistance;
    const desired = frameState.playerKinematics?.desiredMoveVector ?? {};
    const center = convergence.centerPosition ?? null;
    const position = frameState.playerKinematics?.position ?? null;
    const inputMagnitude = frameState.playerKinematics?.inputMagnitude ?? 0;
    if (!convergence.available || convergence.completed || !Number.isFinite(distance) || !center || !position || inputMagnitude < 0.55) {
      this.progressBlockCandidateSince = null;
      this.progressBlockLastDistance = Number.isFinite(distance) ? distance : null;
      this.progressBlockEventActive = false;
      return;
    }

    const tx = (center.x ?? 0) - (position.x ?? 0);
    const ty = (center.y ?? 0) - (position.y ?? 0);
    const tz = (center.z ?? 0) - (position.z ?? 0);
    const tLen = Math.hypot(tx, ty, tz);
    const dLen = Math.hypot(desired.x ?? 0, desired.y ?? 0, desired.z ?? 0);
    const toward = tLen > 0.001 && dLen > 0.001
      ? ((desired.x ?? 0) * tx + (desired.y ?? 0) * ty + (desired.z ?? 0) * tz) / (tLen * dLen)
      : 0;
    if (toward < 0.45) {
      this.progressBlockCandidateSince = null;
      this.progressBlockLastDistance = distance;
      this.progressBlockEventActive = false;
      return;
    }

    const previous = this.progressBlockLastDistance;
    const meaningfulProgress = previous == null || distance < previous - 0.06;
    this.progressBlockLastDistance = distance;
    if (meaningfulProgress) {
      this.progressBlockCandidateSince = null;
      this.progressBlockEventActive = false;
      return;
    }

    const now = sample.wallT;
    if (this.progressBlockCandidateSince == null) this.progressBlockCandidateSince = now;
    const blockedFor = now - this.progressBlockCandidateSince;
    if (blockedFor >= 1 && !this.progressBlockEventActive) {
      this.progressBlockEventActive = true;
      this.record("movement.progress_blocked", "analysis", {
        percept: {
          destination: "hub_convergence_center",
          distance: round(distance),
          blockedSeconds: round(blockedFor),
          attachmentActive: Boolean(frameState.playerAttachment?.active)
        },
        developer: {
          desiredMoveVector: this.roundVector(desired),
          environmentalForceVector: this.roundVector(frameState.playerKinematics?.environmentalForceVector),
          convergenceEnvelope01: round(frameState.playerKinematics?.convergenceEnvelope01 ?? 0),
          boundaryBehavior: frameState.physicalFeel?.boundaryBehavior ?? "unknown"
        }
      });
    }
  }

  captureCoreSnapshot(reason = "interval", frameState = this.frameState) {
    const perf = frameState.corePerformance ?? {};
    const engine = frameState.coreEngine ?? {};
    const embodiment = frameState.coreEmbodiment ?? {};
    const chemistry = frameState.spatialCoreChemistry ?? {};
    const snapshot = {
      t: this.wallTime(),
      wallT: this.wallTime(),
      simT: this.simTime(),
      frame: frameState.frame ?? 0,
      reason,
      personality: perf.personality ?? "forming / neutral",
      topology: {
        developerId: perf.topologyId ?? "forming_topology",
        distribution: perf.distribution ?? "0:0:0",
        weights: this.coreWeights(frameState)
      },
      endurance: {
        reserve01: round(perf.endurance?.reserve01 ?? 1),
        demand01: round(perf.endurance?.demand01 ?? 0),
        instabilityRisk01: round(perf.endurance?.instabilityRisk01 ?? 0)
      },
      engine: {
        phaseCount: engine.phaseCount ?? 3,
        currentPhaseIndex: engine.currentPhaseIndex ?? 0,
        currentPhaseLabel: engine.currentPhaseLabel ?? "unknown",
        rpm: round(engine.rpm ?? 0, 0),
        load01: round(engine.load01 ?? engine.load ?? 0)
      },
      resonance: {
        active: Boolean(frameState.coreWorldResonance?.active),
        relation: frameState.coreWorldResonance?.relationshipState ?? "inactive",
        coherence01: round(frameState.coreWorldResonance?.coherence01 ?? 0),
        phaseAlignment01: round(frameState.coreWorldResonance?.phaseAlignment01 ?? 0),
        worldFunction: frameState.coreWorldResonance?.worldFunction ?? "none"
      },
      topologyResonance: {
        active: Boolean(frameState.coreTopologyResonance?.active),
        mode: frameState.coreTopologyResonance?.mode ?? "forming",
        response01: round(frameState.coreTopologyResonance?.properties?.response01 ?? 0.5),
        inertia01: round(frameState.coreTopologyResonance?.properties?.inertia01 ?? 0.5),
        coherence01: round(frameState.coreTopologyResonance?.properties?.coherence01 ?? 0.5),
        exposure01: round(frameState.coreTopologyResonance?.properties?.exposure01 ?? 0.447),
        worldImprint01: round(frameState.coreTopologyResonance?.presentation?.worldImprint01 ?? 0)
      },
      topologyEnvironmentalHandling: {
        active: Boolean(frameState.coreTopologyEnvironmentalHandling?.active),
        mode: frameState.coreTopologyEnvironmentalHandling?.handling?.mode ?? "neutral",
        environmentalCouplingMultiplier: round(frameState.coreTopologyEnvironmentalHandling?.handling?.environmentalCouplingMultiplier ?? 1),
        fluidSlipDampingMultiplier: round(frameState.coreTopologyEnvironmentalHandling?.handling?.fluidSlipDampingMultiplier ?? 1),
        appliedEnvironmentalCouplingMultiplier: round(frameState.playerKinematics?.topologyEnvironmentalHandling?.environmentalCouplingMultiplier ?? 1),
        appliedFluidSlipDampingMultiplier: round(frameState.playerKinematics?.topologyEnvironmentalHandling?.fluidSlipDampingMultiplier ?? 1),
        suppressed: Boolean(frameState.playerKinematics?.topologyEnvironmentalHandling?.suppressed)
      },
      topologyVerbCharacter: {
        active: Boolean(frameState.coreTopologyVerbCharacter?.active),
        mode: frameState.coreTopologyVerbCharacter?.mode ?? "forming",
        pulseContourPersistenceScale: round(frameState.coreTopologyVerbCharacter?.pulse?.contourPersistenceScale ?? 1),
        absorbHelixRateScale: round(frameState.coreTopologyVerbCharacter?.absorb?.helixRateScale ?? 1),
        stabilizeWobbleScale: round(frameState.coreTopologyVerbCharacter?.stabilize?.wobbleScale ?? 1),
        audioTailScale: round(frameState.coreTopologyVerbCharacter?.audio?.tailScale ?? 1)
      },
      composition: {
        retainedPieces: chemistry.retainedPieceCount ?? null,
        placementDistribution: chemistry.topology?.distribution ?? perf.distribution ?? "unknown",
        growthStage: frameState.coreGrowth?.displayStage ?? frameState.coreGrowth?.stageId ?? "unknown",
        visualRecipe: embodiment.bodyRecipe ?? "unknown"
      }
    };
    this.coreSnapshots.push(snapshot);
    if (this.coreSnapshots.length > this.maxCoreSnapshots) this.coreSnapshots.shift();
    this.summaryDirty = true;
    this.lastCoreSnapshotAt = this.wallTime();
  }

  record(type, channel, { percept = {}, developer = {} } = {}) {
    const wallT = this.wallTime();
    const simT = this.simTime();
    const event = {
      seq: ++this.sequence,
      t: wallT,
      wallT,
      simT,
      frame: this.frameState.frame ?? 0,
      type,
      channel,
      cell: this.aliasCell(this.frameState.activeCellId ?? "none"),
      percept,
      developer
    };
    this.events.push(event);
    if (this.events.length > this.maxEvents) this.events.shift();
    this.summaryDirty = true;
    this.lastEvent = event;
    return event;
  }

  mark(label = "manual_playtest_marker") {
    this.manualMarkerCount += 1;
    const context = this.recentContext(12);
    return this.record("playtest.marker", "internal", {
      percept: {
        markerNumber: this.manualMarkerCount,
        label,
        wallClockIso: new Date(this.startedAtEpochMs + this.wallTime() * 1000).toISOString(),
        context,
        detectorAgreement: context.semanticChurnActive ? "semantic_churn_active" : context.informationGainAge >= 6 ? "low_gain_unconfirmed" : "no_churn_detected"
      },
      developer: {
        source: "manual_shift_m",
        currentCellId: this.frameState.activeCellId ?? "none",
        currentTargetId: this.frameState.targeting?.targetId ?? "none"
      }
    });
  }

  exportSession() {
    return {
      schemaVersion: this.schemaVersion,
      session: {
        id: this.sessionId,
        baselineId: this.baselineId,
        buildId: this.frameState.buildId ?? "unknown",
        buildLabel: this.frameState.buildLabel ?? "unknown",
        startedAtIso: this.startedAtIso,
        startedAtEpochMs: this.startedAtEpochMs,
        durationSeconds: this.wallTime(),
        wallDurationSeconds: this.wallTime(),
        simDurationSeconds: this.simTime(),
        wallMinusSimSeconds: round(this.wallTime() - this.simTime()),
        exportedAtIso: new Date().toISOString(),
        telemetryAuthority: "read_only_observer",
        gameplayAuthority: false,
        implementationPass: this.physicalLanguageValidation?.pass ?? this.frameState.buildId ?? "unknown"
      },
      summary: this.buildSummary(),
      events: this.events,
      movementSamples: this.movementSamples,
      coreSnapshots: this.coreSnapshots,
      developerTruth: {
        sourceAliasMap: Object.fromEntries(this.sourceInternalByAlias.entries()),
        semanticAliasMap: Object.fromEntries(this.semanticInternalByAlias.entries()),
        implementationPass: this.physicalLanguageValidation?.pass ?? this.frameState.buildId ?? "unknown",
        note: "Later AI perceptual-firewall consumers must not receive developerTruth."
      }
    };
  }

  buildSummary() {
    if (!this.summaryDirty && this.summaryCache) return this.summaryCache;
    const count = (type) => this.events.filter((event) => event.type === type).length;
    const durationFor = (kind) => this.events
      .filter((event) => event.type === `verb.${kind}.ended`)
      .reduce((sum, event) => sum + (event.percept?.durationSeconds ?? 0), 0);
    const finalPerf = this.frameState.corePerformance ?? {};
    const summary = {
      durationSeconds: this.wallTime(),
      wallDurationSeconds: this.wallTime(),
      simDurationSeconds: this.simTime(),
      wallMinusSimSeconds: round(this.wallTime() - this.simTime()),
      eventCount: this.events.length,
      movementSampleCount: this.movementSamples.length,
      coreSnapshotCount: this.coreSnapshots.length,
      pulseReleases: count("verb.pulse.released"),
      quickPulses: this.events.filter((event) => event.type === "verb.pulse.released" && event.percept?.releaseKind === "quick").length,
      chargedPulses: this.events.filter((event) => event.type === "verb.pulse.released" && event.percept?.releaseKind === "charged").length,
      sonarReturns: count("sonar.return"),
      deepSonarReturns: this.events.filter((event) => event.type === "sonar.return" && event.developer?.reachClass === "deep_structural").length,
      resolutionIncreases: count("sonar.resolution.increased"),
      absorbUses: count("verb.absorb.started"),
      absorbHeldSeconds: round(durationFor("absorb")),
      stabilizeUses: count("verb.stabilize.started"),
      stabilizeHeldSeconds: round(durationFor("stabilize")),
      consequences: count("host.consequence.started"),
      relationships: count("host.relationship.emerged"),
      semanticStagnationEntries: count("rhythm.semantic_stagnation.entered"),
      semanticChurnEntries: count("rhythm.semantic_churn.entered"),
      informationGainEvents: count("semantic.information_gain"),
      informationGainScore: round(this.informationGainScore),
      redundantMaxResolutionReturns: count("sonar.redundant_max_resolution"),
      attemptOutcomes: count("analysis.attempt.outcome"),
      noGainAttempts: this.events.filter((event) => event.type === "analysis.attempt.outcome" && event.percept?.outcome === "no_gain").length,
      cellChanges: count("world.cell.changed"),
      manualMarkers: count("playtest.marker"),
      routeResolutions: count("route.resolved"),
      transitionAvailabilityEvents: count("transition.available"),
      transitionEntries: count("transition.entered"),
      movementProgressBlockedEvents: count("movement.progress_blocked"),
      attentionOwnerChanges: count("attention.owner.changed"),
      attentionPhaseChanges: count("attention.phase.changed"),
      relationshipTargetChanges: count("attention.target.changed"),
      physicalLanguageChainsStarted: count("validation.physical_language.chain_started"),
      physicalLanguageChainsCompleted: count("validation.physical_language.chain_completed"),
      physicalLanguageChainsAbandoned: count("validation.physical_language.chain_abandoned"),
      physicalLanguageWorldAnswers: count("validation.physical_language.world_answer"),
      physicalLanguageHostAnatomyAnswers: this.events.filter((event) => (
        event.type === "validation.physical_language.world_answer"
        && (event.percept?.answerCategories ?? []).includes("host_anatomy")
      )).length,
      physicalLanguageCommunityAnswers: this.events.filter((event) => (
        event.type === "validation.physical_language.world_answer"
        && (event.percept?.answerCategories ?? []).includes("community_ecology")
      )).length,
      physicalLanguageChosenTargetAnswers: this.events.filter((event) => (
        event.type === "validation.physical_language.world_answer"
        && (event.percept?.answerCategories ?? []).includes("chosen_target")
      )).length,
      physicalLanguageBestStageIndex: this.physicalLanguageValidation?.bestStageIndex ?? 0,
      hostAnatomyIdentityChanges: count("validation.host_anatomy.identity_changed"),
      hostAnatomySameUnitTransfers: this.events.filter((event) => (
        event.type === "validation.host_anatomy.identity_changed"
        && event.percept?.sameAnatomyUnit === true
      )).length,
      hostAnatomySameInstrumentTransfers: this.events.filter((event) => (
        event.type === "validation.host_anatomy.identity_changed"
        && event.percept?.sameHostInstrument === true
      )).length,
      surfaceDetachments: count("movement.surface_detached"),
      deliberateSurfaceDetachments: this.events.filter((event) => (
        event.type === "movement.surface_detached"
        && event.percept?.deliberate === true
      )).length,
      surfaceAttachments: count("movement.surface_attached"),
      surfaceBrushes: count("movement.surface_brush"),
      surfaceContactGapTolerations: count("movement.surface_contact_gap_tolerated"),
      surfaceSupportIdentityTransfers: count("movement.surface_support_identity_transferred"),
      surfaceReacquireUnblocks: count("movement.surface_reacquire_unblocked"),
      coreWorldResonanceChanges: count("core.world_resonance.changed"),
      coreTopologyResonanceModeChanges: count("core.topology_resonance.mode_changed"),
      coreTopologyEnvironmentalHandlingModeChanges: count("core.topology_environmental_handling.mode_changed"),
      coreTopologyVerbCharacterModeChanges: count("core.topology_verb_character.mode_changed"),
      entityEcologyResonanceModeChanges: count("ecology.entity_resonance.mode_changed"),
      entityRelationshipGrammarChanges: count("ecology.entity_relationship.changed"),
      entityReciprocalMemoryCommits: count("ecology.entity_reciprocal_memory.committed"),
      entityReciprocalBehaviorChanges: count("ecology.entity_reciprocal_behavior.changed"),
      entityLocalMatterCouplingChanges: count("ecology.entity_local_matter_coupling.changed"),
      entityEcologicalResidueChanges: count("ecology.entity_ecological_residue.changed"),
      entityResidueRecognitionChanges: count("ecology.entity_residue_recognition.changed"),
      entityEcologicalCrossInfluenceChanges: count("ecology.entity_cross_influence.changed"),
      coreVerbEngineChordChanges: count("core.verb_engine.chord_changed"),
      verbPhysicalGrammarChanges: count("movement.verb_physical_grammar.changed"),
      reactiveStateChanges: count("chem.reactive_state.changed"),
      returnRegionStateChanges: count("return_region.state_changed"),
      returnRegionCredits: this.frameState.returnRegionEngine?.creditCount ?? 0,
      returnRegionUnlockedPhaseCount: this.frameState.returnRegionEngine?.unlockedPhaseCount ?? 3,
      telemetryEventCapacity: this.maxEvents,
      deliberateCommitments: count("action.deliberate_commitment"),
      reservedCommitPresses: count("action.commit_pressed"),
      finalCore: {
        personality: finalPerf.personality ?? "forming / neutral",
        weights: this.coreWeights(this.frameState),
        reserve01: round(finalPerf.endurance?.reserve01 ?? 1),
        topologyId: finalPerf.topologyId ?? "forming_topology"
      }
    };
    this.summaryCache = summary;
    this.summaryDirty = false;
    return summary;
  }

  publish(frameState) {
    frameState.sessionTelemetry = {
      pass: "HC-028D1",
      active: true,
      schemaVersion: this.schemaVersion,
      sessionId: this.sessionId,
      baselineId: this.baselineId,
      eventCount: this.events.length,
      movementSampleCount: this.movementSamples.length,
      coreSnapshotCount: this.coreSnapshots.length,
      lastEventType: this.lastEvent?.type ?? "session.started",
      lastEventAt: this.lastEvent?.wallT ?? this.lastEvent?.t ?? 0,
      wallDurationSeconds: round(this.wallTime()),
      simDurationSeconds: round(this.simTime()),
      wallMinusSimSeconds: round(this.wallTime() - this.simTime()),
      informationGainAge: round(this.informationGainAge()),
      informationGainCount: this.informationGainCount,
      informationGainScore: round(this.informationGainScore),
      semanticChurnActive: this.semanticChurnActive,
      semanticChurnScore: round(this.lastSemanticChurnScore),
      semanticChurnContext: this.lastSemanticChurnContext,
      redundantMaxResolutionReturns: this.redundantMaxResolutionReturns,
      noGainAttempts: this.noGainAttempts,
      storageStatus: this.lastPersistStatus,
      exportHotkey: "Shift+T",
      markerHotkey: "Shift+M",
      serverTransport: "not_added_hc028a",
      perceptualFirewallReady: true,
      developerTruthSeparated: true,
      readOnlyObserver: true,
      gameplayAuthority: false,
      physicalLanguageValidation: {
        pass: "HC-031N1",
        active: Boolean(this.physicalLanguageValidation?.activeChain),
        chainId: this.physicalLanguageValidation?.activeChain?.id ?? "none",
        stage: this.physicalLanguageValidation?.activeChain?.stage ?? "idle",
        stageIndex: this.physicalLanguageValidation?.activeChain?.stageIndex ?? 0,
        completedCount: this.physicalLanguageValidation?.completedCount ?? 0,
        abandonedCount: this.physicalLanguageValidation?.abandonedCount ?? 0,
        bestStageIndex: this.physicalLanguageValidation?.bestStageIndex ?? 0,
        rule: "observe_locked_language_post_verb_causality_no_gameplay_feedback"
      },
      summary: this.buildSummary()
    };
  }

  persist(force = false) {
    const now = this.wallTime();
    if (!force && now - this.lastPersistAtWall < this.persistIntervalSeconds) return false;
    this.lastPersistAtWall = now;
    if (typeof localStorage === "undefined") {
      this.lastPersistStatus = "storage_unavailable";
      return false;
    }
    try {
      const session = this.exportSession();
      const sessionKey = `blob.telemetry.session.${this.sessionId}`;
      localStorage.setItem(sessionKey, JSON.stringify(session));
      const indexKey = "blob.telemetry.session.index.v1";
      const existing = JSON.parse(localStorage.getItem(indexKey) ?? "[]");
      const filtered = existing.filter((item) => item?.id !== this.sessionId);
      filtered.unshift({ id: this.sessionId, startedAtIso: this.startedAtIso, buildId: this.frameState.buildId ?? "unknown", baselineId: this.baselineId });
      const retained = filtered.slice(0, 4);
      localStorage.setItem(indexKey, JSON.stringify(retained));
      for (const stale of filtered.slice(4)) localStorage.removeItem(`blob.telemetry.session.${stale.id}`);
      this.lastPersistStatus = "persisted_local";
      return true;
    } catch (error) {
      this.lastPersistStatus = `persist_failed:${error?.name ?? "error"}`;
      return false;
    }
  }

  download() {
    this.record("telemetry.exported", "internal", { percept: { method: "json_download" } });
    const data = this.exportSession();
    this.persist(true);
    if (typeof document === "undefined" || typeof URL === "undefined" || typeof Blob === "undefined") return data;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `BLOB_${this.frameState.buildId ?? "build"}_${this.sessionId}.json`;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(href), 0);
    this.publish(this.frameState);
    return data;
  }

  onKeyDown(event) {
    if (event.repeat || !event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.code === "KeyT") {
      this.download();
      event.preventDefault();
    } else if (event.code === "KeyM") {
      this.mark();
      this.persist(true);
      this.publish(this.frameState);
      event.preventDefault();
    }
  }

  installBrowserApi() {
    if (typeof window === "undefined") return;
    window.BLOB_TELEMETRY = {
      schemaVersion: this.schemaVersion,
      getSession: () => this.exportSession(),
      download: () => this.download(),
      mark: (label) => this.mark(label || "manual_playtest_marker"),
      persist: () => this.persist(true),
      getSummary: () => this.buildSummary()
    };
  }

  verbModifierSnapshot(frameState, kind) {
    if (kind === "boost") return { movement: frameState.corePerformance?.movementModifiers ?? {} };
    return frameState.corePerformance?.verbModifiers?.[kind] ?? {};
  }

  coreWeights(frameState) {
    const weights = frameState.corePerformance?.weights ?? {};
    return {
      deep: round(weights.deep ?? 1 / 3),
      inner: round(weights.inner ?? 1 / 3),
      membrane: round(weights.membrane ?? 1 / 3)
    };
  }

  aliasSource(internalId) {
    const key = String(internalId ?? "none");
    if (key === "none" || key === "") return "none";
    if (!this.sourceAliasByInternalId.has(key)) {
      const alias = `anon_${String(this.sourceAliasByInternalId.size + 1).padStart(3, "0")}`;
      this.sourceAliasByInternalId.set(key, alias);
      this.sourceInternalByAlias.set(alias, key);
    }
    return this.sourceAliasByInternalId.get(key);
  }

  aliasCell(cellId) {
    const key = String(cellId ?? "none");
    if (key === "none") return "none";
    return `cell_${this.simpleHash(key)}`;
  }

  aliasSemantic(value, prefix = "semantic") {
    const key = String(value ?? "unknown");
    if (!key || key === "none") return "none";
    if (!this.semanticAliasByInternalId.has(key)) {
      const alias = `${prefix}_${String(this.semanticAliasByInternalId.size + 1).padStart(3, "0")}`;
      this.semanticAliasByInternalId.set(key, alias);
      this.semanticInternalByAlias.set(alias, key);
    }
    return this.semanticAliasByInternalId.get(key);
  }

  simpleHash(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36).slice(0, 7);
  }

  roundVector(vector) {
    if (!vector) return { x: 0, y: 0, z: 0 };
    return { x: round(vector.x ?? 0), y: round(vector.y ?? 0), z: round(vector.z ?? 0) };
  }

  nowMs() {
    return Reflect.apply(this._monotonicNowMs, null, []);
  }

  wallTime() {
    return round(Math.max(0, (this.nowMs() - this.startedAtWallMs) / 1000));
  }

  simTime() {
    return round(Math.max(0, (this.frameState.runtimeSeconds ?? 0) - this.startedAtRuntime));
  }

  time() {
    return this.wallTime();
  }

  makeSessionId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    const random = Math.random().toString(36).slice(2, 10);
    return `hc028a-${Date.now().toString(36)}-${random}`;
  }
}
