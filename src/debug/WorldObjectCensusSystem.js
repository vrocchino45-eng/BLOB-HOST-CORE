// LS1D1D2A: read-only diagnostic. Does not register targets or alter progression.
const safe = value => String(value ?? 'none').slice(0, 100);
export class WorldObjectCensusSystem {
  constructor({ scene, frameState }) {
    this.scene = scene;
    this.frameState = frameState;
    this.panel = null;
    this.visible = false;
    this.lastReport = null;
    this.keyHandler = event => {
      if (event.code === 'F4') { event.preventDefault(); this.toggle(); }
      if (event.code === 'F5' && this.visible) { event.preventDefault(); this.exportReport(); }
    };
  }
  init() { window.addEventListener('keydown', this.keyHandler); }
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
    return {
      pass: 'LS1D1D2A', timestamp: new Date().toISOString(),
      summary: { renderedPrimitives: meshes, namedPrimitives: named, targetingSuppressedPrimitives: excluded, groupedOwners: groups.size, registeredAttentionCandidates: candidates.length },
      selected: { legacyTarget: fs.targeting?.targetId ?? 'none', legacyLabel: fs.targeting?.targetLabel ?? 'none', legacySource: fs.targeting?.worldAttentionSource ?? 'none', siltGrip: silt.siltGrip ?? null },
      attentionCandidates: candidates.slice(0, 300),
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
    panel.textContent = `WORLD OBJECT CENSUS / LS1D1D2A\nF4 close · F5 export JSON\n\nPrimitives: ${r.summary.renderedPrimitives}\nGrouped owners: ${r.summary.groupedOwners}\nRegistered attention candidates: ${r.summary.registeredAttentionCandidates}\nSuppressed primitives: ${r.summary.targetingSuppressedPrimitives}\n\nLegacy target: ${r.selected.legacyTarget}\nSilt completed: ${r.progression.silt.completed}\nReturn fold ready: ${r.progression.silt.returnFoldReady}\n\nSCENE GROUPS (top 16)\n${preview}\n\nSnapshot only; no gameplay changes.`;
    document.body.appendChild(panel); this.panel = panel;
  }
  exportReport() {
    const report = this.snapshot(); this.lastReport = report;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'BLOB_LS1D1D2A_WORLD_CENSUS.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
