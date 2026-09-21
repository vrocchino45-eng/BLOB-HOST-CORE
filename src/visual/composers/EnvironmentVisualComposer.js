import * as THREE from "three";

export class EnvironmentVisualComposer {
  constructor() {
    this.silhouetteMap = {
          "curved_soft_pocket": "composeMembranePocket",
          "enormous_curled_organism_world": "composeDistantHost",
          "soft_fog_volume": "composeAtmosphereMarker",
          "scar_flow_fold_surface": "composeScarFlowFoldSurface",
          "scar_pressure_haze": "composeScarPressureHaze",
          "signal_chorus_nerve_surface": "composeSignalChorusNerveSurface",
          "signal_chorus_haze": "composeSignalChorusHaze",
          "bloom_residue_fork_surface": "composeBloomResidueForkSurface",
          "bloom_residue_choice_haze": "composeBloomResidueChoiceHaze",
          "low_settling_residue_basin_with_half_buried_core_shells": "composeGraveMemoryResidueBedSurface",
          "wide_soft_ash_haze_with_threadlike_signal_flickers": "composeGraveMemorySiltHaze",
          "closed_scar_memory_seam_basin": "composeGraveScarMemorySeamSurface",
          "thin_haze_caught_between_suture_threads": "composeGraveScarMemorySeamHaze"
    };
  }

  composeMembranePocket(root) {
    const material = new THREE.MeshStandardMaterial({
      color: 0x275c6c,
      emissive: 0x071923,
      roughness: 0.58,
      metalness: 0.0,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
      depthWrite: false
    });

    const pocket = new THREE.Mesh(new THREE.SphereGeometry(8, 48, 24), material);
    pocket.name = "elastic_translucent_membrane_pocket";
    pocket.scale.set(1.62, 0.68, 1.08);
    pocket.position.set(-0.35, 1.45, -0.9);
    root.add(pocket);

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x163d47,
      emissive: 0x061217,
      roughness: 0.72,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: true
    });
    for (const [name, position, scale, rotation] of [
      ["nursery_protected_side_wall", [3.25, -0.1, -1.45], [0.46, 2.5, 3.3], [0.1, -0.35, -0.18]],
      ["nursery_wounded_side_wall", [-3.45, -0.35, -1.75], [0.38, 2.15, 2.8], [-0.08, 0.42, 0.16]],
      ["nursery_floor_membrane", [-0.2, -2.18, -0.5], [4.2, 0.3, 3.2], [0, 0, -0.03]]
    ]) {
      const wall = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16), wallMaterial.clone());
      wall.name = name;
      wall.position.set(...position);
      wall.scale.set(...scale);
      wall.rotation.set(...rotation);
      root.add(wall);
    }

    const poreMaterial = new THREE.MeshBasicMaterial({
      color: 0x8fd4e8,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 9; i += 1) {
      const pore = new THREE.Mesh(new THREE.TorusGeometry(0.08 + (i % 3) * 0.02, 0.006, 6, 18), poreMaterial);
      const angle = (i / 9) * Math.PI * 2;
      const radius = 4.8 + Math.sin(i * 1.7) * 1.1;
      pore.position.set(Math.cos(angle) * radius, -1.5 + Math.sin(i) * 0.25, Math.sin(angle) * 2.4 - 1.0);
      pore.rotation.set(Math.sin(i) * 0.4, angle, Math.cos(i) * 0.4);
      pore.name = "filter_pore_hint";
      root.add(pore);
    }

    const veinMaterial = new THREE.MeshBasicMaterial({
      color: 0x80e0ef,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 3; i += 1) {
      const vein = new THREE.Mesh(new THREE.TorusGeometry(2.2 + i * 0.36, 0.01, 6, 96), veinMaterial.clone());
      vein.name = "soft_membrane_vein_arc";
      vein.scale.set(1.4, 0.16, 0.55);
      vein.position.set(0, -1.58 + i * 0.03, -1.0 + i * 0.18);
      vein.rotation.set(Math.PI / 2, 0.15 + i * 0.05, -0.28 + i * 0.08);
      root.add(vein);
    }

    const supportMaterial = new THREE.MeshStandardMaterial({
      color: 0x245963,
      emissive: 0x071c22,
      emissiveIntensity: 0.12,
      roughness: 0.86,
      transparent: true,
      opacity: 0.34,
      depthWrite: true
    });
    for (let i = 0; i < 5; i += 1) {
      const x = -4.5 + i * 2.25;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, -2.95, -4.25 + (i % 2) * 0.55),
        new THREE.Vector3(x + Math.sin(i) * 0.45, -0.75, -4.7 + (i % 3) * 0.38),
        new THREE.Vector3(x - Math.cos(i) * 0.38, 1.35, -4.4 + (i % 2) * 0.62),
        new THREE.Vector3(x * 0.86, 3.35, -3.9 + (i % 3) * 0.34)
      ], false, "catmullrom", 0.32);
      const support = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 34, 0.055 + (i % 2) * 0.016, 7, false),
        supportMaterial.clone()
      );
      support.name = "nursery_vertical_support_rib";
      support.userData.targetingSuppressed = true;
      support.userData.altitudeCue = true;
      root.add(support);
    }
  }

  composeDistantHost(root) {
    const material = new THREE.MeshStandardMaterial({
      color: 0x3d294d,
      emissive: 0x14071e,
      roughness: 0.7,
      transparent: true,
      opacity: 0.48
    });

    const scarMaterial = new THREE.MeshBasicMaterial({
      color: 0x351018,
      transparent: true,
      opacity: 0.65
    });

    const bodyA = new THREE.Mesh(new THREE.SphereGeometry(3.0, 32, 16), material);
    bodyA.name = "distant_host_main_mass";
    bodyA.scale.set(1.8, 0.9, 0.7);
    root.add(bodyA);

    const bodyB = new THREE.Mesh(new THREE.SphereGeometry(2.1, 32, 16), material);
    bodyB.name = "distant_host_curled_lobe";
    bodyB.position.set(-2.4, 0.2, 0.4);
    bodyB.scale.set(1.0, 0.8, 0.62);
    root.add(bodyB);

    const scarBand = new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.035, 8, 96), scarMaterial);
    scarBand.name = "dark_scar_band";
    scarBand.rotation.set(0.8, 0.2, 0.3);
    root.add(scarBand);

    const seedMaterial = new THREE.MeshBasicMaterial({
      color: 0xffc56f,
      transparent: true,
      opacity: 0.65
    });

    for (let i = 0; i < 7; i += 1) {
      const seed = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), seedMaterial);
      seed.name = "distant_seed_pocket_glow";
      seed.position.set(-0.9 + i * 0.32, -0.25 + Math.sin(i) * 0.2, 0.72);
      root.add(seed);
    }
  }

  composeAtmosphereMarker(root) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffd7a6,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide
    });

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(6.5, 32, 16), material);
    sphere.name = "nursery_soft_pressure_fog_hint";
    root.add(sphere);
  }

  composeScarFlowFoldSurface(root) {
    const membraneMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b1824,
      emissive: 0x12040a,
      roughness: 0.72,
      transparent: true,
      opacity: 0.38,
      side: THREE.BackSide
    });

    const surface = new THREE.Mesh(new THREE.SphereGeometry(7.6, 48, 24), membraneMaterial);
    surface.name = "scar_flow_fold_surface_shell";
    surface.scale.set(1.35, 0.48, 0.72);
    surface.position.set(0.8, 0.7, -1.1);
    root.add(surface);

    const crackMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7d70,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 10; i += 1) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(1.0 + i * 0.32, 0.007, 6, 72), crackMaterial.clone());
      arc.name = "scar_route_fracture_arc";
      arc.scale.set(1.35, 0.12, 0.46);
      arc.position.set(0.6 + i * 0.05, -1.0 + Math.sin(i) * 0.08, -1.0 - i * 0.18);
      arc.rotation.set(Math.PI / 2, 0.1 + i * 0.04, -0.35 + i * 0.12);
      root.add(arc);
    }

    const flowMaterial = new THREE.MeshBasicMaterial({
      color: 0x9edaff,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 6; i += 1) {
      const vein = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.022, 3.2 + i * 0.2, 6), flowMaterial.clone());
      vein.name = "pressure_flow_vein";
      vein.position.set(-1.7 + i * 0.64, -0.9 + Math.sin(i) * 0.08, -2.2 + i * 0.16);
      vein.rotation.set(1.35, 0.2 + i * 0.08, -0.9 + i * 0.16);
      root.add(vein);
    }
  }

  composeScarPressureHaze(root) {
    const hazeMaterial = new THREE.MeshBasicMaterial({
      color: 0x9b5264,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const haze = new THREE.Mesh(new THREE.SphereGeometry(5.2, 32, 16), hazeMaterial);
    haze.name = "scar_pressure_haze_volume";
    haze.scale.set(1.6, 0.58, 0.95);
    root.add(haze);

    const moteMaterial = new THREE.MeshBasicMaterial({ color: 0xffac92, transparent: true, opacity: 0.28 });
    for (let i = 0; i < 24; i += 1) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 3) * 0.006, 8, 6), moteMaterial.clone());
      mote.name = "scar_pressure_haze_mote";
      mote.position.set(-2.4 + (i % 8) * 0.68, -0.85 + Math.sin(i * 1.7) * 0.55, -1.9 + Math.floor(i / 8) * 0.75);
      root.add(mote);
    }
  }

  composeSignalChorusNerveSurface(root) {
    const material = new THREE.MeshStandardMaterial({
      color: 0x17334a,
      emissive: 0x0a1d2a,
      roughness: 0.45,
      transparent: true,
      opacity: 0.36,
      side: THREE.BackSide
    });

    const pocket = new THREE.Mesh(new THREE.SphereGeometry(7.2, 48, 24), material);
    pocket.name = "signal_chorus_nerve_pocket_surface";
    pocket.scale.set(1.25, 0.52, 0.92);
    pocket.position.set(0, 1.15, -0.8);
    root.add(pocket);

    const threadMaterial = new THREE.MeshBasicMaterial({
      color: 0xaeeeff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 11; i += 1) {
      const thread = new THREE.Mesh(new THREE.TorusGeometry(1.35 + i * 0.28, 0.007, 6, 96), threadMaterial.clone());
      thread.name = "chorus_surface_thread_arc";
      thread.scale.set(1.15, 0.13, 0.42);
      thread.position.set(0, -1.1 + Math.sin(i) * 0.1, -0.75 + i * 0.11);
      thread.rotation.set(Math.PI / 2, i * 0.06, -0.5 + i * 0.12);
      root.add(thread);
    }
  }

  composeSignalChorusHaze(root) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xbcefff,
      transparent: true,
      opacity: 0.045,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const haze = new THREE.Mesh(new THREE.SphereGeometry(5.8, 32, 16), material);
    haze.name = "signal_chorus_soft_haze";
    haze.scale.set(1.2, 0.7, 1.0);
    root.add(haze);
  }

  composeBloomResidueForkSurface(root) {
    const bloomMaterial = new THREE.MeshStandardMaterial({
      color: 0xff9a78,
      emissive: 0x321108,
      roughness: 0.44,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide
    });

    const residueMaterial = new THREE.MeshStandardMaterial({
      color: 0x7b5b64,
      emissive: 0x160d10,
      roughness: 0.78,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide
    });

    const leftFold = new THREE.Mesh(new THREE.SphereGeometry(3.2, 32, 16), residueMaterial);
    leftFold.name = "residue_memory_path_fold";
    leftFold.position.set(-1.7, -0.75, -1.2);
    leftFold.scale.set(0.85, 0.18, 0.48);
    root.add(leftFold);

    const rightFold = new THREE.Mesh(new THREE.SphereGeometry(3.2, 32, 16), bloomMaterial);
    rightFold.name = "bloom_growth_path_fold";
    rightFold.position.set(1.7, -0.55, -1.25);
    rightFold.scale.set(0.9, 0.2, 0.52);
    root.add(rightFold);

    const braidMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd7a5,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 5; i += 1) {
      const bridge = new THREE.Mesh(new THREE.TorusGeometry(0.82 + i * 0.18, 0.008, 6, 72), braidMaterial.clone());
      bridge.name = "fork_bridge_braid_arc";
      bridge.position.set(0, -0.38 + i * 0.02, -1.22);
      bridge.scale.set(1.0 + i * 0.08, 0.18, 0.16);
      bridge.rotation.set(Math.PI / 2, 0.2, i * 0.34);
      root.add(bridge);
    }
  }

  composeBloomResidueChoiceHaze(root) {
    const bloomDust = new THREE.MeshBasicMaterial({
      color: 0xffb086,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const residueDust = new THREE.MeshBasicMaterial({
      color: 0xb59aa5,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 14; i += 1) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.08 + (i % 3) * 0.025, 8, 6), i % 2 === 0 ? bloomDust.clone() : residueDust.clone());
      mote.name = i % 2 === 0 ? "bloom_haze_spore" : "residue_haze_mote";
      const side = i % 2 === 0 ? 1 : -1;
      mote.position.set(side * (0.45 + (i % 7) * 0.34), -0.05 + Math.sin(i) * 0.4, -1.0 + Math.cos(i * 1.4) * 0.5);
      root.add(mote);
    }
  }



  composeGraveMemoryResidueBedSurface(root) {
    const basinMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2226,
      emissive: 0x090506,
      roughness: 0.86,
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide
    });

    const basin = new THREE.Mesh(new THREE.SphereGeometry(4.8, 48, 18), basinMaterial);
    basin.name = "grave_memory_residue_bed_basin";
    basin.position.set(0, -1.18, -1.45);
    basin.scale.set(1.45, 0.12, 0.72);
    root.add(basin);

    const rimMaterial = new THREE.MeshBasicMaterial({
      color: 0x9f7d83,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 7; i += 1) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(1.35 + i * 0.28, 0.01, 6, 96), rimMaterial.clone());
      rim.name = "grave_residue_settling_rim";
      rim.position.set(0.12 * Math.sin(i), -1.04 + i * 0.018, -1.48 - i * 0.08);
      rim.scale.set(1.45 + i * 0.04, 0.14, 0.42);
      rim.rotation.set(Math.PI / 2, 0.07 * i, -0.42 + i * 0.11);
      root.add(rim);
    }

    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x5f5558,
      emissive: 0x160f10,
      roughness: 0.78,
      transparent: true,
      opacity: 0.52
    });

    for (let i = 0; i < 5; i += 1) {
      const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34 + (i % 2) * 0.08, 1), shellMaterial.clone());
      shell.name = "half_buried_old_core_shell_fragment";
      shell.position.set(-2.1 + i * 1.02, -0.78 + Math.sin(i * 1.3) * 0.09, -1.36 + Math.cos(i) * 0.36);
      shell.scale.set(1.0, 0.28, 0.72);
      shell.rotation.set(0.3 + i * 0.18, i * 0.52, -0.12 + i * 0.08);
      root.add(shell);
    }

    const scarBoundaryMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8a76,
      transparent: true,
      opacity: 0.20,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 4; i += 1) {
      const boundary = new THREE.Mesh(new THREE.TorusGeometry(2.25 + i * 0.38, 0.012, 8, 96), scarBoundaryMaterial.clone());
      boundary.name = "non_gate_scar_boundary_arc";
      boundary.position.set(0, -0.88 + i * 0.02, -1.58 - i * 0.05);
      boundary.scale.set(1.35, 0.13, 0.35);
      boundary.rotation.set(Math.PI / 2, 0.14, 0.55 + i * 0.2);
      root.add(boundary);
    }
  }

  composeGraveMemorySiltHaze(root) {
    const hazeMaterial = new THREE.MeshBasicMaterial({
      color: 0xb8a7a1,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const haze = new THREE.Mesh(new THREE.SphereGeometry(5.4, 32, 16), hazeMaterial);
    haze.name = "grave_memory_silt_haze_volume";
    haze.scale.set(1.55, 0.52, 0.82);
    haze.position.set(0.0, -0.18, -1.2);
    root.add(haze);

    const moteMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8c8bd,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });

    for (let i = 0; i < 32; i += 1) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.022 + (i % 4) * 0.006, 8, 5), moteMaterial.clone());
      mote.name = "grave_silt_memory_mote";
      mote.position.set(-3.2 + (i % 8) * 0.92, -0.78 + Math.sin(i * 1.7) * 0.58, -1.8 + Math.floor(i / 8) * 0.55);
      root.add(mote);
    }

    const threadMaterial = new THREE.MeshBasicMaterial({
      color: 0xbfe8ff,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 8; i += 1) {
      const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.011, 2.6 + i * 0.18, 6), threadMaterial.clone());
      thread.name = "grave_haze_threadlike_signal_flicker";
      thread.position.set(-2.6 + i * 0.72, -0.22 + Math.sin(i) * 0.2, -1.4 + Math.cos(i) * 0.32);
      thread.rotation.set(1.18 + i * 0.05, 0.22 + i * 0.08, -0.7 + i * 0.18);
      root.add(thread);
    }
  }


  composeGraveScarMemorySeamSurface(root) {
    const basinMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b1b1f,
      emissive: 0x0d0406,
      roughness: 0.86,
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide
    });

    const seamBed = new THREE.Mesh(new THREE.SphereGeometry(3.65, 36, 18), basinMaterial);
    seamBed.name = "grave_scar_memory_seam_closed_basin";
    seamBed.position.set(0, -0.92, -1.34);
    seamBed.scale.set(1.32, 0.12, 0.42);
    root.add(seamBed);

    const sutureMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8a76,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 8; i += 1) {
      const stitch = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 1.22 + i * 0.06, 6), sutureMaterial.clone());
      stitch.name = "closed_scar_memory_cross_stitch";
      stitch.position.set(-1.92 + i * 0.55, -0.66 + Math.sin(i * 1.2) * 0.04, -1.32 + Math.cos(i) * 0.1);
      stitch.rotation.set(1.18, 0.12 + i * 0.035, -0.86 + (i % 2) * 1.58);
      root.add(stitch);
    }

    const latticeMaterial = new THREE.MeshBasicMaterial({
      color: 0xb8d7dc,
      transparent: true,
      opacity: 0.115,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 5; i += 1) {
      const lattice = new THREE.Mesh(new THREE.TorusGeometry(0.72 + i * 0.24, 0.006, 6, 72), latticeMaterial.clone());
      lattice.name = "settled_residue_lattice_under_closed_seam";
      lattice.position.set(-0.12 + Math.sin(i) * 0.16, -0.58 + i * 0.006, -1.24 - i * 0.05);
      lattice.scale.set(1.9, 0.16, 0.42);
      lattice.rotation.set(Math.PI / 2, 0.06 + i * 0.08, -0.28 + i * 0.24);
      root.add(lattice);
    }

    const notDoorMaterial = new THREE.MeshBasicMaterial({
      color: 0xffc4a6,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const closedBoundary = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.014, 8, 104), notDoorMaterial);
    closedBoundary.name = "closed_seam_not_exit_readability_boundary";
    closedBoundary.position.set(0.02, -0.62, -1.38);
    closedBoundary.scale.set(1.34, 0.14, 0.36);
    closedBoundary.rotation.set(Math.PI / 2, 0.1, 0.42);
    root.add(closedBoundary);
  }

  composeGraveScarMemorySeamHaze(root) {
    const hazeMaterial = new THREE.MeshBasicMaterial({
      color: 0xa99a98,
      transparent: true,
      opacity: 0.046,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const haze = new THREE.Mesh(new THREE.SphereGeometry(4.9, 32, 16), hazeMaterial);
    haze.name = "thin_haze_caught_between_suture_threads";
    haze.position.set(0.0, -0.35, -1.42);
    haze.scale.set(1.45, 0.36, 0.66);
    root.add(haze);

    const threadMaterial = new THREE.MeshBasicMaterial({
      color: 0xc9f0ff,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 10; i += 1) {
      const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.008, 2.0 + i * 0.08, 6), threadMaterial.clone());
      thread.name = "seam_haze_sideways_signal_thread";
      thread.position.set(-2.8 + i * 0.62, -0.3 + Math.sin(i * 1.3) * 0.18, -1.36 + Math.cos(i) * 0.2);
      thread.rotation.set(1.24 + i * 0.04, 0.18, -0.74 + i * 0.16);
      root.add(thread);
    }

    const sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd9a4,
      transparent: true,
      opacity: 0.24,
      depthWrite: false
    });

    for (let i = 0; i < 18; i += 1) {
      const spark = new THREE.Mesh(new THREE.SphereGeometry(0.022 + (i % 3) * 0.005, 8, 5), sparkMaterial.clone());
      spark.name = "closed_seed_spark_inside_seam_haze";
      spark.position.set(-2.6 + (i % 6) * 1.0, -0.48 + Math.sin(i * 1.5) * 0.32, -1.72 + Math.floor(i / 6) * 0.34);
      root.add(spark);
    }
  }

}
