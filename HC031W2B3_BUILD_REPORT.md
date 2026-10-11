# HC-031W2B3 — Verb / Target Relationship Grammar

## Mode
Visual-language convergence / interaction relationship grammar.

## Purpose
Make the retained noun, target condition, and direction of force/exchange readable as one diegetic grammar before W2B expands to regional proof.

## Changes
- Reuses the existing TargetingSystem relationship glyphs; no new overlay system or new gameplay geometry owner was introduced.
- Canonical icon direction is now explicit:
  - **Pulse:** downward triangle, physically aligned outward from Core toward the retained target.
  - **Absorb:** upward triangle, physically aligned inward from target toward Core.
- Pulse and Absorb use stable verb colors rather than inheriting every target's color, so direction remains consistent across nouns.
- Stabilize's existing coherence boundary now reads the target's live reactive condition (`presentedCondition01` / `condition01`) instead of only authored recipe instability.
- The Stabilize boundary regularizes through **4 → 6 → 8 → 12-sided** states as residual disorder decreases, with wobble/asymmetry collapsing alongside coherence.
- VisualHierarchyCompression promotes these verb/condition glyphs above generic support lines while retaining opacity caps beneath the target body's own material response.
- `frameState.verbTargetRelationshipGrammar` publishes presentation diagnostics for the current relationship.
- The W2B2 validator is forward-compatible with W2B3's updated hierarchy labels; W2B2 Pulse/Sonar behavior itself is unchanged.

## Locked / unchanged
No targeting authority, input mapping, controller behavior, relationship handoff policy, Pulse/Absorb/Stabilize strength, chemistry, movement, route/progression, camera, B1.1 hierarchy, or B2 sonar range/timing/reveal law was changed.

## Validation
PASS:
- `validateHC031W2B11CameraRelativeHierarchyBalance.mjs`
- `validateHC031W2B2PulseSonarSpatialReveal.mjs`
- `validateHC031W2B3VerbTargetRelationshipGrammar.mjs`
- `validateHC031W2A54PrimedChildLiveAdmission.mjs`
- `smokeHC031W1StabilizedAimLocalContact.mjs` — including LT+RS deliberate redirect
- `validateHC031W1HF1TargetClear.mjs`
- `smokeHC031T5RidgeTraceFrameRate.mjs`
- `validateRecipeDataLoad.mjs`
- `auditUndefinedThisMethods.mjs`

The inherited historical W1 locked-parent hash issue and the supplied Windows `node_modules` / missing Linux Rollup optional binary remain outside this pass. No production-build pass is claimed.

## Acceptance gate
Video should demonstrate that the player can distinguish outward Pulse, inward Absorb, and Stabilize condition/coherence on the same retained relationship without the glyph layer overpowering the target's material response. If that lands, lock W2B3 and proceed to W2B4 regional readability proof rather than further icon tuning.
