# CONNECTION40 — Core / Guide / world labels

This pass connects the existing Core placement and physiology publications to the optional label display. It adds explanations and single-piece move previews; it does not add or retune gameplay effects. CONNECTION38's Surface repair trial remains opt-in.

## Install

Start from CONNECTION38, with or without the optional CONNECTION39 bot catalog. Extract this ZIP into your project root, keeping CONNECTION40_PATCH intact. In the project terminal:

```powershell
node .\APPLY_CONNECTION40.mjs --check
node .\APPLY_CONNECTION40.mjs
```

Reload the game. Unknown edits fail safely. Exact originals stay in CONNECTION40_BACKUP. To restore, run `node .\APPLY_CONNECTION40.mjs --restore`; later edits are protected.

## Use the labels

- **F4**, or hold **LB + RB** for 0.6 seconds: toggle the existing world-label display, now including the Core arrangement card.
- **Shift + F4**, or the DESIGN NOTES button: switch between the card and the expanded design notes.
- **F8**: diagnostic object census. This resolves its previous collision with F4. F5 still exports the census while it is open.
- Existing Core inspection, selection, grab, move, depth and place controls retain their meanings. The card is scrollable and preserves its scroll position when values refresh.

With labels on, the card shows the region, piece families and body zones, whole-Core distribution, reserve and current Pulse / Absorb / Stabilize factors. In Core Work it marks the selected piece, explains the Guide's held/selected state, and previews moving that piece to each of the three zones. Scene labels follow the actual retained pieces.

Preview calculations reuse CoreRadialPerformanceSystem on private state, at the current published reserve with no verb held. They never move a piece, spend reserve, retarget, repair a material, grant progress or change the Host. Exact geometry patterns, future fatigue and target completion times are outside the preview.

Pulse echo reach is presentation reach, not increased action range. Absorb progress applies to eligible bonds after committing the hold. Stabilize coherence shapes ring acquisition and supported local responses. The card explains Vascular directional calming, supported Silt membrane adhesion and normal-versus-trial Surface scar repair separately. The selected family's authored role description does not grant an additional effect.

For the existing repair comparison only, keep using `?coreRepairTrial=1`; normal URLs retain baseline repair. No trial is enabled by this update.

## Pass boundaries

| Field | Scope |
|---|---|
| Mode | Convergence / explanation and bot verification |
| Purpose | Make Core organization understandable through Guide manipulation and local world context |
| Allowed changes | Read-only labels, counterfactual previews, test catalog, diagnostic shortcut collision |
| Locked systems | Placement, Core physiology, verbs, movement, camera, audio, material repair, Host effects, progression, 3→6→12 architecture |
| Delete / disable targets | Disable the duplicate F4 census binding; retain census on F8 |
| Visual / feel target | Follow selected identity and compare placements through readable persistent labels |
| Acceptance | Preview/owner parity, selection/hold/place labels, local context refresh, default-off labels, normal/trial accuracy |
| Regression | Existing quick catalog, control/trial repair browser runs and interruption coverage; no source mutation during bots |

The broader selection emphasis, background occlusion/fading and effect-density concerns from the video remain separate work. This pass does not claim those visual problems are solved, nor that the repair trial has human acceptance.

## Repeat the bots

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --quick
node .\BLOB_BOT_SERIES1\run.mjs --case=T02
node .\BLOB_BOT_SERIES1\run.mjs --case=S03
node .\BLOB_BOT_SERIES1\run.mjs --case=S04
node .\BLOB_BOT_SERIES1\run.mjs --case=S05
```

Browser cases require the existing Playwright / Chromium setup. T01 contains seven owner groups including 729 move counterfactuals. T02 covers actual keyboard interaction and explicit debug fixtures; it is not a naturally earned campaign or physical-controller feel test. This pass runs T02 in both normal and trial modes. Earlier case IDs and reports remain indexed.
