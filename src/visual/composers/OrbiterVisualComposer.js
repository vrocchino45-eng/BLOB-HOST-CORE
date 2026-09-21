import * as THREE from "three";

export class OrbiterVisualComposer {
  constructor() {
    this.silhouetteMap = {
          "folded_lantern_organ": "composeGuideOrbiterFoldedLantern",
          "folded_lantern_interpreter_organ": "composeGuideOrbiterFoldedLantern"
    };
  }

  composeGuideOrbiterFoldedLantern(root) {
    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x9ddcff,
      emissive: 0x102a3a,
      roughness: 0.32,
      transparent: true,
      opacity: 0.52
    });

    const lanternMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd88a,
      emissive: 0xffa23d,
      emissiveIntensity: 0.82,
      roughness: 0.2
    });

    const threadMaterial = new THREE.MeshBasicMaterial({
      color: 0xdff9ff,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 14), shellMaterial);
    shell.name = "folded_lantern_outer_shell";
    shell.scale.set(0.78, 1.05, 0.62);
    root.add(shell);

    const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.018, 8, 72), shellMaterial.clone());
    crescent.name = "protective_crescent_shell";
    crescent.scale.set(0.72, 1.0, 0.18);
    crescent.rotation.set(Math.PI / 2, 0.0, 0.55);
    root.add(crescent);

    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 12), lanternMaterial);
    lantern.name = "single_luminous_sensing_membrane";
    lantern.position.set(0.06, 0.02, 0.12);
    root.add(lantern);

    for (let i = 0; i < 3; i += 1) {
      const fold = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.018, 0.54, 6), threadMaterial.clone());
      fold.name = "folded_signal_membrane_rib";
      fold.position.set(-0.16 + i * 0.16, 0.0, -0.08);
      fold.rotation.x = 0.92;
      fold.rotation.z = -0.18 + i * 0.18;
      root.add(fold);
    }

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.012, 0.78, 6), threadMaterial);
    tail.name = "thread_tail_to_host_tissue";
    tail.position.set(-0.28, -0.34, -0.18);
    tail.rotation.set(0.7, 0.1, -0.45);
    root.add(tail);

    const answerRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.006, 6, 72), threadMaterial.clone());
    answerRing.name = "small_answering_wave_ring";
    answerRing.rotation.x = Math.PI / 2;
    answerRing.material.opacity = 0;
    root.add(answerRing);

    const pupilMaterial = new THREE.MeshBasicMaterial({
      color: 0xfff2bd,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    });
    const sensingSlit = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.18, 0.006), pupilMaterial);
    sensingSlit.name = "lantern_interpreter_sensing_slit";
    sensingSlit.position.set(0.08, 0.02, 0.265);
    root.add(sensingSlit);

    for (let i = 0; i < 3; i += 1) {
      const pathMote = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), threadMaterial.clone());
      pathMote.name = "guide_path_shimmer_mote";
      pathMote.position.set(-0.46 - i * 0.14, -0.22 - i * 0.06, -0.2 - i * 0.03);
      root.add(pathMote);
    }

    const outerAnswer = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.005, 6, 96), threadMaterial.clone());
    outerAnswer.name = "larger_interpreter_answer_ring";
    outerAnswer.rotation.set(Math.PI / 2, 0.12, -0.24);
    outerAnswer.material.opacity = 0;
    root.add(outerAnswer);

    const light = new THREE.PointLight(0xffc985, 1.15, 6.2);
    light.name = "guide_lantern_glow";
    root.add(light);
  }

}
