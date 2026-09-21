import * as THREE from "three";

const RECIPE_ID = "FIRST_SLICE_COHESION_HC007E";
const SURFACE_CELL = "CELL_MEMBRANE_NURSERY_001";
const GUIDE_CELL = "CELL_SCAR_FLOW_FOLD_001";
const HUB_CELL = "CELL_SIGNAL_CHORUS_NERVE_001";

/**
 * HC-007E is an observational continuity layer. It remembers practiced verbs
 * and regional lessons, then reflects them on the core. It never completes a
 * trigger, objective, gate, route, or ability unlock.
 */
export class FirstSliceCohesionSystem {
  constructor({ recipeDataSystem, playerRoot, frameState }) {
    if (!recipeDataSystem || !playerRoot || !frameState) {
      throw new Error("[FirstSliceCohesionSystem] recipeDataSystem, playerRoot, and frameState are required.");
    }
    this.recipeDataSystem = recipeDataSystem;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.recipe = null;
    this.root = null;
    this.lessonRings = new Map();
    this.practiceBeads = new Map();
    this.visitedCells = new Set();
    this.lessonScores = new Map([[SURFACE_CELL, 0], [GUIDE_CELL, 0], [HUB_CELL, 0]]);
    this.pulseEvents = new Set();
    this.maxAbsorbedObjects = 0;
    this.stabilizeSeconds = 0;
    this.lastAbsorbedCount = 0;
    this.lastPulseEventId = 0;
    this.practice = { reading: 0, binding: 0, stabilizing: 0 };
    this.practiceBalance = { reading: 1 / 3, binding: 1 / 3, stabilizing: 1 / 3 };
    this.sliceLockCriteria = {
      nurseryAgencyProven: false,
      surfaceFoldCompleted: false,
      bindingCoreCommitted: false,
      guidePressureTested: false,
      hubGrowthRecognized: false,
      hubInvestigationReady: false,
      hubSelfReadingComplete: false,
      graveMemoryCrossable: false
    };
    this.sliceLockReady = false;
    this.sliceLockCommittedAt = null;

    this.firstMinuteComplete = false;
    this.firstMinuteCommittedAt = null;
    this.firstMinuteStage = "wake";
    this.firstMinuteStageLabel = "Wake inside the living nursery";
    this.firstMinuteNextAction = "Move, Pulse, and learn what the nursery answers.";
    this.firstMinuteContinuityLine = "You are a Seed Core inside living Host tissue.";
  }

  init() {
    this.recipe = this.recipeDataSystem.data.firstSliceCohesion;
    if (!this.recipe || this.recipe.id !== RECIPE_ID) {
      throw new Error(`[FirstSliceCohesionSystem] Missing ${RECIPE_ID}.`);
    }
    this.createVisuals();
    this.frameState.firstSliceCohesion = this.createState();
  }

  update(dt, frameState) {
    const cellId = frameState.activeCellId;
    if ([SURFACE_CELL, GUIDE_CELL, HUB_CELL].includes(cellId)) this.visitedCells.add(cellId);

    const input = frameState.input ?? {};
    const pulseEventId = input.pulseEventId ?? 0;
    if (input.pulsePressed && pulseEventId > 0 && pulseEventId !== this.lastPulseEventId) {
      this.lastPulseEventId = pulseEventId;
      this.pulseEvents.add(pulseEventId);
    }
    if (input.stabilizeHeld) this.stabilizeSeconds += Math.max(0, dt);

    const absorbedCount = Math.max(0, frameState.chemObjectState?.absorbedObjects ?? 0);
    this.maxAbsorbedObjects = Math.max(this.maxAbsorbedObjects, absorbedCount);
    this.lastAbsorbedCount = absorbedCount;

    this.captureRegionLessons(frameState);
    this.computePractice(frameState);
    this.captureFirstMinute(frameState);
    this.captureSliceLock(frameState);
    this.animate(frameState.runtimeSeconds ?? 0, cellId);
    frameState.firstSliceCohesion = this.createState();
  }

  captureFirstMinute(frameState) {
    const cellId = frameState.activeCellId ?? "none";
    const surface = frameState.surfaceWakeLayeredInteraction ?? {};
    const surfaceMorph = frameState.localCellMorph ?? {};
    const guideGameplay = frameState.guideThresholdGameplay ?? {};
    const guide = frameState.guideThresholdLayeredInteraction ?? {};
    const secondMorph = frameState.secondLocalCellMorph ?? {};
    const hubFoundation = frameState.hubChamberFoundation ?? {};
    const tender = frameState.tenderCompanion ?? {};

    const surfaceLessonComplete = Boolean(
      surface.completed ||
      surfaceMorph.completed ||
      cellId !== SURFACE_CELL
    );
    const guideLessonComplete = Boolean(
      guide.completed ||
      secondMorph.completed ||
      cellId === HUB_CELL
    );
    const hubArrivalStable = Boolean(
      cellId === HUB_CELL &&
      (secondMorph.completed || hubFoundation.active || hubFoundation.completed)
    );

    if (!surfaceLessonComplete) {
      this.firstMinuteStage = "wake";
      this.firstMinuteStageLabel = "Wake inside the living nursery";
      this.firstMinuteNextAction =
        surface.nextAction ??
        frameState.surfaceWakeEcology?.nextAction ??
        "Move, Pulse, and learn what the nursery answers.";
      this.firstMinuteContinuityLine = tender.bonded
        ? "The Tender has begun to trust the Core."
        : "The nursery is deciding whether the Core is careful enough to trust.";
    } else if (cellId === SURFACE_CELL && !surfaceMorph.completed) {
      this.firstMinuteStage = "fold";
      this.firstMinuteStageLabel = "Let the nursery become the listening fold";
      this.firstMinuteNextAction =
        surfaceMorph.nextAction ??
        "Stay in control while the living membrane folds around the Core.";
      this.firstMinuteContinuityLine = "The Host is changing shape instead of opening a doorway.";
    } else if (!guideLessonComplete || cellId === GUIDE_CELL) {
      this.firstMinuteStage = "follow_current";
      this.firstMinuteStageLabel = "Move with the Guide Threshold current";
      this.firstMinuteNextAction =
        guide.nextAction ??
        guideGameplay.nextAction ??
        secondMorph.nextAction ??
        "Move with the current, Pulse what answers, and let the fold become signal tissue.";
      this.firstMinuteContinuityLine = tender.bonded
        ? "Guide reads the route; the bonded Tender follows as care."
        : "The Guide reads the living current while the nursery remains behind.";
    } else if (!hubArrivalStable) {
      this.firstMinuteStage = "becoming_hub";
      this.firstMinuteStageLabel = "Let the current become the Hub junction";
      this.firstMinuteNextAction =
        secondMorph.nextAction ??
        "Keep moving while the Signal Chorus settles into a readable junction.";
      this.firstMinuteContinuityLine = "The same tissue is reorganizing into a place of choices.";
    } else {
      this.firstMinuteStage = "hub_arrival";
      this.firstMinuteStageLabel = "Hub junction reached";
      this.firstMinuteNextAction =
        hubFoundation.nextAction ??
        "Read the junction before choosing a deeper route.";
      this.firstMinuteContinuityLine = tender.bonded
        ? "First minute complete: Guide interprets, Tender cares, and the Host opens into a junction."
        : "First minute complete: the Guide has led the Core into a living junction.";
      this.firstMinuteComplete = true;
      if (this.firstMinuteCommittedAt == null) {
        this.firstMinuteCommittedAt = frameState.runtimeSeconds ?? 0;
      }
    }

    frameState.firstMinuteExperience = {
      pass: "HC-016R",
      milestone: "surface_wake_to_guide_threshold_to_hub",
      stage: this.firstMinuteStage,
      stageLabel: this.firstMinuteStageLabel,
      nextAction: this.firstMinuteNextAction,
      continuityLine: this.firstMinuteContinuityLine,
      complete: this.firstMinuteComplete,
      committedAt: this.firstMinuteCommittedAt,
      criteria: {
        surfaceLessonComplete,
        guideLessonComplete,
        hubArrivalStable
      },
      authoritativeProgression: false,
      triggerOwnership: "existing_local_cell_and_morph_systems",
      regionExpansion: false
    };
  }

  captureSliceLock(frameState) {
    const criteria = this.sliceLockCriteria;
    criteria.nurseryAgencyProven = criteria.nurseryAgencyProven
      || Boolean(frameState.surfaceWakeGameplay?.materialPassageOpen)
      || Boolean(frameState.nurseryCircuit?.materialPassage?.state === "open")
      || (
        frameState.activeCellId !== "CELL_MEMBRANE_NURSERY_001"
        && Boolean(frameState.coreGrowth?.nurseryAgencyProven)
      );
    criteria.surfaceFoldCompleted = criteria.surfaceFoldCompleted
      || Boolean(frameState.surfaceWakeLayeredInteraction?.completed)
      || Boolean(frameState.firstSliceObjectives?.surface_absorb_first_nutrient?.complete);
    criteria.bindingCoreCommitted = criteria.bindingCoreCommitted
      || Boolean(frameState.coreGrowth?.firstGrowthCommitted);
    criteria.guidePressureTested = criteria.guidePressureTested
      || Boolean(frameState.coreGrowth?.guidePressureTested)
      || Boolean(frameState.guideThresholdGameplay?.coreGrowthPressureTested);
    criteria.hubGrowthRecognized = criteria.hubGrowthRecognized
      || Boolean(frameState.coreGrowth?.hubReflectionObserved)
      || Boolean(frameState.hubChamberFoundation?.coreGrowthRecognized);
    criteria.hubInvestigationReady = criteria.hubInvestigationReady
      || Boolean(frameState.hubInvestigationGameplay?.investigationReady);
    criteria.hubSelfReadingComplete = criteria.hubSelfReadingComplete
      || Boolean(frameState.hubInvestigationGameplay?.investigationReady)
      || Boolean(frameState.hubChamberFoundation?.fullHubComplete);
    criteria.graveMemoryCrossable = criteria.graveMemoryCrossable
      || Boolean(frameState.firstSliceGates?.hub_to_grave_memory_route?.crossable);

    this.sliceLockReady = Object.values(criteria).every(Boolean);
    if (this.sliceLockReady && this.sliceLockCommittedAt == null) {
      this.sliceLockCommittedAt = frameState.runtimeSeconds ?? 0;
    }
  }

  captureRegionLessons(frameState) {
    const surface = frameState.surfaceWakeGameplay ?? {};
    if (surface.active) {
      const score = Math.min(1,
        Math.min(1, (surface.worldReadCount ?? 0) / 2) * 0.35
        + Math.min(1, (surface.absorbedMoteCount ?? 0) / 2) * 0.35
        + Math.min(1, (surface.stabilizeSeconds ?? 0) / 1.5) * 0.3
      );
      this.retainScore(SURFACE_CELL, score);
    }

    const guide = frameState.guideThresholdGameplay ?? {};
    if (guide.active) {
      const score = Math.min(1,
        (guide.maxPathProgress ?? 0) * 0.5
        + (guide.familiarity ?? 0) * 0.35
        + Math.min(1, (guide.optionalRewardCount ?? 0)) * 0.15
      );
      this.retainScore(GUIDE_CELL, score);
    }

    const hub = frameState.hubInvestigationGameplay ?? {};
    if (hub.active) {
      this.retainScore(HUB_CELL, Math.max(hub.progress ?? 0, hub.investigationReady ? 1 : 0));
    }
  }

  retainScore(cellId, score) {
    this.lessonScores.set(cellId, Math.max(this.lessonScores.get(cellId) ?? 0, score));
  }

  computePractice(frameState) {
    const surface = this.lessonScores.get(SURFACE_CELL) ?? 0;
    const guide = this.lessonScores.get(GUIDE_CELL) ?? 0;
    const hub = this.lessonScores.get(HUB_CELL) ?? 0;
    const routeReads = frameState.hubInvestigationGameplay?.routeReadCount ?? 0;
    const effort = {
      reading: this.pulseEvents.size / 14 + hub * 0.18 + routeReads * 0.025,
      binding: this.maxAbsorbedObjects / 7 + surface * 0.16,
      stabilizing: this.stabilizeSeconds / 14 + guide * 0.18
    };
    for (const id of Object.keys(this.practice)) {
      // Diminishing returns keep ordinary first-slice completion from turning
      // into three saturated 100% meters.
      this.practice[id] = 0.9 * (1 - Math.exp(-Math.max(0, effort[id]) * 1.1));
    }
    const total = Object.values(this.practice).reduce((sum, value) => sum + value, 0);
    for (const id of Object.keys(this.practiceBalance)) {
      this.practiceBalance[id] = total > 0.0001 ? this.practice[id] / total : 1 / 3;
    }
  }

  createVisuals() {
    const visual = this.recipe.visual ?? {};
    this.root = new THREE.Group();
    this.root.name = "first_slice_cohesion_imprint_HC007E";
    this.root.userData.targetingSuppressed = true;
    this.root.userData.observationalOnly = true;
    this.root.userData.decorativePracticeVisualsDisabledBy = "HC-009E";
    this.root.userData.bodyEvidenceOwner = "CoreGrowthSystem";
    this.playerRoot.add(this.root);

    const lessons = Object.entries(this.recipe.regionLessons ?? {});
    lessons.forEach(([cellId, lesson], index) => {
      const material = new THREE.MeshBasicMaterial({
        color: lesson.color ?? 0xffffff,
        transparent: true,
        opacity: visual.baseOpacity ?? 0.035,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry((visual.ringRadius ?? 0.63) + index * 0.055, visual.tubeRadius ?? 0.009, 7, 64),
        material
      );
      ring.name = `cohesion_lesson_${lesson.id}`;
      ring.rotation.set(Math.PI / 2 + index * 0.31, index * 0.48, index * 0.27);
      ring.userData.targetingSuppressed = true;
      ring.visible = false;
      this.root.add(ring);
      this.lessonRings.set(cellId, ring);
    });

    ["reading", "binding", "stabilizing"].forEach((id, index) => {
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 7),
        new THREE.MeshBasicMaterial({
          color: visual.practiceColor ?? 0xffcda8,
          transparent: true,
          opacity: 0.04,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        })
      );
      bead.name = `cohesion_practice_${id}`;
      bead.userData.orbitOffset = index / 3;
      bead.userData.targetingSuppressed = true;
      bead.visible = false;
      this.root.add(bead);
      this.practiceBeads.set(id, bead);
    });
  }

  animate(t, activeCellId) {
    void t;
    void activeCellId;
    for (const ring of this.lessonRings.values()) {
      ring.visible = false;
      ring.material.opacity = 0;
    }
    for (const bead of this.practiceBeads.values()) {
      bead.visible = false;
      bead.material.opacity = 0;
    }
  }

  createState() {
    const lessons = Object.entries(this.recipe?.regionLessons ?? {}).map(([cellId, recipe]) => {
      const score = this.lessonScores.get(cellId) ?? 0;
      return {
        cellId,
        id: recipe.id,
        label: recipe.label,
        description: recipe.description,
        visited: this.visitedCells.has(cellId),
        score,
        retained: score > 0.05
      };
    });
    const ranked = Object.entries(this.practiceBalance).sort((a, b) => b[1] - a[1]);
    const spread = (ranked[0]?.[1] ?? 0) - (ranked[2]?.[1] ?? 0);
    const identity = spread < 0.08
      ? "Emergent Conduit"
      : ranked[0]?.[0] === "reading"
        ? "Resonant Cartographer"
        : ranked[0]?.[0] === "binding"
          ? "Gathering Core"
          : "Current Anchor";
    const overallProgress = lessons.reduce((sum, lesson) => sum + lesson.score, 0) / Math.max(1, lessons.length);
    const missingLockCriteria = Object.entries(this.sliceLockCriteria)
      .filter(([, complete]) => !complete)
      .map(([id]) => id);
    return {
      pass: "HC-016R",
      id: this.recipe?.id ?? RECIPE_ID,
      active: true,
      status: this.sliceLockReady
        ? "living_core_vertical_slice_locked"
        : overallProgress >= 0.72
          ? "first_slice_practice_coherent_lock_pending"
          : "first_slice_practice_emerging",
      overallProgress,
      firstMinute: {
        milestone: "Surface Wake → Guide Threshold → Hub",
        stage: this.firstMinuteStage,
        stageLabel: this.firstMinuteStageLabel,
        nextAction: this.firstMinuteNextAction,
        continuityLine: this.firstMinuteContinuityLine,
        complete: this.firstMinuteComplete,
        committedAt: this.firstMinuteCommittedAt,
        definition: "wake → learn nursery response → living fold → move with current → stable Hub arrival"
      },
      emergingIdentity: identity,
      identityIsSoft: true,
      practice: { ...this.practice },
      practiceBalance: { ...this.practiceBalance },
      practiceValuesIndependent: true,
      practiceBalanceNormalized: true,
      practicedPulseCount: this.pulseEvents.size,
      absorbedObjectCount: this.maxAbsorbedObjects,
      currentAbsorbedObjectCount: this.lastAbsorbedCount,
      stabilizeSeconds: this.stabilizeSeconds,
      visitedRegionCount: this.visitedCells.size,
      lessons,
      retainedLessonCount: lessons.filter((lesson) => lesson.retained).length,
      sliceLockCriteria: { ...this.sliceLockCriteria },
      sliceLockReady: this.sliceLockReady,
      sliceLockCommittedAt: this.sliceLockCommittedAt,
      missingLockCriteria,
      firstMinuteLockDefinition: "Surface Wake lesson → Guide Threshold current → stable Hub arrival",
      verticalSliceLockDefinition: "nursery agency → Fold → Binding Core → Guide pressure test → Hub recognition/investigation → Status self-reading → Grave Memory crossable",
      lockDefinition: "vertical_slice_lock_not_first_minute",
      staleSignalChorusCompletionDependency: false,
      decorativePracticeVisualsDisabled: true,
      bodyEvidenceOwner: "CoreGrowthSystem",
      directTriggerCompletion: false,
      directObjectiveCompletion: false,
      directGateMutation: false,
      abilityUnlocks: false,
      triggerOwnershipPreserved: true
    };
  }
}
