# BLOB / BOT1-B — Actual Browser Field Audit

**Run:** `BOT1_20261028T043130Z_first_slice_reader_s11`  
**Source:** user-uploaded `1BOT1B_RESULTS.zip`, `REC1.json`, `RUN.json`, `BOT1B_EVIDENCE.json`, and six screenshots.  
**Build reported by browser diagnostic:** `HC-031W1`  
**Result:** G1-B input objective policy **PASS**; Surface Wake Watcher acknowledgement **NOT PROVEN**.

## Evidence facts

- 35 s requested / 51.56 s wall execution / 36.686 s REC1 recording.
- 79 REC1 events observed and retained, 0 dropped, 0 Silt source trace gaps.
- 3/3 independent control calibrations: Pulse `X`, Absorb right mouse, Stabilize `Q` all produced their corresponding canonical REC1 events.
- 6/6 objective-directed, world-view Pulse attempts produced `game-pulse-event`; with calibration, 7 Pulse events total.
- `RUN.json` contains 57 actions: 26 camera looks, 13 movements, 9 observations, 7 `X` presses, 1 right mouse, 1 `Q`. Of the 7 `X` presses, 6 were specifically HUD-objective-driven.
- Only `CELL_MEMBRANE_NURSERY_001` was visited; no new exploratory-site, regional pocket, Silt material owner, Host receipt, or completion events.
- The one `chemistry-absorption-committed` event was for `surface_wake_membrane_mote_001` during Absorb calibration (REC1 event 13). This is **genuine local chemistry interaction**, not Watcher success or Silt grain transfer.
- The initial Pulse had `legacyTargetId=surface_wake_membrane_mote_002`; later Pulses had `legacyTargetId=surface_wake_membrane_mote_001`. Canonical Pulse events contain **no accepted Watcher target receipt**.
- Sampled movement reports thirteen owner samples, with low boundary pressure (maximum ~0.0342). Discontinuous sampled coordinates cannot prove collision or teleportation.
- In all sampled movement owner states, `interaction.chorusStage` remains `waiting_for_living_signal_chorus` and `chorusNextAction` remains `Wait for the living Signal Chorus state.`. The `finalAuthority.chemResponse` is `pulse_dissipated`.
- HUD alternates between `Pulse the moving matter so the Watcher can identify it.` and `The nursery continues without you. Pulse the next packet to make a deliberate reading.` The latter is **not** a confirmed owner acknowledgement of the Pulse objective.
- Independent read-only browser diagnostic (`RUN.json.referee`) reports `physicalLanguageValidationStage` moving from `idle` to `world_answer` to `deliberate_release` (stage index 7). This proves that a different diagnostic progression occurred, **not** that the Watcher objective completed or that a particular Pulse caused the change.
- Screenshot sequence shows world-view camera movement with visible nearby structures and targeting rings. It cannot independently prove which moving matter was physically eligible for a Watcher reading.

## Diagnostic interpretation

**Resolved from BOT1-A:** priority error that substituted Stabilize for the explicitly instructed Pulse. The new policy reads the leading directive, issues the correct input in world view, and records it.

**Not yet established:** whether the Watcher ever accepts a target-specific Pulse; if not, whether failure comes from aiming, eligible moving-matter proximity, timing, missing target-owner dispatch, unclear guidance, or the bot's perception limitations. Do not label this a BLOB bug without target-owner evidence.

**Avoid overclaiming:** local chemistry absorption is real but does not satisfy Pulse objective; diagnostic physical-language stages are not a substitute for a Watcher receipt; HUD text alone is not progression authority.

## Build hierarchy decision

- G0 numerical preflight: PASS from prior milestone.
- G1-A real browser harness: PASS.
- **G1-B objective-to-input policy: PASS.**
- **G1-B objective completion / Watcher acceptance: OPEN.**
- G2 universal ability convergence: HOLD until we can distinguish requested verb from accepted target reaction.
- No changes to game simulation or canonical Host receipt chain at this checkpoint.
