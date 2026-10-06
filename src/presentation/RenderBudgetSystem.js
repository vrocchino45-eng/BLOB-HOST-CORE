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

/**
 * HC-031W2A2 — render-only budget helper.
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
    this.lastScanRuntimeSeconds = -Infinity;
    this.lastCensus = null;
    this.lastPrepare = {
      pass: "HC-031W2A2",
      transparentZeroCulled: 0,
      transparentCandidates: 0,
      censusRefreshed: false
    };
  }

  prepare({ runtimeSeconds = 0 } = {}) {
    const censusRefreshed = !Number.isFinite(this.lastScanRuntimeSeconds)
      || runtimeSeconds - this.lastScanRuntimeSeconds >= this.censusIntervalSeconds;
    if (censusRefreshed) {
      this.refreshCandidatesAndCensus(runtimeSeconds);
    }

    this.restoreVisible.length = 0;
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
      pass: "HC-031W2A2",
      transparentZeroCulled,
      transparentCandidates: this.candidateObjects.length,
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
      pass: "HC-031W2A2",
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
      pass: "HC-031W2A2",
      transparentZeroCulled: this.lastPrepare.transparentZeroCulled ?? 0,
      transparentCandidates: this.candidateObjects.length,
      ownerCensus: this.lastCensus
    };
  }
}
