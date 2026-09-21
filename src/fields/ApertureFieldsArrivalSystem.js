import * as THREE from "three";

const CELL_ID = "CELL_APERTURE_FIELDS_ARRIVAL_001";

export class ApertureFieldsArrivalSystem {
  constructor({ scene, playerRoot, frameState }) {
    if (!scene || !playerRoot || !frameState) throw new Error("[ApertureFieldsArrivalSystem] scene, playerRoot and frameState are required.");
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.root = null;
    this.entryAnchor = new THREE.Vector3();
    this.boundsCenter = new THREE.Vector3();
    this.returnFold = new THREE.Vector3();
    this.landmarks = [];
    this.guideSightline = null;
    this.signalReturnFilament = null;
    this.signalReturnPositions = null;
    this.signalResponseMeshes = [];
    this.reveal = 0;
  }

  init() {
    if (this.root) return;
    this.root = new THREE.Group();
    this.root.name = "aperture_fields_continuation_foundation_HC015M";
    this.root.visible = false;
    this.scene.add(this.root);

    const membraneMat = new THREE.MeshStandardMaterial({ color: 0x365e6a, roughness: 0.82, metalness: 0.02, transparent: true, opacity: 0.34 });
    const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x7b9a84, roughness: 0.9, metalness: 0.01 });
    const signalMat = new THREE.MeshStandardMaterial({ color: 0xa5c9bc, emissive: 0x203e3a, emissiveIntensity: 0.28, roughness: 0.58 });
    const distantMat = new THREE.MeshStandardMaterial({ color: 0x515a72, emissive: 0x111522, emissiveIntensity: 0.12, roughness: 0.84, transparent: true, opacity: 0.58 });

    // Broad decompression shelf: intentionally wide and low-detail, unlike chamber strips.
    const shelf = new THREE.Mesh(new THREE.SphereGeometry(15.5, 40, 22, 0, Math.PI * 2, 0.22, 1.2), membraneMat);
    shelf.scale.set(1.55, 0.24, 2.15);
    shelf.position.set(0, -3.1, -12.5);
    shelf.rotation.x = Math.PI;
    shelf.name = "aperture_arrival_shelf_presentation"; shelf.userData.inspectionFadeable = true; shelf.userData.livingTissue = true;
    this.root.add(shelf);

    // HC-014K Arrival Cradle: nearby anatomy makes the crossing feel like a landing rather than
    // a spawn in empty space. Presentation-only; no collision or progression ownership.
    const cradleMat = new THREE.MeshStandardMaterial({ color: 0x47757a, emissive: 0x10282b, emissiveIntensity: 0.12, roughness: 0.88, transparent: true, opacity: 0.52 });
    for (let i = 0; i < 7; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const depth = Math.floor(i / 2);
      const cradle = new THREE.Mesh(new THREE.TorusGeometry(2.45 + depth * 0.82 + (i % 3) * 0.13, 0.16 + depth * 0.045 + (i % 2) * 0.055, 9, 38, Math.PI * (0.82 + (i % 3) * 0.12)), cradleMat);
      cradle.position.set(side * (2.0 + depth * 1.3), -1.25 + depth * 0.18, -4.0 - depth * 2.4);
      cradle.rotation.set(Math.PI / 2.15, side * 0.18, side * 0.42);
      cradle.scale.set(1.35 + depth * 0.12, 0.82 + (i % 2) * 0.18, 1.0);
      cradle.name = `aperture_arrival_cradle_${i + 1}`; cradle.userData.inspectionFadeable = true; cradle.userData.livingTissue = true;
      this.root.add(cradle);
    }

    const ridgeGeometry = new THREE.CapsuleGeometry(0.32, 5.8, 5, 12);
    for (let i = 0; i < 9; i += 1) {
      const ridge = new THREE.Mesh(ridgeGeometry, ridgeMat);
      const offset = i - 4;
      const x = offset * 4.0;
      ridge.position.set(x + Math.sin(i * 1.7) * 0.55, -0.65 + Math.abs(offset) * 0.12 + Math.cos(i * 1.3) * 0.28, -10.5 - Math.abs(offset) * 2.05);
      ridge.rotation.set(Math.PI / 2.3, 0, 0.13 * offset);
      ridge.scale.set(0.72 + Math.abs(offset) * 0.13 + (i % 2) * 0.18, 1.18 + (i % 3) * 0.22, 0.68 + (i % 4) * 0.08);
      ridge.name = `aperture_arrival_ridge_${i + 1}`; ridge.userData.inspectionFadeable = true; ridge.userData.livingTissue = true;
      this.root.add(ridge);
    }

    // Three distant ecology landmarks only: Signal, Membrane, Gathering. No ecology gameplay yet.
    // HC-014J gives the Signal Plain landmark first-read authority so arrival has one clear
    // objective ring while the other two landmarks remain world-meaning context.
    const specs = [
      { id: "signal_plain_beacon", p: [-10.5, 3.8, -32.0], s: [1.65, 8.4, 1.65], mat: signalMat },
      { id: "membrane_ridge_arc", p: [17.5, 1.2, -44.0], s: [5.8, 1.5, 2.1], mat: ridgeMat },
      { id: "gathering_ground_cluster", p: [3.5, 8.5, -56.0], s: [3.8, 3.8, 3.8], mat: distantMat }
    ];
    for (const spec of specs) {
      const geo = spec.id === "membrane_ridge_arc" ? new THREE.TorusGeometry(2.4, 0.26, 12, 48, Math.PI * 1.25) : new THREE.IcosahedronGeometry(1, 2);
      const mesh = new THREE.Mesh(geo, spec.mat);
      mesh.name = spec.id;
      mesh.position.fromArray(spec.p);
      mesh.scale.fromArray(spec.s);
      this.root.add(mesh);
      mesh.userData.apertureLandmarkId = spec.id;
      mesh.userData.baseScale = mesh.scale.clone();
      mesh.userData.baseEmissiveIntensity = Number.isFinite(mesh.material?.emissiveIntensity) ? mesh.material.emissiveIntensity : 0;
      this.landmarks.push({ id: spec.id, mesh });

      if (spec.id === "signal_plain_beacon") {
        // HC-014L: grow the beacon into a recognizable receptive organ. Unequal lobes and
        // branching membranes carry the destination silhouette; rings are now only a faint echo.
        const lobeMat = signalMat.clone();
        lobeMat.transparent = true; lobeMat.opacity = 0.72;
        for (let lobeIndex = 0; lobeIndex < 5; lobeIndex += 1) {
          const lobe = new THREE.Mesh(new THREE.SphereGeometry(1.5, 18, 10), lobeMat.clone());
          const a = -0.9 + lobeIndex * 0.45;
          lobe.position.copy(mesh.position).add(new THREE.Vector3(Math.sin(a) * (2.2 + lobeIndex * 0.25), -1.4 + lobeIndex * 0.7, Math.cos(a) * 1.1));
          lobe.scale.set(1.15 + lobeIndex * 0.12, 0.28 + (lobeIndex % 2) * 0.12, 2.2 - lobeIndex * 0.16);
          lobe.rotation.set(0.35 + lobeIndex * 0.08, a * 0.45, a);
          lobe.name = `signal_plain_living_lobe_${lobeIndex + 1}`;
          this.root.add(lobe);
          this.signalResponseMeshes.push(lobe);
        }
        // Shape + motion cue: nested rings remain secondary, not the landmark itself.
        // into ecology gameplay or an interactable objective.
        for (let ringIndex = 0; ringIndex < 3; ringIndex += 1) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.75 + ringIndex * 0.55, 0.035, 7, 36),
            signalMat
          );
          ring.position.copy(mesh.position);
          ring.position.y += ringIndex * 1.15 - 1.1;
          ring.rotation.set(Math.PI / 2, 0, ringIndex * 0.35);
          ring.scale.set(1.05, 1.05, 1.05);
          ring.material = ring.material.clone();
          ring.material.transparent = true; ring.material.opacity = 0.28;
          ring.name = `signal_plain_orientation_ring_${ringIndex + 1}`;
          this.root.add(ring);
        }
      }
    }

    // HC-014K Signal Plain receptive fan: the destination is now a place with a broad silhouette,
    // not merely a beacon plus waypoint rings. These membranes only breathe visually.
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x6ea79f, emissive: 0x173f3b, emissiveIntensity: 0.22, roughness: 0.78, transparent: true, opacity: 0.56, side: THREE.DoubleSide });
    for (let i = -4; i <= 4; i += 1) {
      const fan = new THREE.Mesh(new THREE.SphereGeometry(3.0, 22, 12, 0, Math.PI * 2, 0.38, 0.72), fanMat.clone());
      fan.position.set(-10.5 + i * 1.45, 3.0 + Math.abs(i) * 0.18, -32.0 + Math.abs(i) * 0.45);
      fan.scale.set(1.0, 0.16, 2.0 + (4 - Math.abs(i)) * 0.18);
      fan.rotation.set(Math.PI * 0.48, 0, i * 0.11);
      fan.name = `signal_plain_receptive_membrane_${i + 5}`;
      this.root.add(fan);
      fan.userData.baseScaleY = fan.scale.y;
      this.signalResponseMeshes.push(fan);
    }

    // Mid-field connective tissue bends the composition toward Signal Plain and breaks up empty
    // test-volume space without becoming a rail or a gameplay path.
    const connectiveMat = new THREE.MeshStandardMaterial({ color: 0x3e686c, emissive: 0x0d2426, emissiveIntensity: 0.1, roughness: 0.92, transparent: true, opacity: 0.42 });
    for (let i = 0; i < 6; i += 1) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3((i - 2.5) * 4.8, -1.2 + (i % 2) * 1.3, -8.0 - i * 1.2),
        new THREE.Vector3((i < 3 ? -1 : 1) * (8.8 + (i % 3) * 1.6), 0.5 + (i % 3) * 1.0, -18.0 - i * 1.0),
        new THREE.Vector3(-10.5 + (i < 3 ? -1 : 1) * (6.8 + (i % 3) * 0.7), 2.2 + (i % 2) * 1.2, -27.2 - (i % 2) * 1.4)
      ]);
      const tissue = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.18 + (i % 3) * 0.045, 8, false), connectiveMat);
      tissue.name = `aperture_midfield_connective_${i + 1}`;
      tissue.userData.inspectionFadeable = true; tissue.userData.livingTissue = true;
      this.root.add(tissue);
    }

    // Objective-ring cue only: a subtle sightline from the shelf toward Signal Plain.
    // This is presentation, not a route rail, collision object, or progression mutation.
    const guidePoints = [
      new THREE.Vector3(0, 0.35, -3.5),
      new THREE.Vector3(-2.2, 0.75, -10.0),
      new THREE.Vector3(-5.8, 1.65, -19.0),
      new THREE.Vector3(-10.5, 3.8, -30.0)
    ];
    const guideCurve = new THREE.CatmullRomCurve3(guidePoints);
    const guideMat = new THREE.MeshBasicMaterial({ color: 0x8fc9c4, transparent: true, opacity: 0.0, depthWrite: false });
    this.guideSightline = new THREE.Mesh(new THREE.TubeGeometry(guideCurve, 48, 0.035, 6, false), guideMat);
    this.guideSightline.name = "aperture_signal_plain_guide_sightline_HC014J";
    this.root.add(this.guideSightline);

    // HC-015N HOTFIX1: when the player wanders away before Signal Plain is complete,
    // a living conduction filament reconnects the current position to the unfinished ecology.
    // This is world-space guidance, not a HUD waypoint and not a targeting object.
    this.signalReturnPositions = new Float32Array(9);
    const returnGeo = new THREE.BufferGeometry();
    returnGeo.setAttribute("position", new THREE.BufferAttribute(this.signalReturnPositions, 3));
    const returnMat = new THREE.LineBasicMaterial({
      color: 0xa8d8ca, transparent: true, opacity: 0.0, depthWrite: false
    });
    this.signalReturnFilament = new THREE.Line(returnGeo, returnMat);
    this.signalReturnFilament.name = "aperture_signal_plain_return_filament_HC015N_HOTFIX1";
    this.signalReturnFilament.visible = false;
    this.root.add(this.signalReturnFilament);

    // HC-014B scale lock: broad side membranes and overhead strands create near/mid/far parallax
    // without adding interactable ecology. They are presentation-only horizon anatomy.
    const horizonMat = new THREE.MeshStandardMaterial({ color: 0x294752, roughness: 0.94, metalness: 0, transparent: true, opacity: 0.22 });
    for (let i = 0; i < 6; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const depth = Math.floor(i / 2);
      const sheet = new THREE.Mesh(new THREE.SphereGeometry(4.8 + depth * 1.8, 20, 12), horizonMat);
      sheet.scale.set(1.9, 0.38 + depth * 0.08, 3.4);
      sheet.position.set(side * (15.5 + depth * 4.5), 1.0 + depth * 1.8, -17 - depth * 12);
      sheet.rotation.set(0.18 * side, 0.08 * side, 0.22 * side);
      this.root.add(sheet);
    }

    const strandMat = new THREE.MeshStandardMaterial({ color: 0x58757b, emissive: 0x102328, emissiveIntensity: 0.12, roughness: 0.86 });
    for (let i = 0; i < 5; i += 1) {
      const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 18 + i * 3.5, 5, 10), strandMat);
      strand.position.set((i - 2) * 7.5, 7.5 + (i % 2) * 2.2, -24 - i * 6.5);
      strand.rotation.set(Math.PI / 2.15, 0, (i - 2) * 0.14);
      strand.name = `aperture_overhead_strand_${i + 1}`; strand.userData.inspectionFadeable = true; strand.userData.ambientOnly = true;
      this.root.add(strand);
    }

    // Host-scale silhouettes: enormous, slow background anatomy establishes that the playable
    // field is only a local pocket inside a much larger organism.
    const macroMat = new THREE.MeshStandardMaterial({ color: 0x232f43, emissive: 0x090d18, emissiveIntensity: 0.08, roughness: 1, transparent: true, opacity: 0.20 });
    const macroSpecs = [
      [-34, 14, -70, 14, 5, 24],
      [38, -3, -84, 18, 7, 30],
      [4, 23, -102, 24, 6, 18]
    ];
    for (const [x,y,z,sx,sy,sz] of macroSpecs) {
      const macro = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), macroMat);
      macro.position.set(x,y,z); macro.scale.set(sx,sy,sz);
      macro.name = "aperture_macro_context_tissue"; macro.userData.inspectionFadeable = true; macro.userData.ambientOnly = true;
      this.root.add(macro);
    }

    const foldMat = new THREE.MeshStandardMaterial({ color: 0xd4b06c, emissive: 0x4b3410, emissiveIntensity: 0.32, roughness: 0.56 });
    for (let i = -1; i <= 1; i += 1) {
      const fold = new THREE.Mesh(new THREE.TorusGeometry(1.05 + Math.abs(i) * 0.16, 0.12, 8, 32, Math.PI * 1.45), foldMat);
      fold.position.set(i * 0.28, 0.2 + Math.abs(i) * 0.12, 1.25 + Math.abs(i) * 0.18);
      fold.rotation.set(Math.PI / 2, 0, Math.PI * 0.25 * i);
      this.root.add(fold);
    }
  }

  onRuntimeMount(frameState) {
    this.init();
    this.entryAnchor.copy(this.playerRoot.position);
    this.boundsCenter.copy(this.entryAnchor).add(new THREE.Vector3(0, 0.6, -15.0));
    this.returnFold.copy(this.entryAnchor).add(new THREE.Vector3(0, 0.15, 1.35));
    this.root.position.copy(this.entryAnchor);
    this.root.visible = true;
    this.reveal = 0;
    frameState.apertureFieldsArrival = { active: true, pass: "HC-015N", stage: "arrival_decompression" };
  }

  onRuntimeUnmount(frameState) {
    if (this.root) this.root.visible = false;
    frameState.apertureFieldsArrival = { ...(frameState.apertureFieldsArrival ?? {}), active: false, stage: "arrival_history_retained" };
  }

  onRuntimePrepare(frameState) {
    this.init();
    frameState.apertureFieldsArrivalPreparation = { pass: "HC-015N", status: "prepared_hidden", mutatesProgression: false };
  }

  update(dt, frameState) {
    const active = frameState.activeCellId === CELL_ID;
    if (!active) return;
    if (!this.root) this.init();
    this.root.visible = true;
    this.reveal = Math.min(1, this.reveal + dt * 0.32);

    const player = this.playerRoot.position;
    const returnDistance = player.distanceTo(this.returnFold);
    const landmarkStates = this.landmarks.map(({ id, mesh }) => ({
      id,
      distance: player.distanceTo(this.entryAnchor.clone().add(mesh.position)),
      readable: this.reveal >= 0.34
    }));
    const signalLandmark = landmarkStates.find((landmark) => landmark.id === "signal_plain_beacon") ?? null;
    const membraneLandmark = landmarkStates.find((landmark) => landmark.id === "membrane_ridge_arc") ?? null;
    const signalDistance = signalLandmark?.distance ?? Infinity;
    const membraneDistance = membraneLandmark?.distance ?? Infinity;
    const signalPlainCompleted = Boolean(frameState.signalPlainEcology?.completed);
    const continuationBlend = signalPlainCompleted
      ? THREE.MathUtils.clamp(frameState.signalPlainEcology?.localResponse ?? 1, 0, 1)
      : 0;

    // HC-015F live-frame correction: world-coordinate separation was not enough.
    // When the player reaches the Signal Plain gameplay pocket, soften only presentation
    // tissue that can collapse into the camera corridor. Signal Plain itself and ecology
    // receptors are separate roots and remain fully legible.
    // HC-015F: the gameplay pocket gets stronger figure/ground separation than HC-015E.
    // Presentation tissue is context, never the current objective.
    const pocketBlend = THREE.MathUtils.smoothstep(signalDistance, 7.0, 22.0);
    this.root.traverse((object) => {
      if (!object?.isMesh || !object.userData?.inspectionFadeable || !object.material) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        material.userData ??= {};
        if (!Number.isFinite(material.userData.apertureBaseOpacity)) material.userData.apertureBaseOpacity = material.opacity ?? 1;
        const base = material.userData.apertureBaseOpacity;
        material.transparent = true;
        material.depthWrite = false;
        const pocketOpacity = Math.min(base, object.userData.ambientOnly ? 0.025 : 0.075);
        material.opacity = THREE.MathUtils.lerp(pocketOpacity, base, pocketBlend);
      }
    });

    const signalApproachReadable = signalDistance <= 24.0;
    const signalOrientationHeld = signalDistance <= 15.0;
    const membraneApproachReadable = membraneDistance <= 30.0;

    // HC-015M: Signal Plain completion opens the deeper field instead of ending at a HUD state.
    // This is presentation/foundation only: the existing Membrane Ridge landmark becomes the
    // next readable horizon target, but it receives no interaction or progression authority.
    const membraneEntry = this.landmarks.find((entry) => entry.id === "membrane_ridge_arc") ?? null;
    if (membraneEntry?.mesh) {
      const mesh = membraneEntry.mesh;
      const baseScale = mesh.userData.baseScale ?? mesh.scale;
      const pulse = 1 + Math.sin((frameState.runtimeSeconds ?? 0) * 1.15) * 0.045 * continuationBlend;
      mesh.scale.set(
        baseScale.x * (1 + continuationBlend * 0.10) * pulse,
        baseScale.y * (1 + continuationBlend * 0.08),
        baseScale.z * (1 + continuationBlend * 0.10) * pulse
      );
      if (mesh.material?.emissive) {
        mesh.material.emissive.setHex(0x203f35);
        mesh.material.emissiveIntensity = (mesh.userData.baseEmissiveIntensity ?? 0) + continuationBlend * 0.46;
      }
    }

    const signalEntry = this.landmarks.find((entry) => entry.id === "signal_plain_beacon") ?? null;
    const membraneEntryForPriority = this.landmarks.find((entry) => entry.id === "membrane_ridge_arc") ?? null;
    const gatheringEntryForPriority = this.landmarks.find((entry) => entry.id === "gathering_ground_cluster") ?? null;

    // Before Signal Plain is complete, future destinations remain context instead of competing objectives.
    for (const futureEntry of [membraneEntryForPriority, gatheringEntryForPriority]) {
      const mesh = futureEntry?.mesh;
      if (!mesh?.material) continue;
      mesh.material.userData ??= {};
      if (!Number.isFinite(mesh.material.userData.preSignalBaseOpacity)) {
        mesh.material.userData.preSignalBaseOpacity = mesh.material.opacity ?? 1;
        mesh.material.userData.preSignalBaseEmissive = mesh.material.emissiveIntensity ?? 0;
      }
      const baseOpacity = mesh.material.userData.preSignalBaseOpacity;
      const baseEmissive = mesh.material.userData.preSignalBaseEmissive;
      mesh.material.transparent = true;
      mesh.material.opacity = signalPlainCompleted
        ? THREE.MathUtils.lerp(Math.min(baseOpacity, 0.24), baseOpacity, continuationBlend)
        : Math.min(baseOpacity, 0.16);
      if ("emissiveIntensity" in mesh.material) {
        mesh.material.emissiveIntensity = signalPlainCompleted
          ? THREE.MathUtils.lerp(baseEmissive * 0.35, baseEmissive + 0.34, continuationBlend)
          : baseEmissive * 0.22;
      }
    }

    if (signalEntry?.mesh?.material) {
      const material = signalEntry.mesh.material;
      const unfinishedDistanceEmphasis = !signalPlainCompleted
        ? THREE.MathUtils.clamp((signalDistance - 14.0) / 18.0, 0, 1)
        : 0;
      material.emissiveIntensity = signalPlainCompleted
        ? THREE.MathUtils.lerp(0.28, 0.08, continuationBlend)
        : 0.28 + unfinishedDistanceEmphasis * 0.52;
      if ("opacity" in material) {
        material.transparent = true;
        material.opacity = signalPlainCompleted ? THREE.MathUtils.lerp(1.0, 0.48, continuationBlend) : 1.0;
      }
    }
    const cameraDistanceIntent = this.reveal < 0.22
      ? 11.8
      : this.reveal < 0.58
        ? 13.6
        : signalApproachReadable
          ? 15.2
          : 16.2;

    if (this.guideSightline?.material) {
      const targetOpacity = signalPlainCompleted
        ? 0.004
        : this.reveal >= 0.32 && !signalOrientationHeld ? 0.055 : 0.008;
      this.guideSightline.material.opacity += (targetOpacity - this.guideSightline.material.opacity) * Math.min(1, dt * 2.8);
      this.guideSightline.visible = this.reveal >= 0.24 && (!signalPlainCompleted || this.guideSightline.material.opacity > 0.006);
    }

    if (this.signalReturnFilament?.material && this.signalReturnPositions) {
      const returnCueActive = !signalPlainCompleted && signalDistance > 17.5;
      const signalWorld = this.entryAnchor.clone().add(signalEntry?.mesh?.position ?? new THREE.Vector3(-10.5, 3.8, -32.0));
      const toSignal = signalWorld.clone().sub(player);
      const length = Math.max(0.001, toSignal.length());
      const direction = toSignal.clone().normalize();
      const start = player.clone().addScaledVector(direction, 1.35);
      const end = signalWorld.clone().addScaledVector(direction, -2.1);
      const mid = start.clone().lerp(end, 0.52);
      mid.y += Math.sin((frameState.runtimeSeconds ?? 0) * 1.4) * 0.42;
      this.signalReturnPositions.set([
        start.x - this.entryAnchor.x, start.y - this.entryAnchor.y, start.z - this.entryAnchor.z,
        mid.x - this.entryAnchor.x, mid.y - this.entryAnchor.y, mid.z - this.entryAnchor.z,
        end.x - this.entryAnchor.x, end.y - this.entryAnchor.y, end.z - this.entryAnchor.z
      ]);
      this.signalReturnFilament.geometry.attributes.position.needsUpdate = true;
      const distanceUrgency = THREE.MathUtils.clamp((signalDistance - 17.5) / 18.0, 0, 1);
      const desiredOpacity = returnCueActive ? 0.08 + distanceUrgency * 0.14 : 0;
      this.signalReturnFilament.material.opacity +=
        (desiredOpacity - this.signalReturnFilament.material.opacity) * Math.min(1, dt * 4.2);
      this.signalReturnFilament.visible = this.signalReturnFilament.material.opacity > 0.008;
      this.signalReturnFilament.userData.distanceToSignalPlain = length;
    }

    const time = frameState.runtimeSeconds ?? 0;
    for (let i = 0; i < this.signalResponseMeshes.length; i += 1) {
      const fan = this.signalResponseMeshes[i];
      const breath = 1 + Math.sin(time * 0.72 - i * 0.42) * 0.045;
      fan.userData.baseScaleY ??= fan.scale.y;
      fan.scale.y = fan.userData.baseScaleY * breath;
      const signalBaseOpacity = (signalOrientationHeld ? 0.34 : 0.44) + Math.sin(time * 0.58 - i * 0.3) * 0.055;
      fan.material.opacity = signalPlainCompleted
        ? THREE.MathUtils.lerp(signalBaseOpacity, 0.16, continuationBlend)
        : signalBaseOpacity;
    }

    frameState.physicalFeel = frameState.physicalFeel ?? {};
    const expandedBoundsCenter = this.entryAnchor.clone().add(new THREE.Vector3(3.5, 0.8, -20.5));
    const activeBoundsCenter = signalPlainCompleted ? expandedBoundsCenter : this.boundsCenter;
    const activeBoundsRadii = signalPlainCompleted
      ? { x: 27.0, y: 10.0, z: 37.0 }
      : { x: 20.0, y: 8.0, z: 28.0 };
    frameState.physicalFeel.movementBounds = {
      mode: signalPlainCompleted ? "signal_plain_opened_deeper_field_ellipsoid" : "entry_anchored_ellipsoid",
      owner: "PlayerMovementController",
      tuningOwner: "ApertureFieldsArrivalSystem",
      regionId: "aperture_fields",
      center: { x: activeBoundsCenter.x, y: activeBoundsCenter.y, z: activeBoundsCenter.z },
      radii: activeBoundsRadii
    };

    frameState.apertureFieldsArrival = {
      pass: "HC-015N",
      active: true,
      regionId: "aperture_fields",
      stage: signalPlainCompleted ? "deeper_aperture_field_open" : this.reveal >= 0.78 ? "field_horizon_readable" : this.reveal >= 0.34 ? "shelf_expanding" : "arrival_decompression",
      reveal: this.reveal,
      fieldScaleMovement: true,
      fullEcologyMounted: false,
      ecologyGameplayReady: true,
      firstLocalEcologyMounted: true,
      firstLocalEcologyOwner: "SignalPlainEcologySystem",
      returnFoldDistance: returnDistance,
      returnFoldInteractionRange: 1.65,
      returnFoldReady: returnDistance <= 1.65,
      movementBoundsCenter: { x: activeBoundsCenter.x, y: activeBoundsCenter.y, z: activeBoundsCenter.z },
      movementBoundsRadii: activeBoundsRadii,
      landmarkCount: landmarkStates.length,
      landmarks: landmarkStates,
      scaleLock: "field_volume_not_chamber_strip",
      sightlineDepth: 56,
      cameraIntent: signalPlainCompleted ? "deeper_field_continuation_membrane_ridge_horizon" : "staged_field_decompression_then_signal_plain_orientation",
      cameraDistanceIntent,
      primaryLandmarkId: signalPlainCompleted ? "membrane_ridge_arc" : "signal_plain_beacon",
      environmentalCompositionLock: signalPlainCompleted ? "signal_plain_settled_membrane_ridge_horizon_primary" : "signal_plain_player_perception_hierarchy_world_first",
      primaryLandmarkDistance: Number.isFinite(signalPlainCompleted ? membraneDistance : signalDistance)
        ? (signalPlainCompleted ? membraneDistance : signalDistance)
        : null,
      primaryLandmarkApproachReadable: signalPlainCompleted ? membraneApproachReadable : signalApproachReadable,
      primaryLandmarkOrientationHeld: signalPlainCompleted ? membraneApproachReadable : signalOrientationHeld,
      signalPlainCompleted,
      continuationBlend,
      deeperFieldOpened: signalPlainCompleted,
      continuationLandmarkId: signalPlainCompleted ? "membrane_ridge_arc" : null,
      guideSightlineActive: Boolean(this.guideSightline?.visible),
      unfinishedSignalReturnCueActive: Boolean(this.signalReturnFilament?.visible),
      futureLandmarksSubduedUntilSignalComplete: !signalPlainCompleted,
      sceneRings: { immediate: "arrival_cradle_shelf_and_core", objective: "signal_plain_receptive_fan", worldMeaning: ["membrane_ridge_arc", "gathering_ground_cluster"] },
      nextAction: signalPlainCompleted
        ? (frameState.membraneRidgeGameplay?.completed
            ? "read_gathering_ground_beyond_membrane_ridge"
            : membraneApproachReadable ? "enter_membrane_ridge_living_contours" : "move_deeper_toward_membrane_ridge")
        : this.reveal < 0.34
          ? "move_out_of_the_comb_fold"
          : this.reveal < 0.62
            ? "cross_the_broad_arrival_shelf"
            : signalOrientationHeld
              ? "hold_signal_plain_orientation_and_read_the_deeper_field"
              : "follow_the_signal_plain_sightline"
    };
  }
}
