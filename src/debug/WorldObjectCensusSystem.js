// LS1D1D2B: read-only identity bridge diagnostic. Does not register targets or alter progression.
const safe = value => String(value ?? 'none').slice(0, 100);
export class WorldObjectCensusSystem {
  constructor({ scene, frameState, hostConnectionReceiptLedger = null }) {
    this.scene = scene;
    this.frameState = frameState;
    // C0D4: read-only access to Host-owned channels; does not publish or consume.
    this.hostConnectionReceiptLedger = hostConnectionReceiptLedger;
    this.panel = null;
    this.visible = false;
    this.lastReport = null;
    this.captureActive = false;
    this.captureEvents = [];
    this.captureAggregate = this.newCaptureAggregate();
    this.lastHostConnectionSequence = 0;
    this.captureStartedAt = null;
    this.captureStoppedAt = null;
    this.capturePullBaseline = null;
    this.captureTimer = null;
    this.capturePrevious = null;
    this.inputPrevious = null;
    this.captureTick = 0;
    this.authorityPrevious = null;
    this.lastSiltDecisionSequence = null;
    this.lastVascularPresentationSampleMs = null;
    this.lastCircuitState = null;
    this.bot1cLastWitnessSignature = null;
    this.bot1cLastNurserySignature = null;
    this.bot1dLastFoldSignature = null;
    // GUIDE0-W: read-only cross-owner audit; never used by an input policy.
    this.guide0LastSignature = null;
    this.guide0LastCheckpointMs = null;
    this.guide0LastPulseId = null;
    this.guide0LastOutcomeSequence = null;
    // GSL-4E2F-OBS1: recorder-only interpretation snapshot deduplication.
    this.gslObservationPrevious = null;
    this.lastCircuitVascularSequence = 0;
    this.lastCircuitGraveSequence = 0;
    // C0D4-MOB1: observer only. All locomotion/input ownership stays external.
    this.mobPrevious = null;
    this.mobBlockSinceMs = null;
    this.mobBlockReported = null;
    this.mobLastSampleMs = null;
    this.c0e2bLastVolumeSignature = null;
    this.c0e2bLastApproachMs = null;
    this.mobLastActionSignature = null;
    this.mobPendingActions = [];
    this.territoryVisitKeys = new Set();
    this.territoryLastReadKey = null;
    this.recIndicator = null;
    this.recNoticeTimeout = null;
    this.keyHandler = event => {
      if (event.altKey && event.shiftKey && event.code === 'KeyR') { event.preventDefault(); if (!event.repeat) this.toggleCapture(); return; }
      if (event.altKey && event.shiftKey && event.code === 'KeyE') { event.preventDefault(); if (!event.repeat) this.exportTimeline(); return; }
      if (this.captureActive && !event.repeat) this.recordEvent('keyboard-down', { code: event.code, shift: event.shiftKey, alt: event.altKey, ctrl: event.ctrlKey, target: this.materialContext() });
      if (event.code === 'F4') { event.preventDefault(); this.toggle(); }
      if (event.code === 'F5' && this.visible) { event.preventDefault(); this.exportReport(); }
    };
  }
  init() {
    if (this.recorderInitialized) return;
    this.recorderInitialized = true;
    window.addEventListener('keydown', this.keyHandler);
    this.keyUpHandler = event => {
      if (this.captureActive) this.recordEvent('keyboard-up', { code: event.code, target: this.materialContext() });
    };
    window.addEventListener('keyup', this.keyUpHandler);
    this.createRecordIndicator();
  }
  createRecordIndicator() {
    if (this.recIndicator || typeof document === 'undefined' || !document.body) return;
    const element = document.createElement('div');
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-label', 'BLOB observation recording status');
    element.style.cssText = 'position:fixed;top:12px;left:12px;z-index:100002;pointer-events:none;display:none;padding:7px 10px;background:rgba(8,14,20,.93);border:1px solid rgba(238,99,99,.8);border-radius:7px;color:#fff;font:600 12px/1.4 monospace;letter-spacing:.04em;box-shadow:0 2px 14px rgba(0,0,0,.35)';
    document.body.appendChild(element);
    this.recIndicator = element;
  }
  updateRecordIndicator(message = null) {
    this.createRecordIndicator();
    if (!this.recIndicator) return;
    if (this.recNoticeTimeout) { clearTimeout(this.recNoticeTimeout); this.recNoticeTimeout = null; }
    if (this.captureActive) {
      const elapsed = this.captureStartedAt ? Math.floor(Math.max(0, Date.now() - Date.parse(this.captureStartedAt)) / 1000) : 0;
      const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const seconds = String(elapsed % 60).padStart(2, '0');
      // C0C-REC1: show that details are retained from the start of the capture.
      // Long sessions may create larger files; they do NOT silently roll over.
      const eventLabel = this.captureEvents.length.toLocaleString('en-US');
      const sizeHint = this.captureEvents.length >= 10000 ? '  ·  LARGE FILE' : '';
      this.recIndicator.textContent = `● REC ${minutes}:${seconds}  ·  ${eventLabel} events  ·  FULL${sizeHint}  ·  Alt+Shift+R stop`;
      this.recIndicator.style.display = 'block';
      return;
    }
    if (message) {
      this.recIndicator.textContent = message;
      this.recIndicator.style.display = 'block';
      this.recNoticeTimeout = setTimeout(() => {
        if (!this.captureActive && this.recIndicator) this.recIndicator.style.display = 'none';
        this.recNoticeTimeout = null;
      }, 3500);
    } else {
      this.recIndicator.style.display = 'none';
    }
  }
  // C0C-REC1: observed counters and detailed event chronology now span the
  // whole capture. The 64-decision Silt source ring and 150ms sampling may
  // still miss *source* events; this recorder cannot reconstruct such gaps.
  newCaptureAggregate() {
    return { eventCounts: {}, routeDecisionCounts: {}, contactOutcomes: {},
      seatOutcomes: {}, trajectoryOutcomes: {}, recordedEvents: 0, droppedDetails: 0,
      routeDecisionsObserved: 0, decisionTraceGaps: 0,
      heldMotion: { pulseOutward: 0, pulseAtBound: 0, pulseBraced: 0,
        absorbInward: 0, absorbAtBound: 0, totalPulseDisplacement: 0, totalAbsorbDisplacement: 0 } };
  }
  captureCountEvent(event) {
    const acc = this.captureAggregate;
    acc.recordedEvents++;
    acc.eventCounts[event.type] = (acc.eventCounts[event.type] ?? 0) + 1;
    if (event.type === 'silt-decision-trace-gap') acc.decisionTraceGaps++;
    if (event.type !== 'silt-authoritative-route-decision') return;
    const d = event.decision ?? {};
    acc.routeDecisionsObserved++;
    const key = `${d.kind ?? 'unknown'}:${d.route ?? d.decision ?? d.outcome ?? 'unknown'}`;
    acc.routeDecisionCounts[key] = (acc.routeDecisionCounts[key] ?? 0) + 1;
    if (d.kind === 'silt-contact') {
      const k = d.outcome ?? 'unknown';
      acc.contactOutcomes[k] = (acc.contactOutcomes[k] ?? 0) + 1;
    }
    if (d.kind === 'silt-seat') {
      const k = d.outcome ?? 'unknown';
      acc.seatOutcomes[k] = (acc.seatOutcomes[k] ?? 0) + 1;
    }
    if (d.kind === 'silt-trajectory') {
      const k = d.outcome ?? 'unknown';
      acc.trajectoryOutcomes[k] = (acc.trajectoryOutcomes[k] ?? 0) + 1;
    }
    if (d.kind !== 'held-material-motion') return;
    const motion = acc.heldMotion;
    if (d.verb === 'pulse') {
      if (d.outcome === 'stabilized-contact-resistance') motion.pulseBraced++;
      else if (d.appliedDisplacement > 0) motion.pulseOutward++;
      else motion.pulseAtBound++;
      motion.totalPulseDisplacement += Number(d.appliedDisplacement ?? 0);
    }
    if (d.verb === 'absorb') {
      if (d.appliedDisplacement > 0) motion.absorbInward++;
      else motion.absorbAtBound++;
      motion.totalAbsorbDisplacement += Number(d.appliedDisplacement ?? 0);
    }
  }
  sampleHostConnections() {
    const ledger = this.frameState?.hostConnections;
    if (!ledger || !Number.isFinite(ledger.sequence)) return;
    const fresh = (ledger.records ?? []).filter(r => r.sequence > this.lastHostConnectionSequence)
      .sort((a,b) => a.sequence - b.sequence);
    if (fresh.length && fresh[0].sequence > this.lastHostConnectionSequence + 1) {
      this.recordEvent('host-connection-receipt-gap', {firstAvailableSequence:fresh[0].sequence, previousSequence:this.lastHostConnectionSequence});
    }
    for (const record of fresh) {
      this.recordEvent('host-silt-cause-observed', {cause: record,
        caveat: 'Silt release provenance only; Vascular has not received material or circulation force.'});
      this.lastHostConnectionSequence = record.sequence;
    }
  }
  sampleVascularSiltResponse() {
    const receiver = this.frameState?.vascularRhythmRoute?.siltSignalResponse;
    if (!receiver || !Number.isSafeInteger(receiver.receivedTotal)) return;
    const previous = this.lastVascularReceivedSequence ?? 0;
    const fresh = (receiver.recentReceipts ?? []).filter(r => r.sequence > previous)
      .sort((a,b) => a.sequence - b.sequence);
    if (fresh.length && fresh[0].sequence > previous + 1) {
      this.recordEvent('vascular-receiver-receipt-gap', {
        previousSequence: previous, firstAvailableSequence: fresh[0].sequence
      });
    }
    for (const record of fresh) {
      this.recordEvent('vascular-silt-signal-received', {
        receipt: record,
        receiverCellId: receiver.receiverCellId,
        caveat: 'Vascular-local membrane and directional-current adjustment only; no matter, route credit, or off-route simulation.'
      });
      this.lastVascularReceivedSequence = record.sequence;
    }
  }
  // C0C-TRACE1-B: low-frequency post-render-object-value capture.
  sampleVascularPresentation() {
    const trace = this.frameState?.vascularRhythmRoute?.presentationTrace;
    if (!trace || trace.revision !== 'C0C-TRACE1-B') return;
    const now = Date.now();
    if (this.lastVascularPresentationSampleMs !== null
        && now - this.lastVascularPresentationSampleMs < 500) return;
    this.lastVascularPresentationSampleMs = now;
    this.recordEvent('vascular-presentation-sample', { presentation: trace });
  }
  // C0D4-OBS1: event-triggered snapshots of already-published owner state.
  // No gameplay methods, simulation clocks or progression writers are called.
  circuitSnapshot() {
    const fs = this.frameState ?? {};
    const host = this.hostConnectionReceiptLedger;
    const g = fs.graveMemoryRoute ?? {};
    const m = fs.graveVascularEffectMemory ?? {};
    const r = fs.graveReturnRegion ?? {};
    const q = fs.graveResonanceGameplay ?? {};
    const e = fs.returnRegionEngine ?? {};
    const f = fs.siltPressureRoute?.graveIIPressureFeedback ?? {};
    const inherited = e.graveLayout?.inputs?.c0d3GraveIIHostMemory ?? {};
    const latched = r.layoutInputs?.c0d3GraveIIHostMemory ?? {};
    return {
      cell: { activeCellId: fs.activeCellId ?? null },
      graveI: {
        active: g.active === true, stage: g.stage ?? null,
        completed: g.completed === true, returnFoldReady: g.returnFoldReady === true,
        readCount: g.readCount ?? 0, memorySiltStabilized: g.memorySiltStabilized === true,
        safeMemoryTransferComplete: g.safeMemoryTransferComplete === true,
        graveMemoryImprintCommitted: g.graveMemoryImprintCommitted === true,
        riskEventCount: g.riskEventCount ?? 0,
      },
      graveMemory: {
        active: m.active === true, receivedTotal: m.receivedTotal ?? 0,
        lastHostSequence: m.lastHostSequence ?? 0,
        lastVascularEffectId: m.lastVascularEffectId ?? null,
        lastParentSiltReceiptId: m.lastParentSiltReceiptId ?? null,
        memoryPressure: m.memoryPressure ?? 0,
        gapRejectedTotal: m.gapRejectedTotal ?? 0,
        gameplayConsequenceApplied: m.gameplayConsequenceApplied === true,
        recoveryMultiplier: m.recoveryCoupling?.multiplier ?? 1,
        assistedRecoveryObserved: (m.recoveryCoupling?.assistedRecoveryTicks ?? 0) > 0
      },
      graveII: {
        active: r.active === true, completed: r.completed === true,
        phase: r.phase ?? null, layoutEquationId: r.layoutEquationId ?? null,
        layoutMemoryApplied: latched.applied === true,
        layoutMemoryPressure: latched.inheritedPressure01 ?? null,
        liveEquationMemoryApplied: inherited.applied === true,
        resonanceActive: q.active === true,
        interactionCount: q.interactionCount ?? 0,
        touchedNodeCount: q.touchedNodeCount ?? 0,
        resolutionCandidate: q.regional?.candidateResolution ?? null,
        resolved: q.completed === true, resolutionId: q.resolutionId ?? null,
        returnCredit: e.phase2?.grave === true,
      },
      siltReturn: {
        active: fs.siltPressureRoute?.active === true,
        completed: fs.siltPressureRoute?.completed === true,
        receiptId: f.receiptId ?? null,
        sourceSequence: f.sourceSequence ?? 0,
        resolutionId: f.resolutionId ?? null,
        upstreamVascularMemory: f.upstreamVascularMemory === true,
        echo: f.echo ?? 0,
        targetCompression: f.targetCompressionWhenCompleted ?? 0.1
      },
      // Keep full records out of state-change comparisons. Each new record is
      // journaled separately by its authoritative monotonic Host sequence.
      hostVascular: host?.vascularEffectSnapshot?.({withRecords:false}) ?? null,
      hostGraveII: host?.graveIIResolutionSnapshot?.({withRecords:false}) ?? null
    };
  }

  sampleCircuit() {
    const now = this.circuitSnapshot();
    const host = this.hostConnectionReceiptLedger;
    const channels = [
      ['vascular', host?.vascularEffectSnapshot?.({withRecords:true,afterSequence:this.lastCircuitVascularSequence}), 'c0d4-host-vascular-effect', 'lastCircuitVascularSequence'],
      ['grave-ii', host?.graveIIResolutionSnapshot?.({withRecords:true,afterSequence:this.lastCircuitGraveSequence}), 'c0d4-host-grave-ii-outcome', 'lastCircuitGraveSequence'],
    ];
    for (const [channel, view, type, cursorKey] of channels) {
      if (!view || !Number.isSafeInteger(view.sequence)) continue;
      const cursor = this[cursorKey];
      const fresh = (view.records ?? []).filter(r => Number.isSafeInteger(r.sequence) && r.sequence > cursor)
        .sort((a,b) => a.sequence - b.sequence);
      if (view.sequence > cursor && (!fresh.length || fresh[0].sequence > cursor + 1)) {
        this.recordEvent('c0d4-host-receipt-gap', {
          channel, priorSequence: cursor, currentSequence: view.sequence,
          firstAvailableSequence: fresh[0]?.sequence ?? null
        });
      }
      for (const receipt of fresh) {
        this.recordEvent(type, {receipt});
        this[cursorKey] = receipt.sequence;
      }
      // An unavailable pruned record cannot be reconstructed. Keep cursor
      // monotonic after reporting the gap; never masquerade as a receipt.
      if (view.sequence > this[cursorKey]) this[cursorKey] = view.sequence;
    }
    if (this.lastCircuitState === null) {
      this.recordEvent('c0d4-circuit-baseline', {state: now});
    } else {
      const families = [
        ['cell', 'c0d4-active-cell-change'],
        ['graveI', 'c0d4-grave-i-change'],
        ['graveMemory', 'c0d4-grave-memory-change'],
        ['graveII', 'c0d4-grave-ii-change'],
        ['siltReturn', 'c0d4-silt-feedback-change'],
        ['hostVascular', 'c0d4-host-vascular-channel-change'],
        ['hostGraveII', 'c0d4-host-grave-channel-change']
      ];
      for (const [name,type] of families) {
        if (JSON.stringify(now[name]) !== JSON.stringify(this.lastCircuitState[name])) {
          this.recordEvent(type, {before: this.lastCircuitState[name], after: now[name]});
        }
      }
    }
    this.lastCircuitState = now;
  }
  // These are *published game-state outcomes*, not guesses from controller buttons.
  // None of these fields proves that a specific held grain received Pulse force
  // or an Absorb mass transfer. Record context for correlation only.
  authoritySnapshot() {
    const fs = this.frameState ?? {};
    const input = fs.input ?? {};
    const silt = fs.siltPressureRoute ?? {};
    const cycle = silt.livingMaterialCycle ?? {};
    const identity = silt.materialIdentity ?? {};
    const chem = fs.chemObjectState ?? {};
    const bond = fs.bondState ?? {};
    const motion = silt.heldMaterialMotion ?? {};
    const contact = silt.siltContact ?? {};
    const seat = silt.siltPlateSeat ?? {};
    const trajectory = silt.siltTrajectory ?? {};
    const field = silt.siltTrajectoryField ?? {};
    return {
      pulseEventId: Number.isFinite(input.pulseEventId) ? input.pulseEventId : 0,
      pulsePressed: !!input.pulsePressed,
      pulseHeld: !!input.pulseHeld,
      absorbHeld: !!input.absorbHeld,
      stabilizeHeld: !!input.stabilizeHeld,
      pressureReadSequence: Number(silt.pressureReadSequence ?? 0),
      unboundPulseCount: Number(silt.unboundPulseCount ?? 0),
      appetiteDrawSequence: Number(silt.appetiteDrawSequence ?? 0),
      lastAppetiteDrawKind: silt.lastAppetiteDrawKind ?? null,
      cycleEventSequence: Number(cycle.lastEventSequence ?? 0),
      cycleLastEvent: cycle.lastEvent ?? null,
      cycleMass: Number.isFinite(cycle.conservedMass) ? cycle.conservedMass : null,
      materialOwnerSequence: Array.isArray(identity.records)
        ? identity.records.map(item => ({ id: item.id, owner: item.owner, representation: item.representation, historySequence: item.historySequence }))
        : [],
      chemAbsorbedObjects: Number(chem.absorbedObjects ?? 0),
      chemResponse: chem.pulseResponse ?? null,
      bondObjectId: bond.objectId ?? null,
      bondAbsorbProgress: Number(bond.absorbProgress ?? 0),
      lastSiltInteraction: silt.lastInteraction ?? null,
      siltCompleted: !!silt.completed,
      siltSafeMatterAbsorbed: !!silt.safeMatterAbsorbed,
      siltPlateSeat: {
        siteId: seat.siteId ?? null, unitId: seat.unitId ?? null,
        occupied: !!seat.occupied, seats: Number(seat.seats ?? 0),
        extractions: Number(seat.extractions ?? 0),
        sequence: Number(seat.sequence ?? 0),
        position: Array.isArray(seat.position) ? [...seat.position] : null,
        owner: seat.owner ?? 'environment',
        progressionCredit: !!seat.progressionCredit
      },
      siltTrajectoryField: {
        pass: field.pass ?? 'none',
        sequence: Number(field.sequence ?? 0),
        lastEvent: field.lastEvent ?? 'none',
        habitatCrossings: Number(field.habitatCrossings ?? 0),
        traveledThreeUnits: Number(field.traveledThreeUnits ?? 0),
        records: Array.isArray(field.records) ? field.records.map(r=>({
          unitId:r.unitId,firstHabitat:r.firstHabitat,currentHabitat:r.currentHabitat,
          visitedHabitats:r.visitedHabitats,currentlyFree:!!r.currentlyFree,
          enteredOtherHabitat:!!r.enteredOtherHabitat,
          crossings:Number(r.crossings??0),maximumReleaseDistance:r.maximumReleaseDistance,
          maximumNativeError:r.maximumNativeError,samples:r.samples
        })) : []
      },
      siltTrajectory: {
        pass: trajectory.pass ?? 'none',
        releases: Number(trajectory.releases ?? 0),
        reacquisitions: Number(trajectory.reacquisitions ?? 0),
        freeCount: Number(trajectory.freeCount ?? 0),
        sequence: Number(trajectory.sequence ?? 0),
        lastEvent: trajectory.lastEvent ?? 'none',
        units: Array.isArray(trajectory.units) ? trajectory.units.map(u => ({
          unitId: u.unitId, position: u.position, velocity: u.velocity,
          seconds: u.seconds, nearNative: u.nearNative, nativeError: u.nativeError
        })) : [],
        progressionCredit: !!trajectory.progressionCredit,
        materialTransfer: !!trajectory.materialTransfer
      },
      siltContact: {
        patchId: contact.patchId ?? null,
        heldId: contact.heldId ?? null,
        inContact: !!contact.inContact,
        braced: !!contact.braced,
        braces: Number(contact.braces ?? 0),
        braceReleases: Number(contact.braceReleases ?? 0),
        lastBraceReason: contact.lastBraceReason ?? 'none',
        braceTension: Number(contact.braceTension ?? 0),
        braceDriftWarning: !!contact.braceDriftWarning,
        braceAnchor: Array.isArray(contact.braceAnchor) ? [...contact.braceAnchor] : null,
        pressure: Number(contact.pressure ?? 0),
        imprinted: !!contact.imprinted,
        contacts: Number(contact.contacts ?? 0),
        presses: Number(contact.presses ?? 0),
        imprints: Number(contact.imprints ?? 0),
        separations: Number(contact.separations ?? 0),
        lastOutcome: contact.lastOutcome ?? null,
        lastPulseOutcome: contact.lastPulseOutcome ?? null,
        lastPulseReason: contact.lastPulseReason ?? null,
        lastPulseMode: contact.lastPulseMode ?? null,
        massTransfer: !!contact.massTransfer,
        progressionCredit: !!contact.progressionCredit
      },
      heldMaterialMotion: {
        heldId: motion.heldId ?? null,
        radius: Number.isFinite(motion.radius) ? motion.radius : null,
        initialGripRadius: Number.isFinite(motion.initialGripRadius) ? motion.initialGripRadius : null,
        feedbackKind: motion.feedbackKind ?? 'none',
        pulseCount: Number(motion.pulseCount ?? 0),
        cumulativePullDistance: Number(motion.cumulativePullDistance ?? 0),
        lastReceipt: motion.lastReceipt ?? null,
        transferPerformed: !!motion.transferPerformed
      },
      hostConnections: fs.hostConnections ?? null,
      vascularHostObservation: fs.vascularRhythmRoute?.hostConnectionObservation ?? null,
      vascularSiltSignalResponse: fs.vascularRhythmRoute?.siltSignalResponse ?? null,
      visualVerbAuthority: {
        targetId: fs.verbVisualTargetAuthority?.targetId ?? "none",
        pulse: fs.verbVisualTargetAuthority?.pulse ?? "unpublished",
        absorb: fs.verbVisualTargetAuthority?.absorb ?? "unpublished",
        gameplayAuthorityChanged: !!fs.verbVisualTargetAuthority?.gameplayAuthorityChanged
      },
    };
  }
  sampleBot1cWatcherOwner() {
    const fs = this.frameState ?? {};
    const witness = fs.bot1cWatcherPulseWitness;
    const witnessSignature = witness?.revision === 'BOT1-C' && Number.isSafeInteger(witness.pulseEventId)
      ? `${witness.pulseEventId}:${witness.reason}:${witness.packetPulseReadAccepted}` : null;
    if (witnessSignature && witnessSignature !== this.bot1cLastWitnessSignature) {
      this.bot1cLastWitnessSignature = witnessSignature;
      this.recordEvent('bot1c-watcher-pulse-owner-result', { witness,
        caveat:'Owner-authored per-Pulse proximity result; recorder samples a retained read-only witness. No fabricated receipt.' });
    }
    const circuit = fs.nurseryCircuit ?? {};
    if (!circuit.active || circuit.owner !== 'SurfaceWakeGameplaySystem') return;
    const snapshot = {
      active: Boolean(circuit.packetActive), sequence: circuit.sequence ?? 0,
      packetIdentified: Boolean(circuit.packetIdentified),
      packetPulseRead: Boolean(circuit.packetPulseRead),
      resolvedCycleCount: circuit.resolvedCycleCount ?? 0,
      playerAuthoredCycleCount: circuit.playerAuthoredCycleCount ?? 0,
      agencyProven: Boolean(circuit.agencyProven),
      foldInvitation: Boolean(circuit.foldInvitation),
      lastOutcomeSequence: circuit.lastOutcomeSequence ?? 0,
      lastOutcome: circuit.lastOutcome ?? 'none'
    };
    const signature = JSON.stringify(snapshot);
    if (signature === this.bot1cLastNurserySignature) return;
    this.bot1cLastNurserySignature = signature;
    this.recordEvent('bot1c-watcher-owner-state-change', {
      state: snapshot, caveat:'Poll-time owner snapshot; transient phases between polls may be missed.'
    });
  }
  // BOT1-D: read-only adjudication of the authored Listening Fold stages.
  // Never used by the bot action policy and never influences gameplay owners.
  sampleBot1dFoldOwner() {
    const fs = this.frameState ?? {};
    const fold = fs.surfaceWakeLayeredInteraction ?? {};
    const nursery = fs.nurseryCircuit ?? {};
    const snapshot = {
      activeCellId: fs.activeCellId ?? 'none',
      owner: 'SurfaceWakeLayeredInteractionSystem',
      active: Boolean(fold.active),
      foldAvailable: Boolean(fold.foldAvailable),
      stage: fold.stage ?? 'unreported',
      stageIndex: Number.isInteger(fold.stageIndex) ? fold.stageIndex : null,
      progress: Number.isFinite(fold.progress) ? Number(fold.progress.toFixed(3)) : null,
      completed: Boolean(fold.completed),
      inApproach: Boolean(fold.ready),
      focusReady: Boolean(fold.focusReady),
      focusDistance: Number.isFinite(fold.focusDistance) ? Number(fold.focusDistance.toFixed(3)) : null,
      expectsPulse: Boolean(fold.expectsPulse),
      expectsHold: Boolean(fold.expectsHold),
      expectsRelease: Boolean(fold.expectsRelease),
      lastInteraction: fold.lastInteraction ?? 'none',
      nurseryAgencyProven: Boolean(nursery.agencyProven),
      nurseryFoldInvitation: Boolean(nursery.foldInvitation)
    };
    const signature = JSON.stringify(snapshot);
    if (signature === this.bot1dLastFoldSignature) return;
    this.bot1dLastFoldSignature = signature;
    this.recordEvent('bot1d-listening-fold-owner-state', {
      state: snapshot,
      proofLimit: 'Read-only gameplay owner snapshot. No bot access before action choice; progress is not a Host receipt or another region transition.'
    });
  }
  // GUIDE0-W: observation only. These facts are published by their respective
  // gameplay, prompt, and orbiter owners. A Guide pose is NOT a gameplay receipt.
  guide0Snapshot() {
    const fs = this.frameState ?? {};
    const g = fs.orbiterState ?? {};
    const p = fs.guidePrompt ?? {};
    const life = fs.promptLifecycle ?? {};
    const n = fs.nurseryCircuit ?? {};
    const fold = fs.surfaceWakeLayeredInteraction ?? {};
    const coreWork = fs.coreWorkManipulation ?? {};
    const focus = fs.guideFocus ?? {};
    const numberOrNull = value => Number.isFinite(value) ? Number(value.toFixed(3)) : null;
    return {
      activeCellId: fs.activeCellId ?? 'none',
      guide: {
        present: g.guideState !== undefined && g.guideState !== 'not_spawned',
        state: g.guideState ?? 'unpublished',
        target: g.guideTarget ?? 'none',
        distanceFromCore: numberOrNull(g.guideDistance),
        lastReaction: g.lastReaction ?? 'none',
        shimmerActive: Boolean(g.shimmerActive),
        silhouetteLane: g.silhouetteLane ?? 'unpublished',
        coreWorkPoseActive: Boolean(g.coreWorkPoseActive),
        coreWorkPieceHeld: Boolean(g.coreWorkPieceHeld),
        selectedCorePiece: g.coreWorkTarget ?? coreWork.selectedPieceId ?? 'none',
        inspectionHoned: Boolean(g.inspectionHoned ?? focus.honed),
      },
      prompt: {
        id: p.id ?? 'none',
        guideLine: p.guideLine ?? null,
        objectiveLine: p.objectiveLine ?? null,
        contentOwner: p.contentOwner ?? life.contentOwner ?? 'unpublished',
        selectionOwner: p.selectionOwner ?? life.selectionOwner ?? 'unpublished',
        regionPromptEpoch: p.regionPromptEpoch ?? life.regionPromptEpoch ?? null,
        activeRegionId: p.activeRegionId ?? life.activeRegionId ?? null,
        presentationDelegatedTo: p.presentationDelegatedTo ?? 'unpublished',
      },
      owner: {
        currentChemTarget: fs.currentChemTarget ?? null,
        scarSelectionActive: fs.currentChemTarget === 'scar_contamination_plate_001',
        nurseryActive: Boolean(n.active),
        packetActive: Boolean(n.packetActive),
        visualReadState: n.visualReadState ?? 'unpublished',
        outcomeSequence: Number.isSafeInteger(n.lastOutcomeSequence) ? n.lastOutcomeSequence : null,
        lastOutcome: n.lastOutcome ?? 'none',
        agencyProven: Boolean(n.agencyProven),
        foldInvitation: Boolean(n.foldInvitation),
        foldStage: fold.stage ?? 'unpublished',
      },
      proofScope: 'Guide posture / prompt / nursery outcome are independent owners; no assistance, awareness, or cause inferred.'
    };
  }
  sampleGuide0Witness() {
    if (!this.captureActive) return;
    const fs = this.frameState ?? {};
    const snapshot = this.guide0Snapshot();
    const nowMs = Date.now();
    const signature = JSON.stringify(snapshot);
    const changed = signature !== this.guide0LastSignature;
    const periodic = this.guide0LastCheckpointMs === null || nowMs - this.guide0LastCheckpointMs >= 5000;
    if (changed || periodic) {
      this.recordEvent('guide0-core-guide-state', {
        state: snapshot,
        sampleKind: this.guide0LastSignature === null ? 'baseline' : changed ? 'change' : 'checkpoint',
        caveat: '150ms recorder observation; not proof that Guide state caused a gameplay result.'
      });
      this.guide0LastSignature = signature;
      this.guide0LastCheckpointMs = nowMs;
    }
    // Associate the latest exact-Pulse owner witness with the *contemporary*
    // Guide/prompt snapshot. The recipient is diagnostics only, never the bot.
    const w = fs.bot1cWatcherPulseWitness;
    if (w?.revision === 'BOT1-C' && Number.isSafeInteger(w.pulseEventId)
        && w.pulseEventId !== this.guide0LastPulseId) {
      this.guide0LastPulseId = w.pulseEventId;
      this.recordEvent('guide0-pulse-owner-pair', {
        pulseEventId: w.pulseEventId,
        owner: {
          packetSequence: w.packetSequence ?? null,
          packetActive: Boolean(w.packetActive),
          distance: Number.isFinite(w.packetDistance) ? Number(w.packetDistance.toFixed(3)) : null,
          readRange: Number.isFinite(w.readRange) ? Number(w.readRange.toFixed(3)) : null,
          accepted: w.packetPulseReadAccepted === true,
          reason: w.reason ?? 'unknown',
        },
        guide: snapshot.guide,
        prompt: snapshot.prompt,
        nursery: snapshot.owner,
        caveat: 'Observed at REC1 poll; orbiter reaction may lag or be a response to input rather than packet acceptance.'
      });
    }
    const seq = snapshot.owner.outcomeSequence;
    if (seq !== null && seq !== this.guide0LastOutcomeSequence) {
      this.guide0LastOutcomeSequence = seq;
      if (seq > 0) this.recordEvent('guide0-nursery-outcome-pair', {
        outcomeSequence: seq, outcome: snapshot.owner.lastOutcome,
        guide: snapshot.guide, prompt: snapshot.prompt,
        caveat: 'Outcome is authoritative nursery owner state; Guide and prompt are sampled independently.'
      });
    }
  }
  sampleAuthority() {
    this.sampleBot1cWatcherOwner();
    this.sampleBot1dFoldOwner();
    const now = this.authoritySnapshot();
    const before = this.authorityPrevious;
    const target = this.materialContext();
    if (!before) {
      this.recordEvent('authority-baseline', { state: now, target });
    } else {
      if (now.pulseEventId > before.pulseEventId) {
        this.recordEvent('game-pulse-event', {
          pulseEventId: now.pulseEventId, previousPulseEventId: before.pulseEventId,
          heldTargetAtSample: target.heldId, target,
          caveat: 'Canonical input Pulse sequence, not evidence of force applied to held material.'
        });
      }
      if (now.absorbHeld !== before.absorbHeld) {
        this.recordEvent(now.absorbHeld ? 'game-absorb-started' : 'game-absorb-ended',
          { heldTargetAtSample: target.heldId, target });
      }
      if (now.stabilizeHeld !== before.stabilizeHeld) {
        this.recordEvent(now.stabilizeHeld ? 'game-stabilize-started' : 'game-stabilize-ended', { target });
      }
      if (now.pressureReadSequence > before.pressureReadSequence) {
        this.recordEvent('silt-pressure-read-committed', {
          sequence: now.pressureReadSequence, target,
          caveat: 'Silt environment pressure progression; not a held-grain Pulse impact.'
        });
      }
      if (now.unboundPulseCount > before.unboundPulseCount) {
        this.recordEvent('silt-unbound-pulse-count-increased', { delta: now.unboundPulseCount - before.unboundPulseCount, target });
      }
      if (now.appetiteDrawSequence > before.appetiteDrawSequence) {
        this.recordEvent('silt-porous-absorb-committed', {
          sequence: now.appetiteDrawSequence, kind: now.lastAppetiteDrawKind, target,
          caveat: 'Canonical Silt safe-packet progression; not proof that the held grain was absorbed.'
        });
      }
      if (now.chemAbsorbedObjects > before.chemAbsorbedObjects) {
        this.recordEvent('chemistry-absorption-committed', {
          delta: now.chemAbsorbedObjects - before.chemAbsorbedObjects,
          total: now.chemAbsorbedObjects, chemistryTargetId: now.bondObjectId, target,
          caveat: 'Bond/chemistry object, not necessarily the held Silt grain.'
        });
      }
      if (now.cycleEventSequence > before.cycleEventSequence) {
        this.recordEvent('silt-cycle-event-observed', {
          lastSequence: now.cycleEventSequence, delta: now.cycleEventSequence - before.cycleEventSequence,
          lastKind: now.cycleLastEvent, conservedMass: now.cycleMass, target,
          caveat: 'Only the last published cycle event is known; intervening events may be missed.'
        });
      }
      const oldOwners = new Map(before.materialOwnerSequence.map(item => [item.id, item]));
      for (const unit of now.materialOwnerSequence) {
        const old = oldOwners.get(unit.id);
        if (old && (unit.owner !== old.owner || unit.representation !== old.representation || unit.historySequence !== old.historySequence)) {
          this.recordEvent('silt-material-owner-changed', {
            unitId: unit.id, from: old.owner, to: unit.owner,
            fromRepresentation: old.representation, toRepresentation: unit.representation,
            historySequence: unit.historySequence, target
          });
        }
      }
      if (now.siltTrajectoryField.sequence > before.siltTrajectoryField.sequence) {
        this.recordEvent('silt-trajectory-field-change', { field: now.siltTrajectoryField,
          caveat: 'Only existing Silt habitat ellipsoids are classified; passages are between. Read-only, no physics or off-route simulation.' });
      }
      if (now.siltTrajectory.sequence > before.siltTrajectory.sequence) {
        this.recordEvent('silt-trajectory-state-change', {
          trajectory: now.siltTrajectory,
          caveat: 'Route-local kinematic trail, not physical impulse, new mass or persisted save state.'
        });
      }
      if (now.siltPlateSeat.sequence > before.siltPlateSeat.sequence) {
        this.recordEvent('silt-site-relationship-changed', {
          site: now.siltPlateSeat, previous: before.siltPlateSeat,
          caveat: 'Authored site retention, not mass ownership or Core chemistry.'
        });
      }
      if (now.siltCompleted && !before.siltCompleted) {
        this.recordEvent('silt-completion-committed', { target });
      }
      if (now.siltSafeMatterAbsorbed && !before.siltSafeMatterAbsorbed) {
        this.recordEvent('silt-safe-matter-flag-earned', { target });
      }
    }
    this.authorityPrevious = now;
  }
  sampleSiltDecisions() {
    const trace = this.frameState?.siltPressureRoute?.transactionTrace;
    if (!trace || !Number.isFinite(trace.lastSequence) || !Array.isArray(trace.events)) return;
    if (this.lastSiltDecisionSequence === null) {
      // Capture entry is a diagnostic boundary: don't replay decisions made
      // before recording started. Receipts made later survive 150ms sampling.
      this.lastSiltDecisionSequence = trace.lastSequence;
      this.recordEvent('silt-decision-trace-baseline', { sequence: trace.lastSequence });
      return;
    }
    const recent = trace.events.filter(e => e.sequence > this.lastSiltDecisionSequence)
      .sort((a, b) => a.sequence - b.sequence);
    if (recent.length && recent[0].sequence > this.lastSiltDecisionSequence + 1) {
      this.recordEvent('silt-decision-trace-gap', {
        firstAvailableSequence: recent[0].sequence,
        lastRecordedSequence: this.lastSiltDecisionSequence,
        caveat: 'Route ring buffer was overwritten between samples; events were lost.'
      });
    }
    for (const decision of recent) {
      this.recordEvent('silt-authoritative-route-decision', { decision });
      this.lastSiltDecisionSequence = decision.sequence;
    }
  }
  timelineSummary() {
    const acc = this.captureAggregate;
    // Lists derive from full recorder-observed detail history; source-level
    // 64-item decision rings may still skip unpublished/intervening events.
    const heldPulses = [];
    const heldAbsorbStarts = [];
    for (const event of this.captureEvents) {
      if (event.type === 'game-pulse-event' && event.heldTargetAtSample) heldPulses.push({ time: event.time, unitId: event.heldTargetAtSample, pulseEventId: event.pulseEventId });
      if (event.type === 'game-absorb-started' && event.heldTargetAtSample) heldAbsorbStarts.push({ time: event.time, unitId: event.heldTargetAtSample });
    }
    const counts = {...acc.eventCounts};
    const routeDecisionCounts = {...acc.routeDecisionCounts};
    const contactOutcomes = {...acc.contactOutcomes};
    const seatOutcomes = {...acc.seatOutcomes};
    const trajectoryOutcomes = {...acc.trajectoryOutcomes};
    const heldMotion = {...acc.heldMotion};
    heldMotion.totalPulseDisplacement = Number(heldMotion.totalPulseDisplacement.toFixed(4));
    heldMotion.totalAbsorbDisplacement = Number(heldMotion.totalAbsorbDisplacement.toFixed(4));
    // The sampled trace may omit receipts (64-item Silt ring / 150ms recorder).
    // Show the actual authoritative counter separately, without assuming that
    // a receipt sum equals the full gameplay total.
    heldMotion.authoritativeCumulativePullDistance = Number(
      this.authoritySnapshot().heldMaterialMotion.cumulativePullDistance.toFixed(4));
    // Compare like with like: authoritative *this session* minus the counter
    // captured when REC began, not the lifetime route cumulative total.
    heldMotion.captureStartPullBaseline = Number.isFinite(this.capturePullBaseline)
      ? Number(this.capturePullBaseline.toFixed(4)) : null;
    heldMotion.authoritativeSessionPullDistance = heldMotion.captureStartPullBaseline === null
      ? null : Number(Math.max(0,
        heldMotion.authoritativeCumulativePullDistance - heldMotion.captureStartPullBaseline).toFixed(4));
    heldMotion.unreconciledPullDistance = heldMotion.authoritativeSessionPullDistance === null
      ? null : Number(Math.abs(
        heldMotion.authoritativeSessionPullDistance - heldMotion.totalAbsorbDisplacement).toFixed(4));
    return {
      eventCounts: counts, routeDecisionsObserved: acc.routeDecisionsObserved,
      captureRetention: { totalEventsObserved: acc.recordedEvents,
        retainedDetails: this.captureEvents.length, droppedDetails: acc.droppedDetails,
        siltSourceTraceGaps: acc.decisionTraceGaps,
        lifetimeCountersSpanFullCapture: true,
        fullSessionRecorderDetailsRetained: this.captureEvents.length === acc.recordedEvents,
        detailedListsContainOnlyLast2500: false,
        retentionPolicy: 'append_only_for_current_capture_no_2500_event_rollover',
        caveat: 'Full recorder history does not guarantee source truth if a producer 64-entry ring overflows between 150ms samples.' },
      circuit: {revision: "C0D4-OBS1", finalState: this.circuitSnapshot(),
        observationOnly: true, browserCircuitAcceptance: "not_inferred_from_recording_alone"},
      hostConnections: { finalState: this.authoritySnapshot().hostConnections,
        vascularReadOnlyView: this.authoritySnapshot().vascularHostObservation,
        vascularLocalResponse: this.authoritySnapshot().vascularSiltSignalResponse,
        proofLimit: 'Verified Silt release creates provenance only. LS1E2 Vascular consumes signal receipts into its own bounded membrane state and directional current; no grain arrival, chemistry transfer or progression credit.' },
      routeDecisionCounts, heldMaterialMotion: heldMotion,
      siltTrajectoryField: {
        finalState: this.authoritySnapshot().siltTrajectoryField,
        proofLimit: 'Silt route-local geometry labels only; between includes corridors, outside cavities and distant positions. No cross-region or off-route physics claim.'
      },
      siltTrajectory: { outcomes: trajectoryOutcomes,
        finalState: this.authoritySnapshot().siltTrajectory,
        proofLimit: 'Route-local world-position and velocity continuity for released unseated grain; LS1B remains native phase authority. No collision impulse, scene-wide ecology, save persistence, mass change or off-route simulation.' },
      siltPlateSeat: { outcomes: seatOutcomes,
        finalState: this.authoritySnapshot().siltPlateSeat,
        proofLimit: 'One route-local receiving site; environment remains ledger owner. No global persistent save or native-path motion rewrite.' },
      siltContact: { outcomes: contactOutcomes, finalState: this.authoritySnapshot().siltContact,
        proofLimit: 'Contact is authored-patch proximity and bounded Stabilize brace; D2M prioritizes an already-touching brace before Pulse and reports tether tension. Imprint is reversible visual/pressure state, not collisions, force, fracture, or chemical bond.' },
      pulsesObservedWhileHolding: heldPulses,
      absorbStartsObservedWhileHolding: heldAbsorbStarts,
      targetedPulseForceConfirmed: false, heldGrainAbsorptionConfirmed: false,
      heldGrainKinematicDisplacementConfirmed: heldMotion.pulseOutward > 0 || heldMotion.absorbInward > 0,
      proofLimit: 'D2H held-material receipts report bounded positional displacement accepted by the Silt grip; these are not physics impulse, chemistry consumption, or material-ownership transfer proofs. Environmental Silt route and other gameplay subsystems remain separate.'
    };
  }
  materialContext() {
    const fs = this.frameState ?? {};
    const aim = fs.siltMaterialAim ?? {};
    const grip = fs.siltPressureRoute?.siltGrip ?? {};
    return {
      candidateId: aim.candidateId ?? null,
      lockedId: aim.lockedId ?? null,
      heldId: aim.heldId ?? null,
      gripStatus: grip.status ?? null,
      legacyTargetId: fs.targeting?.targetId ?? null,
    };
  }
  // C0D4-MOB1: sample already-published kinematics and interaction owners.
  // A button edge is input evidence, not evidence that the owner accepted an action.
  mobilityOwnerSnapshot() {
    const fs = this.frameState ?? {};
    const kin = fs.playerKinematics ?? {};
    const attachment = fs.playerAttachment ?? {};
    const flight = fs.hubRouteCommitFlight ?? {};
    const hub = fs.hubInvestigationGameplay ?? {};
    const chorus = fs.signalChorusLayeredInteraction ?? {};
    const grave = fs.graveMemoryRoute ?? {};
    const resonance = fs.graveResonanceGameplay ?? {};
    const commit = fs.hubRouteCommit ?? {};
    const target = fs.targeting ?? {};
    const input = fs.input ?? {};
    const vec = v => ({
      x: Number.isFinite(v?.x) ? Number(v.x.toFixed(3)) : 0,
      y: Number.isFinite(v?.y) ? Number(v.y.toFixed(3)) : 0,
      z: Number.isFinite(v?.z) ? Number(v.z.toFixed(3)) : 0
    });
    return {
      cellId: fs.activeCellId ?? 'none',
      input: {moveX: Number(input.moveX ?? 0), moveY: Number(input.moveY ?? 0),
        moveZ: Number(input.moveZ ?? 0), interactPressed: !!input.interactPressed,
        pulsePressed: !!input.pulsePressed, pulseEventId: input.pulseEventId ?? null,
        absorbHeld: !!input.absorbHeld, stabilizeHeld: !!input.stabilizeHeld,
        boostHeld: !!input.boostHeld},
      motion: {position: vec(kin.position), velocity: vec(kin.velocity),
        intendedAcceleration: vec(kin.desiredMoveVector), environmentalAcceleration: vec(kin.environmentalForceVector),
        flowVector: vec(kin.flowVector), speed: Number(kin.speed ?? 0),
        inputMagnitude: Number(kin.inputMagnitude ?? 0), activeSpeedLimit: Number(kin.activeSpeedLimit ?? 0),
        locomotionMode: kin.locomotionMode ?? 'unknown',
        boundaryPressure: Number(kin.boundaryPressure ?? 0),
        boundaryMode: kin.movementBoundary?.mode ?? 'unknown',
        boundaryRegionId: kin.movementBoundary?.regionId ?? 'unknown',
        // Existing movement owner already publishes its union selection.
        // Recorder only observes it; no boundary maths or authority changes.
        c0e2bActiveVolumeId: kin.movementBoundary?.c0e2?.activePocketId ?? 'legacy',
        c0e2bVolumeActive: kin.movementBoundary?.c0e2?.active === true,
        c0e2bNormalizedBoundaryDistance: Number.isFinite(kin.movementBoundary?.normalizedDistance)
          ? Number(kin.movementBoundary.normalizedDistance.toFixed(3)) : null,
        directionalFlowAlignment: Number(kin.directionalFlowAlignment ?? 0),
        directTendrilPullActive: kin.tendrilSurfaceLocomotion?.active === true,
        convergenceReachabilityActive: kin.convergenceReachabilityActive === true},
      attachment: {active: attachment.active === true, state: attachment.state ?? 'none',
        authority: attachment.authority ?? 'none', peelIntent01: Number(attachment.peelIntent01 ?? 0),
        reacquireBlocked: attachment.reacquireBlocked === true, surfaceId: attachment.ownerSurfaceId ?? 'none',
        supportCount: Number(attachment.tendrilSupportCount ?? 0)},
      guidedHub: {active: flight.active === true, owner: flight.owner ?? 'none',
        routeId: flight.routeId ?? 'none', progress: Number(flight.progress ?? 0)},
      interaction: {targetId: target.targetId ?? null, targetReason: target.attentionReason ?? null,
        hubLastAction: hub.lastAction ?? null, hubNearestRouteId: hub.nearestRouteId ?? null,
        hubNearestRouteDistance: Number.isFinite(hub.nearestRouteDistance) ? Number(hub.nearestRouteDistance.toFixed(3)) : null,
        hubCommitStatus: commit.status ?? null, chorusStage: chorus.stage ?? null,
        chorusLastInteraction: chorus.lastInteraction ?? null,
        chorusNextAction: chorus.nextAction ?? null, graveStage: grave.stage ?? null,
        graveLastInteraction: grave.lastInteraction ?? null,
        resonanceInteractions: Number(resonance.interactionCount ?? 0),
        resonanceCandidate: resonance.resolutionCandidate ?? null}
    };
  }
  mobilityActionEdge(pad, buttonIndex) {
    if (![0, 2, 6, 7].includes(buttonIndex)) return;
    const owner = this.mobilityOwnerSnapshot();
    this.mobPendingActions.push({at:Date.now(),padIndex:pad.index,buttonIndex,owner});
    if (this.mobPendingActions.length > 24) this.mobPendingActions.shift();
    this.recordEvent('c0d4-mob1-action-context', {
      padIndex: pad.index, buttonIndex, owner,
      acceptance: 'unknown',
      caveat: 'Raw button-down with same-sample owner state. Does not establish dispatch, consumed action, or accepted target.'
    });
  }
  sampleMobility() {
    if (!this.captureActive) return;
    const current = this.mobilityOwnerSnapshot();
    const now = Date.now();
    const pending = [];
    for (const action of this.mobPendingActions ?? []) {
      if (now-action.at < 350) {pending.push(action);continue;}
      const before = action.owner.interaction;
      const after = current.interaction;
      this.recordEvent('c0d4-mob1-action-followup', {
        padIndex:action.padIndex, buttonIndex:action.buttonIndex,
        elapsedMs:now-action.at, cellAtPress:action.owner.cellId,
        cellAtFollowup:current.cellId,
        stateChanged:JSON.stringify(before)!==JSON.stringify(after),
        before, after,
        acceptance:'not_proven',
        caveat:'Owner snapshot comparison after button press; not proof of consumption, rejection, or causation.'
      });
    }
    this.mobPendingActions=pending;
    const prev = this.mobPrevious;
    const m = current.motion;
    if (current.motion.c0e2bVolumeActive) {
      const signature=`${current.cellId}|${current.motion.c0e2bActiveVolumeId}`;
      if (signature!==this.c0e2bLastVolumeSignature) {
        this.recordEvent('c0e2b-movement-volume-change', {
          from:this.c0e2bLastVolumeSignature, to:signature,
          regionCellId:current.cellId,
          activeVolumeId:current.motion.c0e2bActiveVolumeId,
          normalizedDistance:current.motion.c0e2bNormalizedBoundaryDistance,
          noMovementChange:true, caveat:'Existing C0E2 volume-owner selection only; does not prove rendered path or interaction range.'
        });
        this.c0e2bLastVolumeSignature=signature;
      }
    }
    const guided = current.guidedHub.active;
    const intended = m.intendedAcceleration;
    const env = m.environmentalAcceleration;
    const input = current.input;
    const rawMagnitude = Math.hypot(input.moveX, input.moveY, input.moveZ);
    const intentionMagnitude = Math.hypot(intended.x, intended.y, intended.z);
    const envMagnitude = Math.hypot(env.x, env.y, env.z);
    const norm = Math.max(0.000001, intentionMagnitude);
    const opposition = intentionMagnitude > 0.01 && envMagnitude > 0.01
      ? (intended.x*env.x + intended.y*env.y + intended.z*env.z) / (norm*envMagnitude)
      : 0;
    const elapsed = prev && now > prev.at ? (now-prev.at)/1000 : 0;
    const displacement = prev && prev.owner.cellId === current.cellId
      ? {x:m.position.x-prev.owner.motion.position.x,
        y:m.position.y-prev.owner.motion.position.y,
        z:m.position.z-prev.owner.motion.position.z} : null;
    const motionAlongIntent = displacement && intentionMagnitude > 0.01 && elapsed > 0
      ? (displacement.x*intended.x + displacement.y*intended.y + displacement.z*intended.z) / (norm*elapsed)
      : null;
    const requestActive = rawMagnitude >= 0.55 || m.inputMagnitude >= 0.55;
    // G1-D9S-NEUTRAL-REC1-v1: read-only neutral owner heartbeat for calibration.
    // No movement, targeting, player or Fold state is changed by this observer.
    if (!requestActive && (!Number.isFinite(this.mobD9SNeutralLastSampleMs) || now - this.mobD9SNeutralLastSampleMs >= 400)) {
      this.mobD9SNeutralLastSampleMs = now;
      this.recordEvent('g1d9s-neutral-movement-observation', {
        owner: current,
        observationOnly: true,
        caveat: 'Read-only 400ms neutral sample for D9S; camera input may occur, ambient drift remains possible. Not a gameplay receipt.'
      });
    }

    const lowProgress = guided ? rawMagnitude >= 0.55
      : requestActive && (motionAlongIntent !== null && motionAlongIntent < 0.08);
    let reason = 'unclassified_low_progress';
    if (guided) reason = 'guided_hub_motion_owns_translation';
    else if (m.boundaryPressure > 0.004) reason = 'boundary_correction_candidate';
    else if (current.attachment.active) reason = 'surface_traction_or_attachment_candidate';
    else if (intentionMagnitude < 0.01) reason = 'intent_not_reaching_movement_controller';
    else if (opposition < -0.5 && envMagnitude > intentionMagnitude*0.3) reason = 'opposing_environmental_force_candidate';
    else reason = 'low_forward_progress_cause_unresolved';
    // Report a sustained phenomenon, not a per-frame estimate of a collision.
    if (lowProgress && prev && prev.owner.cellId === current.cellId) {
      if (this.mobBlockSinceMs === null || this.mobBlockReason !== reason) {
        this.mobBlockSinceMs = now; this.mobBlockReason = reason; this.mobBlockReported = null;
      }
      if (now-this.mobBlockSinceMs >= 750 && this.mobBlockReported !== reason) {
        this.mobBlockReported = reason;
        this.recordEvent('c0d4-mob1-sustained-low-progress', {
          candidateReason: reason, observedForSeconds: Number(((now-this.mobBlockSinceMs)/1000).toFixed(2)),
          estimatedForwardSpeed: motionAlongIntent === null ? null : Number(motionAlongIntent.toFixed(3)),
          forceOppositionCosine: Number(opposition.toFixed(3)),
          playerInputMagnitude: Number(rawMagnitude.toFixed(3)), owner: current,
          caveat: 'Diagnostic candidate, not a collision, physical cause, or input-dispatch proof.'
        });
      }
    } else { this.mobBlockSinceMs=null; this.mobBlockReported=null; this.mobBlockReason=null; }
    // Low-frequency numeric context allows comparing movement while holding
    // deliberate input, even if no threshold is crossed.
    if (requestActive && (this.mobLastSampleMs === null || now-this.mobLastSampleMs >= 900)) {
      this.mobLastSampleMs=now;
      this.recordEvent('c0d4-mob1-movement-sample', {
        owner:current,
        forwardSpeed:motionAlongIntent === null ? null : Number(motionAlongIntent.toFixed(3)),
        forceOppositionCosine:Number(opposition.toFixed(3)),
        caveat:'150ms poll of published state. Force and velocity are separate; a sample alone does not prove obstruction.'
      });
    }
    // Track route-guidance changes even when there is no movement request.
    const guidedSignature = `${current.cellId}|${guided}|${current.guidedHub.routeId}`;
    if (this.mobLastGuidedSignature !== guidedSignature) {
      this.mobLastGuidedSignature=guidedSignature;
      this.recordEvent('c0d4-mob1-guidance-state-change', {owner:current});
    }
    this.mobPrevious={at:now,owner:current};
  }
  // C0E1: snapshot-only territory provenance; experimental reads do not
  // consume buttons, mint Host receipts, alter objectives or transfer material.
  sampleTerritoryExploration() {
    const current = this.frameState?.territoryExploration;
    if (current?.pass !== 'C0E1' || !current.active) return;
    if (current.owner !== `${current.region}:RegionalTerritoryExpansion`) return;
    const now=Date.now();
    const approach=current.c0e2bNearestUnvisitedPocket;
    if (approach && (this.c0e2bLastApproachMs === null || now-this.c0e2bLastApproachMs >= 5000)) {
      this.c0e2bLastApproachMs=now;
      this.recordEvent('c0e2b-nearest-unvisited-pocket', {
        region:current.region, siteId:approach.siteId,
        distance:approach.distance,
        activeMovementVolumeId:this.frameState?.playerKinematics?.movementBoundary?.c0e2?.activePocketId ?? 'legacy',
        caveat:'Distance-only observation. Not proof of a blocked passage or a failure to reach the pocket.'
      });
    }
    const siteId = current.nearestSiteId;
    if (siteId) {
      const key = `${current.region}:${siteId}`;
      if (!this.territoryVisitKeys.has(key)) {
        this.territoryVisitKeys.add(key);
        this.recordEvent('c0e1-territory-discovered', {
          region: current.region, siteId, distance: current.nearestSiteDistance,
          circuitStatus: current.circuitStatus, signal01: current.signal01,
          note: 'Proximity read, not independent progression or objective credit.'
        });
      }
    }
    const pocket = this.frameState?.territoryExplorationLastPocket;
    if (pocket?.kind === 'c0e2_pocket_discovered') {
      const pocketKey = `${pocket.region}:${pocket.pocketId}`;
      this.c0e2PocketVisitKeys ??= new Set();
      if (!this.c0e2PocketVisitKeys.has(pocketKey)) {
        this.c0e2PocketVisitKeys.add(pocketKey);
        this.recordEvent('c0e2-pocket-discovered', { ...pocket,
          note: 'Physically approached an extended local envelope; no objective credit.' });
      }
    }
    const read = this.frameState?.territoryExplorationLastRead;
    if (read?.kind !== 'c0e1_local_exploratory_read' || !Number.isSafeInteger(read.localSequence)) return;
    const key = `${read.region}:${read.localSequence}`;
    if (key !== this.territoryLastReadKey) {
      this.territoryLastReadKey = key;
      this.recordEvent('c0e1-territory-verb-read', { read });
    }
  }
  sampleInputs() {
    // Raw browser gamepad button/axis telemetry, not inferred game verbs.
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
    const current = pads.map(pad => ({
      index: pad.index, id: String(pad.id).slice(0, 100),
      buttons: Array.from(pad.buttons, b => !!b.pressed),
      axes: Array.from(pad.axes, x => Math.round(x * 10) / 10),
    }));
    const previous = this.inputPrevious ?? [];
    for (const pad of current) {
      const old = previous.find(p => p.index === pad.index);
      for (let i = 0; i < pad.buttons.length; i++) {
        if (pad.buttons[i] !== (old?.buttons[i] ?? false)) {
          this.recordEvent('gamepad-button-edge', { padIndex: pad.index, buttonIndex: i,
            pressed: pad.buttons[i], target: this.materialContext() });
          if (pad.buttons[i]) this.mobilityActionEdge(pad, i);
        }
      }
      if (!old || pad.axes.some((x, i) => Math.abs(x - (old.axes[i] ?? 0)) >= 0.4)) {
        this.recordEvent('gamepad-axes', { padIndex: pad.index, axes: pad.axes, target: this.materialContext() });
      }
    }
    this.inputPrevious = current;
  }
  recordEvent(type, details = {}) {
    if (!this.captureActive) return;
    const entry = { time: new Date().toISOString(), type, ...details,
      recorderEventOrdinal: this.captureAggregate.recordedEvents + 1 };
    this.captureCountEvent(entry);
    // Append-only for the current capture: no silent removal of earlier events.
    // Typical 25-minute field tests fit comfortably in a compact JSON export.
    this.captureEvents.push(entry);
  }
  // GSL-4E2F-OBS1: observe published Guide receipts; never write to frameState.
  // Change-only records avoid 150ms polling spam while retaining meaningful transitions.
  sampleGslInterpretation() {
    if (!this.captureActive) return;
    const fs = this.frameState ?? {};
    const interpretation = fs.guideInterpretation;
    const expression = fs.gsl4e2eDebug;
    const ownership = fs.gsl4e2dDebug;
    const state = interpretation && interpretation.pass === 'GSL-4E2F'
      ? {
          available: true,
          interpretation: {
            pass: interpretation.pass, enabled: !!interpretation.enabled,
            source: interpretation.source ?? null, observed: !!interpretation.observed,
            attachmentActive: !!interpretation.attachmentActive,
            detachReason: interpretation.detachReason ?? null,
            event: interpretation.event ?? null, intention: interpretation.intention ?? null,
            expressionAllowed: !!interpretation.expressionAllowed,
            expressionSuppression: interpretation.expressionSuppression ?? null,
            movementOwner: interpretation.movementOwner ?? null
          },
          expression: expression ? {
            enabled: !!expression.enabled, selectedMode: expression.selectedMode ?? null,
            expressionMode: expression.expressionMode ?? null,
            expressionApplied: !!expression.expressionApplied,
            coreWorkProtected: !!expression.coreWorkProtected,
            movementOwner: expression.movementOwner ?? null
          } : null,
          ownership: ownership ? {
            enabled: !!ownership.enabled, selectedMode: ownership.selectedMode ?? null,
            selected: !!ownership.selected, applied: !!ownership.applied,
            finalGuideState: ownership.finalGuideState ?? null,
            finalOwner: ownership.finalOwner ?? null,
            suppressionReason: ownership.suppressionReason ?? null
          } : null
        }
      : { available: false, reason: 'gsl4e2f_receipt_missing' };
    const signature = JSON.stringify(state);
    if (signature === this.gslObservationPrevious) return;
    this.gslObservationPrevious = signature;
    this.recordEvent('gsl-guide-interpretation-change', { gsl: state });
  }
  sampleState() {
    this.sampleGslInterpretation();
    this.sampleInputs();
    this.sampleMobility();
    this.sampleAuthority();
    this.sampleGuide0Witness();
    this.sampleSiltDecisions();
    this.sampleHostConnections();
    this.sampleVascularSiltResponse();
    this.sampleVascularPresentation();
    this.sampleCircuit();
    this.sampleTerritoryExploration();
    this.updateRecordIndicator();
    const fs = this.frameState ?? {};
    const aim = fs.siltMaterialAim ?? {};
    const grip = fs.siltPressureRoute?.siltGrip ?? {};
    const state = {
      candidateId: aim.candidateId ?? null, lockedId: aim.lockedId ?? null,
      heldId: aim.heldId ?? null, gripStatus: grip.status ?? null,
      legacyTargetId: fs.targeting?.targetId ?? null,
      siltCompleted: !!fs.siltPressureRoute?.completed,
      returnFoldReady: !!fs.siltPressureRoute?.returnFoldReady,
    };
    if (JSON.stringify(state) !== JSON.stringify(this.capturePrevious)) {
      this.recordEvent('observed-state-change', { state });
      this.capturePrevious = state;
    }
  }
  toggleCapture() {
    if (this.captureActive) {
      this.sampleState();
      clearInterval(this.captureTimer); this.captureTimer = null;
      this.recordEvent('capture-stopped'); this.captureActive = false;
      this.captureStoppedAt = new Date().toISOString();
      this.updateRecordIndicator(`REC STOPPED · ${this.captureEvents.length.toLocaleString('en-US')} events saved · Alt+Shift+E export`);
      return;
    }
    this.captureEvents = []; this.captureAggregate = this.newCaptureAggregate();
    this.lastHostConnectionSequence = this.frameState?.hostConnections?.sequence ?? 0;
    this.lastVascularReceivedSequence = this.frameState?.vascularRhythmRoute?.siltSignalResponse?.receivedTotal ?? 0;
    this.capturePrevious = null; this.inputPrevious = null; this.authorityPrevious = null; this.lastSiltDecisionSequence = null;
    this.lastVascularPresentationSampleMs = null;
    this.lastCircuitVascularSequence = this.hostConnectionReceiptLedger?.vascularEffectSnapshot?.({withRecords:false})?.sequence ?? 0;
    this.lastCircuitGraveSequence = this.hostConnectionReceiptLedger?.graveIIResolutionSnapshot?.({withRecords:false})?.sequence ?? 0;
    this.lastCircuitState = null;
    this.bot1dLastFoldSignature = null;
    this.guide0LastSignature = null;
    this.guide0LastCheckpointMs = null;
    this.guide0LastPulseId = null;
    this.guide0LastOutcomeSequence = null;
    // GSL-4E2F-OBS1: recorder-only interpretation snapshot deduplication.
    this.gslObservationPrevious = null;
    this.mobPrevious = null; this.mobBlockSinceMs=null; this.mobBlockReported=null;
    this.c0e2bLastVolumeSignature=null;this.c0e2bLastApproachMs=null;
    this.mobBlockReason=null; this.mobLastSampleMs=null; this.mobD9SNeutralLastSampleMs=null; this.mobLastGuidedSignature=null;
    this.mobPendingActions=[];
    this.territoryVisitKeys = new Set();
    this.c0e2PocketVisitKeys = new Set();
    const initialRead = this.frameState?.territoryExplorationLastRead;
    this.territoryLastReadKey = initialRead?.localSequence
      ? `${initialRead.region}:${initialRead.localSequence}` : null;
    this.captureStartedAt = new Date().toISOString(); this.captureStoppedAt = null; this.captureActive = true;
    this.capturePullBaseline = this.authoritySnapshot().heldMaterialMotion.cumulativePullDistance;
    this.recordEvent('capture-started'); this.sampleState(); this.updateRecordIndicator();
    this.captureTimer = setInterval(() => this.sampleState(), 150);
  }
  exportTimeline() {
    if (this.captureActive) this.sampleState();
    const exportedAt = new Date().toISOString();
    const endAt = this.captureStoppedAt ?? exportedAt;
    const report = {
      pass: 'LS1E2-VERIFIED-VASCULAR-LOCAL-RESPONSE', recorderRevision: 'C0C-REC1',
      recorderSchemaVersion: 2, circuitObservationRevision: 'C0D4-OBS1',
      mobilityObservationRevision: 'C0D4-MOB1', territoryObservationRevision: 'C0E1', territorySpatialRevision: 'C0E2', guideObservationRevision: 'GSL-4E2F-OBS1',
      captureStartedAt: this.captureStartedAt, captureStoppedAt: this.captureStoppedAt,
      captureDurationSeconds: this.captureStartedAt
        ? Number(((Date.parse(endAt) - Date.parse(this.captureStartedAt)) / 1000).toFixed(3)) : null,
      exportedAt, captureActive: this.captureActive,
      limitations: 'C0D4-MOB1 adds read-only movement and button-owner context; action acceptance remains unknown without gameplay-owner acknowledgement. C0D4-OBS1 appends Grave I, Grave II, Host effect/outcome, and Silt-return observations to REC1 without new gameplay. Events between 150ms polls or pruned from a producer ring may be missed. Owner state is retained across mounts, not browser reloads. No physical material transfer or off-route simulation is implied.',
      summary: this.timelineSummary(), events: this.captureEvents, finalAuthority: this.authoritySnapshot(),
      finalTerritoryObservation: this.frameState?.territoryExploration ?? null, finalCensus: this.snapshot(),
    };
    // Compact JSON: no chronology lost, substantially less disk space than
    // pretty-printing 1000s of high-frequency telemetry records.
    const url = URL.createObjectURL(new Blob([JSON.stringify(report)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'BLOB_LS1E2_C0C_REC1_OBSERVATION.json'; a.click();
    this.updateRecordIndicator('JSON DOWNLOAD REQUESTED · upload observation file');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  snapshot() {
    const groups = new Map();
    let meshes = 0, excluded = 0, named = 0;
    this.scene?.traverse(obj => {
      if (!obj.isMesh && !obj.isPoints && !obj.isLine) return;
      meshes++;
      if (obj.name) named++;
      if (obj.userData?.targetingSuppressed) excluded++;
      const owner = obj.parent?.name || obj.name || '(unnamed)';
      const key = safe(owner);
      const row = groups.get(key) ?? { owner: key, count: 0, examples: [], suppressed: 0, source: safe(obj.userData?.source ?? obj.parent?.userData?.source ?? 'unknown') };
      row.count++;
      if (obj.userData?.targetingSuppressed) row.suppressed++;
      if (row.examples.length < 3) row.examples.push({ name: safe(obj.name), uuid: obj.uuid, userDataKeys: Object.keys(obj.userData ?? {}).slice(0, 12) });
      groups.set(key, row);
    });
    const fs = this.frameState ?? {};
    const providers = [fs.worldAttentionCandidates, fs.entityAttentionCandidates];
    const candidates = providers.flatMap(p => p?.active && Array.isArray(p.items) ? p.items : []).map(item => ({ id: safe(item.id), label: safe(item.label ?? item.id), source: safe(item.source), kind: safe(item.targetKind) }));
    const silt = fs.siltPressureRoute ?? {};
    const aim = fs.siltMaterialAim ?? {};
    const knownFamilies = [
      ['guide', /guide_orbiter|guide_path|guide_surface|hub_guide/i],
      ['silt_material', /^silt_LS1B_silt-grain/i],
      ['silt_stock', /silt_LS1B_authoritative_closed_matter_cycle|silt_porous_nutrient_packet/i],
      ['verb_effect', /core_verb_physicalization|absorb_commitment|absorb_helical|stabilize_gyroscopic/i]
    ];
    const entityFamilies = knownFamilies.map(([kind, pattern]) => ({
      kind,
      owners: [...groups.values()].filter(row => pattern.test(row.owner)).map(row => ({
        owner: row.owner, primitives: row.count, suppressed: row.suppressed,
        classification: 'scene-owner-only',
      }))
    }));
    const effectiveId = aim.heldId ?? aim.lockedId ?? aim.candidateId ?? null;
    const materialTarget = {
      candidateId: aim.candidateId ?? null,
      lockedId: aim.lockedId ?? null,
      heldId: aim.heldId ?? null,
      effectiveId,
      authority: aim.heldId || aim.lockedId ? 'silt-committed' : aim.candidateId ? 'silt-candidate' : 'none',
      position: silt.siltGrip?.position ?? null,
      positionMeaning: silt.siltGrip?.position ? 'grip-snapshot-only' : 'unavailable',
      verbDestinations: {
        pulse: 'unverified-legacy-route', absorb: 'unverified-legacy-route',
        stabilize: 'unverified-legacy-route'
      }
    };
    return {
      pass: 'LS1D1D2B', timestamp: new Date().toISOString(),
      summary: { renderedPrimitives: meshes, namedPrimitives: named, targetingSuppressedPrimitives: excluded, groupedOwners: groups.size, registeredAttentionCandidates: candidates.length },
      selected: { legacyTarget: fs.targeting?.targetId ?? 'none', legacyLabel: fs.targeting?.targetLabel ?? 'none', legacySource: fs.targeting?.worldAttentionSource ?? 'none', siltGrip: silt.siltGrip ?? null },
      attentionCandidates: candidates.slice(0, 300),
      entityBridge: { materialTarget, entityFamilies, note: 'Diagnostic association only. No registration, target routing, or verb behavior modified.' },
      hostConnections: { source: fs.hostConnections ?? null, vascularObservation: fs.vascularRhythmRoute?.hostConnectionObservation ?? null, vascularLocalResponse: fs.vascularRhythmRoute?.siltSignalResponse ?? null },
      progression: { silt: { active: !!silt.active, completed: !!silt.completed, returnFoldReady: !!silt.returnFoldReady, pressureRead: !!silt.pressureRead, ribsReleased: !!silt.ribsReleased, safeMatterAbsorbed: !!silt.safeMatterAbsorbed, status: safe(silt.status) } },
      groups: [...groups.values()].sort((a,b) => b.count - a.count).slice(0, 250),
      caveat: 'Mesh grouping is diagnostic, not stable entity identity. Missing labels do not imply targetability.'
    };
  }
  toggle() {
    this.visible = !this.visible;
    if (!this.visible) { this.panel?.remove(); this.panel = null; return; }
    this.lastReport = this.snapshot();
    const r = this.lastReport;
    const panel = document.createElement('div');
    panel.setAttribute('role', 'status');
    panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:99999;max-width:min(430px,90vw);max-height:75vh;overflow:auto;padding:14px;background:rgba(8,14,20,.94);color:#d9f5ee;border:1px solid #79a9a0;border-radius:8px;font:12px/1.5 monospace;pointer-events:none;white-space:pre-wrap';
    const preview = r.groups.slice(0, 16).map(g => `${g.owner}: ${g.count}${g.suppressed ? ' [suppressed '+g.suppressed+']' : ''}`).join('\n');
    const signal = this.frameState?.vascularRhythmRoute?.hostConnectionObservation;
    const response = this.frameState?.vascularRhythmRoute?.siltSignalResponse;
    const signalText = response?.receivedTotal > 0
      ? `Silt: ${response.lastSubjectId} / ${response.receivedTotal} received\nVascular membrane: ${response.membraneLoad.toFixed(3)}, flow: ×${response.directionalFlowScale.toFixed(3)}\nNo grain transfer / no route credit`
      : signal?.observedCount > 0 ? `Silt cause: ${signal.mostRecentGrainId} / ${signal.observedCount}\nSignal-only · no material transfer` : `Silt cause: none`;
    panel.textContent = `WORLD OBJECT CENSUS / LS1E1\nF4 close · F5 export JSON\n\nPrimitives: ${r.summary.renderedPrimitives}\nGrouped owners: ${r.summary.groupedOwners}\nRegistered attention candidates: ${r.summary.registeredAttentionCandidates}\nSuppressed primitives: ${r.summary.targetingSuppressedPrimitives}\n\nLegacy target: ${r.selected.legacyTarget}\nSilt candidate: ${r.entityBridge.materialTarget.candidateId ?? "none"}\nSilt committed: ${r.entityBridge.materialTarget.heldId ?? "none"}\nGuide owners: ${r.entityBridge.entityFamilies[0].owners.length}\nSilt completed: ${r.progression.silt.completed}\nReturn fold ready: ${r.progression.silt.returnFoldReady}\n${signalText}\n\nSCENE GROUPS (top 16)\n${preview}\n\nSnapshot only; no gameplay changes.`;
    document.body.appendChild(panel); this.panel = panel;
  }
  exportReport() {
    const report = this.snapshot(); this.lastReport = report;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'BLOB_LS1D1D2B_ENTITY_BRIDGE.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
