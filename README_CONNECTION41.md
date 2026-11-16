# CONNECTION41 — Core label readability

Install over CONNECTION40. Extract into your project root, preserving CONNECTION41_PATCH, then run:

```powershell
node .\APPLY_CONNECTION41.mjs --check
node .\APPLY_CONNECTION41.mjs
```

Reload. F4 / hold LB+RB still toggle labels. Shift+F4 / DESIGN NOTES shows the full explanation. F8 still opens the diagnostic census. Exact originals are kept in CONNECTION41_BACKUP; `node .\APPLY_CONNECTION41.mjs --restore` restores recognized files while protecting later edits.

## What changed

The default card now states current effects as percentages above/below neutral. It identifies the current selected zone once and shows only the two alternative moves. Move percentages compare with your current arrangement at the same reserve—not with neutral. This distinction matters: a proposed change can improve Stabilize even if the resulting configuration still sits below neutral.

For the 0:1:2 screenshot setup at full reserve: Pulse charge is 13% higher, Absorb progress 28% higher and Stabilize coherence 20% lower than neutral. Recovery and endurance tradeoffs remain visible. These are parameter changes, not guaranteed target completion times.

Expanded notes preserve the full multipliers, authored piece-role explanations, all three zone previews and effect limits. Notes now refresh when selection or arrangement changes, and retain their scroll position. The local region explanation remains in the default card. Missing/incomplete data produces no estimate; an empty Core no longer invites grabbing a nonexistent piece.

| Pass field | Boundary |
|---|---|
| Mode | Convergence / presentation refinement |
| Purpose | Understand current organization and compare a proposed move |
| Allowed scope | Two UI modules, browser/owner checks, catalog, reviewed fixture identity rebases |
| Locked systems | Placement, Guide input mapping, runtime ordering, physiology, repair, world/Host behavior, progression, camera, audio, movement |
| Delete / disable targets | Remove redundant current-zone preview from the default card; retain it in detailed notes |
| Visual target | Prioritize current effect, selected identity, alternative moves and local relevance |
| Acceptance | Correct neutral/current comparison references; live details; missing-data guard; input continuity |
| Regression | Full quick suite; normal/trial label browser runs; existing interruption scenario; guarded installer and build |

The trial remains opt-in, with normal URLs using baseline scar repair. No effect is retuned. World geometry occlusion, the large left HUD and piece/effect visual cleanup remain separate work; this pass does not claim those are resolved.

## Repeat checks

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --quick
node .\BLOB_BOT_SERIES1\run.mjs --case=T02
node .\BLOB_BOT_SERIES1\run.mjs --case=S05
```

The browser setup is unchanged. U01 adds six explanation-contract groups, including all 81 layout/selection combinations. T01 retains the 729 owner-parity move counterfactuals. Earlier case IDs and reports remain indexed. Bots use explicit debug anatomy/region fixtures and deterministic steps; they do not establish human readability or physical-controller feel.
