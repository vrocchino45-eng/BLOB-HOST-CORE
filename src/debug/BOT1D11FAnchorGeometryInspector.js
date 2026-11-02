import * as THREE from "three";
import { readCrawlableSurfaceMetadata } from "../world/CrawlableSurfaceRegistry.js";

// D11F: read-only geometric diagnostics. Never steers the Core or modifies a gameplay owner.
// Authoritative nearest-point distances are measured against actual world-space mesh triangles,
// not against the shelf center or the movement boundary.
const CACHE_INTERVAL_MS = 500;
const MAX_TRIANGLES = 16000;
const vec = (v) => v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z)
  ? { x: +v.x.toFixed(4), y: +v.y.toFixed(4), z: +v.z.toFixed(4) } : null;
const finite3 = (v) => v && [v.x, v.y, v.z].every(Number.isFinite);
const metric = (v) => Number.isFinite(v) ? +v.toFixed(4) : null;

let lastScene = null;
let lastCell = null;
let lastRefresh = -Infinity;
let meshesById = new Map();
function effectivelyVisible(mesh) {
  for (let p = mesh; p; p = p.parent) if (p.visible === false) return false;
  return true;
}
function refresh(scene, cellId) {
  const now = performance.now();
  if (scene === lastScene && cellId === lastCell && now - lastRefresh < CACHE_INTERVAL_MS) return;
  lastScene = scene; lastCell = cellId; lastRefresh = now;
  meshesById = new Map();
  scene?.traverse((obj) => {
    if (!obj?.isMesh || !obj.geometry || !effectivelyVisible(obj)) return;
    const meta = readCrawlableSurfaceMetadata(obj);
    if (!meta?.surfaceId || (meta.cellId !== "shared" && meta.cellId !== cellId)) return;
    const entry = meshesById.get(meta.surfaceId) ?? [];
    entry.push(obj);
    meshesById.set(meta.surfaceId, entry);
  });
}

const tri = new THREE.Triangle();
const a = new THREE.Vector3();
const b = new THREE.Vector3();
const c = new THREE.Vector3();
const closest = new THREE.Vector3();
const bestPoint = new THREE.Vector3();
const testPoint = new THREE.Vector3();
function distanceToMesh(point, mesh) {
  const geometry = mesh.geometry;
  const positions = geometry?.getAttribute?.("position");
  if (!positions || positions.itemSize !== 3) return { status: "unsupported_geometry", distance: null, point: null };
  const index = geometry.getIndex?.();
  const count = index ? index.count : positions.count;
  if (count < 3 || count % 3 || count / 3 > MAX_TRIANGLES) {
    return { status: "triangle_limit_or_invalid", distance: null, point: null, triangles: count / 3 };
  }
  mesh.updateWorldMatrix(true, false);
  const matrix = mesh.matrixWorld;
  let minSq = Infinity;
  for (let i = 0; i < count; i += 3) {
    const ai = index ? index.getX(i) : i;
    const bi = index ? index.getX(i + 1) : i + 1;
    const ci = index ? index.getX(i + 2) : i + 2;
    a.fromBufferAttribute(positions, ai).applyMatrix4(matrix);
    b.fromBufferAttribute(positions, bi).applyMatrix4(matrix);
    c.fromBufferAttribute(positions, ci).applyMatrix4(matrix);
    tri.set(a, b, c).closestPointToPoint(point, closest);
    const sq = closest.distanceToSquared(point);
    if (sq < minSq) { minSq = sq; bestPoint.copy(closest); }
  }
  return { status: "measured", distance: metric(Math.sqrt(minSq)), point: vec(bestPoint), triangles: count / 3 };
}
function distanceToSurface(point, id) {
  if (!id || id === "none") return { status: "no_surface_id", distance: null, point: null };
  const matches = meshesById.get(id) ?? [];
  if (!matches.length) return { status: "surface_mesh_missing", distance: null, point: null };
  let best = null;
  for (const mesh of matches) {
    if (!effectivelyVisible(mesh)) continue;
    const result = distanceToMesh(point, mesh);
    if (result.status !== "measured") {
      if (!best) best = result;
      continue;
    }
    if (!best || best.status !== "measured" || result.distance < best.distance) {
      best = { ...result, meshName: mesh.name, meshUuid: mesh.uuid };
    }
  }
  return best ?? { status: "surface_mesh_missing", distance: null, point: null };
}

export function inspectBOT1D11FAnchorContinuity(runtime) {
  const frame = runtime.frameState ?? {};
  const cell = frame.activeCellId ?? "none";
  refresh(runtime.scene, cell);
  const worldPlayer = new THREE.Vector3();
  runtime.playerCore?.getWorldPosition(worldPlayer);
  const contact = frame.coreTendrilContact ?? {};
  const locomotion = contact.surfaceLocomotion ?? {};
  const attachment = frame.playerAttachment ?? {};
  const truth = frame.coreSurfaceTruth ?? {};
  const carriedId = attachment.ownerSurfaceId ?? attachment.surfaceTruthSurfaceId ?? "none";
  const anchors = (locomotion.anchors ?? []).map((anchor) => {
    const id = anchor.surface?.surfaceId ?? "none";
    const position = anchor.anchorWorld ?? {};
    const planted = anchor.phase === "sealed" && anchor.sealed === true && anchor.surface?.valid === true;
    if (!planted || !finite3(position)) {
      return { index: anchor.index, phase: anchor.phase ?? "none", planted: false, surfaceId: id,
        anchorWorld: finite3(position) ? vec(position) : null, geometry: { status: "not_planted", distance: null } };
    }
    testPoint.set(position.x, position.y, position.z);
    return { index: anchor.index, phase: anchor.phase, planted: true, surfaceId: id,
      anchorWorld: vec(testPoint), playerToAnchor: metric(worldPlayer.distanceTo(testPoint)),
      geometry: distanceToSurface(testPoint, id) };
  });
  const activeAnchors = anchors.filter(x => x.planted);
  const measured = activeAnchors.filter(x => x.geometry.status === "measured");
  return {
    revision: "BOT1-D11F-1", cell, attached: Boolean(attachment.active), carriedId,
    liveTruthEligible: Boolean(truth.valid && truth.mechanicalEligible !== false),
    liveTruthSurfaceId: truth.surfaceId ?? "none", playerWorld: vec(worldPlayer),
    playerToCarriedMesh: distanceToSurface(worldPlayer, carriedId),
    availableSurfaceIds: [...meshesById.keys()].sort(),
    anchors,
    plantedCount: activeAnchors.length, measuredCount: measured.length,
    maxPlantedAnchorToMesh: measured.length ? metric(Math.max(...measured.map(x => x.geometry.distance))) : null,
    // A value above 0.35 is a diagnostic warning, NOT a physics verdict.
    anchorsBeyond035: measured.filter(x => x.geometry.distance > 0.35).length,
    unmeasurablePlanted: activeAnchors.length - measured.length,
    readOnly: true
  };
}
