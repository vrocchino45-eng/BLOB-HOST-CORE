import { buildCoreArrangementLabels, coreArrangementLabelRows, compactCoreArrangementLabelRows } from './CoreArrangementLabels.js';

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
    pass: 'LS1C0.1', region, cellId: frameState.activeCellId ?? 'none',
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

/**
 * LS1C0.1 — screen projection for scene-owned anchors only. No raycast, no
 * implied contact/collision. Keep projection independent of progression.
 */
export function projectQuickLookAnchor(anchor, camera, viewport, maxDistance = 27) {
  if (!anchor?.getWorldPosition || !camera || !viewport?.width || !viewport?.height) return null;
  if (!anchor.visible) return null;
  // Camera uses the same world coordinate system as the owned scene object.
  const cameraWorld = camera.position.clone();
  camera.getWorldPosition(cameraWorld);
  const world = anchor.getWorldPosition(camera.position.clone());
  const direction = world.clone().sub(cameraWorld);
  const distance = direction.length();
  if (distance > maxDistance || distance < 0.001) return null;
  const forward = camera.getWorldDirection(camera.position.clone());
  if (forward.dot(direction) <= 0.15) return null;
  const ndc = world.project(camera);
  if (!Number.isFinite(ndc.x) || !Number.isFinite(ndc.y) || ndc.z > 1 || ndc.z < -1) return null;
  // Offscreen objects do not place edge arrows or fictional landmark pointers.
  if (Math.abs(ndc.x) > 0.93 || Math.abs(ndc.y) > 0.89) return null;
  return {
    x: viewport.left + (ndc.x + 1) * viewport.width / 2,
    y: viewport.top + (1 - ndc.y) * viewport.height / 2,
    distance
  };
}

const bubbleCss = {
  position: 'fixed', minWidth: '104px', maxWidth: '180px',
  color: '#e6f4e9', background: 'rgba(8,21,26,.88)',
  border: '1px solid rgba(166,215,197,.62)', borderRadius: '11px',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: '10px', lineHeight: '1.34', padding: '7px 9px',
  zIndex: '47', pointerEvents: 'none', boxShadow: '0 3px 16px #0009'
};

export class QuickLookInspectorSystem {
  constructor({ frameState, repairTrialEnabled = false }) {
    if (!frameState) throw new Error('[QuickLookInspectorSystem] frameState is required');
    this.frameState = frameState;
    this.repairTrialEnabled = repairTrialEnabled === true;
    this.coreLabels = null;
    this.coreLabelSignature = null;
    this.open = false;
    this.expanded = false;
    this.root = null;
    this.body = null;
    this.mute = null;
    this.bubbleLayer = null;
    this.bubbles = new Map();
    this.bubbleLinks = new Map();
    this.lastSnapshot = null;
    this.detailToggle = null;
    this.sceneRefs = null;
    this.lastSignature = '';
    this.sampleAccum = 0;
    this.comboHeldSeconds = 0;
    this.comboConsumed = false;
    this.boundKeydown = event => {
      if (event.code === 'F4' && !event.repeat) {
        if (event.shiftKey && this.open) this.toggleDetails();
        else this.toggle();
        event.preventDefault();
      }
    };
  }

  // GameRuntime supplies actual existing scene owners. No copies of simulation
  // truth, target picking, authored transforms, or separate world registry.
  bindScene({ camera, playerRoot, siltRoute, targetingSystem, viewportElement }) {
    this.sceneRefs = { camera, playerRoot, siltRoute, targetingSystem, viewportElement };
  }

  init() {
    window.addEventListener('keydown', this.boundKeydown);
    this.mute = document.createElement('div');
    this.mute.id = 'blob-quick-look-world-mute';
    Object.assign(this.mute.style, {
      position: 'fixed', inset: '0', background: 'rgba(9,19,23,.27)',
      pointerEvents: 'none', zIndex: '36', display: 'none'
    });
    document.body.appendChild(this.mute);

    this.bubbleLayer = document.createElement('div');
    this.bubbleLayer.id = 'blob-quick-look-world-bubbles';
    Object.assign(this.bubbleLayer.style, {
      position: 'fixed', inset: '0', display: 'none', pointerEvents: 'none', zIndex: '46'
    });
    document.body.appendChild(this.bubbleLayer);

    this.detailToggle = document.createElement('button');
    this.detailToggle.type = 'button';
    this.detailToggle.textContent = 'DESIGN NOTES ▸';
    this.detailToggle.setAttribute('aria-label', 'Expand BLOB Quick Look design notes');
    Object.assign(this.detailToggle.style, {
      position: 'fixed', right: '16px', bottom: '16px', zIndex: '48',
      display: 'none', pointerEvents: 'auto', padding: '7px 11px',
      border: '1px solid rgba(163,213,199,.68)', borderRadius: '9px',
      background: 'rgba(7,22,27,.9)', color: '#e3f5ef',
      font: '11px ui-monospace, SFMono-Regular, Consolas, monospace',
      cursor: 'pointer'
    });
    this.detailToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      this.toggleDetails();
    });
    document.body.appendChild(this.detailToggle);

    this.root = document.createElement('aside');
    this.root.id = 'blob-quick-look-design-inspector';
    this.root.setAttribute('aria-label', 'BLOB expanded world design inspector');
    this.root.tabIndex = 0;
    Object.assign(this.root.style, {
      position: 'fixed', right: '14px', bottom: '51px',
      width: 'min(375px, calc(100vw - 28px))',
      maxHeight: 'min(62vh, 560px)', overflowY: 'auto', display: 'none',
      color: '#e8f6ed', background: 'rgba(5,12,17,.95)',
      border: '1px solid rgba(151,220,204,.55)', borderRadius: '12px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '11px', lineHeight: '1.4', padding: '12px',
      zIndex: '47', pointerEvents: 'auto', boxShadow: '0 5px 22px #0009'
    });
    this.body = document.createElement('div');
    this.root.appendChild(this.body);
    document.body.appendChild(this.root);
    this.coreLabels = document.createElement('aside');
    this.coreLabels.id = 'blob-core-arrangement-labels';
    this.coreLabels.setAttribute('aria-label', 'Core arrangement and verb effects');
    Object.assign(this.coreLabels.style, {
      position:'fixed', right:'14px', top:'14px', width:'min(350px, calc(100vw - 28px))',
      maxHeight:'calc(100vh - 82px)', overflowY:'auto', boxSizing:'border-box',
      display:'none', padding:'10px 12px', border:'1px solid #9ee9da', borderRadius:'12px',
      background:'rgba(5,16,22,.95)', color:'#e8f6ed', zIndex:'47', pointerEvents:'auto',
      font:'11px/1.35 ui-monospace, SFMono-Regular, Consolas, monospace'
    });
    document.body.appendChild(this.coreLabels);
    this.publish();
  }

  syncCoreLabels() {
    if (!this.coreLabels) return;
    this.coreLabels.style.display = this.open && !this.expanded ? 'block' : 'none';
    if (!this.open) return;
    const snapshot = buildCoreArrangementLabels(this.frameState, {repairTrialEnabled:this.repairTrialEnabled});
    const world = buildQuickLookSnapshot(this.frameState);
    const rows = [{title:'WORLD / CORE', text:`${world.region} · ${snapshot.inWork ? 'Core Work' : snapshot.inInspection ? 'Core inspection' : world.focus}`}, ...compactCoreArrangementLabelRows(snapshot)];
    const signature = JSON.stringify(rows);
    if (signature === this.coreLabelSignature) return;
    this.coreLabelSignature = signature;
    const scroll = this.coreLabels.scrollTop;
    this.coreLabels.replaceChildren();
    for (const row of rows) {
      const title = document.createElement('div');
      title.textContent = row.title;
      title.style.cssText = 'font-size:10px;font-weight:700;color:#9defff;margin-top:5px';
      this.coreLabels.appendChild(title);
      if (row.text) {
        const text = document.createElement('div');
        text.textContent = row.text;
        text.style.cssText = 'line-height:1.25;margin:2px 0 0;overflow-wrap:anywhere';
        this.coreLabels.appendChild(text);
      }
    }
    this.coreLabels.scrollTop = scroll;
  }

  toggle() {
    this.open = !this.open;
    if (!this.open) this.expanded = false;
    if (this.mute) this.mute.style.display = this.open ? 'block' : 'none';
    if (this.bubbleLayer) this.bubbleLayer.style.display = this.open ? 'block' : 'none';
    if (this.detailToggle) this.detailToggle.style.display = this.open ? 'block' : 'none';
    if (this.root) this.root.style.display = this.open && this.expanded ? 'block' : 'none';
    this.lastSignature = '';
    this.syncCoreLabels();
    this.publish();
    if (this.open) {
      this.lastSnapshot = buildQuickLookSnapshot(this.frameState);
      this.render(this.lastSnapshot);
      this.syncCamera();
    }
  }

  toggleDetails() {
    if (!this.open) return;
    this.expanded = !this.expanded;
    if (this.root) this.root.style.display = this.expanded ? 'block' : 'none';
    if (this.detailToggle) this.detailToggle.textContent = this.expanded ? 'DESIGN NOTES ▾' : 'DESIGN NOTES ▸';
    this.lastSignature = '';
    this.syncCoreLabels();
    this.publish();
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
    this.syncCoreLabels();
    const snapshot = buildQuickLookSnapshot(frameState);
    this.lastSnapshot = snapshot;
    const signature = JSON.stringify({world:snapshot, core:this.expanded ? buildCoreArrangementLabels(frameState, {repairTrialEnabled:this.repairTrialEnabled}) : null});
    if (signature !== this.lastSignature) this.render(snapshot, signature);
    this.publish(snapshot);
  }

  publish(snapshot = null) {
    this.frameState.quickLookInspector = {
      pass: 'CONNECTION41', open: this.open, expanded: this.expanded,
      coreLabelsEnabled: this.open, coreLabelsVisible: this.open && !this.expanded,
      presentationOnly: true, worldAnchors: Boolean(this.sceneRefs),
      shortcutKeyboard: 'F4 / Shift+F4 design notes',
      shortcutController: 'Hold LB + RB for 0.6s',
      cellId: this.frameState.activeCellId ?? 'none',
      inspectedHabitat: this.frameState.siltPressureRoute?.habitatFoundation?.currentHabitatId ?? 'none',
      lastRegion: snapshot?.region ?? 'none'
    };
  }

  // A label is shown only for a live scene owner within camera view. A Silt
  // 'habitat' is an authored zone, NOT a raycast-targetable material object.
  resolveBubbles(snapshot) {
    const { playerRoot, siltRoute, targetingSystem } = this.sceneRefs ?? {};
    const live = this.frameState.siltPressureRoute ?? {};
    const cycle = live.livingMaterialCycle;
    const count = cycle?.counts ?? {};
    const result = [];
    const work = this.frameState.coreWorkManipulation ?? {};
    if (this.frameState.inspectionCamera?.coreWorkActive || this.frameState.tightInspectionCamera?.coreWorkActive) {
      for (const p of this.frameState.spatialCoreChemistry?.placements ?? []) {
        const anchor = playerRoot?.getObjectByName(p.pieceId);
        if (anchor) result.push({id:'piece-'+p.pieceId, anchor,
          title:`${p.pieceId===work.selectedPieceId ? 'SELECTED · ' : ''}${p.label}`,
          detail:`${p.zoneLabel} · ${p.interactionLabel}`, offsetX:24, offsetY:18,
          maxDistance:80, accent:p.pieceId===work.selectedPieceId ? '#ffdf80' : '#9ee9da'});
      }
    }
    if (playerRoot) result.push({
      id: 'core', anchor: playerRoot,
      title: `CORE · ${snapshot.phaseCount ?? '?'}-PHASE`,
      detail: `${goodText(this.frameState.coreEngine?.currentPhaseFunction, 'engine')} · X / RT / LT`,
      offsetX: 30, offsetY: 24, maxDistance: 80, accent: '#9ee9da'
    });

    const target = targetingSystem?.relationshipTarget ?? targetingSystem?.attentionTarget;
    if (this.frameState.targeting?.active && target?.root) result.push({
      id: 'target', anchor: target.root,
      title: snapshot.focus,
      detail: `Live selected target · ${goodText(snapshot.focusKind, 'object')}`,
      offsetX: 18, offsetY: -49, maxDistance: 19, accent: '#f2ce96'
    });

    if (snapshot.cellId === 'CELL_SILT_PRESSURE_ROUTE_001' && siltRoute?.active) {
      const current = live.habitatFoundation?.currentHabitatId;
      const lobe = siltRoute.habitatLobes?.find(({ recipe }) => recipe?.id === current);
      if (lobe?.group) {
        const title = current === 'garden' ? 'SEDIMENT GARDEN'
          : current === 'veins' ? 'CIRCULATION VEINS' : 'SILT RESERVOIR';
        const detail = current === 'garden'
          ? `Settled ${whole(count.settled)} · growing ${whole(count.growing) + whole(count.mature)} · hold LT`
          : current === 'veins'
            ? `Seeping ${whole(count.veins) + whole(count.garden_transit)} · X speeds flow`
            : `Stock ${whole(count.reservoir)} / ${whole(cycle?.currentUnitCount)} · X speeds flow`;
        result.push({ id: 'habitat', anchor: lobe.group, title, detail,
          offsetX: -48, offsetY: -71, maxDistance: 24, accent: '#b6c891' });
      }
      // The quest packet is genuine scene geometry; the replenishing stock is
      // a separate scene mesh and must never be presented as the quest reward.
      if (!this.frameState.targeting?.active) {
        const packet = !live.safeMatterAbsorbed && siltRoute.safePacket?.visible
          ? siltRoute.safePacket : cycle?.active ? siltRoute.livingReservoirBody : null;
        if (packet) result.push({
          id: 'reservoirObject', anchor: packet,
          title: live.safeMatterAbsorbed ? 'REPLENISHING STOCK' : 'YELLOW POROUS PACKET',
          detail: live.safeMatterAbsorbed
            ? `${whole(count.reservoir)} stored pieces · renewable mass`
            : 'Hold RT nearby · one-time route packet',
          offsetX: 24, offsetY: -39, maxDistance: 14, accent: '#ebc077'
        });
      }
    }
    // No generic scenery bubble unless the target provider identifies it.
    return result.slice(0, 3);
  }

  // Called after camera update once per rendered frame, not per simulation
  // substep. Update positions only; content is refreshed at 5 Hz by update().
  syncCamera() {
    if (!this.open || !this.bubbleLayer || !this.sceneRefs?.camera) return;
    const { camera, viewportElement } = this.sceneRefs;
    const rect = viewportElement?.getBoundingClientRect?.() ?? {
      left: 0, top: 0, width: window.innerWidth, height: window.innerHeight
    };
    if (!rect.width || !rect.height) return;
    camera.updateMatrixWorld?.();
    const descriptors = this.resolveBubbles(this.lastSnapshot ?? buildQuickLookSnapshot(this.frameState));
    const visible = new Set();
    const occupied = [];
    for (const desc of descriptors) {
      const pos = projectQuickLookAnchor(desc.anchor, camera, rect, desc.maxDistance);
      if (!pos) continue;
      const w = desc.id === 'core' ? 140 : 174;
      const h = 48;
      let x = Math.max(rect.left + 6, Math.min(rect.left + rect.width - w - 6, pos.x + desc.offsetX));
      let y = Math.max(rect.top + 7, Math.min(rect.top + rect.height - h - 8, pos.y + desc.offsetY));
      // Keep annotations apart when multiple anchors overlap in projection.
      for (let tries = 0; tries < 4 && occupied.some(r =>
        x < r.x + r.w + 8 && x + w + 8 > r.x && y < r.y + r.h + 8 && y + h + 8 > r.y
      ); tries++) y = Math.max(rect.top + 7,
        Math.min(rect.top + rect.height - h - 8, y + (tries % 2 === 0 ? 61 : -122)));
      occupied.push({ x, y, w, h });
      visible.add(desc.id);
      let el = this.bubbles.get(desc.id);
      if (!el) {
        el = document.createElement('div');
        el.dataset.quickLookBubble = desc.id;
        Object.assign(el.style, bubbleCss);
        const name = document.createElement('div');
        name.style.cssText = 'font-weight:700;font-size:10px;letter-spacing:.04em';
        const detail = document.createElement('div');
        detail.style.cssText = 'font-size:10px;color:#cad5d0;margin-top:2px';
        el.append(name, detail);
        this.bubbleLayer.appendChild(el);
        this.bubbles.set(desc.id, el);
        if (desc.id !== 'core') {
          const link = document.createElement('div');
          link.dataset.quickLookLink = desc.id;
          Object.assign(link.style, {
            position: 'fixed', height: '0', pointerEvents: 'none',
            borderTop: '1px dashed rgba(178,212,200,.55)',
            transformOrigin: 'left center', zIndex: '46'
          });
          this.bubbleLayer.appendChild(link);
          this.bubbleLinks.set(desc.id, link);
        }
      }
      if (el.dataset.contentKey !== `${desc.title}|${desc.detail}`) {
        el.firstChild.textContent = desc.title;
        el.lastChild.textContent = desc.detail;
        el.dataset.contentKey = `${desc.title}|${desc.detail}`;
      }
      el.style.borderColor = desc.accent;
      el.style.transform = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;
      el.style.display = 'block';
      const link = this.bubbleLinks.get(desc.id);
      if (link) {
        const toX = x + w / 2;
        const toY = y + h / 2;
        const dx = toX - pos.x;
        const dy = toY - pos.y;
        const length = Math.hypot(dx, dy);
        link.style.left = `${Math.round(pos.x)}px`;
        link.style.top = `${Math.round(pos.y)}px`;
        link.style.width = `${Math.round(length)}px`;
        link.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        link.style.display = 'block';
      }
    }
    for (const [id, el] of this.bubbles) if (!visible.has(id)) el.style.display = 'none';
    for (const [id, link] of this.bubbleLinks) if (!visible.has(id)) link.style.display = 'none';
  }

  render(snapshot, signature = JSON.stringify(snapshot)) {
    if (!this.body) return;
    this.lastSignature = signature;
    const b = this.body;
    const scroll = this.root?.scrollTop ?? 0;
    b.replaceChildren();
    const header = document.createElement('div');
    header.style.cssText = 'font-weight:700;font-size:13px;color:#d9f9ed;margin-bottom:3px';
    header.textContent = `WORLD DESIGN // ${snapshot.region}`;
    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:10px;color:#93b4bb';
    hint.textContent = 'F4 / LB+RB to close · Shift+F4 to hide notes · labels ON · Core arrangement at right · Shift+F4 for notes';
    const loc = document.createElement('div');
    loc.style.cssText = 'color:#fae4af;font-size:12px;margin-top:9px';
    loc.textContent = `LANDMARK: ${snapshot.landmark}`;
    const focus = document.createElement('div');
    focus.style.cssText = 'font-size:10px;color:#bdd3d4;margin-top:3px';
    focus.textContent = `Focus: ${snapshot.focus} (${snapshot.focusSource})`;
    b.append(header, hint, loc, focus);
    const core = buildCoreArrangementLabels(this.frameState, {repairTrialEnabled:this.repairTrialEnabled});
    for (const row of coreArrangementLabelRows(core)) line(b, row.title, row.text ? [row.text] : []);
    line(b, 'HOW TO INTERACT · ACTUAL CONTROLS', snapshot.actions);
    line(b, 'WHAT THE RUNTIME SAYS · IMPLEMENTED', snapshot.live.length ? snapshot.live : [snapshot.status]);
    line(b, '3 → 6 → 12 · CORE ENGINE', [snapshot.phaseExplanation, snapshot.phaseDetail, snapshot.phaseScope]);
    line(b, 'DESIGN INTENT · NOT ALL IMPLEMENTED', snapshot.design);
    line(b, 'PLAYTEST QUESTIONS / PROPOSED CHANGES', snapshot.gap);
    const footer = document.createElement('div');
    footer.style.cssText = 'font-size:9px;color:#92a6a8;margin-top:12px;border-top:1px solid #66868c55;padding-top:7px';
    footer.textContent = 'Scene-anchored diagnostic · labels do not change actual targeting, geometry or gameplay';
    b.appendChild(footer);
    if (this.root) this.root.scrollTop = scroll;
  }
}
