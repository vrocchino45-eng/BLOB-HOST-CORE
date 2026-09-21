import * as THREE from "three";

/**
 * HC031E2 — shared visual grammar for the Core's three locomotor tendrils.
 *
 * This module owns appearance only. Free-space drift anatomy and surface-contact
 * anatomy use the same shaft/root/sucker family; movement and contact authority
 * remain in their existing systems.
 */
export const CORE_TENDRIL_VISUAL = Object.freeze({
  family: "core_suction_tendril_v1",
  shaftColor: 0xa9d7c4,
  shaftEmissive: 0x173c31,
  shaftEmissiveIntensity: 0.24,
  shaftRoughness: 0.74,
  suckerColor: 0xc7ead8,
  suckerEmissive: 0x163c32,
  suckerEmissiveIntensity: 0.18,
  suckerRoughness: 0.98,
  rootRadius: 0.072,
  segmentTopRadius: 0.034,
  segmentBottomRadius: 0.058,
  segmentRadialSegments: 10,
  openSuckerRadius: 0.15,
  openSuckerThickness: 0.032,
  closedSuckerTopRadius: 0.044,
  closedSuckerBaseRadius: 0.072,
  closedSuckerLength: 0.105
});

export function createTendrilShaftMaterial({ opacity = 0 } = {}) {
  return new THREE.MeshStandardMaterial({
    color: CORE_TENDRIL_VISUAL.shaftColor,
    emissive: CORE_TENDRIL_VISUAL.shaftEmissive,
    emissiveIntensity: CORE_TENDRIL_VISUAL.shaftEmissiveIntensity,
    roughness: CORE_TENDRIL_VISUAL.shaftRoughness,
    metalness: 0.0,
    transparent: true,
    opacity,
    depthWrite: false
  });
}

export function createTendrilSuckerMaterial({ opacity = 0 } = {}) {
  return new THREE.MeshStandardMaterial({
    color: CORE_TENDRIL_VISUAL.suckerColor,
    emissive: CORE_TENDRIL_VISUAL.suckerEmissive,
    emissiveIntensity: CORE_TENDRIL_VISUAL.suckerEmissiveIntensity,
    roughness: CORE_TENDRIL_VISUAL.suckerRoughness,
    metalness: 0,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

export function createTendrilSegmentGeometry() {
  return new THREE.CylinderGeometry(
    CORE_TENDRIL_VISUAL.segmentTopRadius,
    CORE_TENDRIL_VISUAL.segmentBottomRadius,
    1,
    CORE_TENDRIL_VISUAL.segmentRadialSegments,
    1,
    false
  );
}

export function createTendrilRootGeometry() {
  return new THREE.SphereGeometry(CORE_TENDRIL_VISUAL.rootRadius, 10, 8);
}

export function createClosedSuckerGeometry() {
  return new THREE.CylinderGeometry(
    CORE_TENDRIL_VISUAL.closedSuckerTopRadius,
    CORE_TENDRIL_VISUAL.closedSuckerBaseRadius,
    CORE_TENDRIL_VISUAL.closedSuckerLength,
    16,
    1,
    false
  );
}
