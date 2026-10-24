const ROUTE_KEYS = ["grave", "vascular", "silt"];

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value) => Number((Number.isFinite(value) ? value : 0).toFixed(3));

/**
 * HC031A1 return-region progression/composition owner.
 *
 * This system does not move the player, select targets, resolve verbs, mutate route
 * crossings, or author base region geometry. It converts retained world/Core grammar
 * into deterministic return-layout parameters and counts 3 -> 6 -> 12 engine credits.
 */
export class ReturnRegionEngineSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error("[ReturnRegionEngineSystem] frameState is required.");
    this.frameState = frameState;
    this.secondPhaseCompleted = { grave: false, vascular: false, silt: false };
    this.thirdPhaseCompleted = { grave: false, vascular: false, silt: false };
    this.fourthPhaseCompleted = { grave: false, vascular: false, silt: false };
    this.completionKeys = new Set();
    this.lastEvent = "return_region_engine_initialized";
  }

  init() {
    this.publish(this.frameState);
  }

  update(_dt, frameState = this.frameState) {
    this.consumeCompletionEvent(frameState.returnRegionCompletionEvent);
    this.publish(frameState);
  }

  consumeCompletionEvent(event) {
    if (!event || !ROUTE_KEYS.includes(event.routeKey)) return;
    const key = event.key ?? `${event.routeKey}:phase_${event.phase}`;
    if (this.completionKeys.has(key)) return;
    this.completionKeys.add(key);
    if (event.phase === 2) this.secondPhaseCompleted[event.routeKey] = true;
    if (event.phase === 3) this.thirdPhaseCompleted[event.routeKey] = true;
    if (event.phase === 4) this.fourthPhaseCompleted[event.routeKey] = true;
    this.lastEvent = `${event.routeKey}_phase_${event.phase}_credited`;
  }

  firstPhaseCredits(history = {}) {
    return {
      grave: Boolean(history.graveReturned && history.graveMemoryImprintCommitted),
      vascular: Boolean(history.vascularReturned && history.vascularCompleted),
      silt: Boolean(history.siltReturned && history.siltCompleted)
    };
  }

  layoutFor(routeKey, frameState) {
    const history = frameState.act1RouteHistory ?? {};
    const routeStateKey = routeKey === "grave" ? "grave_memory_route"
      : routeKey === "silt" ? "silt_burrow_route"
        : "vascular_route";
    const routeState = history.routeStates?.[routeStateKey] ?? {};
    const weights = frameState.corePerformance?.weights ?? { deep: 1 / 3, inner: 1 / 3, membrane: 1 / 3 };
    const memory = frameState.entityReciprocalMemory?.primary ?? {};
    const reactive = frameState.reactiveStateGrammar?.focus ?? {};
    const chord = frameState.verbComposition?.chord ?? "idle";

    const deep = clamp01(weights.deep ?? 1 / 3);
    const inner = clamp01(weights.inner ?? 1 / 3);
    const membrane = clamp01(weights.membrane ?? 1 / 3);
    const memoryStrength = clamp01(memory.strength01 ?? 0);
    const reactivePressure = clamp01(reactive.condition01 ?? 0);
    const traceIntegrity = clamp01(history.graveTraceIntegrity ?? 0.68);
    const riskPressure = clamp01((history.graveRiskEventCount ?? 0) / 6);
    const entryCount = Math.max(1, routeState.entryCount ?? history.graveEntryCount ?? 1);
    const visitPhase = Math.max(1, Math.min(4, entryCount));

    // Return regions are octave expressions, not regenerated rooms. The regional
    // fundamental stays fixed while each return doubles structural resolution.
    const octaveRatio = 2 ** Math.max(0, visitPhase - 1);
    const fundamentalPhaseCount = 3;
    const octavePhaseCount = Math.min(12, fundamentalPhaseCount * octaveRatio);
    const topologyBalance = clamp01(1 - (Math.max(deep, inner, membrane) - Math.min(deep, inner, membrane)));
    const resonance01 = clamp01(
      0.26
      + memoryStrength * 0.22
      + reactivePressure * 0.16
      + traceIntegrity * 0.18
      + topologyBalance * 0.18
      - riskPressure * 0.08
    );

    // A second visit must be spatially legible. HC031A's <=16% depth change was
    // too subtle, so octave two has a visible authored growth floor while resonance
    // controls how strongly the same Grave DNA opens and twists.
    const growthFloor = visitPhase >= 2 ? 1.30 : 1;
    const depthScale = growthFloor + (visitPhase >= 2 ? resonance01 * 0.28 : deep * 0.08);
    const lateralBias = (membrane - inner) * (visitPhase >= 2 ? 3.6 : 2.0) + (resonance01 - 0.5) * 0.7;
    const verticalBias = (inner - deep) * (visitPhase >= 2 ? 1.5 : 0.8);
    const compression = clamp01(0.42 + traceIntegrity * 0.34 - riskPressure * 0.14 + resonance01 * 0.12);
    const echoDensity = clamp01(0.24 + memoryStrength * 0.28 + reactivePressure * 0.18 + resonance01 * 0.30);
    const instability = clamp01(0.10 + reactivePressure * 0.46 + riskPressure * 0.24);
    const chordBias = chord === "cohere_draw" ? -0.12
      : chord === "cohere_project" ? 0.12
        : chord === "full_system" ? 0.18
          : 0;
    const resonancePhase = (deep * 0.34 + inner * 0.67 + membrane) * Math.PI * 2;
    const twist = (deep - membrane) * 0.42 + chordBias + Math.sin(resonancePhase) * resonance01 * 0.08;
    const harmonicSpread = 0.75 + resonance01 * 0.65;

    return {
      routeKey,
      equationId: "return_octave_resonance_v2",
      inputs: {
        visitPhase,
        entryCount,
        topology: { deep: round(deep), inner: round(inner), membrane: round(membrane) },
        memoryStrength: round(memoryStrength),
        reactivePressure: round(reactivePressure),
        traceIntegrity: round(traceIntegrity),
        riskPressure: round(riskPressure),
        chord
      },
      octave: {
        fundamentalPhaseCount,
        octaveRatio,
        octavePhaseCount,
        resonance01: round(resonance01),
        resonancePhase: round(resonancePhase),
        harmonicSpread: round(harmonicSpread)
      },
      outputs: {
        depthScale: round(depthScale),
        lateralBias: round(lateralBias),
        verticalBias: round(verticalBias),
        compression: round(compression),
        echoDensity: round(echoDensity),
        instability: round(instability),
        twist: round(twist),
        resonance01: round(resonance01),
        harmonicSpread: round(harmonicSpread)
      }
    };
  }

  publish(frameState) {
    const history = frameState.act1RouteHistory ?? {};
    const phase1 = this.firstPhaseCredits(history);
    const phase1Count = ROUTE_KEYS.filter((key) => phase1[key]).length;
    const phase2Count = ROUTE_KEYS.filter((key) => this.secondPhaseCompleted[key]).length;
    const phase3Count = ROUTE_KEYS.filter((key) => this.thirdPhaseCompleted[key]).length;
    const phase4Count = ROUTE_KEYS.filter((key) => this.fourthPhaseCompleted[key]).length;
    const creditCount = phase1Count + phase2Count + phase3Count + phase4Count;
    const unlockedPhaseCount = creditCount >= 12 ? 12 : creditCount >= 6 ? 6 : 3;

    frameState.returnRegionEngine = {
      pass: "HC-031A1",
      active: true,
      owner: "ReturnRegionEngineSystem",
      law: "regional_fundamental_x_octave_resonance_doubles_resolution_3_to_6_to_12",
      creditCount,
      nextThreshold: unlockedPhaseCount === 3 ? 6 : unlockedPhaseCount === 6 ? 12 : 12,
      unlockedPhaseCount,
      phase1,
      phase2: { ...this.secondPhaseCompleted },
      phase3: { ...this.thirdPhaseCompleted },
      phase4: { ...this.fourthPhaseCompleted },
      graveLayout: this.layoutFor("grave", frameState),
      progressionAuthority: true,
      engineUnlockAuthority: true,
      routeCrossingAuthority: false,
      targetingAuthority: false,
      verbAuthority: false,
      randomGeneration: false,
      lastEvent: this.lastEvent
    };
  }
}
