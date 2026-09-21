import * as THREE from "three";

export class EntityVisualComposer {
  constructor() {
    this.silhouetteMap = {
          "crescent_manta": "composeNurseryMembraneTender",
          "anchored_sensing_bulbs": "composeMembraneWatcher",
          "paired_flow_vanes": "composeVascularRelay"
    };
  }

  composeNurseryMembraneTender(root) {
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x7be0c4,
      emissive: 0x10382f,
      roughness: 0.36,
      transparent: true,
      opacity: 0.58
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd18a,
      emissive: 0xffa041,
      emissiveIntensity: 0.55,
      roughness: 0.25
    });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 18), bodyMaterial);
    body.name = "crescent_manta_soft_body";
    body.scale.set(1.58, 0.34, 0.82);
    root.add(body);

    for (const side of [-1, 1]) {
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 14), bodyMaterial.clone());
      canopy.name = side < 0 ? "left_guarding_canopy" : "right_guarding_canopy";
      canopy.position.set(side * 0.78, -0.06, 0.08);
      canopy.scale.set(1.22, 0.22, 0.76);
      canopy.rotation.z = side * -0.18;
      root.add(canopy);

      const cuppedFrond = new THREE.Mesh(new THREE.SphereGeometry(0.48, 22, 12, 0, Math.PI), bodyMaterial.clone());
      cuppedFrond.name = side < 0 ? "left_seed_guard_frond" : "right_seed_guard_frond";
      cuppedFrond.position.set(side * 0.56, -0.34, 0.26);
      cuppedFrond.scale.set(1.05, 0.24, 0.92);
      cuppedFrond.rotation.set(0.7, side * 0.2, side * -0.3);
      root.add(cuppedFrond);
    }

    for (let i = 0; i < 5; i += 1) {
      const frond = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.028, 0.55 + i * 0.04, 8),
        bodyMaterial.clone()
      );
      frond.name = "filter_frond";
      frond.position.set(-0.58 + i * 0.29, -0.5, 0.2 + Math.sin(i) * 0.08);
      frond.rotation.x = 0.78 + i * 0.04;
      frond.rotation.z = -0.25 + i * 0.12;
      root.add(frond);
    }

    for (let i = 0; i < 3; i += 1) {
      const sac = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), glowMaterial);
      sac.name = "tiny_seed_sac";
      sac.position.set(-0.22 + i * 0.22, -0.08, 0.56);
      root.add(sac);
    }

    const softLight = new THREE.PointLight(0xffc985, 0.72, 4);
    softLight.name = "tender_seed_sac_glow";
    root.add(softLight);
  }

  composeMembraneWatcher(root) {
    const lensMaterial = new THREE.MeshStandardMaterial({
      color: 0xa9e7ff,
      emissive: 0x123445,
      roughness: 0.28,
      transparent: true,
      opacity: 0.54
    });

    const signalMaterial = new THREE.MeshBasicMaterial({
      color: 0xcff8ff,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const anchor = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 16), lensMaterial);
    anchor.name = "anchored_watcher_lens_body";
    anchor.scale.set(0.92, 1.28, 0.58);
    root.add(anchor);

    const pupilMaterial = new THREE.MeshBasicMaterial({
      color: 0xffefbd,
      transparent: true,
      opacity: 0.82,
      depthWrite: false
    });
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 12), pupilMaterial);
    pupil.name = "dominant_watcher_pupil";
    pupil.position.z = 0.28;
    pupil.scale.set(0.48, 1.05, 0.22);
    root.add(pupil);

    for (let i = 0; i < 4; i += 1) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), lensMaterial.clone());
      bulb.name = "rotating_sensing_bulb";
      const angle = (i / 4) * Math.PI * 2;
      bulb.position.set(Math.cos(angle) * 0.47, 0.06 + Math.sin(i) * 0.05, Math.sin(angle) * 0.28);
      root.add(bulb);
    }

    for (let i = 0; i < 3; i += 1) {
      const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, 0.85, 6), signalMaterial.clone());
      thread.name = "anchoring_signal_thread";
      thread.position.set(-0.24 + i * 0.24, -0.42, -0.06);
      thread.rotation.x = 0.36 + i * 0.15;
      root.add(thread);
    }

    const warningRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.006, 6, 54), signalMaterial);
    warningRing.name = "small_warning_pulse_ring";
    warningRing.rotation.x = Math.PI / 2;
    warningRing.material.opacity = 0;
    root.add(warningRing);

    const signalLight = new THREE.PointLight(0x9fe8ff, 0.55, 3.5);
    signalLight.name = "watcher_signal_light";
    root.add(signalLight);
  }


  composeVascularRelay(root) {
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x73b7ff,
      emissive: 0x153b66,
      emissiveIntensity: 0.46,
      roughness: 0.3,
      transparent: true,
      opacity: 0.62
    });
    const vaneMaterial = new THREE.MeshStandardMaterial({
      color: 0x8ce7da,
      emissive: 0x123f43,
      emissiveIntensity: 0.38,
      roughness: 0.34,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide
    });
    const lumenMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd88e,
      transparent: true,
      opacity: 0.76,
      depthWrite: false
    });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.92, 8, 18), bodyMaterial);
    body.name = "vascular_relay_lumen_body";
    body.rotation.x = Math.PI / 2;
    body.scale.set(0.92, 0.92, 1.18);
    root.add(body);

    // Three paired stations = six flow vanes. The organism reads as a living
    // handoff structure rather than another Core or another sensor.
    for (let station = 0; station < 3; station += 1) {
      const z = -0.34 + station * 0.34;
      for (const side of [-1, 1]) {
        const vane = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 10), vaneMaterial.clone());
        vane.name = `relay_flow_vane_${station}_${side < 0 ? "left" : "right"}`;
        vane.position.set(side * (0.34 + station * 0.025), 0, z);
        vane.scale.set(1.22, 0.16, 0.54);
        vane.rotation.z = side * (0.22 - station * 0.035);
        vane.rotation.y = side * 0.12;
        root.add(vane);
      }
    }

    for (let i = 0; i < 3; i += 1) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), lumenMaterial.clone());
      bead.name = "relay_lumen_bead";
      bead.position.set(0, 0, -0.34 + i * 0.34);
      root.add(bead);
    }

    const wake = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.012, 6, 42), lumenMaterial.clone());
    wake.name = "relay_downstream_wake";
    wake.position.z = 0.62;
    wake.rotation.x = Math.PI / 2;
    wake.material.opacity = 0.24;
    root.add(wake);

    const light = new THREE.PointLight(0x7fcfff, 0.6, 3.8);
    light.name = "vascular_relay_flow_light";
    root.add(light);
  }

}
