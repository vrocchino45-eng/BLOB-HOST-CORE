import * as THREE from "three";

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
const clamp01 = (value) => clamp(value, 0, 1);

/**
 * HC028G — truthful vertical-force readability.
 *
 * This system visualizes the environmental force that PlayerMovementController
 * actually applied on the resolved frame. It does not invent thermal columns,
 * sample fake physics, move the player, alter pressure, or change traversal.
 * As authored regional flow changes with position, these local streamlines change
 * with it so resistance/release is discoverable through matter rather than HUD.
 */
export class LiftFieldReadabilitySystem {
  constructor({ scene, playerRoot, frameState }) {
    if (!scene) throw new Error("[LiftFieldReadabilitySystem] scene is required.");
    if (!playerRoot) throw new Error("[LiftFieldReadabilitySystem] playerRoot is required.");
    if (!frameState) throw new Error("[LiftFieldReadabilitySystem] frameState is required.");

    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.group = new THREE.Group();
    this.group.name = "lift_field_readability_hc028g";
    this.group.userData.targetingSuppressed = true;
    this.scene.add(this.group);

    this.sampleCount = 7;
    this.streamOffsets = [
      [-0.95, -0.72],
      [0.0, -1.08],
      [0.96, -0.58],
      [-1.18, 0.30],
      [0.0, 0.52],
      [1.15, 0.42],
      [0.28, 1.12]
    ];

    this.lineMaterial = new THREE.LineBasicMaterial({
      color: 0xb9d8ff,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    this.streams = this.streamOffsets.map((_, index) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(this.sampleCount * 3), 3));
      const line = new THREE.Line(geometry, this.lineMaterial);
      line.name = `lift_field_stream_${index + 1}`;
      line.userData.targetingSuppressed = true;
      this.group.add(line);
      return line;
    });

    this.beadPositions = new Float32Array(this.streamOffsets.length * 3);
    const beadGeometry = new THREE.BufferGeometry();
    beadGeometry.setAttribute("position", new THREE.BufferAttribute(this.beadPositions, 3));
    this.beadMaterial = new THREE.PointsMaterial({
      color: 0xb9d8ff,
      size: 0.045,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      sizeAttenuation: true
    });
    this.beads = new THREE.Points(beadGeometry, this.beadMaterial);
    this.beads.name = "lift_field_direction_beads";
    this.beads.userData.targetingSuppressed = true;
    this.group.add(this.beads);

    this.horizontal = new THREE.Vector3();
    this.side = new THREE.Vector3();
    this.temp = new THREE.Vector3();
    this.colorUp = new THREE.Color(0x9fffe6);
    this.colorDown = new THREE.Color(0xffb68b);
    this.colorMixed = new THREE.Color(0xb9d8ff);
  }

  init() {
    this.publishInactive(this.frameState);
  }

  update(dt, frameState = this.frameState) {
    const safeDt = clamp(dt, 0, 0.05);
    const kinematics = frameState.playerKinematics ?? {};
    const environmental = kinematics.environmentalForceVector ?? {};
    const physical = frameState.physicalFeel ?? {};
    const authoredFlow = physical.flowVector ?? {};
    const inspection = frameState.tightInspectionCamera ?? frameState.inspectionCamera ?? {};
    const hubGuidedFlight = Boolean(frameState.hubRouteCommitFlight?.active);
    const coreWork = Boolean(inspection.coreWorkActive);

    if (!Number.isFinite(environmental.y) || hubGuidedFlight || coreWork) {
      this.fadeOut(safeDt);
      this.publishInactive(frameState);
      return;
    }

    const envX = environmental.x ?? 0;
    const envY = environmental.y ?? 0;
    const envZ = environmental.z ?? 0;
    const pressure = clamp01(physical.pressure ?? kinematics.pressure ?? 0);
    const verticalInput = clamp(kinematics.verticalInput ?? 0, -1, 1);
    const forwardAmount = -(frameState.input?.moveZ ?? 0);
    const cameraRiseIntent = Math.max(0, forwardAmount * (kinematics.cameraForwardVerticalContribution ?? 0));
    const riseIntent = clamp01(Math.max(0, verticalInput) + cameraRiseIntent);
    const velocityY = kinematics.velocity?.y ?? 0;
    const upwardSupport = Math.max(0, envY);
    const downwardForce = Math.max(0, -envY);
    const riseResistance = clamp01(
      downwardForce * 2.8
      + Math.max(0, pressure - 0.56) * 0.82
      + riseIntent * Math.max(0, 0.22 - velocityY) * 1.25
    );
    const liftSupport = clamp01(upwardSupport * 3.2 + Math.max(0, velocityY) * 0.10);
    const forceMagnitude = Math.hypot(envX, envY, envZ);
    const activeStrength = clamp01(
      forceMagnitude * 1.25
      + Math.abs(envY) * 2.4
      + Math.max(0, pressure - 0.50) * 0.34
      + riseIntent * 0.18
    );

    if (activeStrength < 0.055) {
      this.fadeOut(safeDt);
      this.publish(frameState, {
        active: false,
        envX, envY, envZ, pressure, riseIntent, riseResistance, liftSupport,
        classification: "quiet_field"
      });
      return;
    }

    const classification = liftSupport > 0.20 && liftSupport > riseResistance * 0.78
      ? "rising_flow_support"
      : riseResistance > 0.26
        ? "compressed_or_downwash_resistance"
        : "mixed_vertical_flow";

    this.horizontal.set(envX, 0, envZ);
    if (this.horizontal.lengthSq() < 0.0001) {
      this.horizontal.set(authoredFlow.x ?? 0.24, 0, authoredFlow.z ?? -0.18);
    }
    if (this.horizontal.lengthSq() < 0.0001) this.horizontal.set(0.35, 0, -0.65);
    this.horizontal.normalize();
    this.side.set(-this.horizontal.z, 0, this.horizontal.x).normalize();

    const directionSign = envY < -0.015 ? -1 : 1;
    const verticalSignal = clamp(envY * 3.8, -1, 1);
    const streamlineSpan = 0.44 + Math.abs(verticalSignal) * 0.68 + liftSupport * 0.18;
    const horizontalSpan = 0.34 + Math.min(0.62, Math.hypot(envX, envZ) * 0.55);
    const turbulence = clamp01(pressure * 0.54 + riseResistance * 0.58) * (1 - liftSupport * 0.30);
    const now = frameState.runtimeSeconds ?? 0;

    this.group.position.copy(this.playerRoot.position);
    for (let streamIndex = 0; streamIndex < this.streams.length; streamIndex += 1) {
      const line = this.streams[streamIndex];
      const [offsetX, offsetZ] = this.streamOffsets[streamIndex];
      const positions = line.geometry.attributes.position.array;
      for (let sample = 0; sample < this.sampleCount; sample += 1) {
        const u = sample / Math.max(1, this.sampleCount - 1);
        const centered = u - 0.5;
        const curl = Math.sin(now * 1.65 + streamIndex * 0.83 + u * Math.PI * 2.1) * turbulence;
        const squeeze = classification === "compressed_or_downwash_resistance" ? 0.56 : 1;
        const x = offsetX
          + this.horizontal.x * centered * horizontalSpan
          + this.side.x * curl * 0.19;
        const z = offsetZ
          + this.horizontal.z * centered * horizontalSpan
          + this.side.z * curl * 0.19;
        const y = centered * streamlineSpan * directionSign * squeeze
          + Math.sin(now * 1.15 + streamIndex * 0.62 + u * Math.PI) * 0.065 * turbulence
          + verticalSignal * centered * 0.30;
        const k = sample * 3;
        positions[k] = x;
        positions[k + 1] = y;
        positions[k + 2] = z;
      }
      line.geometry.attributes.position.needsUpdate = true;

      const travel = (now * (0.28 + activeStrength * 0.34) + streamIndex * 0.137) % 1;
      const beadU = directionSign > 0 ? travel : 1 - travel;
      const beadSample = beadU * (this.sampleCount - 1);
      const lo = Math.floor(beadSample);
      const hi = Math.min(this.sampleCount - 1, lo + 1);
      const frac = beadSample - lo;
      const pk = streamIndex * 3;
      this.beadPositions[pk] = THREE.MathUtils.lerp(positions[lo * 3], positions[hi * 3], frac);
      this.beadPositions[pk + 1] = THREE.MathUtils.lerp(positions[lo * 3 + 1], positions[hi * 3 + 1], frac);
      this.beadPositions[pk + 2] = THREE.MathUtils.lerp(positions[lo * 3 + 2], positions[hi * 3 + 2], frac);
    }
    this.beads.geometry.attributes.position.needsUpdate = true;

    const targetColor = classification === "rising_flow_support"
      ? this.colorUp
      : classification === "compressed_or_downwash_resistance"
        ? this.colorDown
        : this.colorMixed;
    this.lineMaterial.color.lerp(targetColor, 1 - Math.exp(-safeDt * 5.2));
    this.beadMaterial.color.copy(this.lineMaterial.color);
    const targetOpacity = clamp(0.06 + activeStrength * 0.22 + riseResistance * 0.10, 0.06, 0.34);
    this.lineMaterial.opacity += (targetOpacity - this.lineMaterial.opacity) * (1 - Math.exp(-safeDt * 5.6));
    this.beadMaterial.opacity += ((targetOpacity + 0.12) - this.beadMaterial.opacity) * (1 - Math.exp(-safeDt * 6.4));
    this.beadMaterial.size = 0.035 + activeStrength * 0.022 + liftSupport * 0.010;
    this.group.visible = this.lineMaterial.opacity > 0.008;

    this.publish(frameState, {
      active: true,
      envX, envY, envZ, pressure, riseIntent, riseResistance, liftSupport, classification
    });
  }

  fadeOut(dt) {
    this.lineMaterial.opacity += (0 - this.lineMaterial.opacity) * (1 - Math.exp(-dt * 7.5));
    this.beadMaterial.opacity += (0 - this.beadMaterial.opacity) * (1 - Math.exp(-dt * 7.5));
    if (this.lineMaterial.opacity < 0.008) this.group.visible = false;
  }

  publish(frameState, state) {
    frameState.liftFieldReadability = {
      pass: "HC-028G",
      active: Boolean(state.active),
      classification: state.classification,
      environmentalForceY: Number((state.envY ?? 0).toFixed(4)),
      environmentalForce: {
        x: Number((state.envX ?? 0).toFixed(4)),
        y: Number((state.envY ?? 0).toFixed(4)),
        z: Number((state.envZ ?? 0).toFixed(4))
      },
      pressure01: Number((state.pressure ?? 0).toFixed(3)),
      riseIntent01: Number((state.riseIntent ?? 0).toFixed(3)),
      riseResistance01: Number((state.riseResistance ?? 0).toFixed(3)),
      liftSupport01: Number((state.liftSupport ?? 0).toFixed(3)),
      source: "resolved_PlayerMovementController_environmentalForceVector",
      fixedThermalSpotMap: false,
      movementAuthority: false,
      collisionAuthority: false,
      routeAuthority: false,
      verbAuthority: false,
      rule: "show_actual_vertical_force_and_pressure_consequence_never_invent_fake_lift_physics"
    };
  }

  publishInactive(frameState) {
    this.publish(frameState, {
      active: false,
      classification: "inactive",
      envX: 0,
      envY: 0,
      envZ: 0,
      pressure: 0,
      riseIntent: 0,
      riseResistance: 0,
      liftSupport: 0
    });
  }
}
