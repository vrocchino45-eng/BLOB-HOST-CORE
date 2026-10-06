import * as THREE from "three";
import {
  CORE_TENDRIL_VISUAL,
  createClosedSuckerGeometry,
  createTendrilRootGeometry,
  createTendrilSegmentGeometry,
  createTendrilShaftMaterial,
  createTendrilSuckerMaterial
} from "../CoreTendrilVisualLanguage.js";

export class ChemObjectVisualComposer {
  constructor() {
    this.silhouetteMap = {
          "small_protected_core": "composePlayerSeedCore",
          "nested_protected_seed_core": "composePlayerSeedCore",
          "protected_seed_pod": "composeDormantSeedNutrient",
          "nested_protected_seed_pod": "composeDormantSeedNutrient",
          "irregular_hardened_plate": "composeScarContaminationPlate",
          "transparent_ribbon_stream": "composeFluxCurrentRibbon",
          "thin_luminous_thread": "composeSignalVaporThread",
          "floating_memory_fleck": "composeScarMemoryFleck",
          "dark_flow_clot": "composeScarFlowClot",
          "resonant_thread_path": "composeResonantPathThread",
          "pressure_current_fold": "composePressureFoldCurrent",
          "choir_resonance_node": "composeChoirResonanceNode",
          "listening_pore_membrane": "composeListeningPoreMembrane",
          "harmonic_wave_thread": "composeHarmonicWaveThread",
          "seed_signal_bridge": "composeSeedSignalBridge",
          "bloom_spore_lantern": "composeBloomSporeLantern",
          "residue_memory_silt": "composeResidueMemorySilt",
          "seed_choice_braid": "composeSeedChoiceBraid",
          "overgrowth_warning_tendril": "composeOvergrowthWarningTendril",
          "collapsed_seed_core_shell_with_missing_inner_ring": "composeOldCoreHuskMemory",
          "soft_irregular_silt_cloud_with_threaded_voids": "composeResidueSiltCloud",
          "interlocking_dark_plate_with_rounded_guard_edges": "composeScarLockPlate",
          "small_seed_pod_nested_inside_residue_ring": "composeInheritanceSeedRemnant",
          "thin_suture_thread_with_memory_knots": "composeScarMemorySeamThread",
          "settled_lattice_of_silt_and_scar_stitches": "composeResidueStitchLattice",
          "transparent_collapsed_core_imprint": "composeEchoHuskImprint",
          "small_dim_seed_inside_closed_scar_ring": "composeClosedInheritanceSuture"
    };
  }

  composePlayerSeedCore(root) {
    const bodyFrame = new THREE.Group();
    bodyFrame.name = "player_seed_body_frame";
    bodyFrame.userData.bodyLanguageOwner = "CoreEmbodimentSystem";
    bodyFrame.userData.forwardAxis = "negative_z";
    root.add(bodyFrame);

    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0xa9efff,
      emissive: 0x18485b,
      emissiveIntensity: 0.08,
      roughness: 0.42,
      metalness: 0.0,
      transparent: true,
      opacity: 0.7,
      depthWrite: true
    });

    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe0a8,
      emissive: 0xff9e3a,
      emissiveIntensity: 1.05,
      roughness: 0.2
    });

    const shell = new THREE.Mesh(this.createOrganicGeometry(1, 3, 0.4), shellMaterial);
    shell.name = "soft_membrane_shell";
    shell.scale.set(0.92, 0.82, 1.12);
    bodyFrame.add(shell);

    const mantleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x4f9fb8,
      emissive: 0x0f3b4b,
      emissiveIntensity: 0.12,
      roughness: 0.34,
      transmission: 0.18,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const innerMantle = new THREE.Mesh(this.createOrganicGeometry(0.76, 2, 1.7), mantleMaterial);
    innerMantle.name = "seed_core_inner_mantle";
    innerMantle.position.set(0.04, -0.015, 0.02);
    innerMantle.scale.set(0.9, 0.82, 1.08);
    bodyFrame.add(innerMantle);

    const prowMaterial = new THREE.MeshStandardMaterial({
      color: 0xc3f6ff,
      emissive: 0x24596c,
      emissiveIntensity: 0.1,
      roughness: 0.38,
      transparent: true,
      opacity: 0.58,
      depthWrite: true
    });
    const prow = new THREE.Mesh(this.createOrganicGeometry(0.48, 2, 2.8), prowMaterial);
    prow.name = "player_seed_directional_prow";
    prow.position.set(0.05, 0.03, -0.74);
    prow.scale.set(0.72, 0.64, 1.18);
    bodyFrame.add(prow);

    const rearLobe = new THREE.Mesh(this.createOrganicGeometry(0.5, 2, 4.2), prowMaterial.clone());
    rearLobe.name = "player_seed_rear_lobe";
    rearLobe.position.set(-0.06, -0.02, 0.62);
    rearLobe.scale.set(0.82, 0.72, 0.92);
    rearLobe.material.opacity = 0.4;
    bodyFrame.add(rearLobe);

    const inner = new THREE.Mesh(this.createOrganicGeometry(0.34, 2, 0.9), innerMaterial);
    inner.name = "inner_seed_light";
    inner.scale.set(0.84, 1.2, 0.84);
    bodyFrame.add(inner);

    const finMaterial = new THREE.MeshStandardMaterial({
      color: 0xaeefff,
      emissive: 0x174d62,
      emissiveIntensity: 0.08,
      roughness: 0.5,
      transparent: true,
      opacity: 0.44,
      side: THREE.DoubleSide,
      depthWrite: true
    });
    const finLayout = [
      [-0.7, 0.1, 0.18, -0.22, 0.1, -0.52, 0.22, 0.72, 0.32],
      [0.69, -0.08, 0.26, 0.18, -0.08, 0.48, 0.2, 0.64, 0.28],
      [0.05, 0.61, 0.3, 0.46, 0.08, -0.08, 0.21, 0.56, 0.31],
      [-0.12, -0.57, 0.38, -0.42, -0.06, 0.14, 0.18, 0.5, 0.27]
    ];
    finLayout.forEach((values, index) => {
      const [x, y, z, rx, ry, rz, sx, sy, sz] = values;
      const fin = new THREE.Mesh(this.createOrganicGeometry(0.48, 1, 1.2 + index), finMaterial.clone());
      fin.name = `player_seed_propulsion_fin_${index + 1}`;
      fin.position.set(x, y, z);
      fin.rotation.set(rx, ry, rz);
      fin.scale.set(sx, sy, sz);
      fin.userData.baseRotationX = rx;
      fin.userData.baseRotationZ = rz;
      fin.userData.hubBodyFirstIdentity = true;
      bodyFrame.add(fin);
    });

    // HC031E2: retire the legacy blue cone "veils". Free-space travel now uses
    // the same root -> tapered tendon -> sucker anatomy as surface contact. The
    // sucker is folded while drifting and opens only when the contact system owns it.
    const veilLayout = [
      [-0.28, 0.12, 0.58, -0.12],
      [0.00, -0.15, 0.62, 0.02],
      [0.28, 0.10, 0.58, 0.14]
    ];
    veilLayout.forEach(([x, y, z, yaw], index) => {
      const tendril = new THREE.Group();
      tendril.name = `player_seed_travel_tendril_${index + 1}`;
      tendril.position.set(x, y, z);
      tendril.rotation.y = yaw;
      tendril.userData.tendrilVisualFamily = CORE_TENDRIL_VISUAL.family;
      tendril.userData.tendrilState = "drift";
      tendril.userData.baseYaw = yaw;
      tendril.userData.legacyTrailingVeilRetired = true;

      const shaftMaterial = createTendrilShaftMaterial({ opacity: 0 });
      const segmentGeometry = createTendrilSegmentGeometry();
      for (let segmentIndex = 0; segmentIndex < 3; segmentIndex += 1) {
        const segment = new THREE.Mesh(segmentGeometry, shaftMaterial.clone());
        segment.name = `travel_tendril_${index + 1}_segment_${segmentIndex + 1}`;
        segment.visible = false;
        segment.renderOrder = 3;
        tendril.add(segment);
      }

      const rootBulb = new THREE.Mesh(createTendrilRootGeometry(), shaftMaterial.clone());
      rootBulb.name = `travel_tendril_${index + 1}_core_root`;
      rootBulb.visible = false;
      rootBulb.renderOrder = 3;
      tendril.add(rootBulb);

      const closedSucker = new THREE.Mesh(
        createClosedSuckerGeometry(),
        createTendrilSuckerMaterial({ opacity: 0 })
      );
      closedSucker.name = `travel_tendril_${index + 1}_closed_sucker`;
      closedSucker.visible = false;
      closedSucker.renderOrder = 4;
      tendril.add(closedSucker);

      bodyFrame.add(tendril);
    });

    // HC-009D authored growth anatomy. These pieces begin folded into the Seed
    // Core and are revealed by CoreEmbodimentSystem from CoreGrowthSystem truth.
    // They are attached body structures, never orbit rings or UI-like markers.
    const growthPetalMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8e9e2,
      emissive: 0x4f8f91,
      emissiveIntensity: 0.08,
      roughness: 0.46,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: true
    });
    const growthPetalLayout = [
      [-0.62, 0.24, -0.16, -0.22, 0.18, -0.72, 0.36, 0.16, 0.92],
      [0.64, -0.18, -0.05, 0.18, -0.14, 0.66, 0.34, 0.15, 0.88],
      [0.12, 0.62, 0.06, 0.58, 0.08, -0.06, 0.3, 0.15, 0.82],
      [-0.18, -0.58, 0.16, -0.54, -0.08, 0.12, 0.28, 0.14, 0.78],
      [-0.44, 0.12, 0.52, 0.12, 0.52, -0.34, 0.3, 0.14, 0.74],
      [0.42, 0.16, 0.58, -0.08, -0.48, 0.3, 0.31, 0.14, 0.76]
    ];
    growthPetalLayout.forEach((values, index) => {
      const [x, y, z, rx, ry, rz, sx, sy, sz] = values;
      const petal = new THREE.Mesh(
        this.createOrganicGeometry(0.5, 1, 6.2 + index * 0.7),
        growthPetalMaterial.clone()
      );
      petal.name = `player_growth_binding_petal_${index + 1}`;
      petal.position.set(x, y, z);
      petal.rotation.set(rx, ry, rz);
      petal.scale.set(sx, sy, sz);
      petal.userData.growthBaseScale = petal.scale.clone();
      petal.userData.growthBasePosition = petal.position.clone();
      petal.userData.growthBaseRotation = {
        x: rx,
        y: ry,
        z: rz
      };
      petal.userData.attachedGrowthAnatomy = true;
      petal.userData.objectDefiningRing = false;
      petal.scale.multiplyScalar(0.001);
      petal.visible = false;
      bodyFrame.add(petal);
    });

    const growthPlateMaterial = new THREE.MeshStandardMaterial({
      color: 0xe89268,
      emissive: 0x9d3e39,
      emissiveIntensity: 0.1,
      roughness: 0.74,
      transparent: true,
      opacity: 0,
      depthWrite: true
    });
    const growthPlateLayout = [
      [-0.46, 0.34, -0.52, -0.18, 0.32, -0.26, 0.78, 0.42, 1.18],
      [0.48, -0.28, -0.42, 0.22, -0.28, 0.34, 0.72, 0.4, 1.08],
      [0.34, 0.44, 0.34, -0.38, 0.52, 0.18, 0.66, 0.36, 0.94],
      [-0.38, -0.42, 0.3, 0.34, -0.44, -0.16, 0.62, 0.34, 0.9],
      [0.02, 0.1, 0.68, 0.12, 0.18, 0.48, 0.58, 0.32, 0.86]
    ];
    growthPlateLayout.forEach((values, index) => {
      const [x, y, z, rx, ry, rz, sx, sy, sz] = values;
      const plate = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.24, 0),
        growthPlateMaterial.clone()
      );
      plate.name = `player_growth_scar_plate_${index + 1}`;
      plate.position.set(x, y, z);
      plate.rotation.set(rx, ry, rz);
      plate.scale.set(sx, sy, sz);
      plate.userData.growthBaseScale = plate.scale.clone();
      plate.userData.growthBasePosition = plate.position.clone();
      plate.userData.attachedGrowthAnatomy = true;
      plate.userData.objectDefiningRing = false;
      plate.scale.multiplyScalar(0.001);
      plate.visible = false;
      bodyFrame.add(plate);
    });

    const connectionNodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe2a4,
      emissive: 0xb87842,
      emissiveIntensity: 0.18,
      roughness: 0.3,
      transparent: true,
      opacity: 0
    });
    const connectionNodeLayout = [
      [-0.48, 0.42, -0.18],
      [0.52, 0.28, 0.02],
      [-0.28, -0.5, 0.18],
      [0.34, -0.36, 0.46]
    ];
    connectionNodeLayout.forEach(([x, y, z], index) => {
      const node = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.075 + index * 0.006, 0),
        connectionNodeMaterial.clone()
      );
      node.name = `player_growth_connection_node_${index + 1}`;
      node.position.set(x, y, z);
      node.userData.growthBaseScale = new THREE.Vector3(1, 1, 1);
      node.userData.attachedGrowthAnatomy = true;
      node.userData.objectDefiningRing = false;
      node.scale.setScalar(0.001);
      node.visible = false;
      bodyFrame.add(node);
    });

    const embryoMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff0c6,
      emissive: 0xffb45a,
      emissiveIntensity: 0.42,
      roughness: 0.18,
      transparent: true,
      opacity: 0.82
    });

    const embryo = new THREE.Mesh(this.createOrganicGeometry(0.2, 2, 5.1), embryoMaterial);
    embryo.name = "nested_future_host_embryo";
    embryo.scale.set(0.72, 1.12, 0.72);
    bodyFrame.add(embryo);

    const moteMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe8b2,
      transparent: true,
      opacity: 0.58,
      depthWrite: false
    });

    for (let i = 0; i < 7; i += 1) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 2) * 0.012, 8, 6), moteMaterial.clone());
      mote.name = "inner_seed_orbit_mote";
      const angle = (i / 7) * Math.PI * 2;
      mote.position.set(Math.cos(angle) * 0.48, Math.sin(angle * 1.7) * 0.12, Math.sin(angle) * 0.36);
      bodyFrame.add(mote);
    }

    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xa9efff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      wireframe: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const pulseWave = new THREE.Mesh(new THREE.SphereGeometry(1.08, 12, 8), pulseMaterial);
    pulseWave.name = "core_pulse_wave";
    pulseWave.visible = false;
    root.add(pulseWave);

    const glow = new THREE.PointLight(0xffc16a, 1.25, 6.8);
    glow.name = "inner_seed_glow_light";
    root.add(glow);

    root.userData.playerIdentityContract = "authored_seed_body_no_idle_orbit_or_glint";
    root.userData.authoredProxyPass = "HC-009D";
    root.userData.bodyPartCount = 2
      + finLayout.length
      + veilLayout.length
      + growthPetalLayout.length
      + growthPlateLayout.length
      + connectionNodeLayout.length;
    root.userData.growthAnatomyFoldedAtSpawn = true;
    root.userData.growthAnatomyAuthority = "CoreGrowthSystem -> CoreEmbodimentSystem";
    root.userData.ringPolicy = "transient_pulse_wave_only";
  }

  createOrganicGeometry(radius = 1, detail = 2, phase = 0) {
    const geometry = new THREE.IcosahedronGeometry(radius, detail);
    const positions = geometry.attributes.position;

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const y = positions.getY(index);
      const z = positions.getZ(index);
      const length = Math.max(0.0001, Math.hypot(x, y, z));
      const nx = x / length;
      const ny = y / length;
      const nz = z / length;
      const warp = 1
        + Math.sin(nx * 4.7 + phase) * 0.045
        + Math.sin(ny * 5.9 - phase * 0.7) * 0.035
        + Math.cos(nz * 4.1 + phase * 1.3) * 0.03;
      positions.setXYZ(index, x * warp, y * warp, z * warp);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }

  markLandmarkPart(mesh, role, phase = 0) {
    mesh.userData.graveLandmarkPart = role;
    mesh.userData.graveLandmarkPhase = phase;
    mesh.userData.graveLandmarkBasePosition = mesh.position.clone();
    mesh.userData.graveLandmarkBaseScale = mesh.scale.clone();
    mesh.userData.graveLandmarkBaseRotation = mesh.rotation.clone();
    mesh.userData.objectDefiningRing = false;
    return mesh;
  }

  composeDormantSeedNutrient(root) {
    const podMaterial = new THREE.MeshStandardMaterial({
      color: 0x88d7bc,
      emissive: 0x123629,
      transparent: true,
      opacity: 0.56,
      roughness: 0.32
    });
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd080,
      emissive: 0xffa23a,
      emissiveIntensity: 0.72,
      roughness: 0.25
    });

    const pod = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), podMaterial);
    pod.name = "protected_outer_seed_pod";
    pod.scale.set(0.82, 1.15, 0.82);
    root.add(pod);

    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 10), glowMaterial);
    inner.name = "warm_inner_seed_glow";
    root.add(inner);

    const seam = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.008, 6, 40), new THREE.MeshBasicMaterial({ color: 0xffd9a6, transparent: true, opacity: 0.28 }));
    seam.name = "slightly_opening_seed_seam";
    seam.rotation.x = Math.PI / 2;
    root.add(seam);

    const ribMaterial = new THREE.MeshBasicMaterial({
      color: 0xc3ffe8,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 4; i += 1) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.004, 6, 36), ribMaterial.clone());
      rib.name = "protective_pod_rib";
      rib.rotation.set(Math.PI / 2, i * 0.42, i * Math.PI / 4);
      root.add(rib);
    }

    const petalMaterial = new THREE.MeshStandardMaterial({
      color: 0xa9f5d9,
      emissive: 0x184f3e,
      transparent: true,
      opacity: 0.34,
      roughness: 0.4,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 4; i += 1) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 8, 0, Math.PI), petalMaterial.clone());
      petal.name = "split_protective_seed_shell_petal";
      const angle = i * Math.PI / 2;
      petal.position.set(Math.cos(angle) * 0.18, 0.02, Math.sin(angle) * 0.18);
      petal.rotation.set(0.82, angle, -0.18);
      petal.scale.set(0.62, 0.18, 1.0);
      root.add(petal);
    }

    const safeRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe7ad,
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const safeAbsorbRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.012, 8, 88), safeRingMaterial);
    safeAbsorbRing.name = "safe_absorb_readability_ring";
    safeAbsorbRing.rotation.x = Math.PI / 2;
    safeAbsorbRing.material.opacity = 0;
    root.add(safeAbsorbRing);

    const safetyPulse = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.006, 6, 96), safeRingMaterial.clone());
    safetyPulse.name = "soft_safe_seed_outer_pulse";
    safetyPulse.rotation.set(Math.PI / 2, 0.18, 0.0);
    safetyPulse.material.opacity = 0;
    root.add(safetyPulse);

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.024, 0.52, 6), ribMaterial.clone());
    tail.name = "tiny_nursery_feed_tail";
    tail.position.set(-0.12, -0.36, -0.05);
    tail.rotation.set(0.8, 0.1, -0.45);
    root.add(tail);
  }

  composeScarContaminationPlate(root) {
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1018,
      emissive: 0x120408,
      roughness: 0.82,
      metalness: 0.0
    });
    const crackMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6f6f,
      transparent: true,
      opacity: 0.55
    });

    const plate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.22, 1.42), plateMaterial);
    plate.name = "dark_hardened_scar_plate";
    plate.rotation.set(-0.14, 0.12, -0.08);
    root.add(plate);

    for (let i = 0; i < 3; i += 1) {
      const shard = new THREE.Mesh(new THREE.BoxGeometry(0.62 - i * 0.08, 0.08, 0.36 + i * 0.06), plateMaterial.clone());
      shard.name = "raised_scar_shard";
      shard.position.set(-0.52 + i * 0.48, 0.08, 0.28 - i * 0.24);
      shard.rotation.set(0.08 + i * 0.08, 0.35 - i * 0.22, -0.18 + i * 0.09);
      root.add(shard);
    }

    for (let i = 0; i < 5; i += 1) {
      const crack = new THREE.Mesh(new THREE.BoxGeometry(0.72 - i * 0.06, 0.018, 0.018), crackMaterial.clone());
      crack.name = "faint_inner_crack_glow";
      crack.position.set(-0.28 + i * 0.16, 0.08, -0.28 + Math.sin(i) * 0.22);
      crack.rotation.y = 0.35 + i * 0.48;
      root.add(crack);
    }

    for (let i = 0; i < 7; i += 1) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), crackMaterial.clone());
      mote.name = "scar_memory_mote";
      mote.position.set(-0.7 + i * 0.22, 0.12, -0.36 + Math.sin(i * 2.2) * 0.34);
      root.add(mote);
    }

    const warningMaterial = new THREE.MeshBasicMaterial({
      color: 0xff667a,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const warningHalo = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.012, 8, 96), warningMaterial);
    warningHalo.name = "do_not_absorb_scar_warning_halo";
    warningHalo.rotation.x = Math.PI / 2;
    warningHalo.position.y = 0.11;
    warningHalo.material.opacity = 0;
    root.add(warningHalo);

    for (let i = 0; i < 6; i += 1) {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.22, 6), crackMaterial.clone());
      tooth.name = "unsafe_scar_resistance_tooth";
      const angle = (i / 6) * Math.PI * 2;
      tooth.position.set(Math.cos(angle) * 0.82, 0.18, Math.sin(angle) * 0.48);
      tooth.rotation.set(Math.PI / 2, 0, -angle);
      root.add(tooth);
    }
  }

  composeFluxCurrentRibbon(root) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x82e7ff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let lane = 0; lane < 3; lane += 1) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.7, -0.15 + lane * 0.1, 0.72 - lane * 0.14),
        new THREE.Vector3(-1.25, 0.1 - lane * 0.06, 0.2),
        new THREE.Vector3(0.15, -0.08 + lane * 0.08, -0.08),
        new THREE.Vector3(1.55, 0.12 - lane * 0.04, -0.48),
        new THREE.Vector3(2.9, -0.02 + lane * 0.07, -0.92)
      ]);
      const ribbon = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, 0.025 - lane * 0.004, 6, false), material.clone());
      ribbon.name = lane === 0 ? "transparent_ribbon_current" : "current_lane_filament";
      ribbon.material.opacity = lane === 0 ? 0.34 : 0.16;
      root.add(ribbon);
    }

    const beadMaterial = new THREE.MeshBasicMaterial({ color: 0xd3fbff, transparent: true, opacity: 0.42 });
    for (let i = 0; i < 9; i += 1) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), beadMaterial);
      bead.name = "moving_current_bead_hint";
      const angle = (i / 9) * Math.PI * 2;
      bead.position.set(-2.5 + i * 0.62, Math.sin(angle) * 0.16, 0.66 - i * 0.18);
      root.add(bead);
    }
  }

  composeSignalVaporThread(root) {
    const threadMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8f8ff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const thread = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.008, 6, 96), threadMaterial);
    thread.name = "thin_luminous_signal_thread";
    thread.scale.set(0.42, 1.0, 0.08);
    thread.rotation.set(0.2, 0.8, Math.PI / 2);
    root.add(thread);

    for (let i = 0; i < 2; i += 1) {
      const secondary = new THREE.Mesh(new THREE.TorusGeometry(0.62 + i * 0.18, 0.005, 6, 72), threadMaterial.clone());
      secondary.name = "secondary_signal_filament";
      secondary.scale.set(0.28 + i * 0.08, 0.9, 0.06);
      secondary.rotation.set(0.35 + i * 0.18, 0.9, Math.PI / 2 + i * 0.42);
      root.add(secondary);
    }

    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22 + i * 0.12, 0.006, 6, 48), threadMaterial.clone());
      ring.name = "small_answering_wave_node";
      ring.position.set(0, -0.32 + i * 0.32, 0);
      ring.rotation.x = Math.PI / 2;
      root.add(ring);
    }
  }

  composeScarMemoryFleck(root) {
    const chipMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a222c,
      emissive: 0x24070c,
      roughness: 0.84
    });
    const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xff8a75, transparent: true, opacity: 0.55 });

    const chip = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), chipMaterial);
    chip.name = "floating_scar_memory_chip";
    chip.scale.set(1.15, 0.38, 0.72);
    root.add(chip);

    const edge = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.005, 6, 36), edgeMaterial);
    edge.name = "signal_edge_on_memory_fleck";
    edge.rotation.x = Math.PI / 2;
    root.add(edge);
  }

  composeScarFlowClot(root) {
    const clotMaterial = new THREE.MeshStandardMaterial({
      color: 0x32131a,
      emissive: 0x160509,
      roughness: 0.78
    });
    const flowMaterial = new THREE.MeshBasicMaterial({ color: 0x7fdcff, transparent: true, opacity: 0.36 });

    const clot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 2), clotMaterial);
    clot.name = "scarred_flow_clot_body";
    clot.scale.set(1.2, 0.58, 0.82);
    root.add(clot);

    for (let i = 0; i < 5; i += 1) {
      const leak = new THREE.Mesh(new THREE.BoxGeometry(0.46 - i * 0.04, 0.012, 0.012), flowMaterial.clone());
      leak.name = "current_leak_under_clot_crack";
      leak.position.set(-0.22 + i * 0.12, 0.08, -0.18 + Math.sin(i) * 0.18);
      leak.rotation.y = 0.4 + i * 0.5;
      root.add(leak);
    }
  }

  composeResonantPathThread(root) {
    const threadMaterial = new THREE.MeshBasicMaterial({
      color: 0xbff7ff,
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const thread = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.008, 6, 96), threadMaterial);
    thread.name = "resonant_path_thread_main";
    thread.scale.set(0.36, 1.2, 0.1);
    thread.rotation.set(0.25, 0.9, Math.PI / 2);
    root.add(thread);

    for (let i = 0; i < 7; i += 1) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), threadMaterial.clone());
      bead.name = "path_thread_pressure_bead";
      bead.position.set(Math.sin(i) * 0.16, -0.48 + i * 0.16, Math.cos(i) * 0.06);
      root.add(bead);
    }
  }

  composePressureFoldCurrent(root) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x88eaff,
      transparent: true,
      opacity: 0.26,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const ribbon = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.032, 8, 96), material);
    ribbon.name = "pressure_fold_current_ribbon";
    ribbon.scale.set(1.35, 0.16, 0.42);
    ribbon.rotation.set(Math.PI / 2, 0.35, 0.78);
    root.add(ribbon);

    const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xff8c80, transparent: true, opacity: 0.32 });
    for (let i = 0; i < 8; i += 1) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), edgeMaterial.clone());
      bead.name = "scarred_current_edge_bead";
      const angle = (i / 8) * Math.PI * 2;
      bead.position.set(Math.cos(angle) * 1.3, Math.sin(angle) * 0.16, Math.sin(angle) * 0.42);
      root.add(bead);
    }
  }

  composeChoirResonanceNode(root) {
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xbff4ff,
      emissive: 0x2f8ca8,
      emissiveIntensity: 0.62,
      roughness: 0.28,
      transparent: true,
      opacity: 0.72
    });

    const center = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 12), nodeMaterial);
    center.name = "choir_resonance_center";
    root.add(center);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xd9fbff,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 4; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24 + i * 0.11, 0.006, 6, 72), ringMaterial.clone());
      ring.name = "choir_answering_ring";
      ring.rotation.set(Math.PI / 2, i * 0.28, i * 0.62);
      root.add(ring);
    }

    const light = new THREE.PointLight(0x9eeeff, 0.75, 4.8);
    light.name = "choir_resonance_light";
    root.add(light);
  }

  composeListeningPoreMembrane(root) {
    const membraneMaterial = new THREE.MeshStandardMaterial({
      color: 0x84d9cf,
      emissive: 0x123530,
      roughness: 0.38,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });

    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 12), membraneMaterial);
    pad.name = "listening_pore_membrane_pad";
    pad.scale.set(1.2, 0.22, 0.72);
    root.add(pad);

    const poreMaterial = new THREE.MeshBasicMaterial({
      color: 0xd7fbff,
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 5; i += 1) {
      const pore = new THREE.Mesh(new THREE.TorusGeometry(0.055 + i * 0.006, 0.004, 6, 28), poreMaterial.clone());
      pore.name = "listening_pore_ring";
      pore.position.set(-0.32 + i * 0.16, 0.03, 0.08 + Math.sin(i) * 0.06);
      pore.rotation.x = Math.PI / 2;
      root.add(pore);
    }
  }

  composeHarmonicWaveThread(root) {
    const threadMaterial = new THREE.MeshBasicMaterial({
      color: 0xc8f8ff,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const thread = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.008, 6, 96), threadMaterial);
    thread.name = "harmonic_wave_main_thread";
    thread.scale.set(0.38, 1.05, 0.08);
    thread.rotation.set(0.35, 0.5, Math.PI / 2);
    root.add(thread);

    const beadMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.58 });
    for (let i = 0; i < 7; i += 1) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), beadMaterial.clone());
      bead.name = "harmonic_wave_bead";
      const a = (i / 7) * Math.PI * 2;
      bead.position.set(Math.cos(a) * 0.38, Math.sin(a) * 0.92, Math.sin(a) * 0.08);
      root.add(bead);
    }
  }

  composeSeedSignalBridge(root) {
    const seedMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd49a,
      emissive: 0xff9d38,
      emissiveIntensity: 0.62,
      roughness: 0.24
    });
    const threadMaterial = new THREE.MeshBasicMaterial({
      color: 0xbaf6ff,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), seedMaterial);
    seed.name = "bridge_seed_core";
    root.add(seed);

    for (let i = 0; i < 2; i += 1) {
      const thread = new THREE.Mesh(new THREE.TorusGeometry(0.38 + i * 0.16, 0.006, 6, 64), threadMaterial.clone());
      thread.name = "seed_signal_bridge_thread";
      thread.scale.set(0.55, 0.18, 0.08);
      thread.rotation.set(Math.PI / 2, i * 0.4, i * 0.8);
      root.add(thread);
    }

    const bridgeHaloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe2a3,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const bridgeHalo = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.012, 8, 96), bridgeHaloMaterial);
    bridgeHalo.name = "seed_signal_bridge_action_halo";
    bridgeHalo.rotation.x = Math.PI / 2;
    root.add(bridgeHalo);

    for (let i = 0; i < 4; i += 1) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), bridgeHaloMaterial.clone());
      bead.name = "bridge_focus_bead";
      const angle = (i / 4) * Math.PI * 2;
      bead.position.set(Math.cos(angle) * 0.46, Math.sin(angle * 2) * 0.06, Math.sin(angle) * 0.18);
      root.add(bead);
    }

    const knotMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff0bc,
      emissive: 0xffc56a,
      emissiveIntensity: 0.42,
      roughness: 0.22,
      transparent: true,
      opacity: 0.86
    });
    const confluenceKnot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.085, 1), knotMaterial);
    confluenceKnot.name = "tiny_seed_signal_confluence_knot";
    confluenceKnot.position.y = 0.12;
    root.add(confluenceKnot);
  }

  composeBloomSporeLantern(root) {
    const sacMaterial = new THREE.MeshStandardMaterial({
      color: 0xff9b73,
      emissive: 0x4d160c,
      roughness: 0.32,
      transparent: true,
      opacity: 0.58
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd88c,
      emissive: 0xff8a3a,
      emissiveIntensity: 0.72,
      roughness: 0.2
    });

    const sac = new THREE.Mesh(new THREE.SphereGeometry(0.38, 22, 14), sacMaterial);
    sac.name = "bloom_lantern_membrane_sac";
    sac.scale.set(0.82, 1.18, 0.82);
    root.add(sac);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), glowMaterial);
    glow.name = "bloom_lantern_inner_glow";
    glow.position.set(0, 0.03, 0);
    root.add(glow);

    for (let i = 0; i < 6; i += 1) {
      const spore = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), glowMaterial.clone());
      spore.name = "preview_growth_spore";
      const angle = (i / 6) * Math.PI * 2;
      spore.position.set(Math.cos(angle) * 0.42, -0.12 + Math.sin(i) * 0.12, Math.sin(angle) * 0.42);
      root.add(spore);
    }

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.035, 0.46, 8), sacMaterial.clone());
    stem.name = "bloom_lantern_tether_stem";
    stem.position.set(0, -0.36, 0);
    stem.rotation.x = 0.18;
    root.add(stem);
  }

  composeResidueMemorySilt(root) {
    const siltMaterial = new THREE.MeshStandardMaterial({
      color: 0x7c6470,
      emissive: 0x110b0f,
      roughness: 0.92,
      transparent: true,
      opacity: 0.46
    });

    const moteMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8b7c8,
      transparent: true,
      opacity: 0.34,
      depthWrite: false
    });

    const pool = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 10), siltMaterial);
    pool.name = "settled_residue_memory_silt_pool";
    pool.scale.set(1.3, 0.16, 0.82);
    root.add(pool);

    for (let i = 0; i < 9; i += 1) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 2) * 0.015, 8, 6), moteMaterial.clone());
      mote.name = "old_core_memory_silt_mote";
      mote.position.set(-0.55 + i * 0.14, 0.1 + Math.sin(i) * 0.06, -0.24 + Math.cos(i * 1.8) * 0.28);
      root.add(mote);
    }

    const echo = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.006, 6, 54), moteMaterial.clone());
    echo.name = "prior_core_echo_ring";
    echo.scale.set(1.0, 0.28, 0.12);
    echo.rotation.x = Math.PI / 2;
    root.add(echo);
  }

  composeSeedChoiceBraid(root) {
    const seedMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd38a,
      emissive: 0xff8f32,
      emissiveIntensity: 0.45,
      roughness: 0.24
    });

    const bloomThread = new THREE.MeshBasicMaterial({
      color: 0xff9c76,
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const residueThread = new THREE.MeshBasicMaterial({
      color: 0xc4a0b2,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 10), seedMaterial);
    core.name = "choice_braid_seed_core";
    root.add(core);

    for (let i = 0; i < 4; i += 1) {
      const material = i % 2 === 0 ? bloomThread.clone() : residueThread.clone();
      const strand = new THREE.Mesh(new THREE.TorusGeometry(0.48 + i * 0.09, 0.006, 6, 72), material);
      strand.name = i % 2 === 0 ? "bloom_choice_strand" : "residue_choice_strand";
      strand.scale.set(0.84, 0.26, 0.10);
      strand.rotation.set(Math.PI / 2, i * 0.22, i * 0.8);
      root.add(strand);
    }
  }

  composeOvergrowthWarningTendril(root) {
    const vineMaterial = new THREE.MeshStandardMaterial({
      color: 0xe56f78,
      emissive: 0x351016,
      roughness: 0.42,
      transparent: true,
      opacity: 0.66
    });

    const scarTipMaterial = new THREE.MeshStandardMaterial({
      color: 0x35131b,
      emissive: 0x120408,
      roughness: 0.86
    });

    for (let i = 0; i < 5; i += 1) {
      const segment = new THREE.Mesh(new THREE.SphereGeometry(0.16 - i * 0.012, 12, 8), vineMaterial.clone());
      segment.name = "overgrowth_tendril_segment";
      segment.position.set(i * 0.18, Math.sin(i * 0.8) * 0.13, -i * 0.08);
      segment.scale.set(0.72, 1.2, 0.72);
      root.add(segment);
    }

    const hook = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.32, 8), scarTipMaterial);
    hook.name = "scarred_warning_hook";
    hook.position.set(0.88, -0.02, -0.36);
    hook.rotation.set(0.4, 0.0, -0.72);
    root.add(hook);

    const warningRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.006, 6, 48), new THREE.MeshBasicMaterial({
      color: 0xff788a,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false
    }));
    warningRing.name = "overgrowth_warning_ring";
    warningRing.rotation.x = Math.PI / 2;
    root.add(warningRing);
  }



  composeOldCoreHuskMemory(root) {
    Object.assign(root.userData, {
      graveLandmarkVisualLock: "HC-010F",
      graveLandmarkRole: "protected_old_core_husk",
      graveLandmarkSilhouette: "collapsed_bilateral_shell_with_empty_cavity",
      graveLandmarkMotion: "asymmetric_failing_breath",
      graveLandmarkTraits: [
        "collapsed_seed_core_shell",
        "scar_lit_cracks",
        "transient_do_not_absorb_first_halo"
      ],
      idleObjectDefiningRing: false
    });

    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x4d4147,
      emissive: 0x180b10,
      emissiveIntensity: 0.08,
      roughness: 0.92,
      transparent: true,
      opacity: 0.9
    });
    const shellLayout = [
      [-0.38, 0.02, 0.02, -0.08, -0.34, 0.34, 0.88, 0.42, 0.94],
      [0.36, -0.05, -0.03, 0.12, 0.3, -0.28, 0.8, 0.36, 0.9],
      [-0.04, -0.27, 0.1, 0.26, -0.12, 0.08, 1.04, 0.18, 0.72]
    ];
    shellLayout.forEach((values, index) => {
      const [x, y, z, rx, ry, rz, sx, sy, sz] = values;
      const lobe = new THREE.Mesh(
        this.createOrganicGeometry(0.72, 2, 8.4 + index * 1.7),
        shellMaterial.clone()
      );
      lobe.name = `grave_husk_collapsed_shell_lobe_${index + 1}`;
      lobe.position.set(x, y, z);
      lobe.rotation.set(rx, ry, rz);
      lobe.scale.set(sx, sy, sz);
      this.markLandmarkPart(lobe, "husk_shell_lobe", index * 0.9);
      root.add(lobe);
    });

    const cavity = new THREE.Mesh(
      this.createOrganicGeometry(0.36, 2, 4.6),
      new THREE.MeshStandardMaterial({
        color: 0x100b0e,
        emissive: 0x050203,
        roughness: 1,
        transparent: true,
        opacity: 0.94
      })
    );
    cavity.name = "grave_husk_empty_seed_cavity";
    cavity.position.set(0.03, 0.015, 0.24);
    cavity.scale.set(1.02, 0.54, 0.74);
    this.markLandmarkPart(cavity, "husk_empty_cavity");
    root.add(cavity);

    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0x7c493f,
      emissive: 0x531b17,
      emissiveIntensity: 0.26,
      roughness: 0.66,
      transparent: true,
      opacity: 0.66
    });
    const inner = new THREE.Mesh(this.createOrganicGeometry(0.19, 1, 2.4), innerMaterial);
    inner.name = "grave_husk_dim_old_seed_center_not_food";
    inner.position.set(-0.08, 0.035, 0.31);
    inner.scale.set(0.82, 0.54, 0.7);
    this.markLandmarkPart(inner, "husk_dim_center");
    root.add(inner);

    const tornMaterial = new THREE.MeshStandardMaterial({
      color: 0x69575e,
      emissive: 0x1a0d12,
      emissiveIntensity: 0.06,
      roughness: 0.86,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide
    });
    for (let index = 0; index < 5; index += 1) {
      const plate = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.22 + (index % 2) * 0.035, 0),
        tornMaterial.clone()
      );
      const side = index % 2 === 0 ? -1 : 1;
      plate.name = `grave_husk_torn_shell_plate_${index + 1}`;
      plate.position.set(side * (0.52 + Math.floor(index / 2) * 0.12), -0.08 + index * 0.065, 0.12 - index * 0.07);
      plate.rotation.set(0.22 + index * 0.19, side * 0.34, side * (0.32 + index * 0.11));
      plate.scale.set(0.76, 0.36, 1.12);
      this.markLandmarkPart(plate, "husk_torn_plate", index * 0.77);
      root.add(plate);
    }

    const crackMaterial = new THREE.MeshBasicMaterial({
      color: 0xff786d,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    });
    for (let index = 0; index < 7; index += 1) {
      const crack = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.007, 0.46 + (index % 3) * 0.08, 4, 6),
        crackMaterial.clone()
      );
      crack.name = `grave_husk_scar_lit_crack_${index + 1}`;
      crack.position.set(-0.38 + index * 0.13, -0.05 + Math.sin(index * 1.4) * 0.08, 0.5 - index * 0.025);
      crack.rotation.set(0.78 + index * 0.07, 0.12, -0.62 + index * 0.2);
      this.markLandmarkPart(crack, "husk_scar_crack", index * 0.63);
      root.add(crack);
    }

    const echo = new THREE.Mesh(
      this.createOrganicGeometry(0.64, 1, 6.2),
      new THREE.MeshBasicMaterial({
        color: 0xc4d9df,
        transparent: true,
        opacity: 0,
        wireframe: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    echo.name = "grave_husk_pulse_memory_echo_silhouette";
    echo.position.set(0, 0.08, -0.08);
    echo.scale.set(1.16, 0.54, 0.84);
    echo.visible = false;
    this.markLandmarkPart(echo, "husk_memory_echo");
    root.add(echo);

    const warningHalo = new THREE.Mesh(
      new THREE.TorusGeometry(1.0, 0.011, 7, 72),
      new THREE.MeshBasicMaterial({
        color: 0xffd0ad,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    warningHalo.name = "grave_husk_transient_do_not_absorb_halo";
    warningHalo.rotation.x = Math.PI / 2;
    warningHalo.visible = false;
    warningHalo.userData.transientVerbCue = true;
    this.markLandmarkPart(warningHalo, "husk_transient_warning_halo");
    root.add(warningHalo);
  }

  composeResidueSiltCloud(root) {
    Object.assign(root.userData, {
      graveLandmarkVisualLock: "HC-010F",
      graveLandmarkRole: "stabilizable_memory_silt",
      graveLandmarkSilhouette: "wide_settling_cloud_with_threaded_voids",
      graveLandmarkMotion: "downward_ash_drift_with_counter_turning_signal",
      graveLandmarkTraits: [
        "settling_ash_motes",
        "threaded_signal_voids",
        "pulse_memory_silhouettes"
      ],
      idleObjectDefiningRing: false
    });

    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0xb8aeb3,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    for (let index = 0; index < 6; index += 1) {
      const puff = new THREE.Mesh(
        this.createOrganicGeometry(0.55 + index * 0.065, 1, 3.1 + index * 1.9),
        cloudMaterial.clone()
      );
      puff.name = `grave_silt_cloud_lobe_${index + 1}`;
      puff.position.set(-0.5 + index * 0.2, -0.02 + Math.sin(index * 1.4) * 0.14, Math.cos(index) * 0.17);
      puff.scale.set(1.18 + (index % 2) * 0.28, 0.58, 0.76 + (index % 3) * 0.1);
      this.markLandmarkPart(puff, "silt_cloud_lobe", index * 0.91);
      root.add(puff);
    }

    const ashMaterial = new THREE.MeshBasicMaterial({
      color: 0xd7c4cb,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    for (let index = 0; index < 22; index += 1) {
      const mote = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.018 + (index % 4) * 0.007, 0),
        ashMaterial.clone()
      );
      const angle = index * 2.17;
      const radius = 0.22 + (index % 6) * 0.13;
      mote.name = `grave_silt_settling_ash_mote_${index + 1}`;
      mote.position.set(
        Math.cos(angle) * radius,
        -0.52 + ((index * 7) % 19) / 19 * 1.16,
        Math.sin(angle) * radius * 0.7
      );
      this.markLandmarkPart(mote, "silt_ash_mote", index / 22);
      root.add(mote);
    }

    const voidMaterial = new THREE.MeshBasicMaterial({
      color: 0x181219,
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    for (let index = 0; index < 5; index += 1) {
      const voidRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.22 + index * 0.045, 0.012, 6, 42),
        voidMaterial.clone()
      );
      voidRing.name = `grave_silt_threaded_signal_void_${index + 1}`;
      voidRing.position.set(-0.46 + index * 0.23, -0.04 + Math.sin(index) * 0.1, 0.22 - index * 0.1);
      voidRing.rotation.set(Math.PI / 2 + index * 0.2, index * 0.22, index * 0.54);
      voidRing.userData.internalSignalVoid = true;
      this.markLandmarkPart(voidRing, "silt_threaded_void", index * 0.71);
      root.add(voidRing);
    }

    const signalMaterial = new THREE.MeshBasicMaterial({
      color: 0x96e3ea,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    for (let index = 0; index < 9; index += 1) {
      const line = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.008, 0.62 + index * 0.035, 4, 6),
        signalMaterial.clone()
      );
      line.name = `grave_silt_memory_signal_thread_${index + 1}`;
      line.position.set(-0.62 + index * 0.155, -0.2 + Math.sin(index) * 0.16, 0.12 + Math.cos(index) * 0.22);
      line.rotation.set(1.1 + index * 0.06, 0.2, -0.62 + index * 0.16);
      this.markLandmarkPart(line, "silt_signal_thread", index * 0.58);
      root.add(line);
    }

    const echo = new THREE.Mesh(
      this.createOrganicGeometry(0.46, 1, 7.8),
      new THREE.MeshBasicMaterial({
        color: 0xa9e7f1,
        transparent: true,
        opacity: 0,
        wireframe: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    echo.name = "grave_silt_pulse_memory_silhouette";
    echo.position.set(0.04, 0.06, -0.08);
    echo.scale.set(1.08, 0.48, 0.8);
    echo.visible = false;
    this.markLandmarkPart(echo, "silt_memory_echo");
    root.add(echo);
  }

  composeScarLockPlate(root) {
    Object.assign(root.userData, {
      graveLandmarkVisualLock: "HC-010F",
      graveLandmarkRole: "protective_scar_guard",
      graveLandmarkSilhouette: "low_interlocking_guard_shell_not_portal",
      graveLandmarkMotion: "still_guard_that_hardens_on_greedy_absorb",
      graveLandmarkTraits: [
        "protective_dark_plate",
        "delayed_inner_crack_light",
        "not_a_gate_lock"
      ],
      idleObjectDefiningRing: false
    });

    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0x26151c,
      emissive: 0x0d0407,
      emissiveIntensity: 0.04,
      roughness: 0.96,
      metalness: 0
    });
    for (let index = 0; index < 5; index += 1) {
      const plate = new THREE.Mesh(
        this.createOrganicGeometry(0.5 - index * 0.025, 1, 5.4 + index * 1.3),
        plateMaterial.clone()
      );
      plate.name = `grave_scar_interlocking_guard_plate_${index + 1}`;
      plate.position.set(-0.56 + index * 0.28, 0.01 + Math.sin(index * 1.2) * 0.045, -0.04 + index * 0.035);
      plate.rotation.set(0.08 + index * 0.035, -0.34 + index * 0.17, -0.22 + index * 0.11);
      plate.scale.set(0.9, 0.22, 0.64 + (index % 2) * 0.08);
      this.markLandmarkPart(plate, "scar_guard_plate", index * 0.82);
      root.add(plate);
    }

    const ribMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a2029,
      emissive: 0x13070b,
      emissiveIntensity: 0.06,
      roughness: 0.9
    });
    for (let index = 0; index < 3; index += 1) {
      const rib = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.07 + index * 0.008, 0.96 + index * 0.13, 6, 10),
        ribMaterial.clone()
      );
      rib.name = `grave_scar_guarding_rib_${index + 1}`;
      rib.position.set(-0.16 + index * 0.18, -0.11 + index * 0.075, -0.24 - index * 0.08);
      rib.rotation.set(0.38 + index * 0.12, -0.16 + index * 0.14, Math.PI / 2 + (-0.22 + index * 0.18));
      rib.scale.set(1, 1, 0.72);
      this.markLandmarkPart(rib, "scar_guard_rib", index * 0.74);
      root.add(rib);
    }

    const crackMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7068,
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    for (let index = 0; index < 7; index += 1) {
      const crack = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.006, 0.42 + (index % 3) * 0.07, 4, 6),
        crackMaterial.clone()
      );
      crack.name = `grave_scar_delayed_inner_crack_${index + 1}`;
      crack.position.set(-0.55 + index * 0.18, 0.13 + Math.sin(index) * 0.035, 0.27 - index * 0.035);
      crack.rotation.set(1.18, 0.28, -0.72 + index * 0.23);
      this.markLandmarkPart(crack, "scar_delayed_crack", index * 0.61);
      root.add(crack);
    }

    const toothMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b3c3a,
      emissive: 0x4d1010,
      emissiveIntensity: 0.18,
      roughness: 0.72,
      transparent: true,
      opacity: 0
    });
    for (let index = 0; index < 6; index += 1) {
      const tooth = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.28 + (index % 2) * 0.05, 7),
        toothMaterial.clone()
      );
      tooth.name = `grave_scar_recoil_warning_tooth_${index + 1}`;
      tooth.position.set(-0.52 + index * 0.21, 0.22, 0.03 - Math.abs(2.5 - index) * 0.045);
      tooth.rotation.set(Math.PI, 0, -0.18 + index * 0.07);
      this.markLandmarkPart(tooth, "scar_recoil_tooth", index * 0.69);
      tooth.scale.setScalar(0.001);
      tooth.visible = false;
      root.add(tooth);
    }
  }

  composeInheritanceSeedRemnant(root) {
    Object.assign(root.userData, {
      graveLandmarkVisualLock: "HC-010F",
      graveLandmarkRole: "protected_inheritance_seed",
      graveLandmarkSilhouette: "upright_warm_seed_in_dark_residue_nest",
      graveLandmarkMotion: "slow_sleeping_pulse_without_opening",
      graveLandmarkTraits: [
        "dim_seed_core",
        "residue_nest",
        "future_bind_glow"
      ],
      idleObjectDefiningRing: false
    });

    const nestMaterial = new THREE.MeshStandardMaterial({
      color: 0x51464e,
      emissive: 0x140d12,
      emissiveIntensity: 0.06,
      roughness: 0.88,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide
    });
    for (let index = 0; index < 5; index += 1) {
      const angle = (index / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(
        this.createOrganicGeometry(0.38 + (index % 2) * 0.045, 1, 2.8 + index * 1.4),
        nestMaterial.clone()
      );
      petal.name = `grave_seed_residue_nest_petal_${index + 1}`;
      petal.position.set(Math.cos(angle) * 0.28, -0.18 + (index % 2) * 0.035, Math.sin(angle) * 0.24);
      petal.rotation.set(0.72 + Math.sin(angle) * 0.18, angle, -0.24 + Math.cos(angle) * 0.16);
      petal.scale.set(0.62, 0.22, 0.94);
      this.markLandmarkPart(petal, "seed_residue_nest_petal", index * 0.73);
      root.add(petal);
    }

    const seedMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8b66d,
      emissive: 0xff8f2f,
      emissiveIntensity: 0.42,
      roughness: 0.28,
      transparent: true,
      opacity: 0.9
    });
    const seed = new THREE.Mesh(this.createOrganicGeometry(0.27, 2, 9.1), seedMaterial);
    seed.name = "grave_seed_dim_inheritance_core";
    seed.position.set(0, 0.08, 0);
    seed.scale.set(0.7, 1.34, 0.7);
    this.markLandmarkPart(seed, "seed_dim_core");
    root.add(seed);

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0x8c8088,
      emissive: 0x1c1419,
      emissiveIntensity: 0.04,
      roughness: 0.76,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide
    });
    for (let index = 0; index < 3; index += 1) {
      const skin = new THREE.Mesh(
        this.createOrganicGeometry(0.34, 1, 5.2 + index * 2.1),
        skinMaterial.clone()
      );
      skin.name = `grave_seed_gray_memory_skin_${index + 1}`;
      skin.position.set((index - 1) * 0.08, 0.04 + index * 0.025, -0.03 + index * 0.035);
      skin.rotation.set(0.1 + index * 0.24, index * 2.04, -0.18 + index * 0.16);
      skin.scale.set(0.86, 0.94, 0.44);
      this.markLandmarkPart(skin, "seed_gray_memory_skin", index * 0.88);
      root.add(skin);
    }

    const filamentMaterial = new THREE.MeshBasicMaterial({
      color: 0xc3a69a,
      transparent: true,
      opacity: 0.26,
      depthWrite: false
    });
    for (let index = 0; index < 5; index += 1) {
      const angle = (index / 5) * Math.PI * 2;
      const filament = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.012, 0.42 + index * 0.035, 4, 6),
        filamentMaterial.clone()
      );
      filament.name = `grave_seed_residue_root_filament_${index + 1}`;
      filament.position.set(Math.cos(angle) * 0.25, -0.38, Math.sin(angle) * 0.22);
      filament.rotation.set(0.42 + Math.sin(angle) * 0.2, angle, Math.cos(angle) * 0.42);
      this.markLandmarkPart(filament, "seed_root_filament", index * 0.64);
      root.add(filament);
    }

    const futureGlow = new THREE.Mesh(
      this.createOrganicGeometry(0.42, 1, 11.2),
      new THREE.MeshBasicMaterial({
        color: 0xffe4a7,
        transparent: true,
        opacity: 0.05,
        wireframe: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    futureGlow.name = "grave_seed_future_bind_glow_envelope";
    futureGlow.position.set(0, 0.07, 0);
    futureGlow.scale.set(0.9, 1.18, 0.9);
    this.markLandmarkPart(futureGlow, "seed_future_glow");
    root.add(futureGlow);

    const light = new THREE.PointLight(0xffaa52, 0.48, 3.2);
    light.name = "grave_seed_low_warm_light";
    light.position.set(0, 0.08, 0.12);
    root.add(light);
  }


  composeScarMemorySeamThread(root) {
    const cordMaterial = new THREE.MeshStandardMaterial({
      color: 0x261216,
      emissive: 0x120406,
      roughness: 0.78,
      transparent: true,
      opacity: 0.86
    });

    for (let i = 0; i < 4; i += 1) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 1.08 + i * 0.12, 6), cordMaterial.clone());
      cord.name = "thin_suture_thread_closed_memory_cord";
      cord.position.set(-0.48 + i * 0.32, Math.sin(i) * 0.045, -0.06 + Math.cos(i) * 0.05);
      cord.rotation.set(1.16 + i * 0.08, 0.08, -0.72 + i * 0.22);
      root.add(cord);
    }

    const knotMaterial = new THREE.MeshBasicMaterial({
      color: 0xff9078,
      transparent: true,
      opacity: 0.36,
      depthWrite: false
    });

    for (let i = 0; i < 5; i += 1) {
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.055 + (i % 2) * 0.012, 10, 6), knotMaterial.clone());
      knot.name = "memory_knot_that_lights_then_dims";
      knot.position.set(-0.6 + i * 0.3, 0.02 + Math.sin(i * 1.2) * 0.05, 0.09 - i * 0.035);
      root.add(knot);
    }

    const noPullRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.008, 8, 72), new THREE.MeshBasicMaterial({
      color: 0xffc6aa,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false
    }));
    noPullRing.name = "not_a_pull_rope_readability_ring";
    noPullRing.rotation.x = Math.PI / 2;
    root.add(noPullRing);
  }

  composeResidueStitchLattice(root) {
    const siltMaterial = new THREE.MeshBasicMaterial({
      color: 0xb8aaa4,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 6; i += 1) {
      const cell = new THREE.Mesh(new THREE.TorusGeometry(0.16 + (i % 3) * 0.035, 0.006, 6, 32), siltMaterial.clone());
      cell.name = "settled_silt_lattice_cell_not_resource";
      cell.position.set(-0.56 + (i % 3) * 0.46, -0.06 + Math.floor(i / 3) * 0.2, -0.04 + Math.sin(i) * 0.08);
      cell.scale.set(1.35, 0.64, 1.0);
      cell.rotation.set(Math.PI / 2, 0.18 + i * 0.08, i * 0.36);
      root.add(cell);
    }

    const stitchMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8f7d,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });

    for (let i = 0; i < 7; i += 1) {
      const stitch = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.58 + i * 0.035, 6), stitchMaterial.clone());
      stitch.name = "dark_suture_edge_between_lattice_cells";
      stitch.position.set(-0.66 + i * 0.22, 0.02 + Math.sin(i) * 0.08, 0.12 - i * 0.025);
      stitch.rotation.set(1.05 + i * 0.04, 0.22, -0.8 + i * 0.3);
      root.add(stitch);
    }
  }

  composeEchoHuskImprint(root) {
    const vaporMaterial = new THREE.MeshStandardMaterial({
      color: 0x827a7d,
      emissive: 0x161011,
      roughness: 0.66,
      transparent: true,
      opacity: 0.22
    });

    const imprint = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 2), vaporMaterial);
    imprint.name = "transparent_collapsed_core_imprint_absence";
    imprint.scale.set(1.12, 0.42, 0.76);
    imprint.rotation.set(0.2, -0.35, 0.16);
    root.add(imprint);

    const missingRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xccefff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const missingRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.008, 8, 64), missingRingMaterial);
    missingRing.name = "missing_inner_ring_answer_shape";
    missingRing.rotation.x = Math.PI / 2;
    missingRing.scale.set(1.24, 0.72, 1.0);
    root.add(missingRing);

    for (let i = 0; i < 4; i += 1) {
      const fade = new THREE.Mesh(new THREE.SphereGeometry(0.04 + i * 0.012, 8, 5), missingRingMaterial.clone());
      fade.name = "echo_husk_fading_vapor_mote";
      fade.position.set(-0.34 + i * 0.24, -0.16 + Math.sin(i) * 0.08, 0.18 - i * 0.08);
      root.add(fade);
    }
  }

  composeClosedInheritanceSuture(root) {
    const seedMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd18a,
      emissive: 0xff9d35,
      emissiveIntensity: 0.28,
      roughness: 0.28,
      transparent: true,
      opacity: 0.72
    });

    const seed = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 2), seedMaterial);
    seed.name = "dim_seed_core_inside_closed_suture";
    seed.scale.set(0.72, 1.04, 0.72);
    root.add(seed);

    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a1b1f,
      emissive: 0x120405,
      roughness: 0.82,
      transparent: true,
      opacity: 0.62
    });

    for (let i = 0; i < 3; i += 1) {
      const shell = new THREE.Mesh(new THREE.TorusGeometry(0.34 + i * 0.06, 0.022, 8, 58), shellMaterial.clone());
      shell.name = "closed_scar_ring_over_inheritance_seed";
      shell.rotation.set(Math.PI / 2 + i * 0.18, i * 0.38, i * 0.52);
      root.add(shell);
    }

    const warningMaterial = new THREE.MeshBasicMaterial({
      color: 0xffb391,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const noReward = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.008, 8, 78), warningMaterial);
    noReward.name = "future_seed_closed_no_reward_prompt_ring";
    noReward.rotation.x = Math.PI / 2;
    root.add(noReward);

    const light = new THREE.PointLight(0xffb46a, 0.36, 2.4);
    light.name = "closed_inheritance_suture_low_light";
    root.add(light);
  }

}
