# BLOB — BOT1-D4 Fold Wayfinding: Owner-Evidence Report

This is an **independent REC1 verdict**. The bot chooses keys using visible HUD, fixed search pattern, seed, and step count only. REC1 owner Fold distances and owner stage flags are never used by action policy.

| Profile | Invitation | Closest Fold | In approach | Focus ready | Max owner stage | Completed |
|---|---|---:|---|---|---:|---|
| lanes | True | 4.263 | False | False | 0 | False |
| lobes | False | unknown | False | False | None | False |

## Per-run evidence

### BOT1D4_20261028T200719Z_lanes_s11
- CAPTURED; 136.046 seconds; 1685 REC1 events; dropped 0.
- Watcher: 30 input pulses, 30 owner witnesses, 3 accepted, 1 clean and 2 scar authored outcomes.
- Invitation: owner=True, visible bot=True; Fold state samples=362; stage=0; completed=False.
- Owner Fold distances: initial 6.198, nearest 4.263, end 36.250.
- Fold keyboard attempts: {'move': 23, 'observe': 7, 'look': 1}; movement keys {'a': 9, 'd': 8, 'w': 4, 's': 2}; HUD stages {'fold_search': 31}.
- Guide witnessed in 846 samples; reactions {'guide_waited_for_world_response': 846}.
- Owner stage/approach transition witnesses: [{"index": 0, "stage": "approach_listening_fold", "ready": false, "focusReady": false, "completed": false}].
- Evidence limits: Approach state not advanced; first Fold stage still open; Full Fold completion not owner-proven.

### BOT1D4_20261028T200949Z_lobes_s12
- CAPTURED; 136.425 seconds; 1571 REC1 events; dropped 0.
- Watcher: 61 input pulses, 61 owner witnesses, 0 accepted, 0 clean and 0 scar authored outcomes.
- Invitation: owner=False, visible bot=False; Fold state samples=0; stage=None; completed=False.
- Owner Fold distances: initial unknown, nearest unknown, end unknown.
- Fold keyboard attempts: {}; movement keys {}; HUD stages {}.
- Guide witnessed in 891 samples; reactions {'guide_waited_for_world_response': 891}.
- Owner stage/approach transition witnesses: [].
- Evidence limits: No owner-authenticated Fold invitation in this run; No owner-available Fold; distance/stage not gradable; Full Fold completion not owner-proven.

## Gate interpretation

- **Wayfinding passed** requires owner `inApproach=true` or `stageIndex>=1` after a legitimate invitation. A minimum distance alone is not a stage completion.
- **Interaction passed** requires owner stage 2/3/4 evidence after the Pulse/hold/release sequence. Bot inputs alone do not count.
- **Fold completed** requires owner `completed=true` at stage 5. A HUD line alone does not count.
- If the bot fails, do not classify geometry or Guide as broken without independent visual and player comparisons. No gameplay source was changed by BOT1-D4.
- Profiles/seed runs are exploratory, not a controlled efficacy trial; packet cycles and start states vary.
