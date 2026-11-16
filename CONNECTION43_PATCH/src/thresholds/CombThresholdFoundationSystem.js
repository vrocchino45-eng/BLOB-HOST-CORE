import { resolveCoreFamilyColor } from "../visual/CoreVisualPalette.js";
import * as THREE from "three";

const RECIPE_ID = "COMB_THRESHOLD_FOUNDATION_HC013A";
const COMB_CELL_ID = "CELL_COMB_THRESHOLD_FILTER_001";

/**
 * HC-013A owns Comb Threshold presentation and bounded physical feel only.
 * LocalCellBoundaryMorphSystem owns entry and return. The authored Aperture-facing destination
 * remains unmounted, sealed, and non-crossable until a later pass.
 */
export class CombThresholdFoundationSystem {
  constructor({ recipeDataSystem, scene, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[CombThresholdFoundationSystem] recipeDataSystem is required.");
    if (!scene) throw new Error("[CombThresholdFoundationSystem] scene is required.");
    if (!playerRoot) throw new Error("[CombThresholdFoundationSystem] playerRoot is required.");
    if (!frameState) throw new Error("[CombThresholdFoundationSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.recipe = null;
    this.root = null;
    this.envelope = null;
    this.toothStations = [];
    this.filterLobes = [];
    this.tissueRibs = [];
    this.depthNodes = [];
    this.routeImprints = [];
    this.apertureSealRoot = null;
    this.apertureSealPetals = [];
    this.aperturePreviewMotes = [];
    this.returnFoldRoot = null;
    this.returnFoldLobes = [];
    this.materials = [];

    this.entryAnchor = new THREE.Vector3();
    this.boundsCenter = new THREE.Vector3();
    this.returnFoldPosition = new THREE.Vector3();
    this.apertureSealPosition = new THREE.Vector3();
    this.tempVector = new THREE.Vector3();
    this.previousPhysicalFeel = null;

    this.active = false;
    this.prepared = false;
    this.mountCount = 0;
    this.elapsed = 0;
    this.reveal = 0;
  }

  init() {
    this.recipe = this.recipeDataSystem.data.combThresholdFoundation;
    if (this.recipe?.id !== RECIPE_ID) {
      throw new Error(`[CombThresholdFoundationSystem] Missing ${RECIPE_ID}.`);
    }
    this.createAnatomy();
    this.setVisible(false);
    this.prepared = true;
    this.publish(this.frameState, false);
  }

  onRuntimePrepare(frameState) {
    this.setVisible(false);
    this.publish(frameState, false);
    return {
      status: "comb_threshold_foundation_prepared_hidden",
      rootCount: 1,
      toothStationCount: this.toothStations.length,
      apertureDestinationMounted: false,
      activeCellId: frameState.activeCellId,
      mutatesProgression: false
    };
  }

  onRuntimeMount(frameState) {
    this.active = true;
    this.mountCount += 1;
    this.elapsed = 0;
    this.reveal = 0;
    this.entryAnchor.copy(this.playerRoot.position);
    this.root.position.copy(this.entryAnchor);

    const boundsOffset = this.recipe.movementBounds?.centerOffset ?? [0, 0, -4.8];
    this.boundsCenter.copy(this.entryAnchor).add(this.tempVector.fromArray(boundsOffset));
    const returnOffset = this.recipe.returnFold?.position ?? [0, 0, 0.75];
    this.returnFoldPosition.copy(this.entryAnchor).add(this.tempVector.fromArray(returnOffset));
    const sealOffset = this.recipe.apertureDestinationContract?.sealPosition ?? [0, 0, -10.8];
    this.apertureSealPosition.copy(this.entryAnchor).add(this.tempVector.fromArray(sealOffset));

    this.previousPhysicalFeel = this.clonePhysicalFeel(frameState.physicalFeel);
    this.applyPhysicalFeel(frameState);
    this.setVisible(true);
    this.publish(frameState, true);
  }

  onRuntimeUnmount(frameState) {
    this.active = false;
    this.setVisible(false);
    if (this.previousPhysicalFeel) {
      frameState.physicalFeel = this.clonePhysicalFeel(this.previousPhysicalFeel);
    }
    this.previousPhysicalFeel = null;
    this.publish(frameState, false);
  }

  update(dt, frameState) {
    if (frameState.activeCellId !== COMB_CELL_ID) {
      if (this.active) this.onRuntimeUnmount(frameState);
      return;
    }
    if (!this.active) this.onRuntimeMount(frameState);

    this.elapsed += Math.max(0, dt);
    this.reveal = Math.min(1, this.reveal + Math.max(0, dt) / (this.recipe.activation?.revealSeconds ?? 1.45));
    this.applyPhysicalFeel(frameState);
    this.animate(dt, frameState);
    this.publish(frameState, true);
  }

  createAnatomy() {
    this.root = new THREE.Group();
    this.root.name = "comb_threshold_foundation_authority_HC013A";
    Object.assign(this.root.userData, {
      pass: this.frameState.buildManifest?.id ?? this.frameState.buildId ?? "HC-014B",
      regionId: "comb_threshold",
      gameplayOwner: "CombThresholdMode",
      presentationOwner: "CombThresholdFoundationSystem",
      transitionPrepared: true,
      targetingSuppressed: true,
      apertureFieldsMounted: false,
      apertureCrossable: false,
      genericRings: 0,
      triggerMarkers: 0
    });

    const visual = this.recipe.visual ?? {};
    const pathPoints = (this.recipe.anatomy?.pathPoints ?? [
      [0, 0, 0.4],
      [0.35, 0.18, -3.2],
      [-0.28, -0.14, -6.6],
      [0, 0.12, -10.8]
    ]).map((point) => new THREE.Vector3().fromArray(point));
    const pathCurve = new THREE.CatmullRomCurve3(pathPoints, false, "centripetal", 0.42);

    const envelopeMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: visual.envelopeColor ?? 0x2f5551,
      emissive: visual.envelopeEmissive ?? 0x17302f,
      emissiveIntensity: 0.16,
      roughness: 0.82,
      metalness: 0.02,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      side: THREE.DoubleSide
    }));
    this.envelope = new THREE.Mesh(
      new THREE.TubeGeometry(pathCurve, 112, this.recipe.anatomy?.envelopeRadius ?? 2.05, 14, false),
      envelopeMaterial
    );
    this.envelope.name = "comb_living_filter_envelope";
    this.envelope.userData.targetingSuppressed = true;
    this.root.add(this.envelope);

    const stationCount = this.recipe.anatomy?.toothStationCount ?? 12;
    const startZ = this.recipe.anatomy?.firstStationZ ?? -1.2;
    const spacing = this.recipe.anatomy?.stationSpacing ?? 0.72;
    for (let index = 0; index < stationCount; index += 1) {
      const station = new THREE.Group();
      station.name = `comb_filter_tooth_station_${index + 1}`;
      const authoredFinalStations = this.recipe.anatomy?.finalFilterStationZ ?? [];
      const finalPairStart = Math.max(0, stationCount - 2);
      const z = index >= finalPairStart && authoredFinalStations.length === 2
        ? authoredFinalStations[index - finalPairStart]
        : startZ - index * spacing;
      const phase = index * 0.58;
      const lateral = Math.sin(index * 0.9) * 0.22;
      const vertical = Math.cos(index * 0.72) * 0.12;
      station.position.set(lateral, vertical, z);
      station.rotation.z = (index % 2 === 0 ? -1 : 1) * (0.05 + index * 0.004);

      const toothColor = index % 2 === 0
        ? (visual.toothWarmColor ?? 0xe0bf7b)
        : (visual.toothCoolColor ?? 0x79a7a0);
      const toothMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: toothColor,
        emissive: toothColor,
        emissiveIntensity: 0.025,
        roughness: 0.68,
        metalness: 0.025,
        transparent: true,
        opacity: 0.9
      }));

      for (const side of [-1, 1]) {
        const tooth = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.16, 1.35 + (index % 3) * 0.13, 7, 12),
          toothMaterial
        );
        tooth.name = `comb_living_tooth_${index + 1}_${side < 0 ? "left" : "right"}`;
        tooth.position.set(side * (1.22 + (index % 2) * 0.1), side * 0.08, 0);
        tooth.rotation.set(0.08 * Math.sin(index), 0.16 * side, Math.PI * 0.5 + side * 0.12);
        tooth.scale.set(1, 0.92 + (index % 4) * 0.035, 1);
        tooth.userData.phase = phase + (side > 0 ? 0.35 : 0);
        tooth.userData.side = side;
        tooth.userData.basePosition = tooth.position.clone();
        tooth.userData.baseScale = tooth.scale.clone();
        tooth.userData.targetingSuppressed = true;
        station.add(tooth);
      }

      const channelMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: visual.channelColor ?? 0x99d3c5,
        emissive: visual.channelEmissive ?? 0x4f8b80,
        emissiveIntensity: 0.055,
        roughness: 0.44,
        transparent: true,
        opacity: 0.13,
        depthWrite: false
      }));
      const channel = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), channelMaterial);
      channel.name = `comb_filter_channel_body_${index + 1}`;
      channel.scale.set(1.45, 0.34, 1.0);
      channel.userData.phase = phase;
      channel.userData.baseScale = channel.scale.clone();
      channel.userData.targetingSuppressed = true;
      station.add(channel);

      this.root.add(station);
      this.toothStations.push(station);
    }

    const lobeCount = this.recipe.anatomy?.filterLobeCount ?? 6;
    for (let index = 0; index < lobeCount; index += 1) {
      const color = index % 3 === 0
        ? (resolveCoreFamilyColor("grave_memory_retention", visual.graveColor ?? 0xb9a0bd))
        : index % 3 === 1
          ? (resolveCoreFamilyColor("vascular_rhythm_retention", visual.vascularColor ?? 0x78e3ff))
          : (resolveCoreFamilyColor("silt_pressure_retention", visual.siltColor ?? 0xc99d55));
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.045,
        roughness: 0.58,
        transparent: true,
        opacity: 0.16,
        depthWrite: false
      }));
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.44, 14, 10), material);
      lobe.name = `comb_filter_memory_lobe_${index + 1}`;
      lobe.position.set(
        Math.sin(index * 1.37) * 0.74,
        Math.cos(index * 1.12) * 0.5,
        index === lobeCount - 1
          ? (this.recipe.anatomy?.finalFilterCenterZ ?? (-2.1 - index * 1.25))
          : (-2.1 - index * 1.25)
      );
      lobe.scale.set(1.55, 0.26, 0.9);
      lobe.rotation.z = index * 0.48;
      lobe.userData.phase = index * 0.7;
      lobe.userData.baseScale = lobe.scale.clone();
      lobe.userData.targetingSuppressed = true;
      this.root.add(lobe);
      this.filterLobes.push(lobe);
    }

    this.createContinuousTissue(visual);
    this.createRouteImprints(visual);
    this.createReturnFold(visual);
    this.createApertureSeal(visual);

    this.scene.add(this.root);
  }

  createContinuousTissue(visual) {
    const tissueMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: visual.tissueColor ?? 0x385e58,
      emissive: visual.tissueEmissive ?? 0x162d2b,
      emissiveIntensity: 0.07,
      roughness: 0.9,
      metalness: 0,
      transparent: true,
      opacity: 0.46,
      depthWrite: true
    }));
    const underMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: visual.underTissueColor ?? 0x223d3a,
      emissive: visual.tissueEmissive ?? 0x162d2b,
      emissiveIntensity: 0.045,
      roughness: 0.96,
      transparent: true,
      opacity: 0.7,
      depthWrite: true
    }));

    for (let index = 0; index < 13; index += 1) {
      const z = -0.75 - index * 0.78;
      const lateral = Math.sin(index * 0.72) * 0.18;
      const rib = new THREE.Mesh(new THREE.SphereGeometry(0.72, 14, 10), tissueMaterial);
      rib.name = `comb_continuous_tissue_rib_${index + 1}`;
      rib.position.set(lateral, -0.18 + Math.cos(index * 0.63) * 0.08, z);
      rib.scale.set(2.45, 0.42, 0.78);
      rib.rotation.z = Math.sin(index * 0.51) * 0.12;
      rib.userData.phase = index * 0.41;
      rib.userData.baseScale = rib.scale.clone();
      rib.userData.targetingSuppressed = true;
      this.root.add(rib);
      this.tissueRibs.push(rib);

      if (index % 2 === 0) {
        const depth = new THREE.Mesh(new THREE.SphereGeometry(0.52, 12, 8), underMaterial);
        depth.name = `comb_depth_tissue_${index + 1}`;
        depth.position.set((index % 4 < 2 ? -1 : 1) * 1.52, -0.55 + (index % 3) * 0.28, z - 0.22);
        depth.scale.set(1.55, 1.05, 1.75);
        depth.userData.phase = index * 0.55;
        depth.userData.baseScale = depth.scale.clone();
        depth.userData.targetingSuppressed = true;
        this.root.add(depth);
        this.depthNodes.push(depth);
      }
    }
  }

  createRouteImprints(visual) {
    const imprintDefinitions = [
      {
        id: "grave_memory",
        color: resolveCoreFamilyColor("grave_memory_retention", visual.graveColor ?? 0xb9a0bd),
        x: -0.72,
        y: 0.46,
        geometry: () => new THREE.OctahedronGeometry(0.12, 0)
      },
      {
        id: "vascular_rhythm",
        color: resolveCoreFamilyColor("vascular_rhythm_retention", visual.vascularColor ?? 0x78e3ff),
        x: 0,
        y: 0.72,
        geometry: () => new THREE.SphereGeometry(0.1, 10, 7)
      },
      {
        id: "silt_pressure",
        color: resolveCoreFamilyColor("silt_pressure_retention", visual.siltColor ?? 0xc99d55),
        x: 0.72,
        y: 0.34,
        geometry: () => new THREE.BoxGeometry(0.22, 0.08, 0.2)
      }
    ];

    for (const definition of imprintDefinitions) {
      const group = new THREE.Group();
      group.name = `comb_retained_${definition.id}_imprint`;
      for (let index = 0; index < 7; index += 1) {
        const material = this.trackMaterial(new THREE.MeshStandardMaterial({
          color: definition.color,
          emissive: definition.color,
          emissiveIntensity: 0.055,
          roughness: 0.48,
          transparent: true,
          opacity: 0.22
        }));
        const node = new THREE.Mesh(definition.geometry(), material);
        node.name = `comb_${definition.id}_node_${index + 1}`;
        node.position.set(
          definition.x + Math.sin(index * 1.1) * 0.16,
          definition.y + Math.cos(index * 0.83) * 0.18,
          -1.45 - index * 1.24
        );
        node.userData.phase = index * 0.62;
        node.userData.baseScale = node.scale.clone();
        node.userData.targetingSuppressed = true;
        group.add(node);
      }
      this.root.add(group);
      this.routeImprints.push(group);
    }
  }

  createReturnFold(visual) {
    this.returnFoldRoot = new THREE.Group();
    this.returnFoldRoot.name = "comb_threshold_return_fold_HC013A";
    this.returnFoldRoot.position.fromArray(this.recipe.returnFold?.position ?? [0, 0, 0.75]);
    Object.assign(this.returnFoldRoot.userData, {
      gateId: "comb_threshold_to_hub_chamber",
      transitionOwner: "LocalCellBoundaryMorphSystem",
      returnTo: "hub_chamber",
      targetingSuppressed: true,
      objectDefiningRing: false
    });

    for (let index = 0; index < 3; index += 1) {
      const color = index === 0
        ? (resolveCoreFamilyColor("grave_memory_retention", visual.graveColor ?? 0xb9a0bd))
        : index === 1
          ? (resolveCoreFamilyColor("vascular_rhythm_retention", visual.vascularColor ?? 0x78e3ff))
          : (resolveCoreFamilyColor("silt_pressure_retention", visual.siltColor ?? 0xc99d55));
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.22,
        roughness: 0.52,
        transparent: true,
        opacity: 0.62
      }));
      const lobe = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.62, 7, 12), material);
      lobe.name = `comb_return_fold_lobe_${index + 1}`;
      const angle = index * (Math.PI * 2 / 3);
      lobe.position.set(Math.cos(angle) * 0.34, Math.sin(angle) * 0.24, 0);
      lobe.rotation.z = angle + Math.PI * 0.5;
      lobe.userData.phase = index * 0.8;
      lobe.userData.baseScale = lobe.scale.clone();
      lobe.userData.targetingSuppressed = true;
      this.returnFoldRoot.add(lobe);
      this.returnFoldLobes.push(lobe);
    }
    this.root.add(this.returnFoldRoot);
  }

  createApertureSeal(visual) {
    this.apertureSealRoot = new THREE.Group();
    this.apertureSealRoot.name = "comb_aperture_facing_seal_HC013A";
    this.apertureSealRoot.position.fromArray(
      this.recipe.apertureDestinationContract?.sealPosition ?? [0, 0, -10.8]
    );
    Object.assign(this.apertureSealRoot.userData, {
      gateId: "comb_threshold_to_aperture_fields",
      destinationRegionId: "aperture_fields",
      destinationCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
      destinationMounted: false,
      crossable: false,
      sealIntact: true,
      targetingSuppressed: true,
      objectDefiningRing: false,
      triggerMarker: false
    });

    const petalCount = this.recipe.apertureDestinationContract?.sealPetalCount ?? 8;
    for (let index = 0; index < petalCount; index += 1) {
      const color = index % 2 === 0
        ? (visual.apertureSealColor ?? 0xc9f0d9)
        : (visual.toothWarmColor ?? 0xe0bf7b);
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.06,
        roughness: 0.62,
        transparent: true,
        opacity: 0.38,
        side: THREE.DoubleSide
      }));
      const petal = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 1.38, 7, 12), material);
      petal.name = `comb_aperture_seal_petal_${index + 1}`;
      const angle = index * (Math.PI * 2 / petalCount);
      petal.position.set(Math.cos(angle) * 0.78, Math.sin(angle) * 0.78, 0);
      petal.rotation.z = angle + Math.PI * 0.5;
      petal.scale.set(1, 1.0, 0.72);
      petal.userData.phase = index * 0.48;
      petal.userData.baseScale = petal.scale.clone();
      petal.userData.targetingSuppressed = true;
      this.apertureSealRoot.add(petal);
      this.apertureSealPetals.push(petal);
    }

    const previewColor = visual.aperturePreviewColor ?? 0x9fffd7;
    for (let index = 0; index < 9; index += 1) {
      const material = this.trackMaterial(new THREE.MeshBasicMaterial({
        color: previewColor,
        transparent: true,
        opacity: 0.07,
        depthWrite: false
      }));
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.055 + (index % 3) * 0.018, 8, 6), material);
      mote.name = `comb_aperture_unmounted_preview_mote_${index + 1}`;
      mote.position.set(
        Math.sin(index * 1.7) * (0.55 + (index % 2) * 0.3),
        Math.cos(index * 1.23) * 0.65,
        -1.15 - (index % 3) * 0.42
      );
      mote.userData.phase = index * 0.52;
      mote.userData.basePosition = mote.position.clone();
      mote.userData.targetingSuppressed = true;
      mote.userData.previewOnly = true;
      this.apertureSealRoot.add(mote);
      this.aperturePreviewMotes.push(mote);
    }

    this.root.add(this.apertureSealRoot);
  }

  animate(dt, frameState) {
    const t = frameState.runtimeSeconds ?? this.elapsed;
    const reveal = THREE.MathUtils.smoothstep(this.reveal, 0.02, 1);
    const playable = frameState.combThresholdPlayable ?? {};
    const completedBands = playable.completedBands ?? [];
    const activeBandIndex = playable.currentBandIndex ?? -1;
    const cadenceOpen = Boolean(playable.cadenceOpen);
    const apertureReveal = playable.apertureRevealProgress ?? 0;
    const membraneSettle = playable.membraneStabilizeProgress ?? 0;
    const membraneReady = Boolean(playable.membraneReady);
    const requiredReads = playable.requiredFilterReads ?? 6;
    const membraneAwake = Boolean((playable.successfulFilterReads ?? 0) >= requiredReads || playable.challengeComplete);
    if (this.apertureSealRoot) this.apertureSealRoot.visible = membraneAwake;

    if (this.envelope) {
      this.envelope.material.opacity = reveal * 0.055;
      this.envelope.material.emissiveIntensity = 0.035 + reveal * 0.035;
    }

    this.tissueRibs.forEach((rib, index) => {
      const breath = 0.985 + Math.sin(t * 0.72 + (rib.userData.phase ?? index)) * 0.025;
      rib.scale.copy(rib.userData.baseScale).multiplyScalar(breath);
      rib.material.opacity = reveal * 0.46;
      rib.material.emissiveIntensity = reveal * 0.065;
    });
    this.depthNodes.forEach((node, index) => {
      const breath = 0.98 + Math.sin(t * 0.48 + (node.userData.phase ?? index)) * 0.018;
      node.scale.copy(node.userData.baseScale).multiplyScalar(breath);
      node.material.opacity = reveal * 0.7;
    });

    this.toothStations.forEach((station, stationIndex) => {
      const bandIndex = Math.floor(stationIndex / 2);
      const bandComplete = Boolean(completedBands[bandIndex]);
      const bandActive = playable.active && bandIndex === activeBandIndex;
      const breath = 0.94 + Math.sin(t * 1.35 + stationIndex * 0.52) * 0.055;
      const authoredOpening = bandComplete ? 0.3 : bandActive && cadenceOpen ? 0.18 : 0;
      station.visible = reveal > stationIndex / Math.max(1, this.toothStations.length) * 0.72;
      station.children.forEach((child, childIndex) => {
        if (!child.material) return;
        const localPulse = 0.5 + 0.5 * Math.sin(t * (1.25 + childIndex * 0.08) + (child.userData.phase ?? 0));
        if (child.userData.baseScale) {
          child.scale.copy(child.userData.baseScale).multiplyScalar(0.96 + localPulse * 0.07 + Number(bandComplete) * 0.04);
        }
        if (child.userData.basePosition && Number.isFinite(child.userData.side)) {
          child.position.copy(child.userData.basePosition);
          child.position.x += child.userData.side * authoredOpening;
        }
        const channel = child.name.includes("channel");
        child.material.opacity = reveal * (channel
          ? (bandActive ? 0.22 + localPulse * 0.14 : bandComplete ? 0.13 : 0.075)
          : (bandActive ? 0.92 : bandComplete ? 0.68 : 0.36));
        child.material.emissiveIntensity = reveal * (
          bandActive
            ? 0.22 + localPulse * 0.32 + Number(cadenceOpen) * 0.42
            : bandComplete
              ? 0.095 + localPulse * 0.055
              : 0.025 + localPulse * 0.025
        );
      });
      station.scale.y = breath;
    });

    this.filterLobes.forEach((lobe, index) => {
      const bandComplete = Boolean(completedBands[index]);
      const bandActive = playable.active && index === activeBandIndex;
      const pulse = 0.72 + Math.sin(t * 1.6 + (lobe.userData.phase ?? index)) * 0.12;
      lobe.scale.copy(lobe.userData.baseScale).multiplyScalar(pulse + Number(bandComplete) * 0.12);
      lobe.material.opacity = reveal * (bandActive ? 0.52 : bandComplete ? 0.24 : 0.1);
      lobe.material.emissiveIntensity = reveal * (bandActive ? 0.48 + pulse * 0.18 : bandComplete ? 0.11 : 0.025);
    });

    this.routeImprints.forEach((group, groupIndex) => {
      group.children.forEach((node, index) => {
        const wave = 0.5 + 0.5 * Math.sin(t * (1.7 + groupIndex * 0.22) - index * 0.58);
        node.scale.copy(node.userData.baseScale).multiplyScalar(0.78 + wave * 0.48);
        node.material.opacity = reveal * (0.1 + wave * 0.16);
        node.material.emissiveIntensity = reveal * (0.035 + wave * 0.12);
      });
    });

    this.returnFoldLobes.forEach((lobe, index) => {
      const breath = 0.86 + Math.sin(t * 1.45 + index * 1.8) * 0.1;
      lobe.scale.copy(lobe.userData.baseScale).multiplyScalar(breath);
      lobe.material.emissiveIntensity = reveal * (0.18 + Math.max(0, breath - 0.82) * 1.3);
    });

    this.apertureSealPetals.forEach((petal, index) => {
      const restless = (1 - membraneSettle) * 0.035;
      const hold = 0.94 + Math.sin(t * (0.88 - membraneSettle * 0.48) + (petal.userData.phase ?? index)) * restless;
      const angle = index * (Math.PI * 2 / Math.max(1, this.apertureSealPetals.length));
      const dilation = apertureReveal * 0.78;
      petal.position.set(Math.cos(angle) * (0.78 + dilation), Math.sin(angle) * (0.78 + dilation), 0);
      petal.rotation.z = angle + Math.PI * 0.5 + apertureReveal * 0.38;
      petal.scale.copy(petal.userData.baseScale).multiplyScalar(hold * (1 - apertureReveal * 0.16));
      petal.material.opacity = reveal * (0.28 + index * 0.006 + apertureReveal * 0.22);
      petal.material.emissiveIntensity = reveal * (
        0.035 + Math.max(0, Math.sin(t * 1.05 - index * 0.42)) * 0.045 * (1 - membraneSettle) + membraneSettle * 0.34 + Number(membraneReady) * 0.38 + apertureReveal * 0.52
      );
    });

    this.aperturePreviewMotes.forEach((mote, index) => {
      const drift = Math.sin(t * 0.74 + (mote.userData.phase ?? index));
      const base = mote.userData.basePosition;
      if (base) {
        const expansion = 1 + apertureReveal * 0.8;
        mote.position.set(
          base.x * expansion + drift * (0.045 + apertureReveal * 0.08),
          base.y * expansion + Math.cos(t * 0.61 + index * 0.7) * (0.025 + apertureReveal * 0.05),
          base.z - apertureReveal * (0.35 + (index % 3) * 0.12)
        );
      }
      mote.material.opacity = reveal * (0.025 + Math.max(0, drift) * 0.045 + apertureReveal * 0.34);
    });
  }

  applyPhysicalFeel(frameState) {
    const feel = this.recipe.physicalFeel ?? {};
    const boundsRecipe = this.recipe.movementBounds ?? {};
    const filterReads = frameState.combThresholdPlayable?.successfulFilterReads ?? 0;
    const terminalAfterReads = boundsRecipe.terminalApproachAfterReads ?? 6;
    const terminalApproachActive = filterReads >= terminalAfterReads;
    const baseOffset = boundsRecipe.centerOffset ?? [0, 0, -4.8];
    const terminalOffset = boundsRecipe.terminalApproachCenterOffset ?? baseOffset;
    const chosenOffset = terminalApproachActive ? terminalOffset : baseOffset;
    const baseRadii = boundsRecipe.radii ?? [3.9, 3.1, 6.9];
    const terminalRadii = boundsRecipe.terminalApproachRadii ?? baseRadii;
    const radii = terminalApproachActive ? terminalRadii : baseRadii;
    const activeBoundsCenter = this.entryAnchor.clone().add(this.tempVector.fromArray(chosenOffset));
    this.boundsCenter.copy(activeBoundsCenter);
    const flow = feel.flowVector ?? [0, 0, -0.1];
    frameState.physicalFeel = {
      ...(frameState.physicalFeel ?? {}),
      viscosity: feel.viscosity ?? 0.48,
      pressure: feel.pressure ?? 0.64,
      flowVector: { x: flow[0] ?? 0, y: flow[1] ?? 0, z: flow[2] ?? 0 },
      boundaryBehavior: feel.boundaryBehavior ?? "comb_filter_soft_recoil",
      movementBounds: {
        active: true,
        mode: "entry_anchored_ellipsoid",
        center: { x: this.boundsCenter.x, y: this.boundsCenter.y, z: this.boundsCenter.z },
        radii: { x: radii[0], y: radii[1], z: radii[2] },
        owner: "PlayerMovementController",
        tuningOwner: "CombThresholdFoundationSystem",
        regionId: "comb_threshold",
        centerSource: terminalApproachActive
          ? "gate_preserved_entry_plus_terminal_aperture_approach_offset"
          : "gate_preserved_entry_plus_authored_comb_offset",
        terminalApproachActive,
        terminalApproachAfterReads: terminalAfterReads
      }
    };
  }

  publish(frameState, active) {
    const returnDistance = active
      ? this.playerRoot.position.distanceTo(this.returnFoldPosition)
      : Number.POSITIVE_INFINITY;
    const apertureDistance = active
      ? this.playerRoot.position.distanceTo(this.apertureSealPosition)
      : Number.POSITIVE_INFINITY;
    const returnRange = this.recipe?.returnFold?.interactionRange ?? 1.45;
    const aperture = this.recipe?.apertureDestinationContract ?? {};

    frameState.combThresholdFoundation = {
      pass: frameState.buildManifest?.id ?? frameState.buildId ?? "HC-014B",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      preparedHidden: this.prepared,
      mountCount: this.mountCount,
      regionId: "comb_threshold",
      runtimeCellId: COMB_CELL_ID,
      status: active
        ? this.reveal >= 1
          ? "comb_threshold_foundation_readable"
          : "comb_threshold_foundation_revealing"
        : "comb_threshold_foundation_inactive",
      progress: active ? this.reveal : 0,
      reveal: active ? this.reveal : 0,
      gameplayOwner: "CombThresholdMode",
      presentationOwner: "CombThresholdFoundationSystem",
      movementOwner: "PlayerMovementController",
      crossingOwner: "LocalCellBoundaryMorphSystem",
      cameraOwner: "GameRuntimeCameraRig[camera_comb_threshold_filter]",
      sourceAuthority: "HOST_CORE_Blueprint_v1_reference_docs.zip",
      entryGateId: "hub_to_comb_threshold",
      returnGateId: "comb_threshold_to_hub_chamber",
      entryPosition: active ? { x: this.entryAnchor.x, y: this.entryAnchor.y, z: this.entryAnchor.z } : null,
      movementBoundsCenter: active ? { x: this.boundsCenter.x, y: this.boundsCenter.y, z: this.boundsCenter.z } : null,
      terminalApproachActive: Boolean(active && (frameState.combThresholdPlayable?.successfulFilterReads ?? 0) >= (this.recipe?.movementBounds?.terminalApproachAfterReads ?? 6)),
      terminalApproachAfterReads: this.recipe?.movementBounds?.terminalApproachAfterReads ?? 6,
      toothStationCount: this.toothStations.length,
      livingToothCount: this.toothStations.length * 2,
      filterLobeCount: this.filterLobes.length,
      continuousTissueRibCount: this.tissueRibs.length,
      depthTissueNodeCount: this.depthNodes.length,
      visualHierarchy: "dormant_recedes_active_dominates_completed_settles_synthesis_reveals",
      retainedRouteImprintCount: this.routeImprints.length,
      retainedRouteImprintFamilyCount: this.routeImprints.length,
      retainedRouteImprints: ["grave_memory", "vascular_rhythm", "silt_pressure"],
      routeConsequencesPreserved: true,
      returnFoldReady: Boolean(active && returnDistance <= returnRange),
      returnFoldDistance: returnDistance,
      returnFoldInteractionRange: returnRange,
      apertureSealPosition: active ? { x: this.apertureSealPosition.x, y: this.apertureSealPosition.y, z: this.apertureSealPosition.z } : null,
      apertureSealLocalPosition: active ? {
        x: this.apertureSealPosition.x - this.entryAnchor.x,
        y: this.apertureSealPosition.y - this.entryAnchor.y,
        z: this.apertureSealPosition.z - this.entryAnchor.z
      } : null,
      apertureSealDistance: apertureDistance,
      apertureSealInteractionRange: aperture.sealReadRange ?? 2.0,
      apertureSealReadRange: aperture.sealReadRange ?? 2.0,
      apertureSealReadable: Boolean(active && this.reveal >= 0.72),
      apertureSealIntact: !Boolean(frameState.combThresholdPlayable?.challengeComplete),
      apertureViewOpened: Boolean(frameState.combThresholdPlayable?.apertureRevealWitnessed),
      apertureRevealProgress: frameState.combThresholdPlayable?.apertureRevealProgress ?? 0,
      apertureDestinationMounted: Boolean(this.recipeDataSystem.data.firstSliceRuntimeProfile?.regions?.aperture_fields),
      apertureGameplayReady: Boolean(this.recipeDataSystem.data.firstSliceRuntimeProfile?.regions?.aperture_fields?.gameplayReady),
      apertureCrossable: Boolean(this.recipeDataSystem.data.firstSliceRuntimeProfile?.regions?.aperture_fields && frameState.combThresholdPlayable?.challengeComplete),
      apertureDestinationContract: {
        authored: true,
        regionId: aperture.destinationRegionId ?? "aperture_fields",
        runtimeCellId: aperture.destinationCellId ?? "CELL_APERTURE_FIELDS_ARRIVAL_001",
        gateId: "comb_threshold_to_aperture_fields",
        destinationMounted: Boolean(this.recipeDataSystem.data.firstSliceRuntimeProfile?.regions?.aperture_fields),
        gameplayReady: Boolean(this.recipeDataSystem.data.firstSliceRuntimeProfile?.regions?.aperture_fields?.gameplayReady),
        crossable: Boolean(this.recipeDataSystem.data.firstSliceRuntimeProfile?.regions?.aperture_fields && frameState.combThresholdPlayable?.challengeComplete),
        previewOnly: false,
        ecologyMounted: false
      },
      objectiveLine: frameState.combThresholdPlayable?.objectiveLine
        ?? (apertureDistance <= (aperture.sealReadRange ?? 2.0)
          ? "The first field is visible through the filter, but the Aperture destination remains unmounted."
          : returnDistance <= returnRange
            ? "Move back through the resolved return fold when you want to return to the Hub."
            : "Follow the repeated teeth toward the Aperture-facing membrane."),
      guideLine: frameState.combThresholdPlayable?.guideLine
        ?? "Memory, rhythm, and pressure are carried into one living filter without becoming a new ability.",
      nextAction: frameState.combThresholdPlayable?.nextAction
        ?? (apertureDistance <= (aperture.sealReadRange ?? 2.0)
          ? "Read the field-facing membrane, then return through the entry fold."
          : "Move through the Comb anatomy and observe how the three retained readings shape the same filter."),
      newAbilityUnlocks: 0,
      newEntities: 0,
      combat: false,
      directObjectiveMutation: false,
      directGateMutation: false,
      directActiveCellMutation: false,
      forcedPlayerRelocation: false,
      apertureFieldsImplemented: false,
      genericRings: 0,
      triggerMarkers: 0
    };
  }

  clonePhysicalFeel(source) {
    if (!source) return null;
    return {
      ...source,
      flowVector: source.flowVector ? { ...source.flowVector } : undefined,
      movementBounds: source.movementBounds ? {
        ...source.movementBounds,
        center: source.movementBounds.center ? { ...source.movementBounds.center } : undefined,
        radii: source.movementBounds.radii ? { ...source.movementBounds.radii } : undefined
      } : undefined
    };
  }

  trackMaterial(material) {
    this.materials.push(material);
    return material;
  }

  setVisible(visible) {
    if (this.root) this.root.visible = Boolean(visible);
  }
}
