# BLOB: HOST CORE — ENGINE-UNLOCK1

November 8, 2026, America/New_York. Mode: progression/architecture integration audit. Current production build remains SILT-VIS1. Report only; no installation or production edits.

## Main finding: earned higher-phase progression is incomplete

The 3→6→12 architecture and credit thresholds pass their controlled contract checks. The inspected gameplay currently supplies only four different credits. Six are required for 6-phase and twelve for 12-phase. Repeating the existing completions does not supply the missing credits.

| Credit source | Implemented distinct credits | Running total |
| --- | --- | --- |
| Grave first return with committed memory imprint | 1 | 1 |
| Vascular first completed return | 1 | 2 |
| Silt first completed return | 1 | 3 |
| Grave II resonance completion | 1 | 4 |
| Vascular II and Silt II earned completion | Not implemented as completion publishers in this source | Would reach 6 |
| Phase III and IV earned completion for all three routes | Not implemented as completion publishers in this source | Would reach 12 |

A scan of all 163 JavaScript files under src found one writer of returnRegionCompletionEvent: GraveResonanceGameplaySystem, publishing grave:phase_2. ReturnRegionEngineSystem derives the three first-phase credits from retained return/completion history. No additional implemented publisher was found for Vascular/Silt phase two or any phase three/four. The ceiling conclusion applies to this inspected source tree and normal gameplay paths; debug/test state writes can bypass it.

This is a content/completion coverage gap, not evidence that the current Silt material interaction failed. No unlock thresholds, geometry, or repeat-credit rules were changed to conceal the gap.

## Verification

17/17 contract checks passed. They cover zero-credit startup, return/completion qualification, actual Grave II completion publication from a declared near-resolution fixture, repeated completion and visit protection, thresholds at 5/6/11/12 credits, the twelve-credit cap, balanced function/ordinal mapping, consumer authority and the existing debug override.

| Total credits | Counter unlock | Core engine |
| --- | --- | --- |
| 0–5 | 3 | One phase per Pulse, Absorb, Stabilize function |
| 6–11 | 6 | Two counterpart phases per function |
| 12 | 12 | Four phases per function |

Tests at five or more credits injected synthetic future completion events into the existing counter. They verify counter/consumer contracts only; they are not proof that those completion goals can be earned in the game.

The independent running-browser check used original registry scheduling. It supplied a retained first-return checkpoint and a near-resolution Grave II state, then allowed the actual Grave II update to complete and publish. The runtime reached four credits, retained 3-phase and authenticated one Grave II completion through Host. Subsequent frames stayed at four credits. The browser recorded no JavaScript or console errors. This does not prove earning the initial route objectives or solving Grave II from its initial state.

The existing O key displayed 6-phase, then 12-phase, while the earned counter remained at four and the progression unlock remained three. That is the current debug preview override, not earned progression. It was preserved for testing.

The exact current CoreEngineSystem, ReturnRegionEngineSystem and GraveResonanceGameplaySystem source bytes still match the exported installed base. No production change required a new build or another Silt/Guide regression run in this audit.

## Scope and current disposition

Purpose: compare the locked triadic engine with real regional credit availability and duplicate protection. Allowed scope: source inventory, controlled counter/evaluator tests and one actual browser scheduling check. Locked: 3→6→12 function grammar; thresholds 6/12; current material, movement, contact, Guide and regional receipt ownership; controls/debug bindings; VIS1 rendering; audio; old HC/LS1 checkpoint history. Delete/disable targets: no production systems; disposable browser test exposure ended on close. Visual/feel target: preserve current behavior while distinguishing debug previews from earned architecture. Acceptance: credit thresholds, balanced phase mapping, real implemented publication and repeated-event behavior are measured. Regression: source hashes unchanged and no browser errors.

Outcome: COUNTER/ARCHITECTURE PASS; EARNED 6/12-PHASE PATH INCOMPLETE. The Silt material, connected receipt, traversal and controlled Guide results remain separately indexed. Naturally occurring unexpected Guide-loss observation remains pending and is not reopened as a demand on the player.

## Next bounded implementation plan: complete the earned 6-phase arc

1. Define Vascular II and Silt II completion conditions from their regional identity and retained first-visit state. A revisit, mount, elapsed timer or retained first-completion flag alone must not count as a new accomplishment.
2. Give each regional gameplay owner its own genuine phase-two completion event, using canonical vascular:phase_2 and silt:phase_2 identities. Keep the existing return engine as credit/unlock owner and CoreEngineSystem as architecture consumer.
3. Preserve the first three return credits and Grave II publication. Do not award engine credit for Silt disturbance receipts, Vascular membrane effects, Grave memory observations or Silt pressure echoes; those already have distinct meanings.
4. Verify all six distinct credits together, including the fifth remaining at 3-phase and the sixth unlocking 6-phase. Repeated frames, remounts, held inputs and old completion events must not award again. Keep completion and crossing ownership separate.
5. Deliver a small changed-files delta with genuine goal acceptance and regressions. Defer phase III/IV content and the earned 12-phase arc to their own bounded passes.

This is a proposed implementation boundary, not a claim that new revisit gameplay has been built or accepted. Before coding, specify each goal's player action, observable completion, risk/recovery behavior and receipt semantics. No new region, arbitrary grind, automatic feature expansion or lowering of thresholds follows from this audit.
