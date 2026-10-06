import * as THREE from "three";

const RECIPE_ID = "HUB_CHAMBER_PRESENTATION_LOCK_HC006JA";
const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const SURFACE_CELL_ID = "CELL_MEMBRANE_NURSERY_001";
const SURFACE_LIVING_STATES = new Set(["cautious", "blooming", "withered", "panic", "embrace", "growth"]);

const NON_HUB_ENVIRONMENT_ROOTS = [
  "membrane_pocket_surface_001",
  "nursery_soft_pressure_fog_001",
  "scar_flow_fold_surface_001",
  "scar_pressure_haze_001",
  "signal_chorus_nerve_surface_001",
  "signal_chorus_soft_haze_001",
  "surface_wake_visual_embodiment_HC008C",
  "surface_wake_layered_interaction_HC006E",
  "surface_wake_living_nursery_circuit_HC009C",
  "guide_threshold_gameplay_fill_HC007B",
  "guide_threshold_layered_interaction_HC006F"
];

const TRANSITION_VISUAL_ARTIFACTS = [
  "morph_readiness_world_cue_ring",
  "morph_progress_inner_cue_ring",
  "scar_flow_arrival_active_cell_ring",
  "scar_flow_arrival_focus_line",
  "scar_flow_hook_nearest_ring",
  "scar_flow_hook_relation_line",
  "scar_flow_interaction_stage_ring",
  "scar_flow_interaction_stage_line",
  "second_morph_signal_readiness_ring",
  "second_morph_signal_progress_ring",
  "target_lock_reticle",
  "selected_object_readability_halo",
  "target_lock_pointer_line",
  "guide_path_shimmer_line"
];

const LEGACY_HUB_VISUALS = [
  "signal_chorus_layered_interaction_HC006B",
  "signal_chorus_combward_pressure_HC005D",
  "signal_chorus_living_tissue_identity_HC006A",
  "signal_chorus_arrival_active_cell_ring",
  "signal_chorus_answer_ring",
  "signal_chorus_arrival_focus_line",
  "signal_chorus_loop_focus_ring",
  "signal_chorus_loop_answer_ring",
  "signal_chorus_bridge_warmth_ring",
  "signal_chorus_loop_focus_line",
  "choir_resonance_node_001",
  "listening_pore_membrane_001",
  "harmonic_wave_thread_001",
  "seed_signal_bridge_001",
  "membrane_watcher_001",
  "guide_path_shimmer_line",
  "signal_chorus_nerve_surface_001",
  "signal_chorus_soft_haze_001",
  "signal_chorus_nerve_pocket_surface",
  "signal_chorus_soft_haze"
];

const ROUTE_BANDS = {
  vascular_route: "upper",
  grave_memory_route: "middle",
  silt_burrow_route: "lower"
};

/**
 * HubChamberFoundationSystem is the sole Hub presentation owner.
 *
 * HC-008G removes the remaining diagram-like overlap by making the older Signal
 * Chorus visuals durable state only. Hub investigation continues to own route
 * readings, ObjectiveSystem owns completion, LocalCellBoundaryMorphSystem owns availability, and
 * the existing morph adapters retain transitions.
 */
export class HubChamberFoundationSystem {
  constructor({ recipeDataSystem, scene, camera = null, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[HubChamberFoundationSystem] recipeDataSystem is required.");
    if (!scene) throw new Error("[HubChamberFoundationSystem] scene is required.");
    if (!playerRoot) throw new Error("[HubChamberFoundationSystem] playerRoot is required.");
    if (!frameState) throw new Error("[HubChamberFoundationSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.scene = scene;
    this.camera = camera;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.recipe = null;
    this.root = null;
    this.anchor = null;
    this.anchorBasin = null;
    this.anchorPetals = [];
    this.comparisonLeaves = new Map();
    this.graveMemoryEchoRoot = null;
    this.graveMemoryEchoPearls = [];
    this.graveMemoryEchoTissue = [];
    this.vascularReturnEchoRoot = null;
    this.vascularReturnEchoFilaments = [];
    this.vascularReturnEchoCurves = [];
    this.vascularReturnEchoValves = [];
    this.vascularReturnEchoCharge = null;
    this.siltReturnEchoRoot = null;
    this.siltReturnEchoPlates = [];
    this.siltReturnEchoPorousNode = null;
    this.siltReturnEchoResidueNodes = [];
    this.threeRouteConvergenceRoot = null;
    this.threeRouteConvergenceTendrils = [];
    this.threeRouteConvergenceCore = null;
    this.combwardBodyRoot = null;
    this.combwardRibs = [];
    this.routeVisuals = [];
    this.memoryFragment = null;
    this.memoryTail = [];
    this.depthBodies = [];
    this.driftMotes = [];
    this.territoryLandmarks = [];
    this.playerTrail = [];
    this.playerTrailDirection = new THREE.Vector3(0, 0, 1);
    this.tempDirection = new THREE.Vector3();
    this.worldForward = new THREE.Vector3(0, 0, 1);
    this.active = false;
    this.reveal = 0;
    this.routeIdentityReveal = 0;
    this.growthEcho = 0;
    this.growthEchoColor = new THREE.Color(0xb8e9e2);
    this.balancedGrowthColor = new THREE.Color(0xb8e9e2);
    this.careGrowthColor = new THREE.Color(0x8ff0c5);
    this.scarGrowthColor = new THREE.Color(0xe89268);
    this.livingStateEchoColor = new THREE.Color(0xb8e9e2);
    this.livingStateBloomColor = new THREE.Color(0xa7efad);
    this.livingStateWitherColor = new THREE.Color(0x8f796f);
    this.livingStatePanicColor = new THREE.Color(0xf29a70);
    this.livingStateEmbraceColor = new THREE.Color(0x79dcc7);
    this.livingStateGrowthColor = new THREE.Color(0xc2e78b);
    this.inheritedLivingState = "cautious";
    this.inheritedLivingStateSequence = 0;
    this.inheritedLivingStateAge = 0;
    this.inheritedLivingQualities = { vitality: 0.72, trust: 0.5, stress: 0.3, growthMemory: 0 };
    this.graveMemoryColor = new THREE.Color(0xb9a0bd);
    this.vascularSignalColor = new THREE.Color(0x78e3ff);
    this.vascularReturnColor = new THREE.Color(0xffc96d);
    this.siltColor = new THREE.Color(0x57442f);
    this.siltDeepColor = new THREE.Color(0x251d1b);
    this.siltPorousColor = new THREE.Color(0xd29b6b);
    this.siltReturnColor = new THREE.Color(0xc99d55);
    this.lastActiveCell = "none";
    this.spatialTruth = this.createEmptySpatialTruth();
    this.suppressedRootNames = [];
    this.suppressedVisibility = new Map();
    this.visibleLeakNames = [];
    this.distantHostRoot = null;
    this.distantHostMode = "default_world_meaning";
    this.screenTruthLatched = false;
    this.screenTruthStableFrames = 0;
    this.consequenceLayoutTruth = this.createEmptyConsequenceLayoutTruth();

    // HC-031W2A3: expensive scene-graph enforcement and spatial proof are cached.
    // Hub animation/state still update every frame; these read-only verification passes
    // refresh on a short cadence and on every Hub entry.
    this.sceneObjectCache = new Map();
    this.sceneGraphRefreshAge = Number.POSITIVE_INFINITY;
    this.sceneGraphRefreshIntervalSeconds = 0.25;
    this.spatialReadabilityRefreshAge = Number.POSITIVE_INFINITY;
    this.spatialReadabilityRefreshIntervalSeconds = 0.12;
    this.lastSceneGraphRefreshFrame = 0;
    this.lastSpatialReadabilityRefreshFrame = 0;

    // HC026A1 micro→macro spatial mirror readability refinement. Hub route topology
    // remains fixed; retained consequence anatomy now exaggerates radial zone depth
    // at environmental scale while exact XYZ telemetry becomes a secondary bend.
    this.coreSpatialMirror = this.createEmptyCoreSpatialMirrorState();
    this.coreMirrorAnchor = new THREE.Vector3();
    this.coreMirrorBaseDirection = new THREE.Vector3();
    this.coreMirrorTelemetryDirection = new THREE.Vector3();
    this.coreMirrorTargetDirection = new THREE.Vector3();
    this.coreMirrorTargetPosition = new THREE.Vector3();
    this.coreMirrorCurrentPosition = new THREE.Vector3();
    this.coreMirrorDeepWeight = 0;
    this.coreMirrorInnerWeight = 0;
    this.coreMirrorMembraneWeight = 0;
    this.coreMirrorBalanceWeight = 0;
  }

  init() {
    this.recipe = this.recipeDataSystem.get("hubChamberFoundationRecipes", RECIPE_ID);
    this.createVisuals();
    this.setVisible(false);
    this.frameState.hubChamberFoundation = this.createState(false);
    this.frameState.hubRenderTruth = this.createRenderTruthState(false);
    this.frameState.hubCoreSpatialMirror = this.createEmptyCoreSpatialMirrorState();
  }

  update(dt, frameState) {
    const active = frameState.activeCellId === (this.recipe.sourceCellId ?? HUB_CELL_ID);

    if (!active) {
      const wasActive = this.active;
      this.active = false;
      this.reveal = 0;
      this.routeIdentityReveal = 0;
      this.screenTruthLatched = false;
      this.screenTruthStableFrames = 0;
      this.setVisible(false);
      if (wasActive || this.suppressedVisibility.size > 0) this.restoreNonHubVisuals(frameState);
      if (frameState.interactionInspectionFocus?.providerId === "HubChamberFoundationSystem") {
        frameState.interactionInspectionFocus = this.createInspectionFocus(false);
      }
      this.spatialTruth = this.createEmptySpatialTruth();
      this.consequenceLayoutTruth = this.createEmptyConsequenceLayoutTruth();
      this.coreSpatialMirror = this.createEmptyCoreSpatialMirrorState();
      frameState.hubCoreSpatialMirror = this.coreSpatialMirror;
      frameState.hubRenderTruth = this.createRenderTruthState(false);
      frameState.hubFoundationPerformance = {
        pass: "HC-031W2A3", active: false,
        sceneGraphRefreshIntervalSeconds: this.sceneGraphRefreshIntervalSeconds,
        spatialReadabilityRefreshIntervalSeconds: this.spatialReadabilityRefreshIntervalSeconds,
        cachedSceneRootCount: this.sceneObjectCache.size
      };
      frameState.hubChamberFoundation = this.createState(false);
      this.lastActiveCell = frameState.activeCellId ?? "none";
      return;
    }

    if (!this.active) {
      this.active = true;
      this.reveal = 0;
      this.routeIdentityReveal = 0;
      this.screenTruthLatched = false;
      this.screenTruthStableFrames = 0;
      this.sceneGraphRefreshAge = Number.POSITIVE_INFINITY;
      this.spatialReadabilityRefreshAge = Number.POSITIVE_INFINITY;
    }

    const revealSeconds = Math.max(0.6, this.recipe.activation?.revealSeconds ?? 2.2);
    this.reveal = Math.min(1, this.reveal + dt / revealSeconds);

    const layered = frameState.signalChorusLayeredInteraction ?? {};
    const layeredComplete = Boolean(layered.completed || layered.stage === "layered_interaction_complete");
    const firstHubRouteIdentityReady = frameState.activeCellId === (this.recipe.sourceCellId ?? HUB_CELL_ID);
    const routeIdentityReady = Boolean(firstHubRouteIdentityReady || layeredComplete);
    const identityTarget = routeIdentityReady ? 1 : 0.28;
    this.routeIdentityReveal = THREE.MathUtils.damp(this.routeIdentityReveal, identityTarget, 3.2, dt);

    this.setVisible(true);

    this.sceneGraphRefreshAge += Math.max(0, dt);
    const sceneGraphRefreshDue = !Number.isFinite(this.sceneGraphRefreshAge)
      || this.sceneGraphRefreshAge >= this.sceneGraphRefreshIntervalSeconds;
    if (sceneGraphRefreshDue) {
      this.enforceHubSceneGraph(frameState);
      this.sceneGraphRefreshAge = 0;
      this.lastSceneGraphRefreshFrame = frameState.frame ?? 0;
    } else {
      this.publishHubTargetLifecycle(frameState);
    }

    this.updateInheritedLivingState(frameState);
    this.animate(dt, frameState.runtimeSeconds ?? 0, routeIdentityReady, frameState);
    this.updateCoreSpatialMirror(frameState, dt, frameState.runtimeSeconds ?? 0);

    this.spatialReadabilityRefreshAge += Math.max(0, dt);
    const spatialReadabilityRefreshDue = !Number.isFinite(this.spatialReadabilityRefreshAge)
      || this.spatialReadabilityRefreshAge >= this.spatialReadabilityRefreshIntervalSeconds;
    if (spatialReadabilityRefreshDue) {
      this.spatialTruth = this.evaluateSpatialReadability(frameState);
      this.spatialReadabilityRefreshAge = 0;
      this.lastSpatialReadabilityRefreshFrame = frameState.frame ?? 0;
    }

    frameState.hubFoundationPerformance = {
      pass: "HC-031W2A3",
      active: true,
      sceneGraphRefreshedThisFrame: sceneGraphRefreshDue,
      spatialReadabilityRefreshedThisFrame: spatialReadabilityRefreshDue,
      sceneGraphRefreshIntervalSeconds: this.sceneGraphRefreshIntervalSeconds,
      spatialReadabilityRefreshIntervalSeconds: this.spatialReadabilityRefreshIntervalSeconds,
      lastSceneGraphRefreshFrame: this.lastSceneGraphRefreshFrame,
      lastSpatialReadabilityRefreshFrame: this.lastSpatialReadabilityRefreshFrame,
      cachedSceneRootCount: this.sceneObjectCache.size,
      fullSceneMatrixUpdateAvoided: true
    };
    frameState.hubRenderTruth = this.createRenderTruthState(true);
    this.applyHubPresentationAuthority(frameState, routeIdentityReady);

    frameState.interactionInspectionFocus = this.createInspectionFocus(true);
    this.publishPromptState(frameState);
    frameState.hubChamberFoundation = this.createState(true, routeIdentityReady);
    this.lastActiveCell = frameState.activeCellId ?? "none";
  }

  onRuntimeUnmount(frameState) {
    this.active = false;
    this.reveal = 0;
    this.routeIdentityReveal = 0;
    this.screenTruthLatched = false;
    this.screenTruthStableFrames = 0;
    this.setVisible(false);
    this.restoreNonHubVisuals(frameState);
    this.spatialTruth = this.createEmptySpatialTruth();
    this.consequenceLayoutTruth = this.createEmptyConsequenceLayoutTruth();
    frameState.hubRenderTruth = this.createRenderTruthState(false);
    frameState.hubChamberFoundation = this.createState(false);
    frameState.hubPresentationOwnership = {
      ...(frameState.hubPresentationOwnership ?? {}),
      pass: "HC-010G",
      active: false,
      owner: "none",
      promptOwner: "none",
      releasedBy: "HubChamberFoundationSystem.onRuntimeUnmount",
      releasedAtFrame: frameState.frame ?? 0
    };
    frameState.hubReadability = {
      ...(frameState.hubReadability ?? {}),
      pass: "HC-010G",
      active: false,
      screenTruthLatched: false
    };
    if (frameState.promptStack?.activePresentationOwner === "HubChamberFoundationSystem") {
      frameState.promptStack = {
        ...frameState.promptStack,
        hubChamberPresentationLock: "inactive_region_released",
        activePresentationOwner: "none",
        regionPromptLifecycle: "awaiting_active_region_republish"
      };
    }
  }

  createVisuals() {
    const junction = this.recipe.junction ?? {};
    const visual = this.recipe.visual ?? {};
    const position = this.vector(junction.position);

    this.root = new THREE.Group();
    this.root.name = "hub_chamber_spatial_authority_HC008G";
    Object.assign(this.root.userData, {
      system: "HubChamberFoundationSystem",
      regionId: "hub_chamber",
      modeOwner: "HubMode",
      authoredBy: "HubChamberFoundationRegistry",
      spatialAuthorityPass: "HC-008G",
      soleVisualOwner: true,
      targetingSuppressed: true,
      routeReadabilityOnly: true,
      noTeleport: true,
      noForcedRelocation: true
    });
    this.scene.add(this.root);

    this.createDepthArchitecture(position, visual);
    this.createCentralCradle(position, junction, visual);

    for (const route of this.recipe.routes ?? []) {
      this.routeVisuals.push(this.createRouteVisual(position, route));
    }

    this.createGraveMemoryEcho();
    this.createVascularReturnEcho();
    this.createSiltReturnEcho();
    this.createThreeRouteConvergenceVisuals();
    this.createMemoryFragment();
    this.createPlayerTrail();
  }

  createDepthArchitecture(center, visual) {
    const backgroundColor = visual.backgroundTissueColor ?? 0x183142;
    const foregroundColor = visual.foregroundTissueColor ?? 0x315768;
    const backgroundMaterial = this.createTissueMaterial(backgroundColor, {
      emissiveIntensity: 0.015,
      opacity: visual.backgroundTissueOpacity ?? 0.17,
      roughness: 0.88
    });
    const foregroundMaterial = this.createTissueMaterial(foregroundColor, {
      emissiveIntensity: 0.025,
      opacity: visual.foregroundTissueOpacity ?? 0.2,
      roughness: 0.76
    });

    const backgroundLayout = [
      [-4.7, 2.35, -4.65, 1.5, 1.2, 0.42],
      [-2.2, -2.35, -4.85, 1.85, 1.0, 0.36],
      [0.1, 2.85, -5.0, 1.7, 0.92, 0.34],
      [2.4, -2.5, -4.8, 1.8, 1.05, 0.38],
      [4.8, 2.0, -4.6, 1.45, 1.22, 0.4]
    ];

    backgroundLayout.forEach((values, index) => {
      const [x, y, z, sx, sy, sz] = values;
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(1.05, 18, 12), backgroundMaterial.clone());
      lobe.name = `hub_background_membrane_lobe_${index + 1}`;
      lobe.position.set(x, y, z);
      lobe.scale.set(sx, sy, sz);
      lobe.rotation.set(index * 0.12, index * 0.48, -0.18 + index * 0.09);
      Object.assign(lobe.userData, {
        depthLayer: "background",
        targetingSuppressed: true,
        inspectionFadeable: false,
        phase: index * 0.73
      });
      this.root.add(lobe);
      this.depthBodies.push(lobe);
    });

    const foregroundLayout = [
      [-5.35, -1.95, 0.4, -0.32],
      [-5.05, 1.75, -0.15, 0.28],
      [5.25, -1.7, 0.1, 0.3],
      [5.15, 1.9, 0.45, -0.26]
    ];
    foregroundLayout.forEach((values, index) => {
      const [x, y, z, tilt] = values;
      const rib = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18 + (index % 2) * 0.035, 2.4, 6, 12),
        foregroundMaterial.clone()
      );
      rib.name = `hub_foreground_frame_rib_${index + 1}`;
      rib.position.set(x, y, z);
      rib.rotation.set(0.18 * (index % 2), 0.2 * index, tilt);
      rib.scale.set(1.0, 1.35, 0.82);
      Object.assign(rib.userData, {
        depthLayer: "foreground",
        targetingSuppressed: true,
        inspectionFadeable: true,
        phase: index * 0.91
      });
      this.root.add(rib);
      this.depthBodies.push(rib);
    });

    const moteColors = [0x83d8e8, 0xffd19b, 0x8fb6c4];
    for (let index = 0; index < 18; index += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: moteColors[index % moteColors.length],
        transparent: true,
        opacity: 0.08 + (index % 3) * 0.025,
        depthWrite: true
      });
      const mote = new THREE.Mesh(
        new THREE.SphereGeometry(0.025 + (index % 2) * 0.012, 7, 5),
        material
      );
      const x = -4.8 + ((index * 1.73) % 9.6);
      const y = -3.0 + ((index * 1.17) % 6.0);
      const z = -4.1 + ((index * 0.83) % 5.0);
      mote.name = `hub_volumetric_drift_mote_${index + 1}`;
      mote.position.set(x, y, z);
      Object.assign(mote.userData, {
        depthLayer: index % 3 === 0 ? "foreground" : index % 3 === 1 ? "middle" : "background",
        baseY: y,
        driftRange: 0.18 + (index % 4) * 0.07,
        driftSpeed: 0.34 + (index % 5) * 0.08,
        phase: index * 0.69,
        targetingSuppressed: true,
        inspectionFadeable: index % 3 === 0
      });
      this.root.add(mote);
      this.driftMotes.push(mote);
    }

    this.root.userData.depthLayerCount = 3;
    this.root.userData.depthLayers = ["foreground", "middle", "background"];
    this.root.userData.center = { x: center.x, y: center.y, z: center.z };
  }

  createCentralCradle(position, junction, visual) {
    this.anchor = new THREE.Group();
    this.anchor.name = "hub_junction_anchor_001";
    this.anchor.position.copy(position);
    Object.assign(this.anchor.userData, {
      targetingSuppressed: true,
      hubAnchor: true,
      spatialRole: "route_comparison_cradle",
      bodyLed: true,
      inspectionFadeable: false
    });
    this.root.add(this.anchor);

    const basinMaterial = this.createTissueMaterial(visual.junctionColor ?? 0xaddbe6, {
      emissive: visual.junctionColor ?? 0xaddbe6,
      emissiveIntensity: 0.08,
      opacity: 0,
      roughness: 0.64
    });
    this.anchorBasin = new THREE.Mesh(
      new THREE.CylinderGeometry(junction.radius ?? 1.05, (junction.radius ?? 1.05) * 1.14, 0.16, 9),
      basinMaterial
    );
    this.anchorBasin.name = "hub_route_comparison_basin";
    this.anchorBasin.position.y = -0.52;
    this.anchorBasin.scale.set(1.08, 1, 0.8);
    this.anchorBasin.userData.targetingSuppressed = true;
    this.anchorBasin.userData.baseColor = basinMaterial.color.clone();
    this.anchorBasin.userData.baseEmissive = basinMaterial.emissive.clone();
    this.anchorBasin.userData.baseScale = this.anchorBasin.scale.clone();
    this.anchor.add(this.anchorBasin);

    const cradleLobes = [
      { position: [-0.46, -0.18, 0.12], rotation: [0.18, -0.72, 0.42], scale: [0.9, 0.34, 1.22] },
      { position: [0.08, -0.28, -0.2], rotation: [-0.08, 0.08, -0.12], scale: [1.02, 0.38, 1.38] },
      { position: [0.5, -0.12, 0.1], rotation: [0.16, 0.76, -0.38], scale: [0.88, 0.32, 1.18] }
    ];
    cradleLobes.forEach((layout, index) => {
      const color = index % 2 === 0
        ? (visual.junctionColor ?? 0xaddbe6)
        : (visual.junctionMemoryColor ?? 0xffd9a0);
      const material = this.createTissueMaterial(color, {
        emissive: color,
        emissiveIntensity: 0.035,
        opacity: 0,
        roughness: 0.72
      });
      const petal = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.72, 6, 12), material);
      petal.name = `hub_center_root_lobe_${index + 1}`;
      petal.position.set(...layout.position);
      petal.scale.set(...layout.scale);
      petal.rotation.set(...layout.rotation);
      Object.assign(petal.userData, {
        phase: index * 0.72,
        baseScale: petal.scale.clone(),
        basePosition: petal.position.clone(),
        baseColor: material.color.clone(),
        baseEmissive: material.emissive.clone(),
        targetingSuppressed: true,
        depthLayer: "middle"
      });
      this.anchor.add(petal);
      this.anchorPetals.push(petal);
    });

    const routeColors = Object.fromEntries(
      (this.recipe.routes ?? []).map((route) => [route.id, route.color ?? 0xffffff])
    );
    const leafOrder = ["vascular_route", "grave_memory_route", "silt_burrow_route"];
    leafOrder.forEach((routeId, index) => {
      const angle = -Math.PI * 0.75 + index * Math.PI * 0.75;
      const color = routeColors[routeId] ?? 0xffffff;
      const material = this.createTissueMaterial(color, {
        emissive: color,
        emissiveIntensity: 0.02,
        opacity: 0,
        roughness: 0.42
      });
      const leaf = new THREE.Mesh(new THREE.TetrahedronGeometry(0.14, 0), material);
      leaf.name = `hub_comparison_leaf_${routeId}`;
      leaf.position.set(Math.cos(angle) * 0.52, -0.35, Math.sin(angle) * 0.42);
      leaf.scale.set(1.25, 0.52, 1.7);
      leaf.rotation.set(0.36, angle, 0.18);
      leaf.userData.routeId = routeId;
      leaf.userData.targetingSuppressed = true;
      leaf.userData.baseScale = leaf.scale.clone();
      this.anchor.add(leaf);
      this.comparisonLeaves.set(routeId, leaf);
    });
  }

  createRouteVisual(start, route) {
    const controlA = this.vector(route.controlA);
    const controlB = this.vector(route.controlB);
    const end = this.vector(route.position);
    const curve = new THREE.CatmullRomCurve3(
      [start.clone(), controlA, controlB, end.clone()],
      false,
      "catmullrom",
      0.38
    );

    const corridor = new THREE.Group();
    corridor.name = `hub_route_corridor_${route.id}`;
    Object.assign(corridor.userData, {
      routeId: route.id,
      altitudeBand: ROUTE_BANDS[route.id] ?? "middle",
      anatomicalCorridor: true,
      noConnectorLine: true,
      targetingSuppressed: true
    });
    this.root.add(corridor);

    const corridorSegments = this.composeCorridorSegments(corridor, curve, route);
    const territoryBackdrop = this.createTerritoryBackdrop(corridor, end, route);

    const gate = new THREE.Group();
    gate.name = `hub_route_gate_${route.id}`;
    gate.position.copy(end);
    Object.assign(gate.userData, {
      routeId: route.id,
      gateId: route.gateId,
      routeStatus: route.status,
      altitudeBand: ROUTE_BANDS[route.id] ?? "middle",
      targetingSuppressed: true,
      authoredGateMarker: true,
      stateChangeThreshold: true,
      noTeleport: true
    });
    this.root.add(gate);

    const materials = this.createGateMaterials(route);
    if (route.shape === "vascular_arc") this.composeVascularGate(gate, materials);
    else if (route.shape === "compressed_ribs") this.composeSiltGate(gate, materials);
    else this.composeMemoryGate(gate, materials);

    const readSealMaterial = this.createTissueMaterial(route.secondaryColor ?? route.color ?? 0xffffff, {
      emissive: route.secondaryColor ?? route.color ?? 0xffffff,
      emissiveIntensity: 0.4,
      opacity: 0,
      roughness: 0.25
    });
    const readSeal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), readSealMaterial);
    readSeal.name = `hub_route_read_seal_${route.id}`;
    readSeal.position.set(0, route.id === "vascular_route" ? -0.92 : route.id === "silt_burrow_route" ? 0.78 : -0.78, 0.22);
    readSeal.scale.set(0.7, 1.35, 0.7);
    readSeal.visible = false;
    readSeal.userData.targetingSuppressed = true;
    gate.add(readSeal);

    return {
      route,
      curve,
      corridor,
      corridorSegments,
      territoryBackdrop,
      gate,
      materials,
      readSeal
    };
  }

  composeCorridorSegments(corridor, curve, route) {
    const segments = [];
    const routeColor = route.color ?? 0xffffff;
    const tangent = new THREE.Vector3();
    const localForward = new THREE.Vector3(0, 0, 1);
    const count = route.id === "grave_memory_route" ? 8 : 7;

    for (let index = 0; index < count; index += 1) {
      const t = 0.32 + (index / Math.max(1, count - 1)) * 0.56;
      const point = curve.getPointAt(t);
      curve.getTangentAt(t, tangent).normalize();
      let geometry;
      let baseScale;

      if (route.id === "vascular_route") {
        geometry = new THREE.SphereGeometry(0.32, 14, 9);
        baseScale = new THREE.Vector3(0.86 + (index % 2) * 0.12, 0.34, 1.5);
      } else if (route.id === "silt_burrow_route") {
        geometry = new THREE.BoxGeometry(0.68, 0.16, 0.72);
        baseScale = new THREE.Vector3(1.0 - index * 0.025, 1, 1.0 + index * 0.035);
      } else {
        geometry = new THREE.OctahedronGeometry(0.31, 0);
        baseScale = new THREE.Vector3(1.22, 0.5 + (index % 2) * 0.14, 1.55);
      }

      const material = this.createTissueMaterial(routeColor, {
        emissive: routeColor,
        emissiveIntensity: 0.03,
        opacity: 0,
        roughness: route.id === "silt_burrow_route" ? 0.86 : 0.62
      });
      const segment = new THREE.Mesh(geometry, material);
      segment.name = `hub_${route.id}_corridor_body_${index + 1}`;
      segment.position.copy(point);
      segment.position.y += route.id === "vascular_route"
        ? Math.sin(index * 1.4) * 0.13
        : route.id === "silt_burrow_route"
          ? -0.08 * index
          : Math.sin(index * 0.9) * 0.08;
      segment.position.x += route.id === "vascular_route" ? Math.cos(index * 1.2) * 0.12 : 0;
      segment.quaternion.setFromUnitVectors(localForward, tangent);
      segment.scale.copy(baseScale);
      if (route.id === "silt_burrow_route") {
        segment.rotation.z += -0.12 + index * 0.035;
      } else if (route.id === "grave_memory_route") {
        segment.rotation.z += (index % 2 === 0 ? -1 : 1) * 0.18;
      }
      Object.assign(segment.userData, {
        routeId: route.id,
        segmentIndex: index,
        phase: index * 0.54,
        baseScale: baseScale.clone(),
        baseOpacity: route.status === "active_route" ? 0.2 : 0.14,
        depthLayer: "middle",
        targetingSuppressed: true,
        inspectionFadeable: true
      });
      corridor.add(segment);
      segments.push(segment);
    }

    return segments;
  }

  createTerritoryBackdrop(corridor, end, route) {
    const color = route.secondaryColor ?? route.color ?? 0xffffff;
    const material = this.createTissueMaterial(color, {
      emissive: route.color ?? color,
      emissiveIntensity: 0.025,
      opacity: 0,
      roughness: 0.82
    });
    let geometry;
    if (route.id === "vascular_route") {
      geometry = new THREE.CapsuleGeometry(0.5, 1.8, 8, 14);
    } else if (route.id === "silt_burrow_route") {
      geometry = new THREE.BoxGeometry(2.5, 1.22, 0.42);
    } else {
      geometry = new THREE.OctahedronGeometry(1.05, 0);
    }
    const backdrop = new THREE.Mesh(geometry, material);
    backdrop.name = `hub_territory_backdrop_${route.id}`;
    backdrop.position.copy(end).add(new THREE.Vector3(0, 0, -0.48));
    if (route.id === "vascular_route") backdrop.scale.set(0.84, 1.18, 0.48);
    else if (route.id === "silt_burrow_route") backdrop.scale.set(1, 1, 1);
    else backdrop.scale.set(1.28, 1.42, 0.42);
    backdrop.rotation.set(0.08, route.id === "grave_memory_route" ? 0 : 0.28, route.id === "silt_burrow_route" ? -0.2 : 0.12);
    Object.assign(backdrop.userData, {
      routeId: route.id,
      altitudeBand: ROUTE_BANDS[route.id] ?? "middle",
      territoryBoundary: true,
      silhouetteSignature: route.shape,
      solidLandmark: true,
      targetingSuppressed: true,
      inspectionFadeable: false
    });
    corridor.add(backdrop);
    this.territoryLandmarks.push(backdrop);
    return backdrop;
  }

  createGateMaterials(route) {
    return [route.color, route.secondaryColor].map((color, index) => this.createTissueMaterial(
      color ?? (index ? 0xffd9a0 : 0xffffff),
      {
        emissive: color ?? (index ? 0xffd9a0 : 0xffffff),
        emissiveIntensity: index ? 0.12 : 0.08,
        opacity: 0,
        roughness: index ? 0.38 : 0.52
      }
    ));
  }

  composeMemoryGate(gate, materials) {
    for (let index = 0; index < 4; index += 1) {
      const shard = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.38 - index * 0.045, 0),
        materials[index % materials.length].clone()
      );
      shard.name = "hub_gate_memory_lattice_shard";
      shard.position.set((index - 1.5) * 0.42, (index % 2) * 0.34 - 0.16, -Math.abs(index - 1.5) * 0.08);
      shard.scale.set(0.58, 1.62 - index * 0.12, 0.52);
      shard.rotation.set(index * 0.28, index * 0.58, index * 0.22);
      shard.userData.phase = index * 0.57;
      gate.add(shard);
    }
    const memoryCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), materials[1].clone());
    memoryCore.name = "hub_gate_memory_route_marker";
    memoryCore.scale.set(0.72, 1.35, 0.72);
    memoryCore.position.z = 0.18;
    gate.add(memoryCore);
  }

  composeVascularGate(gate, materials) {
    for (let index = 0; index < 3; index += 1) {
      const x = (index - 1) * 0.36;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, -0.82, 0.08 * index),
        new THREE.Vector3(x - 0.2, -0.25, 0.18 - index * 0.1),
        new THREE.Vector3(x + 0.22, 0.34, -0.14 + index * 0.08),
        new THREE.Vector3(x * 0.8, 0.96, 0.04)
      ], false, "catmullrom", 0.32);
      const vessel = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, 0.055 - index * 0.006, 8, false),
        materials[index % materials.length].clone()
      );
      vessel.name = "hub_gate_vascular_rhythm_vessel";
      vessel.userData.phase = index * 0.8;
      gate.add(vessel);
    }
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), materials[0].clone());
    pulse.name = "hub_gate_vascular_sleeping_pulse";
    pulse.scale.set(0.68, 1.38, 0.68);
    gate.add(pulse);
  }

  composeSiltGate(gate, materials) {
    for (let index = 0; index < 6; index += 1) {
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.9 - index * 0.055, 0.13, 0.48 + index * 0.035),
        materials[index % materials.length].clone()
      );
      rib.name = "hub_gate_silt_compressed_plate";
      rib.position.set((index - 2.5) * 0.09, (index - 2.5) * 0.2, index * 0.075);
      rib.rotation.set(0.07 * index, 0.1 * index, -0.2 + index * 0.075);
      rib.userData.phase = index * 0.44;
      gate.add(rib);
    }
    const pearl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), materials[1].clone());
    pearl.name = "hub_gate_silt_pressure_pearl";
    pearl.scale.set(1.24, 0.7, 1.0);
    gate.add(pearl);
  }

  createMemoryFragment() {
    const junction = this.recipe.junction ?? {};
    const visual = this.recipe.visual ?? {};
    const position = this.vector(junction.memoryFragmentPosition);
    const material = this.createTissueMaterial(visual.junctionMemoryColor ?? 0xffd9a0, {
      emissive: visual.junctionMemoryColor ?? 0xffd9a0,
      emissiveIntensity: 0.72,
      opacity: 0,
      roughness: 0.24
    });
    this.memoryFragment = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), material);
    this.memoryFragment.name = "hub_first_memory_fragment_001";
    this.memoryFragment.position.copy(position);
    this.memoryFragment.scale.set(0.48, 1.72, 0.48);
    Object.assign(this.memoryFragment.userData, {
      targetingSuppressed: true,
      firstMemoryFragment: true,
      readableNotCollectible: true,
      bodyLed: true,
      inspectionFadeable: false
    });
    this.root.add(this.memoryFragment);

    for (let index = 0; index < 3; index += 1) {
      const tail = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.075 - index * 0.012, 0),
        material.clone()
      );
      tail.name = `hub_memory_fragment_tail_${index + 1}`;
      tail.position.copy(position).add(new THREE.Vector3(
        (index - 1) * 0.09,
        -0.34 - index * 0.2,
        0.05 + index * 0.04
      ));
      tail.scale.set(0.7, 1.4, 0.7);
      tail.userData.phase = index * 0.8;
      tail.userData.targetingSuppressed = true;
      this.root.add(tail);
      this.memoryTail.push(tail);
    }
  }

  createPlayerTrail() {
    const colors = [0xffe4ad, 0x9fe8ff, 0xffb96b];
    for (let index = 0; index < 3; index += 1) {
      const material = this.createTissueMaterial(colors[index], {
        emissive: colors[index],
        emissiveIntensity: 0.28,
        opacity: 0,
        roughness: 0.24,
        depthWrite: false
      });
      const bead = new THREE.Mesh(new THREE.TetrahedronGeometry(0.1 - index * 0.018, 0), material);
      bead.name = `hub_player_identity_wake_${index + 1}`;
      bead.userData.targetingSuppressed = true;
      bead.userData.playerIdentitySupport = true;
      this.root.add(bead);
      this.playerTrail.push(bead);
    }
  }

  createGraveMemoryEcho() {
    const routeCircuit = this.recipeDataSystem.data.graveMemoryRouteCircuit ?? {};
    const returnPresentation = routeCircuit.hubReturnPresentation ?? {};
    const graveRoute = (this.recipe.routes ?? []).find((route) => route.id === "grave_memory_route");
    const gravePosition = this.vector(graveRoute?.position);
    const authoredPosition = returnPresentation.echoPosition
      ? this.vector(returnPresentation.echoPosition)
      : gravePosition.add(new THREE.Vector3(-1.55, 0.55, 0.18));

    this.graveMemoryEchoRoot = new THREE.Group();
    this.graveMemoryEchoRoot.name = "hub_grave_memory_return_echo_HC010E";
    this.graveMemoryEchoRoot.position.copy(authoredPosition);
    this.graveMemoryEchoRoot.userData.hubMirrorAuthoredPosition = authoredPosition.clone();
    Object.assign(this.graveMemoryEchoRoot.userData, {
      regionId: "hub_chamber",
      routeId: "grave_memory_route",
      presentationOwner: "HubChamberFoundationSystem",
      visualOnly: true,
      targetingSuppressed: true,
      objectiveLayer: "returned_world_tissue_echo",
      objectDefiningRing: false
    });

    const tissueColor = returnPresentation.tissueColor ?? 0x6d5269;
    const tissueLayout = [
      [-0.34, -0.04, 0.02, -0.12, -0.2, 0.62, 0.8, 1.0, 0.72],
      [0.0, -0.18, -0.08, 0.18, 0.08, -0.08, 1.0, 0.78, 0.9],
      [0.38, 0.02, 0.06, 0.12, 0.24, -0.58, 0.82, 1.04, 0.74]
    ];
    tissueLayout.forEach((values, index) => {
      const [x, y, z, rx, ry, rz, sx, sy, sz] = values;
      const material = this.createTissueMaterial(tissueColor, {
        emissive: this.graveMemoryColor,
        emissiveIntensity: 0.12,
        opacity: 0,
        roughness: 0.68
      });
      const lobe = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.68, 7, 12), material);
      lobe.name = `hub_grave_memory_echo_tissue_lobe_${index + 1}`;
      lobe.position.set(x, y, z);
      lobe.rotation.set(rx, ry, rz);
      lobe.scale.set(sx, sy, sz);
      lobe.userData.baseScale = lobe.scale.clone();
      lobe.userData.phase = index * 0.82;
      lobe.userData.targetingSuppressed = true;
      this.graveMemoryEchoRoot.add(lobe);
      this.graveMemoryEchoTissue.push(lobe);
    });

    const pearlColor = returnPresentation.pearlColor ?? 0xb9a0bd;
    const pearlLayout = [
      [0.0, 0.1, 0.18, 0.19, 1.0],
      [0.23, 0.28, 0.13, 0.115, 0.72],
      [0.26, -0.1, 0.2, 0.09, 0.58]
    ];
    pearlLayout.forEach(([x, y, z, radius, scale], index) => {
      const material = this.createTissueMaterial(pearlColor, {
        emissive: this.graveMemoryColor,
        emissiveIntensity: 0.42,
        opacity: 0,
        roughness: 0.3
      });
      const pearl = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 0), material);
      pearl.name = `hub_grave_memory_echo_pearl_${index + 1}`;
      pearl.position.set(x, y, z);
      pearl.userData.baseScale = scale;
      pearl.userData.phase = index * 1.1;
      pearl.userData.targetingSuppressed = true;
      pearl.scale.setScalar(0.001);
      this.graveMemoryEchoRoot.add(pearl);
      this.graveMemoryEchoPearls.push(pearl);
    });

    this.graveMemoryEchoRoot.visible = false;
    this.root.add(this.graveMemoryEchoRoot);
  }

  createVascularReturnEcho() {
    const consequence = this.recipeDataSystem.data.vascularRhythmReturnConsequence ?? {};
    const echo = consequence.hubEcho ?? {};
    this.vascularReturnEchoRoot = new THREE.Group();
    this.vascularReturnEchoRoot.name = echo.rootName ?? "hub_vascular_return_echo_HC011B";
    this.vascularReturnEchoRoot.position.copy(this.vector(echo.position ?? [-3.68, 2.02, -2.02]));
    this.vascularReturnEchoRoot.userData.hubMirrorAuthoredPosition = this.vascularReturnEchoRoot.position.clone();
    Object.assign(this.vascularReturnEchoRoot.userData, {
      regionId: "hub_chamber",
      routeId: "vascular_route",
      presentationOwner: "HubChamberFoundationSystem",
      retainedStateOwner: "LocalCellBoundaryMorphSystem",
      visualOnly: true,
      targetingSuppressed: true,
      objectiveLayer: "returned_vascular_tissue_echo",
      objectDefiningRing: false,
      triggerMarker: false
    });

    const signalColor = consequence.coreFilament?.signalColor ?? 0x78e3ff;
    const returnColor = consequence.coreFilament?.returnColor ?? 0xffc96d;
    const paths = [
      [[-0.72, -0.5, 0.08], [-0.4, -0.18, 0.02], [-0.24, 0.26, -0.08], [-0.46, 0.66, 0.04]],
      [[-0.08, -0.62, -0.04], [0.18, -0.22, 0.08], [0.1, 0.3, 0.12], [0.38, 0.78, -0.02]],
      [[0.58, -0.52, 0.02], [0.36, -0.1, -0.08], [0.52, 0.32, 0.04], [0.22, 0.68, 0.1]]
    ];
    paths.forEach((points, index) => {
      const curve = new THREE.CatmullRomCurve3(
        points.map((point) => new THREE.Vector3().fromArray(point)),
        false,
        "centripetal",
        0.42
      );
      const material = this.createTissueMaterial(index === 1 ? returnColor : signalColor, {
        emissive: index === 1 ? returnColor : signalColor,
        emissiveIntensity: 0,
        opacity: 0,
        roughness: 0.46
      });
      const filament = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 28, 0.045 + index * 0.006, 8, false),
        material
      );
      filament.name = `hub_vascular_return_echo_filament_${index + 1}`;
      filament.userData.phase = index / 3;
      filament.userData.targetingSuppressed = true;
      filament.userData.objectDefiningRing = false;
      this.vascularReturnEchoRoot.add(filament);
      this.vascularReturnEchoCurves.push(curve);
      this.vascularReturnEchoFilaments.push(filament);

      const valveMaterial = material.clone();
      const valve = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), valveMaterial);
      valve.name = `hub_vascular_return_echo_valve_${index + 1}`;
      valve.position.copy(curve.getPointAt(0.32 + index * 0.18));
      valve.scale.set(0.72, 1.34, 0.72);
      valve.userData.phase = index / 3;
      valve.userData.targetingSuppressed = true;
      valve.userData.objectDefiningRing = false;
      this.vascularReturnEchoRoot.add(valve);
      this.vascularReturnEchoValves.push(valve);
    });

    const chargeMaterial = this.createTissueMaterial(returnColor, {
      emissive: returnColor,
      emissiveIntensity: 0,
      opacity: 0,
      roughness: 0.22
    });
    this.vascularReturnEchoCharge = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.115, 0),
      chargeMaterial
    );
    this.vascularReturnEchoCharge.name = "hub_vascular_return_echo_charge";
    this.vascularReturnEchoCharge.userData.targetingSuppressed = true;
    this.vascularReturnEchoCharge.userData.objectDefiningRing = false;
    this.vascularReturnEchoRoot.add(this.vascularReturnEchoCharge);
    this.vascularReturnEchoRoot.visible = false;
    this.root.add(this.vascularReturnEchoRoot);
  }

  createSiltReturnEcho() {
    const consequence = this.recipeDataSystem.data.siltPressureReturnConsequence ?? {};
    const echo = consequence.hubEcho ?? {};
    this.siltReturnEchoRoot = new THREE.Group();
    this.siltReturnEchoRoot.name = echo.rootName ?? "hub_silt_pressure_return_echo_HC012B";
    this.siltReturnEchoRoot.position.copy(this.vector(echo.position ?? [3.55, -2.08, -2.08]));
    this.siltReturnEchoRoot.userData.hubMirrorAuthoredPosition = this.siltReturnEchoRoot.position.clone();
    Object.assign(this.siltReturnEchoRoot.userData, {
      regionId: "hub_chamber",
      routeId: "silt_burrow_route",
      presentationOwner: "HubChamberFoundationSystem",
      retainedStateOwner: "LocalCellBoundaryMorphSystem",
      visualOnly: true,
      targetingSuppressed: true,
      objectiveLayer: "returned_silt_pressure_tissue_echo",
      objectDefiningRing: false,
      triggerMarker: false
    });

    const plateLayouts = [
      { position: [-0.48, 0.08, 0.02], rotation: [0.08, -0.18, -0.5], scale: [0.92, 0.42, 1.18] },
      { position: [0, -0.18, -0.08], rotation: [-0.12, 0.08, 0.02], scale: [1.12, 0.48, 1.34] },
      { position: [0.5, 0.04, 0.04], rotation: [0.12, 0.22, 0.52], scale: [0.88, 0.4, 1.12] }
    ];
    plateLayouts.forEach((layout, index) => {
      const material = this.createTissueMaterial(index === 1 ? this.siltReturnColor : this.siltColor, {
        emissive: index === 1 ? this.siltReturnColor : this.siltDeepColor,
        emissiveIntensity: 0,
        opacity: 0,
        roughness: 0.82
      });
      const plate = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.72, 7, 12), material);
      plate.name = `hub_silt_return_echo_brace_plate_${index + 1}`;
      plate.position.set(...layout.position);
      plate.rotation.set(...layout.rotation);
      plate.scale.set(...layout.scale);
      plate.userData.basePosition = plate.position.clone();
      plate.userData.baseScale = plate.scale.clone();
      plate.userData.phase = index * 0.86;
      plate.userData.targetingSuppressed = true;
      plate.userData.objectDefiningRing = false;
      this.siltReturnEchoRoot.add(plate);
      this.siltReturnEchoPlates.push(plate);
    });

    const porousMaterial = this.createTissueMaterial(this.siltPorousColor, {
      emissive: this.siltReturnColor,
      emissiveIntensity: 0,
      opacity: 0,
      roughness: 0.4
    });
    this.siltReturnEchoPorousNode = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), porousMaterial);
    this.siltReturnEchoPorousNode.name = "hub_silt_return_echo_porous_opening";
    this.siltReturnEchoPorousNode.position.set(0, 0.14, 0.18);
    this.siltReturnEchoPorousNode.userData.targetingSuppressed = true;
    this.siltReturnEchoPorousNode.userData.objectDefiningRing = false;
    this.siltReturnEchoRoot.add(this.siltReturnEchoPorousNode);

    [[-0.64, -0.3, -0.08], [0.66, -0.28, -0.1]].forEach((position, index) => {
      const material = this.createTissueMaterial(this.siltDeepColor, {
        emissive: this.siltDeepColor,
        emissiveIntensity: 0,
        opacity: 0,
        roughness: 0.96
      });
      const knot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), material);
      knot.name = `hub_silt_return_echo_residue_knot_${index + 1}`;
      knot.position.set(...position);
      knot.scale.set(1.24, 0.76, 0.96);
      knot.userData.targetingSuppressed = true;
      knot.userData.objectDefiningRing = false;
      this.siltReturnEchoRoot.add(knot);
      this.siltReturnEchoResidueNodes.push(knot);
    });

    this.siltReturnEchoRoot.visible = false;
    this.root.add(this.siltReturnEchoRoot);
  }


  createThreeRouteConvergenceVisuals() {
    const gameplayRecipe = this.recipeDataSystem.get(
      "hubInvestigationGameplayRecipes",
      "HUB_INVESTIGATION_GAMEPLAY_HC007C"
    );
    const config = gameplayRecipe.threeRouteConvergence ?? {};
    const center = this.vector(config.centerPosition ?? this.recipe.junction?.position ?? [0.1, -0.15, -1.8]);

    this.threeRouteConvergenceRoot = new THREE.Group();
    this.threeRouteConvergenceRoot.name = "hub_three_route_convergence_HC012C";
    Object.assign(this.threeRouteConvergenceRoot.userData, {
      pass: "HC-012C",
      presentationOwner: "HubChamberFoundationSystem",
      gameplayOwner: "HubInvestigationGameplaySystem",
      persistenceOwner: "LocalCellBoundaryMorphSystem",
      visualOnly: true,
      targetingSuppressed: true,
      objectDefiningRing: false,
      triggerMarker: false
    });

    const routeInputs = [
      { id: "grave_memory_route", start: this.graveMemoryEchoRoot?.position ?? new THREE.Vector3(0.1, 0.4, -4.1), color: this.graveMemoryColor },
      { id: "vascular_route", start: this.vascularReturnEchoRoot?.position ?? new THREE.Vector3(-3.7, 2.0, -2.0), color: this.vascularSignalColor },
      { id: "silt_burrow_route", start: this.siltReturnEchoRoot?.position ?? new THREE.Vector3(3.55, -2.08, -2.08), color: this.siltReturnColor }
    ];
    routeInputs.forEach((input, index) => {
      const start = input.start.clone();
      const midpoint = start.clone().lerp(center, 0.5);
      midpoint.z += 0.28 + index * 0.08;
      midpoint.y += index === 0 ? 0.3 : index === 1 ? -0.12 : 0.14;
      const curve = new THREE.CatmullRomCurve3([start, midpoint, center.clone()], false, "centripetal", 0.42);
      const material = this.createTissueMaterial(input.color, {
        emissive: input.color,
        emissiveIntensity: 0,
        opacity: 0,
        roughness: 0.48,
        depthWrite: false
      });
      const tendril = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.035 + index * 0.008, 8, false), material);
      tendril.name = `hub_convergence_tendril_${input.id}`;
      Object.assign(tendril.userData, {
        routeId: input.id,
        phase: index / 3,
        targetingSuppressed: true,
        objectDefiningRing: false,
        triggerMarker: false
      });
      this.threeRouteConvergenceRoot.add(tendril);
      this.threeRouteConvergenceTendrils.push(tendril);
    });

    const coreMaterial = this.createTissueMaterial(0xd4d6bd, {
      emissive: 0xffd38c,
      emissiveIntensity: 0,
      opacity: 0,
      roughness: 0.34
    });
    this.threeRouteConvergenceCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), coreMaterial);
    this.threeRouteConvergenceCore.name = "hub_convergence_center_body_HC012C";
    this.threeRouteConvergenceCore.position.copy(center);
    this.threeRouteConvergenceCore.scale.setScalar(0.001);
    this.threeRouteConvergenceCore.userData.targetingSuppressed = true;
    this.threeRouteConvergenceCore.userData.objectDefiningRing = false;
    this.threeRouteConvergenceRoot.add(this.threeRouteConvergenceCore);

    this.combwardBodyRoot = new THREE.Group();
    this.combwardBodyRoot.name = "hub_combward_sealed_body_HC012C";
    this.combwardBodyRoot.position.copy(center).add(new THREE.Vector3(1.05, 0.28, -0.06));
    Object.assign(this.combwardBodyRoot.userData, {
      pass: "HC-013A",
      readableAfterConvergence: true,
      crossable: true,
      gateId: "hub_to_comb_threshold",
      thresholdRegionMounted: true,
      targetingSuppressed: true,
      objectDefiningRing: false
    });
    for (let index = 0; index < 6; index += 1) {
      const color = index % 2 === 0 ? 0xe4c98e : 0x6f8f8a;
      const material = this.createTissueMaterial(color, {
        emissive: color,
        emissiveIntensity: 0,
        opacity: 0,
        roughness: 0.72
      });
      const rib = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.9 + index * 0.08, 7, 12), material);
      rib.name = `hub_combward_sealed_rib_${index + 1}`;
      rib.position.set(index * 0.52, Math.sin(index * 0.88) * 0.28, -index * 0.08);
      rib.rotation.set(0.08 * Math.sin(index), 0.18, Math.PI * 0.5 + (index - 2.5) * 0.08);
      rib.scale.set(1, 0.6 + index * 0.03, 1);
      rib.userData.phase = index * 0.55;
      rib.userData.targetingSuppressed = true;
      rib.userData.objectDefiningRing = false;
      this.combwardBodyRoot.add(rib);
      this.combwardRibs.push(rib);
    }
    this.combwardBodyRoot.visible = false;
    this.threeRouteConvergenceRoot.add(this.combwardBodyRoot);
    this.threeRouteConvergenceRoot.visible = false;
    this.root.add(this.threeRouteConvergenceRoot);
  }

  animateThreeRouteConvergence(dt, runtimeSeconds, frameState, retained) {
    if (!this.threeRouteConvergenceRoot) return;
    const convergence = frameState.hubInvestigationGameplay?.threeRouteConvergence ?? {};
    const history = frameState.act1RouteHistory ?? {};
    const completed = Boolean(convergence.completed || history.hubThreeRouteConvergenceCompleted);
    const active = Boolean(retained || completed);
    const progress = completed ? 1 : THREE.MathUtils.clamp(convergence.progress ?? 0, 0, 1);
    this.threeRouteConvergenceRoot.visible = active;

    this.threeRouteConvergenceTendrils.forEach((tendril, index) => {
      const wave = 0.5 + 0.5 * Math.sin(runtimeSeconds * (1.7 + index * 0.18) - index * 1.4);
      tendril.material.opacity = active ? 0.035 + progress * (0.32 + wave * 0.18) : 0;
      tendril.material.emissiveIntensity = active ? progress * (0.28 + wave * 0.62) : 0;
    });

    if (this.threeRouteConvergenceCore) {
      const pulse = 0.68 + progress * 0.45 + Math.sin(runtimeSeconds * 2.2) * (0.025 + progress * 0.05);
      this.threeRouteConvergenceCore.scale.setScalar(Math.max(0.001, pulse));
      this.threeRouteConvergenceCore.material.opacity = active ? 0.08 + progress * 0.82 : 0;
      this.threeRouteConvergenceCore.material.emissiveIntensity = active ? progress * 0.9 : 0;
      this.threeRouteConvergenceCore.rotation.y += Math.max(0, dt) * (0.12 + progress * 0.34);
    }

    const combReveal = completed ? 1 : 0;
    const combGate = frameState.firstSliceGates?.hub_to_comb_threshold ?? {};
    const combDistance = Number.isFinite(combGate.interactionDistance) ? combGate.interactionDistance : 99;
    const combRange = combGate.interactionRange ?? 1.75;
    const combNear = combDistance <= Math.max(combRange * 2.4, 4.2);
    const combInside = Boolean(combGate.interactionReady);
    if (this.combwardBodyRoot) {
      this.combwardBodyRoot.visible = combReveal > 0;
      this.combwardBodyRoot.scale.setScalar(Math.max(0.001, combReveal));
      this.combwardRibs.forEach((rib, index) => {
        const breath = 0.94 + Math.sin(runtimeSeconds * 1.18 + (rib.userData.phase ?? index)) * 0.055;
        rib.scale.y = (0.6 + index * 0.03) * breath;
        rib.material.opacity = combReveal * (combInside ? 0.86 : combNear ? 0.7 : 0.56) * (0.92 + index * 0.012);
        rib.material.emissiveIntensity = combReveal * (
          combInside ? 0.82 + Math.max(0, Math.sin(runtimeSeconds * 3.4 - index * 0.5)) * 0.52
          : combNear ? 0.48 + Math.max(0, Math.sin(runtimeSeconds * 2.4 - index * 0.5)) * 0.34
          : 0.24 + Math.max(0, Math.sin(runtimeSeconds * 1.7 - index * 0.5)) * 0.2
        );
      });
    }
  }

  updateInheritedLivingState(frameState) {
    const nursery = frameState.nurseryCircuit ?? {};
    const candidate = nursery.livingState ?? "cautious";
    this.inheritedLivingState = SURFACE_LIVING_STATES.has(candidate) ? candidate : "cautious";
    this.inheritedLivingStateSequence = nursery.livingStateSequence ?? 0;
    this.inheritedLivingStateAge = nursery.livingStateAge ?? 0;
    this.inheritedLivingQualities = {
      vitality: THREE.MathUtils.clamp(nursery.livingQualities?.vitality ?? 0.72, 0, 1),
      trust: THREE.MathUtils.clamp(nursery.livingQualities?.trust ?? 0.5, 0, 1),
      stress: THREE.MathUtils.clamp(nursery.livingQualities?.stress ?? 0.3, 0, 1),
      growthMemory: THREE.MathUtils.clamp(nursery.livingQualities?.growthMemory ?? 0, 0, 1)
    };

    if (this.root) {
      this.root.userData.inheritedLivingState = this.inheritedLivingState;
      this.root.userData.inheritedLivingStateSequence = this.inheritedLivingStateSequence;
      this.root.userData.livingStateMemoryEchoPass = "HC-023D";
      this.root.userData.livingStateOwner = "SurfaceWakeGameplaySystem";
      this.root.userData.livingStateScope = "central_cradle_and_ambient_drift_only";
    }
  }

  livingStateMemoryStyle() {
    switch (this.inheritedLivingState) {
      case "blooming":
        return { tint: this.livingStateBloomColor, breathRate: 1.16, breathAmplitude: 1.18, scale: 1.025, opacity: 1.08, drift: 1.12 };
      case "withered":
        return { tint: this.livingStateWitherColor, breathRate: 0.72, breathAmplitude: 0.68, scale: 0.972, opacity: 0.88, drift: 0.76 };
      case "panic":
        return { tint: this.livingStatePanicColor, breathRate: 1.38, breathAmplitude: 1.32, scale: 0.986, opacity: 1.04, drift: 1.28 };
      case "embrace":
        return { tint: this.livingStateEmbraceColor, breathRate: 0.82, breathAmplitude: 0.82, scale: 1.035, opacity: 1.05, drift: 0.86 };
      case "growth":
        return { tint: this.livingStateGrowthColor, breathRate: 0.96, breathAmplitude: 1.02, scale: 1.045, opacity: 1.07, drift: 0.96 };
      default:
        return { tint: this.balancedGrowthColor, breathRate: 1, breathAmplitude: 1, scale: 1, opacity: 1, drift: 1 };
    }
  }

  livingStateMemoryWeight() {
    if (this.inheritedLivingState === "cautious") return 0;
    const ageRetention = 0.56 + 0.44 * Math.exp(-Math.max(0, this.inheritedLivingStateAge) / 18);
    const qualities = this.inheritedLivingQualities ?? {};
    const stateSignal = this.inheritedLivingState === "panic" || this.inheritedLivingState === "withered"
      ? 0.7 + (qualities.stress ?? 0.3) * 0.3
      : this.inheritedLivingState === "growth" || this.inheritedLivingState === "blooming"
        ? 0.7 + Math.max(qualities.vitality ?? 0.72, qualities.growthMemory ?? 0) * 0.3
        : 0.72 + (qualities.trust ?? 0.5) * 0.28;
    return THREE.MathUtils.clamp(0.24 * ageRetention * stateSignal, 0.09, 0.24);
  }

  animate(dt, runtimeSeconds, routeIdentityReady, frameState) {
    const visual = this.recipe.visual ?? {};
    const hubInvestigation = frameState.hubInvestigationGameplay ?? {};
    const coreGrowth = frameState.coreGrowth ?? {};
    const graveHistory = frameState.act1RouteHistory ?? {};
    const vascularRouteState = graveHistory.routeStates?.vascular_route ?? {};
    const siltRouteState = graveHistory.routeStates?.silt_burrow_route ?? {};
    const graveImprintHeld = Boolean(
      graveHistory.graveMemoryImprintCommitted
      || coreGrowth.graveMemoryImprintCommitted
    );
    const returnedGraveImprint = Boolean(graveImprintHeld && graveHistory.graveReturned);
    const returnedVascularCadence = Boolean(
      (graveHistory.vascularReturned || vascularRouteState.returned)
      && (graveHistory.vascularCompleted || vascularRouteState.completed)
      && (graveHistory.vascularCadenceReads ?? frameState.vascularRhythmRoute?.lockedCadenceReads ?? 0) >= 3
    );
    const returnedSiltPressure = Boolean(
      (graveHistory.siltReturned || siltRouteState.returned)
      && (graveHistory.siltCompleted || siltRouteState.completed)
      && graveHistory.siltPressureRead
      && graveHistory.siltRibsReleased
      && graveHistory.siltSafeMatterAbsorbed
      && graveHistory.siltDenseMatterLeftIntact
    );
    const graveTraceIntegrity = THREE.MathUtils.clamp(
      graveHistory.graveTraceIntegrity
        ?? coreGrowth.graveMemoryTraceIntegrity
        ?? 0,
      0,
      1
    );
    const growthProgress = coreGrowth.growthProgress ?? 0;
    const chemistryBias = coreGrowth.chemistryBias ?? 0;
    const growthEchoTarget = growthProgress >= 0.18 ? Math.min(1, growthProgress) : 0;
    this.growthEcho = THREE.MathUtils.damp(this.growthEcho, growthEchoTarget, 2.8, Math.max(0, dt));
    this.growthEchoColor.copy(this.balancedGrowthColor);
    if (chemistryBias >= 0) {
      this.growthEchoColor.lerp(this.careGrowthColor, Math.min(1, chemistryBias));
    } else {
      this.growthEchoColor.lerp(this.scarGrowthColor, Math.min(1, -chemistryBias));
    }
    const routeReads = new Set(hubInvestigation.routeReads ?? []);
    const responseRouteId = hubInvestigation.responseRouteId ?? "none";
    const nearestRouteId = hubInvestigation.nearestRouteId ?? "none";
    const nearestRouteDistance = hubInvestigation.nearestRouteDistance ?? Infinity;
    const allRoutesRead = Boolean(hubInvestigation.allRoutesRead);
    const memoryRead = Boolean(hubInvestigation.memoryRead);
    const returnedToCenter = Boolean(hubInvestigation.returnedToCenter);
    const comparisonReady = allRoutesRead && memoryRead;
    const livingMemoryStyle = this.livingStateMemoryStyle();
    const livingMemoryWeight = this.livingStateMemoryWeight();

    const convergenceCompletedForReadability = Boolean(
      frameState.hubInvestigationGameplay?.threeRouteConvergence?.completed
      || graveHistory.hubThreeRouteConvergenceCompleted
    );
    // HC-014C: once convergence is complete, prior route anatomy becomes retained
    // background context so the newly-awake Combward body owns the player's eye.
    const postConvergenceQuieting = convergenceCompletedForReadability ? 0.22 : 1;
    const centralQuieting = (returnedGraveImprint ? 0.34 : 1) * postConvergenceQuieting;
    const anchorOpacity = (visual.junctionOpacity ?? 0.34) * this.reveal * centralQuieting;
    this.anchorPetals.forEach((petal, index) => {
      const base = petal.userData.baseScale ?? new THREE.Vector3(1, 1, 1);
      const memoryRate = 1 + (livingMemoryStyle.breathRate - 1) * livingMemoryWeight;
      const memoryAmplitude = 1 + (livingMemoryStyle.breathAmplitude - 1) * livingMemoryWeight;
      const memoryScale = 1 + (livingMemoryStyle.scale - 1) * livingMemoryWeight;
      const breath = 1 + Math.sin(runtimeSeconds * 0.82 * memoryRate + (petal.userData.phase ?? index)) * 0.028 * memoryAmplitude;
      petal.scale.set(base.x * breath * memoryScale, base.y * (2 - breath) * memoryScale, base.z * breath * memoryScale);
      petal.material.opacity = anchorOpacity * (0.78 + index * 0.035) * (1 + (livingMemoryStyle.opacity - 1) * livingMemoryWeight);
      petal.material.emissiveIntensity = comparisonReady ? 0.1 : 0.035;
      petal.material.color
        .copy(petal.userData.baseColor)
        .lerp(this.growthEchoColor, this.growthEcho * 0.55)
        .lerp(livingMemoryStyle.tint, livingMemoryWeight * 0.34);
      petal.material.emissive
        .copy(petal.userData.baseEmissive)
        .lerp(this.growthEchoColor, this.growthEcho * 0.68)
        .lerp(livingMemoryStyle.tint, livingMemoryWeight * 0.42);
    });

    if (this.anchorBasin) {
      const readyPulse = comparisonReady && !returnedToCenter
        ? 0.06 + (Math.sin(runtimeSeconds * 3.2) + 1) * 0.035
        : 0;
      this.anchorBasin.material.opacity = Math.min(
        returnedGraveImprint ? 0.2 : 0.52,
        anchorOpacity + 0.08 * centralQuieting + readyPulse * centralQuieting
      );
      this.anchorBasin.material.emissiveIntensity = returnedGraveImprint
        ? 0.08
        : returnedToCenter ? 0.22 : comparisonReady ? 0.16 : 0.06;
      this.anchorBasin.material.color
        .copy(this.anchorBasin.userData.baseColor)
        .lerp(this.growthEchoColor, this.growthEcho * 0.62);
      this.anchorBasin.material.emissive
        .copy(this.anchorBasin.userData.baseEmissive)
        .lerp(this.growthEchoColor, this.growthEcho * 0.76)
        .lerp(livingMemoryStyle.tint, livingMemoryWeight * 0.46);
      this.anchorBasin.material.color.lerp(livingMemoryStyle.tint, livingMemoryWeight * 0.32);
    }

    for (const [routeId, leaf] of this.comparisonLeaves) {
      const read = routeReads.has(routeId);
      const graveImprint = routeId === "grave_memory_route" && graveImprintHeld;
      const vascularImprint = routeId === "vascular_route" && returnedVascularCadence;
      const siltImprint = routeId === "silt_burrow_route" && returnedSiltPressure;
      const leafPulse = comparisonReady && !returnedToCenter
        ? 0.08 + (Math.sin(runtimeSeconds * 3.4 + leaf.position.x) + 1) * 0.04
        : 0;
      leaf.visible = this.reveal > 0.4;
      leaf.material.opacity = siltImprint
        ? 0.64 + Math.sin(runtimeSeconds * 2.24) * 0.07
        : vascularImprint
        ? 0.66 + Math.sin(runtimeSeconds * 2.68) * 0.08
        : returnedGraveImprint
        ? graveImprint ? 0.2 : (read ? 0.14 : 0.025)
        : graveImprint
          ? 0.68 + Math.sin(runtimeSeconds * 2.2) * 0.06
          : read ? 0.54 + leafPulse : 0.045;
      leaf.material.emissiveIntensity = siltImprint
        ? 0.5 + Math.sin(runtimeSeconds * 2.24) * 0.1
        : vascularImprint
        ? 0.58 + Math.sin(runtimeSeconds * 2.68) * 0.12
        : returnedGraveImprint
        ? graveImprint ? 0.2 + graveTraceIntegrity * 0.12 : (read ? 0.1 : 0.01)
        : graveImprint
          ? 0.46 + graveTraceIntegrity * 0.28
          : read
            ? returnedToCenter ? 0.42 : comparisonReady ? 0.62 : 0.3
            : 0.015;
      if (graveImprint) {
        leaf.material.color.copy(this.graveMemoryColor).lerp(
          this.growthEchoColor,
          0.18
        );
        leaf.material.emissive.copy(this.graveMemoryColor);
        const baseScale = leaf.userData.baseScale ?? new THREE.Vector3(1, 1, 1);
        const imprintBeat = returnedGraveImprint
          ? 0.82 + Math.sin(runtimeSeconds * 1.5) * 0.025
          : 1.08 + Math.sin(runtimeSeconds * 2.2) * 0.055;
        leaf.scale.copy(baseScale).multiplyScalar(imprintBeat);
      } else if (siltImprint) {
        leaf.material.color.copy(this.siltColor).lerp(this.siltPorousColor, 0.24);
        leaf.material.emissive.copy(this.siltReturnColor);
        const baseScale = leaf.userData.baseScale ?? new THREE.Vector3(1, 1, 1);
        const pressureBreath = 0.98 + Math.sin(runtimeSeconds * 2.24) * 0.06;
        leaf.scale.set(baseScale.x * (1.04 + pressureBreath * 0.02), baseScale.y * pressureBreath, baseScale.z);
      } else if (vascularImprint) {
        leaf.material.color.copy(this.vascularSignalColor);
        leaf.material.emissive.copy(this.vascularReturnColor);
        const baseScale = leaf.userData.baseScale ?? new THREE.Vector3(1, 1, 1);
        const cadenceBeat = 1.04 + Math.sin(runtimeSeconds * 2.68) * 0.075;
        leaf.scale.copy(baseScale).multiplyScalar(cadenceBeat);
      }
      leaf.rotation.y += siltImprint ? dt * 0.12 : vascularImprint ? dt * 0.3 : graveImprint ? dt * 0.24 : read ? dt * 0.16 : 0;
      leaf.userData.graveMemoryImprintHeld = graveImprint;
      leaf.userData.graveMemoryTraceIntegrity = graveImprint ? graveTraceIntegrity : 0;
      leaf.userData.vascularRhythmRetained = vascularImprint;
      leaf.userData.siltPressureRetained = siltImprint;
    }

    this.animateGraveMemoryEcho(dt, runtimeSeconds, returnedGraveImprint, graveTraceIntegrity);
    this.animateVascularReturnEcho(dt, runtimeSeconds, returnedVascularCadence);
    this.animateSiltReturnEcho(dt, runtimeSeconds, returnedSiltPressure, graveHistory);
    this.animateThreeRouteConvergence(
      dt,
      runtimeSeconds,
      frameState,
      returnedGraveImprint && returnedVascularCadence && returnedSiltPressure
    );

    const commitTargetId = frameState.hubRouteCommit?.available
      ? frameState.hubRouteCommit.routeId
      : "none";

    this.routeVisuals.forEach((item, routeIndex) => {
      const publishedGate = frameState.firstSliceGates?.[item.route.gateId]
        ?? (frameState.gateState?.id === item.route.gateId ? frameState.gateState : null);
      const authoredActiveRoute = item.route.status === "active_route";
      const activeRoute = Boolean(publishedGate?.awake ?? authoredActiveRoute);
      const routeCrossable = Boolean(publishedGate?.crossable);
      const routeReadable = Boolean(activeRoute && (publishedGate?.readable || routeCrossable || routeIdentityReady));
      const gameplayPending = Boolean(publishedGate?.gameplayPending);
      const read = routeReads.has(item.route.id);
      const commitReady = item.route.id === commitTargetId;
      const near = commitReady || (item.route.id === nearestRouteId && nearestRouteDistance <= 2.8);
      const responding = item.route.id === responseRouteId;
      const firstDestinationInvitation = Boolean(
        item.route.id === "grave_memory_route"
        && !frameState.act1RouteHistory?.graveEntered
        && routeIdentityReady
        && activeRoute
        && publishedGate?.destinationMounted
        && publishedGate?.playableReady !== false
        && !gameplayPending
      );
      const invitationStrength = firstDestinationInvitation
        ? THREE.MathUtils.clamp(this.routeIdentityReveal * this.reveal, 0, 1)
        : 0;
      const baseOpacity = convergenceCompletedForReadability
        ? (activeRoute ? 0.055 : 0.025)
        : (activeRoute ? 0.2 : 0.13);

      item.corridorSegments.forEach((segment, segmentIndex) => {
        const baseScale = segment.userData.baseScale ?? new THREE.Vector3(1, 1, 1);
        const responseWave = responding
          ? (Math.sin(runtimeSeconds * 7.2 - segmentIndex * 0.65) + 1) * 0.5
          : 0;
        // HC031P: the first awake destination uses only its existing anatomical
        // corridor as a body-led invitation. The wave travels from Hub center toward
        // Grave; no arrow, waypoint, gate authority, or automatic crossing is added.
        const invitationWave = firstDestinationInvitation
          ? (Math.sin(runtimeSeconds * 3.15 - segmentIndex * 0.82) + 1) * 0.5
          : 0;
        const bodyOpacity = baseOpacity
          + (near ? 0.08 : 0)
          + (read ? 0.07 : 0)
          + responseWave * 0.22
          + invitationWave * invitationStrength * 0.12;
        segment.material.opacity = Math.min(0.68, bodyOpacity * this.reveal);
        segment.material.emissiveIntensity = convergenceCompletedForReadability
          ? (read ? 0.025 : 0.008)
          : responding
            ? 0.18 + responseWave * 0.34
            : commitReady
              ? 0.24
              : firstDestinationInvitation
                ? 0.08 + invitationWave * invitationStrength * 0.18
                : near ? 0.11 : read ? 0.08 : 0.025;
        const swell = 1 + responseWave * 0.07 + invitationWave * invitationStrength * 0.025;
        segment.scale.set(baseScale.x * swell, baseScale.y * swell, baseScale.z * swell);
        segment.userData.firstDestinationInvitation = firstDestinationInvitation;
        segment.userData.invitationDirection = firstDestinationInvitation ? "hub_center_to_grave" : "none";
      });

      if (item.territoryBackdrop?.material) {
        item.territoryBackdrop.material.opacity = convergenceCompletedForReadability
          ? 0.035 * this.reveal
          : (near ? 0.22 : read ? 0.18 : activeRoute ? 0.16 : 0.12) * this.reveal;
        item.territoryBackdrop.material.emissiveIntensity = responding ? 0.12 : routeCrossable ? 0.08 : 0.02;
      }

      const gateOpacity = (convergenceCompletedForReadability ? 0.075 : (
        responding
          ? 0.78
          : routeCrossable
            ? 0.72
            : commitReady
              ? 0.72
              : near
              ? 0.48
              : activeRoute
                ? 0.42
                : 0.24
      )) * this.reveal * (activeRoute ? this.routeIdentityReveal : 1);

      item.gate.children.forEach((child, childIndex) => {
        if (!child.material || child === item.readSeal) return;
        child.material.opacity = gateOpacity * (0.9 + Math.sin(runtimeSeconds * 0.8 + childIndex) * 0.04);
        child.material.emissiveIntensity = responding
          ? 0.34
          : routeCrossable
            ? 0.26
            : commitReady ? 0.28 : activeRoute ? 0.12 : 0.04;
      });

      if (item.readSeal) {
        item.readSeal.visible = read;
        item.readSeal.material.opacity = read ? 0.62 : 0;
        item.readSeal.material.emissiveIntensity = read ? 0.5 : 0;
        item.readSeal.rotation.y += read ? dt * 0.28 : 0;
      }

      const gateBreath = responding
        ? 1.04 + Math.sin(runtimeSeconds * 4.8) * 0.07
        : commitReady
          ? 1.05 + Math.sin(runtimeSeconds * 3.2) * 0.055
        : firstDestinationInvitation
          ? 1.025 + Math.sin(runtimeSeconds * 2.4) * 0.03 * invitationStrength
        : routeCrossable
          ? 1.02 + Math.sin(runtimeSeconds * 2.2) * 0.035
          : 1;
      item.gate.scale.setScalar(gateBreath);
      Object.assign(item.gate.userData, {
        gateAvailability: routeCrossable
          ? "crossable"
          : gameplayPending
            ? "awake_gameplay_pending"
            : routeReadable ? "readable" : activeRoute ? "listening" : "dormant",
        routeHistory: frameState.act1RouteHistory?.graveMemoryImprintCommitted
          ? "completed_route_reading_held"
          : frameState.graveRouteLock?.routeLocked
          ? "completed_route_reading_held"
          : "first_route_readable",
        destinationMounted: Boolean(publishedGate?.destinationMounted),
        gameplayPending,
        presentationOwner: "HubChamberFoundationSystem",
        read,
        responding,
        firstDestinationInvitation,
        invitationDirection: firstDestinationInvitation ? "hub_center_to_grave" : "none",
        deliberateCommitRequired: firstDestinationInvitation,
        routeAuthority: false,
        routeIndex
      });
    });

    if (this.memoryFragment) {
      const readable = Math.min(1, Math.max(0, (this.reveal - 0.3) / 0.48));
      this.memoryFragment.material.opacity = (visual.memoryFragmentOpacity ?? 0.78) * readable;
      this.memoryFragment.material.emissiveIntensity = memoryRead ? 0.34 : 0.72;
      this.memoryFragment.rotation.y = Math.sin(runtimeSeconds * 0.42) * 0.18;
      const breath = 1 + Math.sin(runtimeSeconds * 1.4) * 0.04;
      this.memoryFragment.scale.set(0.48 * breath, 1.72 * (2 - breath), 0.48 * breath);
    }
    this.memoryTail.forEach((tail, index) => {
      tail.material.opacity = (memoryRead ? 0.16 : 0.38) * this.reveal;
      tail.position.y += Math.sin(runtimeSeconds * 0.8 + index) * 0.0008;
    });

    this.depthBodies.forEach((body, index) => {
      const phase = body.userData.phase ?? index;
      const opacity = body.userData.depthLayer === "foreground"
        ? (visual.foregroundTissueOpacity ?? 0.2)
        : (visual.backgroundTissueOpacity ?? 0.17);
      const ambientEcho = 1 + (livingMemoryStyle.opacity - 1) * livingMemoryWeight * 0.42;
      body.material.opacity = opacity * this.reveal * (0.92 + Math.sin(runtimeSeconds * 0.32 + phase) * 0.05) * ambientEcho;
    });
    this.driftMotes.forEach((mote, index) => {
      const baseY = mote.userData.baseY ?? 0;
      const range = mote.userData.driftRange ?? 0.2;
      const baseSpeed = mote.userData.driftSpeed ?? 0.4;
      const speed = baseSpeed * (1 + (livingMemoryStyle.drift - 1) * livingMemoryWeight);
      const phase = mote.userData.phase ?? index;
      mote.position.y = baseY + Math.sin(runtimeSeconds * speed + phase) * range;
      mote.position.z += Math.sin(runtimeSeconds * speed * 0.42 + phase) * 0.0007;
      mote.material.opacity = (0.055 + (index % 3) * 0.02) * this.reveal * (1 + (livingMemoryStyle.opacity - 1) * livingMemoryWeight);
    });

    this.animatePlayerTrail(frameState, runtimeSeconds);
  }

  animateGraveMemoryEcho(dt, runtimeSeconds, visible, integrity) {
    if (!this.graveMemoryEchoRoot) return;
    const reveal = visible ? THREE.MathUtils.smoothstep(this.reveal, 0.24, 0.86) : 0;
    this.graveMemoryEchoRoot.visible = reveal > 0.015;
    const breath = 0.97 + Math.sin(runtimeSeconds * 1.65) * 0.03;
    this.graveMemoryEchoRoot.scale.setScalar(Math.max(0.001, reveal * breath));
    this.graveMemoryEchoRoot.rotation.y = Math.sin(runtimeSeconds * 0.28) * 0.08;

    this.graveMemoryEchoTissue.forEach((lobe, index) => {
      const baseScale = lobe.userData.baseScale ?? new THREE.Vector3(1, 1, 1);
      const tissueBreath = 1 + Math.sin(runtimeSeconds * 1.45 + (lobe.userData.phase ?? index)) * 0.035;
      lobe.scale.set(baseScale.x * tissueBreath, baseScale.y * (2 - tissueBreath), baseScale.z * tissueBreath);
      lobe.material.opacity = reveal * (0.46 + integrity * 0.16);
      lobe.material.emissiveIntensity = 0.1 + reveal * (0.18 + integrity * 0.2);
    });
    this.graveMemoryEchoPearls.forEach((pearl, index) => {
      const baseScale = pearl.userData.baseScale ?? 1;
      const pulse = 0.9 + Math.sin(runtimeSeconds * 2.15 + (pearl.userData.phase ?? index)) * 0.1;
      pearl.scale.setScalar(Math.max(0.001, reveal * baseScale * pulse));
      pearl.rotation.y += Math.max(0, dt) * (0.18 + index * 0.04);
      pearl.material.opacity = reveal * (0.72 + integrity * 0.2);
      pearl.material.emissiveIntensity = 0.32 + reveal * (0.34 + integrity * 0.28);
    });

    this.updateConsequenceLayoutTruth(visible, integrity);
  }

  animateVascularReturnEcho(dt, runtimeSeconds, visible) {
    if (!this.vascularReturnEchoRoot) return;
    const reveal = visible ? THREE.MathUtils.smoothstep(this.reveal, 0.22, 0.84) : 0;
    const beatSeconds = this.recipeDataSystem.data.vascularRhythmReturnConsequence?.hubEcho?.beatSeconds ?? 2.35;
    const phase = (runtimeSeconds / beatSeconds) % 1;
    this.vascularReturnEchoRoot.visible = reveal > 0.015;
    this.vascularReturnEchoRoot.scale.setScalar(Math.max(0.001, reveal));
    this.vascularReturnEchoRoot.rotation.y = Math.sin(runtimeSeconds * 0.34) * 0.06;

    this.vascularReturnEchoFilaments.forEach((filament, index) => {
      const localBeat = (phase - index / 3 + 1) % 1;
      const beat = Math.exp(-Math.pow((localBeat - 0.16) / 0.12, 2));
      filament.material.opacity = reveal * (0.44 + beat * 0.28);
      filament.material.emissiveIntensity = reveal * (0.28 + beat * 0.72);
    });
    this.vascularReturnEchoValves.forEach((valve, index) => {
      const localBeat = (phase - index / 3 + 1) % 1;
      const beat = Math.exp(-Math.pow((localBeat - 0.16) / 0.1, 2));
      valve.scale.set(
        Math.max(0.001, reveal * (0.72 + beat * 0.24)),
        Math.max(0.001, reveal * (1.34 + beat * 0.5)),
        Math.max(0.001, reveal * (0.72 + beat * 0.24))
      );
      valve.material.opacity = reveal * (0.58 + beat * 0.34);
      valve.material.emissiveIntensity = reveal * (0.34 + beat * 0.92);
      valve.material.color.copy(this.vascularSignalColor).lerp(this.vascularReturnColor, beat);
      valve.material.emissive.copy(this.vascularReturnColor);
    });
    if (this.vascularReturnEchoCharge && this.vascularReturnEchoCurves[1]) {
      this.vascularReturnEchoCharge.position.copy(this.vascularReturnEchoCurves[1].getPointAt(phase));
      const chargePulse = reveal * (0.9 + Math.sin(phase * Math.PI * 6) * 0.12);
      this.vascularReturnEchoCharge.scale.setScalar(Math.max(0.001, chargePulse));
      this.vascularReturnEchoCharge.material.opacity = reveal * 0.94;
      this.vascularReturnEchoCharge.material.emissiveIntensity = reveal * 1.2;
      this.vascularReturnEchoCharge.rotation.y += Math.max(0, dt) * 0.42;
    }
  }

  animateSiltReturnEcho(dt, runtimeSeconds, visible, history = {}) {
    if (!this.siltReturnEchoRoot) return;
    const reveal = visible ? THREE.MathUtils.smoothstep(this.reveal, 0.22, 0.84) : 0;
    const breathSeconds = this.recipeDataSystem.data.siltPressureReturnConsequence?.hubEcho?.breathSeconds ?? 2.8;
    const phase = (runtimeSeconds / breathSeconds) % 1;
    const breath = (Math.sin(phase * Math.PI * 2) + 1) * 0.5;
    const compression = THREE.MathUtils.clamp(history.siltSettledCompression ?? 0.2, 0, 1);
    this.siltReturnEchoRoot.visible = reveal > 0.015;
    this.siltReturnEchoRoot.scale.setScalar(Math.max(0.001, reveal));
    this.siltReturnEchoRoot.rotation.y = Math.sin(runtimeSeconds * 0.22) * 0.045;

    this.siltReturnEchoPlates.forEach((plate, index) => {
      const basePosition = plate.userData.basePosition;
      const baseScale = plate.userData.baseScale;
      plate.position.copy(basePosition);
      plate.position.x += (index - 1) * breath * 0.055;
      plate.scale.copy(baseScale).multiplyScalar(0.95 + breath * 0.09 - compression * 0.025);
      plate.material.opacity = reveal * (0.58 + breath * 0.16);
      plate.material.emissiveIntensity = reveal * (0.18 + breath * 0.4);
    });
    if (this.siltReturnEchoPorousNode) {
      const pulse = reveal * (0.84 + breath * 0.38);
      this.siltReturnEchoPorousNode.scale.setScalar(Math.max(0.001, pulse));
      this.siltReturnEchoPorousNode.material.opacity = reveal * 0.94;
      this.siltReturnEchoPorousNode.material.emissiveIntensity = reveal * (0.5 + breath * 0.72);
      this.siltReturnEchoPorousNode.rotation.y += Math.max(0, dt) * 0.28;
    }
    this.siltReturnEchoResidueNodes.forEach((knot, index) => {
      const pulse = 0.97 + Math.sin(runtimeSeconds * 1.18 + index * 1.7) * 0.025;
      knot.scale.set(1.24 * pulse, 0.76 / pulse, 0.96 * pulse);
      knot.material.opacity = reveal * 0.76;
      knot.material.emissiveIntensity = reveal * 0.07;
    });
  }

  updateConsequenceLayoutTruth(visible, integrity) {
    if (!visible || !this.graveMemoryEchoRoot) {
      this.consequenceLayoutTruth = this.createEmptyConsequenceLayoutTruth();
      return;
    }
    // W2A3: only Hub ancestry/descendants are required for route readability.
    // Updating the entire scene here duplicated renderer work across hundreds of roots.
    if (this.root?.updateWorldMatrix) this.root.updateWorldMatrix(true, true);
    else this.root?.updateMatrixWorld?.(true);
    this.camera?.updateMatrixWorld?.(true);
    const player = new THREE.Vector3();
    const echo = new THREE.Vector3();
    const guide = new THREE.Vector3();
    this.playerRoot.getWorldPosition(player);
    this.graveMemoryEchoRoot.getWorldPosition(echo);
    const guideRoot = this.getSceneObject("guide_orbiter_folded_lantern_001");
    if (guideRoot) guideRoot.getWorldPosition(guide);
    const playerEchoSeparation = player.distanceTo(echo);
    const guideEchoSeparation = guideRoot ? guide.distanceTo(echo) : 0;
    const guidePlayerSeparation = guideRoot ? guide.distanceTo(player) : 0;
    const project = (position) => this.camera ? position.clone().project(this.camera) : null;
    const playerScreen = project(player);
    const echoScreen = project(echo);
    const guideScreen = guideRoot ? project(guide) : null;
    const screenDistance = (a, b) => a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    const playerEchoScreenSeparation = screenDistance(playerScreen, echoScreen);
    const guideEchoScreenSeparation = screenDistance(guideScreen, echoScreen);
    const guidePlayerScreenSeparation = screenDistance(guideScreen, playerScreen);
    const returnPresentation = this.recipeDataSystem.data.graveMemoryRouteCircuit?.hubReturnPresentation ?? {};
    const separatedSilhouettesReadable = Boolean(
      guideRoot
      && this.graveMemoryEchoRoot.visible
      && playerEchoSeparation >= (returnPresentation.minimumPlayerEchoWorldSeparation ?? 1.35)
      && guideEchoSeparation >= (returnPresentation.minimumGuideEchoWorldSeparation ?? 2.1)
      && guidePlayerSeparation >= (returnPresentation.minimumGuidePlayerWorldSeparation ?? 1.85)
      && playerEchoScreenSeparation >= (returnPresentation.minimumPlayerEchoScreenSeparation ?? 0.14)
      && guideEchoScreenSeparation >= (returnPresentation.minimumGuideEchoScreenSeparation ?? 0.28)
      && guidePlayerScreenSeparation >= (returnPresentation.minimumGuidePlayerScreenSeparation ?? 0.24)
    );
    this.consequenceLayoutTruth = {
      pass: "HC-010G",
      active: true,
      playerEchoSeparation,
      guideEchoSeparation,
      guidePlayerSeparation,
      playerEchoScreenSeparation,
      guideEchoScreenSeparation,
      guidePlayerScreenSeparation,
      corePearlBodyAttached: Boolean(this.frameState.coreEmbodiment?.memoryImprintUsesExistingBody),
      corePearlVisible: Boolean(this.frameState.coreEmbodiment?.visibleGraveMemoryPearl),
      hubEchoVisible: this.graveMemoryEchoRoot.visible,
      guidePerchPresent: Boolean(guideRoot),
      separatedSilhouettesReadable,
      centralCradleQuieted: true,
      traceIntegrity: integrity,
      hierarchy: ["immediate_core_and_guide", "objective_grave_echo", "background_host_anatomy"]
    };
  }

  createEmptyConsequenceLayoutTruth() {
    return {
      pass: "HC-010G",
      active: false,
      playerEchoSeparation: 0,
      guideEchoSeparation: 0,
      guidePlayerSeparation: 0,
      playerEchoScreenSeparation: 0,
      guideEchoScreenSeparation: 0,
      guidePlayerScreenSeparation: 0,
      corePearlBodyAttached: false,
      corePearlVisible: false,
      hubEchoVisible: false,
      guidePerchPresent: false,
      separatedSilhouettesReadable: false,
      centralCradleQuieted: false,
      traceIntegrity: 0,
      hierarchy: []
    };
  }

  animatePlayerTrail(frameState, runtimeSeconds) {
    const velocity = frameState.playerKinematics?.velocity ?? {};
    this.tempDirection.set(
      -(velocity.x ?? 0),
      -(velocity.y ?? 0) * 0.36,
      -(velocity.z ?? 0)
    );
    const speed = frameState.playerKinematics?.speed ?? 0;
    if (this.tempDirection.lengthSq() > 0.025) {
      this.tempDirection.normalize();
      this.playerTrailDirection.lerp(this.tempDirection, 0.18).normalize();
    } else {
      this.playerTrailDirection.lerp(this.worldForward, 0.025).normalize();
    }

    this.playerTrail.forEach((bead, index) => {
      const distance = 0.35 + index * 0.26;
      bead.position.copy(this.playerRoot.position).addScaledVector(this.playerTrailDirection, distance);
      bead.position.y -= 0.08 + index * 0.035;
      bead.position.x += Math.sin(runtimeSeconds * 2.4 + index * 1.3) * 0.035;
      const scale = (0.88 - index * 0.18) * (1 + Math.min(0.22, speed * 0.05));
      bead.scale.set(scale, scale * 1.25, scale);
      bead.rotation.y += 0.03 + index * 0.008;
      bead.material.opacity = (0.16 + Math.min(0.34, speed * 0.12)) * this.reveal;
    });
  }

  applyHubPresentationAuthority(frameState, routeIdentityReady = false) {
    const hubPresentationReady = Boolean(
      routeIdentityReady
      && this.reveal >= 0.62
      && this.spatialTruth.verified
    );

    frameState.hubPresentationOwnership = {
      pass: "HC-010G",
      active: true,
      owner: "HubChamberFoundationSystem",
      spatialAuthorityRoot: this.root?.name ?? "hub_chamber_spatial_authority_HC008G",
      hubInstructionsExclusive: true,
      retainedSignalStateVisible: false,
      completedLayeredVisualHidden: true,
      passivePressureVisualHidden: true,
      signalChemistryBodiesHidden: true,
      staleWatcherHidden: true,
      guideShimmerLineHidden: true,
      routeLayoutWide: true,
      cameraJunctionWide: false,
      cameraExplorationLocal: true,
      promptOwner: "HubChamberFoundationSystem",
      targetRequired: false,
      inputRequired: false,
      routeActivated: false,
      postCommitPresentationSynced: Boolean(frameState.statusPage?.firstHubUseComplete),
      volumetricConvergencePass: "HC-008G",
      renderTruthPass: "HC-010C",
      growthReflectionPass: "HC-009D",
      graveConsequenceReadabilityPass: "HC-010E",
      retainedCoreFormEchoedByExistingCradle: Boolean(
        (frameState.coreGrowth?.growthProgress ?? 0) >= 0.18
      ),
      retainedSignalIdentityHidden: true,
      staleSignalReturnMessagingSuppressed: true
    };

    frameState.hubReadability = {
      pass: "HC-010G",
      active: true,
      immediatePlayRingReadable: this.visibleLeakNames.length === 0,
      objectiveRingReadable: this.spatialTruth.verified,
      worldMeaningRingReadable: this.distantHostMode === "background_anatomy_suggestion",
      signalIdentityOpacityScale: 0,
      signalMoteVisibilityScale: 0,
      routeSpacingPhysical: this.spatialTruth.routeSpacingPhysical,
      falseTargetsSuppressed: true,
      solePresentationOwner: true,
      allThreeRoutesInHubFrame: this.spatialTruth.allRouteCentersInView,
      routeTerritoriesVisibleInFrame: this.spatialTruth.allRouteTerritoriesVisible,
      minimumScreenSeparation: this.spatialTruth.minimumScreenSeparation,
      maximumScreenOverlapRatio: this.spatialTruth.maximumScreenOverlapRatio,
      screenTruthLatched: this.spatialTruth.screenTruthLatched,
      distantHostViewportCoverage: this.spatialTruth.distantHostViewportCoverage,
      distantHostProjectedDominance: this.spatialTruth.distantHostProjectedDominance,
      routeCorridorsBodyLed: true,
      longConnectorLinesDisabled: true,
      investigationVisualsDelegated: true,
      playerBodyFirstIdentity: true,
      depthLayers: ["foreground", "middle", "background"],
      routeAltitudeTerritories: {
        vascular: "upper",
        graveMemory: "middle",
        siltPressure: "lower"
      },
      orbitalGateBodiesRemoved: true,
      spatialVerification: { ...this.spatialTruth },
      enclosingShellsSuppressed: this.visibleLeakNames.length === 0,
      timerOnlyReadabilityDisabled: true,
      graveConsequenceLayers: [...(this.consequenceLayoutTruth.hierarchy ?? [])],
      returnedCentralCradleQuieted: Boolean(this.consequenceLayoutTruth.centralCradleQuieted),
      returnedConsequenceSilhouettesReadable: Boolean(this.consequenceLayoutTruth.separatedSilhouettesReadable),
      presentationReady: hubPresentationReady
    };
  }

  suppressLegacyHubVisuals() {
    // Preserve the explicit historical ownership handoff while HC-008G also
    // suppresses every later duplicate through the consolidated list below.
    this.setSceneObjectVisible("signal_chorus_layered_interaction_HC006B", false);
    this.setSceneObjectVisible("signal_chorus_combward_pressure_HC005D", false);
    this.setSceneObjectOpacity("signal_chorus_living_tissue_identity_HC006A", 0);
    this.setSceneObjectOpacity("signal_chorus_soft_haze_001", 0);
    for (const name of LEGACY_HUB_VISUALS) {
      this.setSceneObjectVisible(name, false);
    }
  }

  enforceHubSceneGraph(frameState) {
    this.suppressLegacyHubVisuals();
    this.suppressedRootNames = [];

    for (const name of [...NON_HUB_ENVIRONMENT_ROOTS, ...TRANSITION_VISUAL_ARTIFACTS]) {
      const object = this.getSceneObject(name);
      if (!object) continue;
      if (!this.suppressedVisibility.has(name)) {
        this.suppressedVisibility.set(name, object.visible);
      }
      object.visible = false;
      object.userData.suppressedByHubRenderTruth = true;
      this.suppressedRootNames.push(name);
    }

    this.distantHostRoot = this.getSceneObject("host_alpha_distant_silhouette_001");
    if (this.distantHostRoot) {
      this.distantHostRoot.visible = true;
      this.distantHostRoot.userData.hubWorldMeaningOnly = true;
      this.distantHostRoot.userData.presentationRole = "background_anatomy_suggestion";
      this.distantHostRoot.userData.targetingSuppressed = true;
      this.distantHostMode = "background_anatomy_suggestion";
    } else {
      this.distantHostMode = "missing_background_host";
    }

    const enforcedNames = [...NON_HUB_ENVIRONMENT_ROOTS, ...TRANSITION_VISUAL_ARTIFACTS, ...LEGACY_HUB_VISUALS];
    this.visibleLeakNames = enforcedNames.filter((name) => {
      const object = this.getSceneObject(name);
      return Boolean(object && object.visible && this.isEffectivelyVisible(object));
    });

    this.publishHubTargetLifecycle(frameState);
  }

  publishHubTargetLifecycle(frameState) {
    if (frameState.targeting?.targetId && frameState.targeting.targetId !== "none") {
      frameState.hubTargetLifecycle = {
        pass: "HC-009G",
        staleTargetDetected: true,
        staleTargetId: frameState.targeting.targetId,
        visualArtifactsSuppressed: true,
        genericTargetingOwner: "TargetFocusRegistry/TargetingSystem"
      };
    } else {
      frameState.hubTargetLifecycle = {
        pass: "HC-009G",
        staleTargetDetected: false,
        staleTargetId: "none",
        visualArtifactsSuppressed: true,
        genericTargetingOwner: "TargetFocusRegistry/TargetingSystem"
      };
    }
  }

  restoreNonHubVisuals(frameState) {
    for (const name of [...NON_HUB_ENVIRONMENT_ROOTS, ...TRANSITION_VISUAL_ARTIFACTS]) {
      const object = this.getSceneObject(name);
      if (!object) continue;
      if (this.suppressedVisibility.has(name)) {
        object.visible = this.suppressedVisibility.get(name);
      }
      object.userData.suppressedByHubRenderTruth = false;
    }
    this.suppressedVisibility.clear();

    if (this.distantHostRoot) {
      this.distantHostRoot.userData.hubWorldMeaningOnly = false;
      this.distantHostRoot.userData.presentationRole = "macro_host_context";
      this.distantHostMode = "default_world_meaning";
    }

    const identityRoot = this.getSceneObject("signal_chorus_living_tissue_identity_HC006A");
    if (identityRoot) {
      identityRoot.traverse((child) => {
        if (child.name?.includes("signal_chorus_conduction_mote")) child.visible = true;
      });
    }

    if (frameState.activeCellId === SURFACE_CELL_ID) {
      this.setSceneObjectVisible("membrane_watcher_001", true);
    }
    // Other systems run earlier in the frame and remain the source of truth for
    // their own visibility outside Hub mode.
  }

  evaluateSpatialReadability(frameState) {
    if (!this.root || !this.anchor || this.routeVisuals.length !== 3) {
      return this.createEmptySpatialTruth();
    }

    // W2A3: route readability needs Hub transforms, not a whole-scene matrix walk.
    if (this.root?.updateWorldMatrix) this.root.updateWorldMatrix(true, true);
    else this.root?.updateMatrixWorld?.(true);
    this.camera?.updateMatrixWorld?.(true);

    const center = new THREE.Vector3();
    this.anchor.getWorldPosition(center);
    const routePositions = this.routeVisuals.map((item) => {
      const position = new THREE.Vector3();
      item.gate.getWorldPosition(position);
      return {
        id: item.route.id,
        position,
        altitudeBand: item.gate.userData.altitudeBand,
        silhouette: item.route.shape
      };
    });

    let minimumRouteSeparation = Infinity;
    for (let a = 0; a < routePositions.length; a += 1) {
      for (let b = a + 1; b < routePositions.length; b += 1) {
        minimumRouteSeparation = Math.min(
          minimumRouteSeparation,
          routePositions[a].position.distanceTo(routePositions[b].position)
        );
      }
    }

    const minimumCenterClearance = Math.min(
      ...routePositions.map((entry) => entry.position.distanceTo(center))
    );
    const corridorStartClearances = this.routeVisuals.map((item) => {
      const firstBody = item.corridorSegments[0];
      if (!firstBody) return 0;
      const position = new THREE.Vector3();
      firstBody.getWorldPosition(position);
      return position.distanceTo(center);
    });
    const minimumCorridorStartClearance = Math.min(...corridorStartClearances);
    const altitudeBandCount = new Set(routePositions.map((entry) => entry.altitudeBand)).size;
    const silhouetteCount = new Set(routePositions.map((entry) => entry.silhouette)).size;
    const activeRouteCount = this.routeVisuals.filter((item) => item.route.status === "active_route").length;
    const dormantRouteCount = this.routeVisuals.filter((item) => item.route.status === "dormant_route").length;
    const targetStateClear = !frameState?.targeting?.targetId || frameState.targeting.targetId === "none";

    const screenPoints = [];
    const routeScreenBounds = [];
    if (this.camera) {
      for (let index = 0; index < routePositions.length; index += 1) {
        const entry = routePositions[index];
        const projected = entry.position.clone().project(this.camera);
        screenPoints.push({
          id: entry.id,
          x: projected.x,
          y: projected.y,
          z: projected.z,
          inView: Math.abs(projected.x) <= 1.08
            && Math.abs(projected.y) <= 1.08
            && projected.z >= -1
            && projected.z <= 1
        });
        const visual = this.routeVisuals[index];
        routeScreenBounds.push({
          id: entry.id,
          ...this.projectObjectCollectionBounds([
            visual?.territoryBackdrop,
            visual?.gate
          ])
        });
      }
    }

    let minimumScreenSeparation = 0;
    if (screenPoints.length === 3) {
      minimumScreenSeparation = Infinity;
      for (let a = 0; a < screenPoints.length; a += 1) {
        for (let b = a + 1; b < screenPoints.length; b += 1) {
          minimumScreenSeparation = Math.min(
            minimumScreenSeparation,
            Math.hypot(
              screenPoints[a].x - screenPoints[b].x,
              screenPoints[a].y - screenPoints[b].y
            )
          );
        }
      }
    }

    let maximumScreenOverlapRatio = 0;
    if (routeScreenBounds.length === 3) {
      for (let a = 0; a < routeScreenBounds.length; a += 1) {
        for (let b = a + 1; b < routeScreenBounds.length; b += 1) {
          maximumScreenOverlapRatio = Math.max(
            maximumScreenOverlapRatio,
            this.screenBoundsOverlapRatio(routeScreenBounds[a], routeScreenBounds[b])
          );
        }
      }
    }

    const allRouteCentersInView = screenPoints.length === 3
      && screenPoints.every((entry) => entry.inView);
    const allRouteTerritoriesVisible = routeScreenBounds.length === 3
      && routeScreenBounds.every((entry) => entry.intersectsViewport && entry.visibilityFraction >= 0.28);
    const screenRoutesReadable = Boolean(
      allRouteCentersInView
      && allRouteTerritoriesVisible
      && minimumScreenSeparation >= 0.25
      && maximumScreenOverlapRatio <= 0.48
    );
    const distantHostProjection = this.projectObjectCollectionBounds([this.distantHostRoot]);
    const distantHostProjectedDominance = Boolean(
      distantHostProjection.available
      && distantHostProjection.intersectsViewport
      && distantHostProjection.viewportCoverage >= 0.33
    );

    if (screenRoutesReadable && !distantHostProjectedDominance) {
      this.screenTruthStableFrames += 1;
      if (this.screenTruthStableFrames >= 6) this.screenTruthLatched = true;
    } else if (!this.screenTruthLatched) {
      this.screenTruthStableFrames = 0;
    }

    const routeSpacingPhysical = minimumRouteSeparation >= 4.6;
    const centerKeptClear = minimumCenterClearance >= 2.35 && minimumCorridorStartClearance >= 0.66;
    const uniqueTerritories = altitudeBandCount === 3 && silhouetteCount === 3 && this.territoryLandmarks.length === 3;
    const activeDormantContrast = activeRouteCount === 1 && dormantRouteCount === 2;
    const renderOwnershipClean = this.visibleLeakNames.length === 0;
    const verified = Boolean(
      routeSpacingPhysical
      && centerKeptClear
      && uniqueTerritories
      && activeDormantContrast
      && renderOwnershipClean
      && targetStateClear
      && this.screenTruthLatched
    );

    return {
      pass: "HC-010C",
      verified,
      timerOnlyReadabilityDisabled: true,
      screenTruthRequired: true,
      screenTruthLatched: this.screenTruthLatched,
      screenTruthStableFrames: this.screenTruthStableFrames,
      screenRoutesReadable,
      routeSpacingPhysical,
      centerKeptClear,
      uniqueTerritories,
      activeDormantContrast,
      renderOwnershipClean,
      targetStateClear,
      minimumRouteSeparation,
      minimumCenterClearance,
      minimumCorridorStartClearance,
      altitudeBandCount,
      silhouetteCount,
      solidTerritoryLandmarkCount: this.territoryLandmarks.length,
      activeRouteCount,
      dormantRouteCount,
      suppressedRootCount: this.suppressedRootNames.length,
      visibleLeakCount: this.visibleLeakNames.length,
      visibleLeakNames: [...this.visibleLeakNames],
      viewCheckAvailable: Boolean(this.camera),
      allRouteCentersInView,
      allRouteTerritoriesVisible,
      minimumScreenSeparation,
      maximumScreenOverlapRatio,
      screenPoints,
      routeScreenBounds,
      distantHostProjectionMeasured: distantHostProjection.available,
      distantHostViewportCoverage: distantHostProjection.viewportCoverage,
      distantHostProjectedDominance,
      projectedDominanceLimit: 0.33
    };
  }

  projectObjectCollectionBounds(objects) {
    if (!this.camera) return this.emptyProjectedBounds();
    const bounds = new THREE.Box3();
    let available = false;
    for (const object of objects) {
      if (!object || !object.visible) continue;
      const objectBounds = new THREE.Box3().setFromObject(object);
      if (objectBounds.isEmpty()) continue;
      bounds.union(objectBounds);
      available = true;
    }
    if (!available || bounds.isEmpty()) return this.emptyProjectedBounds();

    const { min, max } = bounds;
    const corners = [
      [min.x, min.y, min.z], [min.x, min.y, max.z],
      [min.x, max.y, min.z], [min.x, max.y, max.z],
      [max.x, min.y, min.z], [max.x, min.y, max.z],
      [max.x, max.y, min.z], [max.x, max.y, max.z]
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z).project(this.camera));
    const projectedCenter = bounds.getCenter(new THREE.Vector3()).project(this.camera);
    const minX = Math.min(...corners.map((point) => point.x));
    const maxX = Math.max(...corners.map((point) => point.x));
    const minY = Math.min(...corners.map((point) => point.y));
    const maxY = Math.max(...corners.map((point) => point.y));
    const width = Math.max(0, maxX - minX);
    const height = Math.max(0, maxY - minY);
    const clippedWidth = Math.max(0, Math.min(1, maxX) - Math.max(-1, minX));
    const clippedHeight = Math.max(0, Math.min(1, maxY) - Math.max(-1, minY));
    const clippedArea = clippedWidth * clippedHeight;
    const projectedArea = Math.max(0.000001, width * height);
    const inDepth = projectedCenter.z >= -1 && projectedCenter.z <= 1;

    return {
      available: true,
      minX,
      maxX,
      minY,
      maxY,
      width,
      height,
      centerX: projectedCenter.x,
      centerY: projectedCenter.y,
      centerZ: projectedCenter.z,
      intersectsViewport: Boolean(inDepth && clippedArea > 0),
      visibilityFraction: inDepth ? Math.min(1, clippedArea / projectedArea) : 0,
      viewportCoverage: inDepth ? Math.min(1, clippedArea / 4) : 0
    };
  }

  emptyProjectedBounds() {
    return {
      available: false,
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      intersectsViewport: false,
      visibilityFraction: 0,
      viewportCoverage: 0
    };
  }

  screenBoundsOverlapRatio(a, b) {
    if (!a?.available || !b?.available) return 0;
    const width = Math.max(0, Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX));
    const height = Math.max(0, Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY));
    const intersection = width * height;
    const smallerArea = Math.max(0.000001, Math.min(a.width * a.height, b.width * b.height));
    return Math.min(1, intersection / smallerArea);
  }

  createEmptySpatialTruth() {
    return {
      pass: "HC-010C",
      verified: false,
      timerOnlyReadabilityDisabled: true,
      screenTruthRequired: true,
      screenTruthLatched: false,
      screenTruthStableFrames: 0,
      screenRoutesReadable: false,
      routeSpacingPhysical: false,
      centerKeptClear: false,
      uniqueTerritories: false,
      activeDormantContrast: false,
      renderOwnershipClean: false,
      targetStateClear: false,
      minimumRouteSeparation: 0,
      minimumCenterClearance: 0,
      minimumCorridorStartClearance: 0,
      altitudeBandCount: 0,
      silhouetteCount: 0,
      solidTerritoryLandmarkCount: 0,
      activeRouteCount: 0,
      dormantRouteCount: 0,
      suppressedRootCount: 0,
      visibleLeakCount: 0,
      visibleLeakNames: [],
      viewCheckAvailable: Boolean(this.camera),
      allRouteCentersInView: false,
      allRouteTerritoriesVisible: false,
      minimumScreenSeparation: 0,
      maximumScreenOverlapRatio: 1,
      screenPoints: [],
      routeScreenBounds: [],
      distantHostProjectionMeasured: false,
      distantHostViewportCoverage: 0,
      distantHostProjectedDominance: false,
      projectedDominanceLimit: 0.33
    };
  }

  createRenderTruthState(active) {
    const environmentLeakNames = this.visibleLeakNames.filter((name) =>
      NON_HUB_ENVIRONMENT_ROOTS.includes(name) || LEGACY_HUB_VISUALS.includes(name)
    );
    const transitionLeakNames = this.visibleLeakNames.filter((name) =>
      TRANSITION_VISUAL_ARTIFACTS.includes(name)
    );
    return {
      pass: "HC-010C",
      active: Boolean(active),
      owner: "HubChamberFoundationSystem",
      soleHubSceneGraphOwner: true,
      nonHubEnvironmentSuppressed: Boolean(active && environmentLeakNames.length === 0),
      suppressedRootCount: active ? this.suppressedRootNames.length : 0,
      suppressedRootNames: active ? [...this.suppressedRootNames] : [],
      visibleLeakCount: active ? this.visibleLeakNames.length : 0,
      visibleLeakNames: active ? [...this.visibleLeakNames] : [],
      environmentLeakCount: active ? environmentLeakNames.length : 0,
      transitionLeakCount: active ? transitionLeakNames.length : 0,
      distantHostMode: active ? this.distantHostMode : "default_world_meaning",
      distantHostDominatesChamber: Boolean(active && this.spatialTruth.distantHostProjectedDominance),
      distantHostProjectionMeasured: Boolean(active && this.spatialTruth.distantHostProjectionMeasured),
      distantHostViewportCoverage: active ? this.spatialTruth.distantHostViewportCoverage : 0,
      projectedDominanceLimit: this.spatialTruth.projectedDominanceLimit ?? 0.33,
      screenTruthRequired: true,
      screenTruthLatched: Boolean(active && this.spatialTruth.screenTruthLatched),
      screenRoutesReadable: Boolean(active && this.spatialTruth.screenRoutesReadable),
      genericHubTargetingSuppressed: Boolean(active && this.spatialTruth.targetStateClear),
      transitionArtifactsSuppressed: Boolean(active && transitionLeakNames.length === 0),
      spatialTruth: { ...this.spatialTruth },
      technicalIdsPlayerFacing: false,
      onePrimaryInstruction: true,
      noNewProgression: true
    };
  }

  isEffectivelyVisible(object) {
    let current = object;
    while (current) {
      if (current.visible === false) return false;
      current = current.parent;
    }
    return true;
  }

  getSceneObject(name) {
    const cached = this.sceneObjectCache.get(name);
    if (cached?.parent) return cached;
    const object = this.scene.getObjectByName(name);
    if (object) this.sceneObjectCache.set(name, object);
    return object ?? null;
  }

  setSceneObjectVisible(name, visible) {
    const object = this.getSceneObject(name);
    if (object) object.visible = Boolean(visible);
  }

  setSceneObjectOpacity(name, opacity) {
    const object = this.getSceneObject(name);
    if (!object) return;
    object.traverse((child) => {
      if (!child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = opacity;
      });
    });
  }

  createInspectionFocus(active) {
    const camera = this.recipe.camera ?? {};
    const junctionPosition = this.vector(this.recipe.junction?.position);
    const distance = this.playerRoot.position.distanceTo(junctionPosition);

    return {
      architecturePass: "HC-008G",
      providerId: "HubChamberFoundationSystem",
      id: camera.focusId ?? "hub_junction_anchor_001",
      label: "Hub route territories",
      active: Boolean(active),
      inspectable: true,
      requiredCellId: HUB_CELL_ID,
      position: { x: junctionPosition.x, y: junctionPosition.y + 0.12, z: junctionPosition.z },
      distance,
      toggleRange: camera.assistRange ?? 10.5,
      autoExitRange: camera.assistRange ?? 10.5,
      camera: {
        distance: camera.distance ?? 10.2,
        fieldOfView: camera.fieldOfView ?? 64,
        targetBlendTowardFocus: camera.targetBlendTowardFocus ?? 0.4,
        targetLift: camera.targetLift ?? 0.28,
        baseHeight: camera.baseHeight ?? 1.55,
        pitch: camera.pitch ?? 0.29,
        shoulderOffset: camera.shoulderOffset ?? 0.24,
        forwardOffset: camera.forwardOffset ?? 0,
        maxYawOffset: camera.maxYawOffset ?? 1.3,
        pitchMin: camera.pitchMin ?? -0.02,
        pitchMax: camera.pitchMax ?? 0.58,
        constrainYaw: true,
        showFocusMarker: false,
        blockerOpacity: camera.blockerOpacity ?? 0.045,
        ambientDensityScale: camera.ambientDensityScale ?? 0.18
      }
    };
  }

  publishPromptState(frameState) {
    frameState.promptStack = {
      ...(frameState.promptStack ?? {}),
      hubChamberPresentationLock: this.reveal >= 0.92 && this.spatialTruth.verified
        ? "hub_spatial_territories_verified"
        : "hub_anatomical_junction_revealing",
      hubRouteSelection: "readability_only_existing_route_compatibility",
      activePresentationOwner: "HubChamberFoundationSystem",
      spatialAuthorityPass: "HC-008G",
      note: "Hub investigation owns readings; the foundation alone owns Hub bodies, corridors, effects, and spatial presentation."
    };
  }

  createEmptyCoreSpatialMirrorState() {
    return {
      pass: "HC-026A1",
      active: false,
      source: "spatialCoreChemistry",
      topologyId: "forming_topology",
      topologyLabel: "Forming Topology",
      distribution: "0:0:0",
      cloudPatternId: "none",
      cloudPatternLabel: "Free Cloud",
      mirroredPieceCount: 0,
      deepWeight: 0,
      innerWeight: 0,
      membraneWeight: 0,
      balanceWeight: 0,
      routeTopologyStable: true,
      routeGatesMoved: false,
      routeCorridorsMoved: false,
      exactTelemetryInfluence: 0.22,
      macroRadialContrast: 1.5,
      debugPreview: false,
      debugPreviewMutatesProgression: false,
      pieces: []
    };
  }

  getMirrorEchoForFamily(family) {
    if (family === "grave_memory_retention") return { id: "grave_memory", root: this.graveMemoryEchoRoot };
    if (family === "vascular_rhythm_retention") return { id: "vascular_rhythm", root: this.vascularReturnEchoRoot };
    if (family === "silt_pressure_retention") return { id: "silt_pressure", root: this.siltReturnEchoRoot };
    return { id: "unknown", root: null };
  }

  updateCoreSpatialMirror(frameState, dt, runtimeSeconds) {
    const chemistry = frameState.spatialCoreChemistry ?? {};
    const placements = chemistry.placements ?? [];
    const telemetry = chemistry.cloudTelemetry ?? {};
    const topology = chemistry.topology ?? {};
    const cloudPattern = chemistry.cloudPattern ?? {};
    const complete = Boolean(chemistry.active && placements.length > 0 && this.anchor);
    const counts = chemistry.counts ?? { deep_core: 0, inner_body: 0, membrane: 0 };
    const pieceCount = Math.max(1, placements.length || 3);
    const deepTarget = complete ? (counts.deep_core ?? 0) / pieceCount : 0;
    const innerTarget = complete ? (counts.inner_body ?? 0) / pieceCount : 0;
    const membraneTarget = complete ? (counts.membrane ?? 0) / pieceCount : 0;
    const balanceTarget = topology.id === "three_way_balance" ? 1 : 0;
    const safeDt = Math.max(0, dt);
    this.coreMirrorDeepWeight = THREE.MathUtils.damp(this.coreMirrorDeepWeight, deepTarget, 4.2, safeDt);
    this.coreMirrorInnerWeight = THREE.MathUtils.damp(this.coreMirrorInnerWeight, innerTarget, 4.2, safeDt);
    this.coreMirrorMembraneWeight = THREE.MathUtils.damp(this.coreMirrorMembraneWeight, membraneTarget, 4.2, safeDt);
    this.coreMirrorBalanceWeight = THREE.MathUtils.damp(this.coreMirrorBalanceWeight, balanceTarget, 4.2, safeDt);

    this.coreMirrorAnchor.copy(this.anchor.position);
    const localPositions = new Map((telemetry.localPositions ?? []).map((entry) => [entry.pieceId, entry]));
    const mirrorPieces = [];
    const zoneRadius = { deep_core: 1.55, inner_body: 3.75, membrane: 6.25 };
    const zoneVisualScale = { deep_core: 0.78, inner_body: 1.08, membrane: 1.38 };

    for (const placement of placements) {
      const mirror = this.getMirrorEchoForFamily(placement.family);
      const root = mirror.root;
      if (!root) continue;
      const authored = root.userData.hubMirrorAuthoredPosition ?? root.position;
      this.coreMirrorBaseDirection.copy(authored).sub(this.coreMirrorAnchor);
      if (this.coreMirrorBaseDirection.lengthSq() < 0.0001) this.coreMirrorBaseDirection.set(0, 0, -1);
      this.coreMirrorBaseDirection.normalize();

      const telemetryEntry = localPositions.get(placement.pieceId);
      this.coreMirrorTelemetryDirection.set(
        telemetryEntry?.x ?? this.coreMirrorBaseDirection.x,
        telemetryEntry?.y ?? this.coreMirrorBaseDirection.y,
        telemetryEntry?.z ?? this.coreMirrorBaseDirection.z
      );
      if (this.coreMirrorTelemetryDirection.lengthSq() < 0.0001) this.coreMirrorTelemetryDirection.copy(this.coreMirrorBaseDirection);
      this.coreMirrorTelemetryDirection.normalize();

      // Preserve the Hub's learnable family territory while allowing the exact Core
      // XYZ telemetry to bend the retained echo inside that territory.
      this.coreMirrorTargetDirection.copy(this.coreMirrorBaseDirection)
        .lerp(this.coreMirrorTelemetryDirection, 0.22)
        .normalize();
      const radius = zoneRadius[placement.zoneId] ?? THREE.MathUtils.lerp(1.55, 6.25, placement.depth01 ?? 0.5);
      const visualScale = zoneVisualScale[placement.zoneId] ?? THREE.MathUtils.lerp(0.78, 1.38, placement.depth01 ?? 0.5);
      this.coreMirrorTargetPosition.copy(this.coreMirrorAnchor).addScaledVector(this.coreMirrorTargetDirection, radius);

      const settle = 1 - Math.exp(-Math.max(0, safeDt) * 3.8);
      root.position.lerp(this.coreMirrorTargetPosition, settle);
      const distanceFromHubCenter = root.position.distanceTo(this.coreMirrorAnchor);
      root.userData.hubCoreMirrorZone = placement.zoneId;
      root.userData.hubCoreMirrorDepth01 = placement.depth01 ?? 0;
      root.userData.hubCoreMirrorTargetRadius = radius;
      root.userData.hubCoreMirrorDistance = distanceFromHubCenter;
      root.userData.hubCoreMirrorTelemetryInfluence = 0.22;
      root.userData.hubCoreMirrorZoneVisualScale = visualScale;
      mirrorPieces.push({
        id: mirror.id,
        label: placement.label,
        family: placement.family,
        zoneId: placement.zoneId,
        zoneLabel: placement.zoneLabel,
        depth01: placement.depth01,
        hubRadius: distanceFromHubCenter,
        hubPosition: { x: root.position.x, y: root.position.y, z: root.position.z },
        hubVisualScale: visualScale
      });
    }

    // When chemistry is absent, retained anatomy eases back toward authored Hub positions.
    if (!complete) {
      for (const root of [this.graveMemoryEchoRoot, this.vascularReturnEchoRoot, this.siltReturnEchoRoot]) {
        const authored = root?.userData?.hubMirrorAuthoredPosition;
        if (root && authored) root.position.lerp(authored, 1 - Math.exp(-safeDt * 3.2));
      }
    }

    // Whole-Core topology is echoed by the Hub's central anatomy, not by moving gates.
    const centralSpread = 0.94 + this.coreMirrorInnerWeight * 0.18 + this.coreMirrorMembraneWeight * 0.42 - this.coreMirrorDeepWeight * 0.26;
    const centralPulse = 1 + Math.sin(runtimeSeconds * (1.15 + this.coreMirrorInnerWeight * 0.9)) * (0.012 + this.coreMirrorInnerWeight * 0.022);
    this.anchorPetals.forEach((petal) => {
      const basePosition = petal.userData.basePosition;
      if (basePosition) petal.position.copy(basePosition).multiplyScalar(centralSpread);
      petal.scale.multiplyScalar(centralPulse * (1 + this.coreMirrorBalanceWeight * 0.035));
      if (petal.material) petal.material.emissiveIntensity += this.coreMirrorDeepWeight * 0.08 + this.coreMirrorInnerWeight * 0.06;
    });
    if (this.anchorBasin) {
      const baseScale = this.anchorBasin.userData.baseScale ?? new THREE.Vector3(1.08, 1, 0.8);
      const membraneSpread = 1 + this.coreMirrorMembraneWeight * 0.38 - this.coreMirrorDeepWeight * 0.16;
      this.anchorBasin.scale.set(baseScale.x * membraneSpread, baseScale.y, baseScale.z * membraneSpread);
      this.anchorBasin.material.emissiveIntensity += this.coreMirrorDeepWeight * 0.12 + this.coreMirrorBalanceWeight * 0.08;
    }

    const debugPreview = Boolean(frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded);
    if (complete && debugPreview) {
      for (const root of [this.graveMemoryEchoRoot, this.vascularReturnEchoRoot, this.siltReturnEchoRoot]) {
        if (!root || root.visible) continue;
        root.visible = true;
        root.scale.setScalar(Math.max(0.001, 0.58 * this.reveal));
        root.traverse((child) => {
          const materials = Array.isArray(child.material) ? child.material : child.material ? [child.material] : [];
          materials.forEach((material) => {
            if (Number.isFinite(material.opacity)) material.opacity = Math.max(material.opacity, 0.18 * this.reveal);
            if (Number.isFinite(material.emissiveIntensity)) material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.12 * this.reveal);
          });
        });
      }
    }

    // HC026A1: make the macro mirror legible at a glance. The retained echo's
    // authored biological animation remains intact, but its whole environmental
    // silhouette scales by body zone after that animation has resolved.
    for (const placement of placements) {
      const mirror = this.getMirrorEchoForFamily(placement.family);
      const root = mirror.root;
      if (!root) continue;
      const zoneScale = root.userData.hubCoreMirrorZoneVisualScale ?? 1;
      root.scale.multiplyScalar(zoneScale);
    }

    this.coreSpatialMirror = {
      pass: "HC-026A1",
      active: complete,
      source: "spatialCoreChemistry",
      topologyId: topology.id ?? "forming_topology",
      topologyLabel: topology.label ?? "Forming Topology",
      distribution: topology.distribution ?? "0:0:0",
      cloudPatternId: cloudPattern.stablePatternId ?? "none",
      cloudPatternLabel: cloudPattern.stablePatternLabel ?? "Free Cloud",
      mirroredPieceCount: mirrorPieces.length,
      deepWeight: this.coreMirrorDeepWeight,
      innerWeight: this.coreMirrorInnerWeight,
      membraneWeight: this.coreMirrorMembraneWeight,
      balanceWeight: this.coreMirrorBalanceWeight,
      routeTopologyStable: true,
      routeGatesMoved: false,
      routeCorridorsMoved: false,
      exactTelemetryInfluence: 0.22,
      macroRadialContrast: 1.5,
      zoneRadii: { deep: 1.55, inner: 3.75, membrane: 6.25 },
      debugPreview,
      debugPreviewMutatesProgression: false,
      pieces: mirrorPieces
    };
    frameState.hubCoreSpatialMirror = this.coreSpatialMirror;
    if (this.root) this.root.userData.hubCoreSpatialMirror = this.coreSpatialMirror;
  }

  createState(active, routeIdentityReady = false) {
    const language = this.recipe?.playerFacingLanguage ?? {};
    const firstStatusPageUseComplete = Boolean(this.frameState.statusPage?.firstHubUseComplete);
    const hubInvestigation = this.frameState.hubInvestigationGameplay ?? {};
    const graveHistory = this.frameState.act1RouteHistory ?? {};
    const graveImprintHeld = Boolean(
      graveHistory.graveMemoryImprintCommitted
      || this.frameState.coreGrowth?.graveMemoryImprintCommitted
    );
    const returnedGraveImprint = Boolean(
      graveImprintHeld
      && graveHistory.graveReturned
    );
    const vascularRouteState = graveHistory.routeStates?.vascular_route ?? {};
    const siltRouteState = graveHistory.routeStates?.silt_burrow_route ?? {};
    const returnedVascularCadence = Boolean(
      (graveHistory.vascularReturned || vascularRouteState.returned)
      && (graveHistory.vascularCompleted || vascularRouteState.completed)
      && (graveHistory.vascularCadenceReads ?? this.frameState.vascularRhythmRoute?.lockedCadenceReads ?? 0) >= 3
    );
    const returnedSiltPressure = Boolean(
      (graveHistory.siltReturned || siltRouteState.returned)
      && (graveHistory.siltCompleted || siltRouteState.completed)
      && graveHistory.siltPressureRead
      && graveHistory.siltRibsReleased
      && graveHistory.siltSafeMatterAbsorbed
      && graveHistory.siltDenseMatterLeftIntact
    );
    const convergence = this.frameState.hubInvestigationGameplay?.threeRouteConvergence ?? {};
    const convergenceCompleted = Boolean(
      convergence.completed || graveHistory.hubThreeRouteConvergenceCompleted
    );
    const convergenceActive = Boolean(convergence.available && !convergenceCompleted);
    const siltEntryGate = this.frameState.firstSliceGates?.hub_to_silt_burrow_route ?? {};
    const siltPlayable = Boolean(
      siltEntryGate.awake
      && siltEntryGate.destinationMounted
      && siltEntryGate.playableReady
      && !siltEntryGate.gameplayPending
    );
    const routes = (this.recipe?.routes ?? []).map((route) => {
      const gate = this.frameState.firstSliceGates?.[route.gateId] ?? null;
      const authoredActive = route.status === "active_route";
      const isActive = Boolean(gate?.awake ?? authoredActive);
      const gameplayPending = Boolean(gate?.gameplayPending);
      const retainedRouteState = graveHistory.routeStates?.[route.id] ?? {};
      return {
        id: route.id,
        displayName: route.displayName,
        gateId: route.gateId,
        authoredStatus: route.status,
        runtimeStatus: !active
          ? "not_visible"
          : isActive
            ? (gameplayPending
                ? "awake_gameplay_pending"
                : retainedRouteState.completed && retainedRouteState.returned
                  ? "completed_route_reading_held"
                : routeIdentityReady
                ? ((gate?.crossable || firstStatusPageUseComplete)
                    ? "crossable"
                    : this.frameState.graveRouteLock?.routeLocked
                      ? "completed_route_reading_held"
                      : "readable_self_reading_pending")
                : "listening")
            : "dormant",
        readable: Boolean(active && this.reveal >= 0.58 && this.spatialTruth.verified),
        activeRoute: isActive,
        dormant: !isActive,
        destinationMounted: Boolean(gate?.destinationMounted),
        playableReady: gate?.playableReady !== false,
        gameplayPending,
        completed: Boolean(retainedRouteState.completed),
        returned: Boolean(retainedRouteState.returned),
        altitudeBand: ROUTE_BANDS[route.id] ?? "middle",
        anatomicalCorridor: true,
        read: Boolean(hubInvestigation.routeReads?.includes(route.id)),
        worldMeaning: route.worldMeaning,
        chemistry: route.chemistry,
        position: [...(route.position ?? [0, 0, 0])],
        distanceToPlayer: active
          ? this.playerRoot.position.distanceTo(this.vector(route.position))
          : 0,
        targetingSuppressed: true,
        commitAvailable: this.frameState.hubRouteCommit?.available === true
          && this.frameState.hubRouteCommit?.routeId === route.id,
        commitControl: "A / E"
      };
    });

    const graveFirstDestination = routes.find((route) => route.id === "grave_memory_route") ?? null;
    const firstDestinationBodyRevealed = Boolean(
      active
      && routeIdentityReady
      && this.reveal >= 0.58
      && this.routeIdentityReveal >= 0.58
    );
    const firstDestinationInvitationActive = Boolean(
      firstDestinationBodyRevealed
      && !graveHistory.graveEntered
      && graveFirstDestination?.activeRoute
      && graveFirstDestination?.destinationMounted
      && graveFirstDestination?.playableReady
      && !graveFirstDestination?.gameplayPending
    );
    const firstDestinationBlocker = !active
      ? "hub_inactive"
      : graveHistory.graveEntered
        ? "grave_already_entered"
        : !firstDestinationBodyRevealed
          ? "route_body_revealing"
          : !graveFirstDestination?.activeRoute
            ? "grave_route_not_awake"
            : !graveFirstDestination?.destinationMounted
              ? "grave_destination_preparing"
              : graveFirstDestination?.playableReady === false || graveFirstDestination?.gameplayPending
                ? "grave_destination_not_playable"
                : "none";
    const firstDestinationInvitation = {
      pass: "HC-031P1",
      active: firstDestinationInvitationActive,
      blocker: firstDestinationBlocker,
      routeId: "grave_memory_route",
      gateId: "hub_to_grave_memory_route",
      displayName: graveFirstDestination?.displayName ?? "Grave Memory",
      distanceToPlayer: graveFirstDestination?.distanceToPlayer ?? 0,
      bodyCue: "existing_corridor_wave_from_hub_center_to_grave",
      bodyRevealProgress: Math.min(this.reveal, this.routeIdentityReveal),
      wholeHubScreenTruthVerified: Boolean(this.spatialTruth.verified),
      screenTruthRequiredForCommit: false,
      commitControl: "A / E",
      deliberateCommitRequired: true,
      automaticCrossing: false,
      progressionAuthority: false,
      transitionOwner: "LocalCellBoundaryMorphSystem"
    };

    const combGate = this.frameState.firstSliceGates?.hub_to_comb_threshold ?? null;
    const combWorldPosition = this.combwardBodyRoot
      ? this.combwardBodyRoot.getWorldPosition(this.tempDirection).clone()
      : new THREE.Vector3(1.05, 0.28, -0.06);
    const thresholds = convergenceCompleted ? [{
      id: "comb_threshold",
      displayName: "Comb Threshold",
      gateId: "hub_to_comb_threshold",
      authoredStatus: "foundation_bound_threshold",
      runtimeStatus: combGate?.crossable ? "crossable" : "readable_convergence_held",
      readable: Boolean(active && this.combwardBodyRoot?.visible),
      activeRoute: Boolean(combGate?.awake),
      dormant: !combGate?.awake,
      destinationMounted: Boolean(combGate?.destinationMounted),
      playableReady: combGate?.playableReady !== false,
      gameplayPending: Boolean(combGate?.gameplayPending),
      crossable: Boolean(combGate?.crossable),
      completed: false,
      returned: Boolean(graveHistory.combReturned),
      position: [combWorldPosition.x, combWorldPosition.y, combWorldPosition.z],
      distanceToPlayer: active ? this.playerRoot.position.distanceTo(combWorldPosition) : 0,
      targetingSuppressed: true,
      commitAvailable: this.frameState.hubRouteCommit?.available === true
        && this.frameState.hubRouteCommit?.routeId === "comb_threshold",
      commitControl: "A / E",
      worldMeaning: "the three retained readings enter one ceremonial living filter",
      chemistry: ["signal", "scar", "form", "residue"]
    }] : [];

    const junctionReadable = Boolean(active && this.reveal >= 0.42);
    const layoutReadable = Boolean(active && this.reveal >= 0.62 && this.spatialTruth.verified);
    const memoryReadable = Boolean(active && this.reveal >= 0.58);
    const activeRouteDistinguished = Boolean(layoutReadable && routeIdentityReady && this.routeIdentityReveal >= 0.82);
    const complete = Boolean(junctionReadable && layoutReadable && memoryReadable && activeRouteDistinguished);
    const fullHubComplete = Boolean(complete);
    const routeCommit = this.frameState.hubRouteCommit ?? {};
    const cameraMode = !active
      ? "inactive"
      : this.reveal < 0.78
        ? "hub_establishing_whole_junction"
        : "player_tethered_territory_exploration";
    const coreGrowth = this.frameState.coreGrowth ?? {};
    const coreGrowthRecognized = Boolean(
      active
      && this.reveal >= 0.58
      && (coreGrowth.growthProgress ?? 0) >= 0.18
    );
    const latestReturnedRouteId = returnedVascularCadence
      ? "vascular_route"
      : returnedGraveImprint
        ? "grave_memory_route"
        : "grave_memory_route";
    const latestReturnedRouteGateId = latestReturnedRouteId === "vascular_route"
      ? "hub_to_vascular_route"
      : "hub_to_grave_memory_route";

    return {
      pass: "HC-028F1",
      id: this.recipe?.id ?? RECIPE_ID,
      active: Boolean(active),
      stage: !active
        ? "hub_foundation_inactive"
        : complete
          ? "hub_spatial_authority_readable"
          : routeIdentityReady
            ? "hub_anatomical_territories_separating"
            : "hub_junction_revealing_around_chorus",
      status: complete ? "hub_chamber_spatial_authority_complete" : active ? "hub_chamber_foundation_revealing" : "inactive",
      progress: active ? Math.min(1, (this.reveal * 0.72) + (this.routeIdentityReveal * 0.28)) : 0,
      ready: complete,
      completed: complete,
      sourceCellId: HUB_CELL_ID,
      regionId: "hub_chamber",
      modeOwner: "HubMode",
      registryOwner: "RegionRegistry/GateRegistry/ObjectiveRegistry",
      visualOwner: "HubChamberFoundationSystem",
      promptOwner: "HubChamberFoundationSystem",
      spatialAuthorityPass: "HC-008G",
      renderTruthPass: "HC-010C",
      growthReflectionPass: "HC-009D",
      spatialAuthorityRoot: this.root?.name ?? "hub_chamber_spatial_authority_HC008G",
      singleCompositionOwner: true,
      investigationVisualAuthorityDelegated: true,
      presentationOwnershipLocked: Boolean(active),
      legacySignalPresentationSuppressed: Boolean(active),
      currentFocus: active ? "hub_junction_anchor_001" : "none",
      focusObjectId: active ? "hub_junction_anchor_001" : "none",
      focusDistance: active ? this.playerRoot.position.distanceTo(this.vector(this.recipe?.junction?.position)) : 0,
      centralAnchorReadable: junctionReadable,
      threeRouteLayoutReadable: layoutReadable,
      spatialReadabilityVerified: Boolean(this.spatialTruth.verified),
      timerOnlyReadabilityDisabled: true,
      firstMemoryFragmentReadable: memoryReadable,
      activeRouteIdentityDistinguished: activeRouteDistinguished,
      activeRouteId: latestReturnedRouteId,
      activeRouteGateId: latestReturnedRouteGateId,
      activeRouteRuntimeCompatibility: latestReturnedRouteId === "vascular_route"
        ? "CELL_VASCULAR_RHYTHM_ROUTE_001"
        : latestReturnedRouteId === "silt_burrow_route"
          ? "CELL_SILT_PRESSURE_ROUTE_001"
          : "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
      routeCount: routes.length,
      routeCorridorCount: routes.length,
      solidTerritoryLandmarkCount: this.territoryLandmarks.length,
      activeRouteCount: routes.filter((route) => route.activeRoute).length,
      dormantRouteCount: routes.filter((route) => route.dormant).length,
      awakeRouteIds: routes.filter((route) => route.activeRoute).map((route) => route.id),
      gameplayPendingRouteIds: routes.filter((route) => route.gameplayPending).map((route) => route.id),
      mountedDestinationCount: routes.filter((route) => route.destinationMounted).length,
      routeContractsAwake: Boolean(graveHistory.graveReturned && routes.filter((route) => route.activeRoute).length === 3),
      siltPressurePlayable: siltPlayable,
      routes,
      firstDestinationInvitation,
      thresholds,
      thresholdCount: thresholds.length,
      activeThresholdCount: thresholds.filter((threshold) => threshold.activeRoute).length,
      crossableThresholdIds: thresholds.filter((threshold) => threshold.crossable).map((threshold) => threshold.id),
      routeActivated: false,
      routeEntryRetained: Boolean(this.frameState.act1RouteHistory?.graveEntered),
      routeReturnRetained: Boolean(graveHistory.graveReturned),
      returnedReadings: {
        graveMemory: {
          routeId: "grave_memory_route",
          retained: returnedGraveImprint,
          hostFunction: "memory_residue",
          returnSignature: "retained_memory_imprint",
          historyOwner: "LocalCellBoundaryMorphSystem",
          coreInterpretationOwner: "CoreGrowthSystem",
          hubPresentationOwner: "HubChamberFoundationSystem"
        },
        vascularRhythm: {
          routeId: "vascular_route",
          retained: returnedVascularCadence,
          hostFunction: "rhythm_current",
          returnSignature: "synchronized_return_current",
          historyOwner: "LocalCellBoundaryMorphSystem",
          coreInterpretationOwner: "CoreGrowthSystem",
          hubPresentationOwner: "HubChamberFoundationSystem"
        },
        siltPressure: {
          routeId: "silt_burrow_route",
          retained: returnedSiltPressure,
          hostFunction: "pressure_density",
          returnSignature: "released_return_breath",
          historyOwner: "LocalCellBoundaryMorphSystem",
          coreInterpretationOwner: "CoreGrowthSystem",
          hubPresentationOwner: "HubChamberFoundationSystem"
        }
      },
      returnReadingCount: Number(returnedGraveImprint) + Number(returnedVascularCadence) + Number(returnedSiltPressure),
      returnRecompositionState: returnedGraveImprint && returnedVascularCadence && returnedSiltPressure
        ? "three_reading_host_recomposition"
        : (returnedGraveImprint || returnedVascularCadence || returnedSiltPressure)
          ? "partial_host_recomposition"
          : "none",
      returnRecompositionGameplayAuthority: false,
      graveMemoryImprintRecognized: graveImprintHeld,
      graveMemoryTraceIntegrity: graveHistory.graveTraceIntegrity
        ?? coreGrowth.graveMemoryTraceIntegrity
        ?? 0,
      graveMemoryRecoilRecovered: Boolean(
        graveHistory.graveResidueRecoilRecovered
        || coreGrowth.graveResidueRecoilRecovered
      ),
      graveMemoryReflectionMechanism: "existing_grave_comparison_leaf_pearl_dark_echo",
      graveMemoryTerritoryEchoMechanism: "separated_grave_territory_tissue_echo_HC010E",
      returnedMemoryEchoedByExistingCradle: returnedGraveImprint,
      graveMemoryTerritoryEchoVisible: Boolean(
        active
        && returnedGraveImprint
        && this.graveMemoryEchoRoot?.visible
      ),
      vascularRhythmRetained: returnedVascularCadence,
      vascularCadenceReads: graveHistory.vascularCadenceReads
        ?? this.frameState.vascularRhythmRoute?.lockedCadenceReads
        ?? 0,
      vascularSynchronization: graveHistory.vascularSynchronization ?? 0,
      vascularCirculationIntegrity: graveHistory.vascularCirculationIntegrity ?? 0,
      vascularDesynchronizationRecovered: Boolean(graveHistory.vascularDesynchronizationRecovered),
      vascularCoreFilamentVisible: Boolean(this.frameState.coreEmbodiment?.visibleVascularReturnFilament),
      vascularHubEchoVisible: Boolean(active && returnedVascularCadence && this.vascularReturnEchoRoot?.visible),
      vascularReturnConsequencePass: "HC-011B",
      vascularHubEchoFilamentCount: this.vascularReturnEchoFilaments.length,
      vascularHubEchoValveCount: this.vascularReturnEchoValves.length,
      vascularHubEchoChargeCount: this.vascularReturnEchoCharge ? 1 : 0,
      vascularReturnObjectDefiningRings: 0,
      vascularReturnTriggerMarkers: 0,
      graveMemoryConsequenceLayout: { ...this.consequenceLayoutTruth },
      postRouteCentralCradleQuieted: Boolean(
        active
        && returnedGraveImprint
        && this.consequenceLayoutTruth.centralCradleQuieted
      ),
      postRouteLayerHierarchy: active && returnedSiltPressure && returnedVascularCadence && returnedGraveImprint
        ? ["immediate_core_guide_and_retained_anatomy", "objective_three_return_echoes", "background_host_anatomy"]
        : active && returnedSiltPressure
          ? ["immediate_core_guide_and_silt_adaptation", "objective_lower_silt_echo", "retained_vascular_and_grave_echoes", "background_host_anatomy"]
          : active && returnedVascularCadence
            ? ["immediate_core_guide_and_filament", "objective_upper_vascular_echo", "retained_grave_echo", "background_host_anatomy"]
            : active && returnedGraveImprint
              ? ["immediate_core_and_guide", "objective_grave_echo", "background_host_anatomy"]
              : active
                ? ["immediate_player", "objective_route_territories", "background_host_anatomy"]
                : [],
      postRouteConsequenceSilhouettesReadable: Boolean(
        active
        && returnedGraveImprint
        && this.consequenceLayoutTruth.separatedSilhouettesReadable
      ),
      activeRouteReadable: Boolean(complete),
      activeRouteCrossable: Boolean(fullHubComplete),
      departurePrerequisite: "hub_world_investigation_complete",
      newRouteContentActivated: false,
      targetRequired: false,
      inputRequired: false,
      movementRequired: false,
      statusPageIntroduced: firstStatusPageUseComplete,
      statusPageProgressionAuthority: false,
      statusPageOptionalReferenceUI: true,
      cameraMode,
      establishingCameraDistance: this.recipe?.camera?.distance ?? 8.6,
      establishingFieldOfView: this.recipe?.camera?.fieldOfView ?? 60,
      normalCameraDistance: returnedGraveImprint
        ? (this.recipeDataSystem.data.graveMemoryRouteCircuit?.hubReturnPresentation?.cameraDistance ?? 6.35)
        : (this.recipe?.camera?.explorationDistance ?? 6.6),
      normalFieldOfView: returnedGraveImprint
        ? (this.recipeDataSystem.data.graveMemoryRouteCircuit?.hubReturnPresentation?.fieldOfView ?? 56)
        : (this.recipe?.camera?.explorationFieldOfView ?? 56),
      guideFocusCameraPreserved: true,
      playerBodyFirstIdentity: true,
      longConnectorLinesDisabled: true,
      idleGlobalRingsDisabled: true,
      enclosingShellsSuppressed: this.visibleLeakNames.length === 0,
      staleRegionTargetsSuppressed: Boolean(this.frameState.targetFocus?.suppressTargeting),
      hubRenderTruth: { ...this.spatialTruth },
      coreGrowthRecognized,
      recognizedCoreStage: coreGrowth.stageId ?? "seed_core",
      recognizedCoreBias: coreGrowth.biasLabel ?? "balanced_first_binding",
      recognizedCoreGrowthProgress: coreGrowth.growthProgress ?? 0,
      growthReflectionMechanism: "comparison_cradle_material_echo",
      inheritedLivingState: this.inheritedLivingState,
      inheritedLivingStateSequence: this.inheritedLivingStateSequence,
      inheritedLivingStateAge: this.inheritedLivingStateAge,
      inheritedLivingQualities: { ...this.inheritedLivingQualities },
      livingStateOwner: "SurfaceWakeGameplaySystem",
      livingStateMemoryEchoPass: "HC-023D",
      livingStateMemoryEchoScope: "central_cradle_and_ambient_drift_only",
      livingStateMemoryEchoWeight: active ? this.livingStateMemoryWeight() : 0,
      livingStateAffectsRoutes: false,
      livingStateAffectsProgression: false,
      livingStateAffectsCamera: false,
      livingStateAffectsMovement: false,
      hubCoreSpatialMirrorPass: "HC-026A1",
      hubCoreSpatialMirrorActive: Boolean(active && this.coreSpatialMirror.active),
      hubCoreSpatialMirrorTopology: this.coreSpatialMirror.topologyLabel,
      hubCoreSpatialMirrorDistribution: this.coreSpatialMirror.distribution,
      hubCoreSpatialMirrorCloudPattern: this.coreSpatialMirror.cloudPatternLabel,
      hubCoreSpatialMirrorPieces: [...(this.coreSpatialMirror.pieces ?? [])],
      hubCoreSpatialMirrorRouteTopologyStable: true,
      hubCoreSpatialMirrorMovesGates: false,
      hubCoreSpatialMirrorMovesCorridors: false,
      crossRoomConsequence: Boolean(coreGrowthRecognized || graveImprintHeld || returnedVascularCadence || returnedSiltPressure || (active && this.livingStateMemoryWeight() > 0) || (active && this.coreSpatialMirror.active)),
      returnedSiltPressure,
      visibleSiltReturnEcho: Boolean(this.siltReturnEchoRoot?.visible),
      siltReturnEchoPlateCount: this.siltReturnEchoPlates.length,
      siltReturnEchoPorousNodeCount: this.siltReturnEchoPorousNode ? 1 : 0,
      siltReturnEchoResidueNodeCount: this.siltReturnEchoResidueNodes.length,
      threeRouteReadingsRetained: Boolean(returnedGraveImprint && returnedVascularCadence && returnedSiltPressure),
      threeRouteConvergenceActive: convergenceActive,
      threeRouteConvergenceCompleted: convergenceCompleted,
      threeRouteConvergenceProgress: convergenceCompleted ? 1 : (convergence.progress ?? 0),
      threeRouteConvergenceMode: "automatic_return_resolution_to_comb_selector",
      threeRouteConvergenceRouteOrderIndependent: true,
      threeRouteConvergenceChecklistTriggers: false,
      combwardBodyReadable: Boolean(convergenceCompleted && this.combwardBodyRoot?.visible),
      combThresholdCrossable: Boolean(thresholds[0]?.crossable),
      convergenceTendrilCount: this.threeRouteConvergenceTendrils.length,
      combwardSealedRibCount: this.combwardRibs.length,
      directObjectiveMutationByGrowth: false,
      directGateMutationByGrowth: false,
      depthLayerCount: 3,
      depthLayers: ["foreground", "middle", "background"],
      routeAltitudeTerritories: {
        vascular_route: "upper",
        grave_memory_route: "middle",
        silt_burrow_route: "lower"
      },
      guideLine: routeCommit.available
        ? `${routeCommit.displayName} is awake. A commits to this destination and the Hub carries the Core into its mouth.`
        : convergenceCompleted
        ? (convergence.guideLine ?? "Memory, rhythm, and pressure now move as one reading without losing their differences.")
        : convergenceActive
        ? (convergence.guideLine ?? "The three returned readings are resolving into one Combward destination.")
        : returnedSiltPressure
        ? (this.recipeDataSystem.data.siltPressureReturnConsequence?.playerFacingLanguage?.guideLine
          ?? "The Core and lower Hub tissue now brace around the same selective pressure reading.")
        : returnedVascularCadence
        ? (this.recipeDataSystem.data.vascularRhythmReturnConsequence?.playerFacingLanguage?.guideLine
          ?? "The Core and upper Hub tissue now keep the same returned Vascular cadence.")
        : returnedGraveImprint
        ? "The Grave did not return as cargo. Its pearl now wakes two different rhythms in the Hub."
        : fullHubComplete
        ? "The three territories and the core now read together. Grave Memory can be crossed."
        : complete
          ? "Three route bodies stand apart. Read each territory, the suspended memory, then yourself."
          : (language.revealingGuide ?? "The Chorus is becoming a junction."),
      objectiveLine: routeCommit.available
        ? `Press A to enter ${routeCommit.displayName}.`
        : convergenceCompleted
        ? "The combined reading has opened the Comb Threshold foundation. Aperture remains sealed beyond it."
        : convergenceActive
        ? (convergence.objectiveLine ?? "Approach the Combward body when it wakes and press A to commit.")
        : returnedSiltPressure
        ? (this.recipeDataSystem.data.siltPressureReturnConsequence?.playerFacingLanguage?.objectiveLine
          ?? "All three route readings are retained separately in the Hub.")
        : returnedVascularCadence
        ? siltPlayable
          ? "Vascular Rhythm is retained. Silt Pressure now accepts passage."
          : (this.recipeDataSystem.data.vascularRhythmReturnConsequence?.playerFacingLanguage?.objectiveLine
            ?? "Vascular Rhythm is retained. Silt Pressure remains awake but closed.")
        : returnedGraveImprint
        ? "Grave Memory is retained. Vascular Rhythm accepts passage; Silt Pressure answers but remains closed."
        : fullHubComplete
        ? "First-slice Hub reading complete. Grave Memory is crossable; the two dormant routes remain closed."
        : complete
          ? "Move among the separated route bodies; Pulse is optional inquiry, not a departure requirement."
          : (language.revealingObjective ?? "Let the anatomical route territories finish separating."),
      nextAction: routeCommit.available
        ? `Press A to commit to ${routeCommit.displayName}.`
        : convergenceCompleted
        ? "Move to the six-rib Combward body; press A when it brightens to commit to passage."
        : convergenceActive
        ? (convergence.nextAction ?? convergence.objectiveLine ?? "Let the returned route consequences resolve; then approach the Combward destination.")
        : returnedSiltPressure
        ? (this.recipeDataSystem.data.siltPressureReturnConsequence?.playerFacingLanguage?.nextAction
          ?? "Observe the three retained route readings; convergence is the next pass.")
        : returnedVascularCadence
        ? siltPlayable
          ? "Enter the lower Silt body. Pulse its compression, brace the ribs, and choose porous matter carefully."
          : (this.recipeDataSystem.data.vascularRhythmReturnConsequence?.playerFacingLanguage?.nextAction
            ?? "Observe the shared cadence; no additional Vascular trigger is required.")
        : returnedGraveImprint
        ? "Enter the upper Vascular body, follow its moving charge, and pulse when each valve brightens."
        : fullHubComplete
        ? "Approach Grave Memory; press A when its body brightens to commit to passage."
        : hubInvestigation.investigationReady
          ? "The Hub reading is complete. Choose which living condition draws your attention."
          : complete
            ? "Approach the awake route body you want to enter and press A when it brightens."
            : (language.nextAction ?? "Let the junction finish separating its route identities."),
      blocker: fullHubComplete
        ? "none_detected"
        : complete
            ? "hub_spatial_investigation_pending"
            : routeIdentityReady ? "hub_layout_still_revealing" : "hub_route_identity_readiness_pending",
      noTeleport: true,
      noBranchMenu: true,
      noForcedRelocation: true,
      deliberateGuidedRouteCommit: true,
      routeCommitControl: "A / E",
      noCombat: true,
      fullHubComplete,
      fullHubPending: !fullHubComplete,
      firstStatusPageUseComplete,
      remainingBlueprintRequirement: fullHubComplete ? "none" : "hub_spatial_readability",
      nextRecommendedPass: convergenceCompleted
        ? "Enter Comb Threshold, read its living filter anatomy, then return through the three-part fold."
        : returnedSiltPressure
        ? "Complete the HC-012C continuous spiral weave in the Hub."
        : returnedVascularCadence
        ? siltPlayable
          ? "Complete Silt Pressure, return to the Hub, then read the three retained route consequences together."
          : "HC-012A — author the still-closed Silt Pressure playable route without changing the retained Vascular cadence."
        : returnedGraveImprint
        ? "HC-011B — preserve the Vascular cadence as a visible Core and Hub consequence after return."
        : fullHubComplete
        ? "Pulse the Grave Memory body to test HC-010B, then return through the remembered fold"
        : "Complete the existing Hub investigation and Status self-reading"
    };
  }

  createTissueMaterial(color, {
    emissive = color,
    emissiveIntensity = 0.04,
    opacity = 0,
    roughness = 0.68,
    depthWrite = true
  } = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity,
      roughness,
      metalness: 0,
      transparent: true,
      opacity,
      depthWrite,
      side: THREE.DoubleSide
    });
  }

  setVisible(visible) {
    if (this.root) this.root.visible = Boolean(visible);
  }

  vector(values) {
    const [x = 0, y = 0, z = 0] = values ?? [];
    return new THREE.Vector3(x, y, z);
  }
}
