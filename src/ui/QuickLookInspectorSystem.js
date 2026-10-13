/**
 * LS1C0 — optional, read-only world-design quick look.
 *
 * The inspector consumes canonical runtime publications. It never gives route
 * credit, retargets a noun, modifies geometry, or changes gameplay input.
 * Distinguish live runtime facts, authored explanation, and future proposals.
 */
const CELL_LABELS = Object.freeze({
  CELL_MEMBRANE_NURSERY_001: 'Surface Wake',
  CELL_SCAR_FLOW_FOLD_001: 'Guide / Scar',
  CELL_SIGNAL_CHORUS_NERVE_001: 'Hub',
  CELL_GRAVE_MEMORY_RESIDUE_BED_001: 'Grave',
  CELL_VASCULAR_RHYTHM_ROUTE_001: 'Vascular',
  CELL_SILT_PRESSURE_ROUTE_001: 'Silt',
  CELL_COMB_THRESHOLD_FILTER_001: 'Comb',
  CELL_APERTURE_FIELDS_ARRIVAL_001: 'Aperture Fields',
  CELL_BLOOM_RESIDUE_FORK_001: 'Bloom Residue Fork',
  CELL_GRAVE_SCAR_MEMORY_SEAM_001: 'Grave / Scar Memory Seam'
});
const HABITAT_LABELS = Object.freeze({
  throat: 'Pressure throat / original rib passage',
  reservoir: 'Reservoir / yellow porous packet area',
  garden: 'Sediment Garden / settling and budding pocket',
  veins: 'Circulation Veins / seep transport channel'
});
const PHASE_LABELS = Object.freeze({
  reservoir: 'stored', veins: 'seeping', garden_transit: 'in transit',
  settled: 'settled', growing: 'forming buds', mature: 'mature', returning: 'returning'
});
const goodText = (value, fallback = 'Not currently identified') =>
  typeof value === 'string' && value.trim() && value !== 'none' ? value.replace(/_/g, ' ') : fallback;
const finite = (n) => typeof n === 'number' && Number.isFinite(n);
const whole = (n, fallback = 0) => finite(n) ? Math.round(n) : fallback;

export function buildQuickLookSnapshot(frameState = {}) {
  const region = CELL_LABELS[frameState.activeCellId] ?? goodText(frameState.activeCellId, 'Unidentified region');
  const target = frameState.targeting ?? {};
  const hasTarget = Boolean(target.active && target.targetId && target.targetId !== 'none');
  const engine = frameState.coreEngine ?? {};
  const phaseCount = [3, 6, 12].includes(engine.phaseCount) ? engine.phaseCount : null;
  const phaseExplanation = phaseCount === 3
    ? '3: one engine phase per Core function (Pulse, Absorb, Stabilize).'
    : phaseCount === 6
      ? '6: two counterpart engine phases per function.'
      : phaseCount === 12
        ? '12: four resolving engine phases per function.'
        : 'Core phase publication unavailable.';
  const base = {
    pass: 'LS1C0', region, cellId: frameState.activeCellId ?? 'none',
    focus: hasTarget ? goodText(target.targetLabel, target.targetId) : 'No canonical target selected',
    focusSource: hasTarget ? 'Live targeting system' : 'Region / habitat position, not camera raycast',
    focusKind: hasTarget ? goodText(target.targetKind, 'Unclassified') : 'none',
    phaseCount, phaseExplanation,
    phaseDetail: phaseCount
      ? `Current: ${goodText(engine.currentPhaseFunction, 'unknown')} / ${goodText(engine.currentPhaseLabel, '?')} · ${whole(engine.rpm)} indicated RPM (not literal mechanical RPM)`
      : 'No live phase detail.',
    phaseScope: 'Implemented in Core engine sequencing. This does NOT prove that Silt geometry or ecology has 3/6/12 corresponding structures.',
    landmark: 'Use visible landmarks and live target name; player nickname not yet authored.',
    actions: [
      'X = Pulse · RT = Absorb · LT = Stabilize',
      'LT + X = Stabilize while pulsing (context-dependent)',
      'A = deliberate contextual commitment when offered',
      'General Core controls only; this region has no verified local interaction guide yet.'
    ],
    live: [],
    design: ['Physical reaction should be visible at the contacted material, not only in the HUD.'],
    gap: ['Visual correspondence is NOT automatically measured. Review in gameplay before prescribing a percentage.'],
    status: 'Region identification only; detailed local design sheet not authored yet.'
  };

  if (frameState.activeCellId !== 'CELL_SILT_PRESSURE_ROUTE_001') return base;

  const silt = frameState.siltPressureRoute ?? {};
  const habitatId = silt.habitatFoundation?.currentHabitatId ?? 'none';
  const cycle = silt.livingMaterialCycle ?? null;
  const counts = cycle?.counts ?? {};
  const sum = Object.values(counts).reduce((n, x) => n + (finite(x) ? x : 0), 0);
  const total = finite(cycle?.currentUnitCount) ? cycle.currentUnitCount : 0;
  const massConserved = cycle && finite(cycle.conservedMass) && finite(cycle.initialMass)
    && cycle.conservedMass === cycle.initialMass && sum === total;

  base.landmark = HABITAT_LABELS[habitatId] ?? 'Inside Silt; current habitat not resolved';
  base.focusSource = hasTarget ? 'Live targeting system; habitat from nearest authored space' : 'Nearest authored habitat (not a camera raycast)';
  base.status = cycle?.active ? 'Living cycle active' : 'Living cycle dormant until the first porous packet is absorbed';
  base.live = [
    `Pressure route: ${goodText(silt.stage, 'not published')} · ${silt.completed ? 'complete' : 'in progress'}`,
    `Pressure read: ${silt.pressureRead ? 'retained' : 'not yet'} · ribs: ${silt.ribsReleased ? 'open' : 'not yet open'} · porous packet: ${silt.safeMatterAbsorbed ? 'absorbed' : 'present'}`,
    `Habitat: ${goodText(habitatId)} · geologic shell: ${silt.habitatFoundation?.active ? 'active' : 'unavailable'}`,
    cycle
      ? `LS1B material: ${whole(cycle.conservedMass)} / ${whole(cycle.initialMass)} conserved mass · ${whole(total)} stable pieces · ledger ${massConserved ? 'consistent' : 'check needed'}`
      : 'Material-cycle publication unavailable',
    cycle
      ? `Stock ${whole(counts.reservoir)} · seep ${whole(counts.veins) + whole(counts.garden_transit)} · settled ${whole(counts.settled)} · growing ${whole(counts.growing) + whole(counts.mature)} · returning ${whole(counts.returning)}`
      : 'No material-phase readout',
    cycle
      ? `Releases ${whole(cycle.releaseCount)} · replenishments ${whole(cycle.regenerationCount)} · latest ${goodText(cycle.lastEvent, 'none')}`
      : 'No cycle event'
  ];
  base.actions = [
    'Pressure ribs: hold LT near the low ribs, then press X while holding LT to read compressed flow.',
    'Keep LT held to brace the ribs open after the pressure read.',
    'Warm porous packet: hold RT close to it; dark compact clumps are a compression risk.',
    'After porous absorption: X near Reservoir / Veins speeds seep transport; hold LT in Garden to aid growth.'
  ];
  base.design = [
    'Current LS1B: conserved 8-piece Reservoir → Veins → Garden → return cycle; it runs without player input while Silt is active.',
    'Intended next: visibly identifiable accumulation → pressure → release → persistent changed geology, then ecology responds.',
    '3→6→12 currently describes Core engine timing; a matching material geometry lifecycle has NOT been built here.'
  ];
  base.gap = [
    'Visual verification: can you identify transport, deposited sediment, new growth and replenishment without looking at this panel?',
    'Geology contact: LS1A2 cavity walls are visual surfaces, not authoritative rock collision.',
    'Tuning requests such as “+50% visible sediment” should be recorded as proposed changes, then tested against measured counts or image coverage—not presented as measured deficits.'
  ];
  return base;
}

function line(parent, title, items) {
  const heading = document.createElement('div');
  heading.textContent = title;
  heading.style.cssText = 'font-size:10px;color:#9defff;letter-spacing:.08em;margin:10px 0 4px;font-weight:700';
  parent.appendChild(heading);
  for (const item of items) {
    const row = document.createElement('div');
    row.textContent = `• ${item}`;
    row.style.cssText = 'margin:3px 0;line-height:1.35;overflow-wrap:anywhere';
    parent.appendChild(row);
  }
}

export class QuickLookInspectorSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error('[QuickLookInspectorSystem] frameState is required');
    this.frameState = frameState;
    this.open = false;
    this.root = null;
    this.body = null;
    this.lastSignature = '';
    this.sampleAccum = 0;
    this.comboHeldSeconds = 0;
    this.comboConsumed = false;
    this.boundKeydown = event => {
      if (event.code === 'F4' && !event.repeat) {
        this.toggle();
        event.preventDefault();
      }
    };
  }

  init() {
    // Independent shortcut: F1–F3/Back debug cycling and Tab/View status stay untouched.
    window.addEventListener('keydown', this.boundKeydown);
    this.root = document.createElement('aside');
    this.root.id = 'blob-quick-look-design-inspector';
    this.root.setAttribute('aria-label', 'BLOB quick look world design inspector');
    this.root.tabIndex = 0;
    Object.assign(this.root.style, {
      position: 'fixed', right: '14px', bottom: '18px', width: 'min(420px, calc(100vw - 28px))',
      maxHeight: 'min(78vh, 640px)', overflowY: 'auto', display: 'none',
      color: '#e8f6ed', background: 'rgba(5,12,17,.91)',
      border: '1px solid rgba(151,220,204,.55)', borderRadius: '12px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '11px', lineHeight: '1.4', padding: '12px',
      zIndex: '45', pointerEvents: 'auto', boxShadow: '0 5px 22px #0009' 
    });
    this.body = document.createElement('div');
    this.root.appendChild(this.body);
    document.body.appendChild(this.root);
    this.publish();
  }

  toggle() {
    this.open = !this.open;
    if (this.root) this.root.style.display = this.open ? 'block' : 'none';
    this.lastSignature = '';
    this.publish();
    if (this.open) this.render(buildQuickLookSnapshot(this.frameState));
  }

  pollGamepad(dt) {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return;
    const pad = [...(navigator.getGamepads() ?? [])].find(p => p && p.connected);
    const bothBumpers = Boolean(pad?.buttons?.[4]?.pressed && pad?.buttons?.[5]?.pressed);
    if (!bothBumpers) { this.comboHeldSeconds = 0; this.comboConsumed = false; return; }
    this.comboHeldSeconds += Math.max(0, Math.min(dt, .06));
    if (this.comboHeldSeconds >= .6 && !this.comboConsumed) {
      this.comboConsumed = true;
      this.toggle();
    }
  }

  update(dt, frameState = this.frameState) {
    this.pollGamepad(dt);
    if (!this.open) return;
    this.sampleAccum += Math.max(0, dt ?? 0);
    if (this.sampleAccum < .2) return;
    this.sampleAccum = 0;
    const snapshot = buildQuickLookSnapshot(frameState);
    const signature = JSON.stringify(snapshot);
    if (signature !== this.lastSignature) this.render(snapshot, signature);
    this.publish(snapshot);
  }

  publish(snapshot = null) {
    this.frameState.quickLookInspector = {
      pass: 'LS1C0', open: this.open, presentationOnly: true,
      shortcutKeyboard: 'F4', shortcutController: 'Hold LB + RB for 0.6s',
      cellId: this.frameState.activeCellId ?? 'none',
      inspectedHabitat: this.frameState.siltPressureRoute?.habitatFoundation?.currentHabitatId ?? 'none',
      lastRegion: snapshot?.region ?? 'none'
    };
  }

  render(snapshot, signature = JSON.stringify(snapshot)) {
    if (!this.body) return;
    this.lastSignature = signature;
    const b = this.body;
    b.replaceChildren();
    const header = document.createElement('div');
    header.style.cssText = 'font-weight:700;font-size:13px;color:#d9f9ed;margin-bottom:3px';
    header.textContent = `QUICK LOOK // ${snapshot.region}`;
    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:10px;color:#93b4bb';
    hint.textContent = 'F4 / hold LB+RB 0.6s to close · scroll for more · gameplay continues';
    const loc = document.createElement('div');
    loc.style.cssText = 'color:#fae4af;font-size:12px;margin-top:9px';
    loc.textContent = `LANDMARK: ${snapshot.landmark}`;
    const focus = document.createElement('div');
    focus.style.cssText = 'font-size:10px;color:#bdd3d4;margin-top:3px';
    focus.textContent = `Focus: ${snapshot.focus} (${snapshot.focusSource})`;
    b.append(header, hint, loc, focus);
    line(b, 'HOW TO INTERACT · ACTUAL CONTROLS', snapshot.actions);
    line(b, 'WHAT THE RUNTIME SAYS · IMPLEMENTED', snapshot.live.length ? snapshot.live : [snapshot.status]);
    line(b, '3 → 6 → 12 · CORE ENGINE', [snapshot.phaseExplanation, snapshot.phaseDetail, snapshot.phaseScope]);
    line(b, 'DESIGN INTENT · NOT ALL IMPLEMENTED', snapshot.design);
    line(b, 'PLAYTEST QUESTIONS / PROPOSED CHANGES', snapshot.gap);
    const footer = document.createElement('div');
    footer.style.cssText = 'font-size:9px;color:#92a6a8;margin-top:12px;border-top:1px solid #66868c55;padding-top:7px';
    footer.textContent = 'Read-only diagnostic · no route credits, tuning changes, or targeting authority';
    b.appendChild(footer);
  }
}
