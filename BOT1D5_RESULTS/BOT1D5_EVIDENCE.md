# BOT1-D5 — Spatial Localization & Attachment Isolation

Independent REC1 referee: owner movement, Fold progress, and Guide outcomes are read **after** a session, never supplied to bot navigation. Pixel change is not physical movement proof.

| Trial | Clean invitation | Owner inApproach | Stage | Nearest Fold | Post-invitation attached / free samples | Post-invitation low-progress |
|---|---|---|---:|---:|---:|---:|
| probe | True | False | 0 | 5.130 | 2 / 14 | 0 |

## probe — BOT1D5_20261029T013309Z_probe_s11
- Owner: Watcher accepted=3, clean=1, scar=2, invited=True.
- Fold: inApproach=False, focusReady=False, stage=0, completed=False. Closest Fold distance=5.130.
- Post-invitation locomotion mode samples={'normal': 14, 'surface_tendril_pull': 2}; attachment states=2 attached, 14 free.
- Median sampled actual speed: attached=0.296, free=1.233. Median forward speed: attached=0.045, free=0.175.
- Low-progress warnings after invitation=0, surfaces={}.
- Bot attempted 15 Fold movement probes, 15 with screenshot-difference witness, 1 visually weak. This is a **visual heuristic**, not owner movement proof.
- Guide physical reaction labels={'guide_waited_for_world_response': 915}.
- Evidence warnings: Approach state not advanced; first Fold stage still open; Full Fold completion not owner-proven.

## Interpretation gate

- **G1-D5 approach pass:** requires authentic owner invitation and at least one `inApproach=true` OR `stageIndex>=1` owner witness. A close distance alone never passes.
- **Locomotion diagnosis:** compare owner attached and free movement samples under similar inputs; association does not prove collision or causal blockage.
- **Human reference:** if included, it tests whether a normal player can traverse the unchanged world. It is a baseline, not evidence of bot intelligence.
- **Guide efficacy:** reaction labels and HUD text are evidence of outputs, not proof the Guide physically steered or stabilized the Core.
- **Unresolved:** if neither bot nor human reaches Fold, add visual playtest and source review before changing the world.
