# BLOB: HOST CORE — Core/Guide Parallel Integration Audit (alongside BOT1-D11N)

**Status:** design-and-source audit, **not** a Core or Guide implementation pass. LS1 movement baseline stays at experimental D11G + D11J. Source inspected from the uploaded `BLOB-HOST-CORE-BLOB-BOT0.zip`, which predates at least some D11C–D11M live patches. Re-verify current working-tree owners before future edits. No speculative gameplay behavior is described below as already implemented.

## 1. Existing source-level responsibilities

| Existing owner (source path) | What the inspected source already does | Boundary for future co-development |
|---|---|---|
| `src/player/PlayerMovementController.js` | Sole player translation owner, contact/attachment state and deliberate-release logic | Guide and phase changes must not silently alter release gates or move player |
| `src/player/CoreTendrilSurfaceContactSystem.js`, `CoreTendrilSupportPlaneSystem.js`, `CoreSurfaceTruthSystem.js` | Tendril reach/seal/support and authored surface truth | Shared world facts should be published here or at a reviewed owner boundary; D11G/D11J repairs must remain intact |
| `src/player/CoreEmbodimentSystem.js` | Core Work piece selection/held/placement states, zones `deep_core` / `inner_body` / `membrane`; publishes `coreWorkManipulation` | This is **Core Work internal placement**, not a proven generic world-object grabbing system |
| `src/player/CoreEngineSystem.js` | 3 → 6 → 12 phase rhythm, load and RPM, progression unlock observation; states explicitly no direct gameplay authority | Future propulsion/acclimation must be added at a deliberate new ownership boundary, not smuggled in via display telemetry |
| `src/player/CoreGrowthSystem.js`, `CoreRadialPerformanceSystem.js` | Growth and topology-dependent Core physiology | Audit current growth/performance effects before creating a second upgrade table |
| `src/interaction/VerbCompositionSystem.js` | Canonical combined Pulse / Absorb / Stabilize chords, including `cohere_project`, `cohere_draw`, `exchange`, `full_system` | Extend from this composition grammar instead of introducing duplicate push/pull/stabilize controllers |
| `src/guide/GuidePromptSystem.js` | Region-conditioned prompt selection, lifecycle and UI guidance | Textual prompts are **not** the proposed nonverbal Guide Signal Language |
| `src/ecology/OrbiterSystem.js` | Physical Guide-orbiter hovering, attention, relative movement, core-work attendance, pulse reaction, visible state | Candidate presentation consumer; don't give it contact or movement authority. It is registered region-scoped in inspected runtime |
| `src/core/GameRuntime.js` | Constructs and registers these systems, with separate owner slots | Integration should use a bounded event handoff; don't add direct Core/Guide updates to orchestration without proof |

## 2. Parallel opportunity: one authoritative physical event, multiple consumers

**Proposed read-only event contract — not yet shipped in gameplay:**

```
HostCorePerceptionEvent {
  schema: "hc.perception.v0",
  eventId, frame, observedAtSeconds,
  sourceOwner, kind,
  surfaceId, materialFamily,
  position, confidence,
  cause, intentionality
}
```

Initial event kinds, **proposed**, each requiring debounced state transitions:

1. `support_confirmed`: an actual, geometrically eligible support plane and attached movement state coexist for a chosen dwell time; not the moment a single tendril first reaches.
2. `support_lost_unexpected`: support was previously confirmed and disappears without intentional release; do not raise a panic signal for a deliberate peel or voluntary launch.
3. `unfamiliar_material_observed`: a material enters *perceivable* range and is not in Guide-recognized history; do not leak hidden debug/surface-registry knowledge to the Guide.

**Consumer boundaries:** Movement uses the authoritative state internally; Core performance may read its consequences later; Guide perception receives published snapshots/events and decides **what it understands**, while Guide signal presentation decides **how to express it**. No Guide output may modify PlayerMovementController, support-plane truth, anchor provenance, or objective completion in the first integration slice.

## 3. Proposed Guide expressive grammar, first isolated slice

| Meaning | Signal rhythm (illustrative, not canonical) | Light | Gesture | Grounding |
|---|---|---|---|---|
| Stable support | one sustained positive phrase | steady/soft growth | relaxed close orbit | Confirmed support-plane event |
| Unexpected support loss | three brief pulses | brief dim/flicker | startled withdrawal, return | Unintentional contact loss only |
| Unfamiliar material | two separated questioning pulses | repeated soft outline | cautious investigation | Material actually sensed |

Each semantic phrase is shared across sound/light/movement, with expressive modulation for personality. No language is assigned purely by shape/color or random chatter. Retain HC027D1 audio reference/headroom; provide accessible synchronized visual/motion equivalents, no forced color-only interpretation. A WALL·E-like expressive *principle* is a reference for intention and personality, not copied character sounds or animation.

## 4. Core evolution and acclimation: contracts to design without changing LS1

- **Core state:** retain three internal functions, their radial positions, and 3→6→12 progression. Define acclimation separately from irreversible evolution: familiarity with an environment is a local relationship, learned capabilities persist across regions.
- **Contractile locomotion:** charge → anchored release → free travel → real surface catch. Must not invent anchors, bypass D11G's provenance, or disable D11J sole-foothold protection outside an explicitly owned intentional launch transition.
- **Verb evolution:** use existing combined-verbs grammar. Stabilize regulates a relationship; Pulse projects force; Absorb draws. Holding and placing should use reviewed Core Work or object authority explicitly, not duplicated in movement.
- **No region-specific hardcodes in shared movement owners:** Silt, Grave, Vascular, and Aperture should differ through material/force contracts, not copy-pasted contact algorithms.

## 5. Co-development workflow and gates

**Now, parallel to D11N:** this owner audit and message/event vocabulary can evolve independently. No gameplay mutations to Core/Guide. 

**After controlled-start acquisition:** perform isolated, read-only mock-event tests for three signal meanings. Mock an intentional release vs accidental support loss and verify the Guide does not treat them identically.

**After D11O tilted-release validation and cross-region regression:** connect a verified runtime event source to one Guide perception consumer. Unit-test signal deduplication and frequency limits; compare source event counts with emitted signals and ensure no movement-state change.

**After LS1 two-surface travel:** test contractile locomotion and environmental acclimation in separate labs/branches. Merge only after full physical regression. Keep Core phase changes independent until behavior is demonstrated, not just an animation.

## 6. Pass boundaries

- D11N **primary** may edit only the D11C diagnostic probe and harness. D11N does **not** implement the proposed event bus, Guide signal effects or Core upgrades.
- The **parallel Core–Guide audit** changes no source. Its next artifact may be a pure, isolated signal-language simulator once gameplay event schema is accepted.
- Do not call D11N or the Core/Guide architectural convergence a gameplay lock until live evidence meets explicit acceptance tests.
