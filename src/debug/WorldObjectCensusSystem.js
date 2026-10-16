// LS1D1D2B: read-only identity bridge diagnostic. Does not register targets or alter progression.
const safe = value => String(value ?? 'none').slice(0, 100);
export class WorldObjectCensusSystem {
  constructor({ scene, frameState }) {
    this.scene = scene;
    this.frameState = frameState;
    this.panel = null;
    this.visible = false;
    this.lastReport = null;
    this.captureActive = false;
    this.captureEvents = [];
    this.captureStartedAt = null;
    this.captureTimer = null;
    this.capturePrevious = null;
    this.inputPrevious = null;
    this.captureTick = 0;
    this.authorityPrevious = null;
    this.lastSiltDecisionSequence = null;
    this.recIndicator = null;
    this.recNoticeTimeout = null;
    this.keyHandler = event => {
      if (event.altKey && event.shiftKey && event.code === 'KeyR') { event.preventDefault(); this.toggleCapture(); return; }
      if (event.altKey && event.shiftKey && event.code === 'KeyE') { event.preventDefault(); this.exportTimeline(); return; }
      if (this.captureActive && !event.repeat) this.recordEvent('keyboard-down', { code: event.code, shift: event.shiftKey, alt: event.altKey, ctrl: event.ctrlKey, target: this.materialContext() });
      if (event.code === 'F4') { event.preventDefault(); this.toggle(); }
      if (event.code === 'F5' && this.visible) { event.preventDefault(); this.exportReport(); }
    };
  }
  init() {
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
      this.recIndicator.textContent = `● REC ${minutes}:${seconds}  ·  Alt+Shift+R stop`;
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
      heldMaterialMotion: {
        heldId: motion.heldId ?? null,
        radius: Number.isFinite(motion.radius) ? motion.radius : null,
        pulseCount: Number(motion.pulseCount ?? 0),
        cumulativePullDistance: Number(motion.cumulativePullDistance ?? 0),
        lastReceipt: motion.lastReceipt ?? null,
        transferPerformed: !!motion.transferPerformed
      },
      visualVerbAuthority: {
        targetId: fs.verbVisualTargetAuthority?.targetId ?? "none",
        pulse: fs.verbVisualTargetAuthority?.pulse ?? "unpublished",
        absorb: fs.verbVisualTargetAuthority?.absorb ?? "unpublished",
        gameplayAuthorityChanged: !!fs.verbVisualTargetAuthority?.gameplayAuthorityChanged
      },
    };
  }
  sampleAuthority() {
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
    const counts = {};
    const heldPulses = [];
    const heldAbsorbStarts = [];
    for (const event of this.captureEvents) {
      counts[event.type] = (counts[event.type] ?? 0) + 1;
      if (event.type === 'game-pulse-event' && event.heldTargetAtSample) heldPulses.push({ time: event.time, unitId: event.heldTargetAtSample, pulseEventId: event.pulseEventId });
      if (event.type === 'game-absorb-started' && event.heldTargetAtSample) heldAbsorbStarts.push({ time: event.time, unitId: event.heldTargetAtSample });
    }
    const routeDecisionCounts = {};
    const heldMotion = { pulseOutward: 0, pulseAtBound: 0, absorbInward: 0, absorbAtBound: 0, totalPulseDisplacement: 0, totalAbsorbDisplacement: 0 };
    for (const e of this.captureEvents) {
      if (e.type !== 'silt-authoritative-route-decision') continue;
      const d = e.decision ?? {};
      const key = `${d.kind ?? 'unknown'}:${d.route ?? d.decision ?? d.outcome ?? 'unknown'}`;
      routeDecisionCounts[key] = (routeDecisionCounts[key] ?? 0) + 1;
      if (d.kind !== 'held-material-motion') continue;
      if (d.verb === 'pulse') {
        if (d.appliedDisplacement > 0) heldMotion.pulseOutward++;
        else heldMotion.pulseAtBound++;
        heldMotion.totalPulseDisplacement += d.appliedDisplacement ?? 0;
      }
      if (d.verb === 'absorb') {
        if (d.appliedDisplacement > 0) heldMotion.absorbInward++;
        else heldMotion.absorbAtBound++;
        heldMotion.totalAbsorbDisplacement += d.appliedDisplacement ?? 0;
      }
    }
    heldMotion.totalPulseDisplacement = Number(heldMotion.totalPulseDisplacement.toFixed(4));
    heldMotion.totalAbsorbDisplacement = Number(heldMotion.totalAbsorbDisplacement.toFixed(4));
    return {
      eventCounts: counts, routeDecisionsObserved: this.captureEvents.filter(e => e.type === 'silt-authoritative-route-decision').length,
      routeDecisionCounts, heldMaterialMotion: heldMotion, pulsesObservedWhileHolding: heldPulses,
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
    this.captureEvents.push({ time: new Date().toISOString(), type, ...details });
    if (this.captureEvents.length > 2500) this.captureEvents.shift();
  }
  sampleState() {
    this.sampleInputs();
    this.sampleAuthority();
    this.sampleSiltDecisions();
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
      this.updateRecordIndicator('REC STOPPED · Alt+Shift+E export JSON');
      return;
    }
    this.captureEvents = []; this.capturePrevious = null; this.inputPrevious = null; this.authorityPrevious = null; this.lastSiltDecisionSequence = null;
    this.captureStartedAt = new Date().toISOString(); this.captureActive = true;
    this.recordEvent('capture-started'); this.sampleState(); this.updateRecordIndicator();
    this.captureTimer = setInterval(() => this.sampleState(), 150);
  }
  exportTimeline() {
    if (this.captureActive) this.sampleState();
    const report = {
      pass: 'LS1D1D2H-HELD-MATERIAL-MOTION', captureStartedAt: this.captureStartedAt,
      exportedAt: new Date().toISOString(), captureActive: this.captureActive,
      limitations: '150ms sampled global state plus bounded route and held-material-motion receipts. D2H receipts measure accepted Silt grip offset changes, not physics impulses or Core intake. No held-grain chemistry or material ownership transfer. Other subsystems, orb provenance, and traversal provenance remain unaudited.',
      summary: this.timelineSummary(), events: this.captureEvents, finalAuthority: this.authoritySnapshot(), finalCensus: this.snapshot(),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'BLOB_LS1D1D2H_OBSERVATION.json'; a.click();
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
    panel.textContent = `WORLD OBJECT CENSUS / LS1D1D2B\nF4 close · F5 export JSON\n\nPrimitives: ${r.summary.renderedPrimitives}\nGrouped owners: ${r.summary.groupedOwners}\nRegistered attention candidates: ${r.summary.registeredAttentionCandidates}\nSuppressed primitives: ${r.summary.targetingSuppressedPrimitives}\n\nLegacy target: ${r.selected.legacyTarget}\nSilt candidate: ${r.entityBridge.materialTarget.candidateId ?? "none"}\nSilt committed: ${r.entityBridge.materialTarget.heldId ?? "none"}\nGuide owners: ${r.entityBridge.entityFamilies[0].owners.length}\nSilt completed: ${r.progression.silt.completed}\nReturn fold ready: ${r.progression.silt.returnFoldReady}\n\nSCENE GROUPS (top 16)\n${preview}\n\nSnapshot only; no gameplay changes.`;
    document.body.appendChild(panel); this.panel = panel;
  }
  exportReport() {
    const report = this.snapshot(); this.lastReport = report;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'BLOB_LS1D1D2B_ENTITY_BRIDGE.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
