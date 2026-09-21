/**
 * HC-006D reusable embodied-interaction grammar.
 *
 * Region systems still own their authored rules, geometry, and consequences.
 * This class owns only the shared stage vocabulary, sequence validation, and
 * diagnostic snapshot so interactions can deepen consistently from Surface
 * Wake onward without introducing chamber-specific runtime branches.
 */
export const FOUNDATIONAL_INTERACTION_STAGE_IDS = Object.freeze([
  "unnoticed",
  "approachable",
  "observed",
  "aligned",
  "sustaining",
  "responding",
  "settling",
  "complete"
]);

const ALLOWED_STAGE_IDS = new Set(FOUNDATIONAL_INTERACTION_STAGE_IDS);

export class LayeredInteractionGrammar {
  constructor({ interactionId, authoredStages = [], stageMap = {} } = {}) {
    if (!interactionId) {
      throw new Error("[LayeredInteractionGrammar] interactionId is required.");
    }

    this.interactionId = interactionId;
    this.authoredStages = authoredStages;
    this.stageMap = { ...stageMap };
    this.currentAuthoredIndex = 0;
    this.lastTransition = "initialized";
    this.lastTransitionAt = -1;
    this.transitionCount = 0;

    this.validateStageMap();
  }

  validateStageMap() {
    for (const [authoredId, grammarId] of Object.entries(this.stageMap)) {
      if (!authoredId) {
        throw new Error("[LayeredInteractionGrammar] authored stage ids may not be empty.");
      }
      if (!ALLOWED_STAGE_IDS.has(grammarId)) {
        throw new Error(`[LayeredInteractionGrammar] Unknown foundational stage: ${grammarId}`);
      }
    }
  }

  setAuthoredIndex(index, runtimeSeconds = 0, reason = "external_stage_sync") {
    const maxIndex = Math.max(0, this.authoredStages.length - 1);
    const nextIndex = Math.max(0, Math.min(maxIndex, Number.isFinite(index) ? index : 0));
    if (nextIndex !== this.currentAuthoredIndex) {
      this.transitionCount += 1;
      this.lastTransition = reason;
      this.lastTransitionAt = runtimeSeconds;
    }
    this.currentAuthoredIndex = nextIndex;
    return this.current();
  }

  advance(runtimeSeconds = 0, reason = "advanced") {
    return this.setAuthoredIndex(this.currentAuthoredIndex + 1, runtimeSeconds, reason);
  }

  current() {
    const authored = this.authoredStages[this.currentAuthoredIndex] ?? this.authoredStages[0] ?? null;
    const authoredId = authored?.id ?? "unnoticed";
    const grammarStage = this.stageMap[authoredId] ?? this.inferGrammarStage(authoredId, this.currentAuthoredIndex);

    return {
      authoredIndex: this.currentAuthoredIndex,
      authoredStageId: authoredId,
      grammarStage,
      authored
    };
  }

  inferGrammarStage(authoredId, index) {
    const id = String(authoredId ?? "").toLowerCase();
    if (id.includes("complete")) return "complete";
    if (id.includes("settle") || id.includes("release")) return "settling";
    if (id.includes("response") || id.includes("answer")) return "responding";
    if (id.includes("sustain") || id.includes("hold")) return "sustaining";
    if (id.includes("align") || id.includes("cadence")) return "aligned";
    if (id.includes("observe") || id.includes("read")) return "observed";
    if (id.includes("approach") || index > 0) return "approachable";
    return "unnoticed";
  }

  snapshot(extra = {}) {
    const current = this.current();
    return {
      architecturePass: "HC-006D",
      architectureId: "FOUNDATIONAL_LAYERED_INTERACTION_GRAMMAR_V1",
      interactionId: this.interactionId,
      canonicalSequence: [...FOUNDATIONAL_INTERACTION_STAGE_IDS],
      authoredStageId: current.authoredStageId,
      authoredStageIndex: current.authoredIndex,
      grammarStage: current.grammarStage,
      transitionCount: this.transitionCount,
      lastTransition: this.lastTransition,
      lastTransitionAt: this.lastTransitionAt,
      reusableFromOpening: true,
      regionOwnsConsequences: true,
      runtimeOwnsSharedGrammar: true,
      ...extra
    };
  }
}
