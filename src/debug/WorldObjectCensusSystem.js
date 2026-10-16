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
      return;
    }
    this.captureEvents = []; this.capturePrevious = null; this.inputPrevious = null;
    this.captureStartedAt = new Date().toISOString(); this.captureActive = true;
    this.recordEvent('capture-started'); this.sampleState();
    this.captureTimer = setInterval(() => this.sampleState(), 150);
  }
  exportTimeline() {
    if (this.captureActive) this.sampleState();
    const report = {
      pass: 'LS1D1D2E-INPUT-EDGES', captureStartedAt: this.captureStartedAt,
      exportedAt: new Date().toISOString(), captureActive: this.captureActive,
      limitations: 'Read-only 150ms sampling, raw keyboard/gamepad edges, and observed Silt state. Brief button taps may be missed; gamepad indices are not mapped to gameplay verbs. No authoritative Pulse force, Absorb transaction, orb spawn, or traversal provenance.',
      events: this.captureEvents, finalCensus: this.snapshot(),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'BLOB_LS1D1D2E_OBSERVATION.json'; a.click();
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
