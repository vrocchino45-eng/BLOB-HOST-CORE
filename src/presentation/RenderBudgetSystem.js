const round = (value, places = 3) => Number((Number.isFinite(value) ? value : 0).toFixed(places));

const materialsOf = (object) => {
  if (!object?.material) return [];
  return Array.isArray(object.material) ? object.material.filter(Boolean) : [object.material];
};

const isRenderable = (object) => Boolean(
  object?.isMesh || object?.isLine || object?.isLineSegments || object?.isLineLoop || object?.isPoints || object?.isSprite
);

const isEffectivelyVisible = (object) => {
  let current = object;
  while (current) {
    if (current.visible === false) return false;
    current = current.parent;
  }
  return true;
};

const drawCallEstimate = (object) => {
  const materials = materialsOf(object);
  if (!materials.length) return 0;
  if (Array.isArray(object.material) && object.geometry?.groups?.length) {
    return object.geometry.groups.length;
  }
  return 1;
};

const geometryElementCount = (object) => {
  const geometry = object?.geometry;
  if (!geometry) return 0;
  return geometry.index?.count ?? geometry.attributes?.position?.count ?? 0;
};

const estimateLineSegments = (object) => {
  const count = geometryElementCount(object);
  if (!count) return 0;
  if (object.isLineSegments) return Math.floor(count / 2);
  if (object.isLineLoop) return count;
  if (object.isLine) return Math.max(0, count - 1);
  if (object.isMesh) {
    const wireframe = materialsOf(object).some((material) => material?.wireframe === true);
    if (wireframe) return Math.max(0, Math.floor(count / 3) * 3);
  }
  return 0;
};

const estimateTriangles = (object) => {
  if (!object?.isMesh) return 0;
  if (materialsOf(object).some((material) => material?.wireframe === true)) return 0;
  return Math.floor(geometryElementCount(object) / 3);
};

const topSceneOwner = (object, scene) => {
  let current = object;
  let owner = object;
  while (current?.parent && current.parent !== scene) {
    owner = current.parent;
    current = current.parent;
  }
  if (current?.parent === scene) owner = current;
  return owner?.name || owner?.type || "unnamed_scene_root";
};

const SURFACE_WAKE_LOCAL_DETAIL_ROOTS = [
  "surface_wake_visual_embodiment_HC008C",
  "surface_wake_layered_interaction_HC006E",
  "surface_wake_living_nursery_circuit_HC009C",
  "host_contact_shelf_HC031I4",
  "membrane_pocket_surface_001",
  "nursery_soft_pressure_fog_001",
  "nursery_membrane_tender_001",
  "membrane_watcher_001"
];

const SCAR_FLOW_LOCAL_DETAIL_ROOTS = [
  "scar_flow_fold_surface_001",
  "scar_pressure_haze_001",
  "guide_threshold_gameplay_fill_HC007B",
  "guide_threshold_layered_interaction_HC006F",
  "scar_flow_arrival_active_cell_ring",
  "scar_flow_arrival_focus_line",
  "scar_flow_hook_nearest_ring",
  "scar_flow_hook_relation_line",
  "scar_flow_interaction_stage_ring",
  "scar_flow_interaction_stage_line",
  "second_morph_signal_readiness_ring",
  "second_morph_signal_progress_ring"
];

/**
 * HC-031W2A3 — render-only budget + local-cell residency helper.
 *
 * It has no gameplay authority. It only suppresses leaf renderables whose entire
 * material set is fully transparent AND depth-write-disabled for the duration of
 * renderer.render(), then restores their authored visibility immediately after.
 * A low-frequency scene census identifies render roots without changing them.
 */
export class RenderBudgetSystem {
  constructor({ scene, censusIntervalSeconds = 2.0, zeroAlphaThreshold = 0.001 } = {}) {
    if (!scene) throw new Error("[RenderBudgetSystem] scene is required.");
    this.scene = scene;
    this.censusIntervalSeconds = censusIntervalSeconds;
    this.zeroAlphaThreshold = zeroAlphaThreshold;
    this.candidateObjects = [];
    this.restoreVisible = [];
    this.restoreResidencyRoots = [];
    this.residencyRootCache = new Map();
    this.lastScanRuntimeSeconds = -Infinity;
    this.lastCensus = null;
    this.lastPrepare = {
      pass: "HC-031W2A3",
      transparentZeroCulled: 0,
      transparentCandidates: 0,
      residencyMode: "none",
      residencyRootsCulled: 0,
      residencyRootNames: [],
      censusRefreshed: false
    };
  }

  prepare({ runtimeSeconds = 0, frameState = null } = {}) {
    this.restoreVisible.length = 0;
    this.restoreResidencyRoots.length = 0;

    // W2A3: continuity remains authored in gameplay state, but previous-cell local
    // detail is not submitted to the GPU once the transition envelope has settled.
    // Root visibility is restored immediately after renderer.render().
    const residency = this.applyResidencyCull(frameState);

    const censusRefreshed = !Number.isFinite(this.lastScanRuntimeSeconds)
      || runtimeSeconds - this.lastScanRuntimeSeconds >= this.censusIntervalSeconds;
    if (censusRefreshed) {
      this.refreshCandidatesAndCensus(runtimeSeconds);
    }

    let transparentZeroCulled = 0;
    for (const object of this.candidateObjects) {
      if (!object?.parent || object.children?.length || !isEffectivelyVisible(object)) continue;
      const materials = materialsOf(object);
      if (!materials.length || !this.isSafelyInvisible(materials)) continue;
      object.visible = false;
      this.restoreVisible.push(object);
      transparentZeroCulled += 1;
    }

    this.lastPrepare = {
      pass: "HC-031W2A3",
      transparentZeroCulled,
      transparentCandidates: this.candidateObjects.length,
      residencyMode: residency.mode,
      residencyRootsCulled: residency.rootNames.length,
      residencyRootNames: residency.rootNames,
      censusRefreshed,
      ownerCensus: this.lastCensus
    };
    return this.lastPrepare;
  }

  restoreAfterRender() {
    for (const object of this.restoreVisible) {
      if (object) object.visible = true;
    }
    this.restoreVisible.length = 0;

    for (const entry of this.restoreResidencyRoots) {
      if (entry?.object) entry.object.visible = entry.visible;
    }
    this.restoreResidencyRoots.length = 0;
  }

  applyResidencyCull(frameState) {
    const policy = this.resolveResidencyPolicy(frameState);
    const rootNames = [];
    for (const name of policy.rootNames) {
      const root = this.getResidencyRoot(name);
      if (!root || root.visible === false) continue;
      this.restoreResidencyRoots.push({ object: root, visible: root.visible });
      root.visible = false;
      rootNames.push(name);
    }
    return { mode: policy.mode, rootNames };
  }

  resolveResidencyPolicy(frameState) {
    const activeCellId = frameState?.activeCellId ?? "none";
    if (activeCellId === "CELL_SCAR_FLOW_FOLD_001") {
      const arrival = frameState?.scarFlowArrival ?? {};
      const settled = Boolean((arrival.nurseryFade ?? 0) >= 0.95 || (arrival.arrivalAge ?? 0) >= 2.4);
      return {
        mode: settled ? "scar_flow_after_surface_transition_envelope" : "scar_flow_transition_envelope",
        rootNames: settled ? SURFACE_WAKE_LOCAL_DETAIL_ROOTS : []
      };
    }

    if (activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001") {
      return {
        mode: "signal_chorus_hub_local_detail_only",
        rootNames: [...SURFACE_WAKE_LOCAL_DETAIL_ROOTS, ...SCAR_FLOW_LOCAL_DETAIL_ROOTS]
      };
    }

    return { mode: "none", rootNames: [] };
  }

  getResidencyRoot(name) {
    const cached = this.residencyRootCache.get(name);
    if (cached?.parent) return cached;
    const object = this.scene.getObjectByName(name);
    if (object) this.residencyRootCache.set(name, object);
    return object ?? null;
  }

  isSafelyInvisible(materials) {
    return materials.every((material) => (
      material?.visible !== false
      && material?.transparent === true
      && (material.opacity ?? 1) <= this.zeroAlphaThreshold
      && material?.depthWrite === false
    ));
  }

  refreshCandidatesAndCensus(runtimeSeconds) {
    this.lastScanRuntimeSeconds = runtimeSeconds;
    const candidates = [];
    const owners = new Map();
    let visibleRenderables = 0;
    let estimatedDrawCalls = 0;
    let estimatedTriangles = 0;
    let estimatedLineSegments = 0;
    let wireframeRenderables = 0;
    let transparentZeroRenderables = 0;

    this.scene.traverse((object) => {
      if (!isRenderable(object)) return;
      const materials = materialsOf(object);
      if (materials.some((material) => material?.transparent === true && material?.depthWrite === false)) {
        candidates.push(object);
      }
      if (!isEffectivelyVisible(object) || !materials.length || materials.every((material) => material?.visible === false)) return;

      const calls = drawCallEstimate(object);
      const triangles = estimateTriangles(object);
      const lines = estimateLineSegments(object);
      const wireframe = object.isMesh && materials.some((material) => material?.wireframe === true);
      const zeroAlpha = this.isSafelyInvisible(materials);
      const ownerName = topSceneOwner(object, this.scene);
      const owner = owners.get(ownerName) ?? {
        owner: ownerName,
        renderables: 0,
        estimatedDrawCalls: 0,
        estimatedTriangles: 0,
        estimatedLineSegments: 0,
        wireframeRenderables: 0,
        transparentZeroRenderables: 0
      };
      owner.renderables += 1;
      owner.estimatedDrawCalls += calls;
      owner.estimatedTriangles += triangles;
      owner.estimatedLineSegments += lines;
      owner.wireframeRenderables += Number(wireframe);
      owner.transparentZeroRenderables += Number(zeroAlpha);
      owners.set(ownerName, owner);

      visibleRenderables += 1;
      estimatedDrawCalls += calls;
      estimatedTriangles += triangles;
      estimatedLineSegments += lines;
      wireframeRenderables += Number(wireframe);
      transparentZeroRenderables += Number(zeroAlpha);
    });

    const topOwners = [...owners.values()]
      .sort((a, b) => (
        b.estimatedDrawCalls - a.estimatedDrawCalls
        || b.estimatedLineSegments - a.estimatedLineSegments
        || b.estimatedTriangles - a.estimatedTriangles
      ))
      .slice(0, 12);

    this.candidateObjects = candidates;
    this.lastCensus = {
      pass: "HC-031W2A3",
      sampledAtRuntimeSeconds: round(runtimeSeconds),
      visibleRenderables,
      estimatedDrawCalls,
      estimatedTriangles,
      estimatedLineSegments,
      wireframeRenderables,
      transparentZeroRenderables,
      topOwners
    };
  }

  snapshot() {
    return {
      pass: "HC-031W2A3",
      transparentZeroCulled: this.lastPrepare.transparentZeroCulled ?? 0,
      transparentCandidates: this.candidateObjects.length,
      residencyMode: this.lastPrepare.residencyMode ?? "none",
      residencyRootsCulled: this.lastPrepare.residencyRootsCulled ?? 0,
      residencyRootNames: [...(this.lastPrepare.residencyRootNames ?? [])],
      ownerCensus: this.lastCensus
    };
  }
}
