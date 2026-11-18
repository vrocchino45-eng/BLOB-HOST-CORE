# BLOB: HOST CORE — BOT1-D6 Human-Reference Navigation Field Audit

**Recorded:** 2026-10-29 02:47:53–02:51:26 UTC (REC1), after the October 28 local-session test.  
**Authority:** `1BOT1D6_RESULTS.zip` → `BOT1D6_20261029T024741Z_reference_s11/REC1.json` and `RUN.json`; cross-reference to the user-authored `1BLOB_BOT1D5H_REC1_OBSERVATION.json`.  
**Change scope:** Browser bot policy only; no BLOB gameplay or Guide changes.

## Verdict

**BOT1-D6 succeeded at real browser capture, periodic checkpoints, objective-to-Pulse input, and a clean Watcher invitation. It did not achieve owner-certified Listening Fold approach or a Fold interaction stage.** The remaining issue is now best framed as *directional localization and action selection under a 3D camera*, not a demonstrated Fold obstruction or attachment-induced lock.

| Measure | BOT1-D6 | Human reference |
|---|---:|---:|
| Session duration | 212.854 s | 889.977 s |
| REC1 details retained / dropped | 2,598 / 0 | 16,843 / 0 |
| Checkpoints during run | 4 (45, 91, 137, 186 s) | N/A; one completed export |
| Watcher invitation | 81.104 s | 32.990 s |
| Fold proximity | Minimum sampled focus distance 5.592 | `inApproach` at 70.79 s, distance 2.179 |
| First Fold stage 1 | Not reached | 71.433 s |
| Fold stage 5 completion | Not reached | 79.371 s |
| Valid Fold owner completion | No | Yes |

**Comparability caveat:** These are independent sessions under different input policies, not synchronized replays or controlled equal-seed comparisons. Human's milestone times are useful reference examples, not target deadlines.

## What the bot really accomplished

- REC1 captured **30** canonical Pulse inputs paired with Watcher acceptance witnesses: **3 accepted**, **23 rejected as out of range**, **4 without an active packet**.
- Nursery recorded **1 `tender_fed_clean_matter`** (player-authored), **2 `tender_strained_scar_spread`**, **6 passive clean receptions**, and **10 unread contamination outcomes**.
- Following the clean cycle, the Watcher set `agencyProven: true` and `foldInvitation: true`. The Fold owner was `stage: approach_listening_fold`, **stageIndex 0**, `inApproach: false`, `focusReady: false` throughout. The word `approach` in the stage name is an instruction to approach, not proof of arrival.
- After the invitation, owner focus distance began near **6.086**, briefly reached **5.592** at session t=152.482 s, and ended around **7.083**. No later authored stage was unlocked.
- The bot's 43 Fold-search actions were **20 movement probes** (5 each W/S/A/D), **21 observations**, and **2 camera turns**. Direction reversal was frequent; pixel change measured motion-like visual differences but gave no grounded information about whether the Fold was nearer.
- Of 20 post-invitation REC1 movement samples, **all were free locomotion**, with **zero sampled attachment**, **zero sustained low-progress warnings**, and maximum boundary pressure approximately 0.045. Speed median was ~0.811. That weakens surface-attachment as a sole explanation.
- The bot's post-invitation movement positions remained between **X=2.20 and 3.38**; its sampled post-invitation start/end displacement was only ~**0.50 world units**, despite multiple directions attempted.

## Human demonstration comparison

The authenticated human opening crossed to a different side of the nursery after earning the invitation: human first-slice samples showed X spanning approximately **-4.07 to +4.81**. The human reached `inApproach` with owner focus distance **2.179** at 70.79 s, then acted through the authored stages with accepted Pulse, sustained Stabilize, tissue-response observation, and release/settle. The bot remained in a much smaller portion of the positive-X side and never received the owner's approach signal.

The human run's full route and later regional successes are useful development context but are **not** evidence that the bot already navigates or that no visual guidance changes are ever needed.

## Guide and HUD language

- **1,291** GUIDE0 snapshots occurred in BOT1-D6. The Guide's visible state alternated between `observing_with_player` (**1,116**) and `answering_player_pulse` (**175**), but **all 1,291 `lastReaction` fields were `guide_waited_for_world_response`**.
- Guide/HUD objective text advanced to `Follow the opening membrane.` The recorded physical Guide states do not establish directional assistance or a response to contamination.
- The bot's visible HUD still showed **Tender 0%** in later Fold-search samples while the owner's Fold invitation remained available. This is a potentially important health/feedback-language observation; the recording does **not** prove Tender 0 prevents Fold access.

## Evidence quality

- Full final REC1 export `captureActive:false`, no dropped details. Four earlier checkpoint exports remained cumulative, with `captureActive:true`; they successfully protect against a lost final export.
- Source owner and bot decision evidence are separate: bot's policy read HUD text and render frames; it did **not** read hidden Fold coordinates or owner focus distance to steer.
- Source ring overflow between 150-ms polls remains theoretically possible; `droppedDetails:0` does not rule out producer-level gaps. Not a witnessed failure here.

## Next convergence gate — G1-D7 (design, not implemented)

**Do not add a longer blind search loop.** Establish a visually grounded, directional navigation representation:

1. **Passive observation audit:** Identify whether Fold/membrane, landmark, or Guide cues are consistently recognizable in screenshots from the successful human route and bot failure, across world and inspection views. Keep ground-truth coordinates in the independent evaluator only.
2. **Camera-and-movement calibration:** Use finite movement probes without pairing every direction with its inverse. Verify the camera/heading relationship using visible fixed landmarks; only then select a direction. If no cue is present, explicitly mark uncertainty and recover rather than claim progress from pixel motion.
3. **Stage handoff:** Stop nursery-acquisition behavior at invitation, and judge `inApproach`, `focusReady`, stageIndex, and Fold completion independently. Follow owner states only in the *offline referee*.
4. **GUIDE1-A concurrent evidence:** Compare Guide posture and HUD in accepted clean, scar-touched, uncertain, and successful human-Fold cases. Only install a directional Guide component if needed and justified by these measurements.
5. **Regression:** Retain working clean-matter acquisition, full recorder/checkpoints, pulse authority, and existing Silt→Host provenance circuit unchanged.

### Build-hierarchy decision

G1 sensor/ability input proven. G1-D6 capture/diagnostic passed; Fold navigation not passed. Highest-value next component is **perception-to-direction feedback**, with Guide physical-language interpretation as a linked but distinct hypothesis. Region expansion and 3/6/12 feature passes remain deferred until the relevant owner-level acceptance gates are met.
