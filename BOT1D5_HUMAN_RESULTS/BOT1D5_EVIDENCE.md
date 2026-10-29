# BOT1-D5 — Spatial Localization & Attachment Isolation

Independent REC1 referee: owner movement, Fold progress, and Guide outcomes are read **after** a session, never supplied to bot navigation. Pixel change is not physical movement proof.

| Trial | Clean invitation | Owner inApproach | Stage | Nearest Fold | Post-invitation attached / free samples | Post-invitation low-progress |
|---|---|---|---:|---:|---:|---:|
| None | None | None | None | unknown | n/a / n/a | None |

## None — BOT1D5_20261029T014820Z_human_s11
- Owner: Watcher accepted=None, clean=None, scar=None, invited=None.
- Fold: inApproach=None, focusReady=None, stage=None, completed=None. Closest Fold distance=unknown.
- Post-invitation locomotion mode samples=None; attachment states=None attached, None free.
- Median sampled actual speed: attached=unknown, free=unknown. Median forward speed: attached=unknown, free=unknown.
- Low-progress warnings after invitation=None, surfaces=None.
- Bot attempted None Fold movement probes, None with screenshot-difference witness, None visually weak. This is a **visual heuristic**, not owner movement proof.
- Guide physical reaction labels=None.
- Evidence warnings: Missing RUN.json or REC1.json.

## Interpretation gate

- **G1-D5 approach pass:** requires authentic owner invitation and at least one `inApproach=true` OR `stageIndex>=1` owner witness. A close distance alone never passes.
- **Locomotion diagnosis:** compare owner attached and free movement samples under similar inputs; association does not prove collision or causal blockage.
- **Human reference:** if included, it tests whether a normal player can traverse the unchanged world. It is a baseline, not evidence of bot intelligence.
- **Guide efficacy:** reaction labels and HUD text are evidence of outputs, not proof the Guide physically steered or stabilized the Core.
- **Unresolved:** if neither bot nor human reaches Fold, add visual playtest and source review before changing the world.
