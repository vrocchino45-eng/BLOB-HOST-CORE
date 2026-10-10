import * as THREE from "three";

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

const STAGE_STRESS = Object.freeze({
  coherent: 0.0,
  strained: 0.30,
  unstable: 0.68,
  failing: 1.0
});

/**
 * HC-030B1
 * Presentation-only compression layer for interaction support graphics.
 *
 * The existing targeting / verb / reactive-state owners remain authoritative.
 * This system runs after CoreVerbPhysicalization for the frame, quiets support
 * graphics, and replaces the hard relationship axis with a softly graduated
 * segmented trace. It never selects a target or changes gameplay state.
 */
export class VisualHierarchyCompressionSystem {
  constructor({ scene, targetingSystem, coreVerbPhysicalizationSystem, frameState }) {
    this.scene = scene;
    this.targetingSystem = targetingSystem;
    this.coreVerbPhysicalizationSystem = coreVerbPhysicalizationSystem;
    this.frameState = frameState;

    this.gradientRoot = new THREE.Group();
    this.gradientRoot.name = "relationship_gradient_trace_hc030b1";
    this.gradientRoot.visible = false;
    this.gradientRoot.userData.targetingSuppressed = true;
    this.scene.add(this.gradientRoot);

    this.gradientSegments = [];
    this.segmentOpacities = [0.26, 0.62, 1.0, 0.62, 0.26];
    for (let index = 0; index < this.segmentOpacities.length; index += 1) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const segment = new THREE.Line(geometry, material);
      segment.name = `relationship_gradient_segment_${index + 1}`;
      segment.userData.targetingSuppressed = true;
      this.gradientRoot.add(segment);
      this.gradientSegments.push(segment);
    }

    this.tempStart = new THREE.Vector3();
    this.tempEnd = new THREE.Vector3();
    this.tempA = new THREE.Vector3();
    this.tempB = new THREE.Vector3();
  }

  update(_dt, frameState = this.frameState) {
    this.frameState = frameState;
    const targeting = frameState.targeting ?? {};
    const relationshipActive = Boolean(targeting.relationshipActive && this.targetingSystem?.relationshipTarget);
    const stage = frameState.reactiveStateGrammar?.focus?.stage ?? "coherent";
    const stress01 = STAGE_STRESS[stage] ?? 0;
    const age = Math.max(0, targeting.relationshipAge ?? 0);

    // New acquisition / deliberate handoff gets one readable beat, then support
    // graphics recede so target deformation and material behavior own the frame.
    const acquisition01 = 1 - clamp01(age / 0.42);
    const supportLift = 0.72 + acquisition01 * 0.28 + stress01 * 0.10;

    this.updateRelationshipTrace(relationshipActive, targeting, acquisition01, stress01);
    this.compressTargetingGlyphs(relationshipActive, supportLift);
    this.compressVerbPhysicalization(supportLift, stress01);

    frameState.visualHierarchyCompression = {
      pass: "HC-030B1",
      spatialRevealPass: "HC-031W2B2",
      owner: "VisualHierarchyCompressionSystem",
      active: relationshipActive || Boolean(frameState.verbPhysicalization),
      relationshipGradientActive: this.gradientRoot.visible,
      relationshipAge: age,
      acquisitionEmphasis01: acquisition01,
      reactiveStage: stage,
      reactiveStress01: stress01,
      hierarchy: {
        primary: "target_material_state_and_response",
        secondary: "pulse_return_and_local_relationship_change",
        tertiary: "outgoing_spheres_rings_lines_and_distant_wireframes"
      },
      policy: {
        supportGraphicsQuietByDefault: true,
        acquisitionMayBrieflyLiftSupport: true,
        unstableStateMayBrieflyLiftSupport: true,
        targetResponseRemainsUntouched: true,
        changesTargeting: false,
        changesVerbPower: false,
        changesReactiveState: false,
        changesProgression: false
      }
    };
  }

  updateRelationshipTrace(active, targeting, acquisition01, stress01) {
    const source = this.targetingSystem?.pointerLine;
    if (source) {
      // HC030B1 owns presentation after TargetingSystem has authored the frame.
      // The original hard axis is hidden, not deleted or repurposed.
      source.visible = false;
      source.material.opacity = 0;
    }

    if (!active || !this.targetingSystem?.playerRoot || !this.targetingSystem?.relationshipTarget?.root) {
      this.gradientRoot.visible = false;
      for (const segment of this.gradientSegments) segment.material.opacity = 0;
      return;
    }

    this.gradientRoot.visible = true;
    this.targetingSystem.getWorldPosition?.(this.targetingSystem.playerRoot, this.tempStart);
    this.targetingSystem.getWorldPosition?.(this.targetingSystem.relationshipTarget.root, this.tempEnd);

    const color = this.targetingSystem.getTargetColor?.(targeting.targetKind, targeting.reticleState) ?? 0xffffff;
    const lock = clamp01(targeting.lockStrength ?? 0);
    const baseOpacity = 0.026 + lock * 0.030 + acquisition01 * 0.022 + stress01 * 0.008;

    for (let index = 0; index < this.gradientSegments.length; index += 1) {
      const segment = this.gradientSegments[index];
      const t0 = index / this.gradientSegments.length;
      const t1 = (index + 1) / this.gradientSegments.length;
      this.tempA.lerpVectors(this.tempStart, this.tempEnd, t0);
      this.tempB.lerpVectors(this.tempStart, this.tempEnd, t1);
      const positions = segment.geometry.attributes.position.array;
      positions[0] = this.tempA.x;
      positions[1] = this.tempA.y;
      positions[2] = this.tempA.z;
      positions[3] = this.tempB.x;
      positions[4] = this.tempB.y;
      positions[5] = this.tempB.z;
      segment.geometry.attributes.position.needsUpdate = true;
      segment.material.color.set(color);
      segment.material.opacity = baseOpacity * this.segmentOpacities[index];
    }
  }

  compressTargetingGlyphs(active, supportLift) {
    if (!active) return;
    const targeting = this.targetingSystem;
    const glyphMultiplier = 0.46 * supportLift;
    const boundaryMultiplier = 0.52 * supportLift;

    if (targeting?.pulseTriangle?.material) {
      targeting.pulseTriangle.material.opacity = Math.min(0.20, targeting.pulseTriangle.material.opacity * glyphMultiplier);
    }
    if (targeting?.absorbTriangle?.material) {
      targeting.absorbTriangle.material.opacity = Math.min(0.20, targeting.absorbTriangle.material.opacity * glyphMultiplier);
    }
    if (targeting?.coherenceBoundary?.material) {
      targeting.coherenceBoundary.material.opacity = Math.min(0.16, targeting.coherenceBoundary.material.opacity * boundaryMultiplier);
    }
  }

  compressVerbPhysicalization(supportLift, stress01) {
    const verbs = this.coreVerbPhysicalizationSystem;
    if (!verbs) return;

    // Pulse: keep the travelling/return information, but demote the large spherical
    // wireframes and surface contour cages beneath the material's own response.
    if (verbs.pulseChargeShell?.material) {
      verbs.pulseChargeShell.material.opacity = Math.min(0.16, verbs.pulseChargeShell.material.opacity * 0.48 * supportLift);
    }
    for (const front of verbs.pulseFronts ?? []) {
      if (front?.root?.material) front.root.material.opacity *= 0.42 * supportLift;
    }
    for (const contour of verbs.pulseContours ?? []) {
      const tier = contour.spatialTier ?? "local_mid";
      const tierMultiplier = tier === "local_near"
        ? 0.56
        : tier === "local_mid"
          ? 0.50
          : tier === "local_far"
            ? 0.44
            : tier === "deep_relation"
              ? 0.42
              : tier === "deep_layer" ? 0.38 : 0.34;
      const opacityCap = tier.startsWith("deep_") ? 0.105 + stress01 * 0.015 : 0.14 + stress01 * 0.02;
      for (const material of contour.materials ?? []) {
        material.opacity = Math.min(opacityCap, material.opacity * tierMultiplier * supportLift);
      }
    }
    for (const flash of verbs.contactFlashes ?? []) {
      if (flash?.root?.material) flash.root.material.opacity *= 0.54 * supportLift;
    }
    for (const mote of verbs.pulseReturnMotes ?? []) {
      if (mote?.root?.material) mote.root.material.opacity *= 0.94;
    }

    // Absorb: the moving fragments remain comparatively legible; the straight axis,
    // funnel rings and helical support lines recede.
    if (verbs.absorbLine?.material) verbs.absorbLine.material.opacity *= 0.30 * supportLift;
    for (const ring of verbs.absorbFunnel?.children ?? []) {
      if (ring?.material) ring.material.opacity *= 0.50 * supportLift;
    }
    for (const filament of verbs.absorbFilaments?.children ?? []) {
      if (filament?.material) filament.material.opacity *= 0.62 * supportLift;
    }
    for (const mote of verbs.absorbMotes ?? []) {
      if (mote?.root?.material) mote.root.material.opacity *= 0.86;
    }

    // Stabilize: the target settling should carry the message. The tether and three
    // gyroscopic rings remain readable but no longer dominate the object silhouette.
    if (verbs.stabilizeLine?.material) verbs.stabilizeLine.material.opacity *= 0.28 * supportLift;
    for (const ring of verbs.stabilizeField?.children ?? []) {
      if (ring?.material) ring.material.opacity *= 0.50 * supportLift;
    }
  }
}
